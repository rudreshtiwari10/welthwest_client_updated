/**
 * Top Stocks Grid - Clean UI
 *
 * Responsive grid for SHORT opportunities
 */

import React from 'react';
import { StockCardData } from '../../services/screenerService';
import StockCard from './StockCard';

interface TopStocksGridProps {
  stocks: StockCardData[];
  isLoading?: boolean;
  onStockClick?: (ticker: string) => void;
}

const SkeletonCard: React.FC = () => (
  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-6 bg-gray-800 rounded"></div>
        <div>
          <div className="h-4 w-16 bg-gray-800 rounded mb-1"></div>
          <div className="h-3 w-12 bg-gray-800 rounded"></div>
        </div>
      </div>
      <div className="h-6 w-10 bg-gray-800 rounded"></div>
    </div>
    <div className="h-1.5 bg-gray-800 rounded-full mb-3"></div>
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="h-4 bg-gray-800 rounded"></div>
      <div className="h-4 bg-gray-800 rounded"></div>
    </div>
    <div className="h-8 bg-gray-800 rounded"></div>
  </div>
);

const TopStocksGrid: React.FC<TopStocksGridProps> = ({
  stocks,
  isLoading,
  onStockClick
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-1">No SHORT opportunities found</div>
        <div className="text-gray-600 text-xs">
          No stocks meet the screening criteria for this timeframe
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
      {stocks.map((stock, index) => (
        <StockCard
          key={stock.ticker}
          stock={stock}
          rank={index + 1}
          onClick={onStockClick}
        />
      ))}
    </div>
  );
};

export default TopStocksGrid;
