import React, { useState } from 'react';
import { useSubscription, SubscriptionTier } from '../../contexts/SubscriptionContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SubscriptionBanner: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { subscriptionDetails, getUsagePercentage } = useSubscription();

  // Only show if user is on FREE tier and usage is high, or if collapsed is false
  if (!subscriptionDetails || isCollapsed || !subscriptionDetails.usage || !subscriptionDetails.usage.daily) {
    return null;
  }

  const backtestUsage = getUsagePercentage('backtest');
  const llmUsage = getUsagePercentage('llm');
  
  // Only show banner if usage is above 80% OR if user is on FREE tier
  const showBanner = subscriptionDetails.tier === 'FREE' || backtestUsage > 80 || llmUsage > 80;
  
  if (!showBanner) {
    return null;
  }

  const tierColors: Record<SubscriptionTier, string> = {
    FREE: 'bg-orange-50 border-orange-200',
    BASIC: 'bg-blue-50 border-blue-200',
    PRO: 'bg-purple-50 border-purple-200',
    ENTERPRISE: 'bg-emerald-50 border-emerald-200'
  };

  const tierTextColors: Record<SubscriptionTier, string> = {
    FREE: 'text-orange-800',
    BASIC: 'text-blue-800',
    PRO: 'text-purple-800',
    ENTERPRISE: 'text-emerald-800'
  };

  const getUpgradeMessage = (currentTier: SubscriptionTier): string => {
    if (currentTier === 'ENTERPRISE') return '';
    
    const tierUpgrades: Record<Exclude<SubscriptionTier, 'ENTERPRISE'>, SubscriptionTier> = {
      FREE: 'BASIC',
      BASIC: 'PRO',
      PRO: 'ENTERPRISE'
    };

    const nextTier = tierUpgrades[currentTier as keyof typeof tierUpgrades];
    return nextTier ? `Upgrade to ${nextTier} for higher limits` : '';
  };

  return (
    <div className={`relative ${tierColors[subscriptionDetails.tier]} border rounded-lg p-3 mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${tierTextColors[subscriptionDetails.tier]}`}>
              {subscriptionDetails.tier} Plan
            </span>
            {(backtestUsage > 80 || llmUsage > 80) && (
              <span className="text-sm text-orange-600 font-medium">
                • High usage detected
              </span>
            )}
          </div>
          {subscriptionDetails.tier !== 'ENTERPRISE' && (
            <p className="text-sm text-gray-600 mt-1">
              {getUpgradeMessage(subscriptionDetails.tier)}
              <button 
                className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => window.location.href = '/pricing'}
              >
                Upgrade Now →
              </button>
            </p>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBanner; 