/**
 * Subdomain Authentication Utilities
 * Handles navigation to strategy and services subdomains with JWT token passing
 */

// Subdomain URLs (configured via environment variables)
// For local testing: Strategy=3001, Services=3002, Main=3000
const SUBDOMAIN_URLS = {
  strategy: process.env.REACT_APP_STRATEGY_URL || 'http://localhost:3001',
  services: process.env.REACT_APP_SERVICES_URL || 'http://localhost:3002',
  main: process.env.REACT_APP_MAIN_URL || 'http://localhost:3000'
};

export type SubdomainType = 'strategy' | 'services';

export interface NavigationOptions {
  newTab?: boolean;
  path?: string;
}

/**
 * Navigate to a subdomain with authentication token
 * @param subdomain - The subdomain to navigate to
 * @param token - JWT access token
 * @param options - Navigation options (new tab, custom path)
 */
export const navigateToSubdomain = (
  subdomain: SubdomainType,
  token: string,
  options: NavigationOptions = {}
): void => {
  const { newTab = false, path = '' } = options;

  // Construct URL with token as query parameter
  const baseUrl = SUBDOMAIN_URLS[subdomain];
  const fullPath = path ? `/${path}` : '';
  const url = `${baseUrl}${fullPath}?token=${encodeURIComponent(token)}`;

  if (newTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
};

/**
 * Check if user has premium subscription required for subdomains
 * @param subscriptionTier - User's current subscription tier
 * @returns True if user has premium access
 */
export const hasPremiumAccess = (
  subscriptionTier: string | undefined
): boolean => {
  if (!subscriptionTier) return false;
  const premiumTiers = ['STARTER', 'PRO', 'ADVANCED', 'ENTERPRISE'];
  return premiumTiers.includes(subscriptionTier.toUpperCase());
};

/**
 * Check if user can access a specific subdomain feature
 * @param subdomain - The subdomain to check
 * @param subscriptionTier - User's subscription tier
 * @returns Object with access status and required tier
 */
export const checkSubdomainAccess = (
  subdomain: SubdomainType,
  subscriptionTier: string | undefined
): {
  hasAccess: boolean;
  requiredTier: string;
  message: string;
} => {
  const tier = subscriptionTier?.toUpperCase() || 'FREE';

  // Strategy requires at least STARTER for basic, PRO for full access
  if (subdomain === 'strategy') {
    if (tier === 'FREE') {
      return {
        hasAccess: false,
        requiredTier: 'STARTER',
        message: 'Risk Management Strategy Tool requires a premium subscription (STARTER or higher)'
      };
    }
    return {
      hasAccess: true,
      requiredTier: 'STARTER',
      message: 'Access granted'
    };
  }

  // Services requires at least STARTER
  if (subdomain === 'services') {
    if (tier === 'FREE') {
      return {
        hasAccess: false,
        requiredTier: 'STARTER',
        message: 'Market Analysis Service requires a premium subscription (STARTER or higher)'
      };
    }
    return {
      hasAccess: true,
      requiredTier: 'STARTER',
      message: 'Access granted'
    };
  }

  return {
    hasAccess: false,
    requiredTier: 'UNKNOWN',
    message: 'Unknown subdomain'
  };
};

/**
 * Get upgrade URL for pricing page
 * @param feature - The feature name for tracking
 * @returns URL to pricing page
 */
export const getUpgradeUrl = (feature?: string): string => {
  const baseUrl = '/pricing';
  return feature ? `${baseUrl}?feature=${encodeURIComponent(feature)}` : baseUrl;
};

/**
 * Get feature name for subdomain
 * @param subdomain - The subdomain type
 * @returns Human-readable feature name
 */
export const getSubdomainFeatureName = (subdomain: SubdomainType): string => {
  const featureNames = {
    strategy: 'Risk Management Strategy Tool',
    services: 'Market Analysis Service'
  };
  return featureNames[subdomain] || subdomain;
};

export { SUBDOMAIN_URLS };
