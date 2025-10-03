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
  type?: 'stock_price' | 'news_analysis' | 'finance_explanation' | 'general';
  metadata?: {
    model_used?: string;
    confidence?: number;
    stock_data?: any;
    sentiment?: string;
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
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [refreshUsage, setRefreshUsage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const getMessageIcon = (type?: string, sender?: string) => {
    if (sender === 'user') return null;
    
    switch (type) {
      case 'stock_price':
        return <ChartBarIcon className="h-4 w-4 text-green-500" />;
      case 'news_analysis':
        return <NewspaperIcon className="h-4 w-4 text-blue-500" />;
      case 'finance_explanation':
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

      const data = await marketService.nextGenChat(
        userMessage.text,
        sessionId,
        messages.slice(-5).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      );

      // Check for login requirement in response
      if (data.requires_login) {
        setError(data.message || 'Please log in to continue chatting.');
        setUsageInfo(data.usage_info);
        return;
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.response,
        timestamp: new Date(),
        type: data.query_type,
        metadata: {
          model_used: data.model_used,
          confidence: data.confidence,
          stock_data: data.stock_data,
          sentiment: data.sentiment
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      if (data.usage_info) {
        setUsageInfo(data.usage_info);
      }

      // Refresh usage counter
      setRefreshUsage(prev => prev + 1);

    } catch (err: any) {
      console.error('NextGen Chat Error:', err);

      // Check if trial exceeded
      if (err.response?.status === 403 && err.response?.data?.error === 'trial_exceeded') {
        setShowTrialModal(true);
        setError('Free trial limit reached. Please sign in to continue.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }

      // Add error message to chat
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        sender: 'ai',
        text: err.response?.data?.message || '⚠️ Sorry, I encountered an error. Please try again later.',
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

  return (
    <div className="flex flex-col h-screen">
      {/* Usage Indicator - Fixed position */}
      <UsageIndicator
        feature="welth-ai-assistant"
        featureDisplayName="AI Chat Assistant"
        refreshTrigger={refreshUsage}
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
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2">
                    {getMessageIcon(message.type, message.sender)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {message.metadata?.model_used && `via ${message.metadata.model_used}`}
                    </span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                
                <div className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </div>
                
                {message.metadata?.confidence && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Confidence: {Math.round(message.metadata.confidence * 100)}%
                  </div>
                )}
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