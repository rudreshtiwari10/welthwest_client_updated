import axios from 'axios';
import { API_URL } from './api';

const screenerApi = axios.create({
  baseURL: API_URL.replace(/\/api\/?$/, '/api/ai-screener'),
  headers: { 'Content-Type': 'application/json' },
});

export type AIScreenerTimeframe = '1d' | '1h';

export interface AnomalyRecord {
  code: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  window_bars: number;
  bar_index: number;
  timestamp: string;
  bars_ago: number;
  details: {
    current_value: number;
    threshold: number;
    supporting_features: string[];
  };
}

export interface ScreenerResult {
  symbol: string;
  name: string;
  market: string;
  sector: string;
  industry: string;
  overall_score: number;
  momentum_score: number;
  risk_score: number;
  momentum_probability: number;
  crash_probability: number;
  regime: string;
  regime_confidence: number;
  top_signals: { feature: string; value: number; direction: string }[];
  explanation: string;
  current_price: number;
  price_change_5d: number;
  price_change_20d: number;
  rsi_14: number;
  volume_ratio: number;
  market_cap: number;
  pe_ratio?: number;
  '52w_high'?: number;
  '52w_low'?: number;
  timeframe?: string;
  anomalies?: AnomalyRecord[];
  has_anomaly?: boolean;
}

export interface ScreenResponse {
  timestamp: string;
  timeframe?: string;
  regime: string;
  regime_confidence: number;
  regime_description: string;
  total_screened: number;
  results_count: number;
  results: ScreenerResult[];
}

export interface RegimeInfo {
  regime: string;
  confidence: number;
  description: string;
  nifty_current?: number;
  nifty_previous_close?: number;
  nifty_20d_return?: number;
  nifty_60d_return?: number;
  annualized_volatility?: number;
  volatility_percentile?: number;
}

export interface VixInfo {
  symbol: string;
  current: number;
  previous_close: number;
  change_pct: number;
  interpretation: string;
}

const aiScreenerService = {
  /** Run full NIFTY 50 screen */
  runScreen: async (params?: {
    symbols?: string[];
    top_n?: number;
    min_score?: number;
    sectors?: string[];
    timeframe?: AIScreenerTimeframe;
  }): Promise<ScreenResponse> => {
    const { data } = await screenerApi.post('/screen', params || {});
    return data;
  },

  /** Quick screen for up to 10 symbols */
  quickScreen: async (symbols: string[], top_n = 10, timeframe: AIScreenerTimeframe = '1d'): Promise<ScreenResponse> => {
    const { data } = await screenerApi.post('/screen/quick', { symbols, top_n, timeframe });
    return data;
  },

  /** Get cached screening results */
  getCached: async (): Promise<ScreenResponse | null> => {
    try {
      const { data } = await screenerApi.get('/screen/cached');
      return data;
    } catch {
      return null;
    }
  },

  /** Get detailed analysis for a single stock */
  getStockDetail: async (symbol: string, timeframe: AIScreenerTimeframe = '1d') => {
    const { data } = await screenerApi.get(`/screen/${symbol}`, { params: { timeframe } });
    return data;
  },

  /** Get current market regime */
  getRegime: async (): Promise<RegimeInfo> => {
    const { data } = await screenerApi.get('/regime');
    return data;
  },

  /** Get India VIX */
  getVix: async (): Promise<VixInfo> => {
    const { data } = await screenerApi.get('/regime/vix');
    return data;
  },

  /** Get signal breakdown for a stock */
  getSignals: async (symbol: string, timeframe = '1d') => {
    const { data } = await screenerApi.get(`/signals/${symbol}`, { params: { timeframe } });
    return data;
  },

  /** Get price history */
  getPriceHistory: async (symbol: string, days = 90, timeframe = '1d') => {
    const { data } = await screenerApi.get(`/price/${symbol}`, { params: { days, timeframe } });
    return data;
  },

  /** Health check */
  healthCheck: async () => {
    const { data } = await screenerApi.get('/health');
    return data;
  },
};

export default aiScreenerService;
