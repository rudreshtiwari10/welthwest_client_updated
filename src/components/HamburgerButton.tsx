import React from 'react';

interface HamburgerButtonProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <button
      onClick={toggleSidebar}
      className={`fixed top-20 left-4 z-40 flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 shadow-md ${
        isOpen ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <i className="fas fa-bars text-xl"></i>
    </button>
  );
};

export default HamburgerButton; 