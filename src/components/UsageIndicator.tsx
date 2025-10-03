import React, { useEffect, useState } from 'react';
import useAnonymousUsage from '../hooks/useAnonymousUsage';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UsageIndicatorProps {
  feature: string;
  featureDisplayName?: string;
  refreshTrigger?: number;
}

/**
 * Compact usage indicator that shows remaining free runs
 * Displays as a small badge in the corner or top of the feature
 */
const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  feature,
  featureDisplayName,
  refreshTrigger
}) => {
  const { user } = useAuth();
  const usage = useAnonymousUsage(feature, refreshTrigger);
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  // Don't show for authenticated users
  if (user) {
    return null;
  }

  // Don't show if no usage data
  if (!usage) {
    return null;
  }

  const displayName = featureDisplayName || feature;
  const percentRemaining = (usage.remaining / usage.limit) * 100;

  // Color based on remaining runs
  let colorClass = 'bg-blue-500';
  let textClass = 'text-blue-700';
  let borderClass = 'border-blue-300';

  if (usage.remaining <= 2) {
    colorClass = 'bg-red-500';
    textClass = 'text-red-700';
    borderClass = 'border-red-300';
  } else if (usage.remaining <= 5) {
    colorClass = 'bg-yellow-500';
    textClass = 'text-yellow-700';
    borderClass = 'border-yellow-300';
  }

  return (
    <div className="fixed top-20 right-4 z-50">
      <div
        className={`relative bg-white rounded-lg shadow-lg border-2 ${borderClass} p-3 min-w-[200px]`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${colorClass} animate-pulse`}></div>
            <span className="text-xs font-semibold text-gray-700">Free Trial</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign In
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{usage.remaining} runs left</span>
            <span>{usage.used}/{usage.limit}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
              style={{ width: `${percentRemaining}%` }}
            ></div>
          </div>
        </div>

        {/* Warning message */}
        {usage.remaining <= 3 && (
          <div className={`text-xs ${textClass} font-medium`}>
            {usage.remaining === 0
              ? 'Trial ended - Sign in to continue'
              : `Only ${usage.remaining} ${usage.remaining === 1 ? 'run' : 'runs'} remaining!`}
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
            <div className="font-semibold mb-1">Anonymous Trial</div>
            <div className="text-gray-300">
              You have {usage.remaining} free runs remaining for {displayName}.
              Sign in for unlimited access and to save your work.
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageIndicator;