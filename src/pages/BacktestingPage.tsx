import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { backtestingService, BacktestRequest, BacktestResponse, BacktestIndicator } from '../services/backtesting';
import StockChart from '../components/StockChart';
import MetricCard from '../components/MetricCard';
import TradeList from '../components/TradeList';
import { useSubscription } from '../contexts/SubscriptionContext';
import SubscriptionBanner from '../components/subscription/SubscriptionBanner';
import UsageTracker from '../components/subscription/UsageTracker';
import LimitExceededModal from '../components/subscription/LimitExceededModal';
import AIAnalysisToggle from '../components/AIAnalysisToggle';
import AIAnalysisForm, { AIAnalysisConfig } from '../components/AIAnalysisForm';
import AIAnalysisResults from '../components/AIAnalysisResults';
import { marketRegimeService } from '../services/api';

// Extended interface for form state to handle string inputs
interface FormData extends Omit<BacktestRequest, 'stop_loss' | 'take_profit'> {
  stop_loss: string | number;
  take_profit: string | number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Trade {
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  size: number;
  pnl: number;
  pnl_pct: number;
}

interface FormattedTrade {
  entry_date: string;
  exit_date: string;
  entry_price: string;
  exit_price: string;
  size: number;
  pnl: string;
  pnl_pct: string;
}

interface PriceData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

interface Performance {
  total_return: number;
  win_rate: number;
  sharpe_ratio: number;
  max_drawdown: number;
}

interface ExtendedBacktestResponse extends BacktestResponse {
  performance: Performance;
  price_data: PriceData[];
  trades: Trade[];
  dates: string[];
  indicator_data: {
    [key: string]: number[];
  };
}

const BacktestingPage: React.FC = () => {
  const { canUseBacktest, incrementBacktestUsage } = useSubscription();
  
  // Get default dates
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BacktestResponse | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // AI Analysis state
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);

  // Form state with default values
  const [formData, setFormData] = useState<FormData>({
    ticker: '',
    start_date: formatDateForInput(oneYearAgo),
    end_date: formatDateForInput(today),
    initial_capital: 100000,
    position_size: 10,
    stop_loss: '',
    take_profit: '',
    timeframe: '1d',
    indicators: [],
    position_sizing_method: 'fixed',
    max_drawdown: 20,
    max_positions: 5,
    daily_loss_limit: 5,
    weekly_loss_limit: 10,
    min_cash_reserve: 20,
    kelly_fraction: 0.5
  });

  // Available indicators from the service
  const availableIndicators = backtestingService.getAvailableIndicators();

