import React, { useState } from 'react';
import { riskCalculatorService } from '../../../services/riskCalculator';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExportJournalButtonProps {
  filters?: any;
  className?: string;
}

const ExportJournalButton: React.FC<ExportJournalButtonProps> = ({
  filters,
  className = ''
}) => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      // Get CSV blob from API
      const blob = await riskCalculatorService.exportJournalCSV(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `trade_journal_${timestamp}.csv`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to export journal');
      console.error('Export error:', err);

      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowDownTrayIcon className={`w-5 h-5 ${exporting ? 'animate-bounce' : ''}`} />
        <span>{exporting ? 'Exporting...' : 'Export to CSV'}</span>
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default ExportJournalButton;
