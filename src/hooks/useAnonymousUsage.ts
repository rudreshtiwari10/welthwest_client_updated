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
 * @param sessionId - Optional session ID for session-based features (like welth-ai-assistant)
 * @returns Usage information or null if not available
 */
export default function useAnonymousUsage(
  feature: string,
  refetchTrigger?: any,
  sessionId?: string
): UsageInfo | null {
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

        // Build params
        const params: any = { feature };

        // For welth-ai-assistant, include session_id if available
        if (feature === 'welth-ai-assistant' && sessionId) {
          params.session_id = sessionId;
        }

        // Create axios instance with proper base URL
        const response = await axios.get(`${API_URL}/usage/anonymous-status`, {
          params,
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
  }, [feature, refetchTrigger, sessionId]);

  return usage;
}