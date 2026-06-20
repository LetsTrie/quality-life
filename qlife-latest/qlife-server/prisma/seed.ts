import { PrismaClient, ScoringMethod, QuestionType, OutcomeAction } from '@prisma/client';
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

// --- Instrument content sync ------------------------------------------------
// InstrumentVersions are meant to be immutable once they have answered
// assessments bound to them (see schema). The seed therefore can't blindly
// delete+reinsert a version's questions/options/bands: existing
// `assessment_answers` reference `answer_options` (and `questions`) via
// onDelete: Restrict FKs, and `assessments.scoring_band_id` is SetNull, so
// wiping a referenced version either throws or silently nulls score snapshots.
//
// Instead we fingerprint the desired content and:
//   * no-op when the current published version already matches (idempotent —
//     and crucially deletes nothing, so re-seeding a DB with completed
//     assessments no longer hits assessment_answers_selected_option_id_fkey);
//   * rewrite the current version in place when content changed but nothing
//     references it yet (keeps version churn low on dev DBs);
//   * publish a NEW version (versionNumber++) and retire the old one when the
//     content changed and assessments are already bound to it.

type DesiredOption = { label: string; value: number; weight: number };
type DesiredQuestion = { prompt: string; type: QuestionType; options: DesiredOption[] };
type DesiredBand = {
  label: string;
  severityRank: number;
  minScore: number;
  maxScore: number;
  recommendedAction: OutcomeAction;
  recommendedContentId?: string | null;
};
type DesiredVersion = {
  scoringMethod: ScoringMethod;
  normalizationMax: number | null;
  attribution: string | null;
  questions: DesiredQuestion[];
  bands: DesiredBand[];
};

// Match the DB column precision (Decimal(_, 3)) so float noise / trailing-zero
// formatting can't produce spurious fingerprint mismatches.
const norm3 = (n: number) => Number(n).toFixed(3);

