import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier } from '../../contexts/SubscriptionContext';

interface PricingFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingCardProps {
  tier: SubscriptionTier;
  price: {
    monthly: number;
    annual: number;
  };
  features: PricingFeature[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  isAnnual: boolean;
  onUpgrade: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  features,
  isPopular,
  isCurrentPlan,
  isAnnual,
  onUpgrade,
}) => {
  const tierColors: Record<SubscriptionTier, { bg: string; border: string; text: string }> = {
    FREE: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
    },
    BASIC: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
    },
    PRO: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
    },
    ENTERPRISE: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
    },
  };

  const currentPrice = isAnnual ? price.annual : price.monthly;
  const savings = ((price.monthly * 12 - price.annual) / (price.monthly * 12) * 100).toFixed(0);

  return (
    <div
      className={`relative rounded-2xl ${tierColors[tier].bg} border ${
        isPopular ? 'border-blue-500 shadow-blue-100' : tierColors[tier].border
      } p-8 shadow-lg flex flex-col h-full`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-2xl font-bold ${tierColors[tier].text}`}>{tier}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold">₹{currentPrice}</span>
          <span className="text-gray-500 ml-2">/{isAnnual ? 'year' : 'month'}</span>
          {isAnnual && (
            <div className="mt-1 text-sm text-green-600 font-medium">
              Save {savings}% with annual billing
            </div>
          )}
        </div>
      </div>

      <ul className="space-y-4 flex-grow mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckIcon
              className={`h-5 w-5 mr-2 flex-shrink-0 ${
                feature.included ? 'text-green-500' : 'text-gray-300'
              }`}
            />
            <span
              className={`text-sm ${
                feature.highlight ? 'font-medium text-gray-900' : 'text-gray-500'
              }`}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onUpgrade}
        disabled={isCurrentPlan}
        className={`w-full rounded-lg px-4 py-2 text-sm font-medium ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
      </button>
    </div>
  );
};

export default PricingCard; 