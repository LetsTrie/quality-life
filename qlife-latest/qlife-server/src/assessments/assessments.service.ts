import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { InstrumentsService } from '../instruments/instruments.service';

@Injectable()
export class AssessmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly instruments: InstrumentsService,
    private readonly email: EmailService,
  ) {}

  async assignToClient(args: {
    professionalAccountId: string;
    careRelationshipId: string;
    instrumentSlugs: string[];
    dueAt?: string;
  }) {
    const professional = await this.prisma.professionalProfile.findUnique({
      where: { accountId: args.professionalAccountId },
    });
    if (!professional) throw new BadRequestException('Professional profile missing');

    const care = await this.prisma.careRelationship.findFirst({
      where: { id: args.careRelationshipId, professionalProfileId: professional.id, status: 'ACTIVE' },
      include: { user: { select: { accountId: true, id: true } } },
    });
    if (!care) throw new NotFoundException('Client relationship not found');

    const dueAt = args.dueAt ? new Date(args.dueAt) : null;
    if (args.dueAt && Number.isNaN(dueAt!.getTime())) throw new BadRequestException('Invalid dueAt');

    const slugs = Array.from(new Set(args.instrumentSlugs.map((s) => s.trim()).filter(Boolean)));
    if (slugs.length === 0) throw new BadRequestException('instrumentSlugs required');

    const now = new Date();
    const created = await this.prisma.$transaction(async (tx) => {
      const assessments = [];
      for (const slug of slugs) {
        const { version } = await this.instruments.getPublishedVersionBySlug(slug);

        const assessment = await tx.assessment.create({
          data: {
            subjectUserProfileId: care.userProfileId,
            instrumentVersionId: version.id,
            source: 'PROFESSIONAL_ASSIGNED',
            status: 'ASSIGNED',
            assignedByProfessionalId: professional.id,
            careRelationshipId: care.id,
            assignedAt: now,
            dueAt,
          },
        });

        await tx.notification.create({
          data: {
            recipientAccountId: care.user.accountId,
            senderAccountId: args.professionalAccountId,
            type: 'ASSESSMENT_ASSIGNED',
            channel: 'IN_APP',
            assessmentId: assessment.id,
          },
        });

        assessments.push(assessment);
      }
      return assessments;
    });

    // Best-effort email fanout to the user (summary).
    try {
      const userAccount = await this.prisma.account.findUnique({
        where: { id: care.user.accountId },
        select: { email: true },
      });
      if (userAccount?.email) {
        await this.email.sendText({
          to: userAccount.email,
          subject: 'New assessments assigned',
          text: `Your professional assigned ${slugs.length} assessment(s):\n- ${slugs.join('\n- ')}\n\nPlease open the app to complete them.`,
        });
      }
    } catch (_) {}

    return created;
  }

  async listForAccount(args: { accountId: string; role: 'USER' | 'PROFESSIONAL'; status?: string; page: number }) {
    const take = 10;
    const skip = Math.max(0, (args.page - 1) * take);

    if (args.role === 'USER') {
      const userProfile = await this.prisma.userProfile.findUnique({ where: { accountId: args.accountId } });
      if (!userProfile) throw new BadRequestException('User profile missing');
      const where = {
        subjectUserProfileId: userProfile.id,
        ...(args.status ? { status: args.status as any } : {}),
      };
      const [total, assessments] = await Promise.all([
        this.prisma.assessment.count({ where }),
        this.prisma.assessment.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }],
          skip,
          take,
          include: {
            instrumentVersion: { select: { id: true, versionNumber: true, instrument: { select: { slug: true, name: true } } } },
          },
        }),
      ]);
      return { assessments, pagination: { page: args.page, pageSize: take, total, hasMore: skip + assessments.length < total } };
    }

    const professionalProfile = await this.prisma.professionalProfile.findUnique({ where: { accountId: args.accountId } });
    if (!professionalProfile) throw new BadRequestException('Professional profile missing');
    const where = {
      assignedByProfessionalId: professionalProfile.id,
      ...(args.status ? { status: args.status as any } : {}),
    };
    const [total, assessments] = await Promise.all([
      this.prisma.assessment.count({ where }),
      this.prisma.assessment.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
        include: {
          instrumentVersion: { select: { id: true, versionNumber: true, instrument: { select: { slug: true, name: true } } } },
          subject: { select: { displayName: true } },
        },
      }),
    ]);
    return { assessments, pagination: { page: args.page, pageSize: take, total, hasMore: skip + assessments.length < total } };
  }

  async getById(args: { accountId: string; assessmentId: string }) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: args.assessmentId },
      include: {
        instrumentVersion: {
          select: {
            id: true,
            versionNumber: true,
            instrument: { select: { slug: true, name: true, category: true } },
          },
        },
        answers: {
          include: {
            question: { select: { id: true, prompt: true } },
            selectedOption: { select: { id: true, label: true } },
          },
        },
        scoringBand: { select: { label: true, recommendedAction: true, description: true } },
        subject: { select: { accountId: true, displayName: true } },
      },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');
    if (assessment.subject.accountId !== args.accountId) throw new NotFoundException('Assessment not found');
    return assessment;
  }

  async createSelfAssessment(args: {
    accountId: string;
    instrumentSlug: string;
  }) {
    const { version } = await this.instruments.getPublishedVersionBySlug(args.instrumentSlug);

    const userProfile = await this.prisma.userProfile.findUnique({
      where: { accountId: args.accountId },
    });
    if (!userProfile) throw new BadRequestException('User profile missing');

    return this.prisma.assessment.create({
      data: {
        subjectUserProfileId: userProfile.id,
        instrumentVersionId: version.id,
        source: 'SELF_INITIATED',
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  async submitAnswers(args: {
    accountId: string;
    assessmentId: string;
    answers: Array<{ questionId: string; selectedOptionId: string }>;
  }) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: args.assessmentId },
      include: {
        subject: { select: { accountId: true } },
        instrumentVersion: {
          select: {
            id: true,
            scoringMethod: true,
            normalizationMax: true,
            questions: {
              select: {
                id: true,
                options: { select: { id: true, weight: true } },
              },
            },
            scoringBands: {
              orderBy: [{ severityRank: 'asc' }],
              select: { id: true, label: true, minScore: true, maxScore: true },
            },
          },
        },
      },
    });

    if (!assessment) throw new NotFoundException('Assessment not found');
    if (assessment.subject.accountId !== args.accountId) {
      throw new NotFoundException('Assessment not found');
    }
    if (assessment.status !== 'IN_PROGRESS' && assessment.status !== 'ASSIGNED') {
      throw new BadRequestException('Assessment not in progress');
    }

    const version = assessment.instrumentVersion;
    const questionIds = new Set(version.questions.map((q) => q.id));
    for (const a of args.answers) {
      if (!questionIds.has(a.questionId)) {
        throw new BadRequestException('Answer has invalid questionId');
      }
    }

    // Replace answers for idempotency.
    await this.prisma.assessmentAnswer.deleteMany({
      where: { assessmentId: assessment.id },
    });

    // Persist + compute raw score.
    let rawScore = 0;
    for (const a of args.answers) {
      const q = version.questions.find((x) => x.id === a.questionId)!;
      const opt = q.options.find((o) => o.id === a.selectedOptionId);
      if (!opt) throw new BadRequestException('Answer has invalid selectedOptionId');

      const weight = Number(opt.weight);
      rawScore += weight;

      await this.prisma.assessmentAnswer.create({
        data: {
          assessmentId: assessment.id,
          questionId: a.questionId,
          selectedOptionId: a.selectedOptionId,
          weightApplied: String(opt.weight),
        },
      });
    }

    // Compute max score from instrument definition (max option weight per question).
    let maxScore = 0;
    for (const q of version.questions) {
      const max = Math.max(...q.options.map((o) => Number(o.weight)));
      maxScore += Number.isFinite(max) ? max : 0;
    }

    let normalizedScore: number | null = null;
    if (version.scoringMethod === 'NORMALIZED_PERCENT' && version.normalizationMax) {
      const denom = Number(version.normalizationMax);
      normalizedScore = denom > 0 ? (rawScore / denom) * 100 : null;
    }

    const band =
      version.scoringBands.find((b) => rawScore >= Number(b.minScore) && rawScore <= Number(b.maxScore)) ??
      null;

    const updated = await this.prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        status: 'COMPLETED',
        startedAt: assessment.startedAt ?? new Date(),
        rawScore: String(rawScore),
        maxScore: String(maxScore),
        normalizedScore: normalizedScore == null ? null : String(normalizedScore),
        scoringBandId: band?.id ?? null,
        severityLabel: band?.label ?? null,
        completedAt: new Date(),
      },
      include: {
        scoringBand: { select: { label: true, recommendedAction: true } },
      },
    });

    // Notify professional if it was assigned by one.
    if (assessment.assignedByProfessionalId) {
      const professional = await this.prisma.professionalProfile.findUnique({
        where: { id: assessment.assignedByProfessionalId },
        select: { accountId: true },
      });
      if (professional) {
        await this.prisma.notification.create({
          data: {
            recipientAccountId: professional.accountId,
            senderAccountId: args.accountId,
            type: 'ASSESSMENT_COMPLETED',
            channel: 'IN_APP',
            assessmentId: assessment.id,
          },
        });

        // Best-effort email fanout.
        try {
          const proAccount = await this.prisma.account.findUnique({
            where: { id: professional.accountId },
            select: { email: true },
          });
          if (proAccount?.email) {
            await this.email.sendText({
              to: proAccount.email,
              subject: 'Assessment completed',
              text: `A client completed an assigned assessment.\n\nAssessment ID: ${assessment.id}\nSeverity: ${updated.severityLabel ?? ''}`,
            });
          }
        } catch (_) {}
      }
    }

    return {
      assessment: {
        id: updated.id,
        status: updated.status,
        rawScore: updated.rawScore,
        maxScore: updated.maxScore,
        normalizedScore: updated.normalizedScore,
        severityLabel: updated.severityLabel,
        recommendedAction: updated.scoringBand?.recommendedAction ?? 'SHOW_RESULT',
      },
    };
  }
}

