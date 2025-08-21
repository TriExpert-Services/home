/*
  # Document Management and Verification System
  
  ## Description
  This migration adds complete document management functionality:
  
  1. New Fields for Translation Requests
     - translated_file_urls: Array of translated document URLs
     - verification_link: Unique link for public verification
     - translator_notes: Notes from the translator
     - quality_score: Quality rating (1-5)
     - delivery_date: When translation was completed
     
  2. New Table: Translation Verifications
     - Public verification logs
     - Track who accessed verification links
     - Download tracking
     
  3. Storage Policies
     - New bucket for translated documents
     - Public read access for verified translations
     - Admin upload permissions
     
  4. Functions
     - Generate unique verification links
     - Track verification access
*/

-- ========================================
-- 1. ADD NEW FIELDS TO TRANSLATION_REQUESTS
-- ========================================

-- Add new columns for document management
ALTER TABLE public.translation_requests 
ADD COLUMN IF NOT EXISTS translated_file_urls text[],
ADD COLUMN IF NOT EXISTS verification_link text UNIQUE,
ADD COLUMN IF NOT EXISTS translator_notes text,
ADD COLUMN IF NOT EXISTS quality_score integer CHECK (quality_score >= 1 AND quality_score <= 5),
ADD COLUMN IF NOT EXISTS delivery_date timestamptz,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz;

-- Create index for verification links
CREATE INDEX IF NOT EXISTS idx_translation_requests_verification_link 
ON public.translation_requests(verification_link);

-- ========================================
-- 2. CREATE VERIFICATION LOGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.translation_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    -- Reference to translation
    translation_request_id uuid REFERENCES public.translation_requests(id) ON DELETE CASCADE,
    
    -- Verification details
    verification_link text NOT NULL,
    accessed_at timestamptz DEFAULT now(),
    ip_address inet,
    user_agent text,
    
    -- Access type
    access_type text DEFAULT 'view' CHECK (access_type IN ('view', 'download')),
    downloaded_file text,
    
    -- Verification status
    is_valid_access boolean DEFAULT true,
    
    -- Metadata
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translation_verifications_request_id 
ON public.translation_verifications(translation_request_id);
CREATE INDEX IF NOT EXISTS idx_translation_verifications_link 
ON public.translation_verifications(verification_link);
CREATE INDEX IF NOT EXISTS idx_translation_verifications_accessed_at 
ON public.translation_verifications(accessed_at DESC);

-- ========================================
-- 3. CREATE STORAGE BUCKET FOR TRANSLATED DOCUMENTS
-- ========================================

-- Create bucket for translated documents
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
-- 4. CONFIGURE STORAGE POLICIES FOR TRANSLATED DOCUMENTS
-- ========================================

-- Policy: Authenticated users (admins) can upload translated files
CREATE POLICY "Admins can upload translated documents"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'translated-documents');

-- Policy: Anyone can read translated files (for verification)
CREATE POLICY "Public can read translated documents"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'translated-documents');

-- Policy: Admins can update translated files
CREATE POLICY "Admins can update translated documents"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'translated-documents');

-- Policy: Admins can delete translated files
CREATE POLICY "Admins can delete translated documents"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'translated-documents');

-- ========================================
-- 5. CREATE FUNCTION TO GENERATE VERIFICATION LINKS
-- ========================================

