import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend = 'neutral' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
      <div className="mt-2 flex items-center">
        <span className={`text-2xl font-bold ${getTrendColor()}`}>{value}</span>
        {getTrendIcon() && (
          <span className={`ml-2 ${getTrendColor()}`}>
            {getTrendIcon()}
          </span>
        )}
      </div>
    </div>
  );
};

export type { MetricCardProps };
export default MetricCard; 