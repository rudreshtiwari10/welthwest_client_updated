import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { riskCalculatorService } from '../services/riskCalculator';

interface SessionMetrics {
  trades_today: number;
  max_trades: number;
  total_risk_amount: number;
  total_risk_percent: number;
  realized_pl: number;
  unrealized_pl: number;
  win_rate: number;
  avg_hold_time: string;
}

interface BehaviorNudge {
  type: 'warning' | 'success' | 'info';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface SessionDashboardData {
  success: boolean;
  metrics: SessionMetrics;
  nudges: BehaviorNudge[];
  session_start: string;
}

const SessionDashboardWidget: React.FC = () => {
  const [data, setData] = useState<SessionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionDashboard();
    // Refresh every 30 seconds
    const interval = setInterval(loadSessionDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSessionDashboard = async () => {
    try {
      const response = await riskCalculatorService.getSessionDashboard();
      if (response.success) {
        setData(response);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);

  const getNudgeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      default:
        return <ChartBarIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNudgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!data || !data.metrics) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ClockIcon className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Today's Session</h3>
          </div>
          <span className="text-sm text-blue-100">
            Started: {new Date(data.session_start).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trades</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.metrics.trades_today} / {data.metrics.max_trades}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Risk</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {data.metrics.total_risk_percent.toFixed(2)}%
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Realized P&L</p>
            <p className={`text-2xl font-bold ${
              data.metrics.realized_pl >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(data.metrics.realized_pl)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.metrics.win_rate.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CurrencyRupeeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Unrealized P&L</p>
            </div>
            <p className={`text-lg font-semibold ${
              data.metrics.unrealized_pl >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(data.metrics.unrealized_pl)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Avg Hold Time</p>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.metrics.avg_hold_time}
            </p>
          </div>
        </div>

        {/* Behavior Nudges */}
        {data.nudges && data.nudges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Behavior Insights
            </h4>
            {data.nudges.map((nudge, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 flex items-start gap-2 ${getNudgeColor(nudge.severity)}`}
              >
                {getNudgeIcon(nudge.type)}
                <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                  {nudge.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default SessionDashboardWidget;
