'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Image from 'next/image';
import DashiFooter from '../components/DashiFooter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is loaded and user exists
    if (!authLoading && user) {
      if (user.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/staff');
      }
    }
  }, [user, router, authLoading]);

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

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Image 
                src="/shamshiri.jpg" 
                alt="Shamshiri Restaurant Logo" 
                width={80}
                height={80}
                className="rounded-full shadow-md object-cover border-4"
                style={{ borderColor: '#b32127' }}
              />
            </div>
            <h2 
              className="text-3xl font-bold mb-2"
              style={{ color: '#1f2937' }}
            >
              Welcome!
            </h2>
            <p 
              className="text-lg"
              style={{ color: '#6b7280' }}
            >
              Please login to continue
            </p>
          </div>

          {/* Error Message */}
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
                disabled={loading}
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
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
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

          <DashiFooter />

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
                className="text-xs mb-2 font-medium"
                style={{ color: '#2563eb' }}
              >
                Demo Credentials:
              </p>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: '#2563eb' }}>
                  <strong>Admin:</strong> admin@shamshiri.com / admin123
                </p>
                <p className="text-xs" style={{ color: '#2563eb' }}>
                  <strong>North York Staff:</strong> northyork@shamshiri.com / staff123
                </p>
                <p className="text-xs" style={{ color: '#2563eb' }}>
                  <strong>Thornhill Staff:</strong> thornhill@shamshiri.com / thornhill456
                </p>
                <p className="text-xs" style={{ color: '#2563eb' }}>
                  <strong>Store Manager:</strong> manager@shamshiri.com / manager789
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 