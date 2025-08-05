import React, { useState, useEffect } from 'react';
import AIAnalysisForm, { AIAnalysisConfig } from '../components/AIAnalysisForm';
import AIAnalysisResults from '../components/AIAnalysisResults';
import StockChart from '../components/StockChart';
import { marketService, marketRegimeService, userDataService } from '../services/api';
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
  // Default stock symbol
  const defaultSymbol = 'RELIANCE';
  
  // AI Analysis state
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
  
  // Save state
  const [saveStatus, setSaveStatus] = useState<{saving: boolean, success?: boolean, message?: string}>({saving: false});

  // Popular Indian stocks for quick selection
  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank' }
  ];

  // Handle saving AI analysis results
  const handleSaveAnalysis = async () => {
    if (!aiPrediction || !aiAnalysis) return;
    
    try {
      setSaveStatus({ saving: true });
      
      // Calculate processing time (if not already set)
      const processingTime = aiPrediction?.processing_time || (aiPrediction?.timestamp ? 
        (new Date().getTime() - new Date(aiPrediction.timestamp).getTime()) / 1000 : undefined);

      // Get features count from training result
      const featuresCount = aiTrainingResult?.feature_importance?.length;

      // Prepare analysis data to save
      const analysis_data = {
        ticker: selectedSymbol,
        timestamp: new Date().toISOString(),
        name: `${selectedSymbol} Analysis - ${new Date().toLocaleDateString()}`,
        
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
      console.error('Error saving AI analysis:', error);
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
      console.error('Error fetching stock data:', error);
      setAiError('Failed to fetch stock data');
    } finally {
      setStockLoading(false);
    }
  };
  
  const handleAIAnalysis = async (config: AIAnalysisConfig) => {
    try {
      setAiLoading(true);
      setAiError(null);
      
      // Update selected symbol if changed
      if (config.ticker !== selectedSymbol) {
        setSelectedSymbol(config.ticker);
      }
      
      // If retrain is requested, train the model first
      if (config.retrain) {
        setAiTrainingLoading(true);
        
        try {
          const trainingResponse = await marketRegimeService.trainModel(
            config.ticker,
            config.period,
            true
          );
          
          setAiTrainingResult(trainingResponse);
        } catch (error) {
          console.error('Error training model:', error);
          setAiError('Failed to train model');
        } finally {
          setAiTrainingLoading(false);
        }
      }
      
      // Get prediction
      const predictionResponse = await marketRegimeService.predictRegime(config.ticker);
      setAiPrediction(predictionResponse);
      
      // Get comprehensive analysis
      const analysisResponse = await marketRegimeService.getAnalysis(config.ticker);
      setAiAnalysis(analysisResponse);
      
      // Get recommendations
      const recommendationsResponse = await marketRegimeService.getRecommendations(config.ticker);
      setAiRecommendations(recommendationsResponse);
      
      // Fetch stock data if needed
      if (config.ticker !== selectedSymbol) {
        await fetchStockData();
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI Analysis failed';
      setAiError(errorMessage);
      console.error('AI Analysis error:', err);
    } finally {
      setAiLoading(false);
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Market Regime Analysis</h1>
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
        <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">AI Analysis Results</h2>
            {(aiPrediction && aiAnalysis) && (
              <button
                onClick={handleSaveAnalysis}
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
                 'Save Analysis'}
              </button>
            )}
          </div>
          
          {saveStatus.message && (
            <div className={`p-3 mb-4 rounded-md ${saveStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {saveStatus.message}
            </div>
          )}
          
          {aiLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              No analysis results available
            </div>
          )}
        </div>
      </div>
      
      {/* Full-width Stock Price Chart */}
      <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stock Price Chart</h2>
          <div className="flex space-x-2">
            {popularStocks.map(stock => (
              <button
                key={stock.symbol}
                className={`px-2 py-1 text-xs rounded-md ${
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
          <div className="h-96">
            <StockChart
              stockData={{
                symbol: stockData.symbol,
                data: stockData.data
              }}
              height={384}
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
    </div>
  );
};

export default WelthAIPage; 