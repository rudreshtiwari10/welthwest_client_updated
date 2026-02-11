import React, { useState, useEffect, useCallback } from 'react';
import { UserCircleIcon, ShieldCheckIcon, CreditCardIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ProfileInitialsAvatar from './ProfileInitialsAvatar';

export type ProfileSection = 'profile' | 'security' | 'subscription' | 'payment-history';

interface ProfileSidebarProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  firstName: string;
  lastName: string;
  username: string;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems: { id: ProfileSection; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile Information', icon: UserCircleIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  { id: 'subscription', label: 'Subscription & Usage', icon: CreditCardIcon },
  { id: 'payment-history', label: 'Payment History', icon: ClockIcon },
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeSection,
  onSectionChange,
  firstName,
  lastName,
  username,
  isMobileOpen,
  onMobileClose,
}) => {
  const [sidebarBottom, setSidebarBottom] = useState(0);

  const handleScroll = useCallback(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const footerRect = footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (footerRect.top < viewportHeight) {
      setSidebarBottom(viewportHeight - footerRect.top);
    } else {
      setSidebarBottom(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ bottom: `${sidebarBottom}px` }}
        className={`fixed top-16 left-0 w-64 z-[80] bg-white dark:bg-dark-100 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-end p-3 md:hidden">
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User identity */}
        <div className="px-5 pt-6 pb-5 md:pt-8 border-b border-gray-200 dark:border-gray-700/50">
          <div className="flex flex-col items-center text-center">
            <ProfileInitialsAvatar
              firstName={firstName}
              lastName={lastName}
              size="large"
              className="ring-2 ring-gray-200 dark:ring-gray-700"
              noHover
            />
            <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white truncate max-w-full">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'User'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-full">
              @{username || 'username'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Settings
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 group ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isActive
                          ? 'text-gray-700 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}
                    />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default ProfileSidebar;
