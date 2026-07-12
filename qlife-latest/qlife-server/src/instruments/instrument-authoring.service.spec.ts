import { InstrumentAuthoringService, DesiredVersion } from './instrument-authoring.service';

const DESIRED: DesiredVersion = {
  scoringMethod: 'SUM' as never,
  normalizationMax: null,
  attribution: null,
  instructions: null,
  questions: [
    {
      prompt: 'Q1',
      type: 'SINGLE_CHOICE' as never,
      domain: null,
      isReverseScored: false,
      options: [
        { label: 'No', value: 0, weight: 0 },
        { label: 'Yes', value: 1, weight: 1 },
      ],
    },
  ],
  bands: [
    {
      label: 'Low',
      severityRank: 0,
      minScore: 0,
      maxScore: 0,
      colorHex: null,
      advice: null,
      recommendedAction: 'SHOW_RESULT' as never,
      recommendedContentId: null,
    },
  ],
};

// A DB version row whose content is identical to DESIRED (so fingerprints match).
function matchingCurrent() {
  return {
    id: 'v1',
    versionNumber: 1,
    scoringMethod: 'SUM',
    normalizationMax: null,
    attribution: null,
    instructions: null,
    questions: [
      {
        position: 1,
        prompt: 'Q1',
        type: 'SINGLE_CHOICE',
        domain: null,
        isReverseScored: false,
        options: [
          { position: 1, label: 'No', value: 0, weight: '0' },
          { position: 2, label: 'Yes', value: 1, weight: '1' },
        ],
      },
    ],
    scoringBands: [
      {
        position: 1,
        label: 'Low',
        severityRank: 0,
        minScore: '0',
        maxScore: '0',
        colorHex: null,
        advice: null,
        recommendedAction: 'SHOW_RESULT',
        recommendedContentId: null,
      },
    ],
  };
}

function makeTx() {
  return {
    instrumentVersion: {
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({ id: 'vNew' }),
      findFirst: jest.fn().mockResolvedValue({ versionNumber: 1 }),
    },
    answerOption: { deleteMany: jest.fn(), createMany: jest.fn() },
    question: { deleteMany: jest.fn(), createMany: jest.fn() },
    scoringBand: { deleteMany: jest.fn(), createMany: jest.fn() },
  };
}

function makePrisma(current: unknown, responseCount: number, tx: ReturnType<typeof makeTx>) {
  return {
    instrumentVersion: { findFirst: jest.fn().mockResolvedValue(current) },
    assessment: { count: jest.fn().mockResolvedValue(responseCount) },
    $transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb(tx)),
  };
}

describe('InstrumentAuthoringService.writeVersion', () => {
  it('(a) no-ops when the desired content matches the current version', async () => {
    const tx = makeTx();
    const prisma = makePrisma(matchingCurrent(), 0, tx);
    const svc = new InstrumentAuthoringService(prisma as never);

    const res = await svc.writeVersion('inst-1', 'bn', DESIRED);

    expect(res).toEqual({ versionId: 'v1', versionNumber: 1, newVersionCreated: false });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('(b) rewrites in place when the current version has no responses', async () => {
    const changed = matchingCurrent();
    changed.questions[0].prompt = 'Different prompt';
    const tx = makeTx();
    const prisma = makePrisma(changed, 0, tx);
    const svc = new InstrumentAuthoringService(prisma as never);

    const res = await svc.writeVersion('inst-1', 'bn', DESIRED);

    expect(res.newVersionCreated).toBe(false);
    expect(res.versionId).toBe('v1');
    expect(tx.instrumentVersion.update).toHaveBeenCalledTimes(1); // in-place update
    expect(tx.instrumentVersion.create).not.toHaveBeenCalled();
    expect(tx.question.createMany).toHaveBeenCalled();
  });

  it('(c) publishes a new version and retires the old when responses exist', async () => {
    const changed = matchingCurrent();
    changed.questions[0].prompt = 'Different prompt';
    const tx = makeTx();
    const prisma = makePrisma(changed, 5, tx);
    const svc = new InstrumentAuthoringService(prisma as never);

    const res = await svc.writeVersion('inst-1', 'bn', DESIRED);

    expect(res.newVersionCreated).toBe(true);
    expect(res.versionNumber).toBe(2); // latest (1) + 1
    expect(tx.instrumentVersion.create).toHaveBeenCalled();
    // The old version is retired.
    expect(tx.instrumentVersion.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RETIRED' }) }),
    );
  });

  it('(d) creates version 1 for a brand-new instrument', async () => {
    const tx = makeTx();
    tx.instrumentVersion.findFirst.mockResolvedValue(null); // no prior version
    const prisma = makePrisma(null, 0, tx);
    const svc = new InstrumentAuthoringService(prisma as never);

    const res = await svc.writeVersion('inst-new', 'bn', DESIRED);

    expect(res.newVersionCreated).toBe(true);
    expect(res.versionNumber).toBe(1);
    expect(tx.instrumentVersion.create).toHaveBeenCalled();
    expect(tx.answerOption.createMany).toHaveBeenCalled();
  });
});
