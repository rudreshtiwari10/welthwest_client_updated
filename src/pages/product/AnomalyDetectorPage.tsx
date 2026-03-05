/**
 * AnomalyDetectorPage – /product/anomaly-detector
 *
 * E-E-A-T: Expertise signal. Product sub-page for the Anomaly Detector.
 * SEO req (MD §3): Inputs, outputs, use-cases, key term definitions.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

const AnomalyDetectorPage: React.FC = () => {
  usePageMeta({
    title: 'WelthAI Anomaly Detector – Spot Unusual Market Behaviour | WelthWest',
    description:
      'WelthAI Anomaly Detector flags statistically unusual price, volume, and volatility behaviour in Indian equities before it impacts your positions.',
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-gray-800 dark:text-gray-200">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-1">
          <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link></li>
          <li className="mx-1">/</li>
          <li><Link to="/product/anomaly-detector" className="text-primary-600 dark:text-primary-400">Anomaly Detector</Link></li>
        </ol>
      </nav>

      {/* ── Page header ── */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          WelthAI Anomaly Detector
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Get alerted when the market is behaving in a statistically unusual way
          — before it turns into a loss.
        </p>
      </header>

      {/* ── What is an Anomaly? ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          What Is a Market Anomaly?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          A <dfn className="font-semibold">market anomaly</dfn> is an event where
          one or more market variables (price, volume, implied volatility, open
          interest) deviate significantly from their historical distribution — beyond
          what can be explained by normal noise.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Anomalies often precede high-impact events: earnings surprises, RBI policy
          shifts, global macro shocks, or large block trades. Identifying them early
          gives traders the opportunity to review positions proactively rather than
          reacting after the fact.
        </p>
      </section>

      {/* ── Inputs ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          What the Model Analyses
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Price behaviour:</strong> Intraday gaps, range expansion, closing position relative to the day's range</li>
          <li><strong>Volume:</strong> Unusual volume surges relative to 20-day and 60-day moving averages</li>
          <li><strong>Implied Volatility (IV):</strong> Spikes in NIFTY VIX or single-stock IV</li>
          <li><strong>Open Interest (OI):</strong> Sudden OI changes in futures and options that suggest large institutional activity</li>
        </ul>
      </section>

      {/* ── Output: Anomaly Score ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Output: Anomaly Score (0–100)
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Each day (and intraday, where data is available) the Anomaly Detector
          produces a score:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { range: '0–30', label: 'Normal', color: 'green', desc: 'Market is behaving within expected historical bounds.' },
            { range: '31–65', label: 'Elevated', color: 'yellow', desc: 'Some unusual behaviour detected. Monitor positions and avoid increasing risk.' },
            { range: '66–100', label: 'High Anomaly', color: 'red', desc: 'Statistically rare behaviour. Review open positions before adding new risk.' },
          ].map(({ range, label, color, desc }) => (
            <div
              key={label}
              className={`rounded-xl p-4 border ${
                color === 'green'
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : color === 'red'
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
              }`}
            >
              <span
                className={`text-2xl font-bold block mb-1 ${
                  color === 'green'
                    ? 'text-green-700 dark:text-green-400'
                    : color === 'red'
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-yellow-700 dark:text-yellow-400'
                }`}
              >
                {range}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white block mb-1">{label}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Example Workflow ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Example Workflow
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700 dark:text-gray-300">
          <li>
            An options seller opens a BANKNIFTY short strangle every Monday.
          </li>
          <li>
            Before placing the trade, she checks the WelthAI Anomaly Score.
            Today it reads <strong>72 / High Anomaly</strong> — unusual OI accumulation
            detected in weekly expiry puts.
          </li>
          <li>
            She defers the trade for 24 hours. The next day, BANKNIFTY drops 2.8%
            on RBI commentary. Her short strangle would have lost ₹18,000.
          </li>
          <li>
            On Tuesday the anomaly score drops to 28 / Normal. She places the trade
            with full size.
          </li>
        </ol>
      </section>

      {/* ── Use Cases ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Who Uses It
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Options sellers</strong> — Avoid selling premium into anomalous IV environments</li>
          <li><strong>Intraday traders</strong> — Reduce size on high-anomaly days</li>
          <li><strong>Swing traders</strong> — Use score as a filter before entry</li>
          <li><strong>Risk managers</strong> — Daily pre-market risk briefing for the desk</li>
        </ul>
      </section>

      {/* ── CTA ── */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link
          to="/register"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-md text-center"
        >
          Try Anomaly Detector Free
        </Link>
        <Link
          to="/technical-overview"
          className="px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg font-medium transition-colors text-center"
        >
          Technical Details
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
          <Link to="/product/backtesting-engine" className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all">
            <span className="block font-semibold text-gray-900 dark:text-white">Backtesting Engine</span>
            <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">Test your ideas against 10 years of Indian market data</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AnomalyDetectorPage;
