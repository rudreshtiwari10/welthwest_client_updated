import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UsageTracker from '../components/subscription/UsageTracker';
import UsageIndicator from '../components/subscription/UsageIndicator';
import { useSubscription } from '../contexts/SubscriptionContext';

const PricingLaunchingSoon: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptionDetails } = useSubscription();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30">
          Coming soon
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
          It's Free for all user visiting WelthWest
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-lg text-gray-600` dark:text-gray-300">
          We're preparing flexible plans for <span className="font-semibold text-gray-900 dark:text-white">Pro Traders</span> and
          <span className="font-semibold text-gray-900 dark:text-white"> Enterprises</span>. Stay tuned — it'll be worth it.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={() => navigate('/stock/RELIANCE')}
            className="inline-flex items-center rounded-md bg-blue-600 dark:bg-blue-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Try WelthWest free
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What you get on the Free plan today</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">No credit card required. Daily limits reset every midnight (IST).</p>

          {/* Live usage if available */}
          <div className="mb-6">
            {subscriptionDetails ? (
              <UsageTracker />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="mb-2 font-medium text-gray-900 dark:text-white">Daily usage limits</div>
                <ul className="space-y-1 list-disc ml-5">
                  <li>Backtests: 2/day</li>
                  <li>AI queries: 5/day</li>
                </ul>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Sign in to view your live usage.</div>
              </div>
            )}
          </div>

          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Backtesting</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Run up to 100 backtests per day with key indicators.</div>
              </div>
            </li>
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">WelthAI Market Analysis</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Ask up to 100 questions per day for insights and ideas.</div>
              </div>
            </li>
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Market Data</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Access delayed market data and historical charts.</div>
              </div>
            </li>
            <li className="py-3 flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Technical Indicators</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Core indicators included for chart analysis.</div>
              </div>
            </li>
          </ul>

          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            For heavier usage and advanced features, our Pro and Enterprise plans are on the way.
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-8">
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

          <div className="mt-6">
            <UsageIndicator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingLaunchingSoon;


