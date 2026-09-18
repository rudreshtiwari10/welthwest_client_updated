/**
 * Shared configuration for the Backtest India pipeline view.
 *
 * The settings shape and every default value are lifted verbatim from the
 * original page — the request payload the engine receives is unchanged. Only
 * where these values are *edited* has moved.
 */

import { StrategyGraph } from '../../../services/backtestIndia';

/* ── Dates ───────────────────────────────────────────────────────────── */

const today = new Date();
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export const yearsAgo = (n: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return isoDate(d);
};

/* ── Settings ────────────────────────────────────────────────────────── */

export interface RunSettings {
  symbols: string[];
  start: string;
  end: string;
  timeframe: string;
  benchmark: string;
  initial_capital: number;
  max_concurrent_positions: number;
  max_position_weight: number;
  allow_short: boolean;
  cost_schedule: string;
  intrabar_policy: string;
  seed: number;
  sizing: Record<string, any>;
  risk: Record<string, any>;
  execution: Record<string, any>;
  walk_forward: boolean;
  wf_train: string;
  wf_test: string;
  run_stress: boolean;
  run_parameters: boolean;
  run_controls: boolean;
}

export const DEFAULT_STRATEGY: StrategyGraph = {
  features: [
    { id: 'ema20', type: 'EMA', period: 20, source: 'close' },
    { id: 'ema50', type: 'EMA', period: 50, source: 'close' },
    { id: 'rsi14', type: 'RSI', period: 14, source: 'close' },
    { id: 'atr14', type: 'ATR', period: 14 },
  ],
  candles: [{ id: 'bull_eng', type: 'ENGULFING_BULL', min_body_ratio: 1.0 }],
  conditions: [
    { id: 'trend', op: '>', left: 'ema20', right: 'ema50' },
    { id: 'pullback', op: '<', left: 'rsi14', right: 45 },
    { id: 'pattern', op: 'IS_TRUE', left: 'bull_eng' },
    { id: 'trend_break', op: 'CROSS_BELOW', left: 'ema20', right: 'ema50' },
  ],
  // The pullback is wrapped in WITHIN_LAST so the RSI dip and the engulfing
  // candle need not land on the same bar — requiring all three simultaneously
  // fires so rarely that a first run returns too few trades to read.
  entry_long: {
    op: 'AND',
    args: ['trend', { op: 'WITHIN_LAST', bars: 5, args: ['pullback'] }, 'pattern'],
  },
  exit_long: 'trend_break',
};

export const DEFAULT_SETTINGS: RunSettings = {
  symbols: ['RELIANCE'],
  start: yearsAgo(5),
  end: isoDate(today),
  timeframe: '1d',
  benchmark: '^NSEI',
  initial_capital: 1000000,
  max_concurrent_positions: 5,
  max_position_weight: 0.25,
  allow_short: false,
  cost_schedule: 'INDIA_EQUITY_DELIVERY_v20250401',
  intrabar_policy: 'conservative',
  seed: 42,
  sizing: { model: 'risk_per_trade', fraction: 0.005 },
  risk: {
    stop_type: 'atr', stop_atr_multiple: 2.0,
    target_type: 'r_multiple', target_r: 2.5,
    trailing_enabled: true, trailing_atr_multiple: 3.0,
    breakeven_enabled: false, breakeven_trigger_r: 1.0,
    time_stop_bars: 0, cooldown_bars: 3,
    portfolio_max_drawdown: 0, max_consecutive_losses: 0,
  },
  execution: {
    slippage_model: 'vol_liquidity', slippage_bps: 5,
    synthetic_spread_bps: 3, latency_bars: 1,
    participation_rate: 0.05, time_in_force_bars: 3,
    impact_enabled: false,
  },
  walk_forward: true,
  wf_train: '3Y',
  wf_test: '6M',
  run_stress: true,
  run_parameters: true,
  run_controls: true,
};

/* ── Stages ──────────────────────────────────────────────────────────── */

