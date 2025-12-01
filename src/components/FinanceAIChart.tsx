import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface FinanceAIChartProps {
  chartBase64: string;
  title?: string;
  category?: string;
}

const FinanceAIChart: React.FC<FinanceAIChartProps> = ({ chartBase64, title, category }) => {
  if (!chartBase64) return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      {/* Header */}
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {category && (
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {category}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chart Image */}
      <div className="p-4">
        <img
          src={`data:image/png;base64,${chartBase64}`}
          alt={title || 'Technical Analysis Chart'}
          className="w-full h-auto rounded-lg shadow-sm"
          loading="lazy"
        />
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Chart generated with professional technical analysis indicators
        </p>
      </div>
    </div>
  );
};

export default FinanceAIChart;
