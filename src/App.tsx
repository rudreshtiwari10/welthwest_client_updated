import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import BacktestingPage from './pages/BacktestingPage';
import WelthAIPage from './pages/WelthAIPage';
import PricingPage from './pages/Pricing';
import StockPage from './pages/StockPage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import MobileFooterNav from './components/MobileFooterNav';
import FloatingChatButton from './components/FloatingChatButton';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import PrivateRoute from './components/PrivateRoute';

// Banner component to highlight AI feature
const AIFeatureBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show banner on stock pages (as the AI feature is already visible there)
  const isStockPage = location.pathname.startsWith('/stock');
  
  // Don't show banner if user has dismissed it
  useEffect(() => {
    const bannerDismissed = localStorage.getItem('aiFeatureBannerDismissed');
    if (bannerDismissed) {
      setIsVisible(false);
    }
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('aiFeatureBannerDismissed', 'true');
  };
  
  const handleTryNow = () => {
    navigate('/stock/RELIANCE');
    handleDismiss();
  };
  
  if (!isVisible || isStockPage) return null;
  
  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 mx-auto max-w-3xl z-40 px-4">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">New: AI-Powered Stock Analysis</h3>
              <p className="text-purple-100 text-xs">
                Get market regime predictions using machine learning
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTryNow}
              className="px-3 py-1 bg-white text-purple-700 rounded-md text-xs font-medium hover:bg-purple-50"
            >
              Try Now
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-white/70 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Chat Button with location awareness
const FloatingChatWithLocation: React.FC = () => {
  const location = useLocation();
  
  // Don't show the floating chat on the WelthAI page
  const isWelthAIPage = location.pathname === '/welthai';
  
  if (isWelthAIPage) return null;
  
  return <FloatingChatButton />;
};

// App with Router
const AppWithRouter: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <div className="min-h-screen bg-[#0d1117] text-white">
            <Header toggleSidebar={toggleSidebar} />
            
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
                closeSidebar={closeSidebar} 
              />
            </div>
            
            {/* Main Content */}
            <main 
              className={`pt-16 pb-16 md:pb-0 transition-all duration-300 ${
                isSidebarOpen ? 'md:ml-[35vh]' : 'md:ml-0'
              }`}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/stock/:symbol" element={<PrivateRoute><StockPage /></PrivateRoute>} />
                <Route path="/backtesting" element={<PrivateRoute><BacktestingPage /></PrivateRoute>} />
                <Route path="/welthai" element={<PrivateRoute><WelthAIPage /></PrivateRoute>} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pricing" element={<PricingPage />} />
              </Routes>
            </main>

            {/* AI Feature Banner */}
            <AIFeatureBanner />
            
            {/* Floating Chat Button */}
            <FloatingChatWithLocation />

            {/* Footer */}
            <Footer />

            {/* Mobile Navigation */}
            <MobileFooterNav />
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
};

export default App; 