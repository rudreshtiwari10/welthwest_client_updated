import React from 'react';
import { useSubscription, SubscriptionTier } from '../../contexts/SubscriptionContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface LimitExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: 'backtest' | 'llm';
  message: string;
}

const LimitExceededModal: React.FC<LimitExceededModalProps> = ({
  isOpen,
  onClose,
  featureType,
  message
}) => {
  const { subscriptionDetails, getUsagePercentage, getTimeUntilReset } = useSubscription();

  if (!isOpen || !subscriptionDetails) return null;

  const tierUpgrades: Record<Exclude<SubscriptionTier, 'ENTERPRISE'>, { tier: SubscriptionTier; limits: string }> = {
    FREE: { tier: 'BASIC', limits: '10 backtests/day, 20 LLM queries/day' },
    BASIC: { tier: 'PRO', limits: '30 backtests/day, 50 LLM queries/day' },
    PRO: { tier: 'ENTERPRISE', limits: 'Unlimited usage' }
  };

  const currentTier = subscriptionDetails.tier;
  const nextTier = currentTier !== 'ENTERPRISE' ? tierUpgrades[currentTier as keyof typeof tierUpgrades] : null;

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {featureType === 'backtest' ? 'Backtest' : 'AI Query'} Limit Reached
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-3">
              <svg className="h-8 w-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
            {message}
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{currentTier}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Usage:</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {Math.round(getUsagePercentage(featureType))}% used
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resets in:</span>
              <span className="text-sm text-gray-900 dark:text-white">{getTimeUntilReset()}</span>
            </div>
          </div>

          {nextTier && (
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Upgrade to {nextTier.tier}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                {nextTier.limits}
              </p>
              <button
                onClick={handleUpgrade}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitExceededModal;