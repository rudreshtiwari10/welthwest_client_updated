/**
 * usePageMeta – dynamically sets per-page <title>, <meta description>,
 * OpenGraph, and Twitter Card tags in the document <head>.
 *
 * NOTE (SSR): This is a Create-React-App project and renders client-side only.
 * These tags will be visible to JavaScript-rendering crawlers (e.g. Googlebot)
 * but NOT to non-JS crawlers or social-card scrapers that don't execute JS.
 *
 * TODO (SSR migration): To make all tags visible to every crawler, migrate the
 * public-facing pages to Next.js App Router (using generateMetadata()) or add
 * a static pre-rendering pass via react-snap / @prerenderer/webpack-plugin.
 * That migration is outside the scope of this file and must be done separately.
 */

import { useEffect } from 'react';

// TODO: Replace with your actual production domain once deployed.
const SITE_URL = 'https://www.welthwest.com';

// TODO: Create and upload a proper 1200×630 Open Graph image and update this path.
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`;

export interface PageMetaOptions {
  /** Full page title shown in the browser tab and in search results. */
  title: string;
  /** 1–2 sentence description shown in search result snippets. */
  description: string;
  /** Absolute URL to a 1200×630 image for social cards. Falls back to DEFAULT_OG_IMAGE. */
  ogImage?: string;
  /** Canonical page URL. Falls back to SITE_URL + current pathname. */
  ogUrl?: string;
  /** JSON-LD structured-data object(s) to inject as a <script type="application/ld+json">. */
  jsonLd?: object | object[];
}

/**
 * Sets or updates document head meta tags for the current page.
 * Call this at the top level of every public-facing page component.
 *
 * @example
 *   usePageMeta({
 *     title: 'WelthWest – AI-Powered Market Intelligence',
 *     description: 'Detect market regimes and anomalies with AI.',
 *   });
 */
export const usePageMeta = ({
  title,
  description,
  ogImage,
  ogUrl,
  jsonLd,
}: PageMetaOptions): void => {
  useEffect(() => {
    // ── Document title ────────────────────────────────────────────────────────
    document.title = title;

    // ── Helper: set or create a <meta> tag ───────────────────────────────────
    const setMeta = (
      key: string,
      content: string,
      keyAttr: 'name' | 'property' = 'name'
    ) => {
      let el = document.querySelector(
        `meta[${keyAttr}="${key}"]`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(keyAttr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const resolvedUrl = ogUrl ?? `${SITE_URL}${window.location.pathname}`;
    const resolvedImage = ogImage ?? DEFAULT_OG_IMAGE;

    // ── Canonical tag ─────────────────────────────────────────────────────────
    let canonicalEl = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', resolvedUrl);

    // ── Standard meta ─────────────────────────────────────────────────────────
    setMeta('description', description);

    // ── OpenGraph ─────────────────────────────────────────────────────────────
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', resolvedImage, 'property');
    setMeta('og:url', resolvedUrl, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', 'WelthWest', 'property');

    // ── Twitter / X cards ─────────────────────────────────────────────────────
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', resolvedImage);
    setMeta('twitter:site', '@WelthWest');

    // ── JSON-LD ───────────────────────────────────────────────────────────────
    // Remove any previously injected page-level JSON-LD script
    const prev = document.getElementById('page-json-ld');
    if (prev) prev.remove();

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'page-json-ld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
      document.head.appendChild(script);
    }

    // ── Cleanup: restore a sensible default title on unmount ──────────────────
    return () => {
      document.title = 'WelthWest – AI-Powered Wealth Intelligence Platform';
    };
  }, [title, description, ogImage, ogUrl, jsonLd]);
};
