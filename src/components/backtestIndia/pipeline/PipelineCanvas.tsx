/**
 * The pipeline itself — five stages presented as a vertical timeline: a
 * straight central trunk with branches reaching out to alternating
 * left/right cards. Each branch drops from the card's bottom edge, runs
 * straight across, then curves smoothly down into the trunk — like a leaf
 * vein joining the main rib, not a symmetric side-to-side arc.
 *
 * `livePhaseIndex` (optional) is the only thing that changes what's drawn:
 * when null, each branch/trunk piece is simply "lit" or "dim" based on
 * whether that stage's configuration is currently valid. When set (during an
 * actual run), it's the index of the stage currently animating (config.ts):
 * that stage's incoming trunk segment AND its own branch fill at the same
 * time, on the same clock, arriving at their shared junction together —
 * not one waiting for the other. BacktestIndiaPage owns the actual clock;
 * this component only renders whatever phase index it's given.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StageId, StageStatus, STAGES, STAGE_ORDER, RUN_PHASE_DURATION_MS } from './config';

/* ── Icons ───────────────────────────────────────────────────────────── */

export const ICONS: Record<StageId, React.ReactNode> = {
  input: (
    <path d="M3 5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v13.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25Zm4.5 9.75 3-3.75 2.25 2.625 3-4.125" />
  ),
  strategy: (
    <path d="M4.5 6.75a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Zm10.5 10.5a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Zm0-10.5a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 6.75h6m-8.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25H15" />
  ),
  risk: (
    <path d="M11.484 2.17a.75.75 0 0 1 1.032 0 11.2 11.2 0 0 0 7.135 2.913.75.75 0 0 1 .722.75v4.167c0 5.052-3.15 9.37-7.595 11.096a.75.75 0 0 1-.556 0C7.777 19.37 4.627 15.052 4.627 10V5.833a.75.75 0 0 1 .722-.75 11.2 11.2 0 0 0 7.135-2.913ZM12 8.25v3.75m0 3h.008" />
  ),
  sizing: (
    <path d="M3.75 19.5V13.5m5.25 6V9m5.25 10.5V6m5.25 13.5V10.5" />
  ),
  execution: (
    <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.971l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653Z" />
  ),
};

/* ── Status ──────────────────────────────────────────────────────────── */
/* Semantic — incomplete/default/custom carry meaning (like a wizard's step
   state) and stay amber/gray/emerald regardless of brand accent. Only the
   ambient/decorative treatment (glass, glow, active ring) uses the brand
   primary/secondary pair. */

/** 'reviewed' isn't a real StageStatus — it's a presentation-only overlay
 *  for the 'default' case (see StageNode below), so it never touches the
 *  actual grading logic (blockers, run behavior) elsewhere in the app. */
const STATUS_STYLE: Record<StageStatus | 'reviewed', {
  ring: string; dot: string; chip: string; label: string; glow: string;
}> = {
  incomplete: {
    ring: 'border-amber-400/70 dark:border-amber-500/60',
    dot: 'bg-amber-400',
    chip: 'text-amber-700 dark:text-amber-300',
    label: 'Needs attention',
    glow: 'shadow-[0_10px_36px_-12px_rgba(245,158,11,0.35)]',
  },
  default: {
    ring: 'border-gray-200/80 dark:border-gray-700/70',
    dot: 'bg-gray-300 dark:bg-gray-600',
    chip: 'text-gray-500 dark:text-gray-400',
    label: 'Using defaults',
    glow: 'shadow-[0_10px_30px_-14px_rgba(15,23,42,0.18)] dark:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.5)]',
  },
  custom: {
    ring: 'border-emerald-400/70 dark:border-emerald-500/60',
    dot: 'bg-emerald-500',
    chip: 'text-emerald-700 dark:text-emerald-400',
    label: 'Configured',
    glow: 'shadow-[0_10px_36px_-12px_rgba(16,185,129,0.3)]',
  },
  /** Opened, then left without changing anything — different from "never
   *  looked at" (default/gray). Same brand violet as the secondary accent
   *  used everywhere else (Set up with AI, gradients, …). */
  reviewed: {
    ring: 'border-violet-400/70 dark:border-violet-500/60',
    dot: 'bg-violet-500',
    chip: 'text-violet-700 dark:text-violet-300',
    label: 'Reviewed',
    glow: 'shadow-[0_10px_36px_-12px_rgba(139,92,246,0.4)]',
  },
};

