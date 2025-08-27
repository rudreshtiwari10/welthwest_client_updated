// Chat System Settings - User controls for system selection and monitoring
// Part of Phase 3: Safe Transition implementation

import React, { useState, useEffect } from 'react';
import { CogIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CHATBOT_CONFIG } from '../config/chatbot-config';

interface SystemMetrics {
  oldSystem: {
    totalSessions: number;
    averageLoadTime: number;
    errorRate: number;
    lastError?: string;
  };
  newSystem: {
    totalSessions: number;
    averageLoadTime: number;
    errorRate: number;
    lastError?: string;
  };
  userPreference: 'old' | 'new' | 'auto';
  abTestGroup?: 'A' | 'B' | 'control';
}

interface ChatSystemSettingsProps {
  currentSystem: 'old' | 'new';
  onSystemChange: (system: 'old' | 'new' | 'auto') => void;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSystemSettings: React.FC<ChatSystemSettingsProps> = ({
  currentSystem,
  onSystemChange,
  isOpen,
  onClose
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    oldSystem: { totalSessions: 0, averageLoadTime: 0, errorRate: 0 },
    newSystem: { totalSessions: 0, averageLoadTime: 0, errorRate: 0 },
    userPreference: 'auto',
    abTestGroup: 'control'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
      loadUserPreference();
    }
  }, [isOpen]);

  const loadMetrics = async () => {
    try {
      // Load metrics from localStorage and server
      const localMetrics = localStorage.getItem('chatSystemMetrics');
      if (localMetrics) {
        const parsed = JSON.parse(localMetrics);
        setMetrics(prev => ({ ...prev, ...parsed }));
      }

      // Simulate loading real metrics (would come from analytics service)
      setIsLoading(true);
      setTimeout(() => {
        setMetrics(prev => ({
          ...prev,
          oldSystem: {
            totalSessions: Math.floor(Math.random() * 100) + 50,
            averageLoadTime: Math.random() * 1000 + 500,
            errorRate: Math.random() * 5,
            lastError: Math.random() > 0.7 ? 'Failed to load conversation' : undefined
          },
          newSystem: {
            totalSessions: Math.floor(Math.random() * 50) + 20,
            averageLoadTime: Math.random() * 500 + 200,
            errorRate: Math.random() * 2,
            lastError: Math.random() > 0.9 ? 'Session creation failed' : undefined
          }
        }));
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setIsLoading(false);
    }
  };

  const loadUserPreference = () => {
    const preference = localStorage.getItem('chatSystemPreference') as 'old' | 'new' | 'auto';
    if (preference) {
      setMetrics(prev => ({ ...prev, userPreference: preference }));
    }
  };

  const saveUserPreference = (preference: 'old' | 'new' | 'auto') => {
    localStorage.setItem('chatSystemPreference', preference);
    setMetrics(prev => ({ ...prev, userPreference: preference }));
    onSystemChange(preference);
  };

  const getSystemStatus = (system: 'old' | 'new') => {
    const systemMetrics = metrics[`${system}System`];
    if (systemMetrics.errorRate > 10) return 'error';
    if (systemMetrics.errorRate > 5) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="h-4 w-4" />;
      case 'warning': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'error': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const resetMetrics = () => {
    localStorage.removeItem('chatSystemMetrics');
    localStorage.removeItem('chatSystemPreference');
    setMetrics({
      oldSystem: { totalSessions: 0, averageLoadTime: 0, errorRate: 0 },
      newSystem: { totalSessions: 0, averageLoadTime: 0, errorRate: 0 },
      userPreference: 'auto',
      abTestGroup: 'control'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CogIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chat System Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Current System Status */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Currently Using:
            </span>
            <span className={`text-sm font-semibold px-2 py-1 rounded ${
              currentSystem === 'new' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {currentSystem === 'new' ? 'New System' : 'Legacy System'}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentSystem === 'new' 
              ? 'Session-based conversations with enhanced features'
              : 'Original chat history system with proven reliability'
            }
          </div>
        </div>

        {/* System Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Choose Your Chat System
          </h3>
          
          <div className="space-y-3">
            {/* Auto Selection */}
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="systemChoice"
                value="auto"
                checked={metrics.userPreference === 'auto'}
                onChange={() => saveUserPreference('auto')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  🤖 Auto-Select (Recommended)
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically choose the best system based on performance and reliability
                </div>
              </div>
              {metrics.userPreference === 'auto' && (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              )}
            </label>

            {/* New System */}
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="systemChoice"
                value="new"
                checked={metrics.userPreference === 'new'}
                onChange={() => saveUserPreference('new')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  ✨ New System (Beta)
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Session-based conversations with better organization and features
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${getStatusColor(getSystemStatus('new'))}`}>
                  {getStatusIcon(getSystemStatus('new'))}
                </span>
                {metrics.userPreference === 'new' && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
              </div>
            </label>

            {/* Legacy System */}
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="systemChoice"
                value="old"
                checked={metrics.userPreference === 'old'}
                onChange={() => saveUserPreference('old')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  🛡️ Legacy System
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Original system with proven stability and reliability
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${getStatusColor(getSystemStatus('old'))}`}>
                  {getStatusIcon(getSystemStatus('old'))}
                </span>
                {metrics.userPreference === 'old' && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Performance Metrics
            </h3>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAdvanced ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <div className="text-sm text-gray-500 mt-2">Loading metrics...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Legacy System Metrics */}
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Legacy System
                  </h4>
                  <div className={`flex items-center ${getStatusColor(getSystemStatus('old'))}`}>
                    {getStatusIcon(getSystemStatus('old'))}
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div>Sessions: {metrics.oldSystem.totalSessions}</div>
                  <div>Load Time: {metrics.oldSystem.averageLoadTime.toFixed(0)}ms</div>
                  <div>Error Rate: {metrics.oldSystem.errorRate.toFixed(1)}%</div>
                </div>
              </div>

              {/* New System Metrics */}
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    New System
                  </h4>
                  <div className={`flex items-center ${getStatusColor(getSystemStatus('new'))}`}>
                    {getStatusIcon(getSystemStatus('new'))}
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div>Sessions: {metrics.newSystem.totalSessions}</div>
                  <div>Load Time: {metrics.newSystem.averageLoadTime.toFixed(0)}ms</div>
                  <div>Error Rate: {metrics.newSystem.errorRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          {showAdvanced && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Advanced Metrics
              </h4>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>A/B Test Group: {metrics.abTestGroup}</div>
                <div>Config Version: {CHATBOT_CONFIG.ENABLE_NEW_CHAT_HISTORY ? 'v2.0' : 'v1.0'}</div>
                <div>Feature Flags: {Object.entries(CHATBOT_CONFIG)
                  .filter(([, value]) => typeof value === 'boolean' && value)
                  .map(([key]) => key)
                  .join(', ')
                }</div>
              </div>
              
              {(metrics.oldSystem.lastError || metrics.newSystem.lastError) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <h5 className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                    Recent Errors:
                  </h5>
                  {metrics.oldSystem.lastError && (
                    <div className="text-xs text-red-500">Legacy: {metrics.oldSystem.lastError}</div>
                  )}
                  {metrics.newSystem.lastError && (
                    <div className="text-xs text-red-500">New: {metrics.newSystem.lastError}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={resetMetrics}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Reset Metrics
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSystemSettings;
