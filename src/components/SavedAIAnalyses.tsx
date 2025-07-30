import React, { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { userDataService } from '../services/api';

interface AIAnalysisResult {
  id?: string;
  _id?: string;
  timestamp?: string;
  name?: string;
  ticker?: string;
  prediction?: {
    regime?: number;
    regime_name?: string;
    confidence?: number;
    probabilities?: Record<string, number>;
  };
  analysis?: {
    current_regime?: {
      regime?: number;
      regime_name?: string;
      confidence?: number;
    };
    technical_indicators?: Record<string, any>;
    market_conditions?: {
      trend_strength?: number;
      volatility_level?: string;
      momentum_score?: number;
    };
    recommendations?: {
      action?: string;
      reason?: string;
      risk_level?: string;
    };
  };
  [key: string]: any; // Allow any additional properties
}

const SavedAIAnalyses: React.FC = () => {
  const [analyses, setAnalyses] = useState<AIAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysisResult | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  const fetchAnalyses = async (skipCache = false) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🤖 Fetching AI analyses...', skipCache ? '(forced refresh)' : '');
      
      const response = await userDataService.getUserAIAnalyses();
      console.log('📡 API Response:', response);
      
      if (response.success && response.analyses) {
        console.log('✅ Raw analyses data:', response.analyses);
        console.log('📊 Number of analyses:', response.analyses.length);
        
        // Log each analysis structure for debugging
        response.analyses.forEach((analysis: any, index: number) => {
          console.log(`🔍 Analysis ${index}:`, {
            id: analysis.id,
            name: analysis.name,
            ticker: analysis.ticker,
            hasPrediction: !!analysis.prediction,
            hasAnalysis: !!analysis.analysis,
            structure: Object.keys(analysis)
          });
        });
        
        // NO FILTERING - Show ALL data regardless of structure
        console.log('🚀 Showing ALL analyses without any filtering');
        
        // Ensure all analyses have proper names
        const processedAnalyses = (response.analyses || []).map((analysis: any, index: number) => ({
          ...analysis,
          name: analysis.name || analysis.saved_name || analysis.strategy_name || `Analysis ${index + 1}`,
          ticker: analysis.ticker || analysis.symbol || 'Unknown'
        }));
        
        setAnalyses(processedAnalyses);
        if (response.analyses && response.analyses.length > 0) {
          setSelectedAnalysis(response.analyses[0]);
          console.log('🎯 Selected first analysis:', response.analyses[0]);
        }
      } else {
        console.log('❌ API response failed:', response);
        setError('Failed to load AI analyses');
      }
    } catch (error) {
      console.error('💥 Error fetching AI analyses:', error);
      setError('An error occurred while loading your AI analyses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleSelectAnalysis = (analysis: AIAnalysisResult) => {
    setSelectedAnalysis(analysis);
  };

  // Helper function to get color based on regime
  const getRegimeColor = (regime: number) => {
    switch (regime) {
      case 0: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'; // Bear
      case 1: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'; // Correction
      case 2: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'; // Bull
      case 3: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'; // Recovery
      case 4: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'; // Sideways
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('buy')) return 'text-green-600 dark:text-green-400';
    if (action.toLowerCase().includes('sell')) return 'text-red-600 dark:text-red-400';
    if (action.toLowerCase().includes('hold')) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Saved AI Analyses</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You haven't saved any AI analyses yet. Run an AI analysis and save it to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved AI Analyses</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your previously saved AI market analyses and predictions
            </p>
          </div>
          <button
            onClick={() => {
              setForceRefresh(Date.now());
              fetchAnalyses(true);
            }}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Sidebar with analyses list */}
        <div className="border-r border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
          {analyses.map((analysis, index) => (
            <div 
              key={analysis.id || analysis._id || `analysis-${index}`} 
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedAnalysis === analysis ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => handleSelectAnalysis(analysis)}
            >
              <h3 className="font-medium text-gray-900 dark:text-white">
                {analysis.name || analysis.saved_name || analysis.strategy_name || `${analysis.ticker || 'Unknown'} Analysis`}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {analysis.timestamp ? formatDate(analysis.timestamp) : 'No date'}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {analysis.ticker || 'Unknown'}
                </span>
                {analysis.prediction && analysis.prediction.regime !== undefined ? (
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getRegimeColor(analysis.prediction.regime)}`}>
                    {analysis.prediction.regime_name}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Data Available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main content area with selected analysis details */}
        <div className="col-span-2 p-6 max-h-[70vh] overflow-y-auto">
          {/* Debug Info */}
          {analyses.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Debug Info</h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Total analyses loaded: {analyses.length}
              </p>
              {selectedAnalysis && (
                <div className="mt-2">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Selected: {selectedAnalysis.name || 'Unnamed'} | 
                    Has prediction: {!!selectedAnalysis.prediction ? 'Yes' : 'No'} |
                    Has analysis: {!!selectedAnalysis.analysis ? 'Yes' : 'No'}
                  </p>
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className="mt-2 px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs"
                  >
                    {showRawData ? 'Hide' : 'Show'} Raw Data
                  </button>
                </div>
              )}
            </div>
          )}
          
          {selectedAnalysis ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedAnalysis.name || selectedAnalysis.saved_name || selectedAnalysis.strategy_name || `${selectedAnalysis.ticker || 'Unknown'} Analysis`}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ticker</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedAnalysis.ticker}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Analysis Date</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedAnalysis.timestamp ? formatDate(selectedAnalysis.timestamp) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ticker</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedAnalysis.ticker || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Analysis Date</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedAnalysis.timestamp ? formatDate(selectedAnalysis.timestamp) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Market Regime */}
              {selectedAnalysis.prediction && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Market Regime</h3>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium px-2.5 py-1 rounded ${getRegimeColor(selectedAnalysis.prediction.regime || 0)}`}>
                      {selectedAnalysis.prediction.regime_name}
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      Confidence: {((selectedAnalysis.prediction.confidence || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Regime Probabilities */}
                  {selectedAnalysis.prediction.probabilities && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regime Probabilities</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedAnalysis.prediction.probabilities).map(([regime, probability]) => (
                          <div key={regime} className="flex items-center">
                            <span className="w-24 text-xs text-gray-600 dark:text-gray-400">{regime}</span>
                            <div className="flex-grow">
                              <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                  className="absolute h-full bg-blue-500" 
                                  style={{ width: `${probability * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                              {(probability * 100).toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Market Conditions */}
              {selectedAnalysis.analysis?.market_conditions && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Market Conditions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Trend Strength</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(selectedAnalysis.analysis.market_conditions.trend_strength || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Volatility</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedAnalysis.analysis.market_conditions.volatility_level || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Momentum</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(selectedAnalysis.analysis.market_conditions.momentum_score || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedAnalysis.analysis?.recommendations && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h3>
                  <div className={`text-lg font-semibold ${getActionColor(selectedAnalysis.analysis.recommendations.action || '')} mb-2`}>
                    {selectedAnalysis.analysis.recommendations.action || 'N/A'}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {selectedAnalysis.analysis.recommendations.reason || 'N/A'}
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Risk Level:</span>
                    <span className="text-sm font-medium px-2.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      {selectedAnalysis.analysis.recommendations.risk_level || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select an analysis to view details</p>
            </div>
          )}
          
          {/* Raw Data Display */}
          {showRawData && selectedAnalysis && (
            <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Raw Data</h3>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-96">
                {JSON.stringify(selectedAnalysis, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedAIAnalyses; 