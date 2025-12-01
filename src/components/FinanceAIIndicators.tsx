import React from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface IndicatorsData {
  rsi?: {
    value: number;
    signal: string;
    interpretation: string;
  };
  macd?: {
    trend: string;
    interpretation: string;
  };
  trend_analysis?: {
    overall_trend: string;
    interpretation: string;
  };
  bollinger_bands?: {
    signal: string;
    interpretation: string;
  };
}

interface FinanceAIIndicatorsProps {
  indicators: IndicatorsData;
  symbol?: string;
  currentPrice?: number;
}

const FinanceAIIndicators: React.FC<FinanceAIIndicatorsProps> = ({
  indicators,
  symbol,
  currentPrice
}) => {
  if (!indicators) return null;

  const getTrendIcon = (trend: string) => {
    if (trend === 'bullish' || trend === 'uptrend') {
      return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
    } else if (trend === 'bearish' || trend === 'downtrend') {
      return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <MinusIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    if (signal === 'bullish' || signal === 'oversold') {
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    } else if (signal === 'bearish' || signal === 'overbought') {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    } else {
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Technical Indicators
            </h3>
            {symbol && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                {symbol}
              </span>
            )}
          </div>
          {currentPrice && (
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              ${currentPrice.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RSI */}
        {indicators.rsi && (
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">RSI (14)</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {indicators.rsi.value.toFixed(1)}
              </span>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${getSignalColor(indicators.rsi.signal)}`}>
              {indicators.rsi.signal.toUpperCase()}
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {indicators.rsi.interpretation}
            </p>
          </div>
        )}

        {/* MACD */}
        {indicators.macd && (
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">MACD</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(indicators.macd.trend)}
                <span className={`text-xs px-2 py-1 rounded ${getSignalColor(indicators.macd.trend)}`}>
                  {indicators.macd.trend.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {indicators.macd.interpretation}
            </p>
          </div>
        )}

        {/* Trend Analysis */}
        {indicators.trend_analysis && (
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Overall Trend</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(indicators.trend_analysis.overall_trend)}
                <span className={`text-xs px-2 py-1 rounded ${getSignalColor(indicators.trend_analysis.overall_trend)}`}>
                  {indicators.trend_analysis.overall_trend.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {indicators.trend_analysis.interpretation}
            </p>
          </div>
        )}

        {/* Bollinger Bands */}
        {indicators.bollinger_bands && (
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Bollinger Bands</span>
              <span className={`text-xs px-2 py-1 rounded ${getSignalColor(indicators.bollinger_bands.signal)}`}>
                {indicators.bollinger_bands.signal.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {indicators.bollinger_bands.interpretation}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          📊 Real-time technical analysis powered by WelthWest Finance AI
        </p>
      </div>
    </div>
  );
};

export default FinanceAIIndicators;
