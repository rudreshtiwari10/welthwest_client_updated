import React from 'react';
import ChatInterface from '../components/ChatInterface';
import SubscriptionBanner from '../components/subscription/SubscriptionBanner';

const AIPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-500">
      <SubscriptionBanner />
      
      <div className="container mx-auto px-4 pt-20 md:pt-8 pb-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              WelthAI Assistant
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your personal financial advisor powered by AI
            </p>
          </div>
          
          <div className="bg-white dark:bg-dark-400 rounded-lg shadow-lg p-6" id="ai-assistant">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage; 