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
  const [error, setError] = useState('');
  
  const { login, user } = useAuth();
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
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-75 transition-opacity"
                  style={{ color: '#9ca3af' }}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div 
                className="px-4 py-3 rounded-lg border"
                style={{ 
                  backgroundColor: '#fef2f2',
                  borderColor: '#fecaca',
                  color: '#dc2626'
                }}
              >
                {error}
              </div>
            )}

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

          <div className="mt-8 text-center">
            <p 
              className="text-sm"
              style={{ color: '#6b7280' }}
            >
              © 2025 Shamshiri Kitchen - All Rights Reserved
            </p>
          </div>

          {/* Development helper */}
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
          </div>
        </div>
      </div>
    </div>
  );
} 