import React, { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { userDataService } from '../services/api';

interface BacktestResult {
  id?: string;
  _id?: string;
  timestamp?: string;
  name?: string;
  ticker?: string;
  initial_capital?: number;
  position_size?: number;
  results?: {
    metrics?: {
      total_trades?: number;
      winning_trades?: number;
      losing_trades?: number;
      total_pnl?: number;
      max_drawdown?: number;
    };
    summary?: string;
  };
  [key: string]: any; // Allow any additional properties
}

const SavedBacktests: React.FC = () => {
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestResult | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  const fetchBacktests = async (skipCache = false) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Fetching backtests...', skipCache ? '(forced refresh)' : '');
      
      const response = await userDataService.getUserBacktests();
      console.log('📡 API Response:', response);
      
      if (response.success && response.backtests) {
        console.log('✅ Raw backtests data:', response.backtests);
        console.log('📊 Number of backtests:', response.backtests.length);
        
        // Log each backtest structure for debugging
        response.backtests.forEach((backtest: any, index: number) => {
          console.log(`🔍 Backtest ${index}:`, {
            id: backtest.id,
            name: backtest.name,
            ticker: backtest.ticker,
            hasResults: !!backtest.results,
            hasMetrics: !!(backtest.results && backtest.results.metrics),
            structure: Object.keys(backtest)
          });
        });
        
        // NO FILTERING - Show ALL data regardless of structure
        console.log('🚀 Showing ALL backtests without any filtering');
        
        // Ensure all backtests have proper names
        const processedBacktests = (response.backtests || []).map((backtest: any, index: number) => ({
          ...backtest,
          name: backtest.name || backtest.saved_name || backtest.strategy_name || `Strategy ${index + 1}`,
          ticker: backtest.ticker || backtest.symbol || 'Unknown'
        }));
        
        setBacktests(processedBacktests);
        if (response.backtests && response.backtests.length > 0) {
          setSelectedBacktest(response.backtests[0]);
          console.log('🎯 Selected first backtest:', response.backtests[0]);
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
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleSelectBacktest = (backtest: BacktestResult) => {
    setSelectedBacktest(backtest);
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
      </div>
    );
  }

  if (backtests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Saved Backtests</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You haven't saved any backtests yet. Run a backtest and save it to see it here.
        </p>
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
              View your previously saved backtest strategies and results
            </p>
          </div>
          <button
            onClick={() => {
              setForceRefresh(Date.now());
              fetchBacktests(true);
            }}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Sidebar with backtest list */}
        <div className="border-r border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
          {backtests.map((backtest, index) => (
            <div 
              key={backtest.id || backtest._id || `backtest-${index}`} 
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedBacktest === backtest ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => handleSelectBacktest(backtest)}
            >
              <h3 className="font-medium text-gray-900 dark:text-white">
                {backtest.name || backtest.saved_name || backtest.strategy_name || `${backtest.ticker || 'Unknown'} Strategy`}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {backtest.timestamp ? formatDate(backtest.timestamp) : 'No date'}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {backtest.ticker || 'Unknown'}
                </span>
                {backtest.results?.metrics ? (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {backtest.results.metrics.winning_trades || 0} / {backtest.results.metrics.total_trades || 0} Wins
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Data Available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main content area with selected backtest details */}
        <div className="col-span-2 p-6 max-h-[70vh] overflow-y-auto">
          {/* Debug Info */}
          {backtests.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Debug Info</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Total backtests loaded: {backtests.length}
              </p>
              {selectedBacktest && (
                <div className="mt-2">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Selected: {selectedBacktest.name || selectedBacktest.saved_name || selectedBacktest.strategy_name || 'Unnamed'} | 
                    Has results: {!!selectedBacktest.results ? 'Yes' : 'No'} |
                    Has metrics: {!!(selectedBacktest.results && selectedBacktest.results.metrics) ? 'Yes' : 'No'}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    ID: {selectedBacktest.id || selectedBacktest._id || 'No ID'} | 
                    Ticker: {selectedBacktest.ticker || selectedBacktest.symbol || 'No ticker'} |
                    Keys: {Object.keys(selectedBacktest).join(', ')}
                  </p>
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className="mt-2 px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs"
                  >
                    {showRawData ? 'Hide' : 'Show'} Raw Data
                  </button>
                </div>
              )}
            </div>
          )}
          
          {selectedBacktest && selectedBacktest.results?.metrics ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedBacktest.name || selectedBacktest.saved_name || selectedBacktest.strategy_name || `${selectedBacktest.ticker || 'Unknown'} Strategy`}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ticker</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedBacktest.ticker}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Initial Capital</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{(selectedBacktest.initial_capital || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Position Size</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.position_size || 0}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Trades</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.results.metrics.total_trades}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Win Rate</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {(selectedBacktest.results.metrics.total_trades || 0) > 0 
                      ? (((selectedBacktest.results.metrics.winning_trades || 0) / (selectedBacktest.results.metrics.total_trades || 1)) * 100).toFixed(2)
                      : 0}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total P&L</div>
                  <div className={`text-xl font-bold ${
                    (selectedBacktest.results.metrics.total_pnl || 0) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    ₹{(selectedBacktest.results.metrics.total_pnl || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max Drawdown</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {(selectedBacktest.results.metrics.max_drawdown || 0).toFixed(2)}%
                  </div>
                </div>
              </div>

              {selectedBacktest.results.summary && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {selectedBacktest.results.summary}
                  </p>
                </div>
              )}
            </div>
          ) : selectedBacktest ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedBacktest.name || selectedBacktest.saved_name || selectedBacktest.strategy_name || `Backtest Strategy`}
              </h2>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
                <p className="text-yellow-800 dark:text-yellow-300">
                  ⚠️ This backtest data has an incomplete structure. Some details may not be available.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">ID</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedBacktest.id || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedBacktest.name || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ticker</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedBacktest.ticker || 'N/A'}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Available Data</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Has Results:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedBacktest.results ? '✅ Yes' : '❌ No'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Has Metrics:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{(selectedBacktest.results && selectedBacktest.results.metrics) ? '✅ Yes' : '❌ No'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Timestamp:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedBacktest.timestamp ? formatDate(selectedBacktest.timestamp) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select a backtest to view details</p>
            </div>
          )}
          
          {/* Raw Data Display */}
          {showRawData && selectedBacktest && (
            <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Raw Data</h3>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-96">
                {JSON.stringify(selectedBacktest, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedBacktests; 