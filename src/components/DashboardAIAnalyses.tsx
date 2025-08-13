import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, CpuChipIcon, CalendarIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { userDataService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

import ParameterDisplayCard from './ParameterDisplayCard';

interface AIAnalysisData {
  id?: string;
  _id?: string;
  timestamp?: string;
  created_at?: string;
  name?: string;
  saved_name?: string;
  strategy_name?: string;
  ticker?: string;
  symbol?: string;
  model_version?: string;
  analysis_type?: string;
  timeframe?: string;
  prediction?: {
    regime?: number;
    regime_name?: string;
    confidence?: number;
    probabilities?: Record<string, number>;
    next_regime?: number;
    next_regime_name?: string;
    transition_probability?: number;
  };
  analysis?: {
    current_regime?: {
      regime?: number;
      regime_name?: string;
      confidence?: number;
      description?: string;
    };
    technical_indicators?: {
      sma_20?: number;
      sma_50?: number;
      ema_12?: number;
      ema_26?: number;
      rsi?: number;
      macd?: number;
      macd_signal?: number;
      bollinger_upper?: number;
      bollinger_lower?: number;
      atr?: number;
      volume_sma?: number;
      [key: string]: any;
    };
    market_conditions?: {
      trend_strength?: number;
      trend_direction?: string;
      volatility_level?: string;
      volatility_score?: number;
      momentum_score?: number;
      volume_trend?: string;
      support_level?: number;
      resistance_level?: number;
    };
    recommendations?: {
      action?: string;
      reason?: string;
      risk_level?: string;
      confidence?: string;
      entry_price?: number;
      exit_price?: number;
      stop_loss?: number;
      target_price?: number;
      time_horizon?: string;
    };
    risk_assessment?: {
      overall_risk?: string;
      factors?: string[];
      risk_score?: number;
      max_position_size?: number;
    };
  };
  market_data?: {
    current_price?: number;
    price_change?: number;
    price_change_percent?: number;
    volume?: number;
    market_cap?: number;
    pe_ratio?: number;
  };
  features?: Record<string, number>;
  model_confidence?: number;
  processing_time?: number;
  status?: string;
  // Display properties added by frontend processing
  display_name?: string;
  display_ticker?: string;
  display_id?: string;
  display_date?: string;
  is_manually_saved?: boolean;
  record_created_at?: string;
  record_user_id?: string;
  record_type?: string;
  [key: string]: any;
}

const DashboardAIAnalyses: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [analyses, setAnalyses] = useState<AIAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysisData | null>(null);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const fetchAnalyses = async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ User not authenticated, skipping AI analyses fetch');
      setError('Please log in to view your saved AI analyses');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🤖 Fetching saved AI analyses for user:', user.id);
      
      const response = await userDataService.getUserAIAnalyses();
      console.log('📡 AI Analysis API Response:', response);
      
      if (response.success && response.analyses) {
        console.log('✅ Raw analyses API response:', response);
        console.log('📊 Total number of analyses from API:', response.analyses.length);
        console.log('🔍 First analysis structure:', response.analyses[0]);
        
        // Extract and process the nested analysis_data, filtering only manually saved ones
        const processedAnalyses = response.analyses
          .map((record: any, index: number) => {
            console.log(`📋 Processing analysis ${index + 1}:`, record);
            
            // Extract the actual analysis data from the nested structure
            const analysis = record.analysis_data || record;
            console.log(`📊 Extracted analysis data:`, analysis);
            
            return {
              ...analysis,
              // Preserve record metadata
              record_created_at: record.created_at,
              record_user_id: record.user_id,
              record_type: record.type,
              // Display properties
              display_name: analysis.name || analysis.saved_name || analysis.strategy_name || `Analysis ${index + 1}`,
              display_ticker: analysis.ticker || analysis.symbol || 'Unknown',
              display_id: analysis.id || analysis._id || record._id || `analysis-${index}`,
              display_date: analysis.timestamp || analysis.created_at || record.created_at || new Date().toISOString(),
              // Add field to identify manual saves
              is_manually_saved: !!(analysis.name || analysis.saved_name || analysis.strategy_name)
            };
          })
          .filter((analysis: any) => {
            // Only show manually saved analyses (those with custom names)
            const hasCustomName = analysis.is_manually_saved;
            const isNotAutoGenerated = !analysis.display_name.includes('Analysis ') || 
                                     (analysis.name && analysis.name.trim() && !analysis.name.match(/^Analysis \d+$/));
            
            console.log(`🔍 Analysis "${analysis.display_name}" - Manually saved: ${hasCustomName}, Not auto-generated: ${isNotAutoGenerated}`);
            
            return hasCustomName && isNotAutoGenerated;
          });
        
        console.log(`✅ After filtering: ${processedAnalyses.length} manually saved analyses out of ${response.analyses.length} total`);
        console.log('🎯 Filtered analyses:', processedAnalyses.map((a: AIAnalysisData) => ({ name: a.display_name, ticker: a.display_ticker, manually_saved: a.is_manually_saved })));
        
        setAnalyses(processedAnalyses);
        // Don't auto-select on mobile, only on desktop
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        if (processedAnalyses.length > 0 && !isMobile) {
          setSelectedAnalysis(processedAnalyses[0]);
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return `${(value * 100).toFixed(0)}%`;
  };

  const getRegimeColor = (regime: number | undefined) => {
    if (regime === undefined) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    switch (regime) {
      case 0: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'; // Bear
      case 1: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'; // Correction
      case 2: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'; // Bull
      case 3: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'; // Recovery
      case 4: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'; // Sideways
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRiskLevelColor = (riskLevel: string | undefined) => {
    if (!riskLevel) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getActionColor = (action: string | undefined) => {
    if (!action) return 'text-gray-600 dark:text-gray-400';
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
        <button
          onClick={fetchAnalyses}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <CpuChipIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Saved AI Analyses</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {user ? 
            `Welcome ${user.username}! You haven't manually saved any AI analyses yet. Run an AI analysis on WelthAI and save it with a custom name to see it here.` :
            'Please log in to view your manually saved AI analyses.'
          }
        </p>
        {user && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            User ID: {user.id}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manually Saved AI Analyses</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user ? `${user.username}'s manually saved AI market analyses and predictions` : 'View your manually saved AI analyses'}
            </p>
            {user && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                User ID: {user.id}
              </p>
            )}
          </div>
          <button
            onClick={fetchAnalyses}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="lg:hidden mb-6 p-4">
        <div className="relative">
          <button
            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedAnalysis ? selectedAnalysis.display_name : 'Select an AI Analysis'}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isMobileDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isMobileDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {analyses.map((analysis, index) => (
                <div
                  key={analysis.display_id}
                  className="p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    setSelectedAnalysis(analysis);
                    setIsMobileDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {analysis.display_name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {analysis.display_ticker}
                        </span>
                        <div className="flex items-center gap-2">
                          {analysis.prediction?.regime !== undefined && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${getRegimeColor(analysis.prediction.regime)}`}>
                              {analysis.prediction.regime_name || `Regime ${analysis.prediction.regime}`}
                            </span>
                          )}
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Desktop Sidebar with analysis list */}
        <div className="hidden lg:block border-r border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
          {analyses.map((analysis, index) => (
            <div
              key={analysis.display_id}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedAnalysis === analysis ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
              onClick={() => setSelectedAnalysis(analysis)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {analysis.display_name}
                </h3>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(analysis.display_date || new Date().toISOString())}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {analysis.display_ticker}
                </span>
                {analysis.prediction?.regime !== undefined && (
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getRegimeColor(analysis.prediction.regime)}`}>
                    {analysis.prediction.regime_name || `Regime ${analysis.prediction.regime}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="col-span-1 lg:col-span-3 p-4 md:p-6 lg:max-h-[70vh] overflow-y-auto">
          {selectedAnalysis ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedAnalysis.display_name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(selectedAnalysis.display_date || new Date().toISOString())}
                  </div>
                  <div className="flex items-center">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    {selectedAnalysis.display_ticker}
                  </div>
                  {selectedAnalysis.status && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedAnalysis.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {selectedAnalysis.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Market Regime Prediction */}
              {selectedAnalysis.prediction && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CpuChipIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Market Regime Prediction
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`inline-block px-4 py-2 rounded-lg text-lg font-bold break-words ${getRegimeColor(selectedAnalysis.prediction.regime)}`}>
                        {selectedAnalysis.prediction.regime_name || `Regime ${selectedAnalysis.prediction.regime}`}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Current Regime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatPercentage(selectedAnalysis.prediction.confidence)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Confidence</div>
                    </div>
                    {selectedAnalysis.prediction.next_regime !== undefined && (
                      <div className="text-center">
                        <div className={`inline-block px-3 py-1 rounded text-sm font-medium break-words ${getRegimeColor(selectedAnalysis.prediction.next_regime)}`}>
                          {selectedAnalysis.prediction.next_regime_name || `Regime ${selectedAnalysis.prediction.next_regime}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Next Predicted</div>
                      </div>
                    )}
                  </div>

                  {/* Regime Probabilities */}
                  {selectedAnalysis.prediction.probabilities && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Regime Probabilities</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedAnalysis.prediction.probabilities).map(([regime, probability]) => (
                          <div key={regime} className="flex items-center">
                            <span className="w-24 md:w-32 text-xs text-gray-600 dark:text-gray-400 capitalize truncate" title={regime.replace('_', ' ')}>
                              {regime.replace('_', ' ')}
                            </span>
                            <div className="flex-grow mx-3">
                              <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                  className="absolute h-full bg-purple-500 transition-all duration-300" 
                                  style={{ width: `${(probability as number) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
                              {formatPercentage(probability as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Market Data */}
              {selectedAnalysis.market_data && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <div className="w-1 h-6 bg-green-500 rounded mr-3"></div>
                    Market Data
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    <ParameterDisplayCard
                      label="Current Price"
                      value={selectedAnalysis.market_data.current_price}
                      format="currency"
                      size="medium"
                      colorScheme="info"
                    />
                    <ParameterDisplayCard
                      label="Price Change"
                      value={selectedAnalysis.market_data.price_change}
                      format="currency"
                      size="medium"
                    />
                    <ParameterDisplayCard
                      label="Change %"
                      value={selectedAnalysis.market_data.price_change_percent}
                      format="percentage"
                      size="medium"
                    />
                    <ParameterDisplayCard
                      label="Volume"
                      value={selectedAnalysis.market_data.volume}
                      format="number"
                      size="medium"
                      colorScheme="info"
                    />
                    <ParameterDisplayCard
                      label="Market Cap"
                      value={selectedAnalysis.market_data.market_cap}
                      format="currency"
                      size="medium"
                      colorScheme="info"
                    />
                    <ParameterDisplayCard
                      label="P/E Ratio"
                      value={selectedAnalysis.market_data.pe_ratio}
                      format="decimal"
                      size="medium"
                      colorScheme="info"
                    />
                  </div>
                </div>
              )}

              {/* Technical Indicators section removed as requested */}

              {/* Market Conditions */}
              {selectedAnalysis.analysis?.market_conditions && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Conditions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Trend Strength', value: selectedAnalysis.analysis.market_conditions.trend_strength?.toFixed(2) },
                      { label: 'Trend Direction', value: selectedAnalysis.analysis.market_conditions.trend_direction },
                      { label: 'Volatility Level', value: selectedAnalysis.analysis.market_conditions.volatility_level },
                      { label: 'Volatility Score', value: selectedAnalysis.analysis.market_conditions.volatility_score?.toFixed(2) },
                      { label: 'Momentum Score', value: selectedAnalysis.analysis.market_conditions.momentum_score?.toFixed(2) },
                      { label: 'Volume Trend', value: selectedAnalysis.analysis.market_conditions.volume_trend },
                      { label: 'Support Level', value: formatCurrency(selectedAnalysis.analysis.market_conditions.support_level) },
                      { label: 'Resistance Level', value: formatCurrency(selectedAnalysis.analysis.market_conditions.resistance_level) },
                    ].filter(item => item.value && item.value !== 'N/A').map((item, index) => (
                      <div key={index} className="bg-white dark:bg-gray-600 p-3 rounded border">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedAnalysis.analysis?.recommendations && (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                    Trading Recommendations
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <div className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${getActionColor(selectedAnalysis.analysis.recommendations.action)}`}>
                          {selectedAnalysis.analysis.recommendations.action || 'No Action'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recommended Action</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Risk Level</div>
                          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getRiskLevelColor(selectedAnalysis.analysis.recommendations.risk_level)}`}>
                            {selectedAnalysis.analysis.recommendations.risk_level || 'Unknown'}
                          </span>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Confidence</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {selectedAnalysis.analysis.recommendations.confidence || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Time Horizon</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {selectedAnalysis.analysis.recommendations.time_horizon || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Targets</h4>
                      <div className="space-y-2">
                        {[
                          { label: 'Entry Price', value: formatCurrency(selectedAnalysis.analysis.recommendations.entry_price) },
                          { label: 'Target Price', value: formatCurrency(selectedAnalysis.analysis.recommendations.target_price) },
                          { label: 'Stop Loss', value: formatCurrency(selectedAnalysis.analysis.recommendations.stop_loss) },
                          { label: 'Exit Price', value: formatCurrency(selectedAnalysis.analysis.recommendations.exit_price) },
                        ].filter(item => item.value !== 'N/A').map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {selectedAnalysis.analysis.recommendations.reason && (
                    <div className="mt-4 p-4 bg-white dark:bg-gray-600 rounded border">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reasoning</div>
                      <p className="text-gray-700 dark:text-gray-300">{selectedAnalysis.analysis.recommendations.reason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Risk Assessment */}
              {selectedAnalysis.analysis?.risk_assessment && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-600" />
                    Risk Assessment
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${getRiskLevelColor(selectedAnalysis.analysis.risk_assessment.overall_risk)}`}>
                        {selectedAnalysis.analysis.risk_assessment.overall_risk || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overall Risk</div>
                    </div>
                    
                    {selectedAnalysis.analysis.risk_assessment.risk_score !== undefined && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {selectedAnalysis.analysis.risk_assessment.risk_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Risk Score</div>
                      </div>
                    )}
                    
                    {selectedAnalysis.analysis.risk_assessment.max_position_size !== undefined && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPercentage(selectedAnalysis.analysis.risk_assessment.max_position_size)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Max Position Size</div>
                      </div>
                    )}
                  </div>
                  
                  {selectedAnalysis.analysis.risk_assessment.factors && selectedAnalysis.analysis.risk_assessment.factors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Risk Factors</h4>
                      <div className="space-y-2">
                        {selectedAnalysis.analysis.risk_assessment.factors.map((factor, index) => (
                          <div key={index} className="flex items-center p-2 bg-white dark:bg-gray-600 rounded border">
                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Removed Analysis Details section as requested */}

            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full min-h-[200px] text-center">
              <CpuChipIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                <span className="lg:hidden">Use the dropdown above to select an analysis</span>
                <span className="hidden lg:inline">Select an analysis to view details</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAIAnalyses;