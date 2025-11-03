import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { marketService } from '../services/api';
import StockChart from './StockChart';
// Removed usage/subscription UI in chat component
import UpgradeModal from './UpgradeModal';
import LoginModal from './LoginModal';
import TechnicalIndicators from './TechnicalIndicators';
import StockSymbolSelector from './StockSymbolSelector';
import { CHATBOT_CONFIG } from '../config/chatbot-config';

// Thinking Indicator Component
const ThinkingIndicator: React.FC = () => {
  const [currentText, setCurrentText] = useState('Thinking');
  const thinkingTexts = useMemo(() => ['Thinking', 'Analyzing', 'Processing', 'Generating response'], []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentText(thinkingTexts[index]);
      index = (index + 1) % thinkingTexts.length;
    }, 800);

    return () => clearInterval(interval);
  }, [thinkingTexts]);

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9C3 10.1 3.9 11 5 11V16.5C5 17.9 6.1 19 7.5 19S10 17.9 10 16.5V15H14V16.5C14 17.9 15.1 19 16.5 19S19 17.9 19 16.5V11C20.1 11 21 10.1 21 9ZM7.5 8C8.3 8 9 8.7 9 9.5S8.3 11 7.5 11 6 10.3 6 9.5 6.7 8 7.5 8ZM16.5 8C17.3 8 18 8.7 18 9.5S17.3 11 16.5 11 15 10.3 15 9.5 15.7 8 16.5 8ZM12 13.5C10.6 13.5 9.5 12.4 9.5 11H14.5C14.5 12.4 13.4 13.5 12 13.5Z"/>
          </svg>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium animate-pulse">
              {currentText}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

type MessageSender = 'user' | 'assistant';

type MessageContentType = 'text' | 'chart' | 'table' | 'image' | 'cards' | 'progress' | 'technical';

interface AssistantCardAction {
  label: string;
  route?: string;
  onClickType?: 'navigate' | 'sendMessage';
  payload?: string;
}

interface AssistantCard {
  title: string;
  description?: string;
  actions?: AssistantCardAction[];
}

interface Message {
  id: string;
  sender: MessageSender;
  timestamp: Date;
  text?: string;
  contentType?: MessageContentType;
  // Chart content
  chartData?: { symbol: string; data: any[]; period?: string; interval?: string };
  // Table content
  table?: { columns: string[]; rows: Array<Record<string, any>> };
  // Image content
  image?: { src: string; name?: string };
  // Cards content
  cards?: AssistantCard[];
  // Progress content
  progress?: { label: string; percent?: number; indeterminate?: boolean };
  // Technical indicators content
  technical?: { symbol: string; data: any };
  // Enhanced Chat features
  toolSuggestions?: Array<{
    tool_id: string;
    name: string;
    description: string;
    url: string;
    features: string[];
    use_cases: string[];
  }>;
  followUpQuestions?: string[];
  stockData?: any;
  intent?: string;
}

interface AnonymousSessionState {
  sessionId: string | null;
  remainingMessages: number;
  loginRequired: boolean;
}

