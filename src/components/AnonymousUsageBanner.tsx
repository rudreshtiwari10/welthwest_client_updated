import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AnonymousUsageBannerProps {
  used: number;
  limit: number;
  remaining: number;
  feature: string;
  featureDisplayName?: string;
}

/**
 * Banner component to display anonymous usage information
 * Shows remaining free runs and prompts login when approaching limit
 */
const AnonymousUsageBanner: React.FC<AnonymousUsageBannerProps> = ({
  used,
  limit,
  remaining,
  feature,
  featureDisplayName
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Don't show banner if user is logged in
  if (user) {
    return null;
  }

  const displayName = featureDisplayName || feature;
  const percentUsed = (used / limit) * 100;

  // Determine banner color based on usage
  let bannerColor = 'bg-blue-50 border-blue-200 text-blue-800';
  if (remaining <= 2) {
    bannerColor = 'bg-red-50 border-red-200 text-red-800';
  } else if (remaining <= 5) {
    bannerColor = 'bg-yellow-50 border-yellow-200 text-yellow-800';
  }

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className={`${bannerColor} border rounded-lg p-4 mb-4`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">
              {remaining > 0
                ? `${remaining} of ${limit} free runs remaining`
                : 'Free trial limit reached'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                remaining <= 2
                  ? 'bg-red-600'
                  : remaining <= 5
                  ? 'bg-yellow-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <p className="text-sm">
            {remaining > 0 ? (
              <>
                You have {remaining} free {remaining === 1 ? 'run' : 'runs'} left for{' '}
                <span className="font-semibold">{displayName}</span>.{' '}
                <button
                  onClick={handleLogin}
                  className="underline hover:no-underline font-medium"
                >
                  Sign in
                </button>{' '}
                to unlock unlimited access.
              </>
            ) : (
              <>
                You've used all {limit} free runs for{' '}
                <span className="font-semibold">{displayName}</span>.{' '}
                <button
                  onClick={handleLogin}
                  className="underline hover:no-underline font-medium"
                >
                  Sign in
                </button>{' '}
                to continue using this feature.
              </>
            )}
          </p>
        </div>

        {remaining <= 3 && (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default AnonymousUsageBanner;