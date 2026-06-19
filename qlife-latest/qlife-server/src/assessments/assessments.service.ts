import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

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
            title: 'New self-check assigned',
            body: 'Your professional has assigned you a self-check to complete.',
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

  async listForAccount(args: { accountId: string; role: 'USER' | 'PROFESSIONAL'; status?: string; instrumentSlug?: string; page: number }) {
    const take = 10;
    const skip = Math.max(0, (args.page - 1) * take);

    // Optional per-instrument filter powers the result-history / trend view.
    const instrumentWhere = args.instrumentSlug
      ? { instrumentVersion: { instrument: { slug: args.instrumentSlug } } }
      : {};

    if (args.role === 'USER') {
      const userProfile = await this.prisma.userProfile.findUnique({ where: { accountId: args.accountId } });
      if (!userProfile) throw new BadRequestException('User profile missing');
      const where = {
        subjectUserProfileId: userProfile.id,
        ...(args.status ? { status: args.status as any } : {}),
        ...instrumentWhere,
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
      ...instrumentWhere,
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

  async getById(args: { accountId: string; role: 'USER' | 'PROFESSIONAL'; assessmentId: string }) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: args.assessmentId },
      include: {
        instrumentVersion: {
          select: {
            id: true,
            versionNumber: true,
            instrument: { select: { slug: true, name: true, nameBn: true, category: true } },
            // The blank question set so a user can complete an ASSIGNED
            // assessment against the exact version that was assigned.
            questions: {
              orderBy: [{ position: 'asc' }],
              select: {
                id: true,
                position: true,
                prompt: true,
                type: true,
                options: {
                  orderBy: [{ position: 'asc' }],
                  select: { id: true, position: true, label: true, value: true },
                },
              },
            },
          },
        },
        answers: {
          include: {
            question: { select: { id: true, prompt: true } },
            selectedOption: { select: { id: true, label: true } },
          },
        },
        scoringBand: { select: { label: true, recommendedAction: true, advice: true } },
        subject: { select: { accountId: true, displayName: true } },
      },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');

    // Scope to the caller: a USER may read assessments where they are the subject;
    // a PROFESSIONAL may read assessments they assigned.
    if (args.role === 'USER') {
      if (assessment.subject.accountId !== args.accountId) throw new NotFoundException('Assessment not found');
    } else {
      const professional = await this.prisma.professionalProfile.findUnique({
        where: { accountId: args.accountId },
        select: { id: true },
      });
      if (!professional) throw new NotFoundException('Assessment not found');
      // A professional may read an assessment they assigned, OR any assessment
      // of a client they have an ACTIVE care relationship with (so they can
      // review the client's self-administered screens too).
      const allowed =
        assessment.assignedByProfessionalId === professional.id ||
        (await this.prisma.careRelationship.count({
          where: {
            professionalProfileId: professional.id,
            userProfileId: assessment.subjectUserProfileId,
            status: 'ACTIVE',
          },
        })) > 0;
      if (!allowed) throw new NotFoundException('Assessment not found');
    }

    // Opening an assessment clears its related notification (legacy
    // seenAssessmentNotification on open).
    await this.prisma.notification.updateMany({
      where: { assessmentId: assessment.id, recipientAccountId: args.accountId, readAt: null },
      data: { readAt: new Date() },
    });

    return assessment;
  }

  async createSelfAssessment(args: {
    accountId: string;
    instrumentSlug: string;
  }) {
    const { instrument, version } = await this.instruments.getPublishedVersionBySlug(args.instrumentSlug);

    // Clinical/assign-only scales cannot be self-started — a professional must
    // assign them (the user completes them from their assigned worklist).
    if (!instrument.isSelfAssessable) {
      throw new ForbiddenException('This scale can only be assigned by a professional');
    }

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
            instrument: { select: { category: true } },
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

    // Percent-normalized instruments (e.g. wellbeing-5) define their bands on the
    // 0–100 scale, so the band must be selected against the normalized score, not
    // the raw sum. All other methods band on the raw score.
    const bandScore =
      version.scoringMethod === 'NORMALIZED_PERCENT' && normalizedScore != null ? normalizedScore : rawScore;
    const band =
      version.scoringBands.find((b) => bandScore >= Number(b.minScore) && bandScore <= Number(b.maxScore)) ??
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
        scoringBand: {
          select: {
            label: true,
            advice: true,
            severityRank: true,
            recommendedAction: true,
            // Content to surface as a follow-up for this band (e.g. a coping
            // video or reading) so the client can offer a real next step.
            recommendedContent: {
              select: {
                contentKey: true,
                type: true,
                provider: true,
                providerRef: true,
                title: true,
                thumbnailUrl: true,
                durationSeconds: true,
              },
            },
          },
        },
      },
    });

    // Record the intro well-being screening (legacy lastIntroTestDate) the
    // first time the user completes a WELLBEING_INDEX self-check, so the
    // onboarding prompt stops surfacing.
    if (version.instrument.category === 'WELLBEING_INDEX') {
      await this.prisma.userProfile.updateMany({
        where: { id: assessment.subjectUserProfileId, introScreeningCompletedAt: null },
        data: { introScreeningCompletedAt: new Date() },
      });
    }

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
            title: 'Self-check completed',
            body: 'A client has completed an assigned self-check.',
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

    const recommendedContent = updated.scoringBand?.recommendedContent ?? null;

    return {
      assessment: {
        id: updated.id,
        status: updated.status,
        rawScore: updated.rawScore,
        maxScore: updated.maxScore,
        normalizedScore: updated.normalizedScore,
        severityLabel: updated.severityLabel,
        recommendedAction: updated.scoringBand?.recommendedAction ?? 'SHOW_RESULT',
        // Follow-up payload so the client can route the user to a real next
        // step (coping content, help center, or a professional).
        advice: updated.scoringBand?.advice ?? null,
        severityRank: updated.scoringBand?.severityRank ?? null,
        recommendedContent: recommendedContent
          ? {
              contentKey: recommendedContent.contentKey,
              type: recommendedContent.type,
              provider: recommendedContent.provider,
              providerRef: recommendedContent.providerRef,
              title: recommendedContent.title,
              thumbnailUrl: recommendedContent.thumbnailUrl,
              durationSeconds: recommendedContent.durationSeconds,
            }
          : null,
      },
    };
  }
}

