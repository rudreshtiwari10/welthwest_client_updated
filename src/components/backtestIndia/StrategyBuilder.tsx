/**
 * The strategy-graph builder.
 *
 * Every option it renders comes from /api/backtest-india/catalogue, so adding
 * an indicator on the server makes it appear here with no frontend change.
 */

import React, { useMemo, useState } from 'react';
import {
  Catalogue, ConditionNode, Expression, FeatureNode, StrategyGraph,
} from '../../services/backtestIndia';
import { Card, Note, Pill } from './viz';

const inputCls =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-tertiary ' +
  'px-2.5 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 ' +
  'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none';

const labelCls = 'block text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1';

const btnGhost =
  'rounded-md border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs font-medium ' +
  'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-background-tertiary transition-colors';

const btnDanger =
  'rounded-md border border-rose-300 dark:border-rose-800 px-2 py-1 text-xs text-rose-600 ' +
  'dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors';

export const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, hint, children, className = '' }) => (
  <div className={className}>
    <label className={labelCls}>{label}</label>
    {children}
    {hint && <p className="mt-1 text-[11px] leading-snug text-gray-500 dark:text-gray-400">{hint}</p>}
  </div>
);

export { inputCls, labelCls, btnGhost };

/* ── Reference picker ────────────────────────────────────────────────── */

function buildReferences(strategy: StrategyGraph, catalogue: Catalogue): string[] {
  const refs: string[] = ['close', 'open', 'high', 'low', 'volume', 'hl2', 'typical'];
  (strategy.features || []).forEach((f) => {
    const spec = catalogue.indicators.find((i) => i.key === f.type);
    if (!spec) return;
    if (spec.outputs.length === 1) refs.push(f.id);
    else spec.outputs.forEach((o) => refs.push(`${f.id}.${o}`));
  });
  (strategy.candles || []).forEach((c) => refs.push(c.id));
  (strategy.chart_patterns || []).forEach((c) => refs.push(c.id));
  catalogue.structure_outputs.forEach((s) => refs.push(s.key));
  return refs;
}

/* ── Node editors ────────────────────────────────────────────────────── */

