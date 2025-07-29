import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { marketService, userDataService } from '../services/api';
import SubscriptionBanner from './subscription/SubscriptionBanner';
import UsageTracker from './subscription/UsageTracker';
import LimitExceededModal from './subscription/LimitExceededModal';
import LoginModal from './LoginModal';
import ChatHistorySidebar from './ChatHistorySidebar';

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

interface AnonymousSessionState {
  sessionId: string | null;
  remainingMessages: number;
  loginRequired: boolean;
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [anonymousSession, setAnonymousSession] = useState<AnonymousSessionState>({
    sessionId: null,
    remainingMessages: 5,
    loginRequired: false
  });
  const [saveStatus, setSaveStatus] = useState<{saving: boolean, success?: boolean, message?: string}>({saving: false});
  
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

  // Save chat history function
  const handleSaveChat = async () => {
    if (!user || messages.length <= 1) return;
    
    try {
      setSaveStatus({ saving: true });
      
      // Extract conversation for saving
      const conversation = messages.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp.toISOString()
      }));
      
      // Prepare chat data to save
      const chat_data = {
        title: `Chat - ${new Date().toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        conversation: conversation,
        model: selectedModel
      };
      
      // Save chat history
      const response = await userDataService.saveChatHistory(chat_data);
      
      setSaveStatus({ 
        saving: false, 
        success: response.success, 
        message: response.message 
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSaveStatus({ saving: false });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving chat history:', error);
      setSaveStatus({ 
        saving: false, 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to save chat history' 
      });
    }
  };

  // Function to load a conversation from chat history
  const handleLoadConversation = (conversation: Array<{text: string; sender: 'user' | 'assistant'; timestamp: string}>) => {
    // Convert the string timestamps to Date objects
    const formattedConversation = conversation.map(msg => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      text: msg.text,
      sender: msg.sender,
      timestamp: new Date(msg.timestamp)
    }));
    
    setMessages(formattedConversation);
  };

  // Initialize anonymous session for non-authenticated users
  useEffect(() => {
    const initializeSession = async () => {
      if (!user && !anonymousSession.sessionId) {
        try {
          // Make initial request to get session ID
          const response = await marketService.anonymousChatWithAI(
            "Hello",
            undefined,
            selectedModel
          );
          
          if (response.session_id) {
            setAnonymousSession({
              sessionId: response.session_id,
              remainingMessages: response.remaining_messages || 5,
              loginRequired: false
            });
            
            // Replace initial message with response
            setMessages([
              {
                id: '1',
                text: response.response || 'Hello! I\'m your Welth AI assistant. Ask me anything about stocks, market trends, or investment strategies.',
                sender: 'assistant',
                timestamp: new Date(),
              }
            ]);
          }
        } catch (error) {
          console.error('Error initializing anonymous session:', error);
        }
      }
    };
    
    initializeSession();
  }, [user]);
  
  const handleLoginSuccess = () => {
    // Reset session state after login
    setAnonymousSession({
      sessionId: null,
      remainingMessages: 0,
      loginRequired: false
    });
    setShowLoginModal(false);
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
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
      let response: any;
      let shouldUseMarketChat = false;
      
      // Determine which API to use
      if (!user) {
        // Not logged in - use free anonymous chat
        if (anonymousSession.loginRequired) {
          // Anonymous limit exceeded, show login modal
          setShowLoginModal(true);
          setIsLoading(false);
          return;
        }
        
        try {
          response = await marketService.anonymousChatWithAI(
            input.trim(),
            anonymousSession.sessionId || undefined,
            selectedModel
          );
          
          // Update session state from response
          if (response.session_id) {
            setAnonymousSession(prev => ({
              sessionId: response.session_id,
              remainingMessages: response.remaining_messages || 0,
              loginRequired: response.login_required || false
            }));
          }
        } catch (error: any) {
          // If anonymous chat fails due to limits, suggest login
          if (error.response?.status === 403) {
            setAnonymousSession(prev => ({
              ...prev,
              loginRequired: true,
              remainingMessages: 0
            }));
            setShowLoginModal(true);
            setIsLoading(false);
            return;
          }
          throw error;
        }
      } else {
        // User is logged in
        if (anonymousSession.loginRequired || !canUseLLM()) {
          // Use market chat API for authenticated users
          shouldUseMarketChat = true;
          response = await marketService.chatWithAI(
            input.trim(),
            selectedModel,
            user?.id
          );
          
          // Increment usage after successful response
          await incrementLLMUsage();
        } else {
          // Still have free messages, use anonymous chat
          try {
            response = await marketService.anonymousChatWithAI(
              input.trim(),
              anonymousSession.sessionId || undefined,
              selectedModel
            );
            
            // Update session state from response
            if (response.session_id) {
              setAnonymousSession(prev => ({
                sessionId: response.session_id,
                remainingMessages: response.remaining_messages || 0,
                loginRequired: response.login_required || false
              }));
            }
          } catch (error: any) {
            // If anonymous chat fails, fall back to market chat
            if (error.response?.status === 403) {
              shouldUseMarketChat = true;
              response = await marketService.chatWithAI(
                input.trim(),
                selectedModel,
                user?.id
              );
              
              await incrementLLMUsage();
              
              // Update session to require market chat from now on
              setAnonymousSession(prev => ({
                ...prev,
                loginRequired: true,
                remainingMessages: 0
              }));
            } else {
              throw error;
            }
          }
        }
      }
      
      // Create response message - handle different response formats
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: shouldUseMarketChat ? response.analysis : response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If there's stock data (from market chat), add it as a separate message
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
    // Save current chat if needed
    
    // Reset to new chat
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your Welth AI assistant. Ask me anything about stocks, market trends, or investment strategies.',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
    setActiveSession('current');
    
    // Reset anonymous session if needed
    if (!user && anonymousSession.remainingMessages <= 0) {
      setAnonymousSession(prev => ({
        ...prev,
        remainingMessages: 5,
        loginRequired: false
      }));
    }
  };
  
  const handleSelectSession = (sessionId: string) => {
    // In a real app, we would load the selected session from the server
    setActiveSession(sessionId);
    
    // Mock loading a session
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages([
        {
          id: '1',
          text: `This is a mock conversation for session "${session.title}". In a real app, we would load the actual conversation history.`,
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Chat Area */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.text}</div>
              <div
                className={`text-xs mt-1 ${
                  message.sender === 'user'
                    ? 'text-blue-200'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Save Chat Button - Only show for logged in users with messages */}
      {user && messages.length > 1 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {saveStatus.message && (
                <span className={saveStatus.success ? "text-green-500" : "text-red-500"}>
                  {saveStatus.message}
                </span>
              )}
            </div>
            <button
              onClick={handleSaveChat}
              disabled={saveStatus.saving}
              className={`px-3 py-1 rounded-md text-sm ${
                saveStatus.saving ? 'bg-gray-400' : 
                saveStatus.success === true ? 'bg-green-500' : 
                'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {saveStatus.saving ? 'Saving...' : 
               saveStatus.success === true ? 'Saved!' : 
               'Save Chat'}
            </button>
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {!user && anonymousSession.remainingMessages <= 5 && (
          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>
              {anonymousSession.remainingMessages > 0 
                ? `${anonymousSession.remainingMessages} free messages remaining` 
                : 'Free messages used up'}
            </span>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Log in for unlimited access
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={placeholders[placeholderIndex]}
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
      
      {/* Chat History Sidebar - Only show for logged in users */}
      {user && <ChatHistorySidebar onSelectChat={handleLoadConversation} />}
      
      {/* Subscription Banner for authenticated users */}
      {user && <SubscriptionBanner />}
      
      {/* Usage Tracker for authenticated users */}
      {user && <UsageTracker />}
      
      {/* Modals */}
      <LimitExceededModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureType="llm"
        message="You have reached your daily limit for AI queries. Please upgrade your plan to continue using the AI assistant."
      />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        message="Log in to continue chatting with our AI assistant"
      />
    </div>
  );
};

export default ChatInterface; 