import React from 'react';
import Image from 'next/image';

export default function DashiFooter() {
  return (
    <div className="text-center mt-8 space-y-3">
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm text-gray-500">Powered by</span>
        <Image 
          src="/green_circle_thin.png" 
          alt="Dashi POS" 
          width={40}
          height={40}
          className="rounded-full shadow-md object-cover"
        />
        <span className="text-sm font-medium text-gray-600">Dashi</span>
      </div>
      <p className="text-xs text-gray-400">
        © 2025 Dashi POS - All Rights Reserved
      </p>
    </div>
  );
} 