import React from 'react';
import ChatInterface from '../components/ChatInterface';

const WelthAIPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1a1f2e] rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
              <div className="bg-primary-600 rounded-full p-2">
                <i className="fas fa-robot text-white text-xl"></i>
              </div>
              <span>Welth AI Assistant</span>
            </h1>
            <p className="mt-2 text-gray-400">
              Ask questions about stocks, market trends, or get investment insights
            </p>
          </div>

          {/* Chat Interface */}
          <div className="p-6">
            <ChatInterface />
          </div>

          {/* Usage Stats */}
          <div className="bg-[#151922] p-6 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a1f2e] p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Daily Queries</h3>
                <p className="text-xl font-semibold text-white mt-1">0 / 100</p>
              </div>
              <div className="bg-[#1a1f2e] p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Response Time</h3>
                <p className="text-xl font-semibold text-white mt-1">~2s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelthAIPage; 