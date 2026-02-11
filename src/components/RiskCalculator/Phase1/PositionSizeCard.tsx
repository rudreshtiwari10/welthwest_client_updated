import React from 'react';
import { CurrencyRupeeIcon, ScaleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import StatWidget from '../Shared/StatWidget';

interface PositionSizeCardProps {
  result: any;
  className?: string;
}

const PositionSizeCard: React.FC<PositionSizeCardProps> = ({
  result,
  className = ''
}) => {
  if (!result?.data) {
    return null;
  }

  const { position_sizing, risk_analysis, risk_reward } = result.data;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Recommended Position Size
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Quantity */}
        <StatWidget
          label="Recommended Quantity"
          value={position_sizing.max_quantity.toLocaleString()}
          subValue={`Position Value: ₹${position_sizing.position_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          icon={ChartBarIcon}
          variant="info"
        />

        {/* Risk Amount */}
        <StatWidget
          label="Risk Per Trade"
          value={`₹${risk_analysis.risk_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          subValue={`${risk_analysis.risk_percentage.toFixed(2)}% of capital`}
          icon={CurrencyRupeeIcon}
          variant="warning"
        />

        {/* Risk:Reward Ratio */}
        <StatWidget
          label="Risk:Reward Ratio"
          value={risk_reward.has_target ? risk_reward.ratio_text : 'N/A'}
          subValue={risk_reward.has_target ? `Risk: ₹${risk_reward.risk.toFixed(2)} | Reward: ₹${risk_reward.reward.toFixed(2)}` : 'No target set'}
          icon={ScaleIcon}
          variant={risk_reward.has_target && risk_reward.ratio >= 2 ? 'success' : 'default'}
        />
      </div>

      {/* Message */}
      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
        <p className="text-sm text-primary-800 dark:text-primary-200">
          {position_sizing.message}
        </p>
      </div>

      {/* Additional Details */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Risk per Share</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
            ₹{position_sizing.risk_per_share.toFixed(2)}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">SL Distance</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
            {risk_analysis.sl_distance_percentage.toFixed(2)}%
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">SL Distance</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
            ₹{risk_analysis.sl_distance_rupees.toFixed(2)}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Trade Type</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 uppercase">
            {result.data.trade_type}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PositionSizeCard;
