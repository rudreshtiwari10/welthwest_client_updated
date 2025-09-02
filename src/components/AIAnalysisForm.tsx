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
  useRandomForest?: boolean;
  useHmm?: boolean;
  hmmComponents?: number;
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
    retrain: false,
    useRandomForest: true, // Enable Random Forest by default
    useHmm: true, // Enable HMM by default
    hmmComponents: 3 // Default number of HMM states
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

    if (!config.useRandomForest && !config.useHmm) {
      newErrors.methods = 'At least one analysis method must be enabled (Random Forest or HMM)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    // Always set retrain to false for regular users (admin-only feature)
    onAnalyze({
      ...config,
      retrain: false
    });
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

        {/* AI Methods Configuration */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            AI Analysis Methods
          </h4>
          
          {/* Random Forest Configuration */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label htmlFor="useRandomForest" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Random Forest (RF)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Traditional ML-based regime classification
                </p>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, useRandomForest: !prev.useRandomForest }))}
                  disabled={disabled || isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    config.useRandomForest ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.useRandomForest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {config.useRandomForest && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Technical indicator-based classification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Feature importance analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Confidence scores and probabilities</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HMM Configuration */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <label htmlFor="useHmm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hidden Markov Model (HMM)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enable advanced regime forecasting with HMM
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, useHmm: !prev.useHmm }))}
                disabled={disabled || isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  config.useHmm ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.useHmm ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full font-medium">
                NEW
              </span>
            </div>
          </div>

          {config.useHmm && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <div className="mb-3">
                <label htmlFor="hmmComponents" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Hidden States
                </label>
                <select
                  id="hmmComponents"
                  name="hmmComponents"
                  value={config.hmmComponents}
                  onChange={handleInputChange}
                  disabled={disabled || isLoading}
                  className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-400 dark:text-white bg-white"
                >
                  <option value={2}>2 States (Simple)</option>
                  <option value={3}>3 States (Default)</option>
                  <option value={4}>4 States (Advanced)</option>
                  <option value={5}>5 States (Complex)</option>
                </select>
              </div>
              
              <div className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Next-day regime probability forecasts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Enhanced feature engineering with HMM states</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Latent market pattern detection</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Methods validation error */}
        {errors.methods && (
          <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            {errors.methods}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={disabled || isLoading}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          What you'll get:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Current market regime classification</li>
          <li>• Confidence scores and probabilities</li>
          {config.useRandomForest && (
            <>
              <li className="text-green-600 dark:text-green-400 font-medium">• Random Forest predictions</li>
              <li className="text-green-600 dark:text-green-400 font-medium">• Feature importance analysis</li>
            </>
          )}
          {config.useHmm && (
            <>
              <li className="text-indigo-600 dark:text-indigo-400 font-medium">• HMM next-day forecasts</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-medium">• Hidden state pattern analysis</li>
            </>
          )}
          <li>• Trading recommendations</li>
          <li>• Model performance metrics</li>
          <li>• Technical indicator insights</li>
        </ul>
        
        <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
          {config.useRandomForest && config.useHmm ? 
            'Using combined Random Forest + HMM models for enhanced accuracy' :
            config.useRandomForest ? 
            'Using Random Forest model for market regime analysis' :
            config.useHmm ?
            'Using HMM model for probabilistic regime forecasting' :
            'Please select at least one analysis method'
          }
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisForm;