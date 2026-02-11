import React from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PreTradeChecklist as PreTradeChecklistType } from '../../../services/riskCalculator';

interface PreTradeChecklistProps {
  checklist: PreTradeChecklistType;
  onClose: () => void;
  onConfirm: () => void;
}

const PreTradeChecklist: React.FC<PreTradeChecklistProps> = ({
  checklist,
  onClose,
  onConfirm
}) => {
  const { risk_metrics, daily_status, warnings } = checklist;
  const hasWarnings = warnings.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pre-Trade Checklist
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Risk Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Analysis
            </h3>

            {/* Risk per Trade */}
            <div className={`p-4 rounded-lg border mb-3 ${
              risk_metrics.risk_per_trade.within_limit
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Risk Per Trade
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {risk_metrics.risk_per_trade.message}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{risk_metrics.risk_per_trade.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ({risk_metrics.risk_per_trade.percent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Stop Loss Impact */}
            <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Stop Loss Impact
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {risk_metrics.stop_loss_impact.message}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    -₹{risk_metrics.stop_loss_impact.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Impact */}
            {risk_metrics.target_impact.amount !== null && (
              <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Target Impact
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {risk_metrics.target_impact.message}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      +₹{risk_metrics.target_impact.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Exposure */}
            <div className={`p-4 rounded-lg border ${
              risk_metrics.daily_exposure.after_trade_percent <= risk_metrics.daily_exposure.limit_percent
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Daily Exposure
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {risk_metrics.daily_exposure.message}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {risk_metrics.daily_exposure.current_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">After Trade:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {risk_metrics.daily_exposure.after_trade_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Limit:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {risk_metrics.daily_exposure.limit_percent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Trades Today</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {daily_status.trades_today}/{daily_status.max_trades}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Risk Used</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {daily_status.risk_utilization.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {hasWarnings ? '⚠️' : '✓'}
              </p>
            </div>
          </div>

          {/* Warnings */}
          {hasWarnings && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Warnings
                  </p>
                  <ul className="space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-amber-700 dark:text-amber-300">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {checklist.disclaimer}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              hasWarnings
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg'
            }`}
          >
            {hasWarnings ? 'Proceed with Caution' : 'Confirm Trade'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreTradeChecklist;
