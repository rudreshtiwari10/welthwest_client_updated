import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { backtestingService } from '../services/backtesting';
import { marketService, activityService } from '../services/api';
import { motion } from 'framer-motion';
import { ChartBarIcon, CogIcon, PlayIcon, DocumentTextIcon, BoltIcon } from '@heroicons/react/24/outline';
import UsageTracker from '../components/subscription/UsageTracker';
import LoginModal from '../components/LoginModal';
import TutorialVideoSection from '../components/TutorialVideoSection';
import { trackEvent } from '../utils/analytics';
import useSessionStorage from '../hooks/useSessionStorage';
const Plot = require('react-plotly.js').default as React.ComponentType<any>;

// Helper function to parse chart data
const simplifyChartData = (chartDataStr: string) => {
  try {
    const chartData = JSON.parse(chartDataStr);

    // With the new multi-panel layout, all indicators are in separate panels
    // so we want them all visible by default. Users can still toggle them off via legend.
    // No need to hide indicators anymore since each has its own dedicated panel.

    return chartData;
  } catch (error) {
    console.error('Error parsing chart data:', error);
    // Return original data if parsing fails
    return JSON.parse(chartDataStr);
  }
};

// Types for the comprehensive backtesting response
interface BacktestMetrics {
  Total_Return: number;
  Total_Return_Pct: number;
  Number_of_Trades: number;
  Win_Rate: number;
  Average_Win: number;
  Average_Loss: number;
  Profit_Factor: number;
  Max_Drawdown: number;
  Sharpe_Ratio: number;
  Sortino_Ratio: number;
  Calmar_Ratio: number;
  Best_Trade: number;
  Worst_Trade: number;
  Average_Trade: number;
  Total_Profits: number;
  Total_Losses: number;
}

interface Trade {
  Entry_Date: string;
  Exit_Date: string;
  Entry_Price: number;
  Exit_Price: number;
  Position_Size: number;
  Direction: 'Long' | 'Short';
  PnL: number;
  Return_Pct: number;
  Exit_Reason: string;
}

interface EquityPoint {
  Date: string;
  Equity: number;
  Capital: number;
  Position: number;
  Price: number;
  Drawdown: number;
}

interface MonteCarloStats {
  Mean_Return: number;
  Std_Return: number;
  Min_Return: number;
  Max_Return: number;
  'VaR_95.0%': number;
  'CVaR_95.0%': number;
  Confidence_Interval_Lower: number;
  Confidence_Interval_Upper: number;
  Probability_of_Loss: number;
}

interface BacktestResult {
  metrics: BacktestMetrics;
  trades: Trade[];
  equity_curve: EquityPoint[];
  stock_data: any[];
  charts: {
    candlestick: string;
    equity_curve: string;
    drawdown: string;
  };
  monte_carlo?: {
    statistics: MonteCarloStats;
    results: any[];
  };
  summary: {
    symbol: string;
    period: string;
    timeframe: string;
    total_data_points: number;
    indicators_used: string[];
    voting_threshold: number;
    backtest_period: {
      start_date: string;
      end_date: string;
    };
  };
}

interface BacktestParams {
  stock_symbol: string;
  selected_indicators: {
    [key: string]: any;
  };
  voting_threshold: number;
  period: string;
  timeframe: string;
  initial_capital: number;
  position_size_pct: number;
  risk_reward_ratio: number;
  max_drawdown_pct: number;
  monte_carlo_simulations: number;
  confidence_level: number;
}

// IndicatorChip component for better UX
interface IndicatorChipProps {
  indicatorKey: string;
  indicator: { name: string; hasParams: boolean };
  config: any;
  onRemove: () => void;
  onUpdateParam: (param: string, value: any) => void;
  renderForm: () => React.ReactNode;
}

