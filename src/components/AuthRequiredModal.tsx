import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Human-readable feature name, e.g. "Welth Lab". */
  featureName: string;
  /** Path to return to after signing in, e.g. "/welth-lab". */
  redirectPath: string;
  /** Overrides the default reassurance copy about resuming. */
  resumeNote?: string;
}

/**
 * The one "please sign in" surface shared by Welth Lab, Welth AI Assistant
 * and Welth Market Regime. No email/password fields — sign-in itself only
 * happens on the dedicated login page. This just explains why, and makes it
 * explicit that whatever the user built is safe and will still be there.
 */
const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  featureName,
  redirectPath,
  resumeNote,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const goToLogin = (target: '/login' | '/register') => {
    navigate(`${target}?redirect=${encodeURIComponent(redirectPath)}&reason=resume`);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20">
            <LockClosedIcon className="h-6 w-6 text-white" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">
            Sign in to use {featureName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            This feature runs against live account data, so it's available to signed-in users only.
          </p>

          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-primary-200 dark:border-primary-500/20 bg-primary-50 dark:bg-primary-500/10 px-3.5 py-3">
            <ArrowPathIcon className="h-4 w-4 mt-0.5 shrink-0 text-primary-600 dark:text-primary-400" />
            <p className="text-[13px] leading-relaxed text-primary-800 dark:text-primary-200">
              {resumeNote ??
                `Nothing you've set up gets lost. Sign in and you'll return straight to ${featureName}, resumed exactly where you left it.`}
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => goToLogin('/login')}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-200 text-sm"
            >
              Log In
            </button>
            <button
              onClick={() => goToLogin('/register')}
              className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Create a free account
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors text-sm"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
