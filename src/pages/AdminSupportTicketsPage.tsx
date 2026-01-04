import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminSupportService, { SupportTicket } from '../services/adminSupportService';

const AdminSupportTicketsPage: React.FC = () => {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Selected ticket
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Reply/Note
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');

  // Stats
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTickets();
      fetchStats();
    }
  }, [isAdmin, page, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;

      const data = await adminSupportService.getTickets(page, 20, filters);
      setTickets(data.tickets);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminSupportService.getTicketStats();
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleViewTicket = async (ticketId: string) => {
    try {
      setIsLoading(true);
      const data = await adminSupportService.getTicket(ticketId);
      setSelectedTicket(data.ticket);
      setShowTicketModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToMe = async (ticketId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userId = (user as any)._id || (user as any).id || '';
      const userName = (user as any).username || (user as any).email || 'Admin';
      await adminSupportService.assignTicket(
        ticketId,
        userId,
        userName
      );
      fetchTickets();
      if (selectedTicket?._id === ticketId) {
        handleViewTicket(ticketId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      setIsLoading(true);
      await adminSupportService.updateTicketStatus(ticketId, status);
      fetchTickets();
      if (selectedTicket?._id === ticketId) {
        handleViewTicket(ticketId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePriority = async (ticketId: string, priority: string) => {
    try {
      setIsLoading(true);
      await adminSupportService.updateTicketPriority(ticketId, priority);
      fetchTickets();
      if (selectedTicket?._id === ticketId) {
        handleViewTicket(ticketId);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update priority');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setIsLoading(true);
      await adminSupportService.addTicketReply(selectedTicket._id, replyText);
      setReplyText('');
      handleViewTicket(selectedTicket._id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add reply');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !noteText.trim()) return;

    try {
      setIsLoading(true);
      await adminSupportService.addTicketNote(selectedTicket._id, noteText);
      setNoteText('');
      handleViewTicket(selectedTicket._id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add note');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'in_progress':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'waiting':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
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
            <i className="fas fa-ticket-alt text-purple-600"></i>
            Support Tickets
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and respond to user support requests
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.open}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-folder-open text-blue-600 dark:text-blue-400 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-spinner text-purple-600 dark:text-purple-400 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.urgent}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.resolved}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting">Waiting</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={fetchTickets}
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

        {/* Tickets Table */}
        {isLoading && !tickets.length ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.ticketNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {ticket.subject}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.userName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {ticket.assignedToName || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewTicket(ticket._id)}
                          className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {!ticket.assignedTo && (
                          <button
                            onClick={() => handleAssignToMe(ticket._id)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            title="Assign to Me"
                          >
                            <i className="fas fa-user-plus"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ticket Detail Modal */}
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-100 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedTicket.ticketNumber}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                      {selectedTicket.subject}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {/* Ticket Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedTicket.userName} ({selectedTicket.userEmail})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedTicket.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Priority</p>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handleUpdatePriority(selectedTicket._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-100 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-100 text-gray-900 dark:text-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Replies */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Conversation
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedTicket.replies.map((reply, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          reply.isStaff
                            ? 'bg-purple-50 dark:bg-purple-900/20 ml-8'
                            : 'bg-gray-50 dark:bg-dark-200 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {reply.author}
                            {reply.isStaff && (
                              <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                                Staff
                              </span>
                            )}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Reply */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Add Reply (Visible to User)
                  </h3>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    placeholder="Type your reply..."
                  />
                  <button
                    onClick={handleAddReply}
                    disabled={!replyText.trim() || isLoading}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Send Reply
                  </button>
                </div>

                {/* Internal Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Internal Notes (Private)
                  </h3>
                  {selectedTicket.notes.length > 0 && (
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {selectedTicket.notes.map((note, index) => (
                        <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {note.author}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    placeholder="Add internal note..."
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || isLoading}
                    className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportTicketsPage;
