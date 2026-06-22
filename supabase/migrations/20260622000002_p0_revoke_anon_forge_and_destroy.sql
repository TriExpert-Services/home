/*
  # P0 security (batch 1, non-breaking): stop anon order-forgery and document destruction

  Two active holes the 2026-05 RLS hardening never closed (it only touched
  tables, never functions or storage):

  1. admin_update_translation_with_files() is SECURITY DEFINER and was
     `GRANT EXECUTE ... TO anon` (20250821044910:153) — any anonymous visitor
     could flip status to 'completed', append translated_file_urls and forge a
     "verified certified translation" by guessing a request UUID. The frontend
     does NOT use it (the admin panel updates rows directly under is_admin RLS),
     so revoking is safe.

  2. translation-files had anon UPDATE and DELETE policies
     (20250821044346: update_original_files / delete_original_files, TO anon) —
     any anonymous visitor could overwrite or DELETE clients' uploaded
     passports/IDs.

  This revokes #1 and removes anon UPDATE/DELETE on storage, recreating those
  operations for authenticated (admin) only. It deliberately KEEPS anon INSERT
  (the public quote form) and does NOT yet flip the buckets to private —
  private buckets + signed URLs is the next batch (it rewrites existing stored
  URLs and needs an edge function + backfill).

  Idempotent.
*/

-- 1) Revoke the forge-able SECURITY DEFINER RPC from all client roles.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'admin_update_translation_with_files'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.admin_update_translation_with_files(uuid, text[], text, integer) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.admin_update_translation_with_files(uuid, text[], text, integer) FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.admin_update_translation_with_files(uuid, text[], text, integer) FROM public;
  END IF;
END $$;

-- 2) Remove anon UPDATE/DELETE on client originals; keep admin (authenticated) able to manage.
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

DROP POLICY IF EXISTS "update_original_files" ON storage.objects;
DROP POLICY IF EXISTS "delete_original_files" ON storage.objects;

CREATE POLICY "auth_update_original_files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'translation-files')
  WITH CHECK (bucket_id = 'translation-files');

CREATE POLICY "auth_delete_original_files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'translation-files');

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260622000002', 'p0_revoke_anon_forge_and_destroy')
ON CONFLICT (version) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '🔒 Revoked anon EXECUTE on admin_update_translation_with_files; removed anon UPDATE/DELETE on translation-files (anon INSERT kept).';
END $$;