const FeatureRow: React.FC<{
  node: FeatureNode;
  catalogue: Catalogue;
  onChange: (n: FeatureNode) => void;
  onRemove: () => void;
}> = ({ node, catalogue, onChange, onRemove }) => {
  const spec = catalogue.indicators.find((i) => i.key === node.type);
  const paramKeys = spec ? Object.keys(spec.params) : [];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700/70 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${inputCls} w-28`}
          value={node.id}
          onChange={(e) => onChange({ ...node, id: e.target.value.replace(/\s+/g, '_') })}
          aria-label="Reference name"
        />
        <select
          className={`${inputCls} w-44`}
          value={node.type}
          onChange={(e) => {
            const s = catalogue.indicators.find((i) => i.key === e.target.value);
            onChange({ id: node.id, type: e.target.value, ...(s ? s.params : {}) });
          }}
        >
          {catalogue.indicators.map((i) => (
            <option key={i.key} value={i.key}>
              {i.label}
            </option>
          ))}
        </select>
        {paramKeys.map((k) => (
          <div key={k} className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{k}</span>
            {k === 'source' ? (
              <select
                className={`${inputCls} w-24`}
                value={String(node[k] ?? 'close')}
                onChange={(e) => onChange({ ...node, [k]: e.target.value })}
              >
                {catalogue.price_sources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                step="any"
                className={`${inputCls} w-20`}
                value={String(node[k] ?? '')}
                onChange={(e) => onChange({ ...node, [k]: Number(e.target.value) })}
              />
            )}
          </div>
        ))}
        <button type="button" className={`${btnDanger} ml-auto`} onClick={onRemove}>
          Remove
        </button>
      </div>
      {spec && (
        <p className="mt-2 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
          {spec.description}
          {spec.outputs.length > 1 && (
            <> Reference its outputs as <code className="font-mono">{spec.outputs.map((o) => `${node.id}.${o}`).join(', ')}</code>.</>
          )}
        </p>
      )}
    </div>
  );
};

const ConditionRow: React.FC<{
  node: ConditionNode;
  refs: string[];
  operators: Catalogue['operators'];
  onChange: (n: ConditionNode) => void;
  onRemove: () => void;
}> = ({ node, refs, operators, onChange, onRemove }) => {
  const needsRight = !['IS_TRUE', 'IS_FALSE', 'RISING', 'FALLING', 'IN_RANGE',
                       'OUT_OF_RANGE', 'PERCENTILE_ABOVE', 'PERCENTILE_BELOW'].includes(node.op);
  const needsBars = ['RISING', 'FALLING', 'SLOPE_ABOVE', 'SLOPE_BELOW'].includes(node.op);
  const needsRange = ['IN_RANGE', 'OUT_OF_RANGE'].includes(node.op);
  const needsPct = ['PERCENTILE_ABOVE', 'PERCENTILE_BELOW'].includes(node.op);

  const OperandInput: React.FC<{ value: any; onSet: (v: any) => void; label: string }> = ({
    value, onSet, label,
  }) => (
    <div className="flex items-center gap-1">
      <input
        className={`${inputCls} w-36`}
        list="bt-refs"
        value={String(value ?? '')}
        placeholder={label}
        onChange={(e) => {
          const raw = e.target.value;
          const asNum = Number(raw);
          onSet(raw !== '' && !isNaN(asNum) && !refs.includes(raw) ? asNum : raw);
        }}
        aria-label={label}
      />
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700/70 p-3">
      <input
        className={`${inputCls} w-28`}
        value={node.id}
        onChange={(e) => onChange({ ...node, id: e.target.value.replace(/\s+/g, '_') })}
        aria-label="Condition name"
      />
      <OperandInput value={node.left} onSet={(v) => onChange({ ...node, left: v })} label="left" />
      <select
        className={`${inputCls} w-44`}
        value={node.op}
        onChange={(e) => onChange({ ...node, op: e.target.value })}
      >
        {operators.comparators.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {needsRight && (
        <OperandInput value={node.right} onSet={(v) => onChange({ ...node, right: v })} label="right" />
      )}
      {needsBars && (
        <input
          type="number"
          className={`${inputCls} w-20`}
          value={node.bars ?? 3}
          onChange={(e) => onChange({ ...node, bars: Number(e.target.value) })}
          aria-label="bars"
        />
      )}
      {needsRange && (
        <>
          <OperandInput value={node.low} onSet={(v) => onChange({ ...node, low: v })} label="low" />
          <OperandInput value={node.high} onSet={(v) => onChange({ ...node, high: v })} label="high" />
        </>
      )}
      {needsPct && (
        <>
          <input
            type="number"
            className={`${inputCls} w-20`}
            value={node.percentile ?? 80}
            onChange={(e) => onChange({ ...node, percentile: Number(e.target.value) })}
            aria-label="percentile"
          />
          <input
            type="number"
            className={`${inputCls} w-20`}
            value={node.window ?? 100}
            onChange={(e) => onChange({ ...node, window: Number(e.target.value) })}
            aria-label="window"
          />
        </>
      )}
      <button type="button" className={`${btnDanger} ml-auto`} onClick={onRemove}>
        Remove
      </button>
    </div>
  );
};

/* ── Expression editor (AND/OR over condition ids) ───────────────────── */

function exprToState(expr: Expression): { op: string; args: string[] } {
  if (!expr) return { op: 'AND', args: [] };
  if (typeof expr === 'string') return { op: 'AND', args: [expr] };
  if (typeof expr === 'object' && Array.isArray(expr.args)) {
    return {
      op: expr.op || 'AND',
      args: expr.args.filter((a): a is string => typeof a === 'string'),
    };
  }
  return { op: 'AND', args: [] };
}

function stateToExpr(state: { op: string; args: string[] }): Expression {
  if (!state.args.length) return null;
  if (state.args.length === 1 && state.op !== 'NOT') return state.args[0];
  return { op: state.op, args: state.args };
}

const ExpressionEditor: React.FC<{
  label: string;
  hint: string;
  expr: Expression;
  conditionIds: string[];
  onChange: (e: Expression) => void;
}> = ({ label, hint, expr, conditionIds, onChange }) => {
  const state = exprToState(expr);
  const complex = expr && typeof expr === 'object' &&
    (expr.args || []).some((a) => typeof a !== 'string');

  if (complex) {
    return (
      <Field label={label} hint="This rule uses a nested or temporal expression that the simple editor cannot represent. It is preserved exactly as loaded.">
        <pre className="max-h-32 overflow-auto rounded-md bg-gray-50 dark:bg-background-tertiary p-2 text-[11px] text-gray-700 dark:text-gray-200">
          {JSON.stringify(expr, null, 2)}
        </pre>
      </Field>
    );
  }

  const toggle = (id: string) => {
    const next = state.args.includes(id)
      ? state.args.filter((a) => a !== id)
      : [...state.args, id];
    onChange(stateToExpr({ ...state, args: next }));
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={`${inputCls} w-24`}
          value={state.op}
          onChange={(e) => onChange(stateToExpr({ ...state, op: e.target.value }))}
        >
          <option value="AND">ALL of</option>
          <option value="OR">ANY of</option>
          <option value="XOR">EXACTLY one</option>
        </select>
        <div className="flex flex-wrap gap-1.5">
          {conditionIds.length === 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Add a condition first.</span>
          )}
          {conditionIds.map((id) => {
            const on = state.args.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  on
                    ? 'border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-background-tertiary'
                }`}
              >
                {id}
              </button>
            );
          })}
        </div>
      </div>
    </Field>
  );
};

