/**
 * The AI assistant that fills the pipeline.
 *
 * Three steps: a short interview, a wait, then a proposal the user reviews and
 * either applies or discards. It never writes into the builder on its own —
 * applying goes through exactly the same setters the manual controls use, so
 * anything it fills can then be edited by hand.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AiFillResult, AiQuestion, Catalogue, backtestIndiaService,
} from '../../../services/backtestIndia';
import { inputCls } from '../StrategyBuilder';

type Phase = 'interview' | 'thinking' | 'review' | 'error';

export const AiFillModal: React.FC<{
  open: boolean;
  onClose: () => void;
  catalogue: Catalogue;
  onApply: (r: AiFillResult) => void;
}> = ({ open, onClose, catalogue, onApply }) => {
  const [questions, setQuestions] = useState<AiQuestion[] | null>(null);
  const [available, setAvailable] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [phase, setPhase] = useState<Phase>('interview');
  const [result, setResult] = useState<AiFillResult | null>(null);
  const [error, setError] = useState('');
  const [symbolDraft, setSymbolDraft] = useState('');

  useEffect(() => {
    if (!open || questions) return;
    backtestIndiaService
      .aiInterview()
      .then((r) => {
        setQuestions(r.questions);
        setAvailable(r.available);
        const seed: Record<string, any> = {};
        r.questions.forEach((q) => {
          if (q.default !== undefined) seed[q.key] = q.default;
        });
        setAnswers((a) => ({ ...seed, ...a }));
      })
      .catch((e) => {
        setError(e.message || 'Could not reach the assistant.');
        setPhase('error');
      });
  }, [open, questions]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const missing = useMemo(
    () => (questions || []).filter((q) => q.required && !answers[q.key]).map((q) => q.key),
    [questions, answers]
  );

  const ask = async () => {
    setPhase('thinking');
    setError('');
    try {
      const r = await backtestIndiaService.aiFill(answers);
      setResult(r);
      setPhase('review');
    } catch (e: any) {
      setError(e.message || 'The assistant could not build a configuration.');
      setPhase('error');
    }
  };

  const reset = () => {
    setPhase('interview');
    setResult(null);
    setError('');
  };

  const set = (k: string, v: any) => setAnswers((a) => ({ ...a, [k]: v }));

  const addSymbol = (s: string) => {
    const v = s.trim().toUpperCase();
    if (!v) return;
    const cur: string[] = answers.symbols || [];
    if (cur.includes(v) || cur.length >= 8) return;
    set('symbols', [...cur, v]);
    setSymbolDraft('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* The site header is fixed at z-[100], so anything modal must clear
              it — both in stacking order and in vertical space. */}
          <motion.div
            className="fixed inset-0 z-[110] bg-gray-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} onClick={onClose} aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Set up with AI"
            className="fixed inset-x-0 top-20 z-[120] mx-auto flex max-h-[calc(100vh-6rem)] w-[calc(100%-1.5rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-background-secondary shadow-2xl sm:top-24 sm:max-h-[calc(100vh-8rem)]"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <header className="flex items-start gap-3 border-b border-gray-200 dark:border-gray-700/70 px-5 py-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                  <path d="M12 2.5 13.9 8.1 19.5 10 13.9 11.9 12 17.5 10.1 11.9 4.5 10l5.6-1.9L12 2.5ZM18.5 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6ZM5.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Set up with AI
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  Answer a few questions in plain English. The assistant fills every stage, then
                  checks its own work actually generates trades before showing it to you.
                </p>
              </div>
              <button
                type="button" onClick={onClose} aria-label="Close"
                className="-mr-1 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-background-tertiary dark:hover:text-gray-200"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {!available && phase === 'interview' && (
                <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
                  No AI provider is configured on the server, so the assistant cannot run. The
                  manual builder works as normal.
                </div>
              )}

              {phase === 'interview' && questions && (
                <div className="space-y-5">
                  {questions.map((q) => (
                    <div key={q.key}>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white">
                        {q.question}
                        {!q.required && (
                          <span className="ml-1.5 text-[11px] font-normal text-gray-400">
                            optional
                          </span>
                        )}
                      </label>
                      {q.hint && (
                        <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                          {q.hint}
                        </p>
                      )}

                      <div className="mt-2">
                        {q.type === 'text' && (
                          <textarea
                            rows={3}
                            className={`${inputCls} resize-y`}
                            placeholder={q.placeholder}
                            value={answers[q.key] || ''}
                            onChange={(e) => set(q.key, e.target.value)}
                          />
                        )}

                        {q.type === 'number' && (
                          <input
                            type="number"
                            className={inputCls}
                            value={answers[q.key] ?? ''}
                            onChange={(e) => set(q.key, Number(e.target.value))}
                          />
                        )}

                        {q.type === 'choice' && (
                          <div className="flex flex-wrap gap-1.5">
                            {(q.options || []).map((o) => {
                              const on = answers[q.key] === o.value;
                              return (
                                <button
                                  key={o.value}
                                  type="button"
                                  onClick={() => set(q.key, o.value)}
                                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                    on
                                      ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400'
                                  }`}
                                >
                                  {o.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'symbols' && (
                          <>
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              {(answers.symbols || []).map((s: string) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                                >
                                  {s}
                                  <button
                                    type="button"
                                    aria-label={`Remove ${s}`}
                                    onClick={() =>
                                      set('symbols', (answers.symbols || []).filter((x: string) => x !== s))
                                    }
                                    className="text-blue-400 hover:text-rose-500"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                            <input
                              className={inputCls}
                              list="ai-universe"
                              placeholder="Type a symbol and press Enter, or leave empty"
                              value={symbolDraft}
                              onChange={(e) => setSymbolDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addSymbol(symbolDraft);
                                }
                              }}
                            />
                            <datalist id="ai-universe">
                              {catalogue.universe.map((u) => (
                                <option key={u.symbol} value={u.symbol}>{u.name}</option>
                              ))}
                            </datalist>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {phase === 'interview' && !questions && !error && (
                <div className="py-12 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}

              {phase === 'thinking' && <Thinking />}

              {phase === 'error' && (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                    The assistant could not finish
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    {error}
                  </p>
                </div>
              )}

              {phase === 'review' && result && <Proposal result={result} />}
            </div>

            <footer className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700/70 bg-gray-50/80 dark:bg-background-tertiary/50 px-5 py-3.5">
              {phase === 'review' || phase === 'error' ? (
                <>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-white dark:hover:bg-background-secondary"
                  >
                    {phase === 'error' ? 'Back' : 'Change my answers'}
                  </button>
                  <div className="flex-1" />
                  {phase === 'review' && result && (
                    <button
                      type="button"
                      onClick={() => { onApply(result); onClose(); }}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Apply to pipeline
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="flex-1 text-[11px] text-gray-500 dark:text-gray-400">
                    {missing.length
                      ? 'Answer the required questions to continue.'
                      : 'Nothing is changed until you review and accept.'}
                  </p>
                  <button
                    type="button"
                    onClick={ask}
                    disabled={!available || phase === 'thinking' || !!missing.length}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {phase === 'thinking' ? 'Working…' : 'Build my pipeline'}
                  </button>
                </>
              )}
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Waiting ─────────────────────────────────────────────────────────── */

const STEPS = [
  'Reading your answers',
  'Choosing indicators and rules',
  'Dry-running it against real market data',
  'Loosening the rules if it found too few trades',
];

const Thinking: React.FC = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="py-10">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      <ul className="mx-auto mt-6 max-w-xs space-y-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-2 text-xs transition-colors duration-500 ${
              i <= step ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                i < step ? 'bg-emerald-500' : i === step ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
            {s}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-[11px] text-gray-500 dark:text-gray-400">
        This usually takes 15–40 seconds.
      </p>
    </div>
  );
};

/* ── Proposal ────────────────────────────────────────────────────────── */

const STAGE_LABEL: Record<string, string> = {
  input: '1. Input',
  strategy: '2. Strategy',
  risk: '3. Risk Management',
  sizing: '4. Position Sizing',
};

const Proposal: React.FC<{ result: AiFillResult }> = ({ result }) => {
  const signals = result.signals_found;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {result.strategy_name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {result.explanation}
        </p>
      </div>

      {/* The number that matters: did it actually produce trades? */}
      <div
        className={`rounded-xl border p-4 ${
          signals === null
            ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-background-tertiary'
            : signals >= 8
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-amber-500/40 bg-amber-500/5'
        }`}
      >
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-semibold tabular-nums ${
              signals === null
                ? 'text-gray-500'
                : signals >= 8
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {signals === null ? '—' : signals}
          </span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
            entry signals found on a real dry run
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          {signals === null
            ? 'The check could not run, so this is unverified. Run the backtest to find out.'
            : signals >= 8
            ? 'Enough activity to draw a conclusion from. This is the check that catches a strategy which never trades.'
            : 'Fewer than we would like. The result may be too thin to read — consider widening the date range.'}
        </p>
      </div>

      {!!result.warnings.length && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
          <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
            {result.warnings.map((w, i) => <li key={i}>— {w}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        {Object.entries(STAGE_LABEL).map(([key, label]) => {
          const note = result.stage_notes?.[key];
          if (!note) return null;
          return (
            <div
              key={key}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-background-tertiary/40 px-3 py-2.5"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {label}
              </div>
              <div className="mt-0.5 text-xs leading-relaxed text-gray-700 dark:text-gray-200">
                {note}
              </div>
            </div>
          );
        })}
      </div>

      <details>
        <summary className="cursor-pointer list-none text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
          See the exact rules it wrote
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-tertiary p-3 text-[11px] leading-relaxed text-gray-700 dark:text-gray-200">
{JSON.stringify(result.strategy, null, 2)}
        </pre>
      </details>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        Applying this fills every stage. You can still edit any of it by hand afterwards —
        nothing is locked.
      </p>
    </div>
  );
};
