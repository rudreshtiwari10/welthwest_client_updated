import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { API_URL } from '../services/api';
import UpgradeModal from '../components/UpgradeModal';
import LoginModal from '../components/LoginModal';
import {
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Define interfaces for stock suggestions
interface StockSuggestion {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

// Define interfaces for the LSTM API response
interface Prediction {
  day: number;
  date: string;
  predicted_close_price: number;
  change_from_last: number;
  change_percentage: number;
  confidence: string;
  trend: string;
}

interface LastActualPrice {
  date: string;
  close_price: number;
}

interface ModelInfo {
  trained_on?: string;
  training_period?: string;
  model_performance?: {
    mae?: number;
    rmse?: number;
    r2?: number;
    mape?: number;
  };
  time_steps_used?: number;
}

interface PredictionData {
  stock_symbol: string;
  prediction_generated_at: string;
  last_actual_price: LastActualPrice;
  predictions: Prediction[];
  model_info: ModelInfo;
  disclaimer: string;
}

interface PredictionResponse {
  success: boolean;
  message: string;
  data: PredictionData;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: string;
    available_stocks?: string[];
    timestamp: string;
  };
}

const MarketForecastingPage: React.FC = () => {
  const { user } = useAuth();
  const { subscriptionTier } = useSubscription();

  // State management
  const [ticker, setTicker] = useState<string>('RELIANCE');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [availableStocks, setAvailableStocks] = useState<string[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Stock suggestion state
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Anonymous usage tracking
  const [anonymousUsage, setAnonymousUsage] = useState({
    remainingAnalyses: 5,
    totalLimit: 5,
  });

  // Popular Indian stocks for quick selection (trained models)
  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories" },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
  ];

  // Fetch stock suggestions from backend
  const fetchStockSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setSuggestionLoading(true);
    try {
      const response = await fetch(`${API_URL}/yahoo-suggest?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.quotes && Array.isArray(data.quotes)) {
        setSuggestions(data.quotes);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setSuggestionLoading(false);
    }
  };

  // Handle ticker input change with debouncing
  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setTicker(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      fetchStockSuggestions(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: StockSuggestion) => {
    // Remove .NS or .BO suffix for display
    const cleanSymbol = suggestion.symbol.replace('.NS', '').replace('.BO', '');
    setTicker(cleanSymbol);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleFetchPrediction();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          handleFetchPrediction();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Loading simulation
  const simulateLoadingSteps = async () => {
    const steps = [
      { message: 'Loading trained model...', duration: 800 },
      { message: 'Fetching latest stock data...', duration: 1000 },
      { message: 'Preparing input features...', duration: 700 },
      { message: 'Running LSTM prediction...', duration: 1200 },
      { message: 'Calculating confidence levels...', duration: 600 },
      { message: 'Finalizing forecast...', duration: 500 },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setLoadingStep(step.message);
      setLoadingProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
  };

  // Fetch prediction data
  const handleFetchPrediction = async () => {
    if (!ticker.trim()) {
      setError('Please enter a stock ticker symbol');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPredictionData(null);
      setAvailableStocks([]);
      setLoadingProgress(0);
      setLoadingStep('Starting analysis...');

      // Start loading simulation
      const loadingPromise = simulateLoadingSteps();

      // Add .NS suffix for Indian stocks if not present
      const tickerWithSuffix = ticker.includes('.') ? ticker : `${ticker}.NS`;

      // Call LSTM predict API
      const response = await fetch(`${API_URL}/lstm/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_symbol: tickerWithSuffix
        })
      });

      const data = await response.json();

      // Wait for loading simulation
      await loadingPromise;

      if (data.success) {
        setPredictionData(data.data);
      } else {
        // Handle error response
        const errorData = data as ErrorResponse;
        setError(errorData.error.message);

        if (errorData.error.code === 'MODEL_NOT_FOUND' && errorData.error.available_stocks) {
          setAvailableStocks(errorData.error.available_stocks);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch predictions';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: string): string => {
    const lowerConfidence = confidence.toLowerCase();
    if (lowerConfidence === 'high') return 'green';
    if (lowerConfidence === 'medium') return 'yellow';
    return 'red';
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
    if (trend === 'down') return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
    return null;
  };

  return (
    <div className="container mx-auto px-4 pt-20 md:pt-8 pb-8">
      {/* Header */}
      <div className="mb-8 relative">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-3 text-blue-500" />
          LSTM Price Forecasting
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Advanced deep learning-based stock price predictions
        </p>

        {/* Anonymous Usage Display */}
        {!user && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md px-3 py-2 text-white text-xs">
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

      {/* Input Form */}
      <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-4 md:p-6 mb-8 max-w-3xl mx-auto">
        <h2 className="text-lg md:text-xl font-semibold mb-3 flex items-center">
          <SparklesIcon className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-500" />
          Stock Selection
        </h2>

        <div className="space-y-3">
          {/* Stock Input with Quick Select */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Stock ticker input with search suggestions */}
            <div className="flex-1 relative" ref={dropdownRef}>
              <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Stock Ticker</label>
              <input
                type="text"
                value={ticker}
                onChange={handleTickerChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-blue-400"
                placeholder="e.g., RELIANCE, TCS, INFY"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && ticker.length >= 2 && (
                <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                  {suggestionLoading ? (
                    <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      Loading suggestions...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={suggestion.symbol}
                          className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                            index === selectedSuggestionIndex
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                          onClick={() => handleSuggestionSelect(suggestion)}
                          onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{suggestion.symbol}</span>
                              <span className="ml-2 text-gray-600 dark:text-gray-400">{suggestion.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500">{suggestion.exchange}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      No suggestions found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="sm:pt-5">
              <button
                onClick={handleFetchPrediction}
                disabled={loading || !ticker.trim()}
                className={`w-full sm:w-auto px-5 py-2 text-sm rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                  loading || !ticker.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Predicting
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    Predict
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Popular stocks quick selection */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-600 dark:text-gray-400">Trained Models (Quick Select)</label>
            <div className="flex flex-wrap gap-1.5">
              {popularStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setTicker(stock.symbol)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-all transform hover:scale-105 active:scale-95 ${
                    ticker === stock.symbol || ticker === stock.symbol + '.NS'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400 ring-opacity-50'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
                  }`}
                  title={stock.name}
                >
                  {stock.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col justify-center items-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-blue-200 opacity-30"></div>
            </div>

            <div className="text-center space-y-4 w-full max-w-md">
              <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                {loadingStep}
              </div>

              <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(loadingProgress)}% Complete
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-8">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">Error</div>
              <div className="text-sm mt-1">{error}</div>

              {/* Show available stocks if model not found */}
              {availableStocks.length > 0 && (
                <div className="mt-3">
                  <div className="font-medium text-sm mb-2">Available trained models:</div>
                  <div className="flex flex-wrap gap-2">
                    {availableStocks.map((stock) => (
                      <button
                        key={stock}
                        onClick={() => setTicker(stock.replace('.NS', '').replace('.BO', ''))}
                        className="px-3 py-1 bg-red-200 hover:bg-red-300 text-red-800 rounded-md text-xs font-medium transition-colors"
                      >
                        {stock}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {predictionData && !loading && (
        <div className="space-y-6">
          {/* Current Price Card */}
          <div className="bg-white dark:bg-dark-400 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <CurrencyDollarIcon className="h-7 w-7 mr-2 text-blue-500" />
                  {predictionData.stock_symbol}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last Trading Date: {predictionData.last_actual_price.date}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Price</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{predictionData.last_actual_price.close_price.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-500" />
              Price Predictions
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Day</th>
                    <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Date</th>
                    <th className="text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold">Predicted Price</th>
                    <th className="text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold">Change</th>
                    <th className="text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold">Change %</th>
                    <th className="text-center p-3 border border-gray-300 dark:border-gray-600 font-semibold">Trend</th>
                    <th className="text-center p-3 border border-gray-300 dark:border-gray-600 font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {predictionData.predictions.map((prediction, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-3 border border-gray-300 dark:border-gray-600 font-medium">
                        Day {prediction.day}
                      </td>
                      <td className="p-3 border border-gray-300 dark:border-gray-600">
                        {prediction.date}
                      </td>
                      <td className="text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold">
                        ₹{prediction.predicted_close_price.toFixed(2)}
                      </td>
                      <td className={`text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold ${
                        prediction.change_from_last >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {prediction.change_from_last >= 0 ? '+' : ''}₹{prediction.change_from_last.toFixed(2)}
                      </td>
                      <td className={`text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold ${
                        prediction.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {prediction.change_percentage >= 0 ? '+' : ''}{prediction.change_percentage.toFixed(2)}%
                      </td>
                      <td className="text-center p-3 border border-gray-300 dark:border-gray-600">
                        <div className="flex justify-center">
                          {getTrendIcon(prediction.trend)}
                        </div>
                      </td>
                      <td className="text-center p-3 border border-gray-300 dark:border-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getConfidenceColor(prediction.confidence) === 'green'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : getConfidenceColor(prediction.confidence) === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {prediction.confidence}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Information */}
          {predictionData.model_info && (
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <InformationCircleIcon className="h-6 w-6 mr-2 text-indigo-500" />
                Model Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictionData.model_info.trained_on && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trained On</p>
                    <p className="text-lg font-semibold">
                      {new Date(predictionData.model_info.trained_on).toLocaleString()}
                    </p>
                  </div>
                )}
                {predictionData.model_info.training_period && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Training Period</p>
                    <p className="text-lg font-semibold">{predictionData.model_info.training_period}</p>
                  </div>
                )}
                {predictionData.model_info.model_performance && (
                  <>
                    {predictionData.model_info.model_performance.mae && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">MAE (Mean Absolute Error)</p>
                        <p className="text-lg font-semibold">₹{predictionData.model_info.model_performance.mae.toFixed(2)}</p>
                      </div>
                    )}
                    {predictionData.model_info.model_performance.rmse && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">RMSE (Root Mean Squared Error)</p>
                        <p className="text-lg font-semibold">₹{predictionData.model_info.model_performance.rmse.toFixed(2)}</p>
                      </div>
                    )}
                    {predictionData.model_info.model_performance.r2 !== undefined && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">R² Score</p>
                        <p className="text-lg font-semibold">{predictionData.model_info.model_performance.r2.toFixed(4)}</p>
                      </div>
                    )}
                    {predictionData.model_info.model_performance.mape && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">MAPE (Mean Absolute % Error)</p>
                        <p className="text-lg font-semibold">{predictionData.model_info.model_performance.mape.toFixed(2)}%</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Disclaimer</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {predictionData.disclaimer}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                <span>
                  Prediction generated at: {new Date(predictionData.prediction_generated_at).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UpgradeModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureName="LSTM Price Forecasting"
        currentPlan={subscriptionTier || 'FREE'}
        upgradeMessage="You have reached your daily limit for LSTM forecasts. Upgrade your plan to continue using this feature."
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
        message="Sign up to get access to our advanced LSTM price forecasting"
      />
    </div>
  );
};

export default MarketForecastingPage;
