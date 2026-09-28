/**
 * Full-screen entry transition for Welth Market Regime — plays once whenever
 * the page mounts. Purely presentational: sits on top of the screener UI,
 * which is already mounted and rendering underneath, and never gates or
 * delays anything. Removed automatically once its own animation completes.
 *
 * Distinct from Welth Lab's intro on purpose: this one grows a small cluster
 * of bars and then sweeps a scan line across them, flipping each to a
 * bull/bear color — a miniature stand-in for "classify many stocks into a
 * regime," because that's what this feature actually does.
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const BAR_HEIGHTS = [22, 34, 16, 40, 26, 36, 20, 30];
const BAR_COLORS = ['#22c55e', '#ef4444', '#22c55e', '#22c55e', '#ef4444', '#22c55e', '#ef4444', '#22c55e'];

export const RegimeIntro: React.FC<{ show: boolean; onDone: () => void }> = ({ show, onDone }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 1650);
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
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(99,102,241,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.45) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(600px circle at 50% 46%, rgba(79,70,229,0.2), transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6] }}
            transition={{ duration: 1.3, times: [0, 0.5, 1] }}
          />

          <div className="relative flex flex-col items-center">
            {/* Bar cluster + scan sweep — stands in for classifying stocks into a regime */}
            <div className="relative flex h-11 items-end gap-1.5">
              {BAR_HEIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  className="w-2 rounded-t-sm"
                  style={{ height: h, transformOrigin: 'bottom', backgroundColor: '#4b5563' }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1, backgroundColor: BAR_COLORS[i] }}
                  transition={{
                    scaleY: { delay: 0.1 + i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                    backgroundColor: { delay: 0.55 + i * 0.04, duration: 0.3 },
                  }}
                />
              ))}
              <motion.div
                aria-hidden
                className="absolute -top-2 -bottom-2 w-px bg-gradient-to-b from-transparent via-indigo-300 to-transparent"
                style={{ boxShadow: '0 0 10px 1px rgba(129,140,248,0.8)' }}
                initial={{ left: '0%', opacity: 0 }}
                animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ delay: 0.5, duration: 0.65, ease: 'linear' }}
              />
            </div>

            <motion.p
              className="mt-6 text-sm font-semibold tracking-[0.2em] text-gray-300"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.4 }}
            >
              WELTH MARKET REGIME
            </motion.p>

            <motion.div
              className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05 }}
            >
              <motion.div
                className="h-full w-full origin-left bg-gradient-to-r from-indigo-600 to-blue-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1, duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
              />
            </motion.div>

            <motion.p
              className="mt-3 text-[11px] text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              Scanning market regime & anomalies…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
