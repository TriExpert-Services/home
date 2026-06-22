/*
  # Public verification details RPC

  The public verification page (VerificationPage.tsx, reached by scanning the
  QR code at /verify/<link>) used to load the full translation row with a
  direct anonymous `SELECT * FROM translation_requests`. Migration
  20260507000002_lock_rls_critical_tables.sql correctly revoked anon SELECT
  on that table, which broke the verification page for every client:

      GET /rest/v1/translation_requests  ->  401 permission denied

  This migration restores the public flow WITHOUT weakening RLS, by exposing a
  single SECURITY DEFINER function that returns the details only when the
  verification link is valid (status = 'completed' and not expired). This
  mirrors the existing `validate_verification_link` gate and the rest of the
  verification RPC family (can_leave_review, log_verification_access).

  Note: original-upload URLs (file_urls), the verification token, and internal
  flags are intentionally NOT returned — only the fields the public page shows.

  Idempotent. Safe to run on production.
*/

CREATE OR REPLACE FUNCTION public.get_verification_details(link text)
RETURNS TABLE (
  id                   uuid,
  full_name            text,
  email                text,
  phone                text,
  source_language      text,
  target_language      text,
  document_type        text,
  page_count           integer,
  processing_time      text,
  desired_format       text,
  request_date         date,
  delivery_date        timestamptz,
  translator_notes     text,
  quality_score        integer,
  translated_file_urls text[],
  status               text,
  total_cost           numeric,
  created_at           timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    tr.id,
    tr.full_name,
    tr.email,
    tr.phone,
    tr.source_language,
    tr.target_language,
    tr.document_type,
    tr.page_count,
    tr.processing_time,
    tr.desired_format,
    tr.request_date,
    tr.delivery_date,
    tr.translator_notes,
    tr.quality_score,
    tr.translated_file_urls,
    tr.status,
    tr.total_cost,
    tr.created_at
  FROM public.translation_requests tr
  WHERE tr.verification_link = link
    AND tr.status = 'completed'
    AND tr.verification_expires_at >= now();
$$;

REVOKE ALL ON FUNCTION public.get_verification_details(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_verification_details(text) TO anon, authenticated;

-- Record in the migration ledger (this project applies migrations manually;
-- see 20260509000002_bootstrap_migration_tracker.sql).
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260621000001', 'verification_details_rpc')
ON CONFLICT (version) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✅ get_verification_details(text) created and granted to anon/authenticated';
END $$;
