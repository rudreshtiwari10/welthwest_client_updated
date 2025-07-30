import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketService, marketRegimeService } from '../services/api';
import StockChart from '../components/StockChart';
import AIAnalysisToggle from '../components/AIAnalysisToggle';
import AIAnalysisForm, { AIAnalysisConfig } from '../components/AIAnalysisForm';
import AIAnalysisResults from '../components/AIAnalysisResults';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  SparklesIcon,
  BeakerIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface StockData {
  symbol: string;
  data: any[];
  period: string;
  interval: string;
}

// Define interfaces for AI analysis results based on AIAnalysisResults.tsx component
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

// New interface for AI training results
interface AITrainingResult {
  status: string;
  accuracy: number;
  cv_mean: number;
  cv_std: number;
  feature_importance: Array<{
    feature: string;
    importance: number;
  }>;
  classification_report: any;
  regime_distribution: { [key: string]: number };
  training_samples: number;
  test_samples: number;
}

const StockPage: React.FC = () => {
  const { symbol = '' } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // AI Analysis state with proper typing - Set to true by default
  const [aiModeEnabled, setAiModeEnabled] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState<MarketRegimeResult | undefined>(undefined);
  const [aiAnalysis, setAiAnalysis] = useState<MarketRegimeAnalysis | undefined>(undefined);
  const [aiRecommendations, setAiRecommendations] = useState<any>(undefined);
  
  // New state for AI training results
  const [aiTrainingResult, setAiTrainingResult] = useState<AITrainingResult | undefined>(undefined);
  const [aiTrainingLoading, setAiTrainingLoading] = useState(false);

  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) {
        setError('No stock symbol provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const formattedSymbol = symbol.toUpperCase();
        const response = await marketService.getStockInfo(formattedSymbol, '1y', '1d');
        
        setStockData({
          symbol: formattedSymbol,
          data: response.data,
          period: response.period,
          interval: response.interval
        });
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  // Run AI analysis automatically when the page loads
  useEffect(() => {
    if (symbol && !isLoading && !error && aiModeEnabled && !aiPrediction && !aiLoading) {
      handleAIAnalysis({
        ticker: symbol,
        period: '2y',
        retrain: false
      });
    }
  }, [symbol, isLoading, error, aiModeEnabled]);

  // AI Analysis handler
  const handleAIAnalysis = async (config: AIAnalysisConfig) => {
    setAiLoading(true);
    setAiError(null);

    try {
      // If retrain is requested, train the model first
      if (config.retrain) {
        setAiTrainingLoading(true);
        const trainingResponse = await marketRegimeService.trainModel(config.ticker || symbol, config.period, true);
        setAiTrainingResult(trainingResponse);
        setAiTrainingLoading(false);
      } else {
        // Try to get model info even if not retraining
        try {
          setAiTrainingLoading(true);
          const modelInfo = await marketRegimeService.getModelInfo();
          if (modelInfo.status === 'trained' && modelInfo.feature_importance) {
            setAiTrainingResult({
              status: 'success',
              accuracy: modelInfo.accuracy || 0,
              cv_mean: modelInfo.cv_mean || 0,
              cv_std: modelInfo.cv_std || 0,
              feature_importance: modelInfo.feature_importance || [],
              classification_report: modelInfo.classification_report || {},
              regime_distribution: modelInfo.regime_distribution || {},
              training_samples: modelInfo.training_samples || 0,
              test_samples: modelInfo.test_samples || 0
            });
          }
        } catch (modelInfoErr) {
          console.error('Error fetching model info:', modelInfoErr);
        } finally {
          setAiTrainingLoading(false);
        }
      }

      // Get prediction
      const predictionResponse = await marketRegimeService.predictRegime(config.ticker || symbol);
      setAiPrediction(predictionResponse);

      // Get comprehensive analysis
      const analysisResponse = await marketRegimeService.getAnalysis(config.ticker || symbol);
      setAiAnalysis(analysisResponse);

      // Get recommendations
      const recommendationsResponse = await marketRegimeService.getRecommendations(config.ticker || symbol);
      setAiRecommendations(recommendationsResponse);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI Analysis failed';
      setAiError(errorMessage);
      console.error('AI Analysis error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle AI mode
  const handleToggleAI = (enabled: boolean) => {
    setAiModeEnabled(enabled);
    
    // If enabling AI mode and we have a stock symbol, run analysis automatically
    if (enabled && symbol && !aiPrediction) {
      handleAIAnalysis({
        ticker: symbol,
        period: '2y',
        retrain: false
      });
    }
  };

  // Render feature importance chart
  const renderFeatureImportance = () => {
    if (!aiTrainingResult || !aiTrainingResult.feature_importance || aiTrainingResult.feature_importance.length === 0) {
      return null;
    }

    // Sort features by importance
    const sortedFeatures = [...aiTrainingResult.feature_importance]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10); // Show top 10 features

    const maxImportance = Math.max(...sortedFeatures.map(f => f.importance));

    return (
      <div className="mt-6 bg-white dark:bg-dark-300 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 text-purple-500 mr-2" />
          Feature Importance
        </h3>
        <div className="space-y-3">
          {sortedFeatures.map((feature, index) => (
            <div key={feature.feature} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {feature.feature}
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {(feature.importance * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    index === 0 ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 
                    index < 3 ? 'bg-purple-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(feature.importance / maxImportance) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render model metrics
  const renderModelMetrics = () => {
    if (!aiTrainingResult) return null;

    return (
      <div className="mt-6 bg-white dark:bg-dark-300 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BeakerIcon className="h-5 w-5 text-purple-500 mr-2" />
          Model Performance
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {(aiTrainingResult.accuracy * 100).toFixed(2)}%
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Cross-Validation</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {(aiTrainingResult.cv_mean * 100).toFixed(2)}%
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Training Samples</div>
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {aiTrainingResult.training_samples.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Test Samples</div>
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {aiTrainingResult.test_samples.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={() => navigate('/markets')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stock Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stockData?.symbol || symbol}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {stockData?.data?.[0]?.name || 'Stock Details'}
          </p>
        </div>

        {/* AI Feature Promotion - Desktop */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              AI Market Analysis
            </span>
            <button
              onClick={() => handleToggleAI(!aiModeEnabled)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                aiModeEnabled 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
              }`}
            >
              {aiModeEnabled ? 'AI Mode Active' : 'Try AI Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Feature Promotional Banner - Always visible */}
      {!aiModeEnabled && (
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 sm:px-10 sm:py-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-full">
                <BeakerIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">AI Market Regime Analysis</h3>
                <p className="text-purple-100 text-sm md:text-base">
                  Get advanced market insights powered by machine learning
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggleAI(true)}
              className="px-6 py-2 bg-white text-purple-700 rounded-full font-medium hover:bg-purple-50 transition-colors shadow-md"
            >
              Activate AI Analysis
            </button>
          </div>
          <div className="px-6 pb-4 sm:px-10 sm:pb-6 flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="h-5 w-5 text-yellow-300" />
              <span className="text-white text-sm">Market Regime Detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-green-300" />
              <span className="text-white text-sm">Technical Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-blue-300" />
              <span className="text-white text-sm">Trading Recommendations</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stock Chart and Info - Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Price Chart</h2>
            <div className="h-[400px]">
              {stockData && (
                <StockChart 
                  stockData={{
                    symbol: stockData.symbol,
                    data: stockData.data
                  }}
                  height={400}
                />
              )}
            </div>
          </div>

          {/* Stock Statistics */}
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stockData?.data && stockData.data[0] && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{stockData.data[0].Open?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{stockData.data[0].High?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{stockData.data[0].Low?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Close</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{stockData.data[0].Close?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stockData.data[0].Volume?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stockData.period || '1y'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* AI Model Performance - Show in left column when available */}
          {aiModeEnabled && aiTrainingResult && (
            <>
              {renderModelMetrics()}
              {renderFeatureImportance()}
            </>
          )}
        </div>

        {/* AI Analysis - Right Column */}
        <div className="lg:col-span-1">
          {/* AI Toggle - Enhanced version */}
          <div className={`bg-white dark:bg-dark-300 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${aiModeEnabled ? 'border-2 border-purple-500' : 'border border-gray-200 dark:border-gray-700'}`}>
            <div className={`p-4 ${aiModeEnabled ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10' : ''}`}>
              <AIAnalysisToggle 
                isEnabled={aiModeEnabled} 
                onToggle={handleToggleAI} 
                className="border-0 bg-transparent p-0"
              />
            </div>
            
            {/* AI Mode Content */}
            {aiModeEnabled ? (
              <div className="p-4 pt-0">
                {/* AI Analysis Form */}
                <AIAnalysisForm 
                  onAnalyze={handleAIAnalysis}
                  isLoading={aiLoading || aiTrainingLoading}
                  disabled={false}
                  defaultTicker={symbol}
                />
                
                {/* AI Analysis Results */}
                <div className="mt-6">
                  <AIAnalysisResults
                    prediction={aiPrediction}
                    analysis={aiAnalysis}
                    recommendations={aiRecommendations}
                    ticker={symbol}
                    isLoading={aiLoading}
                    error={aiError}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <SparklesIcon className="h-4 w-4 text-purple-500" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    What you're missing:
                  </h4>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 pl-6">
                  <li className="list-disc">Market regime classification</li>
                  <li className="list-disc">AI-powered trading signals</li>
                  <li className="list-disc">Technical indicator analysis</li>
                  <li className="list-disc">Risk assessment</li>
                </ul>
                <button
                  onClick={() => handleToggleAI(true)}
                  className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Enable AI Analysis
                </button>
              </div>
            )}
          </div>
          
          {/* Additional content for the right column */}
          {!aiModeEnabled && (
            <div className="mt-6 bg-white dark:bg-dark-300 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Why use AI Analysis?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Our AI-powered market regime classifier helps you identify the current market conditions and make better trading decisions.
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Powered by Random Forest ML</span>
                <button 
                  onClick={() => handleToggleAI(true)}
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Learn more
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile AI Feature Promotion - Fixed at bottom */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 p-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          <BeakerIcon className="h-5 w-5 text-white" />
          <span className="text-sm font-medium text-white">AI Analysis</span>
        </div>
        <button
          onClick={() => handleToggleAI(!aiModeEnabled)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            aiModeEnabled 
            ? 'bg-white text-purple-700' 
            : 'bg-purple-500 text-white border border-white'
          }`}
        >
          {aiModeEnabled ? 'AI Active' : 'Try AI'}
        </button>
      </div>
    </div>
  );
};

export default StockPage; 