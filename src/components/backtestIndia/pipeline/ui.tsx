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
export const Info: React.FC<{ text: string; glyph?: 'i' | '?' }> = ({ text, glyph = '?' }) => (
  <span className="group relative inline-flex align-middle">
    <button
      type="button"
      tabIndex={0}
      aria-label={text}
      className="ml-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-gray-400 dark:border-gray-500 text-[9px] font-bold leading-none text-gray-500 dark:text-gray-400 transition-colors hover:border-primary-500 hover:text-primary-500"
    >
      {glyph}
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
  <section className="rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-gray-50/60 dark:bg-background-tertiary/30 p-4 sm:p-5">
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h4 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">{title}</h4>
        {hint && (
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
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
          className={`rounded-xl border p-3 text-left transition-all duration-200 ${
            active
              ? 'border-primary-500/70 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 ring-1 ring-primary-500/40'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-background-secondary hover:border-primary-400 hover:-translate-y-px hover:shadow-sm'
          }`}
        >
          <span
            className={`block text-xs font-semibold ${
              active ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-100'
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
  <label className="flex cursor-pointer items-start gap-3 rounded-xl px-1.5 py-2 transition-colors hover:bg-gray-100/70 dark:hover:bg-background-tertiary/50">
    <span className="relative mt-0.5 inline-flex shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="block h-5 w-9 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-200 peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-secondary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-background-secondary" />
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

/** Final drawer width per stage, in px — the strategy graph needs far more
 *  room than the rest. Mirrors the old `sm:max-w-*` Tailwind values, just
 *  expressed as numbers because the entrance below animates real px rects,
 *  not classes. */
const WIDTH_PX: Record<StageMeta['width'], number> = {
  md: 576, // sm:max-w-xl
  lg: 768, // sm:max-w-3xl
  xl: 1024, // sm:max-w-5xl
};

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Where the panel comes to rest: centered on the screen, not pinned to an
 *  edge — computed as a plain rect so it can share a motion timeline with
 *  the card it grows out of. Full-screen on mobile (a centered box would
 *  just be cramped there); a proper margined modal everywhere else. */
function restingRect(width: StageMeta['width']): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = vw < 640;
  const w = mobile ? vw : Math.min(WIDTH_PX[width], vw * 0.92);
  const h = mobile ? vh : Math.min(vh * 0.88, 860);
  return { top: (vh - h) / 2, left: (vw - w) / 2, width: w, height: h };
}

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
  /** The clicked card's on-screen rect (BacktestIndiaPage looks this up by
   *  `[data-stage-card]` right before opening) — the panel animates growing
   *  out of exactly this rect, and shrinking back into it on close, rather
   *  than sliding in from the screen edge. Null falls back to a plain
   *  centered fade/scale so the panel still opens sensibly if the card
   *  couldn't be found (shouldn't normally happen). */
  originRect?: Rect | null;
  children: React.ReactNode;
}> = ({ stage, open, onClose, onBack, onNext, nextLabel, footerNote, onAskAi, originRect, children }) => {
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

  // Computed on every render (cheap) rather than gated on `open` — the
  // AnimatePresence below needs this component to keep rendering through
  // the exit transition even after `open` flips to false, so nothing here
  // can early-return based on `open`.
  const target = restingRect(stage.width);
  const cardShape = originRect
    ? { top: originRect.top, left: originRect.left, width: originRect.width, height: originRect.height, borderRadius: 22 }
    : { top: target.top + target.height * 0.35, left: target.left + target.width * 0.35, width: target.width * 0.3, height: target.height * 0.3, borderRadius: 22, opacity: 0 };
  const restShape = { top: target.top, left: target.left, width: target.width, height: target.height, borderRadius: 22, opacity: 1 };

  return (
    <AnimatePresence>
      {open && (
        <Fragment>
          {/* Above the site header (fixed, z-[100]) so the drawer is not
              clipped by it. */}
          <motion.div
            className="fixed inset-0 z-[110] bg-gray-900/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Grows out of the card that opened it — its own rect on the
              screen (measured just before this mounted) is the starting
              shape, and it settles into the usual right-edge panel; closing
              plays the same motion in reverse, back into the card. */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={stage.title}
            style={{ position: 'fixed' }}
            className="z-[120] flex flex-col overflow-hidden border border-gray-200/70 dark:border-gray-700/50 bg-white/95 dark:bg-background-secondary/95 shadow-[0_28px_80px_-20px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
            initial={cardShape}
            animate={restShape}
            exit={cardShape}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-start gap-4 border-b border-gray-200 dark:border-gray-700/60 px-5 py-5 sm:px-7">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-bold text-white shadow-[0_6px_16px_-4px_rgba(14,165,233,0.5)]">
                {stage.step}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
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
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-secondary-500/30 bg-secondary-500/5 px-2.5 py-1.5 text-[11px] font-semibold text-secondary-700 dark:text-secondary-300 transition-colors hover:bg-secondary-500/10"
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

            <div ref={panelRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
              {children}
            </div>

            <footer className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700/60 bg-gray-50/70 dark:bg-background-tertiary/40 px-5 py-4 sm:px-7">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-white dark:hover:bg-background-secondary"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              <div className="min-w-0 flex-1">{footerNote}</div>
              <button
                type="button"
                onClick={onClose}
                title="Close and return to the pipeline"
                className="rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-white dark:hover:bg-background-secondary"
              >
                Done
              </button>
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(14,165,233,0.5)] transition-all duration-200 hover:shadow-[0_10px_24px_-4px_rgba(14,165,233,0.6)] hover:-translate-y-0.5"
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
