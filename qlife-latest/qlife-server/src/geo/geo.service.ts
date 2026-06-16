import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  async listDistricts() {
    return this.prisma.district.findMany({
      orderBy: [{ nameBn: 'asc' }],
      select: { id: true, nameBn: true },
    });
  }

  async listUpazilas(districtId: string) {
    const exists = await this.prisma.district.findUnique({ where: { id: districtId }, select: { id: true } });
    if (!exists) throw new BadRequestException('Invalid districtId');

    return this.prisma.upazila.findMany({
      where: { districtId },
      orderBy: [{ nameBn: 'asc' }],
      select: { id: true, nameBn: true },
    });
  }

  async listUnions(upazilaId: string) {
    const exists = await this.prisma.upazila.findUnique({ where: { id: upazilaId }, select: { id: true } });
    if (!exists) throw new BadRequestException('Invalid upazilaId');

    return this.prisma.union.findMany({
      where: { upazilaId },
      orderBy: [{ nameBn: 'asc' }],
      select: { id: true, nameBn: true },
    });
  }
}

