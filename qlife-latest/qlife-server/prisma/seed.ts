import { PrismaClient, ScoringMethod } from '@prisma/client';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type LegacyOption = { label: string; value: number; weight: number };
type LegacyQuestion = { question: string; options: LegacyOption[] };
type LegacyScale = {
  id: string;
  name: string;
  needToEvaluate: boolean;
  copyright?: string;
  ques: Array<{ question: string; options: LegacyOption[] }>;
  range: Array<{ min: number; max: number; severity: string }>;
};

function stableSlug(prefix: string, input: string) {
  const hash = crypto.createHash('sha256').update(input).digest('hex').slice(0, 12);
  return `${prefix}-${hash}`;
}

async function readJson<T>(absPath: string): Promise<T> {
  const raw = await readFile(absPath, 'utf8');
  return JSON.parse(raw) as T;
}

async function main() {
  const prisma = new PrismaClient();
  const seedRoot = path.join(__dirname, 'seed-data', 'legacy');
  const repoRoot = path.resolve(__dirname, '..', '..', '..');

  // --- Educational content (legacy videos.js) ---
  const videos = await readJson<Array<{ name: string; videoId: string; content_id: string; order?: number }>>(
    path.join(seedRoot, 'videos.json'),
  );

  for (const v of videos) {
    await prisma.educationalContent.upsert({
      where: { contentKey: v.content_id },
      update: {
        title: v.name,
        providerRef: v.videoId,
        displayOrder: v.order ?? 0,
      },
      create: {
        contentKey: v.content_id,
        title: v.name,
        provider: 'YOUTUBE',
        providerRef: v.videoId,
        type: 'VIDEO',
        locale: 'bn',
        displayOrder: v.order ?? 0,
        isActive: true,
      },
    });
  }

  // --- Help center resources (legacy helpCenter.js) ---
  const helpCenter = await readJson<
    Array<{
      place: string;
      location?: string;
      keywords: string[];
      contacts: Array<{ number: string; time?: string; type: string; hasToll?: boolean }>;
    }>
  >(path.join(seedRoot, 'help_center.json'));

  const topicSlugs = new Set<string>();
  for (const hc of helpCenter) for (const k of hc.keywords) topicSlugs.add(k);

  for (const slug of topicSlugs) {
    await prisma.topic.upsert({
      where: { slug },
      update: {},
      create: { slug, nameEn: slug, nameBn: slug },
    });
  }

  for (const hc of helpCenter) {
    const slug = stableSlug('hc', `${hc.place}|${hc.location ?? ''}`);
    const resource = await prisma.helpCenterResource.upsert({
      where: { slug },
      update: {
        nameBn: hc.place,
        nameEn: hc.location ?? null,
        locationNote: hc.location ?? null,
        description: null,
        isActive: true,
      },
      create: {
        slug,
        nameBn: hc.place,
        nameEn: hc.location ?? null,
        locationNote: hc.location ?? null,
        description: null,
        displayOrder: 0,
        isActive: true,
      },
    });

    // Make seeding idempotent.
    await prisma.helpCenterContact.deleteMany({ where: { resourceId: resource.id } });
    await prisma.helpResourceTopic.deleteMany({ where: { resourceId: resource.id } });

    for (const kw of hc.keywords) {
      const topic = await prisma.topic.findUnique({ where: { slug: kw } });
      if (!topic) continue;
      await prisma.helpResourceTopic.upsert({
        where: { resourceId_topicId: { resourceId: resource.id, topicId: topic.id } },
        update: {},
        create: { resourceId: resource.id, topicId: topic.id },
      });
    }

    for (const c of hc.contacts) {
      const channel =
        c.type === 'phone'
          ? 'PHONE'
          : c.type === 'whatsapp'
            ? 'WHATSAPP'
            : c.type === 'email'
              ? 'EMAIL'
              : c.type === 'website'
                ? 'WEBSITE'
                : 'HOTLINE';

      await prisma.helpCenterContact.create({
        data: {
          resourceId: resource.id,
          channel,
          value: c.number,
          availabilityNote: c.time ?? null,
          isTollFree: c.hasToll ?? false,
          displayOrder: 0,
        },
      });
    }
  }

  // --- Instruments: GHQ / PSS / ANXIETY / Intro 5Q ---
  const ghq = await readJson<{ questions: LegacyQuestion[] }>(path.join(seedRoot, 'scale_ghq.json'));
  const pss = await readJson<{ questions: LegacyQuestion[] }>(path.join(seedRoot, 'scale_pss.json'));
  const anxiety = await readJson<{ questions: LegacyQuestion[] }>(path.join(seedRoot, 'scale_anxiety.json'));
  const intro = await readJson<Array<{ question: string; options: LegacyOption[] }>>(
    path.join(seedRoot, 'mental_health_rating.json'),
  );

  const primary = [
    {
      slug: 'ghq-12',
      name: 'GHQ-12',
      category: 'PRIMARY_SCREENING' as const,
      questions: ghq.questions,
      scoring: {
        method: ScoringMethod.WEIGHTED_SUM,
        normalizationMax: null as string | null,
        bands: [
          { min: 0, max: 4, label: 'স্বাভাবিক মাত্রা' },
          { min: 5, max: 9, label: 'মাঝামাঝি মাত্রা' },
          { min: 10, max: 12, label: 'তীব্র মাত্রা' },
        ],
      },
    },
    {
      slug: 'pss-10',
      name: 'PSS-10',
      category: 'PRIMARY_SCREENING' as const,
      questions: pss.questions,
      scoring: {
        method: ScoringMethod.WEIGHTED_SUM,
        normalizationMax: null as string | null,
        bands: [
          { min: 0, max: 13, label: 'স্বাভাবিক মাত্রা' },
          { min: 14, max: 26, label: 'মাঝামাঝি মাত্রা' },
          { min: 27, max: 40, label: 'তীব্র মাত্রা' },
        ],
      },
    },
    {
      slug: 'anxiety-36',
      name: 'Anxiety Scale (36)',
      category: 'PRIMARY_SCREENING' as const,
      questions: anxiety.questions,
      scoring: {
        method: ScoringMethod.WEIGHTED_SUM,
        normalizationMax: null as string | null,
        bands: [
          { min: 0, max: 54, label: 'স্বাভাবিক মাত্রা' },
          { min: 55, max: 66, label: 'মাঝামাঝি মাত্রা' },
          { min: 67, max: 144, label: 'তীব্র মাত্রা' },
        ],
      },
    },
    {
      slug: 'wellbeing-5',
      name: 'Wellbeing Index (5)',
      category: 'WELLBEING_INDEX' as const,
      questions: intro.map((q) => ({ question: q.question, options: q.options })),
      scoring: {
        method: ScoringMethod.NORMALIZED_PERCENT,
        normalizationMax: '25',
        bands: [
          { min: 0, max: 50, label: 'উন্নতির প্রয়োজন' },
          { min: 51, max: 100, label: 'ভালো' },
        ],
      },
    },
  ];

  for (const scale of primary) {
    const instrument = await prisma.instrument.upsert({
      where: { slug: scale.slug },
      update: { name: scale.name, category: scale.category, isActive: true },
      create: { slug: scale.slug, name: scale.name, category: scale.category, isActive: true },
    });

    const version = await prisma.instrumentVersion.upsert({
      where: { instrumentId_versionNumber_locale: { instrumentId: instrument.id, versionNumber: 1, locale: 'bn' } },
      update: {
        status: 'PUBLISHED',
        scoringMethod: scale.scoring.method,
        normalizationMax: scale.scoring.normalizationMax ? scale.scoring.normalizationMax : null,
        publishedAt: new Date(),
      },
      create: {
        instrumentId: instrument.id,
        versionNumber: 1,
        locale: 'bn',
        status: 'PUBLISHED',
        scoringMethod: scale.scoring.method,
        normalizationMax: scale.scoring.normalizationMax ? scale.scoring.normalizationMax : null,
        publishedAt: new Date(),
      },
    });

    // Clear + reinsert questions/options/bands (seed is authoritative).
    await prisma.answerOption.deleteMany({ where: { question: { instrumentVersionId: version.id } } });
    await prisma.question.deleteMany({ where: { instrumentVersionId: version.id } });
    await prisma.scoringBand.deleteMany({ where: { instrumentVersionId: version.id } });

    for (let i = 0; i < scale.questions.length; i++) {
      const q = scale.questions[i]!;
      const question = await prisma.question.create({
        data: {
          instrumentVersionId: version.id,
          position: i + 1,
          prompt: q.question,
          type: 'SINGLE_CHOICE',
          isRequired: true,
        },
      });

      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j]!;
        await prisma.answerOption.create({
          data: {
            questionId: question.id,
            position: j + 1,
            label: opt.label,
            value: opt.value,
            weight: String(opt.weight),
          },
        });
      }
    }

    for (let i = 0; i < scale.scoring.bands.length; i++) {
      const b = scale.scoring.bands[i]!;
      await prisma.scoringBand.create({
        data: {
          instrumentVersionId: version.id,
          position: i + 1,
          label: b.label,
          severityRank: i,
          minScore: String(b.min),
          maxScore: String(b.max),
          recommendedAction:
            b.label === 'তীব্র মাত্রা' ? 'SHOW_HELP_CENTER_URGENT' : 'RECOMMEND_CONTENT',
        },
      });
    }
  }

  // --- Professional scales (legacy profScales.js) ---
  const professionalScales = await readJson<LegacyScale[]>(path.join(seedRoot, 'professional_scales.json'));

  for (const s of professionalScales) {
    const instrument = await prisma.instrument.upsert({
      where: { slug: s.id },
      update: { name: s.name, category: 'CLINICAL_ASSESSMENT', isActive: true },
      create: { slug: s.id, name: s.name, category: 'CLINICAL_ASSESSMENT', isActive: true },
    });

    const version = await prisma.instrumentVersion.upsert({
      where: { instrumentId_versionNumber_locale: { instrumentId: instrument.id, versionNumber: 1, locale: 'bn' } },
      update: {
        status: 'PUBLISHED',
        scoringMethod: ScoringMethod.WEIGHTED_SUM,
        attribution: s.copyright ?? null,
        publishedAt: new Date(),
      },
      create: {
        instrumentId: instrument.id,
        versionNumber: 1,
        locale: 'bn',
        status: 'PUBLISHED',
        scoringMethod: ScoringMethod.WEIGHTED_SUM,
        attribution: s.copyright ?? null,
        publishedAt: new Date(),
      },
    });

    await prisma.answerOption.deleteMany({ where: { question: { instrumentVersionId: version.id } } });
    await prisma.question.deleteMany({ where: { instrumentVersionId: version.id } });
    await prisma.scoringBand.deleteMany({ where: { instrumentVersionId: version.id } });

    for (let i = 0; i < s.ques.length; i++) {
      const q = s.ques[i]!;
      const question = await prisma.question.create({
        data: {
          instrumentVersionId: version.id,
          position: i + 1,
          prompt: q.question,
          type: 'SINGLE_CHOICE',
          isRequired: true,
        },
      });

      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j]!;
        await prisma.answerOption.create({
          data: {
            questionId: question.id,
            position: j + 1,
            label: opt.label,
            value: opt.value,
            weight: String(opt.weight),
          },
        });
      }
    }

    for (let i = 0; i < s.range.length; i++) {
      const r = s.range[i]!;
      await prisma.scoringBand.create({
        data: {
          instrumentVersionId: version.id,
          position: i + 1,
          label: r.severity,
          severityRank: i,
          minScore: String(r.min),
          maxScore: String(r.max),
          recommendedAction: 'SHOW_RESULT',
        },
      });
    }
  }

  // --- Geography reference data (legacy RegionInformation.json) ---
  // Seed a lightweight hierarchy used by user/professional profiles.
  // Legacy file is BN-only; we mirror nameBn into nameEn for now.
  const region = await readJson<{
    districts: Array<{
      districtName: string;
      subDistricts: Array<{ subDistrictName: string; unions: Array<{ unionName: string }> }>;
    }>;
  }>(path.join(repoRoot, 'frontend', 'App', 'data', 'RegionInformation.json'));

  const division = await prisma.division.upsert({
    where: { code: 'BD' },
    update: { nameBn: 'বাংলাদেশ', nameEn: 'Bangladesh' },
    create: { code: 'BD', nameBn: 'বাংলাদেশ', nameEn: 'Bangladesh' },
  });

  for (const d of region.districts ?? []) {
    const districtName = (d.districtName ?? '').trim();
    if (!districtName) continue;

    const district = await prisma.district.upsert({
      where: { code: stableSlug('dist', districtName) },
      update: { nameBn: districtName, nameEn: districtName, divisionId: division.id },
      create: {
        code: stableSlug('dist', districtName),
        nameBn: districtName,
        nameEn: districtName,
        divisionId: division.id,
      },
    });

    for (const s of d.subDistricts ?? []) {
      const upazilaName = (s.subDistrictName ?? '').trim();
      if (!upazilaName) continue;

      const upazila = await prisma.upazila.upsert({
        where: { code: stableSlug('upa', `${districtName}|${upazilaName}`) },
        update: { nameBn: upazilaName, nameEn: upazilaName, districtId: district.id },
        create: {
          code: stableSlug('upa', `${districtName}|${upazilaName}`),
          nameBn: upazilaName,
          nameEn: upazilaName,
          districtId: district.id,
        },
      });

      for (const u of s.unions ?? []) {
        const unionName = (u.unionName ?? '').trim();
        if (!unionName) continue;
        await prisma.union.upsert({
          where: { code: stableSlug('uni', `${districtName}|${upazilaName}|${unionName}`) },
          update: { nameBn: unionName, nameEn: unionName, upazilaId: upazila.id },
          create: {
            code: stableSlug('uni', `${districtName}|${upazilaName}|${unionName}`),
            nameBn: unionName,
            nameEn: unionName,
            upazilaId: upazila.id,
          },
        });
      }
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exitCode = 1;
});

