import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SparklesIcon, Bars3Icon, ChartBarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const MobileFooterNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const isActive = (path: string) => location.pathname === path;
  const isFeatureActive = () => {
    const path = location.pathname;
    return path.startsWith('/ai-screener') || path.startsWith('/backtest');
  };

  const handleCloseMenu = () => {
    setShowExploreMenu(false);
  };

  const handleToggleMenu = () => {
    setShowExploreMenu(!showExploreMenu);
  };

  const handleNavigation = () => {
    setShowExploreMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-scroll feature carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Explore Popup Menu */}
      {showExploreMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCloseMenu}
          />

          {/* Menu */}
          <div className="fixed bottom-16 left-4 right-4 bg-[#1a1f2e] rounded-lg border border-gray-700 shadow-lg z-50 p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium">Explore</h3>
              <button
                onClick={handleCloseMenu}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Auto-Scrolling Feature Carousel */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl mb-4">
              <div
                className="flex transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${activeFeatureIndex * 100}%)` }}
              >
                {/* Welth AI Assistant Card */}
                <div className="w-full flex-shrink-0 p-2">
                  <Link
                    to="/welth-ai-assistant"
                    onClick={handleNavigation}
                    className="block p-5 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 shadow-2xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group"
                    style={{ minHeight: '180px' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <i className="fas fa-robot text-white text-xl"></i>
                        </div>
                        <div>
                          <h5 className="text-base font-bold text-white drop-shadow-lg">Welth AI Assistant</h5>
                          <p className="text-xs text-purple-100">Chat • Analyze • Learn</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/90 mb-3 leading-relaxed line-clamp-2">
                        Get instant insights, market analysis, and personalized trading recommendations.
                      </p>
                      <div className="flex items-center justify-center py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold text-sm shadow-lg border border-white/30 group-hover:bg-white/30 transition-all">
                        <i className="fas fa-comment-dots mr-2"></i>
                        Open Assistant →
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Welth AI Analysis Card */}
                <div className="w-full flex-shrink-0 p-2">
                  <Link
                    to="/ai-screener"
                    onClick={handleNavigation}
                    className="block p-5 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:via-blue-600 hover:to-cyan-600 shadow-2xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group"
                    style={{ minHeight: '180px' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <i className="fas fa-brain text-white text-xl"></i>
                        </div>
                        <div>
                          <h5 className="text-base font-bold text-white drop-shadow-lg">Welth AI Analysis</h5>
                          <p className="text-xs text-indigo-100">Predict • Forecast • Decide</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/90 mb-3 leading-relaxed line-clamp-2">
                        AI-powered market regime detection and predictive analysis for smarter trading.
                      </p>
                      <div className="flex items-center justify-center py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold text-sm shadow-lg border border-white/30 group-hover:bg-white/30 transition-all">
                        <i className="fas fa-chart-line mr-2"></i>
                        Start Analysis →
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Backtesting Card */}
                <div className="w-full flex-shrink-0 p-2">
                  <Link
                    to="/backtest"
                    onClick={handleNavigation}
                    className="block p-5 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 shadow-2xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group"
                    style={{ minHeight: '180px' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <i className="fas fa-flask text-white text-xl"></i>
                        </div>
                        <div>
                          <h5 className="text-base font-bold text-white drop-shadow-lg flex items-center gap-2">
                            Backtesting
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm text-white border border-white/50">Beta</span>
                          </h5>
                          <p className="text-xs text-green-100">Test • Validate • Optimize</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/90 mb-3 leading-relaxed line-clamp-2">
                        Test your trading strategies with historical data and optimize for better results.
                      </p>
                      <div className="flex items-center justify-center py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold text-sm shadow-lg border border-white/30 group-hover:bg-white/30 transition-all">
                        <i className="fas fa-play mr-2"></i>
                        Start Testing →
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeatureIndex(index)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      activeFeatureIndex === index ? 'bg-white w-8 shadow-lg' : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Explore Section — matches sidebar "Explore" */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Explore
              </h4>

              <Link
                to="/dashboard"
                className="flex items-center p-3 rounded-lg bg-gray-800/50 mb-2"
                onClick={handleNavigation}
              >
                <div className="mr-3 text-indigo-400">
                  <i className="fas fa-chart-line w-5"></i>
                </div>
                <div>
                  <div className="font-medium text-white">Dashboard</div>
                  <div className="text-xs text-gray-400">View saved strategies and account info</div>
                </div>
              </Link>

              <Link
                to="/stock"
                className="flex items-center p-3 rounded-lg bg-gray-800/50 mb-2"
                onClick={handleNavigation}
              >
                <div className="mr-3 text-blue-400">
                  <ChartBarIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-white">Stocks & Market</div>
                  <div className="text-xs text-gray-400">Top gainers, losers & market data</div>
                </div>
              </Link>

              <Link
                to="/feedback"
                className="flex items-center p-3 rounded-lg bg-gray-800/50 mb-2"
                onClick={handleNavigation}
              >
                <div className="mr-3 text-purple-400">
                  <i className="fas fa-comment-dots w-5"></i>
                </div>
                <div>
                  <div className="font-medium text-white">Feedback</div>
                  <div className="text-xs text-gray-400">Share your thoughts with us</div>
                </div>
              </Link>

              <Link
                to="/about"
                className="flex items-center p-3 rounded-lg bg-gray-800/50"
                onClick={handleNavigation}
              >
                <div className="mr-3 text-gray-400">
                  <i className="fas fa-info-circle w-5"></i>
                </div>
                <div>
                  <div className="font-medium text-white">About</div>
                  <div className="text-xs text-gray-400">Learn about WelthWest</div>
                </div>
              </Link>
            </div>

            {/* AI Features Section — matches sidebar "AI Features" */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                AI Features
              </h4>

              <Link
                to="/welth-ai-assistant"
                className="flex items-center p-3 rounded-lg bg-gray-800/50 mb-2"
                onClick={handleNavigation}
              >
                <div className="mr-3 text-purple-400">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-white">WelthAI Assistant</div>
                  <div className="text-xs text-gray-400">AI-powered conversational assistant</div>
                </div>
              </Link>

              <Link
                to="/ai-screener"
                className="flex items-center p-3 rounded-lg bg-gray-800/50 mb-2"
                onClick={handleNavigation}
              >
                <div className="mr-3 text-purple-400">
                  <SparklesIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-white">Welth Market Regime</div>
                  <div className="text-xs text-gray-400">ML-based market regime detection</div>
                </div>
              </Link>

              <Link
                to="/backtest"
                className="flex items-center p-3 rounded-lg bg-gray-800/50"
                onClick={handleNavigation}
              >
                <div className="mr-3 text-green-400">
                  <i className="fas fa-flask w-5"></i>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white flex items-center gap-2">
                    Backtesting
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-900/50 text-green-300 border border-green-700">Beta</span>
                  </div>
                  <div className="text-xs text-gray-400">Test & validate trading strategies</div>
                </div>
              </Link>
            </div>

            {/* Market Section */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Market
              </h4>

              <a
                href="https://strategy.welthwest.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 rounded-lg bg-gray-800/50 mb-2"
                onClick={handleCloseMenu}
              >
                <div className="mr-3 text-orange-400">
                  <i className="fas fa-chart-bar w-5"></i>
                </div>
                <div>
                  <div className="font-medium text-white">Strategy</div>
                  <div className="text-xs text-gray-400">Live trading strategies & performance</div>
                </div>
              </a>
            </div>

            {/* Account Section — only for authenticated users, matches sidebar */}
            {isAuthenticated && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Account
                </h4>

                <Link
                  to="/profile"
                  className="flex items-center p-3 rounded-lg bg-gray-800/50"
                  onClick={handleNavigation}
                >
                  <div className="mr-3 text-gray-400">
                    <i className="fas fa-user w-5"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white">Profile Settings</div>
                    <div className="text-xs text-gray-400">Manage your account</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1f2e] border-t border-gray-700 md:hidden z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex flex-col items-center justify-center ${
              isActive('/') ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/backtest"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex flex-col items-center justify-center ${
              isActive('/backtest') ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <i className="fas fa-vial text-lg mb-1"></i>
            <span className="text-xs">Backtest</span>
          </Link>

          {/* WelthAI Button - Mobile center */}
          <Link
            to="/ai-screener"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className={`rounded-full p-4 shadow-lg ${
              isActive('/ai-screener') ? 'bg-primary-700' : 'bg-primary-600'
            }`}>
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-400">WelthAI</span>
          </Link>

          {/* Strategy */}
          <a
            href="https://strategy.welthwest.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-gray-400 hover:text-primary-400"
          >
            <i className="fas fa-chart-line text-lg mb-1"></i>
            <span className="text-xs">Strategy</span>
          </a>

          {/* Explore Button */}
          <button
            onClick={handleToggleMenu}
            className={`flex flex-col items-center justify-center ${
              isFeatureActive() || showExploreMenu ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <Bars3Icon className="h-6 w-6 mb-1" />
            <span className="text-xs">Explore</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileFooterNav;
