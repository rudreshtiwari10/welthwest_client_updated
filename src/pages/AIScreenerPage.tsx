import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import aiScreenerService, {
  ScreenerResult,
  ScreenResponse,
  RegimeInfo,
  VixInfo,
  AnomalyRecord,
  AIScreenerTimeframe,
} from '../services/aiScreenerService';

/* ─── In-memory screen cache (keyed by timeframe) ──── */
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
interface CacheEntry {
  data: ScreenResponse;
  timestamp: number;
}
const screenCache: Record<string, CacheEntry> = {};

/* ─── tiny helpers ─────────────────────────────────────── */
const fmt = (n?: number | null, d = 2) => (n != null ? n.toFixed(d) : '—');
const pct = (n?: number | null) => (n != null ? `${n >= 0 ? '+' : ''}${n.toFixed(2)}%` : '—');
const crore = (n?: number | null) => {
  if (n == null || n === 0) return '—';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(0)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return `₹${n.toFixed(0)}`;
};

const regimeColors: Record<string, string> = {
  bull_low_vol: 'bg-green-500',
  bull_high_vol: 'bg-yellow-500',
  bear_low_vol: 'bg-orange-500',
  bear_high_vol: 'bg-red-500',
  sideways: 'bg-blue-400',
};

const regimeLabels: Record<string, string> = {
  bull_low_vol: 'Bull (Low Vol)',
  bull_high_vol: 'Bull (High Vol)',
  bear_low_vol: 'Bear (Low Vol)',
  bear_high_vol: 'Bear (High Vol)',
  sideways: 'Sideways',
};

const scoreColor = (s: number) =>
  s >= 70 ? 'text-green-500 dark:text-green-400' : s >= 50 ? 'text-yellow-600 dark:text-yellow-400' : s >= 30 ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400';

const severityColor: Record<string, string> = {
  critical: 'bg-red-600 text-white dark:bg-red-600 dark:text-white',
  high: 'bg-orange-500 text-white dark:bg-orange-500 dark:text-white',
  medium: 'bg-yellow-400 text-black dark:bg-yellow-500 dark:text-black',
  low: 'bg-blue-500 text-white dark:bg-blue-500 dark:text-white',
};

const TIMEFRAME_OPTIONS: { value: AIScreenerTimeframe; label: string; sub: string }[] = [
  { value: '1d', label: '1D', sub: '' },
  { value: '1h', label: '1H', sub: '' },
];

/** Convert bars_ago + timeframe to human-readable "X days/hours ago" */
const barsAgoText = (barsAgo: number, tf: string): string => {
  if (barsAgo <= 0) return 'just now';
  const unit = tf === '1h' ? 'hour' : 'day';
  return `${barsAgo} ${unit}${barsAgo > 1 ? 's' : ''} ago`;
};

