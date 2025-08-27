// WelthChatbot Configuration
// This file controls feature flags and settings for the chatbot

export const CHATBOT_CONFIG = {
  // First message fix feature
  ENABLE_FIRST_MESSAGE_FIX: true,
  
  // New chat history system
  ENABLE_NEW_CHAT_HISTORY: true,
  
  // Chat history system selection
  USE_NEW_CHAT_HISTORY: true, // Set to false to use old system
  
  // A/B Testing and Monitoring
  ENABLE_AB_TESTING: true,
  ENABLE_MONITORING: true,
  ENABLE_PERFORMANCE_TRACKING: true,
  
  // Auto-selection logic
  ENABLE_AUTO_SYSTEM_SELECTION: true,
  
  // Debug mode (only in development)
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  
  // API endpoints
  API_ENDPOINTS: {
    ANONYMOUS_CHAT: '/api/chat',
    MARKET_CHAT: '/api/market/chat',
    SAVE_CHAT: '/api/user/save-chat',
    CHAT_HISTORY: '/api/user/chat-history'
  },
  
  // Session limits
  SESSION_LIMITS: {
    ANONYMOUS_MESSAGES: 5,
    ANONYMOUS_BACKTESTS: 3,
    ANONYMOUS_AI_ANALYSES: 2
  },
  
  // Feature toggles
  FEATURES: {
    FILE_UPLOAD: true,
    TECHNICAL_ANALYSIS: true,
    STOCK_CHARTS: true,
    QUICK_ACTIONS: true
  }
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: string): boolean => {
  return CHATBOT_CONFIG[feature as keyof typeof CHATBOT_CONFIG] === true;
};

// Helper function to get configuration value
export const getConfig = (key: string): any => {
  return CHATBOT_CONFIG[key as keyof typeof CHATBOT_CONFIG];
};
