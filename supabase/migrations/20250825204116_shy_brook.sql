/*
  # Fix Blog Posts Category Constraint and Rich Content
  
  ## Description
  This migration fixes the blog post saving errors by:
  
  1. Fixing category constraint to include all valid categories
  2. Adding missing fields for rich content support
  3. Ensuring proper RLS policies for blog management
*/

-- ========================================
-- 1. DROP EXISTING CHECK CONSTRAINT
-- ========================================

ALTER TABLE public.blog_posts 
DROP CONSTRAINT IF EXISTS blog_posts_category_check;

-- ========================================
-- 2. ADD NEW CHECK CONSTRAINT WITH ALL CATEGORIES
-- ========================================

ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_category_check 
CHECK (category IN (
    'ai',
    'automation', 
    'consulting',
    'security',
    'cloud',
    'development',
    'data',
    'translations',
    'technology',
    'business',
    'trends'
));

-- ========================================
-- 3. ADD MISSING RICH CONTENT FIELDS
-- ========================================

-- Add rich content support fields if they don't exist
DO $$
BEGIN
    -- Add content_type field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'content_type'
    ) THEN
        ALTER TABLE public.blog_posts 
        ADD COLUMN content_type text DEFAULT 'html' CHECK (content_type IN ('text', 'html', 'markdown'));
    END IF;
    
    -- Add featured_video_url field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'featured_video_url'
    ) THEN
        ALTER TABLE public.blog_posts 
        ADD COLUMN featured_video_url text;
    END IF;
    
    -- Add allow_html field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'allow_html'
    ) THEN
        ALTER TABLE public.blog_posts 
        ADD COLUMN allow_html boolean DEFAULT true;
    END IF;
    
    -- Add meta_description fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'meta_description_en'
    ) THEN
        ALTER TABLE public.blog_posts 
        ADD COLUMN meta_description_en text,
        ADD COLUMN meta_description_es text;
    END IF;
    
    -- Add seo_keywords field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'seo_keywords'
    ) THEN
        ALTER TABLE public.blog_posts 
        ADD COLUMN seo_keywords text[];
    END IF;
END $$;

-- ========================================
-- 4. ENSURE PROPER RLS POLICIES FOR BLOG
-- ========================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can read published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON public.blog_posts;

-- Recreate policies
CREATE POLICY "public_can_read_published_posts"
    ON public.blog_posts
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

CREATE POLICY "authenticated_can_manage_all_posts"
    ON public.blog_posts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_full_access_posts"
    ON public.blog_posts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 5. UPDATE EXISTING POSTS TO HTML FORMAT
-- ========================================

-- Convert any existing text content to HTML format
UPDATE public.blog_posts 
SET 
    content_type = 'html',
    allow_html = true
WHERE content_type IS NULL OR content_type = 'text';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Blog category constraint fixed!';
    RAISE NOTICE '📂 All categories now allowed';
    RAISE NOTICE '🎨 Rich content fields added';
    RAISE NOTICE '🔒 RLS policies updated';
    RAISE NOTICE '🚀 Blog posts can be created successfully';
END $$;