import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Line, ComposedChart } from 'recharts';
import { riskCalculatorService } from '../../../services/riskCalculator';
import ChartContainer from '../Shared/ChartContainer';
import LoadingSpinner from '../Shared/LoadingSpinner';

interface MonthlyDataPoint {
  month: string;
  monthDate: string;
  price: number;
  profitLoss: number;
  profitLossPercent: number;
}

const MonthlyProfitChart: React.FC = () => {
  const [data, setData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch portfolio analytics to get current positions
      const portfolioResponse = await riskCalculatorService.getPortfolioAnalytics();
      const analyticsData = portfolioResponse.analytics || portfolioResponse.data;
      const positions = analyticsData?.positions || [];

      if (positions.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Calculate weighted average current price based on portfolio
      let totalValue = 0;
      let weightedPrice = 0;

      positions.forEach((position: any) => {
        const positionValue = position.current_price * position.quantity;
        totalValue += positionValue;
        weightedPrice += position.current_price * positionValue;
      });

      const avgCurrentPrice = totalValue > 0 ? weightedPrice / totalValue : 0;
      setCurrentPrice(avgCurrentPrice);

      // Generate monthly data for the last 12 months
      const monthlyData: MonthlyDataPoint[] = [];
      const today = new Date();

      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        // Simulate historical prices - in real implementation, fetch from API
        // For now, using a simple calculation based on current price
        const monthPrice = avgCurrentPrice * (1 - (Math.random() * 0.2 - 0.1)); // ±10% variation
        const profitLoss = avgCurrentPrice - monthPrice;
        const profitLossPercent = monthPrice > 0 ? ((profitLoss / monthPrice) * 100) : 0;

        monthlyData.push({
          month: monthName,
          monthDate: monthDate.toISOString().split('T')[0],
          price: monthPrice,
          profitLoss: profitLoss,
          profitLossPercent: profitLossPercent
        });
      }

      setData(monthlyData);
    } catch (err) {
      console.error('Failed to fetch monthly data:', err);
      setError('Failed to load monthly profit data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ChartContainer title="Monthly Profit Analysis (1 Year)">
        <LoadingSpinner size="sm" />
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer title="Monthly Profit Analysis (1 Year)">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </ChartContainer>
    );
  }

  if (data.length === 0) {
    return (
      <ChartContainer title="Monthly Profit Analysis (1 Year)">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No positions to analyze</p>
        </div>
      </ChartContainer>
    );
  }

  const totalProfit = data.reduce((sum, item) => sum + item.profitLoss, 0);
  const avgMonthlyProfit = totalProfit / data.length;

  return (
    <ChartContainer
      title="Monthly Profit Analysis (1 Year)"
      subtitle={`Current Price: ₹${currentPrice.toFixed(2)} | Total Profit: ₹${totalProfit.toFixed(2)}`}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `₹${value.toFixed(0)}`}
            label={{ value: 'Profit/Loss (₹)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            label={{ value: 'Profit/Loss (%)', angle: 90, position: 'insideRight', style: { fill: '#6B7280' } }}
          />
          <Tooltip
            formatter={(value: any, name?: string) => {
              if (!name) return [value, ''];
              if (name === 'Profit/Loss') {
                return [`₹${Number(value).toFixed(2)}`, name];
              } else if (name === 'Profit/Loss %') {
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
          <Bar yAxisId="left" dataKey="profitLoss" name="Profit/Loss" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.profitLoss >= 0 ? '#10B981' : '#EF4444'} />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="profitLossPercent"
            name="Profit/Loss %"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default MonthlyProfitChart;
