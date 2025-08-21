/*
  # Fix Storage Policy Conflicts
  
  ## Description
  This migration fixes the storage policy conflicts by safely removing
  existing policies and recreating them with proper names.
*/

-- ========================================
-- 1. SAFELY DROP EXISTING CONFLICTING POLICIES
-- ========================================

-- Drop existing policies that might conflict (ignore errors if they don't exist)
DO $$
BEGIN
    -- Drop policies for translated-documents bucket
    DROP POLICY IF EXISTS "Admins can upload translated documents" ON storage.objects;
    DROP POLICY IF EXISTS "Public can read translated documents" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update translated documents" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete translated documents" ON storage.objects;
    
    -- Drop policies for translation-files bucket
    DROP POLICY IF EXISTS "Cualquiera puede subir archivos" ON storage.objects;
    DROP POLICY IF EXISTS "Archivos públicamente legibles" ON storage.objects;
    DROP POLICY IF EXISTS "Usuarios pueden actualizar archivos" ON storage.objects;
    DROP POLICY IF EXISTS "Usuarios pueden eliminar archivos" ON storage.objects;
    DROP POLICY IF EXISTS "Anonymous users can upload files" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
    DROP POLICY IF EXISTS "Public can read translation files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update translation files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete translation files" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies did not exist, continuing...';
END $$;

-- ========================================
-- 2. CREATE CLEAN STORAGE POLICIES
-- ========================================

-- Policies for translation-files bucket (original uploads)
CREATE POLICY "upload_original_files"
    ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'translation-files');

CREATE POLICY "read_original_files"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'translation-files');

CREATE POLICY "update_original_files"
    ON storage.objects
    FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'translation-files');

CREATE POLICY "delete_original_files"
    ON storage.objects
    FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'translation-files');

-- Policies for translated-documents bucket (admin uploads)
CREATE POLICY "admin_upload_translated_docs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'translated-documents');

CREATE POLICY "public_read_translated_docs"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'translated-documents');

CREATE POLICY "admin_update_translated_docs"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'translated-documents');

CREATE POLICY "admin_delete_translated_docs"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'translated-documents');

-- ========================================
-- 3. VERIFY BUCKET EXISTS
-- ========================================

-- Ensure translated-documents bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'translated-documents',
    'translated-documents', 
    true,
    104857600, -- 100MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'image/webp'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Storage policies fixed successfully!';
    RAISE NOTICE '📁 Translation-files bucket policies updated';
    RAISE NOTICE '📁 Translated-documents bucket policies created';
    RAISE NOTICE '🔒 No more policy conflicts';
END $$;