import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';

const UsageIndicator: React.FC = () => {
  const { subscriptionDetails, getUsagePercentage } = useSubscription();

  if (!subscriptionDetails || !subscriptionDetails.usage || !subscriptionDetails.usage.daily || !subscriptionDetails.limits) {
    return null;
  }

  const backtestUsage = getUsagePercentage('backtest');
  const llmUsage = getUsagePercentage('llm');

  const getStatusColor = (usage: number) => {
    if (usage >= 90) return 'text-red-500';
    if (usage >= 70) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusDot = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${getStatusDot(backtestUsage)}`}></div>
        <span className={`font-medium ${getStatusColor(backtestUsage)}`}>
          {subscriptionDetails.usage.daily.backtest_count}/{subscriptionDetails.limits.backtest_daily_limit}
        </span>
        <span className="text-gray-500">BT</span>
      </div>
      
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${getStatusDot(llmUsage)}`}></div>
        <span className={`font-medium ${getStatusColor(llmUsage)}`}>
          {subscriptionDetails.usage.daily.llm_query_count}/{subscriptionDetails.limits.llm_daily_limit}
        </span>
        <span className="text-gray-500">AI</span>
      </div>
      
      <div className="text-gray-400 text-xs">
        {subscriptionDetails.tier}
      </div>
    </div>
  );
};

export default UsageIndicator;