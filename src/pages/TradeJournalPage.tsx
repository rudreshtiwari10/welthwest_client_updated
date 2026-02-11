import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpenIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { riskCalculatorService } from '../services/riskCalculator';

interface JournalEntry {
  _id: string;
  symbol: string;
  entry_date: string;
  exit_date?: string;
  entry_price: number;
  exit_price?: number;
  quantity: number;
  pl: number;
  notes?: string;
  emotions?: string;
  mistakes?: string;
  lessons_learned?: string;
  setup_type?: string;
  outcome: 'win' | 'loss' | 'breakeven' | 'open';
}

interface AIInsights {
  last_generated: string;
  insights: {
    winning_patterns: string[];
    losing_patterns: string[];
    emotional_triggers: string[];
    recommendations: string[];
    performance_summary: string;
  };
}

const TradeJournalPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    outcome: '',
    setup_type: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadJournalEntries();
      loadCachedInsights();
    }
  }, [isAuthenticated, filters]);

  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getJournalEntries(filters);
      if (response.success) {
        setEntries(response.entries || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCachedInsights = async () => {
    try {
      const response = await riskCalculatorService.getCachedInsights();
      if (response.success && response.insights) {
        setInsights(response);
      }
    } catch (err) {
      // Insights are optional, don't show error
      console.log('No cached insights available');
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setInsightsLoading(true);
      const response = await riskCalculatorService.generateInsights();
      if (response.success) {
        setInsights(response);
        alert('AI insights generated successfully!');
      }
    } catch (err: any) {
      alert('Failed to generate insights: ' + err.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleUpdateEntry = async () => {
    if (!selectedEntry) return;

    try {
      const response = await riskCalculatorService.updateJournalEntry(selectedEntry._id, {
        notes: selectedEntry.notes,
        emotions: selectedEntry.emotions,
        mistakes: selectedEntry.mistakes,
        lessons_learned: selectedEntry.lessons_learned,
        setup_type: selectedEntry.setup_type
      });

      if (response.success) {
        setShowEditModal(false);
        setSelectedEntry(null);
        loadJournalEntries();
        alert('Journal entry updated successfully!');
      }
    } catch (err: any) {
      alert('Failed to update entry: ' + err.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await riskCalculatorService.exportJournalCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trade-journal-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'win':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'loss':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'breakeven':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    return outcome === 'win' ? (
      <CheckCircleIcon className="w-5 h-5" />
    ) : (
      <XCircleIcon className="w-5 h-5" />
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access your trade journal
          </p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-primary">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpenIcon className="w-12 h-12" />
                <h1 className="text-4xl font-bold">Trade Journal</h1>
              </div>
              <p className="text-xl text-purple-100">
                Document your trades and get AI-powered insights
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateInsights}
                disabled={insightsLoading}
                className="bg-white hover:bg-gray-100 text-purple-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50"
              >
                <SparklesIcon className="w-5 h-5" />
                {insightsLoading ? 'Generating...' : 'Generate AI Insights'}
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Insights Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-purple-600" />
                AI Insights
              </h2>

              {insights ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                      Winning Patterns
                    </h3>
                    <ul className="space-y-1">
                      {insights.insights.winning_patterns.map((pattern, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          • {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                      Losing Patterns
                    </h3>
                    <ul className="space-y-1">
                      {insights.insights.losing_patterns.map((pattern, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          • {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">
                      Emotional Triggers
                    </h3>
                    <ul className="space-y-1">
                      {insights.insights.emotional_triggers.map((trigger, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          • {trigger}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      Recommendations
                    </h3>
                    <ul className="space-y-1">
                      {insights.insights.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated: {new Date(insights.last_generated).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    No insights generated yet
                  </p>
                  <button
                    onClick={handleGenerateInsights}
                    disabled={insightsLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {insightsLoading ? 'Generating...' : 'Generate Now'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Journal Entries */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select
                  value={filters.outcome}
                  onChange={(e) => setFilters({ ...filters, outcome: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Outcomes</option>
                  <option value="win">Wins</option>
                  <option value="loss">Losses</option>
                  <option value="breakeven">Breakeven</option>
                  <option value="open">Open</option>
                </select>

                <input
                  type="text"
                  value={filters.setup_type}
                  onChange={(e) => setFilters({ ...filters, setup_type: e.target.value })}
                  placeholder="Setup Type"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />

                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />

                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Entries List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading entries...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No journal entries found. Start logging your trades!
                  </p>
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {entry.symbol}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getOutcomeColor(entry.outcome)}`}>
                            {getOutcomeIcon(entry.outcome)}
                            {entry.outcome.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Entry: {new Date(entry.entry_date).toLocaleDateString()}
                          {entry.exit_date && ` • Exit: ${new Date(entry.exit_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowEditModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Entry Price</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(entry.entry_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Exit Price</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {entry.exit_price ? formatCurrency(entry.exit_price) : 'Open'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quantity</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {entry.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">P&L</p>
                        <p className={`text-sm font-semibold ${
                          entry.pl >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(entry.pl)}
                        </p>
                      </div>
                    </div>

                    {entry.setup_type && (
                      <div className="mb-3">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs font-semibold rounded-full">
                          {entry.setup_type}
                        </span>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Notes:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{entry.notes}</p>
                      </div>
                    )}

                    {entry.emotions && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Emotions:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{entry.emotions}</p>
                      </div>
                    )}

                    {entry.lessons_learned && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Lessons Learned:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.lessons_learned}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Journal Entry Modal */}
      {showEditModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Edit Journal Entry - {selectedEntry.symbol}
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Setup Type
                </label>
                <input
                  type="text"
                  value={selectedEntry.setup_type || ''}
                  onChange={(e) =>
                    setSelectedEntry({ ...selectedEntry, setup_type: e.target.value })
                  }
                  placeholder="e.g., Breakout, Support Bounce, etc."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={selectedEntry.notes || ''}
                  onChange={(e) => setSelectedEntry({ ...selectedEntry, notes: e.target.value })}
                  rows={3}
                  placeholder="What was your reasoning for this trade?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emotions
                </label>
                <textarea
                  value={selectedEntry.emotions || ''}
                  onChange={(e) =>
                    setSelectedEntry({ ...selectedEntry, emotions: e.target.value })
                  }
                  rows={2}
                  placeholder="How did you feel during this trade?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mistakes
                </label>
                <textarea
                  value={selectedEntry.mistakes || ''}
                  onChange={(e) =>
                    setSelectedEntry({ ...selectedEntry, mistakes: e.target.value })
                  }
                  rows={2}
                  placeholder="What mistakes did you make?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lessons Learned
                </label>
                <textarea
                  value={selectedEntry.lessons_learned || ''}
                  onChange={(e) =>
                    setSelectedEntry({ ...selectedEntry, lessons_learned: e.target.value })
                  }
                  rows={2}
                  placeholder="What did you learn from this trade?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleUpdateEntry}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedEntry(null);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeJournalPage;
