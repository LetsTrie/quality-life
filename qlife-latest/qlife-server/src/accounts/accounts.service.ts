import { Injectable } from '@nestjs/common';
import type { Account } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type ResolveArgs = {
  workosUserId: string;
  email?: string;
  emailVerified?: boolean;
};

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureUserProfile(account: Account) {
    if (account.role !== 'USER') return;
    await this.prisma.userProfile.upsert({
      where: { accountId: account.id },
      update: {},
      create: { accountId: account.id },
    });
  }

  /// Resolve (and lazily link/create) the local Account for a WorkOS user.
  /// The WorkOS user id is stored in the (provider-agnostic) `cognitoSub`
  /// column. Existing accounts relink by email on first WorkOS sign-in so
  /// their data (assessments, appointments) is preserved across the migration.
  async resolveAccountFromWorkosClaims(args: ResolveArgs): Promise<Account> {
    const bySub = await this.prisma.account.findUnique({
      where: { cognitoSub: args.workosUserId },
    });
    if (bySub) {
      await this.ensureUserProfile(bySub);
      return bySub;
    }

    if (args.email) {
      const byEmail = await this.prisma.account.findUnique({
        where: { email: args.email },
      });

      if (byEmail) {
        // First WorkOS login — link the existing account. Promote a still-
        // pending account to ACTIVE once WorkOS confirms the email is verified
        // (WorkOS only issues tokens post-verification), but never override an
        // admin state like SUSPENDED/DEACTIVATED/DELETED.
        const promote = args.emailVerified && byEmail.status === 'PENDING_VERIFICATION';
        const updated = await this.prisma.account.update({
          where: { id: byEmail.id },
          data: {
            cognitoSub: args.workosUserId,
            authProvider: 'workos',
            emailVerifiedAt: args.emailVerified ? new Date() : byEmail.emailVerifiedAt,
            lastLoginAt: new Date(),
            ...(promote ? { status: 'ACTIVE' } : {}),
          },
        });
        await this.ensureUserProfile(updated);
        return updated;
      }
    }

    // New WorkOS user — create local product identity with conservative defaults.
    const created = await this.prisma.account.create({
      data: {
        cognitoSub: args.workosUserId,
        authProvider: 'workos',
        email: args.email ?? `unknown+${args.workosUserId}@invalid`,
        role: 'USER',
        status: args.emailVerified ? 'ACTIVE' : 'PENDING_VERIFICATION',
        emailVerifiedAt: args.emailVerified ? new Date() : null,
        lastLoginAt: new Date(),
      },
    });
    await this.ensureUserProfile(created);
    return created;
  }

  async getAccountById(id: string) {
    return this.prisma.account.findUnique({ where: { id } });
  }

  /// Persist the account's preferred language (BCP-47, e.g. "bn"/"en"). Drives
  /// the language of in-app / push notifications. Normalized to the base
  /// language subtag so "en-US" and "en" behave the same.
  async setPreferredLocale(id: string, locale: string) {
    const normalized = locale.trim().toLowerCase().split(/[-_]/)[0];
    const preferredLocale = normalized === 'en' ? 'en' : 'bn';
    const account = await this.prisma.account.update({
      where: { id },
      data: { preferredLocale },
      select: { preferredLocale: true },
    });
    return { preferredLocale: account.preferredLocale };
  }

  /// Self-deactivate: recoverable. The account is blocked from normal use but
  /// retained. A deactivated professional drops out of the directory.
  async deactivate(id: string) {
    const account = await this.prisma.account.update({
      where: { id },
      data: { status: 'DEACTIVATED' },
    });
    if (account.role === 'PROFESSIONAL') {
      await this.prisma.professionalProfile.updateMany({
        where: { accountId: id },
        data: { isVisible: false, acceptingNewClients: false },
      });
    }
    return { status: account.status };
  }

  /// Self-delete: soft-delete + anonymize PII (clinical records are retained per
  /// the schema's retain-don't-destroy principle, but identifying fields are
  /// scrubbed and the email/Cognito link released).
  async softDeleteAccount(id: string) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) return { status: 'DELETED' };

    await this.prisma.$transaction([
      this.prisma.userProfile.updateMany({
        where: { accountId: id },
        data: { displayName: null, phone: null },
      }),
      this.prisma.professionalProfile.updateMany({
        where: { accountId: id },
        data: { fullName: 'Deleted user', phone: null, bio: null, isVisible: false, acceptingNewClients: false },
      }),
      this.prisma.account.update({
        where: { id },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
          email: `deleted+${id}@deleted.invalid`,
          cognitoSub: null,
        },
      }),
    ]);
    return { status: 'DELETED' };
  }

  /**
   * Resolve (or create) the local Account row backing the hardcoded admin
   * login. There is no Cognito user — `authProvider` is marked local. Existing
   * rows are forced to ADMIN/ACTIVE so the role guard and FK references (e.g.
   * verification.reviewedByAccountId) always resolve to a real account.
   */
  async getOrCreateAdminAccount(email: string): Promise<Account> {
    const normalized = email.trim().toLowerCase();
    const existing = await this.prisma.account.findUnique({
      where: { email: normalized },
    });

    if (existing) {
      return this.prisma.account.update({
        where: { id: existing.id },
        data: {
          role: 'ADMIN',
          status: 'ACTIVE',
          authProvider: 'local',
          lastLoginAt: new Date(),
        },
      });
    }

    return this.prisma.account.create({
      data: {
        email: normalized,
        role: 'ADMIN',
        status: 'ACTIVE',
        authProvider: 'local',
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      },
    });
  }
}

