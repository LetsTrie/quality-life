import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

export type WorkosClaims = JwtPayload & {
  sub: string;
  sid?: string;
  iss?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  org_id?: string;
};

/**
 * Verifies WorkOS User Management access tokens (RS256) against the WorkOS
 * JWKS. Mirrors the previous Cognito verifier's JWKS-fetch + per-kid PEM cache
 * with rotation fallback; only the JWKS URL differs and there is no audience
 * (WorkOS access tokens carry no `aud`). Signature validity alone proves the
 * token was issued by WorkOS.
 */
@Injectable()
export class WorkosJwtService {
  private readonly pemByKid = new Map<string, { pem: string; fetchedAtMs: number }>();
  private jwksFetchedAtMs: number | null = null;
  private jwksKeys: Array<any> = [];

  private jwksUri() {
    const clientId = process.env.WORKOS_CLIENT_ID;
    if (!clientId) return 'http://invalid/.well-known/jwks.json';
    return `https://api.workos.com/sso/jwks/${clientId}`;
  }

  private async refreshJwksIfNeeded() {
    const ttlMs = 60 * 60 * 1000;
    const now = Date.now();
    if (this.jwksFetchedAtMs != null && now - this.jwksFetchedAtMs < ttlMs) return;

    const res = await fetch(this.jwksUri());
    if (!res.ok) throw new UnauthorizedException('Invalid token');

    const body = (await res.json()) as { keys?: any[] };
    this.jwksKeys = Array.isArray(body.keys) ? body.keys : [];
    this.jwksFetchedAtMs = now;
  }

  private async pemForKid(kid: string): Promise<string> {
    const ttlMs = 60 * 60 * 1000;
    const now = Date.now();

    const cached = this.pemByKid.get(kid);
    if (cached && now - cached.fetchedAtMs < ttlMs) return cached.pem;

    await this.refreshJwksIfNeeded();

    let jwk = this.jwksKeys.find((k) => k.kid === kid);
    if (!jwk) {
      // JWKS may have rotated since last fetch; refresh once.
      this.jwksFetchedAtMs = null;
      await this.refreshJwksIfNeeded();
      jwk = this.jwksKeys.find((k) => k.kid === kid);
      if (!jwk) throw new UnauthorizedException('Invalid token');
    }

    const pem = jwkToPem(jwk);
    this.pemByKid.set(kid, { pem, fetchedAtMs: now });
    return pem;
  }

  async verifyBearerToken(token: string): Promise<WorkosClaims> {
    if (!process.env.WORKOS_CLIENT_ID) {
      throw new UnauthorizedException('Auth not configured');
    }

    const decodedHeader = jwt.decode(token, { complete: true }) as
      | { header?: { kid?: string } }
      | null;
    const kid = decodedHeader?.header?.kid;
    if (!kid) throw new UnauthorizedException('Invalid token');

    const pem = await this.pemForKid(kid);

    const decoded = jwt.verify(token, pem, { algorithms: ['RS256'] }) as WorkosClaims;
    if (!decoded?.sub) throw new UnauthorizedException('Invalid token');

    return decoded;
  }
}
