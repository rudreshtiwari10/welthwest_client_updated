import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier } from '../../contexts/SubscriptionContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  newTier: SubscriptionTier;
  prices: {
    current: number;
    new: number;
  };
  isAnnual: boolean;
  onConfirm: () => Promise<void>;
}

type Step = 'confirm' | 'payment' | 'success';

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  newTier,
  prices,
  isAnnual,
  onConfirm,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('confirm');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      setCurrentStep('success');
    } catch (err) {
      setError('Failed to process upgrade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('confirm');
    setError(null);
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'confirm':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Upgrade to {newTier} Plan
            </h3>
            <div className="text-sm text-gray-500">
              <p>You are about to upgrade from {currentTier} to {newTier}.</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Current Plan ({currentTier})</span>
                  <span>₹{prices.current}/{isAnnual ? 'year' : 'month'}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>New Plan ({newTier})</span>
                  <span className="font-medium text-gray-900">
                    ₹{prices.new}/{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center font-medium">
                    <span>Difference</span>
                    <span className="text-green-600">
                      +₹{prices.new - prices.current}/{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 mt-2">
                {error}
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('payment')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Payment Details
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <input
                  type="text"
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    placeholder="MM/YY"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    placeholder="123"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 mt-2">
                {error}
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep('confirm')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Upgrade Successful!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your subscription has been upgraded to the {newTier} plan.
              The changes are effective immediately.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Done
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {renderStep()}
        </div>
      </div>
    </Dialog>
  );
};

export default UpgradeModal; 