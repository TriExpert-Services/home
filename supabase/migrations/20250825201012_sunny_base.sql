/*
  # Fix Blog Posts Category Constraint
  
  ## Description
  This migration fixes the check constraint error for blog_posts category
  by allowing all the categories used in the sample data.
  
  ## Changes
  - Update the check constraint to include all valid categories
  - Add missing categories: 'data', 'ai', 'automation'
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
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Blog category constraint fixed!';
    RAISE NOTICE '📂 All categories now allowed';
    RAISE NOTICE '🚀 Blog posts can be created successfully';
END $$;