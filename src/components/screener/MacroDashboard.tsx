/**
 * Macro Dashboard Component
 *
 * Displays macroeconomic indicators affecting SHORT opportunities:
 * - Interest Rate Yields
 * - FII Flow
 * - USD/INR
 * - Growth & Inflation
 * - VIX (Volatility)
 * - Gold Prices
 * All displayed in graphical format
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  macroService,
  MacroDashboardData,
  MacroIndicator,
  ShortBiasScore,
  MacroSection
} from '../../services/screenerService';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// Color mapping for indicators
const LIGHT_COLORS = {
  green: { bg: '#22c55e', text: '#22c55e', fill: '#22c55e' },
  yellow: { bg: '#eab308', text: '#eab308', fill: '#eab308' },
  red: { bg: '#ef4444', text: '#ef4444', fill: '#ef4444' },
  gray: { bg: '#6b7280', text: '#6b7280', fill: '#6b7280' }
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

// Indicator ranges for visual representation
const INDICATOR_RANGES: Record<string, { min: number; max: number; optimal?: [number, number] }> = {
  'india_10y_yield': { min: 6.0, max: 8.5, optimal: [6.8, 7.2] },
  'us_10y_yield': { min: 3.5, max: 5.5, optimal: [4.0, 4.5] },
  'rate_differential': { min: 0.5, max: 3.5, optimal: [1.5, 2.5] },
  'usd_inr': { min: 80, max: 86, optimal: [82.5, 83.5] },
  'fii_daily': { min: -3000, max: 3000, optimal: [-500, 2000] },
  'fii_weekly': { min: -10000, max: 10000, optimal: [-1000, 5000] },
  'vix_india': { min: 10, max: 35, optimal: [12, 18] },
  'vix_global': { min: 10, max: 40, optimal: [12, 20] },
  'inflation_headline': { min: 0, max: 8, optimal: [2.0, 4.0] },
  'crude_oil': { min: 50, max: 120, optimal: [70, 80] },
  'gold_price': { min: 50000, max: 75000, optimal: [55000, 65000] }
};

// Gauge Chart Component for single indicator
const GaugeChart: React.FC<{
  indicator: MacroIndicator;
  keyName: string;
  range?: { min: number; max: number; optimal?: [number, number] };
}> = ({ indicator, keyName, range }) => {
  const value = typeof indicator.value === 'number' ? indicator.value : parseFloat(String(indicator.value));
  const colors = LIGHT_COLORS[indicator.light] || LIGHT_COLORS.gray;

  const defaultRange = range || INDICATOR_RANGES[keyName] || { min: 0, max: 100 };
  const percentage = ((value - defaultRange.min) / (defaultRange.max - defaultRange.min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Create data for gauge visualization
  const gaugeData = [
    { name: 'Value', value: clampedPercentage, fill: colors.fill },
    { name: 'Remaining', value: 100 - clampedPercentage, fill: '#374151' }
  ];

  const trendIcon = indicator.trend ? TREND_ICONS[indicator.trend.toLowerCase()] || '➜' : '➜';

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">{indicator.display_name}</h4>
        <span className={`text-xs px-2 py-1 rounded`} style={{ backgroundColor: colors.bg + '30', color: colors.text }}>
          {indicator.status}
        </span>
      </div>

      {/* Gauge Visualization */}
      <div className="mb-3">
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Value Display */}
        <div className="text-center -mt-16">
          <div className="text-2xl font-bold" style={{ color: colors.text }}>
            {value.toLocaleString()}
          </div>
          {indicator.unit && (
            <div className="text-xs text-gray-500">{indicator.unit}</div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-400">
          {defaultRange.min.toLocaleString()} - {defaultRange.max.toLocaleString()}
        </div>
        {indicator.change !== undefined && indicator.change !== 0 && (
          <div className={`flex items-center gap-1 ${indicator.change > 0 ? 'text-red-400' : 'text-green-400'}`}>
            <span>{trendIcon}</span>
            <span>
              {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}
              {indicator.change_pct !== undefined && ` (${indicator.change_pct > 0 ? '+' : ''}${indicator.change_pct.toFixed(2)}%)`}
            </span>
          </div>
        )}
      </div>

      {/* Optimal Range Indicator */}
      {defaultRange.optimal && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            Optimal: {defaultRange.optimal[0].toLocaleString()} - {defaultRange.optimal[1].toLocaleString()} {indicator.unit}
          </div>
        </div>
      )}
    </div>
  );
};

