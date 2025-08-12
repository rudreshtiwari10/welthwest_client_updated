import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import SearchBarWithSuggestions from './SearchBarWithSuggestions';
import ThemeToggle from './ThemeToggle';
import { SparklesIcon, ChartBarIcon, ChatBubbleLeftRightIcon, BeakerIcon } from '@heroicons/react/24/outline';
import WelthAIPage from '../pages/WelthAIPage';
import WelthChatbotPage from '../pages/WelthChatbotPage';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const { subscriptionDetails } = useSubscription();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showStocksMenu, setShowStocksMenu] = useState(false);
  const [showWelthAIMenu, setShowWelthAIMenu] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);

  // Refs for dropdown containers
  const profileRef = useRef<HTMLDivElement>(null);
  const stocksRef = useRef<HTMLDivElement>(null);
  const welthAIRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Refs for timeouts
  const profileTimeoutRef = useRef<NodeJS.Timeout>();
  const stocksTimeoutRef = useRef<NodeJS.Timeout>();
  const welthAITimeoutRef = useRef<NodeJS.Timeout>();
  const dashboardTimeoutRef = useRef<NodeJS.Timeout>();

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
      if (stocksTimeoutRef.current) clearTimeout(stocksTimeoutRef.current);
      if (welthAITimeoutRef.current) clearTimeout(welthAITimeoutRef.current);
      if (dashboardTimeoutRef.current) clearTimeout(dashboardTimeoutRef.current);
    };
  }, []);

  // Generic function to handle dropdown hover
  const handleDropdownHover = (
    isEntering: boolean,
    setState: React.Dispatch<React.SetStateAction<boolean>>,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isEntering) {
      setState(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setState(false);
      }, 150); // 150ms delay before closing
    }
  };

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
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-gray-900 dark:text-white">WelthWest</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* WelthAI Button with Dropdown */}
              <div 
                className="relative" 
                ref={welthAIRef}
                onMouseEnter={() => handleDropdownHover(true, setShowWelthAIMenu, welthAITimeoutRef)}
                onMouseLeave={() => handleDropdownHover(false, setShowWelthAIMenu, welthAITimeoutRef)}
              >
                <Link
                  to="/welthai"
                  className="flex items-center px-4 py-1.5 bg-[#7e22ce] hover:bg-[#6b21a8] text-white rounded-full font-medium transition-colors shadow-md"
                  onMouseEnter={() => setShowWelthAIMenu(true)}
                >
                  <SparklesIcon className="h-4 w-4 mr-2 text-white" />
                  <span className="mr-1">WelthAI</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${showWelthAIMenu ? 'rotate-180' : ''}`}></i>
                </Link>

                {showWelthAIMenu && (
                  <div 
                    className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#1a1f2e] rounded-lg shadow-lg dark:shadow-gray-900/50 py-1 border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <Link
                      to="/welthai"
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
                        to="/WelthAiChatBot-lanching-soon"
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

                  </div>
                )}
              </div>

              {/* Backtesting Link in top nav */}
              <Link 
                to="/backtest-beta"
                className={`flex items-center text-sm font-medium ${
                  ['/backtesting', '/backtesting-beta', '/backtest-beta'].includes(location.pathname)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <BeakerIcon className="h-4 w-4 mr-1" />
                <span>Backtesting</span>
              </Link>

              {/* Dashboard Link (replaces Stocks) */}
              <div className="relative" ref={dashboardRef}>
                <Link 
                  to="/dashboard"
                  className={`flex items-center text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <span>Dashboard</span>
                </Link>
              </div>

              {/* Dashboard Dropdown removed; simple Dashboard link kept above */}
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
              <div 
                className="relative" 
                ref={profileRef}
                onMouseEnter={() => handleDropdownHover(true, setShowProfileMenu, profileTimeoutRef)}
                onMouseLeave={() => handleDropdownHover(false, setShowProfileMenu, profileTimeoutRef)}
              >
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <i className="fas fa-user text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <i className={`fas fa-chevron-down text-xs ml-1 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Profile Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a1f2e] rounded-lg shadow-lg dark:shadow-gray-900/50 py-2 border border-gray-200 dark:border-gray-700">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                          <i className="fas fa-user text-primary-600 dark:text-primary-400 text-lg"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.username || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Subscription Plan */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Plan:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          subscriptionDetails?.tier === 'FREE' 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            : subscriptionDetails?.tier === 'PRO'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : subscriptionDetails?.tier === 'ENTERPRISE'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {subscriptionDetails?.tier || 'Free'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <i className="fas fa-user-cog w-4 mr-3 text-gray-400"></i>
                        Profile Settings
                      </Link>
                      
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <i className="fas fa-tachometer-alt w-4 mr-3 text-gray-400"></i>
                        Dashboard
                      </Link>
                      
                      {subscriptionDetails?.tier === 'FREE' && (
                        <Link
                          to="/pricing"
                          className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <i className="fas fa-crown w-4 mr-3 text-blue-500"></i>
                          Upgrade Plan
                        </Link>
                      )}
                      
                      <Link
                        to="/feedback"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <i className="fas fa-comment-dots w-4 mr-3 text-gray-400"></i>
                        Feedback
                      </Link>
                      
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <i className="fas fa-sign-out-alt w-4 mr-3"></i>
                        Logout
                      </button>
                    </div>
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