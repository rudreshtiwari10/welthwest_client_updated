// All copy for the homepage Services + Founder sections lives here.
// Edit this file to change text, stats, links or the featured video.

export const FOUNDER_SITE = 'https://kunal.welthwest.com';

export const YOUTUBE = {
  channelUrl: 'https://www.youtube.com/@KunalBuildsAI',
  channelHandle: '@KunalBuildsAI',
  logo: '/images/kunal-builds-ai-logo.jpeg',
  subscribeUrl: 'https://www.youtube.com/@KunalBuildsAI?sub_confirmation=1',
  featuredVideo: {
    id: 'x4q7NTtVtoo',
    title: 'Kunal Builds AI – featured video',
  },
};

export interface ServiceItem {
  title: string;
  pitch: string;
  bullets: string[];
  cta: string;
  href: string;
  external?: boolean;
}

export const SERVICES: ServiceItem[] = [
  {
    title: 'Algorithm Trading',
    pitch: 'Build, backtest and automate rule-based strategies on NSE/BSE data.',
    bullets: ['No-code strategy backtesting', 'Realistic costs & slippage', 'Custom trading bots'],
    cta: 'Try Welth Lab',
    href: '/welth-lab',
  },
  {
    title: 'Technical Sessions',
    pitch: 'Live 1:1 and group sessions for traders and founders who want to automate.',
    bullets: ['Python, APIs & n8n training', 'Code reviews & feedback', '100+ live sessions delivered'],
    cta: 'Book a session',
    href: `${FOUNDER_SITE}/contact`,
    external: true,
  },
  {
    title: 'Business Automation',
    pitch: 'AI bots and workflows that remove manual work from your business.',
    bullets: ['n8n & AI agent workflows', 'ERP / reporting automation', 'Telegram, LinkedIn & data bots'],
    cta: 'Explore services',
    href: `${FOUNDER_SITE}/services`,
    external: true,
  },
];

export const JOURNEY = [
  { year: '2019', title: 'IIT Tirupati', text: 'Started my journey in Chemical Engineering.' },
  { year: '2021', title: 'Finance & Business', text: 'Discovered finance and business, and started a graphic design journey.' },
  { year: '2023', title: 'Risk Analyst – Financial Institution', text: 'Hands-on financial risk management and data analysis.' },
  { year: '2025', title: 'Founded WelthWest & YouTube', text: 'Launched an AI platform for financial markets and a channel on algo trading.' },
];

export const STATS = [
  { value: 50, suffix: '+', label: 'Projects Built', prefix: '' },
  { value: 100, suffix: '+', label: 'Live Sessions', prefix: '' },
  { value: 1, suffix: 'k', label: 'YouTube Subscribers', prefix: '~' },
  { value: 2, suffix: 'k+', label: 'User Traction', prefix: '' },
  { value: 142, suffix: '+', label: 'Active Users', prefix: '' },
  { value: 7, suffix: '+', label: 'AI Bots', prefix: '' },
];

export const CREDENTIALS = ['🎓 IIT Tirupati', '🏦 Ex-Financial Institution', '🚀 Founder, WelthWest'];

export const FOUNDER_PHOTO = '/images/kunal-builds-ai-logo.jpeg';

export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kunal-kumar-25418119a/' },
  { label: 'X', href: 'https://x.com/kunalku40172563' },
  { label: 'YouTube', href: 'https://www.youtube.com/@KunalBuildsAI' },
  { label: 'Instagram', href: 'https://www.instagram.com/kunal_kumarkk/' },
  { label: 'GitHub', href: 'https://github.com/kuna9457' },
];

export const FEATURED_WORK = [
  { title: 'WelthChart', tag: 'Custom trading chart', text: 'Our own custom-built trading chart, developed in-house for the WelthWest platform.' },
  { title: 'MT5 Algo Bot', tag: 'Algo trading', text: 'Automated strategy execution on MetaTrader 5.' },
  { title: 'N8N Bots', tag: 'Automation', text: 'n8n workflow bots for alerts, reports and business automation.' },
  { title: 'India Market Bot', tag: 'Market bot', text: 'A bot built around Indian market data and signals.' },
];
