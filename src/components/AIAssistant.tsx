"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    const allMessages = [
      {
        role: "system",
        content: "شما یک دستیار هوشمند هستید که به کاربر در مدیریت کارها و بهره‌وری کمک می‌کنید. لطفاً به فارسی پاسخ دهید."
      },
      ...messages,
      newMessage
    ];

    try {
      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: allMessages.map(({ role, content }) => ({ role, content })),
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
        n: 1,
        response_format: { type: "text" }
      };

      const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer c1cf4005c8c242a487e525ff97cb6323'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`خطای HTTP: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('پاسخ API نامعتبر است');
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: error instanceof Error ? `خطا: ${error.message}` : 'متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تاریخچه چت را پاک کنید؟')) {
      setMessages([]);
      localStorage.removeItem('chatMessages');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto h-[90vh] flex flex-col">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl flex flex-col h-full border border-gray-100 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-t-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              دستیار هوشمند
            </h2>
            <button
              onClick={clearChat}
              className="text-gray-500 hover:text-red-500 transition-colors duration-200 text-sm bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-full"
            >
              پاک کردن تاریخچه
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`group max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-sm transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 ml-4'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white mr-4'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-50 mt-2 block text-right">
                      {new Date(message.timestamp).toLocaleTimeString('fa-IR')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-sm mr-4 max-w-[75%]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">در حال نوشتن</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-b-3xl">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:text-white transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium min-w-[100px] text-sm sm:text-base"
              >
                {loading ? '...' : 'ارسال'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 