/**
 * Stock Card Component - Clean UI
 *
 * Compact card showing SHORT opportunity details
 */

import React from 'react';
import { StockCardData } from '../../services/screenerService';

interface StockCardProps {
  stock: StockCardData;
  rank: number;
  onClick?: (ticker: string) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, rank, onClick }) => {
  const shortScore = stock.short_score || stock.score || 0;
  const gatesPassed = stock.gates_passed || 0;

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400 bg-red-500/20';
    if (score >= 70) return 'text-orange-400 bg-orange-500/20';
    if (score >= 60) return 'text-amber-400 bg-amber-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  return (
    <div
      onClick={() => onClick?.(stock.ticker)}
      className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group"
    >
      {/* Header: Rank + Symbol + Score */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-mono">#{rank}</span>
          <div>
            <h3 className="text-white font-semibold text-sm group-hover:text-red-400 transition-colors">
              {stock.symbol}
            </h3>
            <span className="text-xs text-gray-600">{stock.sector}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(shortScore)}`}>
          {shortScore}
        </div>
      </div>

      {/* Score Bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
            style={{ width: `${Math.min(shortScore, 100)}%` }}
          />
        </div>
      </div>

      {/* Volume & Momentum - Compact */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Vol</span>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${stock.volume_bar || 0}%` }} />
          </div>
          <span className="text-gray-500 w-6 text-right">{stock.volume_bar || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Mom</span>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${stock.momentum_bar || 0}%` }} />
          </div>
          <span className="text-gray-500 w-6 text-right">{stock.momentum_bar || 0}</span>
        </div>
      </div>

      {/* Pattern & Signal */}
      <div className="space-y-1 text-xs border-t border-gray-800 pt-3">
        {stock.pattern && stock.pattern !== 'None' && (
          <div className="flex items-start gap-2">
            <span className="text-gray-600 shrink-0">Pattern:</span>
            <span className="text-gray-400">{stock.pattern}</span>
          </div>
        )}
        {stock.short_signal && stock.short_signal !== 'None' && (
          <div className="flex items-start gap-2">
            <span className="text-red-600 shrink-0">Signal:</span>
            <span className="text-red-400">{stock.short_signal.replace(/_/g, ' ')}</span>
          </div>
        )}
      </div>

      {/* Footer: Gates + Regime */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
        {/* Gates */}
        {gatesPassed > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((g) => (
              <span
                key={g}
                className={`w-3 h-3 rounded-full text-[8px] flex items-center justify-center ${
                  gatesPassed >= g ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-600'
                }`}
              >
                {g}
              </span>
            ))}
            <span className={`text-xs ml-1 ${
              gatesPassed === 3 ? 'text-red-400' : gatesPassed === 2 ? 'text-amber-400' : 'text-gray-500'
            }`}>
              {gatesPassed === 3 ? 'Strong' : gatesPassed === 2 ? 'Mod' : 'Weak'}
            </span>
          </div>
        )}

        {/* Regime Badge */}
        <span className="text-[10px] text-gray-500">
          {stock.regime?.replace(' Trend', '').replace(' Volatility', '')}
        </span>
      </div>
    </div>
  );
};

export default StockCard;
