/**
 * CSS loading utilities for performance optimization
 */

// Load CSS asynchronously to prevent render blocking
export const loadCSS = (href: string, media: string = 'all'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    
    link.onload = () => {
      link.rel = 'stylesheet';
      link.media = media;
      resolve();
    };
    
    link.onerror = () => {
      reject(new Error(`Failed to load CSS: ${href}`));
    };
    
    document.head.appendChild(link);
  });
};

// Load multiple CSS files with optional priorities
export const loadMultipleCSS = async (cssFiles: Array<{
  href: string;
  media?: string;
  priority?: number;
}>) => {
  // Sort by priority (higher number = higher priority)
  const sortedFiles = cssFiles.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  const promises = sortedFiles.map(({ href, media }) => loadCSS(href, media));
  
  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('Some CSS files failed to load:', error);
  }
};

// Preload critical fonts
export const preloadFonts = (fonts: Array<{
  href: string;
  type?: string;
  crossorigin?: string;
}>) => {
  fonts.forEach(({ href, type = 'font/woff2', crossorigin = 'anonymous' }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.href = href;
    link.crossOrigin = crossorigin;
    document.head.appendChild(link);
  });
};

// Critical resource hints for performance
export const addResourceHints = (resources: Array<{
  href: string;
  as: string;
  type?: string;
  rel?: 'preload' | 'prefetch' | 'dns-prefetch' | 'preconnect';
  crossorigin?: string;
  fetchpriority?: 'high' | 'low' | 'auto';
}>) => {
  resources.forEach(({ 
    href, 
    as, 
    type, 
    rel = 'preload', 
    crossorigin, 
    fetchpriority 
  }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (as) link.setAttribute('as', as);
    if (type) link.type = type;
    if (crossorigin) link.crossOrigin = crossorigin;
    if (fetchpriority) link.setAttribute('fetchpriority', fetchpriority);
    document.head.appendChild(link);
  });
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  // Preconnect to external domains
  addResourceHints([
    {
      href: 'https://fonts.googleapis.com',
      as: '',
      rel: 'preconnect'
    },
    {
      href: 'https://fonts.gstatic.com',
      as: '',
      rel: 'preconnect',
      crossorigin: 'anonymous'
    },
    {
      href: 'https://cdnjs.cloudflare.com',
      as: '',
      rel: 'preconnect'
    }
  ]);
  
  // Preload critical fonts
  preloadFonts([
    {
      href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2',
      type: 'font/woff2'
    }
  ]);
  
  // Load non-critical CSS asynchronously
  const nonCriticalCSS = [
    {
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
      media: 'all',
      priority: 1
    }
  ];
  
  // Load after initial render with fallback for browsers without requestIdleCallback
  const loadNonCriticalCSS = () => {
    loadMultipleCSS(nonCriticalCSS);
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(loadNonCriticalCSS);
  } else {
    // Fallback for browsers that don't support requestIdleCallback (like Safari)
    setTimeout(loadNonCriticalCSS, 100);
  }
};

// Optimize third-party scripts loading
export const loadThirdPartyScript = (src: string, options: {
  async?: boolean;
  defer?: boolean;
  fetchpriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
} = {}) => {
  const script = document.createElement('script');
  script.src = src;
  
  if (options.async) script.async = true;
  if (options.defer) script.defer = true;
  if (options.fetchpriority) script.setAttribute('fetchpriority', options.fetchpriority);
  
  if (options.onLoad) script.onload = options.onLoad;
  if (options.onError) script.onerror = options.onError;
  
  document.head.appendChild(script);
};