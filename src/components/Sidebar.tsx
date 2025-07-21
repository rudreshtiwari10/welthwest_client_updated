import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { marketService } from '../services/api';

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
  { name: 'Markets', path: '/markets', icon: 'globe' },
  { name: 'Stocks', path: '/stock/RELIANCE', icon: 'search-dollar' },
  { name: 'Backtesting', path: '/backtesting', icon: 'chart-bar' },
  { name: 'Profile', path: '/profile', icon: 'user' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const { isAuthenticated, getToken, user } = useAuth();
  const [selectedStock, setSelectedStock] = useState('RELIANCE.NS');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'market' | 'filters' | 'watchlist'>('market');
  const [technicalData, setTechnicalData] = useState<TechnicalIndicators | null>(null);
  const [marketBreadth, setMarketBreadth] = useState<MarketBreadth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      const response = await marketService.getTechnicalAnalysis(selectedStock);
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

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-16 bottom-0 left-0 z-[80] w-[35vh] bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Close Button */}
          <div className="flex items-center justify-end p-4 border-b border-gray-700 bg-white dark:bg-gray-800">
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

          {/* Navigation Links */}
          <div className="px-4 py-4 border-b border-gray-700">
            <nav className="space-y-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all hover:shadow-lg hover:shadow-gray-900/50"
                >
                  <i className={`fas fa-${item.icon} mr-3`}></i>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-3 text-sm font-medium text-center transition-all hover:bg-gray-700/30 ${
                activeTab === 'market'
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('market')}
            >
              Market
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium text-center transition-all hover:bg-gray-700/30 ${
                activeTab === 'filters'
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('filters')}
            >
              Filters
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium text-center transition-all hover:bg-gray-700/30 ${
                activeTab === 'watchlist'
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('watchlist')}
            >
              Watchlist
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'market' && (
              <div>
                {isAuthenticated ? (
                  <>
                    {/* Stock Selector */}
                    <div className="p-4 border-b border-gray-700">
                      <select
                        value={selectedStock}
                        onChange={(e) => setSelectedStock(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 bg-[#2a2f3e] border border-gray-600
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                          rounded-md text-white transition-shadow hover:shadow-lg"
                      >
                        <option value="RELIANCE.NS">Reliance Industries</option>
                        <option value="TCS.NS">Tata Consultancy Services</option>
                        <option value="HDFCBANK.NS">HDFC Bank</option>
                        <option value="INFY.NS">Infosys</option>
                      </select>
                    </div>

                    {/* Technical Analysis */}
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Technical Analysis</h3>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                      ) : error ? (
                        <div className="text-red-500 text-center py-4 text-xs">{error}</div>
                      ) : technicalData && (
                        <div className="space-y-2">
                          {calculateSignals(technicalData).map(renderSignalIndicator)}
                        </div>
                      )}
                    </div>

                    {/* Technical Indicators Summary */}
                    {technicalData && !isLoading && !error && (
                      <div className="p-4 border-b border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Indicators Summary</h3>
                        <div className="space-y-2">
                          {/* RSI */}
                          {technicalData.rsi && (
                            <div className="flex justify-between items-center hover:bg-gray-700/30 p-2 rounded-md transition-all">
                              <span className="text-xs text-gray-400">RSI (14)</span>
                              <span className={`text-xs font-medium ${
                                technicalData.rsi.current < 30 ? 'text-green-400' :
                                technicalData.rsi.current > 70 ? 'text-red-400' : 'text-gray-300'
                              }`}>
                                {technicalData.rsi.current.toFixed(2)}
                              </span>
                            </div>
                          )}
                          
                          {/* MACD */}
                          {technicalData.macd && (
                            <div className="flex justify-between items-center hover:bg-gray-700/30 p-2 rounded-md transition-all">
                              <span className="text-xs text-gray-400">MACD</span>
                              <span className={`text-xs font-medium ${
                                technicalData.macd.current.histogram > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {technicalData.macd.current.histogram.toFixed(4)}
                              </span>
                            </div>
                          )}
                          
                          {/* Bollinger Bands */}
                          {technicalData.bollinger && (
                            <div className="flex justify-between items-center hover:bg-gray-700/30 p-2 rounded-md transition-all">
                              <span className="text-xs text-gray-400">BB Position</span>
                              <span className="text-xs text-gray-300">
                                {((technicalData.bollinger.current.price - technicalData.bollinger.current.lower) / 
                                  (technicalData.bollinger.current.upper - technicalData.bollinger.current.lower) * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          
                          {/* Stochastic */}
                          {technicalData.stochastic && (
                            <div className="flex justify-between items-center hover:bg-gray-700/30 p-2 rounded-md transition-all">
                              <span className="text-xs text-gray-400">Stochastic</span>
                              <span className={`text-xs font-medium ${
                                technicalData.stochastic.current.k < 20 ? 'text-green-400' :
                                technicalData.stochastic.current.k > 80 ? 'text-red-400' : 'text-gray-300'
                              }`}>
                                {technicalData.stochastic.current.k.toFixed(1)}
                              </span>
                            </div>
                          )}
                          
                          {/* ATR */}
                          {technicalData.atr && (
                            <div className="flex justify-between items-center hover:bg-gray-700/30 p-2 rounded-md transition-all">
                              <span className="text-xs text-gray-400">ATR (14)</span>
                              <span className="text-xs text-gray-300">
                                {technicalData.atr.current.toFixed(2)}
                              </span>
                            </div>
                          )}
                          
                          {/* VWAP */}
                          {technicalData.vwap && (
                            <div className="flex justify-between items-center hover:bg-gray-700/30 p-2 rounded-md transition-all">
                              <span className="text-xs text-gray-400">VWAP</span>
                              <span className="text-xs text-gray-300">
                                {technicalData.vwap.current.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Market Sectors */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Market Sectors</h3>
                      <div className="space-y-2">
                        {marketSectors.map((sector) => (
                          <Link
                            key={sector.name}
                            to={sector.path}
                            className="block px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all hover:shadow-lg hover:shadow-gray-900/50"
                          >
                            {sector.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-4">Sign in to view market analysis</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-900/50"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'filters' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Market Cap
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="large-cap" className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                      <label htmlFor="large-cap" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Large Cap
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="mid-cap" className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                      <label htmlFor="mid-cap" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Mid Cap
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="small-cap" className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
                      <label htmlFor="small-cap" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Small Cap
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sector
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600
                      focus:outline-none focus:ring-primary-500 focus:border-primary-500
                      bg-white dark:bg-dark-400 rounded-md dark:text-white"
                  >
                    <option value="">All Sectors</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="financials">Financials</option>
                    <option value="consumer">Consumer</option>
                    <option value="industrials">Industrials</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600
                        focus:outline-none focus:ring-primary-500 focus:border-primary-500
                        bg-white dark:bg-dark-400 rounded-md dark:text-white"
                    />
                    <span className="text-gray-500 dark:text-gray-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600
                        focus:outline-none focus:ring-primary-500 focus:border-primary-500
                        bg-white dark:bg-dark-400 rounded-md dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'watchlist' && (
              <div>
                {isAuthenticated ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">My Watchlist</h3>
                      <button className="text-primary-600 hover:text-primary-700 text-sm">
                        + Add
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {watchlistItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-md">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{item.symbol}</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.name}</p>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Sign in to create and manage your watchlist</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-900/50"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">StockInsight v1.0</span>
              <a href="#" className="text-xs text-primary-400 hover:text-primary-300">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 