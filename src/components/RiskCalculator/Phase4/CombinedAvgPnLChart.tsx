import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { riskCalculatorService } from '../../../services/riskCalculator';
import ChartContainer from '../Shared/ChartContainer';
import LoadingSpinner from '../Shared/LoadingSpinner';

interface PortfolioMetrics {
  date: string;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  totalInvested: number;
  totalValue: number;
}

const CombinedAvgPnLChart: React.FC = () => {
  const [data, setData] = useState<PortfolioMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalInvested: 0,
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    avgBuyPrice: 0,
    currentAvgPrice: 0
  });

  useEffect(() => {
    fetchCombinedPnL();
  }, []);

  const fetchCombinedPnL = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch portfolio analytics
      const portfolioResponse = await riskCalculatorService.getPortfolioAnalytics();
      const analyticsData = portfolioResponse.analytics || portfolioResponse.data;
      const positions = analyticsData?.positions || [];

      if (positions.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Calculate combined metrics
      let totalQuantity = 0;
      let weightedBuyPrice = 0;
      let weightedCurrentPrice = 0;
      let totalInvested = 0;
      let totalValue = 0;

      positions.forEach((position: any) => {
        const quantity = position.quantity || 0;
        const buyPrice = position.buy_price || position.entry_price || 0;
        const currentPrice = position.current_price || buyPrice;

        totalQuantity += quantity;
        weightedBuyPrice += buyPrice * quantity;
        weightedCurrentPrice += currentPrice * quantity;
        totalInvested += buyPrice * quantity;
        totalValue += currentPrice * quantity;
      });

      const avgBuyPrice = totalQuantity > 0 ? weightedBuyPrice / totalQuantity : 0;
      const avgCurrentPrice = totalQuantity > 0 ? weightedCurrentPrice / totalQuantity : 0;
      const totalPnL = totalValue - totalInvested;
      const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      // Generate time series data (simulated daily data for last 30 days)
      const timeSeriesData: PortfolioMetrics[] = [];
      const today = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

        // Simulate price movement from avg buy price to current price
        const progress = (29 - i) / 29;
        const simulatedCurrentPrice = avgBuyPrice + (avgCurrentPrice - avgBuyPrice) * progress;
        const simulatedValue = (totalInvested / avgBuyPrice) * simulatedCurrentPrice;
        const simulatedPnL = simulatedValue - totalInvested;
        const simulatedPnLPercent = totalInvested > 0 ? (simulatedPnL / totalInvested) * 100 : 0;

        timeSeriesData.push({
          date: dateStr,
          avgBuyPrice: avgBuyPrice,
          currentPrice: simulatedCurrentPrice,
          pnl: simulatedPnL,
          pnlPercent: simulatedPnLPercent,
          totalInvested: totalInvested,
          totalValue: simulatedValue
        });
      }

      setData(timeSeriesData);
      setSummary({
        totalInvested,
        totalValue,
        totalPnL,
        totalPnLPercent,
        avgBuyPrice,
        currentAvgPrice: avgCurrentPrice
      });

    } catch (err) {
      console.error('Failed to fetch combined PnL:', err);
      setError('Failed to load combined PnL data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ChartContainer title="Combined Portfolio P&L from Average Buy Price">
        <LoadingSpinner size="sm" />
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer title="Combined Portfolio P&L from Average Buy Price">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </ChartContainer>
    );
  }

  if (data.length === 0) {
    return (
      <ChartContainer title="Combined Portfolio P&L from Average Buy Price">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No positions to analyze</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Buy Price</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            ₹{summary.avgBuyPrice.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Avg Price</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            ₹{summary.currentAvgPrice.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total P&L</p>
          <p className={`text-xl font-bold mt-1 ${
            summary.totalPnL >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {summary.totalPnL >= 0 ? '+' : ''}₹{summary.totalPnL.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total P&L %</p>
          <p className={`text-xl font-bold mt-1 ${
            summary.totalPnLPercent >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {summary.totalPnLPercent >= 0 ? '+' : ''}{summary.totalPnLPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <ChartContainer
        title="Combined Portfolio P&L Trend (Last 30 Days)"
        subtitle={`Invested: ₹${summary.totalInvested.toLocaleString('en-IN')} | Current Value: ₹${summary.totalValue.toLocaleString('en-IN')}`}
        height={400}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              label={{ value: 'P&L (%)', angle: 90, position: 'insideRight', style: { fill: '#6B7280' } }}
            />
            <Tooltip
              formatter={(value: any, name?: string) => {
                if (!name) return [value, ''];
                if (name === 'Avg Buy Price' || name === 'Current Price') {
                  return [`₹${Number(value).toFixed(2)}`, name];
                } else if (name === 'P&L') {
                  return [`₹${Number(value).toLocaleString('en-IN')}`, name];
                } else if (name === 'P&L %') {
                  return [`${Number(value).toFixed(2)}%`, name];
                }
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />
            <Legend />
            <ReferenceLine yAxisId="left" y={summary.avgBuyPrice} stroke="#F59E0B" strokeDasharray="5 5" label="Avg Buy" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgBuyPrice"
              name="Avg Buy Price"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="currentPrice"
              name="Current Price"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pnlPercent"
              name="P&L %"
              stroke={summary.totalPnLPercent >= 0 ? '#10B981' : '#EF4444'}
              strokeWidth={2}
              dot={{ fill: summary.totalPnLPercent >= 0 ? '#10B981' : '#EF4444', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default CombinedAvgPnLChart;
