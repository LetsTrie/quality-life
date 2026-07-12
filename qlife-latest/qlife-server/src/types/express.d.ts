import type { AccountRole, AccountStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        // Identity provider (WorkOS) claims for the request's token; null for
        // the self-issued admin token.
        identity: {
          sub: string;
          email?: string;
          issuer?: string;
        } | null;
        account: {
          id: string;
          role: AccountRole;
          status: AccountStatus;
        };
      };
    }
  }
}

export {};

