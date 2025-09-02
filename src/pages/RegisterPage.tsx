import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/api';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { handleGoogleLogin, completeRegistration } = useAuth();
  const navigate = useNavigate();
  
  // Force dark mode for register page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      // Don't remove dark mode when leaving - ThemeContext will handle it
    };
  }, []);
  
  // Countdown timer for OTP expiry
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    try {
      setError('');
      setIsSendingOTP(true);
      await authService.sendRegistrationOTP(email);
      setOtpSent(true);
      setCountdown(900); // 15 minutes in seconds
    } catch (err: any) {
      const serverMessage = err?.response?.data?.error || 'Failed to send OTP';
      setError(serverMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP code');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      await authService.verifyRegistrationOTP(email, otp);
      setIsEmailVerified(true);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      const serverMessage = err?.response?.data?.error || err?.response?.data?.message || 'Failed to verify OTP';
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailVerified) {
      setError('Please verify your email address before completing registration');
      return;
    }
    
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      
      // Complete registration using AuthContext (handles tokens automatically)
      await completeRegistration(email, username, password, confirmPassword);
      
      // Navigate to dashboard (user is now authenticated)
      navigate('/dashboard');
    } catch (err: any) {
      const serverMessage = err?.response?.data?.error || err?.response?.data?.message || 'Failed to complete registration';
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    try {
      setError('');
      setIsSendingOTP(true);
      await authService.sendRegistrationOTP(email);
      setCountdown(900); // 15 minutes in seconds
      setError(''); // Clear any previous errors
    } catch (err: any) {
      const serverMessage = err?.response?.data?.error || 'Failed to resend OTP';
      setError(serverMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 mt-16 pb-16 md:pb-0">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Fill in your details and verify your email to get started
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Email Field with Verification */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email address
            </label>
            <div className="flex space-x-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false); // Reset verification when email changes
                  setOtpSent(false);
                  setOtp('');
                }}
                className="flex-1 appearance-none rounded-md relative block px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isSendingOTP || !email || isEmailVerified}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isEmailVerified ? '✓ Verified' : isSendingOTP ? 'Sending...' : 'Verify Email'}
              </button>
            </div>
            {isEmailVerified && (
              <p className="mt-1 text-sm text-green-400">✓ Email verified successfully!</p>
            )}
          </div>
          
          {/* OTP Field (shown after email verification attempt) */}
          {otpSent && !isEmailVerified && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                OTP Code
              </label>
              <div className="flex space-x-2">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="flex-1 appearance-none rounded-md relative block px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || !otp}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  OTP sent to {email}
                  {countdown > 0 && (
                    <span className="block">Expires in: {formatTime(countdown)}</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSendingOTP || countdown > 0}
                  className="text-xs text-primary-400 hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}
          
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Username"
            />
          </div>
          
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
          
          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Confirm Password"
            />
          </div>
          
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !isEmailVerified}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            {!isEmailVerified && (
              <p className="mt-2 text-sm text-yellow-400 text-center">
                ⚠️ Please verify your email before creating account
              </p>
            )}
          </div>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
            </div>
          </div>
          
          {/* Google Auth */}
          <div className="mt-4">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  handleGoogleLogin(credentialResponse.credential)
                    .then(() => navigate('/dashboard'))
                    .catch((err) => setError(err.message || 'Failed to register with Google'));
                }
              }}
              onError={() => {
                setError('Google registration failed');
              }}
              useOneTap
            />
          </div>
          
          {/* Login Link */}
          <div className="text-center">
            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 