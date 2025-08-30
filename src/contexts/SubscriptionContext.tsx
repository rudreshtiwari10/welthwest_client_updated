import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { API_URL } from '../services/api';

// Types
export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

interface Usage {
  backtest_count: number;
  llm_query_count: number;
  last_reset: string;
}

interface SubscriptionDetails {
  tier: SubscriptionTier;
  starts_at: string;
  expires_at: string | null;
  usage: {
    daily: Usage;
    monthly: Usage;
  };
  limits: {
    backtest_daily_limit: number;
    llm_daily_limit: number;
    market_data_delay: 'delayed' | '15min' | 'realtime';
  };
}

interface SubscriptionContextType {
  subscriptionDetails: SubscriptionDetails | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  canUseBacktest: () => boolean;
  canUseLLM: () => boolean;
  incrementBacktestUsage: () => Promise<void>;
  incrementLLMUsage: () => Promise<void>;
  getUsagePercentage: (feature: 'backtest' | 'llm') => number;
  getTimeUntilReset: () => string;
  upgradeSubscription: (newTier: SubscriptionTier) => Promise<void>;
  updateSubscriptionAfterPayment: (paymentData: any, planDetails: any, userInfo: any) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const auth = useAuth();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionDetails = async () => {
    try {
      const token = await auth.getToken();
      if (!token) {
        setError('No authentication token available');
        return;
      }

      const response = await axios.get(`${API_URL}/user/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Validate the response data structure
      const data = response.data;
      if (!data || !data.usage || !data.usage.daily) {
        setError('Invalid subscription data received');
        return;
      }
      
      setSubscriptionDetails(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscription details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchSubscriptionDetails();
    } else {
      setSubscriptionDetails(null);
      setIsLoading(false);
      setError(null);
    }
  }, [auth.isAuthenticated]);

  const refreshSubscription = async () => {
    setIsLoading(true);
    await fetchSubscriptionDetails();
  };

  const canUseBacktest = () => {
    if (!subscriptionDetails || !subscriptionDetails.usage || !subscriptionDetails.usage.daily || !subscriptionDetails.limits) return false;
    const { daily } = subscriptionDetails.usage;
    const { backtest_daily_limit } = subscriptionDetails.limits;
    // Handle unlimited (very large numbers) case
    if (backtest_daily_limit >= 999999) return true;
    return daily.backtest_count < backtest_daily_limit;
  };

  const canUseLLM = () => {
    if (!subscriptionDetails || !subscriptionDetails.usage || !subscriptionDetails.usage.daily || !subscriptionDetails.limits) return false;
    const { daily } = subscriptionDetails.usage;
    const { llm_daily_limit } = subscriptionDetails.limits;
    // Handle unlimited (very large numbers) case
    if (llm_daily_limit >= 999999) return true;
    return daily.llm_query_count < llm_daily_limit;
  };

  const incrementBacktestUsage = async () => {
    if (!subscriptionDetails || !subscriptionDetails.usage || !subscriptionDetails.usage.daily) return;
    try {
      const token = await auth.getToken();
      if (!token) throw new Error('No authentication token available');

      await axios.post(`${API_URL}/user/usage/increment`, { feature: 'backtest' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately to prevent unnecessary API calls
      setSubscriptionDetails(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          usage: {
            ...prev.usage,
            daily: {
              ...prev.usage.daily,
              backtest_count: prev.usage.daily.backtest_count + 1
            }
          }
        };
      });
    } catch (err) {
      throw err;
    }
  };

  const incrementLLMUsage = async () => {
    if (!subscriptionDetails || !subscriptionDetails.usage || !subscriptionDetails.usage.daily) return;
    try {
      const token = await auth.getToken();
      if (!token) throw new Error('No authentication token available');

      await axios.post(`${API_URL}/user/usage/increment`, { feature: 'llm_query' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately to prevent unnecessary API calls
      setSubscriptionDetails(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          usage: {
            ...prev.usage,
            daily: {
              ...prev.usage.daily,
              llm_query_count: prev.usage.daily.llm_query_count + 1
            }
          }
        };
      });
    } catch (err) {
      throw err;
    }
  };

  const getUsagePercentage = (feature: 'backtest' | 'llm') => {
    if (!subscriptionDetails || !subscriptionDetails.usage || !subscriptionDetails.usage.daily) return 0;
    const { daily } = subscriptionDetails.usage;
    const limits = subscriptionDetails.limits;
    
    if (!limits) return 0;
    
    if (feature === 'backtest') {
      // Handle unlimited case
      if (limits.backtest_daily_limit >= 999999) return 0;
      return (daily.backtest_count / limits.backtest_daily_limit) * 100;
    } else {
      // Handle unlimited case
      if (limits.llm_daily_limit >= 999999) return 0;
      return (daily.llm_query_count / limits.llm_daily_limit) * 100;
    }
  };

  const getTimeUntilReset = () => {
    if (!subscriptionDetails || !subscriptionDetails.usage || !subscriptionDetails.usage.daily) return 'N/A';
    
    try {
      const lastReset = new Date(subscriptionDetails.usage.daily.last_reset);
      const nextReset = new Date(lastReset);
      nextReset.setDate(nextReset.getDate() + 1);
      nextReset.setHours(0, 0, 0, 0);

      const now = new Date();
      const timeUntil = nextReset.getTime() - now.getTime();
      
      if (timeUntil <= 0) return 'Resetting...';
      
      const hours = Math.floor(timeUntil / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  const upgradeSubscription = async (newTier: SubscriptionTier) => {
    try {
      const token = await auth.getToken();
      if (!token) throw new Error('No authentication token available');

      await axios.post(`${API_URL}/user/subscription/upgrade`, { tier: newTier }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshSubscription();
    } catch (err) {
      throw err;
    }
  };

  const updateSubscriptionAfterPayment = async (paymentData: any, planDetails: any, userInfo: any) => {
    try {
      // Since the backend automatically activates subscription after successful payment verification,
      // we just need to refresh the subscription details
      await refreshSubscription();
      
    } catch (err) {
      throw err;
    }
  };

  const value = {
    subscriptionDetails,
    isLoading,
    error,
    refreshSubscription,
    canUseBacktest,
    canUseLLM,
    incrementBacktestUsage,
    incrementLLMUsage,
    getUsagePercentage,
    getTimeUntilReset,
    upgradeSubscription,
    updateSubscriptionAfterPayment
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 