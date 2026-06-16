import type { AccountRole, AccountStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        cognito: {
          sub: string;
          email?: string;
          emailVerified?: boolean;
          issuer: string;
          audience?: string | string[];
        };
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

