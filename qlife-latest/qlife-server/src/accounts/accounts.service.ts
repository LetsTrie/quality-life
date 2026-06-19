import { Injectable } from '@nestjs/common';
import type { Account } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type ResolveArgs = {
  cognitoSub: string;
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

  async resolveAccountFromCognitoClaims(args: ResolveArgs): Promise<Account> {
    const bySub = await this.prisma.account.findUnique({
      where: { cognitoSub: args.cognitoSub },
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
        // First login linking flow.
        const updated = await this.prisma.account.update({
          where: { id: byEmail.id },
          data: {
            cognitoSub: args.cognitoSub,
            authProvider: 'cognito',
            emailVerifiedAt: args.emailVerified ? new Date() : byEmail.emailVerifiedAt,
            lastLoginAt: new Date(),
          },
        });
        await this.ensureUserProfile(updated);
        return updated;
      }
    }

    // New Cognito user — create local product identity with conservative defaults.
    const created = await this.prisma.account.create({
      data: {
        cognitoSub: args.cognitoSub,
        authProvider: 'cognito',
        email: args.email ?? `unknown+${args.cognitoSub}@invalid`,
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

