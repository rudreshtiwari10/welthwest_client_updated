import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import PasswordResetModal from '../components/PasswordResetModal';
import AuthBrandPanel from '../components/AuthBrandPanel';

const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const { login, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();

  // Get redirect parameter from URL (from side projects)
  const redirectTarget = searchParams.get('redirect');
  const reason = searchParams.get('reason');

  // Helper function to redirect to side project after login
  const redirectToSideProject = (target: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token available after login');
        navigate('/');
        return;
      }

      const redirectUrls: { [key: string]: string } = {
        'strategy': `http://localhost:3001?token=${encodeURIComponent(token)}`,
        'services': `http://localhost:3002?token=${encodeURIComponent(token)}`
      };

      const targetUrl = redirectUrls[target];
      if (targetUrl) {
        console.log(`Redirecting to ${target} with token...`);
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

      if (redirectTarget) {
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Full-width gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-[#0b1a2e] dark:via-[#0c1525] dark:to-[#080d14]" />

      {/* Large soft glows */}
      <div className="absolute top-1/4 left-[20%] w-[700px] h-[700px] bg-primary-400/10 dark:bg-primary-500/[0.07] rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-[30%] w-[500px] h-[500px] bg-secondary-300/10 dark:bg-secondary-500/[0.04] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[60%] left-[45%] w-[400px] h-[400px] bg-primary-300/[0.06] dark:bg-primary-400/[0.03] rounded-full blur-[160px] pointer-events-none" />

      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        Home
      </button>

      {/* Left Brand Panel */}
      <AuthBrandPanel variant="login" />

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">

        <div className="relative z-10 w-full max-w-md px-8 py-12 lg:px-12">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img
              src="/images/singlelogo.png"
              alt="WelthWest"
              className="w-16 h-16 object-contain mb-3"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welth<span className="text-primary-500 dark:text-primary-400">West</span>
            </h1>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to access your trading dashboard
            </p>
          </div>

          {/* Redirect notice */}
          {redirectTarget && (
            <div className="mb-6 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500 dark:text-primary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-primary-700 dark:text-primary-200">
                  You'll be redirected to <strong className="capitalize">{redirectTarget}</strong> after signing in.
                  {reason === 'auth' && ' (Login required for premium features)'}
                  {reason === 'expired' && ' (Session expired)'}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Email */}
            <div>
              <label htmlFor="username-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  id="username-email"
                  name="username-email"
                  type="text"
                  autoComplete="username email"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                  placeholder="Enter your username or email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/80 dark:bg-transparent text-gray-500 backdrop-blur-sm">or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    try {
                      await handleGoogleLogin(credentialResponse.credential);

                      if (redirectTarget) {
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

            {/* Register link */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors">
                Create account
              </Link>
            </p>
          </form>
        </div>
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
