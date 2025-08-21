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
    // Check for existing admin session
    const adminData = localStorage.getItem('triexpert_admin');
    if (adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        setUser(parsedAdmin);
      } catch (error) {
        console.error('Error parsing admin data:', error);
        console.error('No user data returned');
        localStorage.removeItem('triexpert_admin');
      }
    }
      console.log('User authenticated:', data.user.email);

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { email });
      
      console.log('Profile query result:', { profile, profileError });

      // For demo purposes, using hardcoded admin credentials
        console.error('Profile error:', profileError.message);
      // In production, this would be through Supabase Auth with RLS policies
      const adminCredentials = [
        { email: 'admin@triexpertservice.com', password: 'admin123', role: 'superadmin' },
        { email: 'support@triexpertservice.com', password: 'support123', role: 'admin' }
      ];
        console.error('User is not admin:', profile);

      const adminUser = adminCredentials.find(
        admin => admin.email === email && admin.password === password
      );
      console.log('Admin user verified:', profile);


      if (adminUser) {
        console.log('Admin user verified:', adminUser);
        
        const userData: AdminUser = {
          id: `admin_${Date.now()}`,
          email: adminUser.email,
          role: adminUser.role as 'admin' | 'superadmin',
          created_at: new Date().toISOString()
        };

        setUser(userData);
        console.log('User set successfully:', userData);

        localStorage.setItem('triexpert_admin', JSON.stringify(userData));
        console.error('Authentication error:', error.message);
        return true;
      }
      console.log('Login successful, user set:', userData);

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('triexpert_admin');
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