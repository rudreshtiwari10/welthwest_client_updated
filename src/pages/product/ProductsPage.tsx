/**
 * ProductsPage – /products
 *
 * Dedicated page for WelthChart and Welth Algo Bot MT5, ported from the
 * "WelthWest Products" design export. The design's green/amber accents are
 * mapped to the site theme: primary (sky) = WelthChart, secondary (violet) =
 * Algo Bot. Supports both light and dark mode.
 *
 * Content placeholders still to fill: VIDEO_URLS, broker logos,
 * screenshot gallery, and real testimonials (SHOW_TESTIMONIALS).
 */

import React, { useEffect, useState } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';

// ── Config ────────────────────────────────────────────────────────────────

const CTA_LABEL = 'Get free access';
const DEMO_EMAIL = 'contact@welthwest.com';

// Placeholder quotes in the design — keep hidden until real testimonials exist.
const SHOW_TESTIMONIALS = false;

// Paste an embeddable URL (e.g. YouTube /embed/...) to replace a placeholder.
const VIDEO_URLS: Record<string, string | undefined> = {
  'welthchart-walkthrough': undefined,
  'algobot-walkthrough': undefined,
};

const DESIGN_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap';

// ── Theme tokens ──────────────────────────────────────────────────────────

interface Accent {
  text: string;
  solid: string;
  soft: string;
  bar: string;
  cardHover: string;
  glow: string;
  onImg: string;
}

const ACCENTS: Record<'primary' | 'secondary', Accent> = {
  primary: {
    text: 'text-primary-600 dark:text-primary-400',
    solid: 'bg-primary-600 hover:bg-primary-700 text-white',
    soft: 'border border-primary-500/40 bg-primary-500/10 text-primary-700 hover:bg-primary-500/20 dark:text-primary-300',
    bar: 'bg-primary-500',
    cardHover: 'hover:border-primary-500/40',
    glow: 'shadow-[0_0_0_12px_rgba(14,165,233,0.15)]',
    onImg: 'text-primary-300',
  },
  secondary: {
    text: 'text-secondary-600 dark:text-secondary-400',
    solid: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    soft: 'border border-secondary-500/40 bg-secondary-500/10 text-secondary-700 hover:bg-secondary-500/20 dark:text-secondary-300',
    bar: 'bg-secondary-500',
    cardHover: 'hover:border-secondary-500/40',
    glow: 'shadow-[0_0_0_12px_rgba(139,92,246,0.15)]',
    onImg: 'text-secondary-300',
  },
};

const PAD_X = 'px-4 sm:px-8 lg:px-14';
const CONTAINER = 'mx-auto max-w-[1240px]';
const ALT_BG = 'bg-gray-50 dark:bg-dark-200';
const BORDER_T = 'border-t border-gray-200 dark:border-white/10';
const CARD = 'rounded-[14px] border border-gray-200 bg-white dark:border-white/10 dark:bg-dark-50';
const EYEBROW = 'font-plexmono text-[11px] uppercase tracking-[0.16em]';
const LABEL = 'font-plexmono text-[11px] uppercase tracking-[0.12em] text-gray-500';
const H2_XL = 'font-display text-[clamp(32px,4.4vw,52px)] font-bold leading-[1.05] tracking-[-0.03em] text-gray-900 dark:text-white';
const H2_LG = 'font-display text-[clamp(28px,3.6vw,42px)] font-bold tracking-[-0.03em] text-gray-900 dark:text-white';
const MUTED = 'text-gray-600 dark:text-gray-400';
const OUTLINE_BTN = 'border border-gray-300 text-gray-800 hover:border-gray-400 hover:bg-gray-50 dark:border-white/15 dark:text-gray-100 dark:hover:border-white/30 dark:hover:bg-white/5';

const STRIPES: React.CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(135deg, rgba(127,127,127,0.09) 0 2px, transparent 2px 10px)',
};

const HERO_GLOW: React.CSSProperties = {
  background:
    'radial-gradient(1100px 480px at 22% -8%, rgba(14,165,233,0.14), transparent 70%), radial-gradient(800px 420px at 88% 4%, rgba(139,92,246,0.10), transparent 70%)',
};

// ── Content ───────────────────────────────────────────────────────────────

// img: chapter screenshot shown in the player. video: embeddable URL for that
// chapter (e.g. YouTube /embed/...) — when set, the play button opens it.
interface Chapter { n: string; title: string; dur: string; desc: string; img?: string; video?: string }
interface Feature { tag: string; title: string; body: string }

const CLOUDINARY = 'https://res.cloudinary.com/dwtcma8dl/image/upload';

