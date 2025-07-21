import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { marketService } from '../services/api';
import SubscriptionBanner from './subscription/SubscriptionBanner';
import UsageTracker from './subscription/UsageTracker';
import LimitExceededModal from './subscription/LimitExceededModal';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const { canUseLLM, incrementLLMUsage } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Welth AI assistant. Ask me anything about stocks, market trends, or investment strategies.',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('openrouter'); // Default model
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'Market Analysis',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      preview: 'Discussion about tech stocks and market trends'
    },
    {
      id: 'session-2',
      title: 'Investment Strategy',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      preview: 'Long-term investment planning and portfolio diversification'
    },
    {
      id: 'session-3',
      title: 'Stock Recommendations',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
      preview: 'Analysis of potential growth stocks in tech sector'
    }
  ]);
  const [activeSession, setActiveSession] = useState<string>('current');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const placeholders = [
    "Ask about investment strategies...",
    "Inquire about stock market trends...",
    "Get insights on portfolio diversification...",
    "Learn about market indicators...",
    "Discover top performing sectors..."
  ];
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Check if user can use LLM
    if (!canUseLLM()) {
      setShowLimitModal(true);
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Use the new AI chat service
      const response = await marketService.chatWithAI(
        input.trim(),
        selectedModel,
        user?.id
      );
      
      // Increment usage after successful response
      await incrementLLMUsage();
      
      // Create response message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.analysis,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If there's stock data, add it as a separate message
      if (response.stock_data && Object.keys(response.stock_data).length > 0) {
        const symbol = Object.keys(response.stock_data)[0];
        const stockData = response.stock_data[symbol];
        
        if (stockData) {
          const stockMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: `Additional data for ${symbol}:\n\nPrice: $${stockData.current_price?.toFixed(2) || 'N/A'}\nChange: ${stockData.change?.percent >= 0 ? '+' : ''}${stockData.change?.percent?.toFixed(2) || 'N/A'}%`,
            sender: 'assistant',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, stockMessage]);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Convert error to string to avoid rendering objects directly
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m sorry, I encountered an error while processing your request. Please try again later.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewChat = () => {
    // Save current chat as a session if it has messages from user
    if (messages.some(m => m.sender === 'user')) {
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: `Chat ${chatSessions.length + 1}`,
        timestamp: new Date(),
        preview: messages.find(m => m.sender === 'user')?.text.substring(0, 30) + '...' || 'New chat'
      };
      
      setChatSessions(prev => [newSession, ...prev]);
    }
    
    // Reset current chat
    setMessages([{
      id: '1',
      text: 'Hello! I\'m your Welth AI assistant. Ask me anything about stocks, market trends, or investment strategies.',
      sender: 'assistant',
      timestamp: new Date(),
    }]);
    setActiveSession('current');
  };
  
  const handleSelectSession = (sessionId: string) => {
    // In a real app, you would load the messages for this session from backend
    setActiveSession(sessionId);
    // For now, just show a placeholder message
    setMessages([{
      id: '1',
      text: `This is a previous chat session (${sessionId}). In a real app, these messages would be loaded from the database.`,
      sender: 'assistant',
      timestamp: new Date(),
    }]);
  };
  
  return (
    <div className="flex flex-col h-full">
      <SubscriptionBanner />
      
      <div className="flex flex-grow h-[500px] bg-gray-50 dark:bg-dark-400 rounded-lg">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-grow w-3/4 border-r border-gray-200 dark:border-gray-700">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-dark-300 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {message.sender === 'assistant' && (
                    <div className="flex items-center mb-1">
                      <div className="w-6 h-6 mr-2">
                        <div className="flex items-center justify-center w-full h-full bg-primary-600 rounded-full">
                          <span className="text-xs font-bold text-white">W</span>
                        </div>
                      </div>
                      <span className="font-medium text-sm text-primary-600 dark:text-primary-400">Welth AI</span>
                    </div>
                  )}
                  {message.sender === 'user' && (
                    <div className="flex items-center justify-end mb-1">
                      <span className="font-medium text-sm text-primary-100">You</span>
                      <div className="w-5 h-5 ml-2 text-primary-100">
                        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                          <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-primary-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-300 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`px-4 py-2 rounded-lg ${
                  isLoading || !input.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                } text-white transition-colors duration-200`}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-1/4 p-4 bg-white dark:bg-dark-300 rounded-r-lg">
          <UsageTracker />
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Previous Chats</h3>
            <div className="space-y-4">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    activeSession === session.id
                      ? 'bg-primary-50 dark:bg-primary-900'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-400'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {session.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {session.preview}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {session.timestamp.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Limit Exceeded Modal */}
      <LimitExceededModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureType="llm"
        message="You have reached your daily limit for AI queries. Please upgrade your plan to continue using the AI assistant."
      />
    </div>
  );
};

export default ChatInterface; 