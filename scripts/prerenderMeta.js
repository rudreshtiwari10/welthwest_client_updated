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

// Shared across every page that gets bodyContent/faq below -- see the
// user's explicit instruction (2026-11-12): no real money, broker
// accounts, or trade execution exist anywhere on the platform, now or
// planned. Worded identically everywhere for consistency.
const NO_REAL_MONEY_FAQ = {
  q: 'Does this involve real trading or real money?',
  a: "No. WelthWest is a research and education platform only — there's no broker account, no trade execution, and no real money involved anywhere on the platform, now or planned for the future.",
};

function renderBody({ bodyH1, bodyIntro, bodyFaq }) {
  const paras = bodyIntro
    .map((p) => `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${p}</p>`)
    .join('\n');
  const faqItems = bodyFaq
    .map(
      ({ q, a }) => `<div class="mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-1">${q}</h3>
        <p class="text-gray-700 dark:text-gray-300">${a}</p>
      </div>`
    )
    .join('\n');
  return `<main class="max-w-3xl mx-auto px-6 py-12">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">${bodyH1}</h1>
    ${paras}
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Frequently Asked Questions</h2>
    ${faqItems}
  </main>`;
}

function faqJsonLd(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

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
    bodyFaq: [
      {
        q: 'What stock data is available?',
        a: 'Real-time price data, AI regime classification, and anomaly detection for NSE and BSE listed stocks.',
      },
      {
        q: 'Is live market data free?',
        a: "Yes — top gainers/losers and major index levels (NIFTY, Sensex, Bank Nifty) are available at no cost.",
      },
      NO_REAL_MONEY_FAQ,
    ],
    bodyH1: 'Stock Analysis – AI Market Intelligence for NSE & BSE',
    bodyIntro: [
      'Look up any NSE or BSE stock for AI-powered regime detection, anomaly signals, and real-time price data in one place.',
      "Alongside individual stock analysis, this page surfaces live NIFTY, Sensex, and Bank Nifty index levels and the day's top gainers and losers across NSE/BSE — a quick read on where the market stands before you dig into a specific stock.",
    ],
  },
  {
    routes: ['/welth-lab'],
    title: 'Welth Lab – Free No-Code Backtesting Engine for NIFTY, Bank NIFTY & NSE Stocks | WelthWest',
    description:
      'Welth Lab lets you backtest trading strategies on NIFTY 50, Bank NIFTY and 500+ NSE stocks across 10+ years of historical data — no coding required. Get Sharpe ratio, max drawdown, win rate, Monte Carlo simulation, walk-forward validation and full trade logs, completely free.',
    bodyH1: 'Welth Lab — Free No-Code Backtesting Engine for NSE & BSE',
    bodyIntro: [
      "Backtesting is how you find out whether a trading strategy's rules would have actually worked, by running them against years of real historical data to see the trades, drawdowns, and returns they would have produced. Welth Lab lets you do this on NIFTY 50, Bank NIFTY, and 500+ NSE stocks across 10+ years of historical data, with multi-timeframe simulation, and without writing a single line of code.",
      'Pick an index or stock, choose a strategy built from standard technical indicators — RSI, MACD, Bollinger Bands, SMA/EMA crossovers, Stochastic, ATR, OBV, or VWAP — set your date range, and run it. Welth Lab returns Sharpe, Sortino, and Calmar ratios, maximum drawdown, win rate, a full trade-by-trade log, Monte Carlo simulation to stress-test how robust the result really is, and walk-forward validation to check it isn\'t just overfit to the past.',
    ],
    bodyFaq: [
      {
        q: 'What is backtesting?',
        a: "Testing a trading strategy's rules against historical price data to see how it would have performed.",
      },
      { q: 'Is Welth Lab free?', a: 'Yes.' },
      {
        q: 'Do I need to know how to code?',
        a: 'No — build and run a backtest entirely through the interface.',
      },
      {
        q: 'Which Indian markets can I backtest?',
        a: 'NIFTY, Bank NIFTY, and 500+ individual NSE stocks, with 10+ years of historical data and multi-timeframe simulation.',
      },
      NO_REAL_MONEY_FAQ,
    ],
  },
  {
    routes: ['/welth-ai-assistant'],
    title: 'Welth AI Assistant – Free AI Chatbot for Stock Market & Personal Finance | WelthWest',
    description:
      'Ask Welth AI Assistant anything about Indian stocks or personal finance. Get real-time stock analysis, interactive charts with RSI, MACD, Bollinger Bands and more, plus plain-English answers on SIPs, taxes, insurance and retirement planning — free AI chat for traders and investors.',
    bodyH1: 'Welth AI Assistant — Free AI Chatbot for Stock Market & Personal Finance',
    bodyIntro: [
      'Welth AI Assistant is a free AI chatbot built for Indian traders and investors — ask it about any stock and get real-time analysis with interactive charts (RSI, MACD, Bollinger Bands, SMA, EMA, Stochastic, ATR, OBV, VWAP), or ask it to explain a financial concept from basics to advanced.',
      'It also answers everyday personal-finance questions: budgeting, tax planning, mutual funds, SIPs, insurance, and retirement planning.',
    ],
    bodyFaq: [
      {
        q: 'What can I ask it?',
        a: 'Stock analysis questions, technical indicator explanations, and personal finance topics like SIPs, taxes, and retirement planning.',
      },
      { q: 'Is it free?', a: 'Yes.' },
      {
        q: 'Does it give investment advice?',
        a: "No — WelthWest is not a broker and doesn't execute trades or provide investment advice. It's built for education and research.",
      },
      {
        q: 'What charts can it generate?',
        a: 'RSI, MACD, Bollinger Bands, SMA, EMA, Stochastic, ATR, and VWAP overlays, in real time for any stock you ask about.',
      },
      NO_REAL_MONEY_FAQ,
    ],
  },
  {
    routes: ['/ai-screener'],
    title: 'Welth Market Regime – Free AI Stock Screener for NSE & BSE | WelthWest',
    description:
      'Welth Market Regime screens NIFTY 50 and NSE/BSE stocks using AI to classify each into bull, bear or sideways regimes with volatility levels, detects price, volume and derivatives anomalies, and scores stocks with 40+ computed features. Free AI stock screener — no code required.',
    bodyH1: 'Welth Market Regime — Free AI Stock Screener for NSE & BSE',
    bodyIntro: [
      "Stocks don't move the same way in every market condition — a strategy that works in a strong uptrend can lose money in a choppy, sideways market. Welth Market Regime uses AI to classify NIFTY 50 and NSE/BSE stocks into bull, bear, or sideways regimes with a volatility read, so you know what kind of market you're actually trading in before you act.",
      'The screener analyzes price, volume, and derivatives data across 40+ computed features per stock, flags statistically unusual behavior (anomalies) that could signal something\'s changed, and scores each stock\'s current regime and volatility level — all free, no coding required.',
    ],
    bodyFaq: [
      {
        q: 'What is a market regime?',
        a: 'The underlying trend condition of a stock or index — bullish, bearish, or sideways/range-bound — which affects which strategies are likely to work.',
      },
      {
        q: 'How does it detect anomalies?',
        a: "By comparing current price, volume, and derivatives behavior against each stock's own statistical norms.",
      },
      { q: 'Is this free?', a: 'Yes.' },
      {
        q: 'Does it cover all of NSE/BSE, or just NIFTY 50?',
        a: 'Both — NIFTY 50 and individual NSE/BSE stocks.',
      },
      NO_REAL_MONEY_FAQ,
    ],
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

function buildHtmlFor(baseHtml, { title, description, url, bodyH1, bodyIntro, bodyFaq }) {
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

  // Real page content for crawlers that don't execute JS, and for Google's
  // fast first-pass crawl specifically -- confirmed directly that <div
  // id="root"> ships completely empty otherwise. React's plain render()
  // (not hydrate()) replaces this div's children on mount for users with
  // JS enabled, same as it always has; this only changes what exists
  // before that happens.
  if (bodyH1 && bodyIntro && bodyFaq) {
    const bodyHtml = renderBody({ bodyH1, bodyIntro, bodyFaq });
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);

    const ld = JSON.stringify(faqJsonLd(bodyFaq));
    html = html.replace(
      '</head>',
      `<script type="application/ld+json">${ld}</script></head>`
    );
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
      const html = buildHtmlFor(baseHtml, {
        title: page.title,
        description: page.description,
        url,
        bodyH1: page.bodyH1,
        bodyIntro: page.bodyIntro,
        bodyFaq: page.bodyFaq,
      });
      const dir = path.join(BUILD_DIR, route.replace(/^\//, ''));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html);
      written++;
    }
  }
  console.log(`[prerenderMeta] wrote ${written} static per-route index.html files`);
}

main();