export interface StageState {
  status: StageStatus;
  /** Two or three words describing the current setting, shown on the node. */
  summary: string[];
  /** True once this stage's panel has been opened and closed at least once.
   *  Only changes what's shown when status is still 'default' — an
   *  'incomplete' or 'custom' stage displays exactly as before. */
  reviewed?: boolean;
}

type BranchState = 'dormant' | 'processing' | 'done' | 'justDone';
type TrunkState = 'dormant' | 'filling' | 'lit';

/* ── Node ────────────────────────────────────────────────────────────── */

const onSpotlight = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
};

const StageNode: React.FC<{
  id: StageId;
  state: StageState;
  active: boolean;
  index: number;
}> = ({ id, state, active }) => {
  const stage = STAGES[id];
  const displayStatus = state.status === 'default' && state.reviewed ? 'reviewed' : state.status;
  const s = STATUS_STYLE[displayStatus];
  const isRun = id === 'execution';

  return (
    <div
      onMouseMove={onSpotlight}
      style={{ ['--x' as any]: '50%', ['--y' as any]: '50%' }}
      className={`group relative flex w-full max-w-md flex-col overflow-hidden rounded-[1.4rem] border bg-white/80 dark:bg-background-secondary/70 p-6 text-left backdrop-blur-xl ring-1 ring-inset ring-white/60 dark:ring-white/[0.03] transition-[box-shadow,border-color] duration-300 ${
        active
          ? 'border-primary-500/70 shadow-[0_20px_50px_-14px_rgba(14,165,233,0.45)]'
          : `border-transparent ${s.ring} ${s.glow}`
      }`}
    >
      {/* Spotlight that tracks the cursor — visible on hover only */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(220px circle at var(--x) var(--y), rgba(14,165,233,0.10), transparent 70%)',
        }}
      />
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/[0.06] to-secondary-500/[0.06]"
        />
      )}

      <div className="relative flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            isRun
              ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-[0_6px_16px_-4px_rgba(14,165,233,0.5)]'
              : active
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400'
              : 'bg-gray-50 text-gray-500 dark:bg-background-tertiary/60 dark:text-gray-400'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isRun ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            {ICONS[id]}
          </svg>
        </span>

        <span className="flex items-center gap-1.5">
          <span className={`text-[10px] font-medium uppercase tracking-wide ${s.chip}`}>
            {s.label}
          </span>
          <span className="relative flex h-2 w-2">
            {state.status === 'incomplete' && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
          </span>
        </span>
      </div>

      <span className="relative mt-5 flex items-baseline gap-1.5">
        <span className="text-[10px] font-semibold tabular-nums text-gray-400 dark:text-gray-500">
          {stage.step}
        </span>
        <span className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
          {stage.title}
        </span>
      </span>
      <span className="relative mt-1 text-[12px] leading-snug text-gray-500 dark:text-gray-400">
        {stage.tagline}
      </span>

      <span className="relative mt-4 flex flex-wrap gap-1">
        {state.summary.map((t, i) => (
          <span
            key={i}
            className="rounded-md bg-gray-100/80 dark:bg-background-tertiary/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-gray-600 dark:text-gray-300"
          >
            {t}
          </span>
        ))}
      </span>

      <span className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary-500/30 bg-primary-50/80 px-3 py-1.5 text-[11px] font-semibold text-primary-700 transition-colors duration-200 group-hover:border-primary-500/60 group-hover:bg-primary-50 dark:border-primary-500/25 dark:bg-primary-500/10 dark:text-primary-400 dark:group-hover:bg-primary-500/15">
        Configure
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5">
          <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </span>
    </div>
  );
};

/* ── Timeline marker ─────────────────────────────────────────────────── */

const Marker: React.FC<{ status: StageStatus; active: boolean; step: number }> = ({
  status, active, step,
}) => {
  const s = STATUS_STYLE[status];
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-300 ${
        active
          ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-[0_0_0_5px_rgba(14,165,233,0.18)]'
          : status === 'incomplete'
          ? 'border-amber-400/80 bg-white dark:bg-background-secondary text-amber-600 dark:text-amber-400'
          : status === 'custom'
          ? 'border-emerald-400/80 bg-white dark:bg-background-secondary text-emerald-600 dark:text-emerald-400'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-background-secondary text-gray-400 dark:text-gray-500'
      }`}
    >
      {status === 'custom' && !active ? (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4L8 11.6l6.8-6.8a1 1 0 0 1 1.4 0Z" />
        </svg>
      ) : (
        step
      )}
      {active && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-30`} />
      )}
    </motion.span>
  );
};

