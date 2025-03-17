"use client";

import { useState } from 'react';

interface NavItem {
    id: string;
    title: string;
    icon: string;
}

const navItems: NavItem[] = [
    { id: 'tasks', title: 'کارها', icon: '📝' },
    { id: 'ai', title: 'دستیار هوشمند', icon: '🤖' },
    { id: 'settings', title: 'تنظیمات', icon: '⚙️' },
];

export default function BottomNav({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex justify-around">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center py-3 px-4 ${
                                activeTab === item.id
                                    ? 'text-blue-500 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="mt-1 text-xs">{item.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
} 