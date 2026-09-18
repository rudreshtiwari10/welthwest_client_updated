/**
 * Full-screen transition that plays the moment a run finishes, before the
 * page swaps from the pipeline to the results view — the same visual
 * language as PageIntro (dark backdrop, technical grid, scan beam,
 * gradient icon badge), so finishing a run reads as a continuation of the
 * same "entering the engine" motion, not a different effect.
 *
 * Unlike PageIntro (which appears already fully covering, since the user
 * hasn't seen the page yet), this one visibly wipes DOWN to cover the
 * pipeline, then wipes back UP to reveal whatever is underneath once it's
 * done — BacktestIndiaPage swaps the view from 'builder' to 'results'
 * while the screen is fully covered, so the swap itself is never seen; the
 * results appear to grow out of the wipe rather than snap into place.
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const ResultsTransition: React.FC<{ show: boolean; onDone: () => void }> = ({ show, onDone }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 950);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#0a0e14]"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Animated technical grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(600px circle at 50% 50%, rgba(16,185,129,0.18), transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6] }}
            transition={{ duration: 0.9, times: [0, 0.5, 1] }}
          />

          {/* Horizontal scan beam */}
          <motion.div
            aria-hidden
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent"
            initial={{ top: '-5%', opacity: 0 }}
            animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />

          <div className="relative flex flex-col items-center">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-primary-500 shadow-[0_0_60px_-8px_rgba(16,185,129,0.7)]"
              initial={{ scale: 0.6, opacity: 0, rotate: 8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </motion.div>

            <motion.p
              className="mt-5 text-sm font-semibold tracking-[0.2em] text-gray-300"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
            >
              RESULTS READY
            </motion.p>

            <motion.div
              className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
            >
              <motion.div
                className="h-full w-full origin-left bg-gradient-to-r from-emerald-500 to-primary-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.32, duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
              />
            </motion.div>

            <motion.p
              className="mt-3 text-[11px] text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.3 }}
            >
              Compiling your report…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
