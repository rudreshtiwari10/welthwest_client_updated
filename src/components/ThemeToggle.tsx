import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
        isDark
          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-gray-50 border border-gray-300'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        <SunIcon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
            isDark ? 'opacity-0 -rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle; 