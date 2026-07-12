-- Data-only migration (no schema change). Safe on a populated production DB:
-- it only UPDATEs existing rows and does not touch assessments/answers, so it
-- avoids the re-seed FK problem. Idempotent — re-running yields the same state.

-- Item 3 — rename the Hopelessness scale (drop the "(Beck)" author tag).
UPDATE "instruments"
SET "name" = 'Hopelessness Scale',
    "name_bn" = 'হতাশা যাচাই (Hopelessness scale)'
WHERE "slug" = 'hopelessness_scale_(beck)';

-- Item 13 — WHO-5 (wellbeing-5) scoring bands.
-- Poor band (<=50%): higher severity AND escalate to the help center, no content.
UPDATE "scoring_bands" AS sb
SET "severity_rank" = 1,
    "recommended_action" = 'SHOW_HELP_CENTER'::"outcome_action",
    "recommended_content_id" = NULL
FROM "instrument_versions" AS iv
JOIN "instruments" AS i ON i."id" = iv."instrument_id"
WHERE sb."instrument_version_id" = iv."id"
  AND i."slug" = 'wellbeing-5'
  AND sb."max_score" <= 50;

-- Good band (>50%): least severe, keep the content recommendation.
UPDATE "scoring_bands" AS sb
SET "severity_rank" = 0,
    "recommended_action" = 'RECOMMEND_CONTENT'::"outcome_action"
FROM "instrument_versions" AS iv
JOIN "instruments" AS i ON i."id" = iv."instrument_id"
WHERE sb."instrument_version_id" = iv."id"
  AND i."slug" = 'wellbeing-5'
  AND sb."max_score" > 50;

-- PDF-D — remove the risk-profile screens from the user portion entirely.
UPDATE "instruments"
SET "is_self_assessable" = false
WHERE "category" = 'RISK_PROFILE'::"instrument_category";
