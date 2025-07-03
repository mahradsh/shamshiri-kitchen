'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithGoogle, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/staff');
      }
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!loginWithGoogle) return;
    
    setGoogleLoading(true);
    setError('');

    try {
      await loginWithGoogle();
    } catch (error: any) {
      setError('Google sign-in failed');
      console.error('Google login error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <div className="w-full max-w-md">
        <div 
          className="rounded-2xl shadow-2xl p-8"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-6">
              <img 
                src="/shamshiri.jpg" 
                alt="Shamshiri Restaurant Logo" 
                className="w-24 h-24 rounded-full shadow-lg object-cover border-4"
                style={{ borderColor: '#b32127' }}
              />
            </div>
            <h1 
              className="text-2xl font-bold mb-2" 
              style={{ color: '#111827' }}
            >
              Welcome! Please Login
            </h1>
            <p 
              className="text-base" 
              style={{ color: '#6b7280' }}
            >
              Shamshiri Kitchen Ordering System
            </p>
          </div>

          {/* Admin Login Section */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Admin Login</span>
              </div>
            </div>
          </div>

          {error && (
            <div 
              className="mb-4 p-3 rounded-lg text-sm text-center"
              style={{ 
                backgroundColor: '#fef2f2', 
                color: '#dc2626',
                border: '1px solid #fecaca'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#374151' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontSize: '16px'
                }}
                placeholder="admin@shamshiri.com"
                required
                disabled={loading || googleLoading}
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#374151' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    borderColor: '#d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontSize: '16px'
                  }}
                  placeholder="admin123"
                  required
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading || googleLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: loading ? '#9ca3af' : '#b32127',
                color: '#ffffff'
              }}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Google Sign-in for Staff */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Staff Login</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="mt-4 w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 hover:bg-gray-50"
              style={{ 
                backgroundColor: '#ffffff',
                color: '#374151'
              }}
            >
              {googleLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p 
              className="text-sm"
              style={{ color: '#6b7280' }}
            >
              © 2025 Shamshiri Kitchen - All Rights Reserved
            </p>
          </div>

          {/* Development helper - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div 
              className="mt-4 p-3 border rounded-lg"
              style={{ 
                backgroundColor: '#eff6ff',
                borderColor: '#bfdbfe'
              }}
            >
              <p 
                className="text-xs mb-1 font-medium"
                style={{ color: '#2563eb' }}
              >
                Demo Credentials:
              </p>
              <p 
                className="text-xs"
                style={{ color: '#2563eb' }}
              >
                Admin: admin@shamshiri.com / admin123
              </p>
              <p 
                className="text-xs"
                style={{ color: '#2563eb' }}
              >
                Staff: staff@shamshiri.com / staff123
              </p>
              <p 
                className="text-xs mt-1"
                style={{ color: '#2563eb' }}
              >
                Or use Google Sign-in for staff access
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 