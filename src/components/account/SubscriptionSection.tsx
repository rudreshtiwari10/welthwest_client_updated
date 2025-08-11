import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { subscriptionService } from '../../services/api';
import { ChartBarIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SubscriptionSection: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptionDetails, getUsagePercentage, getTimeUntilReset, refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [cancelError, setCancelError] = useState('');

  if (!subscriptionDetails) {
    return null;
  }

  const backtestUsage = getUsagePercentage('backtest');
  const llmUsage = getUsagePercentage('llm');
  const timeUntilReset = getTimeUntilReset();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelSubscription = async () => {
    // Confirm cancellation
    const reason = window.prompt(
      'Are you sure you want to cancel your subscription? This will downgrade you to FREE tier.\n\nOptionally, tell us why you\'re cancelling (this helps us improve):'
    );
    
    if (reason === null) {
      // User clicked cancel
      return;
    }

    try {
      setCancellingSubscription(true);
      setCancelError('');

      // Call the cancel subscription API
      const response = await subscriptionService.cancelSubscription(reason || 'User requested cancellation');
      
      if (response.success) {
        // Refresh subscription details to reflect the change
        await refreshSubscription();
        
        // Show success message
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

  return (
    <div className="bg-white dark:bg-dark-300 shadow rounded-lg p-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Subscription Details</h3>
      </div>

      {/* Error message */}
      {cancelError && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{cancelError}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setCancelError('')}
          >
            <span className="text-red-700 dark:text-red-400">×</span>
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white">Current Plan</h4>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{subscriptionDetails.tier}</p>
            {subscriptionDetails.tier !== 'FREE' && (
              <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Since {formatDate(subscriptionDetails.starts_at)}
              </p>
            )}
          </div>
          {subscriptionDetails.expires_at && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Renews on {formatDate(subscriptionDetails.expires_at)}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white">Usage Limits</h4>
          <div className="mt-2 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Backtesting</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {subscriptionDetails.usage.daily.backtest_count} /{' '}
                  {subscriptionDetails.limits.backtest_daily_limit} per day
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(backtestUsage, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">AI Queries</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {subscriptionDetails.usage.daily.llm_query_count} /{' '}
                  {subscriptionDetails.limits.llm_daily_limit} per day
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(llmUsage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-5">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="px-4 py-5 bg-gray-50 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate flex items-center">
              <ChartBarIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              Market Data
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {subscriptionDetails.limits.market_data_delay}
            </dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate flex items-center">
              <ClockIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              Reset In
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{timeUntilReset}</dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate flex items-center">
              <ArrowPathIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              Next Reset
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(subscriptionDetails.usage.daily.last_reset)
                .toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/pricing')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          Upgrade Plan
        </button>
        {subscriptionDetails.tier !== 'FREE' && (
          <button
            type="button"
            onClick={handleCancelSubscription}
            disabled={cancellingSubscription}
            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancellingSubscription ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-red-700 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSection; 