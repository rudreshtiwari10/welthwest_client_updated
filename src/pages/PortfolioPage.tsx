import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartPieIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { riskCalculatorService } from '../services/riskCalculator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Position {
  _id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  stop_loss?: number;
  target?: number;
  unrealized_pl: number;
  unrealized_pl_percent: number;
  risk_amount: number;
  position_value: number;
}

interface PortfolioAnalytics {
  total_portfolio_value: number;
  total_invested: number;
  total_unrealized_pl: number;
  total_unrealized_pl_percent: number;
  total_risk_exposure: number;
  total_risk_percent: number;
  positions_count: number;
  diversification_score: number;
  largest_position_percent: number;
}

interface PnLGraphData {
  date: string;
  pnl: number;
  portfolio_value: number;
}

interface HistoricalReturns {
  '3_months': {
    total_return: number;
    total_return_percent: number;
    individual_returns: Array<{
      symbol: string;
      return_amount: number;
      return_percent: number;
    }>;
  };
  '6_months': {
    total_return: number;
    total_return_percent: number;
    individual_returns: Array<{
      symbol: string;
      return_amount: number;
      return_percent: number;
    }>;
  };
  '1_year': {
    total_return: number;
    total_return_percent: number;
    individual_returns: Array<{
      symbol: string;
      return_amount: number;
      return_percent: number;
    }>;
  };
}

interface MarketSentimentData {
  [symbol: string]: {
    price_change: number;
    price_change_percent: number;
    candle_pattern: string;
    sentiment: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish';
  };
}

const PortfolioPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    quantity: '',
    entry_price: '',
    current_price: '',
    stop_loss: '',
    target: ''
  });

  // New state for additional features
  const [pnlGraphData, setPnlGraphData] = useState<PnLGraphData[]>([]);
  const [pnlPeriod, setPnlPeriod] = useState<number>(30);
  const [loadingPnlGraph, setLoadingPnlGraph] = useState(false);
  const [historicalReturns, setHistoricalReturns] = useState<HistoricalReturns | null>(null);
  const [loadingHistoricalReturns, setLoadingHistoricalReturns] = useState(false);
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentData>({});
  const [loadingMarketSentiment, setLoadingMarketSentiment] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadPortfolioData();
      loadPnLGraph(pnlPeriod);
      loadHistoricalReturns();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && positions.length > 0) {
      loadMarketSentiment();
    }
  }, [positions]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getPortfolioAnalytics();
      if (response.success) {
        setPositions(response.positions || []);
        setAnalytics(response.analytics);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPnLGraph = async (days: number) => {
    try {
      setLoadingPnlGraph(true);
      const response = await riskCalculatorService.getPortfolioPnLGraph(days);
      if (response.success && response.data) {
        setPnlGraphData(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load PnL graph:', err.message);
    } finally {
      setLoadingPnlGraph(false);
    }
  };

  const loadHistoricalReturns = async () => {
    try {
      setLoadingHistoricalReturns(true);
      const response = await riskCalculatorService.getHistoricalReturns();
      if (response.success && response.data) {
        setHistoricalReturns(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load historical returns:', err.message);
    } finally {
      setLoadingHistoricalReturns(false);
    }
  };

  const loadMarketSentiment = async () => {
    try {
      setLoadingMarketSentiment(true);
      const symbols = positions.map(p => p.symbol);
      if (symbols.length === 0) return;

      const response = await riskCalculatorService.getMarketSentiment(symbols);
      if (response.success && response.data) {
        setMarketSentiment(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load market sentiment:', err.message);
    } finally {
      setLoadingMarketSentiment(false);
    }
  };

  const handlePeriodChange = (days: number) => {
    setPnlPeriod(days);
    loadPnLGraph(days);
  };

  const handleAddPosition = async () => {
    try {
      const position = {
        symbol: newPosition.symbol.toUpperCase(),
        quantity: parseFloat(newPosition.quantity),
        entry_price: parseFloat(newPosition.entry_price),
        current_price: parseFloat(newPosition.current_price),
        stop_loss: newPosition.stop_loss ? parseFloat(newPosition.stop_loss) : undefined,
        target: newPosition.target ? parseFloat(newPosition.target) : undefined
      };

      const response = await riskCalculatorService.addPosition(position);
      if (response.success) {
        setShowAddModal(false);
        setNewPosition({
          symbol: '',
          quantity: '',
          entry_price: '',
          current_price: '',
          stop_loss: '',
          target: ''
        });
        loadPortfolioData();
      }
    } catch (err: any) {
      alert('Failed to add position: ' + err.message);
    }
  };

  const handleRemovePosition = async (positionId: string) => {
    if (!window.confirm('Are you sure you want to remove this position?')) return;

    try {
      const response = await riskCalculatorService.removePosition(positionId);
      if (response.success) {
        loadPortfolioData();
      }
    } catch (err: any) {
      alert('Failed to remove position: ' + err.message);
    }
  };

  const handleUpdatePrice = async (positionId: string, currentPrice: number) => {
    try {
      const response = await riskCalculatorService.updatePositionPrice(positionId, currentPrice);
      if (response.success) {
        loadPortfolioData();
      }
    } catch (err: any) {
      alert('Failed to update price: ' + err.message);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Very Bullish':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Bullish':
        return 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'Neutral':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'Bearish':
        return 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      case 'Very Bearish':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to view your portfolio
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ChartPieIcon className="w-12 h-12" />
                <h1 className="text-4xl font-bold">Portfolio</h1>
              </div>
              <p className="text-xl text-blue-100">Multi-stock portfolio tracking and analytics</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <PlusIcon className="w-5 h-5" />
              Add Position
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
                <CurrencyRupeeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.total_portfolio_value)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Invested: {formatCurrency(analytics.total_invested)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
                {analytics.total_unrealized_pl >= 0 ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className={`text-3xl font-bold ${
                analytics.total_unrealized_pl >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(analytics.total_unrealized_pl)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.total_unrealized_pl_percent >= 0 ? '+' : ''}
                {analytics.total_unrealized_pl_percent.toFixed(2)}%
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Risk</p>
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {analytics.total_risk_percent.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(analytics.total_risk_exposure)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Positions</p>
                <ChartPieIcon className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analytics.positions_count}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Diversification: {analytics.diversification_score.toFixed(0)}/100
              </p>
            </div>
          </div>
        )}

        {/* PnL Display Section */}
        {analytics && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-6 mb-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Portfolio Profit & Loss</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Portfolio P&L</p>
                <div className="flex items-baseline gap-3">
                  <p className={`text-3xl font-bold ${
                    analytics.total_unrealized_pl >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(analytics.total_unrealized_pl)}
                  </p>
                  <span className={`text-lg font-semibold ${
                    analytics.total_unrealized_pl >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    ({analytics.total_unrealized_pl_percent >= 0 ? '+' : ''}
                    {analytics.total_unrealized_pl_percent.toFixed(2)}%)
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {analytics.total_unrealized_pl >= 0 ? 'Total Profit' : 'Total Loss'} across all positions
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Individual Position P&L</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {positions.slice(0, 5).map((position) => (
                    <div key={position._id} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{position.symbol}</span>
                      <span className={`font-semibold ${
                        position.unrealized_pl >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(position.unrealized_pl)}
                        <span className="text-xs ml-1">
                          ({position.unrealized_pl_percent >= 0 ? '+' : ''}
                          {position.unrealized_pl_percent.toFixed(2)}%)
                        </span>
                      </span>
                    </div>
                  ))}
                  {positions.length > 5 && (
                    <p className="text-xs text-gray-500 italic">+ {positions.length - 5} more positions</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Combined PnL Graph */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio P&L Over Time</h3>
            <div className="flex gap-2">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => handlePeriodChange(days)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    pnlPeriod === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {loadingPnlGraph ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : pnlGraphData.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No P&L data available for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={pnlGraphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'P&L']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                />
                <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            Disclaimer: Historical P&L data is calculated based on position entry prices and daily closing prices.
          </p>
        </div>

        {/* Historical Returns Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Historical Returns Analysis</h3>

          {loadingHistoricalReturns ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : !historicalReturns ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No historical returns data available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 3 Months */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">3 Months</h4>
                    <p className="text-xs text-gray-500">Last Quarter</p>
                  </div>
                  <button
                    onClick={() => setExpandedPeriod(expandedPeriod === '3_months' ? null : '3_months')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {expandedPeriod === '3_months' ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  historicalReturns['3_months'].total_return >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(historicalReturns['3_months'].total_return)}
                </div>
                <div className={`text-sm font-semibold ${
                  historicalReturns['3_months'].total_return_percent >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {historicalReturns['3_months'].total_return_percent >= 0 ? '+' : ''}
                  {historicalReturns['3_months'].total_return_percent.toFixed(2)}%
                </div>

                {expandedPeriod === '3_months' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Individual Returns:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {historicalReturns['3_months'].individual_returns.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{item.symbol}</span>
                          <span className={`font-semibold ${
                            item.return_percent >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {item.return_percent >= 0 ? '+' : ''}{item.return_percent.toFixed(2)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 6 Months */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">6 Months</h4>
                    <p className="text-xs text-gray-500">Last Half Year</p>
                  </div>
                  <button
                    onClick={() => setExpandedPeriod(expandedPeriod === '6_months' ? null : '6_months')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {expandedPeriod === '6_months' ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  historicalReturns['6_months'].total_return >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(historicalReturns['6_months'].total_return)}
                </div>
                <div className={`text-sm font-semibold ${
                  historicalReturns['6_months'].total_return_percent >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {historicalReturns['6_months'].total_return_percent >= 0 ? '+' : ''}
                  {historicalReturns['6_months'].total_return_percent.toFixed(2)}%
                </div>

                {expandedPeriod === '6_months' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Individual Returns:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {historicalReturns['6_months'].individual_returns.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{item.symbol}</span>
                          <span className={`font-semibold ${
                            item.return_percent >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {item.return_percent >= 0 ? '+' : ''}{item.return_percent.toFixed(2)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 1 Year */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">1 Year</h4>
                    <p className="text-xs text-gray-500">Last 12 Months</p>
                  </div>
                  <button
                    onClick={() => setExpandedPeriod(expandedPeriod === '1_year' ? null : '1_year')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {expandedPeriod === '1_year' ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  historicalReturns['1_year'].total_return >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(historicalReturns['1_year'].total_return)}
                </div>
                <div className={`text-sm font-semibold ${
                  historicalReturns['1_year'].total_return_percent >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {historicalReturns['1_year'].total_return_percent >= 0 ? '+' : ''}
                  {historicalReturns['1_year'].total_return_percent.toFixed(2)}%
                </div>

                {expandedPeriod === '1_year' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Individual Returns:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {historicalReturns['1_year'].individual_returns.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{item.symbol}</span>
                          <span className={`font-semibold ${
                            item.return_percent >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {item.return_percent >= 0 ? '+' : ''}{item.return_percent.toFixed(2)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            Disclaimer: Returns are calculated based on current positions and historical price data. Past performance does not guarantee future results.
          </p>
        </div>

        {/* Positions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Open Positions</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading positions...</p>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          ) : positions.length === 0 ? (
            <div className="p-12 text-center">
              <ChartPieIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No positions yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Add Your First Position
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Entry Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Market Sentiment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {positions.map((position) => {
                    const sentiment = marketSentiment[position.symbol];
                    return (
                      <tr key={position._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {position.symbol}
                          </div>
                          <div className="text-xs text-gray-500">
                            Value: {formatCurrency(position.position_value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                          {position.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                          {formatCurrency(position.entry_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                          {formatCurrency(position.current_price)}
                          {sentiment && (
                            <div className={`text-xs font-semibold mt-1 ${
                              sentiment.price_change_percent >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {sentiment.price_change_percent >= 0 ? '+' : ''}
                              {sentiment.price_change_percent.toFixed(2)}% today
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-semibold ${
                            position.unrealized_pl >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(position.unrealized_pl)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {position.unrealized_pl_percent >= 0 ? '+' : ''}
                            {position.unrealized_pl_percent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {loadingMarketSentiment ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          ) : sentiment ? (
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSentimentColor(sentiment.sentiment)}`}>
                                {sentiment.sentiment}
                              </span>
                              {sentiment.candle_pattern && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  Pattern: <span className="font-medium">{sentiment.candle_pattern}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600 dark:text-orange-400">
                          {formatCurrency(position.risk_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                const newPrice = prompt('Enter new current price:');
                                if (newPrice) {
                                  handleUpdatePrice(position._id, parseFloat(newPrice));
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Update Price"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemovePosition(position._id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Remove Position"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Add New Position
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={newPosition.symbol}
                  onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value })}
                  placeholder="e.g., RELIANCE"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newPosition.quantity}
                    onChange={(e) => setNewPosition({ ...newPosition, quantity: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    value={newPosition.entry_price}
                    onChange={(e) => setNewPosition({ ...newPosition, entry_price: e.target.value })}
                    placeholder="2500"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Price
                </label>
                <input
                  type="number"
                  value={newPosition.current_price}
                  onChange={(e) => setNewPosition({ ...newPosition, current_price: e.target.value })}
                  placeholder="2550"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stop Loss (Optional)
                  </label>
                  <input
                    type="number"
                    value={newPosition.stop_loss}
                    onChange={(e) => setNewPosition({ ...newPosition, stop_loss: e.target.value })}
                    placeholder="2450"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target (Optional)
                  </label>
                  <input
                    type="number"
                    value={newPosition.target}
                    onChange={(e) => setNewPosition({ ...newPosition, target: e.target.value })}
                    placeholder="2650"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleAddPosition}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Add Position
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
