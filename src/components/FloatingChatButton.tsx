import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface FloatingChatButtonProps {
  initiallyOpen?: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/welth-ai-chatbot');
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
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
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
      }`}>
        <div className="relative">
          WelthAI Assistant
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
        </div>
      </div>
    </button>
  );
};

export default FloatingChatButton; 