/**
 * Shared UI and chart primitives for the Backtest India page.
 *
 * Palette provenance: the categorical slots below are the validated default
 * (blue / orange / aqua). Both modes were re-validated against THIS app's
 * surfaces (#ffffff light, #121820 dark) with `--pairs all`:
 *   light — CVD worst 9.2, normal-vision worst 24.0, one contrast WARN
 *   dark  — CVD worst 9.4, normal-vision worst 20.9, no warnings
 * The light-mode WARN is on aqua (2.82:1). The relief is shipped: every
 * multi-series chart carries a legend AND direct end-labels, and the same
 * numbers appear in the metrics table below the chart.
 *
 * Three series is the hard cap for all-pairs forms — a fourth slot would put
 * yellow beside orange and fail the floor. Nothing here ever exceeds three.
 */

import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/* ── Palette ─────────────────────────────────────────────────────────── */

export interface VizPalette {
  series: [string, string, string];
  loss: string;
  gain: string;
  divergeHigh: string;
  divergeLow: string;
  divergeMid: string;
  grid: string;
  axis: string;
  muted: string;
  ink: string;
  inkSecondary: string;
  surface: string;
  ramp: string[];
}

const LIGHT: VizPalette = {
  series: ['#2a78d6', '#eb6834', '#1baf7a'],
  loss: '#d03b3b',
  gain: '#0ca30c',
  divergeHigh: '#2a78d6',
  divergeLow: '#d03b3b',
  divergeMid: '#f0efec',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  muted: '#898781',
  ink: '#0b0b0b',
  inkSecondary: '#52514e',
  surface: '#ffffff',
  ramp: ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95'],
};

const DARK: VizPalette = {
  series: ['#3987e5', '#d95926', '#199e70'],
  loss: '#e66767',
  gain: '#0ca30c',
  divergeHigh: '#3987e5',
  divergeLow: '#e66767',
  divergeMid: '#383835',
  grid: '#2c2c2a',
  axis: '#383835',
  muted: '#898781',
  ink: '#ffffff',
  inkSecondary: '#c3c2b7',
  surface: '#121820',
  ramp: ['#0d366b', '#184f95', '#256abf', '#3987e5', '#6da7ec', '#9ec5f4'],
};

export function usePalette(): { p: VizPalette; isDark: boolean } {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return { p: isDark ? DARK : LIGHT, isDark };
}

/* ── Layout primitives ───────────────────────────────────────────────── */

