import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccountsService } from '../accounts/accounts.service';
import { CognitoJwtService } from './cognito-jwt.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cognitoJwt: CognitoJwtService,
    private readonly accounts: AccountsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = (req.headers as any)?.authorization as string | undefined;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const claims = await this.cognitoJwt.verifyBearerToken(token);

    const account = await this.accounts.resolveAccountFromCognitoClaims({
      cognitoSub: claims.sub,
      email: claims.email,
      emailVerified: claims.email_verified,
    });

    (req as any).auth = {
      cognito: {
        sub: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified,
        issuer: claims.iss,
        audience: claims.aud,
      },
      account: {
        id: account.id,
        role: account.role,
        status: account.status,
      },
    };

    return true;
  }
}

