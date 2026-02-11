import React, { useState } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';

interface RiskSimulationFormProps {
  onComplete: (results: any) => void;
}

const RiskSimulationForm: React.FC<RiskSimulationFormProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    starting_capital: 100000,
    win_rate: 55,
    avg_win_amount: 2000,
    avg_loss_amount: 1500,
    num_trades: 100,
    risk_per_trade: 2
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await riskCalculatorService.simulateRisk(formData);
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
        Risk Simulation Parameters
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
            Average Win Amount (₹)
          </label>
          <input
            type="number"
            step="100"
            value={formData.avg_win_amount}
            onChange={(e) => setFormData({ ...formData, avg_win_amount: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Average Loss Amount (₹)
          </label>
          <input
            type="number"
            step="100"
            value={formData.avg_loss_amount}
            onChange={(e) => setFormData({ ...formData, avg_loss_amount: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Trades to Simulate
          </label>
          <input
            type="number"
            min="10"
            max="1000"
            value={formData.num_trades}
            onChange={(e) => setFormData({ ...formData, num_trades: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
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
        {loading ? <LoadingSpinner size="sm" text="Running Simulation..." /> : 'Run Risk Simulation'}
      </button>
    </form>
  );
};

export default RiskSimulationForm;
