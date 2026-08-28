/**
 * The pipeline itself — five stages a user clicks through, left to right.
 *
 * This is the whole page at first glance: no inputs, just the shape of the
 * simulation and where each stage currently stands.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { StageId, StageStatus, STAGES, STAGE_ORDER } from './config';

/* ── Icons ───────────────────────────────────────────────────────────── */

const ICONS: Record<StageId, React.ReactNode> = {
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

const STATUS_STYLE: Record<StageStatus, {
  ring: string; dot: string; chip: string; label: string;
}> = {
  incomplete: {
    ring: 'border-amber-400/70 dark:border-amber-500/60',
    dot: 'bg-amber-400',
    chip: 'text-amber-700 dark:text-amber-300',
    label: 'Needs attention',
  },
  default: {
    ring: 'border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-300 dark:bg-gray-600',
    chip: 'text-gray-500 dark:text-gray-400',
    label: 'Using defaults',
  },
  custom: {
    ring: 'border-emerald-400/70 dark:border-emerald-500/60',
    dot: 'bg-emerald-500',
    chip: 'text-emerald-700 dark:text-emerald-400',
    label: 'Configured',
  },
};

export interface StageState {
  status: StageStatus;
  /** Two or three words describing the current setting, shown on the node. */
  summary: string[];
}

/* ── Node ────────────────────────────────────────────────────────────── */

const StageNode: React.FC<{
  id: StageId;
  state: StageState;
  active: boolean;
  index: number;
  onOpen: () => void;
}> = ({ id, state, active, index, onOpen }) => {
  const stage = STAGES[id];
  const s = STATUS_STYLE[state.status];
  const isRun = id === 'execution';

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`${stage.title} — ${s.label}. ${stage.tagline}.`}
      className={`group relative flex w-full flex-col rounded-2xl border-2 bg-white dark:bg-background-secondary p-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-lg lg:w-[13.5rem] ${
        active ? 'border-blue-500 ring-2 ring-blue-500/30' : s.ring
      } ${isRun ? 'lg:w-[15rem]' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
            isRun
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isRun ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
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

      <span className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
          {stage.step}
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{stage.title}</span>
      </span>
      <span className="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
        {stage.tagline}
      </span>

      <span className="mt-3 flex flex-wrap gap-1">
        {state.summary.map((t, i) => (
          <span
            key={i}
            className="rounded-md bg-gray-100 dark:bg-background-tertiary px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300"
          >
            {t}
          </span>
        ))}
      </span>

      <span className="mt-3 text-[11px] font-medium text-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-blue-400">
        {isRun ? 'Review and run →' : 'Configure →'}
      </span>
    </motion.button>
  );
};

/* ── Connector ───────────────────────────────────────────────────────── */

/**
 * The link between two nodes. It only animates once the upstream stage is
 * usable, so the flow visibly "fills in" as the pipeline is completed.
 */
const Connector: React.FC<{ live: boolean; index: number }> = ({ live, index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.07 + 0.15 }}
    className="flex shrink-0 items-center justify-center py-1 lg:py-0"
    aria-hidden
  >
    {/* Horizontal on desktop */}
    <svg viewBox="0 0 40 12" className="hidden h-3 w-10 lg:block" fill="none">
      <line
        x1="0" y1="6" x2="31" y2="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="5 4"
        className={live ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}
      >
        {live && (
          <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.1s" repeatCount="indefinite" />
        )}
      </line>
      <path
        d="M30 2.5 35.5 6 30 9.5Z"
        fill="currentColor"
        className={live ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}
      />
    </svg>

    {/* Vertical on mobile */}
    <svg viewBox="0 0 12 32" className="h-8 w-3 lg:hidden" fill="none">
      <line
        x1="6" y1="0" x2="6" y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="5 4"
        className={live ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}
      >
        {live && (
          <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.1s" repeatCount="indefinite" />
        )}
      </line>
      <path
        d="M2.5 22 6 27.5 9.5 22Z"
        fill="currentColor"
        className={live ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}
      />
    </svg>
  </motion.div>
);

/* ── Canvas ──────────────────────────────────────────────────────────── */

export const PipelineCanvas: React.FC<{
  states: Record<StageId, StageState>;
  activeStage: StageId | null;
  onOpen: (id: StageId) => void;
}> = ({ states, activeStage, onOpen }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-700/70 bg-gradient-to-b from-gray-50/80 to-white dark:from-background-tertiary/30 dark:to-background-secondary/40 p-4 sm:p-6">
    <div className="flex flex-col items-stretch lg:flex-row lg:items-stretch lg:justify-center lg:gap-0 lg:overflow-x-auto lg:pb-1">
      {STAGE_ORDER.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && (
            <Connector
              index={i}
              live={states[STAGE_ORDER[i - 1]].status !== 'incomplete'}
            />
          )}
          <StageNode
            id={id}
            index={i}
            state={states[id]}
            active={activeStage === id}
            onOpen={() => onOpen(id)}
          />
        </React.Fragment>
      ))}
    </div>
  </div>
);
