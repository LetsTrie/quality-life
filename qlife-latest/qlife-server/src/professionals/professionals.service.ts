import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
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
        isVisible: false,
        acceptingNewClients: false,
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
      },
    });
    if (!profile) throw new NotFoundException('Professional profile not found');
    return profile;
  }

  async updateMyProfessionalProfile(accountId: string, dto: any) {
    const profile = await this.prisma.professionalProfile.findUnique({ where: { accountId } });
    if (!profile) throw new NotFoundException('Professional profile not found');

    return this.prisma.professionalProfile.update({
      where: { id: profile.id },
      data: {
        fullName: dto.fullName ?? undefined,
        professionType: dto.professionType ?? undefined,
        gender: dto.gender ?? undefined,
        designation: dto.designation ?? undefined,
        workplace: dto.workplace ?? undefined,
        yearsOfExperience: dto.yearsOfExperience ?? undefined,
        bio: dto.bio ?? undefined,
        phone: dto.phone ?? undefined,
        isVisible: dto.isVisible ?? undefined,
        acceptingNewClients: dto.acceptingNewClients ?? undefined,
        isOnboardingComplete: dto.isOnboardingComplete ?? undefined,
      },
    });
  }

  async listDirectory(args: { page: number }) {
    const take = 10;
    const skip = Math.max(0, (args.page - 1) * take);

    // "Verified" = latest verification status APPROVED.
    const where = {
      deletedAt: null,
      isVisible: true,
      acceptingNewClients: true,
      isOnboardingComplete: true,
      verifications: { some: { status: 'APPROVED' } },
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
        },
      }),
    ]);

    return { professionals, pagination: { page: args.page, pageSize: take, total, hasMore: skip + professionals.length < total } };
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

    // If approved, allow listing (still gated by isVisible/acceptingNewClients/onboardingComplete).
    if (args.decision === 'APPROVED') {
      await this.prisma.account.update({
        where: { id: verification.professional.accountId },
        data: { status: 'ACTIVE' },
      });
    }

    // Best-effort email fanout.
    try {
      const proAccount = await this.prisma.account.findUnique({
        where: { id: verification.professional.accountId },
        select: { email: true },
      });
      if (proAccount?.email) {
        await this.email.sendText({
          to: proAccount.email,
          subject: `Verification ${args.decision.toLowerCase()}`,
          text: `Your professional verification was ${args.decision}.\n\nNote: ${args.decisionNote ?? ''}`,
        });
      }
    } catch (_) {}

    return updated;
  }
}

