import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProfessionalVerificationStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AdminCreateProfessionalDto } from './dto/create-professional.dto';

const PAGE_SIZE = 20;

/** Prisma Decimal (or null) → plain number (or null) for JSON responses. */
function decToNumber(v: Prisma.Decimal | null | undefined): number | null {
  return v == null ? null : Number(v);
}

function pageMeta(page: number, total: number) {
  return {
    page,
    pageSize: PAGE_SIZE,
    total,
    hasMore: page * PAGE_SIZE < total,
  };
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /// Suspend or reactivate a user/professional account. Only these two
  /// transitions are allowed here (delete/deactivate are self-service flows).
  async setAccountStatus(accountId: string, status: 'ACTIVE' | 'SUSPENDED') {
    if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
      throw new BadRequestException('status must be ACTIVE or SUSPENDED');
    }
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');
    if (account.role === 'ADMIN') throw new BadRequestException('Cannot change an admin account status');

    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data: { status },
    });
    // Suspending a professional also pulls them from the directory.
    if (account.role === 'PROFESSIONAL' && status === 'SUSPENDED') {
      await this.prisma.professionalProfile.updateMany({
        where: { accountId },
        data: { isVisible: false, acceptingNewClients: false },
      });
    }
    return { id: updated.id, status: updated.status };
  }

  /**
   * Aggregated metrics for the admin dashboard overview. Returns headline
   * counts, status/type breakdowns, and an 8-week signup trend so the client
   * can render charts without paging through every row.
   */
  async getOverview() {
    const WEEKS = 8;
    const now = new Date();
    // Start of the trend window: midnight, (WEEKS-1) weeks before this week.
    const trendStart = new Date(now);
    trendStart.setHours(0, 0, 0, 0);
    trendStart.setDate(trendStart.getDate() - (WEEKS - 1) * 7);

    const [
      totalUsers,
      activeUsers,
      totalProfessionals,
      verifications,
      professionalTypes,
      userStatuses,
      totalAppointments,
      appointmentStatuses,
      totalAssessments,
      completedAssessments,
      totalContentViews,
      recentAccounts,
    ] = await this.prisma.$transaction([
      this.prisma.account.count({ where: { role: 'USER' } }),
      this.prisma.account.count({ where: { role: 'USER', status: 'ACTIVE' } }),
      this.prisma.account.count({ where: { role: 'PROFESSIONAL' } }),
      this.prisma.professionalVerification.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.professionalProfile.groupBy({
        by: ['professionType'],
        _count: { _all: true },
      }),
      this.prisma.account.groupBy({
        by: ['status'],
        where: { role: 'USER' },
        _count: { _all: true },
      }),
      this.prisma.appointment.count(),
      this.prisma.appointment.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.assessment.count(),
      this.prisma.assessment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.contentView.count(),
      this.prisma.account.findMany({
        where: { createdAt: { gte: trendStart }, role: { in: ['USER', 'PROFESSIONAL'] } },
        select: { role: true, createdAt: true },
      }),
    ]);

    const countByStatus = (
      rows: { status: string; _count: { _all: number } }[],
    ): Record<string, number> =>
      rows.reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = r._count._all;
        return acc;
      }, {});

    const verificationStatus = countByStatus(verifications);

    // Bucket recent signups into weekly buckets, split by role.
    const trend = Array.from({ length: WEEKS }, (_, i) => {
      const weekStart = new Date(trendStart);
      weekStart.setDate(trendStart.getDate() + i * 7);
      return {
        weekStart: weekStart.toISOString(),
        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        users: 0,
        professionals: 0,
      };
    });
    for (const a of recentAccounts) {
      const idx = Math.floor(
        (a.createdAt.getTime() - trendStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      if (idx < 0 || idx >= WEEKS) continue;
      if (a.role === 'PROFESSIONAL') trend[idx].professionals += 1;
      else trend[idx].users += 1;
    }

    return {
      counts: {
        totalUsers,
        activeUsers,
        totalProfessionals,
        pendingProfessionals: verificationStatus.PENDING ?? 0,
        approvedProfessionals: verificationStatus.APPROVED ?? 0,
        totalAppointments,
        totalAssessments,
        completedAssessments,
        totalContentViews,
      },
      professionalsByStatus: verificationStatus,
      professionalsByType: professionalTypes.map((t) => ({
        type: t.professionType,
        count: t._count._all,
      })),
      usersByStatus: countByStatus(userStatuses),
      appointmentsByStatus: countByStatus(appointmentStatuses),
      signupTrend: trend,
    };
  }

  /** Tabular list of professionals with their latest verification status. */
  async listProfessionals(args: { status?: string; page: number }) {
    const skip = (args.page - 1) * PAGE_SIZE;
    const where: Prisma.ProfessionalProfileWhereInput = args.status
      ? { verifications: { some: { status: args.status as ProfessionalVerificationStatus } } }
      : {};

    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.professionalProfile.findMany({
        where,
        include: {
          account: { select: { id: true, email: true, status: true, createdAt: true } },
          verifications: { orderBy: { submittedAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: PAGE_SIZE,
      }),
      this.prisma.professionalProfile.count({ where }),
    ]);

    const items = profiles.map((p) => ({
      id: p.id,
      accountId: p.accountId,
      fullName: p.fullName,
      professionType: p.professionType,
      email: p.account.email,
      accountStatus: p.account.status,
      isVisible: p.isVisible,
      acceptingNewClients: p.acceptingNewClients,
      isOnboardingComplete: p.isOnboardingComplete,
      createdAt: p.account.createdAt,
      verification: p.verifications[0]
        ? {
            id: p.verifications[0].id,
            status: p.verifications[0].status,
            submittedAt: p.verifications[0].submittedAt,
            reviewedAt: p.verifications[0].reviewedAt,
          }
        : null,
    }));

    return { items, pagination: pageMeta(args.page, total) };
  }

  /** Tabular list of end-users (role USER), optionally filtered by email. */
  async listUsers(args: { q?: string; page: number }) {
    const skip = (args.page - 1) * PAGE_SIZE;
    const where: Prisma.AccountWhereInput = {
      role: 'USER',
      ...(args.q ? { email: { contains: args.q, mode: 'insensitive' } } : {}),
    };

    const [accounts, total] = await this.prisma.$transaction([
      this.prisma.account.findMany({
        where,
        include: { userProfile: { select: { displayName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: PAGE_SIZE,
      }),
      this.prisma.account.count({ where }),
    ]);

    const items = accounts.map((a) => ({
      id: a.id,
      email: a.email,
      displayName: a.userProfile?.displayName ?? null,
      status: a.status,
      createdAt: a.createdAt,
      lastLoginAt: a.lastLoginAt,
    }));

    return { items, pagination: pageMeta(args.page, total) };
  }

  /** A comprehensive activity profile for a single user. */
  async getUserDetail(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: {
        userProfile: {
          include: {
            assessments: {
              orderBy: { createdAt: 'desc' },
              take: 25,
              include: {
                instrumentVersion: {
                  include: { instrument: { select: { name: true, slug: true } } },
                },
              },
            },
            appointments: {
              orderBy: { requestedStartAt: 'desc' },
              take: 25,
              include: { professional: { select: { fullName: true } } },
            },
          },
        },
        contentViews: {
          orderBy: { lastViewedAt: 'desc' },
          take: 25,
          include: { content: { select: { title: true, contentKey: true } } },
        },
      },
    });

    if (!account) throw new NotFoundException('Account not found');

    const up = account.userProfile;
    const assessments = up?.assessments ?? [];
    const appointments = up?.appointments ?? [];

    return {
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        status: account.status,
        createdAt: account.createdAt,
        lastLoginAt: account.lastLoginAt,
      },
      profile: up
        ? {
            displayName: up.displayName,
            gender: up.gender,
            dateOfBirth: up.dateOfBirth,
            phone: up.phone,
          }
        : null,
      assessments: assessments.map((a) => ({
        id: a.id,
        status: a.status,
        source: a.source,
        severityLabel: a.severityLabel,
        rawScore: a.rawScore,
        maxScore: a.maxScore,
        completedAt: a.completedAt,
        createdAt: a.createdAt,
        instrument:
          a.instrumentVersion?.instrument?.name ??
          a.instrumentVersion?.instrument?.slug ??
          null,
      })),
      appointments: appointments.map((ap) => ({
        id: ap.id,
        status: ap.status,
        modality: ap.modality,
        requestedStartAt: ap.requestedStartAt,
        scheduledStartAt: ap.scheduledStartAt,
        professional: ap.professional?.fullName ?? null,
      })),
      contentViews: account.contentViews.map((v) => ({
        contentKey: v.content.contentKey,
        title: v.content.title,
        viewCount: v.viewCount,
        completed: v.completed,
        lastViewedAt: v.lastViewedAt,
      })),
      stats: {
        assessmentCount: assessments.length,
        appointmentCount: appointments.length,
        contentViewCount: account.contentViews.length,
      },
    };
  }

  /** Full profile + verification trail + activity for one professional. */
  async getProfessionalDetail(profileId: string) {
    const p = await this.prisma.professionalProfile.findUnique({
      where: { id: profileId },
      include: {
        account: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        verifications: {
          orderBy: { submittedAt: 'desc' },
          include: { reviewedBy: { select: { email: true } } },
        },
        specializations: {
          include: { specialization: { select: { nameEn: true, nameBn: true } } },
        },
        availability: { orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] },
        caseloads: true,
      },
    });
    if (!p) throw new NotFoundException('Professional not found');

    const [appointmentCount, activeClients, assignedAssessments, recentAppointments] =
      await this.prisma.$transaction([
        this.prisma.appointment.count({ where: { professionalProfileId: profileId } }),
        this.prisma.careRelationship.count({
          where: { professionalProfileId: profileId, status: 'ACTIVE' },
        }),
        this.prisma.assessment.count({
          where: { assignedByProfessionalId: profileId },
        }),
        this.prisma.appointment.findMany({
          where: { professionalProfileId: profileId },
          orderBy: { requestedStartAt: 'desc' },
          take: 10,
          include: { user: { select: { displayName: true } } },
        }),
      ]);

    const time = (t: Date | null) => (t ? t.toISOString().slice(11, 16) : null);

    return {
      id: p.id,
      fullName: p.fullName,
      email: p.account.email,
      accountId: p.account.id,
      accountStatus: p.account.status,
      gender: p.gender,
      professionType: p.professionType,
      designation: p.designation,
      bmdcRegistrationNo: p.bmdcRegistrationNo,
      graduationBatch: p.graduationBatch,
      workplace: p.workplace,
      yearsOfExperience: p.yearsOfExperience,
      educationSummary: p.educationSummary,
      bio: p.bio,
      phone: p.phone,
      feeAmount: decToNumber(p.feeAmount),
      feeCurrency: p.feeCurrency,
      maxWeeklyClients: p.maxWeeklyClients,
      avgWeeklyClients: p.avgWeeklyClients,
      timezone: p.timezone,
      isVisible: p.isVisible,
      acceptingNewClients: p.acceptingNewClients,
      isOnboardingComplete: p.isOnboardingComplete,
      createdAt: p.account.createdAt,
      lastLoginAt: p.account.lastLoginAt,
      specializations: p.specializations.map((s) => ({
        name: s.specialization.nameEn,
        nameBn: s.specialization.nameBn,
        note: s.note,
      })),
      availability: p.availability.map((a) => ({
        weekday: a.weekday,
        startTime: time(a.startTime),
        endTime: time(a.endTime),
      })),
      caseloads: p.caseloads.map((c) => ({
        locationLabel: c.locationLabel,
        clientCount: c.clientCount,
      })),
      verifications: p.verifications.map((v) => ({
        id: v.id,
        status: v.status,
        submittedAt: v.submittedAt,
        reviewedAt: v.reviewedAt,
        reviewedBy: v.reviewedBy?.email ?? null,
        decisionNote: v.decisionNote,
      })),
      stats: { appointmentCount, activeClients, assignedAssessments },
      recentAppointments: recentAppointments.map((ap) => ({
        id: ap.id,
        status: ap.status,
        modality: ap.modality,
        requestedStartAt: ap.requestedStartAt,
        user: ap.user?.displayName ?? null,
      })),
    };
  }

  /** Appointment with both parties and its full status-transition trail. */
  async getAppointmentDetail(id: string) {
    const ap = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: { include: { account: { select: { id: true, email: true } } } },
        professional: {
          select: { id: true, fullName: true, professionType: true },
        },
        careRelationship: { select: { referenceCode: true, status: true } },
        events: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { email: true, role: true } } },
        },
      },
    });
    if (!ap) throw new NotFoundException('Appointment not found');

    return {
      id: ap.id,
      status: ap.status,
      modality: ap.modality,
      requestedStartAt: ap.requestedStartAt,
      scheduledStartAt: ap.scheduledStartAt,
      durationMinutes: ap.durationMinutes,
      requestMessage: ap.requestMessage,
      professionalMessage: ap.professionalMessage,
      meetingLink: ap.meetingLink,
      profileShareGranted: ap.profileShareGranted,
      viewedByProfessionalAt: ap.viewedByProfessionalAt,
      respondedAt: ap.respondedAt,
      cancelledAt: ap.cancelledAt,
      cancellationReason: ap.cancellationReason,
      completedAt: ap.completedAt,
      createdAt: ap.createdAt,
      user: {
        accountId: ap.user.account.id,
        displayName: ap.user.displayName,
        email: ap.user.account.email,
      },
      professional: {
        id: ap.professional.id,
        fullName: ap.professional.fullName,
        professionType: ap.professional.professionType,
      },
      careRelationship: ap.careRelationship,
      events: ap.events.map((e) => ({
        id: e.id,
        fromStatus: e.fromStatus,
        toStatus: e.toStatus,
        note: e.note,
        actor: e.actor ? { email: e.actor.email, role: e.actor.role } : null,
        createdAt: e.createdAt,
      })),
    };
  }

  /**
   * A complete scale fill-up breakdown: the instrument's questions and options
   * (with weights), the user's selected answers and applied weights, plus the
   * snapshotted scores and severity band. Lets an admin audit exactly how a
   * score was reached.
   */
  async getAssessmentDetail(id: string) {
    const a = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        subject: { include: { account: { select: { id: true, email: true } } } },
        assignedBy: { select: { fullName: true } },
        scoringBand: true,
        instrumentVersion: {
          include: {
            instrument: { select: { name: true, slug: true, category: true } },
            questions: {
              orderBy: { position: 'asc' },
              include: { options: { orderBy: { position: 'asc' } } },
            },
          },
        },
        answers: true,
      },
    });
    if (!a) throw new NotFoundException('Assessment not found');

    const byQuestion = new Map<string, typeof a.answers>();
    for (const ans of a.answers) {
      const arr = byQuestion.get(ans.questionId) ?? [];
      arr.push(ans);
      byQuestion.set(ans.questionId, arr);
    }

    const questions = a.instrumentVersion.questions.map((q) => {
      const ans = byQuestion.get(q.id) ?? [];
      const selectedIds = new Set(
        ans.map((x) => x.selectedOptionId).filter((x): x is string => !!x),
      );
      const weightApplied = ans.reduce(
        (s, x) => s + (x.weightApplied != null ? Number(x.weightApplied) : 0),
        0,
      );
      return {
        id: q.id,
        position: q.position,
        prompt: q.prompt,
        type: q.type,
        domain: q.domain,
        isReverseScored: q.isReverseScored,
        isRequired: q.isRequired,
        answered: ans.length > 0,
        weightApplied: ans.length ? weightApplied : null,
        valueNumeric: decToNumber(ans[0]?.valueNumeric),
        valueText: ans[0]?.valueText ?? null,
        options: q.options.map((o) => ({
          id: o.id,
          label: o.label,
          value: o.value,
          weight: decToNumber(o.weight),
          selected: selectedIds.has(o.id),
        })),
      };
    });

    return {
      id: a.id,
      status: a.status,
      source: a.source,
      rawScore: decToNumber(a.rawScore),
      maxScore: decToNumber(a.maxScore),
      normalizedScore: decToNumber(a.normalizedScore),
      severityLabel: a.severityLabel,
      isFromContentFlow: a.isFromContentFlow,
      isPostIntervention: a.isPostIntervention,
      assignedAt: a.assignedAt,
      dueAt: a.dueAt,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      createdAt: a.createdAt,
      subject: {
        accountId: a.subject.account.id,
        displayName: a.subject.displayName,
        email: a.subject.account.email,
      },
      assignedByProfessional: a.assignedBy?.fullName ?? null,
      instrument: {
        name: a.instrumentVersion.instrument.name,
        slug: a.instrumentVersion.instrument.slug,
        category: a.instrumentVersion.instrument.category,
      },
      version: {
        versionNumber: a.instrumentVersion.versionNumber,
        locale: a.instrumentVersion.locale,
        scoringMethod: a.instrumentVersion.scoringMethod,
        normalizationMax: decToNumber(a.instrumentVersion.normalizationMax),
        attribution: a.instrumentVersion.attribution,
        instructions: a.instrumentVersion.instructions,
      },
      scoringBand: a.scoringBand
        ? {
            label: a.scoringBand.label,
            severityRank: a.scoringBand.severityRank,
            minScore: decToNumber(a.scoringBand.minScore),
            maxScore: decToNumber(a.scoringBand.maxScore),
            colorHex: a.scoringBand.colorHex,
            advice: a.scoringBand.advice,
            recommendedAction: a.scoringBand.recommendedAction,
          }
        : null,
      questions,
    };
  }

  /**
   * Create a professional from minimal info. No Cognito user exists yet — the
   * account is linked by email on the professional's first SDK login
   * (see AccountsService.resolveAccountFromCognitoClaims). Pre-approved since an
   * admin is vouching for them.
   */
  async createProfessional(adminAccountId: string, dto: AdminCreateProfessionalDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.account.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('An account with this email already exists');

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          email,
          role: 'PROFESSIONAL',
          status: 'ACTIVE',
          authProvider: 'cognito',
        },
      });

      const profile = await tx.professionalProfile.create({
        data: {
          accountId: account.id,
          fullName: dto.fullName,
          professionType: dto.professionType,
          designation: dto.designation ?? null,
          phone: dto.phone ?? null,
          isOnboardingComplete: false,
          isVisible: false,
          acceptingNewClients: false,
        },
      });

      const verification = await tx.professionalVerification.create({
        data: {
          professionalProfileId: profile.id,
          status: 'APPROVED',
          reviewedByAccountId: adminAccountId,
          reviewedAt: new Date(),
          decisionNote: 'Created by admin',
        },
      });

      return { account, professionalProfile: profile, verification };
    });
  }
}
