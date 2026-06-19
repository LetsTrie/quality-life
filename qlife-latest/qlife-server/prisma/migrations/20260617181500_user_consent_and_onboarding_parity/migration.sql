-- User onboarding consent gate (legacy StartingGuideline).
-- Existing users are grandfathered in (treated as having accepted) so the new
-- gate does not lock out accounts created before this column existed.
ALTER TABLE "user_profiles" ADD COLUMN "consent_accepted_at" TIMESTAMPTZ(6);

UPDATE "user_profiles" SET "consent_accepted_at" = now() WHERE "consent_accepted_at" IS NULL;

-- Intro well-being self-check completion (legacy lastIntroTestDate). Left NULL
-- so existing users are gently re-prompted to take it; never blocks the app.
ALTER TABLE "user_profiles" ADD COLUMN "intro_screening_completed_at" TIMESTAMPTZ(6);

-- Professional referral source (legacy `reference`, registration step 4).
ALTER TABLE "professional_profiles" ADD COLUMN "referral_source" TEXT;
