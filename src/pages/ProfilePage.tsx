import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { watchlistService } from '../services/api';
import SubscriptionSection from '../components/account/SubscriptionSection';

interface Watchlist {
  id: string;
  name: string;
  description?: string;
  symbols: string[];
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user's watchlists
        const watchlistsResponse = await watchlistService.getUserWatchlists();
        if (watchlistsResponse.watchlists) {
          setWatchlists(watchlistsResponse.watchlists);
        }
        
        // Set profile form values from user data
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setAvatarUrl(user.avatar_url || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
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
  
  const handleRemoveSymbol = async (watchlistId: string, symbol: string) => {
    try {
      await watchlistService.removeSymbolFromWatchlist(watchlistId, symbol);
      
      // Update watchlists state
      setWatchlists(prevWatchlists => 
        prevWatchlists.map(watchlist => 
          watchlist.id === watchlistId 
            ? { ...watchlist, symbols: watchlist.symbols.filter(s => s !== symbol) }
            : watchlist
        )
      );
    } catch (error) {
      console.error('Error removing symbol from watchlist:', error);
    }
  };
  
  const handleDeleteWatchlist = async (watchlistId: string) => {
    try {
      await watchlistService.deleteWatchlist(watchlistId);
      
      // Update watchlists state
      setWatchlists(prevWatchlists => 
        prevWatchlists.filter(watchlist => watchlist.id !== watchlistId)
      );
    } catch (error) {
      console.error('Error deleting watchlist:', error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Account</h2>
            
            <form onSubmit={handleProfileUpdate}>
              {updateSuccess && (
                <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  Profile updated successfully!
                </div>
              )}
              
              {updateError && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {updateError}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={user?.username || ''}
                  disabled
                  className="bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <button
                type="submit"
                className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Update Profile
              </button>
            </form>
            
            {/* Account Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Account Actions</h3>
              
              <div className="space-y-3">
                <button 
                  className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 font-medium py-2 px-4 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  onClick={() => console.log('Change password')}
                >
                  Change Password
                </button>
                
                <button 
                  className="w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 font-medium py-2 px-4 rounded-md hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  onClick={() => console.log('Export data')}
                >
                  Export My Data
                </button>
                
                <button 
                  className="w-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 font-medium py-2 px-4 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
                  onClick={() => console.log('Two-factor auth')}
                >
                  Two-Factor Authentication
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Privacy Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Save watchlist history</p>
                    <p className="text-sm text-gray-500">Store your watchlist data for future reference</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="save-history" className="sr-only" defaultChecked />
                    <label
                      htmlFor="save-history"
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    >
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-gray-500">Receive market updates via email</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="email-notif" className="sr-only" defaultChecked />
                    <label
                      htmlFor="email-notif"
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    >
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Share analytics data</p>
                    <p className="text-sm text-gray-500">Help improve our platform with anonymous usage data</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="share-analytics" className="sr-only" />
                    <label
                      htmlFor="share-analytics"
                      className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                    >
                      <span className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-800">
              <h3 className="font-medium text-lg mb-4 text-red-700 dark:text-red-400">Danger Zone</h3>
              
              <div className="space-y-3">
                <button 
                  className="w-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 font-medium py-2 px-4 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  onClick={() => window.confirm('Are you sure you want to deactivate your account?')}
                >
                  Deactivate Account
                </button>
                
                <button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  onClick={() => window.confirm('This action cannot be undone. Are you sure you want to delete your account?')}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Subscription Section */}
          <SubscriptionSection />

          {/* Watchlists */}
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Watchlists</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : watchlists.length > 0 ? (
              <div className="space-y-6">
                {watchlists.map((watchlist) => (
                  <div key={watchlist.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-lg">{watchlist.name}</h3>
                      <button
                        onClick={() => handleDeleteWatchlist(watchlist.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {watchlist.description && (
                      <p className="text-sm text-gray-500 mb-3">{watchlist.description}</p>
                    )}
                    
                    {watchlist.symbols.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {watchlist.symbols.map((symbol) => (
                          <div key={symbol} className="bg-gray-50 dark:bg-dark-400 p-3 rounded-md flex justify-between items-center">
                            <span className="font-medium">{symbol}</span>
                            <button
                              onClick={() => handleRemoveSymbol(watchlist.id, symbol)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No symbols in this watchlist</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                You don't have any watchlists yet.
                <br />
                Add stocks to your watchlist from the dashboard.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 