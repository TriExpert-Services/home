/*
  # Admin User Profiles System
  
  ## Description
  This migration creates a user profiles system for admin authentication:
  
  1. User Profiles Table
     - Links to Supabase Auth users
     - Role management (admin, superadmin)
     - Admin status tracking
     
  2. RLS Policies
     - Secure access to profile data
     - Only authenticated users can read profiles
     
  3. Functions
     - Automatic profile creation for admin emails
     - Role assignment based on email domain
*/

-- ========================================
-- 1. CREATE USER PROFILES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Reference to Supabase Auth user
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Profile information
    full_name text,
    avatar_url text,
    
    -- Admin system
    role text DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'user')),
    is_admin boolean DEFAULT false,
    
    -- Contact info
    phone text,
    department text,
    
    -- Status
    is_active boolean DEFAULT true,
    last_login_at timestamptz,
    
    -- Preferences
    preferences jsonb DEFAULT '{}',
    
    -- Metadata
    metadata jsonb DEFAULT '{}'
);

-- ========================================
-- 2. CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON public.user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- ========================================
-- 3. CREATE UPDATED_AT TRIGGER
-- ========================================

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. ENABLE RLS
-- ========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CREATE RLS POLICIES
-- ========================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.is_admin = true
            AND up.is_active = true
        )
    );

-- Policy: Super admins can manage all profiles
CREATE POLICY "Super admins can manage all profiles"
    ON public.user_profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.role = 'superadmin'
            AND up.is_admin = true
            AND up.is_active = true
        )
    );

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage all profiles"
    ON public.user_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 6. CREATE FUNCTION TO AUTO-CREATE PROFILES
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text := 'user';
    is_admin_user boolean := false;
    admin_emails text[] := ARRAY[
        'admin@triexpertservice.com',
        'support@triexpertservice.com',
        'yunior@triexpertservice.com',
        'info@triexpertservice.com'
    ];
BEGIN
    -- Check if email is in admin list
    IF NEW.email = ANY(admin_emails) THEN
        is_admin_user := true;
        
        -- Set role based on email
        IF NEW.email = 'admin@triexpertservice.com' THEN
            user_role := 'superadmin';
        ELSE
            user_role := 'admin';
        END IF;
    END IF;
    
    -- Create user profile
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
        user_role,
        is_admin_user,
        true,
        now(),
        now()
    );
    
    RETURN NEW;
END;
$$;

-- ========================================
-- 7. CREATE TRIGGER FOR AUTO-PROFILE CREATION
-- ========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 8. CREATE FUNCTION TO UPDATE LAST LOGIN
-- ========================================

CREATE OR REPLACE FUNCTION public.update_last_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles 
    SET 
        last_login_at = now(),
        updated_at = now()
    WHERE user_id = user_uuid;
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.update_last_login(uuid) TO authenticated, anon;

-- ========================================
-- 9. CREATE ADMIN VIEW
-- ========================================

CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
    up.*,
    au.email,
    au.created_at as auth_created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    CASE 
        WHEN up.last_login_at > now() - interval '15 minutes' THEN 'online'
        WHEN up.last_login_at > now() - interval '1 day' THEN 'recent'
        ELSE 'offline'
    END as online_status
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.is_admin = true
ORDER BY up.role DESC, up.last_login_at DESC NULLS LAST;

-- Grant access to the view
GRANT SELECT ON public.admin_users_view TO authenticated;

-- ========================================
-- 10. GRANTS AND PERMISSIONS
-- ========================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Admin User Profiles System created successfully!';
    RAISE NOTICE '👥 User profiles table ready';
    RAISE NOTICE '🔒 RLS policies configured';
    RAISE NOTICE '⚡ Auto-profile creation enabled';
    RAISE NOTICE '📊 Admin view created';
    RAISE NOTICE '🚀 Ready for real authentication';
END $$;