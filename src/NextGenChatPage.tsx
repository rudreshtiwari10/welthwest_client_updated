import React, { useState, useEffect, useRef } from 'react';

import { useAuth } from './contexts/AuthContext';
import UsageIndicator from './components/UsageIndicator';
import TrialExceededModal from './components/TrialExceededModal';
import FinanceAIChart from './components/FinanceAIChart';
import FinanceAIIndicators from './components/FinanceAIIndicators';
import WelthMarketTicker from './components/WelthMarketTicker';
import WelthThinking from './components/WelthThinking';
import WelthPromptCard from './components/WelthPromptCard';
import WelthResponse from './components/WelthResponse';
import WelthNewsCard from './components/WelthNewsCard';
import WelthFeatureCard from './components/WelthFeatureCard';
import useSessionStorage from './hooks/useSessionStorage';
import {
  PaperAirplaneIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DisplayPayload {
  kind: string;
  tool?: string;
  data: any;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  intent?: string;
  category?: string;
  chartBase64?: string;
  indicators?: any;
  stockData?: any;
  displayPayloads?: DisplayPayload[];
  metadata?: {
    stock_data?: any;
    entities?: {
      stocks?: string[];
      time_period?: string;
    };
  };
}

interface UsageInfo {
  remaining_messages: number;
  total_limit: number;
  reset_time?: string;
}

const TRENDING = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BAJFINANCE', 'ITC'];

const NextGenChatPage: React.FC = () => {
  const { user, getToken } = useAuth();
  const [messages, setMessages] = useSessionStorage<Message[]>('welth-ai-assistant-messages', []);

  useEffect(() => {
    console.log('[NextGenChatPage] Messages state updated:', messages.length, messages);
  }, [messages]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useSessionStorage<string | undefined>('welth-ai-assistant-session', undefined);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [refreshUsage, setRefreshUsage] = useState(0);
  const [anonymousUsesLeft, setAnonymousUsesLeft] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      const needsConversion = messages.some(msg => typeof msg.timestamp === 'string');
      if (needsConversion) {
        const convertedMessages = messages.map(msg => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }));
        setMessages(convertedMessages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const sendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || isLoading) return;

    if (!user) {
      window.location.href = '/login';
      return;
    }

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);

    try {
      const { marketService, activityService } = await import('./services/api');

      activityService.trackActivity(activityService.FEATURE_AI_ASSISTANT);

      const data = await marketService.welthChat(userMessage.text, currentSessionId);

      if (data.conversation_id) {
        setCurrentSessionId(data.conversation_id);
      }

      const aiResponseText = data.response || 'No response received';

      if (!aiResponseText || aiResponseText === 'No response received') {
        console.error('No valid response field in data:', data);
        setError('Unable to get a response from the AI. Please try again.');
        return;
      }

      let displayText = aiResponseText;
      if (data.disclaimer && data.tools_used && data.tools_used.length > 0) {
        displayText += `\n\n---\n*${data.disclaimer}*`;
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: displayText,
        timestamp: new Date(),
        chartBase64: data.chart_base64,
        indicators: data.indicators,
        stockData: data.symbol ? { symbol: data.symbol } : undefined,
        displayPayloads: Array.isArray(data.display_payloads) ? data.display_payloads : undefined,
        metadata: {
          stock_data: data.tools_used,
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);

      setRefreshUsage(prev => prev + 1);

    } catch (err: any) {
      console.error('NextGen Chat Error:', err);

      let errorText = 'Sorry, I encountered an error. Please try again later.';
      let displayError = 'An error occurred';

      if (err.response?.status === 403) {
        if (!user) {
          setAnonymousUsesLeft(0);
          window.location.href = '/login';
        }
        if (err.response?.data?.error === 'trial_exceeded' || err.response?.data?.error?.includes('limit')) {
          setShowTrialModal(true);
          displayError = 'Free trial limit reached. Please sign in to continue.';
          errorText = err.response?.data?.message || displayError;
        } else {
          displayError = err.response?.data?.error || err.response?.data?.message || 'Access denied';
          errorText = err.response?.data?.response || displayError;
        }
      } else if (err.response?.status === 500) {
        displayError = 'Server error. Please try again.';
        errorText = err.response?.data?.response || err.response?.data?.message || displayError;
      } else {
        displayError = err.response?.data?.message || err.message || 'An error occurred';
        errorText = err.response?.data?.response || displayError;
      }

      setError(displayError);

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        sender: 'ai',
        text: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasMessages = messages.length > 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    const currentFooterRef = footerRef.current;
    if (currentFooterRef) {
      observer.observe(currentFooterRef);
    }

    return () => {
      if (currentFooterRef) {
        observer.unobserve(currentFooterRef);
      }
    };
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();
  const firstName = user?.first_name || user?.username || 'trader';

  return (
    <div className="flex flex-col h-screen relative bg-light-bg-secondary dark:bg-dark-200 text-gray-900 dark:text-white">
      {user && (
        <UsageIndicator
          feature="welth-ai-assistant"
          featureDisplayName="Welth"
          refreshTrigger={refreshUsage}
          sessionId={currentSessionId}
        />
      )}

      <TrialExceededModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        feature="welth-ai-assistant"
        featureDisplayName="Welth"
        limit={10}
      />

      {/* Top: Brand bar */}
      <div className="border-b border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
              <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">W</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-mono text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  WELTH
                </h1>
                <span className="font-mono text-[10px] uppercase tracking-widest text-light-500 dark:text-light-400">
                  Research Terminal
                </span>
              </div>
              <p className="text-xs text-light-500 dark:text-light-400 mt-0.5">
                AI assistant for Indian equities, indices &amp; market intelligence
              </p>
            </div>
          </div>

          {!user && (
            <button
              onClick={() => window.location.href = '/login'}
              className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:text-white transition-colors"
            >
              Sign in to use Welth
            </button>
          )}
        </div>

        {/* Live ticker */}
        <WelthMarketTicker />
      </div>

      {/* Body */}
      <div className={`flex-1 overflow-y-auto ${!hasMessages ? '' : 'pb-44'} scroll-smooth`}>
        <div className="max-w-4xl mx-auto px-4 py-6">

          {/* Welcome / empty state */}
          {!hasMessages && (
            <div className="py-6">
              {/* Greeting */}
              <div className="mb-6">
                <div className="font-mono text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                  ◆ Welth · Session {(currentSessionId || 'new').toString().slice(0, 8)}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {greeting}, {firstName}.
                </h2>
                <p className="text-sm text-light-500 dark:text-light-400 mt-1">
                  Ask about a stock, an index move, recent news, or a finance concept. Welth pulls live market data,
                  runs technical analysis and synthesizes a research-grade answer.
                </p>
              </div>

              {/* Prompt cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <WelthPromptCard
                  accent="emerald"
                  label="Analyze"
                  title="Deep-dive a stock"
                  example="Run a technical analysis on RELIANCE for the last 6 months"
                  onClick={() => sendMessage('Run a technical analysis on RELIANCE for the last 6 months')}
                />
                <WelthPromptCard
                  accent="cyan"
                  label="Compare"
                  title="Compare two tickers"
                  example="Compare TCS vs INFY on valuation, growth and momentum"
                  onClick={() => sendMessage('Compare TCS vs INFY on valuation, growth and momentum')}
                />
                <WelthPromptCard
                  accent="amber"
                  label="Brief"
                  title="Today's market brief"
                  example="What moved Indian markets today? Cover NIFTY, sectors and key news"
                  onClick={() => sendMessage("What moved Indian markets today? Cover NIFTY, sectors and key news")}
                />
                <WelthPromptCard
                  accent="violet"
                  label="Learn"
                  title="Explain a concept"
                  example="Explain how RSI and MACD work together for trend confirmation"
                  onClick={() => sendMessage('Explain how RSI and MACD work together for trend confirmation')}
                />
              </div>

              {/* Trending tickers */}
              <div className="mt-8">
                <div className="font-mono text-[10px] uppercase tracking-widest text-light-500 dark:text-light-400 mb-2">
                  Trending tickers · tap to query
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => sendMessage(`Give me a quick read on ${sym}`)}
                      className="font-mono text-xs px-3 py-1.5 rounded border border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-100 text-gray-800 dark:text-light-200 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer footer */}
              <div className="mt-10 pt-4 border-t border-gray-200 dark:border-dark-50/60">
                <p className="font-mono text-[10px] text-light-400 dark:text-light-500 leading-relaxed">
                  Welth provides research and educational analysis, not investment advice.
                  Verify all data with your broker before acting. Markets carry risk of loss.
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI monogram */}
                {message.sender === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-md border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">W</span>
                  </div>
                )}

                <div className={`max-w-xs lg:max-w-2xl ${message.sender === 'user' ? 'text-right' : 'flex-1 min-w-0'}`}>
                  {/* Sender label */}
                  <div
                    className={`font-mono text-[10px] uppercase tracking-widest mb-1 ${
                      message.sender === 'user'
                        ? 'text-light-500 dark:text-light-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {message.sender === 'user' ? 'You' : 'Welth · response'}
                  </div>

                  {/* Body */}
                  {message.sender === 'ai' ? (
                    <div className="rounded-md border border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-100 px-4 py-3">
                      <WelthResponse text={message.text} />
                    </div>
                  ) : (
                    <div className="inline-block bg-gray-900 dark:bg-dark-50 text-white px-4 py-2.5 rounded-md border border-gray-900 dark:border-dark-50">
                      <div className="text-sm">{message.text}</div>
                    </div>
                  )}

                  {/* Bespoke tool payloads (news cards, feature suggestions, etc.) */}
                  {message.sender === 'ai' && message.displayPayloads && message.displayPayloads.length > 0 && (
                    <div className="space-y-3">
                      {message.displayPayloads.map((p, idx) => {
                        if (p.kind === 'news_list' && p.data?.items?.length) {
                          return (
                            <WelthNewsCard
                              key={`news-${idx}`}
                              kind={p.data.kind}
                              symbol={p.data.symbol}
                              count={p.data.count}
                              items={p.data.items}
                            />
                          );
                        }
                        if (p.kind === 'feature_suggestion' && p.data?.suggestions?.length) {
                          return (
                            <WelthFeatureCard
                              key={`feature-${idx}`}
                              suggestions={p.data.suggestions}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {/* Indicators */}
                  {message.sender === 'ai' && message.indicators && (
                    <FinanceAIIndicators
                      indicators={message.indicators}
                      symbol={message.stockData?.symbol}
                      currentPrice={message.stockData?.current_price}
                    />
                  )}

                  {/* Chart */}
                  {message.sender === 'ai' && message.chartBase64 && (
                    <FinanceAIChart
                      chartBase64={message.chartBase64}
                      title={`Technical Analysis`}
                      category={'technical_analysis'}
                    />
                  )}

                  {/* Stock data card */}
                  {message.sender === 'ai' && message.metadata?.stock_data && !message.chartBase64 && !message.indicators && (
                    <div className="mt-3 space-y-3">
                      {Object.entries(message.metadata.stock_data).map(([symbol, data]: [string, any]) => (
                        <div
                          key={symbol}
                          className="p-4 rounded-md border border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-100"
                        >
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {data.company_name || symbol}
                                </div>
                                <div className="font-mono text-[11px] text-light-500 dark:text-light-400 tracking-widest">
                                  {symbol}
                                </div>
                              </div>
                              {data.last_updated && (
                                <div className="flex items-center font-mono text-[10px] text-light-500 dark:text-light-400">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {new Date(data.last_updated).toLocaleString()}
                                </div>
                              )}
                            </div>

                            {data.current_price && (
                              <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-mono font-bold tabular-nums text-gray-900 dark:text-white">
                                  ₹{data.current_price.toFixed(2)}
                                </span>
                                {data.change && data.change_percent && (
                                  <span
                                    className={`font-mono text-sm font-medium tabular-nums ${
                                      data.change_percent >= 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    }`}
                                  >
                                    {data.change >= 0 ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)} (
                                    {data.change_percent >= 0 ? '+' : ''}
                                    {data.change_percent.toFixed(2)}%)
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
                              {data.day_high && data.day_low && (
                                <div className="text-light-500 dark:text-light-400">
                                  <span className="uppercase tracking-widest text-[9px] block">Day Range</span>
                                  <span className="text-gray-900 dark:text-light-200 tabular-nums">
                                    ₹{data.day_low.toFixed(2)} – ₹{data.day_high.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {data.volume && (
                                <div className="text-light-500 dark:text-light-400">
                                  <span className="uppercase tracking-widest text-[9px] block">Volume</span>
                                  <span className="text-gray-900 dark:text-light-200 tabular-nums">
                                    {data.volume.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {data.market_cap && data.market_cap !== 'N/A' && (
                                <div className="text-light-500 dark:text-light-400">
                                  <span className="uppercase tracking-widest text-[9px] block">Market Cap</span>
                                  <span className="text-gray-900 dark:text-light-200 tabular-nums">
                                    ₹{(data.market_cap / 10000000).toFixed(2)} Cr
                                  </span>
                                </div>
                              )}
                              {data.pe_ratio && data.pe_ratio !== 'N/A' && (
                                <div className="text-light-500 dark:text-light-400">
                                  <span className="uppercase tracking-widest text-[9px] block">P/E Ratio</span>
                                  <span className="text-gray-900 dark:text-light-200 tabular-nums">
                                    {typeof data.pe_ratio === 'number' ? data.pe_ratio.toFixed(2) : data.pe_ratio}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {data.chart_data && data.chart_data.dates && data.chart_data.prices && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <ChartBarIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-light-500 dark:text-light-400">
                                  30-Day Price Chart
                                </span>
                              </div>
                              <div className="bg-light-bg-secondary dark:bg-dark-200 p-2 rounded">
                                <Line
                                  data={{
                                    labels: data.chart_data.dates,
                                    datasets: [
                                      {
                                        label: 'Price (₹)',
                                        data: data.chart_data.prices,
                                        borderColor:
                                          data.change_percent >= 0 ? 'rgb(16, 185, 129)' : 'rgb(244, 63, 94)',
                                        backgroundColor:
                                          data.change_percent >= 0
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'rgba(244, 63, 94, 0.1)',
                                        fill: true,
                                        tension: 0.4,
                                        pointRadius: 0,
                                        borderWidth: 2
                                      }
                                    ]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: { display: false },
                                      tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                        callbacks: {
                                          label: function(context: any) {
                                            return `₹${context.parsed.y.toFixed(2)}`;
                                          }
                                        }
                                      }
                                    },
                                    scales: {
                                      x: {
                                        display: true,
                                        grid: { display: false },
                                        ticks: { maxTicksLimit: 6, font: { size: 10 } }
                                      },
                                      y: {
                                        display: true,
                                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                                        ticks: {
                                          font: { size: 10 },
                                          callback: function(value: any) {
                                            return '₹' + value.toFixed(0);
                                          }
                                        }
                                      }
                                    }
                                  }}
                                  height={180}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="font-mono text-[10px] text-light-400 dark:text-light-500 mt-1.5 tabular-nums">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>

                {/* User monogram */}
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-md border border-gray-300 dark:border-dark-50/60 bg-gray-100 dark:bg-dark-100 flex items-center justify-center">
                    <span className="font-mono text-[11px] font-bold text-gray-700 dark:text-light-200">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && <WelthThinking />}

            {error && (
              <div className="rounded-md border border-rose-500/40 bg-rose-50 dark:bg-rose-900/10 p-4">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-rose-500" />
                  <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
                </div>
                {!user && error.includes('log in') && (
                  <div className="mt-3">
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-rose-600 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                    >
                      Log In to Continue
                    </button>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Command bar input */}
      <div
        className={`${isFooterVisible ? 'absolute' : 'fixed'} ${
          isFooterVisible ? 'bottom-24' : 'bottom-6'
        } left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 transition-all duration-300 ease-in-out`}
        style={{ zIndex: 100 }}
      >
        <div className="rounded-md border border-gray-300 dark:border-dark-50/80 bg-white dark:bg-dark-100 shadow-2xl">
          {/* Hint row */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 dark:border-dark-50/60">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-light-500 dark:text-light-400">
              <CommandLineIcon className="h-3 w-3" />
              <span>Welth Console</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-light-400 dark:text-light-500">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-50 bg-light-bg-secondary dark:bg-dark-200">
                ⏎
              </kbd>
              <span>send</span>
              <span className="mx-1">·</span>
              <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-50 bg-light-bg-secondary dark:bg-dark-200">
                shift+⏎
              </kbd>
              <span>newline</span>
            </div>
          </div>

          <div className="flex items-end gap-2 p-2">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Query a ticker, request analysis, or ask a finance question…"
                disabled={isLoading}
                rows={1}
                className="w-full px-3 py-2.5 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-sm text-gray-900 dark:text-white placeholder-light-400 dark:placeholder-light-500 disabled:opacity-50 font-mono"
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  height: Math.min(120, Math.max(44, input.split('\n').length * 24))
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="px-4 h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div ref={footerRef} className="h-1"></div>
    </div>
  );
};

export default NextGenChatPage;
