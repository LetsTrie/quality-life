-- Enforce at most ONE active appointment per (user, professional) at the DB
-- level (legacy had a unique index on {user, prof, isActive}). "Active" = an
-- open request or a live booking that hasn't been cancelled/closed.
CREATE UNIQUE INDEX IF NOT EXISTS "appointments_one_active_per_pair"
  ON "appointments" ("user_profile_id", "professional_profile_id")
  WHERE "deleted_at" IS NULL
    AND "status" IN ('REQUESTED', 'VIEWED', 'ACCEPTED', 'RESCHEDULE_PROPOSED');
