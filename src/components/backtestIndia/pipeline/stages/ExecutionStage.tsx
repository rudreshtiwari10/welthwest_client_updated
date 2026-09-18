/**
 * Stage 5 — Execution.
 *
 * No new inputs. It reads back everything the previous four stages decided,
 * flags anything that would stop the run, and launches it.
 */

import React from 'react';
import { Catalogue, StrategyGraph } from '../../../../services/backtestIndia';
import { Note } from '../../viz';
import { Section } from '../ui';
import { RunSettings, StageId, STAGES } from '../config';

const money = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : `₹${(n / 100000).toFixed(1)} L`;

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5">
    <dt className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-right text-xs font-medium text-gray-900 dark:text-gray-100">{value}</dd>
  </div>
);

/** A summary block that doubles as a jump link back to the stage that owns it. */
const Review: React.FC<{
  stage: StageId;
  onEdit: (s: StageId) => void;
  children: React.ReactNode;
}> = ({ stage, onEdit, children }) => (
  <Section
    title={`${STAGES[stage].step}. ${STAGES[stage].title}`}
    right={
      <button
        type="button"
        onClick={() => onEdit(stage)}
        className="shrink-0 text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline"
      >
        Edit
      </button>
    }
  >
    <dl className="divide-y divide-gray-200/70 dark:divide-gray-700/50">{children}</dl>
  </Section>
);

export const ExecutionStage: React.FC<{
  catalogue: Catalogue;
  settings: RunSettings;
  strategy: StrategyGraph;
  strategyName: string;
  estimatedWork: number;
  blockers: string[];
  problems: string[];
  error: string;
  onEdit: (s: StageId) => void;
}> = ({
  catalogue, settings, strategy, strategyName, estimatedWork,
  blockers, problems, error, onEdit,
}) => {
  const tf = catalogue.timeframes.find((t) => t.key === settings.timeframe);
  const bench = catalogue.benchmarks.find((b) => b.symbol === settings.benchmark);
  const sizing = catalogue.sizing_models.find((m) => m.key === settings.sizing.model);
  const schedule = catalogue.cost_schedules.find((c) => c.schedule_id === settings.cost_schedule);

  const checks = [
    settings.walk_forward && 'Walk-forward',
    settings.run_stress && 'Stress matrix',
    settings.run_parameters && 'Parameter robustness',
    settings.run_controls && 'Baseline controls',
  ].filter(Boolean) as string[];

  return (
    <>
      {!!blockers.length && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Not ready to run yet
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-amber-700 dark:text-amber-300">
            {blockers.map((b, i) => <li key={i}>— {b}</li>)}
          </ul>
        </div>
      )}

      {!!problems.length && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            The strategy graph needs fixing
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-amber-700 dark:text-amber-300">
            {problems.map((p, i) => <li key={i}>— {p}</li>)}
          </ul>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 text-xs leading-relaxed text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <Review stage="input" onEdit={onEdit}>
        <Row
          label="Instruments"
          value={settings.symbols.length ? settings.symbols.join(', ') : <span className="text-amber-600">None</span>}
        />
        <Row label="Window" value={`${settings.start} → ${settings.end}`} />
        <Row label="Bar size" value={tf?.label || settings.timeframe} />
        <Row label="Benchmark" value={bench?.label || settings.benchmark} />
        <Row label="Starting capital" value={money(settings.initial_capital)} />
        <Row label="Verification" value={checks.length ? checks.join(' · ') : 'Single pass only'} />
      </Review>

      <Review stage="strategy" onEdit={onEdit}>
        <Row label="Name" value={strategyName} />
        <Row label="Indicators" value={(strategy.features || []).length} />
        <Row
          label="Patterns"
          value={(strategy.candles || []).length + (strategy.chart_patterns || []).length}
        />
        <Row label="Conditions" value={(strategy.conditions || []).length} />
        <Row
          label="Entry rule"
          value={strategy.entry_long || strategy.entry_short
            ? 'Defined'
            : <span className="text-amber-600">Missing</span>}
        />
      </Review>

      <Review stage="risk" onEdit={onEdit}>
        <Row
          label="Stop"
          value={settings.risk.stop_type === 'percent'
            ? `${settings.risk.stop_percent}%`
            : `${settings.risk.stop_atr_multiple}× ATR`}
        />
        <Row
          label="Target"
          value={settings.risk.target_type === 'percent'
            ? `${settings.risk.target_percent}%`
            : settings.risk.target_type === 'atr'
            ? `${settings.risk.target_atr_multiple}× ATR`
            : `${settings.risk.target_r}R`}
        />
        <Row
          label="Trailing stop"
          value={settings.risk.trailing_enabled ? `On — ${settings.risk.trailing_atr_multiple}× ATR` : 'Off'}
        />
        <Row
          label="Drawdown halt"
          value={settings.risk.portfolio_max_drawdown
            ? `${(settings.risk.portfolio_max_drawdown * 100).toFixed(0)}%`
            : 'Off'}
        />
      </Review>

      <Review stage="sizing" onEdit={onEdit}>
        <Row label="Sizing model" value={sizing?.label || settings.sizing.model} />
        <Row label="Max open positions" value={settings.max_concurrent_positions} />
        <Row label="Max % per symbol" value={`${(settings.max_position_weight * 100).toFixed(0)}%`} />
        <Row label="Shorts" value={settings.allow_short ? 'Allowed' : 'Long only'} />
        <Row label="Cost schedule" value={schedule?.label || settings.cost_schedule} />
        <Row label="Slippage" value={`${settings.execution.slippage_bps} bps + ${settings.execution.synthetic_spread_bps} bps spread`} />
      </Review>

      <Note>
        The engine will run roughly <strong>{estimatedWork} full simulations</strong> — expect about{' '}
        {Math.max(5, Math.round(estimatedWork * 0.6))}–{Math.round(estimatedWork * 1.6)} seconds.
        Signals become orders, orders become fills through a latency queue and a participation cap,
        and every rupee of cost is traced back to an individual fill.
      </Note>
    </>
  );
};
