import React, { useState, useEffect } from 'react';
import { UserIcon, EnvelopeIcon, MapPinIcon, BriefcaseIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  bio?: string;
  occupation?: string;
  billing_address?: string;
}

interface ProfileInformationSectionProps {
  user: User | null;
  updateProfile: (data: any) => Promise<void>;
}

const ProfileInformationSection: React.FC<ProfileInformationSectionProps> = ({ user, updateProfile }) => {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email] = useState(user?.email || '');
  const [username] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [billingAddress, setBillingAddress] = useState(user?.billing_address || '');

  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setBio(user.bio || '');
      setOccupation(user.occupation || '');
      setBillingAddress(user.billing_address || '');
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
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
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        occupation,
        bio,
        billing_address: billingAddress,
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      setUpdateError(error.response?.data?.detail || error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Profile Information</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update your personal details and preferences</p>

      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <form onSubmit={handleProfileUpdate}>
          {updateSuccess && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-400 text-sm font-medium">Profile updated successfully!</span>
            </div>
          )}

          {updateError && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <span className="text-red-700 dark:text-red-400 text-sm font-medium">{updateError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors
                  ${errors.firstName ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                  bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors
                  ${errors.lastName ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                  bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                disabled
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Billing Address */}
            <div className="lg:col-span-2">
              <label htmlFor="billingAddress" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                Billing Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="billingAddress"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                rows={3}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-none
                  ${errors.billingAddress ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
                  bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white`}
                placeholder="Street, City, State, PIN"
              />
              {errors.billingAddress && (
                <p className="text-red-500 text-xs mt-1.5">{errors.billingAddress}</p>
              )}
            </div>

            {/* Occupation */}
            <div className="lg:col-span-2">
              <label htmlFor="occupation" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                Occupation
              </label>
              <input
                type="text"
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500"
                placeholder="e.g., Software Developer, Trader, Student"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5">
            <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <SparklesIcon className="w-4 h-4 text-gray-400" />
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInformationSection;
