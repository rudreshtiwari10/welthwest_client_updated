import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/api';

interface UsageInfo {
  used: number;
  remaining: number;
  limit: number;
  feature: string;
}

/**
 * Hook to fetch and display anonymous usage status for a specific feature
 * @param feature - Feature name (e.g., 'welth-ai-assistant', 'backtest-beta', 'ai-market-analysis')
 * @param refetchTrigger - Optional dependency to trigger refetch
 * @returns Usage information or null if not available
 */
export default function useAnonymousUsage(feature: string, refetchTrigger?: any): UsageInfo | null {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const fetchUsage = async () => {
      if (!feature) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Create axios instance with proper base URL
        const response = await axios.get(`${API_URL}/usage/anonymous-status`, {
          params: { feature: feature },
          withCredentials: true // Important: Include cookies for session tracking
        });

        if (mounted && response.data.ok) {
          setUsage({
            used: response.data.used,
            remaining: response.data.remaining,
            limit: response.data.limit,
            feature: response.data.feature || feature
          });
        }
      } catch (error) {
        console.error('Failed to fetch anonymous usage:', error);
        // On error, don't show usage info
        if (mounted) {
          setUsage(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUsage();

    return () => {
      mounted = false;
    };
  }, [feature, refetchTrigger]);

  return usage;
}