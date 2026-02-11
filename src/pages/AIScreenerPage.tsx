import React, { useState, useEffect, useCallback } from 'react';
import aiScreenerService, {
  ScreenerResult,
  ScreenResponse,
  RegimeInfo,
  VixInfo,
  AnomalyRecord,
  AIScreenerTimeframe,
} from '../services/aiScreenerService';

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
  s >= 70 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : s >= 30 ? 'text-orange-400' : 'text-red-400';

const severityColor: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white',
};

const TIMEFRAME_OPTIONS: { value: AIScreenerTimeframe; label: string; sub: string }[] = [
  { value: '1d', label: 'Daily', sub: 'Position (5-20 days)' },
  { value: '1h', label: 'Hourly', sub: 'Swing (1-5 days)' },
];

/** Convert bars_ago + timeframe to human-readable "X days/hours ago" */
const barsAgoText = (barsAgo: number, tf: string): string => {
  if (barsAgo <= 0) return 'just now';
  const unit = tf === '1h' ? 'hour' : 'day';
  return `${barsAgo} ${unit}${barsAgo > 1 ? 's' : ''} ago`;
};

/* ─── Component ─────────────────────────────────────────── */
const AIScreenerPage: React.FC = () => {
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
  const [quickSymbols, setQuickSymbols] = useState('');

  // filters
  const [minScore, setMinScore] = useState(0);
  const [sectorFilter, setSectorFilter] = useState('');

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

  /* ── Run full screen ─── */
  const runFullScreen = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await aiScreenerService.runScreen({
        top_n: 50,
        min_score: minScore,
        sectors: sectorFilter ? [sectorFilter] : undefined,
        timeframe,
      });
      setScreenData(data);
      if (data.regime) {
        setRegime({
          regime: data.regime,
          confidence: data.regime_confidence,
          description: data.regime_description,
        });
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Screening failed');
    } finally {
      setLoading(false);
    }
  }, [minScore, sectorFilter, timeframe]);

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
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Quick screen failed');
    } finally {
      setLoading(false);
    }
  }, [quickSymbols, timeframe]);

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

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">AI Stock Screener</h1>
          <p className="text-purple-200 mt-1 text-sm">
            Regime-aware pre-momentum detection for NSE / NIFTY 50
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ── Market Overview Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Regime */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Market Regime</div>
            {regime ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${regimeColors[regime.regime] || 'bg-gray-500'}`} />
                  <span className="text-lg font-semibold">{regimeLabels[regime.regime] || regime.regime}</span>
                </div>
                <p className="text-sm text-gray-400">{regime.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Confidence: {(regime.confidence * 100).toFixed(0)}%
                  {regime.nifty_current && ` · NIFTY: ₹${regime.nifty_current.toLocaleString()}`}
                </div>
              </>
            ) : (
              <span className="text-gray-500 text-sm">Loading...</span>
            )}
          </div>

          {/* VIX */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">India VIX</div>
            {vix ? (
              <>
                <div className="text-lg font-semibold">{vix.current}</div>
                <div className={`text-sm ${vix.change_pct >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {pct(vix.change_pct)} from prev close
                </div>
                <div className="mt-1 text-xs text-gray-500">{vix.interpretation}</div>
              </>
            ) : (
              <span className="text-gray-500 text-sm">Loading...</span>
            )}
          </div>

          {/* Screen Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Last Screen</div>
            {screenData ? (
              <>
                <div className="text-lg font-semibold">{screenData.results_count} stocks</div>
                <div className="text-sm text-gray-400">
                  Screened {screenData.total_screened} · {new Date(screenData.timestamp).toLocaleTimeString()}
                </div>
              </>
            ) : (
              <span className="text-gray-500 text-sm">No results yet</span>
            )}
          </div>
        </div>

        {/* ── Timeframe Selector ─── */}
        <div className="flex gap-3">
          {TIMEFRAME_OPTIONS.map((tf) => {
            const active = tf.value === timeframe;
            return (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                disabled={loading}
                className={`
                  flex flex-col items-center px-6 py-3 rounded-xl border transition-all
                  ${active
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="font-bold text-base">{tf.label}</span>
                <span className="text-xs opacity-70">{tf.sub}</span>
              </button>
            );
          })}
        </div>

        {/* ── Controls ─── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Full Screen */}
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Full NIFTY 50 Screen</label>
              <div className="flex gap-2">
                <button
                  onClick={runFullScreen}
                  disabled={loading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium text-sm transition"
                >
                  {loading ? 'Screening...' : 'Run Full Screen'}
                </button>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
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
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Sectors</option>
                    {sectors.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Quick Screen */}
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Quick Screen (up to 10 symbols)</label>
              <div className="flex gap-2">
                <input
                  value={quickSymbols}
                  onChange={(e) => setQuickSymbols(e.target.value)}
                  placeholder="RELIANCE, TCS, INFY"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={runQuickScreen}
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium text-sm transition"
                >
                  Quick Screen
                </button>
              </div>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'TATAMOTORS', 'BAJFINANCE'].map((s) => (
              <button
                key={s}
                onClick={() => openDetail(s)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-xs transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-3 text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
            <p className="mt-3 text-gray-400 text-sm">
              Fetching live data from Yahoo Finance and computing features...
              <br />
              This may take 2-5 minutes for a full NIFTY 50 scan.
            </p>
          </div>
        )}

        {/* ── Results Table ─── */}
        {screenData && !loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="font-semibold">Screening Results</h2>
              <span className="text-xs text-gray-500">
                {timeframe.toUpperCase()} · Regime: {regimeLabels[screenData.regime] || screenData.regime} · {screenData.results_count} results
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3 text-left">Sector</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Score</th>
                    <th className="px-4 py-3 text-right">Mom.</th>
                    <th className="px-4 py-3 text-right">Risk</th>
                    <th className="px-4 py-3 text-right">5D</th>
                    <th className="px-4 py-3 text-right">20D</th>
                    <th className="px-4 py-3 text-right">RSI</th>
                    <th className="px-4 py-3 text-right">Vol R.</th>
                    <th className="px-4 py-3 text-center">Anomaly</th>
                    <th className="px-4 py-3 text-left">Top Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {screenData.results.map((r, i) => (
                    <tr
                      key={r.symbol}
                      onClick={() => openDetail(r.symbol)}
                      className="border-t border-gray-800/50 hover:bg-gray-800/40 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.symbol}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">{r.name}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{r.sector || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono">₹{fmt(r.current_price)}</td>
                      <td className={`px-4 py-3 text-right font-bold ${scoreColor(r.overall_score)}`}>
                        {fmt(r.overall_score, 0)}
                      </td>
                      <td className="px-4 py-3 text-right">{fmt(r.momentum_score, 0)}</td>
                      <td className="px-4 py-3 text-right">{fmt(r.risk_score, 0)}</td>
                      <td className={`px-4 py-3 text-right ${r.price_change_5d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pct(r.price_change_5d)}
                      </td>
                      <td className={`px-4 py-3 text-right ${r.price_change_20d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pct(r.price_change_20d)}
                      </td>
                      <td className="px-4 py-3 text-right">{fmt(r.rsi_14, 1)}</td>
                      <td className="px-4 py-3 text-right">{fmt(r.volume_ratio, 2)}</td>
                      <td className="px-4 py-3 text-center">
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
                                <span className="text-[10px] text-gray-500">+{r.anomalies.length - 2}</span>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-500">
                              {barsAgoText(Math.min(...r.anomalies.map(a => a.bars_ago)), r.timeframe || timeframe)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-[160px]">
                        {r.top_signals?.[0]?.feature?.replace(/^(tech_|vol_|meta_|insider_)/, '') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Stock Detail Modal ─── */}
        {selectedSymbol && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">{selectedSymbol} Detail</h2>
                  <span className="px-2 py-0.5 bg-purple-600/30 border border-purple-500/50 rounded text-xs text-purple-300 font-medium">
                    {timeframe.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedSymbol(null); setDetail(null); }}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  &times;
                </button>
              </div>

              {detailLoading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent" />
                  <p className="mt-2 text-gray-400 text-sm">Loading stock detail...</p>
                </div>
              ) : detail ? (
                <div className="p-6 space-y-5">
                  {/* Header row */}
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <div className="text-2xl font-bold">{detail.name || detail.symbol}</div>
                      <div className="text-sm text-gray-400">{detail.sector} · {detail.industry}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold">₹{fmt(detail.current_price)}</div>
                      <div className={`text-sm ${detail.price_change_5d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
                      <div key={s.label} className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-400">{s.label}</div>
                        <div className={`text-2xl font-bold ${scoreColor(s.value)}`}>{fmt(s.value, 0)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
                    {detail.explanation}
                  </div>

                  {/* Anomaly Alerts */}
                  {detail.has_anomaly && detail.anomalies?.length > 0 && (
                    <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-red-300 mb-2">
                        Anomaly Alerts ({detail.anomalies.length})
                      </h3>
                      <div className="space-y-2">
                        {detail.anomalies.map((a: AnomalyRecord, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3">
                            <span
                              className={`mt-0.5 shrink-0 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityColor[a.severity]}`}
                            >
                              {a.severity}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-200">{a.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 font-medium">
                                  {barsAgoText(a.bars_ago, a.timeframe)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
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
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Momentum Prob</div>
                      <div className="font-semibold">{(detail.momentum_probability * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Crash Prob</div>
                      <div className="font-semibold">{(detail.crash_probability * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">RSI (14)</div>
                      <div className="font-semibold">{fmt(detail.rsi_14, 1)}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Vol Ratio</div>
                      <div className="font-semibold">{fmt(detail.volume_ratio)}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">PE Ratio</div>
                      <div className="font-semibold">{fmt(detail.pe_ratio)}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">Market Cap</div>
                      <div className="font-semibold">{crore(detail.market_cap)}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">52W High</div>
                      <div className="font-semibold">₹{fmt(detail['52w_high'])}</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400">52W Low</div>
                      <div className="font-semibold">₹{fmt(detail['52w_low'])}</div>
                    </div>
                  </div>

                  {/* Top Signals */}
                  {detail.top_signals?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Top Signals</h3>
                      <div className="space-y-1">
                        {detail.top_signals.map((sig: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${sig.direction === 'bullish' ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span className="text-gray-300">{sig.feature.replace(/^(tech_|vol_|meta_|insider_)/, '')}</span>
                            <span className="text-gray-500 ml-auto">{fmt(sig.value, 3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fundamentals */}
                  {detail.fundamentals && Object.keys(detail.fundamentals).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Fundamentals</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {Object.entries(detail.fundamentals)
                          .filter(([k]) => !['name', 'sector', 'industry'].includes(k))
                          .slice(0, 12)
                          .map(([k, v]) => (
                            <div key={k} className="bg-gray-800 rounded p-2">
                              <div className="text-gray-500">{k.replace(/_/g, ' ')}</div>
                              <div className="font-medium">{typeof v === 'number' ? fmt(v as number) : String(v)}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">Failed to load detail</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIScreenerPage;
