import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RegisterProfessionalDto } from './register-professional.dto';

async function failingProps(payload: unknown): Promise<string[]> {
  const errors = await validate(plainToInstance(RegisterProfessionalDto, payload));
  return errors.map((e) => e.property);
}

describe('RegisterProfessionalDto', () => {
  it('accepts a minimal valid payload', async () => {
    expect(
      await failingProps({ fullName: 'Dr. Rahman', professionType: 'PSYCHIATRIST' }),
    ).toEqual([]);
  });

  it('accepts optional gender, designation, and phone', async () => {
    expect(
      await failingProps({
        fullName: 'Dr. Rahman',
        professionType: 'CLINICAL_PSYCHOLOGIST',
        gender: 'MALE',
        designation: 'Consultant',
        phone: '+8801712345678',
      }),
    ).toEqual([]);
  });

  it('rejects a missing or too-short fullName', async () => {
    expect(await failingProps({ professionType: 'PSYCHIATRIST' })).toContain('fullName');
    expect(
      await failingProps({ fullName: 'A', professionType: 'PSYCHIATRIST' }),
    ).toContain('fullName');
  });

  it('rejects a fullName longer than 120 chars', async () => {
    expect(
      await failingProps({
        fullName: 'a'.repeat(121),
        professionType: 'PSYCHIATRIST',
      }),
    ).toContain('fullName');
  });

  it('rejects an invalid professionType', async () => {
    expect(
      await failingProps({ fullName: 'Dr. Rahman', professionType: 'THERAPIST' }),
    ).toContain('professionType');
  });

  it('rejects a phone longer than 32 chars', async () => {
    expect(
      await failingProps({
        fullName: 'Dr. Rahman',
        professionType: 'PSYCHIATRIST',
        phone: '+'.repeat(33),
      }),
    ).toContain('phone');
  });
});
