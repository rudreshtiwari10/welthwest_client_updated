// Simple analytics initializer supporting GTM (GTM-XXXX) or GA4 gtag (G-XXXX)
// Configure via env vars:
// - REACT_APP_GTM_ID for Google Tag Manager container
// - REACT_APP_GA4_ID for Google Analytics 4 measurement ID (G-XXXX)

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GTM_ID = process.env.REACT_APP_GTM_ID;
const GA4_ID = process.env.REACT_APP_GA4_ID || 'G-CE6JLT6ZMM'; // Fallback to hardcoded ID

// Analytics configuration

let initialized = false;

export function initializeAnalytics(): void {
  
  if (initialized) {
    return;
  }
  
  initialized = true;

  // Check if gtag is already loaded via HTML (preferred)
  if (typeof window.gtag === 'function' && GA4_ID) {
    // gtag is already loaded via HTML, just ensure our tracking works
    return;
  }

  // Primary: Use GTM if available (recommended approach)
  if (GTM_ID) {
    
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Inject GTM script
    (function(w: any, d: Document, s: string, l: string, i: string) {
      w[l] = w[l] || [];
      const f = d.getElementsByTagName(s)[0] as HTMLScriptElement | undefined;
      const j = d.createElement(s) as HTMLScriptElement;
      const dl = l !== 'dataLayer' ? `&l=${l}` : '';
      j.async = true;
      j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
      if (f && f.parentNode) {
        f.parentNode.insertBefore(j, f);
      } else {
        d.head.appendChild(j);
      }
    })(window, document, 'script', 'dataLayer', GTM_ID);

    // Inject GTM noscript fallback
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
    
  } else if (GA4_ID) {
    
    // Load GA4 gtag
    const script = document.createElement('script') as HTMLScriptElement;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    const gtagFn = (...args: any[]) => {
      window.dataLayer.push(args);
    };
    window.gtag = gtagFn as any;

    // Configure GA4
    script.onload = () => {
      if (typeof window.gtag === 'function') {
        window.gtag('js', new Date());
        window.gtag('config', GA4_ID);
      }
    };
    
  } else {
  }
}

export function trackPageView(path: string, title?: string): void {
  const pageTitle = title || document.title;

  if (GTM_ID) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'pageview',
      page_path: path,
      page_title: pageTitle
    });
  } else if (GA4_ID && typeof window.gtag === 'function') {
    window.gtag('config', GA4_ID, {
      page_path: path,
      page_title: pageTitle
    });
  } else if (window.dataLayer && window.dataLayer.length > 0) {
    // Use HTML fallback analytics if available
    window.dataLayer.push({
      event: 'pageview',
      page_path: path,
      page_title: pageTitle
    });
  } else {
  }
}

export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  
  if (GTM_ID) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params
    });
  } else if (GA4_ID && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  } else if (window.dataLayer && window.dataLayer.length > 0) {
    // Use HTML fallback analytics if available
    window.dataLayer.push({
      event: eventName,
      ...params
    });
  } else {
  }
}


