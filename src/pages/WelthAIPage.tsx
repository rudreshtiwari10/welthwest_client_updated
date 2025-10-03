import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import AIAnalysisForm, { AIAnalysisConfig } from '../components/AIAnalysisForm';
import AIAnalysisResults from '../components/AIAnalysisResults';
import StockChart from '../components/StockChart';
import { marketService, marketRegimeService, userDataService } from '../services/api';
import LimitExceededModal from '../components/subscription/LimitExceededModal';
import LoginModal from '../components/LoginModal';
import { 
  SparklesIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { trackEvent } from '../utils/analytics';

// Define interfaces for AI analysis results
interface MarketRegimeResult {
  status: string;
  regime: number;
  regime_name: string;
  regime_description: string;
  confidence: number;
  probabilities: { [key: string]: number };
  hmm_next_probs?: number[]; // HMM next-day forecast probabilities
  timestamp: string;
  processing_time?: number;  // Optional processing time in seconds
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
  model_version?: string;  // Optional model version string
}

// Interface for stock data
interface StockData {
  symbol: string;
  data: any[];
  period: string;
  interval: string;
}

const WelthAIPage: React.FC = () => {
  const { user } = useAuth();
  const { canUseLLM, incrementLLMUsage } = useSubscription();
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Default stock symbol
  const defaultSymbol = 'RELIANCE';
  
  // AI Analysis state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [aiPrediction, setAiPrediction] = useState<MarketRegimeResult | undefined>(undefined);
  const [aiAnalysis, setAiAnalysis] = useState<MarketRegimeAnalysis | undefined>(undefined);
  const [aiRecommendations, setAiRecommendations] = useState<any>(undefined);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultSymbol);
  
  // Current analysis configuration
  const [currentConfig, setCurrentConfig] = useState<AIAnalysisConfig | null>(null);
  
  // Anonymous usage tracking
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [anonymousUsage, setAnonymousUsage] = useState({
    remainingAnalyses: 2, // Allow 2 free AI analyses
    sessionId: null as string | null
  });
  
  // AI Training results state
  const [aiTrainingResult, setAiTrainingResult] = useState<AITrainingResult | undefined>(undefined);
  
  // Stock chart data state
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  
  // Save state
  const [saveStatus, setSaveStatus] = useState<{saving: boolean, success?: boolean, message?: string}>({saving: false});
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [analysisName, setAnalysisName] = useState<string>('');

  // Popular Indian stocks for quick selection
  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank' }
  ];

  // Simulate loading steps with progress
  const simulateLoadingSteps = async () => {
    const steps = [
      { message: 'Initializing AI analysis...', duration: 800 },
      { message: 'Collecting market data...', duration: 1200 },
      { message: 'Processing technical indicators...', duration: 1000 },
      { message: 'Training AI model...', duration: 1500 },
      { message: 'Analyzing market regimes...', duration: 1200 },
      { message: 'Generating insights...', duration: 800 },
      { message: 'Finalizing results...', duration: 600 }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setLoadingStep(step.message);
      setLoadingProgress(((i + 1) / steps.length) * 100);
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
  };

  // Handle opening save modal
  const handleOpenSaveModal = () => {
    if (!aiPrediction && !aiAnalysis) return;
    setShowSaveModal(true);
    setAnalysisName(`${selectedSymbol} Analysis - ${new Date().toLocaleDateString()}`);
  };

  // Handle saving AI analysis results with name
  const handleConfirmSave = async () => {
    if ((!aiPrediction && !aiAnalysis) || !analysisName.trim()) return;
    
    try {
      setSaveStatus({ saving: true });
      setShowSaveModal(false);
      
      // Calculate processing time (if not already set)
      const processingTime = aiPrediction?.processing_time || (aiPrediction?.timestamp ? 
        (new Date().getTime() - new Date(aiPrediction.timestamp).getTime()) / 1000 : undefined);

      // Get features count from training result
      const featuresCount = aiTrainingResult?.feature_importance?.length;

      // Prepare analysis data to save
      const analysis_data = {
        ticker: selectedSymbol,
        timestamp: new Date().toISOString(),
        name: analysisName.trim(),
        
        // Core analysis data
        prediction: aiPrediction,
        analysis: aiAnalysis,
        recommendations: aiRecommendations,
        training_result: aiTrainingResult,
        stock_data: stockData,
        
        // Additional metadata
        model_version: aiTrainingResult?.model_version || "1.0.0",
        analysis_type: "Market Regime Analysis",
        timeframe: stockData?.period || "1y",
        model_confidence: aiPrediction?.confidence || aiAnalysis?.current_regime?.confidence,
        processing_time: processingTime,
        features_count: featuresCount,
        
        // Technical metadata
        status: "completed",
        features: aiTrainingResult?.feature_importance?.reduce((acc, feat) => ({
          ...acc,
          [feat.feature]: feat.importance
        }), {}) || {}
      };
      
      // Save analysis result
      const response = await userDataService.saveAIAnalysisResult(analysis_data);
      
      setSaveStatus({ 
        saving: false, 
        success: response.success, 
        message: response.message 
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus({ saving: false });
      }, 3000);
      
    } catch (error) {
      setSaveStatus({ 
        saving: false, 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to save analysis' 
      });
    }
  };

  // Effect to load initial stock data
  useEffect(() => {
    fetchStockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol]);
  
  const fetchStockData = async () => {
    try {
      setStockLoading(true);
      const response = await marketService.getStockInfo(selectedSymbol, '1y', '1d');
      setStockData({
        symbol: selectedSymbol,
        data: response.data,
        period: '1y',
        interval: '1d'
      });
    } catch (error) {
      setAiError('Failed to fetch stock data');
    } finally {
      setStockLoading(false);
    }
  };
  
  const handleAIAnalysis = async (config: AIAnalysisConfig) => {
    try {
      setAiLoading(true);
      setAiError(null);
      setLoadingProgress(0);
      setLoadingStep('Starting analysis...');
      
      // Track AI analysis start event
      trackEvent('ai_analysis_started', {
        symbol: config.ticker,
        period: config.period,
        user_type: user ? 'authenticated' : 'anonymous'
      });
      
      // Start loading simulation
      const loadingPromise = simulateLoadingSteps();
      
      // Check if user is authenticated
      if (!user) {
        // Anonymous user - check remaining analyses
        if (anonymousUsage.remainingAnalyses <= 0) {
          trackEvent('ai_analysis_limit_reached', { user_type: 'anonymous' });
          setShowLoginModal(true);
          setAiLoading(false);
          return;
        }
        
        // Decrement remaining analyses for anonymous users
        setAnonymousUsage(prev => ({
          ...prev,
          remainingAnalyses: prev.remainingAnalyses - 1
        }));
      } else {
        // Authenticated user - check subscription limits
        if (!canUseLLM()) {
          setShowLimitModal(true);
          setAiLoading(false);
          return;
        }
        
        // Increment usage for authenticated users
        await incrementLLMUsage();
      }
      
      // Update selected symbol if changed
      if (config.ticker !== selectedSymbol) {
        setSelectedSymbol(config.ticker);
      }
      
      // Store current configuration
      setCurrentConfig(config);
      
      // If retrain is requested, train the model first
      if (config.retrain) {
        try {
          const trainingResponse = await marketRegimeService.trainModel(
            config.ticker,
            config.period,
            true
          );
          
          setAiTrainingResult(trainingResponse);
        } catch (error) {
          setAiError('Failed to train model');
        }
      }
      
      if (!user) {
        // Use anonymous API for non-authenticated users (cookie-based, no sessionId needed)
        try {
          const anonymousResponse = await marketService.anonymousAIAnalysis({
            ticker: config.ticker,
            period: config.period
          });

          // Update usage information if provided
          if (anonymousResponse.usage) {
            setAnonymousUsage(prev => ({
              ...prev,
              remainingAnalyses: anonymousResponse.usage.remaining ?? prev.remainingAnalyses
            }));
          }

          // Set the response data (assuming the API returns the same structure)
          setAiPrediction(anonymousResponse.prediction);
          setAiAnalysis(anonymousResponse.analysis);
          setAiRecommendations(anonymousResponse.recommendations);
          if (anonymousResponse.training_result) {
            setAiTrainingResult(anonymousResponse.training_result);
          }
        } catch (error: any) {
          if (error.response?.status === 403) {
            // Anonymous limit exceeded, show login modal
            setAnonymousUsage(prev => ({
              ...prev,
              remainingAnalyses: 0
            }));
            setShowLoginModal(true);
            setAiLoading(false);
            return;
          }
          throw error;
        }
      } else {
        // Use regular authenticated APIs
        // Get prediction with configuration
        const predictionResponse = await marketRegimeService.predictRegime(config.ticker, {
          useRandomForest: config.useRandomForest,
          useHmm: config.useHmm
        });
        setAiPrediction(predictionResponse);
        
        // Get comprehensive analysis
        const analysisResponse = await marketRegimeService.getAnalysis(config.ticker);
        setAiAnalysis(analysisResponse);
        
        // Get recommendations
        const recommendationsResponse = await marketRegimeService.getRecommendations(config.ticker);
        setAiRecommendations(recommendationsResponse);
      }
      
      // Fetch stock data if needed
      if (config.ticker !== selectedSymbol) {
        await fetchStockData();
      }
      
      // Wait for loading simulation to complete
      await loadingPromise;
      
      // Track successful AI analysis completion
      trackEvent('ai_analysis_completed', {
        symbol: config.ticker,
        period: config.period,
        user_type: user ? 'authenticated' : 'anonymous',
        has_prediction: !!aiPrediction,
        has_analysis: !!aiAnalysis,
        has_recommendations: !!aiRecommendations
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI Analysis failed';
      setAiError(errorMessage);
      
      // Track AI analysis error
      trackEvent('ai_analysis_error', {
        symbol: config.ticker,
        user_type: user ? 'authenticated' : 'anonymous',
        error_message: errorMessage
      });
    } finally {
      setAiLoading(false);
      setLoadingStep('');
      setLoadingProgress(0);
      
      // Scroll to results on mobile after a short delay to allow DOM update
      setTimeout(() => {
        if (window.innerWidth < 1024 && resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };
  

  
  // Render feature importance chart
  const renderFeatureImportance = () => {
    if (!aiTrainingResult || !aiTrainingResult.feature_importance) return null;
    
    // Sort features by importance
    const sortedFeatures = [...aiTrainingResult.feature_importance]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10); // Top 10 features
    
    return (
      <div className="mt-6 bg-white dark:bg-dark-400 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-indigo-500" />
          Top Feature Importance
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {sortedFeatures.map((feature, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center">
                  <span className="w-32 truncate text-sm">{feature.feature}</span>
                  <div className="flex-grow">
                    <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-indigo-500" 
                        style={{ width: `${feature.importance * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm">{(feature.importance * 100).toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render model metrics
  const renderModelMetrics = () => {
    if (!aiTrainingResult) return null;
    
    return (
      <div className="mt-6 bg-white dark:bg-dark-400 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <BeakerIcon className="h-5 w-5 mr-2 text-indigo-500" />
          Model Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
            <p className="text-xl font-semibold">{(aiTrainingResult.accuracy * 100).toFixed(2)}%</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Cross-Validation</p>
            <p className="text-xl font-semibold">{(aiTrainingResult.cv_mean * 100).toFixed(2)}%</p>
            <p className="text-xs text-gray-500">±{(aiTrainingResult.cv_std * 100).toFixed(2)}%</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Training Samples</p>
            <p className="text-xl font-semibold">{aiTrainingResult.training_samples}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Test Samples</p>
            <p className="text-xl font-semibold">{aiTrainingResult.test_samples}</p>
          </div>
        </div>
      </div>
    );
  };
  
  const handleStockSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="container mx-auto px-4 pt-20 md:pt-8 pb-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Market Regime Analysis</h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI-powered market regime detection and analysis
        </p>
      </div>
      
      {/* Two-column layout for Analysis Settings and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Analysis Settings */}
        <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">AI Analysis Settings</h2>
          <AIAnalysisForm onAnalyze={handleAIAnalysis} defaultTicker={selectedSymbol} />
        </div>
        
        {/* AI Analysis Results */}
        <div ref={resultsRef} className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">AI Analysis Results</h2>
            {(aiPrediction || aiAnalysis) && (
              <button
                onClick={handleOpenSaveModal}
                disabled={saveStatus.saving}
                className={`px-4 py-2 text-sm rounded-md ${
                  saveStatus.saving ? 'bg-gray-400' : 
                  saveStatus.success === true ? 'bg-green-500' : 
                  saveStatus.success === false ? 'bg-red-500' : 
                  'bg-indigo-600 hover:bg-indigo-700'
                } text-white transition-colors`}
              >
                {saveStatus.saving ? 'Saving...' : 
                 saveStatus.success === true ? 'Saved!' : 
                 saveStatus.success === false ? 'Failed' : 
                 'Save'}
              </button>
            )}
          </div>
          
          {saveStatus.message && (
            <div className={`p-3 mb-4 rounded-md ${saveStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {saveStatus.message}
            </div>
          )}
          
          {aiLoading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-indigo-200 opacity-30"></div>
              </div>
              
              <div className="text-center space-y-4 w-full max-w-md">
                <div className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                  {loadingStep}
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(loadingProgress)}% Complete
                </div>
              </div>
            </div>
          ) : aiError ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {aiError}
            </div>
          ) : aiPrediction && aiAnalysis ? (
            <AIAnalysisResults
              prediction={aiPrediction}
              analysis={aiAnalysis}
              recommendations={aiRecommendations}
              ticker={selectedSymbol}
              config={{
                useRandomForest: currentConfig?.useRandomForest,
                useHmm: currentConfig?.useHmm
              }}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              No analysis results available
            </div>
          )}
        </div>
      </div>
      
      {/* Full-width Stock Price Chart */}
      <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4 gap-3 md:gap-0">
          <h2 className="text-lg md:text-xl font-semibold">Stock Price Chart</h2>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {popularStocks.map(stock => (
              <button
                key={stock.symbol}
                className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-md ${
                  selectedSymbol === stock.symbol
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-200'
                }`}
                onClick={() => handleStockSelect(stock.symbol)}
              >
                {stock.symbol}
              </button>
            ))}
          </div>
        </div>
        
        {stockLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : stockData ? (
          <div className="h-64 md:h-96">
            <StockChart
              stockData={{
                symbol: stockData.symbol,
                data: stockData.data
              }}
              height={typeof window !== 'undefined' && window.innerWidth < 768 ? 256 : 384}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No stock data available
          </div>
        )}
      </div>
      
      {aiTrainingResult && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Model Training Results</h2>
          {renderModelMetrics()}
          {renderFeatureImportance()}
        </div>
      )}
      
      {/* Removed usage and plan cards as requested */}
      
      {/* Modals */}
      <LimitExceededModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureType="llm"
        message="You have reached your daily limit for AI analysis. Please upgrade your plan to continue using this feature."
      />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setAnonymousUsage({ remainingAnalyses: 0, sessionId: null });
          setShowLoginModal(false);
        }}
        message="Sign up to get unlimited access to our AI-powered market analysis"
      />
      
      {/* Save AI Analysis Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Save AI Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Enter a name for your AI analysis to save all results and insights.
            </p>
            <input
              type="text"
              value={analysisName}
              onChange={(e) => setAnalysisName(e.target.value)}
              placeholder="Enter analysis name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setAnalysisName('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={!analysisName.trim()}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  analysisName.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Save Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelthAIPage;