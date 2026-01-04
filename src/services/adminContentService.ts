import api from './api';

// ============================================================================
// BLOG MANAGEMENT
// ============================================================================

export const getBlogAnalytics = async (blogId: string) => {
  const response = await api.get(`/admin/content/blogs/analytics/${blogId}`);
  return response.data;
};

export const submitBlogForApproval = async (blogId: string) => {
  const response = await api.post(`/admin/content/blogs/${blogId}/submit`);
  return response.data;
};

export const approveBlog = async (blogId: string, comment?: string) => {
  const response = await api.post(`/admin/content/blogs/${blogId}/approve`, { comment });
  return response.data;
};

export const rejectBlog = async (blogId: string, comment: string) => {
  const response = await api.post(`/admin/content/blogs/${blogId}/reject`, { comment });
  return response.data;
};

export const addBlogComment = async (blogId: string, comment: string) => {
  const response = await api.post(`/admin/content/blogs/${blogId}/comment`, { comment });
  return response.data;
};

// ============================================================================
// MARKET ALERTS
// ============================================================================

export interface Alert {
  _id: string;
  title: string;
  message: string;
  intent: 'info' | 'warning' | 'critical';
  targetGroup: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledFor?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  recipientCount: number;
  viewCount: number;
}

export const getAlerts = async (page = 1, limit = 20, status?: string) => {
  const params: any = { page, limit };
  if (status) params.status = status;
  const response = await api.get('/admin/content/alerts', { params });
  return response.data;
};

export const getAlert = async (alertId: string) => {
  const response = await api.get(`/admin/content/alerts/${alertId}`);
  return response.data;
};

export const createAlert = async (alertData: {
  title: string;
  message: string;
  intent?: 'info' | 'warning' | 'critical';
  targetGroup?: string;
  scheduledFor?: string;
}) => {
  const response = await api.post('/admin/content/alerts', alertData);
  return response.data;
};

export const updateAlert = async (alertId: string, alertData: Partial<Alert>) => {
  const response = await api.put(`/admin/content/alerts/${alertId}`, alertData);
  return response.data;
};

export const deleteAlert = async (alertId: string) => {
  const response = await api.delete(`/admin/content/alerts/${alertId}`);
  return response.data;
};

export const sendAlertNow = async (alertId: string) => {
  const response = await api.post(`/admin/content/alerts/${alertId}/send`);
  return response.data;
};

// ============================================================================
// COMMENTS & MODERATION
// ============================================================================

export interface Comment {
  _id: string;
  blogId: string;
  userId: string;
  username: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  flagReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
}

export const getAllComments = async (page = 1, limit = 20, status = 'pending') => {
  const response = await api.get('/admin/content/comments', { params: { page, limit, status } });
  return response.data;
};

export const approveComment = async (commentId: string) => {
  const response = await api.post(`/admin/content/comments/${commentId}/approve`);
  return response.data;
};

export const rejectComment = async (commentId: string, reason?: string) => {
  const response = await api.post(`/admin/content/comments/${commentId}/reject`, { reason });
  return response.data;
};

export const flagComment = async (commentId: string, reason: string) => {
  const response = await api.post(`/admin/content/comments/${commentId}/flag`, { reason });
  return response.data;
};

export const deleteComment = async (commentId: string) => {
  const response = await api.delete(`/admin/content/comments/${commentId}`);
  return response.data;
};

export const getFlaggedUsers = async () => {
  const response = await api.get('/admin/content/comments/flagged-users');
  return response.data;
};

// ============================================================================
// CATEGORIES
// ============================================================================

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  createdBy: string;
  createdAt: string;
}

export const getCategories = async (page = 1, limit = 50) => {
  const response = await api.get('/admin/content/categories', { params: { page, limit } });
  return response.data;
};

export const createCategory = async (categoryData: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}) => {
  const response = await api.post('/admin/content/categories', categoryData);
  return response.data;
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
  const response = await api.put(`/admin/content/categories/${categoryId}`, categoryData);
  return response.data;
};

export const deleteCategory = async (categoryId: string) => {
  const response = await api.delete(`/admin/content/categories/${categoryId}`);
  return response.data;
};

export const getPopularCategories = async (limit = 10) => {
  const response = await api.get('/admin/content/categories/popular', { params: { limit } });
  return response.data;
};

const adminContentService = {
  // Blogs
  getBlogAnalytics,
  submitBlogForApproval,
  approveBlog,
  rejectBlog,
  addBlogComment,

  // Alerts
  getAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  sendAlertNow,

  // Comments
  getAllComments,
  approveComment,
  rejectComment,
  flagComment,
  deleteComment,
  getFlaggedUsers,

  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPopularCategories,
};

export default adminContentService;
