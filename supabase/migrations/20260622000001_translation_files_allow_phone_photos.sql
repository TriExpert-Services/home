/*
  # Allow phone-photo / scan MIME types in the translation-files bucket

  The `translation-files` bucket (public uploads from the quote form) only
  allowed a fixed MIME list that EXCLUDED `image/heic` — the format iPhones
  produce when clients photograph their documents (and `image/tiff` scans).
  Those uploads were rejected by storage with `415 invalid_mime_type`, and
  (until the 2026-06-21 fix) the client form swallowed the error silently, so
  the files were never saved and nobody was warned.

  This widens the bucket's allowed_mime_types to include the formats real
  clients use from phones/scanners.

  NOTE: `application/octet-stream` is intentionally NOT added. This is a
  public, anon-writable bucket; allowing octet-stream would let anyone upload
  arbitrary binary content. Known extensions should instead carry their real
  content-type (handled in the form).

  Idempotent (de-duplicates the resulting array).
*/

UPDATE storage.buckets
SET allowed_mime_types = (
  SELECT array_agg(DISTINCT m)
  FROM unnest(
    COALESCE(allowed_mime_types, ARRAY[]::text[])
    || ARRAY['image/heic','image/heif','image/tiff','image/bmp']
  ) AS m
)
WHERE id = 'translation-files';

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260622000001', 'translation_files_allow_phone_photos')
ON CONFLICT (version) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✅ translation-files bucket now accepts heic/heif/tiff/bmp';
END $$;
