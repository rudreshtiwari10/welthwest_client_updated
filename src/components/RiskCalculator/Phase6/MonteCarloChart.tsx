import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartContainer from '../Shared/ChartContainer';

interface MonteCarloChartProps {
  data: Array<{ range: string; count: number; percentage: number }>;
  className?: string;
}

const MonteCarloChart: React.FC<MonteCarloChartProps> = ({ data, className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title="Drawdown Distribution" subtitle="Monte Carlo Simulation Results" className={className}>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </ChartContainer>
    );
  }

  const COLORS = ['#10B981', '#34D399', '#FCD34D', '#FBBF24', '#F87171', '#EF4444'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Drawdown: {payload[0].payload.range}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Occurrences: {payload[0].value}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Probability: {payload[0].payload.percentage?.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title="Drawdown Distribution"
      subtitle="Histogram showing frequency of different drawdown levels across simulations"
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="range"
            className="text-xs"
            stroke="#9CA3AF"
            label={{ value: 'Drawdown Range (%)', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#9CA3AF' } }}
          />
          <YAxis
            className="text-xs"
            stroke="#9CA3AF"
            label={{ value: 'Frequency', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9CA3AF' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[Math.min(index, COLORS.length - 1)]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Understanding the Distribution
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Taller bars indicate more likely drawdown ranges</li>
          <li>• Bars on the left (lower drawdowns) are more desirable</li>
          <li>• Plan your risk management for the 95th percentile scenario</li>
        </ul>
      </div>
    </ChartContainer>
  );
};

export default MonteCarloChart;
