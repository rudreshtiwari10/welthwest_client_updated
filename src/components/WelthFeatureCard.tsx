import React from 'react';
import {
  ArrowRightIcon,
  SparklesIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  CalculatorIcon,
  BoltIcon,
  AcademicCapIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';

interface FeatureSuggestion {
  key: string;
  name: string;
  description: string;
  url: string;
  plan_tier?: string;
}

interface Props {
  suggestions: FeatureSuggestion[];
}

// Map known feature keys to icons. New features fall back to SparklesIcon.
const ICON_BY_KEY: Record<string, React.ElementType> = {
  ai_screener: MagnifyingGlassIcon,
  screener: MagnifyingGlassIcon,
  stock_detail_page: ChartBarIcon,
  stock_page: ChartBarIcon,
  backtest: BoltIcon,
  backtesting: BoltIcon,
  market_news: NewspaperIcon,
  news: NewspaperIcon,
  blogs: AcademicCapIcon,
  blog: AcademicCapIcon,
  calculator: CalculatorIcon,
  emi_calculator: CalculatorIcon,
  portfolio_analyzer: ChartPieIcon,
};

const ACCENT_BY_INDEX = [
  { stripe: 'bg-emerald-500', chipBg: 'bg-emerald-500/10', chipText: 'text-emerald-700 dark:text-emerald-400', hoverBorder: 'hover:border-emerald-500/60', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { stripe: 'bg-cyan-500', chipBg: 'bg-cyan-500/10', chipText: 'text-cyan-700 dark:text-cyan-400', hoverBorder: 'hover:border-cyan-500/60', iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { stripe: 'bg-amber-500', chipBg: 'bg-amber-500/10', chipText: 'text-amber-700 dark:text-amber-400', hoverBorder: 'hover:border-amber-500/60', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
];

const WelthFeatureCard: React.FC<Props> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-3 rounded-md border border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-dark-50/60 bg-light-bg-secondary dark:bg-dark-200 flex items-center gap-2">
        <SparklesIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-700 dark:text-light-200">
          Welth recommends
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 dark:bg-dark-50/60">
        {suggestions.slice(0, 3).map((s, i) => {
          const Icon = ICON_BY_KEY[s.key] || ICON_BY_KEY[s.name?.toLowerCase().replace(/\s+/g, '_')] || SparklesIcon;
          const a = ACCENT_BY_INDEX[i % ACCENT_BY_INDEX.length];
          const isPremium = (s.plan_tier || '').toUpperCase() !== 'FREE' && (s.plan_tier || '').toUpperCase() !== '';

          return (
            <div
              key={s.key + i}
              className={`relative bg-white dark:bg-dark-100 p-4 ${a.hoverBorder} transition-colors flex flex-col`}
            >
              <span className={`absolute inset-y-0 left-0 w-[3px] ${a.stripe}`} aria-hidden />

              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center ${a.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isPremium && (
                  <span className={`font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${a.chipBg} ${a.chipText}`}>
                    {s.plan_tier}
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {s.name}
              </div>
              <p className="text-xs text-gray-600 dark:text-light-300 leading-relaxed flex-1 mb-3">
                {s.description}
              </p>

              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto inline-flex items-center justify-between gap-2 px-3 py-2 rounded border font-mono text-[11px] uppercase tracking-widest transition-colors group ${a.chipBg} ${a.chipText} border-transparent hover:border-current`}
              >
                <span>Open feature</span>
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WelthFeatureCard;
