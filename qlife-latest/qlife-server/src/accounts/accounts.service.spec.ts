import { AccountsService } from './accounts.service';

function makePrisma(bySub: unknown, byEmail: unknown) {
  return {
    account: {
      findUnique: jest.fn(({ where }: { where: { cognitoSub?: string; email?: string } }) =>
        where.cognitoSub !== undefined ? Promise.resolve(bySub) : Promise.resolve(byEmail),
      ),
      update: jest.fn(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'acc-existing', role: 'USER', ...data }),
      ),
      create: jest.fn(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'acc-new', role: 'USER', ...data }),
      ),
    },
    userProfile: { upsert: jest.fn().mockResolvedValue({}) },
  };
}

describe('AccountsService.resolveAccountFromWorkosClaims', () => {
  it('returns the account matched by WorkOS user id (stored in cognitoSub)', async () => {
    const prisma = makePrisma({ id: 'acc-1', role: 'USER', cognitoSub: 'wos_1' }, null);
    const svc = new AccountsService(prisma as never);
    const acc = await svc.resolveAccountFromWorkosClaims({ workosUserId: 'wos_1', email: 'a@b.com' });
    expect(acc.id).toBe('acc-1');
    expect(prisma.account.update).not.toHaveBeenCalled();
    expect(prisma.account.create).not.toHaveBeenCalled();
  });

  it('relinks an existing account by email on first WorkOS sign-in', async () => {
    const prisma = makePrisma(null, { id: 'acc-existing', role: 'USER', emailVerifiedAt: null });
    const svc = new AccountsService(prisma as never);
    const acc = await svc.resolveAccountFromWorkosClaims({
      workosUserId: 'wos_2',
      email: 'a@b.com',
      emailVerified: true,
    });
    expect(prisma.account.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cognitoSub: 'wos_2', authProvider: 'workos' }),
      }),
    );
    expect(acc.id).toBe('acc-existing');
  });

  it('creates a new account for an unknown WorkOS user', async () => {
    const prisma = makePrisma(null, null);
    const svc = new AccountsService(prisma as never);
    const acc = await svc.resolveAccountFromWorkosClaims({
      workosUserId: 'wos_3',
      email: 'new@b.com',
      emailVerified: true,
    });
    expect(prisma.account.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cognitoSub: 'wos_3', authProvider: 'workos', status: 'ACTIVE' }),
      }),
    );
    expect(acc.id).toBe('acc-new');
  });
});
