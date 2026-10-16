import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const pad = (i: number) => String(i + 1).padStart(2, '0');

// Shared class fragments — editorial grid look, WelthWest palette
const RULE = 'border-gray-900/15 dark:border-white/10';
const STRONG = 'border-gray-900 dark:border-gray-600';
const LABEL = 'text-xs font-bold tracking-[0.12em] uppercase';

type Accent = 'primary' | 'secondary';

const accentText: Record<Accent, string> = {
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-secondary-600 dark:text-secondary-400',
};
const accentBg: Record<Accent, string> = {
  primary: 'bg-primary-600 dark:bg-primary-500',
  secondary: 'bg-secondary-600 dark:bg-secondary-500',
};
const accentHover: Record<Accent, string> = {
  primary: 'hover:bg-primary-600 dark:hover:bg-primary-500',
  secondary: 'hover:bg-secondary-600 dark:hover:bg-secondary-500',
};
const accentRing: Record<Accent, string> = {
  primary: 'from-primary-500 to-secondary-500',
  secondary: 'from-secondary-500 to-primary-500',
};

interface Member {
  id: string;
  no: string;
  name: [string, string];
  role: string;
  tagline: string;
  status: string;
  photo: string; // base name in /public/images
  photoFallback: string;
  accent: Accent;
  stats: { v: string; k: string }[];
  bio: string;
  facts: { k: string; v: string }[];
  skills: string[];
  links: { label: string; href: string; external?: boolean }[];
  track?: boolean;
}

