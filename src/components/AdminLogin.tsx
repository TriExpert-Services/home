import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, UserPlus } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const { login } = useAdmin();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignupLoading(true);

    const adminEmails = [
      'admin@triexpertservice.com',
      'support@triexpertservice.com', 
      'yunior@triexpertservice.com',
      'info@triexpertservice.com'
    ];

    if (!adminEmails.includes(email)) {
      setError('Only authorized admin emails can create accounts');
      setSignupLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setError('');
        alert('Account created successfully! You can now sign in.');
        setShowSignup(false);
      }
    } catch (error) {
      setError('An error occurred during signup');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Site
        </button>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-white/70">Sign in to manage TriExpert Services</p>
          </div>

          {/* Login Form */}
          <form onSubmit={showSignup ? handleSignup : handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@triexpertservice.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center text-red-300">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || signupLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading || signupLoading 
                ? (showSignup ? 'Creating Account...' : 'Signing in...') 
                : (showSignup ? 'Create Admin Account' : 'Sign In')
              }
            </button>

            {/* Toggle Signup */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowSignup(!showSignup);
                  setError('');
                }}
                className="text-white/70 hover:text-white text-sm underline transition-colors"
              >
                {showSignup ? 'Already have an account? Sign In' : 'Need to create an admin account? Sign Up'}
              </button>
            </div>
          </form>

          {/* Debug Info */}
          <div className="mt-6 p-3 bg-white/5 rounded-lg">
            <h4 className="text-white/70 text-sm font-medium mb-2">Authorized Admin Emails:</h4>
            <div className="text-white/50 text-xs space-y-1">
              <div>• admin@triexpertservice.com (superadmin)</div>
              <div>• support@triexpertservice.com (admin)</div>
              <div>• yunior@triexpertservice.com (admin)</div>
              <div>• info@triexpertservice.com (admin)</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-sm">
              Protected by enterprise security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;