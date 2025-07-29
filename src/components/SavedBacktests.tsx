import React, { useState, useEffect } from 'react';
import { userDataService } from '../services/api';

interface BacktestResult {
  id: string;
  timestamp: string;
  name?: string;
  ticker: string;
  initial_capital: number;
  position_size: number;
  results: {
    metrics: {
      total_trades: number;
      winning_trades: number;
      losing_trades: number;
      total_pnl: number;
      max_drawdown: number;
    };
    summary: string;
  };
}

const SavedBacktests: React.FC = () => {
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestResult | null>(null);

  useEffect(() => {
    const fetchBacktests = async () => {
      try {
        setIsLoading(true);
        const response = await userDataService.getUserBacktests();
        
        if (response.success && response.backtests) {
          // Filter out any backtests with invalid data structure
          const validBacktests = response.backtests.filter((backtest: any) => 
            backtest && 
            backtest.results && 
            backtest.results.metrics &&
            typeof backtest.results.metrics === 'object'
          );
          
          setBacktests(validBacktests);
          if (validBacktests.length > 0) {
            setSelectedBacktest(validBacktests[0]);
          }
        } else {
          setError('Failed to load backtests');
        }
      } catch (error) {
        console.error('Error fetching backtests:', error);
        setError('An error occurred while loading your backtests');
      } finally {
        setIsLoading(false);
      }
    };

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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Backtests</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View your previously saved backtest strategies and results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Sidebar with backtest list */}
        <div className="border-r border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
          {backtests.map((backtest) => (
            <div 
              key={backtest.id} 
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedBacktest?.id === backtest.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => handleSelectBacktest(backtest)}
            >
              <h3 className="font-medium text-gray-900 dark:text-white">
                {backtest.name || `${backtest.ticker} Strategy`}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(backtest.timestamp)}
              </div>
              {backtest.results?.metrics && (
                <div className="flex items-center mt-2">
                  <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {backtest.ticker}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {backtest.results.metrics.winning_trades} / {backtest.results.metrics.total_trades} Wins
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main content area with selected backtest details */}
        <div className="col-span-2 p-6 max-h-[70vh] overflow-y-auto">
          {selectedBacktest && selectedBacktest.results?.metrics ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedBacktest.name || `${selectedBacktest.ticker} Strategy`}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ticker</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedBacktest.ticker}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Initial Capital</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{selectedBacktest.initial_capital.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Position Size</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedBacktest.position_size}%
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
                    {selectedBacktest.results.metrics.total_trades > 0 
                      ? ((selectedBacktest.results.metrics.winning_trades / selectedBacktest.results.metrics.total_trades) * 100).toFixed(2)
                      : 0}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total P&L</div>
                  <div className={`text-xl font-bold ${
                    selectedBacktest.results.metrics.total_pnl >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    ₹{selectedBacktest.results.metrics.total_pnl.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Max Drawdown</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {selectedBacktest.results.metrics.max_drawdown.toFixed(2)}%
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

export default SavedBacktests; 