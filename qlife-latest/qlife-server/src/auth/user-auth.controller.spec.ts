import { UserAuthController } from './user-auth.controller';

function makeDeps() {
  const workos = {
    createUser: jest.fn().mockResolvedValue({ id: 'wos_1', email: 'a@b.com' }),
    authenticateWithPassword: jest.fn(),
    verifyEmail: jest.fn(),
    refresh: jest.fn(),
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    findUserByEmail: jest.fn().mockResolvedValue({ id: 'wos_1' }),
    sendPasswordResetCode: jest.fn().mockResolvedValue(undefined),
    authenticateWithResetCode: jest.fn(),
    updatePassword: jest.fn().mockResolvedValue(undefined),
  };
  const accounts = {
    resolveAccountFromWorkosClaims: jest.fn().mockResolvedValue({ id: 'acc_1' }),
    getAccountById: jest.fn(),
    softDeleteAccount: jest.fn(),
  };
  const ctrl = new UserAuthController(workos as never, accounts as never);
  return { workos, accounts, ctrl };
}

const AUTHED = {
  status: 'authenticated' as const,
  user: { id: 'wos_1', email: 'a@b.com', emailVerified: true },
  accessToken: 'access.jwt',
  refreshToken: 'refresh.tok',
};

describe('UserAuthController', () => {
  it('login returns tokens and links the account', async () => {
    const { workos, accounts, ctrl } = makeDeps();
    workos.authenticateWithPassword.mockResolvedValue(AUTHED);
    const res = await ctrl.login({ email: 'a@b.com', password: 'pw' });
    expect(res.data).toEqual({ status: 'ok', accessToken: 'access.jwt', refreshToken: 'refresh.tok' });
    expect(accounts.resolveAccountFromWorkosClaims).toHaveBeenCalledWith(
      expect.objectContaining({ workosUserId: 'wos_1', email: 'a@b.com' }),
    );
  });

  it('login returns a pending token + resends code when email unverified', async () => {
    const { workos, ctrl } = makeDeps();
    workos.authenticateWithPassword.mockResolvedValue({
      status: 'verification_required',
      pendingAuthenticationToken: 'pat_123',
    });
    const res = await ctrl.login({ email: 'a@b.com', password: 'pw' });
    expect(res.data).toEqual({ status: 'verification_required', pendingAuthenticationToken: 'pat_123' });
    expect(workos.sendVerificationEmail).toHaveBeenCalledWith('wos_1');
  });

  it('register creates the user and returns a pending token', async () => {
    const { workos, ctrl } = makeDeps();
    workos.authenticateWithPassword.mockResolvedValue({
      status: 'verification_required',
      pendingAuthenticationToken: 'pat_reg',
    });
    const res = await ctrl.register({ email: 'a@b.com', password: 'password1' });
    expect(workos.createUser).toHaveBeenCalledWith('a@b.com', 'password1');
    expect(res.data).toEqual({ status: 'verification_required', pendingAuthenticationToken: 'pat_reg' });
  });

  it('verify-email exchanges the code for tokens', async () => {
    const { workos, ctrl } = makeDeps();
    workos.verifyEmail.mockResolvedValue(AUTHED);
    const res = await ctrl.verifyEmail({ code: '123456', pendingAuthenticationToken: 'pat' });
    expect(res.data).toMatchObject({ status: 'ok', accessToken: 'access.jwt' });
  });

  it('refresh proxies to WorkOS', async () => {
    const { workos, ctrl } = makeDeps();
    workos.refresh.mockResolvedValue({ accessToken: 'a2', refreshToken: 'r2' });
    const res = await ctrl.refresh({ refreshToken: 'r1' });
    expect(res.data).toEqual({ accessToken: 'a2', refreshToken: 'r2' });
  });

  it('forgot-password emails a reset code and always returns ok', async () => {
    const { workos, ctrl } = makeDeps();
    const res = await ctrl.forgotPassword({ email: 'a@b.com' });
    expect(res.data).toEqual({ status: 'ok' });
    expect(workos.sendPasswordResetCode).toHaveBeenCalledWith('a@b.com');
  });

  it('reset-password verifies the code, sets the new password, and returns tokens', async () => {
    const { workos, ctrl } = makeDeps();
    workos.authenticateWithResetCode.mockResolvedValue(AUTHED);
    const res = await ctrl.resetPassword({ email: 'a@b.com', code: '123456', newPassword: 'newpass12' });
    expect(workos.authenticateWithResetCode).toHaveBeenCalledWith('a@b.com', '123456');
    expect(workos.updatePassword).toHaveBeenCalledWith('wos_1', 'newpass12');
    expect(res.data).toMatchObject({ status: 'ok', accessToken: 'access.jwt' });
  });
});
