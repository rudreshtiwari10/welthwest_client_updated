/**
 * Subdomain Link Component
 * Provides secure links to strategy and services subdomains with auth handling
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  SubdomainType,
  navigateToSubdomain,
  checkSubdomainAccess,
  getSubdomainFeatureName,
  getUpgradeUrl
} from '../utils/subdomainAuth';

interface SubdomainLinkProps {
  subdomain: SubdomainType;
  children: React.ReactNode;
  className?: string;
  path?: string;
  newTab?: boolean;
  showUpgradeModal?: (feature: string, message: string) => void;
}

export const SubdomainLink: React.FC<SubdomainLinkProps> = ({
  subdomain,
  children,
  className = '',
  path,
  newTab = false,
  showUpgradeModal
}) => {
  const { isAuthenticated, getToken } = useAuth();
  const { subscriptionTier } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = `${subdomain}${path ? `/${path}` : ''}`;
      window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`;
      return;
    }

    // Check subscription access
    const accessCheck = checkSubdomainAccess(subdomain, subscriptionTier);

    if (!accessCheck.hasAccess) {
      // Show upgrade modal if callback provided
      if (showUpgradeModal) {
        const featureName = getSubdomainFeatureName(subdomain);
        showUpgradeModal(featureName, accessCheck.message);
      } else {
        // Fallback: redirect to pricing
        window.location.href = getUpgradeUrl(subdomain);
      }
      return;
    }

    // Get token and navigate
    try {
      setIsLoading(true);
      const token = await getToken();

      if (!token) {
        // Token expired or missing, redirect to login
        window.location.href = `/login?redirect=${subdomain}`;
        return;
      }

      // Navigate to subdomain with token
      navigateToSubdomain(subdomain, token, { newTab, path });
    } catch (error) {
      console.error('Error navigating to subdomain:', error);
      alert('Failed to access feature. Please try logging in again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className={`${className} ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      aria-disabled={isLoading}
    >
      {isLoading ? 'Loading...' : children}
    </a>
  );
};

export default SubdomainLink;
