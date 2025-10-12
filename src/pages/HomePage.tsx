import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marketService, activityService } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { SparklesIcon, ChartBarIcon, ChatBubbleLeftRightIcon, CpuChipIcon, BeakerIcon } from '@heroicons/react/24/outline';
import FeatureVideo from '../components/FeatureVideo';
import QuickStartGuide from '../components/QuickStartGuide';
import { VIDEO_URLS, POSTER_URLS } from '../config/videoUrls';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const HomePage: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const indicesSliderRef = useRef<HTMLDivElement>(null);
  const [dynamicWord, setDynamicWord] = useState('Trading');
  const [isTyping, setIsTyping] = useState(false);
  const [displayText, setDisplayText] = useState('Trading');
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  
  // Words to animate through
  // const animatedWords = ['Stock', 'Indices', 'Global', 'Investment'];
  const dynamicWords = useMemo(() => ['Trading', 'Backtesting', 'Analysis'], []);
  
  // Get the longest word to set a fixed width
  // const longestWord = dynamicWords.reduce((a, b) => a.length > b.length ? a : b, '');
  
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
  }, [dynamicWord, dynamicWords, displayText]);
  
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch market indices
        const indicesData = await marketService.getMarketIndices();
        setMarketData(indicesData);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketData();
  }, []);
  
  // Memoized chart data generator to prevent unnecessary re-renders
  const generateChartData = useMemo(() => {
    return (isPositive: boolean, currentPrice: number, chartIndex: number) => {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      
      // Generate different curve patterns based on chart index
      const basePrice = currentPrice || 100;
      const data = labels.map((_, index) => {
        const progress = index / (labels.length - 1); // 0 to 1
        let curveValue;
        
        // Different curve patterns for each chart
        switch (chartIndex % 8) {
          case 0: // Exponential growth/decline
            if (isPositive) {
              curveValue = basePrice * (0.92 + Math.pow(progress, 1.5) * 0.12);
            } else {
              curveValue = basePrice * (1.08 - Math.pow(progress, 1.3) * 0.1);
            }
            break;
            
          case 1: // S-curve pattern
            if (isPositive) {
              curveValue = basePrice * (0.94 + (1 / (1 + Math.exp(-8 * (progress - 0.5))) - 0.5) * 0.12);
            } else {
              curveValue = basePrice * (1.06 - (1 / (1 + Math.exp(-8 * (progress - 0.5))) - 0.5) * 0.12);
            }
            break;
            
          case 2: // Double peak pattern
            if (isPositive) {
              curveValue = basePrice * (0.94 + progress * 0.08 + Math.sin(progress * 4 * Math.PI) * 0.03);
            } else {
              curveValue = basePrice * (1.04 - progress * 0.06 - Math.sin(progress * 4 * Math.PI) * 0.03);
            }
            break;
            
          case 3: // Stepped pattern
            if (isPositive) {
              curveValue = basePrice * (0.94 + Math.floor(progress * 4) * 0.02 + (progress % 0.25) * 0.08);
            } else {
              curveValue = basePrice * (1.04 - Math.floor(progress * 4) * 0.015 - (progress % 0.25) * 0.06);
            }
            break;
            
          case 4: // Wave pattern
            if (isPositive) {
              curveValue = basePrice * (0.94 + progress * 0.08 + Math.sin(progress * 6 * Math.PI) * 0.04);
            } else {
              curveValue = basePrice * (1.04 - progress * 0.06 - Math.sin(progress * 6 * Math.PI) * 0.04);
            }
            break;
            
          case 5: // Logarithmic pattern
            if (isPositive) {
              curveValue = basePrice * (0.94 + Math.log(1 + progress * 8) * 0.08);
            } else {
              curveValue = basePrice * (1.04 - Math.log(1 + progress * 8) * 0.06);
            }
            break;
            
          case 6: // Zigzag pattern
            if (isPositive) {
              curveValue = basePrice * (0.94 + progress * 0.08 + Math.sin(progress * 8 * Math.PI) * 0.05);
            } else {
              curveValue = basePrice * (1.04 - progress * 0.06 - Math.sin(progress * 8 * Math.PI) * 0.05);
            }
            break;
            
          case 7: // Smooth bell curve
            if (isPositive) {
              curveValue = basePrice * (0.94 + progress * 0.08 + Math.sin(progress * Math.PI) * 0.06);
            } else {
              curveValue = basePrice * (1.04 - progress * 0.06 - Math.sin(progress * Math.PI) * 0.06);
            }
            break;
            
          default:
            // Fallback to original pattern
            if (isPositive) {
              curveValue = basePrice * (0.94 + progress * 0.08 + Math.sin(progress * Math.PI) * 0.02);
            } else {
              curveValue = basePrice * (1.04 - progress * 0.06 - Math.sin(progress * Math.PI) * 0.02);
            }
        }
        
        // Add unique market-like fluctuation for each chart
        const uniqueFluctuation = Math.sin(index * (0.8 + chartIndex * 0.3)) * (basePrice * 0.006) + 
                                 Math.cos(index * (1.2 + chartIndex * 0.4)) * (basePrice * 0.004);
        
        return curveValue + uniqueFluctuation;
      });
      
      // Keep green/red colors based on percent change
      const colors = {
        border: isPositive ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)',
        background: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        point: isPositive ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)',
      };
      
      return {
        labels,
        datasets: [
          {
            label: 'Price',
            data,
            borderColor: colors.border,
            backgroundColor: colors.background,
            tension: 0.3 + (chartIndex % 4) * 0.2, // Varying tension for different curves
            fill: true,
            borderWidth: 2 + (chartIndex % 2), // Varying border width
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: colors.point,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            // Add gradient effect for some charts
            ...(chartIndex % 2 === 0 && {
              backgroundColor: (context: any) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return colors.background;
                
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, colors.background);
                gradient.addColorStop(1, colors.background.replace('0.1', '0.3'));
                return gradient;
              }
            }),
          },
        ],
      };
    };
  }, []);
  
  // Enhanced chart options with more variety
  const getEnhancedChartOptions = useMemo(() => {
    return (chartIndex: number) => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            title: () => '',
            label: (context: any) => {
              const value = context.parsed.y;
              return `₹${value.toFixed(2)}`;
            },
          },
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
          hoverRadius: 4 + (chartIndex % 2), // Varying hover radius
          hitRadius: 10,
        },
        line: {
          borderCapStyle: 'round' as const,
          borderJoinStyle: 'round' as const,
        },
      },
      animation: {
        duration: 0,
      },
      transitions: {
        active: {
          animation: {
            duration: 200 + (chartIndex % 3) * 100, // Varying transition duration
          },
        },
      },
    });
  }, []);
  
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
              
              
              <h1 className="text-3xl md:text-4xl font-bold mb-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-900 dark:text-white">
                <span>Discover the Power of AI in</span>
                <div className="relative inline-block" style={{ minWidth: '140px', width: '140px' }}>
                  <span className={`bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text font-bold ${isTyping ? 'border-r-2 border-primary-500 animate-cursor' : ''}`}>
                    {displayText}
                  </span>
                </div>
              </h1>
              
              {/* AI Feature Buttons - Responsive Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 mt-6 max-w-4xl mx-auto">
                {/* AI Market Analysis Button */}
                <Link
                  to="/welth-market-regime"
                  className="group flex flex-col items-center justify-center bg-primary-50/90 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/40 backdrop-blur-sm border border-primary-200 dark:border-primary-800 rounded-lg py-3 px-3 sm:py-2 sm:px-2 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-primary-600 flex items-center justify-center mb-2 sm:mb-1 group-hover:scale-110 transition-transform duration-300">
                    <ChartBarIcon className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-xs">AI Analysis</h3>
                    <p className="text-xs sm:text-[10px] text-gray-600 dark:text-gray-300">Market insights</p>
                  </div>
                </Link>
                
                {/* WelthAI Chat Bot Button */}
                <Link 
                  to="/welth-ai-assistant" 
                  className="group flex flex-col items-center justify-center bg-secondary-50/90 dark:bg-secondary-900/30 hover:bg-secondary-100 dark:hover:bg-secondary-900/40 backdrop-blur-sm border border-secondary-200 dark:border-secondary-800 rounded-lg py-3 px-3 sm:py-2 sm:px-2 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-secondary-600 flex items-center justify-center mb-2 sm:mb-1 group-hover:scale-110 transition-transform duration-300">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-xs">AI Chat</h3>
                    <p className="text-xs sm:text-[10px] text-gray-600 dark:text-gray-300">Get insights</p>
                  </div>
                </Link>
                
                {/* Backtesting Button */}
                <Link 
                  to="/backtest-beta" 
                  className="group flex flex-col items-center justify-center bg-green-50/90 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 backdrop-blur-sm border border-green-200 dark:border-green-800 rounded-lg py-3 px-3 sm:py-2 sm:px-2 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-green-600 flex items-center justify-center mb-2 sm:mb-1 group-hover:scale-110 transition-transform duration-300">
                    <BeakerIcon className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-xs">Backtest</h3>
                    <p className="text-xs sm:text-[10px] text-gray-600 dark:text-gray-300">Test strategies</p>
                  </div>
                </Link>
                
                {/* Strategy Button */}
                <a 
                  href="https://strategy.welthwest.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center bg-orange-50/90 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 backdrop-blur-sm border border-orange-200 dark:border-orange-800 rounded-lg py-3 px-3 sm:py-2 sm:px-2 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-orange-600 flex items-center justify-center mb-2 sm:mb-1 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-5 w-5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-xs">Strategy</h3>
                    <p className="text-xs sm:text-[10px] text-gray-600 dark:text-gray-300">Live strategies</p>
                  </div>
                </a>
              </div>
              
              {/* Small sparkle decoration */}
              <div className="absolute top-4 right-4 opacity-30">
                <SparklesIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 animate-pulse-slow" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Guide Button Section */}
        <section className="mb-12 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            New to WelthWest? Start Here!
          </h2>
          <button
            onClick={() => {
              activityService.trackActivity(activityService.FEATURE_QUICK_START);
              setIsQuickStartOpen(true);
            }}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-300"
          >
            Quick Start
          </button>
        </section>

        {/* Market Overview - Horizontal Slider */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Market Data & Indices
              <span className="ml-2 text-xs bg-secondary-600 text-white px-2 py-0.5 rounded-full">
                {isLoading ? 'Loading...' : 'Real-Time NSE & BSE'}
              </span>
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Slider Navigation */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NSE & BSE Market Indices</h3>
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
                marketData?.indices && Object.keys(marketData.indices).map((key, index) => {
                  const index_data = marketData.indices[key];
                  // Calculate percentage change more accurately
                  let percentChange = 0;
                  
                  if (index_data.percentChange !== undefined && index_data.percentChange !== null) {
                    percentChange = index_data.percentChange;
                  } else if (index_data.change && index_data.price) {
                    // Calculate percent change: (change / (current_price - change)) * 100
                    const previousPrice = index_data.price - index_data.change;
                    percentChange = (index_data.change / previousPrice) * 100;
                  } else {
                    // Generate realistic sample data if no real data available
                    const sampleChanges = [-2.45, 1.78, -0.92, 3.21, -1.65, 2.89, 0.45, -1.23, 2.15, -0.78];
                    percentChange = sampleChanges[Object.keys(marketData.indices).indexOf(key) % sampleChanges.length];
                  }
                  
                  // Absolute change is not displayed; omit to avoid unused variable warnings
                  
                  const isPositive = percentChange >= 0;
                  
                  return (
                    <div key={key} className="min-w-[300px] bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700" style={{ 
                      minHeight: '280px',
                      borderWidth: `${1 + (index % 2)}px`,
                      borderStyle: index % 3 === 0 ? 'solid' : index % 3 === 1 ? 'dashed' : 'dotted'
                    }}>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="group">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white cursor-default">
                                    {index_data.name || key}
                                  </h3>
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                    INDEX
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 cursor-default">
                                  {key.includes('NSEI') ? 'National Stock Exchange' : 'Bombay Stock Exchange'}
                                </p>
                              </div>
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
                                {percentChange.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="h-32 w-full" style={{ 
                          minHeight: `${128 + (index % 4) * 12}px`, 
                          maxHeight: `${128 + (index % 4) * 12}px` 
                        }}>
                          <Line data={generateChartData(isPositive, index_data.price || 0, index)} options={getEnhancedChartOptions(index)} key={`chart-${key}-${isPositive}-${index_data.price}`} />
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
        

        {/* Main Features Showcase */}
        <section className="mb-8 max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Trading Tools & Backtesting Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover AI-driven analysis, intelligent chatbot assistance, and comprehensive backtesting tools
            </p>
          </div>
          
          {/* AI Analysis Feature */}
          <div className="mb-6">
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Text Content */}
                <div className="p-4 lg:p-5 flex flex-col justify-center">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mr-3">
                      <CpuChipIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Market Analysis</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed text-sm">
                    Leverage cutting-edge artificial intelligence to uncover hidden market patterns, predict regime changes, and receive data-driven investment recommendations tailored to your risk profile.
                  </p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Advanced market regime detection using ML algorithms</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Real-time pattern recognition and trend analysis</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Risk-adjusted portfolio recommendations</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Sentiment analysis from news and social media</span>
                    </div>
                  </div>
                  <Link
                    to="/welth-market-regime"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-300 w-fit group-hover:bg-primary-700 group-hover:shadow-lg"
                  >
                    Explore AI Analysis
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                
                {/* AI Analysis Video */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-4 lg:p-5 flex items-center justify-center">
                  <FeatureVideo
                    src={VIDEO_URLS.AI_ANALYSIS}
                    poster={POSTER_URLS.AI_ANALYSIS}
                    alt="AI Analysis Demo"
                    className="w-full max-w-md aspect-video"
                    priority={true}
                    fetchPriority="high"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Backtesting Feature */}
          <div className="mb-6">
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Text Content */}
                <div className="p-4 lg:p-5 flex flex-col justify-center">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                      <BeakerIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Strategy Backtesting</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed text-sm">
                    Validate your trading strategies with comprehensive historical backtesting. Test multiple scenarios, analyze risk metrics, and optimize your approach using years of market data before committing real capital.
                  </p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Multi-timeframe historical data simulation</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Comprehensive performance analytics and metrics</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Risk-adjusted returns and drawdown analysis</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Strategy optimization and parameter tuning</span>
                    </div>
                  </div>
                  <Link 
                    to="/backtest-beta" 
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all duration-300 w-fit group-hover:bg-green-700 group-hover:shadow-lg"
                  >
                    Start Backtesting
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                
                {/* Backtesting Video */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 lg:p-5 flex items-center justify-center">
                  <FeatureVideo
                    src={VIDEO_URLS.BACKTESTING}
                    poster={POSTER_URLS.BACKTESTING}
                    alt="Backtesting Demo"
                    className="w-full max-w-md aspect-video"
                    priority={false}
                    fetchPriority="auto"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Chat Bot Feature - Reverse Layout */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* WelthAI Chat Video - Left Side */}
                <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 p-6 lg:p-8 flex items-center justify-center order-2 lg:order-1">
                  <FeatureVideo
                    src={VIDEO_URLS.WELTHAI_CHAT}
                    poster={POSTER_URLS.WELTHAI_CHAT}
                    alt="WelthAI Chat Demo"
                    className="w-full max-w-md aspect-video"
                    priority={false}
                    fetchPriority="low"
                  />
                </div>
                
                {/* Text Content - Right Side */}
                <div className="p-6 lg:p-8 flex flex-col justify-center order-1 lg:order-2">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center mr-3">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Trading Assistant</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Experience conversational AI that understands financial markets. Get instant answers to investment questions, portfolio analysis, and personalized stock recommendations through natural language conversations.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Instant investment advice and market explanations</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">24/7 intelligent support with market expertise</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Natural language portfolio analysis and insights</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Contextual financial education and explanations</span>
                    </div>
                  </div>
                  <Link 
                   to="/welth-ai-assistant" 
                    className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white text-sm font-medium rounded-lg hover:bg-secondary-700 transition-all duration-300 w-fit group-hover:bg-secondary-700 group-hover:shadow-lg"
                  >
                    Chat with WelthAI
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Strategy Feature */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Text Content */}
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                      <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Trading Strategies</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Access professional-grade trading strategies with real-time performance tracking. Discover proven methodologies, automated execution, and comprehensive risk management for consistent returns.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Real-time strategy performance monitoring</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Professional trading algorithms and signals</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Automated risk management and position sizing</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Comprehensive performance analytics and reporting</span>
                    </div>
                  </div>
                  <a 
                    href="https://strategy.welthwest.com/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-all duration-300 w-fit group-hover:bg-orange-700 group-hover:shadow-lg"
                  >
                    Explore Strategies
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
                
                {/* Strategy Visual - Right Side */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 lg:p-8 flex items-center justify-center">
                  <div className="w-full max-w-md aspect-video bg-white dark:bg-dark-400 rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <svg className="h-20 w-20 mx-auto mb-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Live Performance</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Real-time strategy tracking & execution</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tools Suite Feature - Reverse Layout */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* AI Tools Visual - Left Side */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-800/20 p-6 lg:p-8 flex items-center justify-center order-2 lg:order-1">
                  <div className="w-full max-w-md aspect-video bg-white dark:bg-dark-400 rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="flex justify-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <SparklesIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <CpuChipIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">AI-Powered Suite</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Advanced AI tools for modern trading</p>
                    </div>
                  </div>
                </div>
                
                {/* Text Content - Right Side */}
                <div className="p-6 lg:p-8 flex flex-col justify-center order-1 lg:order-2">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                      <CpuChipIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Tools Suite</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Harness the power of artificial intelligence with our comprehensive suite of AI tools. From daily market recaps to personal AI assistants and sentiment analysis, stay ahead of the market with cutting-edge technology.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Daily Market Recap using AI</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Personal AI Assistant for Trading</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Advanced Sentiment Analysis Bot</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-gray-700 dark:text-gray-300">Real-time Market Intelligence</span>
                    </div>
                  </div>
                  <a 
                    href="https://services.welthwest.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-all duration-300 w-fit group-hover:bg-purple-700 group-hover:shadow-lg"
                  >
                    Explore AI Tools
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trading Challenges We Solve Section */}
        <section className="mb-12 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
              Trading Challenges We Solve
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Common trader problems that our AI intelligence platform addresses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* False Breakouts & Stop-Loss Hunts */}
            <div className="group bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-red-500 transition-colors">
                  False Breakouts & Stop-Loss Hunts
                </h3>
              </div>
            </div>

            {/* Information Overload & Slow Reaction */}
            <div className="group bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-500 transition-colors">
                  Information Overload & Slow Reaction
                </h3>
              </div>
            </div>

            {/* Lack of Institutional-Grade Analytics */}
            <div className="group bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-green-500 transition-colors">
                  Lack of Institutional-Grade Analytics
                </h3>
              </div>
            </div>

            {/* Inconsistent Strategy Performance */}
            <div className="group bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-yellow-500 transition-colors">
                  Inconsistent Strategy Performance
                </h3>
              </div>
            </div>

            {/* Manual Backtesting Limitations */}
            <div className="group bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8 17.926 17.926 0 00-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-indigo-500 transition-colors">
                  Manual Backtesting Limitations
                </h3>
              </div>
            </div>

            {/* Hidden Market Manipulation */}
            <div className="group bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-pink-500 transition-colors">
                  Hidden Market Manipulation
                </h3>
              </div>
            </div>

            {/* Static Risk Management */}
            <div className="group bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-cyan-500 transition-colors">
                  Static Risk Management
                </h3>
              </div>
            </div>

            {/* Steep Learning Curve */}
            <div className="group bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-emerald-500 transition-colors">
                  Steep Learning Curve
                </h3>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="flex justify-center mt-12">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full"></div>
          </div>
        </section>
      </div>

      {/* Quick Start Guide Modal */}
      <QuickStartGuide isOpen={isQuickStartOpen} onClose={() => setIsQuickStartOpen(false)} />
    </div>
  );
};

export default HomePage; 
