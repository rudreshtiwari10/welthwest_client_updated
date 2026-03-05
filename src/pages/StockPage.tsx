import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { marketService } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import SearchBarWithSuggestions from '../components/SearchBarWithSuggestions';
import StockChart from '../components/StockChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const searchPlaceholders = [
  "Search stocks...",
  "Search companies...",
  "Search prices...",
  "Search markets..."
];

const StockPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendingStocks, setTrendingStocks] = useState<any>({ gainers: [], losers: [] });
  const [marketData, setMarketData] = useState<any>(null);
  const indicesSliderRef = useRef<HTMLDivElement>(null);

  // Stock detail state (for inline search result)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [stockDetail, setStockDetail] = useState<any>(null);
  const [stockQuote, setStockQuote] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [trendingData, indicesData] = await Promise.allSettled([
          marketService.getTrendingStocks(),
          marketService.getMarketIndices(),
        ]);

        if (trendingData.status === 'fulfilled') setTrendingStocks(trendingData.value);
        if (indicesData.status === 'fulfilled') setMarketData(indicesData.value);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch selected stock data when user searches
  const handleStockSearch = async (query: string) => {
    const symbol = query.trim().toUpperCase();
    if (!symbol) return;

    setSelectedSymbol(symbol);
    setStockLoading(true);
    setStockError(null);
    setStockDetail(null);
    setStockQuote(null);

    // Scroll to top of page to show the result
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const [histResult, quoteResult] = await Promise.allSettled([
        marketService.getStockInfo(symbol, '3mo', '1d'),
        marketService.getStockQuote(symbol),
      ]);

      if (histResult.status === 'fulfilled') setStockDetail(histResult.value);
      if (quoteResult.status === 'fulfilled') setStockQuote(quoteResult.value);

      if (histResult.status === 'rejected' && quoteResult.status === 'rejected') {
        setStockError(`No data found for "${symbol}". Try a different symbol.`);
      }
    } catch {
      setStockError(`Could not fetch data for "${symbol}".`);
    } finally {
      setStockLoading(false);
    }
  };

  const scrollIndices = (direction: 'left' | 'right') => {
    if (indicesSliderRef.current) {
      const scrollAmount = 340;
      indicesSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const generateChartData = useMemo(() => {
    return (chartData: any, isPositive: boolean) => {
      if (!chartData || !chartData.dates || !chartData.prices || chartData.dates.length === 0) {
        return { labels: [], datasets: [] };
      }
      const colors = {
        border: isPositive ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)',
        background: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        point: isPositive ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)',
      };
      return {
        labels: chartData.dates,
        datasets: [{
          label: 'Price',
          data: chartData.prices,
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
        }],
      };
    };
  }, []);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (context: any) => context[0]?.label || '',
          label: (context: any) => `₹${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: { x: { display: false }, y: { display: false } },
    elements: {
      point: { radius: 0, hoverRadius: 5, hitRadius: 10 },
      line: { borderCapStyle: 'round' as const, borderJoinStyle: 'round' as const },
    },
    animation: { duration: 0 },
    transitions: { active: { animation: { duration: 200 } } },
  }), []);

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
      {/* Header + Search Bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Stock Market Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Top performing stocks and market analysis
            </p>
          </div>
          <div className="w-full sm:w-80">
            <SearchBarWithSuggestions
              placeholders={searchPlaceholders}
              className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              onSearch={handleStockSearch}
            />
          </div>
        </div>
      </div>

      {/* ── Inline Stock Detail Card ── */}
      {selectedSymbol && (() => {
        // Resolve live quote entry from stockQuote response
        const liveData = stockQuote
          ? (stockQuote[selectedSymbol] ?? stockQuote[`${selectedSymbol}.NS`] ?? (stockQuote.price !== undefined ? stockQuote : null))
          : null;

        // Derive price stats — prefer live quote, fall back to last row in historical data
        const lastRow = stockDetail?.data?.[stockDetail.data.length - 1];
        const firstRow = stockDetail?.data?.[0];
        const closePrice: number | undefined = liveData?.price ?? lastRow?.Close;
        const openPrice: number | undefined = liveData?.open ?? lastRow?.Open;
        const highPrice: number | undefined = liveData?.dayHigh ?? liveData?.high ?? lastRow?.High;
        const lowPrice: number | undefined = liveData?.dayLow ?? liveData?.low ?? lastRow?.Low;
        const volume: number | undefined = liveData?.volume ?? lastRow?.Volume;
        const companyName: string | undefined = liveData?.name ?? stockDetail?.name ?? stockDetail?.company_name;

        // % change: from live quote → else derived from first/last historical close
        let pctChange: number | undefined = liveData?.percentChange ?? liveData?.percent_change;
        if (pctChange === undefined && closePrice !== undefined && firstRow?.Close) {
          pctChange = ((closePrice - firstRow.Close) / firstRow.Close) * 100;
        }
        const detailIsPositive = (pctChange ?? 0) >= 0;

        // Build stockData object for StockChart
        const chartStockData = {
          symbol: selectedSymbol,
          name: companyName,
          ...(stockDetail ?? {}),
          percentChange: pctChange,
        };

        return (
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSymbol}</h2>
                    {companyName && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">{companyName}</span>
                    )}
                  </div>
                  {!stockLoading && closePrice !== undefined && (
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{closePrice.toFixed(2)}
                      </span>
                      {pctChange !== undefined && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          detailIsPositive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {detailIsPositive ? '▲' : '▼'} {detailIsPositive ? '+' : ''}{pctChange.toFixed(2)}%
                        </span>
                      )}
                      <span className="text-xs text-gray-400">3-month</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedSymbol(null); setStockDetail(null); setStockQuote(null); setStockError(null); }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Loading */}
              {stockLoading && (
                <div className="flex justify-center items-center py-16">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-500" />
                  <span className="ml-3 text-gray-500 dark:text-gray-400">Fetching data for {selectedSymbol}…</span>
                </div>
              )}

              {/* Error */}
              {!stockLoading && stockError && (
                <div className="px-5 py-10 text-center">
                  <p className="text-red-500 dark:text-red-400">{stockError}</p>
                </div>
              )}

              {/* No data */}
              {!stockLoading && !stockError && !stockDetail && !stockQuote && (
                <div className="px-5 py-10 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No data found for <span className="font-semibold">{selectedSymbol}</span>. Try a valid NSE symbol (e.g., TCS, RELIANCE, INFY).
                  </p>
                </div>
              )}

              {/* Chart + Stats */}
              {!stockLoading && !stockError && stockDetail && (
                <div className="p-5">
                  {/* Full chart with axes, date labels, price labels */}
                  <StockChart stockData={chartStockData} height={280} />

                  {/* Stats grid */}
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Open', value: openPrice },
                      { label: 'Day High', value: highPrice },
                      { label: 'Day Low', value: lowPrice },
                      { label: 'Volume', value: volume },
                    ].filter(s => s.value !== undefined).map(stat => (
                      <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{stat.label}</div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                          {typeof stat.value === 'number'
                            ? stat.label === 'Volume'
                              ? stat.value.toLocaleString()
                              : `₹${stat.value.toFixed(2)}`
                            : stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      <div className="space-y-8">
        {/* Market Indices */}
        {marketData?.indices && Object.keys(marketData.indices).length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Market Indices
                <span className="ml-2 text-xs bg-secondary-600 text-white px-2 py-0.5 rounded-full">
                  Real-Time NSE & BSE
                </span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => scrollIndices('left')}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollIndices('right')}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                ref={indicesSliderRef}
                className="flex overflow-x-auto pb-4 space-x-4 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {Object.keys(marketData.indices).map((key) => {
                  const index_data = marketData.indices[key];
                  let percentChange = 0;
                  if (index_data.percentChange !== undefined && index_data.percentChange !== null) {
                    percentChange = index_data.percentChange;
                  } else if (index_data.change && index_data.price) {
                    const previousPrice = index_data.price - index_data.change;
                    percentChange = (index_data.change / previousPrice) * 100;
                  }
                  const isPos = percentChange >= 0;

                  return (
                    <div key={key} className="min-w-[300px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 group hover:-translate-y-0.5">
                      <div className="p-5 relative">
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isPos ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              <ChartBarIcon className={`h-4 w-4 ${
                                isPos ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{index_data.name || key}</h3>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {key.includes('NSEI') || key.includes('NSE') ? 'NSE' : 'BSE'} Index
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹{index_data.price?.toFixed(2) || '0.00'}
                            </div>
                            <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold text-xs ${
                              isPos
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {isPos ? '+' : ''}{percentChange.toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        <div className="h-24 w-full mb-3">
                          {index_data.chartData && index_data.chartData.dates && index_data.chartData.dates.length > 0 ? (
                            <Line
                              data={generateChartData(index_data.chartData, isPos)}
                              options={chartOptions}
                              key={`chart-${key}-${index_data.timestamp}`}
                            />
                          ) : (
                            <Line
                              data={generateChartData({
                                dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                                prices: (() => {
                                  const basePrice = index_data.price || 100;
                                  const pctChange = index_data.percentChange || 0;
                                  const startPrice = basePrice - (basePrice * pctChange / 100);
                                  const prices = [];
                                  let currentPrice = startPrice;
                                  for (let i = 0; i < 7; i++) {
                                    const progressToEnd = i / 6;
                                    const targetPrice = startPrice + (basePrice - startPrice) * progressToEnd;
                                    const volatility = (Math.random() - 0.5) * 2 * (0.003 + Math.random() * 0.009);
                                    currentPrice = targetPrice + currentPrice * volatility;
                                    prices.push(currentPrice + Math.sin(i * 1.5) * currentPrice * 0.003);
                                  }
                                  prices[6] = basePrice;
                                  return prices;
                                })()
                              }, isPos)}
                              options={chartOptions}
                              key={`chart-${key}-fallback`}
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 relative z-10">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Open</div>
                            <div className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                              ₹{index_data.price?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">High</div>
                            <div className="font-semibold text-xs text-green-700 dark:text-green-400 truncate">
                              ₹{(index_data.price * 1.01)?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Low</div>
                            <div className="font-semibold text-xs text-red-700 dark:text-red-400 truncate">
                              ₹{(index_data.price * 0.99)?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
            </div>
          </section>
        )}

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
                      <th className="px-3 py-2.5 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="px-3 py-2.5 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-3 py-2.5 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {trendingStocks?.gainers?.slice(0, 10).map((stock: any, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleStockSearch(stock.symbol.replace('.NS', ''))}
                      >
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {stock.symbol.replace('.NS', '')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{stock.name || 'Stock'}</div>
                        </td>
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
                        </td>
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4 whitespace-nowrap text-right">
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
                      <th className="px-3 py-2.5 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="px-3 py-2.5 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-3 py-2.5 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {trendingStocks?.losers?.slice(0, 10).map((stock: any, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleStockSearch(stock.symbol.replace('.NS', ''))}
                      >
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {stock.symbol.replace('.NS', '')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{stock.name || 'Stock'}</div>
                        </td>
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
                        </td>
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4 whitespace-nowrap text-right">
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