export const Card: React.FC<{
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, right, className = '', children }) => (
  <section
    className={`rounded-xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-background-secondary p-4 sm:p-5 ${className}`}
  >
    {(title || right) && (
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          {title && (
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </header>
    )}
    {children}
  </section>
);

export const StatTile: React.FC<{
  label: string;
  value: string;
  sub?: string;
  tone?: 'neutral' | 'good' | 'bad';
  hint?: string;
}> = ({ label, value, sub, tone = 'neutral', hint }) => {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'bad'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-gray-900 dark:text-white';
  return (
    <div
      className="rounded-lg border border-gray-200 dark:border-gray-700/70 bg-gray-50/60 dark:bg-background-tertiary px-3 py-3"
      title={hint}
    >
      <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{sub}</div>}
    </div>
  );
};

export const Pill: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${className}`}
  >
    {children}
  </span>
);

export const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">{children}</p>
);

export const Note: React.FC<{ children: React.ReactNode; tone?: 'info' | 'warn' }> = ({
  children,
  tone = 'info',
}) => (
  <p
    className={`mt-3 rounded-md border-l-2 px-3 py-2 text-xs leading-relaxed ${
      tone === 'warn'
        ? 'border-amber-500 bg-amber-500/5 text-amber-700 dark:text-amber-300'
        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-background-tertiary text-gray-600 dark:text-gray-300'
    }`}
  >
    {children}
  </p>
);

/* ── Data table ──────────────────────────────────────────────────────── */

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: T) => React.ReactNode;
  width?: string;
}

export function DataTable<T>({
  columns,
  rows,
  empty = 'Nothing to show.',
  maxHeight = '26rem',
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  maxHeight?: string;
}) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700/70" style={{ maxHeight }}>
      <table className="min-w-full text-xs">
        <thead className="sticky top-0 bg-gray-50 dark:bg-background-tertiary">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={`whitespace-nowrap px-3 py-2 font-medium text-gray-600 dark:text-gray-300 ${
                  c.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-background-tertiary/60">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`whitespace-nowrap px-3 py-1.5 tabular-nums text-gray-700 dark:text-gray-200 ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Charts (hand-built SVG — no dual axes, ever) ────────────────────── */

interface SeriesDef {
  key: string;
  label: string;
  color: string;
  values: (number | null)[];
}

/**
 * Multi-series line chart with a crosshair tooltip, a legend and direct
 * end-labels. Every series shares ONE y-scale — this component structurally
 * cannot render a dual-axis chart.
 */
export const LineChart: React.FC<{
  labels: string[];
  series: SeriesDef[];
  height?: number;
  yFormat: (v: number) => string;
  baseline?: number;
  fillFirst?: boolean;
}> = ({ labels, series, height = 260, yFormat, baseline, fillFirst = false }) => {
  const { p } = usePalette();
  const [hover, setHover] = React.useState<number | null>(null);
  const padL = 62;
  const padR = 74;
  const padT = 12;
  const padB = 26;
  const W = 1000;
  const H = height;

  const { min, max } = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    series.forEach((s) =>
      s.values.forEach((v) => {
        if (v === null || !isFinite(v)) return;
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      })
    );
    if (baseline !== undefined) {
      lo = Math.min(lo, baseline);
      hi = Math.max(hi, baseline);
    }
    if (!isFinite(lo) || !isFinite(hi)) return { min: 0, max: 1 };
    if (lo === hi) return { min: lo - 1, max: hi + 1 };
    const pad = (hi - lo) * 0.06;
    return { min: lo - pad, max: hi + pad };
  }, [series, baseline]);

  const n = labels.length;
  const x = (i: number) => padL + (i / Math.max(1, n - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= 4; i++) out.push(min + ((max - min) * i) / 4);
    return out;
  }, [min, max]);

  const path = (values: (number | null)[]) => {
    let d = '';
    let pen = false;
    values.forEach((v, i) => {
      if (v === null || !isFinite(v)) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`;
      pen = true;
    });
    return d;
  };

  const lastValue = (s: SeriesDef) => {
    for (let i = s.values.length - 1; i >= 0; i--) {
      const v = s.values[i];
      if (v !== null && isFinite(v)) return { i, v };
    }
    return null;
  };

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - padL) / (W - padL - padR)) * (n - 1));
    setHover(i >= 0 && i < n ? i : null);
  };

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
              <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Line chart: ${series.map((s) => s.label).join(', ')}`}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={p.grid} strokeWidth={1} />
            <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize={11} fill={p.muted}>
              {yFormat(t)}
            </text>
          </g>
        ))}
        {baseline !== undefined && (
          <line
            x1={padL}
            x2={W - padR}
            y1={y(baseline)}
            y2={y(baseline)}
            stroke={p.axis}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}

        {fillFirst && series[0] && (
          <path
            d={`${path(series[0].values)}L${x(n - 1)},${y(baseline ?? min)}L${x(0)},${y(
              baseline ?? min
            )}Z`}
            fill={series[0].color}
            opacity={0.12}
          />
        )}

        {series.map((s) => (
          <path
            key={s.key}
            d={path(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* direct end-labels — the relief for the light-mode contrast warning */}
        {series.map((s) => {
          const last = lastValue(s);
          if (!last) return null;
          return (
            <text
              key={`lbl-${s.key}`}
              x={W - padR + 6}
              y={y(last.v) + 3.5}
              fontSize={11}
              fontWeight={600}
              fill={s.color}
            >
              {yFormat(last.v)}
            </text>
          );
        })}

        {[0, Math.floor(n / 2), n - 1].map((i, k) =>
          labels[i] ? (
            <text key={k} x={x(i)} y={H - 6} textAnchor={k === 0 ? 'start' : k === 2 ? 'end' : 'middle'} fontSize={11} fill={p.muted}>
              {labels[i]}
            </text>
          ) : null
        )}

        {hover !== null && labels[hover] && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke={p.axis} strokeWidth={1} />
            {series.map((s) => {
              const v = s.values[hover];
              if (v === null || v === undefined || !isFinite(v)) return null;
              return (
                <circle
                  key={s.key}
                  cx={x(hover)}
                  cy={y(v)}
                  r={4}
                  fill={s.color}
                  stroke={p.surface}
                  strokeWidth={2}
                />
              );
            })}
          </g>
        )}
      </svg>

      {hover !== null && labels[hover] && (
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-gray-50 dark:bg-background-tertiary px-3 py-1.5 text-[11px]">
          <span className="font-medium text-gray-700 dark:text-gray-200">{labels[hover]}</span>
          {series.map((s) => {
            const v = s.values[hover!];
            return (
              <span key={s.key} className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.label}: <span className="tabular-nums font-medium">{v === null || v === undefined ? '—' : yFormat(v)}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Horizontal bar list. Used for magnitude comparisons where the categories are
 * few and named — a form that reads better than a vertical bar chart because
 * the labels are words, not dates.
 */
export const BarList: React.FC<{
  rows: Array<{ label: string; value: number; hint?: string }>;
  format: (v: number) => string;
  diverging?: boolean;
  height?: number;
}> = ({ rows, format, diverging = false, height = 18 }) => {
  const { p } = usePalette();
  if (!rows.length) return <Empty>No data.</Empty>;
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1e-9);

  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => {
        const frac = Math.abs(r.value) / max;
        const negative = r.value < 0;
        const color = diverging
          ? negative
            ? p.divergeLow
            : p.divergeHigh
          : p.ramp[Math.min(p.ramp.length - 1, 3)];
        return (
          <div key={i} className="flex items-center gap-3" title={r.hint}>
            <div className="w-40 shrink-0 truncate text-[11px] text-gray-600 dark:text-gray-300">
              {r.label}
            </div>
            <div className="relative flex-1">
              {diverging ? (
                <div className="relative h-full" style={{ height }}>
                  <div
                    className="absolute top-0 bottom-0 w-px"
                    style={{ left: '50%', background: p.axis }}
                  />
                  <div
                    className="absolute top-0 bottom-0 rounded-sm"
                    style={{
                      background: color,
                      left: negative ? `${50 - frac * 50}%` : '50%',
                      width: `${frac * 50}%`,
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-sm bg-gray-100 dark:bg-background-tertiary" style={{ height }}>
                  <div
                    className="h-full rounded-sm"
                    style={{ background: color, width: `${frac * 100}%` }}
                  />
                </div>
              )}
            </div>
            <div className="w-24 shrink-0 text-right text-[11px] font-medium tabular-nums text-gray-700 dark:text-gray-200">
              {format(r.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Monthly return heatmap. Diverging encoding: blue for positive, red for
 * negative, neutral gray at zero — never a rainbow, and never a hue at the
 * midpoint.
 */
export const MonthHeatmap: React.FC<{
  data: Array<{ year: number; month: number; return: number }>;
}> = ({ data }) => {
  const { p } = usePalette();
  if (!data.length) return <Empty>Not enough history for a monthly breakdown.</Empty>;

  const years = Array.from(new Set(data.map((d) => d.year))).sort();
  const byKey = new Map(data.map((d) => [`${d.year}-${d.month}`, d.return]));
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.return)), 0.01);
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  const cellColor = (v: number | undefined) => {
    if (v === undefined) return 'transparent';
    const t = Math.min(1, Math.abs(v) / maxAbs);
    const target = v >= 0 ? p.divergeHigh : p.divergeLow;
    return t < 0.04 ? p.divergeMid : mix(p.divergeMid, target, 0.15 + t * 0.85);
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-[11px]">
        <thead>
          <tr>
            <th className="px-2 py-1" />
            {months.map((m, i) => (
              <th key={i} className="px-1 py-1 font-medium text-gray-500 dark:text-gray-400">
                {m}
              </th>
            ))}
            <th className="px-2 py-1 font-medium text-gray-500 dark:text-gray-400">Year</th>
          </tr>
        </thead>
        <tbody>
          {years.map((yr) => {
            const cells = months.map((_, i) => byKey.get(`${yr}-${i + 1}`));
            const yearRet = cells.reduce<number>((acc, v) => (v === undefined ? acc : (1 + acc) * (1 + v) - 1), 0);
            return (
              <tr key={yr}>
                <td className="px-2 py-1 font-medium text-gray-600 dark:text-gray-300">{yr}</td>
                {cells.map((v, i) => (
                  <td key={i} className="p-0.5">
                    <div
                      className="flex h-7 w-11 items-center justify-center rounded-sm tabular-nums"
                      style={{
                        background: cellColor(v),
                        color: v === undefined ? p.muted : Math.abs(v ?? 0) / maxAbs > 0.55 ? '#ffffff' : p.inkSecondary,
                      }}
                      title={v === undefined ? 'no data' : `${yr}-${String(i + 1).padStart(2, '0')}: ${(v * 100).toFixed(2)}%`}
                    >
                      {v === undefined ? '·' : `${(v * 100).toFixed(1)}`}
                    </div>
                  </td>
                ))}
                <td className="px-2 py-1 text-right font-semibold tabular-nums text-gray-700 dark:text-gray-200">
                  {(yearRet * 100).toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        <span>Loss</span>
        <span className="h-3 w-24 rounded-sm" style={{ background: `linear-gradient(to right, ${p.divergeLow}, ${p.divergeMid}, ${p.divergeHigh})` }} />
        <span>Gain</span>
        <span className="ml-2">Values are monthly returns in percent.</span>
      </div>
    </div>
  );
};

function mix(a: string, b: string, t: number): string {
  const pa = hex(a);
  const pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function hex(h: string): [number, number, number] {
  const s = h.replace('#', '');
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

/** Histogram of a distribution — single series, so no legend. */
export const Histogram: React.FC<{
  bins: Array<{ bin_low: number; bin_high: number; count: number }>;
  format: (v: number) => string;
  height?: number;
}> = ({ bins, format, height = 160 }) => {
  const { p } = usePalette();
  if (!bins.length) return <Empty>Not enough observations.</Empty>;
  const max = Math.max(...bins.map((b) => b.count), 1);

  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {bins.map((b, i) => {
          const mid = (b.bin_low + b.bin_high) / 2;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-[4px]"
              style={{
                height: `${(b.count / max) * 100}%`,
                background: mid < 0 ? p.divergeLow : p.divergeHigh,
                minHeight: b.count > 0 ? 2 : 0,
              }}
              title={`${format(b.bin_low)} to ${format(b.bin_high)}: ${b.count} bars`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <span>{format(bins[0].bin_low)}</span>
        <span>0</span>
        <span>{format(bins[bins.length - 1].bin_high)}</span>
      </div>
    </div>
  );
};
