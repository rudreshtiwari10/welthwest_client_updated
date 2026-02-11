import React from 'react';
import PortfolioManager from '../../components/RiskCalculator/Phase4/PortfolioManager';
import SEBIDisclaimer from '../../components/RiskCalculator/Shared/SEBIDisclaimer';

const Phase4Portfolio: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PortfolioManager />

        <div className="mt-6">
          <SEBIDisclaimer />
        </div>
      </div>
    </div>
  );
};

export default Phase4Portfolio;
