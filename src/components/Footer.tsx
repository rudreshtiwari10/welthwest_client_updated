import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import AnimatedText from './AnimatedText';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();

  // Check if on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Words to animate through
  const animatedWords = ['Stock', 'Indices', 'Global', 'Investment'];

  // State for mobile accordion sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    aiFeatures: false,
    platform: false,
    account: false,
    legal: false,
    resources: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Scroll to top when clicking any footer link
  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`${isAuthPage ? 'bg-gray-900 dark:bg-gray-900' : 'bg-white dark:bg-dark-400'} border-t border-gray-200 dark:border-gray-700 py-6 md:py-8 transition-colors`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Left section - centered on mobile, left on desktop */}
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <div className="flex items-center mb-3 md:mb-4 justify-center md:justify-start">
              <h1 className={`text-xl md:text-2xl font-bold ${isAuthPage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                WelthWest
              </h1>
            </div>
            <div className={`${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} max-w-md text-center md:text-left`}>
              <div className="text-base md:text-lg font-medium">AI-Powered Wealth</div>
              <div className="text-sm md:text-base mt-1">Intelligence Platform</div>
            </div>
            <div className="mt-3 md:mt-4">
              <h1 className={`${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} text-sm md:text-base font-medium`}>contact@welthwest.com</h1>
            </div>
            {/* <div className="mt-4 flex space-x-3 justify-center md:justify-start">
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div> */}
          </div>
          
          {/* Middle section - Categorized Quick Links */}
          <div className="mb-6 md:mb-0 max-w-lg mx-auto">
            <h3 className={`text-lg font-semibold mb-4 md:mb-6 text-center ${isAuthPage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Quick Links</h3>

            {/* Mobile: Accordion Style - 2x2 Grid Layout */}
            <div className="md:hidden grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-left">
              {/* AI Features - Mobile Accordion */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleSection('aiFeatures')}
                  className={`w-full flex items-center justify-between py-3 ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'} font-semibold text-xs`}
                >
                  AI Features
                  {openSections.aiFeatures ? (
                    <ChevronUpIcon className="h-3 w-3" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3" />
                  )}
                </button>
                {openSections.aiFeatures && (
                  <div className="pb-3 space-y-2 pl-2">
                    <Link to="/ai-screener" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      AI Market Analysis
                    </Link>
                    <Link to="/welth-ai-assistant" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      WelthAI Chat
                    </Link>
                    <Link to="/backtesting-beta" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Backtesting
                    </Link>
                  </div>
                )}
              </div>

              {/* Platform - Mobile Accordion */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleSection('platform')}
                  className={`w-full flex items-center justify-between py-3 ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'} font-semibold text-xs`}
                >
                  Platform
                  {openSections.platform ? (
                    <ChevronUpIcon className="h-3 w-3" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3" />
                  )}
                </button>
                {openSections.platform && (
                  <div className="pb-3 space-y-2 pl-2">
                    <Link to="/" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Home
                    </Link>
                    <Link to="/dashboard" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Dashboard
                    </Link>
                    <Link to="/stock" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Stock Analysis
                    </Link>
                    <Link to="/pricing" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Pricing
                    </Link>
                  </div>
                )}
              </div>

              {/* Account - Mobile Accordion */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleSection('account')}
                  className={`w-full flex items-center justify-between py-3 ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'} font-semibold text-xs`}
                >
                  Account
                  {openSections.account ? (
                    <ChevronUpIcon className="h-3 w-3" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3" />
                  )}
                </button>
                {openSections.account && (
                  <div className="pb-3 space-y-2 pl-2">
                    <Link to="/login" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Login
                    </Link>
                    <Link to="/register" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Register
                    </Link>
                    <Link to="/profile" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Profile
                    </Link>
                    <Link to="/about" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      About
                    </Link>
                  </div>
                )}
              </div>

              {/* Legal - Mobile Accordion */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleSection('legal')}
                  className={`w-full flex items-center justify-between py-3 ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'} font-semibold text-xs`}
                >
                  Legal &amp; Trust
                  {openSections.legal ? (
                    <ChevronUpIcon className="h-3 w-3" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3" />
                  )}
                </button>
                {openSections.legal && (
                  <div className="pb-3 space-y-2 pl-2">
                    <Link to="/contact" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Contact Us
                    </Link>
                    <Link to="/privacy-policy" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Privacy Policy
                    </Link>
                    <Link to="/terms-and-conditions" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Terms &amp; Conditions
                    </Link>
                    <Link to="/security" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Security &amp; Trust
                    </Link>
                    <Link to="/feedback" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Feedback
                    </Link>
                  </div>
                )}
              </div>

              {/* Resources - Mobile Accordion */}
              <div className="border-b border-gray-200 dark:border-gray-700 col-span-2">
                <button
                  onClick={() => toggleSection('resources')}
                  className={`w-full flex items-center justify-between py-3 ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'} font-semibold text-xs`}
                >
                  Resources
                  {openSections['resources'] ? (
                    <ChevronUpIcon className="h-3 w-3" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3" />
                  )}
                </button>
                {openSections['resources'] && (
                  <div className="pb-3 space-y-2 pl-2">
                    <Link to="/case-studies" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      Case Studies
                    </Link>
                    <Link to="/technical-overview" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      How It Works
                    </Link>
                    <a href="/blogs" onClick={handleLinkClick} className={`block text-left text-xs ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                      News & Blogs
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Grid Style (Always Expanded) */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              {/* AI Features / Products */}
              <div>
                <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wide ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'}`}>
                  Products
                </h4>
                <div className="space-y-2">
                  <Link to="/product/market-regime" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Market Regime
                  </Link>
                  <Link to="/product/anomaly-detector" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Anomaly Detector
                  </Link>
                  <Link to="/product/backtesting-engine" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Backtesting Engine
                  </Link>
                  <Link to="/welth-ai-assistant" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    WelthAI Assistant
                  </Link>
                </div>
              </div>

              {/* Resources */}
              <div>
                <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wide ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'}`}>
                  Resources
                </h4>
                <div className="space-y-2">
                  <Link to="/case-studies" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Case Studies
                  </Link>
                  <Link to="/technical-overview" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    How It Works
                  </Link>
                  <a href="/blogs" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    News & Blogs
                  </a>
                  <Link to="/pricing" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Pricing
                  </Link>
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wide ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'}`}>
                  Company
                </h4>
                <div className="space-y-2">
                  <Link to="/about" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    About
                  </Link>
                  <Link to="/contact" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Contact Us
                  </Link>
                  <Link to="/feedback" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Feedback
                  </Link>
                  <Link to="/login" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Login
                  </Link>
                </div>
              </div>

              {/* Legal & Trust */}
              <div>
                <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wide ${isAuthPage ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'}`}>
                  Legal &amp; Trust
                </h4>
                <div className="space-y-2">
                  <Link to="/privacy-policy" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Privacy Policy
                  </Link>
                  <Link to="/terms-and-conditions" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Terms &amp; Conditions
                  </Link>
                  <Link to="/security" onClick={handleLinkClick} className={`block ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                    Security &amp; Trust
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right section - centered on mobile, right on desktop */}
          <div className="text-center md:text-right mt-6 md:mt-0">
            <h3 className={`text-base md:text-lg font-semibold mb-3 md:mb-4 ${isAuthPage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Disclaimer</h3>
            <p className={`text-sm ${isAuthPage ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} max-w-md mx-auto md:ml-auto md:mr-0`}>
              WelthWest is a demonstration Platform. The information provided is not financial advice.
              Always do your own research before making investment decisions.
            </p>

            {/* Social Media Links */}
            <div className="mt-4 md:mt-6 flex justify-center md:justify-end space-x-3">
              <a
                href="https://www.youtube.com/@WelthWest"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-700 p-1.5 rounded-full transition-colors shadow-md"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/company/108673007"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-700 p-1.5 rounded-full transition-colors shadow-md"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              <a
                href="https://www.instagram.com/welthwest?igsh=aWNpdWVtZmNzMmRn&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-700 p-1.5 rounded-full transition-colors shadow-md"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href="https://x.com/WelthWest"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-700 p-1.5 rounded-full transition-colors shadow-md"
                aria-label="X (Twitter)"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-6 md:mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          {/* Trust disclaimer line (MD §5) */}
          <p className={`text-xs mb-4 ${isAuthPage ? 'text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
            WelthWest is an AI-powered analytics platform. We do not offer brokerage or investment advice. Markets are risky.
            {/* TODO: Have a legal/compliance reviewer sign off on this disclaimer wording. */}
          </p>
          <div className="flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="flex items-center justify-center sm:justify-start">
              <span className={`text-base md:text-lg font-bold mr-2 ${isAuthPage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                WelthWest
              </span>
              <p className={`text-sm ${isAuthPage ? 'text-gray-300' : ''}`}>&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex space-x-4 text-sm flex-wrap gap-y-1">
                <Link to="/about" onClick={handleLinkClick} className={`${isAuthPage ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                  About
                </Link>
                <Link to="/contact" onClick={handleLinkClick} className={`${isAuthPage ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                  Contact
                </Link>
                <Link to="/case-studies" onClick={handleLinkClick} className={`${isAuthPage ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                  Case Studies
                </Link>
                <Link to="/privacy-policy" onClick={handleLinkClick} className={`${isAuthPage ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                  Privacy
                </Link>
                <Link to="/terms-and-conditions" onClick={handleLinkClick} className={`${isAuthPage ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                  Terms
                </Link>
                <Link to="/security" onClick={handleLinkClick} className={`${isAuthPage ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                  Security
                </Link>
              </div>
              <button
                className={`inline-flex items-center px-3 py-1.5 rounded-md ${isAuthPage ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 dark:bg-dark-500 text-gray-700 dark:text-gray-300'} text-xs md:text-sm transition-colors hover:bg-gray-200 dark:hover:bg-dark-600`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to top
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 