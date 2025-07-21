import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { ChartBarIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SubscriptionSection: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptionDetails, getUsagePercentage, getTimeUntilReset } = useSubscription();

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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription Details</h3>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-base font-medium text-gray-900">Current Plan</h4>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{subscriptionDetails.tier}</p>
            {subscriptionDetails.tier !== 'FREE' && (
              <p className="ml-2 text-sm text-gray-500">
                Since {formatDate(subscriptionDetails.starts_at)}
              </p>
            )}
          </div>
          {subscriptionDetails.expires_at && (
            <p className="mt-2 text-sm text-gray-500">
              Renews on {formatDate(subscriptionDetails.expires_at)}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-900">Usage Limits</h4>
          <div className="mt-2 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Backtesting</span>
                <span className="font-medium text-gray-900">
                  {subscriptionDetails.usage.daily.backtest_count} /{' '}
                  {subscriptionDetails.limits.backtest_daily_limit} per day
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(backtestUsage, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">AI Queries</span>
                <span className="font-medium text-gray-900">
                  {subscriptionDetails.usage.daily.llm_query_count} /{' '}
                  {subscriptionDetails.limits.llm_daily_limit} per day
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(llmUsage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-5">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
              <ChartBarIcon className="mr-2 h-5 w-5 text-gray-400" />
              Market Data
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {subscriptionDetails.limits.market_data_delay}
            </dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
              <ClockIcon className="mr-2 h-5 w-5 text-gray-400" />
              Reset In
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">{timeUntilReset}</dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
              <ArrowPathIcon className="mr-2 h-5 w-5 text-gray-400" />
              Next Reset
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
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
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upgrade Plan
        </button>
        {subscriptionDetails.tier !== 'FREE' && (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSection; 