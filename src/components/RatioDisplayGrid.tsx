import React from 'react';
import ParameterDisplayCard from './ParameterDisplayCard';

interface RatioDisplayGridProps {
  metrics: {
    sharpe_ratio?: number; // lower_snake keys (frontend saved)
    sortino_ratio?: number;
    profit_factor?: number;
    calmar_ratio?: number;
    recovery_factor?: number;
    win_rate?: number; // in percentage 0-100
    total_return?: number; // in percentage 0-100
    max_drawdown_percent?: number; // in percentage 0-100
    // UPPER_SNAKE keys (beta backtest)
    Sharpe_Ratio?: number;
    Sortino_Ratio?: number;
    Profit_Factor?: number;
    Calmar_Ratio?: number;
    Win_Rate?: number;
    Total_Return_Pct?: number;
    Max_Drawdown?: number; // percent
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
  // Normalize metric keys from multiple possible shapes
  const normalized = {
    sharpe: metrics.sharpe_ratio ?? metrics.Sharpe_Ratio,
    sortino: metrics.sortino_ratio ?? metrics.Sortino_Ratio,
    profitFactor: metrics.profit_factor ?? metrics.Profit_Factor,
    calmar: metrics.calmar_ratio ?? metrics.Calmar_Ratio,
    recovery: metrics.recovery_factor ?? metrics.Recovery_Factor,
    winRatePct: metrics.win_rate ?? metrics.Win_Rate, // assumed already 0-100
    totalReturnPct: metrics.total_return ?? metrics.Total_Return_Pct,
    maxDrawdownPct: metrics.max_drawdown_percent ?? metrics.Max_Drawdown,
  };

  const ratioData = [
    {
      label: 'Sharpe Ratio',
      value: normalized.sharpe,
      format: 'decimal' as const,
      colorScheme: (normalized.sharpe && normalized.sharpe > 1) ? 'success' as const : 
                  (normalized.sharpe && normalized.sharpe > 0) ? 'warning' as const : 'danger' as const,
      description: 'Risk-adjusted return measure'
    },
    {
      label: 'Sortino Ratio',
      value: normalized.sortino,
      format: 'decimal' as const,
      colorScheme: (normalized.sortino && normalized.sortino > 1) ? 'success' as const : 
                  (normalized.sortino && normalized.sortino > 0) ? 'warning' as const : 'danger' as const,
      description: 'Downside deviation adjusted return'
    },
    {
      label: 'Profit Factor',
      value: normalized.profitFactor,
      format: 'decimal' as const,
      colorScheme: (normalized.profitFactor && normalized.profitFactor > 1.5) ? 'success' as const : 
                  (normalized.profitFactor && normalized.profitFactor > 1) ? 'warning' as const : 'danger' as const,
      description: 'Gross profit / Gross loss'
    },
    {
      label: 'Calmar Ratio',
      value: normalized.calmar,
      format: 'decimal' as const,
      colorScheme: (normalized.calmar && normalized.calmar > 0.5) ? 'success' as const : 
                  (normalized.calmar && normalized.calmar > 0) ? 'warning' as const : 'danger' as const,
      description: 'Annual return / Max drawdown'
    },
    {
      label: 'Win Rate',
      value: normalized.winRatePct,
      format: 'percentage' as const,
      colorScheme: (normalized.winRatePct && normalized.winRatePct > 60) ? 'success' as const : 
                  (normalized.winRatePct && normalized.winRatePct > 40) ? 'warning' as const : 'danger' as const,
      description: 'Percentage of winning trades'
    },
    {
      label: 'Total Return',
      value: normalized.totalReturnPct,
      format: 'percentage' as const,
      colorScheme: (normalized.totalReturnPct && normalized.totalReturnPct > 0) ? 'success' as const : 'danger' as const,
      description: 'Overall portfolio return'
    },
    {
      label: 'Max Drawdown',
      value: normalized.maxDrawdownPct,
      format: 'percentage' as const,
      colorScheme: (normalized.maxDrawdownPct && Math.abs(normalized.maxDrawdownPct) < 10) ? 'success' as const : 
                  (normalized.maxDrawdownPct && Math.abs(normalized.maxDrawdownPct) < 20) ? 'warning' as const : 'danger' as const,
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
    </div>
  );
};

export default RatioDisplayGrid;