import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { riskCalculatorService } from '../../../services/riskCalculator';
import ChartContainer from '../Shared/ChartContainer';

interface RollingMetricsChartProps {
  window?: number;
}

const RollingMetricsChart: React.FC<RollingMetricsChartProps> = ({ window = 30 }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [window]);

  const fetchData = async () => {
    try {
      const response = await riskCalculatorService.getRollingMetrics(window);
      setData(response.data?.rolling_metrics || []);
    } catch (error) {
      console.error('Failed to fetch rolling metrics:', error);
    }
  };

  return (
    <ChartContainer title="Rolling Metrics" subtitle={`${window}-trade rolling window`}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="trade_num" className="text-xs" stroke="#9CA3AF" />
          <YAxis className="text-xs" stroke="#9CA3AF" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="win_rate" stroke="#10B981" strokeWidth={2} name="Win Rate" />
          <Line type="monotone" dataKey="profit_factor" stroke="#3B82F6" strokeWidth={2} name="Profit Factor" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RollingMetricsChart;
