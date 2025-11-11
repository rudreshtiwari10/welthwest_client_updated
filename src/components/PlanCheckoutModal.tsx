import React, { useEffect, useState } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  CalendarIcon,
  CreditCardIcon,
  SparklesIcon,
  ChartBarIcon,
  BoltIcon,
  RocketLaunchIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { subscriptionService } from '../services/api';

interface PlanCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  duration: 'weekly' | 'monthly' | 'annual';
  planPrice: number;
  onProceedToPay: () => void;
  userName: string;
  userEmail: string;
  billingAddress: string;
}

interface PlanLimits {
  'welth-market-regime': number;
  'welth-ai-assistant': number;
  'backtest-beta': number;
}

interface PlanDetails {
  plan: string;
  duration: string;
  price: number;
  limits: PlanLimits;
}

const PlanCheckoutModal: React.FC<PlanCheckoutModalProps> = ({
  isOpen,
  onClose,
  planId,
  duration,
  planPrice,
  onProceedToPay,
  userName,
  userEmail,
  billingAddress
}) => {
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && planId) {
      fetchPlanDetails();
    }
  }, [isOpen, planId, duration]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      // Fetch plan details from backend
      const response = await subscriptionService.getPlanDetails(planId);

      if (response.success) {
        setPlanDetails(response.plan_details);
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'STARTER':
        return <RocketLaunchIcon className="h-10 w-10" />;
      case 'PRO':
        return <SparklesIcon className="h-10 w-10" />;
      case 'ADVANCED':
        return <ChartBarIcon className="h-10 w-10" />;
      case 'ENTERPRISE':
        return <StarIcon className="h-10 w-10" />;
      default:
        return <StarIcon className="h-10 w-10" />;
    }
  };

  const getPlanGradient = (plan: string) => {
    switch (plan) {
      case 'STARTER':
        return 'from-blue-500 to-blue-600';
      case 'PRO':
        return 'from-purple-500 to-purple-600';
      case 'ADVANCED':
        return 'from-indigo-500 to-indigo-600';
      case 'ENTERPRISE':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getFeatureIcon = (featureKey: string) => {
    switch (featureKey) {
      case 'welth-market-regime':
        return <ChartBarIcon className="h-5 w-5 text-purple-500" />;
      case 'welth-ai-assistant':
        return <SparklesIcon className="h-5 w-5 text-blue-500" />;
      case 'backtest-beta':
        return <BoltIcon className="h-5 w-5 text-green-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFeatureName = (featureKey: string) => {
    switch (featureKey) {
      case 'welth-market-regime':
        return 'AI Market Analysis';
      case 'welth-ai-assistant':
        return 'AI Assistant Chat';
      case 'backtest-beta':
        return 'Backtesting Engine';
      default:
        return featureKey;
    }
  };

  const getDurationLabel = (dur: string) => {
    switch (dur) {
      case 'weekly':
        return 'Week';
      case 'monthly':
        return 'Month';
      case 'annual':
        return 'Year';
      default:
        return dur;
    }
  };

  const getNextBillingDate = () => {
    const today = new Date();
    let nextDate = new Date(today);

    switch (duration) {
      case 'weekly':
        nextDate.setDate(today.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(today.getMonth() + 1);
        break;
      case 'annual':
        nextDate.setFullYear(today.getFullYear() + 1);
        break;
    }

    return nextDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-dark-300 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getPlanGradient(planId)} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4">
            {getPlanIcon(planId)}
            <div>
              <h2 className="text-2xl font-bold">{planId} Plan</h2>
              <p className="text-white text-opacity-90 text-sm">Complete your subscription</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* User Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Billing Information
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{userEmail}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Billing Address</label>
                  <p className="font-semibold text-gray-900 dark:text-white">{billingAddress}</p>
                </div>
              </div>
            </div>

            {/* Plan Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Plan Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Plan</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{planId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Billing Period</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">{getDurationLabel(duration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Next Billing Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{getNextBillingDate()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Auto-Renewal</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">Enabled (Cancel anytime)</span>
                </div>
              </div>
            </div>

            {/* Feature Limits */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                Daily Feature Limits
              </h3>

              <div className="space-y-3">
                {planDetails?.limits && Object.entries(planDetails.limits).map(([featureKey, limit]) => (
                  <div key={featureKey} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon(featureKey)}
                      <span className="text-gray-900 dark:text-white font-medium">
                        {getFeatureName(featureKey)}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {limit === 999 ? 'Unlimited' : `${limit}/day`}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                * Limits reset daily at midnight IST
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 text-blue-500 mr-2" />
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(planPrice)}</span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Important Information</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Payment is processed securely through Cashfree Payment Gateway</li>
                <li>• Your subscription starts immediately after successful payment</li>
                <li>• You can cancel your subscription anytime from your profile</li>
                <li>• Refunds are subject to our refund policy</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                  onProceedToPay();
                }}
                className={`flex-1 px-6 py-3 bg-gradient-to-r ${getPlanGradient(planId)} text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2`}
              >
                <CreditCardIcon className="h-5 w-5" />
                <span>Proceed to Pay {formatPrice(planPrice)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCheckoutModal;
