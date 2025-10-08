import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import UsageIndicator from './components/UsageIndicator';
import TrialExceededModal from './components/TrialExceededModal';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ChartBarIcon,
  NewspaperIcon,
  CpuChipIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  intent?: string;
  metadata?: {
    model_used?: string;
    stock_data?: any;
    entities?: {
      stocks?: string[];
      time_period?: string;
    };
    tool_suggestions?: Array<{
      tool_name: string;
      description: string;
      url: string;
      relevance: string;
    }>;
    follow_up_questions?: string[];
  };
}

interface UsageInfo {
  remaining_messages: number;
  total_limit: number;
  reset_time?: string;
}

const NextGenChatPage: React.FC = () => {
  const { user, getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [refreshUsage, setRefreshUsage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

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

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Import API service
      const { marketService } = await import('./services/api');

      console.log('Sending message with sessionId:', currentSessionId);
      let data = await marketService.enhancedChat(
        userMessage.text,
        currentSessionId
      );

      console.log('Enhanced chat response:', data);

      // Check if response contains session creation info (first request without session_id)
      if (data.session_id && !data.response && data.message) {
        console.log('Session created:', data.session_id, '- Retrying with session...');
        setCurrentSessionId(data.session_id);

        // Retry the request with the new session_id
        data = await marketService.enhancedChat(
          userMessage.text,
          data.session_id
        );
        console.log('Retry response with session:', data);
      }

      // Check for login requirement in response
      if (data.requires_login) {
        setError(data.message || 'Please log in to continue chatting.');
        setUsageInfo(data.usage_info);
        return;
      }

      // Check if we have a valid response
      if (!data.response) {
        console.error('No response field in data:', data);
        setError('Invalid response from server. Please try again.');
        return;
      }

      // Update session ID if provided
      if (data.session_id && data.session_id !== currentSessionId) {
        setCurrentSessionId(data.session_id);
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.response || 'No response received',
        timestamp: new Date(),
        intent: data.intent,
        metadata: {
          model_used: data.model_used,
          stock_data: data.stock_data,
          entities: data.entities,
          tool_suggestions: data.tool_suggestions,
          follow_up_questions: data.follow_up_questions
        }
      };

      console.log('Adding AI message:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);

      if (data.usage_info) {
        setUsageInfo(data.usage_info);
      }

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

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAIResponse = (text: string) => {
    // Remove asterisks used for bold/emphasis
    let formatted = text.replace(/\*\*/g, '').replace(/\*/g, '');

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
                  <span className="text-blue-500 mr-2 mt-1">•</span>
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

  return (
    <div className="flex flex-col h-screen">
      {/* Usage Indicator - Fixed position */}
      <UsageIndicator
        feature="welth-ai-assistant"
        featureDisplayName="AI Chat Assistant"
        refreshTrigger={refreshUsage}
        sessionId={currentSessionId}
      />

      {/* Trial Exceeded Modal */}
      <TrialExceededModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        feature="welth-ai-assistant"
        featureDisplayName="AI Chat Assistant"
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
                WelthAI Chat Assistant
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Powered by multiple AI models for enhanced accuracy
              </p>
            </div>
          </div>
          
          {/* Usage Info for Anonymous Users */}
          {!user && usageInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {usageInfo.remaining_messages}/{usageInfo.total_limit} free messages
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to WelthAI Chat Assistant
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Ask me about stock prices, financial news analysis, trading concepts, or general finance questions. 
                I use multiple AI models to provide accurate, comprehensive answers.
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

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mb-3">
                    {getMessageIcon(message.intent, message.sender)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {message.metadata?.model_used && `via ${message.metadata.model_used}`}
                      {message.intent && ` • ${message.intent.replace('_', ' ')}`}
                    </span>
                  </div>
                )}

                {message.sender === 'ai' ? (
                  <div className="text-sm">{formatAIResponse(message.text)}</div>
                ) : (
                  <div className="text-sm">{message.text}</div>
                )}

                {/* Stock Data Display */}
                {message.sender === 'ai' && message.metadata?.stock_data && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Stock Data</h4>
                    {Object.entries(message.metadata.stock_data).map(([symbol, data]: [string, any]) => (
                      <div key={symbol} className="text-xs mb-2 last:mb-0">
                        <div className="font-medium text-gray-900 dark:text-white">{symbol}</div>
                        {data.current_price && (
                          <div className="text-gray-600 dark:text-gray-400">
                            Price: ₹{data.current_price.toFixed(2)}
                            {data.change_percent && (
                              <span className={`ml-2 ${data.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({data.change_percent >= 0 ? '+' : ''}{data.change_percent.toFixed(2)}%)
                              </span>
                            )}
                          </div>
                        )}
                        {data.day_high && data.day_low && (
                          <div className="text-gray-600 dark:text-gray-400">
                            Range: ₹{data.day_low.toFixed(2)} - ₹{data.day_high.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tool Suggestions */}
                {message.sender === 'ai' && message.metadata?.tool_suggestions && message.metadata.tool_suggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Suggested Tools</h4>
                    <div className="space-y-2">
                      {message.metadata.tool_suggestions.map((tool, idx) => (
                        <a
                          key={idx}
                          href={tool.url}
                          className="block text-xs p-2 bg-white dark:bg-gray-800 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="font-medium text-blue-600 dark:text-blue-400">{tool.tool_name}</div>
                          <div className="text-gray-600 dark:text-gray-400">{tool.description}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Questions */}
                {message.sender === 'ai' && message.metadata?.follow_up_questions && message.metadata.follow_up_questions.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">You might also ask:</h4>
                    <div className="space-y-1">
                      {message.metadata.follow_up_questions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(question)}
                          className="block w-full text-left text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

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

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about stock prices, financial news, trading concepts..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
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
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            WelthAI uses multiple models for enhanced financial insights. Always consult professionals for investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NextGenChatPage;