import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { backtestingService } from '../services/backtesting';
import { motion } from 'framer-motion';
import { ChartBarIcon, CogIcon, PlayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
const Plot = require('react-plotly.js').default as React.ComponentType<any>;

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

const BacktestingBetaPage: React.FC = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'parameters' | 'results' | 'charts'>('parameters');

  // Form state
  const [params, setParams] = useState<BacktestParams>({
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
      },
      EMA: {
        periods: [12, 26]
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

  const availableIndicators = {
    RSI: { name: 'Relative Strength Index', hasParams: true },
    MACD: { name: 'MACD', hasParams: true },
    Bollinger_Bands: { name: 'Bollinger Bands', hasParams: true },
    Stochastic: { name: 'Stochastic Oscillator', hasParams: true },
    SMA: { name: 'Simple Moving Average', hasParams: true },
    EMA: { name: 'Exponential Moving Average', hasParams: true },
    ADX: { name: 'Average Directional Index', hasParams: true },
    Williams_R: { name: 'Williams %R', hasParams: true },
    CCI: { name: 'Commodity Channel Index', hasParams: true },
    ATR: { name: 'Average True Range', hasParams: true },
    OBV: { name: 'On Balance Volume', hasParams: false }
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
    try {
      setIsLoading(true);
      setError(null);

      const data = await backtestingService.runNewBacktest(params);
      setResult(data.data);
      setActiveTab('results');
    } catch (err) {
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
      EMA: { periods: [12, 26] },
      ADX: { period: 14, threshold: 25 },
      Williams_R: { period: 14, oversold: -80, overbought: -20 },
      CCI: { period: 20 },
      ATR: { period: 14 },
      OBV: {}
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
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-3 gap-3">
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

    if (indicator === 'SMA' || indicator === 'EMA') {
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

    // Add more indicator forms as needed
    return <div className="text-sm text-gray-500">No additional parameters</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Backtest (Beta)
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive backtesting with advanced analytics and visualization
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Beta Version - Enhanced Features
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
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
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Basic Parameters */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Parameters</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Symbol
                    </label>
                    <select
                      value={params.stock_symbol}
                      onChange={(e) => setParams(prev => ({ ...prev, stock_symbol: e.target.value }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {stockOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Period
                      </label>
                      <select
                        value={params.period}
                        onChange={(e) => setParams(prev => ({ ...prev, period: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="1mo">1 Month</option>
                        <option value="3mo">3 Months</option>
                        <option value="6mo">6 Months</option>
                        <option value="1y">1 Year</option>
                        <option value="2y">2 Years</option>
                        <option value="5y">5 Years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timeframe
                      </label>
                      <select
                        value={params.timeframe}
                        onChange={(e) => setParams(prev => ({ ...prev, timeframe: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="1d">1 Day</option>
                        <option value="1h">1 Hour</option>
                        <option value="30m">30 Minutes</option>
                        <option value="15m">15 Minutes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Capital (₹)
                    </label>
                    <input
                      type="number"
                      value={params.initial_capital}
                      onChange={(e) => setParams(prev => ({ ...prev, initial_capital: parseFloat(e.target.value) }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position Size (% of capital)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="1"
                      value={params.position_size_pct}
                      onChange={(e) => setParams(prev => ({ ...prev, position_size_pct: parseFloat(e.target.value) }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Voting Threshold
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1"
                      value={params.voting_threshold}
                      onChange={(e) => setParams(prev => ({ ...prev, voting_threshold: parseFloat(e.target.value) }))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Technical Indicators */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Technical Indicators</h3>
                  
                  <div className="space-y-4">
                    {Object.entries(availableIndicators).map(([key, indicator]) => (
                      <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={params.selected_indicators[key] !== undefined}
                              onChange={() => toggleIndicator(key)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                              {indicator.name}
                            </span>
                          </label>
                        </div>
                        
                        {params.selected_indicators[key] && indicator.hasParams && (
                          <div className="ml-6">
                            {renderIndicatorForm(key, params.selected_indicators[key])}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Advanced Parameters</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="mt-8 flex justify-center">
                <button
                  onClick={runBacktest}
                  disabled={isLoading || Object.keys(params.selected_indicators).length === 0}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <PlayIcon className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Running Backtest...' : 'Run Backtest'}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
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
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Return</h3>
                  <p className={`text-2xl font-bold ${result.metrics.Total_Return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(result.metrics.Total_Return)}
                  </p>
                  <p className={`text-sm ${result.metrics.Total_Return_Pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.metrics.Total_Return_Pct.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.metrics.Win_Rate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.metrics.Number_of_Trades} trades
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sharpe Ratio</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {result.metrics.Sharpe_Ratio.toFixed(3)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Risk-adjusted return
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Drawdown</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {result.metrics.Max_Drawdown.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Maximum loss
                  </p>
                </div>
              </div>

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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Trade History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Entry Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Exit Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Direction
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Entry Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Exit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            P&L
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Return %
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Exit Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {result.trades.slice(0, 10).map((trade, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(trade.Entry_Date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(trade.Exit_Date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                trade.Direction === 'Long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {trade.Direction}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              ₹{trade.Entry_Price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              ₹{trade.Exit_Price.toFixed(2)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              trade.PnL >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(trade.PnL)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              trade.Return_Pct >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {trade.Return_Pct.toFixed(2)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {trade.Exit_Reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {result.trades.length > 10 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Showing first 10 of {result.trades.length} trades
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Monte Carlo Results */}
              {result.monte_carlo && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monte Carlo Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="space-y-8">
              {/* Candlestick Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Price Chart with Signals
                </h3>
                <div className="h-96">
                  <Plot
                    data={JSON.parse(result.charts.candlestick).data}
                    layout={{
                      ...JSON.parse(result.charts.candlestick).layout,
                      height: 384,
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#374151' }
                    }}
                    config={{ responsive: true }}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Equity Curve */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Equity Curve
                </h3>
                <div className="h-80">
                  <Plot
                    data={JSON.parse(result.charts.equity_curve).data}
                    layout={{
                      ...JSON.parse(result.charts.equity_curve).layout,
                      height: 320,
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#374151' }
                    }}
                    config={{ responsive: true }}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Drawdown Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Drawdown Analysis
                </h3>
                <div className="h-80">
                  <Plot
                    data={JSON.parse(result.charts.drawdown).data}
                    layout={{
                      ...JSON.parse(result.charts.drawdown).layout,
                      height: 320,
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#374151' }
                    }}
                    config={{ responsive: true }}
                    className="w-full h-full"
                  />
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
      </div>
    </div>
  );
};

export default BacktestingBetaPage;