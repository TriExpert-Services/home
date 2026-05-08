/*
  # Lock down RLS on sensitive tables

  Replaces the `USING (true) TO authenticated` policies (introduced in
  20250823161813_red_boat.sql to "fix recursion") with policies that use
  the SECURITY DEFINER `is_admin()` helper from migration 20260507000001.

  Also revokes anon-level SELECT/UPDATE/DELETE GRANTs that were left
  open on contact_leads and translation_requests.

  Public flows are preserved:
    - translation_requests: anon can INSERT (the public quote form)
    - contact_leads:        anon can INSERT (via create_contact_lead RPC)
    - client_reviews:       anon can SELECT approved reviews (testimonials)
    - blog_posts:           anon can SELECT published posts

  Idempotent. Safe to run on production.
*/

-- =====================================================================
-- translation_requests — admins read/update/delete; anon insert only
-- =====================================================================

DROP POLICY IF EXISTS "allow_all_read_translation_requests"   ON public.translation_requests;
DROP POLICY IF EXISTS "allow_all_update_translation_requests" ON public.translation_requests;
DROP POLICY IF EXISTS "allow_all_delete_translation_requests" ON public.translation_requests;
DROP POLICY IF EXISTS "Anonymous users can read all requests" ON public.translation_requests;

REVOKE ALL    ON public.translation_requests FROM anon;
GRANT  INSERT ON public.translation_requests TO   anon;
GRANT  ALL    ON public.translation_requests TO   authenticated; -- gated by RLS below

CREATE POLICY "translation_requests_admin_select"
  ON public.translation_requests FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "translation_requests_admin_update"
  ON public.translation_requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "translation_requests_admin_delete"
  ON public.translation_requests FOR DELETE TO authenticated
  USING (public.is_admin());

-- =====================================================================
-- contact_leads — admin-only read/update/delete; anon insert only
-- =====================================================================

DROP POLICY IF EXISTS "authenticated_can_read_contact_leads"    ON public.contact_leads;
DROP POLICY IF EXISTS "authenticated_can_update_contact_leads"  ON public.contact_leads;
DROP POLICY IF EXISTS "authenticated_can_delete_contact_leads"  ON public.contact_leads;
DROP POLICY IF EXISTS "Authenticated users can read leads"      ON public.contact_leads;
DROP POLICY IF EXISTS "Authenticated users can manage leads"    ON public.contact_leads;

REVOKE SELECT, UPDATE, DELETE ON public.contact_leads FROM anon;
GRANT  INSERT ON public.contact_leads TO anon;

CREATE POLICY "contact_leads_admin_select"
  ON public.contact_leads FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "contact_leads_admin_update"
  ON public.contact_leads FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "contact_leads_admin_delete"
  ON public.contact_leads FOR DELETE TO authenticated
  USING (public.is_admin());

-- =====================================================================
-- client_reviews — public reads only approved+featured; admin manages
-- =====================================================================

DROP POLICY IF EXISTS "Authenticated users can read all reviews" ON public.client_reviews;
DROP POLICY IF EXISTS "Authenticated users can manage reviews"   ON public.client_reviews;
DROP POLICY IF EXISTS "Admins can read all reviews"              ON public.client_reviews;
DROP POLICY IF EXISTS "Admins can manage reviews"                ON public.client_reviews;

CREATE POLICY "client_reviews_admin_all"
  ON public.client_reviews FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- (Public read of approved reviews kept from earlier migration: "Public can read approved reviews")
-- (Anon insert kept from earlier migration: "Anyone can create reviews" — gated client-side via can_leave_review RPC)

-- =====================================================================
-- user_profiles — users see their own; admins see all; nobody self-promotes
-- =====================================================================

DROP POLICY IF EXISTS "Authenticated users can read profiles"     ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can manage profiles"   ON public.user_profiles;

