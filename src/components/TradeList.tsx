import React, { useState } from 'react';

interface FormattedTrade {
  entry_date: string;
  exit_date: string;
  entry_price: string;
  exit_price: string;
  size: number;
  pnl: string;
  pnl_pct: string;
}

interface TradeListProps {
  trades: FormattedTrade[];
}

const TradeList: React.FC<TradeListProps> = ({ trades }) => {
  const [sortField, setSortField] = useState<keyof FormattedTrade>('entry_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calculate summary statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => parseFloat(t.pnl) > 0).length;
  const losingTrades = trades.filter(t => parseFloat(t.pnl) < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(2) : '0.00';
  const totalPnL = trades.reduce((sum, trade) => sum + parseFloat(trade.pnl), 0).toFixed(2);
  const avgPnL = totalTrades > 0 ? (parseFloat(totalPnL) / totalTrades).toFixed(2) : '0.00';
  const avgWinPnL = trades
    .filter(t => parseFloat(t.pnl) > 0)
    .reduce((sum, trade, i, arr) => i === arr.length - 1 ? (sum + parseFloat(trade.pnl)) / arr.length : sum + parseFloat(trade.pnl), 0)
    .toFixed(2);
  const avgLossPnL = trades
    .filter(t => parseFloat(t.pnl) < 0)
    .reduce((sum, trade, i, arr) => i === arr.length - 1 ? (sum + parseFloat(trade.pnl)) / arr.length : sum + parseFloat(trade.pnl), 0)
    .toFixed(2);

  // Sort trades
  const sortedTrades = [...trades].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Convert string numbers to actual numbers for comparison
    if (['pnl', 'pnl_pct', 'entry_price', 'exit_price'].includes(sortField)) {
      aValue = parseFloat(aValue as string);
      bValue = parseFloat(bValue as string);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: keyof FormattedTrade) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: keyof FormattedTrade }) => {
    if (field !== sortField) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Trades</div>
          <div className="text-lg font-semibold">{totalTrades}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Win Rate</div>
          <div className="text-lg font-semibold">{winRate}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total P&L</div>
          <div className={`text-lg font-semibold ${parseFloat(totalPnL) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${totalPnL}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg P&L per Trade</div>
          <div className={`text-lg font-semibold ${parseFloat(avgPnL) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${avgPnL}
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Winning Trades</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">{winningTrades}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Losing Trades</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">{losingTrades}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Win</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">${avgWinPnL}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Loss</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">${avgLossPnL}</div>
        </div>
      </div>

      {/* Trade Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {Object.keys(trades[0] || {}).map((field) => (
                <th
                  key={field}
                  onClick={() => handleSort(field as keyof FormattedTrade)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {field.replace('_', ' ').toUpperCase()}
                  <SortIcon field={field as keyof FormattedTrade} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTrades.map((trade, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.entry_date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.exit_date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${trade.entry_price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${trade.exit_price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{trade.size.toFixed(2)}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${parseFloat(trade.pnl) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${trade.pnl}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${parseFloat(trade.pnl_pct) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {trade.pnl_pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeList; 