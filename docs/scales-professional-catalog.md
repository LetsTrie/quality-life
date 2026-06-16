# Professional Assessment Scales — Reference Catalog

Reference data for rebuilding the professional (clinician-administered) assessment feature in the QLife app.

Source files:

- `frontend/App/data/profScales.js` — the scale definitions (questions, options, scoring ranges).
- `frontend/App/data/pro/assessmentTools/list.js` — the list of assessment tools (UUID `id` + `name`) the professional can pick from.
- `frontend/App/screens/ProfSuggestedScale.js` — the scoring logic (total weight + severity derivation).
- `backend/models/profAssessment.js` — the `ProfessionalsAssessment` model that persists `assessmentSlug`.

All scales are administered in **Bangla**; questions and (for several scales) severity labels are in Bangla in the source.

---

## 1. Data structure of `profScales.js`

`profScales.js` exports (as the **default export**) a **flat array of scale objects**. It is *not* keyed by slug/id — it is a plain `[]` and lookups are done with `data.find((d) => d.id === slug)`.

The file header documents the intended shape:

```js
export default [
  {
    id,                 // string slug, e.g. 'depression_scale' — acts as the lookup key
    name,               // English display name
    needToEvaluate,     // boolean — true for every scale in the file
    copyright,          // attribution string (author/translator); NOT in the header comment but present on every object
    ques: [             // array of question objects (note: header comment calls it `ques`,
                        //   but each object uses `options` (plural) for the choice list)
      {
        question,       // Bangla question text
        options: [      // array of choice objects
          { label,      //   Bangla option label
            value,      //   raw selected value (0/1-based, ordering varies)
            weight,     //   the score contribution used by the scoring engine
          },
        ],
      },
    ],
    range: [            // severity bands, evaluated in order
      { min, max, severity },  // if min <= totalWeight <= max → severity is selected
    ],
  },
]
```

Key notes:

- The header comment shows `ques: [{ question, option: [...] }]` (singular `option`), but the **actual data uses `options` (plural)** on every question. The scoring code reads `questions[index].options`.
- There are **no** `slug`, `stage`, or `category` fields on the objects. The `id` *is* the slug. `stage` exists only as a computed runtime value (the matched severity), not in the data.
- `value` and `weight` are independent. For normal items `value === weight`. For **reverse-scored** items the `weight` order is flipped relative to `value` (see §3).
- The `range` array is scanned top-to-bottom; the first band whose `min <= total <= max` wins. Some bands use an open-ended sentinel `max: 100000`.

---

## 2. Catalog table — every scale

10 scales are defined in `profScales.js`. The option scale column gives the number of options and the weight pattern.

| # | id (slug) | Display name (`name`) | # Questions | Option scale (weights) | Reverse-scored items |
|---|-----------|-----------------------|:-----------:|------------------------|----------------------|
| 1 | `depression_scale` | Depression Scale | 30 | 5-point, weights 1–5 (1=একেবারেই প্রযোজ্য নয় … 5=পুরোপুরি প্রযোজ্য) | none |
| 2 | `dhaka_university_obsessive_compulsive_scale_(duocs)` | Dhaka University Obsessive Compulsive Scale (DUOCS) | 20 | 5-point, weights 0–4 (0=একেবারেই নেই … 4=অনেক বেশি) | none |
| 3 | `somatic_complaints_scale` | Somatic Complaints Scale | 25 | 4-point, weights 0–3 (0=একেবারে সত্য … 3=পুরোপুরি সত্য) | yes — 4 items reversed (see §3) |
| 4 | `dhaka_university_cognitive_distortion_scale_(ducds)` | Dhaka University Cognitive Distortion Scale (DUCDS) | 40 | 5-point, weights 0–4 (0=কখনোই মনে হয় না … 4=সব সময়ই মনে হয়) | none |
| 5 | `aggression_scale` | Aggression Scale | 31 | 6-point, weights 5→0 (5=পুরোপুরি প্রযোজ্য … 0=একদমই প্রযোজ্য নয়) — note `value` 0–5 ascends while `weight` 5–0 descends | all items (weight inverse to value, by design) |
| 6 | `satisfaction_with_life_scale` | Satisfaction with life scale | 5 | 7-point, weights 7→1 (7=সম্পুর্ন ভাবে একমত … 1=সম্পূর্ণভাবে দ্বিমত) | all items (weight inverse to value, by design) |
| 7 | `hopelessness_scale_(beck)` | Hopelessness Scale (Beck) | 20 | 2-point True/False (সত্য / মিথ্যা), weights 0/1 | yes — keyed items: on ~9 items সত্য=0/মিথ্যা=1, on others সত্য=1/মিথ্যা=0 |
| 8 | `social_interaction_anxiety_scale` | Social Interaction Anxiety Scale | 20 | 5-point, weights 0–4 (মোটেই প্রযোজ্য নয় … সম্পূর্ণ প্রযোজ্য) | yes — 4 items reversed (weights 4→0) |
| 9 | `nicotine_addiction_scale` | Nicotine Addiction Scale | 6 | Mixed: Q1 & Q4 are 4-point (0–3), the other 4 are Yes/No (হ্যাঁ=1 / না=0) | n/a (mixed scoring per item) |
| 10 | `social_avoidance_and_distress_scale` | Social avoidance and distress scale | 28 | 2-point True/False (সত্য / মিথ্যা), weights 0/1 | yes — keyed items: সত্য=1/মিথ্যা=0 on some, সত্য=0/মিথ্যা=1 on others |

