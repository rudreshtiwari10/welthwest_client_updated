import React from 'react';

const ContactUsPage: React.FC = () => {

  const socialLinks = [
    {
      name: 'YouTube',
      handle: '@WelthWest',
      url: 'https://www.youtube.com/@WelthWest',
      icon: (
        <svg className="h-8 w-8 text-red-600 dark:text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      handle: 'WelthWest',
      url: 'https://www.linkedin.com/company/108673007',
      icon: (
        <svg className="h-8 w-8 text-blue-600 dark:text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      handle: '@welthwest',
      url: 'https://www.instagram.com/welthwest?igsh=aWNpdWVtZmNzMmRn&utm_source=qr',
      icon: (
        <svg className="h-8 w-8 text-pink-600 dark:text-pink-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      handle: '@WelthWest',
      url: 'https://x.com/WelthWest',
      icon: (
        <svg className="h-8 w-8 text-gray-800 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 text-gray-800 dark:text-gray-200 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-3xl blur-3xl -z-10"></div>
        <div className="text-center py-12 px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Get In Touch
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            Connect with us on social media or drop us an email
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

      {/* Social Media Links - Linktree Style */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-white/50 dark:bg-dark-500/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
            Follow Us
          </h2>

          <div className="space-y-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg">
                    {social.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">{social.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">({social.handle})</span>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Email Section */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-white/50 dark:bg-dark-500/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center justify-center">
              <span className="bg-primary-600 dark:bg-primary-500 text-white p-3 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              Email Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Have a question or feedback? We'd love to hear from you!
            </p>
            <a
              href="mailto:contact@welthwest.com"
              className="inline-flex items-center px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              contact@welthwest.com
            </a>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-dark-500/30 dark:to-dark-600/30 backdrop-blur-sm rounded-xl p-6 border border-primary-100 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Business Inquiries</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                For partnerships, media inquiries, or business opportunities, please reach out to us via email.
                We typically respond within 6-10 Hours hours during business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