/* ─── Component ─────────────────────────────────────────── */
const AIScreenerPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navQueryHandled = useRef(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // screening
  const [screenData, setScreenData] = useState<ScreenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // timeframe
  const [timeframe, setTimeframe] = useState<AIScreenerTimeframe>('1d');

  // regime / vix
  const [regime, setRegime] = useState<RegimeInfo | null>(null);
  const [vix, setVix] = useState<VixInfo | null>(null);

  // detail
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // quick screen
  const [quickSymbols, setQuickSymbols] = useState(searchParams.get('q') || '');

  // filters
  const [minScore, setMinScore] = useState(0);
  const [sectorFilter, setSectorFilter] = useState('');

  // loading phase animation
  const [loadingPhase, setLoadingPhase] = useState(0);
  const AI_PHASES = useMemo(() => [
    {
      text: 'Initializing AI engine',
      detail: 'Loading scoring models, feature pipeline, and signal extractors into memory',
      icon: '⚡',
      color: 'from-violet-500 to-purple-600',
    },
    {
      text: 'Connecting to market feeds',
      detail: 'Establishing connection to NSE/BSE live data via Yahoo Finance API',
      icon: '📡',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      text: 'Fetching NIFTY 50 prices',
      detail: 'Downloading 1-year OHLCV history for all 50 constituent stocks',
      icon: '📊',
      color: 'from-emerald-500 to-green-500',
    },
    {
      text: 'Computing technical indicators',
      detail: 'Calculating RSI, MACD, Bollinger Bands, ATR, and 40+ features per stock',
      icon: '🔍',
      color: 'from-amber-500 to-orange-500',
    },
    {
      text: 'Analyzing volume patterns',
      detail: 'Detecting volume spikes, dry-ups, and institutional accumulation signals',
      icon: '📈',
      color: 'from-pink-500 to-rose-500',
    },
    {
      text: 'Detecting market regime',
      detail: 'Classifying current market as Bull/Bear + volatility level using NIFTY 50 index',
      icon: '🧠',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      text: 'Running anomaly detection',
      detail: 'Scanning for flash crashes, parabolic moves, climax patterns, and gap alerts',
      icon: '⚠️',
      color: 'from-red-500 to-orange-500',
    },
    {
      text: 'Fetching fundamentals',
      detail: 'Loading PE ratio, market cap, sector data, and 52-week range for each stock',
      icon: '🏛️',
      color: 'from-teal-500 to-cyan-600',
    },
    {
      text: 'Scoring & ranking stocks',
      detail: 'Applying regime-adjusted composite scoring with momentum + risk weighting',
      icon: '🏆',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      text: 'Finalizing results',
      detail: 'Generating explanations, sorting by score, and preparing the final ranked list',
      icon: '✨',
      color: 'from-purple-500 to-pink-500',
    },
  ], []);

  useEffect(() => {
    if (!loading) { setLoadingPhase(0); return; }
    const interval = setInterval(() => {
      setLoadingPhase((p) => (p + 1) % AI_PHASES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading, AI_PHASES.length]);

  /* ── Re-fetch when timeframe changes — serve from cache if fresh ─── */
  const [hasScreened, setHasScreened] = useState(false);
  useEffect(() => {
    if (!hasScreened || loading) return;

    const cached = screenCache[timeframe];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      // Serve from cache instantly
      setScreenData(cached.data);
      if (cached.data.regime) {
        setRegime({
          regime: cached.data.regime,
          confidence: cached.data.regime_confidence,
          description: cached.data.regime_description,
        });
      }
      return;
    }

    // No valid cache — fetch fresh
    runFullScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  /* ── Load regime & VIX on mount ─── */
  useEffect(() => {
    const loadMarketInfo = async () => {
      try {
        const [regimeData, vixData] = await Promise.allSettled([
          aiScreenerService.getRegime(),
          aiScreenerService.getVix(),
        ]);
        if (regimeData.status === 'fulfilled') setRegime(regimeData.value);
        if (vixData.status === 'fulfilled') setVix(vixData.value);
      } catch { /* silent */ }

      // Try cached results
      try {
        const cached = await aiScreenerService.getCached();
        if (cached) setScreenData(cached);
      } catch { /* silent */ }
    };
    loadMarketInfo();
  }, []);

  /* ── Auto-run quick screen from navbar search (?q= param) ─── */
  useEffect(() => {
    const navQuery = searchParams.get('q');
    if (navQuery && !navQueryHandled.current) {
      navQueryHandled.current = true;
      // Clean the symbol (remove .NS/.BO suffixes if present)
      const cleanSymbol = navQuery.replace(/\.(NS|BO)$/i, '').toUpperCase();
      setQuickSymbols(cleanSymbol);
      // Auto-run quick screen
      (async () => {
        setLoading(true);
        setError('');
        try {
          const data = await aiScreenerService.quickScreen([cleanSymbol], 10, timeframe);
          setScreenData(data);
          setHasScreened(true);
          screenCache[timeframe] = { data, timestamp: Date.now() };
        } catch (e: any) {
          setError(e?.response?.data?.error || e.message || 'Quick screen failed');
        } finally {
          setLoading(false);
        }
      })();
      // Clean the URL param after handling
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, timeframe]);

  /* ── Run full screen ─── */
  const runFullScreen = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await aiScreenerService.runScreen({
        top_n: 50,
        timeframe,
      });
      setScreenData(data);
      setHasScreened(true);
      // Store in cache
      screenCache[timeframe] = { data, timestamp: Date.now() };
      if (data.regime) {
        setRegime({
          regime: data.regime,
          confidence: data.regime_confidence,
          description: data.regime_description,
        });
      }
      if (data.total_screened === 0) {
        setError(
          'Market data could not be fetched right now — the data provider may be temporarily unavailable. ' +
          'Please try again in a few minutes. You can also try a Quick Screen with specific symbols in the meantime.'
        );
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Screening failed');
    } finally {
      setLoading(false);
    }
  }, [timeframe, user]);

  /* ── Quick screen ─── */
  const runQuickScreen = useCallback(async () => {
    if (!quickSymbols.trim()) return;

    const symbols = quickSymbols.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (symbols.length === 0 || symbols.length > 10) {
      setError('Enter 1-10 comma-separated symbols');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await aiScreenerService.quickScreen(symbols, 10, timeframe);
      setScreenData(data);
      setHasScreened(true);
      screenCache[timeframe] = { data, timestamp: Date.now() };
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Quick screen failed');
    } finally {
      setLoading(false);
    }
  }, [quickSymbols, timeframe, user]);

  /* ── Stock detail ─── */
  const openDetail = useCallback(async (symbol: string) => {
    setSelectedSymbol(symbol);
    setDetailLoading(true);
    try {
      const data = await aiScreenerService.getStockDetail(symbol, timeframe);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [timeframe]);

  /* ── Unique sectors for filter dropdown ─── */
  const sectors = screenData
    ? Array.from(new Set(screenData.results.map((r) => r.sector).filter(Boolean))).sort()
    : [];

  /* ── Client-side filtered results ─── */
  const filteredResults = useMemo(() => {
    if (!screenData) return [];
    let results = screenData.results;
    if (minScore > 0) {
      results = results.filter((r) => r.overall_score >= minScore);
    }
    if (sectorFilter) {
      results = results.filter((r) => r.sector === sectorFilter);
    }
    return results;
  }, [screenData, minScore, sectorFilter]);

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Anonymous Preview Banner */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span className="text-purple-200 dark:text-purple-200">
                Preview mode — top 5 results visible · Login for the full ranked list
              </span>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-3 py-1 bg-purple-500/30 hover:bg-purple-500/50 rounded text-xs font-medium text-purple-200 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="You've reached the free usage limit. Login to continue with unlimited access."
      />

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-5">

        {/* ── Page Title + Run Button (centered together) ─── */}
        <div className="text-center pt-4 pb-2">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Stock Screener</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Regime-aware pre-momentum detection &middot; NSE / NIFTY 50
          </p>

          {/* Start AI Button */}
          <button
            onClick={runFullScreen}
            disabled={loading}
            className="group relative mt-4 inline-flex items-center gap-3 overflow-hidden rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
          >
            {/* Gradient background */}
            <span className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600" />
            {/* Animated shimmer */}
            {!loading && (
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            {/* Glow effect */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]" />

            <span className="relative flex items-center gap-2.5">
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  <span className="text-base">AI is screening...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span className="text-base">Start AI Screening</span>
                  <svg className="w-4 h-4 opacity-60 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </span>
          </button>

          {/* Subtle info badges below button */}
          {!loading && (
            <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                50 Stocks
              </span>
              <span>40+ Indicators</span>
              <span>Anomaly Detection</span>
            </div>
          )}
        </div>

        {/* ── Timeframe + Filters ─── */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Timeframe pills — left */}
            <div className="flex items-center gap-2">
              {TIMEFRAME_OPTIONS.map((tf) => {
                const active = tf.value === timeframe;
                const cached = screenCache[tf.value];
                const isCached = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;
                const cacheAgeMin = cached ? Math.floor((Date.now() - cached.timestamp) / 60000) : 0;
                return (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    disabled={loading}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium border transition-all
                      ${active
                        ? 'bg-primary-600 border-primary-500 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-gray-500'}
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {tf.label}
                    {isCached && !active && (
                      <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[8px] px-1 rounded-full leading-tight">
                        {cacheAgeMin < 1 ? 'new' : `${cacheAgeMin}m`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filters — right */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <option value={0}>Min Score: 0</option>
                <option value={30}>Min Score: 30</option>
                <option value={50}>Min Score: 50</option>
                <option value={60}>Min Score: 60</option>
              </select>
              {sectors.length > 0 && (
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Row 2: Quick Screen */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Quick Screen:</span>
            <input
              value={quickSymbols}
              onChange={(e) => setQuickSymbols(e.target.value)}
              placeholder="RELIANCE, TCS, INFY  (up to 10)"
              className="flex-1 w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              onClick={runQuickScreen}
              disabled={loading}
              className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition"
            >
              Quick Screen
            </button>
          </div>

          {/* Row 3: Preset chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'TATAMOTORS', 'BAJFINANCE'].map((s) => (
              <button
                key={s}
                onClick={() => openDetail(s)}
                className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Compact Market Overview Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Regime */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-1">Market Regime</div>
            {regime ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${regimeColors[regime.regime] || 'bg-gray-500'}`} />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{regimeLabels[regime.regime] || regime.regime}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{regime.description}</p>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  Conf: {(regime.confidence * 100).toFixed(0)}%
                  {regime.nifty_current && ` · NIFTY ₹${regime.nifty_current.toLocaleString()}`}
                </div>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs">Loading...</span>
            )}
          </div>

          {/* VIX */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-1">India VIX</div>
            {vix ? (
              <>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{vix.current}</div>
                <div className={`text-xs ${vix.change_pct >= 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {pct(vix.change_pct)} from prev close
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{vix.interpretation}</div>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs">Loading...</span>
            )}
          </div>

          {/* Screen Stats */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-1">Last Screen</div>
            {screenData ? (
              <>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{screenData.results_count} stocks</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Screened {screenData.total_screened} · {new Date(screenData.timestamp).toLocaleTimeString()}
                </div>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs">No results yet</span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg p-3 text-sm">{error}</div>
        )}

        {/* Loading — AI thinking animation */}
        {loading && (
          <div className="flex flex-col items-center py-14 select-none">
            {/* Pulsing brain / orbit animation */}
            <div className="relative w-20 h-20 mb-6">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary-300 dark:border-primary-700 opacity-40 animate-ping" style={{ animationDuration: '2.5s' }} />
              {/* Middle orbit */}
              <div className="absolute inset-1 rounded-full border border-dashed border-primary-400 dark:border-primary-600 animate-spin" style={{ animationDuration: '6s' }} />
              {/* Inner glow */}
              <div className="absolute inset-3 rounded-full bg-primary-500/10 dark:bg-primary-400/10 animate-pulse" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                <span
                  key={loadingPhase}
                  className="animate-fade-in"
                >
                  {AI_PHASES[loadingPhase].icon}
                </span>
              </div>
              {/* Orbiting dot */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500 shadow-md shadow-primary-500/50" />
              </div>
            </div>

            {/* Phase text */}
            <p
              key={`phase-${loadingPhase}`}
              className="text-sm font-medium text-gray-700 dark:text-gray-200 animate-fade-in"
            >
              {AI_PHASES[loadingPhase].text}
            </p>

            {/* Detail text */}
            <p
              key={`detail-${loadingPhase}`}
              className="text-xs text-gray-400 dark:text-gray-500 mt-1 animate-fade-in max-w-sm text-center"
            >
              {AI_PHASES[loadingPhase].detail}
            </p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-4">
              {AI_PHASES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i <= loadingPhase
                      ? 'w-4 bg-primary-500'
                      : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
              This may take 2-5 minutes for a full NIFTY 50 scan
            </p>
          </div>
        )}

        {/* ── Results Table ─── */}
        {screenData && !loading && (() => {
          const FREE_PREVIEW = 5;
          const visibleRows = !user ? filteredResults.slice(0, FREE_PREVIEW) : filteredResults;
          const lockedRows = !user ? filteredResults.slice(FREE_PREVIEW) : [];

          const renderCard = (r: ScreenerResult, globalIndex: number, isLocked: boolean) => (
            <div
              key={r.symbol}
              onClick={() => !isLocked && openDetail(r.symbol)}
              className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition"
            >
              <span className="text-xs text-gray-400 dark:text-gray-500 w-5 shrink-0">{globalIndex + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{r.symbol}</div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{r.sector || r.name || '—'}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-mono text-gray-800 dark:text-gray-200">₹{fmt(r.current_price)}</div>
                <div className={`text-[11px] font-medium ${r.price_change_5d >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  5D: {pct(r.price_change_5d)}
                </div>
              </div>
              <div className={`text-base font-bold w-10 text-center shrink-0 ${scoreColor(r.overall_score)}`}>
                {fmt(r.overall_score, 0)}
              </div>
              {r.has_anomaly && r.anomalies && r.anomalies.length > 0 && (
                <span className={`shrink-0 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${severityColor[r.anomalies[0].severity] || 'bg-gray-600 text-white'}`}>
                  !
                </span>
              )}
            </div>
          );

          const renderRow = (r: ScreenerResult, i: number, globalIndex: number) => (
            <tr
              key={r.symbol}
              onClick={() => !lockedRows.includes(r) && openDetail(r.symbol)}
              className="border-t border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition"
            >
              <td className="px-3 py-2.5 text-gray-400 dark:text-gray-500">{globalIndex + 1}</td>
              <td className="px-3 py-2.5">
                <div className="font-medium text-gray-900 dark:text-gray-100">{r.symbol}</div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">{r.name}</div>
              </td>
              <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">{r.sector || '—'}</td>
              <td className="px-3 py-2.5 text-right font-mono text-gray-800 dark:text-gray-200">₹{fmt(r.current_price)}</td>
              <td className={`px-3 py-2.5 text-right font-bold ${scoreColor(r.overall_score)}`}>
                {fmt(r.overall_score, 0)}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">{fmt(r.momentum_score, 0)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">{fmt(r.risk_score, 0)}</td>
              <td className={`px-3 py-2.5 text-right ${r.price_change_5d >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {pct(r.price_change_5d)}
              </td>
              <td className={`px-3 py-2.5 text-right ${r.price_change_20d >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {pct(r.price_change_20d)}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">{fmt(r.rsi_14, 1)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">{fmt(r.volume_ratio, 2)}</td>
              <td className="px-3 py-2.5 text-center">
                {r.has_anomaly && r.anomalies && r.anomalies.length > 0 ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {r.anomalies.slice(0, 2).map((a, idx) => (
                        <span
                          key={idx}
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${severityColor[a.severity] || 'bg-gray-600 text-white'}`}
                          title={`${a.name} (${a.severity}) — ${barsAgoText(a.bars_ago, r.timeframe || timeframe)}`}
                        >
                          {a.code.replace(/_/g, ' ').slice(0, 12)}
                        </span>
                      ))}
                      {r.anomalies.length > 2 && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">+{r.anomalies.length - 2}</span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">
                      {barsAgoText(Math.min(...r.anomalies.map(a => a.bars_ago)), r.timeframe || timeframe)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-300 dark:text-gray-600 text-xs">--</span>
                )}
              </td>
            </tr>
          );

          return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Screening Results</h2>
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {timeframe.toUpperCase()} · Regime: {regimeLabels[screenData.regime] || screenData.regime} · {filteredResults.length}{filteredResults.length !== screenData.results_count ? ` of ${screenData.results_count}` : ''} results
                </span>
              </div>

              {/* Mobile card list — shown only on small screens */}
              <div className="sm:hidden">
                {visibleRows.map((r, i) => renderCard(r, i, false))}
                {lockedRows.length > 0 && (
                  <>
                    <div className="px-4 py-4 border-t-2 border-purple-200 dark:border-purple-800/60 bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/80 dark:from-purple-950/40 dark:via-gray-900 dark:to-indigo-950/40 flex flex-col items-center gap-3 text-center">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {lockedRows.length} more stock{lockedRows.length > 1 ? 's' : ''} hidden
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sign in to unlock the full ranked list</p>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="px-5 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-semibold text-sm shadow-md"
                      >
                        Login to See All Results
                      </button>
                    </div>
                    <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
                      {lockedRows.map((r, i) => renderCard(r, FREE_PREVIEW + i, true))}
                    </div>
                  </>
                )}
              </div>

              {/* Desktop table — hidden on small screens */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-3 py-2.5 text-left">#</th>
                      <th className="px-3 py-2.5 text-left">Symbol</th>
                      <th className="px-3 py-2.5 text-left">Sector</th>
                      <th className="px-3 py-2.5 text-right">Price</th>
                      <th className="px-3 py-2.5 text-right">Score</th>
                      <th className="px-3 py-2.5 text-right">Mom.</th>
                      <th className="px-3 py-2.5 text-right">Risk</th>
                      <th className="px-3 py-2.5 text-right">5D</th>
                      <th className="px-3 py-2.5 text-right">20D</th>
                      <th className="px-3 py-2.5 text-right">RSI</th>
                      <th className="px-3 py-2.5 text-right">Vol R.</th>
                      <th className="px-3 py-2.5 text-center">Anomaly</th>
                    </tr>
                  </thead>
                  {/* Visible rows — always shown */}
                  <tbody>
                    {visibleRows.map((r, i) => renderRow(r, i, i))}
                  </tbody>
                  {/* Locked section — CTA banner first, then blurred rows */}
                  {lockedRows.length > 0 && (
                    <>
                      <tbody>
                        <tr>
                          <td colSpan={12} className="px-6 py-4 border-t-2 border-purple-200 dark:border-purple-800/60 bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/80 dark:from-purple-950/40 dark:via-gray-900 dark:to-indigo-950/40">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {lockedRows.length} more stock{lockedRows.length > 1 ? 's' : ''} hidden
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Sign in to unlock the full ranked list
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setShowLoginModal(true)}
                                className="px-5 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
                              >
                                Login to See All Results
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                      <tbody style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
                        {lockedRows.map((r, i) => renderRow(r, i, FREE_PREVIEW + i))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>
          );
        })()}

        {/* ── Stock Detail Modal ─── */}
        {selectedSymbol && (
          <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-xl">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedSymbol} Detail</h2>
                  <span className="px-2 py-0.5 bg-primary-50 dark:bg-purple-600/30 border border-primary-200 dark:border-purple-500/50 rounded text-xs text-primary-700 dark:text-purple-300 font-medium">
                    {timeframe.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedSymbol(null); setDetail(null); }}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl transition"
                >
                  &times;
                </button>
              </div>

              {detailLoading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Loading stock detail...</p>
                </div>
              ) : detail ? (
                <div className="p-6 space-y-5">
                  {/* Header row */}
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{detail.name || detail.symbol}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{detail.sector} · {detail.industry}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{fmt(detail.current_price)}</div>
                      <div className={`text-sm ${detail.price_change_5d >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        5D: {pct(detail.price_change_5d)} · 20D: {pct(detail.price_change_20d)}
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Overall', value: detail.overall_score },
                      { label: 'Momentum', value: detail.momentum_score },
                      { label: 'Risk', value: detail.risk_score },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                        <div className={`text-2xl font-bold ${scoreColor(s.value)}`}>{fmt(s.value, 0)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
                    {detail.explanation}
                  </div>

                  {/* Anomaly Alerts */}
                  {detail.has_anomaly && detail.anomalies?.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                        Anomaly Alerts ({detail.anomalies.length})
                      </h3>
                      <div className="space-y-2">
                        {detail.anomalies.map((a: AnomalyRecord, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-900/50 rounded-lg p-3">
                            <span
                              className={`mt-0.5 shrink-0 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityColor[a.severity]}`}
                            >
                              {a.severity}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                                  {barsAgoText(a.bars_ago, a.timeframe)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {a.timeframe.toUpperCase()} · Value: {a.details.current_value.toFixed(2)} (threshold: {a.details.threshold.toFixed(2)})
                                {a.timestamp && ` · ${new Date(a.timestamp).toLocaleString()}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Probabilities & Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {[
                      { label: 'Momentum Prob', value: `${(detail.momentum_probability * 100).toFixed(1)}%` },
                      { label: 'Crash Prob', value: `${(detail.crash_probability * 100).toFixed(1)}%` },
                      { label: 'RSI (14)', value: fmt(detail.rsi_14, 1) },
                      { label: 'Vol Ratio', value: fmt(detail.volume_ratio) },
                      { label: 'PE Ratio', value: fmt(detail.pe_ratio) },
                      { label: 'Market Cap', value: crore(detail.market_cap) },
                      { label: '52W High', value: `₹${fmt(detail['52w_high'])}` },
                      { label: '52W Low', value: `₹${fmt(detail['52w_low'])}` },
                    ].map((m) => (
                      <div key={m.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{m.label}</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top Signals */}
                  {detail.top_signals?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Top Signals</h3>
                      <div className="space-y-1">
                        {detail.top_signals.map((sig: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${sig.direction === 'bullish' ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`} />
                            <span className="text-gray-700 dark:text-gray-300">{sig.feature.replace(/^(tech_|vol_|meta_|insider_)/, '')}</span>
                            <span className="text-gray-400 dark:text-gray-500 ml-auto">{fmt(sig.value, 3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fundamentals */}
                  {detail.fundamentals && Object.keys(detail.fundamentals).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fundamentals</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {Object.entries(detail.fundamentals)
                          .filter(([k]) => !['name', 'sector', 'industry'].includes(k))
                          .slice(0, 12)
                          .map(([k, v]) => (
                            <div key={k} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                              <div className="text-gray-400 dark:text-gray-500">{k.replace(/_/g, ' ')}</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">{typeof v === 'number' ? fmt(v as number) : String(v)}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400 dark:text-gray-500">Failed to load detail</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIScreenerPage;
