import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const CATEGORY_LABELS: Record<string, { en: string; bn: string }> = {
  WELLBEING_INDEX: { en: 'Wellbeing index', bn: 'প্রশান্তি সূচক' },
  PRIMARY_SCREENING: { en: 'Primary screening', bn: 'প্রাথমিক যাচাই' },
  CLINICAL_ASSESSMENT: { en: 'Clinical assessment', bn: 'ক্লিনিক্যাল যাচাই' },
  RISK_PROFILE: { en: 'Risk profile', bn: 'ঝুঁকি প্রোফাইল' },
};

@Injectable()
export class InstrumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(opts?: { selfAssessableOnly?: boolean }) {
    const instruments = await this.prisma.instrument.findMany({
      where: {
        isActive: true,
        // Users only see scales they can take themselves; professionals/admins
        // see all (so they can assign the clinical, assign-only ones).
        ...(opts?.selfAssessableOnly ? { isSelfAssessable: true } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        nameBn: true,
        category: true,
        isSelfAssessable: true,
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
      nameBn: i.nameBn ?? null,
      category: i.category,
      categoryLabelEn: CATEGORY_LABELS[i.category]?.en ?? i.category,
      categoryLabelBn: CATEGORY_LABELS[i.category]?.bn ?? i.category,
      isSelfAssessable: i.isSelfAssessable,
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
        nameBn: true,
        category: true,
        isSelfAssessable: true,
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
        nameBn: instrument.nameBn ?? null,
        category: instrument.category,
        categoryLabelEn: CATEGORY_LABELS[instrument.category]?.en ?? instrument.category,
        categoryLabelBn: CATEGORY_LABELS[instrument.category]?.bn ?? instrument.category,
        isSelfAssessable: instrument.isSelfAssessable,
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

