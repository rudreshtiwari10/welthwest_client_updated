import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useSubscription } from '../contexts/SubscriptionContext';

/**
 * Custom hook to automatically track and create notifications for user activities
 * This hook listens to auth and subscription changes and creates appropriate notifications
 */
export const useNotificationTracking = () => {
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const { subscriptionDetails } = useSubscription();

  // Track logout (when user becomes unauthenticated)
  useEffect(() => {
    const wasAuthenticated = localStorage.getItem('wasAuthenticated') === 'true';

    if (wasAuthenticated && !isAuthenticated) {
      // User just logged out
      addNotification({
        type: 'logout',
        title: 'Logged out',
        message: 'You have been logged out successfully',
      });
      localStorage.removeItem('wasAuthenticated');
    } else if (isAuthenticated) {
      localStorage.setItem('wasAuthenticated', 'true');
    }
  }, [isAuthenticated, addNotification]);

  // Track subscription changes
  useEffect(() => {
    if (subscriptionDetails) {
      const lastTier = localStorage.getItem('lastSubscriptionTier');
      const currentTier = subscriptionDetails.tier;

      if (lastTier && lastTier !== currentTier) {
        // Subscription changed
        const isUpgrade = ['FREE', 'PRO', 'ENTERPRISE'].indexOf(currentTier) >
                         ['FREE', 'PRO', 'ENTERPRISE'].indexOf(lastTier);

        addNotification({
          type: isUpgrade ? 'subscription_upgrade' : 'subscription_downgrade',
          title: isUpgrade ? 'Plan Upgraded!' : 'Plan Changed',
          message: `Your subscription has been ${isUpgrade ? 'upgraded' : 'changed'} to ${currentTier}`,
          actionUrl: '/profile',
        });
      }

      localStorage.setItem('lastSubscriptionTier', currentTier);

      // Check for expiring subscriptions
      if (subscriptionDetails.expires_at) {
        const expiryDate = new Date(subscriptionDetails.expires_at);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
          const existingWarning = localStorage.getItem('expiryWarningShown');
          if (existingWarning !== currentTier) {
            addNotification({
              type: 'subscription_expiry',
              title: 'Subscription Expiring Soon',
              message: `Your ${currentTier} plan expires in ${daysUntilExpiry} days`,
              actionUrl: '/premium',
            });
            localStorage.setItem('expiryWarningShown', currentTier);
          }
        }
      }
    }
  }, [subscriptionDetails, addNotification]);

  // Track usage limits
  useEffect(() => {
    if (subscriptionDetails?.usage?.daily && subscriptionDetails?.limits) {
      const used = subscriptionDetails.usage.daily.llm_query_count;
      const limit = subscriptionDetails.limits.llm_daily_limit;
      const remaining = limit - used;

      // Warn when usage is at 90% or only 5 queries remaining
      if (limit && (remaining <= 5 || (used / limit) >= 0.9)) {
        const lastWarning = localStorage.getItem('usageLimitWarning');
        const currentWarning = `${remaining}-${limit}`;

        if (lastWarning !== currentWarning) {
          addNotification({
            type: 'usage_limit',
            title: 'Usage Limit Warning',
            message: `You have ${remaining} AI queries remaining out of ${limit}`,
            actionUrl: subscriptionDetails.tier === 'FREE' ? '/premium' : undefined,
          });
          localStorage.setItem('usageLimitWarning', currentWarning);
        }
      }
    }
  }, [subscriptionDetails, addNotification]);
};
