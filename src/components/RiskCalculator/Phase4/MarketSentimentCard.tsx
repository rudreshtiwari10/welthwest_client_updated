import React, { useEffect, useState } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface MarketSentimentCardProps {
  symbols: string[];
}

const MarketSentimentCard: React.FC<MarketSentimentCardProps> = ({ symbols }) => {
  const [sentiment, setSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (symbols && symbols.length > 0) {
      fetchSentiment();
    }
  }, [symbols]);

  const fetchSentiment = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getMarketSentiment(symbols);
      setSentiment(response.data);
    } catch (error) {
      console.error('Failed to fetch sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Market Sentiment
        </h3>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!sentiment || symbols.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Market Sentiment
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add positions to see market sentiment analysis
        </p>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'strong bullish':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'bearish':
      case 'strong bearish':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'strong bullish':
        return <ArrowTrendingUpIcon className="w-6 h-6" />;
      case 'bearish':
      case 'strong bearish':
        return <ArrowTrendingDownIcon className="w-6 h-6" />;
      default:
        return <SparklesIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Market Sentiment Analysis
        </h3>
      </div>

      {/* Overall Sentiment */}
      {sentiment.overall_sentiment && (
        <div className={`p-4 rounded-lg border mb-4 ${getSentimentColor(sentiment.overall_sentiment)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">Overall Market Sentiment</p>
              <p className="text-2xl font-bold capitalize">{sentiment.overall_sentiment}</p>
            </div>
            <div>{getSentimentIcon(sentiment.overall_sentiment)}</div>
          </div>
        </div>
      )}

      {/* Individual Stock Sentiments */}
      {sentiment.stock_sentiments && sentiment.stock_sentiments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Individual Stocks
          </p>
          {sentiment.stock_sentiments.map((stock: any, index: number) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getSentimentColor(stock.sentiment)}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{stock.symbol}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm capitalize">{stock.sentiment}</span>
                  {getSentimentIcon(stock.sentiment)}
                </div>
              </div>
              {stock.confidence && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-current h-1.5 rounded-full"
                      style={{ width: `${stock.confidence}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1">Confidence: {stock.confidence}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Analysis based on technical indicators and market trends
        </p>
      </div>
    </div>
  );
};

export default MarketSentimentCard;
