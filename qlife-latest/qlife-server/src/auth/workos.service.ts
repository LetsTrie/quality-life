import { Injectable, Logger } from '@nestjs/common';
import { WorkOS } from '@workos-inc/node';

/** Result of a password authentication attempt. */
export type WorkosAuthResult =
  | {
      status: 'authenticated';
      user: { id: string; email: string; emailVerified: boolean };
      accessToken: string;
      refreshToken: string;
    }
  | { status: 'verification_required'; pendingAuthenticationToken: string };

/**
 * Thin wrapper around the WorkOS User Management SDK. Centralizes credential
 * loading and the client id that every authenticate call needs, and normalizes
 * the "email verification required" branch into a discriminated result.
 *
 * The backend is the ONLY caller of WorkOS (backend-for-frontend) — the mobile
 * app talks to our own /v1/auth/* endpoints, never to WorkOS directly.
 */
@Injectable()
export class WorkosService {
  private readonly logger = new Logger(WorkosService.name);
  private readonly workos: WorkOS;
  readonly clientId: string;

  constructor() {
    const apiKey = process.env.WORKOS_API_KEY ?? '';
    this.clientId = process.env.WORKOS_CLIENT_ID ?? '';
    if (!apiKey || !this.clientId) {
      // Constructible for tests / boot without creds; calls will fail clearly.
      this.logger.warn('WORKOS_API_KEY / WORKOS_CLIENT_ID not set — auth will fail until configured.');
    }
    this.workos = new WorkOS(apiKey || 'sk_missing', { clientId: this.clientId || 'client_missing' });
  }

  /** JWKS URL for verifying access tokens (used by WorkosJwtService). */
  get jwksUrl(): string {
    return `https://api.workos.com/sso/jwks/${this.clientId}`;
  }

  async createUser(email: string, password: string) {
    return this.workos.userManagement.createUser({ email, password });
  }

  async sendVerificationEmail(userId: string) {
    await this.workos.userManagement.sendVerificationEmail({ userId });
  }

  async findUserByEmail(email: string) {
    const { data } = await this.workos.userManagement.listUsers({ email });
    return data[0] ?? null;
  }

  async authenticateWithPassword(email: string, password: string): Promise<WorkosAuthResult> {
    try {
      const res = await this.workos.userManagement.authenticateWithPassword({
        clientId: this.clientId,
        email,
        password,
      });
      return {
        status: 'authenticated',
        user: { id: res.user.id, email: res.user.email, emailVerified: res.user.emailVerified },
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      };
    } catch (err: unknown) {
      const pending = this.extractPendingToken(err);
      if (pending) return { status: 'verification_required', pendingAuthenticationToken: pending };
      throw err;
    }
  }

  async verifyEmail(code: string, pendingAuthenticationToken: string): Promise<WorkosAuthResult> {
    const res = await this.workos.userManagement.authenticateWithEmailVerification({
      clientId: this.clientId,
      code,
      pendingAuthenticationToken,
    });
    return {
      status: 'authenticated',
      user: { id: res.user.id, email: res.user.email, emailVerified: res.user.emailVerified },
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const res = await this.workos.userManagement.authenticateWithRefreshToken({
      clientId: this.clientId,
      refreshToken,
    });
    return { accessToken: res.accessToken, refreshToken: res.refreshToken };
  }

  /** Email a one-time Magic Auth code for in-app password reset. Swallows
   * unknown-email errors so callers never reveal whether an account exists. */
  async sendPasswordResetCode(email: string): Promise<void> {
    try {
      await this.workos.userManagement.createMagicAuth({ email });
    } catch (err) {
      this.logger.debug(`createMagicAuth failed (likely unknown email): ${String(err)}`);
    }
  }

  /** Verify the reset code (Magic Auth) — authenticates the user and returns
   * their id + fresh session tokens so we can set the new password and log in. */
  async authenticateWithResetCode(email: string, code: string): Promise<WorkosAuthResult> {
    const res = await this.workos.userManagement.authenticateWithMagicAuth({
      clientId: this.clientId,
      email,
      code,
    });
    return {
      status: 'authenticated',
      user: { id: res.user.id, email: res.user.email, emailVerified: res.user.emailVerified },
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
  }

  async updatePassword(userId: string, newPassword: string) {
    await this.workos.userManagement.updateUser({ userId, password: newPassword });
  }

  async deleteUser(userId: string) {
    await this.workos.userManagement.deleteUser(userId);
  }

  /** Pull the pending-authentication token out of the SDK's verification error. */
  private extractPendingToken(err: unknown): string | null {
    const e = err as {
      code?: string;
      rawData?: { code?: string; pending_authentication_token?: string };
      pendingAuthenticationToken?: string;
    };
    const isVerification =
      e?.code === 'email_verification_required' ||
      e?.rawData?.code === 'email_verification_required';
    if (!isVerification) return null;
    return e.pendingAuthenticationToken ?? e.rawData?.pending_authentication_token ?? null;
  }
}
