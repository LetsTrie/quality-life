import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateProfessionalDto } from './update-professional.dto';

const UUID = '11111111-1111-4111-8111-111111111111';
const SPEC = '22222222-2222-4222-8222-222222222222';

async function failingProps(payload: unknown): Promise<string[]> {
  const errors = await validate(plainToInstance(UpdateProfessionalDto, payload), {
    whitelist: true,
  });
  return errors.map((e) => e.property);
}

describe('UpdateProfessionalDto', () => {
  it('accepts an empty patch (all fields optional)', async () => {
    expect(await failingProps({})).toEqual([]);
  });

  it('accepts a well-formed onboarding completion patch', async () => {
    expect(
      await failingProps({
        fullName: 'Dr. Rahman',
        feeAmount: 1500,
        feeCurrency: 'BDT',
        yearsOfExperience: 8,
        educationSummary: 'MBBS, MD Psychiatry',
        phone: '+8801712345678',
        maxWeeklyClients: 10,
        avgWeeklyClients: 6,
        isOnboardingComplete: true,
        specializations: [{ specializationId: SPEC }],
        availability: [{ weekday: 'MONDAY', startTime: '09:00', endTime: '17:00' }],
        caseloads: [{ locationLabel: 'Dhaka', clientCount: 12 }],
      }),
    ).toEqual([]);
  });

  it('rejects an invalid availability time format', async () => {
    expect(
      await failingProps({
        availability: [{ weekday: 'MON', startTime: '9am', endTime: '17:00' }],
      }),
    ).toContain('availability');
  });

  it('rejects a non-enum weekday', async () => {
    expect(
      await failingProps({
        availability: [{ weekday: 'FUNDAY', startTime: '09:00', endTime: '17:00' }],
      }),
    ).toContain('availability');
  });

  it('rejects yearsOfExperience above the cap', async () => {
    expect(await failingProps({ yearsOfExperience: 81 })).toContain('yearsOfExperience');
  });

  it('rejects a feeCurrency that is not exactly 3 chars', async () => {
    expect(await failingProps({ feeCurrency: 'BD' })).toContain('feeCurrency');
    expect(await failingProps({ feeCurrency: 'BDTT' })).toContain('feeCurrency');
  });

  it('rejects a nested specialization with a non-UUID id', async () => {
    expect(
      await failingProps({ specializations: [{ specializationId: 'bad' }] }),
    ).toContain('specializations');
  });

  it('rejects a negative caseload clientCount', async () => {
    expect(
      await failingProps({ caseloads: [{ locationLabel: 'Dhaka', clientCount: -1 }] }),
    ).toContain('caseloads');
  });

  it('rejects a non-boolean isOnboardingComplete flag', async () => {
    expect(await failingProps({ isOnboardingComplete: 'yes' })).toContain('isOnboardingComplete');
  });

  it('rejects an invalid districtId UUID', async () => {
    expect(await failingProps({ districtId: 'nope' })).toContain('districtId');
  });
});
