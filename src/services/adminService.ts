/**
 * Admin Service - API calls for admin dashboard
 * All endpoints require admin authentication
 */
import api from './api';

export interface DashboardOverview {
  total_users: number;
  active_premium_users: number;
  users_by_plan: Record<string, number>;
  recent_signups_7d: number;
  monthly_revenue: number;
  total_revenue: number;
  pending_payments: number;
  subscription_churn_30d: number;
  recent_users: any[];
  timestamp: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  created_at: string;
  subscription?: any;
  is_blocked?: boolean;
}

export interface Transaction {
  _id: string;
  user_id: string;
  plan_id: string;
  plan_duration: string;
  amount: number;
  status: string;
  gateway: string;
  created_at: string;
  completed_at?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UserListParams extends PaginationParams {
  search?: string;
  plan?: string;
  status?: string;
  role?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TransactionListParams extends PaginationParams {
  status?: string;
  user_id?: string;
  plan_id?: string;
  gateway?: string;
}

export interface AuditLogParams extends PaginationParams {
  admin_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
  feature?: string;
}

const adminService = {
  // ==================
  // DASHBOARD OVERVIEW
  // ==================

  async getDashboardOverview(): Promise<DashboardOverview> {
    const response = await api.get('/admin/dashboard/overview');
    return response.data;
  },

  // ==================
  // USER MANAGEMENT
  // ==================

  async listUsers(params?: UserListParams) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async getUserDetails(userId: string) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async updateUser(userId: string, userData: Partial<User>) {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  async updateUserSubscription(
    userId: string,
    plan: string,
    duration: string,
    action: 'upgrade' | 'downgrade' | 'extend' | 'cancel'
  ) {
    const response = await api.post(`/admin/users/${userId}/subscription`, {
      plan,
      duration,
      action
    });
    return response.data;
  },

  async blockUser(userId: string, reason: string) {
    const response = await api.post(`/admin/users/${userId}/block`, {
      action: 'block',
      reason
    });
    return response.data;
  },

  async unblockUser(userId: string) {
    const response = await api.post(`/admin/users/${userId}/block`, {
      action: 'unblock'
    });
    return response.data;
  },

  async deleteUser(userId: string) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // ==================
  // SUBSCRIPTION ANALYTICS
  // ==================

  async getSubscriptionAnalytics() {
    const response = await api.get('/admin/subscriptions/analytics');
    return response.data;
  },

  // ==================
  // PAYMENT & TRANSACTIONS
  // ==================

  async listTransactions(params?: TransactionListParams) {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  async getTransactionDetails(transactionId: string) {
    const response = await api.get(`/admin/transactions/${transactionId}`);
    return response.data;
  },

  async refundTransaction(transactionId: string, amount?: number, reason?: string) {
    const response = await api.post(`/admin/transactions/${transactionId}/refund`, {
      amount,
      reason
    });
    return response.data;
  },

  // ==================
  // REPORTS & ANALYTICS
  // ==================

  async getRevenueReport(params?: ReportParams) {
    const response = await api.get('/admin/reports/revenue', { params });
    return response.data;
  },

  async getUsageReport(params?: ReportParams) {
    const response = await api.get('/admin/reports/usage', { params });
    return response.data;
  },

  // ==================
  // AUDIT LOGS
  // ==================

  async getAuditLogs(params?: AuditLogParams) {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  // ==================
  // CONTENT MANAGEMENT
  // ==================

  async getAllFeedback(params?: PaginationParams & { category?: string; rating?: number }) {
    const response = await api.get('/admin/feedback', { params });
    return response.data;
  },

  // ==================
  // SYSTEM SETTINGS
  // ==================

  async getSystemSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updatePlan(planId: string, planData: any) {
    const response = await api.put(`/admin/settings/plans/${planId}`, planData);
    return response.data;
  },
};

export default adminService;