### Severity / scoring ranges (min/max → severity)

**1. Depression Scale** (`depression_scale`)

| min | max | severity |
|----:|----:|----------|
| 30 | 93 | Minimal |
| 94 | 100 | Depressed |
| 101 | 114 | Mild |
| 115 | 123 | Moderate |
| 124 | 150 | Severe |

**2. Dhaka University Obsessive Compulsive Scale (DUOCS)** (`dhaka_university_obsessive_compulsive_scale_(duocs)`)

| min | max | severity |
|----:|----:|----------|
| 0 | 17 | Cut-off Score |
| 18 | 23 | Mild |
| 24 | 40 | Moderate |
| 41 | 49 | Severe |
| 50 | 80 | Profound |

**3. Somatic Complaints Scale** (`somatic_complaints_scale`)

| min | max | severity |
|----:|----:|----------|
| 0 | 28 | Cut-off Score |
| 29 | 42 | Mild |
| 43 | 50 | Moderate |
| 51 | 55 | Severe |
| 56 | 72 | Profound |

**4. Dhaka University Cognitive Distortion Scale (DUCDS)** (`dhaka_university_cognitive_distortion_scale_(ducds)`)

| min | max | severity |
|----:|----:|----------|
| 0 | 55 | Cut-off Score |
| 56 | 72 | Mild |
| 73 | 91 | Moderate |
| 92 | 109 | Severe |
| 110 | 100000 | Profound |

**5. Aggression Scale** (`aggression_scale`) — Bangla severity labels

| min | max | severity (Bangla) | gloss |
|----:|----:|-------------------|-------|
| 0 | 45 | স্বাভাবিক মাত্রার ক্রোধ | Normal level of anger |
| 46 | 60 | নিম্নমাত্রার ক্রোধ | Low level of anger |
| 61 | 89 | মাঝারি মাত্রার ক্রোধ | Moderate level of anger |
| 90 | 106 | উচ্চমাত্রার ক্রোধ | High level of anger |
| 107 | 100000 | চরম মাত্রার ক্রোধ | Extreme level of anger |

**6. Satisfaction with life scale** (`satisfaction_with_life_scale`) — Bangla severity labels

| min | max | severity (Bangla) | gloss |
|----:|----:|-------------------|-------|
| 31 | 35 | চরমভাবে অথবা সম্পূর্ণভাবে সন্তুষ্ট | Extremely / completely satisfied |
| 26 | 30 | সন্তুষ্ট | Satisfied |
| 21 | 25 | কিছুটা সন্তুষ্ট | Slightly satisfied |
| 20 | 20 | নিরপেক্ষ | Neutral |
| 15 | 19 | কিছুটা অসন্তুষ্ট | Slightly dissatisfied |
| 10 | 14 | অসন্তুষ্ট | Dissatisfied |
| 5 | 9 | চরমভাবে অথবা সম্পূর্ণভাবে অসন্তুষ্ট | Extremely / completely dissatisfied |

> Note: the bands are listed high→low here (the only scale not in ascending order), but the matcher just finds the first band that contains the score, so order does not affect the result.

**7. Hopelessness Scale (Beck)** (`hopelessness_scale_(beck)`)

| min | max | severity |
|----:|----:|----------|
| 0 | 3 | None or minimal |
| 4 | 8 | Mild |
| 9 | 14 | Moderate |
| 15 | 100000 | Severe |

**8. Social Interaction Anxiety Scale** (`social_interaction_anxiety_scale`)