/* ── Branch — drops from the card's bottom, runs straight to the trunk,
   then curves smoothly down into it, like a leaf vein joining the main rib.
   ────────────────────────────────────────────────────────────────────────
   Rendered in-flow directly under its card (not floating beside the
   marker), so the drop genuinely starts at the card. The wrapper bleeds
   horizontally past the card's own edge (via a negative margin — see
   BRANCH_BLEED in PipelineCanvas) so the run really reaches the trunk
   centerline instead of stopping short of it. */

const DASH = '1 7';
/** Extra breathing room pushed between each card and the gutter, so cards
 *  sit visibly clear of the trunk rather than flush against it. */
const CARD_GAP_REM = 3;
/** How far the branch's SVG box extends past the card's inner edge to
 *  reach the trunk centerline: half the gutter + half the marker column,
 *  plus CARD_GAP_REM since the card (and the branch box anchored to it)
 *  now starts that much further away. */
const BRANCH_BLEED_REM = 7.5 + CARD_GAP_REM;
const BRANCH_HEIGHT_REM = 10.5;

/**
 * The unfilled track is dotted; the fill itself is a solid, glowing
 * blue → sky-blue stroke that grows along the path — a Windows-style
 * install bar, not dots appearing one by one.
 *
 * This deliberately does NOT use Framer Motion's `pathLength`/`animate`
 * mechanism. Two separate problems showed up going through Framer here:
 * first, its `pathLength` prop writes `stroke-dasharray` with a literal
 * "px" unit suffix (e.g. "0.69px 1px") — harmless on a plain 1:1 SVG, but
 * this SVG's viewBox is stretched to a much larger rendered box
 * (`preserveAspectRatio="none"`), and "px" is an ABSOLUTE CSS unit, so the
 * browser drew a fraction-of-a-real-pixel dash (invisible) while the
 * `pathLength="1"` normalization that was supposed to make it relative got
 * silently ignored. Switching to a plain, unitless `strokeDashoffset`
 * animated via Framer's `animate` prop fixed the units but *still* never
 * painted anything — confirmed by inspecting the live DOM mid-animation:
 * the attribute values were numerically correct (dasharray "100 100",
 * dashoffset climbing 100→0 right on schedule) and an isolated static copy
 * of the exact same markup rendered correctly outside React, but the
 * Framer-driven version in this component tree never did. Rather than
 * chase whatever in this render tree Framer's mount detection is tripping
 * over, this draws the line with plain CSS instead: mount hidden
 * (dashoffset = length, no transition), then one double-rAF later flip to
 * dashoffset = 0 with a `transition: stroke-dashoffset` — the standard
 * framework-agnostic "draw an SVG line" technique, verified pixel-by-pixel
 * to actually paint.
 */
const GLOW = { filter: 'drop-shadow(0 0 2px #7dd3fc) drop-shadow(0 0 6px #0ea5e9)' };
/**
 * The fill strokes are a solid color, not a `url(#gradient)` paint-server
 * reference. An actual `<linearGradient>` was tried first — and re-tried
 * with every mounting strategy short of server-rendering it (per-instance
 * defs, defs reordered before their consumer, a handful of static
 * always-mounted defs shared across every fill) — but `stroke="url(#id)"`
 * never painted in this component tree even though the referenced element
 * demonstrably existed with the right id and the browser's own computed
 * style correctly echoed the reference back. Swapping the exact same stroke
 * for this hardcoded color painted correctly on the very first try, so the
 * one-color glow (paired with the two-tone drop-shadow in GLOW above, which
 * IS just CSS and has no such issue) is what's actually shipping.
 */
const FILL_COLOR = '#38bdf8';
/**
 * The branch path's real arc length (user units), measured directly via
 * `path.getTotalLength()` on the exact `d` string below (225.667…, here
 * rounded up a hair for safety) — NOT a generous overestimate. The
 * dash-reveal trick needs this to be >= the true length to fully cover the
 * path, but a much larger value doesn't just "also work": point d along the
 * path becomes visible once the animated offset has decreased by exactly d,
 * so with dasharray/offset driven off a value far bigger than the real
 * length, the path finishes revealing itself long before the animation's
 * own duration is up (measured: a value of 500 here made the branch finish
 * at ~44% of its allotted time and then sit there fully lit, waiting on the
 * trunk for the rest of the phase — exactly the "branch arrives first"
 * symptom reported). Matching this to the true length is what makes the
 * branch and its trunk segment (TRUNK_LENGTH, already exact) complete at
 * the same time.
 */
