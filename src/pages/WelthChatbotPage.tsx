import React from 'react';
import ChatInterface from '../components/ChatInterface';
import { SparklesIcon, BeakerIcon } from '@heroicons/react/24/outline';

const WelthChatbotPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <BeakerIcon className="h-8 w-8 text-purple-500 mr-3" />
          WelthAI Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Your AI-powered financial assistant. Ask questions about stocks, market trends, or get investment insights.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-md">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Chat Assistant
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by advanced AI
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="h-[70vh]">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default WelthChatbotPage; 