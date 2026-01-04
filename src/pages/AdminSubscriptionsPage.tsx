import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';

const AdminSubscriptionsPage: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getSubscriptionAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <i className="fas fa-chart-line text-purple-600"></i>
                Subscription Analytics
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Complete subscription analytics and management
              </p>
            </div>
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        {isLoading && !analytics ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Subscriptions */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {analytics.active_subscriptions?.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-xl"></i>
                  </div>
                </div>
              </div>

              {/* Inactive Subscriptions */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {analytics.inactive_subscriptions?.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <i className="fas fa-times-circle text-gray-600 dark:text-gray-400 text-xl"></i>
                  </div>
                </div>
              </div>

              {/* Recent Upgrades (30d) */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upgrades (30d)</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {(Object.values(analytics.recent_upgrades_30d || {}).reduce((a: any, b: any) => a + b, 0) as number)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-arrow-up text-blue-600 dark:text-blue-400 text-xl"></i>
                  </div>
                </div>
              </div>

              {/* Churned Users (30d) */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn (30d)</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {analytics.churned_users_30d?.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user-slash text-red-600 dark:text-red-400 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Users by Plan */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-users text-purple-600"></i>
                  Users by Plan
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.users_by_plan || {}).map(([plan, count]: [string, any]) => {
                    const total = Object.values(analytics.users_by_plan || {}).reduce((a: any, b: any) => a + b, 0) as number;
                    const percentage = ((count / total) * 100).toFixed(1);

                    return (
                      <div key={plan}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{plan}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              plan === 'ENTERPRISE' ? 'bg-purple-600' :
                              plan === 'ADVANCED' ? 'bg-blue-600' :
                              plan === 'PRO' ? 'bg-green-600' :
                              plan === 'STARTER' ? 'bg-yellow-600' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Users by Duration */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-indigo-600"></i>
                  Billing Cycles
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.users_by_duration || {}).map(([duration, count]: [string, any]) => {
                    const total = Object.values(analytics.users_by_duration || {}).reduce((a: any, b: any) => a + b, 0) as number;
                    const percentage = ((count / total) * 100).toFixed(1);

                    return (
                      <div key={duration}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {duration}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              duration === 'annual' ? 'bg-purple-600' :
                              duration === 'monthly' ? 'bg-blue-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Revenue by Plan */}
            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-rupee-sign text-green-600"></i>
                Revenue by Plan (All Time)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avg. Transaction
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(analytics.revenue_by_plan || {}).map(([plan, data]: [string, any]) => (
                      <tr key={plan} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            plan === 'ENTERPRISE' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                            plan === 'ADVANCED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            plan === 'PRO' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            plan === 'STARTER' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}>
                            {plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ₹{(data.revenue / 100).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {data.transactions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          ₹{((data.revenue / data.transactions) / 100).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Upgrades by Plan */}
            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-clock text-blue-600"></i>
                Recent Upgrades (Last 30 Days)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(analytics.recent_upgrades_30d || {}).map(([plan, count]: [string, any]) => (
                  <div key={plan} className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{plan}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
