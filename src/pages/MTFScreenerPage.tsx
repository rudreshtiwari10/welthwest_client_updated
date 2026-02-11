/**
 * UNIFIED STOCK SCREENER PAGE
 *
 * Features:
 * - All Screened Stocks (Both LONG and SHORT opportunities)
 * - SEBI-Compliant Terminology (Educational/Informational)
 * - Fast regime detection, macro dashboard
 * Performance: 1-3 seconds (optimized)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
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
import UpgradeModal from '../components/UpgradeModal';
import LoginModal from '../components/LoginModal';
import { SparklesIcon } from '@heroicons/react/24/outline';

// Timeframe config - Only 1D and 1H supported with anomaly detection
const TIMEFRAMES: { value: Timeframe; label: string; desc: string }[] = [
  { value: '1d', label: '1D', desc: 'Position' },
  { value: '1h', label: '1H', desc: 'Swing' }
];

// Regime colors (Simplified - No AI processing)
const REGIME_COLORS: Record<string, { bg: string; text: string; short: string }> = {
  'Bullish Trend': { bg: 'bg-green-500/20', text: 'text-green-400', short: 'Risky for shorts' },
  'Bearish Trend': { bg: 'bg-red-500/20', text: 'text-red-400', short: 'Best for shorts' },
  'High Volatility': { bg: 'bg-amber-500/20', text: 'text-amber-400', short: 'Good for shorts' },
  'Low Volatility': { bg: 'bg-blue-500/20', text: 'text-blue-400', short: 'Neutral' },
  'Neutral': { bg: 'bg-gray-500/20', text: 'text-gray-400', short: 'Simplified regime (fast)' },
  'Unknown': { bg: 'bg-gray-500/20', text: 'text-gray-400', short: 'Regime detection disabled' }
};

const MTFScreenerPage: React.FC = () => {
  const { user } = useAuth();
  const { canUseLLM, incrementLLMUsage, subscriptionTier } = useSubscription();

  // State
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1d');
  const [regimeData, setRegimeData] = useState<(RegimeStripData & { short_interpretation?: string; short_favorable?: boolean; short_score_multiplier?: number; short_strategy?: string; target_extension?: number }) | null>(null);
  const [stocks, setStocks] = useState<StockCardData[]>([]);
  const [sectorData, setSectorData] = useState<SectorHeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [summary, setSummary] = useState<{
    total_screened: number;
    qualified_count: number;
    total_stocks: number; // Total stocks count (both longs and shorts)
  } | null>(null);

  // Store data for ALL timeframes with combined stocks (fetched once, switch instantly)
  const [allTimeframesData, setAllTimeframesData] = useState<{
    [key in Timeframe]?: {
      allStocks: StockCardData[]; // Combined long and short stocks
      sectorData: SectorHeatmapData | null;
      summary: {
        total_screened: number;
        qualified_count: number;
        total_stocks: number;
      } | null;
    };
  }>({});

  // Loading progress states
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Track if data has been fetched at least once
  const [hasData, setHasData] = useState(false);

  // Simulate loading steps with progress
  const simulateLoadingSteps = async () => {
    const steps = [
      { message: '🔍 Scanning NIFTY 50 stocks...', duration: 300, progress: 20 },
      { message: '📊 Analyzing market opportunities...', duration: 200, progress: 40 },
      { message: '💹 Detecting patterns & signals...', duration: 300, progress: 60 },
      { message: '🎯 Volume & trend confirmation...', duration: 300, progress: 80 },
      { message: '✨ Finalizing all screened stocks...', duration: 200, progress: 95 },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setLoadingStep(step.message);
      setLoadingProgress(step.progress);

      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    // Final push to 100%
    setLoadingProgress(100);
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  // Fetch all screened stocks (both LONG and SHORT) for ALL timeframes
  // Uses unified /full-data endpoint: 4 API calls instead of 13 (3x faster)
  const fetchAllTimeframesData = useCallback(async () => {
    try {
      // Fetch data for ALL 4 timeframes in parallel using unified endpoint
      // Each call returns longs, shorts, heatmap, AND regime in one response
      const allTimeframesPromises = TIMEFRAMES.map(async (tf) => {
        const result = await screenerService.getFullData(tf.value);

        if (result.status !== 'success') {
          console.warn(`Failed to fetch data for ${tf.value}:`, result);
          return {
            timeframe: tf.value,
            allStocks: [] as StockCardData[],
            sectorData: null,
            summary: null,
            regimeData: null
          };
        }

        // Combine longs and shorts into one array
        let allStocks: StockCardData[] = [
          ...(result.top_longs || []),
          ...(result.top_shorts || [])
        ];

        // Remove duplicates - keep the version with higher score
        const stockMap = new Map<string, StockCardData>();
        allStocks.forEach(stock => {
          const ticker = stock.ticker;
          const existing = stockMap.get(ticker);
          if (!existing || stock.score > existing.score) {
            stockMap.set(ticker, stock);
          }
        });

        // Convert back to array and sort by total score (descending)
        allStocks = Array.from(stockMap.values());
        allStocks.sort((a, b) => b.score - a.score);

        // Limit to top 5 stocks per timeframe
        allStocks = allStocks.slice(0, 5);

        return {
          timeframe: tf.value,
          allStocks,
          sectorData: result.sectors ? {
            status: 'success',
            timeframe: tf.value,
            sectors: result.sectors,
            timestamp: result.timestamp
          } as SectorHeatmapData : null,
          summary: {
            total_screened: result.total_screened || 0,
            qualified_count: (result.longs_found || 0) + (result.shorts_found || 0),
            total_stocks: allStocks.length
          },
          regimeData: result.regime_strip || null
        };
      });

      // Wait for all to complete
      const timeframesResults = await Promise.all(allTimeframesPromises);

      // Store all timeframes data
      const allData: typeof allTimeframesData = {};
      let sharedRegime: typeof regimeData = null;

      timeframesResults.forEach((result) => {
        allData[result.timeframe as Timeframe] = {
          allStocks: result.allStocks,
          sectorData: result.sectorData,
          summary: result.summary
        };
        // Use regime from first successful result (it's shared across all timeframes)
        if (!sharedRegime && result.regimeData) {
          sharedRegime = result.regimeData;
        }
      });
      setAllTimeframesData(allData);

      // Set regime data (shared across all timeframes)
      if (sharedRegime) {
        setRegimeData(sharedRegime);
      }

      // Set current timeframe's data as active
      const currentData = allData[activeTimeframe];
      if (currentData) {
        setStocks(currentData.allStocks);
        setSectorData(currentData.sectorData);
        setSummary(currentData.summary);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching screener data:', err);
      throw err;
    }
  }, [activeTimeframe]);

  // Update displayed data when timeframe changes (instant - no API call)
  useEffect(() => {
    if (Object.keys(allTimeframesData).length > 0) {
      const currentData = allTimeframesData[activeTimeframe];
      if (currentData) {
        setStocks(currentData.allStocks);
        setSectorData(currentData.sectorData);
        setSummary(currentData.summary);
      }
    }
  }, [activeTimeframe, allTimeframesData]);

  // Handle "Get Regime" button click
  const handleGetRegime = async () => {
    // Check authentication and subscription limits
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!canUseLLM) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingStep('Initializing analysis...');

      // Start loading simulation
      const loadingPromise = simulateLoadingSteps();

      // Fetch data for all timeframes at once
      await fetchAllTimeframesData();

      // Wait for loading simulation to complete
      await loadingPromise;

      // Increment usage (deduct credit)
      incrementLLMUsage();

      setHasData(true);
    } catch (err: any) {
      console.error('Error in Get Regime:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');

      // Check if it's a limit exceeded error
      if (err.response?.status === 403) {
        setShowUpgradeModal(true);
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  };

  // Remove automatic fetching on mount
  // Data will only be fetched when user clicks "Get Regime" button

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
                onClick={() => fetchAllTimeframesData()}
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
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-blue-500" />
                Multi-Timeframe Stock Screener
                <span className="text-xs font-normal text-gray-500 ml-2">
                  {TIMEFRAME_NAMES[activeTimeframe]} • {activeTimeframe.toUpperCase()}
                </span>
              </h1>

              {/* SEBI Compliance Badge */}
              <span className="px-2 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-400 text-xs font-medium">
                Educational Only
              </span>

              {/* Performance Badge */}
              <span className="px-2 py-1 rounded-full bg-green-900/30 border border-green-700/50 text-green-400 text-xs font-medium">
                ⚡ Optimized
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All screened stocks with opportunities (For educational purposes only, not investment advice)
            </p>
          </div>

          {/* Stats Chips & Get Screener Button */}
          <div className="flex items-center gap-3">
            {summary && hasData && (
              <>
                <span className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-400">
                  {summary.total_screened} scanned
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-400">
                  {summary.total_stocks} stocks found
                </span>
              </>
            )}
            {lastUpdated && hasData && (
              <span className="text-xs text-gray-600">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            {/* Get Stocks Button */}
            <button
              onClick={handleGetRegime}
              disabled={isLoading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 shadow-lg
                ${isLoading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105'
                }
              `}
            >
              <SparklesIcon className="w-5 h-5" />
              <span>
                {isLoading
                  ? 'Analyzing...'
                  : hasData
                    ? 'Refresh Analysis'
                    : 'Get Screened Stocks'
                }
              </span>
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-800 shadow-2xl">
              <div className="text-center space-y-4">
                {/* Animated Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <SparklesIcon className="w-16 h-16 text-red-500 animate-pulse" />
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-ping"></div>
                  </div>
                </div>

                {/* Loading Step */}
                <div className="text-lg font-medium text-white">
                  {loadingStep}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>

                {/* Progress Percentage */}
                <div className="text-sm text-gray-400">
                  {Math.round(loadingProgress)}% Complete
                </div>

                {/* Info Text */}
                <p className="text-xs text-gray-500 mt-2">
                  Scanning NIFTY 50 stocks for market opportunities (optimized screening)...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* No Data State - Show before first analysis */}
        {!hasData && !isLoading && (
          <div className="mb-8 text-center py-16 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <SparklesIcon className="w-20 h-20 text-gray-600" />
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl"></div>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Ready to Screen Market Opportunities
              </h3>
              <p className="text-gray-400 max-w-md">
                Click the <span className="font-semibold text-blue-400">
                  "Get Screened Stocks"
                </span> button above to scan NIFTY 50 stocks with optimized performance.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>
                  All Opportunities • Fast Analysis (1-3s) • All Screened Stocks • SEBI Compliant
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stocks Grid - Only show if data exists */}
        {hasData && (
          <div className="mb-8">
            <TopStocksGrid
              stocks={stocks}
              isLoading={false}
              onStockClick={(ticker) => console.log('Stock clicked:', ticker)}
            />
          </div>
        )}

        {/* Sector Heatmap - Only show if data exists */}
        {hasData && (
          <div className="mb-8">
            <SectorHeatmap data={sectorData} isLoading={false} />
          </div>
        )}

        {/* Macro Dashboard - Only show if data exists */}
        {hasData && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📊</span>
              <h2 className="text-lg font-semibold text-white">Macro Environment</h2>
              <span className="text-xs text-gray-500">Economic Indicators</span>
            </div>
            <MacroDashboard />
          </div>
        )}

        {/* Compact Footer Legend - Only show if data exists */}
        {hasData && (
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
        )}
      </div>

      {/* Modals */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="MTF Screener Analysis"
        currentPlan={subscriptionTier || 'free'}
        upgradeMessage="Unlock unlimited market regime analysis and SHORT opportunity screening"
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default MTFScreenerPage;
