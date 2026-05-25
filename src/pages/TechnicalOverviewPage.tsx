/**
 * TechnicalOverviewPage – /technical-overview
 *
 * E-E-A-T: Expertise signal. Explains the AI approach, data sources, model
 * types, validation methodology, and limitations at a level suitable for
 * technically sophisticated traders and fund managers.
 *
 * SEO req (MD §3): Dedicated crawlable page covering data, model types,
 * validation, and limitations. Includes references section.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const SOFTWARE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'WelthWest AI Market Intelligence',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: 'https://www.welthwest.com',
  description:
    'AI-powered market regime detection, anomaly identification, and backtesting for Indian equity markets.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free tier available; paid plans unlock full API access.',
  },
  provider: {
    '@type': 'Organization',
    name: 'WelthWest',
    url: 'https://www.welthwest.com',
  },
};

const TechnicalOverviewPage: React.FC = () => {
  usePageMeta({
    title: 'Technical Overview – How WelthWest AI Works | WelthWest',
    description:
      'Deep dive into how WelthWest uses LSTM, TCN, and anomaly detection models on Indian equity OHLCV and derivatives data to identify market regimes and anomalies.',
    jsonLd: SOFTWARE_JSON_LD,
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-gray-800 dark:text-gray-200">
      {/* ── Page header ── */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Technical Overview
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
          WelthWest AI analyses Indian equity market data to detect regime shifts and
          statistical anomalies. This page explains what data we use, how our models
          work at a high level, how we validate them, and what they cannot do.
        </p>
      </header>

      {/* ── 1. Data Sources ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          1. Data Sources
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our models are trained and operated on the following data streams:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>OHLCV data</strong> — Daily and intraday open, high, low, close,
            and volume for NIFTY 50, NIFTY Bank, and a universe of NSE/BSE-listed
            equities. Primary sources: Yahoo Finance, Upstox market data feed.
          </li>
          <li>
            <strong>Derivatives proxies</strong> — Futures open interest, put-call ratio
            (PCR), and options implied volatility (IV) data where available, used as
            secondary regime-confirming signals.
          </li>
          <li>
            <strong>Index-level breadth indicators</strong> — Advance-decline ratio,
            new highs / new lows, used to contextualise regime classifications.
          </li>
          {/* TODO: Enumerate any additional proprietary data sources or feeds
              once contracted. Do not list data sources that are not yet in production. */}
        </ul>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Historical data window: 2014–present (10+ years for NIFTY 50 indices).
        </p>
      </section>

      {/* ── 2. Model Types ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          2. Model Architecture
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          WelthWest uses an ensemble of sequence models and anomaly detectors:
        </p>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              2.1 Market Regime Model
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
              A Long Short-Term Memory (LSTM) network trained to classify each trading
              day into one of three broad regimes:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Bullish</strong> — trending upward with momentum confirmation</li>
              <li><strong>Bearish</strong> — sustained downward pressure</li>
              <li><strong>Transitional / Sideways</strong> — choppy or range-bound</li>
            </ul>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
              {/* TODO: Update the exact architecture details (layers, hidden size, sequence
                  length) once model documentation is finalised by the ML team. */}
              Input features include price momentum, volume ratios, moving-average
              crossovers, and options-market signals. The model outputs a probability
              distribution across the three regime classes.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              2.2 Anomaly Detector
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
              A statistical anomaly detection layer built on top of a Temporal Convolutional
              Network (TCN) autoencoder. The autoencoder learns the "normal" distribution
              of multi-feature market behaviour; reconstruction error spikes signal anomalies.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>Detects unusual volume surges, price-gap patterns, and IV spikes</li>
              <li>Outputs an anomaly score (0–100); scores above configurable thresholds trigger alerts</li>
              <li>Does <strong>not</strong> predict direction — only flags statistical unusualness</li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              2.3 Backtesting Engine
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              A rules-based simulation layer that applies user-defined entry/exit
              conditions over historical OHLCV data. Key outputs include CAGR, max
              drawdown, Sharpe ratio, Sortino ratio, and trade-level P&amp;L. Slippage
              and basic transaction costs are modelled.
            </p>
            {/* TODO: Document brokerage cost assumptions, data-snooping bias mitigation
                (e.g., walk-forward validation), and whether survivorship bias is corrected. */}
          </div>
        </div>
      </section>

      {/* ── 3. What Models Do vs Don't Do ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          3. What the AI Does and Does Not Do
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-semibold text-green-700 dark:text-green-400 mb-2">What it does</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Classifies the current market into broad regimes</li>
              <li>Flags days with statistically unusual price/volume/IV behaviour</li>
              <li>Provides backtested performance of rule-based strategies</li>
              <li>Surfaces contextual signals to support human decision-making</li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold text-red-700 dark:text-red-400 mb-2">What it does NOT do</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Predict specific future prices or index levels</li>
              <li>Provide personalised investment or trading advice</li>
              <li>Guarantee any level of future returns</li>
              <li>Account for macro events not reflected in historical data</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. Validation ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          4. Validation &amp; Performance
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We use the following approaches to assess model quality:
        </p>

        <div className="space-y-4">
          <div className="pl-4 border-l-4 border-primary-400">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Backtest Period
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Regime and anomaly models are evaluated on held-out data from 2020–2024
              (after being trained on 2014–2019 data). No future data leaks into
              training via walk-forward validation.
            </p>
          </div>
          <div className="pl-4 border-l-4 border-primary-400">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Regime Accuracy
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {/* TODO: Insert real precision/recall/F1 numbers from the ML team's evaluation report
                  once the model card is finalised. Do not fabricate metrics. */}
              Internal evaluation on 2020–2024 NIFTY 50 data shows [TODO: precision/recall
              figures]. Regime labels used for evaluation are derived from a rule-based
              ground-truth constructed from drawdown and trend characteristics.
            </p>
          </div>
          <div className="pl-4 border-l-4 border-primary-400">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Anomaly Precision / Recall
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {/* TODO: Insert real anomaly detector precision/recall from evaluation. */}
              Anomaly events are validated against a set of known high-impact market
              events (circuit breakers, VIX spikes &gt;40, index falls &gt;3% intraday).
              Current internal precision: [TODO], Recall: [TODO].
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Limitations & Risk ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          5. Limitations &amp; Risk Disclaimers
        </h2>
        <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Model drift:</strong> Market microstructure changes over time. Models
            are retrained periodically but may underperform in unprecedented regime
            environments.
          </li>
          <li>
            <strong>Data dependencies:</strong> Signal quality depends on data feed
            reliability. During exchange outages or data gaps, signals are suppressed.
          </li>
          <li>
            <strong>No guarantee:</strong> Regime detection and anomaly scores are
            probabilistic. Any given signal may be incorrect. Always combine with your
            own analysis and risk management.
          </li>
          <li>
            <strong>Not SEBI-registered:</strong> WelthWest is a technology analytics
            platform. We are not registered as an investment advisor with SEBI. Our
            outputs are analytical tools, not personalised advice.
          </li>
          <li>
            <strong>Backtesting bias:</strong> Historical backtests do not account for
            execution risk, liquidity constraints, or market-impact costs in live
            trading.
          </li>
        </ul>
      </section>

      {/* ── 6. References ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          6. Research &amp; References
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
          Our approach draws on the following published research and industry literature:
        </p>
        <ol className="list-decimal pl-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <li>
            Hochreiter, S. &amp; Schmidhuber, J. (1997).{' '}
            <em>Long Short-Term Memory.</em> Neural Computation, 9(8), 1735–1780.
          </li>
          <li>
            Bai, S., Kolter, J.Z., &amp; Koltun, V. (2018).{' '}
            <em>An Empirical Evaluation of Generic Convolutional and Recurrent Networks
            for Sequence Modeling.</em> arXiv:1803.01271.
          </li>
          <li>
            Hamilton, J.D. (1989).{' '}
            <em>A New Approach to the Economic Analysis of Nonstationary Time Series
            and the Business Cycle.</em> Econometrica, 57(2), 357–384.
            (Hidden Markov Model-based regime switching — foundational reference.)
          </li>
          <li>
            Pagan, A.R. &amp; Sossounov, K.A. (2003).{' '}
            <em>A Simple Framework for Analysing Bull and Bear Markets.</em>{' '}
            Journal of Applied Econometrics, 18(1), 23–46.
          </li>
          <li>
            {/* TODO: Add any additional internal whitepapers or external citations
                relevant to your specific model design. */}
            [TODO: Add additional references from your ML team's internal documentation
            or published research related to Indian equity market regime detection.]
          </li>
        </ol>
      </section>

      {/* ── Product links ── */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Explore the Products
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: '/product/market-regime', label: 'Market Regime', desc: 'Daily regime classification' },
            { to: '/product/anomaly-detector', label: 'Anomaly Detector', desc: 'Statistical anomaly alerts' },
            { to: '/product/backtesting-engine', label: 'Backtesting Engine', desc: 'No-code strategy testing' },
          ].map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all"
            >
              <span className="block font-semibold text-gray-900 dark:text-white">{p.label}</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">{p.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TechnicalOverviewPage;
