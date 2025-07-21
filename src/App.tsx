import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import MarketsPage from './pages/MarketsPage';
import BacktestingPage from './pages/BacktestingPage';
import WelthAIPage from './pages/WelthAIPage';
import PricingPage from './pages/Pricing';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import MobileFooterNav from './components/MobileFooterNav';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Router>
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
                  <Route path="/markets" element={<PrivateRoute><MarketsPage /></PrivateRoute>} />
                  <Route path="/backtesting" element={<PrivateRoute><BacktestingPage /></PrivateRoute>} />
                  <Route path="/welthai" element={<PrivateRoute><WelthAIPage /></PrivateRoute>} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                </Routes>
              </main>

              {/* Mobile Navigation */}
              <MobileFooterNav />
            </div>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App; 