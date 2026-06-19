import { Body, Controller, InternalServerErrorException, Post, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AccountsService } from '../accounts/accounts.service';
import { AdminTokenService } from '../auth/admin-token.service';
import { Public } from '../auth/public.decorator';
import { AdminLoginDto } from './dto/admin-login.dto';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new InternalServerErrorException(`${name} env var is not set`);
  return value;
}

@Controller('/v1/admin')
export class AdminAuthController {
  constructor(
    private readonly accounts: AccountsService,
    private readonly adminToken: AdminTokenService,
  ) {}

  // 5 attempts per 15 minutes per IP — brute-force protection.
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @Public()
  @Post('/login')
  async login(@Body() body: AdminLoginDto) {
    const adminEmail = requireEnv('ADMIN_EMAIL');
    const adminPassword = requireEnv('ADMIN_PASSWORD');

    const email = body.email.trim().toLowerCase();
    if (email !== adminEmail.toLowerCase() || body.password !== adminPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const account = await this.accounts.getOrCreateAdminAccount(adminEmail);
    const token = this.adminToken.sign({ accountId: account.id, email: account.email });

    return { data: { token, email: account.email } };
  }
}
