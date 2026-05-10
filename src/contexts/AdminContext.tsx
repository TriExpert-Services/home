import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  created_at: string;
}

interface AdminContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

/**
 * Resolve the admin profile for a Supabase auth user by querying server-side
 * RLS-protected tables. Returns null if the user is not an active admin.
 *
 * The previous implementation used a hardcoded email allowlist in the client
 * bundle as the only authorization gate; that list was visible in the JS
 * bundle and (worse) duplicated in three places. Authorization now lives
 * server-side: `public.is_admin(auth.uid())` (SECURITY DEFINER) plus the
 * `user_profiles.is_admin` flag are the source of truth.
 */
async function loadAdminProfile(authUserId: string, email: string | null | undefined): Promise<AdminUser | null> {
  const { data: isAdminFlag, error: rpcError } = await supabase.rpc('is_admin', {
    check_user_id: authUserId,
  });

  if (rpcError || isAdminFlag !== true) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, created_at')
    .eq('user_id', authUserId)
    .maybeSingle();

  return {
    id: authUserId,
    email: email ?? '',
    role: (profile?.role as 'admin' | 'superadmin' | undefined) ?? 'admin',
    created_at: profile?.created_at ?? new Date().toISOString(),
  };
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const adminProfile = await loadAdminProfile(session.user.id, session.user.email);
          if (cancelled) return;

          if (adminProfile) {
            setUser(adminProfile);
            try {
              await supabase.rpc('update_last_login', { user_uuid: session.user.id });
            } catch {
              /* non-fatal */
            }
          } else {
            await supabase.auth.signOut();
          }
        }
      } catch (err) {
        logger.error('Session init failed', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        return;
      }

      if (event === 'SIGNED_IN' && session.user) {
        const adminProfile = await loadAdminProfile(session.user.id, session.user.email);
        if (cancelled) return;

        if (adminProfile) {
          setUser(adminProfile);
        } else {
          await supabase.auth.signOut();
          setUser(null);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return false;

      const adminProfile = await loadAdminProfile(data.user.id, data.user.email);
      if (!adminProfile) {
        await supabase.auth.signOut();
        return false;
      }

      setUser(adminProfile);
      return true;
    } catch (err) {
      logger.error('Login failed', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
