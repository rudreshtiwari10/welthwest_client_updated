import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PresentationChartLineIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { riskCalculatorService } from '../services/riskCalculator';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PortfolioAnalyticsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [equityCurve, setEquityCurve] = useState<any>(null);
  const [drawdownData, setDrawdownData] = useState<any>(null);
  const [volatilityData, setVolatilityData] = useState<any>(null);
  const [rollingMetrics, setRollingMetrics] = useState<any>(null);
  const [stressTest, setStressTest] = useState<any>(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAnalytics();
    }
  }, [isAuthenticated, period]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      const [equity, drawdown, volatility, rolling] = await Promise.all([
        riskCalculatorService.getEquityCurve(period),
        riskCalculatorService.getDrawdownAnalysis(),
        riskCalculatorService.getVolatilityMetrics(),
        riskCalculatorService.getRollingMetrics(20)
      ]);

      if (equity.success) setEquityCurve(equity);
      if (drawdown.success) setDrawdownData(drawdown);
      if (volatility.success) setVolatilityData(volatility);
      if (rolling.success) setRollingMetrics(rolling);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStressTest = async () => {
    try {
      const response = await riskCalculatorService.stressTestPortfolio({
        scenarios: ['market_crash', 'sector_rotation', 'volatility_spike']
      });
      if (response.success) {
        setStressTest(response);
      }
    } catch (err: any) {
      alert('Stress test failed: ' + err.message);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to view portfolio analytics
          </p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-primary">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <PresentationChartLineIcon className="w-12 h-12" />
                <h1 className="text-4xl font-bold">Portfolio Analytics</h1>
              </div>
              <p className="text-xl text-indigo-100">
                Advanced performance metrics and risk analysis
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="1y">1 Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={handleStressTest}
                className="bg-white hover:bg-gray-100 text-indigo-600 px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <BoltIcon className="w-5 h-5" />
                Stress Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Equity Curve */}
            {equityCurve && equityCurve.data && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Equity Curve
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={equityCurve.data}>
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(val: number) => formatCurrency(val)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(val: any) => formatCurrency(val)}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="#4f46e5"
                      fillOpacity={1}
                      fill="url(#colorEquity)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Drawdown Analysis */}
            {drawdownData && drawdownData.data && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Drawdown Analysis
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {drawdownData.max_drawdown_percent?.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(drawdownData.max_drawdown_amount || 0)}
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Drawdown</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {drawdownData.avg_drawdown_percent?.toFixed(2)}%
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recovery Time</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {drawdownData.avg_recovery_days || 0} days
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={drawdownData.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(val: number) => `${val.toFixed(1)}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="drawdown"
                      stroke="#dc2626"
                      fill="#dc2626"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Volatility Metrics */}
            {volatilityData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Volatility Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Daily Volatility
                    </p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {volatilityData.daily_volatility?.toFixed(2)}%
                    </p>
                  </div>

                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Sharpe Ratio
                    </p>
                    <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                      {volatilityData.sharpe_ratio?.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sortino Ratio</p>
                    <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                      {volatilityData.sortino_ratio?.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calmar Ratio</p>
                    <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                      {volatilityData.calmar_ratio?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rolling Metrics */}
            {rollingMetrics && rollingMetrics.data && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ArrowPathIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rolling Metrics (20-day window)
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={rollingMetrics.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(val: number) => `${val.toFixed(0)}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="win_rate"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Win Rate"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit_factor"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Profit Factor"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Stress Test Results */}
            {stressTest && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BoltIcon className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Stress Test Results
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stressTest.scenarios?.map((scenario: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {scenario.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {scenario.description}
                      </p>
                      <div className={`text-2xl font-bold ${
                        scenario.impact_percent < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {scenario.impact_percent > 0 ? '+' : ''}
                        {scenario.impact_percent?.toFixed(2)}%
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(scenario.impact_amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAnalyticsPage;
