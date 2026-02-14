import React, { useState, useEffect } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { marketService } from '../services/api';

const StockPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendingStocks, setTrendingStocks] = useState<any>({ gainers: [], losers: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const trendingData = await marketService.getTrendingStocks();
        setTrendingStocks(trendingData);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-8 pt-20 md:pt-8">
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-8 pt-20 md:pt-8">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-8 pt-20 md:pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Stock Market Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Top performing stocks and market analysis
        </p>
      </div>

      <div className="space-y-8">
        {/* Top Gainers and Losers */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Market Movers</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Gainers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 flex items-center">
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                  Top Gainers
                </h3>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {trendingStocks?.gainers?.slice(0, 10).map((stock: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {stock.symbol.replace('.NS', '')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name || 'Stock'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                          ₹{typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            +{typeof stock.percentChange === 'number' ? stock.percentChange.toFixed(2) : stock.percentChange}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center">
                  <ArrowTrendingDownIcon className="h-5 w-5 mr-2" />
                  Top Losers
                </h3>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {trendingStocks?.losers?.slice(0, 10).map((stock: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {stock.symbol.replace('.NS', '')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name || 'Stock'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                          ₹{typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                            {typeof stock.percentChange === 'number' ? stock.percentChange.toFixed(2) : stock.percentChange}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StockPage;
