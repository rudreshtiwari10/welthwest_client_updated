import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/api';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { usePageMeta } from '../hooks/usePageMeta';

const RegisterPage: React.FC = () => {
  usePageMeta({
    title: 'Create Account – WelthWest AI Market Intelligence Platform',
    description: 'Sign up for WelthWest and get free access to AI market regime detection, anomaly alerts, no-code backtesting, and the WelthAI assistant.',
  });

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { handleGoogleLogin, completeRegistration } = useAuth();
  const navigate = useNavigate();

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

    if (!firstName || !lastName) {
      setError('Please enter your first name and last name');
      return;
    }

    try {
      setError('');
      setIsSendingOTP(true);
      await authService.sendRegistrationOTP(email, firstName, lastName);
      setOtpSent(true);
      setCountdown(900);
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
      setError('');
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
      await completeRegistration(email, username, password, confirmPassword);
      navigate('/');
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
      setCountdown(900);
      setError('');
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

  const PasswordToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      {show ? (
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
  );

  // Shared input classes
  const inputCls = "block w-full pl-9 pr-3 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm";
  const inputPwCls = "block w-full pl-9 pr-12 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const iconCls = "w-4 h-4 text-gray-400 dark:text-gray-500";

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
      <AuthBrandPanel variant="register" />

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">

        <div className="relative z-10 w-full max-w-md px-8 py-8 lg:px-12 overflow-y-auto max-h-screen">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <img
              src="/images/singlelogo.png"
              alt="WelthWest"
              className="w-14 h-14 object-contain mb-2"
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Welth<span className="text-primary-500 dark:text-primary-400">West</span>
            </h1>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create account
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start your AI-powered trading journey today
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className={labelCls}>First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <input id="firstName" name="firstName" type="text" autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} placeholder="First name" />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className={labelCls}>Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <input id="lastName" name="lastName" type="text" autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} placeholder="Last name" />
                </div>
              </div>
            </div>

            {/* Email with Verification */}
            <div>
              <label htmlFor="email" className={labelCls}>Email Address</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); setIsEmailVerified(false); setOtpSent(false); setOtp(''); }} className={inputCls} placeholder="you@example.com" />
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isSendingOTP || !email || !firstName || !lastName || isEmailVerified}
                  className={`px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
                    isEmailVerified
                      ? 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                      : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isEmailVerified ? 'Verified' : isSendingOTP ? 'Sending...' : 'Verify'}
                </button>
              </div>
              {isEmailVerified && (
                <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Email verified successfully
                </p>
              )}
            </div>

            {/* OTP Field */}
            {otpSent && !isEmailVerified && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                <label htmlFor="otp" className={labelCls}>Verification Code</label>
                <div className="flex gap-2">
                  <input
                    id="otp" name="otp" type="text" autoComplete="one-time-code" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6}
                    className="flex-1 block px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 text-center text-lg tracking-[0.3em] font-mono"
                    placeholder="000000"
                  />
                  <button
                    type="button" onClick={handleVerifyOTP} disabled={isLoading || !otp}
                    className="px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Sent to {email}
                    {countdown > 0 && (
                      <span className="block text-gray-400 mt-0.5">Expires in {formatTime(countdown)}</span>
                    )}
                  </p>
                  <button type="button" onClick={handleResendOTP} disabled={isSendingOTP || countdown > 0} className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="username" className={labelCls}>Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </div>
                <input id="username" name="username" type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder="Choose a username" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputPwCls} placeholder="Min. 6 characters" />
                <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={labelCls}>Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={iconCls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputPwCls} placeholder="Confirm your password" />
                <PasswordToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit" disabled={isLoading || !isEmailVerified}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
              {!isEmailVerified && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400/80 text-center flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Please verify your email before creating account
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/80 dark:bg-transparent text-gray-500 backdrop-blur-sm">or continue with</span>
              </div>
            </div>

            {/* Google Auth */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    handleGoogleLogin(credentialResponse.credential)
                      .then(() => navigate('/'))
                      .catch((err) => setError(err.message || 'Failed to register with Google'));
                  }
                }}
                onError={() => {
                  setError('Google registration failed');
                }}
                useOneTap
              />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
