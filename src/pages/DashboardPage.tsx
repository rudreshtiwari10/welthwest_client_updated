import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
// import StockChart from '../components/StockChart';
import Sidebar from '../components/Sidebar';
import { userDataService } from '../services/api';
import DashboardBacktests from '../components/DashboardBacktests';
import DashboardAIAnalyses from '../components/DashboardAIAnalyses';

type ActiveView = 'backtests' | 'ai-analyses';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  // Default sidebar to closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024; // lg breakpoint
    }
    return false; // Default to closed during SSR
  });
  // Removed explicit page-level loader
  const [activeView, setActiveView] = useState<ActiveView>('backtests');
  const [savedBacktests, setSavedBacktests] = useState<any[]>([]);
  const [savedAIAnalyses, setSavedAIAnalyses] = useState<any[]>([]);
  const [savedDataLoading, setSavedDataLoading] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch saved data for quick stats
  const fetchSavedData = useCallback(async () => {
    if (!user) return;
    
    try {
      setSavedDataLoading(true);
      
      // Fetch saved backtests and AI analyses for stats
      const [backtestsResponse, analysesResponse] = await Promise.all([
        userDataService.getUserBacktests(),
        userDataService.getUserAIAnalyses()
      ]);
      
      if (backtestsResponse.success && backtestsResponse.backtests) {
        setSavedBacktests(backtestsResponse.backtests);
      }
      
      if (analysesResponse.success && analysesResponse.analyses) {
        setSavedAIAnalyses(analysesResponse.analyses);
      }
    } catch (error) {
    } finally {
      setSavedDataLoading(false);
    }
  }, [user]);
  
  const handleSetActiveView = (view: ActiveView) => {
    setActiveView(view);
    // Refresh saved data when switching to any dashboard view
    if (view === 'backtests' || view === 'ai-analyses') {
      fetchSavedData();
    }
  };

  // Initialize dashboard and refresh stats on load
  useEffect(() => {
    const init = async () => {
      if (!user) return;
      try {
        await fetchSavedData();
      } catch (error) {
      }
    };
    init();
  }, [user, fetchSavedData]);
  
  // Watchlist and screener removed
  
  // Search removed
  
  // Watchlist add removed
  
  // Watchlist create removed

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'backtests':
        return <DashboardBacktests />;
      case 'ai-analyses':
        return <DashboardAIAnalyses />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        closeSidebar={closeSidebar}
      />
      
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-80 ml-0' : 'ml-0'}`}>
        <div className="container mx-auto px-4 py-4 md:py-8 text-gray-800 dark:text-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">Dashboard</h1>
          
          {/* Quick Access Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 md:mb-8">
            <button 
              className={`text-left p-4 md:p-3 rounded-md border transition-all duration-200 ${
                activeView === 'backtests' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 shadow-md' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
              onClick={() => handleSetActiveView('backtests')}
            >
              <div className="font-medium text-base md:text-sm text-gray-900 dark:text-white">Backtest</div>
              <div className="text-sm md:text-xs text-gray-500 dark:text-gray-400">View saved strategies</div>
            </button>
            <button 
              className={`text-left p-4 md:p-3 rounded-md border transition-all duration-200 ${
                activeView === 'ai-analyses' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 shadow-md' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
              onClick={() => handleSetActiveView('ai-analyses')}
            >
              <div className="font-medium text-base md:text-sm text-gray-900 dark:text-white">AI Analysis</div>
              <div className="text-sm md:text-xs text-gray-500 dark:text-gray-400">View saved insights</div>
            </button>
          </div>

          {/* Main Content Area */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;