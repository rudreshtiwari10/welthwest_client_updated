import React from 'react';
import ChatInterface from '../components/ChatInterface';
// Removed unused SparklesIcon import

// Professional Assistant Icon (briefcase + chat bubble)
const AssistantIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M10 4a2 2 0 00-2 2v1H6a2 2 0 00-2 2v1h16V9a2 2 0 00-2-2h-2V6a2 2 0 00-2-2h-4zm0 3h4V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1z"/>
    <path d="M4 11h16v5a2 2 0 01-2 2h-5.586l-3.707 2.471A1 1 0 017 19.618V18H6a2 2 0 01-2-2v-5z"/>
  </svg>
);

const WelthChatbotPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* ChatGPT-like interface - full screen, no containers or borders */}
      <ChatInterface />
    </div>
  );
};

export default WelthChatbotPage; 