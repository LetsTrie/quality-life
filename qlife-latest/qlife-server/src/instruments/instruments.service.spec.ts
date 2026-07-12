import { InstrumentsService } from './instruments.service';

function makePrisma() {
  return {
    instrument: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
}

describe('InstrumentsService.list filters', () => {
  it('users see only self-assessable primary-screening scales (PSS/GHQ/Anxiety)', async () => {
    const prisma = makePrisma();
    const service = new InstrumentsService(prisma as never);
    await service.list({ selfAssessableOnly: true });
    expect(prisma.instrument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          isSelfAssessable: true,
          category: 'PRIMARY_SCREENING',
        }),
      }),
    );
  });

  it('professionals see only clinical-assessment scales (not GHQ/PSS/screens)', async () => {
    const prisma = makePrisma();
    const service = new InstrumentsService(prisma as never);
    await service.list({ professionalAssignableOnly: true });
    const arg = prisma.instrument.findMany.mock.calls[0][0];
    expect(arg.where).toEqual(
      expect.objectContaining({ isActive: true, category: 'CLINICAL_ASSESSMENT' }),
    );
    expect(arg.where.isSelfAssessable).toBeUndefined();
  });

  it('admins (no flags) see every active instrument', async () => {
    const prisma = makePrisma();
    const service = new InstrumentsService(prisma as never);
    await service.list();
    const arg = prisma.instrument.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ isActive: true });
  });
});
