import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminMonitoringService, { ActivityLog } from '../services/adminMonitoringService';

const AdminActivityLogsPage: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Selected log
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
      fetchStats();
    }
  }, [isAdmin, page, moduleFilter, actionFilter, severityFilter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: any = {};
      if (moduleFilter) filters.module = moduleFilter;
      if (actionFilter) filters.action = actionFilter;
      if (severityFilter) filters.severity = severityFilter;

      const data = await adminMonitoringService.getActivityLogs(page, 50, filters);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminMonitoringService.getActivityStats();
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchLogs();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminMonitoringService.searchLogs(searchQuery, page, 50);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (moduleFilter) filters.module = moduleFilter;
      if (actionFilter) filters.action = actionFilter;
      if (severityFilter) filters.severity = severityFilter;

      const data = await adminMonitoringService.exportActivityLogs(filters);

      // Create and download CSV file
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to export logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return 'fa-plus-circle text-green-600';
      case 'update':
        return 'fa-edit text-blue-600';
      case 'delete':
        return 'fa-trash text-red-600';
      case 'view':
        return 'fa-eye text-gray-600';
      case 'export':
        return 'fa-download text-purple-600';
      case 'approve':
        return 'fa-check-circle text-green-600';
      case 'reject':
        return 'fa-times-circle text-red-600';
      default:
        return 'fa-circle text-gray-600';
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <i className="fas fa-history text-purple-600"></i>
            Activity Logs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor all admin actions and system activities
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.total?.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-purple-600 dark:text-purple-400 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Events</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.severity?.critical}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.severity?.warning}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-circle text-yellow-600 dark:text-yellow-400 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search logs..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
          >
            <option value="">All Modules</option>
            <option value="users">Users</option>
            <option value="subscriptions">Subscriptions</option>
            <option value="content">Content</option>
            <option value="alerts">Alerts</option>
            <option value="support">Support</option>
            <option value="categories">Categories</option>
            <option value="comments">Comments</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="export">Export</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
          >
            <option value="">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          <button
            onClick={handleExport}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <i className="fas fa-download"></i>
            Export CSV
          </button>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Logs Table */}
        {isLoading && !logs.length ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.adminUsername}
                        </p>
                        {log.ipAddress && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{log.ipAddress}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <i className={`fas ${getActionIcon(log.action)}`}></i>
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {log.module.toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                        {log.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                          log.severity
                        )}`}
                      >
                        {log.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowLogModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} logs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-dark-100 disabled:opacity-50 text-gray-900 dark:text-white"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 50 >= total}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-dark-100 disabled:opacity-50 text-gray-900 dark:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Log Detail Modal */}
        {showLogModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log Details</h2>
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Timestamp</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedLog.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Admin</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedLog.adminUsername}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Action</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedLog.action.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Module</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedLog.module.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Severity</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedLog.severity)}`}>
                        {selectedLog.severity.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">IP Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedLog.ipAddress || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedLog.description}
                    </p>
                  </div>

                  {selectedLog.targetType && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Target</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedLog.targetType}: {selectedLog.targetId}
                      </p>
                    </div>
                  )}

                  {selectedLog.beforeState && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Before State</p>
                      <pre className="p-4 bg-gray-50 dark:bg-dark-200 rounded text-sm overflow-x-auto">
                        {JSON.stringify(selectedLog.beforeState, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.afterState && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">After State</p>
                      <pre className="p-4 bg-gray-50 dark:bg-dark-200 rounded text-sm overflow-x-auto">
                        {JSON.stringify(selectedLog.afterState, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.userAgent && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">User Agent</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {selectedLog.userAgent}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLogsPage;
