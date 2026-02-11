import React, { useState, useEffect } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';
import EquityCurveChart from './EquityCurveChart';
import DrawdownChart from './DrawdownChart';
import VolatilityMetricsCard from './VolatilityMetricsCard';
import RollingMetricsChart from './RollingMetricsChart';
import StressTestResults from './StressTestResults';
import PortfolioScoreCard from './PortfolioScoreCard';

const RiskAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('3m');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getComprehensiveAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <LoadingSpinner text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Risk Analytics Dashboard</h1>
        <p className="text-primary-100">Comprehensive performance and risk metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EquityCurveChart period={selectedPeriod} />
        </div>
        <div>
          <PortfolioScoreCard score={analytics?.portfolio_score || 0} />
        </div>
      </div>

      <DrawdownChart />

      <VolatilityMetricsCard metrics={analytics?.volatility_metrics} />

      <RollingMetricsChart window={30} />

      <StressTestResults scenarios={analytics?.stress_test} />
    </div>
  );
};

export default RiskAnalyticsDashboard;
