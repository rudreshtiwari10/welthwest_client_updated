import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBarWithSuggestions from './SearchBarWithSuggestions';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchPlaceholders = [
    "Search stocks...",
    "Search companies...",
    "Search prices...",
    "Search markets..."
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1a1f2e] text-white z-[100]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Hamburger Menu - Desktop Only */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-lg">WelthWest</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* WelthAI Button - Desktop */}
              <Link
                to="/welthai"
                className={`hidden md:flex items-center px-4 py-1.5 rounded-full ${
                  isActive('/welthai')
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-600/90 text-white hover:bg-purple-600'
                }`}
              >
                <span className="text-sm font-medium">Welth AI</span>
              </Link>

              <Link
                to="/markets"
                className={`text-sm ${
                  isActive('/markets')
                    ? 'text-primary-400 font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Markets
              </Link>
              <Link
                to="/dashboard"
                className={`text-sm ${
                  isActive('/dashboard')
                    ? 'text-primary-400 font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/backtesting"
                className={`text-sm ${
                  isActive('/backtesting')
                    ? 'text-primary-400 font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Backtesting
              </Link>
            </nav>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBarWithSuggestions
              placeholders={searchPlaceholders}
              className="w-full pl-10 pr-12 py-2 bg-[#2a2f3e] border border-gray-600 
                rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* Right side - Auth buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <i className="fas fa-user"></i>
                  </div>
                  <span className="text-sm">Profile</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1f2e] rounded-md shadow-lg py-1 border border-gray-700">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2 border-t border-gray-700">
        <SearchBarWithSuggestions
          placeholders={searchPlaceholders}
          className="w-full pl-10 pr-12 py-2 bg-[#2a2f3e] border border-gray-600 
            rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            text-white placeholder-gray-400 text-sm"
        />
      </div>
    </header>
  );
};

export default Header; 