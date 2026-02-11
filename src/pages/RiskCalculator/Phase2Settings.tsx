import React from 'react';
import SEBIDisclaimer from '../../components/RiskCalculator/Shared/SEBIDisclaimer';
import RiskSettingsForm from '../../components/RiskCalculator/Phase2/RiskSettingsForm';
import DailyExposureWidget from '../../components/RiskCalculator/Phase2/DailyExposureWidget';

const Phase2Settings: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Risk Management Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your trading discipline parameters and monitor daily risk exposure
        </p>
      </div>

      {/* SEBI Disclaimer */}
      <SEBIDisclaimer variant="compact" />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings Form (2/3 width) */}
        <div className="lg:col-span-2">
          <RiskSettingsForm />
        </div>

        {/* Right Column: Daily Exposure (1/3 width) */}
        <div>
          <DailyExposureWidget />

          {/* Quick Tips */}
          <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-purple-200 dark:border-gray-600">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
              💡 Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Never risk more than 1-2% per trade</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Limit yourself to 3-5 trades per day</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Stop trading at 3-5% daily loss</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Maintain minimum 1:2 risk:reward</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Understanding Risk Management Parameters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Capital Baseline
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This is your total trading capital. All percentage-based calculations will use this as the base. Update this value when you add or withdraw capital.
            </p>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Max Risk Per Trade
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The maximum percentage of your capital you're willing to lose on a single trade. Professional traders typically use 1-2%. Never exceed 5%.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Max Daily Loss
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Stop trading when your daily losses reach this percentage. This prevents emotional trading and protects your capital during bad days.
            </p>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Max Trades Per Day
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Limit the number of trades to prevent overtrading. Quality over quantity - focus on high-probability setups rather than excessive trading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2Settings;
