import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BellIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { riskCalculatorService } from '../services/riskCalculator';

interface NotificationPreferences {
  email_enabled: boolean;
  email_address: string;
  daily_summary: boolean;
  weekly_report: boolean;
  monthly_report: boolean;
  trade_alerts: boolean;
  risk_warnings: boolean;
  performance_milestones: boolean;
  preferred_time: string;
  timezone: string;
}

interface Report {
  _id: string;
  type: string;
  period: string;
  generated_at: string;
  download_url?: string;
}

const NotificationSettingsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
      loadReports();
    }
  }, [isAuthenticated]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getNotificationPreferences();
      if (response.success) {
        setPreferences(response.preferences);
      }
    } catch (err: any) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await riskCalculatorService.getReports();
      if (response.success) {
        setReports(response.reports || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const response = await riskCalculatorService.updateNotificationPreferences(preferences);
      if (response.success) {
        alert('Preferences saved successfully!');
      }
    } catch (err: any) {
      alert('Failed to save preferences: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReport = async (type: string) => {
    try {
      setGenerating(true);
      const response = await riskCalculatorService.generateReport(type, '30d');
      if (response.success) {
        alert('Report generated successfully! Check your email.');
        loadReports();
      }
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setTestingEmail(true);
      const response = await riskCalculatorService.sendTestEmail();
      if (response.success) {
        alert('Test email sent! Please check your inbox.');
      }
    } catch (err: any) {
      alert('Failed to send test email: ' + err.message);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleToggle = (field: keyof NotificationPreferences) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [field]: !preferences[field]
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to manage notification settings
          </p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-primary">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-700 dark:from-pink-800 dark:to-rose-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <BellIcon className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Notification Settings</h1>
          </div>
          <p className="text-xl text-pink-100">
            Manage email reports and performance notifications
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading settings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notification Preferences */}
            <div className="lg:col-span-2 space-y-6">
              {/* Email Configuration */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <EnvelopeIcon className="w-6 h-6 text-pink-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Email Configuration
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={preferences?.email_address || user?.email || ''}
                      onChange={(e) =>
                        setPreferences(
                          preferences
                            ? { ...preferences, email_address: e.target.value }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Enable Email Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive reports and alerts via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.email_enabled || false}
                        onChange={() => handleToggle('email_enabled')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        value={preferences?.preferred_time || '09:00'}
                        onChange={(e) =>
                          setPreferences(
                            preferences
                              ? { ...preferences, preferred_time: e.target.value }
                              : null
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={preferences?.timezone || 'Asia/Kolkata'}
                        onChange={(e) =>
                          setPreferences(
                            preferences ? { ...preferences, timezone: e.target.value } : null
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                        <option value="America/New_York">EST (America/New_York)</option>
                        <option value="Europe/London">GMT (Europe/London)</option>
                        <option value="Asia/Dubai">GST (Asia/Dubai)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSendTestEmail}
                    disabled={testingEmail || !preferences?.email_enabled}
                    className="w-full bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-4 py-2 rounded-lg font-semibold hover:bg-pink-200 dark:hover:bg-pink-900/30 disabled:opacity-50 transition"
                  >
                    {testingEmail ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
              </div>

              {/* Report Preferences */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <DocumentTextIcon className="w-6 h-6 text-pink-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Report Preferences
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Daily Summary</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive daily trading summary
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.daily_summary || false}
                        onChange={() => handleToggle('daily_summary')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Weekly Report</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Comprehensive weekly performance report
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.weekly_report || false}
                        onChange={() => handleToggle('weekly_report')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Monthly Report
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Detailed monthly analytics and insights
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.monthly_report || false}
                        onChange={() => handleToggle('monthly_report')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Alert Preferences */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BellIcon className="w-6 h-6 text-pink-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Alert Preferences
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Trade Alerts</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alerts for trade executions and updates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.trade_alerts || false}
                        onChange={() => handleToggle('trade_alerts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Risk Warnings</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alerts when risk limits are approached
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.risk_warnings || false}
                        onChange={() => handleToggle('risk_warnings')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Performance Milestones
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Celebrate when you hit key milestones
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.performance_milestones || false}
                        onChange={() => handleToggle('performance_milestones')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <CheckCircleIcon className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>

            {/* Report Generation & History */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Generate Report
                </h3>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleGenerateReport('daily')}
                    disabled={generating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    Daily Report
                  </button>
                  <button
                    onClick={() => handleGenerateReport('weekly')}
                    disabled={generating}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    Weekly Report
                  </button>
                  <button
                    onClick={() => handleGenerateReport('monthly')}
                    disabled={generating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    Monthly Report
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Report History
                  </h3>

                  {reports.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                      No reports generated yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {reports.slice(0, 10).map((report) => (
                        <div
                          key={report._id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(report.generated_at).toLocaleString()}
                          </p>
                          {report.download_url && (
                            <a
                              href={report.download_url}
                              className="text-xs text-pink-600 hover:text-pink-800 dark:text-pink-400"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      ))}
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

export default NotificationSettingsPage;