/* ── The builder ─────────────────────────────────────────────────────── */

export const StrategyBuilder: React.FC<{
  catalogue: Catalogue;
  strategy: StrategyGraph;
  onChange: (s: StrategyGraph) => void;
}> = ({ catalogue, strategy, onChange }) => {
  const [showJson, setShowJson] = useState(false);
  const refs = useMemo(() => buildReferences(strategy, catalogue), [strategy, catalogue]);
  const conditionIds = (strategy.conditions || []).map((c) => c.id);

  const patch = (p: Partial<StrategyGraph>) => onChange({ ...strategy, ...p });

  const nextId = (prefix: string) => {
    let i = 1;
    // eslint-disable-next-line no-loop-func
    while (refs.includes(`${prefix}${i}`) || conditionIds.includes(`${prefix}${i}`)) i++;
    return `${prefix}${i}`;
  };

  return (
    <div className="space-y-4">
      <datalist id="bt-refs">
        {refs.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      <Card
        title="Indicators"
        subtitle="Each one becomes a named reference you can use in conditions. Multi-output indicators expose every output — MACD gives you macd.macd, macd.signal and macd.hist."
        right={
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              patch({
                features: [
                  ...(strategy.features || []),
                  { id: nextId('ind'), type: 'EMA', period: 20, source: 'close' },
                ],
              })
            }
          >
            + Indicator
          </button>
        }
      >
        <div className="space-y-2">
          {(strategy.features || []).map((f, i) => (
            <FeatureRow
              key={i}
              node={f}
              catalogue={catalogue}
              onChange={(n) => {
                const next = [...(strategy.features || [])];
                next[i] = n;
                patch({ features: next });
              }}
              onRemove={() =>
                patch({ features: (strategy.features || []).filter((_, j) => j !== i) })
              }
            />
          ))}
          {!(strategy.features || []).length && (
            <p className="py-3 text-sm text-gray-500 dark:text-gray-400">
              No indicators yet. A strategy can run on price and structure alone, but most need at least one.
            </p>
          )}
        </div>
      </Card>

      <Card
        title="Candlestick patterns"
        subtitle="Deterministic predicates with editable tolerances — not fuzzy visual labels. Each becomes a true/false reference."
        right={
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              patch({
                candles: [
                  ...(strategy.candles || []),
                  { id: nextId('cdl'), type: 'ENGULFING_BULL' },
                ],
              })
            }
          >
            + Candle
          </button>
        }
      >
        <div className="space-y-2">
          {(strategy.candles || []).map((c, i) => {
            const spec = catalogue.candles.find((k) => k.key === c.type);
            return (
              <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700/70 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className={`${inputCls} w-28`}
                    value={c.id}
                    onChange={(e) => {
                      const next = [...(strategy.candles || [])];
                      next[i] = { ...c, id: e.target.value.replace(/\s+/g, '_') };
                      patch({ candles: next });
                    }}
                  />
                  <select
                    className={`${inputCls} w-56`}
                    value={c.type}
                    onChange={(e) => {
                      const s = catalogue.candles.find((k) => k.key === e.target.value);
                      const next = [...(strategy.candles || [])];
                      next[i] = { id: c.id, type: e.target.value, ...(s ? s.params : {}) };
                      patch({ candles: next });
                    }}
                  >
                    {catalogue.candles.map((k) => (
                      <option key={k.key} value={k.key}>
                        {k.label} ({k.bars}-bar, {k.direction.toLowerCase()})
                      </option>
                    ))}
                  </select>
                  {spec &&
                    Object.keys(spec.params).map((k) => (
                      <div key={k} className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">{k}</span>
                        <input
                          type="number"
                          step="any"
                          className={`${inputCls} w-20`}
                          value={String(c[k] ?? spec.params[k])}
                          onChange={(e) => {
                            const next = [...(strategy.candles || [])];
                            next[i] = { ...c, [k]: Number(e.target.value) };
                            patch({ candles: next });
                          }}
                        />
                      </div>
                    ))}
                  <button
                    type="button"
                    className={`${btnDanger} ml-auto`}
                    onClick={() =>
                      patch({ candles: (strategy.candles || []).filter((_, j) => j !== i) })
                    }
                  >
                    Remove
                  </button>
                </div>
                {spec && (
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{spec.description}</p>
                )}
              </div>
            );
          })}
          {!(strategy.candles || []).length && (
            <p className="py-3 text-sm text-gray-500 dark:text-gray-400">None selected.</p>
          )}
        </div>
      </Card>

      <Card
        title="Chart patterns"
        subtitle="Geometry assembled only from confirmed swing pivots. Each reference fires on the pattern's CONFIRMATION bar — the neckline or boundary break — never at the extreme itself, which is only knowable in hindsight."
        right={
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              patch({
                chart_patterns: [
                  ...(strategy.chart_patterns || []),
                  { id: nextId('pat'), type: 'DOUBLE_BOTTOM' },
                ],
              })
            }
          >
            + Pattern
          </button>
        }
      >
        <div className="space-y-2">
          {(strategy.chart_patterns || []).map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700/70 p-3">
              <input
                className={`${inputCls} w-28`}
                value={c.id}
                onChange={(e) => {
                  const next = [...(strategy.chart_patterns || [])];
                  next[i] = { ...c, id: e.target.value.replace(/\s+/g, '_') };
                  patch({ chart_patterns: next });
                }}
              />
              <select
                className={`${inputCls} w-64`}
                value={c.type}
                onChange={(e) => {
                  const s = catalogue.chart_patterns.find((k) => k.key === e.target.value);
                  const next = [...(strategy.chart_patterns || [])];
                  next[i] = { id: c.id, type: e.target.value, ...(s ? s.params : {}) };
                  patch({ chart_patterns: next });
                }}
              >
                {catalogue.chart_patterns.map((k) => (
                  <option key={k.key} value={k.key}>{k.label}</option>
                ))}
              </select>
              <button
                type="button"
                className={`${btnDanger} ml-auto`}
                onClick={() =>
                  patch({ chart_patterns: (strategy.chart_patterns || []).filter((_, j) => j !== i) })
                }
              >
                Remove
              </button>
            </div>
          ))}
          {!(strategy.chart_patterns || []).length && (
            <p className="py-3 text-sm text-gray-500 dark:text-gray-400">None selected.</p>
          )}
        </div>
      </Card>

      <Card
        title="Conditions"
        subtitle="Comparisons between references and literals. Type a reference name or a plain number in either operand — the field autocompletes from everything you have defined."
        right={
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              patch({
                conditions: [
                  ...(strategy.conditions || []),
                  { id: nextId('cond'), op: '>', left: 'close', right: 0 },
                ],
              })
            }
          >
            + Condition
          </button>
        }
      >
        <div className="space-y-2">
          {(strategy.conditions || []).map((c, i) => (
            <ConditionRow
              key={i}
              node={c}
              refs={refs}
              operators={catalogue.operators}
              onChange={(n) => {
                const next = [...(strategy.conditions || [])];
                next[i] = n;
                patch({ conditions: next });
              }}
              onRemove={() =>
                patch({ conditions: (strategy.conditions || []).filter((_, j) => j !== i) })
              }
            />
          ))}
          {!(strategy.conditions || []).length && (
            <p className="py-3 text-sm text-gray-500 dark:text-gray-400">
              No conditions yet. Add one, then wire it into an entry rule below.
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mr-1">Available references:</span>
          {refs.slice(0, 24).map((r) => (
            <Pill key={r} className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <code className="font-mono">{r}</code>
            </Pill>
          ))}
          {refs.length > 24 && (
            <span className="text-[11px] text-gray-500 dark:text-gray-400">+{refs.length - 24} more</span>
          )}
        </div>
      </Card>

      <Card
        title="Entry and exit rules"
        subtitle="Combine conditions into the signals the engine acts on. A signal generated at a bar's close is never filled at that close — the execution simulator holds it for at least one bar."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ExpressionEditor
            label="Enter long when"
            hint="All selected conditions must hold on the same bar."
            expr={strategy.entry_long ?? null}
            conditionIds={conditionIds}
            onChange={(e) => patch({ entry_long: e })}
          />
          <ExpressionEditor
            label="Exit long when"
            hint="Independent of stops and targets, which are handled by the risk rules."
            expr={strategy.exit_long ?? null}
            conditionIds={conditionIds}
            onChange={(e) => patch({ exit_long: e })}
          />
          <ExpressionEditor
            label="Enter short when"
            hint="Only acted on if short selling is enabled in the run settings."
            expr={strategy.entry_short ?? null}
            conditionIds={conditionIds}
            onChange={(e) => patch({ entry_short: e })}
          />
          <ExpressionEditor
            label="Exit short when"
            hint=""
            expr={strategy.exit_short ?? null}
            conditionIds={conditionIds}
            onChange={(e) => patch({ exit_short: e })}
          />
        </div>
      </Card>

      <Card
        title="Strategy graph (JSON)"
        subtitle="The exact object sent to the engine. Editing it here unlocks nested and temporal operators the visual editor does not cover."
        right={
          <button type="button" className={btnGhost} onClick={() => setShowJson((s) => !s)}>
            {showJson ? 'Hide' : 'Show'}
          </button>
        }
      >
        {showJson && (
          <JsonEditor
            value={strategy}
            onChange={onChange}
            operators={catalogue.operators}
          />
        )}
      </Card>
    </div>
  );
};

