"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiCheckSquare, FiCalendar, FiSettings, FiCpu } from 'react-icons/fi';

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center h-16">
        <Link 
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            pathname === '/' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <FiCheckSquare className="w-6 h-6" />
          <span className="text-xs mt-1">کارها</span>
        </Link>
        <Link 
          href="/calendar"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            pathname === '/calendar' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <FiCalendar className="w-6 h-6" />
          <span className="text-xs mt-1">تقویم</span>
        </Link>
        <Link 
          href="/ai"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            pathname === '/ai' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <FiCpu className="w-6 h-6" />
          <span className="text-xs mt-1">دستیار</span>
        </Link>
        <Link 
          href="/settings"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            pathname === '/settings' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <FiSettings className="w-6 h-6" />
          <span className="text-xs mt-1">تنظیمات</span>
        </Link>
      </div>
    </div>
  );
} 