const CHART_CHAPTERS: Chapter[] = [
  { n: '01', title: 'Trade straight from the chart', dur: '2:10', desc: 'Drag-to-place entries with SL and TP calculated live from risk, lot size and account equity.', img: `${CLOUDINARY}/v1789663575/1_s0nwer.png`, video: undefined },
  { n: '02', title: 'Split charts & multi-layout', dur: '1:35', desc: 'Two, four or six synced panes — different symbols and timeframes in one workspace.', img: `${CLOUDINARY}/v1789664488/2_uhrbty.png`, video: undefined },
  { n: '03', title: 'Option chain on the chart', dur: '1:48', desc: 'Strike ladder, OI and premiums docked beside the candles; fire an option order in one click.', img: `${CLOUDINARY}/v1789664487/3_htkldw.png`, video: undefined },
  { n: '04', title: 'Live P&L and position tracking', dur: '2:02', desc: 'Account size, open exposure and running P&L on the chart — modify or exit from the same panel.', img: `${CLOUDINARY}/v1789664487/4_ygjcr4.png`, video: undefined },
  { n: '05', title: 'Renko, 15-second & custom blocks', dur: '1:22', desc: 'Sub-minute candles plus Renko with your own brick size and build logic.', img: `${CLOUDINARY}/v1789664487/5_ieaamg.png`, video: undefined },
  { n: '06', title: 'Multi-broker connections', dur: '1:40', desc: 'Link several broker accounts at once and choose the routing account per order.', img: `${CLOUDINARY}/v1789664487/6_dge5wh.png`, video: undefined },
  { n: '07', title: 'Auto Option — strategy automation', dur: '2:55', desc: 'Define the strategy once; the engine initiates, buys and sells as filters trigger.', img: `${CLOUDINARY}/v1789664487/7_ocduko.png`, video: undefined },
  { n: '08', title: 'Backtest replay', dur: '2:30', desc: 'Replay any session bar by bar with indicators and drawing tools live on the replay.', img: `${CLOUDINARY}/v1789664487/8_l6bgsj.png`, video: undefined },
];

const BOT_CHAPTERS: Chapter[] = [
  { n: '01', title: 'Connect your MT5 account', dur: '1:30', desc: 'Point the bot at any MT5 broker login and it picks up symbols, spreads and contract specs.', img: `${CLOUDINARY}/v1789666398/1_da9c1a.png`, video: undefined },
  { n: '02', title: 'Pick multiple strategies', dur: '2:05', desc: 'Run several strategies in parallel, each with its own risk envelope and session window.', img: `${CLOUDINARY}/v1789666398/2_teqpju.png`, video: undefined },
  { n: '03', title: 'Multi-symbol execution', dur: '1:44', desc: 'Forex, crypto, indices, metals and energy traded together from one dashboard.', img: `${CLOUDINARY}/v1789666397/3_od8r3f.png`, video: undefined },
  { n: '04', title: 'Risk and drawdown controls', dur: '1:58', desc: 'Per-trade risk, daily loss cap, max open positions and an equity-protection kill switch.', img: `${CLOUDINARY}/v1789666397/4_lbmon3.png`, video: undefined },
  { n: '05', title: 'Monitoring and logs', dur: '1:26', desc: 'Live trade log, per-strategy performance and alerts to Telegram or email.', img: `${CLOUDINARY}/v1789666398/5_asphuu.png`, video: undefined },
];

const STATS = [
  { v: 'Live', k: 'Both products shipping today' },
  { v: 'Multi-broker', k: 'Several accounts, one workspace' },
  { v: '15s · Renko', k: 'Custom block candles' },
  { v: 'MT5', k: 'Forex, crypto, global markets' },
];

const CHART_FEATURES: Feature[] = [
  { tag: 'EXECUTION', title: 'Order placement on the chart', body: 'Buy, sell, modify and exit by dragging levels. SL and TP are computed from risk, quantity and margin as you move them.' },
  { tag: 'LAYOUT', title: 'Split chart workspaces', body: 'Multiple synced panes with independent symbols, timeframes and indicator sets.' },
  { tag: 'DERIVATIVES', title: 'Option chain on chart', body: 'Live strike ladder with OI and premium docked to the chart, one-click option entries.' },
  { tag: 'POSITIONS', title: 'Live P&L and account view', body: 'Account size, margin used, open positions and running P&L tracked on the chart — exit from the same panel.' },
  { tag: 'CANDLES', title: 'Renko, 15-second, custom blocks', body: 'Sub-minute candles and Renko with a brick size and build rule you define.' },
  { tag: 'BROKERS', title: 'Connect multiple brokers', body: 'Several live broker sessions at once; choose the routing account per order.' },
  { tag: 'WATCHLIST', title: 'Unlimited watchlists', body: 'No cap on lists or symbols. Group by strategy, sector or session.' },
  { tag: 'AUTOMATION', title: 'Auto Option', body: 'Define the strategy and filters once; the engine initiates trades and manages buy/sell without you at the desk.' },
  { tag: 'AUTOMATION', title: 'Automated Trading', body: 'Run fully automated strategies directly inside WelthChart — let the engine manage entries, exits and position sizing without manual intervention.' },
];