function fingerprint(v: DesiredVersion): string {
  const canonical = {
    scoringMethod: v.scoringMethod,
    normalizationMax: v.normalizationMax == null ? null : norm3(v.normalizationMax),
    attribution: v.attribution ?? null,
    questions: v.questions.map((q) => ({
      prompt: q.prompt,
      type: q.type,
      options: q.options.map((o) => ({ label: o.label, value: o.value, weight: norm3(o.weight) })),
    })),
    bands: v.bands.map((b) => ({
      label: b.label,
      severityRank: b.severityRank,
      minScore: norm3(b.minScore),
      maxScore: norm3(b.maxScore),
      recommendedAction: b.recommendedAction,
      recommendedContentId: b.recommendedContentId ?? null,
    })),
  };
  return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

type ExistingVersion = {
  scoringMethod: ScoringMethod;
  normalizationMax: { toString(): string } | null;
  attribution: string | null;
  questions: Array<{
    position: number;
    prompt: string;
    type: QuestionType;
    options: Array<{ position: number; label: string; value: number; weight: { toString(): string } }>;
  }>;
  scoringBands: Array<{
    position: number;
    label: string;
    severityRank: number;
    minScore: { toString(): string };
    maxScore: { toString(): string };
    recommendedAction: OutcomeAction;
    recommendedContentId: string | null;
  }>;
};

function describeExisting(version: ExistingVersion): DesiredVersion {
  return {
    scoringMethod: version.scoringMethod,
    normalizationMax: version.normalizationMax == null ? null : Number(version.normalizationMax),
    attribution: version.attribution ?? null,
    questions: [...version.questions]
      .sort((a, b) => a.position - b.position)
      .map((q) => ({
        prompt: q.prompt,
        type: q.type,
        options: [...q.options]
          .sort((a, b) => a.position - b.position)
          .map((o) => ({ label: o.label, value: o.value, weight: Number(o.weight) })),
      })),
    bands: [...version.scoringBands]
      .sort((a, b) => a.position - b.position)
      .map((b) => ({
        label: b.label,
        severityRank: b.severityRank,
        minScore: Number(b.minScore),
        maxScore: Number(b.maxScore),
        recommendedAction: b.recommendedAction,
        recommendedContentId: b.recommendedContentId ?? null,
      })),
  };
}

async function syncInstrumentVersion(
  prisma: PrismaClient,
  instrumentId: string,
  locale: string,
  desired: DesiredVersion,
): Promise<void> {
  const desiredHash = fingerprint(desired);

  // The version clients currently answer: highest published version for this locale.
  const current = await prisma.instrumentVersion.findFirst({
    where: { instrumentId, locale, status: 'PUBLISHED' },
    orderBy: { versionNumber: 'desc' },
    include: { questions: { include: { options: true } }, scoringBands: true },
  });

  if (current && fingerprint(describeExisting(current)) === desiredHash) {
    return; // Content unchanged — nothing to write, nothing to delete.
  }

  const referencingAssessments = current
    ? await prisma.assessment.count({ where: { instrumentVersionId: current.id } })
    : 0;

  let targetVersionId: string;

  if (current && referencingAssessments === 0) {
    // No assessment references this version yet → safe to rewrite in place.
    await prisma.instrumentVersion.update({
      where: { id: current.id },
      data: {
        status: 'PUBLISHED',
        scoringMethod: desired.scoringMethod,
        normalizationMax: desired.normalizationMax,
        attribution: desired.attribution,
        publishedAt: new Date(),
      },
    });
    targetVersionId = current.id;
  } else {
    // Fresh instrument, or the current version is locked by assessments →
    // publish a new immutable version and retire the previous one.
    const latest = await prisma.instrumentVersion.findFirst({
      where: { instrumentId, locale },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });
    const created = await prisma.instrumentVersion.create({
      data: {
        instrumentId,
        versionNumber: (latest?.versionNumber ?? 0) + 1,
        locale,
        status: 'PUBLISHED',
        scoringMethod: desired.scoringMethod,
        normalizationMax: desired.normalizationMax,
        attribution: desired.attribution,
        publishedAt: new Date(),
      },
    });
    targetVersionId = created.id;

    if (current) {
      await prisma.instrumentVersion.update({
        where: { id: current.id },
        data: { status: 'RETIRED', retiredAt: new Date() },
      });
    }
  }

  // (Re)write questions/options/bands for the target version. For a brand-new
  // version these deletes are no-ops; for an in-place rewrite the version has
  // no referencing assessments, so the deletes can't violate the answer FKs.
  await prisma.answerOption.deleteMany({ where: { question: { instrumentVersionId: targetVersionId } } });
  await prisma.question.deleteMany({ where: { instrumentVersionId: targetVersionId } });
  await prisma.scoringBand.deleteMany({ where: { instrumentVersionId: targetVersionId } });

  // Pre-generate question IDs so options can reference them without a round-trip
  // per row. This turns ~(1 + N options) sequential inserts into 2 bulk inserts.
  const questionRows = desired.questions.map((q, i) => ({
    id: crypto.randomUUID(),
    instrumentVersionId: targetVersionId,
    position: i + 1,
    prompt: q.prompt,
    type: q.type,
    isRequired: true,
  }));

  const optionRows = desired.questions.flatMap((q, i) =>
    q.options.map((opt, j) => ({
      questionId: questionRows[i]!.id,
      position: j + 1,
      label: opt.label,
      value: opt.value,
      weight: String(opt.weight),
    })),
  );

  const bandRows = desired.bands.map((b, i) => ({
    instrumentVersionId: targetVersionId,
    position: i + 1,
    label: b.label,
    severityRank: b.severityRank,
    minScore: String(b.minScore),
    maxScore: String(b.maxScore),
    recommendedAction: b.recommendedAction,
    recommendedContentId: b.recommendedContentId ?? null,
  }));

  if (questionRows.length) await prisma.question.createMany({ data: questionRows });
  if (optionRows.length) await prisma.answerOption.createMany({ data: optionRows });
  if (bandRows.length) await prisma.scoringBand.createMany({ data: bandRows });
}

async function main() {
  const prisma = new PrismaClient();
  const seedRoot = path.join(__dirname, 'seed-data', 'legacy');
  const repoRoot = path.resolve(__dirname, '..', '..', '..');

  const chunk = <T,>(items: T[], size: number): T[][] => {
    if (size <= 0) return [items];
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
  };

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

  // --- Help center resources ---
  const helpCenter = await readJson<
    Array<{
      slug: string;
      nameEn: string;
      nameBn: string;
      locationNote?: string | null;
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
    const resource = await prisma.helpCenterResource.upsert({
      where: { slug: hc.slug },
      update: {
        nameBn: hc.nameBn,
        nameEn: hc.nameEn ?? null,
        locationNote: hc.locationNote ?? null,
        description: null,
        isActive: true,
      },
      create: {
        slug: hc.slug,
        nameBn: hc.nameBn,
        nameEn: hc.nameEn ?? null,
        locationNote: hc.locationNote ?? null,
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

  const INSTRUMENT_NAMES_BN: Record<string, string> = {
    'ghq-12': 'সাধারণ মানসিক স্বাস্থ্য যাচাই (GHQ-12)',
    'pss-10': 'মানসিক চাপ যাচাই (PSS-10)',
    'anxiety-36': 'দুশ্চিন্তা যাচাই (৩৬টি প্রশ্ন)',
    'wellbeing-5': 'মানসিক প্রশান্তি সূচক (WHO-5)',
    'depression_scale': 'বিষণ্নতা যাচাই',
    'dhaka_university_obsessive_compulsive_scale_(duocs)': 'অবসেসিভ-কম্পালসিভ যাচাই (DUOCS)',
    'somatic_complaints_scale': 'শারীরিক অস্বস্তি যাচাই',
    'dhaka_university_cognitive_distortion_scale_(ducds)': 'চিন্তার বিকৃতি যাচাই (DUCDS)',
    'aggression_scale': 'রাগ ও আগ্রাসন যাচাই',
    'satisfaction_with_life_scale': 'জীবনে সন্তুষ্টি যাচাই',
    'hopelessness_scale_(beck)': 'হতাশা যাচাই (Beck)',
    'social_interaction_anxiety_scale': 'সামাজিক মেলামেশায় উদ্বেগ যাচাই',
    'nicotine_addiction_scale': 'নিকোটিন আসক্তি যাচাই',
    'social_avoidance_and_distress_scale': 'সামাজিক এড়িয়ে চলা ও অস্বস্তি যাচাই',
  };

  // A general coping video surfaced as the follow-up for non-severe primary
  // results (legacy SHOW_VIDEO → video list; we link one representative clip).
  const copingContent = await prisma.educationalContent.findUnique({
    where: { contentKey: 'mental_coping' },
    select: { id: true },
  });
  const copingContentId = copingContent?.id ?? null;

  for (const scale of primary) {
    const instrument = await prisma.instrument.upsert({
      where: { slug: scale.slug },
      update: { name: scale.name, nameBn: INSTRUMENT_NAMES_BN[scale.slug] ?? null, category: scale.category, isActive: true, isSelfAssessable: true },
      create: { slug: scale.slug, name: scale.name, nameBn: INSTRUMENT_NAMES_BN[scale.slug] ?? null, category: scale.category, isActive: true, isSelfAssessable: true },
    });

    await syncInstrumentVersion(prisma, instrument.id, 'bn', {
      scoringMethod: scale.scoring.method,
      normalizationMax: scale.scoring.normalizationMax ? Number(scale.scoring.normalizationMax) : null,
      attribution: null,
      questions: scale.questions.map((q) => ({
        prompt: q.question,
        type: QuestionType.SINGLE_CHOICE,
        options: q.options.map((opt) => ({ label: opt.label, value: opt.value, weight: opt.weight })),
      })),
      bands: scale.scoring.bands.map((b, i) => {
        const action =
          b.label === 'তীব্র মাত্রা'
            ? OutcomeAction.SHOW_HELP_CENTER_URGENT
            : OutcomeAction.RECOMMEND_CONTENT;
        return {
          label: b.label,
          severityRank: i,
          minScore: b.min,
          maxScore: b.max,
          recommendedAction: action,
          recommendedContentId:
            action === OutcomeAction.RECOMMEND_CONTENT ? copingContentId : null,
        };
      }),
    });
  }

  // --- Professional scales (legacy profScales.js) ---
  const professionalScales = await readJson<LegacyScale[]>(path.join(seedRoot, 'professional_scales.json'));

  for (const s of professionalScales) {
    const instrument = await prisma.instrument.upsert({
      // `needToEvaluate` (legacy) means the scale must be evaluated by a
      // professional → not self-assessable by the user.
      where: { slug: s.id },
      update: { name: s.name, nameBn: INSTRUMENT_NAMES_BN[s.id] ?? null, category: 'CLINICAL_ASSESSMENT', isActive: true, isSelfAssessable: !s.needToEvaluate },
      create: { slug: s.id, name: s.name, nameBn: INSTRUMENT_NAMES_BN[s.id] ?? null, category: 'CLINICAL_ASSESSMENT', isActive: true, isSelfAssessable: !s.needToEvaluate },
    });

    await syncInstrumentVersion(prisma, instrument.id, 'bn', {
      scoringMethod: ScoringMethod.WEIGHTED_SUM,
      normalizationMax: null,
      attribution: s.copyright ?? null,
      questions: s.ques.map((q) => ({
        prompt: q.question,
        type: QuestionType.SINGLE_CHOICE,
        options: q.options.map((opt) => ({ label: opt.label, value: opt.value, weight: opt.weight })),
      })),
      bands: s.range.map((r, i) => ({
        label: r.severity,
        severityRank: i,
        minScore: r.min,
        maxScore: r.max,
        recommendedAction: OutcomeAction.SHOW_RESULT,
      })),
    });
  }

  // --- Risk-profile self-screens (legacy profileScales) ---
  // Short yes/no screens (corona / psychotic / suicide / domestic-violence /
  // child-care). Legacy flagged risk on ANY "yes" answer (option value === 1),
  // independent of the stored weight (all weights were 0). We remap each "yes"
  // to weight 1 so the raw score = number of risk-positive answers, and band on
  // that: 0 → nothing surfaced; ≥1 → a follow-up. Routing mirrors legacy
  // `redirectTo`: suicidal ideation → URGENT help center; psychotic & domestic
  // violence → help center; corona & child-care → supportive content (SHOW_VIDEO).
  const riskProfiles: Array<{
    slug: string;
    file: string;
    nameEn: string;
    nameBn: string;
    riskAction: OutcomeAction;
    riskLabelBn: string;
  }> = [
    { slug: 'suicide-ideation', file: 'profile_suicide_ideation.json', nameEn: 'Suicidal ideation screen', nameBn: 'আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য', riskAction: OutcomeAction.SHOW_HELP_CENTER_URGENT, riskLabelBn: 'অনুগ্রহ করে এখনই সহায়তা নিন' },
    { slug: 'psychotic-profile', file: 'profile_psychotic.json', nameEn: 'Severe-symptoms screen', nameBn: 'গুরুতর সমস্যা সম্পর্কিত তথ্য', riskAction: OutcomeAction.SHOW_HELP_CENTER, riskLabelBn: 'সহায়তা নেওয়ার পরামর্শ দেওয়া হচ্ছে' },
    { slug: 'domestic-violence', file: 'profile_domestic_violence.json', nameEn: 'Domestic violence screen', nameBn: 'পারিবারিক সহিংসতা সম্পর্কিত তথ্য', riskAction: OutcomeAction.SHOW_HELP_CENTER, riskLabelBn: 'সহায়তা নেওয়ার পরামর্শ দেওয়া হচ্ছে' },
    { slug: 'corona-profile', file: 'profile_corona.json', nameEn: 'Coronavirus wellbeing screen', nameBn: 'করোনা সম্পর্কিত তথ্য', riskAction: OutcomeAction.RECOMMEND_CONTENT, riskLabelBn: 'কিছু তথ্য ও পরামর্শ দেখুন' },
    { slug: 'child-care', file: 'profile_child_care.json', nameEn: 'Child-care screen', nameBn: 'সন্তান পালন সম্পর্কিত তথ্য', riskAction: OutcomeAction.RECOMMEND_CONTENT, riskLabelBn: 'কিছু তথ্য ও পরামর্শ দেখুন' },
  ];

  for (const rp of riskProfiles) {
    const data = await readJson<{ questions: LegacyQuestion[] }>(path.join(seedRoot, rp.file));
    const numQuestions = data.questions.length;

    const instrument = await prisma.instrument.upsert({
      where: { slug: rp.slug },
      update: { name: rp.nameEn, nameBn: rp.nameBn, category: 'RISK_PROFILE', isActive: true, isSelfAssessable: true },
      create: { slug: rp.slug, name: rp.nameEn, nameBn: rp.nameBn, category: 'RISK_PROFILE', isActive: true, isSelfAssessable: true },
    });

    await syncInstrumentVersion(prisma, instrument.id, 'bn', {
      scoringMethod: ScoringMethod.SUM,
      normalizationMax: null,
      attribution: null,
      questions: data.questions.map((q) => ({
        prompt: q.question,
        type: QuestionType.SINGLE_CHOICE,
        // "yes" (value === 1) counts as 1; "no" as 0.
        options: q.options.map((opt) => ({ label: opt.label, value: opt.value, weight: opt.value === 1 ? 1 : 0 })),
      })),
      bands: [
        { label: 'উদ্বেগজনক কিছু পাওয়া যায়নি', severityRank: 0, minScore: 0, maxScore: 0, recommendedAction: OutcomeAction.SHOW_RESULT },
        { label: rp.riskLabelBn, severityRank: 1, minScore: 1, maxScore: numQuestions, recommendedAction: rp.riskAction },
      ],
    });
  }

  // --- Geography reference data (legacy RegionInformation.json) ---
  // Seed a lightweight hierarchy used by user/professional profiles.
  // Legacy file is BN-only; we mirror nameBn into nameEn for now.
  const region = await readJson<{
    districts: Array<{
      districtName: string;
      subDistricts: Array<{ subDistrictName: string; unions: Array<{ unionName: string }> }>;
    }>;
  }>(path.join(__dirname, 'seed-data', 'legacy', 'region_information.json'));

  const division = await prisma.division.upsert({
    where: { code: 'BD' },
    update: { nameBn: 'বাংলাদেশ', nameEn: 'Bangladesh' },
    create: { code: 'BD', nameBn: 'বাংলাদেশ', nameEn: 'Bangladesh' },
  });

  // Reset the geo hierarchy before re-inserting so a re-seed stays clean: the
  // codes are derived from BN names, so any name/spelling change would otherwise
  // leave stale duplicate rows behind. Profile FKs are onDelete:SetNull, so this
  // nulls out (rather than blocks) any existing profile references; the seed
  // below re-creates the canonical rows. Delete child→parent (FKs are Restrict).
  await prisma.union.deleteMany({});
  await prisma.upazila.deleteMany({});
  await prisma.district.deleteMany({});

  // This dataset can be thousands of rows; avoid per-row upserts (slow on remote DBs).
  // We insert in batches with skipDuplicates, then look up IDs by code.
  const districtsInput = (region.districts ?? [])
    .map((d) => (d.districtName ?? '').trim())
    .filter(Boolean);

  const districtRows = districtsInput.map((name) => ({
    code: stableSlug('dist', name),
    nameBn: name,
    nameEn: name,
    divisionId: division.id,
  }));

  for (const batch of chunk(districtRows, 500)) {
    await prisma.district.createMany({ data: batch, skipDuplicates: true });
  }

  const districts = await prisma.district.findMany({
    where: { code: { in: districtRows.map((d) => d.code) } },
    select: { id: true, code: true },
  });
  const districtIdByCode = new Map(districts.map((d) => [d.code, d.id]));

  const upazilaRows: Array<{ code: string; nameBn: string; nameEn: string; districtId: string }> = [];
  const unionRows: Array<{ code: string; nameBn: string; nameEn: string; upazilaCode: string }> = [];

  for (const d of region.districts ?? []) {
    const districtName = (d.districtName ?? '').trim();
    if (!districtName) continue;
    const districtCode = stableSlug('dist', districtName);
    const districtId = districtIdByCode.get(districtCode);
    if (!districtId) continue;

    for (const s of d.subDistricts ?? []) {
      const upazilaName = (s.subDistrictName ?? '').trim();
      if (!upazilaName) continue;
      const upazilaCode = stableSlug('upa', `${districtName}|${upazilaName}`);
      upazilaRows.push({
        code: upazilaCode,
        nameBn: upazilaName,
        nameEn: upazilaName,
        districtId,
      });

      for (const u of s.unions ?? []) {
        const unionName = (u.unionName ?? '').trim();
        if (!unionName) continue;
        unionRows.push({
          code: stableSlug('uni', `${districtName}|${upazilaName}|${unionName}`),
          nameBn: unionName,
          nameEn: unionName,
          upazilaCode,
        });
      }
    }
  }

  for (const batch of chunk(upazilaRows, 1000)) {
    await prisma.upazila.createMany({ data: batch, skipDuplicates: true });
  }

  const upazilas = await prisma.upazila.findMany({
    where: { code: { in: upazilaRows.map((u) => u.code) } },
    select: { id: true, code: true },
  });
  const upazilaIdByCode = new Map(upazilas.map((u) => [u.code, u.id]));

  const resolvedUnionRows = unionRows
    .map((u) => {
      const upazilaId = upazilaIdByCode.get(u.upazilaCode);
      if (!upazilaId) return null;
      return { code: u.code, nameBn: u.nameBn, nameEn: u.nameEn, upazilaId };
    })
    .filter(Boolean) as Array<{ code: string; nameBn: string; nameEn: string; upazilaId: string }>;

  for (const batch of chunk(resolvedUnionRows, 1500)) {
    await prisma.union.createMany({ data: batch, skipDuplicates: true });
  }

  // --- Clinical specialization vocabulary (legacy specAreaLists) ---
  // Extensible reference list selected during professional onboarding. The
  // legacy "অন্যান্য" (Other) option is represented by the `other` row whose
  // free-text detail is stored per-professional in `ProfessionalSpecialization.note`.
  const specializations: Array<{ slug: string; nameEn: string; nameBn: string }> = [
    { slug: 'cbt', nameEn: 'Cognitive Behavioural Therapy (CBT)', nameBn: 'কগনিটিভ বিহ্যাভিওরাল থেরাপি (সি বি টি)' },
    { slug: 'psychoanalysis', nameEn: 'Psychoanalysis', nameBn: 'সাইকো অ্যানালাইস' },
    { slug: 'transactional-analysis', nameEn: 'Transactional Analysis (TA)', nameBn: 'ট্রাঞ্জেকসনাল অ্যানালাইস (টি এ)' },
    { slug: 'emdr', nameEn: 'EMDR', nameBn: 'ই এম ডি আর' },
    { slug: 'couple-therapy', nameEn: 'Couple Therapy', nameBn: 'কাপল থেরাপি' },
    { slug: 'family-therapy', nameEn: 'Family Therapy', nameBn: 'ফ্যামিলি থেরাপি' },
    { slug: 'dbt', nameEn: 'Dialectical Behavioural Therapy (DBT)', nameBn: 'ডায়ালেকটিকাল বিহ্যাভিওরাল থেরাপি' },
    { slug: 'medicinal-treatment', nameEn: 'Medicinal Treatment', nameBn: 'মেডিসিনাল ট্রিট্মেন্ট' },
    { slug: 'other', nameEn: 'Other', nameBn: 'অন্যান্য' },
  ];
  for (const sp of specializations) {
    await prisma.specialization.upsert({
      where: { slug: sp.slug },
      update: { nameEn: sp.nameEn, nameBn: sp.nameBn },
      create: { slug: sp.slug, nameEn: sp.nameEn, nameBn: sp.nameBn },
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exitCode = 1;
});

