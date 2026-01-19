import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import PasswordResetModal from '../components/PasswordResetModal';

const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [searchParams] = useSearchParams();

  const { login, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();

  // Get redirect parameter from URL (from side projects)
  const redirectTarget = searchParams.get('redirect');
  const reason = searchParams.get('reason');

  // Force dark mode for login page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      // Don't remove dark mode when leaving - ThemeContext will handle it
    };
  }, []);

  // Helper function to redirect to side project after login
  const redirectToSideProject = (target: string) => {
    try {
      // Get the JWT token directly from localStorage (it's stored there after login)
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token available after login');
        navigate('/');
        return;
      }

      // Map redirect targets to URLs
      const redirectUrls: { [key: string]: string } = {
        'strategy': `http://localhost:3001?token=${encodeURIComponent(token)}`,
        'services': `http://localhost:3002?token=${encodeURIComponent(token)}`
      };

      const targetUrl = redirectUrls[target];
      if (targetUrl) {
        console.log(`Redirecting to ${target} with token...`);
        // Use window.location.href for full page redirect
        window.location.href = targetUrl;
      } else {
        console.warn(`Unknown redirect target: ${target}`);
        navigate('/');
      }
    } catch (err) {
      console.error('Error during redirect:', err);
      navigate('/');
    }
  };

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

      // Check if we need to redirect to a side project
      if (redirectTarget) {
        // Small delay to ensure token is saved to localStorage
        setTimeout(() => {
          redirectToSideProject(redirectTarget);
        }, 100);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16 pb-16 md:pb-0">
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

        {/* Show redirect notice if coming from side project */}
        {redirectTarget && (
          <div className="bg-blue-900/30 border border-blue-500 text-blue-200 p-3 rounded-md text-sm">
            <i className="fas fa-info-circle mr-2"></i>
            You'll be redirected to <strong className="capitalize">{redirectTarget}</strong> after logging in.
            {reason === 'auth' && ' (Login required to access premium features)'}
            {reason === 'expired' && ' (Your session has expired)'}
          </div>
        )}

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
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(true)}
                className="font-medium text-primary-400 hover:text-primary-300 focus:outline-none focus:underline"
              >
                Forgot your password?
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-300">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    try {
                      await handleGoogleLogin(credentialResponse.credential);

                      // Check if we need to redirect to a side project
                      if (redirectTarget) {
                        // Small delay to ensure token is saved to localStorage
                        setTimeout(() => {
                          redirectToSideProject(redirectTarget);
                        }, 100);
                      } else {
                        navigate('/');
                      }
                    } catch (err: any) {
                      setError(err.message || 'Failed to log in with Google');
                    }
                  }
                }}
                onError={() => {
                  setError('Google login failed');
                }}
                useOneTap
              />
            </div>
          </div>
        </form>
      </div>
      
      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        userEmail=""
        isLoggedIn={false}
      />
    </div>
  );
};

export default LoginPage; 