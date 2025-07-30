import React from 'react';
import ParameterDisplayCard from './ParameterDisplayCard';

interface TechnicalIndicatorGridProps {
  indicators: {
    sma_20?: number;
    sma_50?: number;
    ema_12?: number;
    ema_26?: number;
    rsi?: number;
    macd?: number;
    macd_signal?: number;
    bollinger_upper?: number;
    bollinger_lower?: number;
    atr?: number;
    volume_sma?: number;
    [key: string]: any;
  };
  currentPrice?: number;
  title?: string;
  className?: string;
}

const TechnicalIndicatorGrid: React.FC<TechnicalIndicatorGridProps> = ({
  indicators,
  currentPrice,
  title = "Technical Indicators",
  className = ""
}) => {
  const getSignalColor = (indicator: string, value: number): 'success' | 'danger' | 'warning' | 'info' | 'default' => {
    switch (indicator) {
      case 'rsi':
        if (value > 70) return 'danger'; // Overbought
        if (value < 30) return 'success'; // Oversold
        return 'info';
      
      case 'sma_20':
      case 'sma_50':
      case 'ema_12':
      case 'ema_26':
        if (currentPrice && value) {
          return currentPrice > value ? 'success' : 'danger';
        }
        return 'default';
      
      case 'macd':
        return value > 0 ? 'success' : 'danger';
      
      default:
        return 'default';
    }
  };

  const getSignalDescription = (indicator: string, value: number): string => {
    switch (indicator) {
      case 'rsi':
        if (value > 70) return 'Overbought - Consider selling';
        if (value < 30) return 'Oversold - Consider buying';
        return 'Neutral momentum';
      
      case 'sma_20':
        return currentPrice && value ? 
          (currentPrice > value ? 'Price above 20-day average' : 'Price below 20-day average') :
          '20-day Simple Moving Average';
      
      case 'sma_50':
        return currentPrice && value ? 
          (currentPrice > value ? 'Price above 50-day average' : 'Price below 50-day average') :
          '50-day Simple Moving Average';
      
      case 'ema_12':
        return 'Fast Exponential Moving Average';
      
      case 'ema_26':
        return 'Slow Exponential Moving Average';
      
      case 'macd':
        return value > 0 ? 'Bullish momentum' : 'Bearish momentum';
      
      case 'macd_signal':
        return 'MACD Signal Line';
      
      case 'bollinger_upper':
        return 'Upper Bollinger Band';
      
      case 'bollinger_lower':
        return 'Lower Bollinger Band';
      
      case 'atr':
        return 'Average True Range - Volatility measure';
      
      case 'volume_sma':
        return 'Average Volume';
      
      default:
        return 'Technical indicator';
    }
  };

  const formatIndicatorValue = (indicator: string, value: number): string => {
    if (indicator === 'rsi') {
      return value.toFixed(2);
    }
    if (indicator === 'volume_sma') {
      return value.toLocaleString();
    }
    return `₹${value.toFixed(2)}`;
  };

  const indicatorData = Object.entries(indicators)
    .filter(([key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      key,
      label: key.replace(/_/g, ' ').toUpperCase(),
      value: value as number,
      colorScheme: getSignalColor(key, value as number),
      description: getSignalDescription(key, value as number),
      format: key === 'rsi' ? 'decimal' : key === 'volume_sma' ? 'number' : 'currency'
    }));

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <div className="w-1 h-6 bg-purple-500 rounded mr-3"></div>
        {title}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {indicatorData.map((indicator, index) => (
          <div key={index} className="relative group">
            <ParameterDisplayCard
              label={indicator.label}
              value={indicator.value}
              format={indicator.format as any}
              colorScheme={indicator.colorScheme}
              className="transition-all duration-200 hover:shadow-lg hover:scale-105"
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap max-w-xs">
              {indicator.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Signals Summary */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-600 rounded-lg border">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Signal Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-lg font-bold ${getBullishSignals(indicators) > getBearishSignals(indicators) ? 'text-green-600' : 'text-red-600'}`}>
              {getBullishSignals(indicators) > getBearishSignals(indicators) ? 'Bullish' : 'Bearish'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Overall Trend</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {getBullishSignals(indicators)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bullish Signals</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {getBearishSignals(indicators)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bearish Signals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for signal analysis
const getBullishSignals = (indicators: any): number => {
  let bullishCount = 0;
  
  if (indicators.rsi && indicators.rsi < 30) bullishCount++;
  if (indicators.macd && indicators.macd > 0) bullishCount++;
  // Add more bullish signal logic here
  
  return bullishCount;
};

const getBearishSignals = (indicators: any): number => {
  let bearishCount = 0;
  
  if (indicators.rsi && indicators.rsi > 70) bearishCount++;
  if (indicators.macd && indicators.macd < 0) bearishCount++;
  // Add more bearish signal logic here
  
  return bearishCount;
};

export default TechnicalIndicatorGrid;