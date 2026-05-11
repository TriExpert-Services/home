/*
  # Storage RLS policies

  storage.objects had RLS enabled but ZERO policies — so every write
  was denied by Postgres (admin uploads in DocumentManagement hit a
  "new row violates row-level security policy" error).

  Reads through the public URL still worked because storage's
  /object/public/... endpoint bypasses RLS by design, but signed/listed
  reads through supabase-js were also denied.

  This migration introduces a small policy set:

  ┌────────────────────┬──────────┬─────────────────────────────────┐
  │ bucket             │ public?  │ allowed actions                  │
  ├────────────────────┼──────────┼─────────────────────────────────┤
  │ translation-files  │ yes      │ anon INSERT (translation form)   │
  │                    │          │ admin SELECT/UPDATE/DELETE       │
  │ translated-documents│ yes     │ admin SELECT/INSERT/UPDATE/DELETE│
  │ whatsapp-documents │ yes      │ admin SELECT/INSERT/UPDATE/DELETE│
  └────────────────────┴──────────┴─────────────────────────────────┘

  All admin gates use the canonical `public.is_admin()` helper from
  migration 20260507000001.

  Idempotent.
*/

-- =====================================================================
-- translation-files: public form uploads + admin manage
-- =====================================================================

DROP POLICY IF EXISTS "translation_files_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "translation_files_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "translation_files_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "translation_files_admin_delete" ON storage.objects;

-- The public translation form uploads here as anon. The total cost is
-- recomputed server-side (migration 20260507000003), so a hostile
-- anon-key user can't manipulate prices via the upload path.
CREATE POLICY "translation_files_public_insert"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'translation-files');

CREATE POLICY "translation_files_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'translation-files' AND public.is_admin());

CREATE POLICY "translation_files_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'translation-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'translation-files' AND public.is_admin());

CREATE POLICY "translation_files_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'translation-files' AND public.is_admin());

-- =====================================================================
-- translated-documents: admin-only writes (this was THE bug)
-- =====================================================================

DROP POLICY IF EXISTS "translated_docs_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "translated_docs_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "translated_docs_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "translated_docs_admin_delete" ON storage.objects;

CREATE POLICY "translated_docs_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'translated-documents' AND public.is_admin());

CREATE POLICY "translated_docs_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'translated-documents' AND public.is_admin());

CREATE POLICY "translated_docs_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'translated-documents' AND public.is_admin())
  WITH CHECK (bucket_id = 'translated-documents' AND public.is_admin());

CREATE POLICY "translated_docs_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'translated-documents' AND public.is_admin());

-- =====================================================================
-- whatsapp-documents: admin-only writes (same pattern)
-- =====================================================================

DROP POLICY IF EXISTS "whatsapp_docs_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "whatsapp_docs_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "whatsapp_docs_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "whatsapp_docs_admin_delete" ON storage.objects;

CREATE POLICY "whatsapp_docs_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'whatsapp-documents' AND public.is_admin());

CREATE POLICY "whatsapp_docs_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'whatsapp-documents' AND public.is_admin());

CREATE POLICY "whatsapp_docs_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'whatsapp-documents' AND public.is_admin())
  WITH CHECK (bucket_id = 'whatsapp-documents' AND public.is_admin());

CREATE POLICY "whatsapp_docs_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'whatsapp-documents' AND public.is_admin());

-- service_role bypasses RLS by default, so n8n/edge functions calling
-- with the service role key (e.g. whatsapp-files inserts coming from the
-- bot pipeline) continue to work without an explicit policy.

DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies installed (3 buckets × 4 actions = 13 policies)';
END $$;
