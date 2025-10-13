import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

// Define interfaces
interface User {
  id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  occupation?: string;
  bio?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  completeRegistration: (email: string, username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  getToken: () => Promise<string | null>;
  handleGoogleLogin: (token: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  completeRegistration: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  getToken: async () => null,
  handleGoogleLogin: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData.user);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };
    
    checkLoggedIn();
  }, []);
  
  // Login function
  const login = async (usernameOrEmail: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(usernameOrEmail, password);
      
      if (response.user) {
        setUser(response.user);
      } else {
        throw new Error('Login failed: No user data returned');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function (legacy)
  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      setIsLoading(true);
      await authService.register(email, username, password, confirmPassword);
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete registration with tokens (after email verification)
  const completeRegistration = async (email: string, username: string, password: string, confirmPassword: string) => {
    try {
      setIsLoading(true);
      const response = await authService.completeRegistration(email, username, password, confirmPassword);
      
      // Set user data and tokens automatically
      if (response.user && response.access_token) {
        setUser(response.user);
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      } else {
        throw new Error('Registration failed: No user data or tokens returned');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      // Still clear user state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update profile function
  const updateProfile = async (profileData: any) => {
    try {
      setIsLoading(true);
      const response = await authService.updateProfile(profileData);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get token function
  const getToken = async (): Promise<string | null> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return null;
    }
    // TODO: Add token refresh logic here if needed
    return token;
  };
  
  // Handle Google login
  const handleGoogleLogin = async (token: string) => {
    try {
      setIsLoading(true);
      console.log('Starting Google authentication...');
      
      const response = await authService.googleLogin(token);
      
      if (response.user) {
        console.log('Google authentication successful');
        setUser(response.user);
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      } else {
        throw new Error('Google login failed: No user data returned');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Provide more specific error messages
      if (error.response?.data?.message?.includes('Token used too early')) {
        throw new Error('Authentication timing issue. Please try again in a moment.');
      } else if (error.response?.status === 401) {
        throw new Error('Google authentication failed. Please try signing in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error during authentication. Please try again.');
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        completeRegistration,
        logout,
        updateProfile,
        getToken,
        handleGoogleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 