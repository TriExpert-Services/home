/*
  # Replace blog_likes ip_address with client_id

  blog_likes had `ip_address inet NOT NULL` and the frontend was packing
  a per-browser UUID into a fake 10.x.x.x address to satisfy the type.
  Comment in src/components/Blog.tsx flagged this as TODO.

  This migration makes client_id the canonical anti-double-like key:
    - adds client_id uuid column (nullable for backward compat with old rows)
    - relaxes NOT NULL on ip_address (still recorded for analytics)
    - drops the old (post, ip) UNIQUE, adds (post, client_id) UNIQUE
    - registers a new RPC `toggle_blog_post_like(p_blog_post_id, p_client_id)`
      with the cleaner signature

  The old `toggle_blog_like(uuid, inet)` function is kept until the
  frontend deploy is confirmed, then can be dropped in a follow-up.

  Idempotent. Safe to run on prod with live data.
*/

-- =====================================================================
-- Schema changes on blog_likes
-- =====================================================================

ALTER TABLE public.blog_likes
  ADD COLUMN IF NOT EXISTS client_id uuid;

ALTER TABLE public.blog_likes
  ALTER COLUMN ip_address DROP NOT NULL;

-- The old uniqueness was on (post, ip) which the fake-IP hack defeated
-- (multiple clients could collide on the same hashed IP). Replace with
-- a real per-client constraint.
ALTER TABLE public.blog_likes
  DROP CONSTRAINT IF EXISTS blog_likes_blog_post_id_ip_address_key;

CREATE UNIQUE INDEX IF NOT EXISTS blog_likes_post_client_uq
  ON public.blog_likes (blog_post_id, client_id)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_likes_client_id
  ON public.blog_likes (client_id);

-- =====================================================================
-- New canonical RPC
-- =====================================================================

CREATE OR REPLACE FUNCTION public.toggle_blog_post_like(
  p_blog_post_id uuid,
  p_client_id    uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  existing_id uuid;
BEGIN
  IF p_blog_post_id IS NULL OR p_client_id IS NULL THEN
    RAISE EXCEPTION 'blog_post_id and client_id are required';
  END IF;

  SELECT id INTO existing_id
  FROM public.blog_likes
  WHERE blog_post_id = p_blog_post_id
    AND client_id    = p_client_id;

  IF existing_id IS NOT NULL THEN
    DELETE FROM public.blog_likes WHERE id = existing_id;
    UPDATE public.blog_posts
       SET like_count = GREATEST(like_count - 1, 0)
     WHERE id = p_blog_post_id;
    RETURN false;
  END IF;

  INSERT INTO public.blog_likes (blog_post_id, client_id)
       VALUES (p_blog_post_id, p_client_id);
  UPDATE public.blog_posts
     SET like_count = like_count + 1
   WHERE id = p_blog_post_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_blog_post_like(uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.toggle_blog_post_like(uuid, uuid)
  TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.toggle_blog_post_like(uuid, uuid) IS
  'Toggles a blog like for the given client_id. Returns true if the like was created, false if it was removed.';

DO $$
BEGIN
  RAISE NOTICE '✅ blog_likes.client_id added; toggle_blog_post_like RPC published';
  RAISE NOTICE '   Old toggle_blog_like(uuid, inet) kept until frontend deploy is confirmed';
END $$;
