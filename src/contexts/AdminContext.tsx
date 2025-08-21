import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  logout: () => void;
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

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Existing session found:', session.user.email);
          
          // Check if user is admin
          const adminEmails = [
            'admin@triexpertservice.com',
            'support@triexpertservice.com',
            'yunior@triexpertservice.com',
            'info@triexpertservice.com'
          ];

          if (adminEmails.includes(session.user.email || '')) {
            const role = session.user.email === 'admin@triexpertservice.com' ? 'superadmin' : 'admin';
            
            const userData: AdminUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: role,
              created_at: session.user.created_at || new Date().toISOString()
            };

            setUser(userData);
            console.log('Admin user authenticated:', userData);

            // Update last login
            try {
              await supabase.rpc('update_last_login', { user_uuid: session.user.id });
            } catch (loginError) {
              console.warn('Could not update last login:', loginError);
            }
          } else {
            console.warn('User is not authorized admin:', session.user.email);
            await supabase.auth.signOut();
          }
        } else {
          console.log('No active session');
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Check if user is admin
        const adminEmails = [
          'admin@triexpertservice.com',
          'support@triexpertservice.com',
          'yunior@triexpertservice.com',
          'info@triexpertservice.com'
        ];

        if (adminEmails.includes(session.user.email || '')) {
          const role = session.user.email === 'admin@triexpertservice.com' ? 'superadmin' : 'admin';
          
          const userData: AdminUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: role,
            created_at: session.user.created_at || new Date().toISOString()
          };

          setUser(userData);
        } else {
          console.warn('User is not authorized admin:', session.user.email);
          await supabase.auth.signOut();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Authentication error:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('No user data returned');
        return false;
      }

      console.log('User authenticated:', data.user.email);

      // Check if user is admin
      const adminEmails = [
        'admin@triexpertservice.com',
        'support@triexpertservice.com',
        'yunior@triexpertservice.com',
        'info@triexpertservice.com'
      ];

      if (!adminEmails.includes(data.user.email || '')) {
        console.error('User is not admin:', data.user.email);
        await supabase.auth.signOut();
        return false;
      }

      console.log('Admin user verified');

      // User will be set by the auth state change listener
      return true;

    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AdminContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AdminContext.Provider>
  );
};