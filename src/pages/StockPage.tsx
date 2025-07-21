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

const StockPage: React.FC = () => {
  const { symbol = '' } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // AI Analysis state with proper typing
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState<MarketRegimeResult | undefined>(undefined);
  const [aiAnalysis, setAiAnalysis] = useState<MarketRegimeAnalysis | undefined>(undefined);
  const [aiRecommendations, setAiRecommendations] = useState<any>(undefined);

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

  // AI Analysis handler
  const handleAIAnalysis = async (config: AIAnalysisConfig) => {
    setAiLoading(true);
    setAiError(null);

    try {
      // If retrain is requested, train the model first
      if (config.retrain) {
        await marketRegimeService.trainModel(config.ticker || symbol, config.period, true);
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
                  isLoading={aiLoading}
                  disabled={false}
                  defaultTicker={symbol}
                />
                
                {/* AI Analysis Results */}
                <div className="mt-6">
                  <AIAnalysisResults
                    prediction={aiPrediction}
                    analysis={aiAnalysis}
                    recommendations={aiRecommendations}
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