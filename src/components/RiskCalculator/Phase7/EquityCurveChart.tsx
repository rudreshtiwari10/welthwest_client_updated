import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { riskCalculatorService } from '../../../services/riskCalculator';
import ChartContainer from '../Shared/ChartContainer';
import LoadingSpinner from '../Shared/LoadingSpinner';

interface EquityCurveChartProps {
  period?: string;
  className?: string;
}

const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ period = '3m', className = '' }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getEquityCurve(period);
      setData(response.data?.equity_curve || []);
    } catch (error) {
      console.error('Failed to fetch equity curve:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ChartContainer title="Equity Curve" className={className}>
        <LoadingSpinner />
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Equity Curve" subtitle="Portfolio value over time" className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="date" className="text-xs" stroke="#9CA3AF" />
          <YAxis className="text-xs" stroke="#9CA3AF" />
          <Tooltip />
          <Line type="monotone" dataKey="equity" stroke="#10B981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default EquityCurveChart;
