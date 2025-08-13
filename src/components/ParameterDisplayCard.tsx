import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface ParameterDisplayCardProps {
  label: string;
  value: number | string | undefined;
  format?: 'currency' | 'percentage' | 'decimal' | 'number' | 'string';
  showTrend?: boolean;
  trendValue?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  colorScheme?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

const ParameterDisplayCard: React.FC<ParameterDisplayCardProps> = ({
  label,
  value,
  format = 'string',
  showTrend = false,
  trendValue,
  className = '',
  size = 'medium',
  colorScheme = 'default'
}) => {
  const parseNumeric = (raw: number | string | undefined | null): number | null => {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
    if (typeof raw === 'string') {
      const cleaned = raw.replace(/[%₹$,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const formatValue = (val: number | string | undefined) => {
    if (val === undefined || val === null) return 'N/A';

    const num = parseNumeric(val);

    switch (format) {
      case 'currency': {
        if (num === null) return 'N/A';
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      case 'percentage': {
        if (num === null) return 'N/A';
        return `${num.toFixed(2)}%`;
      }
      case 'decimal': {
        if (num === null) return 'N/A';
        return num.toFixed(2);
      }
      case 'number': {
        if (num === null) return 'N/A';
        return Number.isInteger(num) ? num.toLocaleString('en-IN') : num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
      }
      default:
        return String(val);
    }
  };

  const getValueColor = () => {
    if (colorScheme !== 'default') {
      switch (colorScheme) {
        case 'success': return 'text-green-600 dark:text-green-400';
        case 'danger': return 'text-red-600 dark:text-red-400';
        case 'warning': return 'text-yellow-600 dark:text-yellow-400';
        case 'info': return 'text-blue-600 dark:text-blue-400';
        default: return 'text-gray-900 dark:text-white';
      }
    }

    if (format === 'currency' || format === 'percentage') {
      const numValue = parseNumeric(value);
      if (numValue === null) return 'text-gray-600 dark:text-gray-400';
      return numValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    }
    
    return 'text-gray-900 dark:text-white';
  };

  const getTrendIcon = () => {
    if (!showTrend || trendValue === undefined) return null;
    return trendValue >= 0 ? 
      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" /> : 
      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-2 md:p-3 text-sm';
      case 'large':
        return 'p-3 md:p-6 text-base md:text-lg';
      default:
        return 'p-2.5 md:p-4 text-sm md:text-base';
    }
  };

  const getValueSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-base md:text-lg font-semibold';
      case 'large':
        return 'text-lg md:text-3xl font-bold';
      default:
        return 'text-base md:text-xl font-bold';
    }
  };

  const formatted = formatValue(value);

  return (
    <div className={`bg-white dark:bg-gray-600 rounded-lg border shadow-sm ${getSizeClasses()} ${className} min-w-0`}>
      <div className="text-xs md:text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium truncate">
        {label}
      </div>
      <div className={`${getValueSizeClasses()} ${getValueColor()} flex items-center` }>
        {getTrendIcon()}
        <span className={`${showTrend && trendValue !== undefined ? 'ml-1' : ''} truncate inline-block max-w-full` } title={formatted}>
          {formatted}
        </span>
      </div>
      {showTrend && trendValue !== undefined && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {trendValue >= 0 ? '+' : ''}{trendValue.toFixed(2)}% trend
        </div>
      )}
    </div>
  );
};

export default ParameterDisplayCard;