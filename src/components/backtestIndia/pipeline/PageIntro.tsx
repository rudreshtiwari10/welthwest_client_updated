/**
 * Full-screen entry transition for Backtest India — plays once whenever the
 * page mounts (i.e. every time a user navigates here, from anywhere on the
 * site). Purely presentational: it sits on top of the real page, which is
 * already mounted and rendering underneath, and never gates or delays data
 * loading. Removed automatically after its own animation completes.
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const PageIntro: React.FC<{ show: boolean; onDone: () => void }> = ({ show, onDone }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 1350);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#0a0e14]"
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
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
                'radial-gradient(600px circle at 50% 50%, rgba(14,165,233,0.18), transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6] }}
            transition={{ duration: 1.1, times: [0, 0.5, 1] }}
          />

          {/* Horizontal scan beam */}
          <motion.div
            aria-hidden
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent"
            initial={{ top: '-5%', opacity: 0 }}
            animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, ease: 'linear' }}
          />

          <div className="relative flex flex-col items-center">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-[0_0_60px_-8px_rgba(14,165,233,0.7)]"
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M3.75 19.5V13.5m5.25 6V9m5.25 10.5V6m5.25 13.5V10.5" />
              </svg>
            </motion.div>

            <motion.p
              className="mt-5 text-sm font-semibold tracking-[0.2em] text-gray-300"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              BACKTEST INDIA
            </motion.p>

            <motion.div
              className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <motion.div
                className="h-full w-full origin-left bg-gradient-to-r from-primary-500 to-secondary-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
              />
            </motion.div>

            <motion.p
              className="mt-3 text-[11px] text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              Initializing the event-driven engine…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
