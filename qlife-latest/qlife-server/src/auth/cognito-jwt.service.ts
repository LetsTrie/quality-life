import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

export type CognitoClaims = JwtPayload & {
  sub: string;
  iss: string;
  aud?: string | string[];
  client_id?: string;
  token_use?: 'id' | 'access';
  scope?: string;
  email?: string;
  email_verified?: boolean;
};

@Injectable()
export class CognitoJwtService {
  private readonly pemByKid = new Map<string, { pem: string; fetchedAtMs: number }>();
  private jwksFetchedAtMs: number | null = null;
  private jwksKeys: Array<any> = [];

  private jwksUri() {
    const region = process.env.COGNITO_REGION;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (!region || !userPoolId) {
      // The service is still constructible for tests, but verification will fail.
      return 'http://invalid/.well-known/jwks.json';
    }
    return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  }

  private issuer() {
    const region = process.env.COGNITO_REGION;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (!region || !userPoolId) return '';
    return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  }

  private async refreshJwksIfNeeded() {
    const ttlMs = 60 * 60 * 1000;
    const now = Date.now();

    if (this.jwksFetchedAtMs != null && now - this.jwksFetchedAtMs < ttlMs) return;

    const uri = this.jwksUri();
    const res = await fetch(uri);
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

    const jwk = this.jwksKeys.find((k) => k.kid === kid);
    if (!jwk) {
      // JWKS may have rotated since last fetch; refresh once.
      this.jwksFetchedAtMs = null;
      await this.refreshJwksIfNeeded();
      const jwk2 = this.jwksKeys.find((k) => k.kid === kid);
      if (!jwk2) throw new UnauthorizedException('Invalid token');
      const pem2 = jwkToPem(jwk2);
      this.pemByKid.set(kid, { pem: pem2, fetchedAtMs: now });
      return pem2;
    }

    const pem = jwkToPem(jwk);
    this.pemByKid.set(kid, { pem, fetchedAtMs: now });
    return pem;
  }

  async verifyBearerToken(token: string): Promise<CognitoClaims> {
    const issuer = this.issuer();
    const audience = process.env.COGNITO_APP_CLIENT_ID;
    if (!issuer || !audience) {
      throw new UnauthorizedException('Auth not configured');
    }

    const decodedHeader = jwt.decode(token, { complete: true }) as
      | { header?: { kid?: string } }
      | null;
    const kid = decodedHeader?.header?.kid;
    if (!kid) throw new UnauthorizedException('Invalid token');

    const pem = await this.pemForKid(kid);

    const decoded = jwt.verify(token, pem, {
      algorithms: ['RS256'],
      issuer,
      audience,
    }) as CognitoClaims;

    if (!decoded?.sub) throw new UnauthorizedException('Invalid token');
    if (decoded.iss !== issuer) throw new UnauthorizedException('Invalid token');

    return decoded;
  }
}

