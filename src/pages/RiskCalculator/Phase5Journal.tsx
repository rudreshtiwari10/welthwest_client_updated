import React, { useState } from 'react';
import TradeJournal from '../../components/RiskCalculator/Phase5/TradeJournal';
import AIInsightsDashboard from '../../components/RiskCalculator/Phase5/AIInsightsDashboard';
import ExportJournalButton from '../../components/RiskCalculator/Phase5/ExportJournalButton';
import SEBIDisclaimer from '../../components/RiskCalculator/Shared/SEBIDisclaimer';

const Phase5Journal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'journal' | 'insights'>('journal');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('journal')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'journal'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Trade Journal
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'insights'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                AI Insights
              </button>
            </div>
            {activeTab === 'journal' && <ExportJournalButton />}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'journal' ? <TradeJournal /> : <AIInsightsDashboard />}

        <div className="mt-6">
          <SEBIDisclaimer />
        </div>
      </div>
    </div>
  );
};

export default Phase5Journal;
