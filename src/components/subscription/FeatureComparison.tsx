import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier } from '../../contexts/SubscriptionContext';

interface Feature {
  name: string;
  description?: string;
  tiers: {
    [key in SubscriptionTier]: boolean | string;
  };
}

interface FeatureComparisonProps {
  features: Feature[];
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ features }) => {
  const tiers: SubscriptionTier[] = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'];

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Compare Plan Features
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-200">
              <th className="py-5 px-4 text-left text-sm font-medium text-gray-500" scope="col">
                Features
              </th>
              {tiers.map((tier) => (
                <th
                  key={tier}
                  className="py-5 px-4 text-center text-sm font-medium text-gray-500"
                  scope="col"
                >
                  {tier}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {features.map((feature, featureIdx) => (
              <tr key={featureIdx} className={featureIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-5 px-4">
                  <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                  {feature.description && (
                    <div className="text-sm text-gray-500">{feature.description}</div>
                  )}
                </td>
                {tiers.map((tier) => (
                  <td key={tier} className="py-5 px-4 text-center">
                    {typeof feature.tiers[tier] === 'boolean' ? (
                      feature.tiers[tier] ? (
                        <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm text-gray-700">{feature.tiers[tier]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeatureComparison; 