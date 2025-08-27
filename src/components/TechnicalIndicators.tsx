import React, { useState, useEffect } from 'react';
import { marketService } from '../services/api';
import { ChartBarIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface TechnicalIndicator {
  value?: number | string | any;
  signal?: 'buy' | 'sell' | 'neutral' | string;
  description?: string;
  current?: number | any;
  dates?: string[];
  values?: number[];
  // Additional possible fields from API
  current_value?: number | string;
  recommendation?: string;
  action?: string;
  status?: string;
  signal_reason?: string;
  signal_strength?: string;
  trend?: string;
  strength?: string;
}

interface TechnicalAnalysisData {
  ticker?: string;
  timestamp?: string;
  indicators?: { [indicatorName: string]: TechnicalIndicator };
  signals?: { [signalName: string]: any };
  summary?: {
    overall_signal?: string;
    signal_strength?: string;
    consensus_ratio?: number;
    total_indicators?: number;
  };
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
      console.log('API URL:', `${process.env.REACT_APP_API_URL || 'https://stock-market-api.onrender.com/api'}/technical-analysis?ticker=${ticker}`);
      
      const response = await marketService.getTechnicalAnalysis(ticker);
      console.log('API Response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Additional debugging for nested structure
      if (response && typeof response === 'object') {
        console.log('Response has indicators:', !!response.indicators);
        console.log('Response has signals:', !!response.signals);
        console.log('Response has summary:', !!response.summary);
        if (response.indicators) {
          console.log('Indicators keys:', Object.keys(response.indicators));
          console.log('Sample indicator data:', Object.values(response.indicators)[0]);
        }
        if (response.signals) {
          console.log('Signals keys:', Object.keys(response.signals));
          console.log('Overall signal:', response.signals.overall);
        }
        if (response.summary) {
          console.log('Summary data:', response.summary);
        }
      }
      
      setData(response);
    } catch (err) {
      console.error('Technical Analysis Error:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        ticker: ticker
      });
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
    if (rawData.current !== undefined) {
      normalized.value = rawData.current;
    } else if (rawData.value !== undefined) {
      normalized.value = rawData.value;
    } else if (rawData.current_value !== undefined) {
      normalized.value = rawData.current_value;
    } else if (rawData.price !== undefined) {
      normalized.value = rawData.price;
    } else if (rawData.level !== undefined) {
      normalized.value = rawData.level;
    } else if (rawData.val !== undefined) {
      normalized.value = rawData.val;
    } else {
      normalized.value = 'N/A';
    }
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
    normalized.description = rawData.description || rawData.desc || rawData.message || rawData.text || rawData.signal_reason || '';
    
    // Extract additional fields
    if (rawData.signal_strength) normalized.signal_strength = rawData.signal_strength;
    if (rawData.trend) normalized.trend = rawData.trend;
    if (rawData.strength) normalized.strength = rawData.strength;
    if (rawData.dates) normalized.dates = rawData.dates;
    if (rawData.values) normalized.values = rawData.values;
    
    console.log('Final normalized data:', normalized);
    return normalized;
  };

  const formatValue = (value: number | string | any): string => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'object') {
      // Handle complex values like MACD data
      if (value.macd !== undefined) {
        return `MACD: ${value.macd?.toFixed(4) || 'N/A'}`;
      }
      if (value.k !== undefined && value.d !== undefined) {
        return `K: ${value.k?.toFixed(2) || 'N/A'}, D: ${value.d?.toFixed(2) || 'N/A'}`;
      }
      if (value.upper !== undefined && value.lower !== undefined) {
        return `Upper: ${value.upper?.toFixed(2) || 'N/A'}, Lower: ${value.lower?.toFixed(2) || 'N/A'}`;
      }
      return JSON.stringify(value);
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
                    console.log('Response structure analysis:');
                    console.log('- Has indicators:', !!response?.indicators);
                    console.log('- Has signals:', !!response?.signals);
                    console.log('- Has summary:', !!response?.summary);
                    console.log('- Top level keys:', Object.keys(response || {}));
                    if (response?.indicators) {
                      console.log('- Indicator keys:', Object.keys(response.indicators));
                      console.log('- Sample indicator:', Object.values(response.indicators)[0]);
                    }
                    alert('Check console for detailed response analysis');
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
            <button
              onClick={() => {
                console.log('Current component state:');
                console.log('- Data:', data);
                console.log('- Loading:', loading);
                console.log('- Error:', error);
                console.log('- Ticker:', ticker);
                alert('Check console for component state');
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Debug State
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
  console.log('Data type:', typeof data);
  console.log('Data keys:', data ? Object.keys(data) : 'No data');
  
  try {
    if (typeof data === 'object' && data !== null) {
      console.log('Data is object, keys:', Object.keys(data));
      
      // If data has a nested structure with indicators (new API format)
      if (data.indicators && typeof data.indicators === 'object') {
        console.log('Processing as nested indicators object');
        console.log('Indicators object keys:', Object.keys(data.indicators));
        indicators = Object.entries(data.indicators).map(([name, rawData]) => {
          console.log(`Processing nested indicator ${name}:`, rawData);
          const normalized = normalizeIndicatorData(rawData);
          console.log(`Normalized nested ${name}:`, normalized);
          return [name, normalized];
        });
      }
      // If data is directly the indicators object (legacy format)
      else if (Object.keys(data).length > 0 && typeof Object.values(data)[0] === 'object') {
        console.log('Processing as direct indicators object');
        indicators = Object.entries(data).map(([name, rawData]) => {
          console.log(`Processing direct indicator ${name}:`, rawData);
          const normalized = normalizeIndicatorData(rawData);
          console.log(`Normalized direct ${name}:`, normalized);
          return [name, normalized];
        });
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
  } catch (error) {
    console.error('Error processing technical analysis data:', error);
    console.error('Data that caused error:', data);
    // Set indicators to empty array to prevent crash
    indicators = [];
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
        
        {/* Raw Data Display for Debugging */}
        {data && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
            <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Raw API Response:</h4>
            <div className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
              <div><strong>Response Type:</strong> {typeof data}</div>
              <div><strong>Top Level Keys:</strong> {Object.keys(data).join(', ')}</div>
              {data.indicators && (
                <div><strong>Indicators Keys:</strong> {Object.keys(data.indicators).join(', ')}</div>
              )}
              {data.signals && (
                <div><strong>Signals Keys:</strong> {Object.keys(data.signals).join(', ')}</div>
              )}
              {data.summary && (
                <div><strong>Summary:</strong> {JSON.stringify(data.summary)}</div>
              )}
            </div>
          </div>
        )}
        
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

      {/* Summary Section - Show overall analysis */}
      {data.summary && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2" />
            Analysis Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.overall_signal?.toUpperCase() || 'NEUTRAL'}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Overall Signal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.signal_strength?.toUpperCase() || 'WEAK'}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Strength</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.consensus_ratio ? `${(data.summary.consensus_ratio * 100).toFixed(0)}%` : '0%'}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Consensus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.total_indicators || indicators.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Indicators</div>
            </div>
          </div>
          {data.timestamp && (
            <div className="text-center mt-3 text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Indicator Display */}
      <div className="space-y-3">
        {indicators.map(([indicatorName, indicator]) => (
          <div
            key={indicatorName}
            className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {/* Indicator Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-gray-900 dark:text-white text-lg">
                  {indicatorName.toUpperCase()}
                </span>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getSignalBadgeClass(indicator.signal)}`}
                >
                  {indicator.signal?.toUpperCase() || 'NEUTRAL'}
                </div>
              </div>
              
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
            
            {/* Indicator Details */}
            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Value Display */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</div>
                  <div className="text-lg font-mono text-gray-900 dark:text-white">
                    {formatValue(indicator.value)}
                  </div>
                </div>
                
                {/* Additional Info */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Details</div>
                  <div className="text-sm text-gray-900 dark:text-white space-y-1">
                    {indicator.trend && (
                      <div><span className="font-medium">Trend:</span> {indicator.trend}</div>
                    )}
                    {indicator.signal_strength && (
                      <div><span className="font-medium">Strength:</span> {indicator.signal_strength}</div>
                    )}
                    {indicator.strength && (
                      <div><span className="font-medium">Strength:</span> {indicator.strength}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {indicator.description && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Analysis</div>
                  <div className="text-sm text-gray-900 dark:text-white italic">
                    {indicator.description}
                  </div>
                </div>
              )}
            </div>
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