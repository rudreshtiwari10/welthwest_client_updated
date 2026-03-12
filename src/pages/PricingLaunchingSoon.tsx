import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const PricingLaunchingSoon: React.FC = () => {
  usePageMeta({
    title: 'Pricing – WelthWest AI Market Intelligence Platform',
    description: 'WelthWest is free for all users. Get full access to AI market regime detection, anomaly alerts, backtesting engine, and WelthAI assistant at no cost.',
  });

  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30">
          Free for everyone
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
          It's Free for all users on WelthWest
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          All features are completely free for registered users. No limits, no credit card required.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/stock')}
            className="inline-flex items-center rounded-md bg-blue-600 dark:bg-blue-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Start Exploring
          </button>
          <button
            onClick={() => navigate('/feedback')}
            className="inline-flex items-center rounded-md bg-gray-600 dark:bg-gray-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-700 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors"
          >
            <i className="fas fa-comment-dots mr-2"></i>
            Feedback
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Free plan — what you get */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What you get today — completely free</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Sign up and get unlimited access to every feature on the platform.</p>

          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Backtesting</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Unlimited backtests with all key indicators.</div>
              </div>
            </li>
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">WelthAI Market Analysis</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Unlimited AI-powered insights and market analysis.</div>
              </div>
            </li>
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">AI Screener</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Full access to multi-timeframe stock screening.</div>
              </div>
            </li>
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">AI Chat Assistant</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Unlimited conversations with our AI trading assistant.</div>
              </div>
            </li>
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Market Data & Technical Indicators</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Access market data and core chart analysis tools.</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Upcoming tiers — blurred */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-8 overflow-hidden">
          {/* Blur overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl">
            <div className="text-center px-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-4">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Premium Plans Coming Soon</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                The platform is free for everyone right now. We are curating the best plans for you — stay tuned!
              </p>
            </div>
          </div>

          {/* Blurred content behind */}
          <div className="select-none pointer-events-none" aria-hidden="true">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sneak peek: upcoming tiers</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Here's what we're building for power users and teams.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Pro Trader</div>
                <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc ml-5">
                  <li>Real-time market data</li>
                  <li>Higher daily limits</li>
                  <li>Advanced indicators</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Enterprise</div>
                <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc ml-5">
                  <li>Unlimited usage options</li>
                  <li>Team/admin controls</li>
                  <li>API access at scale</li>
                  <li>Dedicated support</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-md bg-blue-50 dark:bg-blue-900/30 p-4 text-sm text-blue-900 dark:text-blue-200">
              Want early access or to share feedback?{' '}
              <a className="font-semibold underline hover:text-blue-800 dark:hover:text-blue-100" href="mailto:team@welthwest.com">Contact us</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingLaunchingSoon;
