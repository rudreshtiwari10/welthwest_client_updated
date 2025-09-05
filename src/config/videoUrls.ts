// Sanitize base and warn if missing
const rawBase = process.env.REACT_APP_VIDEO_CDN_URL || '';
const CDN_BASE = rawBase.trim().replace(/\/$/, '');

if (!CDN_BASE) {
  // CDN URL not set, using local files
} else {
  // CDN URL configured
}
// Build safe paths (encode spaces/special chars)
const encodePath = (p: string): string => p.split('/').map(encodeURIComponent).join('/');

export const VIDEO_URLS = {
  AI_ANALYSIS: `${CDN_BASE}/${encodePath('videos/market Analysis.mp4')}`,
  WELTHAI_CHAT: `${CDN_BASE}/${encodePath('videos/welthai-chat-demo.mp4')}`,
  BACKTESTING: `${CDN_BASE}/${encodePath('videos/backtest_small.mp4')}`,
};

export const POSTER_URLS = {
  AI_ANALYSIS: '/images/ai-analysis-poster.avif',
  WELTHAI_CHAT: '/images/welthai-chat-poster.avif',
  BACKTESTING: '/images/backtesting-poster.avif',
};


