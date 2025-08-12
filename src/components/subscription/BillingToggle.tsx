import React from 'react';
import { Switch } from '@headlessui/react';

interface BillingToggleProps {
  isAnnual: boolean;
  onChange: (isAnnual: boolean) => void;
}

const BillingToggle: React.FC<BillingToggleProps> = ({ isAnnual, onChange }) => {
  return (
    <div className="flex items-center justify-center space-x-4 my-8">
      <span className={`text-sm ${!isAnnual ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        Monthly
      </span>
      <Switch
        checked={isAnnual}
        onChange={onChange}
        className={`${
          isAnnual ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
      >
        <span
          className={`${
            isAnnual ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform`}
        />
      </Switch>
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${isAnnual ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          Annual
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          Save 20%
        </span>
      </div>
    </div>
  );
};

export default BillingToggle; 