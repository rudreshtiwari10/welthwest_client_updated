import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface InsightsChartProps {
  data: Array<{
    name: string;
    win_rate: number;
    avg_profit: number;
    trades: number;
  }>;
  type: 'strategy' | 'emotion';
  className?: string;
}

const InsightsChart: React.FC<InsightsChartProps> = ({
  data,
  type,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`h-64 flex items-center justify-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#EC4899', // pink
    '#14B8A6'  // teal
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-xs"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.name === 'Win Rate'
                ? `${entry.value.toFixed(1)}%`
                : entry.name === 'Avg Profit'
                ? `₹${entry.value.toFixed(2)}`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      {/* Win Rate Bar Chart */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Win Rate by {type === 'strategy' ? 'Strategy' : 'Emotional State'}
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="name"
              className="text-xs"
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              className="text-xs"
              stroke="#9CA3AF"
              domain={[0, 100]}
              label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9CA3AF' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="win_rate" name="Win Rate" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average Profit Line Chart */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Average Profit/Loss by {type === 'strategy' ? 'Strategy' : 'Emotional State'}
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="name"
              className="text-xs"
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              className="text-xs"
              stroke="#9CA3AF"
              label={{ value: 'Avg Profit (₹)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9CA3AF' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="avg_profit"
              name="Avg Profit"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trade Count Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Number of Trades by {type === 'strategy' ? 'Strategy' : 'Emotional State'}
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="name"
              className="text-xs"
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              className="text-xs"
              stroke="#9CA3AF"
              label={{ value: 'Trade Count', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9CA3AF' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="trades" name="Trades" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {type === 'strategy' ? 'Strategy' : 'Emotion'}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trades
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avg Profit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                  {item.trades}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={`font-semibold ${
                    item.win_rate >= 60
                      ? 'text-green-600 dark:text-green-400'
                      : item.win_rate >= 40
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.win_rate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={`font-semibold ${
                    item.avg_profit >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.avg_profit >= 0 ? '+' : ''}₹{item.avg_profit.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InsightsChart;
