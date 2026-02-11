import React, { useState } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';

interface CostSimulationFormProps {
  onComplete: (results: any) => void;
}

const CostSimulationForm: React.FC<CostSimulationFormProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    trades_per_day: 3,
    trading_days_per_month: 20,
    avg_position_value: 50000,
    trade_type: 'intraday' as 'delivery' | 'intraday' | 'fno',
    broker: 'zerodha' as 'zerodha' | 'upstox' | 'custom'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await riskCalculatorService.simulateCosts(formData);
      onComplete(response.data);
    } catch (err: any) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Cost Simulation Parameters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trades Per Day
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={formData.trades_per_day}
            onChange={(e) => setFormData({ ...formData, trades_per_day: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trading Days Per Month
          </label>
          <input
            type="number"
            min="1"
            max="31"
            value={formData.trading_days_per_month}
            onChange={(e) => setFormData({ ...formData, trading_days_per_month: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Average Position Value (₹)
          </label>
          <input
            type="number"
            step="1000"
            min="1000"
            value={formData.avg_position_value}
            onChange={(e) => setFormData({ ...formData, avg_position_value: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trade Type
          </label>
          <select
            value={formData.trade_type}
            onChange={(e) => setFormData({ ...formData, trade_type: e.target.value as any })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          >
            <option value="delivery">Delivery</option>
            <option value="intraday">Intraday</option>
            <option value="fno">F&O</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Broker
          </label>
          <select
            value={formData.broker}
            onChange={(e) => setFormData({ ...formData, broker: e.target.value as any })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          >
            <option value="zerodha">Zerodha</option>
            <option value="upstox">Upstox</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <LoadingSpinner size="sm" text="Running Simulation..." /> : 'Run Cost Simulation'}
      </button>
    </form>
  );
};

export default CostSimulationForm;
