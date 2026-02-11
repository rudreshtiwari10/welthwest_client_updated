import React, { useState, useEffect } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface RealTimePriceUpdaterProps {
  symbols: string[];
  onPricesUpdate: (prices: Record<string, number>) => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds, default 5 minutes
  className?: string;
}

const RealTimePriceUpdater: React.FC<RealTimePriceUpdaterProps> = ({
  symbols,
  onPricesUpdate,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextUpdate, setNextUpdate] = useState<number>(refreshInterval / 1000);

  useEffect(() => {
    if (symbols.length === 0) return;

    // Initial fetch
    fetchPrices();

    if (autoRefresh) {
      // Set up auto-refresh interval
      const intervalId = setInterval(() => {
        fetchPrices();
      }, refreshInterval);

      // Set up countdown timer
      const countdownId = setInterval(() => {
        setNextUpdate(prev => {
          if (prev <= 1) {
            return refreshInterval / 1000;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(intervalId);
        clearInterval(countdownId);
      };
    }
  }, [symbols, autoRefresh, refreshInterval]);

  const fetchPrices = async () => {
    if (symbols.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const response = await riskCalculatorService.getRealtimePrices(symbols);

      if (response.success && response.data) {
        onPricesUpdate(response.data.prices);
        setLastUpdate(new Date());
        setNextUpdate(refreshInterval / 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prices');
      console.error('Price update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchPrices();
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const formatNextUpdate = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  if (symbols.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 ${loading ? 'animate-pulse' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${
              error
                ? 'bg-red-500'
                : lastUpdate
                ? 'bg-green-500'
                : 'bg-gray-400'
            } ${!error && lastUpdate && !loading ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Real-time Prices
            </span>
          </div>

          {lastUpdate && !error && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Updated {formatTimeAgo(lastUpdate)}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400">
              <ExclamationCircleIcon className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {autoRefresh && !error && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Next update in {formatNextUpdate(nextUpdate)}
            </span>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className={`p-2 rounded-lg transition-all ${
              loading
                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            }`}
            title="Refresh prices now"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !lastUpdate && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
          <span>Fetching latest prices for {symbols.length} positions...</span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Tracking {symbols.length} symbol{symbols.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* SEBI Disclaimer */}
      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400">
        <strong>Note:</strong> Prices are indicative and may have a delay. Always verify current prices on your broker platform before trading.
      </div>
    </div>
  );
};

export default RealTimePriceUpdater;
