import { BadRequestException } from '@nestjs/common';

import { AssessmentsService } from './assessments.service';

// A 2-question version; each question has one valid option.
function assessmentFixture(status = 'ASSIGNED') {
  return {
    id: 'a-1',
    status,
    subject: { accountId: 'user-acc', displayName: 'Ayan' },
    subjectUserProfileId: 'up-1',
    assignedByProfessionalId: null,
    startedAt: null,
    instrumentVersion: {
      id: 'v-1',
      scoringMethod: 'WEIGHTED_SUM',
      normalizationMax: null,
      instrument: { category: 'CLINICAL_ASSESSMENT' },
      questions: [
        { id: 'q1', options: [{ id: 'q1o1', weight: 1 }] },
        { id: 'q2', options: [{ id: 'q2o1', weight: 1 }] },
      ],
      scoringBands: [],
    },
  };
}

function makeService(assessment: unknown) {
  const prisma = {
    assessment: {
      findUnique: jest.fn().mockResolvedValue(assessment),
      update: jest.fn().mockResolvedValue({ id: 'a-1', status: 'COMPLETED', scoringBand: null }),
    },
    assessmentAnswer: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({}),
    },
    userProfile: { updateMany: jest.fn() },
  };
  const service = new AssessmentsService(
    prisma as never,
    {} as never,
    { sendText: jest.fn() } as never,
    { createLocalizedNotification: jest.fn() } as never,
  );
  return { prisma, service };
}

describe('AssessmentsService.submitAnswers completeness guard', () => {
  it('rejects a submission missing an answer for a question', async () => {
    const { service } = makeService(assessmentFixture());
    await expect(
      service.submitAnswers({
        accountId: 'user-acc',
        assessmentId: 'a-1',
        answers: [{ questionId: 'q1', selectedOptionId: 'q1o1' }], // q2 unanswered
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicate answers that do not cover every question', async () => {
    const { service } = makeService(assessmentFixture());
    await expect(
      service.submitAnswers({
        accountId: 'user-acc',
        assessmentId: 'a-1',
        answers: [
          { questionId: 'q1', selectedOptionId: 'q1o1' },
          { questionId: 'q1', selectedOptionId: 'q1o1' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a fully-answered submission', async () => {
    const { prisma, service } = makeService(assessmentFixture());
    await service.submitAnswers({
      accountId: 'user-acc',
      assessmentId: 'a-1',
      answers: [
        { questionId: 'q1', selectedOptionId: 'q1o1' },
        { questionId: 'q2', selectedOptionId: 'q2o1' },
      ],
    });
    expect(prisma.assessment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED' }) }),
    );
  });
});
