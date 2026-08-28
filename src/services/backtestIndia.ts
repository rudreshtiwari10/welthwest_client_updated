/**
 * Client for the WelthWest Backtesting Engine v2 (/api/backtest-india/*).
 *
 * Completely separate from services/backtesting.ts, which still serves the
 * legacy Beta page. Nothing here is shared with it.
 */

import { API_URL } from './api';

/* ── Catalogue types ─────────────────────────────────────────────────── */

export interface IndicatorSpec {
  key: string;
  label: string;
  category: string;
  params: Record<string, any>;
  outputs: string[];
  description: string;
}

export interface CandleSpec {
  key: string;
  label: string;
  direction: string;
  bars: number;
  params: Record<string, any>;
  description: string;
}

export interface ChartPatternSpec {
  key: string;
  label: string;
  direction: string;
  params: Record<string, any>;
}

export interface SizingSpec {
  key: string;
  label: string;
  params: Record<string, any>;
  description: string;
}

export interface CostScheduleSpec {
  schedule_id: string;
  label: string;
  segment: string;
  effective_from: string;
  effective_to: string | null;
  verified_on: string;
  gst_rate: number;
  source_note: string;
  disclaimer: string;
  components: Array<{
    name: string; rate: number; side: string; basis: string;
    minimum: number; maximum: number | null; note: string;
  }>;
}

export interface PresetSummary {
  key: string;
  name: string;
  summary: string;
  expectation: string;
  features: number;
  uses_candles: boolean;
  uses_chart_patterns: boolean;
  uses_structure: boolean;
  sizing: Record<string, any>;
  risk: Record<string, any>;
}

export interface Catalogue {
  engine_version: string;
  /** True when the server is running with auth and quota bypassed for testing. */
  open_access?: boolean;
  indicators: IndicatorSpec[];
  candles: CandleSpec[];
  chart_patterns: ChartPatternSpec[];
  structure_outputs: Array<{ key: string; description: string }>;
  operators: { comparators: string[]; logic: string[]; temporal: string[] };
  sizing_models: SizingSpec[];
  risk_rules: {
    stop_types: Array<{ key: string; label: string; params: Record<string, any>; note?: string }>;
    target_types: Array<{ key: string; label: string; params: Record<string, any> }>;
    modifiers: Array<{ key: string; label: string }>;
  };
  execution: {
    slippage_models: Array<{ key: string; label: string; description: string }>;
    order_types: string[];
    intrabar_policies: Array<{ key: string; label: string; description: string }>;
    realism_levels: Array<{ level: number; label: string }>;
  };
  cost_schedules: CostScheduleSpec[];
  presets: PresetSummary[];
  universe: Array<{ symbol: string; name: string; sector: string }>;
  benchmarks: Array<{ symbol: string; label: string }>;
  timeframes: Array<{ key: string; label: string; note: string }>;
  price_sources: string[];
  principles: string[];
}

/* ── Strategy graph types ────────────────────────────────────────────── */

export interface FeatureNode { id: string; type: string; [k: string]: any }
export interface CandleNode { id: string; type: string; [k: string]: any }
export interface ChartPatternNode { id: string; type: string; [k: string]: any }

export interface ConditionNode {
  id: string;
  op: string;
  left?: string | number;
  right?: string | number;
  bars?: number;
  low?: string | number;
  high?: string | number;
  percentile?: number;
  window?: number;
}

export type Expression =
  | string
  | null
  | { op: string; args: Expression[]; bars?: number; of?: string };

export interface StrategyGraph {
  features?: FeatureNode[];
  candles?: CandleNode[];
  chart_patterns?: ChartPatternNode[];
  structure?: Record<string, any>;
  conditions?: ConditionNode[];
  entry_long?: Expression;
  exit_long?: Expression;
  entry_short?: Expression;
  exit_short?: Expression;
}

