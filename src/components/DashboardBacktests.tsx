import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { userDataService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RatioDisplayGrid from './RatioDisplayGrid';
import ParameterDisplayCard from './ParameterDisplayCard';

interface BacktestData {
  id?: string;
  _id?: string;
  timestamp?: string;
  created_at?: string;
  name?: string;
  saved_name?: string;
  strategy_name?: string;
  ticker?: string;
  symbol?: string;
  stock_symbol?: string;
  initial_capital?: number;
  position_size?: number;
  position_size_pct?: number;
  timeframe?: string;
  period?: string;
  start_date?: string;
  end_date?: string;
  strategy_type?: string;
  voting_threshold?: number;
  risk_reward_ratio?: number;
  max_drawdown_pct?: number;
  monte_carlo_simulations?: number;
  confidence_level?: number;
  selected_indicators?: Record<string, any>;
  parameters?: Record<string, any>;
  
  // Enhanced results structure for beta backtests
  results?: {
    metrics?: {
      total_trades?: number;
      winning_trades?: number;
      losing_trades?: number;
      win_rate?: number;
      total_pnl?: number;
      total_return?: number;
      max_drawdown?: number;
      max_drawdown_percent?: number;
      sharpe_ratio?: number;
      sortino_ratio?: number;
      profit_factor?: number;
      avg_trade?: number;
      avg_winning_trade?: number;
      avg_losing_trade?: number;
      largest_win?: number;
      largest_loss?: number;
      consecutive_wins?: number;
      consecutive_losses?: number;
      recovery_factor?: number;
      calmar_ratio?: number;
      // Beta backtest metric variations
      Winning_Trades?: number;
      Losing_Trades?: number;
      Win_Rate?: number;
      Total_Return?: number;
      Total_Return_Pct?: number;
      Max_Drawdown?: number;
      Sharpe_Ratio?: number;
      Profit_Factor?: number;
      Average_Trade?: number;
      Average_Winning_Trade?: number;
      Average_Losing_Trade?: number;
      Largest_Win?: number;
      Largest_Loss?: number;
      Max_Consecutive_Wins?: number;
      Max_Consecutive_Losses?: number;
      Number_of_Trades?: number;
    };
    summary?: string | Record<string, any>;
    trades?: any[];
    equity_curve?: any[];
    monthly_returns?: Record<string, number>;
    performance_chart?: any;
    charts?: {
      equity_curve?: any;
      drawdown?: any;
      candlestick?: any;
    };
  };
  
  // Direct fields for beta backtests
  metrics?: any;
  trades?: any[];
  equity_curve?: any[];
  stock_data?: any[];
  charts?: {
    equity_curve?: any;
    drawdown?: any;
    candlestick?: any;
  };
  monte_carlo?: any;
  summary?: string | Record<string, any>;
  
  // Backtest data wrapper
  backtest_data?: {
    stock_symbol?: string;
    selected_indicators?: Record<string, any>;
    voting_threshold?: number;
    period?: string;
    timeframe?: string;
    initial_capital?: number;
    position_size_pct?: number;
    risk_reward_ratio?: number;
    max_drawdown_pct?: number;
    monte_carlo_simulations?: number;
    confidence_level?: number;
    results?: any;
    metrics?: any;
    trades?: any[];
    equity_curve?: any[];
    stock_data?: any[];
    charts?: any;
    monte_carlo?: any;
    summary?: any;
    timestamp?: string;
    name?: string;
    strategy_type?: string;
  };
  
  status?: string;
  duration?: number;
  [key: string]: any;
}

const DashboardBacktests: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [backtests, setBacktests] = useState<BacktestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestData | null>(null);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const fetchBacktests = async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ User not authenticated, skipping backtest fetch');
      setError('Please log in to view your saved backtests');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Fetching saved backtests for user:', user.id);
      
      const response = await userDataService.getUserBacktests();
      console.log('📡 Backtest API Response:', response);
      
      if (response.success && response.backtests) {
        console.log('✅ Raw backtests API response:', response);
        console.log('📊 Number of backtests:', response.backtests.length);
        console.log('🔍 First backtest structure:', response.backtests[0]);
        
        // Extract and process the nested backtest_data
        const processedBacktests = response.backtests.map((record: any, index: number) => {
          console.log(`📋 Processing backtest ${index + 1}:`, record);
          
          // Extract the actual backtest data from the nested structure
          const backtest = record.backtest_data || record;
          console.log(`📊 Extracted backtest data:`, backtest);
          
          return {
            ...backtest,
            // Preserve record metadata
            record_created_at: record.created_at,
            record_user_id: record.user_id,
            record_type: record.type,
            // Display properties
            display_name: backtest.name || backtest.saved_name || backtest.strategy_name || `Strategy ${index + 1}`,
            display_ticker: backtest.ticker || backtest.symbol || 'Unknown',
            display_id: backtest.id || backtest._id || record._id || `backtest-${index}`,
            display_date: backtest.timestamp || backtest.created_at || record.created_at || new Date().toISOString()
          };
        });
        
        setBacktests(processedBacktests);
        // Don't auto-select on mobile, only on desktop
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        if (processedBacktests.length > 0 && !isMobile) {
          setSelectedBacktest(processedBacktests[0]);
        }
      } else {
        console.log('❌ API response failed:', response);
        setError('Failed to load backtests');
      }
    } catch (error) {
      console.error('💥 Error fetching backtests:', error);
      setError('An error occurred while loading your backtests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBacktests();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPerformanceColor = (value: number | undefined) => {
    if (value === undefined || value === null) return 'text-gray-600 dark:text-gray-400';
    return value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={fetchBacktests}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (backtests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Saved Backtests</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {user ? 
            `Welcome ${user.username}! You haven't saved any backtests yet. Run a backtest and save it to see it here.` :
            'Please log in to view your saved backtests.'
          }
        </p>
        {user && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            User ID: {user.id}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Backtests</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user ? `${user.username}'s saved backtesting strategies and performance results` : 'View your saved backtesting strategies'}
            </p>
            {user && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                User ID: {user.id}
              </p>
            )}
          </div>
          <button
            onClick={fetchBacktests}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="lg:hidden mb-6 p-4">
        <div className="relative">
          <button
            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedBacktest ? selectedBacktest.display_name : 'Select a Strategy'}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isMobileDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isMobileDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {backtests.map((backtest, index) => (
                <div
                  key={backtest.display_id}
                  className="p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    setSelectedBacktest(backtest);
                    setIsMobileDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {backtest.display_name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {backtest.display_ticker}
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Desktop Sidebar with backtest list */}
        <div className="hidden lg:block border-r border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
          {backtests.map((backtest, index) => (
            <div
              key={backtest.display_id}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedBacktest === backtest ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => setSelectedBacktest(backtest)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white">
                  {backtest.display_name}
                </h3>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(backtest.display_date)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {backtest.display_ticker}
                </span>
                {backtest.results?.metrics?.total_pnl !== undefined && (
                  <div className={`text-xs font-semibold ${getPerformanceColor(backtest.results.metrics.total_pnl)}`}>
                    {formatCurrency(backtest.results.metrics.total_pnl)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="col-span-1 lg:col-span-3 p-4 md:p-6 lg:max-h-[70vh] overflow-y-auto">
          {selectedBacktest ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedBacktest.display_name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(selectedBacktest.display_date)}
                  </div>
                  <div className="flex items-center">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    {selectedBacktest.display_ticker}
                  </div>
                  {selectedBacktest.status && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedBacktest.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {selectedBacktest.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Enhanced Parameter Cards for Beta Backtests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Initial Capital</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedBacktest.initial_capital)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Position Size</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.position_size_pct ? `${(selectedBacktest.position_size_pct * 100).toFixed(1)}%` : 
                     selectedBacktest.position_size ? `${selectedBacktest.position_size}%` : 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Timeframe</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.timeframe || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Period</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.period || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Beta Backtest Advanced Parameters */}
              {selectedBacktest.strategy_type === 'beta_backtest' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                    🚀 Beta Backtest Parameters
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Voting Threshold</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {selectedBacktest.voting_threshold ? `${(selectedBacktest.voting_threshold * 100).toFixed(0)}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Risk-Reward Ratio</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {selectedBacktest.risk_reward_ratio ? `${selectedBacktest.risk_reward_ratio.toFixed(1)}:1` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Max Drawdown</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {selectedBacktest.max_drawdown_pct ? `${(selectedBacktest.max_drawdown_pct * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Monte Carlo Runs</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {selectedBacktest.monte_carlo_simulations ? selectedBacktest.monte_carlo_simulations.toLocaleString() : 'None'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Confidence Level</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {selectedBacktest.confidence_level ? `${(selectedBacktest.confidence_level * 100).toFixed(0)}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Indicators Used</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {(() => {
                          const summary = selectedBacktest?.summary;
                          if (summary && typeof summary === 'object' && 'indicators_used' in summary) {
                            return (summary as any).indicators_used?.length || 0;
                          }
                          return selectedBacktest?.selected_indicators ? Object.keys(selectedBacktest.selected_indicators).length : 0;
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Indicators Display */}
                  {selectedBacktest.selected_indicators && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Selected Indicators:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedBacktest.selected_indicators).map(([key, params]: [string, any]) => (
                          <div key={key} className="bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-full text-sm">
                            <span className="font-medium text-blue-900 dark:text-blue-100">{key}</span>
                            {params && typeof params === 'object' && Object.keys(params).length > 0 && (
                              <span className="text-blue-700 dark:text-blue-200 ml-1">
                                ({Object.entries(params).slice(0, 2).map(([k, v]) => `${k}:${v}`).join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Strategy Type Legacy Display */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Strategy Type</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.strategy_type || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Enhanced Performance Ratios */}
              {(selectedBacktest?.results?.metrics || selectedBacktest?.metrics || selectedBacktest?.backtest_data?.metrics) && (
                <RatioDisplayGrid 
                  metrics={selectedBacktest?.results?.metrics || selectedBacktest?.metrics || selectedBacktest?.backtest_data?.metrics} 
                  className="mb-6"
                />
              )}

              {/* Key Performance Overview */}
              {(() => {
                const metrics = selectedBacktest?.results?.metrics || 
                               selectedBacktest?.metrics || 
                               selectedBacktest?.backtest_data?.metrics ||
                               selectedBacktest?.backtest_data?.results?.metrics;
                
                if (!metrics) return null;
                
                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                    <ParameterDisplayCard
                      label="Total P&L"
                      value={metrics.total_pnl || metrics.Total_Return}
                      format="currency"
                      size="large"
                      className="text-center"
                    />
                    <ParameterDisplayCard
                      label="Total Return %"
                      value={metrics.total_return || metrics.Total_Return_Pct}
                      format="percentage"
                      size="large"
                      className="text-center"
                    />
                    <ParameterDisplayCard
                      label="Total Trades"
                      value={metrics.total_trades || metrics.Number_of_Trades}
                      format="number"
                      size="large"
                      className="text-center"
                      colorScheme="info"
                    />
                    <ParameterDisplayCard
                      label="Win Rate"
                      value={metrics.win_rate || metrics.Win_Rate}
                      format="percentage"
                      size="large"
                      className="text-center"
                      colorScheme="success"
                    />
                  </div>
                );
              })()}

              {/* Additional Trade Metrics - Enhanced for both formats */}
              {(selectedBacktest?.results?.metrics || selectedBacktest?.metrics || selectedBacktest?.backtest_data?.metrics) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trade Analysis</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    {(() => {
                      // Get metrics from any available source
                      const metrics = selectedBacktest?.results?.metrics || 
                                     selectedBacktest?.metrics || 
                                     selectedBacktest?.backtest_data?.metrics ||
                                     selectedBacktest?.backtest_data?.results?.metrics;
                      
                      if (!metrics) return [];
                      
                      return [
                        { label: 'Winning Trades', value: metrics.winning_trades || metrics.Winning_Trades, format: 'number', colorScheme: 'success' },
                        { label: 'Losing Trades', value: metrics.losing_trades || metrics.Losing_Trades, format: 'number', colorScheme: 'danger' },
                        { label: 'Max Drawdown', value: metrics.max_drawdown || metrics.Max_Drawdown, format: 'percentage', colorScheme: 'danger' },
                        { label: 'Avg Trade', value: metrics.avg_trade || metrics.Average_Trade, format: 'currency' },
                        { label: 'Avg Winning Trade', value: metrics.avg_winning_trade || metrics.Average_Winning_Trade, format: 'currency', colorScheme: 'success' },
                        { label: 'Avg Losing Trade', value: metrics.avg_losing_trade || metrics.Average_Losing_Trade, format: 'currency', colorScheme: 'danger' },
                        { label: 'Largest Win', value: metrics.largest_win || metrics.Largest_Win, format: 'currency', colorScheme: 'success' },
                        { label: 'Largest Loss', value: metrics.largest_loss || metrics.Largest_Loss, format: 'currency', colorScheme: 'danger' },
                        { label: 'Consecutive Wins', value: metrics.consecutive_wins || metrics.Max_Consecutive_Wins, format: 'number', colorScheme: 'success' },
                        { label: 'Consecutive Losses', value: metrics.consecutive_losses || metrics.Max_Consecutive_Losses, format: 'number', colorScheme: 'danger' },
                        { label: 'Sharpe Ratio', value: metrics.sharpe_ratio || metrics.Sharpe_Ratio, format: 'number' },
                        { label: 'Profit Factor', value: metrics.profit_factor || metrics.Profit_Factor, format: 'number', colorScheme: 'success' },
                      ].filter(metric => metric.value !== undefined && metric.value !== null);
                    })().map((metric, index) => (
                      <ParameterDisplayCard
                        key={index}
                        label={metric.label}
                        value={metric.value}
                        format={metric.format as any}
                        colorScheme={metric.colorScheme as any}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy Parameters */}
              {selectedBacktest.parameters && Object.keys(selectedBacktest.parameters).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Strategy Parameters</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(selectedBacktest.parameters).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-gray-600 p-3 rounded-lg border dark:border-gray-500">
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium mb-1">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white break-words overflow-wrap-break-word">
                          {typeof value === 'object' ? JSON.stringify(value, null, 1) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trade History */}
              {(() => {
                const trades = selectedBacktest?.results?.trades || 
                              selectedBacktest?.trades || 
                              selectedBacktest?.backtest_data?.trades ||
                              selectedBacktest?.backtest_data?.results?.trades;
                
                if (!trades || !Array.isArray(trades) || trades.length === 0) return null;
                
                return (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      📊 Trade History ({trades.length} trades)
                    </h3>
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg table-fixed">
                        <thead className="bg-gray-100 dark:bg-gray-600">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Entry Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Exit Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Direction</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Entry Price</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Exit Price</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">P&L</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Return %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {trades.slice(0, 10).map((trade: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {trade.Entry_Date || trade.entry_date || 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {trade.Exit_Date || trade.exit_date || 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  (trade.Direction || trade.direction || 'Long').toLowerCase() === 'long' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {trade.Direction || trade.direction || 'Long'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                                ${(trade.Entry_Price || trade.entry_price || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                                ${(trade.Exit_Price || trade.exit_price || 0).toFixed(2)}
                              </td>
                              <td className={`px-4 py-2 text-sm text-right font-medium ${
                                (trade.PnL || trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ${(trade.PnL || trade.pnl || 0).toFixed(2)}
                              </td>
                              <td className={`px-4 py-2 text-sm text-right font-medium ${
                                (trade.Return_Pct || trade.pnl_pct || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {((trade.Return_Pct || trade.pnl_pct || 0)).toFixed(2)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {trades.length > 10 && (
                        <div className="text-center mt-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Showing first 10 of {trades.length} trades
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Charts Display */}
              {(() => {
                const charts = selectedBacktest?.results?.charts || 
                              selectedBacktest?.charts || 
                              selectedBacktest?.backtest_data?.charts ||
                              selectedBacktest?.backtest_data?.results?.charts;
                
                if (!charts) return null;
                
                // Check if we have React Plotly available
                const hasPlotly = typeof window !== 'undefined' && (window as any).Plotly;
                
                return (
                  <div className="space-y-6 mb-6">
                    {charts.equity_curve && (
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          📈 Equity Curve
                        </h3>
                        {hasPlotly ? (
                          <div className="h-80">
                            {/* Would render Plotly chart here if available */}
                            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 rounded">
                              <span className="text-gray-500 dark:text-gray-400">Chart data saved (visualization requires live data)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                            <span className="text-blue-700 dark:text-blue-300 text-sm">
                              ✅ Equity curve data is saved and available for analysis
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {charts.drawdown && (
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          📉 Drawdown Analysis
                        </h3>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
                          <span className="text-red-700 dark:text-red-300 text-sm">
                            ✅ Drawdown analysis data is saved and available
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {charts.candlestick && (
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          🕯️ Price Chart with Signals
                        </h3>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                          <span className="text-green-700 dark:text-green-300 text-sm">
                            ✅ Candlestick chart with trading signals is saved
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Summary */}
              {(() => {
                const summary = selectedBacktest?.results?.summary || 
                               selectedBacktest?.summary || 
                               selectedBacktest?.backtest_data?.summary ||
                               selectedBacktest?.backtest_data?.results?.summary;
                
                if (!summary) return null;
                
                return (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Strategy Summary</h3>
                  {typeof summary === 'string' ? (
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {summary}
                    </p>
                  ) : summary && typeof summary === 'object' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(summary).map(([key, value]) => (
                          <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium mb-1">
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white break-words overflow-wrap-break-word">
                              {typeof value === 'object' ? JSON.stringify(value, null, 1) : String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No summary available</p>
                  )}
                </div>
                );
              })()}

            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full min-h-[200px] text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                <span className="lg:hidden">Use the dropdown above to select a strategy</span>
                <span className="hidden lg:inline">Select a backtest to view details</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBacktests;