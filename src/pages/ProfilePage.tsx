import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionSection from '../components/account/SubscriptionSection';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  // Dropdown states
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(true);
  const [subscriptionDropdownOpen, setSubscriptionDropdownOpen] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdateSuccess(false);
      setUpdateError('');
      
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        bio,
        avatar_url: avatarUrl
      });
      
      setUpdateSuccess(true);
    } catch (error: any) {
      setUpdateError(error.response?.data?.detail || error.message || 'Failed to update profile');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 pt-20 md:pt-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Profile</h1>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Account Details Dropdown */}
        <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information and settings</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              {accountDropdownOpen ? (
                <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </button>
          
          {accountDropdownOpen && (
            <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
              <form onSubmit={handleProfileUpdate} className="mt-6">
                {updateSuccess && (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm">
                    Profile updated successfully!
                  </div>
                )}
                
                {updateError && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                    {updateError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={user?.username || ''}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                  />
                </div>
                
                <div className="mt-6">
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Update Profile
                  </button>
                  
                  <button 
                    type="button"
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 font-medium py-2 px-4 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    onClick={() => console.log('Change password')}
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Subscription Details Dropdown */}
        <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => setSubscriptionDropdownOpen(!subscriptionDropdownOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
              {subscriptionDropdownOpen ? (
                <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </button>
          
          {subscriptionDropdownOpen && (
            <div className="border-t border-gray-100 dark:border-gray-700">
              <div className="p-6">
                <SubscriptionSection />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 