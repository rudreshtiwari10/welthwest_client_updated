import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConcentrationWarningsProps {
  warnings: any[];
}

const ConcentrationWarnings: React.FC<ConcentrationWarningsProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Portfolio Risk Alerts
          </h3>
          <div className="space-y-2">
            {warnings.map((warning: any, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-2 text-sm text-amber-800 dark:text-amber-200"
              >
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <p>{warning.message || warning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcentrationWarnings;