const JsonEditor: React.FC<{
  value: StrategyGraph;
  onChange: (s: StrategyGraph) => void;
  operators: Catalogue['operators'];
}> = ({ value, onChange, operators }) => {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  React.useEffect(() => {
    if (!dirty) setText(JSON.stringify(value, null, 2));
  }, [value, dirty]);

  return (
    <div>
      <textarea
        className={`${inputCls} h-72 font-mono text-[11px] leading-relaxed`}
        value={text}
        spellCheck={false}
        onChange={(e) => {
          setText(e.target.value);
          setDirty(true);
          setError('');
        }}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className={btnGhost}
          onClick={() => {
            try {
              onChange(JSON.parse(text));
              setDirty(false);
              setError('');
            } catch (err: any) {
              setError(err.message || 'Invalid JSON');
            }
          }}
        >
          Apply JSON
        </button>
        <button
          type="button"
          className={btnGhost}
          onClick={() => {
            setText(JSON.stringify(value, null, 2));
            setDirty(false);
            setError('');
          }}
        >
          Revert
        </button>
        {error && <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span>}
        {dirty && !error && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Unapplied edits — click Apply JSON.
          </span>
        )}
      </div>
      <Note>
        Temporal operators available in JSON: {operators.temporal.join(', ')}. Example —{' '}
        <code className="font-mono">{'{"op":"AND","args":["trend",{"op":"WITHIN_LAST","bars":5,"args":["pullback"]}]}'}</code>
      </Note>
    </div>
  );
};
