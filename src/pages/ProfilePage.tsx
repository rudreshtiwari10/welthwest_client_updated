import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileInitialsAvatar from '../components/account/ProfileInitialsAvatar';
import SubscriptionSection from '../components/account/SubscriptionSection';
import PasswordResetModal from '../components/PasswordResetModal';
import { ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { IdentificationIcon, CheckCircleIcon, EnvelopeIcon, UserIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/solid';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  // Form state
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [billingAddress, setBillingAddress] = useState(user?.billing_address || '');

  // UI state
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(true);
  const [subscriptionDropdownOpen, setSubscriptionDropdownOpen] = useState(true);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setOccupation(user.occupation || '');
      setBillingAddress(user.billing_address || '');
    }
  }, [user]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setUpdateError('Please fix the errors below');
      return;
    }

    try {
      setIsLoading(true);
      setUpdateSuccess(false);
      setUpdateError('');

      const profileData = {
        first_name: firstName,
        last_name: lastName,
        occupation,
        bio,
        billing_address: billingAddress
      };

      await updateProfile(profileData);
      setUpdateSuccess(true);

    } catch (error: any) {
      setUpdateError(error.response?.data?.detail || error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Header with Finance Pattern */}
      <div className="relative pt-12 md:pt-6 pb-6 overflow-hidden">
        {/* Finance-themed Background Pattern - White theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-blue-800 to-indigo-900">
          {/* Line Chart Pattern in White */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="line-chart-pattern" x="0" y="0" width="100" height="80" patternUnits="userSpaceOnUse">
                  {/* Grid lines */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeWidth="0.5" opacity="0.2"/>
                  <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" opacity="0.2"/>
                  {/* Chart line */}
                  <polyline points="0,55 25,40 50,45 75,30 100,25" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                  {/* Data points */}
                  <circle cx="25" cy="40" r="1.5" fill="white" opacity="0.4"/>
                  <circle cx="75" cy="30" r="1.5" fill="white" opacity="0.4"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#line-chart-pattern)"/>
            </svg>
          </div>
          {/* Bar Chart Pattern */}
          <div className="absolute inset-0 opacity-4">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="bar-pattern" x="0" y="0" width="120" height="90" patternUnits="userSpaceOnUse">
                  <rect x="15" y="40" width="12" height="35" fill="white" opacity="0.2"/>
                  <rect x="45" y="30" width="12" height="45" fill="white" opacity="0.25"/>
                  <rect x="75" y="35" width="12" height="40" fill="white" opacity="0.22"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#bar-pattern)"/>
            </svg>
          </div>
          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 opacity-3">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="geometric-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <circle cx="40" cy="40" r="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#geometric-pattern)"/>
            </svg>
          </div>

          {/* Gradient fade to blend with page background */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-50 dark:via-gray-900/50 dark:to-gray-900"></div>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 z-10">
          <div className="text-center py-4">
            {/* Avatar with glow effect */}
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 bg-white/30 dark:bg-white/10 blur-2xl rounded-full scale-110"></div>
              <ProfileInitialsAvatar
                firstName={firstName}
                lastName={lastName}
                size="hero"
                className="relative shadow-2xl ring-4 ring-white/50 dark:ring-white/20"
                noHover
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Complete Your Profile'}
            </h1>
            <div className="flex items-center justify-center gap-2 text-white/90 text-lg mb-2">
              <UserIcon className="w-5 h-5" />
              <p>@{username}</p>
            </div>
            {(!firstName || !lastName) && (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm">
                <SparklesIcon className="w-4 h-4" />
                Please complete your profile information
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Section with negative margin to overlap */}
      <div className="relative mt-4 pb-12 z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Profile Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 transform hover:scale-[1.01] transition-all duration-300 relative z-30">
              {/* Card Header with gradient */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-300 group border-b border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IdentificationIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Profile Information
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your personal information</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ChevronDownIcon
                    className={`w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform duration-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 ${
                      profileDropdownOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  profileDropdownOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-8">
                <form onSubmit={handleProfileUpdate}>
                  {updateSuccess && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 p-4 rounded-lg flex items-center shadow-sm animate-fade-in">
                      <div className="p-2 bg-green-500 rounded-full mr-3">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-green-700 dark:text-green-400 font-medium">Profile updated successfully!</span>
                    </div>
                  )}

                  {updateError && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                      <span className="text-red-700 dark:text-red-400 font-medium">{updateError}</span>
                    </div>
                  )}

                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="group">
                      <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                          ${errors.firstName ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-blue-400'}
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="group">
                      <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200
                          ${errors.lastName ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-purple-400'}
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.lastName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="group">
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <EnvelopeIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-inner"
                      />
                    </div>

                    {/* Username */}
                    <div className="group">
                      <label htmlFor="username" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        disabled
                        className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-inner"
                      />
                    </div>

                    {/* Billing Address */}
                    <div className="lg:col-span-2 group">
                      <label htmlFor="billingAddress" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <MapPinIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        Billing Address *
                      </label>
                      <textarea
                        id="billingAddress"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200
                          ${errors.billingAddress ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-red-400'}
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md resize-none`}
                        placeholder="Enter your complete billing address (Street, City, State, PIN)"
                      />
                      {errors.billingAddress && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <span className="text-xs">⚠</span> {errors.billingAddress}
                        </p>
                      )}
                    </div>

                    {/* Occupation */}
                    <div className="lg:col-span-2 group">
                      <label htmlFor="occupation" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <BriefcaseIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        Occupation
                      </label>
                      <input
                        type="text"
                        id="occupation"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md hover:border-orange-400"
                        placeholder="e.g., Software Developer, Trader, Student"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6 group">
                    <label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <SparklesIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md hover:border-pink-400 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {isLoading ? (
                        <span className="flex items-center justify-center relative">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating Profile...
                        </span>
                      ) : (
                        <span className="relative">Update Profile</span>
                      )}
                    </button>

                    <button
                      type="button"
                      className="flex-1 relative overflow-hidden bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 font-bold py-4 px-6 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-md hover:shadow-xl hover:scale-[1.02] group"
                      onClick={() => setShowPasswordResetModal(true)}
                    >
                      <span className="relative">Change Password</span>
                    </button>
                  </div>
                </form>
                </div>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 relative z-30">
              <button
                onClick={() => setSubscriptionDropdownOpen(!subscriptionDropdownOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Subscription & Usage
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View your current plan and usage statistics</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ChevronDownIcon
                    className={`w-6 h-6 text-purple-600 dark:text-purple-400 transition-transform duration-500 group-hover:text-pink-600 dark:group-hover:text-pink-400 ${
                      subscriptionDropdownOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  subscriptionDropdownOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
                  <div className="p-6">
                    <SubscriptionSection />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        userEmail={email}
        isLoggedIn={true}
      />
    </div>
  );
};

export default ProfilePage;
