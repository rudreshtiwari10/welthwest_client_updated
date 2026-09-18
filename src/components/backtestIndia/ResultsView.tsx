/**
 * The results surface.
 *
 * Layout follows spec §35: headline, equity (gross vs net vs benchmark),
 * drawdown, monthly heatmap, trade distribution, cost waterfall, robustness,
 * walk-forward timeline, regime breakdown, liquidity warnings, bias audit and
 * the confidence label. Gross and net are never merged into one number.
 */

import React, { useMemo, useState } from 'react';
import {
  BacktestReport, CONFIDENCE_STYLES, TradeRow, fmt,
} from '../../services/backtestIndia';
import {
  BarList, Card, Column, DataTable, Empty, Histogram, LineChart, MonthHeatmap,
  Note, Pill, StatTile, usePalette,
} from './viz';

type TabKey =
  | 'overview' | 'trades' | 'costs' | 'validation'
  | 'robustness' | 'diagnostics' | 'audit';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'trades', label: 'Trades' },
  { key: 'costs', label: 'Costs & taxes' },
  { key: 'validation', label: 'Validation' },
  { key: 'robustness', label: 'Robustness' },
  { key: 'diagnostics', label: 'Diagnostics' },
  { key: 'audit', label: 'Bias audit' },
];

export const ResultsView: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const [tab, setTab] = useState<TabKey>('overview');
  const h = report.headline;

  return (
    <div className="space-y-4">
      <ConfidenceBanner report={report} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile
          label="Net CAGR"
          value={fmt.pct(h.net_cagr)}
          sub={`Gross ${fmt.pct(h.gross_cagr)}`}
          tone={(h.net_cagr ?? 0) > 0 ? 'good' : 'bad'}
          hint="Compound annual growth rate after every modelled cost."
        />
        <StatTile
          label="Max drawdown"
          value={fmt.pct(h.max_drawdown)}
          sub={`over ${report.metrics?.drawdown_duration?.longest_bars ?? '—'} bars`}
          tone="bad"
        />
        <StatTile label="Sharpe" value={fmt.num(h.sharpe)} sub={`Sortino ${fmt.num(h.sortino)}`} />
        <StatTile
          label="Profit factor"
          value={fmt.num(h.profit_factor)}
          sub={`Hit rate ${fmt.pct(h.hit_rate, 1)}`}
        />
        <StatTile
          label="Total costs"
          value={fmt.money(h.total_costs)}
          sub={`Turnover ${fmt.num(h.turnover, 1)}x`}
          tone="bad"
        />
        <StatTile
          label="Trades"
          value={fmt.int(h.total_trades)}
          sub={`vs benchmark ${fmt.pct(h.benchmark_excess_cagr)}`}
        />
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700/70">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && <Overview report={report} />}
      {tab === 'trades' && <Trades report={report} />}
      {tab === 'costs' && <Costs report={report} />}
      {tab === 'validation' && <Validation report={report} />}
      {tab === 'robustness' && <Robustness report={report} />}
      {tab === 'diagnostics' && <Diagnostics report={report} />}
      {tab === 'audit' && <Audit report={report} />}
    </div>
  );
};

/* ── Banner ──────────────────────────────────────────────────────────── */

