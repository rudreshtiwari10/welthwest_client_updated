/**
 * Backtest India — WelthWest Realistic Hybrid Backtesting Engine (v2).
 *
 * Rendered at /backtest — the only backtesting page. The old Beta page,
 * its engine (services/backtesting_engine.py), and its API endpoints were
 * retired in favor of this one.
 *
 * The page presents the run as a five-stage pipeline. This file owns all of
 * the state and builds the request; the pipeline components are presentation
 * only, and the payload sent to the engine is byte-for-byte what it was.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import {
  AiFillResult, BacktestReport, Catalogue, RunRequest, StrategyGraph, backtestIndiaService,
} from '../services/backtestIndia';
import { ResultsView } from '../components/backtestIndia/ResultsView';
import { Card, Pill } from '../components/backtestIndia/viz';

import {
  DEFAULT_SETTINGS, DEFAULT_STRATEGY, RunSettings, StageId, StageStatus,
  STAGES, STAGE_ORDER, sameAsDefault, RUN_PHASE_DURATION_MS, RUN_PHASE_TOTAL_MS,
  activeStageForPhase,
} from '../components/backtestIndia/pipeline/config';
import { PipelineCanvas, StageState } from '../components/backtestIndia/pipeline/PipelineCanvas';
import { RunProgress } from '../components/backtestIndia/pipeline/RunProgress';
import { PageIntro } from '../components/backtestIndia/pipeline/PageIntro';
import { ResultsTransition } from '../components/backtestIndia/pipeline/ResultsTransition';
import { StagePanel } from '../components/backtestIndia/pipeline/ui';
import { InputStage } from '../components/backtestIndia/pipeline/stages/InputStage';
import { StrategyStage } from '../components/backtestIndia/pipeline/stages/StrategyStage';
import { RiskStage, RISK_PRESETS } from '../components/backtestIndia/pipeline/stages/RiskStage';
import { SizingStage } from '../components/backtestIndia/pipeline/stages/SizingStage';
import { ExecutionStage } from '../components/backtestIndia/pipeline/stages/ExecutionStage';
import { AiFillModal } from '../components/backtestIndia/pipeline/AiFillModal';

/* ── Page ────────────────────────────────────────────────────────────── */

const BacktestIndiaPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [catalogueError, setCatalogueError] = useState('');
  const [settings, setSettings] = useState<RunSettings>(DEFAULT_SETTINGS);
  const [strategy, setStrategy] = useState<StrategyGraph>(DEFAULT_STRATEGY);
  const [strategyName, setStrategyName] = useState('Custom strategy');
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [view, setView] = useState<'builder' | 'results'>('builder');
  const [symbolInput, setSymbolInput] = useState('');

  /* Pipeline-only state. Neither of these reaches the request. */
  const [activeStage, setActiveStage] = useState<StageId | null>(null);
  // DEFAULT_STRATEGY (config.ts) is the engine's own worked example, and is
  // byte-for-byte the "ema_trend_pullback" server preset — starting this as
  // that key (instead of null) means the matching card shows as selected
  // from the very first render, rather than looking like nothing is chosen
  // even though a real strategy is already loaded.
  const [presetKey, setPresetKey] = useState<string | null>('ema_trend_pullback');
  const [showAi, setShowAi] = useState(false);

  /* The on-screen rect of whichever card a stage panel is opening from, so
     the panel can visibly grow out of it (StagePanel) instead of just
     sliding in from the edge, and shrink back into it on close. Looked up
     by data-stage-card right before opening — see openStage below — rather
     than passed from the click event, so every path that opens a panel
     (a card's own Configure button, the "Configure the pipeline" and
     "Review and run" shortcuts, Back/Next between stages, AI apply, a
     failed run reopening Execution) gets the same animation for free. */
  const [originRect, setOriginRect] = useState<{
    top: number; left: number; width: number; height: number;
  } | null>(null);
  const openStage = useCallback((id: StageId | null) => {
    if (id) {
      const el = document.querySelector(`[data-stage-card="${id}"]`);
      setOriginRect(el ? el.getBoundingClientRect() : null);
    }
    setActiveStage(id);
  }, []);

  /* Which stages the user has opened at least once — drives the "Reviewed"
     (violet) card state below, for a stage that was looked at and left
     alone rather than never opened at all. Tracked off activeStage itself
     (not inside openStage) so every path that opens a panel is covered
     uniformly, including Back/Next between stages, which intentionally
     bypass openStage (see its own comment) and call setActiveStage
     directly. Only matters while a stage's settings still equal the
     default — see stageStates below — so this never overrides an actual
     "Configured" (edited) stage. */
  const [visitedStages, setVisitedStages] = useState<Set<StageId>>(new Set());
  useEffect(() => {
    if (!activeStage) return;
    setVisitedStages((prev) => (prev.has(activeStage) ? prev : new Set(prev).add(activeStage)));
  }, [activeStage]);

  /** Set once the assistant's proposal is accepted, so the page can say so. */
  const [aiApplied, setAiApplied] = useState<AiFillResult | null>(null);

  /* Purely cosmetic — plays once whenever this page mounts (i.e. whenever the
     user navigates here). Never gates data loading; the real content mounts
     underneath it immediately. */
  const [showIntro, setShowIntro] = useState(true);

  /* Purely cosmetic — plays once a run finishes, covering the screen before
     the view swaps from the pipeline to the results (see run(), below). */
  const [showResultsTransition, setShowResultsTransition] = useState(false);

  /* Purely cosmetic — steps through the five stages, one per
     RUN_PHASE_DURATION_MS, while `run()` is in flight, so waiting reads as
     the engine visibly moving down the trunk and out to each card, rather
     than a spinner. It never reads or writes settings/strategy/report and
     has no bearing on what gets sent to the engine or what comes back.
     Monotonic — holds at the last phase once reached, rather than looping,
     since a real run can take longer than the full sequence and looping
     would replay already-"done" branches' animations. `run()` (below) waits
     for this full sequence to finish before showing a successful result, so
     the choreography is never cut short by a fast backend response. */
  const [livePhaseIndex, setLivePhaseIndex] = useState(0);
  useEffect(() => {
    if (!running) {
      setLivePhaseIndex(0);
      return;
    }
    let idx = 0;
    let timerId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      if (idx >= STAGE_ORDER.length) return;
      timerId = setTimeout(() => {
        idx += 1;
        setLivePhaseIndex(idx);
        scheduleNext();
      }, RUN_PHASE_DURATION_MS);
    };
    scheduleNext();
    return () => clearTimeout(timerId);
  }, [running]);

  /* Follow the pipeline as it runs: every time the animation moves to a new
     phase, scroll whichever stage row is currently filling into view, so the
     working part of the pipeline stays visible all the way to the end
     instead of only being shown once at the start.
     This can't fire inline inside run() — the execution drawer (StagePanel)
     locks document.body.style.overflow while open, and closing it
     (setActiveStage(null), called just before run() awaits anything) only
     releases that lock in the drawer's own effect cleanup, which runs after
     this render commits. Scrolling before that lock lifts is a no-op, so the
     very first scroll (like every later one) is deferred one animation
     frame to guarantee the lock is already gone. */
  useEffect(() => {
    if (!running) return;
    const stageId = activeStageForPhase(livePhaseIndex);
    const id = requestAnimationFrame(() => {
      document
        .querySelector(`[data-stage-row="${stageId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, [running, livePhaseIndex]);

  useEffect(() => {
    document.title = 'Backtest India — WelthWest';
  }, []);

  useEffect(() => {
    backtestIndiaService
      .catalogue()
      .then(setCatalogue)
      .catch((e) => setCatalogueError(e.message || 'Could not load the strategy catalogue.'));
  }, []);

  const set = useCallback(<K extends keyof RunSettings>(k: K, v: RunSettings[K]) => {
    setSettings((s) => ({ ...s, [k]: v }));
  }, []);

  const patch = useCallback((p: Partial<RunSettings>) => {
    setSettings((s) => ({ ...s, ...p }));
  }, []);

  const loadPreset = async (key: string) => {
    if (!key) return;
    try {
      const preset = await backtestIndiaService.preset(key);
      setStrategy(preset.strategy);
      setStrategyName(preset.name);
      setSettings((s) => ({ ...s, sizing: preset.sizing, risk: { ...s.risk, ...preset.risk } }));
      setPresetKey(key);
      setProblems([]);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Could not load that preset.');
    }
  };

  /**
   * Write an accepted AI proposal into the builder.
   *
   * Everything lands through the same state the manual controls write to, so
   * the result is indistinguishable from having typed it in — and remains
   * fully editable afterwards. Only keys the assistant actually set are
   * touched; the rest keep their current values.
   */
  const applyAiFill = (r: AiFillResult) => {
    setStrategy(r.strategy);
    setStrategyName(r.strategy_name);
    setPresetKey(null);
    setSettings((s) => ({
      ...s,
      ...r.settings,
      risk: { ...s.risk, ...(r.settings.risk || {}) },
      sizing: r.settings.sizing ? { ...r.settings.sizing } : s.sizing,
      execution: { ...s.execution, ...(r.settings.execution || {}) },
    }));
    setAiApplied(r);
    setProblems([]);
    setError('');
  };

  const addSymbol = (sym: string) => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setSettings((prev) =>
      prev.symbols.includes(s) || prev.symbols.length >= 8
        ? prev
        : { ...prev, symbols: [...prev.symbols, s] }
    );
    setSymbolInput('');
  };

  const buildRequest = (): RunRequest => ({
    symbols: settings.symbols,
    start: settings.start,
    end: settings.end,
    timeframe: settings.timeframe,
    strategy,
    strategy_name: strategyName,
    initial_capital: settings.initial_capital,
    sizing: settings.sizing,
    max_concurrent_positions: settings.max_concurrent_positions,
    max_position_weight: settings.max_position_weight,
    allow_short: settings.allow_short,
    risk: settings.risk,
    execution: settings.execution,
    intrabar_policy: settings.intrabar_policy,
    cost_schedule: settings.cost_schedule,
    validation: settings.walk_forward
      ? { enabled: true, train: settings.wf_train, test: settings.wf_test }
      : { enabled: false },
    benchmark: settings.benchmark,
    diagnostics: { bootstrap: true, monte_carlo: true, controls: settings.run_controls },
    robustness: { stress: settings.run_stress, parameters: settings.run_parameters, max_variants: 8 },
    seed: settings.seed,
  });

  const run = async () => {
    setError('');
    setProblems([]);

    const check = await backtestIndiaService.validate(strategy).catch(() => null);
    if (check && !check.valid) {
      setProblems(check.problems);
      openStage('execution');
      return;
    }
    if (!settings.symbols.length) {
      setError('Add at least one instrument.');
      openStage('execution');
      return;
    }

    setRunning(true);
    // Close the drawer so the run-progress animation on the main page is
    // actually visible instead of sitting hidden behind it. Reopened to
    // 'execution' in the catch block below on failure, so every existing
    // error/login/quota message still surfaces exactly where it did before —
    // this only changes when the drawer is visually open, not what it shows.
    setActiveStage(null);
    try {
      // Wait for whichever finishes last: the real response, or the full
      // choreography (config.ts) — a fast backend response never cuts the
      // animation short. A failure below is unaffected: Promise.all rejects
      // as soon as the request itself rejects, without waiting on the timer.
      const [result] = await Promise.all([
        backtestIndiaService.run(buildRequest()),
        new Promise((resolve) => setTimeout(resolve, RUN_PHASE_TOTAL_MS)),
      ]);
      setReport(result);
      // The transition wipes the whole screen before the results view ever
      // appears — same visual language as the page-entry transition. Wait
      // for the cover half of its animation (see ResultsTransition) before
      // actually swapping the view underneath it, so the swap itself is
      // never visible — results seem to grow out of the wipe.
      setShowResultsTransition(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      openStage('execution');
      if (e.status === 401) {
        setShowLogin(true);
      } else if (e.status === 403) {
        setError(e.payload?.message || 'This feature is not available on your plan.');
      } else if (e.status === 429) {
        setError(e.payload?.message || 'You have used your backtest quota for today.');
      } else {
        setError(e.message || 'The backtest could not be completed.');
      }
    } finally {
      setRunning(false);
    }
  };

  const estimatedWork = useMemo(() => {
    let passes = 1;
    if (settings.run_stress) passes += 10;
    if (settings.run_parameters) passes += 8;
    if (settings.run_controls) passes += 5;
    if (settings.walk_forward) passes += 12;
    return passes;
  }, [settings]);

  /* ── Anything that would stop a run ────────────────────────────────── */

  const blockers = useMemo(() => {
    const out: string[] = [];
    if (!settings.symbols.length) out.push('Add at least one instrument in Input.');
    if (settings.start >= settings.end) out.push('The start date must fall before the end date.');
    if (!strategy.entry_long && !strategy.entry_short) {
      out.push('The strategy has no entry rule, so the engine has nothing to act on.');
    }
    return out;
  }, [settings.symbols, settings.start, settings.end, strategy]);

  /* ── Node states ───────────────────────────────────────────────────── */

  const stageStates = useMemo((): Record<StageId, StageState> => {
    const d = DEFAULT_SETTINGS;
    const tfLabel = catalogue?.timeframes.find((t) => t.key === settings.timeframe)?.label
      || settings.timeframe;

    const inputTouched =
      !sameAsDefault(settings.symbols, d.symbols) ||
      settings.start !== d.start || settings.end !== d.end ||
      settings.timeframe !== d.timeframe || settings.benchmark !== d.benchmark ||
      settings.initial_capital !== d.initial_capital || settings.seed !== d.seed ||
      settings.walk_forward !== d.walk_forward || settings.wf_train !== d.wf_train ||
      settings.wf_test !== d.wf_test || settings.run_stress !== d.run_stress ||
      settings.run_parameters !== d.run_parameters || settings.run_controls !== d.run_controls;

    const strategyTouched =
      !sameAsDefault(strategy, DEFAULT_STRATEGY) || strategyName !== 'Custom strategy';

    const riskTouched = !sameAsDefault(settings.risk, d.risk);

    const sizingTouched =
      !sameAsDefault(settings.sizing, d.sizing) ||
      settings.max_concurrent_positions !== d.max_concurrent_positions ||
      settings.max_position_weight !== d.max_position_weight ||
      settings.allow_short !== d.allow_short ||
      settings.cost_schedule !== d.cost_schedule ||
      settings.intrabar_policy !== d.intrabar_policy ||
      !sameAsDefault(settings.execution, d.execution);

    const grade = (bad: boolean, touched: boolean): StageStatus =>
      bad ? 'incomplete' : touched ? 'custom' : 'default';

    const years = Math.max(
      1,
      Math.round(
        (new Date(settings.end).getTime() - new Date(settings.start).getTime()) / 31557600000
      )
    );

    const riskPreset = RISK_PRESETS.find((p) => sameAsDefault(p.risk, settings.risk));
    const sizingLabel = catalogue?.sizing_models.find((m) => m.key === settings.sizing.model)?.label
      || settings.sizing.model;

    return {
      input: {
        status: grade(!settings.symbols.length || settings.start >= settings.end, inputTouched),
        reviewed: visitedStages.has('input'),
        summary: [
          settings.symbols.length
            ? `${settings.symbols.length} instrument${settings.symbols.length > 1 ? 's' : ''}`
            : 'No instruments',
          `${years}Y`,
          tfLabel,
        ],
      },
      strategy: {
        status: grade(!strategy.entry_long && !strategy.entry_short, strategyTouched),
        reviewed: visitedStages.has('strategy'),
        summary: [
          `${(strategy.features || []).length} indicators`,
          `${(strategy.conditions || []).length} conditions`,
        ],
      },
      risk: {
        status: grade(false, riskTouched),
        reviewed: visitedStages.has('risk'),
        summary: [
          riskPreset ? riskPreset.label : 'Custom',
          settings.risk.stop_type === 'percent'
            ? `${settings.risk.stop_percent}% stop`
            : `${settings.risk.stop_atr_multiple}× ATR stop`,
        ],
      },
      sizing: {
        status: grade(false, sizingTouched),
        reviewed: visitedStages.has('sizing'),
        summary: [sizingLabel, `${settings.max_concurrent_positions} max open`],
      },
      execution: {
        status: blockers.length ? 'incomplete' : report ? 'custom' : 'default',
        reviewed: visitedStages.has('execution'),
        summary: [
          `~${estimatedWork} simulations`,
          blockers.length ? 'Blocked' : report ? 'Run complete' : 'Ready',
        ],
      },
    };
  }, [settings, strategy, strategyName, catalogue, blockers, report, estimatedWork, visitedStages]);

  /* ── Panel navigation ──────────────────────────────────────────────── */

  const idx = activeStage ? STAGE_ORDER.indexOf(activeStage) : -1;
  // Deliberately setActiveStage, not openStage: Back/Next move between two
  // already-open panels, and each stage's card sits in a different spot in
  // the alternating pipeline layout. Re-anchoring originRect to the new
  // stage's card on every Back/Next would make the outgoing panel shrink
  // toward one card while the incoming one grows from a different one,
  // simultaneously, in two different places on screen. Leaving originRect
  // alone keeps the whole guided walk anchored to wherever it started, so
  // consecutive stages morph in place instead of jumping around the page.
  const goPrev = idx > 0 ? () => setActiveStage(STAGE_ORDER[idx - 1]) : undefined;
  const goNext =
    idx >= 0 && idx < STAGE_ORDER.length - 1
      ? () => setActiveStage(STAGE_ORDER[idx + 1])
      : undefined;

  /* ── Early returns ─────────────────────────────────────────────────── */

  if (catalogueError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <motion.div {...fadeUp(0)}>
          <Card title="Backtest India is unavailable">
            <p className="text-sm text-gray-600 dark:text-gray-300">{catalogueError}</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">Loading the strategy catalogue…</p>
      </div>
    );
  }

  const ready = !blockers.length;

  return (
    <div className="mx-auto max-w-[100rem] px-3 py-8 sm:px-6 sm:py-12">
      <PageIntro show={showIntro} onDone={() => setShowIntro(false)} />
      <ResultsTransition show={showResultsTransition} onDone={() => setShowResultsTransition(false)} />
      <PageHeader catalogue={catalogue} />

      <nav className="mt-10 flex gap-1 border-b border-gray-200 dark:border-gray-700/70">
        {(['builder', 'results'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            disabled={v === 'results' && !report}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
              view === v
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {v === 'builder' ? 'Pipeline' : report ? `Results — ${report.confidence.label}` : 'Results'}
          </button>
        ))}
      </nav>

      {view === 'results' && report ? (
        <div className="mt-5">
          <ResultsView report={report} />
        </div>
      ) : (
        <div className="mt-7 space-y-6">
          <motion.div {...fadeUp(0)} className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Build your pipeline
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Five stages, left to right. Fill them in yourself, or let the assistant do it from
                a plain-English description — you can edit anything either way.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setShowAi(true)}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-secondary-600 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(124,58,237,0.5)] transition-all duration-200 hover:shadow-[0_10px_28px_-6px_rgba(124,58,237,0.6)] hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45">
                  <path d="M12 2.5 13.9 8.1 19.5 10 13.9 11.9 12 17.5 10.1 11.9 4.5 10l5.6-1.9L12 2.5ZM18.5 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6ZM5.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
                </svg>
                Set up with AI
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {aiApplied && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-start gap-3 rounded-xl border border-secondary-500/25 bg-gradient-to-r from-secondary-500/[0.06] to-primary-500/[0.06] px-4 py-3.5 backdrop-blur-sm">
                  <span className="mt-0.5 text-secondary-600 dark:text-secondary-400" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 2.5 13.9 8.1 19.5 10 13.9 11.9 12 17.5 10.1 11.9 4.5 10l5.6-1.9L12 2.5Z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-secondary-800 dark:text-secondary-300">
                      The assistant filled this pipeline — "{aiApplied.strategy_name}"
                      {aiApplied.signals_found !== null &&
                        ` · ${aiApplied.signals_found} entry signals on a dry run`}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-secondary-700/80 dark:text-secondary-400/80">
                      {aiApplied.explanation}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiApplied(null)}
                    aria-label="Dismiss"
                    className="shrink-0 text-secondary-400 transition-colors hover:text-secondary-700"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {running && (
            <div className="mb-5">
              <RunProgress phaseIndex={livePhaseIndex} />
            </div>
          )}
          <PipelineCanvas
            states={stageStates}
            activeStage={activeStage}
            onOpen={openStage}
            livePhaseIndex={running ? livePhaseIndex : null}
          />

          {catalogue.open_access && (
            <motion.p
              {...fadeUp(0.3)}
              className="rounded-full border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-center text-[11px] text-amber-700 dark:text-amber-300"
            >
              Sign-in is disabled on this page while it is being built — runs are unauthenticated
              and unmetered.
            </motion.p>
          )}
        </div>
      )}

      {/* ── Stage panels ──────────────────────────────────────────────── */}

      <StagePanel
        stage={STAGES.input}
        originRect={originRect}
        onAskAi={() => { setActiveStage(null); setShowAi(true); }}
        open={activeStage === 'input'}
        onClose={() => setActiveStage(null)}
        onNext={goNext}
        nextLabel="Next — Strategy"
      >
        <InputStage
          catalogue={catalogue}
          settings={settings}
          set={set}
          patch={patch}
          symbolInput={symbolInput}
          setSymbolInput={setSymbolInput}
          addSymbol={addSymbol}
          estimatedWork={estimatedWork}
        />
      </StagePanel>

      <StagePanel
        stage={STAGES.strategy}
        originRect={originRect}
        onAskAi={() => { setActiveStage(null); setShowAi(true); }}
        open={activeStage === 'strategy'}
        onClose={() => setActiveStage(null)}
        onBack={goPrev}
        onNext={goNext}
        nextLabel="Next — Risk"
      >
        <StrategyStage
          catalogue={catalogue}
          strategy={strategy}
          onChangeStrategy={(s) => {
            setStrategy(s);
            setPresetKey(null);
          }}
          strategyName={strategyName}
          setStrategyName={setStrategyName}
          onLoadPreset={loadPreset}
          activePresetKey={presetKey}
          problems={problems}
        />
      </StagePanel>

      <StagePanel
        stage={STAGES.risk}
        originRect={originRect}
        onAskAi={() => { setActiveStage(null); setShowAi(true); }}
        open={activeStage === 'risk'}
        onClose={() => setActiveStage(null)}
        onBack={goPrev}
        onNext={goNext}
        nextLabel="Next — Sizing"
      >
        <RiskStage catalogue={catalogue} settings={settings} set={set} />
      </StagePanel>

      <StagePanel
        stage={STAGES.sizing}
        originRect={originRect}
        onAskAi={() => { setActiveStage(null); setShowAi(true); }}
        open={activeStage === 'sizing'}
        onClose={() => setActiveStage(null)}
        onBack={goPrev}
        onNext={goNext}
        nextLabel="Next — Execution"
      >
        <SizingStage catalogue={catalogue} settings={settings} set={set} />
      </StagePanel>

      <StagePanel
        stage={STAGES.execution}
        originRect={originRect}
        open={activeStage === 'execution'}
        onClose={() => setActiveStage(null)}
        onBack={goPrev}
        footerNote={
          <button
            type="button"
            onClick={run}
            disabled={running || !ready}
            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(14,165,233,0.5)] transition-all duration-200 hover:shadow-[0_10px_24px_-4px_rgba(14,165,233,0.6)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {running ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Running the simulation…
              </span>
            ) : (
              'Run backtest'
            )}
          </button>
        }
      >
        <ExecutionStage
          catalogue={catalogue}
          settings={settings}
          strategy={strategy}
          strategyName={strategyName}
          estimatedWork={estimatedWork}
          blockers={blockers}
          problems={problems}
          error={error}
          onEdit={setActiveStage}
        />
        {!catalogue.open_access && !isAuthenticated && (
          <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">
            You will be asked to sign in before the run starts.
          </p>
        )}
      </StagePanel>

      <AiFillModal
        open={showAi}
        onClose={() => setShowAi(false)}
        catalogue={catalogue}
        onApply={applyAiFill}
      />

      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          title="Sign in to run a backtest"
          message="Backtesting runs against live market data and is metered per account."
          onLoginSuccess={() => {
            setShowLogin(false);
            run();
          }}
        />
      )}
    </div>
  );
};

/* ── Header ──────────────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
});

const PageHeader: React.FC<{ catalogue: Catalogue }> = ({ catalogue }) => {
  const [showAbout, setShowAbout] = useState(false);
  return (
    <header className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-16 -z-10 h-56 w-56 rounded-full bg-gradient-to-br from-primary-200/40 to-secondary-200/30 dark:from-primary-900/25 dark:to-secondary-900/15 blur-3xl"
      />

      <motion.div {...fadeUp(0)} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-600 dark:from-white dark:via-white dark:to-gray-400 bg-clip-text text-[26px] font-bold tracking-tight text-transparent sm:text-3xl">
            Backtest India
          </h1>
          <Pill className="border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 text-primary-700 dark:text-primary-400 font-semibold tracking-wide">
            Engine v{catalogue.engine_version}
          </Pill>
        </div>

        <button
          type="button"
          onClick={() => setShowAbout((s) => !s)}
          aria-expanded={showAbout}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 transition-colors hover:border-primary-400 hover:text-primary-600"
        >
          {showAbout ? 'Hide details' : 'What is this engine?'}
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className={`h-3 w-3 transition-transform duration-200 ${showAbout ? 'rotate-180' : ''}`}
          >
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      </motion.div>

      <motion.p {...fadeUp(0.06)} className="mt-1.5 max-w-2xl text-[13px] leading-snug text-gray-500 dark:text-gray-400">
        Realism level 3 — OHLCV + spread + participation + latency. An event-driven research
        simulator, not an indicator scorer.
      </motion.p>

      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-gray-50/60 dark:bg-background-tertiary/30 p-4 sm:p-5">
              <p className="max-w-3xl text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                It will happily tell you a strategy failed, and explain which assumption killed
                it. Signals become orders, orders become fills through a latency queue and a
                participation cap, and every rupee of Indian transaction cost is traced back to
                an individual fill.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {catalogue.principles.slice(0, 5).map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700/70 bg-white/70 dark:bg-background-secondary/50 px-3 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default BacktestIndiaPage;
