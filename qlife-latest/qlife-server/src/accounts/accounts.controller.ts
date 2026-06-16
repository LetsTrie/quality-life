import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

import { AccountsService } from './accounts.service';

@Controller('/v1')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get('/me')
  async me(@Req() req: Request) {
    const id = req.auth?.account.id;
    if (!id) return { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } };

    const account = await this.accounts.getAccountById(id);
    return {
      account: account
        ? {
            id: account.id,
            email: account.email,
            role: account.role,
            status: account.status,
            cognitoSub: account.cognitoSub,
            authProvider: account.authProvider,
          }
        : null,
    };
  }
}

