import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RequestAppointmentDto } from './request-appointment.dto';

const UUID = '11111111-1111-4111-8111-111111111111';

// Returns the set of failing property names for a candidate payload.
async function failingProps(payload: unknown): Promise<string[]> {
  const errors = await validate(plainToInstance(RequestAppointmentDto, payload));
  return errors.map((e) => e.property);
}

describe('RequestAppointmentDto', () => {
  it('accepts a minimal valid payload', async () => {
    expect(
      await failingProps({ professionalProfileId: UUID, requestedStartAt: '2026-07-01T09:00:00Z' }),
    ).toEqual([]);
  });

  it('accepts the optional message and share flag', async () => {
    expect(
      await failingProps({
        professionalProfileId: UUID,
        requestedStartAt: '2026-07-01T09:00:00Z',
        requestMessage: 'Looking forward to it',
        profileShareGranted: true,
      }),
    ).toEqual([]);
  });

  it('rejects a non-UUID professionalProfileId', async () => {
    expect(await failingProps({ professionalProfileId: 'nope', requestedStartAt: 'x' })).toContain(
      'professionalProfileId',
    );
  });

  it('rejects a missing requestedStartAt', async () => {
    expect(await failingProps({ professionalProfileId: UUID })).toContain('requestedStartAt');
  });

  it('rejects a requestMessage longer than 1000 chars', async () => {
    expect(
      await failingProps({
        professionalProfileId: UUID,
        requestedStartAt: '2026-07-01T09:00:00Z',
        requestMessage: 'a'.repeat(1001),
      }),
    ).toContain('requestMessage');
  });

  it('rejects a missing professionalProfileId', async () => {
    expect(await failingProps({ requestedStartAt: '2026-07-01T09:00:00Z' })).toContain(
      'professionalProfileId',
    );
  });

  it('rejects a non-boolean profileShareGranted', async () => {
    expect(
      await failingProps({
        professionalProfileId: UUID,
        requestedStartAt: '2026-07-01T09:00:00Z',
        profileShareGranted: 'yes',
      }),
    ).toContain('profileShareGranted');
  });
});
