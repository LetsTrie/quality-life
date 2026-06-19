import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async listHotlines(slug?: string) {
    const where = slug
      ? {
          isActive: true,
          topics: {
            some: {
              topic: {
                slug: { in: ['general', slug] },
              },
            },
          },
        }
      : { isActive: true };

    const resources = await this.prisma.helpCenterResource.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        nameBn: true,
        nameEn: true,
        locationNote: true,
        contacts: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            channel: true,
            value: true,
            availabilityNote: true,
            isTollFree: true,
          },
        },
      },
    });

    return resources;
  }
}
