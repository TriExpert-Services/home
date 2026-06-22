/*
  # Fix translation_requests.processing_time CHECK constraint

  The original table (20250820212434_morning_flame.sql) constrained
  processing_time to ('express','standard','economy'). However the public
  TranslationForm.tsx only ever submits 'standard' or 'urgent', and the
  server-side pricing trigger (20260507000003_server_side_translation_cost.sql)
  explicitly prices 'urgent' at 1.35x — confirming 'urgent' is the intended
  value. With the original constraint still in place, every "Urgent" request
  violates the CHECK and fails to INSERT.

  This widens the constraint to the values the app actually uses, keeping the
  legacy values so historical rows remain valid. Added as NOT VALID so the
  migration applies instantly without scanning/validating existing rows
  (whatever legacy values they may hold) — new INSERT/UPDATE are still checked.

  Idempotent: drops any existing CHECK constraint that references
  processing_time before re-adding the canonical one.
*/

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.translation_requests'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%processing_time%'
  LOOP
    EXECUTE format('ALTER TABLE public.translation_requests DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.translation_requests
  ADD CONSTRAINT translation_requests_processing_time_check
  CHECK (processing_time IN ('standard', 'urgent', 'express', 'economy'))
  NOT VALID;

-- Record in the migration ledger (manual-apply project; see
-- 20260509000002_bootstrap_migration_tracker.sql).
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260621000002', 'fix_processing_time_check')
ON CONFLICT (version) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✅ processing_time CHECK now accepts standard/urgent (+legacy express/economy)';
END $$;
