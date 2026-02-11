import React, { useState, useEffect } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';
import InsightsChart from './InsightsChart';
import {
  SparklesIcon,
  ArrowPathIcon,
  ChartBarIcon,
  FaceSmileIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface AIInsightsDashboardProps {
  className?: string;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  className = ''
}) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCachedInsights();
  }, []);

  const fetchCachedInsights = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getCachedInsights();
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setGenerating(true);
      const response = await riskCalculatorService.generateInsights();
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <LoadingSpinner text="Loading AI insights..." />
      </div>
    );
  }

  if (!insights || !insights.insights) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center ${className}`}>
        <SparklesIcon className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Insights Available
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Generate AI insights from your trade journal to discover patterns and improve performance
        </p>
        <button
          onClick={handleGenerateInsights}
          disabled={generating}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>
    );
  }

  const { insights: data } = insights;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <SparklesIcon className="w-6 h-6" />
              <h2 className="text-2xl font-bold">AI Performance Insights</h2>
            </div>
            <p className="text-primary-100">
              AI-powered analysis of your trading patterns
            </p>
          </div>
          <button
            onClick={handleGenerateInsights}
            disabled={generating}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.total_trades || 0}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Overall Win Rate</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.overall_win_rate?.toFixed(1) || 0}%
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Avg Profit</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{data.avg_profit?.toFixed(2) || 0}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Avg Loss</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ₹{data.avg_loss?.toFixed(2) || 0}
          </p>
        </div>
      </div>

      {/* Performance by Strategy */}
      {data.by_strategy && Object.keys(data.by_strategy).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance by Strategy
            </h3>
          </div>
          <InsightsChart
            data={Object.entries(data.by_strategy).map(([strategy, stats]: [string, any]) => ({
              name: strategy,
              win_rate: stats.win_rate,
              avg_profit: stats.avg_profit,
              trades: stats.count
            }))}
            type="strategy"
          />
        </div>
      )}

      {/* Performance by Emotion */}
      {data.by_emotion && Object.keys(data.by_emotion).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaceSmileIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance by Emotional State
            </h3>
          </div>
          <InsightsChart
            data={Object.entries(data.by_emotion).map(([emotion, stats]: [string, any]) => ({
              name: emotion,
              win_rate: stats.win_rate,
              avg_profit: stats.avg_profit,
              trades: stats.count
            }))}
            type="emotion"
          />
        </div>
      )}

      {/* Key Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <LightBulbIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              AI Recommendations
            </h3>
          </div>
          <ul className="space-y-3">
            {data.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {rec}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best/Worst Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Performing */}
        {data.best_performing && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
              Best Performing Patterns
            </h4>
            <ul className="space-y-2">
              {data.best_performing.slice(0, 3).map((item: any, index: number) => (
                <li key={index} className="text-sm text-green-800 dark:text-green-200">
                  <strong>{item.label}:</strong> {item.win_rate?.toFixed(1)}% win rate
                  ({item.count} trades)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Worst Performing */}
        {data.worst_performing && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {data.worst_performing.slice(0, 3).map((item: any, index: number) => (
                <li key={index} className="text-sm text-red-800 dark:text-red-200">
                  <strong>{item.label}:</strong> {item.win_rate?.toFixed(1)}% win rate
                  ({item.count} trades)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Last Generated */}
      {insights.generated_at && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Last generated: {new Date(insights.generated_at).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
};

export default AIInsightsDashboard;
