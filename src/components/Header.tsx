import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import SearchBarWithSuggestions from './SearchBarWithSuggestions';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { SparklesIcon, ChartBarIcon, ChatBubbleLeftRightIcon, BeakerIcon, CpuChipIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { activityService } from '../services/api';

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
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
    return path.startsWith('/ai-screener') || path.startsWith('/backtesting');
  };


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
    <header className="fixed top-0 left-0 right-0 backdrop-blur-md bg-white/80 dark:bg-dark-100/80 border-b border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white z-[100] shadow-sm">
      <div className="container mx-auto pl-0 pr-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8 pl-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-gray-900 dark:text-white">WelthWest</span>
            </Link>

            {/* Desktop Navigation - Minimal, Key Features Only */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* WelthAI Button with Dropdown */}
              <div 
                className="relative" 
                ref={welthAIRef}
                onMouseEnter={() => handleDropdownHover(true, setShowWelthAIMenu, welthAITimeoutRef)}
                onMouseLeave={() => handleDropdownHover(false, setShowWelthAIMenu, welthAITimeoutRef)}
              >
                <Link
                  to="/ai-screener"
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
                      to="/ai-screener"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowWelthAIMenu(false)}
                    >
                      <div className="flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium">Welth Market Regime</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">AI-powered market analysis</div>
                        </div>
                      </div>
                    </Link>

                    <Link
                        to="/welth-ai-assistant"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowWelthAIMenu(false)}
                    >
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium">WelthAI Assistant</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Interactive AI assistant</div>
                        </div>
                      </div>
                    </Link>

                    <a
                      href="https://services.welthwest.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setShowWelthAIMenu(false)}
                    >
                      <div className="flex items-center">
                        <CpuChipIcon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium">WelthAI bots</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">All AI-powered services</div>
                        </div>
                      </div>
                    </a>

                  </div>
                )}
              </div>

              {/* Market Dropdown */}
              <div 
                className="relative" 
                ref={stocksRef}
                onMouseEnter={() => handleDropdownHover(true, setShowStocksMenu, stocksTimeoutRef)}
                onMouseLeave={() => handleDropdownHover(false, setShowStocksMenu, stocksTimeoutRef)}
              >
                <button
                  className={`flex items-center text-sm font-medium ${
                    isStockActive()
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  <span>Market</span>
                  <i className={`fas fa-chevron-down text-xs ml-1 transition-transform ${showStocksMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {showStocksMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#1a1f2e] rounded-lg shadow-lg dark:shadow-gray-900/50 py-2 border border-gray-200 dark:border-gray-700 z-50">
                    {/* Stocks */}
                    <Link
                      to="/stock"
                      className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => {
                        activityService.trackActivity(activityService.FEATURE_MARKET_DROPDOWN_GAINERS);
                        setShowStocksMenu(false);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                          <i className="fas fa-chart-line text-blue-600 dark:text-blue-400 text-sm"></i>
                        </div>
                        <div>
                          <div className="font-medium">Top Gainer & Loser</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Search and analyze individual stocks</div>
                        </div>
                      </div>
                    </Link>

                    {/* Stocks - Hidden as per user request */}
                    {/* <Link
                      to="/stock/Reliance"
                      className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setShowStocksMenu(false)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                          <i className="fas fa-trophy text-purple-600 dark:text-purple-400 text-sm"></i>
                        </div>
                        <div>
                          <div className="font-medium">Stocks</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Top performing stocks & market insights</div>
                        </div>
                      </div>
                    </Link> */}

                    {/* Strategy */}
                    <a
                      href="https://strategy.welthwest.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 border-b border-gray-100 dark:border-gray-700"
                      onClick={() => setShowStocksMenu(false)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                          <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Strategy</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Live trading strategies & performance</div>
                        </div>
                      </div>
                    </a>

                  </div>
                )}
              </div>

              {/* About Link */}
              <Link
                to="/about"
                className={`flex items-center text-sm font-medium ${
                  isActive('/about')
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <span>About</span>
              </Link>

              {/* Backtesting Link */}
              <Link
                to="/backtest-beta"
                className={`flex items-center text-sm font-medium ${
                  isActive('/backtest-beta')
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <BeakerIcon className="h-4 w-4 mr-1" />
                <span>Backtesting</span>
              </Link>

              {/* News Link */}
              <a
                href="/news"
                className="text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
              >
                News
              </a>

              {/* Blogs Link */}
              <a
                href="/blogs"
                className="text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Blogs
              </a>

            </nav>
          </div>

          {/* Right side - Auth buttons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search Toggle */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Search"
            >
              {showMobileSearch
                ? <XMarkIcon className="h-5 w-5" />
                : <MagnifyingGlassIcon className="h-5 w-5" />}
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}

            {/* Pro Button */}
            <Link
              to="/premium"
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
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a1f2e] rounded-lg shadow-lg dark:shadow-gray-900/50 py-2 border border-gray-200 dark:border-gray-700 z-[100]">
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
                          to="/premium"
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
                  className="text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-2 md:px-4 rounded-md hover:bg-white/50 dark:hover:bg-gray-700 transition-colors shadow-sm whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-2 py-2 md:px-4 rounded-md shadow-md transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar — slides in below header */}
      {showMobileSearch && (
        <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
          <SearchBarWithSuggestions placeholders={searchPlaceholders} />
        </div>
      )}
    </header>
  );
};

export default Header; 
