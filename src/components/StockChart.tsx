import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface IndicatorData {
  dates: string[];
  values?: number[];
  macd?: number[];
  signal?: number[];
  histogram?: number[];
  upper?: number[];
  middle?: number[];
  lower?: number[];
  k?: number[];
  d?: number[];
  current: any;
}

interface StockChartProps {
  stockData: {
    symbol: string;
    name?: string;
    company_name?: string;
    data?: Array<{
      Date?: string;
      Open?: number;
      High?: number;
      Low?: number;
      Close?: number;
      Volume?: number;
    }>;
    chart_data?: {
      dates: string[];
      prices: number[];
    };
    year_change_pct?: number;
    change?: {
      percent?: number;
    };
    percentChange?: number;
  };
  indicators?: {
    [key: string]: IndicatorData;
  };
  height?: number;
}

const StockChart: React.FC<StockChartProps> = ({ stockData, indicators, height = 400 }) => {
  const [chartData, setChartData] = useState<any>(null);
  
  useEffect(() => {
    if (!stockData) return;
    
    // Determine if the stock has positive or negative change
    const isPositiveChange = 
      stockData.percentChange !== undefined ? stockData.percentChange >= 0 :
      stockData.year_change_pct ? stockData.year_change_pct >= 0 : 
      stockData.change?.percent ? stockData.change.percent >= 0 : true;
    
    const primaryColor = isPositiveChange ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)';
    const secondaryColor = isPositiveChange ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    
    let datasets = [];
    let labels: string[] = [];
    
    // Add price data
    if (stockData.data && Array.isArray(stockData.data) && stockData.data.length > 0) {
      labels = stockData.data.map(item => item.Date || '');
      const prices = stockData.data.map(item => item.Close || 0);
      
      datasets.push({
        label: stockData.symbol,
        data: prices,
        borderColor: primaryColor,
        backgroundColor: secondaryColor,
        tension: 0.4,
        fill: true,
      });
    }
    // Use legacy chart_data if available
    else if (stockData.chart_data && 
        Array.isArray(stockData.chart_data.dates) && 
        Array.isArray(stockData.chart_data.prices)) {
      labels = stockData.chart_data.dates;
      datasets.push({
        label: stockData.symbol,
        data: stockData.chart_data.prices,
        borderColor: primaryColor,
        backgroundColor: secondaryColor,
        tension: 0.4,
        fill: true,
      });
    }
    
    // Add indicator data
    if (indicators) {
      Object.entries(indicators).forEach(([name, data]) => {
        // Use indicator dates if available
        if (data.dates && data.dates.length > 0) {
          labels = data.dates;
        }
        
        const indicatorColors = {
          rsi: 'rgba(75, 192, 192, 1)',
          macd: {
            line: 'rgba(54, 162, 235, 1)',
            signal: 'rgba(255, 99, 132, 1)',
            histogram: 'rgba(153, 102, 255, 0.5)'
          },
          bollinger: {
            upper: 'rgba(255, 99, 132, 1)',
            middle: 'rgba(54, 162, 235, 1)',
            lower: 'rgba(75, 192, 192, 1)'
          },
          sma: 'rgba(255, 159, 64, 1)',
          ema: 'rgba(153, 102, 255, 1)',
          stochastic: {
            k: 'rgba(54, 162, 235, 1)',
            d: 'rgba(255, 99, 132, 1)'
          },
          atr: 'rgba(255, 206, 86, 1)',
          obv: 'rgba(75, 192, 192, 1)',
          vwap: 'rgba(153, 102, 255, 1)'
        };
        
        // Add simple indicators (single line)
        if (data.values) {
          datasets.push({
            label: name.toUpperCase(),
            data: data.values,
            borderColor: indicatorColors[name as keyof typeof indicatorColors] || 'rgba(75, 192, 192, 1)',
            tension: 0.4,
            fill: false,
          });
        }
        
        // Add MACD
        if (name === 'macd' && data.macd && data.signal && data.histogram) {
          datasets.push(
            {
              label: 'MACD Line',
              data: data.macd,
              borderColor: indicatorColors.macd.line,
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Signal Line',
              data: data.signal,
              borderColor: indicatorColors.macd.signal,
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Histogram',
              data: data.histogram,
              type: 'bar',
              backgroundColor: indicatorColors.macd.histogram,
            }
          );
        }
        
        // Add Bollinger Bands
        if (name === 'bollinger' && data.upper && data.middle && data.lower) {
          datasets.push(
            {
              label: 'Upper Band',
              data: data.upper,
              borderColor: indicatorColors.bollinger.upper,
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Middle Band',
              data: data.middle,
              borderColor: indicatorColors.bollinger.middle,
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Lower Band',
              data: data.lower,
              borderColor: indicatorColors.bollinger.lower,
              tension: 0.4,
              fill: false,
            }
          );
        }
        
        // Add Stochastic
        if (name === 'stochastic' && data.k && data.d) {
          datasets.push(
            {
              label: '%K Line',
              data: data.k,
              borderColor: indicatorColors.stochastic.k,
              tension: 0.4,
              fill: false,
            },
            {
              label: '%D Line',
              data: data.d,
              borderColor: indicatorColors.stochastic.d,
              tension: 0.4,
              fill: false,
            }
          );
        }
      });
    }
    
    setChartData({
      labels,
      datasets,
    });
  }, [stockData, indicators]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          maxRotation: 0,
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };
  
  if (!chartData) {
    return (
      <div 
        style={{ height: `${height}px` }}
        className="flex items-center justify-center bg-gray-50 dark:bg-dark-400 rounded-lg"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StockChart; 