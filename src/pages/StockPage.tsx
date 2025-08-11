import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marketService, marketRegimeService } from '../services/api';
import StockChart from '../components/StockChart';
import AIAnalysisToggle from '../components/AIAnalysisToggle';
import AIAnalysisForm, { AIAnalysisConfig } from '../components/AIAnalysisForm';
import AIAnalysisResults from '../components/AIAnalysisResults';
import SearchBarWithSuggestions from '../components/SearchBarWithSuggestions';
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
  const [fundamentalsData, setFundamentalsData] = useState<any>(null);
  const [fundamentalsLoading, setFundamentalsLoading] = useState(false);
  const [fundamentalsError, setFundamentalsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendingStocks, setTrendingStocks] = useState<any>({ gainers: [], losers: [] });
  const [marketData, setMarketData] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [chartHeight, setChartHeight] = useState(400);
  
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

  // Fetch fundamentals data
  const fetchFundamentalsData = async (ticker: string) => {
    setFundamentalsLoading(true);
    setFundamentalsError(null);
    
    try {
      const response = await marketService.getStockFundamentals(ticker);
      setFundamentalsData(response.data);
    } catch (err) {
      console.error('Error fetching fundamentals:', err);
      setFundamentalsError('Failed to load fundamental data');
    } finally {
      setFundamentalsLoading(false);
    }
  };

  // Fetch data based on whether symbol is provided
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (symbol) {
          // Fetch specific stock data
          const formattedSymbol = symbol.toUpperCase();
          const periodMapping = {
            '1d': '1d',
            '5d': '5d', 
            '1m': '1mo',
            '3m': '3mo',
            '6m': '6mo',
            '1y': '1y',
            '2y': '2y',
            '5y': '5y',
            'max': '10y'
          };
          const period = periodMapping[selectedTimeframe as keyof typeof periodMapping] || '1y';
          const interval = selectedTimeframe === '1d' ? '1m' : selectedTimeframe === '5d' ? '5m' : '1d';
          
          const response = await marketService.getStockInfo(formattedSymbol, period, interval);
          
          setStockData({
            symbol: formattedSymbol,
            data: response.data,
            period: response.period,
            interval: response.interval
          });

          // Also fetch fundamentals data for this stock
          fetchFundamentalsData(formattedSymbol);
        } else {
          // Fetch market overview data (trending stocks and market data)
          const [trendingData, indicesData] = await Promise.all([
            marketService.getTrendingStocks(),
            marketService.getMarketIndices()
          ]);
          
          setTrendingStocks(trendingData);
          setMarketData(indicesData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, selectedTimeframe]);

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

  // Render market overview page when no symbol is provided
  if (!symbol) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Stock Market Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Top performing stocks and market analysis
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Error</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Market Indices */}
            {marketData?.indices && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Major Indices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(marketData.indices).map((key) => {
                    const index_data = marketData.indices[key];
                    const isPositive = index_data.percentChange >= 0;
                    
                    return (
                      <Link key={key} to={`/stock/${key}`} className="group">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {index_data.name || key}
                          </h3>
                          <div className="mt-2">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              ₹{index_data.price?.toFixed(2) || '0.00'}
                            </div>
                            <div className={`flex items-center mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {isPositive ? (
                                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                              )}
                              <span className="font-medium">
                                {isPositive ? '+' : ''}{index_data.percentChange?.toFixed(2) || '0.00'}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top Gainers and Losers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Market Movers</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Gainers */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 flex items-center">
                      <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                      Top Gainers
                    </h3>
                  </div>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {trendingStocks?.gainers?.slice(0, 10).map((stock: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link to={`/stock/${stock.symbol.replace('.NS', '')}`} className="group">
                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                  {stock.symbol.replace('.NS', '')}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name || 'Stock'}</div>
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              ₹{typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                +{typeof stock.percentChange === 'number' ? stock.percentChange.toFixed(2) : stock.percentChange}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Losers */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center">
                      <ArrowTrendingDownIcon className="h-5 w-5 mr-2" />
                      Top Losers
                    </h3>
                  </div>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {trendingStocks?.losers?.slice(0, 10).map((stock: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link to={`/stock/${stock.symbol.replace('.NS', '')}`} className="group">
                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                  {stock.symbol.replace('.NS', '')}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name || 'Stock'}</div>
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                              ₹{typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                {typeof stock.percentChange === 'number' ? stock.percentChange.toFixed(2) : stock.percentChange}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    );
  }

  // Original stock page content for when symbol is provided
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stock Header with Search Bar */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stockData?.symbol || symbol}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {stockData?.data?.[0]?.name || 'Stock Details'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 lg:items-start">
          {/* Search Bar - Right Aligned */}
          <div className="max-w-md">
            <SearchBarWithSuggestions
              placeholders={["Search stocks...", "Search companies...", "Search symbols..."]}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 
                rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* AI Feature Promotion - Desktop */}
          <div className="hidden sm:block">
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
            {/* Price Header with Current Data */}
            {stockData?.data?.[0] && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹{stockData.data[0].Close?.toFixed(2) || '0.00'}
                    </div>
                    <div className="flex items-center mt-1">
                      {stockData.data[0].Close && stockData.data[1]?.Close && (
                        <>
                          {stockData.data[0].Close >= stockData.data[1].Close ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            stockData.data[0].Close >= stockData.data[1].Close 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {stockData.data[0].Close >= stockData.data[1].Close ? '+' : ''}
                            {((stockData.data[0].Close - stockData.data[1].Close) / stockData.data[1].Close * 100).toFixed(2)}%
                            ({(stockData.data[0].Close - stockData.data[1].Close).toFixed(2)})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Volume: {stockData.data[0].Volume?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Timeframe: {selectedTimeframe} • Updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
                Price Chart
              </h2>
              
              {/* Timeframe Controls */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {['1d', '5d', '1m', '3m', '6m', '1y', '2y', '5y', 'max'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      selectedTimeframe === timeframe
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chart Height Controls with +/- buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Chart Size:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setChartHeight(Math.max(200, chartHeight - 100))}
                    className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <span className="text-lg font-bold">−</span>
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
                    {chartHeight}px
                  </span>
                  <button
                    onClick={() => setChartHeight(Math.min(800, chartHeight + 100))}
                    className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ height: `${chartHeight}px` }}>
              {stockData && (
                <StockChart 
                  stockData={{
                    symbol: stockData.symbol,
                    data: stockData.data
                  }}
                  height={chartHeight}
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

          {/* Fundamental Ratios */}
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
              Fundamental Ratios
              {fundamentalsLoading && (
                <ArrowPathIcon className="h-4 w-4 ml-2 animate-spin text-blue-500" />
              )}
            </h2>
            
            {fundamentalsLoading ? (
              <div className="flex justify-center items-center h-32">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading fundamental data...</span>
              </div>
            ) : fundamentalsError ? (
              <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-400">{fundamentalsError}</p>
                <button
                  onClick={() => fetchFundamentalsData(symbol)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Valuation Ratios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b pb-2">Valuation</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fundamentalsData?.valuation_ratios?.pe_ratio?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">P/B Ratio</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fundamentalsData?.valuation_ratios?.pb_ratio?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">P/S Ratio</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fundamentalsData?.valuation_ratios?.ps_ratio?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">EV/EBITDA</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fundamentalsData?.valuation_ratios?.ev_ebitda?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profitability Ratios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b pb-2">Profitability</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ROE</span>
                      <span className={`font-semibold ${(fundamentalsData?.profitability_ratios?.roe || 0) > 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                        {fundamentalsData?.profitability_ratios?.roe ? `${fundamentalsData.profitability_ratios.roe.toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ROA</span>
                      <span className={`font-semibold ${(fundamentalsData?.profitability_ratios?.roa || 0) > 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                        {fundamentalsData?.profitability_ratios?.roa ? `${fundamentalsData.profitability_ratios.roa.toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ROIC</span>
                      <span className={`font-semibold ${(fundamentalsData?.profitability_ratios?.roic || 0) > 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                        {fundamentalsData?.profitability_ratios?.roic ? `${fundamentalsData.profitability_ratios.roic.toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Gross Margin</span>
                      <span className={`font-semibold ${(fundamentalsData?.profitability_ratios?.gross_margin || 0) > 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                        {fundamentalsData?.profitability_ratios?.gross_margin ? `${fundamentalsData.profitability_ratios.gross_margin.toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Health */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b pb-2">Financial Health</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Ratio</span>
                      <span className={`font-semibold ${(fundamentalsData?.financial_health?.current_ratio || 0) > 1.5 ? 'text-green-600' : (fundamentalsData?.financial_health?.current_ratio || 0) > 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {fundamentalsData?.financial_health?.current_ratio?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Quick Ratio</span>
                      <span className={`font-semibold ${(fundamentalsData?.financial_health?.quick_ratio || 0) > 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {fundamentalsData?.financial_health?.quick_ratio?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Debt/Equity</span>
                      <span className={`font-semibold ${(fundamentalsData?.financial_health?.debt_to_equity || 0) < 0.5 ? 'text-green-600' : (fundamentalsData?.financial_health?.debt_to_equity || 0) < 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {fundamentalsData?.financial_health?.debt_to_equity?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Interest Coverage</span>
                      <span className={`font-semibold ${(fundamentalsData?.financial_health?.interest_coverage || 0) > 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {fundamentalsData?.financial_health?.interest_coverage ? `${fundamentalsData.financial_health.interest_coverage.toFixed(1)}x` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Market Performance Metrics */}
            {fundamentalsData && !fundamentalsLoading && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Market Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">52W High</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{fundamentalsData?.market_performance?.fifty_two_week_high?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">52W Low</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{fundamentalsData?.market_performance?.fifty_two_week_low?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Dividend Yield</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {fundamentalsData?.market_performance?.dividend_yield ? `${fundamentalsData.market_performance.dividend_yield.toFixed(2)}%` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{fundamentalsData?.market_cap ? (fundamentalsData.market_cap / 10000000).toFixed(1) + 'L Cr' : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Balance Sheet Summary */}
          {fundamentalsData && !fundamentalsLoading && (
            <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Balance Sheet Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Assets */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b">Assets (₹ Crores)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Current Assets</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fundamentalsData?.balance_sheet?.current_assets ? fundamentalsData.balance_sheet.current_assets.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">Cash & Cash Equivalents</span>
                      <span className="text-gray-900 dark:text-white">
                        {fundamentalsData?.balance_sheet?.cash_and_equivalents ? fundamentalsData.balance_sheet.cash_and_equivalents.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">Trade Receivables</span>
                      <span className="text-gray-900 dark:text-white">
                        {fundamentalsData?.balance_sheet?.current_assets && fundamentalsData?.balance_sheet?.cash_and_equivalents 
                          ? (fundamentalsData.balance_sheet.current_assets - fundamentalsData.balance_sheet.cash_and_equivalents).toLocaleString() 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fixed Assets</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fundamentalsData?.balance_sheet?.fixed_assets ? fundamentalsData.balance_sheet.fixed_assets.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded px-2">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Total Assets</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {fundamentalsData?.balance_sheet?.total_assets ? fundamentalsData.balance_sheet.total_assets.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liabilities */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b">Liabilities & Equity (₹ Crores)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Liabilities</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fundamentalsData?.balance_sheet?.current_liabilities ? fundamentalsData.balance_sheet.current_liabilities.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">Short-term Borrowings</span>
                      <span className="text-gray-900 dark:text-white">
                        {fundamentalsData?.balance_sheet?.current_liabilities 
                          ? (fundamentalsData.balance_sheet.current_liabilities * 0.4).toFixed(0) 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">Trade Payables</span>
                      <span className="text-gray-900 dark:text-white">
                        {fundamentalsData?.balance_sheet?.current_liabilities 
                          ? (fundamentalsData.balance_sheet.current_liabilities * 0.6).toFixed(0)
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Long-term Debt</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {fundamentalsData?.balance_sheet?.long_term_debt ? fundamentalsData.balance_sheet.long_term_debt.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Shareholders' Equity</span>
                      <span className="font-semibold text-green-600">
                        {fundamentalsData?.balance_sheet?.shareholders_equity ? fundamentalsData.balance_sheet.shareholders_equity.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded px-2">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Total Liab. & Equity</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {fundamentalsData?.balance_sheet?.total_assets ? fundamentalsData.balance_sheet.total_assets.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Balance Sheet Ratios */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Working Capital</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{fundamentalsData?.balance_sheet?.working_capital ? fundamentalsData.balance_sheet.working_capital.toFixed(0) : 'N/A'} Cr
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Book Value/Share</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{fundamentalsData?.balance_sheet?.book_value_per_share ? fundamentalsData.balance_sheet.book_value_per_share.toFixed(0) : 'N/A'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revenue TTM</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{fundamentalsData?.key_metrics?.revenue_ttm ? fundamentalsData.key_metrics.revenue_ttm.toFixed(0) : 'N/A'} Cr
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">EPS</div>
                    <div className="text-lg font-semibold text-green-600">
                      ₹{fundamentalsData?.key_metrics?.earnings_per_share ? fundamentalsData.key_metrics.earnings_per_share.toFixed(2) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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