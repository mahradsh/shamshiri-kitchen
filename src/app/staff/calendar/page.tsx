'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

function CalendarPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    // Wait for auth to load before making redirect decisions
    if (authLoading) return;
    
    if (!user || user.role !== 'Staff') {
      router.push('/');
      return;
    }
    
    if (!location) {
      router.push('/staff');
      return;
    }
  }, [user, location, router, authLoading]);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(selectedDate);
  };

  const handleContinue = () => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      router.push(`/staff/items?location=${encodeURIComponent(location!)}&date=${formattedDate}`);
    }
  };

  const isDateSelectable = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date >= today;
  };

  const renderCalendarDays = () => {
    const days: React.ReactElement[] = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelectable = isDateSelectable(day);
      const isSelected = selectedDate && selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentMonth && 
                        selectedDate.getFullYear() === currentYear;
      
      days.push(
        <button
          key={day}
          onClick={() => isSelectable && handleDateSelect(day)}
          disabled={!isSelectable}
          className={`h-12 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-red-600 text-white'
              : isSelectable
              ? 'hover:bg-gray-100 text-gray-900'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-center py-4 px-4">
          <Image 
            src="/shamshiri.jpg" 
            alt="Shamshiri Restaurant Logo" 
            width={40}
            height={40}
            className="rounded-full shadow-sm object-cover border"
            style={{ borderColor: '#b32127' }}
          />
          <h1 className="ml-3 text-lg font-semibold text-red-600">
            Select Date
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
            Select Order Date
          </h2>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar */}
          <div className="mb-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="h-10 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{day}</span>
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedDate}
            className="w-full py-3 px-4 bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-gray-500"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    }>
      <CalendarPageContent />
    </Suspense>
  );
} 