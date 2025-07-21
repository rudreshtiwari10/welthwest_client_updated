import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Force dark mode for login page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      // Don't remove dark mode when leaving - ThemeContext will handle it
    };
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usernameOrEmail || !password) {
      setError('Please enter both username/email and password');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      await login(usernameOrEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 mt-16 pb-16 md:pb-0">
      <div className="max-w-md w-full space-y-8 bg-gray-800 dark:bg-gray-800 p-10 rounded-xl shadow-md text-left">
        <div>
          <h2 className="mt-6 text-left text-3xl font-extrabold text-white">
            Log in to your account
          </h2>
          <p className="mt-2 text-left text-sm text-gray-300">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900 text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="username-email" className="block text-sm font-medium text-gray-300 mb-1">
                Username or Email
              </label>
              <input
                id="username-email"
                name="username-email"
                type="text"
                autoComplete="username email"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Username or Email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-400 hover:text-primary-300">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 