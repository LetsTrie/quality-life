const mockSendEachForMulticast = jest.fn();
const mockInitializeApp = jest.fn(() => ({ name: 'test-app' }));
const mockCert = jest.fn((sa: unknown) => ({ sa }));
const mockMessaging = jest.fn(() => ({ sendEachForMulticast: mockSendEachForMulticast }));
let mockAppsState: unknown[] = [];

jest.mock('firebase-admin', () => ({
  get apps() {
    return mockAppsState;
  },
  initializeApp: mockInitializeApp,
  credential: { cert: mockCert },
  messaging: mockMessaging,
}));

import { PushService } from './push.service';

type PrismaMock = {
  deviceToken: {
    findMany: jest.Mock;
    deleteMany: jest.Mock;
  };
};

function makePrisma(): PrismaMock {
  return {
    deviceToken: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
}

// Minimal valid service account encoded as base64.
const SERVICE_ACCOUNT = {
  type: 'service_account',
  project_id: 'qlife-test',
  private_key: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n',
  client_email: 'test@qlife-test.iam.gserviceaccount.com',
};
const VALID_B64 = Buffer.from(JSON.stringify(SERVICE_ACCOUNT)).toString('base64');

describe('PushService', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAppsState = [];
    delete process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('stays disabled when no credentials are configured', async () => {
    const prisma = makePrisma();
    const service = new PushService(prisma as never);
    service.onModuleInit();

    expect(service.isEnabled()).toBe(false);
    await service.sendToAccount({ accountId: 'a1', title: 't', body: 'b' });
    expect(prisma.deviceToken.findMany).not.toHaveBeenCalled();
    expect(mockSendEachForMulticast).not.toHaveBeenCalled();
  });

  it('initializes from base64 credentials', () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_B64 = VALID_B64;
    const service = new PushService(makePrisma() as never);
    service.onModuleInit();

    expect(service.isEnabled()).toBe(true);
    expect(mockCert).toHaveBeenCalledWith(
      expect.objectContaining({ project_id: 'qlife-test' }),
      expect.anything(),
    );
  });

  it('initializes from raw JSON credentials as a fallback', () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify(SERVICE_ACCOUNT);
    const service = new PushService(makePrisma() as never);
    service.onModuleInit();

    expect(service.isEnabled()).toBe(true);
  });

  it('sends to all device tokens for an account', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_B64 = VALID_B64;
    const prisma = makePrisma();
    prisma.deviceToken.findMany.mockResolvedValue([
      { token: 'tok-1' },
      { token: 'tok-2' },
    ]);
    mockSendEachForMulticast.mockResolvedValue({
      responses: [{ success: true }, { success: true }],
    });

    const service = new PushService(prisma as never);
    service.onModuleInit();
    await service.sendToAccount({
      accountId: 'acc-1',
      title: 'New appointment',
      body: 'A client requested a session.',
      data: { type: 'APPOINTMENT_REQUESTED' },
    });

    expect(mockSendEachForMulticast).toHaveBeenCalledTimes(1);
    const payload = mockSendEachForMulticast.mock.calls[0][0];
    expect(payload.tokens).toEqual(['tok-1', 'tok-2']);
    // Data-only: no `notification` key (so the OS never auto-renders on a
    // logged-out device), title/body carried in `data`, no server-built channel.
    expect(payload.notification).toBeUndefined();
    expect(payload.data).toEqual({
      type: 'APPOINTMENT_REQUESTED',
      title: 'New appointment',
      body: 'A client requested a session.',
    });
    expect(payload.android.priority).toBe('high');
    expect(payload.android.notification).toBeUndefined();
  });

  it('prunes tokens that FCM reports as unregistered', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_B64 = VALID_B64;
    const prisma = makePrisma();
    prisma.deviceToken.findMany.mockResolvedValue([
      { token: 'good' },
      { token: 'stale' },
    ]);
    mockSendEachForMulticast.mockResolvedValue({
      responses: [
        { success: true },
        {
          success: false,
          error: { code: 'messaging/registration-token-not-registered' },
        },
      ],
    });

    const service = new PushService(prisma as never);
    service.onModuleInit();
    await service.sendToAccount({ accountId: 'acc-1', title: 't', body: 'b' });

    expect(mockSendEachForMulticast).toHaveBeenCalledTimes(1);
    expect(prisma.deviceToken.deleteMany).toHaveBeenCalledWith({
      where: { token: { in: ['stale'] } },
    });
  });

  it('does not call FCM when the account has no tokens', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_B64 = VALID_B64;
    const prisma = makePrisma();
    prisma.deviceToken.findMany.mockResolvedValue([]);

    const service = new PushService(prisma as never);
    service.onModuleInit();
    await service.sendToAccount({ accountId: 'acc-1', title: 't', body: 'b' });

    expect(mockSendEachForMulticast).not.toHaveBeenCalled();
  });
});