  // AI Analysis handler
  const handleAIAnalysis = async (config: AIAnalysisConfig) => {
    setAiLoading(true);
    setAiError(null);

    try {
      // If retrain is requested, train the model first
      if (config.retrain) {
        await marketRegimeService.trainModel(config.ticker, config.period, true);
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI Analysis failed';
      setAiError(errorMessage);
      console.error('AI Analysis error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user can run backtest
    if (!canUseBacktest()) {
      setShowLimitModal(true);
      return;
    }
    
    // Validate required fields
    if (!formData.ticker.trim()) {
      setError('Stock symbol is required');
      return;
    }
    
    if (formData.indicators.length === 0) {
      setError('At least one technical indicator is required');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Helper function to safely convert to number or undefined
      const safeNumber = (value: any): number | undefined => {
        if (value === '' || value === undefined || value === null) return undefined;
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return undefined;
        return num;
      };

      // Prepare data for API call, converting string values to numbers or undefined
      const apiData: BacktestRequest = {
        ...formData,
        ticker: formData.ticker.trim().toUpperCase(),
        stop_loss: safeNumber(formData.stop_loss),
        take_profit: safeNumber(formData.take_profit),
      };
      
      console.log('Submitting backtest request:', apiData);
      const results = await backtestingService.runBacktest(apiData);
      await incrementBacktestUsage();
      setResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Special handling for number inputs
    if (type === 'number') {
      // For optional fields like stop_loss and take_profit, allow empty string
      if (name === 'stop_loss' || name === 'take_profit') {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        return;
      }
      
      // For required number fields, convert to number
      const newValue = value === '' ? '' : Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIndicator = () => {
    if (availableIndicators.length > 0) {
      const newIndicator: BacktestIndicator = {
        type: availableIndicators[0].type,
        parameters: { ...availableIndicators[0].defaultParams }
      };
      setFormData(prev => ({
        ...prev,
        indicators: [...prev.indicators, newIndicator]
      }));
    }
  };

  const handleRemoveIndicator = (index: number) => {
    setFormData(prev => ({
      ...prev,
      indicators: prev.indicators.filter((_, i) => i !== index)
    }));
  };

  const handleIndicatorChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      indicators: prev.indicators.map((indicator, i) => {
        if (i === index) {
          if (field === 'type') {
            const defaultParams = availableIndicators.find(ind => ind.type === value)?.defaultParams || {};
            return {
              type: value as string,
              parameters: defaultParams
            };
          } else {
            return {
              ...indicator,
              parameters: {
                ...indicator.parameters,
                [field]: typeof value === 'string' ? parseFloat(value) : value
              }
            };
          }
        }
        return indicator;
      })
    }));
  };

  // Format trade data for display
  const formatTradeData = (trades: Trade[]): FormattedTrade[] => {
    return trades.map(trade => ({
      ...trade,
      entry_date: new Date(trade.entry_date).toLocaleString(),
      exit_date: new Date(trade.exit_date).toLocaleString(),
      entry_price: trade.entry_price.toFixed(2),
      exit_price: trade.exit_price.toFixed(2),
      pnl: trade.pnl.toFixed(2),
      pnl_pct: trade.pnl_pct.toFixed(2)
    }));
  };

  // Format price data for chart
  const formatPriceData = (priceData: PriceData[]) => {
    return priceData.map(data => ({
      ...data,
      Date: new Date(data.Date).toISOString(),
      Open: data.Open,
      High: data.High,
      Low: data.Low,
      Close: data.Close,
      Volume: data.Volume
    }));
  };

  const renderResults = () => {
    if (!results) return null;

    const typedResults = results as ExtendedBacktestResponse;

    // Format trade and price data
    const formattedTrades = formatTradeData(typedResults.trades);
    const formattedPriceData = formatPriceData(typedResults.price_data);

    // Calculate equity curve from daily PnL
    const dates = Object.keys(typedResults.metrics.daily_pnl).sort();
    const equityCurve = dates.reduce((acc: number[], date) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1] : formData.initial_capital;
      const pnl = parseFloat(typedResults.metrics.daily_pnl[date].toString());
      return [...acc, lastValue + pnl];
    }, [formData.initial_capital]);

    // Prepare daily PnL data
    const dailyPnLData = dates.map(date => ({
      date,
      pnl: parseFloat(typedResults.metrics.daily_pnl[date].toString()).toFixed(2)
    }));

    // Chart configurations
    const equityChartData = {
      labels: dates,
      datasets: [
        {
          label: 'Portfolio Value',
          data: equityCurve,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };

    // Format indicator data for StockChart
    const formattedIndicatorData: { [key: string]: any } = {};
    if (typedResults.indicator_data) {
      Object.entries(typedResults.indicator_data).forEach(([name, values]) => {
        // Get dates from the results
        const dates = typedResults.dates || [];
        
        // Format indicator data based on type
        if (name.startsWith('RSI_')) {
          formattedIndicatorData[name] = {
            dates: dates,
            values: values,
            current: values[values.length - 1]
          };
        } else if (name === 'macd') {
          formattedIndicatorData['macd'] = {
            dates: dates,
            macd: typedResults.indicator_data.macd,
            signal: typedResults.indicator_data.macd_signal,
            histogram: typedResults.indicator_data.macd_histogram,
            current: {
              macd: typedResults.indicator_data.macd[typedResults.indicator_data.macd.length - 1],
              signal: typedResults.indicator_data.macd_signal[typedResults.indicator_data.macd_signal.length - 1],
              histogram: typedResults.indicator_data.macd_histogram[typedResults.indicator_data.macd_histogram.length - 1]
            }
          };
        } else if (name === 'bollinger_upper') {
          formattedIndicatorData['bollinger'] = {
            dates: dates,
            upper: typedResults.indicator_data.bollinger_upper,
            middle: typedResults.indicator_data.bollinger_middle,
            lower: typedResults.indicator_data.bollinger_lower,
            current: {
              upper: typedResults.indicator_data.bollinger_upper[typedResults.indicator_data.bollinger_upper.length - 1],
              middle: typedResults.indicator_data.bollinger_middle[typedResults.indicator_data.bollinger_middle.length - 1],
              lower: typedResults.indicator_data.bollinger_lower[typedResults.indicator_data.bollinger_lower.length - 1]
            }
          };
        } else if (name.startsWith('SMA_')) {
          formattedIndicatorData[name] = {
            dates: dates,
            values: values,
            current: values[values.length - 1]
          };
        } else if (name.startsWith('EMA_')) {
          formattedIndicatorData[name] = {
            dates: dates,
            values: values,
            current: values[values.length - 1]
          };
        } else if (name === 'stochastic_k') {
          formattedIndicatorData['stochastic'] = {
            dates: dates,
            k: typedResults.indicator_data.stochastic_k,
            d: typedResults.indicator_data.stochastic_d,
            current: {
              k: typedResults.indicator_data.stochastic_k[typedResults.indicator_data.stochastic_k.length - 1],
              d: typedResults.indicator_data.stochastic_d[typedResults.indicator_data.stochastic_d.length - 1]
            }
          };
        }
      });
    }

    // Prepare stock data for chart
    const stockChartData = {
      symbol: formData.ticker,
      data: formattedPriceData.map(data => ({
        Date: data.Date,
        Open: data.Open,
        High: data.High,
        Low: data.Low,
        Close: data.Close,
        Volume: data.Volume
      }))
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Return"
            value={`${typedResults.performance.total_return.toFixed(2)}%`}
            trend={typedResults.performance.total_return >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Win Rate"
            value={`${typedResults.performance.win_rate.toFixed(2)}%`}
            trend={typedResults.performance.win_rate >= 50 ? 'up' : 'down'}
          />
          <MetricCard
            title="Sharpe Ratio"
            value={typedResults.performance.sharpe_ratio.toFixed(2)}
            trend={typedResults.performance.sharpe_ratio >= 1 ? 'up' : 'down'}
          />
          <MetricCard
            title="Max Drawdown"
            value={`${typedResults.performance.max_drawdown.toFixed(2)}%`}
            trend="down"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Price Chart with Indicators</h3>
            <div className="h-[400px]">
              <StockChart
                stockData={stockChartData}
                indicators={formattedIndicatorData}
                height={400}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Equity Curve</h3>
            <div className="h-[400px]">
              <Line
                data={equityChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        callback: (value) => `$${value.toLocaleString()}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Trade History</h3>
          <TradeList trades={formattedTrades} />
        </div>
      </div>
    );
  };

  const getParameterDescription = (param: string): string => {
    const descriptions: Record<string, string> = {
      period: 'Number of periods to calculate the indicator',
      fastperiod: 'Number of periods for the fast moving average',
      slowperiod: 'Number of periods for the slow moving average',
      signalperiod: 'Number of periods for the signal line',
      num_std: 'Number of standard deviations for Bollinger Bands',
      k_period: 'Number of periods for the %K line',
      d_period: 'Number of periods for the %D line'
    };
    return descriptions[param] || 'Parameter value';
  };

  const getParameterMin = (param: string): number => {
    const mins: Record<string, number> = {
      period: 1,
      fastperiod: 1,
      slowperiod: 2,
      signalperiod: 1,
      num_std: 1,
      k_period: 1,
      d_period: 1
    };
    return mins[param] || 1;
  };

  const getParameterMax = (param: string): number => {
    const maxs: Record<string, number> = {
      period: 200,
      fastperiod: 100,
      slowperiod: 100,
      signalperiod: 50,
      num_std: 4,
      k_period: 100,
      d_period: 50
    };
    return maxs[param] || 100;
  };

  const getParameterStep = (param: string): number => {
    const steps: Record<string, number> = {
      num_std: 0.1
    };
    return steps[param] || 1;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SubscriptionBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Backtesting</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trading Parameters Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2">
                Trading Parameters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Stock Symbol
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Enter the stock symbol you want to backtest (e.g., RELIANCE, TCS)"></i>
                  </label>
                  <input
                    type="text"
                    name="ticker"
                    value={formData.ticker}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 uppercase"
                    required
                    placeholder="e.g., RELIANCE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Initial Capital (₹)
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Starting amount for backtesting"></i>
                  </label>
                  <input
                    type="number"
                    name="initial_capital"
                    value={formData.initial_capital}
                    onChange={handleInputChange}
                    min="1000"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Position Size (%)
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Percentage of capital to invest per trade (e.g., 10 for 10%)"></i>
                  </label>
                  <input
                    type="number"
                    name="position_size"
                    value={formData.position_size}
                    onChange={handleInputChange}
                    min="0.1"
                    max="100"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Risk Management Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2">
                Risk Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Stop Loss (%)
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Percentage below entry price to exit losing trades"></i>
                  </label>
                  <input
                    type="number"
                    name="stop_loss"
                    value={formData.stop_loss}
                    onChange={handleInputChange}
                    min="0.1"
                    max="100"
                    step="0.1"
                    placeholder="Optional - Leave empty for no stop loss"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Take Profit (%)
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Percentage above entry price to exit winning trades"></i>
                  </label>
                  <input
                    type="number"
                    name="take_profit"
                    value={formData.take_profit}
                    onChange={handleInputChange}
                    min="0.1"
                    max="100"
                    step="0.1"
                    placeholder="Optional - Leave empty for no take profit"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Max Drawdown (%)
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Maximum percentage loss allowed from peak equity"></i>
                  </label>
                  <input
                    type="number"
                    name="max_drawdown"
                    value={formData.max_drawdown}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Daily Loss Limit (%)
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Maximum percentage loss allowed per day"></i>
                  </label>
                  <input
                    type="number"
                    name="daily_loss_limit"
                    value={formData.daily_loss_limit}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Weekly Loss Limit (%)
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Maximum percentage loss allowed per week"></i>
                  </label>
                  <input
                    type="number"
                    name="weekly_loss_limit"
                    value={formData.weekly_loss_limit}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Position Management Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2">
                Position Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Max Positions
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Maximum number of simultaneous open positions allowed"></i>
                  </label>
                  <input
                    type="number"
                    name="max_positions"
                    value={formData.max_positions}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Min Cash Reserve (%)
                    <i className="fas fa-info-circle ml-1 text-gray-500" title="Minimum cash to keep as reserve"></i>
                  </label>
                  <input
                    type="number"
                    name="min_cash_reserve"
                    value={formData.min_cash_reserve}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Position Sizing Method
                  </label>
                  <select
                    name="position_sizing_method"
                    value={formData.position_sizing_method}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="fixed">Fixed Size</option>
                    <option value="kelly">Kelly Criterion</option>
                  </select>
                </div>

                {formData.position_sizing_method === 'kelly' && (
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                      Kelly Fraction
                      <i className="fas fa-info-circle ml-1 text-gray-500" title="Fraction of Kelly criterion to use (0.1 to 1.0)"></i>
                    </label>
                    <input
                      type="number"
                      name="kelly_fraction"
                      value={formData.kelly_fraction}
                      onChange={handleInputChange}
                      min="0.1"
                      max="1"
                      step="0.1"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Time Period Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white border-b pb-2">
                Time Period
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Timeframe
                  </label>
                  <select
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="1d">Daily</option>
                    <option value="1h">Hourly</option>
                    <option value="1wk">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Technical Indicators Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Technical Indicators
                </h2>
                <button
                  type="button"
                  onClick={handleAddIndicator}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Add Indicator
                </button>
              </div>

              <div className="space-y-6">
                {formData.indicators.map((indicator, index) => (
                  <div key={index} className="p-4 border dark:border-gray-600 rounded-lg relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveIndicator(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <i className="fas fa-times"></i>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                          Indicator Type
                          <i className="fas fa-info-circle ml-1 text-gray-500" 
                             title={availableIndicators.find(ind => ind.type === indicator.type)?.description || ''}></i>
                        </label>
                        <select
                          value={indicator.type}
                          onChange={(e) => handleIndicatorChange(index, 'type', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          {availableIndicators.map(ind => (
                            <option key={ind.type} value={ind.type}>
                              {ind.type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Render parameters based on indicator type */}
                      {Object.entries(
                        availableIndicators.find(ind => ind.type === indicator.type)?.defaultParams || {}
                      ).map(([param, defaultValue]) => (
                        <div key={param}>
                          <label className="block text-sm font-medium dark:text-gray-200 text-gray-700">
                            {param.charAt(0).toUpperCase() + param.slice(1).replace('_', ' ')}
                            <i className="fas fa-info-circle ml-1 text-gray-500" title={getParameterDescription(param)}></i>
                          </label>
                          <input
                            type="number"
                            value={indicator.parameters[param] || defaultValue}
                            onChange={(e) => handleIndicatorChange(index, param, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            min={getParameterMin(param)}
                            max={getParameterMax(param)}
                            step={getParameterStep(param)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-white font-medium rounded-lg shadow-md transition-all duration-200 ${
                  loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                }`}
              >
                {loading ? 'Running Backtest...' : 'Run Backtest'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="md:col-span-1">
          <UsageTracker />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {results && (
        <div className="space-y-8">
          {/* Results Section */}
          {renderResults()}
        </div>
      )}

      {/* Limit Exceeded Modal */}
      <LimitExceededModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureType="backtest"
        message="You have reached your daily backtest limit. Please upgrade your plan to run more backtests."
      />
    </div>
  );
};

export default BacktestingPage; 