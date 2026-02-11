import React, { useState, useEffect } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';
import JournalEntryCard from './JournalEntryCard';
import JournalEntryForm from './JournalEntryForm';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface TradeJournalProps {
  className?: string;
}

const TradeJournal: React.FC<TradeJournalProps> = ({ className = '' }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    outcome: 'all', // all, win, loss
    emotion: 'all', // all, confident, fearful, greedy, etc.
    strategy: 'all', // all, breakout, reversal, etc.
    dateRange: '30d' // 7d, 30d, 90d, all
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [entries, searchTerm, filters]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getJournalEntries();
      setEntries(response.data?.entries || []);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.symbol?.toLowerCase().includes(term) ||
        entry.notes?.toLowerCase().includes(term) ||
        entry.tags?.some((tag: string) => tag.toLowerCase().includes(term))
      );
    }

    // Outcome filter
    if (filters.outcome !== 'all') {
      filtered = filtered.filter(entry => {
        const pnl = entry.realized_pl || 0;
        return filters.outcome === 'win' ? pnl > 0 : pnl < 0;
      });
    }

    // Emotion filter
    if (filters.emotion !== 'all') {
      filtered = filtered.filter(entry =>
        entry.emotion?.toLowerCase() === filters.emotion.toLowerCase()
      );
    }

    // Strategy filter
    if (filters.strategy !== 'all') {
      filtered = filtered.filter(entry =>
        entry.strategy?.toLowerCase() === filters.strategy.toLowerCase()
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.entry_time || entry.created_at);
        return entryDate >= cutoffDate;
      });
    }

    setFilteredEntries(filtered);
  };

  const handleEditEntry = (entry: any) => {
    setSelectedEntry(entry);
    setIsFormOpen(true);
  };

  const handleSaveEntry = async (entryId: string, data: any) => {
    try {
      await riskCalculatorService.updateJournalEntry(entryId, data);
      await fetchEntries(); // Refresh
      setIsFormOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <LoadingSpinner text="Loading your trade journal..." />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Trade Journal</h1>
        <p className="text-primary-100">
          Document your trades, emotions, and learnings
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by symbol, notes, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={filters.outcome}
              onChange={(e) => setFilters({ ...filters, outcome: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            >
              <option value="all">All Outcomes</option>
              <option value="win">Wins Only</option>
              <option value="loss">Losses Only</option>
            </select>
          </div>

          {/* Emotion Filter */}
          <div>
            <select
              value={filters.emotion}
              onChange={(e) => setFilters({ ...filters, emotion: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            >
              <option value="all">All Emotions</option>
              <option value="confident">Confident</option>
              <option value="fearful">Fearful</option>
              <option value="greedy">Greedy</option>
              <option value="neutral">Neutral</option>
              <option value="anxious">Anxious</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Showing {filteredEntries.length} of {entries.length} trades
          </span>
          {(filters.outcome !== 'all' || filters.emotion !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setFilters({ outcome: 'all', emotion: 'all', strategy: 'all', dateRange: '30d' });
                setSearchTerm('');
              }}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Journal Entries */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FunnelIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No trades found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filters.outcome !== 'all' || filters.emotion !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Start trading to build your journal'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry._id || entry.id}
              entry={entry}
              onEdit={() => handleEditEntry(entry)}
            />
          ))}
        </div>
      )}

      {/* Journal Entry Form Modal */}
      {isFormOpen && (
        <JournalEntryForm
          entry={selectedEntry}
          onSave={(data) => handleSaveEntry(selectedEntry._id || selectedEntry.id, data)}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedEntry(null);
          }}
        />
      )}
    </div>
  );
};

export default TradeJournal;
