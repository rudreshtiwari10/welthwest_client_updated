import React, { useState, useEffect, useRef } from 'react';

import { useAuth } from './contexts/AuthContext';
import UsageIndicator from './components/UsageIndicator';
import TrialExceededModal from './components/TrialExceededModal';
import FinanceAIChart from './components/FinanceAIChart';
import FinanceAIIndicators from './components/FinanceAIIndicators';
import useSessionStorage from './hooks/useSessionStorage';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ChartBarIcon,
  NewspaperIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  ClockIcon,
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

// Register ChartJS components
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

const NextGenChatPage: React.FC = () => {
  const { user, getToken } = useAuth();
  const [messages, setMessages] = useSessionStorage<Message[]>('welth-ai-assistant-messages', []);

  // Debug logging for messages
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

  // Convert timestamp strings back to Date objects when loading from sessionStorage
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
  }, []); // Run only once on mount

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const getMessageIcon = (intent?: string, sender?: string) => {
    if (sender === 'user') return null;

    switch (intent) {
      case 'stock_query':
        return <ChartBarIcon className="h-4 w-4 text-green-500" />;
      case 'recommendation':
        return <SparklesIcon className="h-4 w-4 text-yellow-500" />;
      case 'market_overview':
        return <NewspaperIcon className="h-4 w-4 text-blue-500" />;
      case 'technical_analysis':
      case 'fundamental_analysis':
        return <ChartBarIcon className="h-4 w-4 text-purple-500" />;
      case 'learning':
        return <SparklesIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <CpuChipIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Block anonymous users — must login to use
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('Adding user message:', userMessage);
      console.log('Total messages after adding user message:', newMessages.length);
      console.log('All messages:', newMessages);
      return newMessages;
    });
    setInput('');
    setIsLoading(true);
    setError(null);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);

    try {
      // Import API service
      const { marketService, activityService } = await import('./services/api');

      // Track activity
      activityService.trackActivity(activityService.FEATURE_AI_ASSISTANT);

      console.log('Sending message to Welth Agent API');

      const data = await marketService.welthChat(userMessage.text, currentSessionId);

      console.log('Welth Agent response:', data);

      // Store conversation_id for continuity
      if (data.conversation_id) {
        setCurrentSessionId(data.conversation_id);
      }

      // Extract AI response
      const aiResponseText = data.response || 'No response received';

      if (!aiResponseText || aiResponseText === 'No response received') {
        console.error('No valid response field in data:', data);
        setError('Unable to get a response from the AI. Please try again.');
        return;
      }

      // Only append disclaimer when financial tools were actually used
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
        metadata: {
          stock_data: data.tools_used,
        }
      };

      console.log('Adding AI message:', aiMessage);
      console.log('Message text:', aiMessage.text);
      console.log('Tools used:', data.tools_used);
      console.log('Has chart:', !!data.chart_base64);
      console.log('Has indicators:', !!data.indicators);
      console.log('Elapsed ms:', data.elapsed_ms);
      setMessages(prev => [...prev, aiMessage]);

      // Scroll to bottom after adding AI response
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);

      // Refresh usage counter
      setRefreshUsage(prev => prev + 1);

    } catch (err: any) {
      console.error('NextGen Chat Error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);

      let errorText = '⚠️ Sorry, I encountered an error. Please try again later.';
      let displayError = 'An error occurred';

      // Check if trial exceeded
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
        // Backend might send a user-friendly error in 'response' field even for 500 errors
        errorText = err.response?.data?.response || err.response?.data?.message || displayError;
      } else {
        displayError = err.response?.data?.message || err.message || 'An error occurred';
        errorText = err.response?.data?.response || displayError;
      }

      setError(displayError);

      // Add error message to chat
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        sender: 'ai',
        text: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      // Scroll to bottom after adding error message
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

  const formatAIResponse = (text: string) => {
    // Remove common AI response prefixes and suffixes
    let formatted = text.trim();

    // Split into paragraphs for better spacing
    const paragraphs = formatted.split('\n\n').filter(p => p.trim());

    return paragraphs.map((para, idx) => {
      // Check if it's a list item (starts with -, •, or number)
      const lines = para.split('\n');
      const isList = lines.some(line => /^[-•]\s/.test(line.trim()) || /^\d+\.\s/.test(line.trim()));

      if (isList) {
        return (
          <div key={idx} className="mb-4 last:mb-0">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Format list items
              const cleaned = trimmed.replace(/^[-•]\s/, '').replace(/^\d+\.\s/, '');
              return (
                <div key={lineIdx} className="flex items-start mb-2 last:mb-0">
                  <span className="text-purple-500 dark:text-purple-400 mr-2 mt-1">•</span>
                  <span className="flex-1">{cleaned}</span>
                </div>
              );
            })}
          </div>
        );
      }

      // Regular paragraph
      return (
        <p key={idx} className="mb-4 last:mb-0 leading-relaxed">
          {para}
        </p>
      );
    });
  };

  const hasMessages = messages.length > 0;

  // Detect when footer is visible
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

  return (
    <div className="flex flex-col h-screen relative">
      {/* Usage Indicator - Only for authenticated users */}
      {user && (
        <UsageIndicator
          feature="welth-ai-assistant"
          featureDisplayName="Welth"
          refreshTrigger={refreshUsage}
          sessionId={currentSessionId}
        />
      )}

      {/* Trial Exceeded Modal */}
      <TrialExceededModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        feature="welth-ai-assistant"
        featureDisplayName="Welth"
        limit={10}
      />


      {/* Header */}
      <div className="@ p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Welth
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your WelthWest research assistant for Indian markets
              </p>
            </div>
          </div>
          
          {/* Login prompt for non-authenticated users */}
          {!user && (
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 rounded-lg shadow-lg flex items-center space-x-2 hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <SparklesIcon className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">Login to Use Welth</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 overflow-y-auto p-4 ${!hasMessages ? 'flex items-center justify-center' : 'pb-40'} scroll-smooth`}>
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Welcome Message - show when no messages */}
          {!hasMessages && (
            <div className="text-center py-12 mb-32">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Welth
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Ask me about stock prices, financial news, trading concepts, or general finance questions.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
                  Stock Prices
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                  News Analysis
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  Finance Education
                </span>
              </div>
            </div>
          )}

          {messages.map((message) => {
            console.log('Rendering message:', message.id, 'sender:', message.sender, 'text:', message.text);
            return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI Avatar */}
              {message.sender === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-xs lg:max-w-2xl ${message.sender === 'user' ? 'text-right' : ''}`}>
                {/* Message sender label */}
                <div className={`text-xs font-medium mb-1 ${
                  message.sender === 'user'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-purple-600 dark:text-purple-400'
                }`}>
                  {message.sender === 'user' ? 'You' : 'Welth'}
                </div>

                {/* Message content */}
                {message.sender === 'ai' ? (
                  <div className="text-sm text-gray-900 dark:text-gray-100">{formatAIResponse(message.text)}</div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md">
                    <div className="text-sm">{message.text}</div>
                  </div>
                )}

                {/* Finance AI Indicators */}
                {message.sender === 'ai' && message.indicators && (
                  <FinanceAIIndicators
                    indicators={message.indicators}
                    symbol={message.stockData?.symbol}
                    currentPrice={message.stockData?.current_price}
                  />
                )}

                {/* Finance AI Chart */}
                {message.sender === 'ai' && message.chartBase64 && (
                  <FinanceAIChart
                    chartBase64={message.chartBase64}
                    title={`TECHNICAL ANALYSIS Analysis`}
                    category={'technical_analysis'}
                  />
                )}

                {/* Stock Data Display with Charts (Old format - hide for Finance AI responses) */}
                {message.sender === 'ai' && message.metadata?.stock_data && !message.chartBase64 && !message.indicators && (
                  <div className="mt-3 space-y-3">
                    {Object.entries(message.metadata.stock_data).map(([symbol, data]: [string, any]) => (
                      <div key={symbol} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        {/* Stock Info Header */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {data.company_name || symbol}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{symbol}</div>
                            </div>
                            {data.last_updated && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {new Date(data.last_updated).toLocaleString()}
                              </div>
                            )}
                          </div>

                          {data.current_price && (
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{data.current_price.toFixed(2)}
                              </span>
                              {data.change && data.change_percent && (
                                <span className={`text-sm font-medium ${data.change_percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.change_percent >= 0 ? '+' : ''}{data.change_percent.toFixed(2)}%)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            {data.day_high && data.day_low && (
                              <div className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Day Range:</span> ₹{data.day_low.toFixed(2)} - ₹{data.day_high.toFixed(2)}
                              </div>
                            )}
                            {data.volume && (
                              <div className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Volume:</span> {data.volume.toLocaleString()}
                              </div>
                            )}
                            {data.market_cap && data.market_cap !== 'N/A' && (
                              <div className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Market Cap:</span> ₹{(data.market_cap / 10000000).toFixed(2)}Cr
                              </div>
                            )}
                            {data.pe_ratio && data.pe_ratio !== 'N/A' && (
                              <div className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">P/E Ratio:</span> {typeof data.pe_ratio === 'number' ? data.pe_ratio.toFixed(2) : data.pe_ratio}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price Chart */}
                        {data.chart_data && data.chart_data.dates && data.chart_data.prices && (
                          <div className="mt-4">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">30-Day Price Chart</h5>
                            <div className="bg-white dark:bg-gray-900 p-2 rounded">
                              <Line
                                data={{
                                  labels: data.chart_data.dates,
                                  datasets: [
                                    {
                                      label: 'Price (₹)',
                                      data: data.chart_data.prices,
                                      borderColor: data.change_percent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                                      backgroundColor: data.change_percent >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
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
                                    legend: {
                                      display: false
                                    },
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
                                      grid: {
                                        display: false
                                      },
                                      ticks: {
                                        maxTicksLimit: 6,
                                        font: {
                                          size: 10
                                        }
                                      }
                                    },
                                    y: {
                                      display: true,
                                      grid: {
                                        color: 'rgba(0, 0, 0, 0.05)'
                                      },
                                      ticks: {
                                        font: {
                                          size: 10
                                        },
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

                {/* Timestamp */}
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>

              {/* User Avatar */}
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                </div>
              )}
            </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
              {!user && error.includes('log in') && (
                <div className="mt-3">
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
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

      {/* Dynamic Island Input - Fixed at bottom, floating style */}
      <div className={`${isFooterVisible ? 'absolute' : 'fixed'} ${isFooterVisible ? 'bottom-24' : 'bottom-6'} left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 transition-all duration-300 ease-in-out`} style={{ zIndex: 100 }}>
        {/* Floating Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 backdrop-blur-xl bg-opacity-98 dark:bg-opacity-98">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Welth..."
                disabled={isLoading}
                rows={1}
                className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 transition-all"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: Math.min(120, Math.max(48, input.split('\n').length * 24))
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center justify-center min-w-[48px] h-[48px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer marker for intersection observer */}
      <div ref={footerRef} className="h-1"></div>
    </div>
  );
};

export default NextGenChatPage;