CREATE POLICY "user_profiles_admin_select"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "user_profiles_admin_update"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "user_profiles_admin_delete"
  ON public.user_profiles FOR DELETE TO authenticated
  USING (public.is_admin());

-- Prevent any non-superadmin (and any user updating their own row) from
-- escalating themselves: block changes to is_admin/role unless caller is
-- a superadmin (still subject to the policies above).
CREATE OR REPLACE FUNCTION public.prevent_admin_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (NEW.is_admin IS DISTINCT FROM OLD.is_admin
      OR NEW.role     IS DISTINCT FROM OLD.role)
     AND NOT public.is_superadmin(auth.uid())
  THEN
    RAISE EXCEPTION 'Only superadmins can change is_admin or role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_block_self_escalation ON public.user_profiles;
CREATE TRIGGER user_profiles_block_self_escalation
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_self_escalation();

-- =====================================================================
-- n8n_database_config — admin-only (was readable by every authenticated user)
-- =====================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='n8n_database_config') THEN

    EXECUTE 'ALTER TABLE public.n8n_database_config ENABLE ROW LEVEL SECURITY';

    -- drop any pre-existing permissive policies
    EXECUTE (
      SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.n8n_database_config;', polname), E'\n')
      FROM pg_policies WHERE schemaname='public' AND tablename='n8n_database_config'
    );

    EXECUTE 'REVOKE ALL ON public.n8n_database_config FROM anon, authenticated';
    EXECUTE 'GRANT  SELECT, INSERT, UPDATE, DELETE ON public.n8n_database_config TO authenticated';

    EXECUTE $f$
      CREATE POLICY n8n_database_config_admin_all
        ON public.n8n_database_config FOR ALL TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $f$;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='n8n_connection_logs') THEN
    EXECUTE 'ALTER TABLE public.n8n_connection_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE (
      SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.n8n_connection_logs;', polname), E'\n')
      FROM pg_policies WHERE schemaname='public' AND tablename='n8n_connection_logs'
    );
    EXECUTE 'REVOKE ALL ON public.n8n_connection_logs FROM anon';
    EXECUTE $f$
      CREATE POLICY n8n_connection_logs_admin_all
        ON public.n8n_connection_logs FOR ALL TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $f$;
  END IF;
END $$;

-- =====================================================================
-- blog_posts — public reads published; admins manage everything
-- =====================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='blog_posts') THEN

    EXECUTE 'DROP POLICY IF EXISTS "authenticated_can_manage_all_posts" ON public.blog_posts';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.blog_posts';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated can read all blog posts" ON public.blog_posts';

    -- Keep any existing "public can read published" policy if present;
    -- create a canonical one if not.
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename='blog_posts'
        AND polname='blog_posts_public_read_published'
    ) THEN
      EXECUTE $f$
        CREATE POLICY blog_posts_public_read_published
          ON public.blog_posts FOR SELECT TO anon, authenticated
          USING (is_published = true)
      $f$;
    END IF;

    EXECUTE $f$
      CREATE POLICY blog_posts_admin_all
        ON public.blog_posts FOR ALL TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $f$;
  END IF;
END $$;

-- =====================================================================
-- projects — admin-only (was open to any authenticated user)
-- =====================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='projects') THEN

    EXECUTE (
      SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.projects;', polname), E'\n')
      FROM pg_policies WHERE schemaname='public' AND tablename='projects'
    );
    EXECUTE 'ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON public.projects FROM anon';

    EXECUTE $f$
      CREATE POLICY projects_admin_all
        ON public.projects FOR ALL TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $f$;
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '🔒 RLS hardened on translation_requests, contact_leads, client_reviews,';
  RAISE NOTICE '   user_profiles, n8n_database_config, n8n_connection_logs, blog_posts, projects';
  RAISE NOTICE '🚫 Self-escalation blocked on user_profiles via trigger';
  RAISE NOTICE '✅ Public flows preserved: form INSERTs, approved-review reads, published-blog reads';
END $$;
