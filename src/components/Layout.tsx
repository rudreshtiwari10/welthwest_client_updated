import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MobileFooterNav from './MobileFooterNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-background-primary text-slate-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      {/* Main Container with Sidebar */}
      <div className="relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />

        {/* Main Content Area */}
        <main
          className={`min-h-screen pt-16 pb-16 md:pb-4 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-80' : 'md:ml-0'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Navigation */}
      <MobileFooterNav />
    </div>
  );
};

export default Layout;
