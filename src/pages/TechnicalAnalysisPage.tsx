import React, { useState } from 'react';
import TechnicalIndicators from '../components/TechnicalIndicators';
import StockSymbolSelector from '../components/StockSymbolSelector';
import { ChartPieIcon, SparklesIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

const TechnicalAnalysisPage: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    setShowAnalysis(true);
  };

  const popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank' },
    { symbol: 'TATASTEEL', name: 'Tata Steel' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <ChartPieIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Technical Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get comprehensive technical indicators and trading signals for any stock with 
            color-coded buy/sell/neutral recommendations.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                <ArrowUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Buy Signals</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Green indicators show bullish momentum and potential buying opportunities based on technical analysis.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                <ArrowDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sell Signals</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Red indicators suggest bearish trends and potential selling opportunities in the market.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                <MinusIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Neutral Signals</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Gray indicators show sideways movement with no clear directional bias.
            </p>
          </div>
        </div>

        {/* Stock Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Select a Stock to Analyze
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a stock symbol or choose from popular stocks below
            </p>
          </div>

          <div className="max-w-md mx-auto mb-6">
            <StockSymbolSelector
              onSymbolSelect={handleStockSelect}
              placeholder="Enter stock symbol (e.g., RELIANCE, TCS)"
              className="w-full"
            />
          </div>

          {/* Popular Stocks */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Popular Stocks
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {popularStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock.symbol)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {stock.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {showAnalysis && selectedStock && (
          <div className="mb-8">
            <TechnicalIndicators 
              ticker={selectedStock} 
              className="w-full"
            />
          </div>
        )}

        {/* Additional Features */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <div className="text-center">
            <SparklesIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Advanced Features Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Get even more insights with our AI-powered analysis, backtesting capabilities, 
              and interactive chatbot for personalized trading advice.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/welthai"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                AI Analysis
              </a>
              <a
                href="/backtest-beta"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Backtesting
              </a>
              <a
                href="/WelthAiChatBot-lanching-soon"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                AI Chatbot
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisPage;