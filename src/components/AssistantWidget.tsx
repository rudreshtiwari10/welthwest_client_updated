import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistantWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssistantWidget: React.FC<AssistantWidgetProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m WelthAI Assistant. I can help you with market analysis, trading strategies, and answer your investment questions. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show login prompt
      const shouldLogin = window.confirm('Please sign in to chat with WelthAI Assistant. Would you like to sign in now?');
      if (shouldLogin) {
        onClose();
        navigate('/login');
      }
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thank you for your question about "${inputValue}". This is a demo response. For full AI-powered insights, please visit our dedicated WelthAI Assistant page.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFullAssistant = () => {
    onClose();
    navigate('/welth-ai-assistant');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Widget */}
      <div className="fixed bottom-4 right-4 w-full max-w-md h-[600px] bg-white dark:bg-dark-300 rounded-2xl shadow-2xl z-50 flex flex-col animate-scale-in border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-500 text-white p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Welth AI Assistant</h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close assistant"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-400">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white'
                    : 'bg-white dark:bg-dark-300 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-dark-300 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-600">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-300">
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about trading..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl hover:from-indigo-700 hover:to-violet-600 transition-all transform hover:scale-105"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleFullAssistant}
            className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Open Full Assistant →
          </button>
        </div>
      </div>
    </>
  );
};

export default AssistantWidget;
