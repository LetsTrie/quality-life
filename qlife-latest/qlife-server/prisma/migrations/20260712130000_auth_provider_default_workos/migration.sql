-- Auth migrated from Cognito to WorkOS. New accounts default to the WorkOS
-- provider. (The code always sets auth_provider explicitly, so this only keeps
-- the column default consistent with the schema — no data backfill needed.)
ALTER TABLE "accounts" ALTER COLUMN "auth_provider" SET DEFAULT 'workos';
