/*
  # Server-side admin helper + harden auto-signup

  Creates a single source of truth for "is the caller an admin?" that is
  safe to use inside RLS policies (SECURITY DEFINER + locked search_path
  avoids the recursion that 20250823161813_red_boat.sql tried to work
  around by opening everything to `authenticated`).

  Also removes the self-signup admin escalation: handle_new_user() no
  longer flips is_admin/role based on the signup email. Existing admin
  profiles are preserved; new admins must be promoted manually.

  Idempotent. Safe to run on production with live data.
*/

-- =====================================================================
-- 1. is_admin() helper — the canonical authorization check
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = check_user_id
      AND up.is_admin = true
      AND up.is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

COMMENT ON FUNCTION public.is_admin(uuid) IS
  'Returns true if the given user (defaults to auth.uid()) is an active admin. Safe inside RLS — bypasses caller RLS via SECURITY DEFINER.';

-- =====================================================================
-- 2. is_superadmin() helper for stricter operations
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_superadmin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = check_user_id
      AND up.role = 'superadmin'
      AND up.is_admin = true
      AND up.is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_superadmin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_superadmin(uuid) TO authenticated, service_role;

-- =====================================================================
-- 3. Backfill — ensure the 4 known admin emails have is_admin=true
--    (in case the trigger missed them or they pre-existed signups)
-- =====================================================================

UPDATE public.user_profiles up
SET is_admin = true,
    is_active = true,
    role = CASE WHEN au.email = 'admin@triexpertservice.com' THEN 'superadmin' ELSE 'admin' END,
    updated_at = now()
FROM auth.users au
WHERE up.user_id = au.id
  AND au.email IN (
    'admin@triexpertservice.com',
    'support@triexpertservice.com',
    'yunior@triexpertservice.com',
    'info@triexpertservice.com'
  )
  AND (up.is_admin = false OR up.is_active = false);

-- =====================================================================
-- 4. Harden handle_new_user — no more email-based auto-promotion
--    Closes the self-signup admin escalation: an attacker who registers
--    one of the publicly-known admin emails no longer gets is_admin=true.
--    New admins must be promoted from the Supabase dashboard.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    role,
    is_admin,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    false,
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- =====================================================================
-- 5. Lock down update_last_login — no longer callable by anon
-- =====================================================================

REVOKE EXECUTE ON FUNCTION public.update_last_login(uuid) FROM anon, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.update_last_login(uuid) TO authenticated, service_role;

-- Tighten the function: only let a user update their own last_login
CREATE OR REPLACE FUNCTION public.update_last_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.user_profiles
     SET last_login_at = now(),
         updated_at    = now()
   WHERE user_id = user_uuid;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE '✅ is_admin()/is_superadmin() helpers created';
  RAISE NOTICE '🔒 handle_new_user no longer auto-promotes by email';
  RAISE NOTICE '🔒 update_last_login revoked from anon';
END $$;
