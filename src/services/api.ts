import axios from 'axios';

// Use environment variable with fallback to Render URL
export const API_URL = process.env.REACT_APP_API_URL || 'https://stock-market-api.onrender.com/api';
export const WS_URL = process.env.REACT_APP_WS_URL || 'wss://stock-market-api.onrender.com/api/ws';

// Utility function to add delay for clock synchronization issues
const addClockSyncDelay = (ms: number = 2000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Utility function to decode JWT and check expiration
const isTokenExpiring = (token: string, bufferMinutes: number = 5): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = bufferMinutes * 60 * 1000; // Convert minutes to milliseconds
    
    return (expirationTime - currentTime) <= bufferTime;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return true; // If we can't decode it, assume it's expiring
  }
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and handle proactive refresh
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    // Check if token is expiring and refresh it proactively
    if (token && refreshToken && isTokenExpiring(token)) {
      console.log('Token is expiring, refreshing proactively...');
      try {
        const refreshApi = axios.create({
          baseURL: API_URL,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const response = await refreshApi.post('/auth/refresh', {
          refresh_token: refreshToken
        });

        if (response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }
          token = response.data.access_token;
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        // Don't fail the request, let the response interceptor handle it
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is related to token timing issues
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
      
      // Handle specific JWT timing error and other token-related errors
      if (errorMessage.includes('Token used too early') || 
          errorMessage.includes('Invalid token') ||
          errorMessage.includes('token is invalid') ||
          errorMessage.includes('JWT') ||
          errorMessage.includes('expired')) {
        console.warn('JWT timing/validation issue detected:', errorMessage);
        
        // For "Token used too early" errors, add a longer delay to handle server clock differences
        if (errorMessage.includes('Token used too early')) {
          console.log('Detected "Token used too early" error, adding 3-second delay for clock sync...');
          await addClockSyncDelay(3000); // 3 seconds for clock sync issues
        } else {
          // Add a standard delay for other JWT issues
          await addClockSyncDelay(1000);
        }
        
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            // Use a new axios instance to avoid interceptor loops
            const refreshApi = axios.create({
              baseURL: API_URL,
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const response = await refreshApi.post('/auth/refresh', {
              refresh_token: refreshToken
            });
            
            if (response.data.access_token) {
              // Store new tokens
              localStorage.setItem('access_token', response.data.access_token);
              if (response.data.refresh_token) {
                localStorage.setItem('refresh_token', response.data.refresh_token);
              }
              
              // Update authorization header for the original request
              originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
              
              // Retry the original request
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear invalid tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            // Don't redirect if we're already on login page
            if (!window.location.pathname.includes('/login')) {
              console.log('Redirecting to login due to token refresh failure');
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token available, clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // Don't redirect if we're already on login page
          if (!window.location.pathname.includes('/login')) {
            console.log('No refresh token available, redirecting to login');
            window.location.href = '/login';
          }
        }
      }
    }

    // Handle other authentication errors
    if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
    }

    // Log the error for debugging
    if (error.response?.status === 401) {
      console.error('Authentication error details:', {
        status: error.response.status,
        message: error.response?.data?.message || error.response?.data?.error,
        url: originalRequest?.url,
        method: originalRequest?.method
      });
    }
    
    return Promise.reject(error);
  }
);

// Authentication service
export const authService = {
  // Send registration OTP
  sendRegistrationOTP: async (email: string) => {
    try {
      const response = await api.post('/auth/send-registration-otp', { email });
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },
  
  // Verify registration OTP and complete registration
  verifyRegistrationOTP: async (email: string, otp: string, username: string, password: string, confirmPassword: string) => {
    try {
      const response = await api.post('/auth/verify-registration-otp', {
        email,
        otp,
        username,
        password,
        confirm_password: confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  },
  
  // Legacy registration method (deprecated)
  register: async (email: string, username: string, password: string, confirmPassword: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        username,
        password,
        confirm_password: confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (usernameOrEmail: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        username_or_email: usernameOrEmail,
        password
      });
      
      // Store tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens anyway
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  googleLogin: async (token: string) => {
    try {
      const response = await api.post('/auth/google', { token });
      
      // Store tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Refresh access token using refresh token
  refreshToken: async (refreshToken: string) => {
    try {
      // Use a new axios instance to avoid interceptor loops
      const refreshApi = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await refreshApi.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      // Store new tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },

  // Password Reset Functions
  forgotPassword: async (usernameOrEmail: string) => {
    try {
      const response = await api.post('/auth/forgot-password', {
        username_or_email: usernameOrEmail
      });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  verifyResetOTP: async (usernameOrEmail: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', {
        username_or_email: usernameOrEmail,
        otp
      });
      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },

  resetPassword: async (userId: string, newPassword: string, otp: string) => {
    try {
      const response = await api.post('/auth/reset-password', {
        user_id: userId,
        new_password: newPassword,
        otp
      });
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};

// Market data service
export const marketService = {
  // Get stock info with historical data
  getStockInfo: async (symbol: string, period: string = '1y', interval: string = '1d') => {
    try {
      const response = await api.get(`/historical?ticker=${symbol}&period=${period}&interval=${interval}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock info for ${symbol}:`, error);
      throw error;
    }
  },
  
  // Get stock quote (live data)
  getStockQuote: async (symbol: string) => {
    try {
      const response = await api.get(`/live?tickers=${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      throw error;
    }
  },
  
  // Search stocks - Note: This endpoint is not implemented in the backend yet
  searchStocks: async (query: string, limit?: number) => {
    try {
      // This is a placeholder - we'll need to implement this endpoint in the backend
      console.warn('searchStocks endpoint not implemented in backend yet');
      const params = limit ? `?limit=${limit}` : '';
      const response = await api.get(`/market/stocks/search/${query}${params}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching for stocks with query ${query}:`, error);
      throw error;
    }
  },
  
  // Get market indices
  getMarketIndices: async () => {
    try {
      const response = await api.get('/market-indices');
      return response.data;
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw error;
    }
  },
  
  // Compare multiple stocks
  compareStocks: async (symbols: string[], period: string = '1y', interval: string = '1d') => {
    try {
      const symbolsStr = symbols.join(',');
      const response = await api.get(`/compare?tickers=${symbolsStr}&period=${period}&interval=${interval}`);
      return response.data;
    } catch (error) {
      console.error('Error comparing stocks:', error);
      throw error;
    }
  },
  
  // Get stock statistics
  getStockStatistics: async (symbol: string, period: string = '1y', interval: string = '1d') => {
    try {
      const response = await api.get(`/statistics?ticker=${symbol}&period=${period}&interval=${interval}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching statistics for ${symbol}:`, error);
      throw error;
    }
  },

  // Get technical analysis
  getTechnicalAnalysis: async (symbol: string, params?: any) => {
    try {
      let url = `/technical-analysis?ticker=${symbol}`;
      if (params) {
        // Add indicator parameters to URL
        const paramString = Object.entries(params)
          .map(([key, value]) => `&${key}=${value}`)
          .join('');
        url += paramString;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching technical analysis for ${symbol}:`, error);
      throw error;
    }
  },
  
  // Validate ticker symbol
  validateTicker: async (symbol: string) => {
    try {
      const response = await api.get(`/validate?ticker=${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error validating ticker ${symbol}:`, error);
      throw error;
    }
  },
  
  // Get OHLC data for specific date range
  getOHLCData: async (symbol: string, startDate?: string, endDate?: string, interval: string = '1d') => {
    try {
      let url = `/ohlc?ticker=${symbol}&interval=${interval}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching OHLC data for ${symbol}:`, error);
      throw error;
    }
  },
  
  // AI chat function for authenticated users
  chatWithAI: async (query: string, model?: string, userId?: string) => {
    try {
      const response = await api.post('/market/chat', {
        query,
        model: model || 'openrouter', // Default to OpenRouter if no model specified
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error with AI chat:', error);
      throw error;
    }
  },

  // Anonymous backtesting with session limits
  anonymousBacktest: async (params: any, sessionId?: string) => {
    try {
      const response = await api.post('/backtest/anonymous', {
        ...params,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error with anonymous backtest:', error);
      throw error;
    }
  },

  // Anonymous AI analysis with session limits
  anonymousAIAnalysis: async (config: { ticker: string; period?: string }, sessionId?: string) => {
    try {
      const response = await api.post('/ai-analysis/anonymous', {
        ...config,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error with anonymous AI analysis:', error);
      throw error;
    }
  },

  // Anonymous chat with AI using session limits
  anonymousChatWithAI: async (message: string, sessionId?: string, model?: string) => {
    try {
      const response = await api.post('/chat', {
        message,
        session_id: sessionId,
        model: model || 'openrouter'
      });
      return response.data;
    } catch (error) {
      console.error('Error with anonymous AI chat:', error);
      throw error;
    }
  },
  
  // Get trending stocks (top gainers and losers)
  getTrendingStocks: async (limit?: number) => {
    try {
      const response = await api.get(`/top-gainers-losers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending stocks:', error);
      throw error;
    }
  },
  
  // Get comprehensive fundamental analysis data
  getStockFundamentals: async (symbol: string) => {
    try {
      const response = await api.get(`/stock/fundamentals?ticker=${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching fundamentals for ${symbol}:`, error);
      throw error;
    }
  }
};

// Market Regime AI Analysis Service
export const marketRegimeService = {
  // Get market regime definitions
  getDefinitions: async () => {
    try {
      const response = await api.get('/market-regime/definitions');
      return response.data;
    } catch (error) {
      console.error('Error fetching market regime definitions:', error);
      throw error;
    }
  },

  // Train market regime model (admin only)
  trainModel: async (ticker: string, period: string = '2y', retrain: boolean = false) => {
    try {
      const response = await api.post('/market-regime/train', {
        ticker,
        period,
        retrain
      });
      return response.data;
    } catch (error) {
      console.error('Error training market regime model:', error);
      throw error;
    }
  },

  // Predict market regime for a ticker
  predictRegime: async (ticker: string) => {
    try {
      const response = await api.get(`/market-regime/predict?ticker=${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error predicting market regime:', error);
      throw error;
    }
  },

  // Get comprehensive market regime analysis
  getAnalysis: async (ticker: string) => {
    try {
      const response = await api.get(`/market-regime/analysis?ticker=${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error getting market regime analysis:', error);
      throw error;
    }
  },

  // Get trading recommendations based on market regime
  getRecommendations: async (ticker: string) => {
    try {
      const response = await api.get(`/market-regime/recommendations?ticker=${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error getting market regime recommendations:', error);
      throw error;
    }
  },

  // Get model information
  getModelInfo: async () => {
    try {
      const response = await api.get('/market-regime/model-info');
      return response.data;
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  },

  // Evaluate model performance
  evaluateModel: async (ticker: string, testPeriod: string = '6mo') => {
    try {
      const response = await api.get(`/market-regime/evaluate?ticker=${ticker}&test_period=${testPeriod}`);
      return response.data;
    } catch (error) {
      console.error('Error evaluating model:', error);
      throw error;
    }
  },
  
  getMarketRegimeAnalysis: async ({ ticker, timeframe }: { ticker: string, timeframe?: string }) => {
    try {
      const response = await api.get(`/market-regime/analysis?ticker=${ticker}${timeframe ? `&timeframe=${timeframe}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error getting market regime analysis:', error);
      throw error;
    }
  }
};

// Watchlist service
export const watchlistService = {
  getUserWatchlists: async () => {
    try {
      const response = await api.get('/auth/watchlists');
      return response.data;
    } catch (error) {
      console.error('Error fetching user watchlists:', error);
      throw error;
    }
  },
  
  createWatchlist: async (name: string, description?: string, symbols?: string[]) => {
    try {
      const response = await api.post('/auth/watchlists', {
        name,
        description,
        symbols
      });
      return response.data;
    } catch (error) {
      console.error('Error creating watchlist:', error);
      throw error;
    }
  },
  
  addSymbolToWatchlist: async (watchlistId: string, symbol: string) => {
    try {
      const response = await api.post(`/auth/watchlists/${watchlistId}/symbols`, {
        symbol
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding symbol to watchlist ${watchlistId}:`, error);
      throw error;
    }
  },
  
  removeSymbolFromWatchlist: async (watchlistId: string, symbol: string) => {
    try {
      const response = await api.delete(`/auth/watchlists/${watchlistId}/symbols/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing symbol from watchlist ${watchlistId}:`, error);
      throw error;
    }
  },
  
  deleteWatchlist: async (watchlistId: string) => {
    try {
      const response = await api.delete(`/auth/watchlists/${watchlistId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting watchlist ${watchlistId}:`, error);
      throw error;
    }
  }
};

// WebSocket service for real-time market data
// Real-time market WebSocket service is currently disabled.
// The implementation is intentionally commented out to prevent any WS connections.
// If needed in future, restore the class and instantiate it.
/* sdsadas
export class MarketWebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();
  constructor() { this.connect(); }
  private connect() {}
  public subscribe(symbols: string[]) {}
  public unsubscribe(symbols: string[]) {}
  public addSymbolListener(symbol: string, callback: (data: any) => void) {}
  public removeSymbolListener(symbol: string, callback: (data: any) => void) {}
}
export const marketWebSocketService = new MarketWebSocketService();
*/

// Provide a no-op stub to avoid runtime errors where the service is imported/used.
export const marketWebSocketService = {
  subscribe: (_symbols: string[]) => {},
  unsubscribe: (_symbols: string[]) => {},
  addSymbolListener: (_symbol: string, _callback: (data: any) => void) => {},
  removeSymbolListener: (_symbol: string, _callback: (data: any) => void) => {},
};

// Legacy services for backward compatibility
export const stockService = {
  getStockData: async (symbol: string) => {
    try {
      const response = await marketService.getStockInfo(symbol);
      return { [symbol]: response };
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      throw error;
    }
  },
  
  getMarketSummary: async () => {
    try {
      const indices = await marketService.getMarketIndices();
      return { indices };
    } catch (error) {
      console.error('Error fetching market summary:', error);
      throw error;
    }
  },
  
  getTopStocks: async () => {
    try {
      return await marketService.getTrendingStocks();
    } catch (error) {
      console.error('Error fetching top stocks:', error);
      throw error;
    }
  }
};

// Legacy user service
export const userService = {
  getUserHistory: async () => {
    // Mock implementation
    return { success: true, history: [] };
  },
  
  getFavoriteStocks: async () => {
    try {
      const watchlistsResponse = await watchlistService.getUserWatchlists();
      if (watchlistsResponse.watchlists && watchlistsResponse.watchlists.length > 0) {
        return {
          success: true,
          favorites: watchlistsResponse.watchlists[0].symbols || []
        };
      }
      return { success: true, favorites: [] };
    } catch (error) {
      console.error('Error fetching favorite stocks:', error);
      throw error;
    }
  },
  
  addFavoriteStock: async (userId: string, stockSymbol: string) => {
    try {
      const watchlistsResponse = await watchlistService.getUserWatchlists();
      
      if (watchlistsResponse.watchlists && watchlistsResponse.watchlists.length > 0) {
        const watchlistId = watchlistsResponse.watchlists[0].id;
        await watchlistService.addSymbolToWatchlist(watchlistId, stockSymbol);
      } else {
        await watchlistService.createWatchlist('Favorites', 'My favorite stocks', [stockSymbol]);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error adding favorite stock:', error);
      throw error;
    }
  },

  // Get technical indicators and signals for a stock
  getTechnicalAnalysis: async (ticker: string) => {
    try {
      const response = await api.get(`/technical-analysis?ticker=${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching technical analysis:', error);
      throw error;
    }
  }
};

// User Data Service for saving and retrieving user-specific data
export const userDataService = {
  // Save backtest result
  saveBacktestResult: async (backtest_data: any) => {
    try {
      const response = await api.post('/user/save-backtest', { backtest_data });
      return response.data;
    } catch (error) {
      console.error('Error saving backtest result:', error);
      throw error;
    }
  },
  
  // Save AI analysis result
  saveAIAnalysisResult: async (analysis_data: any) => {
    try {
      const response = await api.post('/user/save-ai-analysis', { analysis_data });
      return response.data;
    } catch (error) {
      console.error('Error saving AI analysis result:', error);
      throw error;
    }
  },
  
  // Save chat history
  saveChatHistory: async (chat_data: any) => {
    try {
      const response = await api.post('/user/save-chat', { chat_data });
      return response.data;
    } catch (error) {
      console.error('Error saving chat history:', error);
      throw error;
    }
  },
  
  // Get user's saved backtest results
  getUserBacktests: async () => {
    try {
      const response = await api.get('/user/backtests');
      return response.data;
    } catch (error) {
      console.error('Error getting user backtests:', error);
      throw error;
    }
  },
  
  // Get user's saved AI analysis results
  getUserAIAnalyses: async () => {
    try {
      const response = await api.get('/user/ai-analyses');
      return response.data;
    } catch (error) {
      console.error('Error getting user AI analyses:', error);
      throw error;
    }
  },
  
  // Get user's saved chat history
  getUserChatHistory: async () => {
    try {
      const response = await api.get('/user/chat-history');
      return response.data;
    } catch (error) {
      console.error('Error getting user chat history:', error);
      throw error;
    }
  }
};

// Payment service for subscription handling
export const paymentService = {
  // Create Razorpay order
  createOrder: async (orderData: {
    plan_tier: string;
    billing_cycle?: string;
    billing_details: {
      full_name: string;
      email: string;
      phone: string;
      role?: string;
      country?: string;
    };
  }) => {
    try {
      const response = await api.post('/payment/create-order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  },

  // Verify payment signature
  verifyPayment: async (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    try {
      console.log('API: Sending payment verification request to:', `${API_URL}/payment/verify`);
      console.log('API: Payment data being sent:', paymentData);
      
      const response = await api.post('/payment/verify', paymentData);
      console.log('API: Payment verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      if (error.response) {
        console.error('API Error Response Status:', error.response.status);
        console.error('API Error Response Data:', error.response.data);
        console.error('API Error Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('API No Response Received:', error.request);
      } else {
        console.error('API Request Setup Error:', error.message);
      }
      throw error;
    }
  },

  // Get invoice (TODO: Implement when backend endpoint is ready)
  getInvoice: async (paymentId: string) => {
    try {
      // TODO: Uncomment when backend endpoint is implemented
      // const response = await api.get(`/payment/invoice/${paymentId}`, {
      //   responseType: 'blob'
      // });
      // return response.data;
      
      // Temporary: Return a promise that resolves to simulate invoice download
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Invoice endpoint not yet implemented on backend'));
        }, 1000);
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payment/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
};

// Subscription service
export const subscriptionService = {
  // Cancel subscription
  cancelSubscription: async (reason?: string) => {
    try {
      const response = await api.post('/user/subscription/cancel', {
        reason: reason || 'User requested cancellation'
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Get cancellation info
  getCancellationInfo: async () => {
    try {
      const response = await api.get('/user/subscription/cancellation-info');
      return response.data;
    } catch (error) {
      console.error('Error getting cancellation info:', error);
      throw error;
    }
  }
};

// Feedback service for dynamic feedback forms
export const feedbackService = {
  // Submit feedback form
  submitFeedback: async (feedbackData: {
    user_info: {
      name: string;
      email: string;
      phone?: string;
    };
    form_type: string;
    responses: Array<{
      question: string;
      answer: string;
      question_type?: string;
      options?: string[];
    }>;
    form_metadata?: any;
  }) => {
    try {
      const response = await api.post('/feedback/submit', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get feedback list (Admin only)
  getFeedbackList: async (params?: {
    form_type?: string;
    user_email?: string;
    limit?: number;
    skip?: number;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.form_type) queryParams.append('form_type', params.form_type);
      if (params?.user_email) queryParams.append('user_email', params.user_email);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.skip) queryParams.append('skip', params.skip.toString());

      const response = await api.get(`/feedback/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error getting feedback list:', error);
      throw error;
    }
  },

  // Get specific feedback by ID (Admin only)
  getFeedbackById: async (submissionId: string) => {
    try {
      const response = await api.get(`/feedback/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting feedback by ID:', error);
      throw error;
    }
  },

  // Get feedback statistics (Admin only)
  getFeedbackStatistics: async (formType?: string) => {
    try {
      const queryParams = formType ? `?form_type=${formType}` : '';
      const response = await api.get(`/feedback/statistics${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error getting feedback statistics:', error);
      throw error;
    }
  }
}; 