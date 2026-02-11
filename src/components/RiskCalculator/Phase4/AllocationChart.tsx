import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ChartContainer from '../Shared/ChartContainer';

interface AllocationChartProps {
  allocation: any[];
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const AllocationChart: React.FC<AllocationChartProps> = ({ allocation }) => {
  // Enhanced data validation
  const isValidAllocation = allocation && Array.isArray(allocation) && allocation.length > 0;

  if (!isValidAllocation) {
    return (
      <ChartContainer title="Portfolio Allocation">
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-center">No positions to display</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">Add positions to see your portfolio allocation</p>
        </div>
      </ChartContainer>
    );
  }

  // Filter out invalid entries and prepare chart data
  const chartData = allocation
    .filter((item: any) => item && (item.symbol || item.name) && (item.percentage || item.value))
    .map((item: any) => ({
      name: item.symbol || item.name,
      value: item.percentage || item.percent || 0,
      amount: item.value || item.amount || 0
    }));

  if (chartData.length === 0) {
    return (
      <ChartContainer title="Portfolio Allocation">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Invalid allocation data</p>
        </div>
      </ChartContainer>
    );
  }

  const renderLabel = (entry: any) => {
    const percentage = typeof entry.value === 'number' ? entry.value.toFixed(1) : '0.0';
    return `${entry.name} (${percentage}%)`;
  };

  return (
    <ChartContainer
      title="Portfolio Allocation"
      subtitle="Distribution by stock symbol"
      height={350}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any, props: any) => [
              `${value.toFixed(2)}% (₹${props.payload.amount.toLocaleString('en-IN')})`,
              name
            ]}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default AllocationChart;
