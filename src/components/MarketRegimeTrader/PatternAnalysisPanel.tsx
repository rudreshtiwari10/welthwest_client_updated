import React from 'react';
import { PatternAnalysisResult } from '../../services/patternAnalysisService';
import { ChartBarIcon, ArrowTrendingUpIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface PatternAnalysisPanelProps {
  analysis: PatternAnalysisResult | null;
  loading: boolean;
}

const PatternAnalysisPanel: React.FC<PatternAnalysisPanelProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">AI Pattern Analysis</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing patterns...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">AI Pattern Analysis</h2>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a stock to analyze patterns
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSignalBadgeClass = (signal: string) => {
    const signalClasses: { [key: string]: string } = {
      'STRONG_BUY': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'BUY': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-500',
      'NEUTRAL': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'SELL': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-500',
      'STRONG_SELL': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return signalClasses[signal] || signalClasses['NEUTRAL'];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">AI Pattern Analysis</h2>

      {/* Combined AI Verdict */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">Combined AI Score</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.combined_analysis.score}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all ${getScoreColor(analysis.combined_analysis.score)}`}
            style={{ width: `${analysis.combined_analysis.score}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSignalBadgeClass(analysis.combined_analysis.signal)}`}>
            {analysis.combined_analysis.signal.replace('_', ' ')}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Confidence: {analysis.combined_analysis.confidence}
          </span>
        </div>
      </div>

      {/* Model Breakdown */}
      <div className="space-y-4">
        {/* Model 1: Classical Patterns */}
        <div className="border dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center text-gray-900 dark:text-white">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
              Classical Patterns
            </h3>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {analysis.classical_patterns.score}/100
            </span>
          </div>

          {analysis.classical_patterns.detected_patterns.map((pattern, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{pattern.name}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{pattern.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${pattern.confidence}%` }}
                />
              </div>
            </div>
          ))}

          {analysis.classical_patterns.suggested_stop_loss && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">Suggested Stop Loss:</strong> ₹{analysis.classical_patterns.suggested_stop_loss.toFixed(2)}
              <br />
              <strong className="text-gray-900 dark:text-white">Pattern Target:</strong> ₹{analysis.classical_patterns.suggested_target.toFixed(2)}
            </div>
          )}
        </div>

        {/* Model 2: Price Action */}
        <div className="border dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center text-gray-900 dark:text-white">
              <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-500" />
              Price Action
            </h3>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {analysis.price_action.score}/100
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Trend:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{analysis.price_action.trend}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Strength:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{analysis.price_action.trend_strength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Support:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{analysis.price_action.support_levels[0]?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Resistance:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{analysis.price_action.resistance_levels[0]?.toFixed(2) || 'N/A'}
              </span>
            </div>
          </div>

          {analysis.price_action.breakout_signal && (
            <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
              <strong className="text-green-700 dark:text-green-400">Breakout Signal Detected</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {analysis.price_action.breakout_type} breakout with {analysis.price_action.volume_confirmation ? 'volume confirmation' : 'low volume'}
              </p>
            </div>
          )}
        </div>

        {/* Model 3: Candlestick Patterns */}
        <div className="border dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center text-gray-900 dark:text-white">
              <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Candlestick Patterns
            </h3>
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {analysis.candlestick_patterns.score}/100
            </span>
          </div>

          {analysis.candlestick_patterns.detected_patterns.map((pattern, idx) => (
            <div key={idx} className="mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{pattern.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  pattern.type === 'bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  pattern.type === 'bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {pattern.type}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Reliability: {pattern.reliability}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      {analysis.combined_analysis.insights && analysis.combined_analysis.insights.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center text-gray-900 dark:text-white">
            <LightBulbIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Key Insights
          </h3>
          <ul className="space-y-1 text-sm">
            {analysis.combined_analysis.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start text-gray-700 dark:text-gray-300">
                <span className="text-indigo-500 mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatternAnalysisPanel;
