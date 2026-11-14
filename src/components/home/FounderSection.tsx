import React, { useEffect, useRef, useState } from 'react';
import LiteYouTube from './LiteYouTube';
import {
  YOUTUBE, JOURNEY, STATS, CREDENTIALS, SOCIALS, FEATURED_WORK, FOUNDER_SITE, FOUNDER_PHOTO,
} from '../../config/founderContent';

const slideCls =
  'snap-start shrink-0 w-[88%] sm:w-[560px] lg:w-[640px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-200 p-5 sm:p-6 shadow-sm';

const CountUp: React.FC<{ to: number; prefix?: string; suffix?: string }> = ({ to, prefix = '', suffix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setN(to); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - start) / 1200, 1);
        setN(Math.round(to * p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
};

const FounderSection: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: (dir === 'left' ? -1 : 1) * Math.min(el.clientWidth * 0.8, 600), behavior: 'smooth' });
  };

  const arrow = 'p-2 w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-400 hover:bg-gray-200 dark:hover:bg-dark-500 text-lg leading-none';

  return (
    <section className="mb-12 max-w-7xl mx-auto px-4" aria-labelledby="founder-heading">
      <div className="flex items-end justify-between mb-5">
        <div className="flex items-center gap-4">
          <img
            src={FOUNDER_PHOTO}
            alt="Kunal Kumar, founder of WelthWest"
            width={72}
            height={72}
            loading="lazy"
            className="h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 rounded-full object-cover ring-2 ring-yellow-400"
          />
          <div>
            <h2 id="founder-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Meet the <span className="text-secondary-600 dark:text-secondary-400">Founder</span>
            </h2>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Kunal Kumar – IIT Tirupati, ex-financial institution, building AI for markets and business.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll('left')} className={arrow} aria-label="Scroll left">‹</button>
          <button onClick={() => scroll('right')} className={arrow} aria-label="Scroll right">›</button>
        </div>
      </div>

      <div
        ref={sliderRef}
        tabIndex={0}
        aria-label="Founder highlights"
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* 1. YouTube */}
        <article className={`${slideCls} lg:w-[760px]`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <a href={YOUTUBE.channelUrl} target="_blank" rel="noopener noreferrer" aria-label="Kunal Builds AI on YouTube">
                <img
                  src={YOUTUBE.logo}
                  alt="Kunal Builds AI logo"
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-yellow-400"
                />
              </a>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">YouTube</p>
                <a href={YOUTUBE.channelUrl} target="_blank" rel="noopener noreferrer"
                   className="text-lg font-semibold text-gray-900 dark:text-white hover:underline">
                  Kunal Builds AI <span className="text-sm font-normal text-gray-500">{YOUTUBE.channelHandle}</span>
                </a>
              </div>
            </div>
            <a href={YOUTUBE.subscribeUrl} target="_blank" rel="noopener noreferrer"
               className="shrink-0 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Subscribe
            </a>
          </div>
          <LiteYouTube videoId={YOUTUBE.featuredVideo.id} title={YOUTUBE.featuredVideo.title} />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Algo trading, AI agents and n8n automation – explained and built live.
          </p>
        </article>

        {/* 2. Journey */}
        <article className={slideCls}>
          <div className="mb-4 flex items-center gap-3">
            <img
              src={FOUNDER_PHOTO}
              alt="Kunal Kumar"
              width={48}
              height={48}
              loading="lazy"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-yellow-400"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Kunal Kumar</p>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Work &amp; Education</p>
            </div>
          </div>
          <ol className="relative border-l-2 border-secondary-300 dark:border-secondary-700 ml-2 space-y-5">
            {JOURNEY.map(j => (
              <li key={j.year} className="pl-5 relative">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-secondary-600 ring-4 ring-white dark:ring-dark-200" />
                <span className="text-xs font-mono text-secondary-600 dark:text-secondary-400">{j.year}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{j.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{j.text}</p>
              </li>
            ))}
          </ol>
        </article>

        {/* 3. Featured work */}
        <article className={slideCls}>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Featured Work</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURED_WORK.map(w => (
              <li key={w.title} className="rounded-xl bg-gray-50 dark:bg-dark-300 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary-600 dark:text-secondary-400">{w.tag}</span>
                <h3 className="mt-1 font-semibold text-gray-900 dark:text-white">{w.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{w.text}</p>
              </li>
            ))}
          </ul>
          <a href={`${FOUNDER_SITE}/projects`} target="_blank" rel="noopener noreferrer"
             className="mt-5 inline-block text-sm font-semibold text-secondary-600 dark:text-secondary-400 hover:underline">
            View all projects →
          </a>
        </article>

        {/* 4. Achievements + Connect (merged, last slide) */}
        <article className={`${slideCls} sm:w-[640px] lg:w-[820px]`}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Achievements</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {STATS.map(s => (
                  <div key={s.label} className="rounded-xl bg-gray-50 dark:bg-dark-300 p-4 text-center">
                    <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                      <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {CREDENTIALS.map(c => (
                  <span key={c} className="rounded-full bg-secondary-100 dark:bg-secondary-900/40 px-3 py-1 text-xs font-medium text-secondary-700 dark:text-secondary-300">{c}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Connect</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Let&apos;s build something together</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SOCIALS.map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                       className="rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-400">
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
              <a href={FOUNDER_SITE} target="_blank" rel="noopener noreferrer"
                 className="mt-6 inline-block rounded-full bg-secondary-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-secondary-700">
                Visit my full site →
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default FounderSection;
