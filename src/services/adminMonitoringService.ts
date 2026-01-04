import api from './api';

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export interface ActivityLog {
  _id: string;
  adminId: string;
  adminUsername: string;
  adminEmail?: string;
  action: string;
  module: string;
  targetType?: string;
  targetId?: string;
  description: string;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  metadata?: any;
}

export interface ActivityLogFilters {
  adminId?: string;
  module?: string;
  action?: string;
  severity?: string;
  targetType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getActivityLogs = async (page = 1, limit = 50, filters?: ActivityLogFilters) => {
  const params: any = { page, limit, ...filters };
  const response = await api.get('/admin/monitoring/activity-logs', { params });
  return response.data;
};

export const getActivityLog = async (logId: string) => {
  const response = await api.get(`/admin/monitoring/activity-logs/${logId}`);
  return response.data;
};

export const getLogsByAdmin = async (adminId: string, page = 1, limit = 50) => {
  const response = await api.get(`/admin/monitoring/activity-logs/admin/${adminId}`, {
    params: { page, limit },
  });
  return response.data;
};

export const getLogsByModule = async (module: string, page = 1, limit = 50) => {
  const response = await api.get(`/admin/monitoring/activity-logs/module/${module}`, {
    params: { page, limit },
  });
  return response.data;
};

export const getLogsByTarget = async (
  targetType: string,
  targetId: string,
  page = 1,
  limit = 50
) => {
  const response = await api.get(
    `/admin/monitoring/activity-logs/target/${targetType}/${targetId}`,
    { params: { page, limit } }
  );
  return response.data;
};

export const getCriticalLogs = async (page = 1, limit = 50) => {
  const response = await api.get('/admin/monitoring/activity-logs/critical', {
    params: { page, limit },
  });
  return response.data;
};

export const getRecentLogs = async (limit = 100) => {
  const response = await api.get('/admin/monitoring/activity-logs/recent', { params: { limit } });
  return response.data;
};

export const getActivityStats = async () => {
  const response = await api.get('/admin/monitoring/activity-logs/stats');
  return response.data;
};

export const searchLogs = async (query: string, page = 1, limit = 50) => {
  const response = await api.get('/admin/monitoring/activity-logs/search', {
    params: { q: query, page, limit },
  });
  return response.data;
};

export const exportActivityLogs = async (filters?: ActivityLogFilters) => {
  const params: any = { ...filters };
  const response = await api.get('/admin/monitoring/activity-logs/export', { params });
  return response.data;
};

// ============================================================================
// SYSTEM LOGS
// ============================================================================

export const getSystemLogs = async (page = 1, limit = 100, severity?: string) => {
  const params: any = { page, limit };
  if (severity) params.severity = severity;
  const response = await api.get('/admin/monitoring/system-logs', { params });
  return response.data;
};

export const exportSystemLogs = async () => {
  const response = await api.get('/admin/monitoring/system-logs/export');
  return response.data;
};

const adminMonitoringService = {
  getActivityLogs,
  getActivityLog,
  getLogsByAdmin,
  getLogsByModule,
  getLogsByTarget,
  getCriticalLogs,
  getRecentLogs,
  getActivityStats,
  searchLogs,
  exportActivityLogs,
  getSystemLogs,
  exportSystemLogs,
};

export default adminMonitoringService;
