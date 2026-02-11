/**
 * Multi-Timeframe Stock Screener API Service
 *
 * Provides API calls for:
 * - Regime strip data
 * - Stock screening by timeframe
 * - Individual stock analysis
 * - Sector heatmap
 */

import api from './api';

// Types
export interface RegimeStripData {
  status: string;
  current_regime: string;
  regime_id: number;
  regime_short?: string;
  probabilities: {
    [key: string]: number;
  };
  confidence: number;
  bias: string;
  color?: string;
  timestamp: string;
}

export interface TradeSetup {
  entry: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  rr_ratio: number;
  rr_string: string;
  risk_percentage: number;
}

// Anomaly detection types
export interface AnomalyRecord {
  code: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  window_bars: number;
  details: {
    current_value: number;
    threshold: number;
    supporting_features: string[];
  };
}

export interface StockCardData {
  symbol: string;
  ticker: string;
  score: number;
  long_score: number;
  short_score: number;
  direction: 'LONG' | 'SHORT' | 'HOLD';
  rank: number;
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  entry: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  rr_ratio: number;
  rr_string: string;
  risk_percentage: number;
  trade_direction: 'LONG' | 'SHORT';
  regime: string;
  regime_color: string;
  short_favorable: boolean;
  volume_bar: number;
  momentum_bar: number;
  pattern: string;
  short_signal: string;
  short_confidence: number;
  sector: string;
  category: string;
  eligible: boolean;

  // FIX #1-#7: New fields for enhanced SHORT detection
  gates_passed?: number;           // Number of confirmation gates passed (0-3)
  volume_confirmed?: boolean;      // FIX #1: Volume spike confirmation
  conviction_close?: boolean;      // FIX #1: Close in lower 30% of candle
  body_confirmed?: boolean;        // FIX #1: Body >= 30% of range
  acceleration_confirmed?: boolean; // FIX #2: Downtrend acceleration
  close_near_low?: boolean;        // FIX #2: Close near lows
  regime_gated?: boolean;          // FIX #4: Was regime gating applied
  short_strength?: string;         // 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE'

  // Anomaly detection fields
  anomalies?: AnomalyRecord[];
  has_anomaly?: boolean;
}

export interface ScreeningResult {
  status: string;
  timeframe: string;
  regime_strip: RegimeStripData;
  top_stocks: StockCardData[];
  total_screened: number;
  qualified_count: number;
  processing_time_seconds: number;
  timestamp: string;
}

export interface StockDetailData {
  status: string;
  ticker: string;
  timeframe: string;
  current_price: number;
  signal_bias: string;
  score: number;
  eligible: boolean;
  category: string;
  score_breakdown: {
    [key: string]: {
      score: number;
      max: number;
      details: any;
    };
  };
  regime: {
    name: string;
    confidence: number;
    bias: string;
    color: string;
  };
  trade_setup: TradeSetup;
  indicators: {
    trend: any;
    momentum: any;
    volatility: any;
    volume: any;
  };
  patterns: {
    best_pattern: any;
    total_patterns: number;
    dominant_bias: string;
  };
  sector: string;
  processing_time_ms: number;
  timestamp: string;
}

export interface SectorData {
  score: number;
  top_stock: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  stock_count: number;
  long_count: number;
  short_count: number;
}

export interface SectorHeatmapData {
  status: string;
  timeframe: string;
  sectors: {
    [key: string]: SectorData;
  };
  timestamp: string;
}

export interface AllTimeframesData {
  status: string;
  regime_strip: RegimeStripData;
  timeframes: {
    [key: string]: {
      top_stocks: StockCardData[];
      qualified_count: number;
      total_screened: number;
    };
  };
  processing_time_seconds: number;
  timestamp: string;
}

// Valid timeframes
export const VALID_TIMEFRAMES = ['5m', '15m', '1h', '1d'] as const;
export type Timeframe = typeof VALID_TIMEFRAMES[number];

// Timeframe display names
export const TIMEFRAME_NAMES: Record<Timeframe, string> = {
  '5m': 'Scalping',
  '15m': 'Intraday',
  '1h': 'Swing',
  '1d': 'Position'
};

// Timeframe hold times
export const TIMEFRAME_HOLD_TIMES: Record<Timeframe, string> = {
  '5m': '15-60 min',
  '15m': '1-4 hours',
  '1h': '1-5 days',
  '1d': '5-20 days'
};

/**
 * Screener API Service
 */
