import React from 'react';
import SessionDashboard from '../../components/RiskCalculator/Phase3/SessionDashboard';
import BehaviorFlagsPanel from '../../components/RiskCalculator/Phase3/BehaviorFlagsPanel';
import BehaviorHistoryChart from '../../components/RiskCalculator/Phase3/BehaviorHistoryChart';
import SEBIDisclaimer from '../../components/RiskCalculator/Shared/SEBIDisclaimer';

const Phase3Session: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SessionDashboard />

        <div className="mt-6">
          <SEBIDisclaimer />
        </div>
      </div>
    </div>
  );
};

export default Phase3Session;