| min | max | severity |
|----:|----:|----------|
| 0 | 20 | Slightly |
| 21 | 40 | Moderately |
| 41 | 60 | Very Much |
| 61 | 80 | Extremely |

**9. Nicotine Addiction Scale** (`nicotine_addiction_scale`)

| min | max | severity |
|----:|----:|----------|
| 0 | 20 | Slightly |
| 21 | 40 | Moderately |
| 41 | 60 | Very Much |
| 61 | 80 | Extremely |

> Caveat: this scale's `range` is copy-pasted from the Social Interaction Anxiety Scale (bands up to 80), but the max achievable weight here is only ~11 (2×3 + 4×1). So in practice the result is always "Slightly". This looks like a data bug to fix when rebuilding.

**10. Social avoidance and distress scale** (`social_avoidance_and_distress_scale`) — Bangla severity labels

| min | max | severity (Bangla) | gloss |
|----:|----:|-------------------|-------|
| 0 | 5 | সর্বনিম্ন | Lowest / minimal |
| 6 | 15 | মধ্যম | Medium |
| 16 | 28 | সর্বোচ্চ | Highest / maximal |

---

## 3. How scoring works

Scoring is implemented in `frontend/App/screens/ProfSuggestedScale.js` (lines ~83–100). The data file holds no scoring code; it only supplies `options[].weight` and `range[]`.

Algorithm:

1. For each answered question, the engine finds the selected option **by matching the option's `label`** against the user's answer string: `questions[index].options.find((o) => o.label === answers[index])`.
2. `totalWeight += selectedOption.weight` — the running total is the **sum of selected option weights** (NOT `value`).
3. `maxWeight += Math.max(...options.map(o => o.weight))` — the maximum possible score, accumulated per question (used only for a percentage display on the result screen, not for severity).
4. Severity (`stage`) is derived by scanning `questionObject.range` in order and selecting the **first band** where `range[j].min <= totalWeight && range[j].max >= totalWeight`.
5. The result (`totalWeight`, `stage`, `maxWeight`) is POSTed to the backend and shown on `profScaleResult.js` as `তীব্রতা: {stage}` (intensity / severity).

**Reverse scoring.** Reverse-scored items are encoded directly in the data: the `weight` values run opposite to the `value` order. The scoring engine treats every item identically (it always sums `weight`), so reversal is baked into the option weights rather than computed. Examples:

- *Somatic Complaints Scale* — 4 items are reverse-keyed (একেবারে সত্য=weight 3 … পুরোপুরি সত্য=weight 0): "আমার স্বাস্থ্য ভাল।", "আমার শারীরিক অবস্থা নিয়ে আমি খুব কমই অভিযোগ করি।", "আমার যে ধরনের স্বাস্থ্য সমস্যা আছে তা বেশীরভাগ মানুষের মধ্যেই দেখা যায়।", "আমার বয়স অনুপাতে আমার স্বাস্থ্য খুবই ভালো।".
- *Social Interaction Anxiety Scale* — 4 positively-worded items reverse the weight (মোটেই প্রযোজ্য নয়=4 … সম্পূর্ণ প্রযোজ্য=0), e.g. "আমি সমবয়সীদের সাথে খুব সহজে বন্ধুত্ব করতে পারি", "আমি কোন পার্টিতে মানুষের সাথে সাক্ষাৎ করতে স্বচ্ছন্দ বোধ করি", "যে বিষয়ে বলতে হবে তা নিয়ে চিন্তা করা আমার জন্য সহজ".
- *Hopelessness Scale (Beck)* and *Social avoidance and distress scale* — each True/False item is individually keyed: on some items সত্য=1 (mark for the construct), on others মিথ্যা=1, encoded by swapping the weights on সত্য/মিথ্যা.
- *Aggression Scale* and *Satisfaction with life scale* — every item has `weight` descending while `value` ascends (i.e. the whole scale is "reverse" relative to the displayed value order); this is intentional, not per-item keying.

---

## 4. Relationship between `assessmentTools/list.js` and `profScales.js`

`assessmentTools/list.js` exports a CommonJS object `{ assessments }` where `assessments` is an array of `{ id: <UUID>, name: <string> }`. This is the **picker list** of tools a professional can suggest/assign. Its `id` is a database UUID, distinct from the `profScales.js` slug.

The link to the actual scale content goes through the backend's `assessmentSlug` field:

