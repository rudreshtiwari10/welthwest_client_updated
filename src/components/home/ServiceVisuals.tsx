import React, { useEffect, useState } from 'react';

/** Keyframes used by the animated service visuals (rendered once by ServicesSection). */
export const VisualStyles: React.FC = () => (
  <style>{`
    @keyframes ww-slide-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ww-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ww-progress { from { width: 0%; } to { width: 100%; } }
    @keyframes ww-blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
  `}</style>
);

const panel = 'h-full w-full rounded-xl bg-gray-900 text-gray-100 p-4 font-mono text-xs overflow-hidden border border-gray-700';

/* ───────────────────────── Algorithm Trading ───────────────────────── */

const PNL = [420, -180, 650, 310, -120, 880, 240, -210, 540, 720, -90, 460, 380, -160, 910, 270, 540, -130, 690, 350, -70, 820, 310, 450];
const SYMS = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'SBIN', 'ITC'];
const CUM = PNL.reduce<number[]>((acc, v) => [...acc, acc[acc.length - 1] + v], [0]);
const MAX = CUM[CUM.length - 1];
const fmt = (v: number) => `${v < 0 ? '-' : '+'}₹${Math.abs(v).toLocaleString('en-IN')}`;

export const AlgoTradingVisual: React.FC = () => {
  const [n, setN] = useState(1);

  useEffect(() => {
    // one new trade per second; short pause at the end, then restart
    const id = setInterval(() => setN(c => (c >= PNL.length + 3 ? 1 : c + 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const shown = Math.min(n, PNL.length);
  const total = CUM[shown];
  const wins = PNL.slice(0, shown).filter(v => v > 0).length;
  const pts = CUM.slice(0, shown + 1).map((v, i) => [(i / PNL.length) * 300, 108 - (v / MAX) * 98]);
  const line = pts.map(p => p.join(',')).join(' ');
  const last = pts[pts.length - 1];
  const recent = Array.from({ length: Math.min(4, shown) }, (_, k) => shown - 1 - k);

  return (
    <div className={panel}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase text-gray-400">Net P&amp;L (simulated)</div>
          <div className={`text-2xl font-bold ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(total)}</div>
        </div>
        <div className="text-right text-[10px] text-gray-400">
          <div>{shown} trades</div>
          <div>Win rate {Math.round((wins / shown) * 100)}%</div>
        </div>
      </div>

      <svg viewBox="0 0 300 115" className="mt-2 w-full h-24" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="ww-eq" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,115 ${line} ${last[0]},115`} fill="url(#ww-eq)" />
        <polyline points={line} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r="3.5" fill="#4ade80" />
      </svg>

      <ul className="mt-2 space-y-1">
        {recent.map(i => (
          <li
            key={i + '-' + n}
            style={i === shown - 1 ? { animation: 'ww-slide-in 0.4s ease-out' } : undefined}
            className="flex items-center justify-between rounded bg-gray-800 px-2 py-1"
          >
            <span className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${i % 2 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                {i % 2 ? 'SELL' : 'BUY'}
              </span>
              <span>{SYMS[i % SYMS.length]}</span>
            </span>
            <span className={PNL[i] >= 0 ? 'text-green-400' : 'text-red-400'}>{fmt(PNL[i])}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[9px] text-gray-500">Illustrative simulation only – not actual or guaranteed returns.</p>
    </div>
  );
};

/* ───────────────────────── Technical Sessions ───────────────────────── */

const CODE = [
  'import pandas as pd',
  'df = get_ohlc("NIFTY", "5m")',
  'df["ema"] = df.close.ewm(span=20).mean()',
  'signal = df.close.iloc[-1] > df.ema.iloc[-1]',
  'if signal: place_order("BUY", qty=50)',
];
const CODE_FULL = CODE.join('\n');

export const SessionsVisual: React.FC = () => {
  const [len, setLen] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setLen(l => (l >= CODE_FULL.length + 60 ? 0 : l + 2)), 50);
    return () => clearInterval(id);
  }, []);

  const typed = CODE_FULL.slice(0, Math.min(len, CODE_FULL.length));
  const done = len >= CODE_FULL.length;
  const afterPause = len >= CODE_FULL.length + 20;

  return (
    <div className={panel}>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-red-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> LIVE · 1:1 session
        </span>
        <span className="text-[10px] text-gray-400">Python · APIs · n8n</span>
      </div>

      <pre className="min-h-[7.5rem] whitespace-pre-wrap rounded bg-gray-950 p-3 text-green-300 leading-relaxed">
        {typed}
        <span style={{ animation: 'ww-blink 1s steps(1) infinite' }}>▌</span>
      </pre>

      <div className="mt-3 space-y-2 text-[11px] font-sans">
        {done && (
          <div style={{ animation: 'ww-fade-in 0.4s ease-out' }} className="max-w-[85%] rounded-lg bg-gray-800 px-3 py-1.5">
            <span className="text-yellow-300">Student:</span> why EMA 20 and not 50?
          </div>
        )}
        {afterPause && (
          <div style={{ animation: 'ww-fade-in 0.4s ease-out' }} className="ml-auto max-w-[85%] rounded-lg bg-secondary-600/40 px-3 py-1.5">
            <span className="text-secondary-200">Kunal:</span> good question – let&apos;s backtest both.
          </div>
        )}
      </div>
    </div>
  );
};

/* ───────────────────────── Business Automation ───────────────────────── */

const NODES = [
  { icon: '⏰', label: 'Schedule', log: 'Trigger fired · 9:00 AM' },
  { icon: '🌐', label: 'Fetch data', log: '120 market updates fetched' },
  { icon: '🤖', label: 'AI Agent', log: 'Summary & signals generated' },
  { icon: '✈️', label: 'Telegram', log: 'Report sent to group' },
];

export const AutomationVisual: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep(s => (s >= NODES.length + 1 ? 0 : s + 1)), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={panel}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-secondary-300">n8n workflow · Daily market brief</span>
        <span className="text-[10px] text-green-400">● Active</span>
      </div>

      <div className="flex items-center">
        {NODES.map((nd, i) => {
          const on = step > i;
          return (
            <React.Fragment key={nd.label}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl transition-all duration-500 ${
                    on ? 'border-green-400 bg-green-500/10 shadow-[0_0_14px_rgba(74,222,128,0.35)]' : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  {nd.icon}
                </div>
                <span className="text-[10px] text-gray-300">{nd.label}</span>
              </div>
              {i < NODES.length - 1 && (
                <div className="mx-1 mb-4 h-0.5 flex-1 overflow-hidden rounded bg-gray-700">
                  <div className="h-full bg-green-400 transition-all duration-700" style={{ width: step > i + 1 ? '100%' : step === i + 1 ? '50%' : '0%' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <ul className="mt-4 min-h-[5.5rem] space-y-1 font-sans text-[11px]">
        {NODES.map((nd, i) =>
          step > i ? (
            <li key={nd.label} style={{ animation: 'ww-slide-in 0.4s ease-out' }} className="text-gray-200">
              <span className="text-green-400">✓</span> {nd.log}
            </li>
          ) : null
        )}
      </ul>

      <div className="mt-2 flex items-center justify-between rounded bg-gray-800 px-3 py-2 font-sans text-[11px]">
        <span className="text-gray-400">Manual work replaced</span>
        <span className="font-semibold text-secondary-300">≈ 2 hrs / day</span>
      </div>
    </div>
  );
};
