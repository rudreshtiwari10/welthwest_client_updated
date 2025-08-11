import React, { useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface MarketRegimeResult {
  status: string;
  regime: number;
  regime_name: string;
  regime_description: string;
  confidence: number;
  probabilities: { [key: string]: number };
  timestamp: string;
}

interface MarketRegimeAnalysis {
  status: string;
  current_regime: {
    regime: number;
    regime_name: string;
    confidence: number;
  };
  regime_probabilities: { [key: string]: number };
  technical_indicators: { [key: string]: any };
  market_conditions: {
    trend_strength: number;
    volatility_level: string;
    momentum_score: number;
  };
  recommendations: {
    action: string;
    reason: string;
    risk_level: string;
  };
}

interface AIAnalysisResultsProps {
  prediction?: MarketRegimeResult;
  analysis?: MarketRegimeAnalysis;
  recommendations?: any;
  ticker?: string;
  isLoading?: boolean;
  error?: string | null;
}

const AIAnalysisResults: React.FC<AIAnalysisResultsProps> = ({
  prediction,
  analysis,
  recommendations,
  ticker,
  isLoading = false,
  error = null
}) => {


  // Add animation class when results load
  useEffect(() => {
    if (prediction || analysis) {
      const elements = document.querySelectorAll('.animate-fade-in');
      elements.forEach((el, index) => {
        setTimeout(() => {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'translateY(0)';
        }, index * 150);
      });
    }
  }, [prediction, analysis]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-300 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <ArrowPathIcon className="animate-spin h-12 w-12 text-purple-500 mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-white dark:bg-dark-300"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            Running AI Analysis...
          </span>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Our Random Forest model is processing market data to identify the current market regime and generate insights
          </p>
          
          <div className="mt-6 w-full max-w-md">
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse-width"></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Collecting data</span>
              <span>Training model</span>
              <span>Analyzing</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <h3 className="ml-3 text-lg font-medium text-red-800 dark:text-red-300">
            Analysis Failed
          </h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!prediction && !analysis) {
    return (
      <div className="bg-gray-50 dark:bg-dark-400 rounded-lg p-8 border border-gray-200 dark:border-gray-600 text-center">
        <div className="text-gray-400 dark:text-gray-500">
          <ArrowPathIcon className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">No Analysis Results</p>
          <p className="text-sm mt-2">Enable AI mode and run analysis to see results here</p>
        </div>
      </div>
    );
  }

  const getRegimeIcon = (regimeName: string) => {
    switch (regimeName?.toLowerCase()) {
      case 'bull trending':
        return <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />;
      case 'bear trending':
        return <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />;
      case 'sideways/ranging':
        return <ArrowsRightLeftIcon className="h-6 w-6 text-blue-500" />;
      case 'high volatility':
        return <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />;
      case 'accumulation/distribution':
        return <ArrowPathIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <ArrowPathIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getRegimeColor = (regimeName: string) => {
    switch (regimeName?.toLowerCase()) {
      case 'bull trending':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'bear trending':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'sideways/ranging':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'high volatility':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'accumulation/distribution':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getBorderColor = (regimeName: string) => {
    switch (regimeName?.toLowerCase()) {
      case 'bull trending':
        return 'border-green-200 dark:border-green-800';
      case 'bear trending':
        return 'border-red-200 dark:border-red-800';
      case 'sideways/ranging':
        return 'border-blue-200 dark:border-blue-800';
      case 'high volatility':
        return 'border-orange-200 dark:border-orange-800';
      case 'accumulation/distribution':
        return 'border-purple-200 dark:border-purple-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const currentResult = analysis?.current_regime || prediction;

  return (
    <div className="space-y-6">
      {/* Current Regime Prediction */}
      {currentResult && (
        <div className={`animate-fade-in bg-white dark:bg-dark-300 rounded-lg p-6 border-2 ${getBorderColor(currentResult.regime_name)} shadow-md opacity-0 transform translate-y-4 transition-all duration-500`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Market Regime
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              AI Confidence: {(currentResult.confidence * 100).toFixed(1)}%
            </div>
          </div>
          
          
          <div className={`flex items-center space-x-4 mb-4 p-3 rounded-lg ${getRegimeColor(currentResult.regime_name)}`}>
            <div className="p-3 bg-white dark:bg-dark-400 rounded-full shadow-md">
              {getRegimeIcon(currentResult.regime_name)}
            </div>
            <div>
              <h4 className={`text-xl font-bold`}>
                {currentResult.regime_name}
              </h4>
              <p className="text-sm opacity-90">
                {prediction?.regime_description?.split('.')[0] || 'Market regime detected by AI analysis'}
              </p>
            </div>
          </div>

          {prediction?.regime_description && (
            <div className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
              {prediction.regime_description.split('.').slice(1).join('.').trim()}
            </div>
          )}

          {/* Confidence Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>AI Confidence Level</span>
              <span>{(currentResult.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${currentResult.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Regime Probabilities */}
      {(prediction?.probabilities || analysis?.regime_probabilities) && (
        <div className="animate-fade-in bg-white dark:bg-dark-300 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md opacity-0 transform translate-y-4 transition-all duration-500" style={{transitionDelay: '150ms'}}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
            Regime Probability Analysis
          </h3>
          
          <div className="space-y-4">
            {Object.entries(prediction?.probabilities || analysis?.regime_probabilities || {})
              .sort((a, b) => b[1] - a[1]) // Sort by probability (highest first)
              .map(([regime, probability], index) => (
                <div key={regime} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {getRegimeIcon(regime)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {regime}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        index === 0 ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-400 dark:bg-gray-600'
                      }`}
                      style={{ width: `${probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Technical Indicators */}
      {analysis?.technical_indicators && (
        <div className="animate-fade-in bg-white dark:bg-dark-300 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md opacity-0 transform translate-y-4 transition-all duration-500" style={{transitionDelay: '300ms'}}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
            Technical Analysis
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(analysis.technical_indicators).map(([indicator, value], index) => (
              <div 
                key={indicator} 
                className="bg-gray-50 dark:bg-dark-400 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {indicator.replace(/_/g, ' ')}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Conditions */}
      {analysis?.market_conditions && (
        <div className="animate-fade-in bg-white dark:bg-dark-300 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md opacity-0 transform translate-y-4 transition-all duration-500" style={{transitionDelay: '450ms'}}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ArrowPathIcon className="h-5 w-5 text-green-500 mr-2" />
            Market Conditions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.market_conditions.trend_strength.toFixed(1)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Trend Strength
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {analysis.market_conditions.volatility_level}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                Volatility Level
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {analysis.market_conditions.momentum_score.toFixed(1)}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Momentum Score
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {(analysis?.recommendations || recommendations) && (
        <div className="animate-fade-in bg-white dark:bg-dark-300 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md opacity-0 transform translate-y-4 transition-all duration-500" style={{transitionDelay: '600ms'}}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
            AI Recommendations
          </h3>
          
          {analysis?.recommendations && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800 shadow-inner">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      AI
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {analysis.recommendations.action}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                    {analysis.recommendations.reason}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      analysis.recommendations.risk_level === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                      analysis.recommendations.risk_level === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    }`}>
                      Risk: {analysis.recommendations.risk_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      {prediction?.timestamp && (
        <div className="animate-fade-in text-center text-sm text-gray-500 dark:text-gray-400 opacity-0 transform translate-y-4 transition-all duration-500" style={{transitionDelay: '750ms'}}>
          Analysis generated on {new Date(prediction.timestamp).toLocaleString()}
        </div>
      )}

    </div>
  );
};

export default AIAnalysisResults;