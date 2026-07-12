import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import type { Request } from 'express';

import { AccountsService } from './accounts.service';

class UpdatePreferencesDto {
  @IsString()
  @IsIn(['bn', 'en'])
  preferredLocale!: string;
}

@Controller('/v1')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  // Persist the caller's preferred language (drives notification language).
  @Patch('/me/preferences')
  async updatePreferences(@Req() req: Request, @Body() dto: UpdatePreferencesDto) {
    const id = req.auth?.account.id;
    if (!id) throw new UnauthorizedException('Unauthorized');
    return { data: await this.accounts.setPreferredLocale(id, dto.preferredLocale) };
  }

  // Self-deactivate (recoverable).
  @Post('/me/deactivate')
  async deactivate(@Req() req: Request) {
    const id = req.auth?.account.id;
    if (!id) throw new UnauthorizedException('Unauthorized');
    return { data: await this.accounts.deactivate(id) };
  }

  // Self-delete (soft-delete + anonymize PII).
  @Delete('/me')
  async remove(@Req() req: Request) {
    const id = req.auth?.account.id;
    if (!id) throw new UnauthorizedException('Unauthorized');
    return { data: await this.accounts.softDeleteAccount(id) };
  }

  @Get('/me')
  async me(@Req() req: Request) {
    const id = req.auth?.account.id;
    if (!id) throw new UnauthorizedException('Unauthorized');

    const account = await this.accounts.getAccountById(id);
    return {
      data: {
        account: account
          ? {
              id: account.id,
              email: account.email,
              role: account.role,
              status: account.status,
              authProvider: account.authProvider,
            }
          : null,
      },
    };
  }
}

