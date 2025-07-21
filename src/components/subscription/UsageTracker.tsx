import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface ProgressBarProps {
  percentage: number;
  label: string;
  count: number;
  limit: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, label, count, limit }) => {
  const getColorClass = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {count} / {limit === Infinity ? '∞' : limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getColorClass()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const UsageTracker: React.FC = () => {
  const { 
    subscriptionDetails,
    getUsagePercentage,
    getTimeUntilReset
  } = useSubscription();

  if (!subscriptionDetails) {
    return null;
  }

  const { daily } = subscriptionDetails.usage;
  const { backtest_daily_limit, llm_daily_limit } = subscriptionDetails.limits;
  const timeUntilReset = getTimeUntilReset();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Daily Usage</h3>
        <span className="text-sm text-gray-500">
          Resets in {timeUntilReset}
        </span>
      </div>

      <ProgressBar
        label="Backtests"
        percentage={getUsagePercentage('backtest')}
        count={daily.backtest_count}
        limit={backtest_daily_limit}
      />

      <ProgressBar
        label="LLM Queries"
        percentage={getUsagePercentage('llm')}
        count={daily.llm_query_count}
        limit={llm_daily_limit}
      />

      {subscriptionDetails.tier !== 'ENTERPRISE' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need more? {' '}
            <a 
              href="/pricing" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Upgrade your plan →
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default UsageTracker; 