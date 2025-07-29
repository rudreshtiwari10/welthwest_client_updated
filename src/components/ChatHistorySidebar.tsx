import React, { useState, useEffect } from 'react';
import { userDataService } from '../services/api';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  conversation: Array<{
    text: string;
    sender: 'user' | 'assistant';
    timestamp: string;
  }>;
}

interface ChatHistorySidebarProps {
  onSelectChat: (conversation: ChatHistoryItem['conversation']) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({ onSelectChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

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
    setSelectedChatId(chat.id);
    onSelectChat(chat.conversation);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getPreviewText = (conversation: ChatHistoryItem['conversation']) => {
    const userMessages = conversation.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1].text;
      return lastUserMessage.length > 30 ? lastUserMessage.substring(0, 30) + '...' : lastUserMessage;
    }
    return 'No messages';
  };

  return (
    <div className={`fixed right-0 top-0 h-full transition-all duration-300 z-10 flex ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-md p-2 shadow-md"
        aria-label={isOpen ? 'Close chat history' : 'Open chat history'}
      >
        {isOpen ? (
          <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
      
      {/* Sidebar content */}
      <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-sm text-center">
              No saved chat history found
            </div>
          ) : (
            <div>
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedChatId === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {chat.title || 'Chat Session'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(chat.timestamp)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                    {getPreviewText(chat.conversation)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
          Select a chat to load the conversation
        </div>
      </div>
    </div>
  );
};

export default ChatHistorySidebar; 