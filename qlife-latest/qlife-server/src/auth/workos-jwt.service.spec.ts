import { UnauthorizedException } from '@nestjs/common';

import { WorkosJwtService } from './workos-jwt.service';

describe('WorkosJwtService', () => {
  const original = process.env.WORKOS_CLIENT_ID;
  afterEach(() => {
    if (original === undefined) delete process.env.WORKOS_CLIENT_ID;
    else process.env.WORKOS_CLIENT_ID = original;
  });

  it('rejects when WorkOS is not configured', async () => {
    delete process.env.WORKOS_CLIENT_ID;
    const svc = new WorkosJwtService();
    await expect(svc.verifyBearerToken('a.b.c')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token with no key id', async () => {
    process.env.WORKOS_CLIENT_ID = 'client_test';
    const svc = new WorkosJwtService();
    // Not a real JWT → decode yields no header kid.
    await expect(svc.verifyBearerToken('not-a-jwt')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
