import React from 'react';

interface VolatilityMetricsCardProps {
  metrics?: any;
}

const VolatilityMetricsCard: React.FC<VolatilityMetricsCardProps> = ({ metrics }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Volatility Metrics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Sharpe Ratio</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics?.sharpe_ratio?.toFixed(2) || 'N/A'}
          </p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Sortino Ratio</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {metrics?.sortino_ratio?.toFixed(2) || 'N/A'}
          </p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Profit Factor</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {metrics?.profit_factor?.toFixed(2) || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolatilityMetricsCard;
