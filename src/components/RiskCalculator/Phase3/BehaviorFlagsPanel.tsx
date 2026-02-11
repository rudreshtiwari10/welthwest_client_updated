import React from 'react';
import {
  ExclamationTriangleIcon,
  FireIcon,
  BoltIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface BehaviorFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  count?: number;
}

interface BehaviorFlagsPanelProps {
  flags: BehaviorFlag[];
  className?: string;
}

const BehaviorFlagsPanel: React.FC<BehaviorFlagsPanelProps> = ({
  flags,
  className = ''
}) => {
  if (!flags || flags.length === 0) {
    return (
      <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            All Clear!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            No behavioral warnings detected. Trading discipline is maintained.
          </p>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'overtrading':
        return ArrowTrendingUpIcon;
      case 'revenge_trading':
        return FireIcon;
      case 'rapid_fire':
        return BoltIcon;
      case 'fatigue':
        return ClockIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-800 dark:text-amber-200',
          icon: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300'
        };
      default:
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: 'text-yellow-600 dark:text-yellow-400',
          badge: 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-700 dark:text-yellow-300'
        };
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Behavior Warnings
          </h3>
        </div>
        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
          {flags.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {flags.map((flag, index) => {
          const colors = getSeverityColor(flag.severity);
          const Icon = getIcon(flag.type);

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`mt-0.5 ${colors.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-semibold ${colors.text}`}>
                      {flag.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}>
                      {flag.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className={`text-sm ${colors.text}`}>
                    {flag.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(flag.timestamp).toLocaleTimeString('en-IN')}
                    </p>
                    {flag.count && flag.count > 1 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Occurred {flag.count} times
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Take a break if you see multiple warnings. Trading emotionally often leads to poor decisions.
        </p>
      </div>
    </div>
  );
};

export default BehaviorFlagsPanel;
