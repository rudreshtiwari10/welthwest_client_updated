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
  initial_capital?: number;
  position_size?: number;
  timeframe?: string;
  start_date?: string;
  end_date?: string;
  strategy_type?: string;
  parameters?: Record<string, any>;
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
    };
    summary?: string;
    trades?: any[];
    equity_curve?: any[];
    monthly_returns?: Record<string, number>;
    performance_chart?: any;
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
        if (processedBacktests.length > 0) {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Sidebar with backtest list */}
        <div className="border-r border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
          {backtests.map((backtest, index) => (
            <div
              key={backtest.display_id}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedBacktest === backtest ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => setSelectedBacktest(backtest)}
            >
              <h3 className="font-medium text-gray-900 dark:text-white">
                {backtest.display_name}
              </h3>
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
        <div className="col-span-2 p-6 max-h-[70vh] overflow-y-auto">
          {selectedBacktest ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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

              {/* Basic Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Initial Capital</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedBacktest.initial_capital)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Position Size</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.position_size ? `${selectedBacktest.position_size}%` : 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Timeframe</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.timeframe || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Strategy Type</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.strategy_type || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Enhanced Performance Ratios */}
              {selectedBacktest.results?.metrics && (
                <RatioDisplayGrid 
                  metrics={selectedBacktest.results.metrics} 
                  className="mb-6"
                />
              )}

              {/* Key Performance Overview */}
              {selectedBacktest.results?.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <ParameterDisplayCard
                    label="Total P&L"
                    value={selectedBacktest.results.metrics.total_pnl}
                    format="currency"
                    size="large"
                    className="text-center"
                  />
                  <ParameterDisplayCard
                    label="Total Return"
                    value={selectedBacktest.results.metrics.total_return}
                    format="percentage"
                    size="large"
                    className="text-center"
                  />
                  <ParameterDisplayCard
                    label="Total Trades"
                    value={selectedBacktest.results.metrics.total_trades}
                    format="number"
                    size="large"
                    className="text-center"
                    colorScheme="info"
                  />
                  <ParameterDisplayCard
                    label="Win Rate"
                    value={selectedBacktest.results.metrics.win_rate}
                    format="percentage"
                    size="large"
                    className="text-center"
                    colorScheme="success"
                  />
                </div>
              )}

              {/* Additional Trade Metrics */}
              {selectedBacktest.results?.metrics && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trade Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Winning Trades', value: selectedBacktest.results.metrics.winning_trades, format: 'number', colorScheme: 'success' },
                      { label: 'Losing Trades', value: selectedBacktest.results.metrics.losing_trades, format: 'number', colorScheme: 'danger' },
                      { label: 'Max Drawdown', value: selectedBacktest.results.metrics.max_drawdown, format: 'currency', colorScheme: 'danger' },
                      { label: 'Avg Trade', value: selectedBacktest.results.metrics.avg_trade, format: 'currency' },
                      { label: 'Avg Winning Trade', value: selectedBacktest.results.metrics.avg_winning_trade, format: 'currency', colorScheme: 'success' },
                      { label: 'Avg Losing Trade', value: selectedBacktest.results.metrics.avg_losing_trade, format: 'currency', colorScheme: 'danger' },
                      { label: 'Largest Win', value: selectedBacktest.results.metrics.largest_win, format: 'currency', colorScheme: 'success' },
                      { label: 'Largest Loss', value: selectedBacktest.results.metrics.largest_loss, format: 'currency', colorScheme: 'danger' },
                      { label: 'Consecutive Wins', value: selectedBacktest.results.metrics.consecutive_wins, format: 'number', colorScheme: 'success' },
                      { label: 'Consecutive Losses', value: selectedBacktest.results.metrics.consecutive_losses, format: 'number', colorScheme: 'danger' },
                    ].map((metric, index) => (
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
                      <div key={key} className="bg-white dark:bg-gray-600 p-3 rounded border">
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedBacktest.results?.summary && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedBacktest.results.summary}
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select a backtest to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBacktests;