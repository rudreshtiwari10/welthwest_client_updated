/**
 * Slim status readout shown above the pipeline while a run is in flight.
 * The actual progress visualization lives on the pipeline timeline itself
 * (PipelineCanvas's `livePhaseIndex` prop, driven by the same per-stage
 * clock) — this is just the textual "what's happening / how long has it
 * taken" companion to that, so both always agree on what's going on.
 *
 * The backend reports no per-stage telemetry — one `run()` call either
 * succeeds or fails. This text walks through the five stages on a fixed,
 * deliberately slow clock the page owns; it carries no claim about literal
 * backend progress percentage.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RUN_PHASE_TOTAL_MS, STAGE_ORDER, StageId } from './config';

const STATUS_LINES: Record<StageId, string> = {
  input: 'Loading instrument history…',
  strategy: 'Evaluating the strategy graph…',
  risk: 'Resolving stops and targets bar by bar…',
  sizing: 'Sizing positions and applying costs…',
  execution: 'Replaying the book to market…',
};

function textForPhase(phaseIndex: number): string {
  const id = STAGE_ORDER[Math.min(phaseIndex, STAGE_ORDER.length - 1)];
  return STATUS_LINES[id];
}

export const RunProgress: React.FC<{ phaseIndex: number }> = ({ phaseIndex }) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsedMs(Date.now() - start), 100);
    return () => clearInterval(id);
  }, []);

  const percent = Math.min(100, Math.round((elapsedMs / RUN_PHASE_TOTAL_MS) * 100));

  return (
    <div className="rounded-2xl border border-primary-500/20 bg-white/60 dark:bg-background-secondary/40 px-5 py-3.5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" />
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Running the simulation
          </span>
          <motion.span
            key={phaseIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[13px] text-gray-500 dark:text-gray-400"
          >
            — {textForPhase(phaseIndex)}
          </motion.span>
        </div>
        <span className="tabular-nums text-xs font-medium text-gray-500 dark:text-gray-400">
          {Math.floor(elapsedMs / 1000)}s elapsed · {percent}%
        </span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-gray-200/70 dark:bg-background-tertiary/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-sky-300 transition-[width] duration-150 ease-linear"
          style={{ width: `${percent}%`, boxShadow: '0 0 8px rgba(14,165,233,0.7)' }}
        />
      </div>
    </div>
  );
};
