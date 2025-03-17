"use client";

import PersianCalendar from '@/components/PersianCalendar';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">تقویم</h1>
        <PersianCalendar />
      </div>
    </div>
  );
} 