import React from 'react';
import { CalendarIcon, ArrowTopRightOnSquareIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { NEWS_INDEX_URL } from '../config/externalApps';

interface NewsItem {
  title: string;
  snippet: string;
  category?: string;
  tags?: string[];
  published?: string;
  slug?: string;
  url?: string;
  image_url?: string;
  source_name?: string;
}

interface Props {
  kind: 'market' | 'company' | string;
  symbol?: string;
  count?: number;
  items: NewsItem[];
}

const formatDate = (s?: string) => {
  if (!s) return '';
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
};

const WelthNewsCard: React.FC<Props> = ({ kind, symbol, items }) => {
  if (!items || items.length === 0) return null;

  const primary = items[0];
  const related = items.slice(1, 6);

  const header = kind === 'company' && symbol
    ? `News on ${symbol}`
    : kind === 'company'
      ? 'Company News'
      : 'Market Headlines';

  return (
    <div className="mt-3 rounded-md border border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-dark-50/60 bg-light-bg-secondary dark:bg-dark-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NewspaperIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-700 dark:text-light-200">
            {header}
          </span>
        </div>
        <span className="font-mono text-[10px] text-light-400 dark:text-light-500">
          From WelthWest Newsroom
        </span>
      </div>

      {/* Primary article */}
      <a
        href={primary.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 hover:bg-light-bg-secondary dark:hover:bg-dark-200/60 transition-colors group"
      >
        <div className="flex gap-4">
          {primary.image_url ? (
            <img
              src={primary.image_url}
              alt={primary.title}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              className="w-32 h-24 sm:w-40 sm:h-28 object-cover rounded flex-shrink-0 bg-gray-100 dark:bg-dark-50"
            />
          ) : (
            <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 rounded bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
              <NewspaperIcon className="w-8 h-8 text-emerald-600/60 dark:text-emerald-400/60" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {primary.category && (
              <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                {primary.category}
              </div>
            )}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {primary.title}
            </h4>
            <p className="mt-1 text-xs text-gray-600 dark:text-light-300 line-clamp-2 leading-relaxed">
              {primary.snippet}
            </p>
            <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-light-500 dark:text-light-400">
              {primary.published && (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {formatDate(primary.published)}
                </span>
              )}
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Read article
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </a>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="border-t border-gray-200 dark:border-dark-50/60">
          <div className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-light-500 dark:text-light-400 border-b border-gray-200 dark:border-dark-50/60">
            More from this topic
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-dark-50/40">
            {related.map((item, idx) => (
              <li key={idx}>
                <a
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 px-4 py-2.5 hover:bg-light-bg-secondary dark:hover:bg-dark-200/60 transition-colors group"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      className="w-16 h-12 object-cover rounded flex-shrink-0 bg-gray-100 dark:bg-dark-50"
                    />
                  ) : (
                    <div className="w-16 h-12 flex-shrink-0 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                      <NewspaperIcon className="w-4 h-4 text-emerald-600/50 dark:text-emerald-400/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 dark:text-light-100 leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-light-500 dark:text-light-400">
                      {item.category && <span>{item.category}</span>}
                      {item.category && item.published && <span>·</span>}
                      {item.published && <span>{formatDate(item.published)}</span>}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer CTA */}
      <div className="border-t border-gray-200 dark:border-dark-50/60 px-4 py-2 bg-light-bg-secondary dark:bg-dark-200">
        <a
          href={NEWS_INDEX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          Browse the full newsroom
          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default WelthNewsCard;
