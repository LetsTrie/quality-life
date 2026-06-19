import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

const ISSUER = 'qlife-admin';

/**
 * Signs and verifies the self-issued admin session token. This is the
 * back-office bypass for the hardcoded admin account — it does NOT involve
 * Cognito. Tokens are HS256 (Cognito's are RS256), which lets the AuthGuard
 * tell the two apart by the `alg` header alone.
 */
@Injectable()
export class AdminTokenService {
  private secret(): string {
    const s = process.env.ADMIN_JWT_SECRET;
    if (!s) throw new Error('ADMIN_JWT_SECRET env var is not set');
    return s;
  }

  sign(payload: { accountId: string; email: string }): string {
    return jwt.sign(
      { email: payload.email, role: 'ADMIN', adm: true },
      this.secret(),
      {
        algorithm: 'HS256',
        issuer: ISSUER,
        subject: payload.accountId,
        expiresIn: '12h',
      },
    );
  }

  verify(token: string): { accountId: string; email?: string } | null {
    try {
      const decoded = jwt.verify(token, this.secret(), {
        algorithms: ['HS256'],
        issuer: ISSUER,
      }) as { sub?: string; email?: string; role?: string; adm?: boolean };

      if (!decoded?.adm || decoded.role !== 'ADMIN' || !decoded.sub) return null;
      return { accountId: decoded.sub, email: decoded.email };
    } catch {
      return null;
    }
  }
}
