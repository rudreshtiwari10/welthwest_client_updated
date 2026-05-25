import React from 'react';

type Accent = 'emerald' | 'cyan' | 'amber' | 'violet';

interface Props {
  label: string;
  title: string;
  example: string;
  accent: Accent;
  onClick: () => void;
}

const ACCENT: Record<Accent, { bar: string; chipBg: string; chipText: string; ring: string }> = {
  emerald: {
    bar: 'bg-emerald-500',
    chipBg: 'bg-emerald-500/10',
    chipText: 'text-emerald-700 dark:text-emerald-400',
    ring: 'hover:border-emerald-500/50',
  },
  cyan: {
    bar: 'bg-cyan-500',
    chipBg: 'bg-cyan-500/10',
    chipText: 'text-cyan-700 dark:text-cyan-400',
    ring: 'hover:border-cyan-500/50',
  },
  amber: {
    bar: 'bg-amber-500',
    chipBg: 'bg-amber-500/10',
    chipText: 'text-amber-700 dark:text-amber-400',
    ring: 'hover:border-amber-500/50',
  },
  violet: {
    bar: 'bg-violet-500',
    chipBg: 'bg-violet-500/10',
    chipText: 'text-violet-700 dark:text-violet-400',
    ring: 'hover:border-violet-500/50',
  },
};

const WelthPromptCard: React.FC<Props> = ({ label, title, example, accent, onClick }) => {
  const a = ACCENT[accent];
  return (
    <button
      onClick={onClick}
      className={`group relative text-left overflow-hidden rounded-md border border-gray-200 dark:border-dark-50/60 bg-white dark:bg-dark-100 p-4 transition-colors ${a.ring}`}
    >
      <span className={`absolute inset-y-0 left-0 w-[3px] ${a.bar}`} aria-hidden />
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded ${a.chipBg} ${a.chipText}`}
        >
          {label}
        </span>
        <span className="font-mono text-[10px] text-light-400 dark:text-light-500 opacity-0 group-hover:opacity-100 transition-opacity">
          ↵
        </span>
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</div>
      <div className="font-mono text-[11px] text-light-500 dark:text-light-400 leading-relaxed">
        {example}
      </div>
    </button>
  );
};

export default WelthPromptCard;
