import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { subscriptionService } from '../../services/api';
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface FeatureUsage {
  feature_key: string;
  feature_name: string;
  used: number;
  remaining: number;
  limit: number;
  percentage: number;
}

interface SubscriptionDetails {
  plan: string;
  plan_duration?: string;
  start_date?: string;
  expiry_date?: string;
  is_active: boolean;
  days_remaining: number;
}

interface UsageInfo {
  features: FeatureUsage[];
  reset_info: {
    next_reset: string;
    hours_until_reset: number;
    minutes_until_reset: number;
    reset_message: string;
  };
}

const SubscriptionSection: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const response = await subscriptionService.getSubscriptionStatus();
      if (response.success) {
        setSubscriptionDetails(response.subscription);
        setUsageInfo(response.usage);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const reason = window.prompt(
      'Are you sure you want to cancel your subscription? This will downgrade you to FREE tier.\n\nOptionally, tell us why you\'re cancelling (this helps us improve):'
    );

    if (reason === null) return;

    try {
      setCancellingSubscription(true);
      setCancelError('');
      const response = await subscriptionService.cancelSubscription(reason || 'User requested cancellation');

      if (response.success) {
        await refreshSubscription();
        await fetchSubscriptionData();
        alert('Your subscription has been cancelled successfully. You have been downgraded to the FREE tier.');
      } else {
        setCancelError(response.error || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      setCancelError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to cancel subscription'
      );
    } finally {
      setCancellingSubscription(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getFeatureIcon = (featureKey: string) => {
    switch (featureKey) {
      case 'welth-market-regime': return '\u{1F4C8}';
      case 'welth-ai-assistant': return '\u{1F916}';
      case 'backtest-beta': return '\u26A1';
      default: return '\u{1F4CA}';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionDetails) {
    return (
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <p className="text-gray-500 dark:text-gray-400">Unable to load subscription details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subscription Details</h3>
        </div>

        {cancelError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative">
            <strong className="font-bold">Error: </strong>
            <span>{cancelError}</span>
            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setCancelError('')}>
              <span className="text-red-700 dark:text-red-400">&times;</span>
            </button>
          </div>
        )}

        {/* Plan Summary */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Plan</h4>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{subscriptionDetails.plan}</p>
              {subscriptionDetails.plan !== 'FREE' && subscriptionDetails.plan_duration && (
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({subscriptionDetails.plan_duration})
                </p>
              )}
            </div>
            {subscriptionDetails.start_date && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Started: {formatDate(subscriptionDetails.start_date)}
              </p>
            )}
            {subscriptionDetails.expiry_date && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subscriptionDetails.is_active ? 'Renews' : 'Expired'} on: {formatDate(subscriptionDetails.expiry_date)}
              </p>
            )}
            {subscriptionDetails.is_active && subscriptionDetails.days_remaining > 0 && (
              <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                {subscriptionDetails.days_remaining} days remaining
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h4>
            <div className="flex items-center mt-2">
              {subscriptionDetails.is_active ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Feature Usage */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Feature Usage</h4>
          <div className="space-y-4">
            {usageInfo?.features.map((feature) => (
              <div key={feature.feature_key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getFeatureIcon(feature.feature_key)}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{feature.feature_name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.used} / {feature.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      feature.percentage >= 90 ? 'bg-red-500' :
                      feature.percentage >= 70 ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(feature.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{feature.remaining} remaining</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{feature.percentage.toFixed(1)}% used</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Info */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <ClockIcon className="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                Reset In
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {usageInfo?.reset_info.hours_until_reset}h {usageInfo?.reset_info.minutes_until_reset}m
              </dd>
            </div>
            <div className="px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <ArrowPathIcon className="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                Next Reset
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {usageInfo?.reset_info.next_reset && new Date(usageInfo.reset_info.next_reset).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            {subscriptionDetails.plan === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
          </button>
          {subscriptionDetails.plan !== 'FREE' && (
            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={cancellingSubscription}
              className="px-4 py-2 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancellingSubscription ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cancelling...
                </span>
              ) : (
                'Cancel Subscription'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSection;
