import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import AIAnalysisToggle from '../components/AIAnalysisToggle';
import AIAnalysisForm, { AIAnalysisConfig } from '../components/AIAnalysisForm';
import AIAnalysisResults from '../components/AIAnalysisResults';
import StockChart from '../components/StockChart';
import { marketService, marketRegimeService } from '../services/api';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  SparklesIcon,
  BeakerIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

// Define interfaces for AI analysis results
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

// Interface for AI training results
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

// Interface for stock data
interface StockData {
  symbol: string;
  data: any[];
  period: string;
  interval: string;
}

const WelthAIPage: React.FC = () => {
  // Default stock symbol
  const defaultSymbol = 'RELIANCE';
  
  // AI Analysis state
  const [aiModeEnabled, setAiModeEnabled] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState<MarketRegimeResult | undefined>(undefined);
  const [aiAnalysis, setAiAnalysis] = useState<MarketRegimeAnalysis | undefined>(undefined);
  const [aiRecommendations, setAiRecommendations] = useState<any>(undefined);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultSymbol);
  
  // AI Training results state
  const [aiTrainingResult, setAiTrainingResult] = useState<AITrainingResult | undefined>(undefined);
  const [aiTrainingLoading, setAiTrainingLoading] = useState(false);
  
  // Stock chart data state
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [stockLoading, setStockLoading] = useState(true);

  // Popular Indian stocks for quick selection
  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank' }
  ];

  // Run AI analysis automatically when the page loads
  useEffect(() => {
    const runInitialAnalysis = async () => {
      if (aiModeEnabled && !aiPrediction && !aiLoading) {
        // Set loading state immediately to prevent multiple calls
        setAiLoading(true);
        
        try {
          // Run full analysis with default parameters
          await handleAIAnalysis({
            ticker: selectedSymbol,
            period: '2y',
            retrain: false
          });
        } catch (err) {
          console.error("Error running initial analysis:", err);
        }
      }
    };
    
    // Run analysis on component mount
    runInitialAnalysis();
  }, []); // Empty dependency array to run only on mount

  // Fetch stock data when symbol changes
  useEffect(() => {
    const fetchStockData = async () => {
      setStockLoading(true);
      try {
        const response = await marketService.getStockInfo(selectedSymbol, '1y', '1d');
        setStockData(response);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setStockLoading(false);
      }
    };

    fetchStockData();
  }, [selectedSymbol]);

  // AI Analysis handler
  const handleAIAnalysis = async (config: AIAnalysisConfig) => {
    // Set loading states
    setAiLoading(true);
    setAiError(null);
    
    // Update selected symbol immediately
    setSelectedSymbol(config.ticker || defaultSymbol);
    
    try {
      // Sequential API calls with proper error handling
      
      // Step 1: Get model info or train model
      if (config.retrain) {
        setAiTrainingLoading(true);
        const trainingResponse = await marketRegimeService.trainModel(config.ticker || selectedSymbol, config.period, true);
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
          // Continue with other API calls even if this one fails
        } finally {
          setAiTrainingLoading(false);
        }
      }

      // Step 2: Make all analysis API calls in parallel for better performance
      const [predictionResponse, analysisResponse, recommendationsResponse] = await Promise.all([
        marketRegimeService.predictRegime(config.ticker || selectedSymbol),
        marketRegimeService.getAnalysis(config.ticker || selectedSymbol),
        marketRegimeService.getRecommendations(config.ticker || selectedSymbol)
      ]);
      
      // Step 3: Update all state variables with the results
      setAiPrediction(predictionResponse);
      setAiAnalysis(analysisResponse);
      setAiRecommendations(recommendationsResponse);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI Analysis failed';
      setAiError(errorMessage);
      console.error('AI Analysis error:', err);
    } finally {
      // Always clear loading state
      setAiLoading(false);
    }
    
    // Return true to indicate success (useful for the initial useEffect)
    return true;
  };

  // Toggle AI mode
  const handleToggleAI = (enabled: boolean) => {
    setAiModeEnabled(enabled);
    
    // If enabling AI mode, run analysis automatically
    if (enabled && !aiPrediction) {
      handleAIAnalysis({
        ticker: selectedSymbol,
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

  // Handle stock selection
  const handleStockSelect = (symbol: string) => {
    if (symbol === selectedSymbol && !aiLoading) {
      // If selecting the same symbol, force a refresh
      handleAIAnalysis({
        ticker: symbol,
        period: '2y',
        retrain: false
      });
    } else {
      // Update symbol and run analysis
      setSelectedSymbol(symbol);
      handleAIAnalysis({
        ticker: symbol,
        period: '2y',
        retrain: false
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <BeakerIcon className="h-8 w-8 text-purple-500 mr-3" />
          Welth AI Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Advanced AI tools for market analysis, stock predictions, and investment insights. Leverage machine learning to make data-driven decisions.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left Column - AI Analysis */}
        <div className="lg:col-span-2">
          {/* Stock Selection */}
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
              AI Market Regime Analysis
            </h2>
            
            {/* Stock Selection Pills */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Stock:
              </label>
              <div className="flex flex-wrap gap-2">
                {popularStocks.map(stock => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleStockSelect(stock.symbol)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedSymbol === stock.symbol
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {stock.symbol}
                  </button>
                ))}
              </div>
            </div>
            
            {/* AI Analysis Form */}
            <AIAnalysisForm 
              onAnalyze={handleAIAnalysis}
              isLoading={aiLoading || aiTrainingLoading}
              disabled={false}
              defaultTicker={selectedSymbol}
            />
          </div>
          
          {/* AI Analysis Results */}
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md p-6 mb-6">
            {/* Show loading state separately from AIAnalysisResults for better UX */}
            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-8">
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
                  Our Random Forest model is processing market data to identify the current market regime
                </p>
              </div>
            )}
            
            {/* Only show results when not loading */}
            {!aiLoading && (
              <AIAnalysisResults
                prediction={aiPrediction}
                analysis={aiAnalysis}
                recommendations={aiRecommendations}
                isLoading={false}
                error={aiError}
              />
            )}
          </div>
          
          {/* Model Metrics & Feature Importance */}
          {aiTrainingResult && (
            <>
              {renderModelMetrics()}
              {renderFeatureImportance()}
            </>
          )}
        </div>
        
        {/* Right Column - Stock Chart and AI Assistant */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md overflow-hidden sticky top-20">
            {/* Stock Chart */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  {selectedSymbol} Price Chart
                </h3>
                {stockData && stockData.data && stockData.data.length > 0 && (
                  <div className="text-sm font-medium">
                    <span className={`${
                      stockData.data[stockData.data.length - 1].Close > stockData.data[0].Close
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      ₹{stockData.data[stockData.data.length - 1].Close?.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="h-40">
                {stockLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  </div>
                ) : stockData ? (
                  <StockChart stockData={stockData} height={150} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No data available
                  </div>
                )}
              </div>
            </div>
            
            {/* AI Assistant */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <i className="fas fa-robot text-purple-500 mr-2"></i>
                AI Assistant
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Ask questions about stocks, market trends, or get investment insights
              </p>
            </div>
            <div className="p-4">
              <div className="bg-gray-50 dark:bg-dark-400 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Questions:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors">
                    What are the key indicators for a bull market?
                  </li>
                  <li className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors">
                    How to interpret RSI values above 70?
                  </li>
                  <li className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors">
                    Explain the concept of market regimes
                  </li>
                  <li className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors">
                    What is the best strategy for a bear market?
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Interface - Full Width at Bottom */}
      <div className="mt-8">
        <div className="bg-[#1a1f2e] rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <div className="bg-primary-600 rounded-full p-2">
                <i className="fas fa-comment-dots text-white text-xl"></i>
              </div>
              <span>AI Chat Assistant</span>
            </h2>
            <p className="mt-2 text-gray-400">
              Have a conversation with our AI assistant about markets, stocks, and investment strategies
            </p>
          </div>

          {/* Chat Interface */}
          <div className="p-6">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelthAIPage; 