CREATE OR REPLACE FUNCTION generate_verification_link(request_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    verification_token text;
    verification_url text;
BEGIN
    -- Generate a unique token (combination of random string and timestamp)
    verification_token := encode(gen_random_bytes(16), 'hex') || '-' || extract(epoch from now())::bigint;
    
    -- Update the request with the verification link
    UPDATE public.translation_requests 
    SET 
        verification_link = verification_token,
        verification_expires_at = now() + interval '30 days',
        is_verified = true
    WHERE id = request_id;
    
    RETURN verification_token;
END;
$$;

-- ========================================
-- 6. CREATE FUNCTION TO VALIDATE VERIFICATION LINKS
-- ========================================

CREATE OR REPLACE FUNCTION validate_verification_link(link text)
RETURNS TABLE (
    is_valid boolean,
    request_id uuid,
    full_name text,
    status text,
    expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN tr.verification_link IS NULL THEN false
            WHEN tr.verification_expires_at < now() THEN false
            WHEN tr.status != 'completed' THEN false
            ELSE true
        END as is_valid,
        tr.id as request_id,
        tr.full_name,
        tr.status,
        tr.verification_expires_at as expires_at
    FROM public.translation_requests tr
    WHERE tr.verification_link = link;
END;
$$;

-- ========================================
-- 7. CREATE FUNCTION TO LOG VERIFICATION ACCESS
-- ========================================

CREATE OR REPLACE FUNCTION log_verification_access(
    p_verification_link text,
    p_access_type text DEFAULT 'view',
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL,
    p_downloaded_file text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_record RECORD;
BEGIN
    -- Get the translation request
    SELECT id INTO request_record
    FROM public.translation_requests 
    WHERE verification_link = p_verification_link;
    
    -- Insert verification log
    IF request_record.id IS NOT NULL THEN
        INSERT INTO public.translation_verifications (
            translation_request_id,
            verification_link,
            access_type,
            ip_address,
            user_agent,
            downloaded_file,
            is_valid_access
        ) VALUES (
            request_record.id,
            p_verification_link,
            p_access_type,
            p_ip_address,
            p_user_agent,
            p_downloaded_file,
            true
        );
    END IF;
END;
$$;

-- ========================================
-- 8. CREATE TRIGGER FOR UPDATED_AT ON VERIFICATIONS
-- ========================================

CREATE TRIGGER update_translation_verifications_updated_at
    BEFORE UPDATE ON public.translation_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. SETUP RLS POLICIES FOR NEW TABLES
-- ========================================

-- Enable RLS on verifications table
ALTER TABLE public.translation_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert verification logs (for public access tracking)
CREATE POLICY "Anyone can log verification access"
    ON public.translation_verifications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Admins can read all verification logs
CREATE POLICY "Admins can read verification logs"
    ON public.translation_verifications
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Service role can do everything on verifications
CREATE POLICY "Service role can manage verification logs"
    ON public.translation_verifications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 10. CREATE VIEW FOR ADMIN DASHBOARD
-- ========================================

CREATE OR REPLACE VIEW public.translation_admin_view AS
SELECT 
    tr.*,
    COALESCE(array_length(tr.translated_file_urls, 1), 0) as translated_files_count,
    CASE 
        WHEN tr.verification_link IS NOT NULL AND tr.verification_expires_at > now() THEN 'active'
        WHEN tr.verification_link IS NOT NULL AND tr.verification_expires_at <= now() THEN 'expired'
        ELSE 'none'
    END as verification_status,
    (
        SELECT COUNT(*) 
        FROM public.translation_verifications tv 
        WHERE tv.translation_request_id = tr.id
    ) as verification_access_count
FROM public.translation_requests tr;

-- Grant access to the view
GRANT SELECT ON public.translation_admin_view TO authenticated;

-- ========================================
-- 11. UPDATE EXISTING REQUESTS WITH VERIFICATION LINKS (OPTIONAL)
-- ========================================

-- Generate verification links for completed requests that don't have them
UPDATE public.translation_requests 
SET 
    verification_link = encode(gen_random_bytes(16), 'hex') || '-' || extract(epoch from now())::bigint,
    verification_expires_at = now() + interval '30 days',
    is_verified = true
WHERE status = 'completed' 
AND verification_link IS NULL;

-- ========================================
-- 12. GRANTS AND PERMISSIONS
-- ========================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.translation_verifications TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_verification_link(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_verification_link(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_verification_access(text, text, inet, text, text) TO anon, authenticated;

-- ========================================
-- VERIFICATION AND SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Document Management System installed successfully!';
    RAISE NOTICE '📁 New bucket: translated-documents created';
    RAISE NOTICE '🔗 Verification links system ready';
    RAISE NOTICE '📊 Admin view and functions created';
    RAISE NOTICE '🔒 RLS policies configured';
    RAISE NOTICE '🚀 System ready for document management';
END $$;