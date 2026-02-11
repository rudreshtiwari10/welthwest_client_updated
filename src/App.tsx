import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import BacktestingPage from './pages/BacktestingPage';
import BacktestingBetaPage from './pages/BacktestingBetaPage';
import WelthAIPage from './pages/WelthAIPage';
import AIMarketAnalysisPage from './pages/AIMarketAnalysisPage';
// Legacy pricing pages (commented out - use Premium.tsx instead)
// import PricingPage from './pages/Pricing';
// import PlanDetailsPage from './pages/PlanDetailsPage';
// import ReviewPaymentPage from './pages/ReviewPaymentPage';
// import PaymentConfirmationPage from './pages/PaymentConfirmationPage';
import PricingLaunchingSoon from './pages/PricingLaunchingSoon';
import Premium from './pages/Premium';
import PaymentSuccess from './pages/PaymentSuccess';
import StockPage from './pages/StockPage';
import WelthChatbotPage from './pages/WelthChatbotPage';
import WelthAIChatbotPage from './pages/WelthAIChatbotPage';
import WelthAiChatbotLaunchingSoon from './pages/WelthAiChatbotLaunchingSoon';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import FeedbackPage from './pages/FeedbackPage';
// import ReviewPaymentPage from './pages/ReviewPaymentPage';
// import PaymentConfirmationPage from './pages/PaymentConfirmationPage';

import TechnicalAnalysisPage from './pages/TechnicalAnalysisPage';
import NewsAndBlogsPage from './pages/NewsAndBlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BlogEditorPage from './pages/BlogEditorPage';
import MarketRegimePage from './pages/MarketRegimePage';
import MarketForecastingPage from './pages/MarketForecastingPage';
import MTFScreenerPage from './pages/MTFScreenerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminContentPage from './pages/AdminContentPage';
import AdminSupportTicketsPage from './pages/AdminSupportTicketsPage';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';
import AdminCreateTicketPage from './pages/AdminCreateTicketPage';

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
  const isWelthAIPage = location.pathname === '/welth-market-regime';

  if (isWelthAIPage) return null;

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
              <Header toggleSidebar={toggleSidebar} />
            
            {/* Hamburger Button - hidden on profile page */}
            {!isProfilePage && (
              <HamburgerButton isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            )}

            {/* Desktop Sidebar - hidden on profile page */}
            {!isProfilePage && (
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
              className={`pt-16 pb-16 md:pb-0 transition-all duration-300 flex-grow ${
                isSidebarOpen && !isProfilePage ? 'md:ml-[35vh]' : 'md:ml-0'
              }`}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* PROTECTED ROUTES - Only dashboard and profile require login */}
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
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
                {/* PUBLIC ROUTES WITH ANONYMOUS TRIAL - All feature pages are now public with 10 free runs */}
                <Route path="/stock" element={<StockPage />} />
                <Route path="/stock/:symbol" element={<StockPage />} />
                <Route path="/backtesting" element={<BacktestingPage />} />
                <Route path="/backtesting-beta" element={<BacktestingBetaPage />} />
                {/* Alias for backtest beta as requested */}
                <Route path="/backtest-beta" element={<BacktestingBetaPage />} />
                <Route path="/welthai" element={<WelthAIPage />} />
                <Route path="/welth-ai-assistant" element={<NextGenChatPage />} />
                <Route path="/welth-market-regime" element={<MarketRegimePage />} />
                <Route path="/market-forecasting" element={<MarketForecastingPage />} />
                <Route path="/mtf-screener" element={<MTFScreenerPage />} />
                <Route path="/welthchatbot" element={<WelthChatbotPage />} />
                <Route path="/welth-ai-chatbot" element={<WelthAIChatbotPage />} />
                <Route path="/technical-analysis" element={<TechnicalAnalysisPage />} />
                <Route path="/WelthAiChatBot-lanching-soon" element={<WelthAiChatbotLaunchingSoon />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/news-and-blogs" element={<NewsAndBlogsPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/blog-editor" element={<PrivateRoute><BlogEditorPage /></PrivateRoute>} />
                <Route path="/blog-editor/:id" element={<PrivateRoute><BlogEditorPage /></PrivateRoute>} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                {/* Premium plans page (dynamic from backend) */}
                <Route path="/premium" element={<Premium />} />
                {/* Payment Success (Cashfree redirect) */}
                <Route path="/payment-success" element={<PaymentSuccess />} />
                {/* Legacy pricing routes - redirect to /premium */}
                <Route path="/pricing" element={<Premium />} />
                <Route path="/pricing-launching-soon" element={<PricingLaunchingSoon />} />
                {/* Legacy routes commented out - use new premium flow instead */}
                {/* <Route path="/pricing-old" element={<PricingPage />} /> */}
                {/* <Route path="/plan-details/:tier/:billing" element={<PrivateRoute><PlanDetailsPage /></PrivateRoute>} /> */}
                {/* <Route path="/review-payment" element={<PrivateRoute><ReviewPaymentPage /></PrivateRoute>} /> */}
                {/* <Route path="/payment-confirmation" element={<PrivateRoute><PaymentConfirmationPage /></PrivateRoute>} /> */}
              </Routes>
              {/* Track route changes for GTM/GA4 */}
              <RouteChangeTracker />
            </main>

            {/* AI Feature Banner */}
            <AIFeatureBanner />
            
            {/* Floating Chat Button - Temporarily hidden */}
            {/* <FloatingChatWithLocation /> */}

            {/* Footer */}
            <Footer />

            {/* Mobile Navigation */}
            <MobileFooterNav />
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