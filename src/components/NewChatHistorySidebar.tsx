// New Chat History Sidebar - Session-based conversation management
// This component runs in parallel with the existing system for safe testing

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChatBubbleLeftIcon, PlusIcon, XMarkIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { newChatHistoryService, ChatSession, ConversationSession, ChatMessage } from '../services/newChatHistoryService';

interface NewChatHistorySidebarProps {
  onSelectChat: (conversation: Array<{text: string; sender: 'user' | 'assistant'; timestamp: string}>, chatId?: string) => void;
  refreshTrigger?: number;
  onNewChat?: () => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const NewChatHistorySidebar: React.FC<NewChatHistorySidebarProps> = ({ 
  onSelectChat, 
  refreshTrigger, 
  onNewChat,
  isOpen = true,
  onToggle 
}) => {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
      loadCurrentSession();
    }
  }, [isOpen]);
  
  // Refresh chat history when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchChatHistory();
      loadCurrentSession();
    }
  }, [refreshTrigger]);

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const sessions = await newChatHistoryService.getAllSessions();
      setChatHistory(sessions);
      setError(null);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('An error occurred while loading your chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentSession = () => {
    const session = newChatHistoryService.getCurrentSession();
    setCurrentSession(session);
  };

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle(!isOpen);
    }
  };

  const handleSelectChat = async (chat: ChatSession) => {
    try {
      setSelectedChatId(chat.id);
      
      // Load the full conversation from the new service
      const conversation = await newChatHistoryService.loadSession(chat.id);
      
      if (conversation) {
        // Convert to the format expected by the parent component
        const formattedConversation = conversation.messages.map(msg => ({
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp
        }));
        
        onSelectChat(formattedConversation, conversation.sessionId);
        
        // Set as current session
        newChatHistoryService.setCurrentSession(conversation);
        setCurrentSession(conversation);
      } else {
        console.error('Failed to load conversation for session:', chat.id);
        setError('Failed to load conversation');
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
      setError('Failed to load conversation');
    }
  };

  const handleNewChat = () => {
    // Create new session in the new service
    const newSession = newChatHistoryService.createNewSession();
    setCurrentSession(newSession);
    setSelectedChatId(null);
    
    // Call parent handler
    if (onNewChat) {
      onNewChat();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getSessionStatus = (session: ChatSession) => {
    if (session.id === selectedChatId) {
      return 'bg-blue-600 text-white';
    }
    if (session.id === currentSession?.sessionId) {
      return 'bg-gray-700 text-white';
    }
    return 'hover:bg-gray-700 text-gray-300 hover:text-white';
  };

  return (
    <div className={`fixed right-0 top-16 h-full bg-gray-900 border-l border-gray-700 transition-transform duration-300 z-40 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -left-12 top-4 bg-gray-900 border border-gray-700 border-r-0 rounded-l-lg p-2 text-gray-400 hover:text-white transition-colors"
        aria-label={isOpen ? 'Close chat history' : 'Open chat history'}
      >
        {isOpen ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
      </button>

      {/* Sidebar Content */}
      <div className="w-80 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
              Chat History
            </h2>
            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              title="Start New Chat"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          
          {/* Current Session Info */}
          {currentSession && (
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
              <div className="text-sm font-medium text-white mb-1">
                Current Session
              </div>
              <div className="text-xs text-gray-300 mb-2">
                {currentSession.title}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                  {currentSession.metadata.totalMessages} messages
                </span>
                <span className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {formatTime(currentSession.updatedAt)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <div className="text-gray-400 text-sm">Loading chats...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-sm mb-2">{error}</div>
              <button
                onClick={fetchChatHistory}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
              >
                Retry
              </button>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400 text-sm mb-2">No chat history yet</div>
              <div className="text-gray-500 text-xs">Start a conversation to see it here</div>
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${getSessionStatus(chat)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm truncate flex-1">
                      {chat.title}
                    </div>
                    <div className="text-xs opacity-75 ml-2">
                      {formatDate(chat.timestamp)}
                    </div>
                  </div>
                  
                  <div className="text-xs opacity-75 mb-2 line-clamp-2">
                    {chat.lastMessage}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs opacity-60">
                    <span className="flex items-center">
                      <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                      {chat.messageCount} messages
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatTime(chat.timestamp)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            New Chat History System
            <br />
            <span className="text-green-400">✓ Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatHistorySidebar;
