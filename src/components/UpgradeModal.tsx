/**
 * Upgrade Modal Component
 * Displays when user hits feature usage limits (403 error)
 * Shows current plan, limits, and upgrade options
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  currentPlan: string;
  upgradeMessage?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName,
  currentPlan,
  upgradeMessage,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/premium');
  };

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: window.location.pathname } });
  };

  const isAnonymous = currentPlan === 'ANONYMOUS';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-4">
              {isAnonymous ? (
                <RocketLaunchIcon className="h-10 w-10 text-white" />
              ) : (
                <SparklesIcon className="h-10 w-10 text-white" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {isAnonymous ? 'Sign Up to Continue' : 'Upgrade to Continue'}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {upgradeMessage ||
              (isAnonymous
                ? `You've reached your free limit for ${featureName}. Sign up to get higher limits and unlock premium features.`
                : `You've reached your daily limit for ${featureName} on the ${currentPlan} plan.`)}
          </p>

          {/* Feature Limit Info */}
          {!isAnonymous && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Current Plan:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{currentPlan}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">Feature:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{featureName}</span>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mb-6 space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {isAnonymous ? 'Sign up to get:' : 'Upgrade to get:'}
            </p>
            {isAnonymous ? (
              <>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Higher daily usage limits
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Save your analysis and strategies
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Access your data from any device
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Higher daily usage limits
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Priority support
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Advanced features and tools
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isAnonymous ? (
              <>
                <button
                  onClick={handleLogin}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-secondary-500 transition-all shadow-lg"
                >
                  Sign Up / Login
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Maybe Later
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-secondary-500 transition-all shadow-lg"
                >
                  View Premium Plans
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Close
                </button>
              </>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
            {isAnonymous
              ? 'Your free trial usage resets daily'
              : 'Usage limits reset daily at midnight'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