const TEAM: Member[] = [
  {
    id: 'kunal',
    no: '01',
    name: ['Kunal', 'Kumar'],
    role: 'Founder & CEO',
    tagline: 'IIT Tirupati · Fintech | Developer',
    status: 'Building now',
    photo: 'kunalimage-md',
    photoFallback: '/images/kunalimage.jpeg',
    accent: 'primary',
    stats: [
      { v: '3+', k: 'Years Exp' },
      { v: '1.2K+', k: 'Beta Users' },
      { v: '94%', k: 'Satisfaction' },
    ],
    bio: "Full-Stack Blockchain Engineer building high-performance web solutions. Expert in Python, MERN stack, and AI/ML. Led development of WelthWest's AI-driven trading platform.",
    facts: [
      { k: 'Education', v: 'B.Tech Chemical Engineering, IIT Tirupati' },
      { k: 'Experience', v: 'Product Development, ICICI Bank' },
    ],
    skills: ['LLMs & RAG', 'MERN Stack', 'Python & ML', 'AWS & Docker'],
    links: [
      { label: 'Email', href: 'mailto:kunalkumar9457.kk@gmail.com' },
      { label: 'Phone', href: 'tel:9458603249' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kunal-kumar-25418119a/', external: true },
    ],
  },
  {
    id: 'rudresh',
    no: '02',
    name: ['Rudresh', 'Tiwari'],
    role: 'Co-Developer',
    tagline: 'Full Stack Developer',
    status: 'Shipping now',
    photo: 'rudreshimage-md',
    photoFallback: '/images/rudreshimage.png',
    accent: 'secondary',
    stats: [
      { v: '5+', k: 'Languages' },
      { v: '10+', k: 'Projects' },
      { v: 'Full', k: 'Stack' },
    ],
    bio: "Full Stack Developer skilled in Java, Python, TypeScript, React, and Node.js. Co-developed WelthWest's AI-driven platform including backtesting engines and real-time analytics.",
    facts: [{ k: 'Education', v: 'B.Tech Computer Science and Engineering' }],
    skills: ['Java & Python', 'React & TypeScript', 'Node.js & Flask', 'MongoDB & MySQL'],
    links: [
      { label: 'Email', href: 'mailto:rudraprataptiwari786@gmail.com' },
      { label: 'Phone', href: 'tel:7388551679' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rudresh-tiwari-99bb57297/', external: true },
      { label: 'GitHub', href: 'https://github.com/rudresh-tiwari', external: true },
    ],
    track: true,
  },
];

const TICKER: [string, string][] = [
  ['KUNAL KUMAR', 'FOUNDER & CEO'],
  ['RUDRESH TIWARI', 'CO-DEVELOPER'],
  ['BETA USERS', '1.2K+'],
  ['SATISFACTION', '94%'],
  ['PROJECTS', '10+'],
  ['LLMS & RAG', '▲'],
  ['MERN STACK', '▲'],
  ['PYTHON & ML', '▲'],
  ['AWS & DOCKER', '▲'],
  ['REACT & TYPESCRIPT', '▲'],
  ['NODE.JS & FLASK', '▲'],
  ['MONGODB & MYSQL', '▲'],
];

const CHALLENGES = [
  'False Breakouts & Stop-Loss Hunts',
  'Information Overload & Slow Reaction',
  'Lack of Institutional-Grade Analytics',
  'Inconsistent Strategy Performance',
  'Manual Backtesting Limitations',
  'Hidden Market Manipulation',
  'Static Risk Management',
  'Steep Learning Curve',
];

const BSG_POINTS = [
  'AI market regime signals for project cost planning',
  'Financial analytics for equipment procurement cycles',
  'Macro anomaly alerts for raw-material pricing',
];

const TECH = [
  {
    t: 'AI-Powered Analysis',
    d: 'Our algorithms process vast amounts of financial data to identify patterns and trends that humans might miss.',
  },
  {
    t: 'Natural Language Interface',
    d: 'Interact with our platform using simple conversational language - no financial jargon required.',
  },
  {
    t: 'Real-time Data',
    d: 'Access up-to-the-minute market information and analysis to make timely decisions.',
  },
  {
    t: 'Personalized Insights',
    d: 'Receive recommendations and insights tailored to your investment goals and risk tolerance.',
  },
];

const Pill: React.FC<{ solid?: Accent; children: React.ReactNode }> = ({ solid, children }) => (
  <span
    className={`${LABEL} px-2.5 py-1.5 ${
      solid ? `${accentBg[solid]} text-white` : `border-2 ${STRONG} py-1`
    }`}
  >
    {children}
  </span>
);

const SectionHead: React.FC<{ title: string; sub: string; invert?: boolean }> = ({ title, sub, invert }) => (
  <div
    className={`grid gap-6 md:grid-cols-2 items-end pb-7 border-b-2 ${
      invert ? 'border-white/30' : STRONG
    }`}
  >
    <h2 className="m-0 font-black text-4xl md:text-6xl leading-[0.95] tracking-tight">{title}</h2>
    <p className={`m-0 text-base md:text-lg max-w-md ${invert ? 'text-white/75' : 'text-gray-600 dark:text-gray-400'}`}>
      {sub}
    </p>
  </div>
);

const Portrait: React.FC<{ m: Member }> = ({ m }) => (
  <div
    className={`relative h-full flex flex-col items-center justify-center gap-5 px-6 py-12 bg-gray-50 dark:bg-dark-300 ${RULE}`}
  >
    <div
      className={`absolute top-0 ${m.accent === 'primary' ? 'left-0' : 'right-0'} ${
        accentBg[m.accent]
      } text-white font-black text-3xl leading-none px-3.5 py-2.5 tracking-tight`}
    >
      {m.no}
    </div>

    <div className={`rounded-full p-1 bg-gradient-to-br ${accentRing[m.accent]}`}>
      <picture>
        <source type="image/avif" srcSet={`/images/${m.photo}.avif`} />
        <source type="image/webp" srcSet={`/images/${m.photo}.webp`} />
        <img
          src={m.photoFallback}
          alt={m.name.join(' ')}
          loading="lazy"
          className="block w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-white dark:border-dark-300"
        />
      </picture>
    </div>

    <div className="text-center">
      <div className="font-black text-xl tracking-tight text-gray-900 dark:text-white">{m.name.join(' ')}</div>
      <div className={`${LABEL} mt-1 ${accentText[m.accent]}`}>{m.role}</div>
    </div>

    <div className={`inline-flex items-center gap-2 border-2 ${STRONG} bg-white dark:bg-dark-500 px-3 py-2 ${LABEL}`}>
      <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
      {m.status}
    </div>
  </div>
);

const MemberDetails: React.FC<{ m: Member }> = ({ m }) => (
  <div className="flex flex-col min-w-0">
    <div className={`px-6 md:px-7 pt-7 pb-6 border-b-2 ${STRONG}`}>
      <div className="flex flex-wrap gap-2 mb-4">
        <Pill solid={m.accent}>{m.role}</Pill>
        <Pill>{m.tagline}</Pill>
      </div>
      <h3 className="m-0 font-black text-5xl md:text-7xl leading-[0.9] tracking-tighter text-gray-900 dark:text-white">
        {m.name[0]}
        <br />
        {m.name[1]}
        <span className={accentText[m.accent]}>.</span>
      </h3>
    </div>

    {m.track && (
      <div className={`px-6 md:px-7 py-5 border-b-2 ${STRONG} bg-secondary-50 dark:bg-secondary-950/30`}>
        <div className={`${LABEL} mb-3 ${accentText[m.accent]}`}>Career track at WelthWest</div>
        <div className="grid grid-cols-[auto_minmax(32px,1fr)_auto] items-center gap-3 font-bold text-sm md:text-base">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 border-2 ${STRONG}`} />
            Intern
          </div>
          <div className="relative h-0.5 bg-gray-900 dark:bg-gray-400">
            <span className="absolute -right-0.5 -top-[5px] border-l-8 border-y-[6px] border-y-transparent border-l-gray-900 dark:border-l-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 ${accentBg[m.accent]}`} />
            Key role · Co-Developer
          </div>
        </div>
      </div>
    )}

    <div className={`grid grid-cols-3 border-b-2 ${STRONG}`}>
      {m.stats.map((s, i) => (
        <div key={s.k} className={`px-5 py-5 ${i < 2 ? `border-r-2 ${RULE}` : ''}`}>
          <div className="font-black text-3xl md:text-4xl tracking-tight leading-none text-gray-900 dark:text-white">
            {s.v}
          </div>
          <div className={`${LABEL} mt-1.5 font-semibold text-gray-500 dark:text-gray-400`}>{s.k}</div>
        </div>
      ))}
    </div>

    <p className={`m-0 px-6 md:px-7 py-6 text-base md:text-lg leading-relaxed border-b-2 ${STRONG} text-gray-700 dark:text-gray-300`}>
      {m.bio}
    </p>

    <div className={`grid grid-cols-[max-content_minmax(0,1fr)] border-b-2 ${STRONG}`}>
      {m.facts.map((f, i) => (
        <React.Fragment key={f.k}>
          <div
            className={`${LABEL} pl-6 md:pl-7 pr-5 py-3.5 text-gray-500 dark:text-gray-400 border-r-2 ${RULE} ${
              i < m.facts.length - 1 ? `border-b-2` : ''
            }`}
          >
            {f.k}
          </div>
          <div
            className={`px-5 py-3.5 text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 ${RULE} ${
              i < m.facts.length - 1 ? 'border-b-2' : ''
            }`}
          >
            {f.v}
          </div>
        </React.Fragment>
      ))}
    </div>

    <div className={`grid grid-cols-1 sm:grid-cols-2 border-b-2 ${STRONG}`}>
      {m.skills.map((s, i) => (
        <div
          key={s}
          className={`group flex justify-between gap-2 px-5 py-4 font-bold text-sm md:text-base border-b-2 sm:odd:border-r-2 ${RULE} last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0 transition-colors ${
            accentHover[m.accent]
          } hover:text-white`}
        >
          <span>{s}</span>
          <span className="text-[11px] opacity-50">{pad(i)}</span>
        </div>
      ))}
    </div>

    <div className="flex flex-wrap mt-auto">
      {m.links.map((l, i) => (
        <a
          key={l.label}
          href={l.href}
          {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={`flex-1 basis-28 flex justify-between px-5 py-4 font-bold text-sm text-gray-900 dark:text-gray-100 no-underline transition-colors hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 ${
            i < m.links.length - 1 ? `border-r-2 ${RULE}` : ''
          }`}
        >
          <span>{l.label}</span>
          <span aria-hidden>↗</span>
        </a>
      ))}
    </div>
  </div>
);

const AboutPage: React.FC = () => {
  usePageMeta({
    title: 'About WelthWest – Team Building AI for Safer Markets',
    description:
      'Learn about WelthWest, the team behind the platform, our mission to democratise AI-powered market intelligence for Indian equity traders and fund managers.',
  });

  const rootRef = useRef<HTMLDivElement>(null);

  // Reveal sections on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    rootRef.current?.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const reveal = 'opacity-0 translate-y-10 transition-all duration-1000';

  const tickerRow = (k: string) =>
    TICKER.map(([a, b], i) => (
      <span key={k + i} className="inline-flex gap-2.5 px-7 border-r-2 border-white/20">
        <span className="font-extrabold">{a}</span>
        <span className="font-extrabold text-primary-400">{b}</span>
      </span>
    ));

  return (
    <div ref={rootRef} className="text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Ticker */}
      <div className="mt-8 md:mt-10 bg-gray-900 dark:bg-dark-300 text-white overflow-hidden border-y-2 border-gray-900 dark:border-gray-700">
        <div className="flex w-max whitespace-nowrap py-3 text-[13px] tracking-[0.08em] animate-marquee motion-reduce:animate-none">
          {tickerRow('a')}
          {tickerRow('b')}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-12 md:pt-20">
          <div className="grid gap-8 md:grid-cols-2 items-end">
            <div>
              <div className={`${LABEL} mb-5 text-primary-600 dark:text-primary-400`}>About WelthWest</div>
              <h1 className="m-0 font-black text-6xl sm:text-7xl lg:text-8xl leading-[0.88] tracking-tighter">
                Meet the
                <br />
                Builders
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">.</span>
              </h1>
            </div>
            <div className="max-w-md pb-2">
              <p className="m-0 mb-3 text-xl font-semibold leading-snug">
                Where AI meets financial intelligence to transform the future of investing
              </p>
              <p className="m-0 text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
                Engineers and innovators crafting the future of AI-driven financial intelligence
              </p>
            </div>
          </div>

          {/* Roster */}
          <div className={`mt-14 border-t-2 ${STRONG}`}>
            {TEAM.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className={`group grid grid-cols-[48px_minmax(0,1fr)_32px] md:grid-cols-[64px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_40px] gap-4 items-center py-5 border-b-2 ${RULE} no-underline text-inherit transition-colors hover:bg-primary-50 dark:hover:bg-primary-950/30`}
              >
                <div className={`font-black text-sm pl-1 ${accentText[m.accent]}`}>{m.no}</div>
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={m.photoFallback}
                    alt=""
                    className="hidden sm:block w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="font-black text-2xl md:text-3xl tracking-tight leading-none truncate">
                    {m.name.join(' ')}
                  </span>
                </div>
                <div className={`${LABEL} hidden md:block`}>{m.role}</div>
                <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">{m.tagline}</div>
                <div className={`font-black text-xl transition-transform group-hover:translate-y-0.5 ${accentText[m.accent]}`}>
                  ↓
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Team members */}
        {TEAM.map((m, idx) => (
          <section
            key={m.id}
            id={m.id}
            data-reveal
            className={`${reveal} scroll-mt-24 ${idx === 0 ? 'pt-14 md:pt-20' : 'pt-10'}`}
          >
            <div
              className={`grid ${
                idx % 2 === 0 ? 'md:grid-cols-[300px_minmax(0,1fr)]' : 'md:grid-cols-[minmax(0,1fr)_300px]'
              } border-2 ${STRONG} bg-white dark:bg-dark-500`}
            >
              {/* Alternate photo side, desktop only; photo always first on mobile */}
              <div
                className={`h-full border-b-2 md:border-b-0 ${STRONG} ${
                  idx % 2 === 0 ? 'md:border-r-2' : 'md:order-2 md:border-l-2'
                }`}
              >
                <Portrait m={m} />
              </div>
              <MemberDetails m={m} />
            </div>
          </section>
        ))}

        {/* Mission */}
        <section data-reveal className={`${reveal} mt-16 md:mt-24`}>
          <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white px-6 md:px-12 py-12 md:py-20">
            <div className="grid gap-8 md:grid-cols-3">
              <div className={LABEL}>Our Mission</div>
              <p className="md:col-span-2 m-0 font-extrabold text-2xl md:text-4xl leading-tight tracking-tight">
                Our AI-Powered Wealth Intelligence Platform combines cutting-edge artificial intelligence with
                comprehensive market data to provide insights that were previously only available to financial
                professionals and institutions.
              </p>
            </div>
          </div>
        </section>

        {/* Challenges */}
        <section data-reveal className={`${reveal} pt-16 md:pt-24`}>
          <SectionHead
            title="Trading Challenges We Solve"
            sub="Common trader problems that our AI intelligence platform addresses"
          />
          <div className={`grid sm:grid-cols-2 lg:grid-cols-4 border-l-2 ${RULE}`}>
            {CHALLENGES.map((c, i) => (
              <div
                key={c}
                className={`group min-h-[170px] p-6 flex flex-col justify-between gap-6 border-b-2 border-r-2 ${RULE} transition-colors hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900`}
              >
                <div className="font-black text-sm text-primary-600 dark:text-primary-400">{pad(i)}</div>
                <div className="font-extrabold text-xl leading-tight">{c}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Partners */}
        <section data-reveal className={`${reveal} pt-16 md:pt-24`}>
          <SectionHead
            title="Our Partners"
            sub="Organisations and platforms we collaborate with to bring smarter financial intelligence to their ecosystems"
          />
          <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className={`p-6 md:p-8 border-b-2 md:border-r-2 ${RULE}`}>
              <div className="flex flex-wrap gap-2 mb-5">
                <Pill solid="primary">Official Partner</Pill>
                <Pill>Construction &amp; Equipment Marketplace</Pill>
              </div>
              <h3 className="m-0 mb-3.5 font-black text-4xl tracking-tight leading-none">BSG INFRA</h3>
              <p className="m-0 mb-5 text-[15px] leading-relaxed max-w-xl text-gray-700 dark:text-gray-300">
                BSG INFRA is a B2B marketplace connecting construction companies, contractors, and equipment suppliers
                across India. WelthWest provides market intelligence and financial analytics to support smarter
                procurement and project-cost decisions on their platform.
              </p>
              <div className={`border-t-2 ${STRONG}`}>
                {BSG_POINTS.map((t, i) => (
                  <div key={t} className={`grid grid-cols-[40px_minmax(0,1fr)] py-3 border-b-2 ${RULE} text-[15px] font-semibold`}>
                    <span className="font-black text-primary-600 dark:text-primary-400">{pad(i)}</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-6 md:p-8 border-b-2 ${RULE} bg-gray-50 dark:bg-dark-300 flex flex-col justify-between gap-7`}>
              <div>
                <div className="font-black text-6xl leading-none text-secondary-600 dark:text-secondary-400">+</div>
                <h3 className="m-0 mt-3 mb-3 font-black text-3xl tracking-tight">Become a Partner</h3>
                <p className="m-0 text-[15px] leading-relaxed max-w-sm text-gray-700 dark:text-gray-300">
                  Integrate WelthWest AI market signals — regime detection, anomaly alerts, and backtesting — into your
                  platform or workflow.
                </p>
              </div>
              <Link
                to="/contact"
                className="flex justify-between items-center max-w-[280px] px-4 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold text-[15px] no-underline transition-colors"
              >
                <span>Get in Touch</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section data-reveal className={`${reveal} mt-16 md:mt-24`}>
          <div className="bg-gray-900 dark:bg-dark-300 text-white px-6 md:px-12 py-12 md:py-20 border-2 border-gray-900 dark:border-gray-700">
            <SectionHead
              invert
              title="Our Technology"
              sub="WelthWest leverages state-of-the-art machine learning algorithms and natural language processing to analyze market trends, company fundamentals, and news sentiment in real-time."
            />
            <div className="grid md:grid-cols-2 md:gap-x-12">
              {TECH.map((t, i) => (
                <div key={t.t} className="pt-7 pb-8 border-b-2 border-white/15">
                  <div className="font-black text-sm text-primary-400 mb-6">{pad(i)}</div>
                  <h3 className="m-0 mb-2.5 font-extrabold text-2xl tracking-tight">{t.t}</h3>
                  <p className="m-0 text-[15px] leading-relaxed text-white/75 max-w-md">{t.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section data-reveal className={`${reveal} py-16 md:py-24`}>
          <div className={`grid md:grid-cols-[200px_minmax(0,1fr)] border-t-2 ${STRONG} pt-6 gap-4`}>
            <div className={`${LABEL} text-gray-500 dark:text-gray-400`}>Disclaimer</div>
            <p className="m-0 text-[15px] leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl">
              WelthWest is a demonstration project. The information provided is not financial advice. Always do your
              own research before making investment decisions. Past performance is not indicative of future results.
              Investment involves risk, including the possible loss of principal.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
