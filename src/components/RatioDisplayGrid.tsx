import React from 'react';
import ParameterDisplayCard from './ParameterDisplayCard';

interface RatioDisplayGridProps {
  metrics: {
    sharpe_ratio?: number;
    sortino_ratio?: number;
    profit_factor?: number;
    calmar_ratio?: number;
    recovery_factor?: number;
    win_rate?: number;
    total_return?: number;
    max_drawdown_percent?: number;
    [key: string]: any;
  };
  title?: string;
  className?: string;
}

const RatioDisplayGrid: React.FC<RatioDisplayGridProps> = ({
  metrics,
  title = "Performance Ratios",
  className = ""
}) => {
  const ratioData = [
    {
      label: 'Sharpe Ratio',
      value: metrics.sharpe_ratio,
      format: 'decimal' as const,
      colorScheme: (metrics.sharpe_ratio && metrics.sharpe_ratio > 1) ? 'success' as const : 
                  (metrics.sharpe_ratio && metrics.sharpe_ratio > 0) ? 'warning' as const : 'danger' as const,
      description: 'Risk-adjusted return measure'
    },
    {
      label: 'Sortino Ratio',
      value: metrics.sortino_ratio,
      format: 'decimal' as const,
      colorScheme: (metrics.sortino_ratio && metrics.sortino_ratio > 1) ? 'success' as const : 
                  (metrics.sortino_ratio && metrics.sortino_ratio > 0) ? 'warning' as const : 'danger' as const,
      description: 'Downside deviation adjusted return'
    },
    {
      label: 'Profit Factor',
      value: metrics.profit_factor,
      format: 'decimal' as const,
      colorScheme: (metrics.profit_factor && metrics.profit_factor > 1.5) ? 'success' as const : 
                  (metrics.profit_factor && metrics.profit_factor > 1) ? 'warning' as const : 'danger' as const,
      description: 'Gross profit / Gross loss'
    },
    {
      label: 'Calmar Ratio',
      value: metrics.calmar_ratio,
      format: 'decimal' as const,
      colorScheme: (metrics.calmar_ratio && metrics.calmar_ratio > 0.5) ? 'success' as const : 
                  (metrics.calmar_ratio && metrics.calmar_ratio > 0) ? 'warning' as const : 'danger' as const,
      description: 'Annual return / Max drawdown'
    },
    {
      label: 'Recovery Factor',
      value: metrics.recovery_factor,
      format: 'decimal' as const,
      colorScheme: (metrics.recovery_factor && metrics.recovery_factor > 2) ? 'success' as const : 
                  (metrics.recovery_factor && metrics.recovery_factor > 1) ? 'warning' as const : 'danger' as const,
      description: 'Net profit / Max drawdown'
    },
    {
      label: 'Win Rate',
      value: metrics.win_rate,
      format: 'percentage' as const,
      colorScheme: (metrics.win_rate && metrics.win_rate > 60) ? 'success' as const : 
                  (metrics.win_rate && metrics.win_rate > 40) ? 'warning' as const : 'danger' as const,
      description: 'Percentage of winning trades'
    },
    {
      label: 'Total Return',
      value: metrics.total_return,
      format: 'percentage' as const,
      colorScheme: (metrics.total_return && metrics.total_return > 0) ? 'success' as const : 'danger' as const,
      description: 'Overall portfolio return'
    },
    {
      label: 'Max Drawdown',
      value: metrics.max_drawdown_percent,
      format: 'percentage' as const,
      colorScheme: (metrics.max_drawdown_percent && Math.abs(metrics.max_drawdown_percent) < 10) ? 'success' as const : 
                  (metrics.max_drawdown_percent && Math.abs(metrics.max_drawdown_percent) < 20) ? 'warning' as const : 'danger' as const,
      description: 'Maximum portfolio decline'
    }
  ];

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <div className="w-1 h-6 bg-blue-500 rounded mr-3"></div>
        {title}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {ratioData.map((ratio, index) => (
          <div key={index} className="relative group">
            <ParameterDisplayCard
              label={ratio.label}
              value={ratio.value}
              format={ratio.format}
              colorScheme={ratio.colorScheme}
              size="medium"
              className="transition-all duration-200 hover:shadow-lg hover:scale-105"
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
              {ratio.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Rating */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-600 rounded-lg border">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Assessment</h4>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Overall Rating</span>
              <span>{getOverallRating(metrics)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getRatingColor(metrics)}`}
                style={{ width: `${getRatingPercentage(metrics)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for performance rating
const getOverallRating = (metrics: any): string => {
  let score = 0;
  let factors = 0;

  if (metrics.sharpe_ratio !== undefined) {
    score += metrics.sharpe_ratio > 1 ? 2 : metrics.sharpe_ratio > 0 ? 1 : 0;
    factors++;
  }
  
  if (metrics.profit_factor !== undefined) {
    score += metrics.profit_factor > 1.5 ? 2 : metrics.profit_factor > 1 ? 1 : 0;
    factors++;
  }
  
  if (metrics.win_rate !== undefined) {
    score += metrics.win_rate > 60 ? 2 : metrics.win_rate > 40 ? 1 : 0;
    factors++;
  }
  
  if (metrics.total_return !== undefined) {
    score += metrics.total_return > 20 ? 2 : metrics.total_return > 0 ? 1 : 0;
    factors++;
  }

  if (factors === 0) return 'N/A';
  
  const avgScore = score / factors;
  if (avgScore >= 1.5) return 'Excellent';
  if (avgScore >= 1) return 'Good';
  if (avgScore >= 0.5) return 'Fair';
  return 'Poor';
};

const getRatingPercentage = (metrics: any): number => {
  const rating = getOverallRating(metrics);
  switch (rating) {
    case 'Excellent': return 90;
    case 'Good': return 70;
    case 'Fair': return 50;
    case 'Poor': return 25;
    default: return 0;
  }
};

const getRatingColor = (metrics: any): string => {
  const rating = getOverallRating(metrics);
  switch (rating) {
    case 'Excellent': return 'bg-green-500';
    case 'Good': return 'bg-blue-500';
    case 'Fair': return 'bg-yellow-500';
    case 'Poor': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export default RatioDisplayGrid;