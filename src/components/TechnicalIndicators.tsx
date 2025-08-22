import React, { useState, useEffect } from 'react';
import { marketService } from '../services/api';
import { ChartBarIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface TechnicalIndicator {
  value?: number | string;
  signal?: 'buy' | 'sell' | 'neutral' | string;
  description?: string;
  // Additional possible fields from API
  current_value?: number | string;
  recommendation?: string;
  action?: string;
  status?: string;
}

interface TechnicalAnalysisData {
  [indicatorName: string]: TechnicalIndicator;
}

interface TechnicalIndicatorsProps {
  ticker: string;
  onClose?: () => void;
  className?: string;
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ ticker, onClose, className = '' }) => {
  const [data, setData] = useState<TechnicalAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticker) {
      fetchTechnicalAnalysis();
    }
  }, [ticker]);

  const fetchTechnicalAnalysis = async () => {
    if (!ticker) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching technical analysis for:', ticker);
      const response = await marketService.getTechnicalAnalysis(ticker);
      console.log('API Response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      setData(response);
    } catch (err) {
      console.error('Technical Analysis Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch technical analysis');
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (signal: string | undefined): string => {
    if (!signal) return 'text-gray-400';
    switch (signal.toLowerCase()) {
      case 'buy':
        return 'text-green-500';
      case 'sell':
        return 'text-red-500';
      case 'neutral':
      default:
        return 'text-gray-400';
    }
  };

  const getSignalIcon = (signal: string | undefined) => {
    if (!signal) return <MinusIcon className="w-4 h-4 text-gray-400" />;
    switch (signal.toLowerCase()) {
      case 'buy':
        return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
      case 'sell':
        return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
      case 'neutral':
      default:
        return <MinusIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const normalizeIndicatorData = (rawData: any): TechnicalIndicator => {
    console.log('Normalizing raw data:', rawData);
    
    // Handle different possible API response formats
    const normalized: TechnicalIndicator = {};
    
    // Try to extract value from different possible fields
    normalized.value = rawData.value || rawData.current_value || rawData.price || rawData.level || rawData.val || 'N/A';
    console.log('Extracted value:', normalized.value);
    
    // Try to extract signal from different possible fields and normalize it
    let signal = rawData.signal || rawData.recommendation || rawData.action || rawData.status || rawData.direction;
    console.log('Raw signal found:', signal);
    
    // Normalize signal values to our expected format
    if (signal) {
      const signalLower = String(signal).toLowerCase();
      if (signalLower.includes('buy') || signalLower.includes('bullish') || signalLower.includes('positive') || signalLower === 'long') {
        normalized.signal = 'buy';
      } else if (signalLower.includes('sell') || signalLower.includes('bearish') || signalLower.includes('negative') || signalLower === 'short') {
        normalized.signal = 'sell';
      } else if (signalLower.includes('neutral') || signalLower.includes('hold') || signalLower.includes('sideways')) {
        normalized.signal = 'neutral';
      } else {
        normalized.signal = signal; // Keep original if no clear mapping
      }
    }
    console.log('Normalized signal:', normalized.signal);
    
    // Try to extract description
    normalized.description = rawData.description || rawData.desc || rawData.message || rawData.text || '';
    
    console.log('Final normalized data:', normalized);
    return normalized;
  };

  const formatValue = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return String(value);
  };

  const getSignalBadgeClass = (signal: string | undefined): string => {
    if (!signal) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (signal.toLowerCase()) {
      case 'buy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sell':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Technical Analysis - {ticker}
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading indicators...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Technical Analysis - {ticker}
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={fetchTechnicalAnalysis}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => {
                console.log('Manual test - fetching for RELIANCE');
                marketService.getTechnicalAnalysis('RELIANCE')
                  .then(response => {
                    console.log('Manual test response:', response);
                    alert('Check console for response');
                  })
                  .catch(err => {
                    console.error('Manual test error:', err);
                    alert('Error: ' + err.message);
                  });
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Test API
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Handle different possible response formats
  let indicators: [string, TechnicalIndicator][] = [];
  
  console.log('Processing data:', data);
  
  if (typeof data === 'object' && data !== null) {
    console.log('Data is object, keys:', Object.keys(data));
    console.log('First value type:', typeof Object.values(data)[0]);
    
    // If data is directly the indicators object
    if (Object.keys(data).length > 0 && typeof Object.values(data)[0] === 'object') {
      console.log('Processing as direct indicators object');
      indicators = Object.entries(data).map(([name, rawData]) => {
        console.log(`Processing indicator ${name}:`, rawData);
        const normalized = normalizeIndicatorData(rawData);
        console.log(`Normalized ${name}:`, normalized);
        return [name, normalized];
      });
    }
    // If data has a nested structure (e.g., data.indicators)
    else if (data.indicators && typeof data.indicators === 'object') {
      console.log('Processing as nested indicators object');
      indicators = Object.entries(data.indicators).map(([name, rawData]) => [
        name, 
        normalizeIndicatorData(rawData)
      ]);
    }
    // If data has a different nested structure, try to find the indicators
    else {
      console.log('Processing as fallback direct mapping');
      indicators = Object.entries(data).map(([name, rawData]) => [
        name, 
        normalizeIndicatorData(rawData)
      ]);
    }
  }
  
  console.log('Final indicators array:', indicators);
  console.log('Indicators count:', indicators.length);

  if (indicators.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Technical Analysis - {ticker}
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 mb-4">
          No technical indicators found for {ticker}
        </div>
        
        {/* Debug raw data display */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h4 className="font-medium mb-2">Debug Information:</h4>
          <div className="text-sm space-y-2">
            <div><strong>Data exists:</strong> {data ? 'Yes' : 'No'}</div>
            <div><strong>Data type:</strong> {typeof data}</div>
            <div><strong>Data keys:</strong> {data ? JSON.stringify(Object.keys(data)) : 'None'}</div>
            <div><strong>Raw data:</strong></div>
            <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Technical Analysis - {ticker}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Row-wise Indicator Display */}
      <div className="space-y-2">
        {indicators.map(([indicatorName, indicator]) => (
          <div
            key={indicatorName}
            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {/* Indicator Name */}
            <span className="font-medium text-gray-900 dark:text-white">
              {indicatorName.toUpperCase()}
            </span>
            
            {/* Signal Light */}
            <div
              className={`w-4 h-4 rounded-full ${
                !indicator.signal || indicator.signal.toLowerCase() === 'neutral'
                  ? 'bg-gray-400'
                  : indicator.signal.toLowerCase() === 'buy'
                  ? 'bg-green-500'
                  : indicator.signal.toLowerCase() === 'sell'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
              }`}
              title={`Signal: ${indicator.signal || 'neutral'}`}
            ></div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Buy: {indicators.filter(([, ind]) => ind.signal?.toLowerCase() === 'buy').length}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Sell: {indicators.filter(([, ind]) => ind.signal?.toLowerCase() === 'sell').length}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Neutral: {indicators.filter(([, ind]) => ind.signal?.toLowerCase() === 'neutral' || !ind.signal).length}
              </span>
            </div>
          </div>
          <button
            onClick={fetchTechnicalAnalysis}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicators;