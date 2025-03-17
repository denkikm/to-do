"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TodoList from '@/components/TodoList';
import CatModeToggle from '@/components/CatModeToggle';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCatMode, setIsCatMode] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-2xl text-gray-600 dark:text-gray-300">
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isCatMode 
        ? 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900 dark:to-purple-900'
        : 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold transition-colors duration-300 ${
            isCatMode ? 'text-pink-600 dark:text-pink-300' : 'text-gray-900 dark:text-white'
          }`}>
            {isCatMode ? '🐱 کارهای گربه‌ای من 🐱' : 'کارهای من'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300">
              خوش آمدید، {session.user?.name}
            </span>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              خروج
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <TodoList userId={session.user?.id} />
        </div>
      </div>
      <CatModeToggle onToggle={setIsCatMode} />
    </div>
  );
}
