'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CatModeToggleProps {
  onToggle: (enabled: boolean) => void;
}

const CatModeToggle: React.FC<CatModeToggleProps> = ({ onToggle }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // اعمال کلاس cat-mode به body
    document.body.classList.toggle('cat-mode', enabled);
    onToggle(enabled);
  }, [enabled, onToggle]);

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <button
        onClick={() => setEnabled(!enabled)}
        className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
          enabled ? 'bg-[#FFB7C5]' : 'bg-gray-200'
        }`}
      >
        <div className="relative w-12 h-12">
          {/* گوش‌های گربه */}
          <div className={`
            absolute top-0 left-1/2 -translate-x-1/2
            w-8 h-8 flex justify-between
            transition-transform duration-300
            ${enabled ? 'scale-100' : 'scale-0'}
          `}>
            <div className="w-3 h-3 bg-[#FF69B4] rounded-tl-full transform -rotate-45" />
            <div className="w-3 h-3 bg-[#FF69B4] rounded-tr-full transform rotate-45" />
          </div>
          
          {/* صورت گربه */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            text-2xl transition-transform duration-300
            ${enabled ? 'scale-100' : 'scale-0 opacity-0'}
          `}>
            😺
          </div>
          
          {/* آیکون خاموش */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            text-2xl transition-transform duration-300
            ${enabled ? 'scale-0 opacity-0' : 'scale-100'}
          `}>
            🐱
          </div>
        </div>
      </button>
    </motion.div>
  );
};

export default CatModeToggle; 