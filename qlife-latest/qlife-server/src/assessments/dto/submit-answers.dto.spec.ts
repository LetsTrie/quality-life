import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { SubmitAnswersDto } from './submit-answers.dto';

const Q = '11111111-1111-4111-8111-111111111111';
const O = '22222222-2222-4222-8222-222222222222';

async function errors(payload: unknown) {
  return validate(plainToInstance(SubmitAnswersDto, payload), {
    // Mirror the app's ValidationPipe so nested @Type instances are checked.
    whitelist: true,
  });
}

describe('SubmitAnswersDto', () => {
  it('accepts one or more well-formed answers', async () => {
    expect(await errors({ answers: [{ questionId: Q, selectedOptionId: O }] })).toEqual([]);
  });

  it('rejects an empty answers array (ArrayMinSize)', async () => {
    const errs = await errors({ answers: [] });
    expect(errs.map((e) => e.property)).toContain('answers');
  });

  it('rejects answers that is not an array', async () => {
    const errs = await errors({ answers: 'nope' });
    expect(errs.map((e) => e.property)).toContain('answers');
  });

  it('rejects a nested answer with a non-UUID questionId', async () => {
    const errs = await errors({ answers: [{ questionId: 'bad', selectedOptionId: O }] });
    // The failure surfaces on the nested `answers` relation.
    expect(errs.map((e) => e.property)).toContain('answers');
    expect(errs[0].children?.length ?? 0).toBeGreaterThan(0);
  });

  it('rejects a nested answer with a missing selectedOptionId', async () => {
    const errs = await errors({ answers: [{ questionId: Q }] });
    expect(errs.map((e) => e.property)).toContain('answers');
  });

  it('accepts multiple answers in one submission', async () => {
    const O2 = '33333333-3333-4333-8333-333333333333';
    expect(
      await errors({
        answers: [
          { questionId: Q, selectedOptionId: O },
          { questionId: '44444444-4444-4444-8444-444444444444', selectedOptionId: O2 },
        ],
      }),
    ).toEqual([]);
  });
});
