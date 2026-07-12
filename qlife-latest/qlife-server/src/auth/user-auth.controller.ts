import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AccountsService } from '../accounts/accounts.service';
import { Public } from './public.decorator';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/user-auth.dto';
import { WorkosService, type WorkosAuthResult } from './workos.service';

/**
 * Backend-for-frontend auth endpoints. The mobile app calls these with the
 * user's email/password/OTP; the backend brokers WorkOS and returns WorkOS
 * access + refresh tokens (which protected routes verify via WorkOS JWKS).
 */
@Controller('/v1/auth')
export class UserAuthController {
  constructor(
    private readonly workos: WorkosService,
    private readonly accounts: AccountsService,
  ) {}

  /** Register: create the WorkOS user, kick off email verification, and return
   * the pending token the client passes back with the OTP. */
  @Public()
  @Post('/register')
  async register(@Body() dto: RegisterDto) {
    let userId: string;
    try {
      const user = await this.workos.createUser(dto.email, dto.password);
      userId = user.id;
    } catch (err) {
      throw new BadRequestException(this.workosMessage(err, 'Could not create account'));
    }
    // Authenticate to obtain a pending-verification token, then send the code.
    const auth = await this.workos.authenticateWithPassword(dto.email, dto.password);
    if (auth.status === 'authenticated') {
      // Email verification disabled in WorkOS → already usable.
      const tokens = await this.linkAndTokens(auth);
      return { data: tokens };
    }
    await this.workos.sendVerificationEmail(userId);
    return {
      data: {
        status: 'verification_required',
        pendingAuthenticationToken: auth.pendingAuthenticationToken,
      },
    };
  }

  @Public()
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    let auth: WorkosAuthResult;
    try {
      auth = await this.workos.authenticateWithPassword(dto.email, dto.password);
    } catch (err) {
      throw new UnauthorizedException(this.workosMessage(err, 'Invalid email or password'));
    }
    if (auth.status === 'verification_required') {
      // Re-send the code so the client's OTP screen has a fresh one.
      const user = await this.workos.findUserByEmail(dto.email);
      if (user) await this.workos.sendVerificationEmail(user.id);
      return {
        data: {
          status: 'verification_required',
          pendingAuthenticationToken: auth.pendingAuthenticationToken,
        },
      };
    }
    return { data: await this.linkAndTokens(auth) };
  }

  @Public()
  @Post('/verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    let auth: WorkosAuthResult;
    try {
      auth = await this.workos.verifyEmail(dto.code, dto.pendingAuthenticationToken);
    } catch (err) {
      throw new BadRequestException(this.workosMessage(err, 'Invalid or expired code'));
    }
    if (auth.status !== 'authenticated') throw new BadRequestException('Verification failed');
    return { data: await this.linkAndTokens(auth) };
  }

  @Public()
  @Post('/refresh')
  async refresh(@Body() dto: RefreshDto) {
    try {
      const tokens = await this.workos.refresh(dto.refreshToken);
      return { data: tokens };
    } catch (err) {
      throw new UnauthorizedException(this.workosMessage(err, 'Session expired'));
    }
  }

  /** Emails a one-time reset code (Magic Auth). Always returns success so it
   * never reveals whether the email has an account. */
  @Public()
  @Post('/forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.workos.sendPasswordResetCode(dto.email);
    return { data: { status: 'ok' } };
  }

  /** Complete an in-app reset: verify the emailed code, set the new password,
   * and return session tokens (the user is signed in). */
  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    let auth;
    try {
      auth = await this.workos.authenticateWithResetCode(dto.email, dto.code);
    } catch (err) {
      throw new BadRequestException(this.workosMessage(err, 'Invalid or expired code'));
    }
    if (auth.status !== 'authenticated') throw new BadRequestException('Reset failed');
    await this.workos.updatePassword(auth.user.id, dto.newPassword);
    return { data: await this.linkAndTokens(auth) };
  }

  /** Change password (authenticated): verify current password, then update. */
  @Post('/change-password')
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const accountId = req.auth?.account.id;
    const workosUserId = req.auth?.identity?.sub;
    if (!accountId || !workosUserId) throw new UnauthorizedException('Unauthorized');

    const account = await this.accounts.getAccountById(accountId);
    if (!account?.email) throw new BadRequestException('Account has no email');

    const check = await this.workos.authenticateWithPassword(account.email, dto.currentPassword);
    if (check.status !== 'authenticated') {
      throw new BadRequestException('Current password is incorrect');
    }
    await this.workos.updatePassword(workosUserId, dto.newPassword);
    return { data: { status: 'ok' } };
  }

  /** Delete account: remove the WorkOS user, then soft-delete + anonymize local. */
  @Delete('/account')
  async deleteAccount(@Req() req: Request) {
    const accountId = req.auth?.account.id;
    if (!accountId) throw new UnauthorizedException('Unauthorized');
    const account = await this.accounts.getAccountById(accountId);
    if (account?.cognitoSub) {
      try {
        await this.workos.deleteUser(account.cognitoSub);
      } catch (_) {}
    }
    return { data: await this.accounts.softDeleteAccount(accountId) };
  }

  /** Link the WorkOS user to a local Account (by email) and return tokens. */
  private async linkAndTokens(auth: Extract<WorkosAuthResult, { status: 'authenticated' }>) {
    await this.accounts.resolveAccountFromWorkosClaims({
      workosUserId: auth.user.id,
      email: auth.user.email,
      emailVerified: auth.user.emailVerified,
    });
    return {
      status: 'ok',
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    };
  }

  private workosMessage(err: unknown, fallback: string): string {
    const e = err as { message?: string; rawData?: { message?: string } };
    return e?.rawData?.message || e?.message || fallback;
  }
}
