import React, { useEffect, useState } from 'react';
import { riskCalculatorService, DailyExposure } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const DailyExposureWidget: React.FC = () => {
  const [exposure, setExposure] = useState<DailyExposure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExposure();
    const interval = setInterval(fetchExposure, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchExposure = async () => {
    try {
      const response = await riskCalculatorService.getDailyExposure();
      setExposure(response.exposure);
    } catch (error) {
      console.error('Failed to fetch exposure:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!exposure) {
    return null;
  }

  const riskUtilizationColor =
    exposure.risk_utilization_percent > 80 ? 'text-red-600 dark:text-red-400' :
    exposure.risk_utilization_percent > 50 ? 'text-amber-600 dark:text-amber-400' :
    'text-green-600 dark:text-green-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Today's Risk Exposure
      </h3>

      <div className="space-y-4">
        {/* Risk Utilization */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Risk Utilization</span>
            <span className={`text-lg font-bold ${riskUtilizationColor}`}>
              {exposure.risk_utilization_percent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                exposure.risk_utilization_percent > 80 ? 'bg-red-500' :
                exposure.risk_utilization_percent > 50 ? 'bg-amber-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(exposure.risk_utilization_percent, 100)}%` }}
            />
          </div>
        </div>

        {/* Trades Count */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Trades Today</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {exposure.trades_count} / {exposure.max_trades_per_day}
          </span>
        </div>

        {/* Total Risk */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Risk Amount</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            ₹{exposure.total_risk_amount.toFixed(2)}
          </span>
        </div>

        {/* Realized P/L */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Realized P/L</span>
          <span className={`text-sm font-semibold ${
            exposure.realized_pl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {exposure.realized_pl >= 0 ? '+' : ''}₹{exposure.realized_pl.toFixed(2)}
          </span>
        </div>

        {/* Warnings */}
        {exposure.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                {exposure.warnings.map((warning, index) => (
                  <p key={index} className="text-xs text-amber-700 dark:text-amber-300">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyExposureWidget;
