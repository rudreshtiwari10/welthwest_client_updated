// URLs of sibling WelthWest applications that live outside this React client.
// Override per-environment via `REACT_APP_NEWS_APP_URL` (set in .env.local or
// the deployment env). Production default is the main WelthWest domain — the
// Next.js newsroom app is mounted there at /news and /blogs.
//
// Anywhere this React client needs to link to a news article, blog post, or
// the news index, import NEWS_APP_URL — do not hardcode '/news' or '/blogs'.
// Those paths used to belong to legacy React routes that have since been
// migrated to a separate Next.js app.

export const NEWS_APP_URL = (
  process.env.REACT_APP_NEWS_APP_URL || 'https://www.welthwest.com'
).replace(/\/$/, '');

export const newsArticleUrl = (slug: string) => `${NEWS_APP_URL}/news/${slug}`;
export const blogArticleUrl = (slug: string) => `${NEWS_APP_URL}/blogs/${slug}`;
export const NEWS_INDEX_URL = `${NEWS_APP_URL}/news`;
export const BLOGS_INDEX_URL = `${NEWS_APP_URL}/blogs`;