export const screenerService = {
  /**
   * Get NIFTY 50 regime strip data
   */
  getRegimeStrip: async (): Promise<RegimeStripData> => {
    const response = await api.get('/mtf-screener/regime-strip');
    return response.data;
  },

  /**
   * Get top stocks for a specific timeframe
   */
  getTopStocks: async (timeframe: Timeframe): Promise<ScreeningResult> => {
    const response = await api.get(`/mtf-screener/screen/${timeframe}`);
    return response.data;
  },

  /**
   * Get detailed analysis for a specific stock
   */
  getStockDetail: async (ticker: string, timeframe: Timeframe): Promise<StockDetailData> => {
    // Remove .NS if present for cleaner URL
    const cleanTicker = ticker.replace('.NS', '');
    const response = await api.get(`/mtf-screener/stock/${cleanTicker}/${timeframe}`);
    return response.data;
  },

  /**
   * Get sector performance heatmap
   */
  getSectorHeatmap: async (timeframe: Timeframe): Promise<SectorHeatmapData> => {
    const response = await api.get(`/mtf-screener/sector-heatmap/${timeframe}`);
    return response.data;
  },

  /**
   * Get screening results for all timeframes at once
   */
  getAllTimeframes: async (): Promise<AllTimeframesData> => {
    const response = await api.get('/mtf-screener/all-timeframes');
    return response.data;
  },

  /**
   * Health check for screener service
   */
  healthCheck: async (): Promise<any> => {
    const response = await api.get('/mtf-screener/health');
    return response.data;
  },

  // ==========================================
  // SHORT/SELLING SCREENER ENDPOINTS
  // ==========================================

  /**
   * Get top HIGH-PERFORMANCE (LONG) opportunities for a timeframe
   * SEBI-Compliant: "High Performance" instead of "BUY/LONG"
   */
  getTopLongs: async (timeframe: Timeframe): Promise<LongsScreeningResult> => {
    const response = await api.get(`/mtf-screener/longs/${timeframe}`);
    return response.data;
  },

  /**
   * Get top CORRECTION WATCH (SHORT) opportunities for a timeframe
   * SEBI-Compliant: "Correction Watch" instead of "SELL/SHORT"
   */
  getTopShorts: async (timeframe: Timeframe): Promise<ShortsScreeningResult> => {
    const response = await api.get(`/mtf-screener/shorts/${timeframe}`);
    return response.data;
  },

  /**
   * Get detailed SHORT analysis for a stock
   */
  getShortStockDetail: async (ticker: string, timeframe: Timeframe): Promise<StockDetailData> => {
    const cleanTicker = ticker.replace('.NS', '');
    const response = await api.get(`/mtf-screener/shorts/stock/${cleanTicker}/${timeframe}`);
    return response.data;
  },

  /**
   * Get dual scoring results (LONG and SHORT)
   */
  getDualScoring: async (timeframe: Timeframe): Promise<DualScoringResult> => {
    const response = await api.get(`/mtf-screener/dual/${timeframe}`);
    return response.data;
  },

  /**
   * Get regime strip with SHORT interpretation
   */
  getRegimeStripShort: async (): Promise<RegimeStripData & { short_interpretation: string; short_favorable: boolean }> => {
    const response = await api.get('/mtf-screener/regime-strip-short');
    return response.data;
  },

  // ==========================================
  // DYNAMIC NIFTY 50 STOCK UNIVERSE ENDPOINTS
  // ==========================================

  /**
   * Get current stock universe information
   */
  getStockUniverse: async (): Promise<StockUniverseInfo> => {
    const response = await api.get('/mtf-screener/stock-universe');
    return response.data;
  },

  /**
   * Refresh NIFTY 50 stock universe from NSE API
   */
  refreshStockUniverse: async (): Promise<{ status: string; message: string; data: StockUniverseInfo }> => {
    const response = await api.post('/mtf-screener/refresh-stock-universe');
    return response.data;
  },

  /**
   * Get simple NIFTY 50 stock list
   */
  getNifty50List: async (format: 'simple' | 'detailed' = 'simple', forceRefresh: boolean = false): Promise<Nifty50Response> => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (forceRefresh) params.append('refresh', 'true');

    const response = await api.get(`/mtf-screener/nifty50?${params.toString()}`);
    return response.data;
  },

  /**
   * Get ALL data for a timeframe in one call: longs, shorts, heatmap, and regime.
   * This replaces 3 separate calls (getTopLongs + getTopShorts + getSectorHeatmap)
   * plus the regime-strip-short call, dramatically reducing load time.
   */
  getFullData: async (timeframe: Timeframe): Promise<FullDataResult> => {
    const response = await api.get(`/mtf-screener/full-data/${timeframe}`);
    return response.data;
  }
};

// Full data result from unified endpoint
export interface FullDataResult {
  status: string;
  timeframe: string;
  regime_strip: RegimeStripData & {
    short_interpretation?: string;
    short_favorable?: boolean;
    short_score_multiplier?: number;
    short_strategy?: string;
    target_extension?: number;
  };
  top_longs: StockCardData[];
  longs_found: number;
  top_shorts: StockCardData[];
  shorts_found: number;
  sectors: {
    [key: string]: SectorData;
  };
  total_screened: number;
  qualified_count: number;
  processing_time_seconds: number;
  timestamp: string;
  from_cache?: boolean;
}

