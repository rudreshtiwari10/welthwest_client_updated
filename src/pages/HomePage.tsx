import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AnimatedText from '../components/AnimatedText';
import { marketService } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { SparklesIcon, ChartBarIcon, ChatBubbleLeftRightIcon, CpuChipIcon, ClockIcon } from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const HomePage: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [trendingStocks, setTrendingStocks] = useState<any>({ gainers: [], losers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const indicesSliderRef = useRef<HTMLDivElement>(null);
  const [dynamicWord, setDynamicWord] = useState('Trading');
  const [isTyping, setIsTyping] = useState(false);
  const [displayText, setDisplayText] = useState('Trading');
  
  // Words to animate through
  const animatedWords = ['Stock', 'Indices', 'Global', 'Investment'];
  const dynamicWords = ['Trading', 'Backtesting', 'Analysis'];
  
  // Get the longest word to set a fixed width
  const longestWord = dynamicWords.reduce((a, b) => a.length > b.length ? a : b, '');
  
  // Dynamic word typing effect
  useEffect(() => {
    const typingInterval = 150; // ms per character
    const wordChangeInterval = 4000; // ms between word changes
    
    // Function to handle the typing effect
    const typeWord = (word: string, index: number = 0) => {
      if (index <= word.length) {
        setDisplayText(word.substring(0, index));
        setTimeout(() => typeWord(word, index + 1), typingInterval);
      } else {
        setIsTyping(false);
      }
    };
    
    // Change word periodically
    const interval = setInterval(() => {
      setIsTyping(true);
      const currentIndex = dynamicWords.indexOf(dynamicWord);
      const nextWord = dynamicWords[(currentIndex + 1) % dynamicWords.length];
      setDynamicWord(nextWord);
      typeWord(nextWord);
    }, wordChangeInterval);
    
    // Initial typing
    if (displayText === '') {
      setIsTyping(true);
      typeWord(dynamicWord);
    }
    
    return () => clearInterval(interval);
  }, [dynamicWord]);
  
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
    <div className="relative min-h-screen">
      {/* Modern AI-themed abstract background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"></div>
        
        {/* Abstract circuit-like patterns */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q25,25 50,50 T100,50 M50,0 Q75,25 50,50 T50,100" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="50" cy="50" r="3" fill="currentColor" />
                <circle cx="0" cy="50" r="2" fill="currentColor" />
                <circle cx="100" cy="50" r="2" fill="currentColor" />
                <circle cx="50" cy="0" r="2" fill="currentColor" />
                <circle cx="50" cy="100" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
          </svg>
        </div>
        
        {/* Floating particles/nodes effect */}
        <div className="absolute inset-0">
          <div className="absolute h-32 w-32 rounded-full bg-primary-600/10 blur-3xl top-1/4 left-1/4 animate-pulse-slow"></div>
          <div className="absolute h-40 w-40 rounded-full bg-secondary-600/10 blur-3xl bottom-1/3 right-1/3 animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute h-24 w-24 rounded-full bg-primary-400/10 blur-3xl top-1/3 right-1/4 animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute h-36 w-36 rounded-full bg-secondary-400/10 blur-3xl bottom-1/4 left-1/3 animate-pulse-slow animation-delay-3000"></div>
        </div>
        
        {/* Light grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] dark:opacity-[0.03]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Elegant Hero Section with AI Feature Buttons */}
        <section className="mb-12 max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-dark-300/80 shadow-md border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
            {/* Content */}
            <div className="relative py-10 px-6 text-center" style={{ minHeight: '200px' }}>
              <h1 className="text-3xl font-bold mb-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-900 dark:text-white">
                <span>Discover the Power of AI in</span>
                <div className="relative inline-block" style={{ minWidth: '140px', width: '140px' }}>
                  <span className={`bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text font-bold ${isTyping ? 'border-r-2 border-primary-500 animate-cursor' : ''}`}>
                    {displayText}
                  </span>
                </div>
              </h1>
              
              {/* AI Feature Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 max-w-3xl mx-auto">
                {/* AI Market Analysis Button */}
                <Link 
                  to="/ai" 
                  className="group flex items-center justify-center sm:justify-between bg-primary-50/90 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/40 backdrop-blur-sm border border-primary-200 dark:border-primary-800 rounded-lg py-3 px-5 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">AI Market Analysis</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Predict market regimes</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-4 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                {/* WelthAI Chat Bot Button */}
                <Link 
                  to="/welthchatbot" 
                  className="group flex items-center justify-center sm:justify-between bg-secondary-50/90 dark:bg-secondary-900/30 hover:bg-secondary-100 dark:hover:bg-secondary-900/40 backdrop-blur-sm border border-secondary-200 dark:border-secondary-800 rounded-lg py-3 px-5 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">WelthAI Chat Bot</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Get investment insights</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-4 text-secondary-600 dark:text-secondary-400 group-hover:translate-x-1 transition-transform hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                {/* Backtesting Button */}
                <Link 
                  to="/backtesting" 
                  className="group flex items-center justify-center sm:justify-between bg-green-50/90 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 backdrop-blur-sm border border-green-200 dark:border-green-800 rounded-lg py-3 px-5 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <ClockIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Backtesting</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Test your strategies</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-4 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              {/* Small sparkle decoration */}
              <div className="absolute top-4 right-4 opacity-30">
                <SparklesIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 animate-pulse-slow" />
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
                  <div key={index} className="min-w-[300px] bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 p-6 animate-pulse" style={{ minHeight: '280px' }}>
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
                    <div key={key} className="min-w-[300px] bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700" style={{ minHeight: '280px' }}>
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
                        
                        <div className="h-32 w-full" style={{ minHeight: '128px', maxHeight: '128px' }}>
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Gainers Table */}
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
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
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
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

        {/* Main Features Showcase */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Explore Our Main Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Discover AI-driven analysis, intelligent chatbot assistance, and comprehensive backtesting tools
            </p>
          </div>
          
          {/* AI Analysis Feature */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Text Content */}
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mr-3">
                      <CpuChipIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Analysis</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Advanced AI algorithms analyze market patterns and provide actionable insights for informed investment decisions.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Market regime detection</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Pattern recognition</span>
                    </div>
                  </div>
                  <Link 
                    to="/welthai" 
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors w-fit"
                  >
                    Explore AI Analysis
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                
                {/* Video Placeholder */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 lg:p-8 flex items-center justify-center">
                  <div className="w-full max-w-sm aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary-200 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Demo Video</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Chat Bot Feature - Reverse Layout */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Video Placeholder - Left Side */}
                <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 p-6 lg:p-8 flex items-center justify-center order-2 lg:order-1">
                  <div className="w-full max-w-sm aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-secondary-200 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-600 dark:text-secondary-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Demo Video</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Coming Soon</p>
                    </div>
                  </div>
                </div>
                
                {/* Text Content - Right Side */}
                <div className="p-6 lg:p-8 flex flex-col justify-center order-1 lg:order-2">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center mr-3">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">WelthAI Chat Bot</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Your personal AI investment assistant providing instant answers, market insights, and personalized recommendations 24/7.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Instant investment advice</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">24/7 intelligent support</span>
                    </div>
                  </div>
                  <Link 
                    to="/welthchatbot" 
                    className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white text-sm font-medium rounded-lg hover:bg-secondary-700 transition-colors w-fit"
                  >
                    Chat with WelthAI
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Backtesting Feature */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Text Content */}
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                      <ClockIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Backtesting</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Test your trading strategies with historical data to validate performance before risking real money.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Historical data simulation</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Performance analytics</span>
                    </div>
                  </div>
                  <Link 
                    to="/backtesting" 
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors w-fit"
                  >
                    Start Backtesting
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                
                {/* Video Placeholder */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 lg:p-8 flex items-center justify-center">
                  <div className="w-full max-w-sm aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Demo Video</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Start?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Create an account to get personalized stock recommendations, create watchlists, and access all premium features.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
              Create Account
            </Link>
            <Link to="/login" className="px-6 py-3 bg-white/80 dark:bg-dark-400/80 backdrop-blur-sm text-gray-800 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
              Sign In
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage; 