const BRANCH_LENGTH = 227;

/** Draws `children` (a line/path with `strokeDasharray={length}` already
 *  set) growing from hidden to fully revealed over `durationS`, via a CSS
 *  `stroke-dashoffset` transition — see the note above for why not Framer. */
const DrawnStroke: React.FC<{
  length: number;
  durationS: number;
  animating: boolean;
  renderKey: string;
  children: (dashOffsetStyle: React.CSSProperties) => React.ReactNode;
}> = ({ length, durationS, animating, renderKey, children }) => {
  const [offset, setOffset] = useState(animating ? length : 0);
  useEffect(() => {
    if (!animating) {
      setOffset(0);
      return;
    }
    setOffset(length);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setOffset(0));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderKey, animating, length]);

  return (
    <>
      {children({
        strokeDashoffset: offset,
        transition: animating ? `stroke-dashoffset ${durationS}s linear` : 'none',
      })}
    </>
  );
};

const Branch: React.FC<{ side: 'left' | 'right'; state: BranchState; branchKey: string }> = ({
  side, state, branchKey,
}) => {
  // Drop point (86 / 174 out of the 260-wide viewBox) is the card's actual
  // bottom-CENTER, not an offset toward its inner edge — measured directly
  // against the rendered card+branch-wrapper geometry (card ~328px,
  // wrapper ~496px once BRANCH_BLEED_REM is added, so center-of-card falls
  // at ~33% of the wrapper's width = 0.33 * 260 ≈ 86). The long straight
  // run (86→234 / 174→26, i.e. most of the box) is what actually closes
  // the now-larger gap between the card and the trunk.
  const path =
    side === 'left'
      ? 'M86,0 L86,28 C86,41 92,45 106,45 L234,45 C248,45 260,53 260,68'
      : 'M174,0 L174,28 C174,41 168,45 154,45 L26,45 C12,45 0,53 0,68';
  const reversePath =
    side === 'left'
      ? 'M260,68 C260,53 248,45 234,45 L106,45 C92,45 86,41 86,28 L86,0'
      : 'M0,68 C0,53 12,45 26,45 L154,45 C168,45 174,41 174,28 L174,0';
  const lit = state === 'processing' || state === 'done' || state === 'justDone';
  const durationS = state === 'processing' ? RUN_PHASE_DURATION_MS / 1000 : 0;

  return (
    <svg
      viewBox="0 0 260 100"
      preserveAspectRatio="none"
      className="h-full w-full overflow-visible"
      aria-hidden
    >
      {/* base track — always present, dotted, dims once the fill covers it */}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={DASH} strokeLinecap="round" className="text-gray-300 dark:text-gray-600" opacity={lit ? 0.2 : 0.7} />
      {lit && (
        <DrawnStroke
          length={BRANCH_LENGTH}
          durationS={durationS}
          animating={state === 'processing'}
          renderKey={`${branchKey}-${state}`}
        >
          {(dashStyle) => (
            <path
              d={path}
              fill="none"
              stroke={FILL_COLOR}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={BRANCH_LENGTH}
              style={{ ...GLOW, ...dashStyle }}
            />
          )}
        </DrawnStroke>
      )}
      {/* bright leading dot at the head of the fill while processing */}
      {state === 'processing' && (
        <circle r="4" fill="#7dd3fc" style={GLOW}>
          <animateMotion dur={`${durationS}s`} fill="freeze" path={path} />
        </circle>
      )}
      {/* one-shot light returning card → trunk the moment this stage completes */}
      {state === 'justDone' && (
        <circle r="4.4" fill="#7c3aed" style={GLOW}>
          <animateMotion dur="0.6s" keyPoints="0;1" keyTimes="0;1" path={reversePath} />
        </circle>
      )}
    </svg>
  );
};

/* ── Trunk fill — a straight vertical spine segment, dot-preserving ────── */

/** The line always spans y=0 to y=100 in its own viewBox, so its length in
 *  user units is exactly 100 — no need to estimate. See BRANCH_LENGTH above
 *  for why this is animated via plain strokeDashoffset, not Framer's
 *  `pathLength` prop. */
const TRUNK_LENGTH = 100;

const TrunkFill: React.FC<{ state: TrunkState; segKey: string }> = ({ state, segKey }) => {
  const durationS = state === 'filling' ? RUN_PHASE_DURATION_MS / 1000 : 0;
  return (
    <svg viewBox="0 0 12 100" preserveAspectRatio="none" className="h-full w-3" aria-hidden>
      {/* base track — always present, dotted */}
      <line
        x1="6" y1="0" x2="6" y2="100"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={DASH}
        className={state !== 'dormant' ? 'text-primary-500/20' : 'text-gray-300 dark:text-gray-600'}
      />
      {/* fill — solid, glowing, grows top-to-bottom */}
      {state !== 'dormant' && (
        <DrawnStroke
          length={TRUNK_LENGTH}
          durationS={durationS}
          animating={state === 'filling'}
          renderKey={`${segKey}-${state}`}
        >
          {(dashStyle) => (
            <line
              x1="6" y1="0" x2="6" y2="100"
              stroke={FILL_COLOR}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={TRUNK_LENGTH}
              style={{ ...GLOW, ...dashStyle }}
            />
          )}
        </DrawnStroke>
      )}
      {state === 'filling' && (
        <circle r="3.6" fill="#7dd3fc" style={GLOW}>
          <animateMotion dur={`${durationS}s`} fill="freeze" path="M6,0 L6,100" />
        </circle>
      )}
    </svg>
  );
};

/* ── Canvas ──────────────────────────────────────────────────────────── */

