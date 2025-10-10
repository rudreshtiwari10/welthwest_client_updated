import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { marketService } from '../services/api';
import LimitExceededModal from '../components/subscription/LimitExceededModal';
import LoginModal from '../components/LoginModal';
import {
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

// Define interfaces for the API response
interface PriceForecast {
  date: string;
  predicted_price: number;
  price_change: number;
  day: number;
}

interface PriceAnalysis {
  current_price: number;
  forecast: PriceForecast[];
  lstm_trend: string;
  average_change_percent: number;
  technical_trend?: string;
  trend_strength?: number;
}

interface MarketRegime {
  current_regime: number;
  regime_name: string;
  confidence: number;
  regime_description: string;
  volatility?: number;
}

interface Recommendation {
  action: string;
  reasoning: string;
  confidence: string;
  model_agreement?: string;
  model_signals?: Record<string, any>;
}

interface RiskAssessment {
  level: string;
  score: number;
  description: string;
}

interface TradingSignals {
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  target_high: number;
  target_low: number;
}

interface PositionSizing {
  recommended_capital: number;
  position_percentage: number;
  kelly_criterion: number;
  max_risk: number;
  recommendation: string;
}

interface SentimentAnalysis {
  overall: number;
  trend: string;
  key_topics: string[];
}

interface Insights {
  detected_patterns: string[];
  price_action_signals: string[];
  breakouts: string[];
  sentiment_analysis: SentimentAnalysis;
  support_levels: number[];
  resistance_levels: number[];
}

interface FullTradeForecast {
  status: string;
  ticker: string;
  timestamp?: string;
  trading_style?: string;
  price_analysis: PriceAnalysis;
  market_regime: MarketRegime;
  recommendation: Recommendation;
  risk_assessment: RiskAssessment;
  signals: TradingSignals;
  position_sizing?: PositionSizing;
  insights?: Insights;
  message?: string;
}

const MarketRegimePage: React.FC = () => {
  const { user } = useAuth();
  const { canUseLLM, incrementLLMUsage } = useSubscription();

  // State management
  const [ticker, setTicker] = useState<string>('RELIANCE.NS');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<FullTradeForecast | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Popular Indian stocks for quick selection
  const popularStocks = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  ];

  // Loading simulation
  const simulateLoadingSteps = async () => {
    const steps = [
      { message: 'Fetching historical data...', duration: 800 },
      { message: 'Training LSTM model...', duration: 1500 },
      { message: 'Analyzing market regime...', duration: 1200 },
      { message: 'Generating price forecasts...', duration: 1000 },
      { message: 'Calculating trading signals...', duration: 900 },
      { message: 'Preparing recommendations...', duration: 700 },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setLoadingStep(step.message);
      setLoadingProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
  };

  // Fetch forecast data
  const handleFetchForecast = async () => {
    if (!ticker.trim()) {
      setError('Please enter a stock ticker symbol');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingStep('Starting analysis...');

      // Start loading simulation
      const loadingPromise = simulateLoadingSteps();

      // Check authentication and limits
      if (!user) {
        setShowLoginModal(true);
        setLoading(false);
        return;
      }

      if (!canUseLLM()) {
        setShowLimitModal(true);
        setLoading(false);
        return;
      }

      // Increment usage for authenticated users
      await incrementLLMUsage();

      // Fetch forecast data
      const response = await marketService.getFullTradeForecast(ticker);

      // Wait for loading simulation
      await loadingPromise;

      setForecastData(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch forecast data';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  };

  // Get action color
  const getActionColor = (action: string): string => {
    const upperAction = action.toUpperCase();
    if (upperAction.includes('BUY')) return 'green';
    if (upperAction.includes('SELL')) return 'red';
    return 'yellow';
  };

  // Get risk color
  const getRiskColor = (level: string): string => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel === 'low') return 'green';
    if (lowerLevel === 'medium') return 'yellow';
    return 'red';
  };

  // Get regime color
  const getRegimeColor = (regimeName: string): string => {
    if (regimeName.toLowerCase().includes('low')) return 'green';
    if (regimeName.toLowerCase().includes('high')) return 'red';
    return 'blue';
  };

  return (
    <div className="container mx-auto px-4 pt-20 md:pt-8 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-3 text-purple-500" />
          Market Regime & Trade Forecast
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI-powered LSTM & HMM analysis for intelligent trading decisions
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <SparklesIcon className="h-6 w-6 mr-2 text-purple-500" />
          Stock Selection
        </h2>

        <div className="space-y-4">
          {/* Stock ticker input */}
          <div>
            <label className="block text-sm font-medium mb-2">Stock Ticker Symbol</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., RELIANCE.NS"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleFetchForecast();
                }
              }}
            />
          </div>

          {/* Popular stocks quick selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Quick Select Popular Stocks</label>
            <div className="flex flex-wrap gap-2">
              {popularStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setTicker(stock.symbol)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    ticker === stock.symbol
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {stock.symbol.replace('.NS', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleFetchForecast}
            disabled={loading || !ticker.trim()}
            className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
              loading || !ticker.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Analyzing...' : 'Get AI Forecast'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col justify-center items-center space-y-6">
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
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-8 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {forecastData && !loading && (
        <div className="space-y-6">
          {/* Main Recommendation Card */}
          <div className={`bg-white dark:bg-dark-400 rounded-lg shadow-lg p-6 border-l-4 ${
            getActionColor(forecastData.recommendation.action) === 'green'
              ? 'border-green-500'
              : getActionColor(forecastData.recommendation.action) === 'red'
              ? 'border-red-500'
              : 'border-yellow-500'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <LightBulbIcon className="h-7 w-7 mr-2 text-yellow-500" />
                  Trading Recommendation
                </h2>
                <div className="mb-3">
                  <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                    getActionColor(forecastData.recommendation.action) === 'green'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : getActionColor(forecastData.recommendation.action) === 'red'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {forecastData.recommendation.action}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {forecastData.recommendation.confidence}
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {forecastData.recommendation.reasoning}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Price */}
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-4">
              <div className="flex items-center mb-2">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Price</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{forecastData.price_analysis.current_price.toFixed(2)}
              </p>
            </div>

            {/* LSTM Trend */}
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-4">
              <div className="flex items-center mb-2">
                {forecastData.price_analysis.lstm_trend === 'Bullish' ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 mr-2 text-red-500" />
                )}
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">LSTM Trend</h3>
              </div>
              <p className={`text-2xl font-bold ${
                forecastData.price_analysis.lstm_trend === 'Bullish'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {forecastData.price_analysis.lstm_trend}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {forecastData.price_analysis.average_change_percent > 0 ? '+' : ''}
                {forecastData.price_analysis.average_change_percent.toFixed(2)}%
              </p>
            </div>

            {/* Market Regime */}
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-4">
              <div className="flex items-center mb-2">
                <ChartBarIcon className={`h-5 w-5 mr-2 ${
                  getRegimeColor(forecastData.market_regime.regime_name) === 'green'
                    ? 'text-green-500'
                    : getRegimeColor(forecastData.market_regime.regime_name) === 'red'
                    ? 'text-red-500'
                    : 'text-blue-500'
                }`} />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Regime</h3>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {forecastData.market_regime.regime_name.replace('Regime', '').trim()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {(forecastData.market_regime.confidence * 100).toFixed(0)}% confidence
              </p>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-4">
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className={`h-5 w-5 mr-2 ${
                  getRiskColor(forecastData.risk_assessment.level) === 'green'
                    ? 'text-green-500'
                    : getRiskColor(forecastData.risk_assessment.level) === 'red'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                }`} />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Level</h3>
              </div>
              <p className={`text-2xl font-bold ${
                getRiskColor(forecastData.risk_assessment.level) === 'green'
                  ? 'text-green-600'
                  : getRiskColor(forecastData.risk_assessment.level) === 'red'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {forecastData.risk_assessment.level}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Score: {forecastData.risk_assessment.score}/10
              </p>
            </div>
          </div>

          {/* Trading Signals */}
          <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-500" />
              Trading Signals & Price Targets
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Entry Price</p>
                <p className="text-lg font-bold text-green-600">₹{forecastData?.price_analysis?.current_price != null
  ? forecastData.price_analysis.current_price.toFixed(2)
  : 'N/A'}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Exit Price</p>
                <p className="text-lg font-bold text-blue-600">₹{forecastData.signals.exit_price.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Stop Loss</p>
                <p className="text-lg font-bold text-red-600">₹{forecastData.signals.stop_loss.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Take Profit</p>
                <p className="text-lg font-bold text-purple-600">₹{forecastData?.signals?.take_profit != null
    ? forecastData.signals.take_profit.toFixed(2)
    : 'N/A'}</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Target High</p>
                <p className="text-lg font-bold text-yellow-600">₹{forecastData.signals.target_high.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Target Low</p>
                <p className="text-lg font-bold text-orange-600">₹{forecastData.signals.target_low.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Price Forecast Table */}
          <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-purple-500" />
              5-Day Price Forecast
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Day</th>
                    <th className="text-left p-3 border border-gray-300 dark:border-gray-600 font-semibold">Date</th>
                    <th className="text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold">Predicted Price</th>
                    <th className="text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold">Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.price_analysis.forecast.map((forecast, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-3 border border-gray-300 dark:border-gray-600 font-medium">
                        Day {forecast.day}
                      </td>
                      <td className="p-3 border border-gray-300 dark:border-gray-600">
                        {new Date(forecast.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold">
                        ₹{forecast.predicted_price.toFixed(2)}
                      </td>
                      <td className={`text-right p-3 border border-gray-300 dark:border-gray-600 font-semibold ${
                        forecast.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {forecast.price_change >= 0 ? '+' : ''}{forecast.price_change.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Assessment Details */}
          <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShieldCheckIcon className="h-6 w-6 mr-2 text-yellow-500" />
              Risk Assessment Details
            </h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                {forecastData.risk_assessment.description}
              </p>
            </div>
          </div>

          {/* Market Regime Details */}
          <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-blue-500" />
              Market Regime Analysis
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {forecastData.market_regime.regime_description}
                </p>
              </div>
              {forecastData.market_regime.volatility !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Volatility</p>
                    <p className="text-xl font-bold text-blue-600">
                      {(forecastData.market_regime.volatility * 100).toFixed(2)}%
                    </p>
                  </div>
                  {forecastData.price_analysis.technical_trend && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Technical Trend</p>
                      <p className={`text-xl font-bold capitalize ${
                        forecastData.price_analysis.technical_trend.toLowerCase() === 'bullish'
                          ? 'text-green-600'
                          : forecastData.price_analysis.technical_trend.toLowerCase() === 'bearish'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {forecastData.price_analysis.technical_trend}
                      </p>
                      {forecastData.price_analysis.trend_strength !== undefined && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Strength: {(forecastData.price_analysis.trend_strength * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Position Sizing Recommendations */}
          {forecastData.position_sizing && (
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 mr-2 text-green-500" />
                Position Sizing & Risk Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Recommended Capital</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{forecastData.position_sizing.recommended_capital.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Position Size</p>
                  <p className="text-lg font-bold text-blue-600">
                    {forecastData.position_sizing.position_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Kelly Criterion</p>
                  <p className="text-lg font-bold text-purple-600">
                    {forecastData.position_sizing.kelly_criterion.toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Max Risk</p>
                  <p className="text-lg font-bold text-red-600">
                    ₹{forecastData.position_sizing.max_risk.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendation:</p>
                <p className="text-gray-600 dark:text-gray-400">{forecastData.position_sizing.recommendation}</p>
              </div>
            </div>
          )}

          {/* AI Model Agreement */}
          {forecastData.recommendation.model_agreement && (
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <SparklesIcon className="h-6 w-6 mr-2 text-purple-500" />
                AI Model Consensus
              </h2>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Model Agreement
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    {forecastData.recommendation.model_agreement}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full"
                    style={{
                      width: forecastData.recommendation.model_agreement.replace('%', '') + '%'
                    }}
                  ></div>
                </div>
              </div>
              {forecastData.recommendation.model_signals && Object.keys(forecastData.recommendation.model_signals).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(forecastData.recommendation.model_signals).map(([model, signal]: [string, any]) => (
                    <div key={model} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">{model}</p>
                      <p className={`text-sm font-bold ${
                        signal === 'BUY' || signal === 'buy'
                          ? 'text-green-600'
                          : signal === 'SELL' || signal === 'sell'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {typeof signal === 'string' ? signal.toUpperCase() : JSON.stringify(signal)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advanced Insights */}
          {forecastData.insights && (
            <div className="bg-white dark:bg-dark-400 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <InformationCircleIcon className="h-6 w-6 mr-2 text-indigo-500" />
                Advanced Market Insights
              </h2>

              <div className="space-y-6">
                {/* Sentiment Analysis */}
                {forecastData.insights.sentiment_analysis && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                      Market Sentiment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 dark:bg-opacity-20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall Sentiment</p>
                        <div className="flex items-center">
                          <p className={`text-2xl font-bold ${
                            forecastData.insights.sentiment_analysis.overall > 0
                              ? 'text-green-600'
                              : forecastData.insights.sentiment_analysis.overall < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {forecastData.insights.sentiment_analysis.overall > 0 ? '+' : ''}
                            {(forecastData.insights.sentiment_analysis.overall * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 dark:bg-opacity-20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sentiment Trend</p>
                        <p className="text-xl font-bold text-purple-600 capitalize">
                          {forecastData.insights.sentiment_analysis.trend}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 dark:bg-opacity-20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Key Topics</p>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          {forecastData.insights.sentiment_analysis.key_topics.length > 0
                            ? forecastData.insights.sentiment_analysis.key_topics.slice(0, 2).join(', ')
                            : 'Analyzing...'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detected Patterns */}
                {forecastData.insights.detected_patterns && forecastData.insights.detected_patterns.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                      Detected Chart Patterns
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {forecastData.insights.detected_patterns.map((pattern, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 dark:bg-opacity-30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                        >
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Action Signals */}
                {forecastData.insights.price_action_signals && forecastData.insights.price_action_signals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                      Price Action Signals
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {forecastData.insights.price_action_signals.map((signal, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 dark:bg-opacity-30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Breakout Signals */}
                {forecastData.insights.breakouts && forecastData.insights.breakouts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                      Breakout Opportunities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {forecastData.insights.breakouts.map((breakout, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 dark:bg-opacity-30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                        >
                          {breakout}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support & Resistance Levels */}
                {((forecastData.insights.support_levels && forecastData.insights.support_levels.length > 0) ||
                  (forecastData.insights.resistance_levels && forecastData.insights.resistance_levels.length > 0)) && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                      Key Levels
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {forecastData.insights.support_levels && forecastData.insights.support_levels.length > 0 && (
                        <div className="p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                            Support Levels
                          </p>
                          <div className="space-y-1">
                            {forecastData.insights.support_levels.slice(0, 3).map((level, index) => (
                              <p key={index} className="text-green-600 dark:text-green-400 font-mono text-sm">
                                S{index + 1}: ₹{level.toFixed(2)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {forecastData.insights.resistance_levels && forecastData.insights.resistance_levels.length > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg">
                          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                            Resistance Levels
                          </p>
                          <div className="space-y-1">
                            {forecastData.insights.resistance_levels.slice(0, 3).map((level, index) => (
                              <p key={index} className="text-red-600 dark:text-red-400 font-mono text-sm">
                                R{index + 1}: ₹{level.toFixed(2)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analysis Metadata */}
          {(forecastData.timestamp || forecastData.trading_style) && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                {forecastData.timestamp && (
                  <div className="flex items-center">
                    <InformationCircleIcon className="h-4 w-4 mr-2" />
                    <span>
                      Analysis generated on: {new Date(forecastData.timestamp).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {forecastData.trading_style && (
                  <div className="flex items-center">
                    <span className="mr-2">Trading Style:</span>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium capitalize">
                      {forecastData.trading_style}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <LimitExceededModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureType="llm"
        message="You have reached your daily limit for AI forecasts. Please upgrade your plan to continue using this feature."
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
        message="Sign up to get access to our advanced market regime analysis and trading forecasts"
      />
    </div>
  );
};

export default MarketRegimePage;
