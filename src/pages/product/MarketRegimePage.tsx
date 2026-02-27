/**
 * MarketRegimePage – /product/market-regime
 *
 * E-E-A-T: Expertise signal. Product sub-page for the Market Regime feature.
 * SEO req (MD §3): Clear description of inputs, outputs, use-cases, and
 * definitions of key terms.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

const MarketRegimePage: React.FC = () => {
  usePageMeta({
    title: 'WelthAI Market Regime – Detect Regime Shifts & Anomalies | WelthWest',
    description:
      'WelthAI Market Regime classifies the current Indian equity market as Bullish, Bearish, or Transitional using AI. Reduce risk by aligning positions to the prevailing regime.',
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-gray-800 dark:text-gray-200">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-1">
          <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link></li>
          <li className="mx-1">/</li>
          <li><Link to="/product/market-regime" className="text-primary-600 dark:text-primary-400">Market Regime</Link></li>
        </ol>
      </nav>

      {/* ── Page header ── */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          WelthAI Market Regime
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Know whether the market is in a <strong>Bullish</strong>, <strong>Bearish</strong>,
          or <strong>Transitional</strong> phase — every trading day, powered by AI.
        </p>
      </header>

      {/* ── What is a "Regime"? ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          What Is a Market Regime?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          A <dfn className="font-semibold">market regime</dfn> describes the dominant
          behavioural state of the market at any given time. Unlike a trend indicator
          (which lags price), a regime classifier tries to identify <em>structural</em>{' '}
          shifts in how the market is distributing risk and return.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Understanding the regime helps traders and fund managers make better
          sizing, hedging, and allocation decisions — independently of whether they
          are predicting specific price targets.
        </p>
      </section>

      {/* ── Inputs ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Inputs
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Daily OHLCV data for NIFTY 50 and sector indices</li>
          <li>Derivatives signals: put-call ratio (PCR), open interest changes</li>
          <li>Moving-average momentum features (short, medium, long-term)</li>
          <li>Market-breadth indicators: advance-decline ratio, new highs/lows</li>
        </ul>
      </section>

      {/* ── Outputs ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Outputs
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Bullish', color: 'green', desc: 'Sustained uptrend with momentum confirmation. Typically favours long exposure.' },
            { label: 'Bearish', color: 'red', desc: 'Sustained downtrend or distribution phase. Typically favours reduced exposure or hedging.' },
            { label: 'Transitional', color: 'yellow', desc: 'Choppy, range-bound, or direction-uncertain environment. Calls for caution and smaller positions.' },
          ].map(({ label, color, desc }) => (
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
              <h3
                className={`font-bold text-lg mb-1 ${
                  color === 'green'
                    ? 'text-green-700 dark:text-green-400'
                    : color === 'red'
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-yellow-700 dark:text-yellow-400'
                }`}
              >
                {label}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Each classification also comes with a <strong>confidence score</strong> (0–100%)
          indicating how strongly the model favours that regime.
        </p>
      </section>

      {/* ── Example Workflow ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Example Workflow
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Morning check (pre-market):</strong> A prop desk checks the WelthAI
            regime dashboard. Today's classification is <em>Bearish</em> with 78%
            confidence.
          </li>
          <li>
            <strong>Position sizing:</strong> Per the desk's risk rules, a Bearish regime
            triggers a 40% reduction in intraday long exposure for that session.
          </li>
          <li>
            <strong>Hedge activation:</strong> The desk adds a NIFTY put spread to hedge
            the residual book.
          </li>
          <li>
            <strong>End-of-day review:</strong> The regime classification is logged.
            If it flips to Transitional the next day, the desk re-evaluates its hedge.
          </li>
        </ol>
      </section>

      {/* ── Use Cases ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Who Uses It
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li><strong>Prop traders</strong> — Adjust intraday risk limits based on regime</li>
          <li><strong>PMS / AIF managers</strong> — Tilt equity exposure between regime transitions</li>
          <li><strong>Options sellers</strong> — Avoid naked short positions on bearish or transitional days</li>
          <li><strong>Algo developers</strong> — Add a regime filter to reduce false signals in trend-following systems</li>
        </ul>
      </section>

      {/* ── CTA ── */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link
          to="/ai-screener"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-md text-center"
        >
          Try Market Regime Now
        </Link>
        <Link
          to="/technical-overview"
          className="px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg font-medium transition-colors text-center"
        >
          Technical Details
        </Link>
        <Link
          to="/case-studies"
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-center"
        >
          See Case Studies
        </Link>
      </div>

      {/* ── Sibling products ── */}
      <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Other Products
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/product/anomaly-detector" className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all">
            <span className="block font-semibold text-gray-900 dark:text-white">Anomaly Detector</span>
            <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">Flag unusual market behaviour before it hits your P&L</span>
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

export default MarketRegimePage;
