'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[13px] font-medium cursor-pointer ${
        isDark
          ? 'bg-[#212525] border-[#485346] text-[#ddffdc] hover:bg-[#2c3333] hover:border-[#7fee64]'
          : 'bg-[#eaf2ea] border-[#c8dac8] text-[#111c10] hover:bg-[#dce8dc] hover:border-[#15803d]'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#7fee64] transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#15803d] transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      )}
    </button>
  );
};
