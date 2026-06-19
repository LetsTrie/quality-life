import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpecializationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.specialization.findMany({
      orderBy: [{ nameEn: 'asc' }],
      select: { id: true, slug: true, nameEn: true, nameBn: true },
    });
  }
}
