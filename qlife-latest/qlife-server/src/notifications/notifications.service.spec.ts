import { NotificationsService } from './notifications.service';

function makePrisma() {
  return {
    notification: {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      count: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    deviceToken: {
      upsert: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    account: {
      findUnique: jest.fn(),
    },
  };
}

function makePush() {
  return {
    sendToAccount: jest.fn().mockResolvedValue(undefined),
  };
}

function makeRealtime() {
  return {
    emitToAccount: jest.fn(),
  };
}

describe('NotificationsService', () => {
  it('upserts a device token keyed by the token value', async () => {
    const prisma = makePrisma();
    const push = makePush();
    const realtime = makeRealtime();
    const service = new NotificationsService(prisma as never, push as never, realtime as never);

    await service.upsertDeviceToken('acc-1', 'fcm-token-xyz', 'ANDROID');

    expect(prisma.deviceToken.upsert).toHaveBeenCalledWith({
      where: { token: 'fcm-token-xyz' },
      create: { accountId: 'acc-1', token: 'fcm-token-xyz', platform: 'ANDROID' },
      update: { accountId: 'acc-1', platform: 'ANDROID' },
    });
  });

  it('creates an in-app notification and dispatches a push', async () => {
    const prisma = makePrisma();
    const push = makePush();
    const realtime = makeRealtime();
    const service = new NotificationsService(prisma as never, push as never, realtime as never);

    const result = await service.createInAppNotification({
      recipientAccountId: 'acc-1',
      senderAccountId: 'acc-2',
      type: 'APPOINTMENT_REQUESTED',
      title: 'New appointment request',
      body: 'A client has requested an appointment with you.',
      appointmentId: 'appt-1',
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recipientAccountId: 'acc-1',
        senderAccountId: 'acc-2',
        type: 'APPOINTMENT_REQUESTED',
        channel: 'IN_APP',
        appointmentId: 'appt-1',
      }),
    });
    expect(push.sendToAccount).toHaveBeenCalledWith({
      accountId: 'acc-1',
      title: 'New appointment request',
      body: 'A client has requested an appointment with you.',
      data: expect.objectContaining({
        notificationId: 'notif-1',
        type: 'APPOINTMENT_REQUESTED',
        appointmentId: 'appt-1',
      }),
    });
    // Realtime fanout fires alongside push, into the recipient's account room.
    expect(realtime.emitToAccount).toHaveBeenCalledWith(
      'acc-1',
      'notification',
      expect.objectContaining({ notificationId: 'notif-1', appointmentId: 'appt-1' }),
    );
    expect(result).toEqual({ id: 'notif-1' });
  });

  it('still returns the notification when push delivery throws', async () => {
    const prisma = makePrisma();
    const push = makePush();
    const realtime = makeRealtime();
    push.sendToAccount.mockRejectedValue(new Error('FCM down'));
    const service = new NotificationsService(prisma as never, push as never, realtime as never);

    const result = await service.createInAppNotification({
      recipientAccountId: 'acc-1',
      type: 'SYSTEM',
      title: 'Hello',
      body: 'World',
    });

    expect(result).toEqual({ id: 'notif-1' });
  });

  it('sends the Bangla pair when the recipient prefers Bangla (default)', async () => {
    const prisma = makePrisma();
    const push = makePush();
    const realtime = makeRealtime();
    prisma.account.findUnique.mockResolvedValue({ preferredLocale: 'bn' });
    const service = new NotificationsService(prisma as never, push as never, realtime as never);

    await service.createLocalizedNotification({
      recipientAccountId: 'acc-1',
      type: 'APPOINTMENT_CANCELLED',
      bn: { title: 'বাতিল', body: 'ক্লায়েন্ট বাতিল করেছেন' },
      en: { title: 'Cancelled', body: 'A client cancelled' },
      appointmentId: 'appt-1',
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'বাতিল', body: 'ক্লায়েন্ট বাতিল করেছেন' }),
    });
  });

  it('sends the English pair when the recipient prefers English', async () => {
    const prisma = makePrisma();
    const push = makePush();
    const realtime = makeRealtime();
    prisma.account.findUnique.mockResolvedValue({ preferredLocale: 'en' });
    const service = new NotificationsService(prisma as never, push as never, realtime as never);

    await service.createLocalizedNotification({
      recipientAccountId: 'acc-1',
      type: 'APPOINTMENT_CANCELLED',
      bn: { title: 'বাতিল', body: 'ক্লায়েন্ট বাতিল করেছেন' },
      en: { title: 'Cancelled', body: 'A client cancelled' },
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'Cancelled', body: 'A client cancelled' }),
    });
  });

  it('defaults to Bangla when the account has no explicit preference', async () => {
    const prisma = makePrisma();
    const push = makePush();
    const realtime = makeRealtime();
    prisma.account.findUnique.mockResolvedValue(null);
    const service = new NotificationsService(prisma as never, push as never, realtime as never);

    await service.createLocalizedNotification({
      recipientAccountId: 'acc-1',
      type: 'ASSESSMENT_COMPLETED',
      bn: { title: 'সম্পন্ন', body: 'শেষ' },
      en: { title: 'Done', body: 'Finished' },
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'সম্পন্ন' }),
    });
  });

  it('removes a device token scoped to the caller account', async () => {
    const prisma = makePrisma();
    const push = makePush();
    const realtime = makeRealtime();
    const service = new NotificationsService(prisma as never, push as never, realtime as never);

    await service.removeDeviceToken('acc-1', 'fcm-token-xyz');

    expect(prisma.deviceToken.deleteMany).toHaveBeenCalledWith({
      where: { token: 'fcm-token-xyz', accountId: 'acc-1' },
    });
  });
});