const ConfidenceBanner: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const c = report.confidence;
  const style = CONFIDENCE_STYLES[c.label] || CONFIDENCE_STYLES.Research;
  return (
    <div className={`rounded-xl border p-4 ${style}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg font-semibold">{c.label}</span>
        <span className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium">
          Quality score {fmt.num(report.quality_score?.score, 0)} / 100
        </span>
        <span className="ml-auto text-[11px] opacity-80">
          Run {report.run?.run_id} · engine {report.run?.engine_version} · {report.runtime_seconds}s
          {report.usage?.limit !== undefined && report.usage?.limit !== null && (
            <> · {report.usage.remaining} of {report.usage.limit} runs left today</>
          )}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed opacity-90">{c.summary}</p>
      {!!c.reasons?.length && (
        <ul className="mt-2 space-y-0.5 text-xs opacity-80">
          {c.reasons.map((r, i) => (
            <li key={i}>— {r}</li>
          ))}
        </ul>
      )}
      {report.halted && (
        <p className="mt-2 rounded-md bg-black/5 dark:bg-white/10 px-3 py-2 text-xs">
          <strong>Trading halted mid-run:</strong> {report.halted}
        </p>
      )}
      {!!report.warnings?.length && (
        <ul className="mt-2 space-y-0.5 text-xs opacity-80">
          {report.warnings.slice(0, 4).map((w, i) => (
            <li key={i}>⚠ {w}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ── Overview ────────────────────────────────────────────────────────── */

const Overview: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const { p } = usePalette();
  const eq = useMemo(() => report.equity_curve || [], [report.equity_curve]);
  const labels = eq.map((e) => fmt.date(e.t));
  const hasBenchmark = eq.some((e) => e.benchmark !== null && e.benchmark !== undefined);

  const capital = report.run?.initial_capital || 1;

  const series = useMemo(() => {
    const toPct = (v: number) => v / capital - 1;
    const out = [
      { key: 'net', label: 'Net (after all costs)', color: p.series[0], values: eq.map((e) => toPct(e.equity)) },
      { key: 'gross', label: 'Gross (before costs)', color: p.series[1], values: eq.map((e) => toPct(e.gross)) },
    ];
    if (hasBenchmark) {
      out.push({
        key: 'bm',
        label: `Benchmark (${report.run?.config?.benchmark || 'index'})`,
        color: p.series[2],
        values: eq.map((e) => (e.benchmark === null || e.benchmark === undefined ? null : toPct(e.benchmark))) as any,
      });
    }
    return out;
  }, [eq, p, hasBenchmark, capital, report.run]);

  const dd = report.drawdown_curve || [];

  return (
    <div className="space-y-4">
      <Card
        title="Equity curve"
        subtitle="Gross and net are drawn separately on one shared scale. The gap between them is exactly what the costs took."
      >
        {eq.length ? (
          <LineChart
            labels={labels}
            series={series as any}
            yFormat={(v) => fmt.pct(v, 0)}
            baseline={0}
            height={300}
          />
        ) : (
          <Empty>No equity curve was produced.</Empty>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Drawdown" subtitle="Peak-to-trough decline of the net equity curve, at every point in time.">
          {dd.length ? (
            <LineChart
              labels={dd.map((d) => fmt.date(d.t))}
              series={[{ key: 'dd', label: 'Drawdown', color: p.loss, values: dd.map((d) => d.drawdown) }]}
              yFormat={(v) => fmt.pct(v, 0)}
              baseline={0}
              fillFirst
              height={200}
            />
          ) : (
            <Empty>No drawdown data.</Empty>
          )}
        </Card>

        <Card
          title="Strategy quality score"
          subtitle={report.quality_score?.disclaimer}
        >
          <BarList
            rows={(report.quality_score?.components || []).map((c) => ({
              label: `${c.name} (${Math.round(c.weight * 100)}%)`,
              value: c.value,
              hint: `${c.basis} — normalised as: ${c.cap}`,
            }))}
            format={(v) => v.toFixed(2)}
          />
          <Note>
            Hover any bar for the raw metric behind it. The weights come straight from the
            specification and each component's normalisation caps are shown.
          </Note>
        </Card>
      </div>

      <Card
        title="Monthly returns"
        subtitle="Net calendar-month returns. Diverging colour: blue positive, red negative, neutral at zero."
      >
        <MonthHeatmap data={report.monthly_returns || []} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Benchmarks and controls" subtitle="A positive return proves nothing on its own. These are the alternatives it had to beat.">
          <BaselineTable report={report} />
        </Card>
        <Card title="Full metric set" subtitle="Every headline number here is reconstructible from the trade and cash ledgers.">
          <MetricsGrid metrics={report.metrics} />
        </Card>
      </div>
    </div>
  );
};

const BaselineTable: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const bh = report.benchmarks?.buy_and_hold || {};
  const controls = report.benchmarks?.controls || {};
  const rows: Array<{ label: string; ret: number | null; sharpe: number | null; dd: number | null; trades: number | null }> = [
    {
      label: 'This strategy',
      ret: report.headline.net_total_return,
      sharpe: report.headline.sharpe,
      dd: report.headline.max_drawdown,
      trades: report.headline.total_trades,
    },
  ];
  Object.values(bh).forEach((b: any) => {
    if (b?.available) {
      rows.push({ label: b.label, ret: b.total_return, sharpe: b.sharpe, dd: b.max_drawdown, trades: 1 });
    }
  });
  (controls.controls || []).forEach((c: any) => {
    if (!c.error) {
      rows.push({ label: c.label, ret: c.total_return, sharpe: c.sharpe, dd: c.max_drawdown, trades: c.total_trades });
    }
  });

  const cols: Column<typeof rows[0]>[] = [
    { key: 'label', header: 'Strategy', render: (r) => r.label },
    { key: 'ret', header: 'Total return', align: 'right', render: (r) => fmt.pct(r.ret) },
    { key: 'sharpe', header: 'Sharpe', align: 'right', render: (r) => fmt.num(r.sharpe) },
    { key: 'dd', header: 'Max DD', align: 'right', render: (r) => fmt.pct(r.dd) },
    { key: 'trades', header: 'Trades', align: 'right', render: (r) => fmt.int(r.trades) },
  ];

  const verdict = controls.random_entry_verdict;
  return (
    <>
      <DataTable columns={cols} rows={rows} maxHeight="20rem" />
      {verdict && (
        <Note tone={verdict.excess_over_random > 0 ? 'info' : 'warn'}>
          <strong>Beat random entries {verdict.beat_random_controls}.</strong> {verdict.reading}
        </Note>
      )}
      {!controls.available && (
        <Note>Baseline controls were disabled for this run. Enable them to see whether the entry timing added anything.</Note>
      )}
    </>
  );
};

const METRIC_GROUPS: Array<{ title: string; keys: string[] }> = [
  { title: 'Return', keys: ['total_return', 'total_return_gross', 'cagr', 'cagr_gross', 'net_profit', 'final_equity'] },
  { title: 'Risk', keys: ['annualized_volatility', 'max_drawdown', 'ulcer_index', 'var_95', 'expected_shortfall_95', 'skewness', 'kurtosis'] },
  { title: 'Risk-adjusted', keys: ['sharpe', 'sharpe_gross', 'sortino', 'calmar', 'recovery_factor'] },
  { title: 'Trades', keys: ['total_trades', 'hit_rate', 'profit_factor', 'expectancy', 'payoff_ratio', 'avg_win', 'avg_loss', 'best_trade', 'worst_trade', 'max_consecutive_wins', 'max_consecutive_losses', 'avg_holding_bars', 'median_holding_bars', 'avg_mae', 'avg_mfe', 'avg_r_multiple'] },
  { title: 'Exposure', keys: ['time_in_market', 'avg_gross_exposure', 'max_gross_exposure', 'avg_open_positions', 'turnover'] },
];

const PCT_KEYS = new Set([
  'total_return', 'total_return_gross', 'cagr', 'cagr_gross', 'annualized_volatility',
  'max_drawdown', 'var_95', 'expected_shortfall_95', 'hit_rate', 'time_in_market',
  'avg_mae', 'avg_mfe',
]);
const MONEY_KEYS = new Set(['net_profit', 'final_equity', 'avg_win', 'avg_loss', 'best_trade', 'worst_trade', 'expectancy']);

const MetricsGrid: React.FC<{ metrics: Record<string, any> }> = ({ metrics }) => (
  <div className="max-h-80 space-y-3 overflow-auto pr-1">
    {METRIC_GROUPS.map((g) => (
      <div key={g.title}>
        <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {g.title}
        </h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {g.keys
            .filter((k) => metrics[k] !== undefined && metrics[k] !== null)
            .map((k) => (
              <div key={k} className="flex justify-between text-xs">
                <dt className="text-gray-500 dark:text-gray-400">{fmt.label(k)}</dt>
                <dd className="tabular-nums font-medium text-gray-800 dark:text-gray-100">
                  {PCT_KEYS.has(k) ? fmt.pct(metrics[k]) : MONEY_KEYS.has(k) ? fmt.money(metrics[k]) : fmt.num(metrics[k])}
                </dd>
              </div>
            ))}
        </dl>
      </div>
    ))}
  </div>
);

/* ── Trades ──────────────────────────────────────────────────────────── */

const Trades: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');
  const all = useMemo(() => report.trades || [], [report.trades]);
  const rows = useMemo(
    () =>
      filter === 'all' ? all : all.filter((t) => (filter === 'wins' ? t.net_pnl > 0 : t.net_pnl <= 0)),
    [all, filter]
  );

  const cols: Column<TradeRow>[] = [
    { key: 'id', header: '#', render: (t) => t.trade_id },
    { key: 'sym', header: 'Symbol', render: (t) => t.instrument },
    { key: 'dir', header: 'Side', render: (t) => t.direction },
    { key: 'in', header: 'Entry', render: (t) => `${fmt.date(t.entry_time)} @ ${fmt.num(t.entry_price)}` },
    { key: 'out', header: 'Exit', render: (t) => `${fmt.date(t.exit_time)} @ ${fmt.num(t.exit_price)}` },
    { key: 'qty', header: 'Qty', align: 'right', render: (t) => fmt.int(t.quantity) },
    { key: 'gross', header: 'Gross', align: 'right', render: (t) => fmt.money(t.gross_pnl) },
    { key: 'cost', header: 'Costs', align: 'right', render: (t) => fmt.money(t.costs) },
    {
      key: 'net',
      header: 'Net',
      align: 'right',
      render: (t) => (
        <span className={t.net_pnl > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
          {fmt.money(t.net_pnl)}
        </span>
      ),
    },
    { key: 'r', header: 'R', align: 'right', render: (t) => (t.r_multiple === null ? '—' : fmt.num(t.r_multiple, 2)) },
    { key: 'bars', header: 'Bars', align: 'right', render: (t) => fmt.int(t.bars_held) },
    { key: 'mae', header: 'MAE', align: 'right', render: (t) => fmt.pct(t.mae, 1) },
    { key: 'mfe', header: 'MFE', align: 'right', render: (t) => fmt.pct(t.mfe, 1) },
    { key: 'why', header: 'Exit reason', render: (t) => fmt.label(t.exit_reason) },
  ];

  const attribution = report.diagnostics?.attribution || {};

  return (
    <div className="space-y-4">
      <Card
        title={`Trade ledger — ${all.length} closed round trips`}
        subtitle="Gross P&L, transaction costs and net P&L are shown per trade. MAE and MFE record how far each position ran against and in favour of you before it closed."
        right={
          <div className="flex gap-1">
            {(['all', 'wins', 'losses'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-primary-500/15 text-primary-700 dark:text-primary-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-background-tertiary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        <DataTable columns={cols} rows={rows} empty="This strategy never opened a position." maxHeight="30rem" />
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="By instrument">
          <BarList
            rows={(attribution.by_instrument || []).map((r: any) => ({
              label: `${r.instrument} (${r.trades})`,
              value: r.net_pnl,
              hint: `hit rate ${fmt.pct(r.hit_rate, 0)}`,
            }))}
            format={fmt.money}
            diverging
          />
        </Card>
        <Card title="By exit reason">
          <BarList
            rows={(attribution.by_exit_reason || []).map((r: any) => ({
              label: `${fmt.label(r.exit_reason)} (${r.trades})`,
              value: r.net_pnl,
              hint: `hit rate ${fmt.pct(r.hit_rate, 0)}`,
            }))}
            format={fmt.money}
            diverging
          />
        </Card>
        <Card title="Trade concentration" subtitle={report.diagnostics?.trade_concentration?.note}>
          <ConcentrationPanel data={report.diagnostics?.trade_concentration} />
        </Card>
      </div>
    </div>
  );
};

const ConcentrationPanel: React.FC<{ data: any }> = ({ data }) => {
  if (!data?.available) return <Empty>Not enough trades.</Empty>;
  const rows = [
    { label: 'All trades', value: data.total_net_pnl },
    { label: 'Excluding best 1', value: data.net_pnl_excluding_top1 },
    { label: 'Excluding best 5', value: data.net_pnl_excluding_top5 },
    { label: 'Excluding best 10', value: data.net_pnl_excluding_top10 },
  ].filter((r) => r.value !== null && r.value !== undefined);
  return (
    <>
      <BarList rows={rows} format={fmt.money} diverging />
      <Note tone={data.top5_contribution_pct > 90 ? 'warn' : 'info'}>
        The best trade produced {fmt.num(data.best_trade_contribution_pct, 0)}% of the net result;
        the best five produced {fmt.num(data.top5_contribution_pct, 0)}%.
      </Note>
    </>
  );
};

/* ── Costs ───────────────────────────────────────────────────────────── */

const Costs: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const w = report.cost_waterfall;
  const schedule = report.cost_schedule || {};
  const components = Object.entries(w?.components || {}).map(([k, v]) => ({
    label: fmt.label(k),
    value: -Math.abs(v as number),
  }));

  return (
    <div className="space-y-4">
      <Card
        title="Cost waterfall"
        subtitle="Gross P&L minus every levy and every rupee of slippage equals net P&L, exactly. Nothing is estimated."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Gross P&L" value={fmt.money(w?.gross_pnl)} tone={(w?.gross_pnl ?? 0) > 0 ? 'good' : 'bad'} />
          <StatTile
            label="Total deducted"
            value={fmt.money(-(Math.abs(w?.total_costs ?? 0) + Math.abs(w?.total_slippage_and_impact ?? 0)))}
            sub={w?.cost_as_pct_of_gross !== null ? `${fmt.num(w?.cost_as_pct_of_gross, 1)}% of gross P&L` : undefined}
            tone="bad"
          />
          <StatTile label="Net P&L" value={fmt.money(w?.net_pnl)} tone={(w?.net_pnl ?? 0) > 0 ? 'good' : 'bad'} />
        </div>
        <div className="mt-4">
          <BarList rows={components} format={fmt.money} diverging />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title={`Cost schedule — ${schedule.label || ''}`}
          subtitle={`Version ${schedule.schedule_id}, effective from ${schedule.effective_from}, verified ${schedule.verified_on}.`}
        >
          <DataTable
            columns={[
              { key: 'n', header: 'Charge', render: (c: any) => fmt.label(c.name) },
              { key: 'r', header: 'Rate', align: 'right', render: (c: any) => `${(c.rate * 100).toFixed(5)}%` },
              { key: 's', header: 'Side', render: (c: any) => c.side },
              { key: 'm', header: 'Min / Max', align: 'right', render: (c: any) => `${c.minimum || 0} / ${c.maximum ?? '—'}` },
            ]}
            rows={schedule.components || []}
            maxHeight="16rem"
          />
          <Note tone="warn">{schedule.disclaimer}</Note>
          <Note>{schedule.source_note}</Note>
        </Card>

        <Card title="Cost sensitivity" subtitle="What the same signals produce at 1.5x and 2x the charge schedule.">
          {report.cost_sensitivity?.available ? (
            <DataTable
              columns={[
                { key: 'm', header: 'Cost multiple', render: (r: any) => r.multiple },
                { key: 'r', header: 'Total return', align: 'right', render: (r: any) => fmt.pct(r.total_return) },
                { key: 's', header: 'Sharpe', align: 'right', render: (r: any) => fmt.num(r.sharpe) },
                { key: 'p', header: 'Net profit', align: 'right', render: (r: any) => fmt.money(r.net_profit) },
              ]}
              rows={report.cost_sensitivity.ladder || []}
            />
          ) : (
            <Empty>Cost stress testing was not run.</Empty>
          )}
          <Note tone="warn">{report.capital_gains_note?.note}</Note>
        </Card>
      </div>

      <Card title="Cash ledger (most recent 400 entries)" subtitle="Every cash movement, with the fill or corporate action that caused it.">
        <DataTable
          columns={[
            { key: 't', header: 'When', render: (r: any) => fmt.date(r.timestamp) },
            { key: 'k', header: 'Kind', render: (r: any) => fmt.label(r.kind) },
            { key: 'i', header: 'Instrument', render: (r: any) => r.instrument },
            { key: 'a', header: 'Amount', align: 'right', render: (r: any) => fmt.money(r.amount) },
            { key: 'b', header: 'Balance', align: 'right', render: (r: any) => fmt.money(r.balance) },
            { key: 'n', header: 'Note', render: (r: any) => r.note },
          ]}
          rows={report.ledger || []}
          maxHeight="24rem"
        />
      </Card>
    </div>
  );
};

/* ── Validation ──────────────────────────────────────────────────────── */

const Validation: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const wf = report.walk_forward || {};

  if (!wf.available) {
    return (
      <Card title="Walk-forward validation">
        <Empty>{wf.reason || 'Walk-forward validation was not run for this experiment.'}</Empty>
        <Note tone="warn">
          Without walk-forward, every number in this report is in-sample. The engine will not
          label a result Validated or Robust on in-sample evidence alone.
        </Note>
      </Card>
    );
  }

  const folds = (wf.windows || []).filter((f: any) => f.test);

  return (
    <div className="space-y-4">
      <Card title="Out-of-sample summary" subtitle={wf.note}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Folds" value={fmt.int(wf.folds)} sub={`${wf.oos_total_trades} OOS trades`} />
          <StatTile
            label="OOS compounded"
            value={fmt.pct(wf.oos_compounded_return)}
            tone={(wf.oos_compounded_return ?? 0) > 0 ? 'good' : 'bad'}
          />
          <StatTile label="Consistency" value={fmt.pct(wf.consistency, 0)} sub={`${wf.positive_folds}/${wf.folds} positive`} />
          <StatTile label="Worst fold" value={fmt.pct(wf.oos_worst_fold_return)} tone="bad" />
        </div>
        <div className="mt-4">
          <BarList
            rows={folds.map((f: any) => ({
              label: `${f.label} · ${fmt.date(f.test_start)}`,
              value: f.test.total_return ?? 0,
              hint: `${f.test.total_trades} trades, Sharpe ${fmt.num(f.test.sharpe)}`,
            }))}
            format={(v) => fmt.pct(v, 1)}
            diverging
          />
        </div>
      </Card>

      <Card
        title="Fold schedule"
        subtitle={`Train ${wf.schedule?.train} → test ${wf.schedule?.test}, stepping ${wf.schedule?.step}. A ${wf.schedule?.purge_bars}-bar purge and a ${wf.schedule?.embargo_bars}-bar embargo separate every train and test window.`}
      >
        <DataTable
          columns={[
            { key: 'l', header: 'Fold', render: (f: any) => f.label },
            { key: 'tr', header: 'Train window', render: (f: any) => `${fmt.date(f.train_start)} → ${fmt.date(f.train_end)}` },
            { key: 'te', header: 'Test window', render: (f: any) => `${fmt.date(f.test_start)} → ${fmt.date(f.test_end)}` },
            { key: 'ir', header: 'IS return', align: 'right', render: (f: any) => fmt.pct(f.train?.total_return) },
            { key: 'or', header: 'OOS return', align: 'right', render: (f: any) => (
              <span className={(f.test?.total_return ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {fmt.pct(f.test?.total_return)}
              </span>
            ) },
            { key: 'os', header: 'OOS Sharpe', align: 'right', render: (f: any) => fmt.num(f.test?.sharpe) },
            { key: 'ot', header: 'OOS trades', align: 'right', render: (f: any) => fmt.int(f.test?.total_trades) },
          ]}
          rows={folds}
          maxHeight="24rem"
        />
        <Note>
          <strong>Purge:</strong> {wf.schedule?.purge_rationale}. <strong>Embargo:</strong>{' '}
          {wf.schedule?.embargo_rationale}.
        </Note>
      </Card>
    </div>
  );
};

/* ── Robustness ──────────────────────────────────────────────────────── */

const Robustness: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const rb = report.robustness || {};
  const st = report.stress_matrix || {};

  return (
    <div className="space-y-4">
      <Card
        title="Parameter robustness"
        subtitle="Each row moves ONE parameter and re-runs everything else unchanged. A broad plateau beats a narrow profitable spike."
      >
        {rb.available ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Stability" value={fmt.num(rb.stability, 2)} sub="median / best neighbour" />
              <StatTile label="Best neighbour" value={fmt.num(rb.best_score)} />
              <StatTile label="Worst neighbour" value={fmt.num(rb.worst_score)} tone="bad" />
              <StatTile label="Verdict" value={fmt.label(rb.verdict || '')} />
            </div>
            <Note tone={rb.verdict === 'plateau' ? 'info' : 'warn'}>{rb.verdict_text}</Note>
            <div className="mt-3">
              <DataTable
                columns={[
                  { key: 'l', header: 'Variant', render: (r: any) => r.label },
                  { key: 'v', header: 'Value', align: 'right', render: (r: any) => String(r.value) },
                  { key: 's', header: `Score (${rb.score_metric})`, align: 'right', render: (r: any) => (r.score === null ? r.error || '—' : fmt.num(r.score)) },
                  { key: 'r', header: 'Total return', align: 'right', render: (r: any) => fmt.pct(r.total_return) },
                  { key: 'd', header: 'Max DD', align: 'right', render: (r: any) => fmt.pct(r.max_drawdown) },
                  { key: 't', header: 'Trades', align: 'right', render: (r: any) => fmt.int(r.total_trades) },
                ]}
                rows={rb.rows || []}
                maxHeight="22rem"
              />
            </div>
          </>
        ) : (
          <Empty>{rb.reason || 'Parameter robustness was not run.'}</Empty>
        )}
      </Card>

      <Card
        title="Realism stress matrix"
        subtitle="Each scenario changes exactly one assumption relative to base, so every delta is attributable."
      >
        {st.available ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatTile
                label="Survival rate"
                value={fmt.pct(st.survival_rate, 0)}
                sub={`${st.scenarios_survived}/${st.scenarios_tested} stayed positive`}
                tone={(st.survival_rate ?? 0) >= 0.7 ? 'good' : 'bad'}
              />
            </div>
            <div className="mt-3">
              <DataTable
                columns={[
                  { key: 'l', header: 'Scenario', render: (r: any) => r.label },
                  { key: 'r', header: 'Total return', align: 'right', render: (r: any) => (r.error ? '—' : fmt.pct(r.total_return)) },
                  { key: 'd', header: 'vs base', align: 'right', render: (r: any) => (r.return_delta === undefined ? '—' : fmt.pct(r.return_delta)) },
                  { key: 's', header: 'Sharpe', align: 'right', render: (r: any) => fmt.num(r.sharpe) },
                  { key: 'm', header: 'Max DD', align: 'right', render: (r: any) => fmt.pct(r.max_drawdown) },
                  { key: 't', header: 'Trades', align: 'right', render: (r: any) => fmt.int(r.total_trades) },
                  {
                    key: 'v',
                    header: 'Survives',
                    render: (r: any) =>
                      r.survives === undefined ? (
                        <span className="text-gray-400">—</span>
                      ) : r.survives ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓ yes</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">✗ no</span>
                      ),
                  },
                ]}
                rows={st.rows || []}
                maxHeight="24rem"
              />
            </div>
            <Note>{st.note}</Note>
          </>
        ) : (
          <Empty>{st.reason || 'The stress matrix was not run.'}</Empty>
        )}
      </Card>
    </div>
  );
};

/* ── Diagnostics ─────────────────────────────────────────────────────── */

const Diagnostics: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const d = report.diagnostics || {};
  const regimes = report.regimes || {};
  const mc = d.monte_carlo || {};
  const bs = d.bootstrap || {};

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Return distribution" subtitle="Per-bar net returns. Red bars are losing bars, blue winning ones.">
          {d.return_distribution?.available ? (
            <>
              <Histogram bins={d.return_distribution.histogram} format={(v) => fmt.pct(v, 1)} />
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {Object.entries(d.return_distribution.percentiles || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                    <dd className="tabular-nums font-medium text-gray-800 dark:text-gray-100">{fmt.pct(v as number)}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <Empty>Not enough observations.</Empty>
          )}
        </Card>

        <Card title="Bootstrap confidence bands" subtitle={bs.method}>
          {bs.available ? (
            <>
              <DataTable
                columns={[
                  { key: 'm', header: 'Metric', render: (r: any) => fmt.label(r.metric) },
                  { key: '5', header: 'p05', align: 'right', render: (r: any) => (r.metric === 'sharpe' ? fmt.num(r.p05) : fmt.pct(r.p05)) },
                  { key: '25', header: 'p25', align: 'right', render: (r: any) => (r.metric === 'sharpe' ? fmt.num(r.p25) : fmt.pct(r.p25)) },
                  { key: 'md', header: 'Median', align: 'right', render: (r: any) => (r.metric === 'sharpe' ? fmt.num(r.median) : fmt.pct(r.median)) },
                  { key: '75', header: 'p75', align: 'right', render: (r: any) => (r.metric === 'sharpe' ? fmt.num(r.p75) : fmt.pct(r.p75)) },
                  { key: '95', header: 'p95', align: 'right', render: (r: any) => (r.metric === 'sharpe' ? fmt.num(r.p95) : fmt.pct(r.p95)) },
                ]}
                rows={bs.bands || []}
              />
              <Note>{bs.note}</Note>
            </>
          ) : (
            <Empty>{bs.reason || 'Bootstrap not run.'}</Empty>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Monte Carlo — trade order reshuffle" subtitle={mc.label}>
          {mc.available ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Median final equity" value={fmt.money(mc.final_equity?.median)} sub={`p05 ${fmt.money(mc.final_equity?.p05)}`} />
                <StatTile label="Probability of loss" value={fmt.pct(mc.probability_of_loss, 0)} tone="bad" sub={`worst DD ${fmt.pct(mc.max_drawdown?.worst)}`} />
              </div>
              <Note tone="warn">{mc.note}</Note>
            </>
          ) : (
            <Empty>{mc.reason || 'Monte Carlo not run.'}</Empty>
          )}
        </Card>

        <Card
          title="Regime breakdown"
          subtitle={
            regimes.definition
              ? `Trend: ${regimes.definition.trend}. Volatility: ${regimes.definition.volatility}.`
              : undefined
          }
        >
          {regimes.available ? (
            <>
              <DataTable
                columns={[
                  { key: 'r', header: 'Regime', render: (r: any) => r.regime },
                  { key: 'b', header: 'Bars', align: 'right', render: (r: any) => fmt.int(r.bars) },
                  { key: 't', header: 'Share', align: 'right', render: (r: any) => fmt.pct(r.share_of_time, 0) },
                  { key: 'm', header: 'Ann. return', align: 'right', render: (r: any) => fmt.pct(r.mean_return_annualized) },
                  { key: 's', header: 'Sharpe', align: 'right', render: (r: any) => fmt.num(r.sharpe) },
                ]}
                rows={regimes.by_bar || []}
                maxHeight="16rem"
              />
              <Note>{regimes.note}</Note>
            </>
          ) : (
            <Empty>{regimes.reason || 'Not enough observations to condition on regime.'}</Empty>
          )}
        </Card>
      </div>
    </div>
  );
};

/* ── Audit ───────────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<string, string> = {
  pass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  warn: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
};

const STATUS_ICON: Record<string, string> = { pass: '✓', warn: '⚠', info: 'ℹ' };

const Audit: React.FC<{ report: BacktestReport }> = ({ report }) => {
  const liq = report.liquidity || {};
  const orders = report.orders || {};

  return (
    <div className="space-y-4">
      <Card
        title="Bias audit"
        subtitle="What this engine checked about itself. Reported whether or not the news is good."
      >
        <ul className="space-y-2">
          {(report.bias_audit || []).map((c, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-gray-200 dark:border-gray-700/70 p-3">
              <Pill className={`${STATUS_STYLE[c.status] || STATUS_STYLE.info} shrink-0 self-start`}>
                <span aria-hidden>{STATUS_ICON[c.status] || 'ℹ'}</span>
                {c.status}
              </Pill>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{c.check}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Execution model" subtitle={report.execution_model?.realism_note}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {Object.entries(report.execution_model || {})
              .filter(([k]) => k !== 'realism_note')
              .map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{fmt.label(k)}</dt>
                  <dd className="tabular-nums font-medium text-gray-800 dark:text-gray-100">{String(v)}</dd>
                </div>
              ))}
          </dl>
          <h4 className="mt-4 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Risk rules applied
          </h4>
          <dl className="grid grid-cols-1 gap-y-1 text-xs">
            {Object.entries(report.risk_rules || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">{fmt.label(k)}</dt>
                <dd className="text-right font-medium text-gray-800 dark:text-gray-100">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Liquidity feasibility" subtitle={liq.warning}>
          {liq.available ? (
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Entry orders" value={fmt.int(liq.entry_orders)} />
              <StatTile
                label="Size-capped by liquidity"
                value={`${fmt.num(liq.liquidity_constrained_pct, 1)}%`}
                tone={liq.liquidity_constrained_pct > 5 ? 'bad' : 'neutral'}
              />
              <StatTile label="Capped by cash" value={`${fmt.num(liq.cash_constrained_pct, 1)}%`} />
              <StatTile label="Max participation" value={fmt.pct(liq.max_participation, 2)} sub={`limit ${fmt.pct(liq.participation_rate, 1)}`} />
            </div>
          ) : (
            <Empty>No entry orders were generated.</Empty>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Orders" subtitle={orders.note}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Created" value={fmt.int(orders.total_created)} />
            <StatTile label="Filled" value={fmt.int(orders.filled)} />
            <StatTile label="Partial" value={fmt.int(orders.partially_filled)} />
            <StatTile label="Never filled" value={fmt.int(orders.unfilled_or_expired)} tone={orders.unfilled_or_expired ? 'bad' : 'neutral'} />
          </div>
          {!!(orders.rejections || []).length && (
            <div className="mt-3">
              <DataTable
                columns={[
                  { key: 't', header: 'When', render: (r: any) => fmt.date(r.timestamp) },
                  { key: 'i', header: 'Instrument', render: (r: any) => r.instrument },
                  { key: 'n', header: 'Intent', render: (r: any) => r.intent },
                  { key: 'r', header: 'Why it did not fill', render: (r: any) => r.reason },
                ]}
                rows={orders.rejections}
                maxHeight="16rem"
              />
            </div>
          )}
        </Card>

        <Card title="Data quality" subtitle="Every correction the feed applied before the strategy saw a single bar.">
          {Object.entries(report.data_quality || {}).map(([sym, q]: [string, any]) => (
            <div key={sym} className="mb-3 last:mb-0">
              <h4 className="mb-1 text-xs font-semibold text-gray-800 dark:text-gray-100">{sym}</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
                {['rows_in', 'rows_out', 'duplicate_timestamps', 'out_of_order', 'impossible_ohlc',
                  'non_positive_price', 'zero_volume_bars', 'missing_bars_estimated', 'quarantined'].map((k) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">{fmt.label(k)}</dt>
                    <dd className="tabular-nums text-gray-800 dark:text-gray-100">{fmt.int(q[k])}</dd>
                  </div>
                ))}
              </dl>
              {!!(q.corporate_actions || []).length && (
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {q.corporate_actions.length} corporate action(s) applied:{' '}
                  {q.corporate_actions.slice(0, 3).map((a: any) => `${a.type} ${a.date}`).join(', ')}
                  {q.corporate_actions.length > 3 ? '…' : ''}
                </p>
              )}
              {(q.notes || []).map((n: string, i: number) => (
                <Note key={i} tone="warn">{n}</Note>
              ))}
            </div>
          ))}
        </Card>
      </div>

      <Card title="Reproducibility" subtitle="Everything needed to reproduce this run exactly. The same configuration always yields the same run id.">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
          {['run_id', 'engine_version', 'strategy_hash', 'data_version', 'timeframe', 'seed',
            'cost_schedule', 'intrabar_policy', 'survivorship_mode', 'start', 'end', 'initial_capital'].map((k) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-gray-500 dark:text-gray-400">{fmt.label(k)}</dt>
              <dd className="truncate font-mono text-[11px] text-gray-800 dark:text-gray-100" title={String(report.run?.[k])}>
                {String(report.run?.[k])}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
};
