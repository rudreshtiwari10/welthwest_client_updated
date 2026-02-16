import React from 'react';
import { Link } from 'react-router-dom';

interface AuthBrandPanelProps {
  variant?: 'login' | 'register';
}

const AuthBrandPanel: React.FC<AuthBrandPanelProps> = ({ variant = 'login' }) => {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between">
      {/* NO opaque background — parent handles the full-width gradient */}

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-500/20 dark:bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-primary-400/15 dark:bg-primary-400/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      {/* Grid pattern overlay - fades out toward right */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
        }}
      />

      {/* Floating geometric shapes */}
      <div className="absolute top-20 right-20 w-3 h-3 bg-primary-500/40 dark:bg-primary-400/40 rounded-full animate-float" />
      <div className="absolute top-40 left-16 w-2 h-2 bg-secondary-400/30 rounded-full animate-float-delayed" />
      <div className="absolute bottom-32 right-32 w-4 h-4 bg-primary-400/20 dark:bg-primary-300/20 rounded-full animate-float-slow" />
      <div className="absolute top-1/2 left-10 w-2.5 h-2.5 bg-primary-500/25 dark:bg-cyan-400/25 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-48 left-24 w-1.5 h-1.5 bg-primary-500/35 dark:bg-primary-400/35 rounded-full animate-float-delayed" />

      {/* Orbiting ring decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px]">
        <div className="absolute inset-0 border border-primary-500/15 dark:border-primary-500/10 rounded-full animate-orbit" style={{ animationDuration: '25s' }}>
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-primary-500/50 dark:bg-primary-400/50 rounded-full" />
        </div>
        <div className="absolute inset-4 border border-secondary-400/10 dark:border-secondary-500/[0.08] rounded-full animate-orbit-reverse" style={{ animationDuration: '20s' }}>
          <div className="absolute -bottom-1 right-1/4 w-1.5 h-1.5 bg-secondary-400/40 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 py-16">
        {/* Logo */}
        <div className="mb-8 animate-float">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl scale-150" />
            <img
              src="/images/singlelogo.png"
              alt="WelthWest Logo"
              className="relative w-24 h-24 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          Welth<span className="text-primary-500 dark:text-primary-400">West</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg text-gray-600 dark:text-gray-300/90 text-center max-w-sm mb-10 leading-relaxed">
          AI-Powered Trading Intelligence for Smarter Market Decisions
        </p>

        {/* Feature highlights */}
        <div className="space-y-4 w-full max-w-xs">
          <FeatureItem
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            }
            title="AI Market Regime"
            description=""
          />
          <FeatureItem
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            }
            title="Advanced Backtesting"
            description=""
          />
          <FeatureItem
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            }
            title="AI Trading Assistant"
            description=""
          />
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          {variant === 'login' ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors">
                Get started free
              </Link>
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 dark:from-black/20 to-transparent z-10" />
    </div>
  );
};

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="flex items-start gap-3 group">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 dark:text-primary-400 group-hover:bg-primary-500/20 group-hover:border-primary-500/30 transition-all duration-300">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400/80 mt-0.5">{description}</p>
    </div>
  </div>
);

export default AuthBrandPanel;
