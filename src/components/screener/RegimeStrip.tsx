/**
 * Regime Strip Component with SHORT Interpretation
 *
 * Displays NIFTY 50 market regime probabilities as a horizontal bar
 * with 4 colored segments representing each regime state.
 * Optionally shows SHORT interpretation and favorability.
 */

import React from 'react';
import { RegimeStripData } from '../../services/screenerService';

interface ExtendedRegimeStripData extends RegimeStripData {
  short_interpretation?: string;
  short_favorable?: boolean;
}

interface RegimeStripProps {
  data: ExtendedRegimeStripData | null;
  isLoading?: boolean;
}

const REGIME_CONFIG = {
  'Bullish Trend': { color: '#22c55e', bgColor: 'bg-green-500', label: 'BULL' },
  'Bearish Trend': { color: '#ef4444', bgColor: 'bg-red-500', label: 'BEAR' },
  'High Volatility': { color: '#f59e0b', bgColor: 'bg-amber-500', label: 'HVOL' },
  'Low Volatility': { color: '#3b82f6', bgColor: 'bg-blue-500', label: 'LVOL' }
};

const RegimeStrip: React.FC<RegimeStripProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-gray-400">
        No regime data available
      </div>
    );
  }

  const probabilities = data.probabilities || {};
  const currentRegime = data.current_regime || 'Unknown';
  const confidence = data.confidence || 0;

  const shortInterpretation = data.short_interpretation;
  const shortFavorable = data.short_favorable;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-400 text-sm">NIFTY 50 Regime:</span>
          <span
            className="font-semibold px-2 py-0.5 rounded text-sm"
            style={{
              backgroundColor: REGIME_CONFIG[currentRegime as keyof typeof REGIME_CONFIG]?.color || '#6b7280',
              color: 'white'
            }}
          >
            {currentRegime}
          </span>
          {shortFavorable && (
            <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-700">
              SHORT Favorable
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400">
          Confidence: <span className="text-white font-medium">{(confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* SHORT Interpretation */}
      {shortInterpretation && (
        <div className="mb-3 text-xs text-gray-400 bg-gray-700/50 rounded px-3 py-2">
          <span className="text-red-400 font-medium">SHORT Strategy:</span>{' '}
          {shortInterpretation}
        </div>
      )}

      {/* Probability Bar */}
      <div className="h-8 rounded-lg overflow-hidden flex">
        {Object.entries(REGIME_CONFIG).map(([regime, config]) => {
          const prob = probabilities[regime] || 0;
          const width = Math.max(prob * 100, 0);

          if (width < 1) return null;

          return (
            <div
              key={regime}
              className="relative flex items-center justify-center transition-all duration-300"
              style={{
                width: `${width}%`,
                backgroundColor: config.color,
                minWidth: width > 5 ? '40px' : '0'
              }}
              title={`${regime}: ${(prob * 100).toFixed(1)}%`}
            >
              {width > 10 && (
                <span className="text-white text-xs font-medium">
                  {config.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
        {Object.entries(REGIME_CONFIG).map(([regime, config]) => {
          const prob = probabilities[regime] || 0;
          const isActive = regime === currentRegime;

          return (
            <div
              key={regime}
              className={`flex items-center gap-1.5 text-xs ${isActive ? 'opacity-100' : 'opacity-60'}`}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-gray-300">
                {config.label}: {(prob * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegimeStrip;
