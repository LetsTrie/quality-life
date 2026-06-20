import { ForbiddenException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from './public.decorator';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// Builds an ExecutionContext whose request carries the given role (if any).
function context(role?: string): any {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({ auth: role ? { account: { role } } : undefined }),
    }),
  };
}

// A Reflector stub that returns the configured metadata per key.
function reflector(meta: { isPublic?: boolean; roles?: string[] }): Reflector {
  return {
    getAllAndOverride: (key: string) =>
      key === IS_PUBLIC_KEY ? meta.isPublic : key === ROLES_KEY ? meta.roles : undefined,
  } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows public routes regardless of role', () => {
    const guard = new RolesGuard(reflector({ isPublic: true, roles: ['ADMIN'] }));
    expect(guard.canActivate(context())).toBe(true);
  });

  it('allows when no roles are required', () => {
    const guard = new RolesGuard(reflector({ roles: [] }));
    expect(guard.canActivate(context('USER'))).toBe(true);

    const guardUndef = new RolesGuard(reflector({}));
    expect(guardUndef.canActivate(context('USER'))).toBe(true);
  });

  it('allows when the request role is in the required set', () => {
    const guard = new RolesGuard(reflector({ roles: ['ADMIN', 'PROFESSIONAL'] }));
    expect(guard.canActivate(context('PROFESSIONAL'))).toBe(true);
  });

  it('forbids when the request has no role', () => {
    const guard = new RolesGuard(reflector({ roles: ['ADMIN'] }));
    expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
  });

  it('forbids when the request role is not in the required set', () => {
    const guard = new RolesGuard(reflector({ roles: ['ADMIN'] }));
    expect(() => guard.canActivate(context('USER'))).toThrow(ForbiddenException);
  });

  it('allows public routes even when the caller has no role', () => {
    const guard = new RolesGuard(reflector({ isPublic: true, roles: ['ADMIN'] }));
    expect(guard.canActivate(context())).toBe(true);
  });
});