export interface RunRequest {
  symbols: string[];
  start: string;
  end: string;
  timeframe: string;
  exchange?: string;
  strategy: StrategyGraph;
  strategy_name?: string;
  initial_capital: number;
  sizing: Record<string, any>;
  max_concurrent_positions: number;
  max_position_weight: number;
  allow_short: boolean;
  risk: Record<string, any>;
  execution: Record<string, any>;
  intrabar_policy: string;
  cost_schedule: string;
  validation: Record<string, any>;
  benchmark: string;
  diagnostics: Record<string, any>;
  robustness: Record<string, any>;
  seed: number;
}

/* ── Report types ────────────────────────────────────────────────────── */

export interface Headline {
  net_cagr: number | null;
  gross_cagr: number | null;
  net_total_return: number | null;
  gross_total_return: number | null;
  max_drawdown: number | null;
  sharpe: number | null;
  sortino: number | null;
  calmar: number | null;
  profit_factor: number | null;
  turnover: number | null;
  total_costs: number | null;
  total_trades: number | null;
  hit_rate: number | null;
  benchmark_excess_cagr: number | null;
  quality_score: number | null;
  confidence_label: string;
  confidence_summary: string;
}

export interface TradeRow {
  trade_id: string;
  instrument: string;
  direction: string;
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  gross_pnl: number;
  costs: number;
  net_pnl: number;
  return_pct: number;
  r_multiple: number | null;
  bars_held: number;
  exit_reason: string;
  mae: number;
  mfe: number;
  entry_reason: string;
}

export interface EquityPoint {
  t: string;
  equity: number;
  gross: number;
  cash: number;
  benchmark: number | null;
  exposure: number;
  positions: number;
}

export interface BacktestReport {
  success: boolean;
  run: Record<string, any>;
  headline: Headline;
  metrics: Record<string, any>;
  equity_curve: EquityPoint[];
  drawdown_curve: Array<{ t: string; drawdown: number }>;
  monthly_returns: Array<{ year: number; month: number; return: number }>;
  yearly_returns: Array<{ year: number; return: number }>;
  trades: TradeRow[];
  orders: Record<string, any>;
  cost_waterfall: {
    gross_pnl: number;
    components: Record<string, number>;
    total_costs: number;
    total_slippage_and_impact: number;
    net_pnl: number;
    cost_as_pct_of_gross: number | null;
  };
  cost_schedule: Record<string, any>;
  capital_gains_note: Record<string, any>;
  ledger: Array<Record<string, any>>;
  execution_model: Record<string, any>;
  risk_rules: Record<string, any>;
  liquidity: Record<string, any>;
  diagnostics: Record<string, any>;
  regimes: Record<string, any>;
  walk_forward: Record<string, any>;
  robustness: Record<string, any>;
  stress_matrix: Record<string, any>;
  cost_sensitivity: Record<string, any>;
  benchmarks: Record<string, any>;
  quality_score: {
    score: number;
    scale: string;
    components: Array<{ name: string; weight: number; value: number; basis: string; cap: string }>;
    degrees_of_freedom: number;
    disclaimer: string;
  };
  confidence: { label: string; reasons: string[]; summary: string };
  bias_audit: Array<{ check: string; status: string; detail: string }>;
  data_quality: Record<string, any>;
  chart_data: Record<string, any>;
  warnings: string[];
  halted: string;
  runtime_seconds?: number;
  usage?: Record<string, any>;
}

/* ── AI fill ─────────────────────────────────────────────────────────── */

export interface AiQuestion {
  key: string;
  type: 'text' | 'choice' | 'number' | 'symbols';
  question: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  default?: any;
  options?: Array<{ value: string; label: string }>;
}

export interface AiFillResult {
  strategy: StrategyGraph;
  strategy_name: string;
  /** A partial RunSettings — only the keys the assistant chose to set. */
  settings: Record<string, any>;
  explanation: string;
  stage_notes: Record<string, string>;
  /** Entry signals found on a real dry run, or null if the check could not run. */
  signals_found: number | null;
  warnings: string[];
  provider: string;
}

/* ── Client ──────────────────────────────────────────────────────────── */