const BOT_FEATURES: Feature[] = [
  { tag: 'PLATFORM', title: 'Native MT5 execution', body: 'Runs through MetaTrader 5, so any symbol your broker lists is tradable by the bot.' },
  { tag: 'STRATEGIES', title: 'Multiple strategies in parallel', body: 'Select and combine strategies, each with its own symbols, sessions and risk envelope.' },
  { tag: 'MARKETS', title: 'Crypto, forex and global markets', body: 'Trade FX pairs, crypto, indices, metals and energy from one control panel.' },
  { tag: 'RISK', title: 'Hard risk limits', body: 'Per-trade risk, daily loss cap, max concurrent positions and an equity kill switch.' },
  { tag: 'UPTIME', title: 'Unattended operation', body: 'Deploy on VPS or desktop and keep trading through every session, 24/5 and crypto weekends.' },
  { tag: 'VISIBILITY', title: 'Logs and alerts', body: 'Live trade log, per-strategy stats and notifications to Telegram or email.' },
];

const GALLERY = [
  { label: 'Chart trading panel',  src: '/images/WC1.png' },
  { label: 'Option chain on chart', src: '/images/wc2.png' },
  { label: 'Split chart layout',    src: '/images/wc3.png' },
  { label: 'Backtest replay',       src: '/images/wc4.png' },
];

const BROKERS = [
  'Upstox', 'Zerodha (Kite)', 'Dhan', 'Fyers', 'FlatTrade', 'Angel One', 'Binance', 'MT5', 'Delta Exchange',
];

// Soft-fade the slider's edges so names glide in and out.
const MARQUEE_MASK: React.CSSProperties = {
  maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
  WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
};

const STEPS = [
  { n: '01', title: 'Book the free demo', body: 'Fill the form and we set up a live session on your markets — no card, no commitment.' },
  { n: '02', title: 'Connect broker or MT5', body: 'Link one or more broker accounts to WelthChart, or point the Algo Bot at your MT5 login.' },
  { n: '03', title: 'Trade or automate', body: 'Execute manually from the chart, or hand the strategy to Auto Option and the bot.' },
];

const COMPARE = [
  { cap: 'Order entry with calculated SL/TP on chart', us: 'Included', them: 'Partial / paid add-on' },
  { cap: 'Option chain docked on the chart', us: 'Included', them: 'Not available' },
  { cap: 'Split charts and multi-pane layouts', us: 'Included', them: 'Top-tier plan only' },
  { cap: '15-second and custom-block Renko candles', us: 'Included', them: 'Rarely offered' },
  { cap: 'Multiple broker connections at once', us: 'Included', them: 'One at a time' },
  { cap: 'Watchlist limits', us: 'Unlimited', them: 'Capped by plan' },
  { cap: 'Strategy-driven auto trading', us: 'Auto Option, built in', them: 'Needs external tooling' },
  { cap: 'Replay backtesting with indicators and tools', us: 'Included', them: 'Top-tier plan only' },
];

const QUOTES = [
  { text: 'Placing the stop and target by dragging them on the chart changed how fast I can manage a position.', name: 'Name placeholder', role: 'Intraday trader' },
  { text: 'I run three strategies on six symbols overnight and check the log in the morning.', name: 'Name placeholder', role: 'Forex, MT5 user' },
  { text: 'The replay backtest with my own indicators is the feature I was paying far more for elsewhere.', name: 'Name placeholder', role: 'Options trader' },
];

const DEMO_POINTS = [
  'Live walkthrough of both products on your markets',
  'Broker and MT5 setup done with you on the call',
  'Honest pricing comparison against what you pay today',
];

