import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileInitialsAvatar from '../components/account/ProfileInitialsAvatar';
import SubscriptionSection from '../components/account/SubscriptionSection';
import PasswordResetModal from '../components/PasswordResetModal';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { IdentificationIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  // Form state
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  
  // UI state
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionDropdownOpen, setSubscriptionDropdownOpen] = useState(false);
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
        bio
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
    <div className="min-h-screen bg-light-bg-primary dark:bg-background-primary">
      {/* Header Section */}
      <div className="pt-20 md:pt-8 pb-6 px-4 bg-light-bg-primary dark:bg-background-primary">
        <div className="container mx-auto">
          <div className="text-center py-6">
            <ProfileInitialsAvatar
              firstName={firstName}
              lastName={lastName}
              size="hero"
              className="mx-auto mb-4"
              noHover
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base">
              @{username}
            </p>
            {(!firstName || !lastName) && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Please fill in your profile information below
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-light-bg-secondary dark:bg-background-secondary min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Profile Details Card */}
            <div className="bg-white dark:bg-background-tertiary rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <IdentificationIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                  Profile Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Update your personal information and verify your identity
                </p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleProfileUpdate}>
                  {updateSuccess && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 p-4 rounded-lg flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Profile updated successfully!
                    </div>
                  )}
                  
                  {updateError && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 p-4 rounded-lg">
                      {updateError}
                    </div>
                  )}
                  
                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                          ${errors.firstName ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600'}
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                          ${errors.lastName ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600'}
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Occupation */}
                    <div className="lg:col-span-2">
                      <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Occupation
                      </label>
                      <input
                        type="text"
                        id="occupation"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Software Developer, Trader, Student"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating Profile...
                        </span>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      className="flex-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowPasswordResetModal(true)}
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="bg-white dark:bg-background-tertiary rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => setSubscriptionDropdownOpen(!subscriptionDropdownOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Subscription & Usage</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View your current plan and usage statistics</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                      subscriptionDropdownOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  subscriptionDropdownOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-gray-100 dark:border-gray-700">
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