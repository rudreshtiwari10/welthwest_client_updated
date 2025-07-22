import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBarWithSuggestions from './SearchBarWithSuggestions';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showStocksMenu, setShowStocksMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const stocksRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const isStockActive = () => location.pathname.startsWith('/stock');

  // Popular Indian stocks for quick access
  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank' }
  ];

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (stocksRef.current && !stocksRef.current.contains(event.target as Node)) {
        setShowStocksMenu(false);
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

              {/* Stocks Dropdown */}
              <div className="relative" ref={stocksRef}>
                <button 
                  onClick={() => setShowStocksMenu(!showStocksMenu)}
                  className={`flex items-center text-sm space-x-1 ${
                    isStockActive()
                      ? 'text-primary-400 font-medium'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span>Stocks</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showStocksMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {showStocksMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#1a1f2e] rounded-md shadow-lg py-1 border border-gray-700 z-50">
                    {/* AI-Powered Stock Analysis - Featured Option */}
                    <Link
                      to="/stock/RELIANCE"
                      className="block px-4 py-3 text-sm border-b border-gray-700 bg-gradient-to-r from-purple-900/30 to-blue-900/30 hover:from-purple-900/40 hover:to-blue-900/40"
                      onClick={() => setShowStocksMenu(false)}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <SparklesIcon className="h-4 w-4 text-purple-400" />
                        <span className="font-medium text-purple-400">AI-Powered Stock Analysis</span>
                      </div>
                      <p className="text-xs text-gray-400 pl-6">
                        Get ML-based market regime predictions
                      </p>
                    </Link>
                    
                    {/* Popular Stocks */}
                    <div className="py-1">
                      <h3 className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Popular Stocks
                      </h3>
                      {popularStocks.map((stock) => (
                        <Link
                          key={stock.symbol}
                          to={`/stock/${stock.symbol}`}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setShowStocksMenu(false)}
                        >
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-xs text-gray-400 ml-2">{stock.name}</span>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-700 my-1"></div>
                    <Link
                      to="/markets"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setShowStocksMenu(false)}
                    >
                      View All Stocks
                    </Link>
                  </div>
                )}
              </div>

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