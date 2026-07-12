import { BadRequestException } from '@nestjs/common';

import { AdminService } from './admin.service';
import { UpsertInstrumentDto } from './dto/upsert-instrument.dto';

function validDto(): UpsertInstrumentDto {
  return {
    slug: 'my-scale',
    name: 'My Scale',
    category: 'PRIMARY_SCREENING' as never,
    scoringMethod: 'SUM' as never,
    questions: [
      { prompt: 'Q1', options: [ { label: 'No', value: 0, weight: 0 }, { label: 'Yes', value: 1, weight: 1 } ] },
    ],
    bands: [
      { label: 'Low', severityRank: 0, minScore: 0, maxScore: 1, recommendedAction: 'SHOW_RESULT' as never },
    ],
  } as UpsertInstrumentDto;
}

describe('AdminService instrument authoring', () => {
  it('rejects creating a scale with a duplicate slug', async () => {
    const prisma = {
      instrument: {
        findUnique: jest.fn().mockResolvedValue({ id: 'existing' }),
        create: jest.fn(),
      },
    };
    const authoring = { writeVersion: jest.fn() };
    const svc = new AdminService(prisma as never, authoring as never);

    await expect(svc.createInstrument(validDto())).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.instrument.create).not.toHaveBeenCalled();
    expect(authoring.writeVersion).not.toHaveBeenCalled();
  });

  it('rejects a band whose minScore exceeds maxScore', async () => {
    const prisma = {
      instrument: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'inst-1' }),
      },
    };
    const authoring = { writeVersion: jest.fn() };
    const svc = new AdminService(prisma as never, authoring as never);

    const dto = validDto();
    dto.bands = [{ label: 'Bad', severityRank: 0, minScore: 10, maxScore: 1, recommendedAction: 'SHOW_RESULT' as never }];

    await expect(svc.createInstrument(dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates the instrument then delegates content to the authoring service', async () => {
    const prisma = {
      instrument: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'inst-1' }),
      },
    };
    const authoring = {
      writeVersion: jest.fn().mockResolvedValue({ versionId: 'v1', versionNumber: 1, newVersionCreated: true }),
    };
    const svc = new AdminService(prisma as never, authoring as never);

    const res = await svc.createInstrument(validDto());

    expect(prisma.instrument.create).toHaveBeenCalled();
    expect(authoring.writeVersion).toHaveBeenCalledWith('inst-1', 'bn', expect.objectContaining({ scoringMethod: 'SUM' }));
    expect(res).toEqual({ id: 'inst-1', versionNumber: 1, newVersionCreated: true });
  });
});
