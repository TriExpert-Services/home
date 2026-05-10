/*
  # Bootstrap supabase_migrations.schema_migrations

  Discovered 2026-05-09 that Supabase prod (LXC 122) was restored from a
  dump that did not include this schema. As a result every migration in
  the repo was advisory only — they were never applied automatically and
  the four hotfix migrations from PR #1 had been sitting unapplied since
  early May.

  This migration creates the standard supabase-cli ledger and backfills
  it with every migration file in the repo as of 2026-05-09. From this
  point on, automated migration runners (or a manual `INSERT ... ON
  CONFLICT DO NOTHING` after each file) can rely on this table to know
  what has and hasn't run.

  Idempotent. Safe to apply on a fresh database (creates the schema)
  and on the existing prod (no-ops because the rows already exist).
*/

CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version    text PRIMARY KEY,
  statements text[],
  name       text
);

COMMENT ON TABLE supabase_migrations.schema_migrations IS
  'Applied migrations ledger. Compatible with supabase-cli format.';

INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
  ('20250820212434', 'morning_flame'),
  ('20250820212806', 'graceful_truth'),
  ('20250821043254', 'precious_summit'),
  ('20250821044132', 'calm_scene'),
  ('20250821044346', 'small_water'),
  ('20250821044910', 'billowing_leaf'),
  ('20250821050227', 'withered_resonance'),
  ('20250823151921', 'floral_hat'),
  ('20250823161813', 'red_boat'),
  ('20250823162026', 'ancient_art'),
  ('20250823162808', 'red_ember'),
  ('20250823163457', 'solitary_butterfly'),
  ('20250823163726', 'fragrant_butterfly'),
  ('20250823165014', 'fancy_art'),
  ('20250825193038', 'crystal_sound'),
  ('20250825200207', 'rapid_base'),
  ('20250825201012', 'sunny_base'),
  ('20250825201142', 'sparkling_violet'),
  ('20250825201236', 'jolly_wind'),
  ('20250825202615', 'flat_waterfall'),
  ('20250825204116', 'shy_brook'),
  ('20251002003154', 'create_n8n_chat_configuration'),
  ('20260507000001', 'admin_helper_function'),
  ('20260507000002', 'lock_rls_critical_tables'),
  ('20260507000003', 'server_side_translation_cost'),
  ('20260509000001', 'lock_rls_tracking_tables'),
  ('20260509000002', 'bootstrap_migration_tracker')
ON CONFLICT (version) DO NOTHING;
