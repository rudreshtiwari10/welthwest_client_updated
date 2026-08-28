/**
 * Presentation kit for the pipeline stage panels.
 *
 * A sliding drawer, plus the small pieces every stage repeats: section
 * headings, preset chips, explain-on-hover tooltips and a friendly toggle.
 */

import React, { Fragment, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StageMeta } from './config';

/* ── Tooltip ─────────────────────────────────────────────────────────── */

/**
 * A hover/focus explainer. Beginners meet a lot of jargon on this page, so
 * anything with a term of art gets one of these rather than a longer label.
 */
export const Info: React.FC<{ text: string }> = ({ text }) => (
  <span className="group relative inline-flex align-middle">
    <button
      type="button"
      tabIndex={0}
      aria-label={text}
      className="ml-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-gray-400 dark:border-gray-500 text-[9px] font-bold leading-none text-gray-500 dark:text-gray-400 transition-colors hover:border-blue-500 hover:text-blue-500"
    >
      ?
    </button>
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-normal normal-case leading-relaxed tracking-normal text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-gray-700"
    >
      {text}
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
    </span>
  </span>
);

/* ── Section ─────────────────────────────────────────────────────────── */

export const Section: React.FC<{
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, hint, right, children }) => (
  <section className="rounded-xl border border-gray-200 dark:border-gray-700/70 bg-gray-50/50 dark:bg-background-tertiary/40 p-4">
    <header className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
        {hint && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
      {right}
    </header>
    {children}
  </section>
);

/* ── Preset chips ────────────────────────────────────────────────────── */

export interface PresetOption {
  key: string;
  label: string;
  /** One line a beginner can act on without knowing the maths. */
  blurb: string;
}

export const PresetRow: React.FC<{
  options: PresetOption[];
  activeKey?: string | null;
  onPick: (key: string) => void;
}> = ({ options, activeKey, onPick }) => (
  <div className="grid gap-2 sm:grid-cols-3">
    {options.map((o) => {
      const active = o.key === activeKey;
      return (
        <button
          key={o.key}
          type="button"
          onClick={() => onPick(o.key)}
          className={`rounded-lg border p-3 text-left transition-all duration-150 ${
            active
              ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-background-secondary hover:border-blue-400 hover:shadow-sm'
          }`}
        >
          <span
            className={`block text-xs font-semibold ${
              active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-100'
            }`}
          >
            {o.label}
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-gray-500 dark:text-gray-400">
            {o.blurb}
          </span>
        </button>
      );
    })}
  </div>
);

/* ── Toggle ──────────────────────────────────────────────────────────── */

export const Toggle: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, hint, checked, onChange }) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-gray-100/70 dark:hover:bg-background-tertiary/60">
    <span className="relative mt-0.5 inline-flex shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="block h-5 w-9 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-background-secondary" />
      <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-4" />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">{label}</span>
      {hint && (
        <span className="mt-0.5 block text-[11px] leading-snug text-gray-500 dark:text-gray-400">
          {hint}
        </span>
      )}
    </span>
  </label>
);

/* ── Stage panel ─────────────────────────────────────────────────────── */

const WIDTH: Record<StageMeta['width'], string> = {
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
};

export const StagePanel: React.FC<{
  stage: StageMeta;
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  /** Rendered between Back and Next — used by Execution for the run button. */
  footerNote?: React.ReactNode;
  /** Shows an "Ask AI" shortcut in the header when provided. */
  onAskAi?: () => void;
  children: React.ReactNode;
}> = ({ stage, open, onClose, onBack, onNext, nextLabel, footerNote, onAskAi, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes; body scroll is frozen while the drawer owns the screen.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // A new stage should start at the top, not wherever the last one was left.
  useEffect(() => {
    if (open) panelRef.current?.scrollTo({ top: 0 });
  }, [open, stage.id]);

  return (
    <AnimatePresence>
      {open && (
        <Fragment>
          {/* Above the site header (fixed, z-[100]) so the drawer is not
              clipped by it. */}
          <motion.div
            className="fixed inset-0 z-[110] bg-gray-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={stage.title}
            className={`fixed inset-y-0 right-0 z-[120] flex w-full flex-col border-l border-gray-200 dark:border-gray-700/70 bg-white dark:bg-background-secondary shadow-2xl ${WIDTH[stage.width]}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <header className="flex items-start gap-4 border-b border-gray-200 dark:border-gray-700/70 px-5 py-4 sm:px-6">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {stage.step}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stage.title}
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {stage.blurb}
                </p>
              </div>
              {onAskAi && (
                <button
                  type="button"
                  onClick={onAskAi}
                  title="Let the assistant fill this from a plain-English description"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 transition-colors hover:bg-violet-500/10"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M12 2.5 13.9 8.1 19.5 10 13.9 11.9 12 17.5 10.1 11.9 4.5 10l5.6-1.9L12 2.5Z" />
                  </svg>
                  Ask AI
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-background-tertiary dark:hover:text-gray-200"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </header>

            <div ref={panelRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              {children}
            </div>

            <footer className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700/70 bg-gray-50/80 dark:bg-background-tertiary/50 px-5 py-3.5 sm:px-6">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-white dark:hover:bg-background-secondary"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              <div className="min-w-0 flex-1">{footerNote}</div>
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {nextLabel || 'Next'}
                </button>
              )}
            </footer>
          </motion.aside>
        </Fragment>
      )}
    </AnimatePresence>
  );
};
