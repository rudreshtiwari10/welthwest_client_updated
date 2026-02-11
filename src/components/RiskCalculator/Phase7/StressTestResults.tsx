import React from 'react';

interface StressTestResultsProps {
  scenarios?: any;
}

const StressTestResults: React.FC<StressTestResultsProps> = ({ scenarios }) => {
  if (!scenarios) return null;

  const scenarioList = [
    { name: 'Market Crash (-20%)', impact: scenarios.market_crash },
    { name: 'High Volatility (+50%)', impact: scenarios.high_volatility },
    { name: 'Interest Rate Hike', impact: scenarios.interest_rate }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Stress Test Scenarios
      </h3>
      <div className="space-y-3">
        {scenarioList.map((scenario, index) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {scenario.name}
              </span>
              <span className={`text-lg font-bold ${
                (scenario.impact || 0) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {(scenario.impact || 0) >= 0 ? '+' : ''}₹{scenario.impact?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StressTestResults;
