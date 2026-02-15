import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { marketService } from '../services/api';
import ProfileInitialsAvatar from './account/ProfileInitialsAvatar';
import { SubdomainLink } from './SubdomainLink';
import UpgradeModal from './UpgradeModal';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

// Technical Analysis Interfaces
interface TechnicalIndicators {
  rsi: {
    values: number[];
    current: number;
    signal: 'buy' | 'sell' | 'neutral';
  };
  macd: {
    macd: number[];
    signal_line: number[];
    histogram: number[];
    current: {
      macd: number;
      signal: number;
      histogram: number;
    };
    trade_signal: 'buy' | 'sell' | 'neutral';
  };
  bollinger: {
    upper: number[];
    middle: number[];
    lower: number[];
    current: {
      upper: number;
      middle: number;
      lower: number;
      price: number;
    };
    signal: 'buy' | 'sell' | 'neutral';
  };
  ema: {
    values: number[];
    current: number;
    signal: 'buy' | 'sell' | 'neutral';
  };
  sma: {
    values: number[];
    current: number;
    signal: 'buy' | 'sell' | 'neutral';
  };
  stochastic: {
    k: number[];
    d: number[];
    current: {
      k: number;
      d: number;
    };
    signal: 'buy' | 'sell' | 'neutral';
  };
  atr: {
    values: number[];
    current: number;
    signal: 'neutral';
  };
  obv: {
    values: number[];
    current: number;
    signal: 'buy' | 'sell' | 'neutral';
  };
  vwap: {
    values: number[];
    current: number;
    signal: 'buy' | 'sell' | 'neutral';
  };
  pivot: {
    pivot: number;
    resistance1: number;
    resistance2: number;
    resistance3: number;
    support1: number;
    support2: number;
    support3: number;
    current_price: number;
    signal: 'buy' | 'sell' | 'neutral';
  };
  fibonacci: {
    high: number;
    low: number;
    levels: Record<string, number>;
    current_price: number;
    signal: 'buy' | 'sell' | 'neutral';
  };
}

interface MarketBreadth {
  advance_decline_ratio: number;
  advances: number;
  declines: number;
  new_highs: number;
  new_lows: number;
  total_stocks_analyzed: number;
}

interface SignalIndicator {
  name: string;
  signal: 'buy' | 'sell' | 'neutral';
  description: string;
}

const marketSectors = [
  { name: 'Technology', path: '/sectors/technology' },
  { name: 'Healthcare', path: '/sectors/healthcare' },
  { name: 'Financial', path: '/sectors/financial' },
  { name: 'Energy', path: '/sectors/energy' },
  { name: 'Consumer Goods', path: '/sectors/consumer-goods' },
];

const mainNavigation = [
  { name: 'Dashboard', path: '/dashboard', icon: 'chart-line' },
  { name: 'Stocks', path: '/stock', icon: 'search-dollar' },
];

