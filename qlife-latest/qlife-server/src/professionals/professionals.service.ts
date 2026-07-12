import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProfessionType } from '@prisma/client';

import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

/// Build a Date carrying only a wall-clock time (the date part is ignored by
/// Postgres `time` columns). Stored as-is and interpreted in `timezone`.
function timeToDate(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00.000Z`);
}

@Injectable()
export class ProfessionalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
  ) {}

  async registerAsProfessional(accountId: string, dto: { fullName: string; professionType: any; gender?: any; designation?: string; phone?: string }) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');
    if (account.role !== 'USER') {
      // Keep it strict: avoid role switching without explicit product decision.
      throw new BadRequestException('Account already has a role');
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id: accountId },
      data: { role: 'PROFESSIONAL' },
    });

    const profile = await this.prisma.professionalProfile.create({
      data: {
        accountId,
        fullName: dto.fullName,
        professionType: dto.professionType,
        gender: dto.gender ?? null,
        designation: dto.designation ?? null,
        phone: dto.phone ?? null,
        isOnboardingComplete: false,
        // Default both ON so onboarding stays short — the professional still
        // never appears publicly until an admin APPROVES them and onboarding
        // is complete (see listDirectory/getPublicProfile gating).
        isVisible: true,
        acceptingNewClients: true,
      },
    });

    // Start verification workflow as PENDING.
    await this.prisma.professionalVerification.create({
      data: {
        professionalProfileId: profile.id,
        status: 'PENDING',
      },
    });

    return { account: updatedAccount, professionalProfile: profile };
  }

  async myProfessionalProfile(accountId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { accountId },
      include: {
        verifications: {
          orderBy: [{ submittedAt: 'desc' }],
          take: 1,
        },
        specializations: {
          include: { specialization: { select: { id: true, slug: true, nameEn: true, nameBn: true } } },
        },
        availability: {
          orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
        },
        caseloads: true,
        district: { select: { id: true, nameBn: true } },
        upazila: { select: { id: true, nameBn: true } },
        union: { select: { id: true, nameBn: true } },
      },
    });
    if (!profile) throw new NotFoundException('Professional profile not found');
    return profile;
  }

  /// Resolve a Bangladesh location, inferring parents from the deepest field
  /// supplied (mirrors UsersService). Returns undefined fields when nothing was
  /// sent, so the update leaves them unchanged.
  private async normalizeLocation(dto: UpdateProfessionalDto) {
    let districtId: string | undefined;
    let upazilaId: string | null | undefined;
    let unionId: string | null | undefined;

    if (dto.unionId) {
      const u = await this.prisma.union.findUnique({
        where: { id: dto.unionId },
        select: { id: true, upazilaId: true, upazila: { select: { districtId: true } } },
      });
      if (!u) throw new BadRequestException('Invalid unionId');
      unionId = u.id;
      upazilaId = u.upazilaId;
      districtId = u.upazila.districtId;
    } else if (dto.upazilaId) {
      const up = await this.prisma.upazila.findUnique({
        where: { id: dto.upazilaId },
        select: { id: true, districtId: true },
      });
      if (!up) throw new BadRequestException('Invalid upazilaId');
      upazilaId = up.id;
      districtId = up.districtId;
      unionId = null;
    } else if (dto.districtId) {
      const d = await this.prisma.district.findUnique({ where: { id: dto.districtId }, select: { id: true } });
      if (!d) throw new BadRequestException('Invalid districtId');
      districtId = d.id;
      upazilaId = null;
      unionId = null;
    }

    return { districtId, upazilaId, unionId };
  }

  async updateMyProfessionalProfile(accountId: string, dto: UpdateProfessionalDto) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { accountId },
      include: { specializations: true, availability: true, caseloads: true },
    });
    if (!profile) throw new NotFoundException('Professional profile not found');

    // Validate availability windows up front (clear errors before the tx).
    if (dto.availability) {
      for (const w of dto.availability) {
        if (timeToDate(w.startTime).getTime() >= timeToDate(w.endTime).getTime()) {
          throw new BadRequestException(`Availability ${w.weekday}: start time must be before end time`);
        }
      }
    }

    // Validate selected specializations exist.
    if (dto.specializations && dto.specializations.length > 0) {
      const ids = [...new Set(dto.specializations.map((s) => s.specializationId))];
      const found = await this.prisma.specialization.count({ where: { id: { in: ids } } });
      if (found !== ids.length) throw new BadRequestException('One or more specializationId values are invalid');
    }

    const location = await this.normalizeLocation(dto);

    // Effective state AFTER this patch — used to gate onboarding completion so a
    // profile cannot be marked complete while missing the essentials a client
    // needs to book (fee, education, ≥1 specialization, ≥1 availability window).
    if (dto.isOnboardingComplete === true) {
      const effectiveFee = dto.feeAmount ?? (profile.feeAmount != null ? Number(profile.feeAmount) : null);
      const effectiveEducation = dto.educationSummary ?? profile.educationSummary;
      const effectiveYears = dto.yearsOfExperience ?? profile.yearsOfExperience;
      const effectivePhone = dto.phone ?? profile.phone;
      const effectiveMaxWeekly = dto.maxWeeklyClients ?? profile.maxWeeklyClients;
      const effectiveAvgWeekly = dto.avgWeeklyClients ?? profile.avgWeeklyClients;
      const specCount = dto.specializations ? dto.specializations.length : profile.specializations.length;
      const availCount = dto.availability ? dto.availability.length : profile.availability.length;
      const caseloadCount = dto.caseloads ? dto.caseloads.length : profile.caseloads.length;

      // Mirrors the legacy registration step validations (steps 2–4): every one
      // of these was `.required()` before a clinician could finish onboarding.
      const missing: string[] = [];
      if (effectiveFee == null) missing.push('feeAmount');
      if (!effectiveEducation || !effectiveEducation.trim()) missing.push('educationSummary');
      if (effectiveYears == null) missing.push('yearsOfExperience');
      if (!effectivePhone || !effectivePhone.trim()) missing.push('phone');
      if (effectiveMaxWeekly == null) missing.push('maxWeeklyClients');
      if (effectiveAvgWeekly == null) missing.push('avgWeeklyClients');
      if (specCount < 1) missing.push('specializations');
      if (availCount < 1) missing.push('availability');
      if (caseloadCount < 1) missing.push('caseloads');
      if (missing.length > 0) {
        throw new BadRequestException(`Cannot finish onboarding — missing: ${missing.join(', ')}`);
      }
    }

    const scalarData: Prisma.ProfessionalProfileUpdateInput = {
      fullName: dto.fullName ?? undefined,
      professionType: dto.professionType ?? undefined,
      gender: dto.gender ?? undefined,
      designation: dto.designation ?? undefined,
      bmdcRegistrationNo: dto.bmdcRegistrationNo ?? undefined,
      graduationBatch: dto.graduationBatch ?? undefined,
      workplace: dto.workplace ?? undefined,
      yearsOfExperience: dto.yearsOfExperience ?? undefined,
      educationSummary: dto.educationSummary ?? undefined,
      bio: dto.bio ?? undefined,
      phone: dto.phone ?? undefined,
      feeAmount: dto.feeAmount ?? undefined,
      feeCurrency: dto.feeCurrency ?? undefined,
      maxWeeklyClients: dto.maxWeeklyClients ?? undefined,
      avgWeeklyClients: dto.avgWeeklyClients ?? undefined,
      referralSource: dto.referralSource ?? undefined,
      timezone: dto.timezone ?? undefined,
      isVisible: dto.isVisible ?? undefined,
      acceptingNewClients: dto.acceptingNewClients ?? undefined,
      isOnboardingComplete: dto.isOnboardingComplete ?? undefined,
      district: location.districtId === undefined ? undefined : location.districtId === null ? { disconnect: true } : { connect: { id: location.districtId } },
      upazila: location.upazilaId === undefined ? undefined : location.upazilaId === null ? { disconnect: true } : { connect: { id: location.upazilaId } },
      union: location.unionId === undefined ? undefined : location.unionId === null ? { disconnect: true } : { connect: { id: location.unionId } },
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.professionalProfile.update({ where: { id: profile.id }, data: scalarData });

      // Each collection is a full replace when supplied (idempotent re-saves).
      if (dto.specializations) {
        await tx.professionalSpecialization.deleteMany({ where: { professionalProfileId: profile.id } });
        if (dto.specializations.length > 0) {
          await tx.professionalSpecialization.createMany({
            data: dto.specializations.map((s) => ({
              professionalProfileId: profile.id,
              specializationId: s.specializationId,
              note: s.note?.trim() ? s.note.trim() : null,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (dto.availability) {
        await tx.professionalAvailability.deleteMany({ where: { professionalProfileId: profile.id } });
        if (dto.availability.length > 0) {
          await tx.professionalAvailability.createMany({
            data: dto.availability.map((w) => ({
              professionalProfileId: profile.id,
              weekday: w.weekday,
              startTime: timeToDate(w.startTime),
              endTime: timeToDate(w.endTime),
            })),
          });
        }
      }

      if (dto.caseloads) {
        await tx.professionalLocationCaseload.deleteMany({ where: { professionalProfileId: profile.id } });
        if (dto.caseloads.length > 0) {
          await tx.professionalLocationCaseload.createMany({
            data: dto.caseloads.map((c) => ({
              professionalProfileId: profile.id,
              locationLabel: c.locationLabel.trim(),
              clientCount: c.clientCount,
            })),
          });
        }
      }
    });

    return this.myProfessionalProfile(accountId);
  }

  async listDirectory(args: {
    page: number;
    q?: string;
    professionType?: string;
    districtId?: string;
    specializationSlug?: string;
  }) {
    const take = 10;
    const skip = Math.max(0, (args.page - 1) * take);

    // Directory gating (all must be true):
    // - Latest verification status is APPROVED
    // - isOnboardingComplete (professional finished onboarding form)
    // - isVisible (professional opted into being listed)
    // - acceptingNewClients (professional is currently taking new clients)
    //
    // Optional filters then narrow by name search, profession, district, and specialization.
    const where: Prisma.ProfessionalProfileWhereInput = {
      deletedAt: null,
      isVisible: true,
      acceptingNewClients: true,
      isOnboardingComplete: true,
      verifications: { some: { status: 'APPROVED' } },
      ...(args.q ? { fullName: { contains: args.q, mode: 'insensitive' } } : {}),
      ...(args.professionType ? { professionType: args.professionType as ProfessionType } : {}),
      ...(args.districtId ? { districtId: args.districtId } : {}),
      ...(args.specializationSlug
        ? { specializations: { some: { specialization: { slug: args.specializationSlug } } } }
        : {}),
    };
    const [total, professionals] = await Promise.all([
      this.prisma.professionalProfile.count({ where }),
      this.prisma.professionalProfile.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          slug: true,
          fullName: true,
          professionType: true,
          designation: true,
          yearsOfExperience: true,
          workplace: true,
          feeAmount: true,
          feeCurrency: true,
          district: { select: { id: true, nameBn: true } },
          specializations: {
            select: { specialization: { select: { slug: true, nameEn: true, nameBn: true } }, note: true },
          },
          availability: {
            select: { weekday: true, startTime: true, endTime: true },
            orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
          },
        },
      }),
    ]);

    return { professionals, pagination: { page: args.page, pageSize: take, total, hasMore: skip + professionals.length < total } };
  }

  /// Public profile shown to a user before booking (fee, schedule, specialties).
  /// Only listable (visible + accepting + approved) professionals are exposed.
  async getPublicProfile(id: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: {
        id,
        deletedAt: null,
        isVisible: true,
        isOnboardingComplete: true,
        verifications: { some: { status: 'APPROVED' } },
      },
      select: {
        id: true,
        slug: true,
        fullName: true,
        gender: true,
        professionType: true,
        designation: true,
        bmdcRegistrationNo: true,
        graduationBatch: true,
        workplace: true,
        yearsOfExperience: true,
        educationSummary: true,
        bio: true,
        feeAmount: true,
        feeCurrency: true,
        acceptingNewClients: true,
        district: { select: { id: true, nameBn: true } },
        upazila: { select: { id: true, nameBn: true } },
        specializations: {
          select: { specialization: { select: { slug: true, nameEn: true, nameBn: true } }, note: true },
        },
        availability: {
          select: { weekday: true, startTime: true, endTime: true },
          orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
        },
      },
    });
    if (!profile) throw new NotFoundException('Professional not found');
    return profile;
  }

  async reviewVerification(args: { adminAccountId: string; verificationId: string; decision: 'APPROVED' | 'REJECTED' | 'REVOKED'; decisionNote?: string }) {
    const verification = await this.prisma.professionalVerification.findUnique({
      where: { id: args.verificationId },
      include: { professional: true },
    });
    if (!verification) throw new NotFoundException('Verification not found');

    const updated = await this.prisma.professionalVerification.update({
      where: { id: verification.id },
      data: {
        status: args.decision,
        reviewedByAccountId: args.adminAccountId,
        reviewedAt: new Date(),
        decisionNote: args.decisionNote ?? null,
      },
    });

    // If approved, allow listing (still gated by isVisible/acceptingNewClients/onboardingComplete)
    // and signal the professional in-app.
    if (args.decision === 'APPROVED') {
      await this.prisma.account.update({
        where: { id: verification.professional.accountId },
        data: { status: 'ACTIVE' },
      });
      await this.notifications.createLocalizedNotification({
        recipientAccountId: verification.professional.accountId,
        senderAccountId: args.adminAccountId,
        type: 'ACCOUNT_APPROVED',
        en: {
          title: "You're verified",
          body: "Your professional account is approved — you're now visible to clients on QLife.",
        },
        bn: {
          title: 'আপনি যাচাইকৃত হয়েছেন',
          body: 'আপনার পেশাদার অ্যাকাউন্ট অনুমোদিত হয়েছে — এখন আপনি QLife-এ ক্লায়েন্টদের কাছে দৃশ্যমান।',
        },
      });
    }

    // Best-effort bilingual email fanout.
    try {
      const proAccount = await this.prisma.account.findUnique({
        where: { id: verification.professional.accountId },
        select: { email: true },
      });
      if (proAccount?.email) {
        const note = args.decisionNote?.trim();
        if (args.decision === 'APPROVED') {
          await this.email.sendBilingual({
            to: proAccount.email,
            subjectBn: 'আপনার QLife অ্যাকাউন্ট অনুমোদিত হয়েছে',
            bodyBn: ['অভিনন্দন! আপনার পেশাদার অ্যাকাউন্ট যাচাই ও অনুমোদিত হয়েছে। এখন আপনি ক্লায়েন্টদের কাছে তালিকাভুক্ত হতে পারবেন।', ...(note ? [`নোট: ${note}`] : [])],
            bodyEn: ['Congratulations! Your professional account has been verified and approved. You can now be listed to clients.', ...(note ? [`Note: ${note}`] : [])],
          });
        } else {
          await this.email.sendBilingual({
            to: proAccount.email,
            subjectBn: `আপনার যাচাইয়ের অবস্থা: ${args.decision}`,
            bodyBn: [`আপনার পেশাদার যাচাইয়ের অবস্থা পরিবর্তিত হয়েছে: ${args.decision}।`, ...(note ? [`নোট: ${note}`] : [])],
            bodyEn: [`Your professional verification status changed to: ${args.decision}.`, ...(note ? [`Note: ${note}`] : [])],
          });
        }
      }
    } catch (_) {}

    return updated;
  }
}
