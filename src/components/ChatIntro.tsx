/**
 * Full-screen entry transition for Welth AI Assistant — plays once whenever
 * the page mounts. Purely presentational: sits on top of the chat UI, which
 * is already mounted and rendering underneath, and never gates or delays
 * anything. Removed automatically once its own animation completes.
 *
 * Distinct from Welth Lab's intro on purpose: this one plays out a tiny
 * conversation — a question bubble, then a typing indicator — because this
 * feature is a chat, not a simulation engine.
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const ChatIntro: React.FC<{ show: boolean; onDone: () => void }> = ({ show, onDone }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 1650);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#120f1a]"
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Soft dot texture — deliberately not the Welth Lab line grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: 'radial-gradient(rgba(192,132,252,0.7) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(600px circle at 50% 42%, rgba(168,85,247,0.2), transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6] }}
            transition={{ duration: 1.3, times: [0, 0.5, 1] }}
          />

          <div className="relative flex flex-col items-center">
            {/* A tiny conversation, not an icon badge */}
            <div className="flex w-56 flex-col gap-2">
              <motion.div
                className="ml-auto max-w-[78%] rounded-2xl rounded-br-sm bg-white/10 px-3 py-2 text-[11px] leading-snug text-gray-200"
                initial={{ opacity: 0, y: 10, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                What's RELIANCE doing today?
              </motion.div>

              <motion.div
                className="mr-auto flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gradient-to-br from-purple-600 to-indigo-600 px-3.5 py-2.5 shadow-[0_0_40px_-10px_rgba(147,51,234,0.8)]"
                initial={{ opacity: 0, y: 10, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/90"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  />
                ))}
              </motion.div>
            </div>

            <motion.p
              className="mt-6 text-sm font-semibold tracking-[0.2em] text-gray-300"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.4 }}
            >
              WELTH AI ASSISTANT
            </motion.p>

            <motion.div
              className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05 }}
            >
              <motion.div
                className="h-full w-full origin-left bg-gradient-to-r from-purple-600 to-indigo-600"
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
              Warming up the assistant…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
