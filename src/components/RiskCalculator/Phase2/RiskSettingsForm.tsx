import React, { useState, useEffect } from 'react';
import { riskCalculatorService, UserSettings } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const RiskSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    max_daily_loss_percent: 5,
    max_trades_per_day: 5,
    preferred_risk_reward_min: 2,
    max_risk_per_trade_percent: 2,
    capital_baseline: 100000
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getUserSettings();
      setSettings(response.settings);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const response = await riskCalculatorService.updateUserSettings(settings);
      setMessage({ type: 'success', text: response.message || 'Settings saved successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserSettings, value: number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setMessage(null); // Clear any messages when user edits
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <LoadingSpinner text="Loading your settings..." />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Risk Management Settings
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Configure your trading discipline parameters
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Capital Baseline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Capital Baseline (₹)
          </label>
          <input
            type="number"
            step="1000"
            value={settings.capital_baseline}
            onChange={(e) => handleChange('capital_baseline', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your total trading capital for percentage calculations
          </p>
        </div>

        {/* Max Risk Per Trade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Risk Per Trade (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={settings.max_risk_per_trade_percent}
            onChange={(e) => handleChange('max_risk_per_trade_percent', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Maximum percentage of capital to risk per trade (Recommended: 1-2%)
          </p>
        </div>

        {/* Max Daily Loss */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Daily Loss (%)
          </label>
          <input
            type="number"
            step="0.5"
            min="1"
            max="20"
            value={settings.max_daily_loss_percent}
            onChange={(e) => handleChange('max_daily_loss_percent', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Stop trading when daily loss reaches this percentage (Recommended: 3-5%)
          </p>
        </div>

        {/* Max Trades Per Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Trades Per Day
          </label>
          <input
            type="number"
            step="1"
            min="1"
            max="20"
            value={settings.max_trades_per_day}
            onChange={(e) => handleChange('max_trades_per_day', parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Maximum number of trades allowed per day
          </p>
        </div>

        {/* Preferred Risk:Reward Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Risk:Reward Ratio
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="10"
            value={settings.preferred_risk_reward_min}
            onChange={(e) => handleChange('preferred_risk_reward_min', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum acceptable risk:reward ratio for trades (Recommended: 2 or higher)
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />}
              <p className={`text-sm ${
                message.type === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </div>
          ) : (
            'Save Settings'
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Why These Settings Matter
        </h3>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• They protect your capital from excessive risk</li>
          <li>• Pre-trade checklist will warn you when limits are exceeded</li>
          <li>• Helps maintain trading discipline during emotional moments</li>
          <li>• Based on professional risk management principles</li>
        </ul>
      </div>
    </div>
  );
};

export default RiskSettingsForm;
