/**
 * CaseStudiesPage – /case-studies
 *
 * E-E-A-T: Experience signal. Shows real-world examples of WelthWest helping
 * traders. All case-study content below is PLACEHOLDER — replace with real
 * client stories before publishing.
 *
 * SEO req (MD §2): At least 2-3 case studies each with client type, problem,
 * solution, metrics, and a short quote.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

// ─── Placeholder data ─────────────────────────────────────────────────────────
// TODO: Replace every field below with real, verified case-study content.
// Get written approval from the client before using their name or logo.
// Use anonymised descriptions (e.g. "Leading prop desk in Mumbai") if NDAs apply.

interface CaseStudy {
  id: string;
  clientType: string;       // e.g. "Prop desk with ₹10 Cr exposure"
  industry: string;
  problem: string;
  solution: string;
  metrics: { label: string; value: string }[];
  quote?: string;
  quoteAuthor?: string;
  tags: string[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'prop-desk-drawdown',
    clientType: 'Proprietary Trading Desk',
    industry: 'Intraday Equity — NSE',
    problem:
      'The desk experienced repeated drawdowns of 3–5% on high-volatility event days (earnings, RBI policy). Traders had no systematic way to distinguish normal intraday noise from structurally risky regimes.',
    solution:
      'Integrated WelthAI Market Regime detector into the desk\'s pre-market checklist. On "bearish regime" or "anomaly" days flagged by WelthAI, position sizes were reduced by 30–50% automatically.',
    metrics: [
      // TODO: Replace with real, verified numbers from the client.
      { label: 'Reduction in intraday drawdown', value: '~18%' },
      { label: 'Months observed', value: '3' },
      { label: 'Regime accuracy (internal validation)', value: '74%' },
    ],
    quote:
      // TODO: Replace with a real, approved quote from the client.
      '"WelthAI gave us a daily regime read we could actually act on — not just another sentiment index."',
    quoteAuthor:
      // TODO: Replace with real name/role if client permits, or keep anonymised.
      '— Head of Desk (anonymised, Mumbai)',
    tags: ['Market Regime', 'Risk Management', 'Intraday'],
  },
  {
    id: 'pms-regime-allocation',
    clientType: 'Portfolio Management Service (PMS)',
    industry: 'Multi-cap Equity — BSE + NSE',
    problem:
      'A mid-sized PMS fund found that standard moving-average signals were too slow, generating late exits during bear regimes and causing significant drawdowns for clients.',
    solution:
      'Used WelthAI\'s regime classification (Bullish / Bearish / Transition) to time defensive cash allocation. When WelthAI flagged a "bearish" or "transition" regime, the fund shifted 15–25% to short-duration debt and cash.',
    metrics: [
      // TODO: Replace with real, verified numbers.
      { label: 'Max drawdown (backtested, 2020–2024)', value: '-12.4% vs -19.8% benchmark' },
      { label: 'Regime signals actioned', value: '14 over 2 years' },
      { label: 'Signals that preceded >5% index move', value: '9 of 14' },
    ],
    quote:
      // TODO: Replace with real, approved quote.
      '"The regime signal is now part of our monthly investment committee — it changed how we think about market timing."',
    quoteAuthor:
      // TODO: Replace with real name/role if permitted.
      '— Fund Manager (anonymised, Thane)',
    tags: ['Portfolio Management', 'Regime Detection', 'Asset Allocation'],
  },
  {
    id: 'algo-trader-anomaly',
    clientType: 'Individual Algorithmic Trader',
    industry: 'Options — NIFTY & BANKNIFTY',
    problem:
      'An options seller was unable to quickly identify unusual implied-volatility spikes or order-flow anomalies before opening positions, leading to unexpected losses on "surprise" event days.',
    solution:
      'Subscribed to WelthAI Anomaly Detector alerts. High-anomaly scores now trigger an automatic review flag before opening any new spread position. Position was reduced or skipped on ~40% of flagged days.',
    metrics: [
      // TODO: Replace with real, verified numbers.
      { label: 'Win rate (pre-WelthAI, 6 months)', value: '61%' },
      { label: 'Win rate (post-WelthAI, 6 months)', value: '68%' },
      { label: 'Average loss on flagged days (skipped)', value: 'N/A — position avoided' },
    ],
    // No quote — client preferred to remain fully anonymous.
    tags: ['Anomaly Detection', 'Options', 'Risk Reduction'],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const CaseStudiesPage: React.FC = () => {
  usePageMeta({
    title: 'Case Studies – WelthWest AI Market Intelligence Results',
    description:
      'See how proprietary desks, PMS funds, and individual traders use WelthWest AI regime detection and anomaly alerts to manage risk and improve returns.',
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl text-gray-800 dark:text-gray-200">
      {/* ── Page header ── */}
      <header className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Case Studies
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Real examples of how traders and fund managers use WelthWest AI to detect
          regime shifts, reduce drawdowns, and make more informed decisions.
        </p>

        {/* TODO: Add 2–3 anonymised client logos here once client permission is obtained. */}
        {/* Placeholder trust strip */}
        <div className="mt-8 inline-block bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-2 text-sm text-yellow-700 dark:text-yellow-300">
          Note: Metrics are indicative. Client identities are anonymised unless explicit consent is given.
          {/* TODO: Remove this notice once full case studies with client approval are published. */}
        </div>
      </header>

      {/* ── Case study cards ── */}
      <section>
        <div className="space-y-12">
          {CASE_STUDIES.map((cs) => (
            <article
              key={cs.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Card header */}
              <div className="bg-gradient-to-r from-primary-600/10 to-secondary-600/10 dark:from-primary-900/30 dark:to-secondary-900/30 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {cs.clientType}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {cs.industry}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cs.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 grid md:grid-cols-2 gap-6">
                {/* Problem */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 mb-2">
                    The Problem
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {cs.problem}
                  </p>
                </div>

                {/* Solution */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-2">
                    How WelthWest Helped
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {cs.solution}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="px-6 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  Key Metrics
                  {/* TODO: Ensure all metrics below are verified by the client before publishing. */}
                </h3>
                <ul className="flex flex-wrap gap-4">
                  {cs.metrics.map((m) => (
                    <li
                      key={m.label}
                      className="flex-1 min-w-[140px] bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3"
                    >
                      <span className="block text-xl font-bold text-primary-600 dark:text-primary-400">
                        {m.value}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {m.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quote */}
              {cs.quote && (
                <blockquote className="mx-6 mb-6 border-l-4 border-primary-400 pl-4 italic text-gray-600 dark:text-gray-300 text-sm">
                  {cs.quote}
                  {cs.quoteAuthor && (
                    <cite className="block mt-1 not-italic text-xs text-gray-400 dark:text-gray-500">
                      {cs.quoteAuthor}
                    </cite>
                  )}
                </blockquote>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mt-16 text-center bg-gradient-to-r from-primary-600/10 to-secondary-600/10 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Want results like these?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
          Start with our free tier to explore Market Regime signals and Anomaly
          Detector alerts — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            Get Started Free
          </Link>
          <Link
            to="/technical-overview"
            className="px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg font-medium transition-colors"
          >
            How the AI Works
          </Link>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <footer className="mt-10 text-xs text-gray-400 dark:text-gray-500 text-center">
        <p>
          Past performance and backtested results are not indicative of future
          results. WelthWest does not offer investment advice. All case studies
          are provided for illustrative purposes only.{' '}
          <Link to="/terms-and-conditions" className="underline hover:text-primary-500">
            Full disclaimer
          </Link>
          .
        </p>
      </footer>
    </div>
  );
};

export default CaseStudiesPage;
