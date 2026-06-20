import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { AccountsService } from '../accounts/accounts.service';
import { AdminTokenService } from './admin-token.service';
import { CognitoJwtService } from './cognito-jwt.service';

/// Canonical auth context resolved from a bearer token. The single source of
/// truth shared by the HTTP [AuthGuard] and the realtime gateway handshake, so
/// the two authentication paths can never drift apart.
export interface AuthContext {
  account: { id: string; role: string; status: string };
  cognito: {
    sub: string;
    email?: string;
    emailVerified?: boolean;
    issuer?: string;
    audience?: string | string[];
  } | null;
  /// Token expiry as epoch seconds, when present on the token (drives socket
  /// disconnect-at-expiry).
  expiresAt?: number;
}

@Injectable()
export class AuthContextResolver {
  constructor(
    private readonly cognitoJwt: CognitoJwtService,
    private readonly adminToken: AdminTokenService,
    private readonly accounts: AccountsService,
  ) {}

  /// Resolves a bearer token string to a canonical auth context. Throws
  /// [UnauthorizedException] when the token is missing or invalid.
  async resolve(token: string | undefined | null): Promise<AuthContext> {
    const t = token?.trim();
    if (!t) throw new UnauthorizedException('Missing bearer token');

    const decoded = jwt.decode(t, { complete: true }) as
      | { header?: { alg?: string }; payload?: { exp?: number } }
      | null;
    const tokenExp = decoded?.payload?.exp;

    // Self-issued admin tokens are HS256; Cognito tokens are RS256. Branch on
    // the alg header so the hardcoded admin session bypasses Cognito entirely.
    if (decoded?.header?.alg === 'HS256') {
      const admin = this.adminToken.verify(t);
      if (!admin) throw new UnauthorizedException('Invalid token');
      return {
        account: { id: admin.accountId, role: 'ADMIN', status: 'ACTIVE' },
        cognito: null,
        expiresAt: tokenExp,
      };
    }

    const claims = await this.cognitoJwt.verifyBearerToken(t);
    const account = await this.accounts.resolveAccountFromCognitoClaims({
      cognitoSub: claims.sub,
      email: claims.email,
      emailVerified: claims.email_verified,
    });

    return {
      account: { id: account.id, role: account.role, status: account.status },
      cognito: {
        sub: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified,
        issuer: claims.iss,
        audience: claims.aud,
      },
      expiresAt: claims.exp ?? tokenExp,
    };
  }
}
