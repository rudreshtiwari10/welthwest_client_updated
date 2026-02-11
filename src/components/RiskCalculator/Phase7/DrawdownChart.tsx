import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { riskCalculatorService } from '../../../services/riskCalculator';
import ChartContainer from '../Shared/ChartContainer';

const DrawdownChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await riskCalculatorService.getDrawdownAnalysis();
      setData(response.data?.drawdown_history || []);
    } catch (error) {
      console.error('Failed to fetch drawdown data:', error);
    }
  };

  return (
    <ChartContainer title="Drawdown Over Time" subtitle="Peak-to-trough decline">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" className="text-xs" stroke="#9CA3AF" />
          <YAxis className="text-xs" stroke="#9CA3AF" />
          <Tooltip />
          <Area type="monotone" dataKey="drawdown" stroke="#EF4444" fill="#FEE2E2" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DrawdownChart;
