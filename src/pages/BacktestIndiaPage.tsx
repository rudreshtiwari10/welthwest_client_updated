/**
 * Backtest India — WelthWest Realistic Hybrid Backtesting Engine (v2).
 *
 * A separate page from /backtesting-beta, backed by a separate API surface.
 * The old page and its engine are untouched.
 *
 * The page presents the run as a five-stage pipeline. This file owns all of
 * the state and builds the request; the pipeline components are presentation
 * only, and the payload sent to the engine is byte-for-byte what it was.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import {
  AiFillResult, BacktestReport, Catalogue, RunRequest, StrategyGraph, backtestIndiaService,
} from '../services/backtestIndia';
import { ResultsView } from '../components/backtestIndia/ResultsView';
import { Card, Pill } from '../components/backtestIndia/viz';

import {
  DEFAULT_SETTINGS, DEFAULT_STRATEGY, RunSettings, StageId, StageStatus,
  STAGES, STAGE_ORDER, sameAsDefault,
} from '../components/backtestIndia/pipeline/config';
import { PipelineCanvas, StageState } from '../components/backtestIndia/pipeline/PipelineCanvas';
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
  const [presetKey, setPresetKey] = useState<string | null>(null);
  const [showAi, setShowAi] = useState(false);
  /** Set once the assistant's proposal is accepted, so the page can say so. */
  const [aiApplied, setAiApplied] = useState<AiFillResult | null>(null);

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
      setActiveStage('execution');
      return;
    }
    if (!settings.symbols.length) {
      setError('Add at least one instrument.');
      setActiveStage('execution');
      return;
    }

    setRunning(true);
    try {
      const result = await backtestIndiaService.run(buildRequest());
      setReport(result);
      setActiveStage(null);
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
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
        summary: [
          `${(strategy.features || []).length} indicators`,
          `${(strategy.conditions || []).length} conditions`,
        ],
      },
      risk: {
        status: grade(false, riskTouched),
        summary: [
          riskPreset ? riskPreset.label : 'Custom',
          settings.risk.stop_type === 'percent'
            ? `${settings.risk.stop_percent}% stop`
            : `${settings.risk.stop_atr_multiple}× ATR stop`,
        ],
      },
      sizing: {
        status: grade(false, sizingTouched),
        summary: [sizingLabel, `${settings.max_concurrent_positions} max open`],
      },
      execution: {
        status: blockers.length ? 'incomplete' : report ? 'custom' : 'default',
        summary: [
          `~${estimatedWork} simulations`,
          blockers.length ? 'Blocked' : report ? 'Run complete' : 'Ready',
        ],
      },
    };
  }, [settings, strategy, strategyName, catalogue, blockers, report, estimatedWork]);

  /* ── Panel navigation ──────────────────────────────────────────────── */

  const idx = activeStage ? STAGE_ORDER.indexOf(activeStage) : -1;
  const goPrev = idx > 0 ? () => setActiveStage(STAGE_ORDER[idx - 1]) : undefined;
  const goNext =
    idx >= 0 && idx < STAGE_ORDER.length - 1
      ? () => setActiveStage(STAGE_ORDER[idx + 1])
      : undefined;

  /* ── Early returns ─────────────────────────────────────────────────── */

  if (catalogueError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card title="Backtest India is unavailable">
          <p className="text-sm text-gray-600 dark:text-gray-300">{catalogueError}</p>
        </Card>
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading the strategy catalogue…</p>
      </div>
    );
  }

  const ready = !blockers.length;

  return (
    <div className="mx-auto max-w-[100rem] px-3 py-6 sm:px-6">
      <PageHeader catalogue={catalogue} />

      <nav className="mt-6 flex gap-1 border-b border-gray-200 dark:border-gray-700/70">
        {(['builder', 'results'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            disabled={v === 'results' && !report}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
              view === v
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Build your pipeline
              </h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Five stages, left to right. Fill them in yourself, or let the assistant do it from
                a plain-English description — you can edit anything either way.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowAi(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2.5 13.9 8.1 19.5 10 13.9 11.9 12 17.5 10.1 11.9 4.5 10l5.6-1.9L12 2.5ZM18.5 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6ZM5.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
                </svg>
                Set up with AI
              </button>
              <button
                type="button"
                onClick={() => setActiveStage(ready ? 'execution' : 'input')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors hover:border-blue-400 hover:text-blue-600"
              >
                {ready ? 'Review and run →' : 'Fill it in myself →'}
              </button>
            </div>
          </div>

          {aiApplied && (
            <div className="flex flex-wrap items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-3">
              <span className="mt-0.5 text-violet-600 dark:text-violet-400" aria-hidden>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2.5 13.9 8.1 19.5 10 13.9 11.9 12 17.5 10.1 11.9 4.5 10l5.6-1.9L12 2.5Z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-violet-800 dark:text-violet-300">
                  The assistant filled this pipeline — “{aiApplied.strategy_name}”
                  {aiApplied.signals_found !== null &&
                    ` · ${aiApplied.signals_found} entry signals on a dry run`}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-violet-700/80 dark:text-violet-400/80">
                  {aiApplied.explanation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiApplied(null)}
                aria-label="Dismiss"
                className="shrink-0 text-violet-400 transition-colors hover:text-violet-700"
              >
                ×
              </button>
            </div>
          )}

          <PipelineCanvas
            states={stageStates}
            activeStage={activeStage}
            onOpen={setActiveStage}
          />

          {catalogue.open_access && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-center text-[11px] text-amber-700 dark:text-amber-300">
              Sign-in is disabled on this page while it is being built — runs are unauthenticated
              and unmetered.
            </p>
          )}
        </div>
      )}

      {/* ── Stage panels ──────────────────────────────────────────────── */}

      <StagePanel
        stage={STAGES.input}
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
        open={activeStage === 'execution'}
        onClose={() => setActiveStage(null)}
        onBack={goPrev}
        footerNote={
          <button
            type="button"
            onClick={run}
            disabled={running || !ready}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? 'Running the simulation…' : 'Run backtest'}
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

const PageHeader: React.FC<{ catalogue: Catalogue }> = ({ catalogue }) => (
  <header>
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
        Backtest India
      </h1>
      <Pill className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
        Engine v{catalogue.engine_version}
      </Pill>
      <Pill className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
        Realism level 3 — OHLCV + spread + participation + latency
      </Pill>
    </div>
    <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
      An event-driven research simulator, not an indicator scorer. It will happily tell you a
      strategy failed, and explain which assumption killed it. Signals become orders, orders
      become fills through a latency queue and a participation cap, and every rupee of Indian
      transaction cost is traced back to an individual fill.
    </p>
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
      {catalogue.principles.slice(0, 5).map((p, i) => (
        <li key={i} className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-blue-500" aria-hidden />
          {p}
        </li>
      ))}
    </ul>
  </header>
);

export default BacktestIndiaPage;