- Backend model `backend/models/profAssessment.js` defines `ProfessionalsAssessment` with `assessmentSlug: String` (plus `assessmentId`, `userId`, `clientId`, answers, `totalWeight`, `stage`, etc.).
- When a professional assigns a scale (`frontend/App/screens/prof/ClientProfile.js` ~L121): `const assessmentSlug = assessment.id;` — i.e. the **`assessmentSlug` is set to the `profScales.js` scale's `id` (slug)**, e.g. `"depression_scale"`. The payload is `{ userId, clientId, assessmentSlug }`.
- The backend (`backend/controllers/user-professional.js`) creates the record with that `assessmentSlug` and derives a display name via `formatSlugToTitle(assessmentSlug)`.
- On the client side, the scale's full question set is resolved back by matching the slug against the scale array:
  - `ProfSuggestedScale.js`: `data.find((d) => d.id === _assessment.assessmentSlug)`
  - `AppointmentStatus.js`: `scalesData.find((_s) => _s.id === scale.assessmentSlug)` (and filters out any scale whose slug has no matching entry).
  - `profScaleResult.js`: `data.find((d) => d.id === slug)`.

So the mapping chain is:

```
assessmentTools/list.js  (UUID id + name)   →  professional picks a tool
         ↓ (the chosen scale's profScales id, the slug, is used)
assessmentSlug  (= profScales.js `id`, e.g. "depression_scale")
         ↓ stored on ProfessionalsAssessment, then looked up
profScales.js entry  (questions, options/weights, range/severity)
```

**Important mismatch to note for the rebuild:** the two lists are not 1:1. The picker (`list.js`) and the content (`profScales.js`) overlap on most scales, but:

- `list.js` contains **"Locke-Wallace Short Marital Adjustment Test"** (UUID `df9c5472-38fd-4e52-8bc6-866fdcced9a0`), which has **no corresponding entry in `profScales.js`** — there is no `locke`/`marital` scale object. Assigning it would fail the `find(...)` lookup (the client code filters such scales out / `profScaleResult.js` throws "Question Object is missing!!").
- `list.js` also names the OCD scale "Dhaka University Obsessive Compulsive **Disorder** Scale" and the cognitive distortion scale without the "(DUCDS)" suffix, etc. — display names differ from `profScales.js` `name`/slug. The runtime link is by **slug**, not by these names. (Note: `list.js` UUIDs do not appear to be referenced for the slug lookup at all; the slug comes from the `profScales` `id`.)

`list.js` has **11 entries**; `profScales.js` has **10 scale objects**. The extra `list.js` entry is the Locke-Wallace test, which lacks scale data.

---

## 5. Active vs. disabled scales

There are **no commented-out or disabled scale objects** inside `profScales.js`. All 10 entries are present, uncommented, and every one has `needToEvaluate: true`. The `//` comments in the file are only section labels above each scale (e.g. `// Depression Scale`), not disabled code.

**Fully active scales (all 10 in `profScales.js`):**

1. Depression Scale
2. Dhaka University Obsessive Compulsive Scale (DUOCS)
3. Somatic Complaints Scale
4. Dhaka University Cognitive Distortion Scale (DUCDS)
5. Aggression Scale
6. Satisfaction with life scale
7. Hopelessness Scale (Beck)
8. Social Interaction Anxiety Scale
9. Nicotine Addiction Scale
10. Social avoidance and distress scale

**Effectively unavailable (defined in the picker but no scale data):**

- Locke-Wallace Short Marital Adjustment Test — listed in `assessmentTools/list.js` only; not implemented in `profScales.js`.

---

## Copyright / attribution (from each scale's `copyright` field)

| Scale | Attribution |
|-------|-------------|
| Depression Scale | Developed by Zahir Uddin and Dr. Mahmudur Rahman |
| DUOCS | Developed by: Md. Kamruzzaman Mozumder and Dr. Roquia Begum |
| Somatic Complaints Scale | Adapted by Hasina Khatun and M Anisur Rahman |
| DUCDS | Developed by: Ummey Saima Siddika and Kamal Uddin Ahmed Chowdhury |
| Aggression Scale | Constructed and Standardised by Km. Roma Pal, Dr. (Smt) Tasnum Naqvi |
| Satisfaction with life scale | Developed by Diener, Emmons, Larsen & Griffin |
| Hopelessness Scale (Beck) | Developed by Dr. Aaron T. Beck |
| Social Interaction Anxiety Scale | Developed by R. P. Mattick & J. C. Clark |
| Nicotine Addiction Scale | Translated by Farha Deeba and Rumala Ali |
| Social avoidance and distress scale | Translated by Farah Deeba, Shayla Arjuman, Nadira Shammi & Joha-E-Shamsia |
