import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstrumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const instruments = await this.prisma.instrument.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        versions: {
          where: { status: 'PUBLISHED' },
          orderBy: [{ versionNumber: 'desc' }],
          take: 1,
          select: { id: true, versionNumber: true, locale: true },
        },
      },
    });

    return instruments.map((i) => ({
      id: i.id,
      slug: i.slug,
      name: i.name,
      category: i.category,
      latestVersion: i.versions[0] ?? null,
    }));
  }

  async getPublishedVersionBySlug(slug: string) {
    const instrument = await this.prisma.instrument.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        versions: {
          where: { status: 'PUBLISHED' },
          orderBy: [{ versionNumber: 'desc' }],
          take: 1,
          select: {
            id: true,
            versionNumber: true,
            locale: true,
            scoringMethod: true,
            normalizationMax: true,
            questions: {
              orderBy: [{ position: 'asc' }],
              select: {
                id: true,
                position: true,
                prompt: true,
                type: true,
                options: {
                  orderBy: [{ position: 'asc' }],
                  select: { id: true, position: true, label: true, value: true },
                },
              },
            },
          },
        },
      },
    });

    if (!instrument) throw new NotFoundException('Instrument not found');
    const version = instrument.versions[0];
    if (!version) throw new NotFoundException('Published version not found');

    return {
      instrument: {
        id: instrument.id,
        slug: instrument.slug,
        name: instrument.name,
        category: instrument.category,
      },
      version: {
        id: version.id,
        versionNumber: version.versionNumber,
        locale: version.locale,
        scoringMethod: version.scoringMethod,
        normalizationMax: version.normalizationMax,
        questions: version.questions,
      },
    };
  }
}

