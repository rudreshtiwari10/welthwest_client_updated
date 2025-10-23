import React, { useState, useEffect } from 'react';
import { userDataService } from '../services/api';
import { ChevronLeftIcon, ChevronRightIcon, ChatBubbleLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ChatMessage {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

interface ChatHistoryItem {
  id?: string;
  _id?: string;
  title?: string;
  timestamp?: string;
  created_at?: string;
  conversation?: ChatMessage[];
  // Fields when savedd automatically by /api/market/chat
  query?: string;
  response?: any;
  model?: string;
}

interface ChatHistorySidebarProps {
  onSelectChat: (conversation: ChatMessage[], chatId?: string) => void;
  refreshTrigger?: number; // Optional refresh trigger
  onNewChat?: () => void; // Optional new chat handler
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({ onSelectChat, refreshTrigger, onNewChat }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);
  
  // Refresh chat history when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchChatHistory();
    }
  }, [refreshTrigger]);

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await userDataService.getUserChatHistory();
      
      if (response.success && response.chat_history) {
        setChatHistory(response.chat_history);
      } else {
        setError('Failed to load chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('An error occurred while loading your chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectChat = (chat: ChatHistoryItem) => {
    const chatId = chat.id || chat._id || null;
    setSelectedChatId(chatId);
    onSelectChat(normalizeConversation(chat), chatId || undefined);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const normalizeConversation = (chat: ChatHistoryItem): ChatMessage[] => {
    if (Array.isArray(chat.conversation) && chat.conversation.length > 0) {
      return chat.conversation.map(m => ({
        text: m.text,
        sender: m.sender,
        timestamp: m.timestamp || chat.timestamp || chat.created_at || new Date().toISOString()
      }));
    }
    const created = chat.timestamp || chat.created_at || new Date().toISOString();
    const userMsg: ChatMessage | null = chat.query
      ? { text: String(chat.query), sender: 'user', timestamp: created }
      : null;
    let assistantText = '';
    const r = chat.response as any;
    if (r) {
      assistantText = r.analysis || r.response || r.text || (typeof r === 'string' ? r : JSON.stringify(r));
    }
    const assistantMsg: ChatMessage | null = assistantText
      ? { text: assistantText, sender: 'assistant', timestamp: created }
      : null;
    return [userMsg, assistantMsg].filter(Boolean) as ChatMessage[];
  };

  const generateChatTitle = (chat: ChatHistoryItem): string => {
    // First check if we have a proper title from backend
    if (chat.title && chat.title !== 'Chat Session' && !chat.title.includes('Chat 2')) {
      return chat.title;
    }
    
    // Check conversation data for user messages
    const conv = normalizeConversation(chat);
    const userMessages = conv.filter(msg => msg.sender === 'user');
    
    if (userMessages.length > 0) {
      const firstUserMessage = userMessages[0].text || '';
      const words = firstUserMessage.split(' ').slice(0, 5).join(' ');
      return words.length > 50 ? words.substring(0, 47) + '...' : words || 'New Chat';
    }
    
    // Check if there's a query field in the chat data
    if (chat.query && typeof chat.query === 'string') {
      const words = chat.query.split(' ').slice(0, 5).join(' ');
      return words.length > 50 ? words.substring(0, 47) + '...' : words || 'New Chat';
    }
    
    return 'New Chat';
  };

  const getPreviewText = (chat: ChatHistoryItem) => {
    const conv = normalizeConversation(chat);
    const userMessages = conv.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1].text || '';
      return lastUserMessage.length > 40 ? lastUserMessage.substring(0, 40) + '...' : lastUserMessage;
    }
    if (conv.length > 0) {
      const t = conv[0].text || '';
      return t.length > 40 ? t.substring(0, 40) + '...' : t || 'No messages';
    }
    return 'No messages';
  };

  return (
    <>
      {/* Always-visible toggle button - positioned below header */}
      <button
        onClick={toggleSidebar}
        className="fixed right-0 top-20 z-30 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-l-lg p-3 shadow-lg transition-colors"
        aria-label={isOpen ? 'Close chat history' : 'Open chat history'}
      >
        {isOpen ? (
          <ChevronRightIcon className="h-5 w-5 text-gray-300" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5 text-gray-300" />
        )}
      </button>

      {/* Sliding sidebar content */}
      <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] transition-transform duration-300 z-20 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-72 bg-gray-900 border-l border-gray-800 shadow-lg flex flex-col h-full">
          {/* Header with Close Button and New Chat Button */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors mr-2"
                  title="Close sidebar"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-2 text-blue-400" />
                  Chat History
                </h2>
              </div>
              <button 
                onClick={onNewChat || (() => window.location.reload())} 
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                title="New Chat"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-gray-400">
              Your conversations are saved here
            </div>
          </div>
        
        <div className="flex-grow overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-400 text-sm text-center">
              {error}
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
              <ChatBubbleLeftIcon className="h-8 w-8 mb-2 opacity-50" />
              <div>No chat history yet</div>
              <div className="text-xs mt-1 opacity-75">Start a conversation to see it here</div>
            </div>
          ) : (
            <div className="space-y-1">
              {chatHistory.map((chat, idx) => (
                <div
                  key={chat.id || chat._id || idx}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    selectedChatId === (chat.id || chat._id || null) 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'hover:bg-gray-800/50 border border-transparent'
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="font-medium text-white text-sm mb-2">
                    {generateChatTitle(chat)}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {formatDate(chat.timestamp || chat.created_at)}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {getPreviewText(chat)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700 bg-gray-850">
          <div className="text-xs text-gray-400 text-center">
            💡 Click any conversation to continue chatting
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default ChatHistorySidebar; 