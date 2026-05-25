import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Match Indian rupee amounts (₹ 1,234.56), percentages (+3.21% / -1.04%),
// and plain numeric deltas like (+5.20) / (-1.10). Used to color/mono-ify
// figures inside paragraph and list-item text so prose feels like a tearsheet.
const FIGURE = /(₹\s?[\d,]+(?:\.\d+)?(?:\s?(?:Cr|Lakh|L))?|[+-]?\d+(?:\.\d+)?\s?%|\(?[+-]\s?\d+(?:\.\d+)?\)?)/g;

const colorForFigure = (raw: string): string => {
  const t = raw.trim();
  if (/^\(?\+/.test(t) || /^\+/.test(t)) return 'text-emerald-600 dark:text-emerald-400';
  if (/^\(?-/.test(t) || /^-/.test(t)) return 'text-rose-600 dark:text-rose-400';
  return 'text-gray-900 dark:text-light-100';
};

const decorateText = (text: string, keyPrefix: string): React.ReactNode[] => {
  if (!FIGURE.test(text)) {
    FIGURE.lastIndex = 0;
    return [text];
  }
  FIGURE.lastIndex = 0;

  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = FIGURE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <span
        key={`${keyPrefix}-fig-${i++}`}
        className={`font-mono tabular-nums font-semibold ${colorForFigure(m[0])}`}
      >
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

const decorateChildren = (children: React.ReactNode, keyPrefix: string): React.ReactNode => {
  if (typeof children === 'string') return decorateText(children, keyPrefix);
  if (Array.isArray(children)) {
    return children.map((c, i) =>
      typeof c === 'string' ? (
        <React.Fragment key={`${keyPrefix}-${i}`}>{decorateText(c, `${keyPrefix}-${i}`)}</React.Fragment>
      ) : (
        c
      )
    );
  }
  return children;
};

interface Props {
  text: string;
}

const WelthResponse: React.FC<Props> = ({ text }) => {
  return (
    <div className="welth-prose text-sm leading-relaxed text-gray-900 dark:text-gray-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-5 mb-3 first:mt-0 flex items-center gap-2">
              <span className="block h-3 w-[3px] bg-emerald-500" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                {children}
              </span>
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="mt-5 mb-2 first:mt-0 flex items-center gap-2">
              <span className="block h-2.5 w-[3px] bg-emerald-500/70" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-widest text-gray-800 dark:text-light-200">
                {children}
              </span>
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-4 mb-1.5 first:mt-0 font-semibold text-[13px] text-gray-900 dark:text-white">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className="mt-3 mb-1 first:mt-0 font-semibold text-[12px] text-gray-900 dark:text-white">
              {children}
            </h5>
          ),
          p: ({ children }) => (
            <p className="my-2.5 first:mt-0 last:mb-0 leading-relaxed">
              {decorateChildren(children, 'p')}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-light-500 dark:text-light-400">{children}</em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-emerald-400 underline decoration-emerald-500/40 underline-offset-2 hover:decoration-emerald-500"
            >
              {children}
            </a>
          ),
          code: ({ inline, children, ...props }: any) =>
            inline ? (
              <code className="font-mono text-[12px] px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-50/60 bg-light-bg-secondary dark:bg-dark-200 text-emerald-700 dark:text-emerald-400">
                {children}
              </code>
            ) : (
              <code className="block font-mono text-xs whitespace-pre" {...props}>
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded border border-gray-200 dark:border-dark-50/60 bg-light-bg-secondary dark:bg-dark-200 p-3 font-mono text-xs text-gray-900 dark:text-light-200">
              {children}
            </pre>
          ),
          ul: ({ children }) => <ul className="my-2.5 space-y-1.5 pl-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2.5 space-y-1.5 pl-1 list-decimal list-inside marker:font-mono marker:text-light-400 dark:marker:text-light-500">{children}</ol>,
          li: ({ children, ordered }: any) =>
            ordered ? (
              <li className="leading-relaxed">{decorateChildren(children, 'li')}</li>
            ) : (
              <li className="flex items-start gap-2 leading-relaxed">
                <span
                  className="mt-[7px] h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0"
                  aria-hidden
                />
                <span className="flex-1 min-w-0">{decorateChildren(children, 'li')}</span>
              </li>
            ),
          hr: () => (
            <div className="my-4 flex items-center gap-2" aria-hidden>
              <span className="h-px flex-1 bg-gray-200 dark:bg-dark-50/60" />
              <span className="font-mono text-[10px] tracking-widest text-light-400 dark:text-light-500">
                ◆
              </span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-dark-50/60" />
            </div>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-emerald-500/60 pl-3 text-light-600 dark:text-light-300 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded border border-gray-200 dark:border-dark-50/60">
              <table className="w-full border-collapse font-mono text-[12px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-light-bg-secondary dark:bg-dark-200">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-gray-200 dark:border-dark-50/60 last:border-b-0">
              {children}
            </tr>
          ),
          th: ({ children, style }: any) => (
            <th
              style={style}
              className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-light-500 dark:text-light-400 font-medium"
            >
              {children}
            </th>
          ),
          td: ({ children, style }: any) => (
            <td
              style={style}
              className="px-3 py-2 tabular-nums text-gray-900 dark:text-light-200"
            >
              {decorateChildren(children, 'td')}
            </td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default WelthResponse;
