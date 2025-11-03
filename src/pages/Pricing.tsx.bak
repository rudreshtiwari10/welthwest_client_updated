import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription, SubscriptionTier } from '../contexts/SubscriptionContext';
import BillingToggle from '../components/subscription/BillingToggle';
import PricingCard from '../components/subscription/PricingCard';
import FeatureComparison from '../components/subscription/FeatureComparison';
import UpgradeModal from '../components/subscription/UpgradeModal';

const PRICING_DATA = {
  FREE: {
    monthly: 0,
    annual: 0,
  },
  BASIC: {
    monthly: 399,
    annual: 3828, // ₹319.20/month
  },
  PRO: {
    monthly: 999,
    annual: 9588, // ₹799.20/month
  },
  ENTERPRISE: {
    monthly: 2999,
    annual: 28788, // ₹2399.20/month
  },
};

const FEATURES = [
  {
    name: 'Backtesting',
    description: 'Test your trading strategies with historical data',
    tiers: {
      FREE: '2/day',
      BASIC: '10/day',
      PRO: '30/day',
      ENTERPRISE: 'Unlimited',
    },
  },
  {
    name: 'AI Trading Assistant',
    description: 'Get AI-powered insights and recommendations',
    tiers: {
      FREE: '5 queries/day',
      BASIC: '20 queries/day',
      PRO: '50 queries/day',
      ENTERPRISE: 'Unlimited',
    },
  },
  {
    name: 'Market Data',
    description: 'Access to real-time and historical market data',
    tiers: {
      FREE: 'Delayed',
      BASIC: '15-min delayed',
      PRO: 'Real-time',
      ENTERPRISE: 'Real-time',
    },
  },
  {
    name: 'Technical Indicators',
    description: 'Advanced technical analysis tools',
    tiers: {
      FREE: true,
      BASIC: true,
      PRO: true,
      ENTERPRISE: true,
    },
  },
  {
    name: 'Portfolio Analytics',
    description: 'Detailed portfolio performance analysis',
    tiers: {
      FREE: 'Basic',
      BASIC: 'Advanced',
      PRO: 'Professional',
      ENTERPRISE: 'Enterprise',
    },
  },
  {
    name: 'API Access',
    description: 'Programmatic access to our platform',
    tiers: {
      FREE: false,
      BASIC: '100 calls/day',
      PRO: '1000 calls/day',
      ENTERPRISE: 'Unlimited',
    },
  },
  {
    name: 'Priority Support',
    description: 'Get help when you need it',
    tiers: {
      FREE: false,
      BASIC: 'Email',
      PRO: 'Email & Chat',
      ENTERPRISE: '24/7 Priority',
    },
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptionDetails, upgradeSubscription } = useSubscription();
  const [isAnnual, setIsAnnual] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    isOpen: boolean;
    tier: SubscriptionTier | null;
  }>({
    isOpen: false,
    tier: null,
  });

  const handleUpgradeClick = (tier: SubscriptionTier) => {
    // Navigate to plan details page instead of showing modal
    const billing = isAnnual ? 'annual' : 'monthly';
    navigate(`/plan-details/${tier.toLowerCase()}/${billing}`);
  };

  const handleModalClose = () => {
    setUpgradeModalData({
      isOpen: false,
      tier: null,
    });
  };

  const handleUpgradeConfirm = async () => {
    if (!upgradeModalData.tier) return;
    await upgradeSubscription(upgradeModalData.tier);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
          Choose Your Plan
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Get the tools you need to trade smarter. Start with our free plan or upgrade for more features.
        </p>
      </div>

      <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} />

      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-4">
        {Object.keys(PRICING_DATA).map((tier) => (
          <PricingCard
            key={tier}
            tier={tier as SubscriptionTier}
            price={{
              monthly: PRICING_DATA[tier as SubscriptionTier].monthly,
              annual: PRICING_DATA[tier as SubscriptionTier].annual,
            }}
            features={FEATURES.map(feature => ({
              name: feature.name,
              included: feature.tiers[tier as SubscriptionTier] !== false,
              highlight: typeof feature.tiers[tier as SubscriptionTier] === 'string',
            }))}
            isPopular={tier === 'PRO'}
            isCurrentPlan={subscriptionDetails?.tier === tier}
            isAnnual={isAnnual}
            onUpgrade={() => handleUpgradeClick(tier as SubscriptionTier)}
          />
        ))}
      </div>

      <FeatureComparison features={FEATURES} />

      {upgradeModalData.tier && (
        <UpgradeModal
          isOpen={upgradeModalData.isOpen}
          onClose={handleModalClose}
          currentTier={subscriptionDetails?.tier || 'FREE'}
          newTier={upgradeModalData.tier}
          prices={{
            current: isAnnual
              ? PRICING_DATA[subscriptionDetails?.tier || 'FREE'].annual
              : PRICING_DATA[subscriptionDetails?.tier || 'FREE'].monthly,
            new: isAnnual
              ? PRICING_DATA[upgradeModalData.tier].annual
              : PRICING_DATA[upgradeModalData.tier].monthly,
          }}
          isAnnual={isAnnual}
          onConfirm={handleUpgradeConfirm}
        />
      )}
    </div>
  );
};

export default PricingPage; 