const ChatInterfaceNoSave: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canUseLLM, incrementLLMUsage } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Welth AI assistant. Ask me anything about stocks, market trends, or investment strategies. Note: This session won\'t save your chat history.',
      sender: 'assistant',
      timestamp: new Date(),
      contentType: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel] = useState<string>('openrouter'); // Default model
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [pendingNewMessages, setPendingNewMessages] = useState(0);
  const [, setAttachedFiles] = useState<File[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [anonymousSession, setAnonymousSession] = useState<AnonymousSessionState>({
    sessionId: null,
    remainingMessages: 5,
    loginRequired: false
  });
  const [showTechnicalModal, setShowTechnicalModal] = useState(false);
  
  const placeholders = [
    "Ask about investment strategies...",
    "Inquire about stock market trends...",
    "Get insights on portfolio diversification...",
    "Learn about market indicators...",
    "Discover top performing sectors..."
  ];
  
  // Auto-scroll disabled - no automatic scrolling
  useEffect(() => {
    // No auto-scrolling - let user control their scroll position
    // Only show scroll-to-bottom button when there are new messages and user is not at bottom
    if (!isAtBottom && messages.length > 1) {
      setPendingNewMessages((n) => n + 1);
      setShowScrollToBottom(true);
    } else if (isAtBottom) {
      setPendingNewMessages(0);
      setShowScrollToBottom(false);
    }
  }, [messages, isAtBottom]);

  // Track scroll position to toggle scroll-to-bottom button
  const handleContainerScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 80; // px
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottomNow = distanceFromBottom <= threshold;
    setIsAtBottom(atBottomNow);
    if (atBottomNow) {
      setShowScrollToBottom(false);
      setPendingNewMessages(0);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
    setPendingNewMessages(0);
  };
  
  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [placeholders.length]);

  // Initialize anonymous session for non-authenticated users without making API call
  useEffect(() => {
    const initializeSession = () => {
      if (!user && !anonymousSession.sessionId) {
        // Simply initialize session state without API call
        setAnonymousSession({
          sessionId: null, // Will be set on first real message
          remainingMessages: 5,
          loginRequired: false
        });
        
        // Set welcome message without API call
        setMessages([
          {
            id: '1',
            text: 'Hello! I\'m your Welth AI assistant. Ask me anything about stocks, market trends, or investment strategies. Note: This session won\'t save your chat history.',
            sender: 'assistant',
            timestamp: new Date(),
          }
        ]);
      }
    };
    
    initializeSession();
  }, [user, anonymousSession.sessionId]);

  // Quick actions
  const quickActions = useMemo(
    () => [
      'How did RELIANCE perform today?',
      'Show RELIANCE chart for last month',
      'Technical indicators for RELIANCE',
      'RSI and MACD signals for TCS',
      'Backtest RSI strategy on TCS for 6 months',
      'Compare INFY and TCS performance YTD'
    ],
    []
  );

  // Simple NLP helpers
  const extractSymbols = (text: string): string[] => {
    const knownSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'TATASTEEL', 'SBIN', 'HINDUNILVR'];
    const tokens = text.toUpperCase().match(/[A-Z]{2,12}/g) || [];
    const symbols = tokens.filter((t) => knownSymbols.includes(t));
    return Array.from(new Set(symbols));
  };

  const extractPeriod = (text: string): { period?: string; interval?: string; label?: string } => {
    const lower = text.toLowerCase();
    if (/today|intraday|today's/.test(lower)) return { period: '5d', interval: '5m', label: 'today' };
    if (/last\s*week/.test(lower)) return { period: '1mo', interval: '1d', label: 'last week' };
    if (/last\s*month/.test(lower)) return { period: '1mo', interval: '1d', label: 'last month' };
    if (/last\s*6\s*months|6mo|six\s*months/.test(lower)) return { period: '6mo', interval: '1d', label: 'last 6 months' };
    if (/ytd|year\s*to\s*date/.test(lower)) return { period: 'ytd', interval: '1d', label: 'YTD' };
    if (/last\s*year|1y/.test(lower)) return { period: '1y', interval: '1d', label: 'last year' };
    return {};
  };

  const detectIntent = (text: string) => {
    const lower = text.toLowerCase();
    const symbols = extractSymbols(text);
    const { period, interval } = extractPeriod(text);
    const intent =
      /backtest|strategy/.test(lower) ? 'backtest' :
      /compare|vs\b/.test(lower) ? 'compare' :
      /chart|perform|price|today/.test(lower) ? 'performance' :
      /technical|indicators?|rsi|macd|bollinger|stochastic|atr|obv|vwap|pivot|signals?/.test(lower) ? 'technical' :
      /explain|what\s+is|how\s+does/.test(lower) ? 'education' :
      /alert/.test(lower) ? 'alert' :
      /analy/.test(lower) ? 'analysis' :
      'general';
    return { intent, symbols, period, interval };
  };

  const askClarification = (question: string) => {
    const clarification: Message = {
      id: Date.now().toString() + '-clarify',
      sender: 'assistant',
      timestamp: new Date(),
      contentType: 'text',
      text: question,
    };
    setMessages((prev) => [...prev, clarification]);
  };

  const addChartMessage = (symbol: string, data: any[], period?: string, interval?: string) => {
    const chartMessage: Message = {
      id: Date.now().toString() + '-chart',
      sender: 'assistant',
      timestamp: new Date(),
      contentType: 'chart',
      chartData: { symbol, data, period, interval },
    };
    setMessages((prev) => [...prev, chartMessage]);
  };

  const addCardsMessage = (cards: AssistantCard[]) => {
    const cardsMessage: Message = {
      id: Date.now().toString() + '-cards',
      sender: 'assistant',
      timestamp: new Date(),
      contentType: 'cards',
      cards,
    };
    setMessages((prev) => [...prev, cardsMessage]);
  };

  const addTableMessage = (columns: string[], rows: Array<Record<string, any>>) => {
    const tableMessage: Message = {
      id: Date.now().toString() + '-table',
      sender: 'assistant',
      timestamp: new Date(),
      contentType: 'table',
      table: { columns, rows },
    };
    setMessages((prev) => [...prev, tableMessage]);
  };

  const addTechnicalAnalysisMessage = (symbol: string, data: any) => {
    const technicalMessage: Message = {
      id: Date.now().toString() + '-technical',
      sender: 'assistant',
      timestamp: new Date(),
      contentType: 'technical',
      technical: { symbol, data },
    };
    setMessages((prev) => [...prev, technicalMessage]);
  };

  const handleFileAttach: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setAttachedFiles(files);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const src = URL.createObjectURL(file);
        const imgMsg: Message = {
          id: Date.now().toString() + '-img',
          sender: 'user',
          timestamp: new Date(),
          contentType: 'image',
          image: { src, name: file.name },
          text: `Uploaded image: ${file.name}`,
        };
        setMessages((prev) => [...prev, imgMsg]);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        const rows = text.trim().split(/\r?\n/).map((line) => line.split(/,|;|\t/));
        const columns = rows.shift() || [];
        const dataRows = rows.slice(0, 20).map((r) => {
          const obj: Record<string, any> = {};
          columns.forEach((c, i) => (obj[c] = r[i]));
          return obj;
        });
        addTableMessage(columns, dataRows);
      } else {
        const fileMsg: Message = {
          id: Date.now().toString() + '-file',
          sender: 'user',
          timestamp: new Date(),
          contentType: 'text',
          text: `Attached file: ${file.name}`,
        };
        setMessages((prev) => [...prev, fileMsg]);
      }
    }
  };
  
  const handleLoginSuccess = () => {
    // Reset session state after login
    setAnonymousSession({
      sessionId: null,
      remainingMessages: 0,
      loginRequired: false
    });
    setShowLoginModal(false);
  };
  
  const handleNewChat = () => {
    // Reset to new chat - no saving since this is no-save version
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your Welth AI assistant. Ask me anything about stocks, market trends, or investment strategies. Note: This session won\'t save your chat history.',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
    
    // Reset anonymous session if needed
    if (!user && anonymousSession.remainingMessages <= 0) {
      setAnonymousSession(prev => ({
        ...prev,
        remainingMessages: 5,
        loginRequired: false
      }));
    }
  };

  const handleTechnicalAnalysisRequest = (symbol: string) => {
    setShowTechnicalModal(false);
    setInput(`Technical indicators for ${symbol}`);
    // Trigger the message send
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100);
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
      // Intent detection & clarifications
      const { intent, symbols, period, interval } = detectIntent(userMessage.text || '');
      if (intent === 'backtest' && symbols.length > 0 && !period) {
        askClarification('Which timeframe should I backtest (e.g., last month, 6 months, 1 year)?');
        setIsLoading(false);
        return;
      }

      // Quick local responses for performance queries
      if (intent === 'performance' && symbols.length > 0) {
        const symbol = symbols[0];
        const chosenPeriod = period || '1mo';
        const chosenInterval = interval || '1d';
        try {
          const quote = await marketService.getStockQuote(symbol);
          const price = quote?.[symbol]?.price ?? quote?.price ?? null;
          const percentChange = quote?.[symbol]?.percentChange ?? quote?.percentChange ?? null;
          const change = quote?.[symbol]?.change ?? quote?.change ?? null;
          const summaryText = price !== null && percentChange !== null
            ? `${symbol}: ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}% (${change?.toFixed ? change.toFixed(2) : change}) today. Current price: ${price?.toFixed ? price.toFixed(2) : price}`
            : `Here's the latest performance for ${symbol}.`;
          const perfMsg: Message = {
            id: Date.now().toString() + '-perf',
            sender: 'assistant',
            timestamp: new Date(),
            contentType: 'text',
            text: summaryText,
          };
          setMessages((prev) => [...prev, perfMsg]);
          const hist = await marketService.getStockInfo(symbol, chosenPeriod, chosenInterval);
          addChartMessage(symbol, hist?.data || hist || [] , chosenPeriod, chosenInterval);
          // Suggest actions
          addCardsMessage([
            {
              title: `Run Backtest on ${symbol}`,
              description: 'Quickly evaluate a strategy on historical data',
              actions: [
                { label: 'Open Backtest (Beta)', onClickType: 'navigate', route: '/backtest-beta' },
              ],
            },
            {
              title: `Open AI Analysis for ${symbol}`,
              description: 'Get regime prediction and insights',
              actions: [
                { label: 'AI Analysis', onClickType: 'navigate', route: '/welth-market-regime' },
              ],
            },
          ]);
        } catch (err) {
          // fallback to backend chat
        }
      }

      // Quick local responses for technical analysis queries
      if (intent === 'technical' && symbols.length > 0) {
        const symbol = symbols[0];
        try {
          const technicalData = await marketService.getTechnicalAnalysis(symbol);
          const summaryText = `Technical analysis for ${symbol}:`;
          const techMsg: Message = {
            id: Date.now().toString() + '-tech-summary',
            sender: 'assistant',
            timestamp: new Date(),
            contentType: 'text',
            text: summaryText,
          };
          setMessages((prev) => [...prev, techMsg]);
          addTechnicalAnalysisMessage(symbol, technicalData);
          // Suggest additional actions
          addCardsMessage([
            {
              title: `View ${symbol} Chart`,
              description: 'See price movements and patterns',
              actions: [
                { label: 'Show Chart', onClickType: 'sendMessage', payload: `Show ${symbol} chart for last month` },
              ],
            },
            {
              title: `Backtest ${symbol} Strategy`,
              description: 'Test strategies based on these signals',
              actions: [
                { label: 'Open Backtest', onClickType: 'navigate', route: '/backtest-beta' },
              ],
            },
          ]);
        } catch (err) {
          // fallback to backend chat
        }
      }

      let response: any;
      
      // Use Enhanced Chat API for all users (no login required)
      if (!user) {
        // Not logged in - use enhanced chat with session management
        if (anonymousSession.loginRequired) {
          // Anonymous limit exceeded, show login modal
          setShowLoginModal(true);
          setIsLoading(false);
          return;
        }

        try {
          response = await marketService.enhancedChat(
            input.trim(),
            anonymousSession.sessionId || undefined,
            selectedModel
          );

          // Update session state from response
          if (response.session_id) {
            setAnonymousSession(prev => ({
              sessionId: response.session_id,
              remainingMessages: response.usage_info?.messages_remaining ?? prev.remainingMessages,
              loginRequired: response.usage_info?.requires_login || false
            }));
          }
        } catch (error: any) {
          // If enhanced chat fails due to limits, suggest login
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
        // User is logged in - still use enhanced chat (works for both)
        if (anonymousSession.loginRequired || !canUseLLM()) {
          // Use enhanced chat API even for authenticated users
          response = await marketService.enhancedChat(
            input.trim(),
            anonymousSession.sessionId || undefined,
            selectedModel
          );

          // Increment usage after successful response
          await incrementLLMUsage();
        } else {
          // Still have free messages, use enhanced chat
          try {
            response = await marketService.enhancedChat(
              input.trim(),
              anonymousSession.sessionId || undefined,
              selectedModel
            );

            // Update session state from response
            if (response.session_id) {
              setAnonymousSession(prev => ({
                sessionId: response.session_id,
                remainingMessages: response.usage_info?.messages_remaining ?? prev.remainingMessages,
                loginRequired: response.usage_info?.requires_login || false
              }));
            }
          } catch (error: any) {
            // If enhanced chat fails, try again with authentication
            if (error.response?.status === 403) {
              response = await marketService.enhancedChat(
                input.trim(),
                anonymousSession.sessionId || undefined,
                selectedModel
              );

              await incrementLLMUsage();

              // Update session to require authentication from now on
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
      
      // Create response message with enhanced features
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.analysis || response.response,
        sender: 'assistant',
        timestamp: new Date(),
        contentType: 'text',
        // Enhanced Chat features
        toolSuggestions: response.tool_suggestions || [],
        followUpQuestions: response.follow_up_questions || [],
        stockData: response.stock_data,
        intent: response.intent,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      
      // Convert error to string to avoid rendering objects directly
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m sorry, I encountered an error while processing your request. Please try again later.',
        sender: 'assistant',
        timestamp: new Date(),
        contentType: 'text',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Messages Container - Scrollable */}
      <div className="h-full overflow-hidden">
        <div
          className="h-full overflow-y-auto px-3 sm:px-4 pt-20 md:pt-6 pb-2"
          ref={messagesContainerRef}
          onScroll={handleContainerScroll}
        >
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 sm:mb-6 flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="flex flex-col max-w-[85%] sm:max-w-[80%]">
                {message.contentType === 'chart' && message.chartData ? (
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-2 sm:p-3 shadow-sm">
                    <div className="text-xs sm:text-sm font-medium mb-2">{message.chartData.symbol} — {message.chartData.period || ''}</div>
                    <div className="h-48 sm:h-64">
                      <StockChart
                        stockData={{ symbol: message.chartData.symbol, data: message.chartData.data }}
                        height={256}
                      />
                    </div>
                  </div>
                ) : message.contentType === 'table' && message.table ? (
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-2 sm:p-3 shadow-sm overflow-auto">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead>
                        <tr>
                          {message.table.columns.map((col) => (
                            <th key={col} className="px-2 sm:px-3 py-1 sm:py-2 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {message.table.rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-100 dark:border-gray-600">
                            {message.table!.columns.map((col) => (
                              <td key={col} className="px-2 sm:px-3 py-1 sm:py-2 text-gray-800 dark:text-gray-100">{String(row[col] ?? '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : message.contentType === 'cards' && message.cards ? (
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-2 sm:p-3 shadow-sm">
                    <div className="flex space-x-2 sm:space-x-3 overflow-x-auto">
                      {message.cards.map((card, idx) => (
                        <div key={idx} className="min-w-[200px] sm:min-w-[240px] bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                          <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">{card.title}</div>
                          {card.description && <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 sm:mb-3">{card.description}</div>}
                          {card.actions && (
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {card.actions.map((action, aidx) => (
                                <button
                                  key={aidx}
                                  className="px-2 sm:px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => {
                                    if (action.onClickType === 'navigate' && action.route) {
                                      navigate(action.route);
                                    } else if (action.onClickType === 'sendMessage' && action.payload) {
                                      setInput(action.payload);
                                    }
                                  }}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : message.contentType === 'image' && message.image ? (
                  <div className={`rounded-2xl p-2 shadow-sm ${message.sender === 'user' ? 'bg-blue-50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <img src={message.image.src} alt={message.image.name || 'uploaded'} className="max-h-64 rounded-md object-contain" />
                    {message.text && <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">{message.text}</div>}
                  </div>
                ) : message.contentType === 'technical' && message.technical ? (
                  <div className="w-full">
                    <TechnicalIndicators 
                      ticker={message.technical.symbol} 
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{message.text}</div>
                  </div>
                )}
                <div
                  className={`text-xs mt-1 px-2 ${
                    message.sender === 'user'
                      ? 'text-gray-500 dark:text-gray-400 text-right'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
            {isLoading && <ThinkingIndicator />}
            <div ref={messagesEndRef} />

            {/* Starter suggestions when new chat */}
            {messages.length <= 1 && (
              <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {quickActions.map((qa) => (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => {
                      setInput(qa);
                      setTimeout(() => {
                        const form = document.querySelector('form') as HTMLFormElement;
                        if (form) {
                          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                        }
                      }, 0);
                    }}
                    className="text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-100 border border-gray-700 text-sm sm:text-base"
                  >
                    {qa}
                  </button>
                ))}
              </div>
            )}

            {/* Extra padding at bottom so last message is not hidden behind input */}
            <div className="h-56 md:h-44"></div>
          </div>

          {showScrollToBottom && (
            <div className="fixed bottom-44 md:bottom-28 left-1/2 transform -translate-x-1/2 z-40">
              <button
                onClick={scrollToBottom}
                className="px-3 py-2 rounded-full bg-blue-600 text-white text-xs shadow hover:bg-blue-700"
              >
                {pendingNewMessages > 0 ? `Scroll to latest (${pendingNewMessages})` : 'Scroll to latest'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Box at Bottom */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-gray-900 to-transparent pt-4 pb-4 md:pb-0 z-50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-4">
          {!user && anonymousSession.remainingMessages <= 5 && (
            <div className="mb-3 p-2 bg-blue-900/20 rounded-lg border border-blue-800 text-xs flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 text-blue-300">
              <span>
                {anonymousSession.remainingMessages > 0 
                  ? `${anonymousSession.remainingMessages} free messages remaining` 
                  : 'Free messages used up'}
              </span>
              <button 
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Log in for unlimited access
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-2 bg-gray-800 border border-gray-700 rounded-2xl shadow-xl px-2 sm:px-3 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={placeholders[placeholderIndex]}
              className="flex-1 px-2 py-2 bg-transparent focus:outline-none text-white placeholder-gray-400 text-sm sm:text-base"
            />

            {/* Technical Analysis Button */}
            <button
              type="button"
              onClick={() => setShowTechnicalModal(true)}
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              title="Technical Analysis"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>

            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-900 border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              title="Start New Chat"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            {/* File Upload */}
            <label className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-900 border border-gray-700 cursor-pointer hover:bg-gray-800">
              <input type="file" className="hidden" multiple accept="image/*,.csv" onChange={handleFileAttach} />
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.415-6.414a4 4 0 10-5.657-5.657l-6.415 6.414" />
              </svg>
            </label>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md grid place-items-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modals */}
      <UpgradeModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        featureName="AI Chat Assistant"
        currentPlan={user ? 'PREMIUM' : 'FREE'}
        upgradeMessage="You have reached your daily limit for AI queries. Upgrade your plan to continue using the AI assistant."
      />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        message="Log in to continue chatting with our AI assistant"
      />

      {/* Technical Analysis Modal */}
      {showTechnicalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Technical Analysis
              </h3>
              <button
                onClick={() => setShowTechnicalModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
              Enter a stock symbol to get technical indicators and signals:
            </p>
            <StockSymbolSelector
              onSymbolSelect={handleTechnicalAnalysisRequest}
              placeholder="Enter stock symbol (e.g., RELIANCE, TCS)"
              className="w-full"
            />
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Available symbols: RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, etc.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterfaceNoSave;