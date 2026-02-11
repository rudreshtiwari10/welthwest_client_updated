/**
 * Timeframe Tabs Component
 *
 * Tab navigation for switching between timeframes:
 * - 5m (Scalping)
 * - 15m (Intraday)
 * - 1h (Swing)
 * - 1d (Position)
 */

import React from 'react';
import { Timeframe, TIMEFRAME_NAMES, TIMEFRAME_HOLD_TIMES } from '../../services/screenerService';

interface TimeframeTabsProps {
  activeTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  isLoading?: boolean;
}

const TIMEFRAMES: Timeframe[] = ['1d', '1h'];

const TimeframeTabs: React.FC<TimeframeTabsProps> = ({
  activeTimeframe,
  onTimeframeChange,
  isLoading
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {TIMEFRAMES.map((tf) => {
        const isActive = tf === activeTimeframe;
        return (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            disabled={isLoading}
            className={`
              flex flex-col items-center px-4 py-2 rounded-lg transition-all
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="font-semibold text-sm">{tf.toUpperCase()}</span>
            <span className="text-xs opacity-75">{TIMEFRAME_NAMES[tf]}</span>
            <span className="text-xs opacity-50">{TIMEFRAME_HOLD_TIMES[tf]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TimeframeTabs;
