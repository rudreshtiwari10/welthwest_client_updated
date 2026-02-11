import React from 'react';
import { TrashIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface PositionCardProps {
  position: any;
  onRemove: (id: string) => void;
}

const PositionCard: React.FC<PositionCardProps> = ({ position, onRemove }) => {
  const unrealizedPL = position.unrealized_pl || 0;
  const unrealizedPLPercent = position.unrealized_pl_percent || 0;
  const isProfit = unrealizedPL >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {position.symbol}
        </h3>
        <button
          onClick={() => onRemove(position._id)}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          title="Remove position"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Position Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{position.quantity}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Avg. Price:</span>
          <span className="font-semibold text-gray-900 dark:text-white">₹{position.avg_price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current Price:</span>
          <span className="font-semibold text-gray-900 dark:text-white">₹{position.current_price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Investment:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{(position.avg_price * position.quantity).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* P/L Display */}
      <div className={`p-3 rounded-lg ${
        isProfit
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isProfit ? (
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unrealized P/L</span>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${
              isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isProfit ? '+' : ''}₹{unrealizedPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className={`text-sm ${
              isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isProfit ? '+' : ''}{unrealizedPLPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Stop Loss & Target */}
      {(position.stop_loss || position.target) && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {position.stop_loss && (
            <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-gray-600 dark:text-gray-400">Stop Loss</p>
              <p className="font-semibold text-red-600 dark:text-red-400">₹{position.stop_loss.toFixed(2)}</p>
            </div>
          )}
          {position.target && (
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-gray-600 dark:text-gray-400">Target</p>
              <p className="font-semibold text-green-600 dark:text-green-400">₹{position.target.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PositionCard;
