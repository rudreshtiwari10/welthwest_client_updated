import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminService, { DashboardOverview } from '../services/adminService';

const AdminDashboardPage: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchOverview();
    }
  }, [isAdmin]);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getDashboardOverview();
      setOverview(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !isAdmin) {
    return <div className="min-h-screen bg-gray-50 dark:bg-dark-200 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <i className="fas fa-shield-alt text-red-600"></i>
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Complete administrative control and analytics
              </p>
            </div>
            <button
              onClick={fetchOverview}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

        {isLoading && !overview ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : overview ? (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {overview.total_users.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      +{overview.recent_signups_7d} this week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-blue-600 dark:text-blue-400 text-xl"></i>
                  </div>
                </div>
              </div>

              {/* Active Premium Users */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Users</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {overview.active_premium_users.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {((overview.active_premium_users / overview.total_users) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-crown text-purple-600 dark:text-purple-400 text-xl"></i>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      ₹{(overview.monthly_revenue / 100).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Total: ₹{(overview.total_revenue / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-rupee-sign text-green-600 dark:text-green-400 text-xl"></i>
                  </div>
                </div>
              </div>

              {/* Pending Payments */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {overview.pending_payments}
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      Requires attention
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <i className="fas fa-hourglass-half text-orange-600 dark:text-orange-400 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link
                to="/admin/users"
                className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-users-cog text-blue-600 dark:text-blue-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage all users</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/subscriptions"
                className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-chart-line text-purple-600 dark:text-purple-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Subscriptions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Analytics & management</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/transactions"
                className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-credit-card text-green-600 dark:text-green-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Transactions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment management</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/reports"
                className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className="fas fa-file-chart-line text-indigo-600 dark:text-indigo-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Reports</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Analytics & insights</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Users by Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-pie text-purple-600"></i>
                  Users by Plan
                </h3>
                <div className="space-y-3">
                  {Object.entries(overview.users_by_plan).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          plan === 'ENTERPRISE' ? 'bg-purple-600' :
                          plan === 'ADVANCED' ? 'bg-blue-600' :
                          plan === 'PRO' ? 'bg-green-600' :
                          plan === 'STARTER' ? 'bg-yellow-600' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{plan || 'FREE'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900 dark:text-white font-semibold">{count}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({((count / overview.total_users) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-clock text-blue-600"></i>
                  Recent Signups
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {overview.recent_users.map((user: any) => (
                    <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          user.subscription?.plan === 'FREE' || !user.subscription?.plan
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        }`}>
                          {user.subscription?.plan || 'FREE'}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Stats */}
            <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-indigo-600"></i>
                System Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subscription Churn (30d)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {overview.subscription_churn_30d}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {new Date(overview.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {((overview.active_premium_users / overview.total_users) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
