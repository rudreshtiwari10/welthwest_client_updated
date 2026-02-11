import React from 'react';
import {
  PencilIcon,
  TagIcon,
  FaceSmileIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface JournalEntryCardProps {
  entry: any;
  onEdit: () => void;
  className?: string;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onEdit,
  className = ''
}) => {
  const isProfitable = (entry.realized_pl || 0) > 0;
  const plPercentage = entry.realized_pl_percent || 0;

  const getEmotionColor = (emotion: string) => {
    const emotionLower = emotion?.toLowerCase() || '';
    switch (emotionLower) {
      case 'confident':
        return 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300';
      case 'fearful':
        return 'bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300';
      case 'greedy':
        return 'bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300';
      case 'neutral':
        return 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300';
      case 'anxious':
        return 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {entry.symbol}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              entry.trade_type === 'delivery'
                ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300'
                : entry.trade_type === 'intraday'
                ? 'bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300'
                : 'bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300'
            }`}>
              {entry.trade_type?.toUpperCase() || 'N/A'}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>
                {new Date(entry.entry_time || entry.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div>
              {entry.quantity} shares @ ₹{entry.entry_price?.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-bold mb-1 ${
            isProfitable
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {isProfitable ? '+' : ''}₹{entry.realized_pl?.toFixed(2) || '0.00'}
          </div>
          <div className={`text-sm ${
            isProfitable
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {isProfitable ? '+' : ''}{plPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            ₹{entry.entry_price?.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exit</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            ₹{entry.exit_price?.toFixed(2) || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stop Loss</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            ₹{entry.stop_loss?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Strategy and Emotion */}
      <div className="flex items-center space-x-2 mb-3">
        {entry.strategy && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 rounded text-xs">
            <ChartBarIcon className="w-3 h-3" />
            <span>{entry.strategy}</span>
          </div>
        )}
        {entry.emotion && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${getEmotionColor(entry.emotion)}`}>
            <FaceSmileIcon className="w-3 h-3" />
            <span>{entry.emotion}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex items-center space-x-2 mb-3 flex-wrap">
          <TagIcon className="w-4 h-4 text-gray-400" />
          {entry.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {entry.notes}
          </p>
        </div>
      )}

      {/* Learnings */}
      {entry.learnings && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Key Learning:
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {entry.learnings}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {entry.exit_reason && (
            <span>Exit: {entry.exit_reason}</span>
          )}
        </div>
        <button
          onClick={onEdit}
          className="flex items-center space-x-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm font-medium"
        >
          <PencilIcon className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
};

export default JournalEntryCard;
