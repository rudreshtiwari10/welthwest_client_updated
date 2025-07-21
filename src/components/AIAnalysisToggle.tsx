import React from 'react';
import { BeakerIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface AIAnalysisToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const AIAnalysisToggle: React.FC<AIAnalysisToggleProps> = ({
  isEnabled,
  onToggle,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isEnabled 
            ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-inner' 
            : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            {isEnabled ? (
              <SparklesIcon className={`h-6 w-6 ${isEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} />
            ) : (
              <ChartBarIcon className="h-6 w-6 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              AI Market Regime Analysis
              {isEnabled && (
                <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                  PRO
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEnabled 
                ? 'AI analysis enabled - Random Forest classifier active' 
                : 'Enable AI-powered market regime detection'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={() => !disabled && onToggle(!isEnabled)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              disabled 
                ? 'bg-gray-300 cursor-not-allowed' 
                : isEnabled 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                  : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span className="sr-only">Toggle AI Analysis</span>
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          
          {isEnabled && (
            <div className="ml-3 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                ACTIVE
              </span>
            </div>
          )}
        </div>
      </div>
      
      {isEnabled && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2">
            <BeakerIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
              AI Features Enabled:
            </span>
          </div>
          <ul className="mt-2 text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li className="flex items-start">
              <span className="mr-1.5 mt-0.5">•</span>
              <span>Market regime classification (5 regimes)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5 mt-0.5">•</span>
              <span>Random Forest ML predictions</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5 mt-0.5">•</span>
              <span>Technical indicator analysis</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5 mt-0.5">•</span>
              <span>Trading recommendations</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisToggle;