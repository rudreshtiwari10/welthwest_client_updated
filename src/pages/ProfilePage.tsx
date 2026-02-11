import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';
import ProfileSidebar, { ProfileSection } from '../components/account/ProfileSidebar';
import ProfileInformationSection from '../components/account/ProfileInformationSection';
import SecuritySection from '../components/account/SecuritySection';
import SubscriptionSection from '../components/account/SubscriptionSection';
import PaymentHistorySection from '../components/account/PaymentHistorySection';

const sectionTitles: Record<ProfileSection, string> = {
  'profile': 'Profile Information',
  'security': 'Security',
  'subscription': 'Subscription & Usage',
  'payment-history': 'Payment History',
};

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSectionChange = (section: ProfileSection) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileInformationSection user={user} updateProfile={updateProfile} />;
      case 'security':
        return <SecuritySection userEmail={user?.email || ''} />;
      case 'subscription':
        return <SubscriptionSection />;
      case 'payment-history':
        return <PaymentHistorySection />;
      default:
        return <ProfileInformationSection user={user} updateProfile={updateProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-primary">
      {/* Profile Sidebar */}
      <ProfileSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        firstName={user?.first_name || ''}
        lastName={user?.last_name || ''}
        username={user?.username || ''}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-100">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
          {sectionTitles[activeSection]}
        </h1>
      </div>

      {/* Content panel */}
      <div className="md:ml-64 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
