import React from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, ChartBarIcon, ChatBubbleLeftRightIcon, BeakerIcon } from '@heroicons/react/24/outline';
import YouTubeEmbed from './YouTubeEmbed';

interface QuickStartGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      id: 1,
      title: '1. AI Market Analysis & Forecasting',
      icon: <ChartBarIcon className="h-6 w-6 text-primary-600" />,
      accuracy: 'Medium',
      bestFor: 'Swing & Positional Trading',
      benefits: [
        'Current market state (Low/Normal/High Volatility)',
        'Regime transition probabilities (next 2-4 weeks)',
        'Confidence score (0-100%)',
        'Historical pattern matching',
        'Trading strategy recommendations based on regime'
      ],
      youtubeId: '1h0j-zsTIwE', // Replace with your YouTube video ID
      link: '/mtf-screener',
      buttonText: 'Start AI Analysis',
      gradient: 'from-primary-500 to-primary-700'
    },
    {
      id: 2,
      title: '2. AI Virtual Trading Assistant',
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-secondary-600" />,
      knowledge: 'Real-time Market Data',
      bestFor: 'All Trader Types',
      benefits: [
        'Personalized trading advice for your queries',
        'Technical analysis explanations',
        'Risk management suggestions',
        'Market trend interpretations',
        'Strategy recommendations with reasoning'
      ],
      youtubeId: 'YOUR_FORECASTING_VIDEO_ID', // Replace with your YouTube video ID
      link: '/welth-ai-assistant',
      buttonText: 'Start AI Chat',
      gradient: 'from-secondary-500 to-secondary-700'
    },
    {
      id: 3,
      title: '3. Advanced Backtesting Engine',
      icon: <BeakerIcon className="h-6 w-6 text-green-600" />,
      strategies: '15+ Built-in',
      bestFor: 'Strategy Validation',
      benefits: [
        'Complete strategy performance metrics',
        'Risk-adjusted returns (Sharpe ratio, Max drawdown)',
        'Win rate and profit factor analysis',
        'Monthly/yearly performance breakdown',
        'Comparison with buy-and-hold returns',
        'Optimal position sizing recommendations'
      ],
      youtubeId: 'YOUR_BACKTESTING_VIDEO_ID', // Replace with your YouTube video ID
      link: '/backtest-beta',
      buttonText: 'Start Backtesting',
      gradient: 'from-green-500 to-green-700'
    }
  ];

  const specializedTools = [
    {
      title: 'Predefined Strategy',
      winningRate: '>60%',
      bestFor: 'Trader/Scalpers/Swing',
      benefits: [
        'Pre-built screens (High momentum, Value, Quality)',
        'Custom screening with AI recommendations',
        'Ranking based on multiple factors',
        'Export filtered results',
        'One-click analysis of screened stocks'
      ],
      perfectWhen: 'You want to discover stocks matching specific criteria',
      link: 'https://strategy.welthwest.com/',
      gradient: 'from-orange-500 to-orange-700'
    },
    {
      title: 'Alert & Monitoring System',
      alertType: 'Get AI summary on Telegram',
      bestFor: 'Daily Summary',
      benefits: [
        'Price-based alerts (above/below levels)',
        'Volume spike notifications',
        'Regime change alerts',
        'Pattern completion notifications',
        'Custom AI-based alerts'
      ],
      perfectWhen: 'You need automated market monitoring',
      link: 'https://services.welthwest.com',
      gradient: 'from-purple-500 to-purple-700'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 py-8 sm:py-12">
          <div className="relative w-full max-w-6xl bg-white dark:bg-dark-300 rounded-2xl shadow-2xl my-8">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Welcome to WelthWest</h2>
                  <p className="text-primary-100 mt-1">Your AI-Powered Trading Assistant</p>
                  <p className="text-sm text-primary-50 mt-2">Get actionable trading insights in seconds with our advanced AI models</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Main Features */}
              <div className="space-y-8">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="bg-gray-50 dark:bg-dark-400 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Content */}
                      <div>
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-white dark:bg-dark-300 flex items-center justify-center shadow-md">
                            {feature.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {feature.title}
                            </h3>
                            <div className="flex flex-wrap gap-3 mb-3">
                              {feature.accuracy && (
                                <span className="text-xs font-semibold px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                  📊 Accuracy: {feature.accuracy}
                                </span>
                              )}
                              {feature.knowledge && (
                                <span className="text-xs font-semibold px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                  🧠 Knowledge: {feature.knowledge}
                                </span>
                              )}
                              {feature.strategies && (
                                <span className="text-xs font-semibold px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                                  📈 Strategies: {feature.strategies}
                                </span>
                              )}
                              <span className="text-xs font-semibold px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                🎯 Best For: {feature.bestFor}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="font-semibold text-gray-900 dark:text-white mb-2">What You Get:</p>
                          <ul className="space-y-2">
                            {feature.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link
                          to={feature.link}
                          onClick={onClose}
                          className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                        >
                          {feature.buttonText}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>

                      {/* Right: Video */}
                      <div className="flex items-center justify-center">
                        <div className="w-full rounded-lg overflow-hidden shadow-xl border-2 border-gray-200 dark:border-gray-700">
                          <YouTubeEmbed
                            videoId={feature.youtubeId}
                            title={feature.title}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specialized Tools Section */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  SPECIALIZED TOOLS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specializedTools.map((tool, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-dark-400 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {tool.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tool.winningRate && (
                          <span className="text-xs font-semibold px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                            🎯 Types: {tool.winningRate}
                          </span>
                        )}
                        {tool.alertType && (
                          <span className="text-xs font-semibold px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                            🎯 Types: {tool.alertType}
                          </span>
                        )}
                        <span className="text-xs font-semibold px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                          🎯 Best For: {tool.bestFor}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">What You Get:</p>
                        <ul className="space-y-2">
                          {tool.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Perfect When:</span> {tool.perfectWhen}
                        </p>
                      </div>

                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r ${tool.gradient} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      >
                        Explore Tool
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-dark-400 px-6 py-4 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start with any feature to begin your trading journey
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 dark:bg-dark-300 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;