const FAQS = [
  { q: 'Do I need a separate broker account?', a: 'Yes. WelthChart and the Algo Bot execute through your own broker or MT5 account — we never hold funds. Connect one or several accounts and pick which one an order routes to.' },
  { q: 'How is this cheaper than other charting platforms?', a: 'We build and run the stack ourselves, so features that sit behind top-tier plans elsewhere — split charts, sub-minute and Renko candles, unlimited watchlists, replay backtesting — are included at a lower monthly price.' },
  { q: 'Which markets does Welth Algo Bot MT5 support?', a: 'Anything your MT5 broker offers: forex pairs, crypto, global indices, metals and energy. Multiple symbols and multiple strategies run at the same time.' },
  { q: 'Can I automate my own strategy?', a: 'Yes. Auto Option in WelthChart initiates and manages trades from strategy filters you define, and the Algo Bot lets you select and combine strategies per symbol with its own risk settings.' },
  { q: 'Is the backtest replay realistic?', a: 'Replay walks historical data bar by bar with your indicators and drawing tools active, so you practise and validate as if live. Results are simulated and not a promise of future performance.' },
  { q: 'What happens on the free demo call?', a: 'A member of our team shares their screen, sets up a workspace with your markets, and shows chart trading, automation and backtesting end to end. Usually 30 minutes.' },
];

const SUB_NAV = [
  { href: '#welthchart', label: 'WelthChart' },
  { href: '#algobot', label: 'Algo Bot MT5' },
  { href: '#how', label: 'How it works' },
  { href: '#faq', label: 'FAQ' },
];

// ── Building blocks ───────────────────────────────────────────────────────

const Check: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`text-primary-600 dark:text-primary-400 ${className}`} aria-hidden="true">✓</span>
);

const ProductHeader: React.FC<{
  kicker: string; name: string; body: string; accent: Accent; onCta: () => void;
}> = ({ kicker, name, body, accent, onCta }) => (
  <div className="flex flex-wrap items-end justify-between gap-6">
    <div>
      <div className={`${EYEBROW} ${accent.text}`}>{kicker}</div>
      <h2 className={`mt-3 ${H2_XL}`}>{name}</h2>
      <p className={`mt-3.5 max-w-[58ch] text-[17px] ${MUTED}`}>{body}</p>
    </div>
    <a href="#demo" onClick={onCta} className={`whitespace-nowrap rounded-[10px] px-[22px] py-[13px] text-sm font-semibold shadow-md transition-colors ${accent.solid}`}>
      {CTA_LABEL}
    </a>
  </div>
);

const VideoPanel: React.FC<{
  label: string; chapter: Chapter; progress: number; accent: Accent; onPlay: () => void; onZoom: () => void;
}> = ({ label, chapter, progress, accent, onPlay, onZoom }) => {
  const img = chapter.img;
  // With a screenshot and no video yet, the panel opens the image instead of the "coming soon" modal.
  const showPlay = !img || !!chapter.video;
  return (
  <div className="flex flex-col gap-3.5">
    <div
      className="relative aspect-video overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-dark-300"
      style={img ? undefined : STRIPES}
    >
      {img && (
        <button onClick={showPlay ? onPlay : onZoom} aria-label={`View: ${chapter.title}`} className="group absolute inset-0 cursor-zoom-in">
          <img
            key={img}
            src={img}
            alt={chapter.title}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </button>
      )}
      {showPlay && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 pb-12 sm:pb-0">
          <button
            onClick={onPlay}
            aria-label={`Play: ${chapter.title}`}
            className={`pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full text-xl transition-colors sm:h-[76px] sm:w-[76px] sm:text-[22px] ${accent.solid} ${accent.glow}`}
          >
            ▶
          </button>
          {!img && <div className={`${LABEL} hidden sm:block`}>{label}</div>}
        </div>
      )}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t px-5 pb-[18px] pt-10 ${
          img ? 'from-black/85 via-black/60 to-transparent' : 'from-white via-white/80 to-transparent dark:from-dark-300 dark:via-dark-300/80'
        }`}
      >
        <div className="flex items-baseline gap-2.5">
          <span className={`font-plexmono text-xs ${img ? accent.onImg : accent.text}`}>{chapter.n}</span>
          <span className={`font-display text-[15px] font-semibold sm:text-[17px] ${img ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{chapter.title}</span>
          <span className={`ml-auto font-plexmono text-xs ${img ? 'text-white/70' : 'text-gray-500'}`}>{chapter.dur}</span>
        </div>
        <div className={`mt-1.5 hidden text-[13px] sm:block ${img ? 'text-white/80' : MUTED}`}>{chapter.desc}</div>
      </div>
    </div>
    <div className="h-[3px] overflow-hidden rounded-sm bg-gray-200 dark:bg-white/10">
      <div className={`h-full transition-all duration-300 ${accent.bar}`} style={{ width: `${progress}%` }} />
    </div>
  </div>
  );
};