/**
 * Production sets REACT_APP_API_URL with the trailing `/api` segment; the local
 * .env sets it without. Normalise here rather than editing shared config, so
 * this page works in both without touching anything the legacy page relies on.
 */
function apiRoot(): string {
  const raw = (API_URL || '').replace(/\/+$/, '');
  return /\/api$/.test(raw) ? raw : `${raw}/api`;
}

const BASE = `${apiRoot()}/backtest-india`;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(
      (body && (body.error || body.message)) || `Request failed (${res.status})`
    ) as Error & { status?: number; payload?: any };
    err.status = res.status;
    err.payload = body;
    throw err;
  }
  return body as T;
}

export const backtestIndiaService = {
  async health() {
    return handle<any>(await fetch(`${BASE}/health`, { credentials: 'include' }));
  },

  async catalogue(): Promise<Catalogue> {
    const data = await handle<{ catalogue: Catalogue }>(
      await fetch(`${BASE}/catalogue`, { credentials: 'include' })
    );
    return data.catalogue;
  },

  async preset(key: string): Promise<any> {
    const data = await handle<{ preset: any }>(
      await fetch(`${BASE}/presets/${key}`, { credentials: 'include' })
    );
    return data.preset;
  },

  /** The questions the AI assistant asks before it fills the pipeline. */
  async aiInterview(): Promise<{ available: boolean; questions: AiQuestion[] }> {
    return handle(await fetch(`${BASE}/ai-fill/interview`, { credentials: 'include' }));
  },

  /** Turn interview answers into a proposed configuration. Applies nothing. */
  async aiFill(answers: Record<string, any>): Promise<AiFillResult> {
    return handle<AiFillResult>(await fetch(`${BASE}/ai-fill`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ answers, verify: true }),
    }));
  },

  async validate(strategy: StrategyGraph): Promise<{ valid: boolean; problems: string[] }> {
    return handle(await fetch(`${BASE}/validate`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ strategy }),
    }));
  },

  async run(request: RunRequest): Promise<BacktestReport> {
    return handle<BacktestReport>(await fetch(`${BASE}/run`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(request),
    }));
  },

  async patternLab(params: {
    symbol: string; start: string; end: string; timeframe?: string;
    include_chart_patterns?: boolean;
  }): Promise<any> {
    const data = await handle<{ study: any }>(await fetch(`${BASE}/pattern-lab`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(params),
    }));
    return data.study;
  },

  async runs(limit = 25): Promise<any[]> {
    const data = await handle<{ runs: any[] }>(
      await fetch(`${BASE}/runs?limit=${limit}`, {
        headers: authHeaders(), credentials: 'include',
      })
    );
    return data.runs;
  },

  async compare(a: string, b: string): Promise<any> {
    const data = await handle<{ comparison: any }>(
      await fetch(`${BASE}/compare?a=${a}&b=${b}`, {
        headers: authHeaders(), credentials: 'include',
      })
    );
    return data.comparison;
  },

  async selftest(): Promise<any> {
    const data = await handle<{ selftest: any }>(
      await fetch(`${BASE}/selftest`, { credentials: 'include' })
    );
    return data.selftest;
  },
};

/* ── Formatting helpers shared by the page ───────────────────────────── */

export const fmt = {
  pct(v: number | null | undefined, digits = 2): string {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    return `${(v * 100).toFixed(digits)}%`;
  },
  num(v: number | null | undefined, digits = 2): string {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    return v.toFixed(digits);
  },
  money(v: number | null | undefined): string {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    const abs = Math.abs(v);
    const sign = v < 0 ? '-' : '';
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}k`;
    return `${sign}₹${abs.toFixed(0)}`;
  },
  int(v: number | null | undefined): string {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    return Math.round(v).toLocaleString('en-IN');
  },
  date(t: string): string {
    if (!t) return '—';
    return new Date(t).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: '2-digit',
    });
  },
  label(k: string): string {
    return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  },
};

export const CONFIDENCE_STYLES: Record<string, string> = {
  Robust: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Validated: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  Research: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Fragile: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  Failed: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
};