// New Features section with categories
const featureNavigation = [
  {
    category: 'WelthAI bots',
    items: [
      { name: 'WelthAI Market Analysis', path: '/ai-screener', icon: 'brain' },
    ]
  },
  {
    category: 'Trading Tools',
    items: [
      { name: 'Backtest (Beta)', path: '/backtesting-beta', icon: 'chart-line' },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const { isAuthenticated, isAdmin, getToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState('RELIANCE.NS');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'market' | 'filters' | 'watchlist'>('market');
  const [technicalData, setTechnicalData] = useState<TechnicalIndicators | null>(null);
  const [marketBreadth, setMarketBreadth] = useState<MarketBreadth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalInfo, setUpgradeModalInfo] = useState({ featureName: '', message: '' });
  const { subscriptionTier } = useSubscription();

  // Mock watchlist data
  const watchlistItems = [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.' },
    { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.' },
    { id: 3, symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { id: 4, symbol: 'AMZN', name: 'Amazon.com Inc.' },
  ];
  
  // Mock saved analyses
  const savedAnalyses = [
    { id: 1, title: 'AAPL Q3 Performance', date: '2023-10-15' },
    { id: 2, title: 'Tech Sector Outlook', date: '2023-10-10' },
    { id: 3, title: 'Market Volatility Analysis', date: '2023-09-28' },
  ];
  
  // Calculate signals from technical data
  const calculateSignals = (data: TechnicalIndicators): SignalIndicator[] => {
    const signals: SignalIndicator[] = [];

    // RSI Signal
    if (data.rsi) {
      signals.push({
        name: 'RSI',
        signal: data.rsi.current > 70 ? 'sell' : data.rsi.current < 30 ? 'buy' : 'neutral',
        description: data.rsi.current > 70 ? 'Overbought' : data.rsi.current < 30 ? 'Oversold' : 'Neutral'
      });
    }

    // MACD Signal
    if (data.macd) {
      signals.push({
        name: 'MACD',
        signal: data.macd.trade_signal,
        description: data.macd.trade_signal === 'buy' ? 'MACD Bullish Crossover' : data.macd.trade_signal === 'sell' ? 'MACD Bearish Crossover' : 'MACD Neutral'
      });
    }

    // Bollinger Bands Signal
    if (data.bollinger) {
      const price = data.bollinger.current.price;
      signals.push({
        name: 'Bollinger',
        signal: price > data.bollinger.current.upper ? 'sell' : 
                price < data.bollinger.current.lower ? 'buy' : 'neutral',
        description: price > data.bollinger.current.upper ? 'Price above upper band' : 
                    price < data.bollinger.current.lower ? 'Price below lower band' : 'Within bands'
      });
    }

    // EMA Signal
    if (data.ema) {
      signals.push({
        name: 'EMA',
        signal: data.ema.signal,
        description: data.ema.signal === 'buy' ? 'Price above EMA' : data.ema.signal === 'sell' ? 'Price below EMA' : 'EMA Neutral'
      });
    }

    // SMA Signal
    if (data.sma) {
      signals.push({
        name: 'SMA',
        signal: data.sma.signal,
        description: data.sma.signal === 'buy' ? 'Price above SMA' : data.sma.signal === 'sell' ? 'Price below SMA' : 'SMA Neutral'
      });
    }

    // Stochastic Signal
    if (data.stochastic) {
      signals.push({
        name: 'Stochastic',
        signal: data.stochastic.signal,
        description: data.stochastic.signal === 'buy' ? 'Stochastic Oversold' : data.stochastic.signal === 'sell' ? 'Stochastic Overbought' : 'Stochastic Neutral'
      });
    }

    // ATR Signal
    if (data.atr) {
      signals.push({
        name: 'ATR',
        signal: data.atr.signal,
        description: `ATR: ${data.atr.current.toFixed(2)} - Use for SL/TP`
      });
    }

    // OBV Signal
    if (data.obv) {
      signals.push({
        name: 'OBV',
        signal: data.obv.signal,
        description: data.obv.signal === 'buy' ? 'OBV Rising' : data.obv.signal === 'sell' ? 'OBV Falling' : 'OBV Neutral'
      });
    }

    // VWAP Signal
    if (data.vwap) {
      signals.push({
        name: 'VWAP',
        signal: data.vwap.signal,
        description: data.vwap.signal === 'buy' ? 'Price above VWAP' : data.vwap.signal === 'sell' ? 'Price below VWAP' : 'VWAP Neutral'
      });
    }

    // Pivot Points Signal
    if (data.pivot) {
      signals.push({
        name: 'Pivot Points',
        signal: data.pivot.signal,
        description: data.pivot.signal === 'buy' ? 'Bounce from Support' : data.pivot.signal === 'sell' ? 'Rejection from Resistance' : 'Within Pivot Range'
      });
    }

    // Fibonacci Signal
    if (data.fibonacci) {
      signals.push({
        name: 'Fibonacci',
        signal: data.fibonacci.signal,
        description: data.fibonacci.signal === 'buy' ? 'Bounce from Fib Level' : data.fibonacci.signal === 'sell' ? 'Rejection from Fib Level' : 'Not near Fib Levels'
      });
    }

    return signals;
  };

  // Fetch technical indicators
  const fetchTechnicalData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Define default parameters for indicators
      const params = {
        rsi_period: 14,
        macd_fastperiod: 12,
        macd_slowperiod: 26,
        macd_signalperiod: 9,
        bb_period: 20,
        sma_period: 20,
        ema_period: 20,
        stoch_k_period: 14,
        stoch_d_period: 3,
        atr_period: 14
      };

      const response = await marketService.getTechnicalAnalysis(selectedStock, params);
      if (response.indicators) {
        setTechnicalData(response.indicators);
      } else {
        setError('No technical data available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch market breadth
  const fetchMarketBreadth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await marketService.getMarketIndices();
      if (response.market_breadth) {
        setMarketBreadth(response.market_breadth);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'market' && selectedStock) {
      fetchTechnicalData();
      fetchMarketBreadth();
    }
  }, [isAuthenticated, activeTab, selectedStock]);

  // Auto-scroll feature carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Format number to 2 decimal places
  const formatNumber = (num: number) => {
    return Number(num).toFixed(2);
  };

  const renderSignalIndicator = (signal: SignalIndicator) => (
    <div key={signal.name} className="flex items-center justify-between p-3 border-b dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div 
          className={`w-3 h-3 rounded-full ${
            signal.signal === 'buy' ? 'bg-green-500' :
            signal.signal === 'sell' ? 'bg-red-500' : 'bg-gray-400'
          }`}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{signal.name}</span>
      </div>
      <span className={`text-xs font-medium ${
        signal.signal === 'buy' ? 'text-green-500' :
        signal.signal === 'sell' ? 'text-red-500' : 'text-gray-400'
      }`}>
        {signal.description}
      </span>
    </div>
  );

  // Prevent event propagation
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSidebar();
  };

  // Handle navigation click
  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeSidebar();
  };

  // Handle upgrade modal
  const handleShowUpgrade = (featureName: string, message: string) => {
    setUpgradeModalInfo({ featureName, message });
    setShowUpgradeModal(true);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[70] md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed top-16 bottom-0 left-0 z-[80] w-80 md:w-80 bg-white/95 dark:bg-dark-100/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with User Info and Close Button */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            {/* User Info */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                <ProfileInitialsAvatar
                  firstName={user.first_name || ''}
                  lastName={user.last_name || ''}
                  className="w-8 h-8 text-xs"
                  noHover={true}
                />
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-gray-900 dark:text-white font-sans tracking-wide">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user.first_name || user.last_name || user.username || 'User'
                    }
                  </span>
                </div>
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={handleToggle}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Main Content with Scroll */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {/* Auto-Scrolling Feature Carousel */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div
                className="flex transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `translateX(-${activeFeatureIndex * 100}%)`,
                }}
              >
                {/* Welth AI Assistant Card */}
                <div className="w-full flex-shrink-0 p-2">
                  <Link
                    to="/welth-ai-assistant"
                    onClick={handleNavClick}
                    className="block p-5 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group"
                    style={{ minHeight: '200px' }}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <i className="fas fa-robot text-white text-2xl"></i>
                        </div>
                        <div>
                          <h5 className="text-base font-bold text-white drop-shadow-lg">Welth AI Assistant</h5>
                          <p className="text-xs text-purple-100">Chat • Analyze • Learn</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/90 mb-4 leading-relaxed line-clamp-2">
                        Get instant insights, market analysis, and personalized trading recommendations.
                      </p>
                      <div className="flex items-center justify-center py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold text-sm shadow-lg border border-white/30 group-hover:bg-white/30 transition-all">
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
                    onClick={handleNavClick}
                    className="block p-5 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:via-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-indigo-500/50 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group"
                    style={{ minHeight: '200px' }}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <i className="fas fa-brain text-white text-2xl"></i>
                        </div>
                        <div>
                          <h5 className="text-base font-bold text-white drop-shadow-lg">Welth AI Analysis</h5>
                          <p className="text-xs text-indigo-100">Predict • Forecast • Decide</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/90 mb-4 leading-relaxed line-clamp-2">
                        AI-powered market regime detection and predictive analysis for smarter trading.
                      </p>
                      <div className="flex items-center justify-center py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold text-sm shadow-lg border border-white/30 group-hover:bg-white/30 transition-all">
                        <i className="fas fa-chart-line mr-2"></i>
                        Start Analysis →
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Backtesting Card */}
                <div className="w-full flex-shrink-0 p-2">
                  <Link
                    to="/backtest-beta"
                    onClick={handleNavClick}
                    className="block p-5 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 shadow-2xl hover:shadow-green-500/50 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group"
                    style={{ minHeight: '200px' }}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <i className="fas fa-flask text-white text-2xl"></i>
                        </div>
                        <div>
                          <h5 className="text-base font-bold text-white drop-shadow-lg flex items-center gap-2">
                            Backtesting
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm text-white border border-white/50">Beta</span>
                          </h5>
                          <p className="text-xs text-green-100">Test • Validate • Optimize</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/90 mb-4 leading-relaxed line-clamp-2">
                        Test your trading strategies with historical data and optimize for better results.
                      </p>
                      <div className="flex items-center justify-center py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold text-sm shadow-lg border border-white/30 group-hover:bg-white/30 transition-all">
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
                      activeFeatureIndex === index
                        ? 'bg-white w-8 shadow-lg'
                        : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Section */}
            <div>
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Explore
              </h3>
              <nav className="mt-2 space-y-1">
                <Link
                  to="/dashboard"
                  onClick={handleNavClick}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all group"
                >
                  <i className="fas fa-chart-line mr-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"></i>
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/stock"
                  onClick={handleNavClick}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all group"
                >
                  <i className="fas fa-chart-bar mr-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"></i>
                  <span>Stocks & Market</span>
                </Link>

                <Link
                  to="/feedback"
                  onClick={handleNavClick}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-all group"
                >
                  <i className="fas fa-comment-dots mr-3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"></i>
                  <span>Feedback</span>
                </Link>
              </nav>
            </div>

            {/* AI Features Section */}
            <div>
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                AI Features
              </h3>
              <nav className="mt-2 space-y-1">
                <Link
                  to="/welth-ai-assistant"
                  onClick={handleNavClick}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-all group"
                >
                  <i className="fas fa-robot mr-3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"></i>
                  <span>Welth AI Assistant</span>
                </Link>

                <Link
                  to="/ai-screener"
                  onClick={handleNavClick}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all group"
                >
                  <i className="fas fa-brain mr-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"></i>
                  <span>Welth Market Regime</span>
                </Link>

                <Link
                  to="/backtest-beta"
                  onClick={handleNavClick}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-lg transition-all group"
                >
                  <i className="fas fa-flask mr-3 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"></i>
                  <span>Backtesting</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Beta</span>
                </Link>
              </nav>
            </div>

            {/* Local Testing Section - Only in development */}
            {process.env.NODE_ENV === 'development' && isAuthenticated && (
              <div className="border-2 border-dashed border-yellow-400 dark:border-yellow-600 rounded-lg p-2">
                <h3 className="px-2 py-1 text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider flex items-center">
                  <i className="fas fa-flask mr-2"></i>
                  Local Testing
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">DEV</span>
                </h3>
                <nav className="mt-2 space-y-1">
                  <SubdomainLink
                    subdomain="strategy"
                    showUpgradeModal={handleShowUpgrade}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all group border border-dashed border-blue-300 dark:border-blue-700"
                  >
                    <i className="fas fa-vial mr-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"></i>
                    <span>Test: Risk Strategy</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">:3001</span>
                  </SubdomainLink>

                  <SubdomainLink
                    subdomain="services"
                    showUpgradeModal={handleShowUpgrade}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-all group border border-dashed border-purple-300 dark:border-purple-700"
                  >
                    <i className="fas fa-vial mr-3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform"></i>
                    <span>Test: Market Services</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">:3002</span>
                  </SubdomainLink>
                </nav>
                <p className="mt-2 px-2 text-[10px] text-yellow-600 dark:text-yellow-400 italic">
                  <i className="fas fa-info-circle mr-1"></i>
                  These buttons test localhost auth flow. Start all servers before testing.
                </p>
              </div>
            )}

            {/* User Section */}
            {isAuthenticated && (
              <div>
                <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Account
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                  >
                    <i className="fas fa-user mr-3 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform"></i>
                    <span>Profile Settings</span>
                  </Link>
                </nav>
              </div>
            )}

            {/* Admin Section - Only visible to admin users */}
            {isAdmin && (
              <div>
                <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Administration
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link
                    to="/admin"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-shield-alt mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/admin/users"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-users mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Users</span>
                  </Link>

                  <Link
                    to="/admin/subscriptions"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-chart-line mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Subscriptions</span>
                  </Link>

                  <Link
                    to="/admin/transactions"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-credit-card mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Transactions</span>
                  </Link>

                  <Link
                    to="/admin/reports"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-file-alt mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Reports</span>
                  </Link>

                  <Link
                    to="/admin/content"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-newspaper mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Content</span>
                  </Link>

                  <Link
                    to="/admin/support-tickets"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-ticket-alt mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Support Tickets</span>
                  </Link>

                  <Link
                    to="/admin/create-ticket"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-plus-circle mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Create Ticket</span>
                  </Link>

                  <Link
                    to="/admin/activity-logs"
                    onClick={handleNavClick}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all group"
                  >
                    <i className="fas fa-history mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"></i>
                    <span>Activity Logs</span>
                  </Link>
                </nav>
              </div>
            )}
          </div>
           
          {/* Sidebar Footer - Auth Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200">
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  try {
                    await logout();
                    closeSidebar();
                    navigate('/login');
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  closeSidebar();
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login
              </button>
            )}
           </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={upgradeModalInfo.featureName}
        currentPlan={subscriptionTier || 'FREE'}
        upgradeMessage={upgradeModalInfo.message}
      />
    </>
  );
};

export default Sidebar; 