import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface StockSymbolSelectorProps {
  onSymbolSelect: (symbol: string) => void;
  placeholder?: string;
  className?: string;
}

const StockSymbolSelector: React.FC<StockSymbolSelectorProps> = ({
  onSymbolSelect,
  placeholder = "Enter stock symbol (e.g., RELIANCE, TCS)",
  className = ""
}) => {
  const [symbol, setSymbol] = useState('');
  const [suggestions] = useState([
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 
    'TATASTEEL', 'SBIN', 'HINDUNILVR', 'ITC', 'KOTAKBANK',
    'LT', 'BHARTIARTL', 'ASIANPAINT', 'MARUTI', 'AXISBANK'
  ]);

  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);

    if (value.length > 0) {
      const filtered = suggestions.filter(s => 
        s.startsWith(value)
      ).slice(0, 6);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSymbol(suggestion);
    setShowSuggestions(false);
    onSymbolSelect(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSymbolSelect(symbol.trim());
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={symbol}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => symbol.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default StockSymbolSelector;