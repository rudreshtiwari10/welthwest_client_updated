import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PatternAnalysisResult,
  AISuggestions,
  PositionCalculation,
  patternAnalysisService
} from '../services/patternAnalysisService';
import { tradeSimulatorService, SimulatedTrade } from '../services/tradeSimulatorService';
import { screenerService, Timeframe, StockCardData, TIMEFRAME_NAMES } from '../services/screenerService';
import StockSelector from '../components/MarketRegimeTrader/StockSelector';
import PatternAnalysisPanel from '../components/MarketRegimeTrader/PatternAnalysisPanel';
import RiskCalculatorPanel from '../components/MarketRegimeTrader/RiskCalculatorPanel';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MarketRegimeTraderPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Timeframe and screener state
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [screenedStocks, setScreenedStocks] = useState<StockCardData[]>([]);
  const [loadingScreener, setLoadingScreener] = useState(false);

  // Stock selection state
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Analysis state
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysisResult | null>(null);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestions | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Risk calculator state
  const [portfolioValue, setPortfolioValue] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [targets, setTargets] = useState<number[]>([0, 0, 0]);
  const [positionCalc, setPositionCalc] = useState<PositionCalculation | null>(null);

  // Trade logging state
  const [tradeNotes, setTradeNotes] = useState<string>('');
  const [tradeTags, setTradeTags] = useState<string[]>([]);
  const [loggingTrade, setLoggingTrade] = useState(false);
  const [tradeLogged, setTradeLogged] = useState<SimulatedTrade | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Fetch screened stocks from MTF Screener
   */
  useEffect(() => {
    const fetchScreenedStocks = async () => {
      setLoadingScreener(true);
      try {
        const result = await screenerService.getTopStocks(timeframe);
        if (result.status === 'success') {
          setScreenedStocks(result.top_stocks || []);
        }
      } catch (error) {
        console.error('Failed to fetch screened stocks:', error);
        setScreenedStocks([]);
      } finally {
        setLoadingScreener(false);
      }
    };

    fetchScreenedStocks();
  }, [timeframe]);

  /**
   * Handle stock selection and run analysis
   */
  const handleSelectStock = async (symbol: string, price: number) => {
    try {
      setSelectedStock(symbol);
      setCurrentPrice(price);
      setEntryPrice(price);
      setAnalysisLoading(true);
      setAnalysisError(null);
      setPatternAnalysis(null);
      setAISuggestions(null);

      // Check if stock is from screened stocks
      const screenedStock = screenedStocks.find(s => s.symbol === symbol);

      // If from screened stocks, pre-populate stop loss and targets
      if (screenedStock) {
        setStopLoss(screenedStock.stop_loss);
        setTargets([screenedStock.target_1, screenedStock.target_2 || 0, 0]);
      }

      // Run pattern analysis
      const analysis = await patternAnalysisService.analyzePatterns(symbol);
      setPatternAnalysis(analysis);

      // Get AI suggestions
      const suggestions = await patternAnalysisService.getAISuggestions(
        symbol,
        price,
        analysis.analysis_id
      );
      setAISuggestions(suggestions);

      // If not from screened stocks, use AI suggestions
      if (!screenedStock) {
        setStopLoss(suggestions.stop_loss);
        setTargets(suggestions.targets.map(t => t.price));
      }

    } catch (error: any) {
      console.error('Failed to analyze stock:', error);
      setAnalysisError(error.message || 'Failed to analyze stock');
    } finally {
      setAnalysisLoading(false);
    }
  };

  /**
   * Use AI suggestions for stop loss and targets
   */
  const handleUseAISuggestions = () => {
    if (aiSuggestions) {
      setStopLoss(aiSuggestions.stop_loss);
      setTargets(aiSuggestions.targets.map(t => t.price));
    }
  };

  /**
   * Calculate position size
   */
  const handleCalculatePosition = async () => {
    if (!portfolioValue || !riskPercent || !entryPrice || !stopLoss) {
      setValidationErrors(['Please fill in all required fields']);
      return;
    }

    if (stopLoss >= entryPrice) {
      setValidationErrors(['Stop loss must be below entry price']);
      return;
    }

    try {
      const calc = await patternAnalysisService.calculatePosition(
        portfolioValue,
        riskPercent,
        entryPrice,
        stopLoss
      );
      setPositionCalc(calc);
      setValidationErrors([]);
    } catch (error: any) {
      console.error('Failed to calculate position:', error);
      setValidationErrors([error.message || 'Failed to calculate position']);
    }
  };

  /**
   * Validate trade before logging
   */
  const validateTrade = (): boolean => {
    const errors: string[] = [];

    if (!selectedStock) errors.push('No stock selected');
    if (!positionCalc) errors.push('Position size not calculated');
    if (positionCalc && positionCalc.position_percent > 20) {
      errors.push('Position size exceeds 20% of portfolio (concentration risk)');
    }
    if (targets[0] > 0 && stopLoss < entryPrice) {
      const rr = (targets[0] - entryPrice) / (entryPrice - stopLoss);
      if (rr < 1.5) {
        errors.push(`Risk-reward ratio (${rr.toFixed(2)}) is below 1.5`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  /**
   * Log trade to simulator
   */
  const handleLogTrade = async () => {
    if (!isAuthenticated) {
      alert('Please login to log trades');
      return;
    }

    if (!validateTrade()) {
      return;
    }

    try {
      setLoggingTrade(true);

      const result = await tradeSimulatorService.logTrade({
        symbol: selectedStock!,
        entry_price: entryPrice,
        quantity: positionCalc!.quantity,
        stop_loss: stopLoss,
        targets: targets.filter(t => t > 0),
        portfolio_value: portfolioValue,
        risk_percent: riskPercent,
        pattern_analysis_id: patternAnalysis?.analysis_id,
        notes: tradeNotes,
        tags: tradeTags
      });

      setTradeLogged(result.trade);
      setShowConfirmation(true);

      // Reset form
      setTimeout(() => {
        setSelectedStock(null);
        setPatternAnalysis(null);
        setAISuggestions(null);
        setPositionCalc(null);
        setEntryPrice(0);
        setStopLoss(0);
        setTargets([0, 0, 0]);
        setTradeNotes('');
        setTradeTags([]);
      }, 3000);

    } catch (error: any) {
      console.error('Failed to log trade:', error);
      alert(error.message || 'Failed to log trade');
    } finally {
      setLoggingTrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI-Powered Market Regime Trader
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze patterns with 3-model AI, calculate optimal position size, and log trades to simulator
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Trading Timeframe</h3>
            {loadingScreener && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading stocks...
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {(['5m', '15m', '1h', '1d'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                disabled={loadingScreener}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  timeframe === tf
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="text-sm">{tf.toUpperCase()}</div>
                <div className="text-xs opacity-80">{TIMEFRAME_NAMES[tf]}</div>
              </button>
            ))}
          </div>
          {screenedStocks.length > 0 && (
            <div className="mt-2 text-xs text-center text-green-600 dark:text-green-400">
              ✓ {screenedStocks.length} stocks screened for {TIMEFRAME_NAMES[timeframe]}
            </div>
          )}
        </div>

        {/* Stock Selector */}
        <div className="mb-6">
          <StockSelector
            onSelectStock={handleSelectStock}
            loading={analysisLoading}
            screenedStocks={screenedStocks}
            timeframe={timeframe}
          />
        </div>

        {/* Error Display */}
        {analysisError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-400">{analysisError}</div>
            </div>
          </div>
        )}

        {/* Selected Stock Header */}
        {selectedStock && (
          <div className="mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedStock}</h2>
                <p className="text-sm opacity-90">Analysis in progress...</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">₹{currentPrice.toFixed(2)}</div>
                <div className="text-sm opacity-90">Current Price</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {selectedStock && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Panel: Pattern Analysis */}
            <PatternAnalysisPanel
              analysis={patternAnalysis}
              loading={analysisLoading}
            />

            {/* Right Panel: Risk Calculator */}
            <RiskCalculatorPanel
              portfolioValue={portfolioValue}
              riskPercent={riskPercent}
              entryPrice={entryPrice}
              stopLoss={stopLoss}
              targets={targets}
              positionCalc={positionCalc}
              aiSuggestions={aiSuggestions}
              onChange={(field, value) => {
                if (field === 'portfolioValue') setPortfolioValue(value);
                else if (field === 'riskPercent') setRiskPercent(value);
                else if (field === 'entryPrice') setEntryPrice(value);
                else if (field === 'stopLoss') setStopLoss(value);
                else if (field === 'targets') setTargets(value);
              }}
              onUseAISuggestions={handleUseAISuggestions}
              onCalculate={handleCalculatePosition}
            />
          </div>
        )}

        {/* Validation Warnings */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">Validation Warnings</h3>
                <ul className="space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="text-sm text-amber-700 dark:text-amber-300">• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Trade Summary & Logging */}
        {positionCalc && selectedStock && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Trade Summary & Logging</h2>

            {/* Trade Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">Stock</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedStock}</div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  {positionCalc.quantity} shares @ ₹{entryPrice.toFixed(2)}
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Investment</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  ₹{positionCalc.total_investment.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Max Risk: ₹{positionCalc.risk_amount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">AI Confidence</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {patternAnalysis?.combined_analysis.score || 0}/100
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  {patternAnalysis?.combined_analysis.signal || 'N/A'}
                </div>
              </div>
            </div>

            {/* Trade Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trade Notes (Optional)
              </label>
              <textarea
                value={tradeNotes}
                onChange={(e) => setTradeNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., Cup and Handle breakout with volume confirmation..."
              />
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['swing', 'intraday', 'breakout', 'reversal', 'momentum'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (tradeTags.includes(tag)) {
                        setTradeTags(tradeTags.filter(t => t !== tag));
                      } else {
                        setTradeTags([...tradeTags, tag]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      tradeTags.includes(tag)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Trade Button */}
            <button
              onClick={handleLogTrade}
              disabled={loggingTrade || !isAuthenticated}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingTrade ? 'Logging Trade...' : 'Log Trade to Simulator'}
            </button>

            {!isAuthenticated && (
              <p className="text-sm text-center text-amber-600 dark:text-amber-400 mt-2">
                Please login to log trades
              </p>
            )}
          </div>
        )}

        {/* Success Confirmation */}
        {showConfirmation && tradeLogged && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Trade Logged Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Trade ID: {tradeLogged.trade_id}
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tradeLogged.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tradeLogged.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Investment:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{tradeLogged.total_investment.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketRegimeTraderPage;
