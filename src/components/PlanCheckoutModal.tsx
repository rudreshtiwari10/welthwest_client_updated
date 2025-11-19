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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
    <>
      {/* Main Checkout Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
        <div className="bg-white dark:bg-dark-300 rounded-xl shadow-2xl max-w-4xl w-full relative z-[10000] my-4">
          {/* Compact Header */}
          <div className={`bg-gradient-to-r ${getPlanGradient(planId)} px-6 py-3 text-white relative flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
              <div className="scale-75">
                {getPlanIcon(planId)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{planId} Plan</h2>
                <p className="text-white text-opacity-90 text-xs">Complete your subscription</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-6">
              {/* Two Column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Left Column: User Details & Plan Summary */}
                <div className="space-y-4">
                  {/* User Details */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      Billing Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{userName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{userEmail}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Billing Address</label>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{billingAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Plan Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                      Plan Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                        <span className="text-base font-semibold text-gray-900 dark:text-white">{planId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Billing Period</span>
                        <span className="text-base font-semibold text-gray-900 dark:text-white capitalize">{getDurationLabel(duration)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{getNextBillingDate()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Auto-Renewal</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400">Enabled (Cancel anytime)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary & Guarantee */}
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CreditCardIcon className="h-6 w-6 text-blue-500 mr-2" />
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Plan Price</span>
                        <span className="text-base font-semibold text-gray-900 dark:text-white">{formatPrice(planPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                        <span className="text-base font-semibold text-gray-900 dark:text-white capitalize">{getDurationLabel(duration)}</span>
                      </div>
                      <div className="border-t-2 border-blue-300 dark:border-blue-700 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(planPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Money Back Guarantee */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">🛡️</div>
                    <h4 className="text-base font-semibold text-purple-900 dark:text-purple-300 mb-1">7-Day Money Back Guarantee</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-400">Not satisfied? Get a full refund within 7 days, no questions asked</p>
                  </div>

                  {/* Secure Payment Badge */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-800 dark:text-green-400 font-medium">🔒 Secure Payment powered by Cashfree</p>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Terms & Conditions
                    </button>
                    {' '}and confirm that I have read and understood the payment policy, refund terms, and subscription details.{' '}
                    <span className="text-red-600 dark:text-red-400">*</span>
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!termsAccepted) {
                      alert('Please accept the Terms & Conditions to proceed');
                      return;
                    }
                    onClose();
                    onProceedToPay();
                  }}
                  disabled={!termsAccepted}
                  className={`flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                    termsAccepted
                      ? `bg-gradient-to-r ${getPlanGradient(planId)} text-white hover:shadow-lg transform hover:scale-105`
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5" />
                  <span>Proceed to Pay {formatPrice(planPrice)}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10001] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Terms Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold">Terms & Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Terms Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Payment Terms */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-blue-500 mr-2" />
                  Payment Terms
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• All payments are processed securely through Cashfree Payment Gateway</li>
                  <li>• Prices are listed in Indian Rupees (INR) and include all applicable taxes</li>
                  <li>• Your subscription starts immediately after successful payment verification</li>
                  <li>• Payment confirmation will be sent to your registered email address</li>
                  <li>• You will receive an invoice for your records within 24 hours of payment</li>
                </ul>
              </div>

              {/* Subscription Details */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-green-500 mr-2" />
                  Subscription Details
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Auto-renewal is enabled by default for your convenience</li>
                  <li>• You will be charged automatically at the end of each billing period</li>
                  <li>• Daily feature limits reset at midnight (IST) every day</li>
                  <li>• Unused limits do not carry over to the next day</li>
                  <li>• You can cancel your subscription anytime from your profile settings</li>
                  <li>• Cancellation takes effect at the end of the current billing period</li>
                </ul>
              </div>

              {/* What You Get */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                  What You Get
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>✓ Instant access to all premium features upon payment confirmation</li>
                  <li>✓ Real-time market data and AI-powered analysis</li>
                  <li>✓ Advanced backtesting engine with 15+ built-in strategies</li>
                  <li>✓ AI virtual trading assistant with personalized recommendations</li>
                  <li>✓ Priority customer support available 24/7 via email and chat</li>
                  <li>✓ Mobile app access (iOS and Android) - coming soon</li>
                  <li>✓ Regular feature updates and improvements at no extra cost</li>
                </ul>
              </div>

              {/* Refund Policy */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Refund Policy
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• We offer a 7-day money-back guarantee for all new subscriptions</li>
                  <li>• Refund requests must be submitted within 7 days of initial purchase</li>
                  <li>• Full refunds are processed within 5-7 business days to your original payment method</li>
                  <li>• Refunds are not available for renewals or after the 7-day period</li>
                  <li>• Partial refunds for unused time are not provided for mid-cycle cancellations</li>
                  <li>• To request a refund, contact support@welthwest.com with your order details</li>
                </ul>
              </div>

              {/* Important Information */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <BoltIcon className="h-5 w-5 text-orange-500 mr-2" />
                  Important Information
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• WelthWest is for informational and educational purposes only</li>
                  <li>• We do not provide financial advice or investment recommendations</li>
                  <li>• All trading and investment decisions are your sole responsibility</li>
                  <li>• Past performance does not guarantee future results</li>
                  <li>• Market predictions and AI analysis are based on historical data and algorithms</li>
                  <li>• We are not liable for any financial losses incurred from using our platform</li>
                  <li>• By subscribing, you agree to our Privacy Policy and User Agreement</li>
                </ul>
              </div>

              {/* Contact Support */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Questions or concerns?</strong> Contact our support team at{' '}
                  <a href="mailto:support@welthwest.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@welthwest.com
                  </a>{' '}
                  or call us at <strong>+91-XXXX-XXXXXX</strong>
                </p>
              </div>
            </div>

            {/* Terms Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlanCheckoutModal;