export const PipelineCanvas: React.FC<{
  states: Record<StageId, StageState>;
  activeStage: StageId | null;
  onOpen: (id: StageId) => void;
  /** Index of the stage currently animating (config.ts) — set while a run
   *  is in flight. Null renders the static configured/incomplete styling. */
  livePhaseIndex?: number | null;
}> = ({ states, activeStage, onOpen, livePhaseIndex = null }) => {
  const running = livePhaseIndex !== null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-gray-200/80 dark:border-gray-700/50 bg-white/60 dark:bg-background-secondary/30 p-6 sm:p-12">
      {/* Technical grid — the "circuit board" backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          color: '#0ea5e9',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)',
        }}
      />
      {/* Ambient depth — soft brand-colored glow orbs, matching the rest of the site */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br from-primary-200/40 to-secondary-200/30 dark:from-primary-900/20 dark:to-secondary-900/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-gradient-to-tr from-secondary-200/30 to-primary-200/20 dark:from-secondary-900/15 dark:to-primary-900/10 blur-3xl"
      />

      <div className="relative mb-8 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
        <span className="h-px w-6 bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600" />
        Simulation pipeline
        <span className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Entry point into the guided flow — opens stage 1, and the
            existing Back/Next wiring on each StagePanel (BacktestIndiaPage)
            carries the user through every stage in order, ending on
            Execution's own "Review and run" footer. */}
        <div className="relative z-10 mb-8 flex justify-center">
          <button
            type="button"
            onClick={() => onOpen(STAGE_ORDER[0])}
            className="group inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-white/90 dark:bg-background-secondary/90 px-5 py-2.5 text-sm font-semibold text-primary-700 dark:text-primary-300 shadow-[0_8px_24px_-8px_rgba(14,165,233,0.35)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500/50 hover:shadow-[0_10px_28px_-6px_rgba(14,165,233,0.45)]"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10 2a1.5 1.5 0 0 1 1.5 1.5v.55a6.47 6.47 0 0 1 1.83.76l.39-.39a1.5 1.5 0 1 1 2.12 2.12l-.39.39c.36.56.63 1.18.76 1.83h.55a1.5 1.5 0 0 1 0 3h-.55a6.47 6.47 0 0 1-.76 1.83l.39.39a1.5 1.5 0 1 1-2.12 2.12l-.39-.39a6.47 6.47 0 0 1-1.83.76v.55a1.5 1.5 0 0 1-3 0v-.55a6.47 6.47 0 0 1-1.83-.76l-.39.39a1.5 1.5 0 1 1-2.12-2.12l.39-.39a6.47 6.47 0 0 1-.76-1.83h-.55a1.5 1.5 0 0 1 0-3h.55c.13-.65.4-1.27.76-1.83l-.39-.39a1.5 1.5 0 1 1 2.12-2.12l.39.39A6.47 6.47 0 0 1 8.5 4.05V3.5A1.5 1.5 0 0 1 10 2Zm0 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" clipRule="evenodd" />
            </svg>
            Configure the pipeline
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5">
              <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        {STAGE_ORDER.map((id, i) => {
          const isLeft = i % 2 === 0;
          const state = states[id];
          const stage = STAGES[id];
          const isOpen = activeStage === id;

          /* Stage i's branch and its incoming trunk segment (the lead-in
             stub, for i=0) are driven by the SAME index — they fill at the
             same time, on the same clock, so they always arrive at their
             shared junction together. Every line starts and stays dotted
             until a run is actually in flight — whether a stage happens to
             be at its default settings or has been edited has nothing to do
             with whether the engine has run; that distinction already lives
             on the card itself (its "Using defaults"/"Configured" chip). */
          const branchState: BranchState = !running
            ? 'dormant'
            : livePhaseIndex! > i
            ? (livePhaseIndex === i + 1 ? 'justDone' : 'done')
            : livePhaseIndex === i
            ? 'processing'
            : 'dormant';

          const markerActive = isOpen || branchState === 'processing';

          const inTrunkState: TrunkState = !running
            ? 'dormant'
            : livePhaseIndex! > i
            ? 'lit'
            : livePhaseIndex === i
            ? 'filling'
            : 'dormant';

          return (
            <div
              key={id}
              data-stage-row={id}
              className="grid grid-cols-[2.25rem_1fr] sm:grid-cols-[1fr_3rem_1fr] gap-x-3 sm:gap-x-24"
            >
              {/* Marker column — stretches to the row's full height (grid's
                  default align-items:stretch), so the top filler always
                  spans exactly from the previous marker to this one. */}
              <div className="col-start-1 sm:col-start-2 flex flex-col items-center">
                <div className="w-3 flex-1 flex justify-center pb-1">
                  <TrunkFill state={inTrunkState} segKey={`${id}-in`} />
                </div>
                <Marker status={state.status} active={markerActive} step={stage.step} />
              </div>

              {/* Card column — the branch is rendered in-flow directly under
                  the card, so it genuinely starts at the card's bottom
                  edge, then bleeds sideways (negative margin) to reach the
                  trunk centerline. CARD_GAP_REM pushes the card (and the
                  branch box anchored to it, which moves with it) clear of
                  the gutter via `transform`, not margin — combining a fixed
                  opposing margin with a 100%-width flush-aligned box over-
                  constrains the CSS box model (width + both margins can't
                  all be satisfied), which silently produces a negative
                  auto-margin and throws the whole positioning off by
                  exactly the gap amount. `transform` happens after layout,
                  so it can't hit that. BRANCH_BLEED_REM already accounts
                  for this extra distance so the branch still reaches all
                  the way in. */}
              <div
                className={`col-start-2 sm:row-start-1 w-full max-w-md ${
                  // sm:-translate-x-12 / sm:translate-x-12 is CARD_GAP_REM
                  // (3rem) as a static Tailwind class — Tailwind's JIT
                  // scanner needs a literal class name, so this can't be
                  // generated from the constant; keep the two in sync if
                  // CARD_GAP_REM changes.
                  isLeft
                    ? 'sm:col-start-1 sm:ml-auto sm:-translate-x-12'
                    : 'sm:col-start-3 sm:mr-auto sm:translate-x-12'
                }`}
              >
                <motion.button
                  type="button"
                  data-stage-card={id}
                  onClick={() => onOpen(id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.09, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.985 }}
                  className="block w-full text-left"
                >
                  <StageNode id={id} index={i} state={state} active={isOpen} />
                </motion.button>
                <div
                  aria-hidden
                  className="relative hidden sm:block"
                  style={{
                    height: `${BRANCH_HEIGHT_REM}rem`,
                    width: `calc(100% + ${BRANCH_BLEED_REM}rem)`,
                    ...(isLeft
                      ? { marginRight: `-${BRANCH_BLEED_REM}rem` }
                      : { marginLeft: `-${BRANCH_BLEED_REM}rem` }),
                  }}
                >
                  <Branch side={isLeft ? 'left' : 'right'} state={branchState} branchKey={id} />
                </div>
              </div>
            </div>
          );
        })}

        {/* End of the line — jumps straight to the Execution panel, whether
            or not every stage has been visited; that panel already shows
            whatever's still blocking a run. */}
        <div className="relative z-10 mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => onOpen('execution')}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(14,165,233,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-6px_rgba(14,165,233,0.6)]"
          >
            Review and run
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5">
              <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
