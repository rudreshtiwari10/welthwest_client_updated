import React from 'react';
import RiskAnalyticsDashboard from '../../components/RiskCalculator/Phase7/RiskAnalyticsDashboard';
import SEBIDisclaimer from '../../components/RiskCalculator/Shared/SEBIDisclaimer';

const Phase7Analytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RiskAnalyticsDashboard />

        <div className="mt-6">
          <SEBIDisclaimer />
        </div>
      </div>
    </div>
  );
};

export default Phase7Analytics;