export type StageId = 'input' | 'strategy' | 'risk' | 'sizing' | 'execution';

export const STAGE_ORDER: StageId[] = ['input', 'strategy', 'risk', 'sizing', 'execution'];

/**
 * `incomplete` — the stage is missing something the engine needs.
 * `default`    — valid, but still exactly as it shipped.
 * `custom`     — valid and edited by the user.
 */
export type StageStatus = 'incomplete' | 'default' | 'custom';

export interface StageMeta {
  id: StageId;
  step: number;
  title: string;
  tagline: string;
  /** Plain-English answer to "why does this stage exist?" */
  blurb: string;
  /** Panel width — the strategy graph needs far more room than the rest. */
  width: 'md' | 'lg' | 'xl';
}

export const STAGES: Record<StageId, StageMeta> = {
  input: {
    id: 'input',
    step: 1,
    title: 'Input',
    tagline: 'What to test, and over what period',
    blurb:
      'Pick the instruments, the stretch of history to replay, and the money you are pretending to start with.',
    width: 'md',
  },
  strategy: {
    id: 'strategy',
    step: 2,
    title: 'Strategy',
    tagline: 'The rules that decide when to buy and sell',
    blurb:
      'Indicators and patterns become named signals; conditions combine them into an entry and an exit rule.',
    width: 'xl',
  },
  risk: {
    id: 'risk',
    step: 3,
    title: 'Risk Management',
    tagline: 'When to cut a loss and take a win',
    blurb:
      'Stops and targets become resting orders resolved against each bar — not assumptions applied at the close.',
    width: 'lg',
  },
  sizing: {
    id: 'sizing',
    step: 4,
    title: 'Position Sizing',
    tagline: 'How much to buy, and what it costs',
    blurb:
      'Trade size, portfolio limits, and every rupee of Indian brokerage, tax and slippage applied to each fill.',
    width: 'lg',
  },
  execution: {
    id: 'execution',
    step: 5,
    title: 'Execution',
    tagline: 'Review the pipeline and run it',
    blurb:
      'A last look at everything you configured, then the engine replays it bar by bar.',
    width: 'lg',
  },
};

/* ── Run animation choreography (purely cosmetic) ───────────────────────
 * The backend reports no per-stage telemetry — one `run()` call either
 * succeeds or fails. This sequence is a deliberate, slowed-down walk the
 * page plays while that call is in flight, so a run reads as the engine
 * visibly moving down the trunk and out to each card, rather than a
 * spinner. `run()` waits for whichever is longer: the real response, or this
 * full sequence — see BacktestIndiaPage. Nothing here reads or writes
 * settings/strategy/report or affects what's sent to the engine.
 *
 * One phase per stage. For phase `i`, the trunk segment leading into stage
 * `i`'s marker (the lead-in stub, for i=0) and stage `i`'s own branch fill
 * AT THE SAME TIME, on the same clock, so they always arrive at their
 * shared junction together — a river and a tributary reaching the same
 * confluence point simultaneously, not one waiting for the other. Only once
 * both are done does the next phase (stage i+1) begin. */

export const RUN_PHASE_DURATION_MS = 3000;

export const RUN_PHASE_TOTAL_MS = STAGE_ORDER.length * RUN_PHASE_DURATION_MS;

/** Which stage's row is actually animating for a given phase index — used to
 *  keep that row in view (scrollIntoView) for the whole run. */
export const activeStageForPhase = (phaseIndex: number): StageId =>
  STAGE_ORDER[Math.min(phaseIndex, STAGE_ORDER.length - 1)];

/* ── Equality (for default-vs-custom detection) ──────────────────────── */

/** Stable stringify so key order never registers as a change. */
export function stable(v: any): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null';
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
  return `{${Object.keys(v)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stable(v[k])}`)
    .join(',')}}`;
}

export const sameAsDefault = (a: any, b: any) => stable(a) === stable(b);
