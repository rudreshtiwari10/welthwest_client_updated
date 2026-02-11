import React from 'react';
import { AISuggestions, PositionCalculation } from '../../services/patternAnalysisService';
import { SparklesIcon, CalculatorIcon } from '@heroicons/react/24/outline';

interface RiskCalculatorPanelProps {
  portfolioValue: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  targets: number[];
  positionCalc: PositionCalculation | null;
  aiSuggestions: AISuggestions | null;
  onChange: (field: string, value: any) => void;
  onUseAISuggestions: () => void;
  onCalculate: () => void;
}

const RiskCalculatorPanel: React.FC<RiskCalculatorPanelProps> = ({
  portfolioValue,
  riskPercent,
  entryPrice,
  stopLoss,
  targets,
  positionCalc,
  aiSuggestions,
  onChange,
  onUseAISuggestions,
  onCalculate
}) => {
  const calculateRiskReward = (target: number) => {
    if (stopLoss >= entryPrice) return 0;
    const risk = entryPrice - stopLoss;
    const reward = target - entryPrice;
    return reward / risk;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <CalculatorIcon className="w-6 h-6 mr-2 text-primary-600" />
        Risk Calculator
      </h2>

      {/* Step 1: Portfolio Information */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Portfolio Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Portfolio Value (₹)
            </label>
            <input
              type="number"
              value={portfolioValue}
              onChange={(e) => onChange('portfolioValue', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Risk Per Trade (%)
            </label>
            <input
              type="number"
              value={riskPercent}
              onChange={(e) => onChange('riskPercent', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="2"
              min="0.1"
              max="10"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Trade Setup */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Trade Setup</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Entry Price (₹)
            </label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => onChange('entryPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="2450.50"
              step="0.01"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Stop Loss (₹)
              </label>
              {aiSuggestions && (
                <button
                  onClick={onUseAISuggestions}
                  className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center"
                >
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  Use AI Suggestion
                </button>
              )}
            </div>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => onChange('stopLoss', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="2400.00"
              step="0.01"
            />
            {stopLoss > 0 && entryPrice > 0 && stopLoss < entryPrice && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Loss: {(((entryPrice - stopLoss) / entryPrice) * 100).toFixed(2)}% | ₹{(entryPrice - stopLoss).toFixed(2)} per share
              </p>
            )}
            {aiSuggestions && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                AI suggests: ₹{aiSuggestions.stop_loss.toFixed(2)} ({aiSuggestions.stop_loss_reason})
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Targets (₹)
              </label>
              {aiSuggestions && (
                <button
                  onClick={() => {
                    const aiTargets = aiSuggestions.targets.map(t => t.price);
                    onChange('targets', aiTargets);
                  }}
                  className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center"
                >
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  Use AI Targets
                </button>
              )}
            </div>
            {targets.map((target, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">T{idx + 1}:</span>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => {
                      const newTargets = [...targets];
                      newTargets[idx] = parseFloat(e.target.value) || 0;
                      onChange('targets', newTargets);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`Target ${idx + 1}`}
                    step="0.01"
                  />
                  {target > entryPrice && stopLoss < entryPrice && (
                    <span className="text-xs text-green-600 dark:text-green-400 w-16">
                      R:R {calculateRiskReward(target).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {aiSuggestions && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                AI suggests: {aiSuggestions.targets.map(t => `₹${t.price.toFixed(2)} (${t.rr_ratio.toFixed(1)}R)`).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={onCalculate}
        className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all mb-6"
      >
        Calculate Position Size
      </button>

      {/* Step 3: Position Sizing Results */}
      {positionCalc && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Position Sizing</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Quantity</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {positionCalc.quantity}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">shares</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Investment</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ₹{positionCalc.total_investment.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {positionCalc.position_percent.toFixed(2)}% of portfolio
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Max Risk</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{positionCalc.risk_amount.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {riskPercent}% of portfolio
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Breakeven</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{positionCalc.breakeven_price.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">including fees</div>
            </div>
          </div>

          {/* Potential Gains */}
          {targets.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Potential Gains</h4>
              <div className="space-y-2">
                {targets.map((target, idx) => {
                  if (target <= entryPrice) return null;
                  const gain = (target - entryPrice) * positionCalc.quantity;
                  const gainPercent = ((target - entryPrice) / entryPrice) * 100;
                  const rr = calculateRiskReward(target);

                  return (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Target {idx + 1}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          +₹{gain.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{gainPercent.toFixed(2)}% | R:R {rr.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskCalculatorPanel;
