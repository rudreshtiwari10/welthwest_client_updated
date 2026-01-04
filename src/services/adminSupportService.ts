import api from './api';

// ============================================================================
// SUPPORT TICKETS
// ============================================================================

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  description: string;
  category: 'general' | 'billing' | 'technical' | 'feature_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  notes: Array<{
    author: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
  }>;
  replies: Array<{
    author: string;
    content: string;
    isStaff: boolean;
    createdAt: string;
  }>;
  attachments: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  userId?: string;
}

export const getTickets = async (page = 1, limit = 20, filters?: TicketFilters) => {
  const params: any = { page, limit, ...filters };
  const response = await api.get('/admin/support/tickets', { params });
  return response.data;
};

export const getTicket = async (ticketId: string) => {
  const response = await api.get(`/admin/support/tickets/${ticketId}`);
  return response.data;
};

export const assignTicket = async (ticketId: string, staffId: string, staffName: string) => {
  const response = await api.post(`/admin/support/tickets/${ticketId}/assign`, {
    staffId,
    staffName,
  });
  return response.data;
};

export const addTicketNote = async (ticketId: string, content: string) => {
  const response = await api.post(`/admin/support/tickets/${ticketId}/notes`, { content });
  return response.data;
};

export const addTicketReply = async (ticketId: string, content: string) => {
  const response = await api.post(`/admin/support/tickets/${ticketId}/replies`, { content });
  return response.data;
};

export const updateTicketStatus = async (ticketId: string, status: string) => {
  const response = await api.put(`/admin/support/tickets/${ticketId}/status`, { status });
  return response.data;
};

export const updateTicketPriority = async (ticketId: string, priority: string) => {
  const response = await api.put(`/admin/support/tickets/${ticketId}/priority`, { priority });
  return response.data;
};

export const getTicketStats = async () => {
  const response = await api.get('/admin/support/tickets/stats');
  return response.data;
};

export const getUnassignedTickets = async (limit = 20) => {
  const response = await api.get('/admin/support/tickets/unassigned', { params: { limit } });
  return response.data;
};

// ============================================================================
// USER COMMUNICATION
// ============================================================================

export const sendAnnouncement = async (data: {
  title: string;
  message: string;
  targetGroup?: string;
}) => {
  const response = await api.post('/admin/communication/announcements', data);
  return response.data;
};

export const sendTargetedMessage = async (data: {
  userIds: string[];
  subject: string;
  message: string;
}) => {
  const response = await api.post('/admin/communication/message', data);
  return response.data;
};

const adminSupportService = {
  getTickets,
  getTicket,
  assignTicket,
  addTicketNote,
  addTicketReply,
  updateTicketStatus,
  updateTicketPriority,
  getTicketStats,
  getUnassignedTickets,
  sendAnnouncement,
  sendTargetedMessage,
};

export default adminSupportService;
