import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatInterface from '../components/ChatInterface';
import StockChart from '../components/StockChart';
import Sidebar from '../components/Sidebar';
import { marketService, watchlistService } from '../services/api';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch user's watchlists and first stock data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch watchlists
        const watchlistsResponse = await watchlistService.getUserWatchlists();
        if (watchlistsResponse.watchlists) {
          setWatchlists(watchlistsResponse.watchlists);
          
          // Combine all symbols from all watchlists
          const allSymbols = watchlistsResponse.watchlists.reduce(
            (symbols: string[], watchlist: any) => [...symbols, ...(watchlist.symbols || [])],
            [] as string[]
          );
          
          // Remove duplicates
          const uniqueSymbols = Array.from(new Set(allSymbols)) as string[];
          setWatchlistSymbols(uniqueSymbols);
          
          // If user has symbols in watchlists, load the first one
          if (uniqueSymbols.length > 0) {
            const firstSymbol = uniqueSymbols[0];
            setSelectedStock(firstSymbol);
            const stockResponse = await marketService.getStockInfo(firstSymbol);
            setStockData({
              symbol: firstSymbol,
              name: firstSymbol,
              ...stockResponse
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Load stock data when selected stock changes
  const handleStockSelect = async (symbol: string) => {
    try {
      setIsLoading(true);
      setSelectedStock(symbol);
      
      const response = await marketService.getStockInfo(symbol);
      setStockData({
        symbol: symbol,
        name: symbol,
        ...response
      });
    } catch (error) {
      console.error(`Error loading stock data for ${symbol}:`, error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle stock search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      
      // Since searchStocks is not implemented in the backend yet, we'll validate the ticker instead
      const response = await marketService.validateTicker(searchQuery);
      
      if (response.valid) {
        // If valid, create a mock search result
        setSearchResults([{
          symbol: response.ticker,
          name: response.ticker
        }]);
      } else {
        // If not valid, show empty results
        setSearchResults([]);
        alert(`Invalid ticker symbol: ${searchQuery}`);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Add stock to watchlist
  const addToWatchlist = async (symbol: string, watchlistId: string) => {
    try {
      await watchlistService.addSymbolToWatchlist(watchlistId, symbol);
      
      // Update watchlists state
      setWatchlists(prevWatchlists => 
        prevWatchlists.map(watchlist => 
          watchlist.id === watchlistId 
            ? { ...watchlist, symbols: [...watchlist.symbols, symbol] }
            : watchlist
        )
      );
      
      // Update watchlist symbols
      if (!watchlistSymbols.includes(symbol)) {
        setWatchlistSymbols(prev => [...prev, symbol]);
      }
      
      // Clear search
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };
  
  // Create new watchlist
  const createWatchlist = async (name: string, symbol?: string) => {
    try {
      const response = await watchlistService.createWatchlist(
        name, 
        'Created from dashboard', 
        symbol ? [symbol] : []
      );
      
      if (response.watchlist) {
        setWatchlists(prev => [...prev, response.watchlist]);
        
        // Add symbol to watchlist symbols if provided
        if (symbol && !watchlistSymbols.includes(symbol)) {
          setWatchlistSymbols(prev => [...prev, symbol]);
        }
      }
    } catch (error) {
      console.error('Error creating watchlist:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        closeSidebar={closeSidebar}
      />
      
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-[35vh]' : 'ml-0'}`}>
        <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Main content */}
            <div>
              {/* Chat interface */}
              <div className="bg-white dark:bg-dark-500 rounded-lg shadow-md p-6 mb-6 transition-colors" id="ai-assistant">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Chat with AI Assistant</h2>
                <ChatInterface />
              </div>
              
              {/* Stock data section */}
              {selectedStock && stockData ? (
                <div className="bg-white dark:bg-dark-500 rounded-lg shadow-md p-6 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{stockData.name} ({stockData.symbol})</h2>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stockData.data && stockData.data.length > 0 ? 
                        `₹${stockData.data[stockData.data.length - 1].Close?.toFixed(2) || 'N/A'}` : 
                        'N/A'}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <StockChart stockData={{
                      symbol: stockData.symbol,
                      name: stockData.name,
                      data: stockData.data || []
                    }} height={300} />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stockData.data && stockData.data.length > 0 ? (
                      <>
                        <div className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md transition-colors">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Open</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            ₹{stockData.data[stockData.data.length - 1].Open?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md transition-colors">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">High</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            ₹{stockData.data[stockData.data.length - 1].High?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md transition-colors">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Low</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            ₹{stockData.data[stockData.data.length - 1].Low?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md transition-colors">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Volume</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {stockData.data[stockData.data.length - 1].Volume?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md transition-colors">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Open</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">N/A</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md transition-colors">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">High</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">N/A</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md transition-colors">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Low</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">N/A</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md transition-colors">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Volume</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">N/A</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-dark-500 rounded-lg shadow-md p-6 text-center transition-colors">
                  <p className="text-gray-500 dark:text-gray-400">
                    {isLoading
                      ? 'Loading stock data...'
                      : 'Select a stock from your watchlist or search for a stock to view details.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 