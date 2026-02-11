import React from 'react';
import MonteCarloChart from './MonteCarloChart';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface SimulationResultsProps {
  type: 'cost' | 'risk' | 'drawdown';
  results: any;
  onReset: () => void;
  className?: string;
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  type,
  results,
  onReset,
  className = ''
}) => {
  if (!results) return null;

  const renderCostResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Monthly Trades</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {results.total_monthly_trades}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Monthly Cost</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{results.monthly_cost?.toFixed(2) || 0}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Annual Cost</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ₹{results.annual_cost?.toFixed(2) || 0}
          </p>
        </div>
      </div>
    </div>
  );

  const renderRiskResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Final Capital</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{results.final_capital?.toFixed(2) || 0}
          </p>
        </div>
        <div className={`rounded-lg border p-4 ${
          (results.net_profit || 0) >= 0
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm mb-1 ${
            (results.net_profit || 0) >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            Net Profit/Loss
          </p>
          <p className={`text-2xl font-bold ${
            (results.net_profit || 0) >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {(results.net_profit || 0) >= 0 ? '+' : ''}₹{results.net_profit?.toFixed(2) || 0}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Win Count</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {results.win_count || 0}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Loss Count</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {results.loss_count || 0}
          </p>
        </div>
      </div>
    </div>
  );

  const renderDrawdownResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Max Drawdown</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {results.max_drawdown?.toFixed(2) || 0}%
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Median Drawdown</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {results.median_drawdown?.toFixed(2) || 0}%
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">95th Percentile</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {results.percentile_95?.toFixed(2) || 0}%
          </p>
        </div>
      </div>

      {results.histogram_data && (
        <MonteCarloChart data={results.histogram_data} />
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Simulation Results
        </h3>
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>New Simulation</span>
        </button>
      </div>

      {type === 'cost' && renderCostResults()}
      {type === 'risk' && renderRiskResults()}
      {type === 'drawdown' && renderDrawdownResults()}

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Disclaimer:</strong> These simulations are for educational purposes only and do not guarantee future results.
        </p>
      </div>
    </div>
  );
};

export default SimulationResults;