const ChapterList: React.FC<{
  chapters: Chapter[]; active: number; accent: Accent; onPick: (i: number) => void;
}> = ({ chapters, active, accent, onPick }) => (
  <div className={`flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-dark-50`}>
    <div className={`border-b border-gray-200 px-[18px] py-3.5 dark:border-white/10 ${LABEL} tracking-[0.14em]`}>Chapters</div>
    <div className="flex flex-col overflow-y-auto">
      {chapters.map((c, i) => {
        const on = i === active;
        return (
          <button
            key={c.n}
            onClick={() => onPick(i)}
            className={`relative flex w-full items-center gap-3 border-b border-gray-100 px-[18px] py-3.5 text-left transition-colors last:border-b-0 dark:border-white/5 ${
              on ? 'bg-gray-100 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'
            }`}
          >
            {on && <span className={`absolute inset-y-0 left-0 w-0.5 ${accent.bar}`} />}
            <span className={`font-plexmono text-xs ${on ? accent.text : 'text-gray-500'}`}>{c.n}</span>
            <span className={`flex-1 text-sm font-medium ${on ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              {c.title}
            </span>
            <span className="font-plexmono text-xs text-gray-500">{c.dur}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const FeatureGrid: React.FC<{ features: Feature[]; accent: Accent }> = ({ features, accent }) => {
  const [expanded, setExpanded] = React.useState(false);
  // Show first row (4 cards), rest hidden behind View More
  const visible = expanded ? features : features.slice(0, 4);
  return (
    <div className="mt-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(258px,1fr))] gap-3.5">
        {visible.map((f) => (
          <div key={f.title} className={`${CARD} p-[22px] transition-colors ${accent.cardHover}`}>
            <div className={`font-plexmono text-[11px] ${accent.text}`}>{f.tag}</div>
            <h3 className="mt-2.5 font-display text-lg font-semibold tracking-[-0.01em] text-gray-900 dark:text-white">{f.title}</h3>
            <p className={`mt-2 text-sm ${MUTED}`}>{f.body}</p>
          </div>
        ))}
      </div>
      {features.length > 4 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${accent.soft}`}
          >
            {expanded ? 'View Less ↑' : `View More (${features.length - 4} more) ↓`}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────

const INPUT =
  'rounded-[9px] border border-gray-300 bg-white px-3.5 py-3 text-[15px] text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-white/15 dark:bg-dark-300 dark:text-gray-100 dark:placeholder-gray-500';

const ProductsPage: React.FC = () => {
  usePageMeta({
    title: 'WelthChart & Welth Algo Bot MT5 – Chart Trading and Automation | WelthWest',
    description:
      'WelthChart is a charting and execution terminal with on-chart SL/TP, option chain, split layouts and replay backtesting. Welth Algo Bot MT5 automates multiple strategies across forex, crypto and global markets.',
  });

  const [chart, setChart] = useState(0);
  const [bot, setBot] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [modal, setModal] = useState<{ title: string; slot: string; url?: string } | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [demo, setDemo] = useState({ name: '', phone: '', email: '', product: 'WelthChart', notes: '' });
  const [formNote, setFormNote] = useState('');

  // Design typography: Space Grotesk (display) + IBM Plex Mono (labels).
  useEffect(() => {
    if (document.querySelector(`link[href="${DESIGN_FONTS_HREF}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = DESIGN_FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!modal && !lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setModal(null); setLightbox(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, lightbox]);

  const updateDemo = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDemo((d) => ({ ...d, [e.target.name]: e.target.value }));

  // No lead endpoint exists yet, so the request goes out via the visitor's mail client.
  const submitDemo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!demo.name.trim() || (!demo.email.trim() && !demo.phone.trim())) {
      setFormNote('Please add your name and an email or phone number.');
      return;
    }
    const body = [
      `Name: ${demo.name}`,
      `Phone / WhatsApp: ${demo.phone || '-'}`,
      `Email: ${demo.email || '-'}`,
      `Interested in: ${demo.product}`,
      `What I trade: ${demo.notes || '-'}`,
    ].join('\n');
    window.location.href = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(`Free demo request – ${demo.product}`)}&body=${encodeURIComponent(body)}`;
    setFormNote(`Your email app should open with the request ready to send to ${DEMO_EMAIL}.`);
  };

  const A = ACCENTS.primary;
  const B = ACCENTS.secondary;
  const modalUrl = modal ? modal.url ?? VIDEO_URLS[modal.slot] : undefined;

  return (
    <div className="overflow-x-hidden text-base leading-relaxed text-gray-800 dark:text-gray-200">

      {/* ── Hero ── */}
      <section className={`relative ${PAD_X} pt-[clamp(56px,8vw,110px)]`}>
        <div className="pointer-events-none absolute inset-0" style={HERO_GLOW} />
        <div className={`relative ${CONTAINER}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 font-plexmono text-[11px] uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
            Both products are live
          </div>
          <h1 className="mt-[22px] max-w-[20ch] font-display text-[clamp(28px,4.8vw,56px)] font-bold leading-[1.05] tracking-[-0.035em] text-gray-900 dark:text-white">
            Trade from the chart. Automate the rest.
          </h1>
          <div className="mt-[34px] flex flex-wrap gap-3">
            <a href="#demo" className={`rounded-[10px] px-[26px] py-[15px] text-[15px] font-semibold shadow-md transition-colors ${A.solid}`}>
              Book a free demo
            </a>
            <a href="#welthchart" className={`rounded-[10px] px-[26px] py-[15px] text-[15px] font-semibold transition-colors ${OUTLINE_BTN}`}>
              Watch the walkthrough
            </a>
          </div>
          <div className="mt-[54px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px overflow-hidden rounded-[14px] border border-gray-200 bg-gray-200 dark:border-white/10 dark:bg-white/10">
            {STATS.map((s) => (
              <div key={s.k} className="bg-white px-6 py-[22px] dark:bg-dark-50">
                <div className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 dark:text-white">{s.v}</div>
                <div className="mt-1 text-[13px] text-gray-500">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product 01: WelthChart ── */}
      <section id="welthchart" className={`${PAD_X} scroll-mt-32 pt-[clamp(70px,9vw,130px)]`}>
        <div className={CONTAINER}>
          <ProductHeader
            kicker="Product 01"
            name="WelthChart"
            body="A charting terminal that trades. Advanced order placement with calculated SL/TP, split layouts, option chain on chart, live P&L and position management — without leaving the candles."
            onCta={() => setDemo((d) => ({ ...d, product: 'WelthChart' }))}
            accent={A}
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)]">
            <VideoPanel
              label="WelthChart walkthrough"
              chapter={CHART_CHAPTERS[chart]}
              progress={Math.round(((chart + 1) / CHART_CHAPTERS.length) * 100)}
              accent={A}
              onPlay={() => setModal({ title: `WelthChart — ${CHART_CHAPTERS[chart].title}`, slot: 'welthchart-walkthrough', url: CHART_CHAPTERS[chart].video })}
              onZoom={() => setLightbox({ src: CHART_CHAPTERS[chart].img!, label: CHART_CHAPTERS[chart].title })}
            />
            <ChapterList chapters={CHART_CHAPTERS} active={chart} accent={A} onPick={setChart} />
          </div>

          {/* ── Inside the terminal (screenshot gallery) ── */}
          <div className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-[22px] font-semibold text-gray-900 dark:text-white">Inside the terminal</h3>
              <span className={LABEL}>Screenshot gallery</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3.5">
              {GALLERY.map((g) => (
                <button
                  key={g.label}
                  onClick={() => setLightbox({ src: g.src, label: g.label })}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-dark-50 cursor-zoom-in text-left"
                >
                  <img
                    src={g.src}
                    alt={g.label}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3.5 pb-3 pt-10">
                    <span className="font-plexmono text-[11px] text-white/80">{g.label}</span>
                  </div>
                  {/* zoom hint */}
                  <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-sm">
                    ⤢
                  </div>
                </button>
              ))}
            </div>
          </div>

          <FeatureGrid features={CHART_FEATURES} accent={A} />


          {/* ── Comparison table (WelthChart section) ── */}
          <div className="mt-12 overflow-hidden rounded-[18px] border border-gray-200 bg-white dark:border-white/10 dark:bg-dark-50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-7 py-6 dark:border-white/10">
              <h3 className="font-display text-[clamp(20px,2.4vw,28px)] font-bold tracking-[-0.025em] text-gray-900 dark:text-white">
                Why traders switch to WelthChart
              </h3>
              <span className={LABEL}>Feature comparison</span>
            </div>
            <div className="overflow-x-auto">
              <div className="grid min-w-[560px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] text-sm">
                <div className={`border-b border-gray-200 px-7 py-3.5 dark:border-white/10 ${LABEL}`}>Capability</div>
                <div className={`border-b border-gray-200 px-5 py-3.5 font-display font-semibold dark:border-white/10 ${A.text}`}>WelthChart</div>
                <div className="border-b border-gray-200 px-5 py-3.5 font-display font-semibold text-gray-500 dark:border-white/10">
                  Typical charting tools
                </div>
                {COMPARE.map((r) => (
                  <React.Fragment key={r.cap}>
                    <div className="border-b border-gray-100 px-7 py-4 text-gray-900 dark:border-white/5 dark:text-gray-100">{r.cap}</div>
                    <div className={`border-b border-gray-100 px-5 py-4 dark:border-white/5 ${A.text}`}>{r.us}</div>
                    <div className="border-b border-gray-100 px-5 py-4 text-gray-500 dark:border-white/5">{r.them}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product 02: Algo Bot ── */}
      <section
        id="algobot"
        className={`mt-[clamp(70px,9vw,130px)] scroll-mt-32 border-y border-gray-200 py-[clamp(60px,8vw,110px)] dark:border-white/10 ${ALT_BG} ${PAD_X}`}
      >
        <div className={CONTAINER}>
          <ProductHeader
            kicker="Product 02"
            name="Welth Algo Bot MT5"
            body="Automated execution software that plugs straight into MetaTrader 5. Select multiple strategies and multiple symbols at once and let it trade crypto, forex, indices and commodities across global sessions."
            onCta={() => setDemo((d) => ({ ...d, product: 'Welth Algo Bot MT5' }))}
            accent={B}
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.62fr)]">
            <div className="order-2 lg:order-1">
              <ChapterList chapters={BOT_CHAPTERS} active={bot} accent={B} onPick={setBot} />
            </div>
            <div className="order-1 lg:order-2">
              <VideoPanel
                label="Algo Bot walkthrough"
                chapter={BOT_CHAPTERS[bot]}
                progress={Math.round(((bot + 1) / BOT_CHAPTERS.length) * 100)}
                accent={B}
                onPlay={() => setModal({ title: `Welth Algo Bot MT5 — ${BOT_CHAPTERS[bot].title}`, slot: 'algobot-walkthrough', url: BOT_CHAPTERS[bot].video })}
                onZoom={() => setLightbox({ src: BOT_CHAPTERS[bot].img!, label: BOT_CHAPTERS[bot].title })}
              />
            </div>
          </div>

          <FeatureGrid features={BOT_FEATURES} accent={B} />
        </div>
      </section>

      {/* ── Connects with ── */}
      <section className={`${PAD_X} py-[clamp(50px,6vw,76px)]`}>
        <div className={CONTAINER}>
          <div className={`text-center ${LABEL} tracking-[0.16em]`}>Connects with</div>
          <div className="group mt-[22px] overflow-hidden" style={MARQUEE_MASK}>
            {/* List is rendered twice; the track slides -50% so the loop is seamless. */}
            <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
              {[...BROKERS, ...BROKERS].map((b, i) => (
                <div
                  key={`${b}-${i}`}
                  aria-hidden={i >= BROKERS.length}
                  className="mr-2.5 flex h-14 min-w-[148px] shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-6 font-display text-[15px] font-semibold tracking-[-0.01em] text-gray-700 dark:border-white/10 dark:bg-dark-50 dark:text-gray-200"
                >
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className={`${PAD_X} ${BORDER_T} scroll-mt-32 py-[clamp(60px,8vw,110px)]`}>
        <div className={CONTAINER}>
          <h2 className={H2_LG}>Live in three steps</h2>
          <div className="mt-[34px] grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-[18px]">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative overflow-hidden rounded-b-[14px] rounded-t border border-gray-200 bg-white p-[26px] dark:border-white/10 dark:bg-dark-50"
              >
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500" />
                <div className="font-display text-[34px] font-bold tracking-[-0.03em] text-gray-300 dark:text-white/15">{s.n}</div>
                <h3 className="mt-2.5 font-display text-[19px] font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                <p className={`mt-2 text-sm ${MUTED}`}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── Testimonials (off until real quotes exist) ── */}
      {SHOW_TESTIMONIALS && (
        <section className={`${PAD_X} ${BORDER_T} py-[clamp(60px,8vw,100px)]`}>
          <div className={CONTAINER}>
            <h2 className="font-display text-[clamp(26px,3.2vw,38px)] font-bold tracking-[-0.03em] text-gray-900 dark:text-white">
              From the desk of early users
            </h2>
            <div className="mt-[30px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
              {QUOTES.map((q) => (
                <figure key={q.text} className={`${CARD} m-0 p-[26px]`}>
                  <blockquote className="font-display text-[17px] leading-normal text-gray-800 dark:text-gray-100">{q.text}</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="block h-[38px] w-[38px] rounded-full bg-gray-200 dark:bg-dark-300" style={STRIPES} />
                    <span>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">{q.name}</span>
                      <span className="block font-plexmono text-[11px] text-gray-500">{q.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Demo form ── */}
      <section id="demo" className={`${PAD_X} ${BORDER_T} ${SHOW_TESTIMONIALS ? ALT_BG : ''} scroll-mt-32 py-[clamp(60px,8vw,110px)]`}>
        <div className={`${CONTAINER} grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-11`}>
          <div>
            <h2 className="font-display text-[clamp(30px,4vw,46px)] font-bold leading-[1.05] tracking-[-0.03em] text-gray-900 dark:text-white">
              Get a free live demo
            </h2>
            <p className={`mt-4 max-w-[46ch] text-[17px] ${MUTED}`}>
              Fill the form and our team walks you through WelthChart and the Algo Bot on a live session — chart trading, strategy
              automation, backtest replay and broker setup. No charge, no obligation.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              {DEMO_POINTS.map((t) => (
                <div key={t} className="flex gap-[11px] text-[15px] text-gray-700 dark:text-gray-300">
                  <Check />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={submitDemo}
            className="flex flex-col gap-3.5 rounded-[18px] border border-gray-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-dark-50"
          >
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3.5">
              <label className="flex flex-col gap-[7px]">
                <span className={LABEL}>Full name</span>
                <input name="name" type="text" placeholder="Your name" value={demo.name} onChange={updateDemo} className={INPUT} />
              </label>
              <label className="flex flex-col gap-[7px]">
                <span className={LABEL}>Phone / WhatsApp</span>
                <input name="phone" type="tel" placeholder="+91" value={demo.phone} onChange={updateDemo} className={INPUT} />
              </label>
            </div>
            <label className="flex flex-col gap-[7px]">
              <span className={LABEL}>Email</span>
              <input name="email" type="email" placeholder="you@email.com" value={demo.email} onChange={updateDemo} className={INPUT} />
            </label>
            <label className="flex flex-col gap-[7px]">
              <span className={LABEL}>Interested in</span>
              <select name="product" value={demo.product} onChange={updateDemo} className={INPUT}>
                <option>WelthChart</option>
                <option>Welth Algo Bot MT5</option>
                <option>Both products</option>
              </select>
            </label>
            <label className="flex flex-col gap-[7px]">
              <span className={LABEL}>What do you trade?</span>
              <textarea
                name="notes"
                rows={3}
                placeholder="Markets, broker, strategy — optional"
                value={demo.notes}
                onChange={updateDemo}
                className={`${INPUT} resize-y`}
              />
            </label>
            <button type="submit" className={`mt-1 rounded-[10px] p-[15px] text-[15px] font-semibold transition-colors ${A.solid}`}>
              Request free demo
            </button>
            {formNote && <div className="font-plexmono text-[11px] text-gray-500">{formNote}</div>}
          </form>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={`${PAD_X} ${BORDER_T} scroll-mt-32 py-[clamp(60px,8vw,110px)]`}>
        <div className="mx-auto max-w-[900px]">
          <h2 className={`mb-[30px] ${H2_LG}`}>Questions</h2>
          <div className="flex flex-col border-t border-gray-200 dark:border-white/10">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="border-b border-gray-200 dark:border-white/10">
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 px-1 py-5 text-left font-display text-[17px] font-medium text-gray-900 dark:text-white"
                  >
                    <span className="flex-1">{f.q}</span>
                    <span className={`text-xl ${A.text}`}>{open ? '−' : '+'}</span>
                  </button>
                  {open && <p className={`max-w-[74ch] px-1 pb-[22px] text-[15px] ${MUTED}`}>{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* ── Image lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.label}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10"
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="font-display text-base font-semibold text-white sm:text-lg">{lightbox.label}</span>
              <button
                onClick={() => setLightbox(null)}
                className="whitespace-nowrap rounded-lg border border-white/20 px-3.5 py-2 text-[13px] text-gray-200 transition-colors hover:bg-white/10"
              >
                Close ✕
              </button>
            </div>
            <img
              src={lightbox.src}
              alt={lightbox.label}
              className="w-full rounded-2xl border border-white/10 shadow-2xl object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* ── Video modal ── */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={modal.title}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-14"
        >
          <div className="w-full max-w-[1100px]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3.5 flex items-center justify-between gap-4">
              <span className="font-display text-lg font-semibold text-white sm:text-xl">{modal.title}</span>
              <button
                onClick={() => setModal(null)}
                className="whitespace-nowrap rounded-lg border border-white/20 px-3.5 py-2 text-[13px] text-gray-200 transition-colors hover:bg-white/10"
              >
                Close ✕
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/15 bg-dark-300" style={STRIPES}>
              {modalUrl ? (
                <iframe
                  src={modalUrl}
                  title={modal.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-plexmono text-xs uppercase tracking-[0.12em] text-gray-500">
                  Walkthrough video coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
