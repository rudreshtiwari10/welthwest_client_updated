import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, AcademicCapIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { SERVICES } from '../../config/founderContent';
import { VisualStyles, AlgoTradingVisual, SessionsVisual, AutomationVisual } from './ServiceVisuals';

const ICONS = [ChartBarIcon, AcademicCapIcon, CpuChipIcon];
const VISUALS = [AlgoTradingVisual, SessionsVisual, AutomationVisual];
const SLIDE_SECONDS = 8;

const ServicesSection: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = () => setIndex(i => (i + 1) % SERVICES.length);

  return (
    <section className="mb-12 max-w-6xl mx-auto px-4" aria-labelledby="services-heading">
      <VisualStyles />
      <div className="text-center mb-6">
        <h2 id="services-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          What WelthWest <span className="text-secondary-600 dark:text-secondary-400">Offers</span>
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          From trading algorithms to business automation, built and taught by the founder.
        </p>
      </div>

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Auto-running tab bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4" role="tablist" aria-label="WelthWest services">
          {SERVICES.map((s, i) => (
            <button
              key={s.title}
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className="text-left"
            >
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                {i === index && (
                  <div
                    key={index}
                    className="h-full bg-secondary-600"
                    style={{
                      animation: `ww-progress ${SLIDE_SECONDS}s linear forwards`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                    onAnimationEnd={next}
                  />
                )}
              </div>
              <span
                className={`mt-2 block text-xs sm:text-sm font-semibold ${
                  i === index ? 'text-secondary-600 dark:text-secondary-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {s.title}
              </span>
            </button>
          ))}
        </div>

        {/* Horizontal sliding track */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-200 shadow-sm">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {SERVICES.map((s, i) => {
              const Icon = ICONS[i];
              const Visual = VISUALS[i];
              const active = i === index;
              const cta = (
                <span className="inline-block rounded-full bg-secondary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary-700">
                  {s.cta} →
                </span>
              );
              return (
                <div key={s.title} className="w-full shrink-0 grid md:grid-cols-2 gap-6 p-5 sm:p-8" aria-hidden={!active}>
                  <div className="flex flex-col justify-center">
                    <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-300">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{s.title}</h3>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{s.pitch}</p>
                    <ul className="mt-4 mb-6 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                      {s.bullets.map(b => (
                        <li key={b} className="flex gap-2"><span className="text-green-500">✓</span>{b}</li>
                      ))}
                    </ul>
                    <div>
                      {s.external ? (
                        <a href={s.href} target="_blank" rel="noopener noreferrer" tabIndex={active ? 0 : -1}>{cta}</a>
                      ) : (
                        <Link to={s.href} tabIndex={active ? 0 : -1}>{cta}</Link>
                      )}
                    </div>
                  </div>
                  <div className="h-[22rem] sm:h-[24rem]">{active && <Visual />}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
