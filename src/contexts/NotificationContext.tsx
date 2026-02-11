import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/api';

// Notification type definitions
export type NotificationType =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'payment_success'
  | 'payment_failed'
  | 'subscription_upgrade'
  | 'subscription_downgrade'
  | 'subscription_expiry'
  | 'usage_limit'
  | 'system'
  | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  clearAll: () => {},
  fetchNotifications: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated, user } = useAuth();

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Save to localStorage for persistence
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    savedNotifications.unshift(newNotification);
    localStorage.setItem('notifications', JSON.stringify(savedNotifications.slice(0, 50))); // Keep last 50
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    // Optimistically update UI
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Update localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = savedNotifications.map((n: Notification) =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await notificationService.markAsRead(id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  }, [isAuthenticated]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Optimistically update UI
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Update localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = savedNotifications.map((n: Notification) => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await notificationService.markAllAsRead();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  }, [isAuthenticated]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    // Optimistically update UI
    setNotifications(prev => prev.filter(notification => notification.id !== id));

    // Update localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = savedNotifications.filter((n: Notification) => n.id !== id);
    localStorage.setItem('notifications', JSON.stringify(updated));

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await notificationService.deleteNotification(id);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  }, [isAuthenticated]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    // Optimistically update UI
    setNotifications([]);
    localStorage.removeItem('notifications');

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        // Note: Using deleteNotification for each since there's no clear-all endpoint
        // Or we can add one to the backend if needed
        await Promise.all(
          notifications.map(n => notificationService.deleteNotification(n.id))
        );
      } catch (error) {
        console.error('Error clearing all notifications:', error);
      }
    }
  }, [isAuthenticated, notifications]);

  // Fetch notifications from localStorage or API
  const fetchNotifications = useCallback(async () => {
    try {
      // If authenticated, fetch from API
      if (isAuthenticated) {
        try {
          const response = await notificationService.getNotifications();
          // Backend returns { notifications: [...], total: ..., etc }
          // axios wraps this in response.data
          if (response && response.notifications) {
            const fetchedNotifications = response.notifications.map((n: any) => ({
              ...n,
              id: n._id || n.id,
              timestamp: new Date(n.timestamp)
            }));
            setNotifications(fetchedNotifications);

            // Sync to localStorage as cache
            localStorage.setItem('notifications', JSON.stringify(fetchedNotifications.slice(0, 50)));
          }
        } catch (error: any) {
          console.error('Error fetching notifications from API:', error);

          // Fallback to localStorage on API error
          const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
          if (savedNotifications.length > 0) {
            setNotifications(savedNotifications.map((n: any) => ({
              ...n,
              timestamp: new Date(n.timestamp)
            })));
          }
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        if (savedNotifications.length > 0) {
          setNotifications(savedNotifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isAuthenticated]);

  // Load notifications on mount and when authentication changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Track login activity
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if we should add a login notification
      const lastLoginNotification = localStorage.getItem('lastLoginNotification');
      const now = Date.now();

      // Add login notification if more than 5 minutes since last one
      if (!lastLoginNotification || now - parseInt(lastLoginNotification) > 5 * 60 * 1000) {
        addNotification({
          type: 'login',
          title: 'Welcome back!',
          message: `You logged in successfully at ${new Date().toLocaleTimeString()}`,
        });
        localStorage.setItem('lastLoginNotification', now.toString());
      }
    }
  }, [isAuthenticated, user, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
