import { Injectable } from '@nestjs/common';
import type { OutcomeAction, QuestionType, ScoringMethod } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';

export type DesiredOption = { label: string; value: number; weight: number };
export type DesiredQuestion = {
  prompt: string;
  type: QuestionType;
  domain?: string | null;
  isReverseScored?: boolean;
  options: DesiredOption[];
};
export type DesiredBand = {
  label: string;
  severityRank: number;
  minScore: number;
  maxScore: number;
  colorHex?: string | null;
  advice?: string | null;
  recommendedAction: OutcomeAction;
  recommendedContentId?: string | null;
};
export type DesiredVersion = {
  scoringMethod: ScoringMethod;
  normalizationMax: number | null;
  attribution: string | null;
  instructions?: string | null;
  questions: DesiredQuestion[];
  bands: DesiredBand[];
};

// Match the DB column precision (Decimal(_, 3)) so float noise / trailing-zero
// formatting can't produce spurious fingerprint mismatches.
const norm3 = (n: number) => Number(n).toFixed(3);

/**
 * Canonical content-authoring for instrument versions — the single, FK-safe way
 * to write a scale's questions/options/scoring-bands from the app. Ported from
 * `prisma/seed.ts` `syncInstrumentVersion` and extended with band color/advice
 * and question domain/reverse-scoring.
 *
 * Behavior (identical to the seed): fingerprint the desired content; if it
 * matches the current PUBLISHED version, no-op. Otherwise rewrite in place ONLY
 * when the current version has zero referencing assessments; else publish a new
 * versionNumber and retire the old one. This keeps completed assessments (which
 * pin their version and RESTRICT the answer→option FK) intact.
 */
@Injectable()
export class InstrumentAuthoringService {
  constructor(private readonly prisma: PrismaService) {}

  private fingerprint(v: DesiredVersion): string {
    const canonical = {
      scoringMethod: v.scoringMethod,
      normalizationMax: v.normalizationMax == null ? null : norm3(v.normalizationMax),
      attribution: v.attribution ?? null,
      instructions: v.instructions ?? null,
      questions: v.questions.map((q) => ({
        prompt: q.prompt,
        type: q.type,
        domain: q.domain ?? null,
        isReverseScored: q.isReverseScored ?? false,
        options: q.options.map((o) => ({ label: o.label, value: o.value, weight: norm3(o.weight) })),
      })),
      bands: v.bands.map((b) => ({
        label: b.label,
        severityRank: b.severityRank,
        minScore: norm3(b.minScore),
        maxScore: norm3(b.maxScore),
        colorHex: b.colorHex ?? null,
        advice: b.advice ?? null,
        recommendedAction: b.recommendedAction,
        recommendedContentId: b.recommendedContentId ?? null,
      })),
    };
    return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
  }

  private describeExisting(version: {
    scoringMethod: ScoringMethod;
    normalizationMax: { toString(): string } | null;
    attribution: string | null;
    instructions: string | null;
    questions: Array<{
      position: number;
      prompt: string;
      type: QuestionType;
      domain: string | null;
      isReverseScored: boolean;
      options: Array<{ position: number; label: string; value: number; weight: { toString(): string } }>;
    }>;
    scoringBands: Array<{
      position: number;
      label: string;
      severityRank: number;
      minScore: { toString(): string };
      maxScore: { toString(): string };
      colorHex: string | null;
      advice: string | null;
      recommendedAction: OutcomeAction;
      recommendedContentId: string | null;
    }>;
  }): DesiredVersion {
    return {
      scoringMethod: version.scoringMethod,
      normalizationMax: version.normalizationMax == null ? null : Number(version.normalizationMax),
      attribution: version.attribution ?? null,
      instructions: version.instructions ?? null,
      questions: [...version.questions]
        .sort((a, b) => a.position - b.position)
        .map((q) => ({
          prompt: q.prompt,
          type: q.type,
          domain: q.domain ?? null,
          isReverseScored: q.isReverseScored,
          options: [...q.options]
            .sort((a, b) => a.position - b.position)
            .map((o) => ({ label: o.label, value: o.value, weight: Number(o.weight) })),
        })),
      bands: [...version.scoringBands]
        .sort((a, b) => a.position - b.position)
        .map((b) => ({
          label: b.label,
          severityRank: b.severityRank,
          minScore: Number(b.minScore),
          maxScore: Number(b.maxScore),
          colorHex: b.colorHex ?? null,
          advice: b.advice ?? null,
          recommendedAction: b.recommendedAction,
          recommendedContentId: b.recommendedContentId ?? null,
        })),
    };
  }

