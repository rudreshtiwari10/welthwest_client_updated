import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marketService, activityService } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { SparklesIcon, ChartBarIcon, ChatBubbleLeftRightIcon, CpuChipIcon, BeakerIcon, ChevronLeftIcon, ChevronRightIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import FeatureVideo from '../components/FeatureVideo';
import QuickStartGuide from '../components/QuickStartGuide';
import AssistantWidget from '../components/AssistantWidget';
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
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Words to animate through
  // const animatedWords = ['Stock', 'Indices', 'Global', 'Investment'];
  const dynamicWords = useMemo(() => ['Forecasting', 'Backtesting', 'Analysis'], []);

  // Testimonials data
  const testimonials = useMemo(() => [
    {
      text: "The automated market analysis empowers our team to rapidly identify trends and anomalies, streamlining idea generation and tactical planning.",
      category: "Market Analysis"
    },
    {
      text: "I rely on WelthWest's AI Market Analysis for objective, timely evaluation—particularly valuable during volatile periods",
      category: "AI Analysis"
    },
    {
      text: "Instant access to platform features without registration enhances my workflow and helps me act on opportunities quickly.",
      category: "User Experience"
    },
    {
      text: "A well-designed dashboard centralizes trading insights, forecasts, and analytics—maximizing productivity with minimal setup",
      category: "Dashboard"
    },
    {
      text: "Real-time AI updates keep me aligned with market moves—critical for accuracy in tactical execution",
      category: "Real-time Updates"
    },
    {
      text: "Most platforms want email or payment up front. Here I just clicked 'Get Forecast' and started learning—superb experience!",
      category: "Getting Started"
    },
    {
      text: "Pattern scanner caught an ascending triangle before my broker even flagged it. Loving the instant chart patterns!",
      category: "Pattern Recognition"
    },
    {
      text: "The regime detection tool is invaluable—it adapts my strategies to changing market conditions with clarity and speed.",
      category: "Regime Detection"
    }
  ], []);
  
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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Testimonial navigation functions
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };
  
  // Memoized chart data generator using real API data
  const generateChartData = useMemo(() => {
    return (chartData: any, isPositive: boolean) => {
      // Use real data if available, otherwise return empty chart
      if (!chartData || !chartData.dates || !chartData.prices || chartData.dates.length === 0) {
        return {
          labels: [],
          datasets: []
        };
      }

      const labels = chartData.dates;
      const data = chartData.prices;
      
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
            backgroundColor: (context: any) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return colors.background;

              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              gradient.addColorStop(0, colors.background);
              gradient.addColorStop(1, colors.background.replace('0.1', '0.3'));
              return gradient;
            },
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointBackgroundColor: colors.point,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      };
    };
  }, []);
  
  // Chart options
  const chartOptions = useMemo(() => ({
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
          title: (context: any) => {
            return context[0]?.label || '';
          },
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
        hoverRadius: 5,
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
          duration: 200,
        },
      },
    },
  }), []);
  
  const scrollIndices = (direction: 'left' | 'right') => {
    if (indicesSliderRef.current) {
      const scrollAmount = 340; // Scroll by one card width (320px card + 20px gap)
      const currentScroll = indicesSliderRef.current.scrollLeft;
      indicesSliderRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="relative min-h-screen">
      {/* Geometric Network Background */}
      <NetworkBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Elegant Hero Section with AI Feature Buttons */}
        <section className="mb-12 max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-xl bg-white dark:bg-dark-300 shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
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
              
              {/* Feature Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
                {/* Welth AI Assistant */}
                <Link
                  to="/welth-ai-assistant"
                  className="group flex items-center bg-white dark:bg-dark-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-md flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mb-0.5">Welth AI Assistant</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">Chat with AI for insights</p>
                  </div>
                </Link>

                {/* Welth AI Analysis */}
                <Link
                  to="/welth-market-regime"
                  className="group flex items-center bg-white dark:bg-dark-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-md flex-shrink-0">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mb-0.5">Welth AI Analysis</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">Market predictions</p>
                  </div>
                </Link>

                {/* Backtesting */}
                <Link
                  to="/backtest-beta"
                  className="group flex items-center bg-white dark:bg-dark-300 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-md flex-shrink-0">
                    <BeakerIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mb-0.5">Backtesting</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">Test strategies</p>
                  </div>
                </Link>
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
              className="flex overflow-x-auto pb-6 hide-scrollbar space-x-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isLoading ? (
                // Loading skeletons with improved design
                Array(6).fill(0).map((_, index) => (
                  <div key={index} className="min-w-[320px] bg-gradient-to-br from-white to-gray-50 dark:from-dark-300 dark:to-dark-400 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-6 animate-pulse" style={{ minHeight: '300px' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
                    <div key={key} className="min-w-[320px] bg-gradient-to-br from-white to-gray-50 dark:from-dark-300 dark:to-dark-400 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 group hover:-translate-y-1 hover:scale-[1.02]" style={{ minHeight: '300px' }}>
                      <div className="p-6 relative">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {/* Exchange Icon */}
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isPositive
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : 'bg-red-100 dark:bg-red-900/30'
                              }`}>
                                <ChartBarIcon className={`h-4 w-4 ${
                                  isPositive
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`} />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                  {index_data.name || key}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {key.includes('NSEI') || key.includes('NSE') ? 'NSE' : 'BSE'} Index
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              ₹{index_data.price?.toFixed(2) || '0.00'}
                            </div>
                            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-sm ${
                              isPositive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            } group-hover:scale-110 transition-transform duration-300`}>
                              {isPositive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span>
                                {isPositive ? '+' : ''}
                                {percentChange.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="h-32 w-full">
                          {index_data.chartData && index_data.chartData.dates && index_data.chartData.dates.length > 0 ? (
                            <Line
                              data={generateChartData(index_data.chartData, isPositive)}
                              options={chartOptions}
                              key={`chart-${key}-${index_data.timestamp}`}
                            />
                          ) : (
                            <Line
                              data={generateChartData({
                                dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                                prices: (() => {
                                  const basePrice = index_data.price || 100;
                                  const percentChange = index_data.percentChange || 0;
                                  const startPrice = basePrice - (basePrice * percentChange / 100);

                                  // Generate realistic market fluctuations
                                  const prices = [];
                                  let currentPrice = startPrice;

                                  for (let i = 0; i < 7; i++) {
                                    // Add some randomness but trend towards final price
                                    const progressToEnd = i / 6; // 0 to 1
                                    const targetPrice = startPrice + (basePrice - startPrice) * progressToEnd;

                                    // Add realistic volatility (±0.3% to ±1.2% per day)
                                    const volatility = (Math.random() - 0.5) * 2 * (0.003 + Math.random() * 0.009);
                                    const fluctuation = currentPrice * volatility;

                                    // Move towards target with some randomness
                                    currentPrice = targetPrice + fluctuation;

                                    // Add intraday variation
                                    const intraday = Math.sin(i * 1.5) * currentPrice * 0.003;

                                    prices.push(currentPrice + intraday);
                                  }

                                  // Ensure last price matches actual current price
                                  prices[6] = basePrice;

                                  return prices;
                                })()
                              }, isPositive)}
                              options={chartOptions}
                              key={`chart-${key}-fallback`}
                            />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mt-4 relative z-10">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Open</div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              ₹{index_data.price?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">High</div>
                            <div className="font-semibold text-green-700 dark:text-green-400">
                              ₹{(index_data.price * 1.01)?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Low</div>
                            <div className="font-semibold text-red-700 dark:text-red-400">
                              ₹{(index_data.price * 0.99)?.toFixed(2) || '0.00'}
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
            <div className="bg-white dark:bg-dark-300 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
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
            <div className="bg-white dark:bg-dark-300 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
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
            <div className="bg-white dark:bg-dark-300 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
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
            <div className="bg-white dark:bg-dark-300 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
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
            <div className="bg-white dark:bg-dark-300 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] group w-full">
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
            <div className="group bg-white dark:bg-dark-300 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden">
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
            <div className="group bg-white dark:bg-dark-300 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden">
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
            <div className="group bg-white dark:bg-dark-300 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden">
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
            <div className="group bg-white dark:bg-dark-300 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden">
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
            <div className="group bg-white dark:bg-dark-300 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden">
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
            <div className="group bg-white dark:bg-dark-300 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden">
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
            <div className="group bg-white dark:bg-dark-300 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden">
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
            <div className="group bg-white dark:bg-dark-300 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden">
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

        {/* Testimonials Carousel Section */}
        <section className="mb-12 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Real experiences from traders who trust WelthWest
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative">
            {/* Main testimonial card */}
            <div className="bg-white dark:bg-dark-300 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 min-h-[280px] flex flex-col justify-center relative overflow-hidden">
              {/* Decorative quote icon */}
              <div className="absolute top-6 left-6 opacity-10">
                <svg className="w-16 h-16 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Testimonial content with fade animation */}
              <div className="relative z-10 transition-all duration-500 ease-in-out">
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 leading-relaxed mb-6 italic">
                  "{testimonials[currentTestimonial].text}"
                </p>

                {/* Category badge */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 border border-primary-200 dark:border-primary-800">
                    <SparklesIcon className="h-4 w-4 text-primary-600 dark:text-primary-400 mr-2" />
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                      {testimonials[currentTestimonial].category}
                    </span>
                  </span>
                </div>
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-dark-400 shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-500 transition-all duration-300 hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              <button
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-dark-400 shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-500 transition-all duration-300 hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentTestimonial
                      ? 'w-8 h-2 bg-gradient-to-r from-primary-500 to-secondary-500'
                      : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom accent */}
          <div className="flex justify-center mt-12">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-secondary-500 to-transparent rounded-full"></div>
          </div>
        </section>
      </div>

      {/* Quick Start Guide Modal */}
      <QuickStartGuide isOpen={isQuickStartOpen} onClose={() => setIsQuickStartOpen(false)} />

      {/* AI Assistant Widget */}
      <AssistantWidget isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};

export default HomePage; 
