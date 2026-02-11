import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  CalculatorIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  Cog6ToothIcon,
  ClipboardDocumentCheckIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookOpenIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  riskCalculatorService,
  RiskCalculatorRequest,
  RiskCalculatorResponse,
  UserSettings,
  DailyExposure,
  TradeLog
} from '../services/riskCalculator';

// Import shared components
import SEBIDisclaimer from '../components/RiskCalculator/Shared/SEBIDisclaimer';
import LoadingSpinner from '../components/RiskCalculator/Shared/LoadingSpinner';
import StatWidget from '../components/RiskCalculator/Shared/StatWidget';
import ChartContainer from '../components/RiskCalculator/Shared/ChartContainer';

const RiskCalculatorPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { subscriptionTier, getRemainingUsage } = useSubscription();

  // Form state
  const [formData, setFormData] = useState({
    symbol: '',
    trade_type: 'delivery' as 'delivery' | 'intraday' | 'fno',
    buy_price: '',
    stop_loss_price: '',
    target_price: '',
    capital_available: '100000',
    max_risk_per_trade: '2',
    max_risk_type: 'percentage' as 'percentage' | 'rupees',
    broker: 'zerodha' as 'zerodha' | 'upstox' | 'custom'
  });

  // Calculation results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RiskCalculatorResponse | null>(null);

  // User settings
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Session & Portfolio data
  const [sessionData, setSessionData] = useState<any>(null);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [dailyExposure, setDailyExposure] = useState<DailyExposure | null>(null);

  // Journal data
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);

  // Analytics data
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [volatilityMetrics, setVolatilityMetrics] = useState<any>(null);
  const [portfolioScore, setPortfolioScore] = useState<any>(null);

  // UI state
  const [showPreTradeChecklist, setShowPreTradeChecklist] = useState(false);
  const [tradeLogged, setTradeLogged] = useState(false);
  const [showAllAnalytics, setShowAllAnalytics] = useState(false);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      // Load user settings
      const settingsRes = await riskCalculatorService.getUserSettings();
      if (settingsRes.success) setUserSettings(settingsRes.settings);

      // Load daily exposure
      const exposureRes = await riskCalculatorService.getDailyExposure();
      if (exposureRes.success) setDailyExposure(exposureRes.exposure);

      // Load session data
      const sessionRes = await riskCalculatorService.getSessionDashboard();
      if (sessionRes.success) setSessionData(sessionRes.data);

      // Load portfolio analytics
      const portfolioRes = await riskCalculatorService.getPortfolioAnalytics();
      if (portfolioRes.success) {
        setPortfolioAnalytics(portfolioRes.data);
        setPositions(portfolioRes.data.positions || []);
      }

      // Load journal entries
      const journalRes = await riskCalculatorService.getJournalEntries();
      if (journalRes.success) setJournalEntries(journalRes.data.entries || []);

      // Load AI insights
      const insightsRes = await riskCalculatorService.getCachedInsights();
      if (insightsRes.success) setAiInsights(insightsRes.data);

      // Load equity curve
      const equityRes = await riskCalculatorService.getEquityCurve('1y');
      if (equityRes.success) setEquityCurve(equityRes.data.curve || []);

      // Load volatility metrics
      const metricsRes = await riskCalculatorService.getVolatilityMetrics();
      if (metricsRes.success) setVolatilityMetrics(metricsRes.data);

      // Load portfolio score
      const analyticsRes = await riskCalculatorService.getComprehensiveAnalytics();
      if (analyticsRes.success) setPortfolioScore(analyticsRes.data.portfolio_score);

    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.symbol.trim()) return 'Please enter a stock symbol';
    if (!formData.buy_price || parseFloat(formData.buy_price) <= 0) return 'Please enter a valid buy price';
    if (!formData.stop_loss_price || parseFloat(formData.stop_loss_price) <= 0) return 'Please enter a valid stop loss';
    if (parseFloat(formData.stop_loss_price) >= parseFloat(formData.buy_price)) return 'Stop loss must be below buy price';
    if (!formData.capital_available || parseFloat(formData.capital_available) <= 0) return 'Please enter valid capital';
    if (!formData.max_risk_per_trade || parseFloat(formData.max_risk_per_trade) <= 0) return 'Please enter valid risk';
    return null;
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const params: RiskCalculatorRequest = {
        symbol: formData.symbol.trim().toUpperCase(),
        trade_type: formData.trade_type,
        buy_price: parseFloat(formData.buy_price),
        stop_loss_price: parseFloat(formData.stop_loss_price),
        target_price: formData.target_price ? parseFloat(formData.target_price) : null,
        capital_available: parseFloat(formData.capital_available),
        max_risk_per_trade: parseFloat(formData.max_risk_per_trade),
        max_risk_type: formData.max_risk_type,
        broker: formData.broker
      };

      // Use Phase 2 endpoint if authenticated
      let response;
      if (isAuthenticated) {
        response = await riskCalculatorService.generatePreTradeChecklist(params);
      } else {
        response = await riskCalculatorService.calculate(params);
      }

      if (response.success) {
        setResults(response);
        if (isAuthenticated && response.data.phase2) {
          setShowPreTradeChecklist(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate position');
    } finally {
      setLoading(false);
    }
  };

  const handleLogTrade = async () => {
    if (!results || !isAuthenticated) return;

    try {
      const tradeLog: TradeLog = {
        symbol: results.data.symbol,
        trade_type: results.data.trade_type,
        entry_price: results.data.inputs.buy_price,
        stop_loss: results.data.inputs.stop_loss_price,
        target: results.data.inputs.target_price || 0,
        quantity: results.data.position_sizing.max_quantity,
        risk_amount: results.data.risk_analysis.risk_amount,
        risk_percent: results.data.risk_analysis.risk_percentage,
        expected_costs: results.data.cost_breakdown.estimated_costs_at_entry.total_cost,
        status: 'open'
      };

      const response = await riskCalculatorService.logTrade(tradeLog);
      if (response.success) {
        setTradeLogged(true);
        setShowAllAnalytics(true);
        setDailyExposure(response.daily_exposure);
        // Reload all data to show updated analytics
        loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to log trade');
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Risk Calculator & Portfolio Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Calculate position sizes, log trades, and monitor your complete trading performance
          </p>
        </div>

        {/* Calculator Form - Always Visible */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <CalculatorIcon className="w-6 h-6 mr-2 text-primary-500" />
            Position Size Calculator
          </h2>

          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Stock Symbol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  placeholder="e.g., RELIANCE"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Trade Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trade Type
                </label>
                <select
                  name="trade_type"
                  value={formData.trade_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="delivery">Delivery</option>
                  <option value="intraday">Intraday</option>
                  <option value="fno">F&O</option>
                </select>
              </div>

              {/* Broker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Broker
                </label>
                <select
                  name="broker"
                  value={formData.broker}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="zerodha">Zerodha</option>
                  <option value="upstox">Upstox</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Buy Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buy Price (₹)
                </label>
                <input
                  type="number"
                  name="buy_price"
                  value={formData.buy_price}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="2500.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Stop Loss */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stop Loss (₹)
                </label>
                <input
                  type="number"
                  name="stop_loss_price"
                  value={formData.stop_loss_price}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="2450.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Price (₹)
                </label>
                <input
                  type="number"
                  name="target_price"
                  value={formData.target_price}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="2600.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Capital Available */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capital Available (₹)
                </label>
                <input
                  type="number"
                  name="capital_available"
                  value={formData.capital_available}
                  onChange={handleInputChange}
                  step="1000"
                  placeholder="100000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Max Risk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Risk per Trade
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="max_risk_per_trade"
                    value={formData.max_risk_per_trade}
                    onChange={handleInputChange}
                    step="0.1"
                    placeholder="2"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    name="max_risk_type"
                    value={formData.max_risk_type}
                    onChange={handleInputChange}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="percentage">%</option>
                    <option value="rupees">₹</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Calculate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium py-3 px-6 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <BoltIcon className="w-5 h-5 mr-2" />
                  Calculate Position
                </>
              )}
            </button>
          </form>

          <SEBIDisclaimer variant="compact" className="mt-6" />
        </div>

        {/* Calculation Results */}
        {results && (
          <div className="space-y-6 mb-6">
            {/* Position Sizing Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatWidget
                label="Max Quantity"
                value={results.data.position_sizing.max_quantity}
                subValue={`Position Value: ₹${results.data.position_sizing.position_value.toLocaleString()}`}
                icon={ChartPieIcon}
                variant="info"
              />
              <StatWidget
                label="Risk per Trade"
                value={`₹${results.data.risk_analysis.risk_amount.toLocaleString()}`}
                subValue={`${results.data.risk_analysis.risk_percentage.toFixed(2)}% of capital`}
                icon={ShieldCheckIcon}
                variant="warning"
              />
              <StatWidget
                label="Risk:Reward Ratio"
                value={results.data.risk_reward.ratio_text}
                subValue={results.data.risk_reward.has_target ? 'Target set' : 'No target'}
                icon={ArrowTrendingUpIcon}
                variant={results.data.risk_reward.has_target ? 'success' : 'default'}
              />
              <StatWidget
                label="Breakeven Price"
                value={`₹${results.data.scenario_analysis.breakeven_price.toFixed(2)}`}
                subValue="After all costs"
                icon={CurrencyRupeeIcon}
                variant="default"
              />
            </div>

            {/* Cost Breakdown Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cost Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Charge Type</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">Brokerage</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                        {results.data.cost_breakdown.estimated_costs_at_entry.brokerage.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">STT/CTT</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                        {results.data.cost_breakdown.estimated_costs_at_entry.stt_ctt.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">Exchange Charges</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                        {results.data.cost_breakdown.estimated_costs_at_entry.exchange_txn_charge.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">SEBI Charges</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                        {results.data.cost_breakdown.estimated_costs_at_entry.sebi_charges.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">Stamp Duty</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                        {results.data.cost_breakdown.estimated_costs_at_entry.stamp_duty.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">GST</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                        {results.data.cost_breakdown.estimated_costs_at_entry.gst.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">Total Cost</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                        ₹{results.data.cost_breakdown.estimated_costs_at_entry.total_cost.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Log Trade Button */}
            {isAuthenticated && !tradeLogged && (
              <button
                onClick={handleLogTrade}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center"
              >
                <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
                Log This Trade & View Analytics
              </button>
            )}

            {tradeLogged && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Trade logged successfully! View your analytics below.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAllAnalytics(!showAllAnalytics)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    {showAllAnalytics ? (
                      <>
                        <ChevronUpIcon className="w-4 h-4 mr-1" />
                        Hide Analytics
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="w-4 h-4 mr-1" />
                        Show Analytics
                      </>
                    )}
                  </button>
                </div>

                {/* Display the logged trade */}
                {results && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-green-500" />
                      Logged Trade
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Symbol</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{results.data.symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{results.data.position_sizing.max_quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Entry Price</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{results.data.inputs.buy_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stop Loss</p>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">₹{results.data.inputs.stop_loss_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {results.data.inputs.target_price ? `₹${results.data.inputs.target_price}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Risk Amount</p>
                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                          ₹{results.data.risk_analysis.risk_amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Position Value</p>
                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          ₹{results.data.position_sizing.position_value.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">Open</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Comprehensive Analytics - Show after logging trade */}
        {showAllAnalytics && isAuthenticated && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">📊 Complete Trading Analytics</h2>
              <p className="text-primary-100">
                Your comprehensive performance dashboard based on historical data
              </p>
            </div>
            {/* Session Dashboard */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-green-500" />
                Today's Session
              </h2>
              {sessionData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatWidget
                    label="Trades Today"
                    value={sessionData.trades_count || 0}
                    subValue={`${sessionData.wins || 0}W - ${sessionData.losses || 0}L`}
                    variant="info"
                  />
                  <StatWidget
                    label="Realized P&L"
                    value={`₹${(sessionData.realized_pl || 0).toLocaleString()}`}
                    trend={sessionData.realized_pl >= 0 ? 'up' : 'down'}
                    variant={sessionData.realized_pl >= 0 ? 'success' : 'danger'}
                  />
                  <StatWidget
                    label="Total Costs"
                    value={`₹${(sessionData.total_costs || 0).toLocaleString()}`}
                    subValue="Today"
                    variant="warning"
                  />
                  <StatWidget
                    label="Win Streak"
                    value={sessionData.current_streak || 0}
                    subValue={sessionData.streak_type || 'None'}
                    variant={sessionData.current_streak > 0 ? 'success' : 'default'}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Loading session data...</p>
                </div>
              )}
            </div>

            {/* Daily Trades List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <ClipboardDocumentCheckIcon className="w-6 h-6 mr-2 text-blue-500" />
                Your Trades
              </h2>
              {dailyExposure && dailyExposure.trades_count > 0 ? (
                <div className="space-y-3">
                  {/* Summary Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Total Trades Today
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {dailyExposure.trades_count}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        of {dailyExposure.max_trades_per_day} max allowed
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Total Risk Exposure
                      </p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        ₹{dailyExposure.total_risk_amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        {dailyExposure.total_risk_percent.toFixed(2)}% of capital
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${
                      dailyExposure.realized_pl >= 0
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <p className={`text-sm font-medium ${
                        dailyExposure.realized_pl >= 0
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-red-900 dark:text-red-100'
                      }`}>
                        Combined P&L Today
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${
                        dailyExposure.realized_pl >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {dailyExposure.realized_pl >= 0 ? '+' : ''}₹{dailyExposure.realized_pl.toLocaleString('en-IN')}
                      </p>
                      <p className={`text-xs mt-1 ${
                        dailyExposure.realized_pl >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {dailyExposure.realized_pl >= 0 ? '↑' : '↓'} All trades combined
                      </p>
                    </div>
                  </div>

                  {/* Risk Usage Progress */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Daily Risk Limit Usage
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          dailyExposure.risk_utilization_percent > 80
                            ? 'bg-red-500'
                            : dailyExposure.risk_utilization_percent > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(dailyExposure.risk_utilization_percent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {dailyExposure.risk_utilization_percent.toFixed(1)}% of daily limit used
                    </p>
                  </div>

                  {dailyExposure.warnings && dailyExposure.warnings.length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">⚠️ Warnings</p>
                      <ul className="space-y-1">
                        {dailyExposure.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-amber-800 dark:text-amber-200">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    This is your first trade today! Start building your track record.
                  </p>
                </div>
              )}
            </div>

            {/* Old session dashboard - kept for reference */}
            {false && sessionData && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <ChartBarIcon className="w-6 h-6 mr-2 text-green-500" />
                  Today's Session
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatWidget
                    label="Trades Today"
                    value={sessionData.trades_count || 0}
                    subValue={`${sessionData.wins || 0}W - ${sessionData.losses || 0}L`}
                    variant="info"
                  />
                  <StatWidget
                    label="Realized P&L"
                    value={`₹${(sessionData.realized_pl || 0).toLocaleString()}`}
                    trend={sessionData.realized_pl >= 0 ? 'up' : 'down'}
                    variant={sessionData.realized_pl >= 0 ? 'success' : 'danger'}
                  />
                  <StatWidget
                    label="Total Costs"
                    value={`₹${(sessionData.total_costs || 0).toLocaleString()}`}
                    subValue="Today"
                    variant="warning"
                  />
                  <StatWidget
                    label="Win Streak"
                    value={sessionData.current_streak || 0}
                    subValue={sessionData.streak_type || 'None'}
                    variant={sessionData.current_streak > 0 ? 'success' : 'default'}
                  />
                </div>
              </div>
            )}

            {/* Portfolio Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {portfolioAnalytics && positions.length > 0 ? (
                <>
                {/* Allocation Pie Chart */}
                <ChartContainer title="Portfolio Allocation" subtitle={`${positions.length} positions`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={positions.map((pos, idx) => ({
                          name: pos.symbol,
                          value: pos.allocation_percent,
                          fill: COLORS[idx % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {positions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Equity Curve */}
                {equityCurve.length > 0 ? (
                  <ChartContainer title="Equity Curve" subtitle="Last 1 year">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={equityCurve}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Equity Curve</h3>
                    <div className="text-center py-12">
                      <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Keep trading to build your equity curve
                      </p>
                    </div>
                  </div>
                )}
              </>
              ) : (
                <>
                  {/* Empty state for portfolio */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Allocation</h3>
                    <div className="text-center py-12">
                      <ChartPieIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Add positions to see portfolio allocation
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Equity Curve</h3>
                    <div className="text-center py-12">
                      <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Keep trading to build your equity curve
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Volatility Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {volatilityMetrics ? (
                <>
                <StatWidget
                  label="Sharpe Ratio"
                  value={volatilityMetrics.sharpe_ratio?.toFixed(2) || 'N/A'}
                  subValue="Risk-adjusted return"
                  variant={volatilityMetrics.sharpe_ratio > 1.5 ? 'success' : 'default'}
                />
                <StatWidget
                  label="Sortino Ratio"
                  value={volatilityMetrics.sortino_ratio?.toFixed(2) || 'N/A'}
                  subValue="Downside risk"
                  variant="info"
                />
                <StatWidget
                  label="Profit Factor"
                  value={volatilityMetrics.profit_factor?.toFixed(2) || 'N/A'}
                  subValue="Win/Loss ratio"
                  variant={volatilityMetrics.profit_factor > 1.5 ? 'success' : 'warning'}
                />
                <StatWidget
                  label="Max Drawdown"
                  value={`${volatilityMetrics.max_drawdown_percent?.toFixed(2) || 0}%`}
                  subValue={`₹${volatilityMetrics.max_drawdown_amount?.toLocaleString() || 0}`}
                  variant="danger"
                />
              </>
              ) : (
                <>
                  <StatWidget label="Sharpe Ratio" value="N/A" subValue="Need more trades" variant="default" />
                  <StatWidget label="Sortino Ratio" value="N/A" subValue="Need more trades" variant="default" />
                  <StatWidget label="Profit Factor" value="N/A" subValue="Need more trades" variant="default" />
                  <StatWidget label="Max Drawdown" value="N/A" subValue="Need more trades" variant="default" />
                </>
              )}
            </div>

            {/* Portfolio Score */}
            {portfolioScore ? (
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-2 text-primary-500" />
                  Portfolio Performance Score
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-6xl font-bold text-primary-600 dark:text-primary-400">
                      {portfolioScore.score || 0}/100
                    </div>
                    <div className="text-4xl font-bold text-primary-500">
                      {portfolioScore.grade || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Breakdown</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        Return: {portfolioScore.return_score || 0}/30
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Risk Control: {portfolioScore.risk_control_score || 0}/30
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Risk-Adjusted: {portfolioScore.risk_adjusted_score || 0}/40
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-2 text-gray-400" />
                  Portfolio Performance Score
                </h2>
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-gray-400 mb-2">--/100</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Trade more to generate your performance score
                  </p>
                </div>
              </div>
            )}

            {/* AI Insights from Journal */}
            {aiInsights ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <BookOpenIcon className="w-6 h-6 mr-2 text-pink-500" />
                  AI-Powered Journal Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance by Strategy */}
                  {aiInsights.by_strategy && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">By Strategy</h3>
                      <div className="space-y-2">
                        {Object.entries(aiInsights.by_strategy).map(([strategy, data]: [string, any]) => (
                          <div key={strategy} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{strategy}</span>
                              <span className={`text-sm ${data.avg_pl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                ₹{data.avg_pl.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {data.count} trades • {data.win_rate.toFixed(0)}% win rate
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance by Emotion */}
                  {aiInsights.by_emotion && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">By Emotion</h3>
                      <div className="space-y-2">
                        {Object.entries(aiInsights.by_emotion).map(([emotion, data]: [string, any]) => (
                          <div key={emotion} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{emotion}</span>
                              <span className={`text-sm ${data.avg_pl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                ₹{data.avg_pl.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {data.count} trades • {data.win_rate.toFixed(0)}% win rate
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">AI Recommendations</h3>
                    <ul className="space-y-1">
                      {aiInsights.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <BookOpenIcon className="w-6 h-6 mr-2 text-pink-500" />
                  AI-Powered Journal Insights
                </h2>
                <div className="text-center py-12">
                  <SparklesIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Log more trades to unlock AI insights
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    AI will analyze your patterns, emotions, and strategies
                  </p>
                </div>
              </div>
            )}

            <SEBIDisclaimer variant="default" className="mt-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskCalculatorPage;