  /**
   * Write the desired content into the instrument's current locale version,
   * creating a new published version when the current one is locked by
   * responses. Returns the target version id and whether a new version was cut.
   */
  async writeVersion(
    instrumentId: string,
    locale: string,
    desired: DesiredVersion,
  ): Promise<{ versionId: string; versionNumber: number; newVersionCreated: boolean }> {
    const desiredHash = this.fingerprint(desired);

    const current = await this.prisma.instrumentVersion.findFirst({
      where: { instrumentId, locale, status: 'PUBLISHED' },
      orderBy: { versionNumber: 'desc' },
      include: { questions: { include: { options: true } }, scoringBands: true },
    });

    if (current && this.fingerprint(this.describeExisting(current)) === desiredHash) {
      return { versionId: current.id, versionNumber: current.versionNumber, newVersionCreated: false };
    }

    const referencingAssessments = current
      ? await this.prisma.assessment.count({ where: { instrumentVersionId: current.id } })
      : 0;

    return this.prisma.$transaction(async (tx) => {
      let targetVersionId: string;
      let targetVersionNumber: number;
      let newVersionCreated: boolean;

      if (current && referencingAssessments === 0) {
        // No response references this version yet → safe to rewrite in place.
        await tx.instrumentVersion.update({
          where: { id: current.id },
          data: {
            status: 'PUBLISHED',
            scoringMethod: desired.scoringMethod,
            normalizationMax: desired.normalizationMax,
            attribution: desired.attribution,
            instructions: desired.instructions ?? null,
            publishedAt: new Date(),
          },
        });
        targetVersionId = current.id;
        targetVersionNumber = current.versionNumber;
        newVersionCreated = false;
      } else {
        // Fresh instrument, or current version is locked by responses → publish
        // a new immutable version and retire the previous one.
        const latest = await tx.instrumentVersion.findFirst({
          where: { instrumentId, locale },
          orderBy: { versionNumber: 'desc' },
          select: { versionNumber: true },
        });
        targetVersionNumber = (latest?.versionNumber ?? 0) + 1;
        const created = await tx.instrumentVersion.create({
          data: {
            instrumentId,
            versionNumber: targetVersionNumber,
            locale,
            status: 'PUBLISHED',
            scoringMethod: desired.scoringMethod,
            normalizationMax: desired.normalizationMax,
            attribution: desired.attribution,
            instructions: desired.instructions ?? null,
            publishedAt: new Date(),
          },
        });
        targetVersionId = created.id;
        newVersionCreated = true;
        if (current) {
          await tx.instrumentVersion.update({
            where: { id: current.id },
            data: { status: 'RETIRED', retiredAt: new Date() },
          });
        }
      }

      // (Re)write questions/options/bands. For a new version these deletes are
      // no-ops; for an in-place rewrite the version has no referencing
      // assessments, so the deletes can't violate the answer FKs.
      await tx.answerOption.deleteMany({ where: { question: { instrumentVersionId: targetVersionId } } });
      await tx.question.deleteMany({ where: { instrumentVersionId: targetVersionId } });
      await tx.scoringBand.deleteMany({ where: { instrumentVersionId: targetVersionId } });

      const questionRows = desired.questions.map((q, i) => ({
        id: randomUUID(),
        instrumentVersionId: targetVersionId,
        position: i + 1,
        prompt: q.prompt,
        type: q.type,
        domain: q.domain ?? null,
        isReverseScored: q.isReverseScored ?? false,
        isRequired: true,
      }));

      const optionRows = desired.questions.flatMap((q, i) =>
        q.options.map((opt, j) => ({
          questionId: questionRows[i]!.id,
          position: j + 1,
          label: opt.label,
          value: opt.value,
          weight: String(opt.weight),
        })),
      );

      const bandRows = desired.bands.map((b, i) => ({
        instrumentVersionId: targetVersionId,
        position: i + 1,
        label: b.label,
        severityRank: b.severityRank,
        minScore: String(b.minScore),
        maxScore: String(b.maxScore),
        colorHex: b.colorHex ?? null,
        advice: b.advice ?? null,
        recommendedAction: b.recommendedAction,
        recommendedContentId: b.recommendedContentId ?? null,
      }));

      if (questionRows.length) await tx.question.createMany({ data: questionRows });
      if (optionRows.length) await tx.answerOption.createMany({ data: optionRows });
      if (bandRows.length) await tx.scoringBand.createMany({ data: bandRows });

      return { versionId: targetVersionId, versionNumber: targetVersionNumber, newVersionCreated };
    });
  }
}
