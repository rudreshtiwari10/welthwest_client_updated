import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBarWithSuggestions from './SearchBarWithSuggestions';
import ThemeToggle from './ThemeToggle';
import { SparklesIcon, ChartBarIcon, ChatBubbleLeftRightIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showStocksMenu, setShowStocksMenu] = useState(false);
  const [showWelthAIMenu, setShowWelthAIMenu] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const stocksRef = useRef<HTMLDivElement>(null);
  const welthAIRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const isStockActive = () => location.pathname.startsWith('/stock');
  const isFeatureActive = () => {
    const path = location.pathname;
    return path.startsWith('/welthai') || path.startsWith('/backtesting');
  };

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
      if (welthAIRef.current && !welthAIRef.current.contains(event.target as Node)) {
        setShowWelthAIMenu(false);
      }
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setShowDashboardMenu(false);
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
    <header className="fixed top-0 left-0 right-0 bg-[#f3f0ff] dark:bg-[#1a1f2e] text-gray-900 dark:text-white z-[100] shadow-lg dark:shadow-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Hamburger Menu - Desktop Only */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-md"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-lg text-gray-900 dark:text-white">WelthWest</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* WelthAI Button with Dropdown */}
              <div 
                className="relative" 
                ref={welthAIRef}
                onMouseEnter={() => setShowWelthAIMenu(true)}
                onMouseLeave={() => setShowWelthAIMenu(false)}
              >
                <button 
                  onClick={() => setShowWelthAIMenu(!showWelthAIMenu)}
                  className="flex items-center px-4 py-1.5 bg-[#7e22ce] hover:bg-[#6b21a8] text-white rounded-full font-medium transition-colors shadow-md"
                >
                  <span className="mr-1">Welth AI</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showWelthAIMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {showWelthAIMenu && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#1a1f2e] rounded-lg shadow-lg dark:shadow-gray-900/50 py-1 border border-gray-200 dark:border-gray-700 z-50">
                    <Link
                      to="/WelthAIPage"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowWelthAIMenu(false)}
                    >
                      <div className="flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium">WelthAI Analysis</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">AI-powered market analysis</div>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/WelthChatbotPage"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowWelthAIMenu(false)}
                    >
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium">WelthAI Chatbot</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Interactive AI assistant</div>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/backtesting"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowWelthAIMenu(false)}
                    >
                      <div className="flex items-center">
                        <ChartBarIcon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium">Backtesting</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Test trading strategies</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Stocks Dropdown */}
              <div 
                className="relative" 
                ref={stocksRef}
                onMouseEnter={() => setShowStocksMenu(true)}
                onMouseLeave={() => setShowStocksMenu(false)}
              >
                <button 
                  onClick={() => setShowStocksMenu(!showStocksMenu)}
                  className={`flex items-center text-sm space-x-1 font-medium ${
                    isStockActive()
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <span>Stocks</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showStocksMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {showStocksMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#1a1f2e] rounded-lg shadow-lg dark:shadow-gray-900/50 py-1 border border-gray-200 dark:border-gray-700 z-50">
                    {/* Stocks dropdown content */}
                    <div className="py-1">
                      <h3 className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Popular Stocks
                      </h3>
                      {popularStocks.map((stock) => (
                        <Link
                          key={stock.symbol}
                          to={`/stock/${stock.symbol}`}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                          onClick={() => setShowStocksMenu(false)}
                        >
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-300 ml-2">{stock.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboard Dropdown */}
              <div 
                className="relative" 
                ref={dashboardRef}
                onMouseEnter={() => setShowDashboardMenu(true)}
                onMouseLeave={() => setShowDashboardMenu(false)}
              >
                <button 
                  onClick={() => setShowDashboardMenu(!showDashboardMenu)}
                  className={`flex items-center text-sm space-x-1 font-medium ${
                    isActive('/dashboard')
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <span>Dashboard</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showDashboardMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {showDashboardMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#1a1f2e] rounded-lg shadow-lg dark:shadow-gray-900/50 py-1 border border-gray-200 dark:border-gray-700 z-50">
                    {/* Dashboard dropdown content */}
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setShowDashboardMenu(false)}
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-blue-600 dark:text-blue-400">
                            <i className="fas fa-chart-line"></i>
                          </div>
                          <div>
                            <div className="font-medium">Overview</div>
                            <div className="text-xs text-gray-500 dark:text-gray-300">View your dashboard</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBarWithSuggestions
              placeholders={searchPlaceholders}
              className="w-full pl-10 pr-12 py-2 bg-white dark:bg-[#2a2f3e] border border-gray-200 dark:border-gray-600 
                rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </div>

          {/* Right side - Auth buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Pro Button */}
            <Link
              to="/pricing"
              className="hidden md:flex items-center px-4 py-1.5 rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium hover:from-primary-500 hover:to-secondary-500 transition-all shadow-md"
            >
              <SparklesIcon className="h-4 w-4 mr-1" />
              Pro
            </Link>
            
            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <i className="fas fa-user text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <span className="text-sm font-medium">Profile</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Profile Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1f2e] rounded-lg shadow-lg dark:shadow-gray-900/50 py-1 border border-gray-200 dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
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
                  className="text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md shadow-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1f2e] shadow-inner">
        <SearchBarWithSuggestions
          placeholders={searchPlaceholders}
          className="w-full pl-10 pr-12 py-2 bg-white dark:bg-[#2a2f3e] border border-gray-200 dark:border-gray-600 
            rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
        />
      </div>
    </header>
  );
};

export default Header; 