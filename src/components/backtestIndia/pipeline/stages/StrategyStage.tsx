/**
 * Stage 2 — Strategy.
 *
 * Server presets first, the full graph builder underneath. A beginner picks a
 * preset and leaves; anyone who wants to can open the builder and edit every
 * indicator, pattern, condition and rule it produced.
 */

import React, { useState } from 'react';
import { Catalogue, PresetSummary, StrategyGraph } from '../../../../services/backtestIndia';
import { Field, StrategyBuilder, inputCls } from '../../StrategyBuilder';
import { Note } from '../../viz';
import { Info, Section } from '../ui';

export const StrategyStage: React.FC<{
  catalogue: Catalogue;
  strategy: StrategyGraph;
  onChangeStrategy: (s: StrategyGraph) => void;
  strategyName: string;
  setStrategyName: (s: string) => void;
  onLoadPreset: (key: string) => void;
  /** Which server preset was loaded last, so the card can show as selected. */
  activePresetKey: string | null;
  problems: string[];
}> = ({
  catalogue, strategy, onChangeStrategy, strategyName, setStrategyName,
  onLoadPreset, activePresetKey, problems,
}) => {
  const [showBuilder, setShowBuilder] = useState(false);

  const counts = [
    { n: (strategy.features || []).length, label: 'indicators' },
    { n: (strategy.candles || []).length, label: 'candle patterns' },
    { n: (strategy.chart_patterns || []).length, label: 'chart patterns' },
    { n: (strategy.conditions || []).length, label: 'conditions' },
  ];

  return (
    <>
      <Section
        title="Start from a proven pattern"
        hint="Each preset is a complete, working strategy. Load one and you are done — or load one and edit it below."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {catalogue.presets.map((p: PresetSummary) => {
            const active = p.key === activePresetKey;
            return (
              // A <div> with button semantics, not a real <button> — the
              // info trigger below is itself a real button, and a button
              // can't legally nest inside another one.
              <div
                key={p.key}
                role="button"
                tabIndex={0}
                onClick={() => onLoadPreset(p.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onLoadPreset(p.key);
                  }
                }}
                className={`cursor-pointer rounded-lg border p-3 text-left transition-all duration-150 ${
                  active
                    ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-background-secondary hover:border-primary-400 hover:shadow-sm'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={`flex items-center text-xs font-semibold ${
                      active ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {p.name}
                    <span onClick={(e) => e.stopPropagation()}>
                      <Info glyph="i" text={`${p.summary} ${p.expectation}`} />
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {active && (
                      <span className="flex items-center gap-1 rounded bg-primary-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:text-primary-300">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5">
                          <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4L8 11.6l6.8-6.8a1 1 0 0 1 1.4 0Z" />
                        </svg>
                        Selected
                      </span>
                    )}
                    <span className="rounded bg-gray-100 dark:bg-background-tertiary px-1.5 py-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                      {p.features} signals
                    </span>
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Name this strategy" hint="Shown on the results page and in your run history.">
        <Field label="Strategy name">
          <input
            className={inputCls}
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
          />
        </Field>
      </Section>

      <Section
        title="What this strategy currently does"
        hint="A summary of the graph the engine will run."
        right={
          <button
            type="button"
            onClick={() => setShowBuilder((v) => !v)}
            className="shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors hover:border-primary-400 hover:text-primary-600"
          >
            {showBuilder ? 'Hide advanced editor' : 'Edit the rules'}
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {counts.map((c) => (
            <div
              key={c.label}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-secondary px-3 py-2"
            >
              <div className="text-lg font-semibold tabular-nums text-gray-900 dark:text-white">
                {c.n}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {!strategy.entry_long && !strategy.entry_short && (
          <Note tone="warn">
            No entry rule is set, so the engine has nothing to act on. Load a preset above, or open
            the editor and define one.
          </Note>
        )}

        {!!problems.length && (
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              The strategy graph needs fixing:
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-amber-700 dark:text-amber-300">
              {problems.map((p, i) => <li key={i}>— {p}</li>)}
            </ul>
          </div>
        )}

        {!showBuilder && (
          <p className="mt-3 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            Happy with a preset? You can close this panel and move on — everything below is
            optional.
          </p>
        )}
      </Section>

      {showBuilder && (
        <div className="space-y-4 border-t border-dashed border-gray-300 dark:border-gray-600 pt-4">
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Indicators become named references. Conditions compare those references. Entry and exit
            rules combine conditions into the signals the engine acts on.
          </p>
          <StrategyBuilder catalogue={catalogue} strategy={strategy} onChange={onChangeStrategy} />
        </div>
      )}
    </>
  );
};
