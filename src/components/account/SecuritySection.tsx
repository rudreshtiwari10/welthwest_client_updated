import React, { useState } from 'react';
import { KeyIcon } from '@heroicons/react/24/outline';
import PasswordResetModal from '../PasswordResetModal';

interface SecuritySectionProps {
  userEmail: string;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ userEmail }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Security</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage your password and account security</p>

      {/* Password Section */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
            <KeyIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Change your password to keep your account secure. You'll receive an OTP on your registered email to verify the change.
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      <PasswordResetModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={userEmail}
        isLoggedIn={true}
      />
    </div>
  );
};

export default SecuritySection;
