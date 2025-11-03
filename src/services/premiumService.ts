/**
 * Premium Service - Plan and Subscription Management
 * Handles fetching plans, subscription details, and usage information
 */

import axios from 'axios';
import { API_URL } from './api';

// Create axios instance for premium service
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PlanLimits {
  'welth-market-regime': number;
  'welth-ai-assistant': number;
  'backtest-beta': number;
}

export interface PlanPrices {
  weekly: number;
  monthly: number;
  annual: number;
}

export interface Plan {
  _id: string; // FREE, STARTER, PRO, ADVANCED, ENTERPRISE
  display_name: string;
  prices: PlanPrices;
  limits: PlanLimits;
  features: string[];
  description: string;
}

export interface PlansResponse {
  success: boolean;
  plans: Plan[];
  feature_names: {
    'welth-market-regime': string;
    'welth-ai-assistant': string;
    'backtest-beta': string;
  };
  error?: string;
}

export interface UserSubscription {
  plan: string;
  plan_duration?: string;
  start_date?: string;
  expiry_date?: string;
  limits: PlanLimits;
  prices: PlanPrices;
  is_active: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription: UserSubscription;
  error?: string;
}

export interface FeatureUsage {
  [key: string]: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export interface UsageResponse {
  success: boolean;
  usage: FeatureUsage;
  subscription: {
    plan: string;
    is_active: boolean;
  };
  error?: string;
}

export interface RemainingUsageResponse {
  success: boolean;
  remaining: number;
  limit: number;
  used: number;
  is_anonymous: boolean;
  error?: string;
}

class PremiumService {
  /**
   * Get all available premium plans
   * @returns List of plans with pricing and limits
   */
  async getAllPlans(): Promise<PlansResponse> {
    try {
      const response = await api.get('/premium/plans');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch premium plans'
      );
    }
  }

  /**
   * Get current user's subscription details
   * Requires authentication
   * @returns User subscription with plan and limits
   */
  async getUserSubscription(): Promise<SubscriptionResponse> {
    try {
      const response = await api.get('/premium/user/subscription');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user subscription:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch subscription'
      );
    }
  }

  /**
   * Get current user's usage for all features
   * Requires authentication
   * @returns Usage details for all premium features
   */
  async getUserUsage(): Promise<UsageResponse> {
    try {
      const response = await api.get('/premium/user/usage');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user usage:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch usage'
      );
    }
  }

  /**
   * Get remaining usage for a specific feature
   * Works for both authenticated and anonymous users
   * @param featureKey - Feature identifier (welth-market-regime, welth-ai-assistant, backtest-beta)
   * @returns Remaining usage count
   */
  async getFeatureRemaining(featureKey: string): Promise<RemainingUsageResponse> {
    try {
      const response = await api.get(`/premium/feature/${featureKey}/remaining`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feature remaining:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch remaining usage'
      );
    }
  }

  /**
   * Check if payment gateway is enabled
   * @returns Boolean indicating if payments are enabled
   */
  isPaymentEnabled(): boolean {
    // This would ideally come from backend config
    // For now, we'll check if Cashfree env is configured
    return !!process.env.REACT_APP_CASHFREE_ENABLED;
  }
}

export const premiumService = new PremiumService();
export default premiumService;
