/**
 * Full-screen entry transition for Welth Lab — plays once whenever the
 * page mounts (i.e. every time a user navigates here, from anywhere on the
 * site). Purely presentational: it sits on top of the real page, which is
 * already mounted and rendering underneath, and never gates or delays data
 * loading. Removed automatically after its own animation completes.
 *
 * The centerpiece draws a little price series and pops buy/sell markers
 * along it as it goes — a miniature stand-in for what this feature actually
 * does (replay historical bars through a strategy and mark where it would
 * have traded), rather than a generic icon badge.
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** A small jagged price series, viewBox 0 0 220 80 (y grows downward). */
const PRICE_PATH = 'M10,60 L30,45 L50,55 L70,30 L90,40 L110,20 L130,35 L150,15 L170,25 L190,10 L210,20';

/** Trade markers along the path above — chronological, alternating sides. */
const TRADES: { x: number; y: number; side: 'buy' | 'sell'; delay: number }[] = [
  { x: 50, y: 55, side: 'buy', delay: 0.33 },
  { x: 110, y: 20, side: 'sell', delay: 0.6 },
  { x: 170, y: 25, side: 'buy', delay: 0.87 },
];

export const PageIntro: React.FC<{ show: boolean; onDone: () => void }> = ({ show, onDone }) => {
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
                'radial-gradient(600px circle at 50% 46%, rgba(14,165,233,0.18), transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6] }}
            transition={{ duration: 1.3, times: [0, 0.5, 1] }}
          />

          <div className="relative flex flex-col items-center">
            {/* Replayed price series with buy/sell markers popping in as it draws */}
            <svg viewBox="0 0 220 80" className="h-20 w-[220px] overflow-visible">
              <motion.path
                d={PRICE_PATH}
                fill="none"
                stroke="url(#priceGradient)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
              />
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {TRADES.map((t, i) => (
                <motion.g
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: t.delay, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: `${t.x}px ${t.y}px` }}
                >
                  <circle cx={t.x} cy={t.y} r={7} fill={t.side === 'buy' ? '#0a0e14' : '#0a0e14'} stroke={t.side === 'buy' ? '#22c55e' : '#ef4444'} strokeWidth={1.5} />
                  {t.side === 'buy' ? (
                    <path d={`M${t.x - 3},${t.y + 2} L${t.x},${t.y - 3} L${t.x + 3},${t.y + 2}`} stroke="#22c55e" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  ) : (
                    <path d={`M${t.x - 3},${t.y - 2} L${t.x},${t.y + 3} L${t.x + 3},${t.y - 2}`} stroke="#ef4444" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  )}
                </motion.g>
              ))}
            </svg>

            <motion.p
              className="mt-4 text-sm font-semibold tracking-[0.2em] text-gray-300"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.4 }}
            >
              WELTH LAB
            </motion.p>

            <motion.div
              className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05 }}
            >
              <motion.div
                className="h-full w-full origin-left bg-gradient-to-r from-primary-500 to-secondary-500"
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
              Replaying historical bars through your strategy…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
