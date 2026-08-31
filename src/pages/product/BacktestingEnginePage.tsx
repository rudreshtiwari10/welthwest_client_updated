/**
 * BacktestingEnginePage – /product/backtesting-engine
 *
 * E-E-A-T: Expertise signal. Product sub-page for the Backtesting Engine.
 * SEO req (MD §3): Inputs, outputs, use-cases, key term definitions.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

const BacktestingEnginePage: React.FC = () => {
  usePageMeta({
    title: 'Backtesting Engine – Test Trading Strategies on Indian Markets | WelthWest',
    description:
      'No-code backtesting on 10+ years of NSE/BSE data. Evaluate CAGR, max drawdown, Sharpe ratio, and trade-level P&L for any rule-based strategy.',
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-gray-800 dark:text-gray-200">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-1">
          <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link></li>
          <li className="mx-1">/</li>
          <li><Link to="/product/backtesting-engine" className="text-primary-600 dark:text-primary-400">Backtesting Engine</Link></li>
        </ol>
      </nav>

      {/* ── Page header ── */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Backtesting Engine
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Test any rule-based trading idea against 10+ years of Indian market data —
          no coding required.
        </p>
      </header>

      {/* ── Key Terms ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Key Terms
        </h2>
        <dl className="space-y-4">
          {[
            {
              term: 'Backtesting',
              def: 'Simulating a trading strategy on historical price data to evaluate how it would have performed in the past. Backtested results do not guarantee future performance.',
            },
            {
              term: 'CAGR (Compound Annual Growth Rate)',
              def: 'The annualised return of the strategy over the backtest period, accounting for compounding.',
            },
            {
              term: 'Max Drawdown',
              def: 'The largest peak-to-trough decline in portfolio value during the backtest. A key measure of strategy risk.',
            },
            {
              term: 'Sharpe Ratio',
              def: 'Return per unit of total risk (standard deviation). A Sharpe ratio above 1.0 is generally considered good; above 2.0 is excellent.',
            },
            {
              term: 'Sortino Ratio',
              def: 'Like Sharpe, but only penalises downside volatility — giving a better picture for strategies with asymmetric returns.',
            },
            {
              term: 'Regime',
              def: 'The prevailing behavioural state of the market (Bullish, Bearish, Transitional). You can add a regime filter to your backtest to only trade in specific market conditions.',
            },
          ].map(({ term, def }) => (
            <div key={term} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <dt className="font-semibold text-gray-900 dark:text-white mb-1">{term}</dt>
              <dd className="text-sm text-gray-700 dark:text-gray-300">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Inputs ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Inputs
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Symbol(s):</strong> Any NSE/BSE-listed stock, index, or ETF</li>
          <li><strong>Date range:</strong> From 2014 onwards (up to the current date)</li>
          <li><strong>Entry rule:</strong> e.g. "Buy when 20-day EMA crosses above 50-day EMA"</li>
          <li><strong>Exit rule:</strong> e.g. "Sell when price falls more than 5% from entry"</li>
          <li><strong>Position sizing:</strong> Fixed capital, fixed shares, or % of portfolio</li>
          <li><strong>Regime filter (optional):</strong> Only take trades when WelthAI regime is Bullish</li>
        </ul>
      </section>

      {/* ── Outputs ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Outputs
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>CAGR, Sharpe Ratio, Sortino Ratio, Max Drawdown</li>
          <li>Win rate (% of trades that were profitable)</li>
          <li>Average win / average loss ratio</li>
          <li>Full trade log (entry date, exit date, P&L per trade)</li>
          <li>Equity curve chart</li>
          <li>Benchmark comparison (vs NIFTY 50 buy-and-hold)</li>
        </ul>
      </section>

      {/* ── Example Workflow ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Example Workflow
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700 dark:text-gray-300">
          <li>Select <strong>NIFTY 50</strong> as the symbol, date range 2015–2024.</li>
          <li>Set entry rule: <em>"Buy when RSI(14) crosses below 30"</em> (oversold reversal).</li>
          <li>Set exit rule: <em>"Sell after 10 trading days or if price falls 3% from entry"</em>.</li>
          <li>Add regime filter: <em>"Only trade when WelthAI regime is Bullish or Transitional"</em>.</li>
          <li>Run backtest. Review results: CAGR, max drawdown, trade log.</li>
          <li>Iterate — adjust parameters to understand strategy sensitivity.</li>
        </ol>
      </section>

      {/* ── Limitations ── */}
      <section className="mb-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
        <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-3">
          Important Limitations
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-yellow-700 dark:text-yellow-200">
          <li>Backtested performance does not predict future results.</li>
          <li>Transaction costs are modelled at simplified rates; real costs may differ.</li>
          <li>Backtesting on the same dataset used for strategy discovery can produce overfit, overly optimistic results.</li>
          <li>Survivorship bias may exist for single-stock universes; prefer index-level tests for broad strategies.</li>
          <li>WelthWest does not provide investment advice. Backtest results are for research purposes only.</li>
        </ul>
      </section>

      {/* ── CTA ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/backtest"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-md text-center"
        >
          Open Backtesting Engine
        </Link>
        <Link
          to="/technical-overview"
          className="px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg font-medium transition-colors text-center"
        >
          Technical Overview
        </Link>
      </div>

      {/* ── Sibling products ── */}
      <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Other Products</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/product/market-regime" className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all">
            <span className="block font-semibold text-gray-900 dark:text-white">Market Regime</span>
            <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">Know whether the market is Bullish, Bearish, or Transitional</span>
          </Link>
          <Link to="/product/anomaly-detector" className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all">
            <span className="block font-semibold text-gray-900 dark:text-white">Anomaly Detector</span>
            <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">Flag unusual market behaviour before it hits your P&L</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BacktestingEnginePage;
