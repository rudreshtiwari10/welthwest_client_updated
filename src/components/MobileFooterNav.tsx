import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SparklesIcon, Bars3Icon, ChartBarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const MobileFooterNav: React.FC = () => {
  const location = useLocation();
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isStockActive = () => location.pathname.startsWith('/stock');
  const isFeatureActive = () => {
    const path = location.pathname;
    return path.startsWith('/welthai') || path.startsWith('/backtesting');
  };

  // Close features menu when clicking outside
  const handleCloseFeatures = () => {
    setShowFeaturesMenu(false);
  };

  return (
    <>
      {/* Features Popup Menu */}
      {showFeaturesMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCloseFeatures}
          ></div>
          
          {/* Menu */}
          <div className="fixed bottom-16 left-4 right-4 bg-[#1a1f2e] rounded-lg border border-gray-700 shadow-lg z-50 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium">Features</h3>
              <button 
                onClick={handleCloseFeatures}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* WelthAI Services */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                WelthAI Services
              </h4>
              
              <Link
                to="/welthai"
                className="flex items-center p-3 rounded-lg bg-gray-800/50 mb-2"
                onClick={handleCloseFeatures}
              >
                <div className="mr-3 text-purple-400">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-white">WelthAI Chat Assistant</div>
                  <div className="text-xs text-gray-400">AI-powered conversational assistant</div>
                </div>
              </Link>
              
              <Link
                to="/welthai"
                className="flex items-center p-3 rounded-lg bg-gray-800/50"
                onClick={handleCloseFeatures}
              >
                <div className="mr-3 text-purple-400">
                  <SparklesIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-white">WelthAI Market Analysis</div>
                  <div className="text-xs text-gray-400">ML-based market regime detection</div>
                </div>
              </Link>
            </div>
            
            {/* Trading Tools */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Trading Tools
              </h4>
              
              <Link
                to="/backtesting"
                className="flex items-center p-3 rounded-lg bg-gray-800/50"
                onClick={handleCloseFeatures}
              >
                <div className="mr-3 text-blue-400">
                  <ChartBarIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-white">Backtesting</div>
                  <div className="text-xs text-gray-400">Test trading strategies with historical data</div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1f2e] border-t border-gray-700 md:hidden z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center ${
              isActive('/') ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/markets"
            className={`flex flex-col items-center justify-center ${
              isActive('/markets') ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <i className="fas fa-chart-line text-lg mb-1"></i>
            <span className="text-xs">Markets</span>
          </Link>

          {/* WelthAI Button - Mobile */}
          <Link
            to="/welthai"
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className={`rounded-full p-4 bg-primary-600 shadow-lg ${
              isActive('/welthai') ? 'bg-primary-700' : 'bg-primary-600'
            }`}>
              <div className="flex items-center justify-center">
                <i className="fas fa-comment text-white text-xl"></i>
              </div>
            </div>
            <span className="text-xs mt-1 text-gray-400">WelthAI</span>
          </Link>

          {/* AI-Powered Stock Analysis */}
          <Link
            to="/stock/RELIANCE"
            className={`flex flex-col items-center justify-center ${
              isStockActive() ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <i className="fas fa-search-dollar text-lg mb-1"></i>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <span className="text-xs">Stocks</span>
              <SparklesIcon className="h-3 w-3 ml-0.5 text-purple-500" />
            </div>
          </Link>

          {/* Features Button - Replace Profile */}
          <button
            onClick={() => setShowFeaturesMenu(true)}
            className={`flex flex-col items-center justify-center ${
              isFeatureActive() ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <Bars3Icon className="h-6 w-6 mb-1" />
            <span className="text-xs">Features</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileFooterNav; 