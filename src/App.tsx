import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import BacktestIndiaPage from './pages/BacktestIndiaPage';
import PricingLaunchingSoon from './pages/PricingLaunchingSoon';
import Premium from './pages/Premium';
import PaymentSuccess from './pages/PaymentSuccess';
import StockPage from './pages/StockPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import FeedbackPage from './pages/FeedbackPage';
import NewsAndBlogsPage from './pages/NewsAndBlogsPage';
import BlogRedirect from './components/BlogRedirect';
import BlogEditorPage from './pages/BlogEditorPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminContentPage from './pages/AdminContentPage';
import AdminSupportTicketsPage from './pages/AdminSupportTicketsPage';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';
import AdminCreateTicketPage from './pages/AdminCreateTicketPage';
import AIScreenerPage from './pages/AIScreenerPage';
// New SEO/E-E-A-T pages (MD §1–§7)
import ContactPage from './pages/ContactPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import TechnicalOverviewPage from './pages/TechnicalOverviewPage';
import SecurityPage from './pages/SecurityPage';
import MarketRegimePage from './pages/product/MarketRegimePage';
import AnomalyDetectorPage from './pages/product/AnomalyDetectorPage';
import BacktestingEnginePage from './pages/product/BacktestingEnginePage';
import ProductsPage from './pages/product/ProductsPage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import MobileFooterNav from './components/MobileFooterNav';
import FloatingChatButton from './components/FloatingChatButton';
import HamburgerButton from './components/HamburgerButton';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useNotificationTracking } from './hooks/useNotificationTracking';
import PrivateRoute from './components/PrivateRoute';
import RouteChangeTracker from './components/RouteChangeTracker';
import NextGenChatPage from './NextGenChatPage';

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
    navigate('/stock');
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
  return <FloatingChatButton />;
};

// Notification Tracker Component - must be inside all providers
const NotificationTracker: React.FC = () => {
  useNotificationTracking();
  return null;
};

// App with Router
const AppWithRouter: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SubscriptionProvider>
            {/* Track user activities for notifications - must be inside all providers */}
            <NotificationTracker />
            <div className="min-h-screen bg-white dark:bg-background-primary text-gray-900 dark:text-white flex flex-col">
              {!isAuthPage && <Header toggleSidebar={toggleSidebar} />}

            {/* Hamburger Button - hidden on profile and auth pages */}
            {!isProfilePage && !isAuthPage && (
              <HamburgerButton isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            )}

            {/* Desktop Sidebar - hidden on profile and auth pages */}
            {!isProfilePage && !isAuthPage && (
              <div className="hidden md:block">
                <Sidebar
                  isOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                  closeSidebar={closeSidebar}
                />
              </div>
            )}
            
            {/* Main Content */}
            <main
              className={`transition-all duration-300 flex-grow ${
                isAuthPage ? '' : 'pt-16 pb-16 md:pb-0'
              } ${
                isSidebarOpen && !isProfilePage && !isAuthPage ? 'md:ml-[35vh]' : 'md:ml-0'
              }`}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* PROTECTED ROUTES */}
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                {/* ADMIN ROUTES - Require admin role */}
                <Route path="/admin" element={<PrivateRoute><AdminDashboardPage /></PrivateRoute>} />
                <Route path="/admin/users" element={<PrivateRoute><AdminUsersPage /></PrivateRoute>} />
                <Route path="/admin/subscriptions" element={<PrivateRoute><AdminSubscriptionsPage /></PrivateRoute>} />
                <Route path="/admin/transactions" element={<PrivateRoute><AdminTransactionsPage /></PrivateRoute>} />
                <Route path="/admin/reports" element={<PrivateRoute><AdminReportsPage /></PrivateRoute>} />
                <Route path="/admin/content" element={<PrivateRoute><AdminContentPage /></PrivateRoute>} />
                <Route path="/admin/support-tickets" element={<PrivateRoute><AdminSupportTicketsPage /></PrivateRoute>} />
                <Route path="/admin/create-ticket" element={<PrivateRoute><AdminCreateTicketPage /></PrivateRoute>} />
                <Route path="/admin/activity-logs" element={<PrivateRoute><AdminActivityLogsPage /></PrivateRoute>} />

                {/* PUBLIC ROUTES */}
                <Route path="/stock" element={<StockPage />} />
                {/* /backtest is the only backtesting route; /backtest-beta, /backtesting-beta,
                    and /backtest-india 301-redirect here (see vercel.json) */}
                <Route path="/backtest" element={<BacktestIndiaPage />} />
                <Route path="/welth-ai-assistant" element={<NextGenChatPage />} />
                <Route path="/ai-screener" element={<AIScreenerPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/news-and-blogs" element={<NewsAndBlogsPage />} />
                <Route path="/blog/:slug" element={<BlogRedirect />} />
                <Route path="/blog-editor" element={<PrivateRoute><BlogEditorPage /></PrivateRoute>} />
                <Route path="/blog-editor/:id" element={<PrivateRoute><BlogEditorPage /></PrivateRoute>} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/pricing" element={<Premium />} />
                <Route path="/pricing-launching-soon" element={<PricingLaunchingSoon />} />

                {/* ── SEO / E-E-A-T pages (MD requirements) ── */}
                {/* /contact replaces the old /contactus route for canonical trust page */}
                <Route path="/contact" element={<ContactPage />} />
                {/* Keep /contactus as an alias so existing footer links still work */}
                <Route path="/contactus" element={<ContactPage />} />
                <Route path="/case-studies" element={<CaseStudiesPage />} />
                <Route path="/technical-overview" element={<TechnicalOverviewPage />} />
                <Route path="/how-it-works" element={<TechnicalOverviewPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/trust" element={<SecurityPage />} />
                {/* Product sub-pages */}
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/market-regime" element={<MarketRegimePage />} />
                <Route path="/product/anomaly-detector" element={<AnomalyDetectorPage />} />
                <Route path="/product/backtesting-engine" element={<BacktestingEnginePage />} />
              </Routes>
              {/* Track route changes for GTM/GA4 */}
              <RouteChangeTracker />
            </main>

            {/* AI Feature Banner */}
            {!isAuthPage && <AIFeatureBanner />}

            {/* Floating Chat Button - Temporarily hidden */}
            {/* <FloatingChatWithLocation /> */}

            {/* Footer - hidden on auth pages */}
            {!isAuthPage && <Footer />}

            {/* Mobile Navigation - hidden on auth pages */}
            {!isAuthPage && <MobileFooterNav />}
          </div>
          </SubscriptionProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <Router>
        <AppWithRouter />
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App; 