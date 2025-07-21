import React, { useState, useEffect } from 'react';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface AIAnalysisFormProps {
  onAnalyze: (config: AIAnalysisConfig) => void;
  isLoading?: boolean;
  disabled?: boolean;
  defaultTicker?: string;
}

export interface AIAnalysisConfig {
  ticker: string;
  period: string;
  retrain: boolean;
}

const AIAnalysisForm: React.FC<AIAnalysisFormProps> = ({
  onAnalyze,
  isLoading = false,
  disabled = false,
  defaultTicker = ''
}) => {
  const [config, setConfig] = useState<AIAnalysisConfig>({
    ticker: defaultTicker,
    period: '2y',
    retrain: false
  });

  // Update ticker when defaultTicker prop changes
  useEffect(() => {
    if (defaultTicker) {
      setConfig(prev => ({
        ...prev,
        ticker: defaultTicker
      }));
    }
  }, [defaultTicker]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    
    if (!config.ticker.trim()) {
      newErrors.ticker = 'Stock symbol is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onAnalyze(config);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const periodOptions = [
    { value: '1y', label: '1 Year' },
    { value: '2y', label: '2 Years' },
    { value: '5y', label: '5 Years' },
    { value: 'max', label: 'Maximum Available' }
  ];

  return (
    <div className="bg-white dark:bg-dark-300 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        AI Analysis Configuration
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stock Symbol */}
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stock Symbol *
          </label>
          <input
            type="text"
            id="ticker"
            name="ticker"
            value={config.ticker}
            onChange={handleInputChange}
            disabled={disabled || isLoading}
            placeholder="e.g., RELIANCE, TCS, INFY"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-400 dark:text-white dark:border-gray-600 ${
              errors.ticker ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.ticker && (
            <p className="mt-1 text-sm text-red-600">{errors.ticker}</p>
          )}
        </div>

        {/* Analysis Period */}
        <div>
          <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Analysis Period
          </label>
          <select
            id="period"
            name="period"
            value={config.period}
            onChange={handleInputChange}
            disabled={disabled || isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-400 dark:text-white"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Retrain Option */}
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="retrain"
              name="retrain"
              checked={config.retrain}
              onChange={handleInputChange}
              disabled={disabled || isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-dark-400"
            />
          </div>
          <div>
            <label htmlFor="retrain" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Retrain Model
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Force model retraining with latest data (takes longer but may improve accuracy)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={disabled || isLoading}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Analyzing...
              </>
            ) : (
              <>
                <PlayIcon className="-ml-1 mr-2 h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Info Box */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-400 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          What you'll get:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Current market regime classification</li>
          <li>• Confidence scores and probabilities</li>
          <li>• Trading recommendations</li>
          <li>• Feature importance analysis</li>
          <li>• Historical regime transitions</li>
        </ul>
      </div>
    </div>
  );
};

export default AIAnalysisForm;