import React, { useEffect, useState } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';
import PositionCard from './PositionCard';
import AllocationChart from './AllocationChart';
import ConcentrationWarnings from './ConcentrationWarnings';
import PortfolioPnLGraph from './PortfolioPnLGraph';
import MarketSentimentCard from './MarketSentimentCard';
import MonthlyProfitChart from './MonthlyProfitChart';
import CombinedAvgPnLChart from './CombinedAvgPnLChart';
import { PlusIcon } from '@heroicons/react/24/outline';

const PortfolioManager: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPosition, setShowAddPosition] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await riskCalculatorService.getPortfolioAnalytics();
      // Backend returns analytics object, map it to expected structure
      const analyticsData = response.analytics || response.data;

      if (analyticsData) {
        // Transform backend response to expected format
        const transformedData = {
          positions: analyticsData.positions || [],
          metrics: {
            total_value: analyticsData.portfolio?.total_value || 0,
            unrealized_pl: analyticsData.portfolio?.total_unrealized_pnl || 0,
            total_risk: analyticsData.portfolio?.total_risk_if_all_sl_hit || 0,
            portfolio_return_percent: analyticsData.portfolio?.portfolio_return_percent || 0,
            diversification_score: calculateDiversificationScore(analyticsData.allocations || [])
          },
          allocation: (analyticsData.allocations || []).map((item: any) => ({
            symbol: item.symbol,
            value: item.value,
            percentage: item.allocation_percent
          })),
          warnings: analyticsData.warnings || []
        };
        setAnalytics(transformedData);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiversificationScore = (allocations: any[]): number => {
    if (allocations.length === 0) return 0;
    if (allocations.length === 1) return 3;

    // Calculate Herfindahl index (concentration measure)
    const herfindahl = allocations.reduce((sum, item) => {
      const percentage = item.allocation_percent / 100;
      return sum + (percentage * percentage);
    }, 0);

    // Convert to diversification score (0-10, where 10 is most diversified)
    const maxDiversification = 1 / allocations.length; // Perfect diversification
    const score = Math.round((1 - herfindahl) / (1 - maxDiversification) * 10);

    return Math.max(0, Math.min(10, score));
  };

  const handleAddPosition = async (position: any) => {
    try {
      await riskCalculatorService.addPosition(position);
      await fetchPortfolio();
      setShowAddPosition(false);
    } catch (error) {
      console.error('Failed to add position:', error);
    }
  };

  const handleRemovePosition = async (positionId: string) => {
    try {
      await riskCalculatorService.removePosition(positionId);
      await fetchPortfolio();
    } catch (error) {
      console.error('Failed to remove position:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Loading portfolio..." />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Failed to load portfolio</p>
      </div>
    );
  }

  const { positions, metrics, allocation, warnings } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Portfolio Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor and manage your active positions
          </p>
        </div>
        <button
          onClick={() => setShowAddPosition(true)}
          className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Concentration Warnings */}
      {warnings && warnings.length > 0 && (
        <ConcentrationWarnings warnings={warnings} />
      )}

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ₹{metrics.total_value.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Unrealized P/L</p>
          <p className={`text-2xl font-bold mt-1 ${
            metrics.unrealized_pl >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {metrics.unrealized_pl >= 0 ? '+' : ''}₹{metrics.unrealized_pl.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Positions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {positions.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Diversification</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {metrics.diversification_score}/10
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationChart allocation={allocation} />
        <MarketSentimentCard symbols={positions.map((p: any) => p.symbol)} />
      </div>

      {/* P/L Graph */}
      <PortfolioPnLGraph />

      {/* Combined Average P&L Chart */}
      <CombinedAvgPnLChart />

      {/* Monthly Profit Analysis Chart */}
      <MonthlyProfitChart />

      {/* Positions List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Active Positions ({positions.length})
        </h2>
        {positions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((position: any) => (
              <PositionCard
                key={position._id}
                position={position}
                onRemove={handleRemovePosition}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No positions yet. Add your first position to start tracking your portfolio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManager;
