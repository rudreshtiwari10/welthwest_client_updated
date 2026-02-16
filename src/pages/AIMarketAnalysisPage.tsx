import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import StockChart from '../components/StockChart';
import { marketService, hmmService } from '../services/api';
import UpgradeModal from '../components/UpgradeModal';
import LoginModal from '../components/LoginModal';
import { 
  SparklesIcon,
  BeakerIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { trackEvent } from '../utils/analytics';

// Define interfaces for HMM analysis results
interface HMMPredictionResult {
  status: string;
  regime: number;
  regime_name: string;
  regime_description: string;
  confidence: number;
  current_probabilities: { [key: string]: number };
  next_state_probabilities: { [key: string]: number };
  state_sequence: number[];
  model_score: number;
  timestamp: string;
}

interface HMMAnalysisResult {
  status: string;
  regime_persistence: {
    [key: string]: {
      average_duration: number;
      max_duration: number;
      num_periods: number;
    };
  };
  transition_matrix: number[][];
  observed_transitions: number[][];
  state_distribution: { [key: string]: number };
  analysis_period: string;
  total_periods: number;
}

interface HMMModelInfo {
  status: string;
  model_type: string;
  n_components: number;
  covariance_type: string;
  is_trained: boolean;
  regime_definitions: {
    [key: string]: {
      name: string;
      description: string;
      characteristics: string;
    };
  };
  transition_matrix: number[][];
  means: number[][];
  covariances: number[][][];
}

// Interface for stock data
interface StockData {
  symbol: string;
  data: any[];
  period: string;
  interval: string;
}

// Analysis configuration interface
interface HMMAnalysisConfig {
  ticker: string;
  period: string;
  analyzeHistory: boolean;
  getModelInfo: boolean;
}

const AIMarketAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const { canUseLLM, incrementLLMUsage, subscriptionTier } = useSubscription();
  
  // Default stock symbol
  const defaultSymbol = 'RELIANCE';
  
  // Market regime definitions mapping
  const regimeDefinitions = {
    0: {
      name: 'Low Volatility Market',
      description: 'Stable market conditions with predictable price movements and low risk',
      characteristics: 'Small price changes, consistent trends, lower trading volumes',
      color: 'green'
    },
    1: {
      name: 'Normal Market Conditions', 
      description: 'Typical market behavior with moderate volatility and regular price movements',
      characteristics: 'Regular price movements, balanced trading activity, moderate risk',
      color: 'blue'
    },
    2: {
      name: 'High Volatility Market',
      description: 'Turbulent market conditions with large price swings and increased uncertainty',
      characteristics: 'Large price movements, unpredictable behavior, high risk periods',
      color: 'red'
    }
  };
  
  // Analysis state
  const [hmmLoading, setHmmLoading] = useState(false);
  const [hmmError, setHmmError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [hmmPrediction, setHmmPrediction] = useState<HMMPredictionResult | undefined>(undefined);
  const [hmmAnalysis, setHmmAnalysis] = useState<HMMAnalysisResult | undefined>(undefined);
  const [hmmModelInfo, setHmmModelInfo] = useState<HMMModelInfo | undefined>(undefined);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultSymbol);
  
  // Current analysis configuration
  const [currentConfig, setCurrentConfig] = useState<HMMAnalysisConfig>({
    ticker: defaultSymbol,
    period: '6mo',
    analyzeHistory: true, // Always enabled for full analysis
    getModelInfo: false
  });
  
  // Anonymous usage tracking
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [anonymousUsage, setAnonymousUsage] = useState({
    remainingAnalyses: 5, // Default, will be updated from backend
    totalLimit: 5, // Default, will be updated from backend
    sessionId: null as string | null
  });
  
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

  // Simulate loading steps with progress
  const simulateLoadingSteps = async () => {
    const steps = [
      { message: 'Initializing market analysis...', duration: 800 },
      { message: 'Collecting market data...', duration: 1200 },
      { message: 'Processing price patterns...', duration: 1000 },
      { message: 'Training AI models...', duration: 1500 },
      { message: 'Detecting market conditions...', duration: 1200 },
      { message: 'Calculating probabilities...', duration: 800 },
      { message: 'Finalizing insights...', duration: 600 }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setLoadingStep(step.message);
      setLoadingProgress(((i + 1) / steps.length) * 100);
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
  };

  // Effect to load initial stock data and fetch usage
  useEffect(() => {
    fetchStockData();

    // Anonymous usage tracked locally with 5 free uses
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol, user]);

  const fetchAnonymousUsage = async () => {
    try {
      const usageData = await marketService.getAnonymousUsage();
      if (usageData.features) {
        const aiAnalysisUsage = usageData.features['ai-market-analysis'];
        if (aiAnalysisUsage) {
          setAnonymousUsage(prev => ({
            ...prev,
            remainingAnalyses: aiAnalysisUsage.remaining,
            totalLimit: aiAnalysisUsage.limit
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching anonymous usage:', error);
      // Keep default values on error
    }
  };
  
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
      setHmmError('Failed to fetch stock data');
    } finally {
      setStockLoading(false);
    }
  };
  

  const handleHMMAnalysis = async (config: HMMAnalysisConfig) => {
    try {
      setHmmLoading(true);
      setHmmError(null);
      setLoadingProgress(0);
      setLoadingStep('Starting AI analysis...');

      // Track AI analysis start event
      trackEvent('ai_analysis_started', {
        symbol: config.ticker,
        period: config.period,
        user_type: user ? 'authenticated' : 'anonymous'
      });

      // Start loading simulation
      const loadingPromise = simulateLoadingSteps();

      // Update selected symbol if changed
      if (config.ticker !== selectedSymbol) {
        setSelectedSymbol(config.ticker);
      }

      // Store current configuration
      setCurrentConfig(config);

      // Use unified API endpoint that handles both authenticated and anonymous users
      // The backend will automatically check limits and return appropriate responses
      try {
        const response = await marketService.anonymousAIAnalysis({
          ticker: config.ticker,
          period: config.period
        });

        // Update usage information if provided (for anonymous users)
        if (!user && response.usage) {
          setAnonymousUsage(prev => ({
            ...prev,
            remainingAnalyses: response.usage.remaining ?? prev.remainingAnalyses
          }));
        }

        // Set the response data from prediction
        if (response.prediction) {
          setHmmPrediction(response.prediction);
        }

        // Set the analysis data (for detailed tables)
        if (response.analysis) {
          setHmmAnalysis(response.analysis);
        }

        // Set recommendations if available
        if (response.recommendations) {
          // Store recommendations if needed
        }

        // For authenticated users, increment usage tracking
        if (user) {
          try {
            await incrementLLMUsage();
          } catch (usageError) {
            console.warn('Could not update usage count:', usageError);
          }
        }

      } catch (error: any) {
        if (error.response?.status === 403) {
          // Limit exceeded - show appropriate modal
          if (!user) {
            // Anonymous limit exceeded, show login modal
            setAnonymousUsage(prev => ({
              ...prev,
              remainingAnalyses: 0
            }));
            setShowLoginModal(true);
          } else {
            // Authenticated user limit exceeded, show upgrade modal
            setShowLimitModal(true);
          }
          setHmmLoading(false);
          return;
        }
        throw error;
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
        has_prediction: !!hmmPrediction,
        has_analysis: !!hmmAnalysis
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI Analysis failed';
      setHmmError(errorMessage);

      // Track AI analysis error
      trackEvent('ai_analysis_error', {
        symbol: config.ticker,
        user_type: user ? 'authenticated' : 'anonymous',
        error_message: errorMessage
      });
    } finally {
      setHmmLoading(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  };

  // Handle stock selection
  const handleStockSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    setCurrentConfig(prev => ({ ...prev, ticker: symbol }));
  };

  // Render regime probabilities chart
  const renderRegimeProbabilities = () => {
    if (!hmmPrediction || !hmmPrediction.current_probabilities) return null;
    
    const probabilities = Object.entries(hmmPrediction.current_probabilities);
    
    return (
      <div className="mt-6 bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Market Condition Probability Distribution
        </h3>
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Analysis:</strong> Current probability distribution across different market conditions based on recent price patterns and volatility indicators.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Market Condition</th>
                <th className="text-center p-3 border border-gray-300 dark:border-gray-600 font-semibold">Probability</th>
                <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {probabilities.map(([state, probability], index) => {
                const regimeName = regimeDefinitions[index as keyof typeof regimeDefinitions]?.name || `Regime ${index}`;
                const isCurrentRegime = hmmPrediction.regime === index;
                
                return (
                  <tr key={state} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="font-medium p-3 border border-gray-300 dark:border-gray-600">
                      {regimeName}
                    </td>
                    <td className="text-center p-3 border border-gray-300 dark:border-gray-600">
                      <span className="font-semibold text-lg">
                        {(probability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 border border-gray-300 dark:border-gray-600">
                      {isCurrentRegime ? (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded">
                          Active Condition
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          Alternative
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render transition matrix
  const renderTransitionMatrix = () => {
    if (!hmmAnalysis || !hmmAnalysis.transition_matrix) return null;
    
    return (
      <div className="mt-6 bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Market Condition Transition Probabilities
        </h3>
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Analysis:</strong> Shows the probability of market conditions changing from one state to another in the next period. 
            Higher percentages indicate more frequent transitions between market states.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Current Market Condition</th>
                {hmmAnalysis.transition_matrix.map((_, index) => (
                  <th key={index} className="text-center p-3 border border-gray-300 dark:border-gray-600 font-semibold">
                    {regimeDefinitions[index as keyof typeof regimeDefinitions]?.name.replace(' Market', '').replace(' Conditions', '') || `State ${index}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hmmAnalysis.transition_matrix.map((row, rowIndex) => {
                const regimeName = regimeDefinitions[rowIndex as keyof typeof regimeDefinitions]?.name || `State ${rowIndex}`;
                return (
                  <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="font-medium p-3 border border-gray-300 dark:border-gray-600">
                      {regimeName}
                    </td>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="text-center p-3 border border-gray-300 dark:border-gray-600">
                        <span className="font-medium">
                          {(cell * 100).toFixed(1)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Interpretation:</strong> Each row shows the probability of transitioning to different market conditions. 
          For example, if currently in "High Volatility Market", the row shows chances of moving to Low, Normal, or High volatility tomorrow.</p>
        </div>
      </div>
    );
  };

  // Render regime persistence
  const renderRegimePersistence = () => {
    if (!hmmAnalysis || !hmmAnalysis.regime_persistence) return null;
    
    return (
      <div className="mt-6 bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Market Condition Duration Analysis
        </h3>
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Analysis:</strong> Historical data showing how long each market condition typically persists. 
            Understanding duration patterns helps in strategic planning and risk management.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Market Condition</th>
                <th className="text-center p-3 border border-gray-300 dark:border-gray-600 font-semibold">Average Duration</th>
                <th className="text-center p-3 border border-gray-300 dark:border-gray-600 font-semibold">Maximum Duration</th>
                <th className="text-center p-3 border border-gray-300 dark:border-gray-600 font-semibold">Occurrences</th>
                <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Strategic Notes</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(hmmAnalysis.regime_persistence).map(([state, data], index) => {
                const regimeName = regimeDefinitions[index as keyof typeof regimeDefinitions]?.name || state.replace('_', ' ');
                const regimeColor = regimeDefinitions[index as keyof typeof regimeDefinitions]?.color || 'gray';
                
                return (
                  <tr key={state} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="font-medium p-3 border border-gray-300 dark:border-gray-600">
                      {regimeName}
                    </td>
                    <td className="text-center p-3 border border-gray-300 dark:border-gray-600">
                      <span className="font-semibold">{data.average_duration.toFixed(1)}</span> days
                    </td>
                    <td className="text-center p-3 border border-gray-300 dark:border-gray-600">
                      <span className="font-semibold">{data.max_duration}</span> days
                    </td>
                    <td className="text-center p-3 border border-gray-300 dark:border-gray-600">
                      {data.num_periods} periods
                    </td>
                    <td className="p-3 border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400">
                      {regimeColor === 'green' && 'Suitable for steady, longer-term positions'}
                      {regimeColor === 'blue' && 'Optimal for standard trading strategies'}
                      {regimeColor === 'red' && 'Requires enhanced risk management'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Key Insight:</strong> Duration analysis helps set realistic expectations for position holding periods. 
            Current market conditions typically persist for the average duration shown, with maximum observed streaks providing upper bounds for planning.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 pt-20 md:pt-8 pb-8">
      <div className="relative mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Market Analysis</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Advanced artificial intelligence for market condition detection and volatility analysis
        </p>

        {/* Anonymous Usage Display - Compact Right Corner */}
        {!user && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md px-3 py-2 text-white text-xs">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4" />
              <div>
                <div className="font-semibold">{anonymousUsage.remainingAnalyses}/{anonymousUsage.totalLimit} Free Trials Left</div>
                <div className="w-20 bg-white bg-opacity-30 rounded-full h-1 mt-1">
                  <div
                    className="bg-white rounded-full h-1 transition-all duration-300"
                    style={{ width: `${(anonymousUsage.remainingAnalyses / anonymousUsage.totalLimit) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-medium transition-all whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Two-column layout for Analysis Settings and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Analysis Settings */}
        <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CpuChipIcon className="h-6 w-6 mr-2 text-purple-500" />
            AI Analysis Settings
          </h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleHMMAnalysis(currentConfig);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stock Symbol</label>
              <input
                type="text"
                value={currentConfig.ticker}
                onChange={(e) => setCurrentConfig(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., RELIANCE"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Analysis Period</label>
              <select
                value={currentConfig.period}
                onChange={(e) => setCurrentConfig(prev => ({ ...prev, period: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="3mo">3 Months</option>
                <option value="6mo">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="2y">2 Years</option>
              </select>
            </div>
            
            {user && (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="analyzeHistory"
                    checked={currentConfig.analyzeHistory}
                    onChange={(e) => setCurrentConfig(prev => ({ ...prev, analyzeHistory: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="analyzeHistory" className="text-sm">
                    Include historical regime analysis
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="getModelInfo"
                    checked={currentConfig.getModelInfo}
                    onChange={(e) => setCurrentConfig(prev => ({ ...prev, getModelInfo: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="getModelInfo" className="text-sm">
                    Fetch model information
                  </label>
                </div>
              </>
            )}
            
            <button
              type="submit"
              disabled={hmmLoading}
              className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
                hmmLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {hmmLoading ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          </form>
        </div>
        
        {/* AI Analysis Results */}
        <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <SparklesIcon className="h-6 w-6 mr-2 text-purple-500" />
            AI Analysis Results
          </h2>
          
          {hmmLoading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-purple-200 opacity-30"></div>
              </div>
              
              <div className="text-center space-y-4 w-full max-w-md">
                <div className="text-lg font-medium text-purple-600 dark:text-purple-400">
                  {loadingStep}
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(loadingProgress)}% Complete
                </div>
              </div>
            </div>
          ) : hmmError ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Analysis Error</div>
                <div className="text-sm mt-1">{hmmError}</div>
              </div>
            </div>
          ) : hmmPrediction ? (
            <div className="space-y-4">
              {/* Current Market Condition Display */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border-l-4 border-gray-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Current Market Condition
                    </h3>
                    <div className="mb-3">
                      <span className="inline-block bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200">
                        {regimeDefinitions[hmmPrediction.regime as keyof typeof regimeDefinitions]?.name || hmmPrediction.regime_name}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {regimeDefinitions[hmmPrediction.regime as keyof typeof regimeDefinitions]?.description || hmmPrediction.regime_description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Characteristics: {regimeDefinitions[hmmPrediction.regime as keyof typeof regimeDefinitions]?.characteristics}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Analysis Confidence: <span className="font-semibold text-gray-900 dark:text-white">{(hmmPrediction.confidence * 100).toFixed(1)}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next State Probabilities */}
              {hmmPrediction.next_state_probabilities && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Next Period Forecast
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(hmmPrediction.next_state_probabilities).map(([state, prob], index) => {
                      const regimeName = regimeDefinitions[index as keyof typeof regimeDefinitions]?.name.replace(' Market', '').replace(' Conditions', '') || state;
                      return (
                        <div key={state} className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{regimeName}</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">{(prob * 100).toFixed(1)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No analysis results available. Configure settings and run analysis.
            </div>
          )}
        </div>
      </div>
      
      {/* Advanced Analysis Results - Available for all users */}
      {hmmPrediction && hmmAnalysis && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-semibold">Advanced Market Analysis</h2>

          {renderRegimeProbabilities()}
          {renderTransitionMatrix()}
          {renderRegimePersistence()}
          
          {/* Model Information */}
          {hmmModelInfo && (
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                Model Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Model Type</p>
                  <p className="font-semibold">{hmmModelInfo.model_type}</p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Components</p>
                  <p className="font-semibold">{hmmModelInfo.n_components}</p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Covariance</p>
                  <p className="font-semibold">{hmmModelInfo.covariance_type}</p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-300 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`font-semibold ${hmmModelInfo.is_trained ? 'text-green-600' : 'text-red-600'}`}>
                    {hmmModelInfo.is_trained ? 'Trained' : 'Not Trained'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Stock Price Chart - Moved to bottom */}
      <div className="mt-8 bg-white dark:bg-dark-400 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4 gap-3 md:gap-0">
          <h2 className="text-lg md:text-xl font-semibold">Stock Price Chart</h2>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {popularStocks.map(stock => (
              <button
                key={stock.symbol}
                className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-md ${
                  selectedSymbol === stock.symbol
                    ? 'bg-purple-600 text-white'
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
      
      {/* Modals */}
      <UpgradeModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureName="AI Market Analysis"
        currentPlan={subscriptionTier || 'FREE'}
        upgradeMessage="You have reached your daily limit for AI analysis. Upgrade your plan to continue using this feature."
      />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setAnonymousUsage({ remainingAnalyses: 0, totalLimit: 5, sessionId: null });
          setShowLoginModal(false);
        }}
        message="Sign up to get unlimited access to our advanced AI market analysis"
      />
    </div>
  );
};

export default AIMarketAnalysisPage;