/**
 * Stage 1 — Input.
 *
 * What to test, over what window, with how much money, and how hard to check
 * the result. Every control here already had a home on the old page; this
 * groups them into the three questions a beginner actually asks.
 */

import React from 'react';
import { Catalogue } from '../../../../services/backtestIndia';
import { Field, inputCls } from '../../StrategyBuilder';
import { Note } from '../../viz';
import { Info, PresetRow, Section, Toggle } from '../ui';
import { RunSettings, isoDate, yearsAgo } from '../config';

/* Window shortcuts — the overwhelming majority of first runs want one of these. */
const WINDOWS = [
  { key: '1', label: 'Last 1 year', blurb: 'Fast, but one market mood only.' },
  { key: '5', label: 'Last 5 years', blurb: 'Recommended. Covers a full cycle.' },
  { key: '10', label: 'Last 10 years', blurb: 'Slowest, and the most honest.' },
];

/* How much verification to run. Each level is a bundle of the four toggles. */
const DEPTHS = [
  {
    key: 'quick',
    label: 'Quick look',
    blurb: 'One pass. Fast, but every number is in-sample.',
    flags: { walk_forward: false, run_stress: false, run_parameters: false, run_controls: false },
  },
  {
    key: 'standard',
    label: 'Standard',
    blurb: 'Recommended. Walk-forward plus baseline controls.',
    flags: { walk_forward: true, run_stress: false, run_parameters: false, run_controls: true },
  },
  {
    key: 'thorough',
    label: 'Thorough',
    blurb: 'Everything on. Slowest and hardest to fool.',
    flags: { walk_forward: true, run_stress: true, run_parameters: true, run_controls: true },
  },
];

export const InputStage: React.FC<{
  catalogue: Catalogue;
  settings: RunSettings;
  set: <K extends keyof RunSettings>(k: K, v: RunSettings[K]) => void;
  patch: (p: Partial<RunSettings>) => void;
  symbolInput: string;
  setSymbolInput: (s: string) => void;
  addSymbol: (s: string) => void;
  estimatedWork: number;
}> = ({
  catalogue, settings, set, patch, symbolInput, setSymbolInput, addSymbol, estimatedWork,
}) => {
  const tf = catalogue.timeframes.find((t) => t.key === settings.timeframe);

  const activeWindow = WINDOWS.find(
    (w) => settings.start === yearsAgo(Number(w.key)) && settings.end === isoDate(new Date())
  )?.key;

  const activeDepth = DEPTHS.find((d) =>
    Object.entries(d.flags).every(([k, v]) => (settings as any)[k] === v)
  )?.key;

  const popular = catalogue.universe.slice(0, 8);

  return (
    <>
      <Section
        title="What are you testing?"
        hint="Up to 8 NSE instruments. Start with one — a single name is far easier to read than a basket."
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {settings.symbols.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-2.5 py-1 text-xs font-medium text-primary-700 dark:text-primary-300"
            >
              {s}
              <button
                type="button"
                aria-label={`Remove ${s}`}
                onClick={() => set('symbols', settings.symbols.filter((x) => x !== s))}
                className="text-primary-400 transition-colors hover:text-rose-500"
              >
                ×
              </button>
            </span>
          ))}
          {!settings.symbols.length && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Pick at least one instrument to continue.
            </span>
          )}
        </div>

        <input
          className={inputCls}
          list="bt-universe"
          placeholder="Type a symbol and press Enter — e.g. RELIANCE"
          value={symbolInput}
          onChange={(e) => setSymbolInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSymbol(symbolInput);
            }
          }}
        />
        <datalist id="bt-universe">
          {catalogue.universe.map((u) => (
            <option key={u.symbol} value={u.symbol}>{u.name}</option>
          ))}
        </datalist>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wide text-gray-400">Popular</span>
          {popular.map((u) => (
            <button
              key={u.symbol}
              type="button"
              disabled={settings.symbols.includes(u.symbol) || settings.symbols.length >= 8}
              onClick={() => addSymbol(u.symbol)}
              title={u.name}
              className="rounded-full border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-300 transition-colors hover:border-primary-400 hover:text-primary-600 disabled:opacity-35 disabled:hover:border-gray-300 disabled:hover:text-gray-600"
            >
              + {u.symbol}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Over what period?" hint="The stretch of history the engine replays, bar by bar.">
        <PresetRow
          options={WINDOWS}
          activeKey={activeWindow}
          onPick={(k) => patch({ start: yearsAgo(Number(k)), end: isoDate(new Date()) })}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="From">
            <input type="date" className={inputCls} value={settings.start} onChange={(e) => set('start', e.target.value)} />
          </Field>
          <Field label="To">
            <input type="date" className={inputCls} value={settings.end} onChange={(e) => set('end', e.target.value)} />
          </Field>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Bar size" hint={tf?.note}>
            <select className={inputCls} value={settings.timeframe} onChange={(e) => set('timeframe', e.target.value)}>
              {catalogue.timeframes.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Compare against" hint="The index your result is measured against.">
            <select className={inputCls} value={settings.benchmark} onChange={(e) => set('benchmark', e.target.value)}>
              {catalogue.benchmarks.map((b) => (
                <option key={b.symbol} value={b.symbol}>{b.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Starting with how much?" hint="Pretend capital. It sets the scale of every position the engine takes.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Starting capital (₹)">
            <input
              type="number"
              className={inputCls}
              value={settings.initial_capital}
              onChange={(e) => set('initial_capital', Number(e.target.value))}
            />
          </Field>
          <Field label="Random seed" hint="Same seed, same result — every run is reproducible.">
            <input
              type="number"
              className={inputCls}
              value={settings.seed}
              onChange={(e) => set('seed', Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[100000, 500000, 1000000, 5000000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set('initial_capital', v)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                settings.initial_capital === v
                  ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-400'
              }`}
            >
              ₹{v >= 10000000 ? `${v / 10000000} Cr` : `${v / 100000} L`}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="How hard should we check the result?"
        hint="Each extra layer costs time, and is what separates a result from a hypothesis."
      >
        <PresetRow
          options={DEPTHS}
          activeKey={activeDepth}
          onPick={(k) => patch(DEPTHS.find((d) => d.key === k)!.flags as Partial<RunSettings>)}
        />

        <details className="mt-3 group">
          <summary className="cursor-pointer list-none text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
            Fine-tune the individual checks
          </summary>
          <div className="mt-2 space-y-1.5">
            <Toggle
              label="Walk-forward validation"
              hint="Repeated train → test windows with a purge and embargo gap. Without it, every number is in-sample and the engine will not label the result Validated."
              checked={settings.walk_forward}
              onChange={(v) => set('walk_forward', v)}
            />
            {settings.walk_forward && (
              <div className="ml-12 grid grid-cols-2 gap-2">
                <Field label="Train">
                  <select className={inputCls} value={settings.wf_train} onChange={(e) => set('wf_train', e.target.value)}>
                    {['1Y', '2Y', '3Y', '5Y'].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Test">
                  <select className={inputCls} value={settings.wf_test} onChange={(e) => set('wf_test', e.target.value)}>
                    {['3M', '6M', '1Y'].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
            )}
            <Toggle
              label="Realism stress matrix"
              hint="Re-runs at 1.5x and 2x costs, 1.5x and 2x slippage, extra latency, halved liquidity and randomly missed signals."
              checked={settings.run_stress}
              onChange={(v) => set('run_stress', v)}
            />
            <Toggle
              label="Parameter robustness"
              hint="Perturbs each numeric parameter ±10/20/30% to tell a plateau from a fitted spike."
              checked={settings.run_parameters}
              onChange={(v) => set('run_parameters', v)}
            />
            <Toggle
              label="Baseline controls"
              hint="SMA crossover, momentum, and random-entry controls at the same trade frequency with identical exits and costs."
              checked={settings.run_controls}
              onChange={(v) => set('run_controls', v)}
            />
          </div>
        </details>

        <Note>
          This configuration runs roughly <strong>{estimatedWork} full simulations</strong>
          <Info text="One simulation is a complete bar-by-bar replay of your window. Stress and robustness checks each re-run the whole thing with one assumption changed." />
          {' '}— about {Math.max(5, Math.round(estimatedWork * 0.6))}–{Math.round(estimatedWork * 1.6)} seconds.
        </Note>
      </Section>
    </>
  );
};
