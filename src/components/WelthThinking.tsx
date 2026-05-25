import React, { useEffect, useState } from 'react';

const STAGES = [
  'Fetching market data',
  'Resolving symbols',
  'Running technical analysis',
  'Scanning recent news',
  'Synthesizing response',
];

const WelthThinking: React.FC = () => {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIdx((i) => (i + 1) % STAGES.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-start gap-3">
      {/* Monogram */}
      <div className="flex-shrink-0 w-8 h-8 rounded-md border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
        <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
          W
        </span>
      </div>

      <div className="flex-1 min-w-0 max-w-2xl">
        <div className="font-mono text-[10px] uppercase tracking-widest text-light-500 dark:text-light-400 mb-1.5">
          Welth · processing
        </div>

        <div className="rounded-md border border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-100 px-4 py-3">
          {/* Live status line */}
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-xs text-gray-700 dark:text-light-300 transition-opacity duration-200">
              {STAGES[stageIdx]}
              <span className="inline-block w-3 text-emerald-600 dark:text-emerald-400">
                <Dots />
              </span>
            </span>
          </div>

          {/* Ticker-tape skeleton — 3 rows that suggest streaming data */}
          <div className="space-y-2">
            <SkeletonRow widths={['w-14', 'w-20', 'w-12', 'w-24']} />
            <SkeletonRow widths={['w-16', 'w-16', 'w-24', 'w-12']} />
            <SkeletonRow widths={['w-12', 'w-24', 'w-14', 'w-20']} />
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-50/40">
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-[welth_sweep_1.6s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes welth_sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes welth_dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  );
};

const Dots: React.FC = () => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x + 1) % 4), 350);
    return () => clearInterval(id);
  }, []);
  return <>{'.'.repeat(n)}</>;
};

const SkeletonRow: React.FC<{ widths: string[] }> = ({ widths }) => (
  <div className="flex items-center gap-3">
    {widths.map((w, i) => (
      <div
        key={i}
        className={`h-2 ${w} rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-dark-50/60 dark:via-dark-50/30 dark:to-dark-50/60 bg-[length:200%_100%] animate-shimmer`}
      />
    ))}
  </div>
);

export default WelthThinking;
