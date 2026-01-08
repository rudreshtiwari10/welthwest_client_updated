/**
 * Macro Dashboard Component
 *
 * Displays macroeconomic indicators affecting SHORT opportunities:
 * - Overall SHORT bias score with visual progress bar
 * - 7 indicator sections with traffic light system
 * - Real-time updates and trend indicators
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  macroService,
  MacroDashboardData,
  MacroIndicator,
  ShortBiasScore,
  MacroSection
} from '../../services/screenerService';

// Light color mapping
const LIGHT_COLORS = {
  green: { bg: 'bg-green-500', ring: 'ring-green-500/30', text: 'text-green-400', pulse: '' },
  yellow: { bg: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-400', pulse: 'animate-pulse' },
  red: { bg: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-400', pulse: 'animate-pulse' },
  gray: { bg: 'bg-gray-500', ring: 'ring-gray-500/30', text: 'text-gray-400', pulse: '' }
};

// Trend icons
const TREND_ICONS: Record<string, string> = {
  rising: '📈',
  falling: '📉',
  stable: '➜',
  weakening: '📉',
  narrowing: '📉',
  outflow: '📉',
  selling: '📉',
  buying: '📈',
  inflow: '📈',
  sticky: '⚠️',
  deteriorating: '📉'
};

// Traffic Light Component
const TrafficLight: React.FC<{ light: 'green' | 'yellow' | 'red' | 'gray' }> = ({ light }) => {
  const colors = LIGHT_COLORS[light];
  return (
    <div className={`w-3 h-3 rounded-full ${colors.bg} ${colors.pulse} ring-2 ${colors.ring}`} />
  );
};

// Individual Indicator Card
const IndicatorCard: React.FC<{
  indicator: MacroIndicator;
  keyName: string;
  compact?: boolean;
}> = ({ indicator, keyName, compact = false }) => {
  const colors = LIGHT_COLORS[indicator.light] || LIGHT_COLORS.gray;
  const trendIcon = indicator.trend ? TREND_ICONS[indicator.trend.toLowerCase()] || '➜' : '➜';

  return (
    <div className={`
      bg-gray-800/50 rounded-lg border border-gray-700/50
      hover:border-gray-600 transition-all duration-200
      ${compact ? 'p-2' : 'p-3'}
    `}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrafficLight light={indicator.light} />
          <span className={`text-xs font-medium ${colors.text}`}>
            {indicator.display_name}
          </span>
        </div>
        {indicator.impact_shorts === 'positive' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/50 text-red-400">
            SHORT+
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-lg font-bold text-white">
          {typeof indicator.value === 'number' ? indicator.value.toLocaleString() : indicator.value}
        </span>
        {indicator.unit && (
          <span className="text-xs text-gray-500">{indicator.unit}</span>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className={`text-xs ${colors.text}`}>
          {indicator.status}
        </span>
        {indicator.trend && (
          <span className="text-xs text-gray-500">
            {trendIcon} {indicator.trend}
          </span>
        )}
      </div>

      {indicator.change !== undefined && indicator.change !== 0 && (
        <div className="mt-1">
          <span className={`text-xs ${indicator.change > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}
            {indicator.change_pct !== undefined && ` (${indicator.change_pct > 0 ? '+' : ''}${indicator.change_pct.toFixed(2)}%)`}
          </span>
        </div>
      )}
    </div>
  );
};

// Section Component
const MacroSectionCard: React.FC<{
  section: MacroSection;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ section, sectionKey, isExpanded, onToggle }) => {
  const indicators = Object.entries(section.data || {});

  // Count lights for summary
  const lightCounts = indicators.reduce((acc, [_, ind]) => {
    acc[ind.light] = (acc[ind.light] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{section.icon}</span>
          <span className="text-sm font-medium text-white">{section.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Light Summary */}
          <div className="flex items-center gap-2">
            {lightCounts.red && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-red-400">{lightCounts.red}</span>
              </div>
            )}
            {lightCounts.yellow && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-amber-400">{lightCounts.yellow}</span>
              </div>
            )}
            {lightCounts.green && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-400">{lightCounts.green}</span>
              </div>
            )}
          </div>

          {/* Expand/Collapse Icon */}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {indicators.map(([key, indicator]) => (
              <IndicatorCard key={key} indicator={indicator} keyName={key} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Bias Score Display
const BiasScoreDisplay: React.FC<{ bias: ShortBiasScore }> = ({ bias }) => {
  const percentage = (bias.score / bias.max_score) * 100;

  // Determine color based on score
  const getScoreColor = () => {
    if (percentage >= 70) return { bar: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' };
    if (percentage >= 50) return { bar: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/50' };
    if (percentage >= 30) return { bar: 'bg-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' };
    return { bar: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/50' };
  };

  const colors = getScoreColor();

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-xl">↓</span>
          <span className="text-sm font-medium text-white">SHORT Bias Score</span>
        </div>
        <span className={`text-2xl font-bold ${colors.text}`}>
          {bias.score}/{bias.max_score}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${colors.bar} transition-all duration-500 shadow-lg ${colors.glow}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Bias Level */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-semibold ${colors.text}`}>
          {bias.bias_level}
        </span>
        <span className="text-xs text-gray-400">
          {bias.percentage}% favorable
        </span>
      </div>

      {/* Recommendation */}
      <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700">
        <p className="text-xs text-gray-300">
          {bias.recommendation}
        </p>
      </div>

      {/* Breakdown */}
      {bias.breakdown && bias.breakdown.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Contributing Factors:</p>
          <div className="space-y-1">
            {bias.breakdown.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{item.factor}</span>
                <span className="text-red-400">+{item.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
interface MacroDashboardProps {
  onClose?: () => void;
  compact?: boolean;
}

const MacroDashboard: React.FC<MacroDashboardProps> = ({ onClose, compact = false }) => {
  const [data, setData] = useState<MacroDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await macroService.getDashboard();
      if (result.status === 'success') {
        setData(result);
        setLastUpdated(new Date());
        // Expand first section by default
        if (Object.keys(expandedSections).length === 0) {
          setExpandedSections({ interest_rates: true });
        }
      } else {
        setError('Failed to load macro data');
      }
    } catch (err: any) {
      console.error('Error fetching macro dashboard:', err);
      setError(err.message || 'Failed to load macro data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading && !data) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading macro indicators...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-gray-900 rounded-xl border border-red-800/50 p-6">
        <div className="flex items-center gap-3 text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
          <button onClick={fetchData} className="ml-auto text-xs text-red-400 hover:text-red-300 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const sections = data.sections;
  const sectionOrder = [
    'interest_rates',
    'currency_flows',
    'growth_inflation',
    'volatility_sentiment',
    'oil_commodities',
    'us_macro',
    'market_breadth'
  ];

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-900/30 to-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">📊</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Macro Dashboard</h3>
            <p className="text-xs text-gray-500">India SHORT Environment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {/* Bias Score */}
        {data.short_bias && (
          <BiasScoreDisplay bias={data.short_bias} />
        )}

        {/* Sections */}
        <div className="space-y-2">
          {sectionOrder.map(key => {
            const section = sections[key as keyof typeof sections];
            if (!section) return null;
            return (
              <MacroSectionCard
                key={key}
                section={section}
                sectionKey={key}
                isExpanded={expandedSections[key] || false}
                onToggle={() => toggleSection(key)}
              />
            );
          })}
        </div>

        {/* Footer Legend */}
        <div className="pt-3 border-t border-gray-800">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Safe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-red-400">SHORT+</span>
              <span>= Good for shorts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroDashboard;
