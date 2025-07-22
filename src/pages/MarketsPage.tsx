import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AnimatedText from '../components/AnimatedText';
import { marketService } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MarketsPage: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [trendingStocks, setTrendingStocks] = useState<any>({ gainers: [], losers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const indicesSliderRef = useRef<HTMLDivElement>(null);
  
  // Words to animate through
  const animatedWords = ['Markets', 'Indices', 'Global', 'Stocks'];
  
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch market indices
        const indicesData = await marketService.getMarketIndices();
        setMarketData(indicesData);
        
        // Fetch trending stocks (top gainers and losers)
        const trendingData = await marketService.getTrendingStocks();
        setTrendingStocks(trendingData);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketData();
  }, []);
  
  // Generate mock chart data
  const generateChartData = (isPositive: boolean) => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    
    let baseData = [65, 59, 80, 81, 56, 55, 40, 60, 70];
    
    // Add some randomness and trend based on positive/negative
    const data = baseData.map((value, index) => {
      const randomFactor = Math.random() * 10 - 5;
      const trendFactor = isPositive ? index * 0.5 : -index * 0.5;
      return value + randomFactor + trendFactor;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Price',
          data,
          borderColor: isPositive ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)',
          backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  const scrollIndices = (direction: 'left' | 'right') => {
    if (indicesSliderRef.current) {
      const scrollAmount = 300; // Adjust as needed
      const currentScroll = indicesSliderRef.current.scrollLeft;
      indicesSliderRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="rounded-xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6 text-left md:text-left text-center w-full md:w-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                <AnimatedText words={animatedWords} baseText="Live Market Data" />
              </h1>
              <p className="text-lg opacity-90 mb-6">
                Track real-time market movements, analyze trends, and make informed investment decisions.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link to="/dashboard" className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 rounded-full font-medium transition-colors">
                  View Dashboard
                </Link>
                <button className="bg-transparent border border-white hover:bg-white hover:text-primary-600 px-6 py-2 rounded-full font-medium transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Market Pulse</span>
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Live</span>
                </div>
                <div className="space-y-2">
                  {!isLoading && marketData?.indices ? (
                    Object.keys(marketData.indices).slice(0, 3).map((key) => {
                      const index = marketData.indices[key];
                      const isPositive = index.percentChange >= 0;
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span>{index.name}</span>
                          <span className={isPositive ? "text-green-300" : "text-red-300"}>
                            {isPositive ? '+' : ''}{index.percentChange.toFixed(2)}%
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span>NIFTY 50</span>
                        <span className="text-green-300">+1.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>SENSEX</span>
                        <span className="text-green-300">+0.9%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>BANK NIFTY</span>
                        <span className="text-red-300">-0.3%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview - Horizontal Slider */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Overview
            <span className="ml-2 text-xs bg-secondary-600 text-white px-2 py-0.5 rounded-full">
              {isLoading ? 'Loading...' : 'Live Data'}
            </span>
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        {/* Slider Navigation */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Major Indices</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => scrollIndices('left')} 
              className="p-2 rounded-full bg-gray-100 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={() => scrollIndices('right')} 
              className="p-2 rounded-full bg-gray-100 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Horizontal Scrollable Indices */}
        <div className="relative mb-8">
          <div 
            ref={indicesSliderRef}
            className="flex overflow-x-auto pb-4 hide-scrollbar space-x-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              // Loading skeletons
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="min-w-[300px] bg-white dark:bg-dark-300 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              // Real data
              marketData?.indices && Object.keys(marketData.indices).map((key) => {
                const index_data = marketData.indices[key];
                const isPositive = index_data.percentChange >= 0;
                
                return (
                  <div key={key} className="min-w-[300px] bg-white dark:bg-dark-300 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link to={`/stock/${key}`} className="group">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {index_data.name || key}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key.includes('NSEI') ? 'National Stock Exchange' : 'Bombay Stock Exchange'}
                          </p>
                          </Link>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {index_data.price?.toFixed(2) || '0.00'}
                          </div>
                          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="font-medium">
                              {isPositive ? '+' : ''}
                              {index_data.percentChange?.toFixed(2) || '0.00'}%
                              {` (${index_data.change?.toFixed(2) || '0.00'})`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-32">
                        <Line data={generateChartData(isPositive)} options={chartOptions} />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Open</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {index_data.price?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">High</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {(index_data.price * 1.01)?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Low</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {(index_data.price * 0.99)?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Gradient overlays for scroll indication */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
        </div>
      </section>
      
      {/* Top Gainers and Losers Tables */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Movers</h2>
          <Link to="/markets" className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers Table */}
          <div className="bg-white dark:bg-dark-300 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Top Gainers</h3>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-dark-400">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-300 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    // Loading skeletons
                    Array(5).fill(0).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    trendingStocks?.gainers?.map((stock: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-400 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/stock/${stock.symbol.replace('.NS', '')}`} className="group">
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                              {stock.symbol.replace('.NS', '')}
                            </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name || 'Stock'}</div>
                          </Link>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Top Losers Table */}
          <div className="bg-white dark:bg-dark-300 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Top Losers</h3>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-dark-400">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-300 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    // Loading skeletons
                    Array(5).fill(0).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    trendingStocks?.losers?.map((stock: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-400 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/stock/${stock.symbol.replace('.NS', '')}`} className="group">
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                              {stock.symbol.replace('.NS', '')}
                            </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name || 'Stock'}</div>
                          </Link>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketsPage; 