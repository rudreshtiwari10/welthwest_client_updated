import React, { useEffect, useState } from 'react';

// TODO: wire to live indices/quotes API. Static placeholders preserve the
// "trading desk" visual without depending on a backend endpoint we haven't agreed on.
const TICKERS: Array<{ symbol: string; price: number; change: number }> = [
  { symbol: 'NIFTY 50', price: 24812.05, change: 0.42 },
  { symbol: 'SENSEX', price: 81204.18, change: 0.31 },
  { symbol: 'BANKNIFTY', price: 53198.7, change: -0.18 },
  { symbol: 'NIFTY IT', price: 41522.4, change: 1.12 },
  { symbol: 'NIFTY AUTO', price: 24108.65, change: -0.54 },
  { symbol: 'NIFTY FMCG', price: 56340.9, change: 0.08 },
  { symbol: 'INDIA VIX', price: 13.42, change: -2.31 },
  { symbol: 'USD/INR', price: 84.36, change: 0.05 },
  { symbol: 'GOLD MCX', price: 76420.0, change: 0.27 },
  { symbol: 'CRUDE MCX', price: 5876.5, change: -0.91 },
];

const formatPrice = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TickerRow: React.FC = () => (
  <div className="flex items-center gap-8 px-4 shrink-0">
    {TICKERS.map((t) => {
      const up = t.change >= 0;
      return (
        <div key={t.symbol} className="flex items-center gap-2 font-mono text-xs whitespace-nowrap">
          <span className="text-light-500 dark:text-light-400 tracking-wider">{t.symbol}</span>
          <span className="text-gray-900 dark:text-white tabular-nums">{formatPrice(t.price)}</span>
          <span
            className={`tabular-nums ${
              up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {up ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}%
          </span>
        </div>
      );
    })}
  </div>
);

const WelthMarketTicker: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const istHour = (now.getUTCHours() + 5) % 24;
  const istMinute = (now.getUTCMinutes() + 30) % 60;
  const minuteRollover = now.getUTCMinutes() + 30 >= 60 ? 1 : 0;
  const hourAdjusted = (istHour + minuteRollover) % 24;
  const minutesSinceMidnight = hourAdjusted * 60 + istMinute;
  const marketOpen = minutesSinceMidnight >= 9 * 60 + 15 && minutesSinceMidnight <= 15 * 60 + 30;

  const timeLabel = `${String(hourAdjusted).padStart(2, '0')}:${String(istMinute).padStart(2, '0')} IST`;

  return (
    <div className="flex items-center border-b border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-200">
      {/* Status pill */}
      <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-200 dark:border-dark-50/60 shrink-0">
        <span
          className={`relative flex h-2 w-2 ${marketOpen ? '' : 'opacity-60'}`}
          aria-hidden
        >
          {marketOpen && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              marketOpen ? 'bg-emerald-500' : 'bg-light-400 dark:bg-light-500'
            }`}
          />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-gray-700 dark:text-light-300">
          {marketOpen ? 'Market Open' : 'Market Closed'}
        </span>
        <span className="font-mono text-[11px] text-light-500 dark:text-light-400">· {timeLabel}</span>
      </div>

      {/* Marquee */}
      <div className="relative flex-1 overflow-hidden py-2">
        <div className="flex w-max animate-[ticker_60s_linear_infinite]">
          <TickerRow />
          <TickerRow />
        </div>
        {/* Edge fade — light + dark */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white dark:from-dark-200 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white dark:from-dark-200 to-transparent" />
      </div>

      {/* Inline keyframes — kept local so we don't have to edit tailwind.config */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default WelthMarketTicker;