// Additional types for LONG/SHORT endpoints
export interface LongsScreeningResult {
  status: string;
  timeframe: string;
  mode: 'HIGH_PERFORMANCE';
  description: string;
  disclaimer: string;
  regime_strip: RegimeStripData;
  top_longs: StockCardData[];
  total_screened: number;
  longs_found: number;
  timestamp: string;
}

export interface ShortsScreeningResult {
  status: string;
  timeframe: string;
  mode: 'SHORTS';
  description: string;
  regime_strip: RegimeStripData;
  top_shorts: StockCardData[];
  total_screened: number;
  shorts_found: number;
  timestamp: string;
}

export interface DualScoringResult {
  status: string;
  timeframe: string;
  mode: 'DUAL';
  description: string;
  regime_strip: RegimeStripData;
  stocks: StockCardData[];
  summary: {
    total_screened: number;
    longs: number;
    shorts: number;
    holds: number;
  };
  timestamp: string;
}

// Helper functions
export const getScoreColor = (score: number): string => {
  if (score >= 85) return '#22c55e'; // Green
  if (score >= 75) return '#84cc16'; // Lime
  if (score >= 65) return '#eab308'; // Yellow
  if (score >= 50) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

export const getBiasColor = (bias: string): string => {
  if (bias === 'LONG') return '#22c55e'; // Green
  if (bias === 'SHORT') return '#ef4444'; // Red
  return '#6b7280'; // Gray
};

export const getRegimeColor = (regime: string): string => {
  const colors: Record<string, string> = {
    'Bullish Trend': '#22c55e',
    'Bearish Trend': '#ef4444',
    'High Volatility': '#f59e0b',
    'Low Volatility': '#3b82f6'
  };
  return colors[regime] || '#6b7280';
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

// ==========================================
// DYNAMIC STOCK UNIVERSE TYPES
// ==========================================

export interface StockUniverseInfo {
  stocks: string[];
  total_count: number;
  sectors: {
    [ticker: string]: string;
  };
  sector_distribution: {
    [sector: string]: number;
  };
  last_updated: string | null;
  cache_expires: string | null;
  source: string;
}

export interface DetailedStock {
  ticker: string;
  symbol: string;
  sector: string;
}

export interface Nifty50Response {
  status: string;
  format: 'simple' | 'detailed';
  stocks: string[] | DetailedStock[];
  total_count: number;
  description?: string;
  last_updated?: string;
  source?: string;
}

// ==========================================
// MACRO DASHBOARD TYPES & ENDPOINTS
// ==========================================

export interface MacroIndicator {
  value: number | string;
  unit?: string;
  display_name: string;
  light: 'green' | 'yellow' | 'red' | 'gray';
  status: string;
  change?: number;
  change_pct?: number;
  trend?: string;
  impact_shorts?: string;
  description?: string;
  [key: string]: any;
}

export interface MacroSection {
  title: string;
  icon: string;
  data: Record<string, MacroIndicator>;
}

export interface ShortBiasBreakdown {
  factor: string;
  points: number;
  reason: string;
}

export interface ShortBiasScore {
  score: number;
  max_score: number;
  percentage: number;
  bias_level: string;
  recommendation: string;
  breakdown: ShortBiasBreakdown[];
  timestamp: string;
}

export interface MacroDashboardData {
  status: string;
  short_bias: ShortBiasScore;
  sections: {
    interest_rates: MacroSection;
    currency_flows: MacroSection;
    growth_inflation: MacroSection;
    volatility_sentiment: MacroSection;
    oil_commodities: MacroSection;
    us_macro: MacroSection;
    market_breadth: MacroSection;
  };
  last_updated: string;
  next_update: string;
}

// Add macro dashboard methods to screenerService
export const macroService = {
  /**
   * Get full macro dashboard data
   */
  getDashboard: async (): Promise<MacroDashboardData> => {
    const response = await api.get('/mtf-screener/macro/dashboard');
    return response.data;
  },

  /**
   * Get SHORT bias score only
   */
  getBiasScore: async (): Promise<ShortBiasScore & { status: string }> => {
    const response = await api.get('/mtf-screener/macro/bias-score');
    return response.data;
  },

  /**
   * Get specific macro section
   */
  getSection: async (sectionName: string): Promise<{ status: string; section: string; data: Record<string, MacroIndicator> }> => {
    const response = await api.get(`/mtf-screener/macro/section/${sectionName}`);
    return response.data;
  }
};

export default screenerService;
