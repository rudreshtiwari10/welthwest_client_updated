import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ChartContainer from '../Shared/ChartContainer';

interface BehaviorDataPoint {
  date: string;
  overtrading_score: number;
  revenge_trading_score: number;
  fatigue_score: number;
  total_trades: number;
  win_rate: number;
}

interface BehaviorHistoryChartProps {
  data: BehaviorDataPoint[];
  days?: number;
  className?: string;
}

const BehaviorHistoryChart: React.FC<BehaviorHistoryChartProps> = ({
  data,
  days = 7,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer
        title="Behavior Pattern History"
        subtitle={`Last ${days} days`}
        className={className}
      >
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No behavior data available
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Start trading to track behavioral patterns
            </p>
          </div>
        </div>
      </ChartContainer>
    );
  }

  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }));

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
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.name.includes('Score') ? '%' : entry.name === 'Win Rate' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      {/* Behavior Scores Timeline */}
      <ChartContainer
        title="Behavior Pattern Scores"
        subtitle={`Last ${days} days - Lower scores indicate better discipline`}
        className="mb-6"
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              className="text-xs"
              stroke="#9CA3AF"
            />
            <YAxis
              className="text-xs"
              stroke="#9CA3AF"
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey="overtrading_score"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Overtrading Score"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="revenge_trading_score"
              stroke="#EF4444"
              strokeWidth={2}
              name="Revenge Trading Score"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="fatigue_score"
              stroke="#8B5CF6"
              strokeWidth={2}
              name="Fatigue Score"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Trading Activity */}
      <ChartContainer
        title="Daily Trading Activity"
        subtitle={`Trade count and win rate over ${days} days`}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              className="text-xs"
              stroke="#9CA3AF"
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              stroke="#9CA3AF"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              stroke="#9CA3AF"
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="total_trades"
              fill="#3B82F6"
              name="Total Trades"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="win_rate"
              fill="#10B981"
              name="Win Rate"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Info Box */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Understanding Behavior Scores
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Overtrading:</strong> Triggered by excessive trades or rapid position changes</li>
          <li>• <strong>Revenge Trading:</strong> Detected after consecutive losses with increased position sizes</li>
          <li>• <strong>Fatigue:</strong> High score indicates extended trading sessions without breaks</li>
          <li>• Scores above 70 warrant immediate attention and a trading break</li>
        </ul>
      </div>
    </div>
  );
};

export default BehaviorHistoryChart;
