import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RateContentDto } from './rate-content.dto';

async function failingProps(payload: unknown): Promise<string[]> {
  const errors = await validate(plainToInstance(RateContentDto, payload));
  return errors.map((e) => e.property);
}

describe('RateContentDto', () => {
  it.each([1, 3, 5])('accepts an in-range rating (%i)', async (rating) => {
    expect(await failingProps({ rating })).toEqual([]);
  });

  it.each([0, 6, -1])('rejects an out-of-range rating (%i)', async (rating) => {
    expect(await failingProps({ rating })).toContain('rating');
  });

  it('rejects a non-integer rating', async () => {
    expect(await failingProps({ rating: 4.5 })).toContain('rating');
  });

  it('rejects a missing rating', async () => {
    expect(await failingProps({})).toContain('rating');
  });

  it('accepts an optional comment within the length limit', async () => {
    expect(await failingProps({ rating: 5, comment: 'Helpful video' })).toEqual([]);
  });

  it('rejects a comment longer than 2000 chars', async () => {
    expect(await failingProps({ rating: 5, comment: 'a'.repeat(2001) })).toContain('comment');
  });
});
