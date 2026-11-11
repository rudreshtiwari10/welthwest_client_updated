#!/usr/bin/env node

/**
 * This is a Create React App (client-side only, no SSR) -- the single
 * build/index.html it produces is served for every route, so Googlebot's
 * first pass sees the exact same <title>/<meta description>/canonical for
 * every page until JS executes and usePageMeta() overwrites them client-
 * side. Confirmed directly: /welth-lab and /ai-screener returned byte-
 * identical <title> and meta description in the raw server HTML.
 *
 * This script runs after `react-scripts build` and writes a static
 * build/<route>/index.html per public route below, each with its real
 * title/description/canonical baked in -- Vercel serves an exact static
 * file match before falling back to the SPA rewrite, so this doesn't
 * change routing or behavior for any route not listed here.
 *
 * Values below are copied directly from each page's own usePageMeta()
 * call (see src/pages/**) -- if a page's title/description changes,
 * update the matching entry here too, or this will drift out of sync.
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.welthwest.com';
const BUILD_DIR = path.join(__dirname, '..', 'build');

const PAGES = [
  {
    routes: ['/'],
    title: 'WelthWest – Free AI Stock Screener, Backtesting & AI Chat for NSE/BSE | India',
    description:
      'WelthWest is a free AI platform for Indian stock markets. Welth Market Regime screens NSE/BSE stocks by bull/bear/sideways regime and anomaly score, Welth Lab backtests trading strategies on NIFTY, Bank NIFTY and 500+ stocks with no code, and Welth AI Assistant answers any market or finance question in real time. Built for traders, investors and fund managers.',
  },
  {
    routes: ['/stock'],
    title: 'Stock Analysis – AI Market Intelligence | WelthWest',
    description:
      'Analyse Indian equity stocks with AI-powered regime detection and anomaly signals. Real-time NIFTY and NSE data on WelthWest.',
  },
  {
    routes: ['/welth-lab'],
    title: 'Welth Lab – Free No-Code Backtesting Engine for NIFTY, Bank NIFTY & NSE Stocks | WelthWest',
    description:
      'Welth Lab lets you backtest trading strategies on NIFTY 50, Bank NIFTY and 500+ NSE stocks across 10+ years of historical data — no coding required. Get Sharpe ratio, max drawdown, win rate, Monte Carlo simulation, walk-forward validation and full trade logs, completely free.',
  },
  {
    routes: ['/welth-ai-assistant'],
    title: 'Welth AI Assistant – Free AI Chatbot for Stock Market & Personal Finance | WelthWest',
    description:
      'Ask Welth AI Assistant anything about Indian stocks or personal finance. Get real-time stock analysis, interactive charts with RSI, MACD, Bollinger Bands and more, plus plain-English answers on SIPs, taxes, insurance and retirement planning — free AI chat for traders and investors.',
  },
  {
    routes: ['/ai-screener'],
    title: 'Welth Market Regime – Free AI Stock Screener for NSE & BSE | WelthWest',
    description:
      'Welth Market Regime screens NIFTY 50 and NSE/BSE stocks using AI to classify each into bull, bear or sideways regimes with volatility levels, detects price, volume and derivatives anomalies, and scores stocks with 40+ computed features. Free AI stock screener — no code required.',
  },
  {
    routes: ['/about'],
    title: 'About WelthWest – Team Building AI for Safer Markets',
    description:
      'Learn about WelthWest, the team behind the platform, our mission to democratise AI-powered market intelligence for Indian equity traders and fund managers.',
  },
  {
    routes: ['/premium', '/pricing'],
    title: 'WelthWest Plans – Free AI Market Intelligence for All Traders',
    description:
      'Explore WelthWest plans. Get access to AI market regime detection, anomaly alerts, backtesting, and the WelthAI assistant — free for all users.',
  },
  {
    routes: ['/case-studies'],
    title: 'Case Studies – WelthWest AI Market Intelligence Results',
    description:
      'See how proprietary desks, PMS funds, and individual traders use WelthWest AI regime detection and anomaly alerts to manage risk and improve returns.',
  },
  {
    routes: ['/technical-overview', '/how-it-works'],
    title: 'Technical Overview – How WelthWest AI Works | WelthWest',
    description:
      'Deep dive into how WelthWest uses LSTM, TCN, and anomaly detection models on Indian equity OHLCV and derivatives data to identify market regimes and anomalies.',
  },
  {
    routes: ['/security', '/trust'],
    title: 'Security & Trust – WelthWest',
    description:
      'Learn how WelthWest protects your data with HTTPS, encryption, access controls, and regular security reviews. Hosting, compliance, and data-handling details.',
  },
  {
    routes: ['/contact', '/contactus'],
    title: 'Contact WelthWest – Get in Touch',
    description:
      'Contact the WelthWest team for support, partnerships, or general enquiries. Email us at contact@welthwest.com or use the form below.',
  },
  {
    routes: ['/feedback'],
    title: 'Share Feedback – WelthWest',
    description:
      'Help us improve WelthWest. Share your experience with our AI market intelligence tools and tell us what matters most to you.',
  },
  {
    routes: ['/product/market-regime'],
    title: 'WelthAI Market Regime – Detect Regime Shifts & Anomalies | WelthWest',
    description:
      'WelthAI Market Regime classifies the current Indian equity market as Bullish, Bearish, or Transitional using AI. Reduce risk by aligning positions to the prevailing regime.',
  },
  {
    routes: ['/product/anomaly-detector'],
    title: 'WelthAI Anomaly Detector – Spot Unusual Market Behaviour | WelthWest',
    description:
      'WelthAI Anomaly Detector flags statistically unusual price, volume, and volatility behaviour in Indian equities before it impacts your positions.',
  },
  {
    routes: ['/product/backtesting-engine'],
    title: 'Backtesting Engine – Test Trading Strategies on Indian Markets | WelthWest',
    description:
      'No-code backtesting on 10+ years of NSE/BSE data. Evaluate CAGR, max drawdown, Sharpe ratio, and trade-level P&L for any rule-based strategy.',
  },
  {
    routes: ['/products'],
    title: 'WelthChart & Welth Algo Bot MT5 – Chart Trading and Automation | WelthWest',
    description:
      'WelthChart is a charting and execution terminal with on-chart SL/TP, option chain, split layouts and replay backtesting. Welth Algo Bot MT5 automates multiple strategies across forex, crypto and global markets.',
  },
  {
    routes: ['/privacy-policy'],
    title: 'Privacy Policy – WelthWest',
    description:
      'Read the WelthWest Privacy Policy to understand how we collect, use, and protect your data on our AI-powered market intelligence platform.',
  },
  {
    routes: ['/terms-and-conditions'],
    title: 'Terms & Conditions – WelthWest',
    description:
      'Read the WelthWest Terms and Conditions governing use of our AI-powered market analytics platform, including disclaimers for financial data.',
  },
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtmlFor(baseHtml, { title, description, url }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);

  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\/>/,
    `<meta name="description" content="${safeDesc}"/>`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\/>/,
    `<meta property="og:title" content="${safeTitle}"/>`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\/>/,
    `<meta property="og:description" content="${safeDesc}"/>`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\/>/,
    `<meta property="og:url" content="${url}"/>`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\/>/,
    `<meta name="twitter:title" content="${safeTitle}"/>`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\/>/,
    `<meta name="twitter:description" content="${safeDesc}"/>`
  );

  // No canonical tag exists in the base HTML at all right now -- insert
  // one right before </head> rather than assume a replaceable match exists.
  if (/<link rel="canonical"/.test(html)) {
    html = html.replace(/<link rel="canonical" href="[^"]*"\/>/, `<link rel="canonical" href="${url}"/>`);
  } else {
    html = html.replace('</head>', `<link rel="canonical" href="${url}"/></head>`);
  }

  return html;
}

function main() {
  const indexPath = path.join(BUILD_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error(`[prerenderMeta] ${indexPath} not found -- run react-scripts build first`);
    process.exit(1);
  }
  const baseHtml = fs.readFileSync(indexPath, 'utf8');

  let written = 0;
  for (const page of PAGES) {
    for (const route of page.routes) {
      const url = `${SITE_URL}${route}`;
      const html = buildHtmlFor(baseHtml, { title: page.title, description: page.description, url });
      const dir = path.join(BUILD_DIR, route.replace(/^\//, ''));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html);
      written++;
    }
  }
  console.log(`[prerenderMeta] wrote ${written} static per-route index.html files`);
}

main();
