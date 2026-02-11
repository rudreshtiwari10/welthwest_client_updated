import React, { useState } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface ScreenedStock {
  symbol: string;
  entry: number;
  direction: 'LONG' | 'SHORT' | 'HOLD';
  score: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  rr_ratio: number;
}

interface StockSelectorProps {
  onSelectStock: (symbol: string, currentPrice: number) => void;
  loading: boolean;
  screenedStocks?: ScreenedStock[];
  timeframe?: string;
}

const POPULAR_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450.50 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3890.25 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1650.75 },
  { symbol: 'INFY', name: 'Infosys', price: 1520.30 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1085.40 },
  { symbol: 'SBIN', name: 'State Bank of India', price: 625.85 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1145.60 },
  { symbol: 'ITC', name: 'ITC Limited', price: 465.20 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1785.90 },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 3456.75 }
];

const StockSelector: React.FC<StockSelectorProps> = ({
  onSelectStock,
  loading,
  screenedStocks,
  timeframe
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Use screened stocks if available, otherwise use popular stocks
  const availableStocks = screenedStocks && screenedStocks.length > 0
    ? screenedStocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.symbol,
        price: stock.entry,
        direction: stock.direction,
        score: stock.score,
        stop_loss: stock.stop_loss,
        target_1: stock.target_1,
        rr_ratio: stock.rr_ratio
      }))
    : POPULAR_STOCKS.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price
      }));

  const filteredStocks = availableStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectStock = (stock: any) => {
    onSelectStock(stock.symbol, stock.price);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Stock to Analyze</h2>
        {screenedStocks && screenedStocks.length > 0 && (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
            {screenedStocks.length} Screened for {timeframe?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search stock symbol or name..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && filteredStocks.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {filteredStocks.map((stock: any) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelectStock(stock)}
                disabled={loading}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</div>
                      {stock.score && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          stock.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          stock.score >= 70 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          Score: {stock.score}
                        </span>
                      )}
                      {stock.direction && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          stock.direction === 'LONG' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          stock.direction === 'SHORT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {stock.direction}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stock.name}</div>
                    {stock.rr_ratio && (
                      <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                        R:R Ratio: <span className="font-semibold text-primary-600 dark:text-primary-400">{stock.rr_ratio.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold text-gray-900 dark:text-white">₹{stock.price.toFixed(2)}</div>
                    {stock.stop_loss && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        SL: ₹{stock.stop_loss.toFixed(2)}
                      </div>
                    )}
                    {stock.target_1 && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        T1: ₹{stock.target_1.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Screened or Popular Stocks Quick Select */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {screenedStocks && screenedStocks.length > 0 ? 'Top Screened Stocks' : 'Popular Stocks'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {(screenedStocks && screenedStocks.length > 0
            ? screenedStocks.slice(0, 10).map(stock => ({
                symbol: stock.symbol,
                name: stock.symbol,
                price: stock.entry,
                score: stock.score,
                direction: stock.direction
              }))
            : POPULAR_STOCKS.slice(0, 10)
          ).map((stock: any) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelectStock(stock)}
              disabled={loading}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{stock.symbol}</div>
                {stock.score && (
                  <span className={`text-xs font-bold ${
                    stock.score >= 80 ? 'text-green-600 dark:text-green-400' :
                    stock.score >= 70 ? 'text-blue-600 dark:text-blue-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {stock.score}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">₹{stock.price.toFixed(0)}</div>
              {stock.direction && (
                <div className={`text-xs font-semibold mt-1 ${
                  stock.direction === 'LONG' ? 'text-green-600 dark:text-green-400' :
                  stock.direction === 'SHORT' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {stock.direction}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          {screenedStocks && screenedStocks.length > 0 ? (
            <>
              🎯 <strong>{screenedStocks.length} stocks screened</strong> for {timeframe?.toUpperCase()} timeframe. Select one to run AI pattern analysis and calculate optimal position size.
            </>
          ) : (
            <>
              💡 Select a stock to run AI pattern analysis and calculate optimal position size for your trade.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default StockSelector;
