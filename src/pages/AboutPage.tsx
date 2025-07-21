import React, { useEffect, useRef } from 'react';

const AboutPage: React.FC = () => {
  // Refs for animation elements
  const missionRef = useRef<HTMLDivElement>(null);
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
    [missionRef, techRef, teamRef, disclaimerRef].forEach(ref => {
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
          
          {/* Animated dots pattern */}
          <div className="grid grid-cols-5 gap-4 max-w-xs mx-auto mt-8 opacity-70">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className="h-2 w-2 rounded-full bg-primary-500 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
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
          <p className="mb-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            At WelthWest, we're on a mission to democratize financial intelligence. We believe that everyone should have access to 
            powerful tools that can help them make informed investment decisions, regardless of their experience level or background.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Our AI-Powered Wealth Intelligence Platform combines cutting-edge artificial intelligence with comprehensive market data 
            to provide insights that were previously only available to financial professionals and institutions.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Market Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">10TB+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Data Processed Daily</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">50K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
          </div>
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
          
          {/* Technology visualization */}
          <div className="mt-12 p-6 bg-gray-50 dark:bg-dark-600 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Our AI Technology Stack</h3>
            <div className="relative h-16">
              {/* Animated tech flow diagram */}
              <div className="absolute inset-0 flex items-center">
                <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center z-10">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center z-10">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center z-10">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center z-10">
                  <span className="text-xs font-bold">4</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center mt-2 text-xs text-gray-600 dark:text-gray-400">
              <div>Data Collection</div>
              <div>ML Processing</div>
              <div>Analysis</div>
              <div>Insights</div>
            </div>
            
            {/* Animated dot */}
            <div className="relative h-1 mt-4">
              <div className="absolute top-0 left-0 w-3 h-3 bg-secondary-500 rounded-full animate-tech-flow"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Section */}
      <div 
        ref={teamRef}
        className="max-w-4xl mx-auto mb-16 opacity-0 translate-y-10 transition-all duration-1000 delay-500"
      >
        <div className="bg-white dark:bg-dark-500 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="bg-purple-600 text-white p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            Our Team
          </h2>
          <p className="mb-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            WelthWest was founded by a team of financial experts, data scientists, and software engineers who share a passion for 
            making financial markets more accessible and understandable.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Our diverse team brings together expertise from leading financial institutions, technology companies, and research 
            universities to build a platform that's both powerful and user-friendly.
          </p>
          
          {/* Team expertise */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50 dark:bg-dark-600">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Finance</span>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50 dark:bg-dark-600">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">AI & ML</span>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50 dark:bg-dark-600">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Engineering</span>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-gray-50 dark:bg-dark-600">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Innovation</span>
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
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-dark-600">
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