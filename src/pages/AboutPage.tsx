import React, { useEffect, useRef } from 'react';

const AboutPage: React.FC = () => {
  // Refs for animation elements
  const missionRef = useRef<HTMLDivElement>(null);
  const challengesRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const disclaimerRef = useRef<HTMLDivElement>(null);

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all section refs
    [missionRef, challengesRef, techRef, teamRef, disclaimerRef].forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);
  

  
  return (
    <div className="container mx-auto px-4 py-12 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-3xl blur-3xl -z-10"></div>
        <div className="text-center py-12 px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            About WelthWest
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            Where AI meets financial intelligence to transform the future of investing
          </p>
          
          
        </div>
      </div>
      
      {/* Mission Section */}
      <div 
        ref={missionRef}
        className="max-w-4xl mx-auto mb-16 opacity-0 translate-y-10 transition-all duration-1000"
      >
        <div className="bg-white dark:bg-dark-500 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary-500/10 to-secondary-500/10 rounded-full -ml-12 -mb-12"></div>
          
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="bg-primary-600 text-white p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            Our Mission
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Our AI-Powered Wealth Intelligence Platform combines cutting-edge artificial intelligence with comprehensive market data 
            to provide insights that were previously only available to financial professionals and institutions.
          </p>
        </div>
      </div>

      {/* Trading Challenges We Solve Section */}
      <div 
        ref={challengesRef}
        className="max-w-6xl mx-auto mb-16 opacity-0 translate-y-10 transition-all duration-1000 delay-200"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
            Trading Challenges We Solve
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Common trader problems that our AI intelligence platform addresses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* False Breakouts & Stop-Loss Hunts */}
          <div className="group bg-white dark:bg-dark-500 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-red-500 transition-colors">
                False Breakouts & Stop-Loss Hunts
              </h3>
            </div>
          </div>

          {/* Information Overload & Slow Reaction */}
          <div className="group bg-white dark:bg-dark-500 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-500 transition-colors">
                Information Overload & Slow Reaction
              </h3>
            </div>
          </div>

          {/* Lack of Institutional-Grade Analytics */}
          <div className="group bg-white dark:bg-dark-500 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-green-500 transition-colors">
                Lack of Institutional-Grade Analytics
              </h3>
            </div>
          </div>

          {/* Inconsistent Strategy Performance */}
          <div className="group bg-white dark:bg-dark-500 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-yellow-500 transition-colors">
                Inconsistent Strategy Performance
              </h3>
            </div>
          </div>

          {/* Manual Backtesting Limitations */}
          <div className="group bg-white dark:bg-dark-500 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8 17.926 17.926 0 00-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-indigo-500 transition-colors">
                Manual Backtesting Limitations
              </h3>
            </div>
          </div>

          {/* Hidden Market Manipulation */}
          <div className="group bg-white dark:bg-dark-500 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-pink-500 transition-colors">
                Hidden Market Manipulation
              </h3>
            </div>
          </div>

          {/* Static Risk Management */}
          <div className="group bg-white dark:bg-dark-500 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-cyan-500 transition-colors">
                Static Risk Management
              </h3>
            </div>
          </div>

          {/* Steep Learning Curve */}
          <div className="group bg-white dark:bg-dark-500 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-emerald-500 transition-colors">
                Steep Learning Curve
              </h3>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="flex justify-center mt-12">
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full"></div>
        </div>
      </div>
      
      {/* Technology Section */}
      <div 
        ref={techRef}
        className="max-w-4xl mx-auto mb-16 opacity-0 translate-y-10 transition-all duration-1000 delay-300"
      >
        <div className="bg-white dark:bg-dark-500 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="bg-secondary-600 text-white p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            Our Technology
          </h2>
          <p className="mb-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            WelthWest leverages state-of-the-art machine learning algorithms and natural language processing to analyze market trends, 
            company fundamentals, and news sentiment in real-time.
          </p>
          
          {/* Tech cards with hover effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-dark-500 dark:to-dark-600">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">AI-Powered Analysis</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 pl-12">
                Our algorithms process vast amounts of financial data to identify patterns and trends that humans might miss.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-dark-500 dark:to-dark-600">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Natural Language Interface</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 pl-12">
                Interact with our platform using simple conversational language - no financial jargon required.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-dark-500 dark:to-dark-600">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Real-time Data</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 pl-12">
                Access up-to-the-minute market information and analysis to make timely decisions.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-dark-500 dark:to-dark-600">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Personalized Insights</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 pl-12">
                Receive recommendations and insights tailored to your investment goals and risk tolerance.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Team Section */}
      <div
        ref={teamRef}
        className="max-w-6xl mx-auto mb-16 opacity-0 translate-y-10 transition-all duration-1000 delay-500 relative"
      >
        {/* Section Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Our Team
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600">
            Meet the Builders
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Engineers and innovators crafting the future of AI-driven financial intelligence
          </p>
          <div className="flex justify-center mt-6">
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-full"></div>
          </div>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Kunal Kumar Card */}
          <div className="group relative">
            {/* Animated glow border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all duration-500"></div>

            <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
              {/* Card Header - Gradient Banner */}
              <div className="relative h-32 bg-gradient-to-br from-primary-600 via-blue-600 to-secondary-600 overflow-hidden">
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                {/* Floating decorative elements */}
                <div className="absolute top-4 right-8 w-16 h-16 border border-white/20 rounded-lg rotate-12"></div>
                <div className="absolute bottom-6 right-24 w-8 h-8 border border-white/15 rounded-full"></div>
                <div className="absolute top-8 left-1/2 w-12 h-12 border border-white/10 rounded-lg -rotate-6"></div>
              </div>

              {/* Profile Image - Overlapping banner */}
              <div className="flex justify-center -mt-16 relative z-10">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary-500 to-secondary-500">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-900">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
                        alt="Kunal Kumar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-gray-900 shadow-lg"></div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 pt-4 pb-6">
                {/* Name & Title */}
                <div className="text-center mb-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Kunal Kumar</h3>
                  <div className="inline-flex items-center px-3 py-1 mt-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full text-xs font-semibold">
                    Founder & CEO
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">IIT Tirupati &middot; Fintech | Developer</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400">3+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Years Exp</div>
                  </div>
                  <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">1.2K+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Beta Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-secondary-600 dark:text-secondary-400">94%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  Full-Stack Blockchain Engineer building high-performance web solutions. Expert in Python, MERN stack, and AI/ML. Led development of WelthWest's AI-driven trading platform.
                </p>

                {/* Education */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">B.Tech Chemical Engineering, IIT Tirupati</span>
                  </div>
                  <div className="flex items-center p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Product Development, ICICI Bank</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/30 dark:to-blue-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold border border-primary-200/50 dark:border-primary-700/30">LLMs & RAG</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-secondary-50 to-orange-50 dark:from-secondary-900/30 dark:to-orange-900/30 text-secondary-700 dark:text-secondary-300 rounded-lg text-xs font-semibold border border-secondary-200/50 dark:border-secondary-700/30">MERN Stack</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-semibold border border-green-200/50 dark:border-green-700/30">Python & ML</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200/50 dark:border-blue-700/30">AWS & Docker</span>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <a href="mailto:kunalkumar9457.kk@gmail.com" className="group/icon w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-500 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-110" title="Email">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/icon:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </a>
                  <a href="tel:9458603249" className="group/icon w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-500 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:scale-110" title="Call">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/icon:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/in/kunal-kumar" target="_blank" rel="noopener noreferrer" className="group/icon w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-110" title="LinkedIn">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/icon:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Rudresh Tiwari Card */}
          <div className="group relative">
            {/* Animated glow border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all duration-500"></div>

            <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
              {/* Card Header - Gradient Banner */}
              <div className="relative h-32 bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 overflow-hidden">
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                {/* Floating decorative elements */}
                <div className="absolute top-6 right-12 w-14 h-14 border border-white/20 rounded-full"></div>
                <div className="absolute bottom-4 right-32 w-10 h-10 border border-white/15 rounded-lg rotate-45"></div>
                <div className="absolute top-10 left-1/3 w-8 h-8 border border-white/10 rounded-full"></div>
              </div>

              {/* Profile Image - Overlapping banner */}
              <div className="flex justify-center -mt-16 relative z-10">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-500 to-cyan-500">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-900">
                      <img
                        src="/images/rudreshimage.png"
                        alt="Rudresh Tiwari"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-gray-900 shadow-lg"></div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 pt-4 pb-6">
                {/* Name & Title */}
                <div className="text-center mb-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rudresh Tiwari</h3>
                  <div className="inline-flex items-center px-3 py-1 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-xs font-semibold">
                    Co-Developer
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Full Stack Developer</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">5+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Languages</div>
                  </div>
                  <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">10+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">Full</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Stack</div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  Full Stack Developer skilled in Java, Python, TypeScript, React, and Node.js. Co-developed WelthWest's AI-driven platform including backtesting engines and real-time analytics.
                </p>

                {/* Education */}
                <div className="mb-5">
                  <div className="flex items-center p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">B.Tech Computer Science and Engineering</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold border border-purple-200/50 dark:border-purple-700/30">Java & Python</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200/50 dark:border-indigo-700/30">React & TypeScript</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200/50 dark:border-blue-700/30">Node.js & Flask</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-200/50 dark:border-cyan-700/30">MongoDB & MySQL</span>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <a href="mailto:rudraprataptiwari786@gmail.com" className="group/icon w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-red-500 hover:to-orange-500 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-110" title="Email">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/icon:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </a>
                  <a href="tel:7388551679" className="group/icon w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-500 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:scale-110" title="Call">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/icon:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/in/rudresh-tiwari-99bb57297/" target="_blank" rel="noopener noreferrer" className="group/icon w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-110" title="LinkedIn">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/icon:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://github.com/rudresh-tiwari" target="_blank" rel="noopener noreferrer" className="group/icon w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-900 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25 hover:scale-110" title="GitHub">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/icon:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Disclaimer */}
      <div
        ref={disclaimerRef}
        className="max-w-4xl mx-auto opacity-0 translate-y-10 transition-all duration-1000 delay-700"
      >
        <div className="bg-white dark:bg-dark-500 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="bg-gray-600 text-white p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Disclaimer
          </h2>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              WelthWest is a demonstration project. The information provided is not financial advice.
              Always do your own research before making investment decisions. Past performance is not indicative of future results.
              Investment involves risk, including the possible loss of principal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 