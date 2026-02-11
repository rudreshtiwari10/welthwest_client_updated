import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { riskCalculatorService } from '../../../services/riskCalculator';
import ChartContainer from '../Shared/ChartContainer';
import LoadingSpinner from '../Shared/LoadingSpinner';

const PortfolioPnLGraph: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number>(30);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getPortfolioPnLGraph(period);
      // Handle both response.data.pnl_data and response.data directly
      const pnlData = response.data?.pnl_data || response.data || [];
      setData(pnlData);
    } catch (error) {
      console.error('Failed to fetch P/L data:', error);
      setData([]); // Set empty data on error
    } finally {
      setLoading(false);
    }
  };

  const actionContent = (
    <select
      value={period}
      onChange={(e) => setPeriod(parseInt(e.target.value))}
      className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
    >
      <option value={7}>Last 7 Days</option>
      <option value={30}>Last 30 Days</option>
      <option value={90}>Last 90 Days</option>
    </select>
  );

  if (loading) {
    return (
      <ChartContainer title="Portfolio P/L Trend" action={actionContent}>
        <LoadingSpinner size="sm" />
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Portfolio P/L Trend"
      subtitle="Daily profit/loss over selected period"
      action={actionContent}
      height={350}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
          />
          <Tooltip
            formatter={(value: any) => [`₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'P/L']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}
          />
          <Legend />
          <Bar dataKey="pnl" name="Daily P/L" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PortfolioPnLGraph;