const IndicatorChip: React.FC<IndicatorChipProps> = ({
  indicatorKey,
  indicator,
  config,
  onRemove,
  onUpdateParam,
  renderForm
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showParams, setShowParams] = useState(false);

  const getDefaultDisplayValues = () => {
    switch (indicatorKey) {
      case 'RSI':
        return `Period: ${config.period || 14}, OS: ${config.oversold || 30}, OB: ${config.overbought || 70}`;
      case 'MACD':
        return `Fast: ${config.fast_period || 12}, Slow: ${config.slow_period || 26}, Signal: ${config.signal_period || 9}`;
      case 'Bollinger_Bands':
        return `Period: ${config.period || 20}, StdDev: ${config.std_dev || 2}`;
      case 'Stochastic':
        return `K: ${config.k_period || 14}, D: ${config.d_period || 3}`;
      case 'SMA':
        return `Periods: ${config.periods?.join(', ') || '20, 50'}`;
      case 'ADX':
        return `Period: ${config.period || 14}, Threshold: ${config.threshold || 25}`;
      case 'Williams_R':
        return `Period: ${config.period || 14}`;
      default:
        return 'Default values';
    }
  };

  return (
    <div className="relative">
      <div 
        className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
          isExpanded
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {indicator.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {getDefaultDisplayValues()}
            </p>
          </div>
          
          {/* Expand/Collapse Icon */}
          {indicator.hasParams && (
            <div className="ml-2">
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
          
          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-2 p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
            title="Remove indicator"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Expandable Parameter Form */}
      {isExpanded && indicator.hasParams && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 sm:p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
              {indicator.name} Parameters
            </h5>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            {renderForm()}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-end">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BacktestingBetaPage: React.FC = () => {
  const { user, getToken } = useAuth();
  const { canUseBacktest, incrementBacktestUsage, subscriptionDetails } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useSessionStorage<BacktestResult | null>('backtesting-beta-result', null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useSessionStorage<'parameters' | 'results' | 'charts'>('backtesting-beta-tab', 'parameters');
  const [stockSearch, setStockSearch] = useState('');
  const [showStockSuggestions, setShowStockSuggestions] = useState(false);
  
  // Anonymous usage tracking
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [anonymousUsage, setAnonymousUsage] = useState({
    remainingTests: 10, // Default, will be updated from backend
    totalLimit: 10, // Default, will be updated from backend
    sessionId: null as string | null
  });

  // Save state
  const [saveStatus, setSaveStatus] = useState<{saving: boolean, success?: boolean, message?: string}>({saving: false});
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [strategyName, setStrategyName] = useState<string>('');

  // Fetch anonymous usage on component mount
  useEffect(() => {
    if (!user) {
      fetchAnonymousUsage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAnonymousUsage = async () => {
    try {
      const usageData = await marketService.getAnonymousUsage();
      if (usageData.features) {
        const backtestUsage = usageData.features['backtest-beta'];
        if (backtestUsage) {
          setAnonymousUsage(prev => ({
            ...prev,
            remainingTests: backtestUsage.remaining,
            totalLimit: backtestUsage.limit
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching anonymous usage:', error);
      // Keep default values on error
    }
  };

  // Handle opening save modal
  const handleSaveBacktest = () => {
    if (!result) return;
    setShowSaveModal(true);
    setStrategyName(`${params.stock_symbol} Strategy - ${new Date().toLocaleDateString()}`);
  };

  // Handle confirming save with strategy name
  const handleConfirmSave = async () => {
    if (!result || !strategyName.trim()) return;
    
    try {
      setSaveStatus({ saving: true });
      setShowSaveModal(false);
      
      // Prepare backtest data to save with all relevant parameters and results
      const backtest_data = {
        // Original input parameters
        stock_symbol: params.stock_symbol,
        selected_indicators: params.selected_indicators,
        voting_threshold: params.voting_threshold,
        period: params.period,
        timeframe: params.timeframe,
        initial_capital: params.initial_capital,
        position_size_pct: params.position_size_pct,
        risk_reward_ratio: params.risk_reward_ratio,
        max_drawdown_pct: params.max_drawdown_pct,
        monte_carlo_simulations: params.monte_carlo_simulations,
        confidence_level: params.confidence_level,
        
        // Complete results data structure
        results: result,
        metrics: result.metrics,
        trades: result.trades,
        equity_curve: result.equity_curve,
        stock_data: result.stock_data,
        charts: result.charts,
        monte_carlo: result.monte_carlo,
        summary: result.summary,
        
        // Metadata
        timestamp: new Date().toISOString(),
        name: strategyName.trim(),
        strategy_type: 'beta_backtest'
      };
      
      // Import backtesting service
      const { backtestingService } = await import('../services/backtesting');
      
      // Save backtest result
      const response = await backtestingService.saveBacktestResult(backtest_data);
      
      setSaveStatus({ 
        saving: false, 
        success: response.success, 
        message: response.message 
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus({ saving: false });
      }, 3000);
      
    } catch (error) {
      setSaveStatus({ 
        saving: false, 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to save backtest' 
      });
    }
  };

  // Form state
  const [params, setParams] = useSessionStorage<BacktestParams>('backtesting-beta-params', {
    stock_symbol: 'RELIANCE',
    selected_indicators: {
      RSI: {
        period: 14,
        oversold: 30,
        overbought: 70
      },
      MACD: {
        fast_period: 12,
        slow_period: 26,
        signal_period: 9
      },
      Bollinger_Bands: {
        period: 20,
        std_dev: 2
      },
      Stochastic: {
        k_period: 14,
        d_period: 3,
        oversold: 20,
        overbought: 80
      },
      SMA: {
        periods: [20, 50]
      }
    },
    voting_threshold: 0.6,
    period: '1y',
    timeframe: '1d',
    initial_capital: 100000,
    position_size_pct: 0.1,
    risk_reward_ratio: 2.0,
    max_drawdown_pct: 0.05,
    monte_carlo_simulations: 1000,
    confidence_level: 0.95
  });

  const availableIndicators: { [key: string]: { name: string; hasParams: boolean } } = {
    RSI: { name: 'Relative Strength Index', hasParams: true },
    MACD: { name: 'MACD', hasParams: true },
    Bollinger_Bands: { name: 'Bollinger Bands', hasParams: true },
    Stochastic: { name: 'Stochastic Oscillator', hasParams: true },
    SMA: { name: 'Simple Moving Average', hasParams: true },
    ADX: { name: 'Average Directional Index', hasParams: true },
    Williams_R: { name: 'Williams %R', hasParams: true }
  };

  const stockOptions = [
    { value: 'RELIANCE', label: 'Reliance Industries' },
    { value: 'TCS', label: 'Tata Consultancy Services' },
    { value: 'HDFCBANK', label: 'HDFC Bank' },
    { value: 'INFY', label: 'Infosys' },
    { value: 'ICICIBANK', label: 'ICICI Bank' },
    { value: 'HINDUNILVR', label: 'Hindustan Unilever' },
    { value: 'ITC', label: 'ITC Limited' },
    { value: 'SBIN', label: 'State Bank of India' },
    { value: 'BHARTIARTL', label: 'Bharti Airtel' },
    { value: 'ASIANPAINT', label: 'Asian Paints' }
  ];

  const runBacktest = async () => {
    // Check if user is logged in
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Track activity
      activityService.trackActivity(activityService.FEATURE_BACKTEST);

      // Track backtest start event
      trackEvent('backtest_started', {
        symbol: params.stock_symbol,
        period: params.period,
        indicators: Object.keys(params.selected_indicators),
        user_type: user ? 'authenticated' : 'anonymous'
      });

      // Check if user is authenticated
      if (!user) {
        // Anonymous user - check remaining tests
        if (anonymousUsage.remainingTests <= 0) {
          trackEvent('backtest_limit_reached', { user_type: 'anonymous' });
          setShowLoginModal(true);
          setIsLoading(false);
          return;
        }

        // Don't decrement here - backend will handle it and return updated usage
      } else {
        // Authenticated user - check subscription limits
        if (!canUseBacktest()) {
          trackEvent('backtest_limit_reached', { user_type: 'authenticated', subscription_tier: subscriptionDetails?.tier });
          setShowLimitModal(true);
          setIsLoading(false);
          return;
        }
        
        // Increment usage for authenticated users
        await incrementBacktestUsage();
      }

      let data: any;
      if (!user) {
        // Use anonymous API for non-authenticated users (cookie-based, no sessionId needed)
        data = await marketService.anonymousBacktest(params);

        // Update usage information if provided
        if (data.usage) {
          setAnonymousUsage(prev => ({
            ...prev,
            remainingTests: data.usage.remaining ?? prev.remainingTests
          }));
        }
      } else {
        // Use regular authenticated API
        data = await backtestingService.runNewBacktest(params);
      }
      setResult(data.data || data);
      setActiveTab('results');
      
      // Track successful backtest completion
      trackEvent('backtest_completed', {
        symbol: params.stock_symbol,
        period: params.period,
        indicators: Object.keys(params.selected_indicators),
        user_type: user ? 'authenticated' : 'anonymous',
        total_return: data?.data?.metrics?.Total_Return || data?.metrics?.Total_Return,
        number_of_trades: data?.data?.metrics?.Number_of_Trades || data?.metrics?.Number_of_Trades
      });
    } catch (err: any) {
      // Track backtest error
      trackEvent('backtest_error', {
        symbol: params.stock_symbol,
        user_type: user ? 'authenticated' : 'anonymous',
        error_type: err.response?.status === 403 ? 'limit_exceeded' : 'api_error'
      });

      // Handle anonymous limit exceeded
      if (err.response?.status === 403 && err.response?.data?.login_required) {
        setAnonymousUsage(prev => ({
          ...prev,
          remainingTests: 0
        }));
        setShowLoginModal(true);
        setIsLoading(false);
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateIndicatorParam = (indicator: string, param: string, value: any) => {
    setParams(prev => ({
      ...prev,
      selected_indicators: {
        ...prev.selected_indicators,
        [indicator]: {
          ...prev.selected_indicators[indicator],
          [param]: value
        }
      }
    }));
  };

  const toggleIndicator = (indicator: string) => {
    setParams(prev => {
      const newIndicators = { ...prev.selected_indicators };
      if (newIndicators[indicator]) {
        delete newIndicators[indicator];
      } else {
        // Add default parameters for the indicator
        const defaultParams = getDefaultParams(indicator);
        newIndicators[indicator] = defaultParams;
      }
      return {
        ...prev,
        selected_indicators: newIndicators
      };
    });
  };

  const getDefaultParams = (indicator: string) => {
    const defaults: { [key: string]: any } = {
      RSI: { period: 14, oversold: 30, overbought: 70 },
      MACD: { fast_period: 12, slow_period: 26, signal_period: 9 },
      Bollinger_Bands: { period: 20, std_dev: 2 },
      Stochastic: { k_period: 14, d_period: 3, oversold: 20, overbought: 80 },
      SMA: { periods: [20, 50] },
      ADX: { period: 14, threshold: 25 },
      Williams_R: { period: 14, oversold: -80, overbought: -20 }
    };
    return defaults[indicator] || {};
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(num);
  };

  const renderIndicatorForm = (indicator: string, config: any) => {
    if (indicator === 'RSI') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Period</label>
            <input
              type="number"
              value={config.period}
              onChange={(e) => updateIndicatorParam(indicator, 'period', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Oversold</label>
              <input
                type="number"
                value={config.oversold}
                onChange={(e) => updateIndicatorParam(indicator, 'oversold', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overbought</label>
              <input
                type="number"
                value={config.overbought}
                onChange={(e) => updateIndicatorParam(indicator, 'overbought', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

    if (indicator === 'MACD') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fast Period</label>
              <input
                type="number"
                value={config.fast_period}
                onChange={(e) => updateIndicatorParam(indicator, 'fast_period', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slow Period</label>
              <input
                type="number"
                value={config.slow_period}
                onChange={(e) => updateIndicatorParam(indicator, 'slow_period', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Signal Period</label>
              <input
                type="number"
                value={config.signal_period}
                onChange={(e) => updateIndicatorParam(indicator, 'signal_period', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

    if (indicator === 'SMA') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Periods (comma-separated)</label>
            <input
              type="text"
              value={config.periods?.join(', ') || ''}
              onChange={(e) => {
                const periods = e.target.value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                updateIndicatorParam(indicator, 'periods', periods);
              }}
              placeholder="20, 50, 200"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      );
    }

    if (indicator === 'Bollinger_Bands') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Period</label>
              <input
                type="number"
                value={config.period}
                onChange={(e) => updateIndicatorParam(indicator, 'period', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Std Deviation</label>
              <input
                type="number"
                step="0.1"
                value={config.std_dev}
                onChange={(e) => updateIndicatorParam(indicator, 'std_dev', parseFloat(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

    if (indicator === 'Stochastic') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">K Period</label>
              <input
                type="number"
                value={config.k_period}
                onChange={(e) => updateIndicatorParam(indicator, 'k_period', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">D Period</label>
              <input
                type="number"
                value={config.d_period}
                onChange={(e) => updateIndicatorParam(indicator, 'd_period', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Oversold</label>
              <input
                type="number"
                value={config.oversold}
                onChange={(e) => updateIndicatorParam(indicator, 'oversold', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overbought</label>
              <input
                type="number"
                value={config.overbought}
                onChange={(e) => updateIndicatorParam(indicator, 'overbought', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

    if (indicator === 'ADX') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Period</label>
              <input
                type="number"
                value={config.period}
                onChange={(e) => updateIndicatorParam(indicator, 'period', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
              <input
                type="number"
                value={config.threshold}
                onChange={(e) => updateIndicatorParam(indicator, 'threshold', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

    if (indicator === 'Williams_R') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Period</label>
            <input
              type="number"
              value={config.period}
              onChange={(e) => updateIndicatorParam(indicator, 'period', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Oversold</label>
              <input
                type="number"
                value={config.oversold}
                onChange={(e) => updateIndicatorParam(indicator, 'oversold', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overbought</label>
              <input
                type="number"
                value={config.overbought}
                onChange={(e) => updateIndicatorParam(indicator, 'overbought', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

    // Add more indicator forms as needed
    return <div className="text-sm text-gray-500">No additional parameters</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-8 sm:pb-12">
        {/* Header */}
        <div className="relative mb-8 sm:mb-12 mt-8 sm:mt-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Backtest (Beta)
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-2">
              Comprehensive backtesting with advanced analytics and visualization
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Beta Version - Enhanced Features
            </div>
          </div>

          {/* Login Prompt for Non-Authenticated Users */}
          {!user && (
            <div className="absolute top-0 right-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg px-4 py-3 text-white">
              <div className="flex items-center space-x-3">
                <BoltIcon className="h-5 w-5" />
                <div>
                  <div className="font-semibold text-sm">Login to Use This Feature</div>
                  <div className="text-xs opacity-90">Sign in to access Backtesting</div>
                </div>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 bg-white text-blue-600 hover:bg-opacity-90 rounded-md text-sm font-medium transition-all whitespace-nowrap shadow-md"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <nav className="flex space-x-2 sm:space-x-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 sm:p-2" aria-label="Tabs">
            {[
              { id: 'parameters', name: 'Parameters', icon: CogIcon },
              { id: 'results', name: 'Results', icon: DocumentTextIcon },
              { id: 'charts', name: 'Charts', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                } whitespace-nowrap py-2 sm:py-3 px-3 sm:px-6 rounded-md font-medium text-xs sm:text-sm flex items-center transition-colors duration-200`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Parameters Tab */}
        {activeTab === 'parameters' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                
                {/* Basic Parameters */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Parameters</h3>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Symbol
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={stockSearch || params.stock_symbol}
                        onChange={(e) => {
                          setStockSearch(e.target.value);
                          setShowStockSuggestions(true);
                          if (e.target.value) {
                            setParams(prev => ({ ...prev, stock_symbol: e.target.value.toUpperCase() }));
                          }
                        }}
                        onFocus={() => setShowStockSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowStockSuggestions(false), 200)}
                        placeholder="Search for stocks (e.g., RELIANCE, TCS)"
                        className="block w-full pl-10 pr-4 py-2.5 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    {/* Stock Suggestions */}
                    {showStockSuggestions && stockSearch && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                        {stockOptions
                          .filter(option => 
                            option.label.toLowerCase().includes(stockSearch.toLowerCase()) ||
                            option.value.toLowerCase().includes(stockSearch.toLowerCase())
                          )
                          .map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setParams(prev => ({ ...prev, stock_symbol: option.value }));
                                setStockSearch('');
                                setShowStockSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600"
                            >
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">{option.value}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{option.label}</span>
                              </div>
                            </button>
                          ))
                        }
                        {stockOptions.filter(option => 
                          option.label.toLowerCase().includes(stockSearch.toLowerCase()) ||
                          option.value.toLowerCase().includes(stockSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No stocks found. You can still enter a custom symbol.
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Search for stocks or enter a symbol directly. Current: <span className="font-medium">{params.stock_symbol}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Period
                      </label>
                      <div className="relative">
                        <select
                          value={params.period}
                          onChange={(e) => setParams(prev => ({ ...prev, period: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pl-4 pr-10 py-2.5 appearance-none"
                        >
                          <option value="1mo">1 Month</option>
                          <option value="3mo">3 Months</option>
                          <option value="6mo">6 Months</option>
                          <option value="1y">1 Year</option>
                          <option value="2y">2 Years</option>
                          <option value="5y">5 Years</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Historical data timespan</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timeframe
                      </label>
                      <div className="relative">
                        <select
                          value={params.timeframe}
                          onChange={(e) => setParams(prev => ({ ...prev, timeframe: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pl-4 pr-10 py-2.5 appearance-none"
                        >
                          <option value="1d">1 Day</option>
                          <option value="1h">1 Hour</option>
                          <option value="30m">30 Minutes</option>
                          <option value="15m">15 Minutes</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Candle interval</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Capital (₹)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        value={params.initial_capital}
                        onChange={(e) => setParams(prev => ({ ...prev, initial_capital: parseFloat(e.target.value) }))}
                        className="block w-full pl-8 pr-4 py-2.5 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="1000"
                        step="1000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Starting amount for backtesting</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position Size (% of capital)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="1"
                        value={params.position_size_pct}
                        onChange={(e) => setParams(prev => ({ ...prev, position_size_pct: parseFloat(e.target.value) }))}
                        className="block w-full pr-10 py-2.5 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Percentage of capital to use per trade (0.1 = 10%)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Voting Threshold
                    </label>
                    <div className="mt-1">
                      <input
                        type="range"
                        step="0.1"
                        min="0.1"
                        max="1"
                        value={params.voting_threshold}
                        onChange={(e) => setParams(prev => ({ ...prev, voting_threshold: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1 mt-1">
                        <span>0.1</span>
                        <span>0.5</span>
                        <span>1.0</span>
                      </div>
                      <div className="text-center mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        {params.voting_threshold.toFixed(1)}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Percentage of indicators needed for signal (0.6 = 60%)</p>
                  </div>
                  
                  {/* Proactive Warning for High Threshold */}
                  {Object.keys(params.selected_indicators).length > 2 && params.voting_threshold > 0.7 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                            ⚠️ High Voting Threshold Warning
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            You have {Object.keys(params.selected_indicators).length} indicators with {(params.voting_threshold * 100).toFixed(0)}% threshold. 
                            This means <strong>{Math.ceil(Object.keys(params.selected_indicators).length * params.voting_threshold)} out of {Object.keys(params.selected_indicators).length}</strong> indicators must agree for a signal.
                            This might result in very few or no trading signals.
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                            💡 Tip: Consider lowering to 50-60% for better signal generation, or use fewer complementary indicators.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Indicators */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Technical Indicators</h3>
                  </div>
                  
                  {/* Add Indicator Dropdown */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Indicator
                    </label>
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          if (e.target.value && !params.selected_indicators[e.target.value]) {
                            toggleIndicator(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pl-4 pr-10 py-2.5 appearance-none"
                      >
                        <option value="">Select an indicator to add...</option>
                        {Object.entries(availableIndicators)
                          .filter(([key]) => !params.selected_indicators[key])
                          .map(([key, indicator]) => (
                            <option key={key} value={key}>
                              {indicator.name}
                            </option>
                          ))
                        }
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicator Pool Container */}
                  <div className="min-h-[200px] bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    {Object.keys(params.selected_indicators).length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0124 30c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm">No indicators selected</p>
                        <p className="text-xs">Use the dropdown above to add technical indicators</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(params.selected_indicators).map(([key, config]) => {
                          const indicator = availableIndicators[key];
                          if (!indicator) return null;
                          
                          return (
                            <IndicatorChip 
                              key={key} 
                              indicatorKey={key}
                              indicator={indicator}
                              config={config}
                              onRemove={() => toggleIndicator(key)}
                              onUpdateParam={(param, value) => updateIndicatorParam(key, param, value)}
                              renderForm={() => renderIndicatorForm(key, config)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Parameters</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Risk-Reward Ratio
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.risk_reward_ratio}
                      onChange={(e) => setParams(prev => ({ ...prev, risk_reward_ratio: parseFloat(e.target.value) }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Drawdown (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={params.max_drawdown_pct * 100}
                      onChange={(e) => setParams(prev => ({ ...prev, max_drawdown_pct: parseFloat(e.target.value) / 100 }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monte Carlo Simulations
                    </label>
                    <input
                      type="number"
                      value={params.monte_carlo_simulations}
                      onChange={(e) => setParams(prev => ({ ...prev, monte_carlo_simulations: parseInt(e.target.value) }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Run Backtest Button */}
              <div className="mt-8 sm:mt-10 flex justify-center">
                <button
                  onClick={runBacktest}
                  disabled={isLoading || Object.keys(params.selected_indicators).length === 0}
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  ) : (
                    <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                  )}
                  {isLoading ? 'Running Backtest...' : 'Run Backtest'}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-5 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-8">
              {/* Save Strategy Button */}
              {user && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Backtest Results</h2>
                  <button
                    onClick={handleSaveBacktest}
                    disabled={saveStatus.saving}
                    className={`px-4 py-2 rounded-md ${
                      saveStatus.saving ? 'bg-gray-400' : 
                      saveStatus.success === true ? 'bg-green-500' : 
                      saveStatus.success === false ? 'bg-red-500' : 
                      'bg-blue-600 hover:bg-blue-700'
                    } text-white transition-colors`}
                  >
                    {saveStatus.saving ? 'Saving...' : 
                     saveStatus.success === true ? 'Saved!' : 
                     saveStatus.success === false ? 'Failed to Save' : 
                     'Save Strategy'}
                  </button>
                </div>
              )}
              
              {saveStatus.message && (
                <div className={`p-3 rounded-md ${saveStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {saveStatus.message}
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Return</h3>
                  <p className={`text-xl sm:text-2xl font-bold ${result.metrics.Total_Return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(result.metrics.Total_Return)}
                  </p>
                  <p className={`text-sm ${result.metrics.Total_Return_Pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.metrics.Total_Return_Pct.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</h3>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {result.metrics.Win_Rate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.metrics.Number_of_Trades} trades
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sharpe Ratio</h3>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {result.metrics.Sharpe_Ratio.toFixed(3)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Risk-adjusted return
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Drawdown</h3>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {result.metrics.Max_Drawdown.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Maximum loss
                  </p>
                </div>
              </div>

              {/* Low/No Signal Warning */}
              {(result.metrics.Number_of_Trades === 0 || 
                isNaN(result.metrics.Number_of_Trades) || 
                result.metrics.Win_Rate === 0 || 
                isNaN(result.metrics.Win_Rate)) && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-400 p-4 sm:p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h3 className="text-base sm:text-lg font-semibold text-amber-800 dark:text-amber-200">
                        ⚠️ No Trading Signals Generated
                      </h3>
                      <div className="mt-2 sm:mt-3 text-amber-700 dark:text-amber-300">
                        <p className="text-sm font-medium mb-2">
                          Your selected indicators are not generating any trading signals. This typically happens when:
                        </p>
                        <ul className="text-sm space-y-1 ml-4 list-disc">
                          <li>**Voting threshold is too high** - Currently set to {(params.voting_threshold * 100).toFixed(0)}% with {Object.keys(params.selected_indicators).length} indicators</li>
                          <li>The selected indicators rarely agree on the same signal timing</li>
                          <li>Market conditions don't align with your indicator combination</li>
                        </ul>
                      </div>
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">💡 Suggested Solutions:</h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          <div className="flex items-start space-x-2">
                            <span className="font-medium text-blue-600 dark:text-blue-400">1.</span>
                            <span>**Lower the voting threshold** to {Math.max(0.3, (params.voting_threshold - 0.2)).toFixed(1)} ({(Math.max(0.3, (params.voting_threshold - 0.2)) * 100).toFixed(0)}%) or less</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="font-medium text-blue-600 dark:text-blue-400">2.</span>
                            <span>**Reduce the number of indicators** - Try using 2-3 complementary indicators instead of {Object.keys(params.selected_indicators).length}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="font-medium text-blue-600 dark:text-blue-400">3.</span>
                            <span>**Adjust indicator parameters** - Try more sensitive settings (lower RSI periods, shorter MA periods)</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="font-medium text-blue-600 dark:text-blue-400">4.</span>
                            <span>**Try different time periods** - Switch to shorter timeframes (1h instead of 1d) for more signals</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => {
                            setParams(prev => ({ ...prev, voting_threshold: Math.max(0.3, prev.voting_threshold - 0.2) }));
                            setActiveTab('parameters');
                          }}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Lower Threshold to {(Math.max(0.3, (params.voting_threshold - 0.2)) * 100).toFixed(0)}%
                        </button>
                        <button
                          onClick={() => setActiveTab('parameters')}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Adjust Parameters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Metrics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Detailed Performance Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Returns</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Return:</span>
                        <span className="text-sm font-medium">{formatCurrency(result.metrics.Total_Return)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Return %:</span>
                        <span className="text-sm font-medium">{result.metrics.Total_Return_Pct.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Trade:</span>
                        <span className="text-sm font-medium">{formatCurrency(result.metrics.Average_Trade)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Risk Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                        <span className="text-sm font-medium">{result.metrics.Sharpe_Ratio.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sortino Ratio:</span>
                        <span className="text-sm font-medium">{result.metrics.Sortino_Ratio.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Calmar Ratio:</span>
                        <span className="text-sm font-medium">{result.metrics.Calmar_Ratio.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Trade Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate:</span>
                        <span className="text-sm font-medium">{result.metrics.Win_Rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Profit Factor:</span>
                        <span className="text-sm font-medium">{result.metrics.Profit_Factor.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Best Trade:</span>
                        <span className="text-sm font-medium text-green-600">{formatCurrency(result.metrics.Best_Trade)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trades Table */}
              {result.trades.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Trade History</h3>
                  
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Entry Date
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Exit Date
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Direction
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Entry Price
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Exit Price
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            P&L
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Return %
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Exit Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {result.trades.slice(0, 10).map((trade, index) => (
                          <tr key={index}>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(trade.Entry_Date).toLocaleDateString()}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(trade.Exit_Date).toLocaleDateString()}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                trade.Direction === 'Long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {trade.Direction}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              ₹{trade.Entry_Price.toFixed(2)}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              ₹{trade.Exit_Price.toFixed(2)}
                            </td>
                            <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              trade.PnL >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(trade.PnL)}
                            </td>
                            <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              trade.Return_Pct >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {trade.Return_Pct.toFixed(2)}%
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {trade.Exit_Reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {result.trades.length > 10 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing first 10 of {result.trades.length} trades
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Monte Carlo Results */}
              {result.monte_carlo && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Monte Carlo Analysis</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Expected Returns</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Mean Return:</span>
                          <span className="text-sm font-medium">{result.monte_carlo.statistics.Mean_Return.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Std Deviation:</span>
                          <span className="text-sm font-medium">{result.monte_carlo.statistics.Std_Return.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Risk Metrics</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">VaR (95%):</span>
                          <span className="text-sm font-medium text-red-600">
                            {result.monte_carlo.statistics['VaR_95.0%'].toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Loss Probability:</span>
                          <span className="text-sm font-medium text-red-600">
                            {result.monte_carlo.statistics.Probability_of_Loss.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Confidence Interval</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Lower (95%):</span>
                          <span className="text-sm font-medium">
                            {result.monte_carlo.statistics.Confidence_Interval_Lower.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Upper (95%):</span>
                          <span className="text-sm font-medium">
                            {result.monte_carlo.statistics.Confidence_Interval_Upper.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </motion.div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
              {/* Candlestick Chart */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 lg:mb-6 space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                      📊 Price Chart with Trading Signals
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Candlestick chart showing buy/sell signals and price action
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                    {result.summary.symbol} • {result.summary.timeframe}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4">
                  {/* Info banner about chart features */}
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Tip:</strong> Each indicator has its own panel. Click legend items to hide/show specific traces. Scroll down to see all 6 panels.</span>
                    </p>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <Plot
                      data={simplifyChartData(result.charts.candlestick).data}
                      layout={{
                        ...simplifyChartData(result.charts.candlestick).layout,
                        // Use the backend-specified height (1800px) for better panel visibility
                        // Remove height override to let backend chart settings take effect
                        autosize: true,
                        margin: {
                          l: 60, r: 40, t: 50, b: 70,
                          pad: 8
                        }
                        // Removed bgcolor and font overrides to use backend styling
                      }}
                      config={{
                        responsive: true,
                        displayModeBar: true,
                        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                        displaylogo: false,
                        toImageButtonOptions: {
                          format: 'png',
                          filename: 'stock_analysis_chart',
                          height: 1800,
                          width: 1200,
                          scale: 2
                        }
                      }}
                      className="w-full"
                      style={{ width: '100%', minHeight: '1800px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Equity and Drawdown in Grid */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
              {/* Equity Curve */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
                <div className="mb-3 sm:mb-4 lg:mb-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    📈 Portfolio Equity Curve
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Portfolio value over time showing growth and performance
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-3 lg:p-4">
                  <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full">
                    <Plot
                        data={JSON.parse(result.charts.equity_curve).data}
                        layout={{
                          ...JSON.parse(result.charts.equity_curve).layout,
                          height: 350,
                          margin: { 
                            l: 60, r: 30, t: 30, b: 50,
                            pad: 4
                          },
                          paper_bgcolor: 'rgba(0,0,0,0)',
                          plot_bgcolor: 'rgba(0,0,0,0)',
                          font: { 
                            color: '#374151',
                            family: 'Inter, system-ui, sans-serif',
                            size: 9
                          },
                          showlegend: false,
                          xaxis: {
                            tickfont: { size: 8 },
                            title: { font: { size: 9 } }
                          },
                          yaxis: {
                            tickfont: { size: 8 },
                            title: { font: { size: 9 } }
                          }
                        }}
                        config={{ 
                          responsive: true,
                          displayModeBar: false
                        }}
                        className="w-full h-full"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                  
                  {/* Equity Stats */}
                  <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg">
                      <div className="font-medium text-green-700 dark:text-green-300">Final Value</div>
                      <div className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(result.metrics.Total_Return + (params.initial_capital || 100000))}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
                      <div className="font-medium text-blue-700 dark:text-blue-300">Total Return</div>
                      <div className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                        {result.metrics.Total_Return_Pct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawdown Chart */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
                  <div className="mb-3 sm:mb-4 lg:mb-6">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                      📉 Drawdown Analysis
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Peak-to-trough decline showing portfolio risk periods
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-3 lg:p-4">
                    <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full">
                      <Plot
                        data={JSON.parse(result.charts.drawdown).data}
                        layout={{
                          ...JSON.parse(result.charts.drawdown).layout,
                          height: 350,
                          margin: { 
                            l: 60, r: 30, t: 30, b: 50,
                            pad: 4
                          },
                          paper_bgcolor: 'rgba(0,0,0,0)',
                          plot_bgcolor: 'rgba(0,0,0,0)',
                          font: { 
                            color: '#374151',
                            family: 'Inter, system-ui, sans-serif',
                            size: 9
                          },
                          showlegend: false,
                          xaxis: {
                            tickfont: { size: 8 },
                            title: { font: { size: 9 } }
                          },
                          yaxis: {
                            tickfont: { size: 8 },
                            title: { font: { size: 9 } }
                          }
                        }}
                        config={{ 
                          responsive: true,
                          displayModeBar: false
                        }}
                        className="w-full h-full"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                  
                  {/* Drawdown Stats */}
                  <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg">
                      <div className="font-medium text-red-700 dark:text-red-300">Max Drawdown</div>
                      <div className="text-sm sm:text-lg font-bold text-red-600 dark:text-red-400">
                        {result.metrics.Max_Drawdown.toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded-lg">
                      <div className="font-medium text-purple-700 dark:text-purple-300">Calmar Ratio</div>
                      <div className="text-sm sm:text-lg font-bold text-purple-600 dark:text-purple-400">
                        {result.metrics.Calmar_Ratio.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Results State */}
        {activeTab !== 'parameters' && !result && (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No results yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Run a backtest to see results and charts here.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setActiveTab('parameters')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CogIcon className="-ml-1 mr-2 h-5 w-5" />
                Configure Parameters
              </button>
            </div>
          </div>
        )}
        
        {/* Save Strategy Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Save Strategy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Enter a name for your strategy to save all backtest results and parameters.
              </p>
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                placeholder="Enter strategy name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setStrategyName('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={!strategyName.trim()}
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    strategyName.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save Strategy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {/* Limit Exceeded Modal - Inline */}
        {showLimitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Daily Limit Reached</h3>
              <p className="text-gray-600 mb-6">
                You have reached your daily limit for backtesting. Please upgrade your plan to continue using this feature.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/premium'}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Plans
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Video Section - Bottom of Page */}
        <div className="max-w-7xl mx-auto px-4 mt-12 mb-8">
          <TutorialVideoSection
            title="How to Use Advanced Backtesting"
            description="Master the art of strategy validation with our backtesting engine. Test your trading strategies against historical data, analyze performance metrics, and optimize your approach before risking real capital."
            videoId="dQw4w9WgXcQ"
            features={[
              {
                title: "Historical Strategy Testing",
                description: "Validate strategies with years of market data"
              },
              {
                title: "Performance Metrics",
                description: "Analyze win rate, Sharpe ratio, and drawdowns"
              },
              {
                title: "Multiple Strategies",
                description: "Test RSI, MACD, SMA crossovers and more"
              }
            ]}
          />
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setAnonymousUsage({ remainingTests: 0, totalLimit: 10, sessionId: null });
            setShowLoginModal(false);
          }}
          message="Sign up to get unlimited access to our advanced backtesting features"
        />
      </div>
    </div>
  );
};

export default BacktestingBetaPage;