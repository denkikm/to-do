"use client";

import AIAssistant from '@/components/AIAssistant';

export default function AIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">دستیار هوشمند</h1>
        <div className="max-w-4xl mx-auto">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
} 