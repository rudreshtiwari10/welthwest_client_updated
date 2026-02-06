import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useNotifications, Notification, NotificationType } from '../contexts/NotificationContext';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "h-5 w-5 flex-shrink-0";

    switch (type) {
      case 'login':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'logout':
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
      case 'password_change':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'payment_success':
      case 'subscription_upgrade':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'payment_failed':
      case 'subscription_downgrade':
      case 'subscription_expiry':
        return <ExclamationCircleIcon className={`${iconClass} text-red-500`} />;
      case 'usage_limit':
        return <ExclamationCircleIcon className={`${iconClass} text-yellow-500`} />;
      case 'system':
      case 'info':
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  // Notification item component
  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                !notification.read
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {formatTimestamp(notification.timestamp)}
                </span>
                {!notification.read && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                  title="Mark as read"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => deleteNotification(notification.id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                title="Delete"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Link */}
          {notification.actionUrl && (
            <Link
              to={notification.actionUrl}
              onClick={onClose}
              className="inline-block mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View details →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1a1f2e] rounded-lg shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                title="Clear all"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No notifications yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
