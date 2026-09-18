/**
 * Stage 4 — Position Sizing.
 *
 * How large each trade is, how many run at once, and every cost that comes off
 * the top: Indian brokerage and taxes, modelled spread, slippage and latency.
 */

import React from 'react';
import { Catalogue, fmt } from '../../../../services/backtestIndia';
import { Field, inputCls } from '../../StrategyBuilder';
import { Note } from '../../viz';
import { Section, Toggle } from '../ui';
import { RunSettings } from '../config';

export const SizingStage: React.FC<{
  catalogue: Catalogue;
  settings: RunSettings;
  set: <K extends keyof RunSettings>(k: K, v: RunSettings[K]) => void;
}> = ({ catalogue, settings, set }) => {
  const sizingSpec = catalogue.sizing_models.find((m) => m.key === settings.sizing.model);
  const schedule = catalogue.cost_schedules.find((c) => c.schedule_id === settings.cost_schedule);
  const policy = catalogue.execution.intrabar_policies.find((p) => p.key === settings.intrabar_policy);
  const slippage = catalogue.execution.slippage_models.find((m) => m.key === settings.execution.slippage_model);

  const setExec = (k: string, v: any) => set('execution', { ...settings.execution, [k]: v });

  return (
    <>
      <Section title="How big is each trade?" hint={sizingSpec?.description}>
        <Field
          label="Sizing model"
          hint="Risk per trade is the usual choice — it sizes each position so a stop-out costs the same fixed slice of your account."
        >
          <select
            className={inputCls}
            value={settings.sizing.model}
            onChange={(e) => {
              const spec = catalogue.sizing_models.find((m) => m.key === e.target.value);
              set('sizing', { model: e.target.value, ...(spec ? spec.params : {}) });
            }}
          >
            {catalogue.sizing_models.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </Field>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {Object.keys(sizingSpec?.params || {}).map((k) => (
            <Field
              key={k}
              label={fmt.label(k)}
              hint={k === 'fraction' ? '0.005 risks 0.5% of the account on each trade.' : undefined}
            >
              <input
                type="number"
                step="any"
                className={inputCls}
                value={String(settings.sizing[k] ?? '')}
                onChange={(e) => set('sizing', { ...settings.sizing, [k]: Number(e.target.value) })}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Portfolio limits" hint="Caps that apply across every open position at once.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Max open positions">
            <input
              type="number"
              className={inputCls}
              value={settings.max_concurrent_positions}
              onChange={(e) => set('max_concurrent_positions', Number(e.target.value))}
            />
          </Field>
          <Field label="Max % per symbol" hint="Share of equity — 25 caps any single symbol at 25% of the account.">
            <input
              type="number"
              step="1"
              min={0}
              max={100}
              className={inputCls}
              value={Math.round(settings.max_position_weight * 100)}
              onChange={(e) => set('max_position_weight', Number(e.target.value) / 100)}
            />
          </Field>
        </div>
        <div className="mt-2">
          <Toggle
            label="Allow short positions"
            hint="Lets the engine act on short entry rules. Leave off unless your strategy defines them."
            checked={settings.allow_short}
            onChange={(v) => set('allow_short', v)}
          />
        </div>
      </Section>

      <Section
        title="Costs and taxes"
        hint={schedule?.source_note}
      >
        <Field
          label="Cost schedule"
          hint="The published Indian brokerage, STT, exchange and stamp charges applied to every fill."
        >
          <select className={inputCls} value={settings.cost_schedule} onChange={(e) => set('cost_schedule', e.target.value)}>
            {catalogue.cost_schedules.map((c) => (
              <option key={c.schedule_id} value={c.schedule_id}>{c.label}</option>
            ))}
          </select>
        </Field>

        {schedule && (
          <>
            <details className="mt-3">
              <summary className="cursor-pointer list-none text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                See every charge in this schedule
              </summary>
              <dl className="mt-2 space-y-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-secondary p-3 text-xs">
                {schedule.components.map((c) => (
                  <div key={c.name} className="flex justify-between gap-3">
                    <dt className="text-gray-500 dark:text-gray-400">
                      {fmt.label(c.name)} <span className="opacity-60">({c.side.toLowerCase()})</span>
                    </dt>
                    <dd className="shrink-0 tabular-nums font-medium text-gray-800 dark:text-gray-100">
                      {(c.rate * 100).toFixed(5)}%
                      {c.maximum ? ` (max ₹${c.maximum})` : ''}
                      {c.minimum ? ` (min ₹${c.minimum})` : ''}
                    </dd>
                  </div>
                ))}
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1">
                  <dt className="text-gray-500 dark:text-gray-400">GST on service components</dt>
                  <dd className="tabular-nums font-medium text-gray-800 dark:text-gray-100">
                    {(schedule.gst_rate * 100).toFixed(0)}%
                  </dd>
                </div>
              </dl>
            </details>
            <Note tone="warn">{schedule.disclaimer}</Note>
          </>
        )}
      </Section>

      <Section
        title="Fill realism"
        hint="How optimistic the engine is allowed to be about the price you actually get."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Slippage model" hint={slippage?.description}>
            <select className={inputCls} value={settings.execution.slippage_model} onChange={(e) => setExec('slippage_model', e.target.value)}>
              {catalogue.execution.slippage_models.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Base slippage (bps)" hint="1 bp = 0.01%. The gap between the price you wanted and the price you got.">
            <input type="number" step="0.5" className={inputCls} value={settings.execution.slippage_bps} onChange={(e) => setExec('slippage_bps', Number(e.target.value))} />
          </Field>
          <Field label="Synthetic spread (bps)" hint="Daily bars carry no real bid/ask, so the spread is modelled — and labelled as modelled.">
            <input type="number" step="0.5" className={inputCls} value={settings.execution.synthetic_spread_bps} onChange={(e) => setExec('synthetic_spread_bps', Number(e.target.value))} />
          </Field>
          <Field label="Latency (bars)" hint="Minimum 1 — a signal generated at a bar's close can never fill at that same close.">
            <input type="number" min={1} className={inputCls} value={settings.execution.latency_bars} onChange={(e) => setExec('latency_bars', Math.max(1, Number(e.target.value)))} />
          </Field>
          <Field label="Max participation" hint="The share of a bar's volume you are allowed to take. Caps size on illiquid names.">
            <input type="number" step="0.01" className={inputCls} value={settings.execution.participation_rate} onChange={(e) => setExec('participation_rate', Number(e.target.value))} />
          </Field>
          <Field label="Order life (bars)" hint="Any unfilled remainder expires after this many bars.">
            <input type="number" className={inputCls} value={settings.execution.time_in_force_bars} onChange={(e) => setExec('time_in_force_bars', Number(e.target.value))} />
          </Field>
        </div>

        <div className="mt-3">
          <Field
            label="Same-bar stop and target policy"
            hint={policy?.description}
          >
            <select className={inputCls} value={settings.intrabar_policy} onChange={(e) => set('intrabar_policy', e.target.value)}>
              {catalogue.execution.intrabar_policies.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </Field>
          {settings.intrabar_policy === 'optimistic' && (
            <Note tone="warn">
              The optimistic policy resolves every ambiguous bar in the strategy's favour and will
              inflate the result. The bias audit flags any run that uses it.
            </Note>
          )}
        </div>
      </Section>
    </>
  );
};
