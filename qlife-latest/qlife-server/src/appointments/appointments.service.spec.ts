import { BadRequestException } from '@nestjs/common';

import { AppointmentsService } from './appointments.service';

function baseAppt(overrides: Record<string, unknown> = {}) {
  return {
    id: 'appt-1',
    status: 'RESCHEDULE_PROPOSED',
    careRelationshipId: null,
    userProfileId: 'up-1',
    professionalProfileId: 'pp-1',
    requestMessage: null,
    scheduledStartAt: new Date('2026-07-20T10:00:00.000Z'),
    requestedStartAt: new Date('2026-07-18T10:00:00.000Z'),
    professional: { accountId: 'pro-acc', fullName: 'Dr X' },
    ...overrides,
  };
}

function makeDeps(appt: Record<string, unknown>) {
  const prisma = {
    userProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'up-1', displayName: 'Ayan' }) },
    appointment: {
      findFirst: jest.fn().mockResolvedValue(appt),
      update: jest.fn().mockImplementation(({ data }) => ({ id: 'appt-1', ...data })),
    },
    careRelationship: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'rel-1' }),
    },
  };
  const email = { sendText: jest.fn() };
  const notifications = { createLocalizedNotification: jest.fn().mockResolvedValue({ id: 'n1' }) };
  const service = new AppointmentsService(prisma as never, email as never, notifications as never);
  return { prisma, notifications, service };
}

describe('AppointmentsService.respondToRescheduleByUser', () => {
  it('ACCEPT transitions RESCHEDULE_PROPOSED → ACCEPTED and opens a care relationship', async () => {
    const { prisma, notifications, service } = makeDeps(baseAppt());
    await service.respondToRescheduleByUser({
      accountId: 'user-acc',
      appointmentId: 'appt-1',
      action: 'ACCEPT',
    });
    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACCEPTED' }) }),
    );
    // The response must carry the user's counterpart (professional) so the
    // client keeps the name + correct role view after the mutation (PDF-A).
    expect(prisma.appointment.update.mock.calls[0][0].include).toHaveProperty('professional');
    expect(prisma.careRelationship.create).toHaveBeenCalled();
    expect(notifications.createLocalizedNotification).toHaveBeenCalled();
  });

  it('COUNTER transitions to REQUESTED with the new requested time', async () => {
    const { prisma, service } = makeDeps(baseAppt());
    await service.respondToRescheduleByUser({
      accountId: 'user-acc',
      appointmentId: 'appt-1',
      action: 'COUNTER',
      requestedStartAt: '2026-07-25T09:00:00.000Z',
    });
    const data = prisma.appointment.update.mock.calls[0][0].data;
    expect(data.status).toBe('REQUESTED');
    expect((data.requestedStartAt as Date).toISOString()).toBe('2026-07-25T09:00:00.000Z');
  });

  it('COUNTER without a new time is rejected', async () => {
    const { service } = makeDeps(baseAppt());
    await expect(
      service.respondToRescheduleByUser({ accountId: 'user-acc', appointmentId: 'appt-1', action: 'COUNTER' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cannot respond unless a reschedule was proposed', async () => {
    const { service } = makeDeps(baseAppt({ status: 'REQUESTED' }));
    await expect(
      service.respondToRescheduleByUser({ accountId: 'user-acc', appointmentId: 'appt-1', action: 'ACCEPT' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
