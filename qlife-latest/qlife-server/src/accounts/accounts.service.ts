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
}

