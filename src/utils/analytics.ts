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
const GA4_ID = process.env.REACT_APP_GA4_ID;

let initialized = false;

export function initializeAnalytics(): void {
  if (initialized) return;
  initialized = true;

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

    const inline = document.createElement('script') as HTMLScriptElement;
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} 
      gtag('js', new Date());
      gtag('config', '${GA4_ID}');
    `;
    document.head.appendChild(inline);
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
  }
}


