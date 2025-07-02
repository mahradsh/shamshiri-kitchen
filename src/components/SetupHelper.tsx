'use client';

import React, { useState } from 'react';
import { initializeApp } from '@/lib/seed-data';

export default function SetupHelper() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await initializeApp();
      setMessage('✅ Items initialized successfully! Check the console for user creation instructions.');
    } catch (error) {
      console.error('Setup error:', error);
      setMessage('❌ Setup failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="text-sm text-gray-600 mb-2">System Setup</div>
      <button
        onClick={handleInitialize}
        disabled={loading}
        className="btn-primary text-sm px-3 py-2 disabled:opacity-50"
      >
        {loading ? '🔄 Setting up...' : '🚀 Initialize System'}
      </button>
      {message && (
        <div className="mt-2 text-xs text-gray-600">
          {message}
        </div>
      )}
    </div>
  );
} 