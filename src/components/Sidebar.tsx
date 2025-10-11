import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { marketService } from '../services/api';
import ProfileInitialsAvatar from './account/ProfileInitialsAvatar';

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
  { name: 'Stocks', path: '/stock/RELIANCE', icon: 'search-dollar' },
];

// New Features section with categories
const featureNavigation = [
  {
    category: 'WelthAI bots',
    items: [
      { name: 'WelthAI Market Analysis', path: '/welth-market-regime', icon: 'brain' },
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
  const { isAuthenticated, getToken, user, logout } = useAuth();
  const navigate = useNavigate();
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[70] md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed top-16 bottom-0 left-0 z-[80] w-80 md:w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with User Info and Close Button */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-700 bg-white dark:bg-gray-800">
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

                     {/* Navigation Links */}
           <div className="px-3 md:px-4 py-3 md:py-4 border-b border-gray-700 flex-1">
             <nav className="space-y-2">
               {mainNavigation.map((item) => (
                 <Link
                   key={item.path}
                   to={item.path}
                   onClick={handleNavClick}
                   className="flex items-center px-3 md:px-4 py-3 md:py-2 text-sm md:text-base text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all hover:shadow-lg hover:shadow-gray-900/50"
                 >
                   <i className={`fas fa-${item.icon} mr-2 md:mr-3 text-sm md:text-base`}></i>
                   {item.name}
                 </Link>
               ))}
               
               {/* Features Section */}
               <div className="mt-6">
                 <h3 className="px-3 md:px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Features
                 </h3>
                 
                 {featureNavigation.map((section, index) => (
                   <div key={section.category} className={index > 0 ? "mt-4" : ""}>
                     <h4 className="px-3 md:px-4 py-1 text-xs font-medium text-gray-400">
                       {section.category}
                     </h4>
                     {section.items.map((item) => (
                       <Link
                         key={item.path + item.name}
                         to={item.path}
                         onClick={handleNavClick}
                         className="flex items-center px-3 md:px-4 py-3 md:py-2 text-sm md:text-base text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all hover:shadow-lg hover:shadow-gray-900/50"
                       >
                         <i className={`fas fa-${item.icon} mr-2 md:mr-3 text-sm md:text-base`}></i>
                         {item.name}
                       </Link>
                     ))}
                   </div>
                 ))}
               </div>
               
               {/* Profile Link */}
               <Link
                 to="/profile"
                 onClick={handleNavClick}
                 className="flex items-center px-3 md:px-4 py-3 md:py-2 text-sm md:text-base text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all hover:shadow-lg hover:shadow-gray-900/50 mt-4"
               >
                 <i className="fas fa-user mr-2 md:mr-3 text-sm md:text-base"></i>
                 Profile
               </Link>
             </nav>
           </div>
           
           {/* Sidebar Footer - Auth Button */}
           <div className="p-3 md:p-4 border-t border-gray-700 mt-auto">
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
                 className="w-full flex items-center justify-center px-4 py-3 md:py-2 text-sm md:text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
               >
                 <i className="fas fa-sign-out-alt mr-1 md:mr-2 text-sm md:text-base"></i>
                 Logout
               </button>
             ) : (
               <button
                 onClick={() => {
                   closeSidebar();
                   navigate('/login');
                 }}
                 className="w-full flex items-center justify-center px-4 py-3 md:py-2 text-sm md:text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
               >
                 <i className="fas fa-sign-in-alt mr-1 md:mr-2 text-sm md:text-base"></i>
                 Login
               </button>
             )}
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 