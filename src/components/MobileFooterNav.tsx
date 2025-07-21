import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileFooterNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isStockActive = () => location.pathname.startsWith('/stock');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1f2e] border-t border-gray-700 md:hidden z-50">
      <div className="grid grid-cols-5 h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center ${
            isActive('/') ? 'text-primary-400' : 'text-gray-400'
          }`}
        >
          <i className="fas fa-home text-lg mb-1"></i>
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/markets"
          className={`flex flex-col items-center justify-center ${
            isActive('/markets') ? 'text-primary-400' : 'text-gray-400'
          }`}
        >
          <i className="fas fa-chart-line text-lg mb-1"></i>
          <span className="text-xs">Markets</span>
        </Link>

        {/* WelthAI Button - Mobile */}
        <Link
          to="/welthai"
          className="flex flex-col items-center justify-center -mt-6"
        >
          <div className={`rounded-full p-4 bg-primary-600 shadow-lg ${
            isActive('/welthai') ? 'bg-primary-700' : 'bg-primary-600'
          }`}>
            <div className="flex items-center justify-center">
              <i className="fas fa-comment text-white text-xl"></i>
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-400">WelthAI</span>
        </Link>

        <Link
          to="/stock/RELIANCE"
          className={`flex flex-col items-center justify-center ${
            isStockActive() ? 'text-primary-400' : 'text-gray-400'
          }`}
        >
          <i className="fas fa-search-dollar text-lg mb-1"></i>
          <span className="text-xs">Stocks</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center ${
            isActive('/profile') ? 'text-primary-400' : 'text-gray-400'
          }`}
        >
          <i className="fas fa-user text-lg mb-1"></i>
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileFooterNav; 