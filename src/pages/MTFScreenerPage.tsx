/**
 * SHORT Screener Page - Clean UI
 *
 * Compact, user-friendly layout for NIFTY 100 SHORT opportunities
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  screenerService,
  Timeframe,
  SectorHeatmapData,
  RegimeStripData,
  StockCardData,
  TIMEFRAME_NAMES
} from '../services/screenerService';
import {
  TopStocksGrid,
  SectorHeatmap,
  MacroDashboard
} from '../components/screener';

// Timeframe config
const TIMEFRAMES: { value: Timeframe; label: string; desc: string }[] = [
  { value: '5m', label: '5M', desc: 'Scalping' },
  { value: '15m', label: '15M', desc: 'Intraday' },
  { value: '1h', label: '1H', desc: 'Swing' },
  { value: '1d', label: '1D', desc: 'Position' }
];

// Regime colors
const REGIME_COLORS: Record<string, { bg: string; text: string; short: string }> = {
  'Bullish Trend': { bg: 'bg-green-500/20', text: 'text-green-400', short: 'Risky for shorts' },
  'Bearish Trend': { bg: 'bg-red-500/20', text: 'text-red-400', short: 'Best for shorts' },
  'High Volatility': { bg: 'bg-amber-500/20', text: 'text-amber-400', short: 'Good for shorts' },
  'Low Volatility': { bg: 'bg-blue-500/20', text: 'text-blue-400', short: 'Neutral' }
};

const MTFScreenerPage: React.FC = () => {
  // State
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1d');
  const [regimeData, setRegimeData] = useState<(RegimeStripData & { short_interpretation?: string; short_favorable?: boolean }) | null>(null);
  const [stocks, setStocks] = useState<StockCardData[]>([]);
  const [sectorData, setSectorData] = useState<SectorHeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [summary, setSummary] = useState<{
    total_screened: number;
    qualified_count: number;
    shorts: number;
  } | null>(null);

  // Fetch SHORT data
  const fetchData = useCallback(async (timeframe: Timeframe) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await screenerService.getTopShorts(timeframe);
      if (result.status === 'success') {
        setStocks(result.top_shorts || []);
        setRegimeData(result.regime_strip);
        setSummary({
          total_screened: result.total_screened,
          qualified_count: result.shorts_found,
          shorts: result.shorts_found
        });
      }

      // Fetch regime with SHORT interpretation
      try {
        const regimeShort = await screenerService.getRegimeStripShort();
        if (regimeShort.status === 'success') {
          setRegimeData(regimeShort);
        }
      } catch (e) {
        console.warn('Could not fetch SHORT regime interpretation');
      }

      setLastUpdated(new Date());

      // Fetch sector heatmap
      const sectors = await screenerService.getSectorHeatmap(timeframe);
      if (sectors.status === 'success') {
        setSectorData(sectors);
      }
    } catch (err: any) {
      console.error('Error fetching screener data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTimeframe);
  }, [activeTimeframe, fetchData]);

  const currentRegime = regimeData?.current_regime || 'Unknown';
  const regimeStyle = REGIME_COLORS[currentRegime] || { bg: 'bg-gray-500/20', text: 'text-gray-400', short: '' };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar - Timeframe Selection */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Timeframe Pills */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setActiveTimeframe(tf.value)}
                  disabled={isLoading}
                  className={`
                    px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${activeTimeframe === tf.value
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }
                    ${isLoading ? 'opacity-50' : ''}
                  `}
                >
                  <span className="block">{tf.label}</span>
                  <span className="block text-[10px] opacity-70">{tf.desc}</span>
                </button>
              ))}
            </div>

            {/* Right side - Regime + Refresh */}
            <div className="flex items-center gap-3">
              {/* Compact Regime Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${regimeStyle.bg}`}>
                <span className="text-gray-400 text-xs">Market:</span>
                <span className={`text-xs font-semibold ${regimeStyle.text}`}>
                  {currentRegime.replace(' Trend', '').replace(' Volatility', ' Vol')}
                </span>
                {regimeData?.short_favorable && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Short Favorable" />
                )}
              </div>

              {/* Refresh */}
              <button
                onClick={() => fetchData(activeTimeframe)}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-all ${
                  isLoading ? 'bg-gray-800 text-gray-600' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-red-500">↓</span>
              SHORT Screener
              <span className="text-xs font-normal text-gray-500 ml-2">
                {TIMEFRAME_NAMES[activeTimeframe]} • {activeTimeframe.toUpperCase()}
              </span>
            </h1>
            {regimeData?.short_interpretation && (
              <p className="text-xs text-gray-500 mt-1">{regimeData.short_interpretation}</p>
            )}
          </div>

          {/* Stats Chips */}
          <div className="flex items-center gap-2">
            {summary && (
              <>
                <span className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-400">
                  {summary.total_screened} scanned
                </span>
                <span className="px-2 py-1 rounded bg-red-900/50 text-xs text-red-400 font-medium">
                  {summary.shorts} shorts
                </span>
              </>
            )}
            {lastUpdated && (
              <span className="text-xs text-gray-600">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stocks Grid */}
        <div className="mb-8">
          <TopStocksGrid
            stocks={stocks}
            isLoading={isLoading}
            onStockClick={(ticker) => console.log('Stock clicked:', ticker)}
          />
        </div>

        {/* Sector Heatmap */}
        <div className="mb-8">
          <SectorHeatmap data={sectorData} isLoading={isLoading && !sectorData} />
        </div>

        {/* Macro Dashboard */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <h2 className="text-lg font-semibold text-white">Macro Environment</h2>
            <span className="text-xs text-gray-500">India SHORT indicators</span>
          </div>
          <MacroDashboard />
        </div>

        {/* Compact Footer Legend */}
        <div className="border-t border-gray-800 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
            {/* Scoring */}
            <div>
              <h4 className="text-gray-400 font-medium mb-2">Scoring</h4>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Volume</span><span className="text-blue-400">30pts</span></div>
                <div className="flex justify-between"><span>Breakdown</span><span>25pts</span></div>
                <div className="flex justify-between"><span>Bearish</span><span>20pts</span></div>
                <div className="flex justify-between"><span>Proximity</span><span>15pts</span></div>
                <div className="flex justify-between"><span>Patterns</span><span>10pts</span></div>
              </div>
            </div>
            {/* Gates */}
            <div>
              <h4 className="text-gray-400 font-medium mb-2">Confirmation Gates</h4>
              <div className="space-y-1">
                <div>1. Volume spike &gt;1.5x</div>
                <div>2. Close in lower 30%</div>
                <div>3. Body ≥30% range</div>
                <div className="text-amber-400 mt-1">Need 2+ gates</div>
              </div>
            </div>
            {/* Regime */}
            <div>
              <h4 className="text-gray-400 font-medium mb-2">Regime Multipliers</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-red-500"></span><span>Bear 1.5×</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-amber-500"></span><span>HVol 1.2×</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-blue-500"></span><span>LVol 1.0×</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-green-500"></span><span>Bull 0.7×</span></div>
              </div>
            </div>
            {/* Eligibility */}
            <div>
              <h4 className="text-gray-400 font-medium mb-2">Eligibility</h4>
              <div className="space-y-1">
                <div>Score ≥65 required</div>
                <div>20% margin for direction</div>
                <div>Min score: 55</div>
                <div className="text-red-400 mt-1">Max 2 per sector</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MTFScreenerPage;
