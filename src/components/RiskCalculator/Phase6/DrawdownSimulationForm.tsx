import React, { useState } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';

interface DrawdownSimulationFormProps {
  onComplete: (results: any) => void;
}

const DrawdownSimulationForm: React.FC<DrawdownSimulationFormProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    starting_capital: 100000,
    num_simulations: 1000,
    num_trades_per_sim: 100,
    win_rate: 55,
    avg_win: 2000,
    avg_loss: 1500,
    risk_per_trade: 2
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await riskCalculatorService.simulateDrawdown(formData);
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
        Monte Carlo Drawdown Parameters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Starting Capital (₹)
          </label>
          <input
            type="number"
            step="1000"
            value={formData.starting_capital}
            onChange={(e) => setFormData({ ...formData, starting_capital: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Simulations
          </label>
          <input
            type="number"
            min="100"
            max="10000"
            step="100"
            value={formData.num_simulations}
            onChange={(e) => setFormData({ ...formData, num_simulations: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">More simulations = more accurate</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trades Per Simulation
          </label>
          <input
            type="number"
            min="10"
            max="500"
            value={formData.num_trades_per_sim}
            onChange={(e) => setFormData({ ...formData, num_trades_per_sim: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Win Rate (%)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.win_rate}
            onChange={(e) => setFormData({ ...formData, win_rate: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Average Win (₹)
          </label>
          <input
            type="number"
            step="100"
            value={formData.avg_win}
            onChange={(e) => setFormData({ ...formData, avg_win: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Average Loss (₹)
          </label>
          <input
            type="number"
            step="100"
            value={formData.avg_loss}
            onChange={(e) => setFormData({ ...formData, avg_loss: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk Per Trade (%)
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="10"
            value={formData.risk_per_trade}
            onChange={(e) => setFormData({ ...formData, risk_per_trade: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
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
        {loading ? <LoadingSpinner size="sm" text="Running Monte Carlo Simulation..." /> : 'Run Drawdown Simulation'}
      </button>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Monte Carlo Simulation:</strong> Runs thousands of random scenarios to estimate the range of possible drawdowns you might experience.
        </p>
      </div>
    </form>
  );
};

export default DrawdownSimulationForm;
