-- AlterTable
ALTER TABLE "instruments" ADD COLUMN     "is_self_assessable" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: clinical scales are professional-assign-only (legacy needToEvaluate).
UPDATE "instruments" SET "is_self_assessable" = false WHERE "category" = 'CLINICAL_ASSESSMENT';
