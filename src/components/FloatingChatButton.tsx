import React, { useState, useRef, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import { ChatBubbleLeftRightIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface FloatingChatButtonProps {
  initiallyOpen?: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isHovered, setIsHovered] = useState(false);
  const chatPopupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        chatPopupRef.current && 
        !chatPopupRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scrolling when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
      >
        <div className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}>
          <div className="relative">
            {isHovered ? (
              <div className="animate-pulse">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
            ) : (
              <div className="animate-float">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
            )}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              1
            </span>
          </div>
        </div>
        
        {/* Floating label */}
        <div className={`absolute right-16 bg-gray-800 text-white text-sm py-1 px-3 rounded-lg transition-all duration-300 ${
          isHovered && !isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
        }`}>
          <div className="relative">
            WelthAI Assistant
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
          </div>
        </div>
      </button>

      {/* Chat Popup - Always render but conditionally show/hide */}
      <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
        
        {/* Chat Container */}
        <div 
          ref={chatPopupRef}
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[70%] max-w-4xl max-h-[80vh] bg-white dark:bg-[#1a1f2e] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 ${
            isOpen ? 'animate-slide-up' : ''
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-md">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    WelthAI Assistant
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Powered by advanced AI
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="h-[70vh] overflow-hidden">
            <ChatInterface />
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#151922] text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
              <SparklesIcon className="h-3 w-3" />
              <span>Ask me anything about stocks, market trends, or investment strategies</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingChatButton; 