// Bar Chart Component for flow/volume indicators
const FlowBarChart: React.FC<{
  indicator: MacroIndicator;
  keyName: string;
  range?: { min: number; max: number };
}> = ({ indicator, keyName, range }) => {
  const value = typeof indicator.value === 'number' ? indicator.value : parseFloat(String(indicator.value));
  const colors = LIGHT_COLORS[indicator.light] || LIGHT_COLORS.gray;
  const trendIcon = indicator.trend ? TREND_ICONS[indicator.trend.toLowerCase()] || '➜' : '➜';

  const defaultRange = range || INDICATOR_RANGES[keyName] || { min: -5000, max: 5000 };

  // Create data for bar chart
  const chartData = [
    {
      name: 'Current',
      value: value,
      fill: colors.fill
    }
  ];

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">{indicator.display_name}</h4>
        <span className={`text-xs px-2 py-1 rounded`} style={{ backgroundColor: colors.bg + '30', color: colors.text }}>
          {indicator.status}
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="mb-3">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              type="number"
              domain={[defaultRange.min, defaultRange.max]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#4b5563' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              hide
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: any) => [value.toLocaleString() + (indicator.unit || ''), indicator.display_name]}
            />
            <Bar dataKey="value" fill={colors.fill} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Value Display */}
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: colors.text }}>
            {value > 0 ? '+' : ''}{value.toLocaleString()}
          </div>
          {indicator.unit && (
            <div className="text-xs text-gray-500">{indicator.unit}</div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-400">
          Range: {defaultRange.min.toLocaleString()} to {defaultRange.max.toLocaleString()}
        </div>
        {indicator.trend && (
          <div className="flex items-center gap-1 text-gray-400">
            <span>{trendIcon}</span>
            <span>{indicator.trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to extract specific indicators from sections
const getIndicatorFromSection = (data: MacroDashboardData | null, sectionKey: string, indicatorKey: string): MacroIndicator | null => {
  if (!data || !data.sections) return null;
  const section = data.sections[sectionKey as keyof typeof data.sections];
  if (!section || !section.data) return null;
  return section.data[indicatorKey] || null;
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await macroService.getDashboard();
      if (result.status === 'success') {
        setData(result);
        setLastUpdated(new Date());
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

  // Extract only the specified indicators
  const india10YYield = getIndicatorFromSection(data, 'interest_rates', 'india_10y_yield');
  const us10YYield = getIndicatorFromSection(data, 'interest_rates', 'us_10y_yield');
  const rateDiff = getIndicatorFromSection(data, 'interest_rates', 'rate_differential');

  const fiiDaily = getIndicatorFromSection(data, 'currency_flows', 'fii_daily');
  const fiiWeekly = getIndicatorFromSection(data, 'currency_flows', 'fii_weekly');
  const usdInr = getIndicatorFromSection(data, 'currency_flows', 'usd_inr');

  const inflationHeadline = getIndicatorFromSection(data, 'growth_inflation', 'inflation_headline');
  const inflationCore = getIndicatorFromSection(data, 'growth_inflation', 'inflation_core');

  const vixIndia = getIndicatorFromSection(data, 'volatility_sentiment', 'vix_india');
  const vixGlobal = getIndicatorFromSection(data, 'volatility_sentiment', 'vix_global');

  const crudeOil = getIndicatorFromSection(data, 'oil_commodities', 'crude_oil');
  const goldPrice = getIndicatorFromSection(data, 'oil_commodities', 'gold_price');

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-900/30 to-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">📊</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Macro Dashboard</h3>
            <p className="text-xs text-gray-500">Key Economic Indicators</p>
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
      <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
        {/* Interest Rate Yields Section */}
        <div>
          <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span>📈</span>
            <span>Interest Rate Yields</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {india10YYield && <GaugeChart indicator={india10YYield} keyName="india_10y_yield" />}
            {us10YYield && <GaugeChart indicator={us10YYield} keyName="us_10y_yield" />}
            {rateDiff && <GaugeChart indicator={rateDiff} keyName="rate_differential" />}
          </div>
        </div>

        {/* FII Flow Section */}
        <div>
          <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span>💰</span>
            <span>FII Flow</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fiiDaily && <FlowBarChart indicator={fiiDaily} keyName="fii_daily" />}
            {fiiWeekly && <FlowBarChart indicator={fiiWeekly} keyName="fii_weekly" />}
          </div>
        </div>

        {/* USD/INR Section */}
        <div>
          <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span>💱</span>
            <span>USD/INR Exchange Rate</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {usdInr && <GaugeChart indicator={usdInr} keyName="usd_inr" />}
          </div>
        </div>

        {/* Growth & Inflation Section */}
        <div>
          <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span>📊</span>
            <span>Growth & Inflation</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inflationHeadline && <GaugeChart indicator={inflationHeadline} keyName="inflation_headline" />}
            {inflationCore && <GaugeChart indicator={inflationCore} keyName="inflation_core" />}
          </div>
        </div>

        {/* Volatility (VIX) Section */}
        <div>
          <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span>📉</span>
            <span>Market Volatility (VIX)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vixIndia && <GaugeChart indicator={vixIndia} keyName="vix_india" />}
            {vixGlobal && <GaugeChart indicator={vixGlobal} keyName="vix_global" />}
          </div>
        </div>

        {/* Gold & Commodities Section */}
        <div>
          <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span>🪙</span>
            <span>Gold & Oil Prices</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goldPrice && <GaugeChart indicator={goldPrice} keyName="gold_price" />}
            {crudeOil && <GaugeChart indicator={crudeOil} keyName="crude_oil" />}
          </div>
        </div>

        {/* Footer Legend */}
        <div className="pt-3 border-t border-gray-800">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Optimal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroDashboard;
