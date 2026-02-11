import React, { useEffect, useState } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';
import StatWidget from '../Shared/StatWidget';
import {
  CurrencyRupeeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SessionDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await riskCalculatorService.getSessionDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch session dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <LoadingSpinner text="Loading today's session..." />
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { summary, open_trades, behavior_flags } = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Today's Trading Session</h1>
        <p className="text-primary-100">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatWidget
          label="Total Trades"
          value={summary.total_trades}
          icon={ChartBarIcon}
          variant="info"
        />
        <StatWidget
          label="Realized P/L"
          value={`₹${summary.realized_pl.toFixed(2)}`}
          trend={summary.realized_pl >= 0 ? 'up' : 'down'}
          trendValue={`${summary.realized_pl >= 0 ? '+' : ''}${summary.realized_pl.toFixed(2)}`}
          variant={summary.realized_pl >= 0 ? 'success' : 'danger'}
          icon={CurrencyRupeeIcon}
        />
        <StatWidget
          label="Open Positions"
          value={summary.open_positions}
          subValue={`Total Value: ₹${summary.total_exposure.toFixed(2)}`}
          variant="warning"
        />
        <StatWidget
          label="Risk Utilized"
          value={`${summary.risk_utilization_percent.toFixed(1)}%`}
          variant={summary.risk_utilization_percent > 80 ? 'danger' : 'default'}
        />
      </div>

      {/* Behavior Flags */}
      {behavior_flags && behavior_flags.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Behavioral Alerts
            </h3>
          </div>
          <div className="space-y-2">
            {behavior_flags.map((flag: any, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {flag.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Trades */}
      {open_trades && open_trades.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Open Positions ({open_trades.length})
          </h3>
          <div className="space-y-3">
            {open_trades.map((trade: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trade.symbol}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {trade.quantity} @ ₹{trade.entry_price} | SL: ₹{trade.stop_loss}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      trade.unrealized_pl >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {trade.unrealized_pl >= 0 ? '+' : ''}₹{trade.unrealized_pl?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {trade.unrealized_pl_percent >= 0 ? '+' : ''}{trade.unrealized_pl_percent?.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No trades message */}
      {(!open_trades || open_trades.length === 0) && summary.total_trades === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <CheckCircleIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            No Trades Today
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Start by calculating your first position size
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionDashboard;
