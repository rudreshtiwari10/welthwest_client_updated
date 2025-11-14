import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { subscriptionService } from '../../services/api';
import { ChartBarIcon, ClockIcon, ArrowPathIcon, CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface FeatureUsage {
  feature_key: string;
  feature_name: string;
  used: number;
  remaining: number;
  limit: number;
  percentage: number;
}

interface SubscriptionDetails {
  plan: string;
  plan_duration?: string;
  start_date?: string;
  expiry_date?: string;
  is_active: boolean;
  days_remaining: number;
}

interface UsageInfo {
  features: FeatureUsage[];
  reset_info: {
    next_reset: string;
    hours_until_reset: number;
    minutes_until_reset: number;
    reset_message: string;
  };
}

interface Transaction {
  transaction_id: string;
  order_id: string;
  plan: string;
  plan_display_name: string;
  duration: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

interface TransactionDetails extends Transaction {
  gateway: string;
  payment_session_id?: string;
  gateway_payment_id?: string;
  payment_status?: string;
  bank_reference?: string;
  payment_time?: string;
}

const SubscriptionSection: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Transaction[]>([]);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Payment history states
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
  const [loadingTransactionDetails, setLoadingTransactionDetails] = useState(false);

  // Ref for payment history section
  const paymentHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSubscriptionData();
    fetchPaymentHistory();
  }, []);

  // Scroll to payment history when it's shown
  useEffect(() => {
    if (showPaymentHistory && paymentHistoryRef.current) {
      setTimeout(() => {
        paymentHistoryRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [showPaymentHistory]);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const response = await subscriptionService.getSubscriptionStatus();

      if (response.success) {
        setSubscriptionDetails(response.subscription);
        setUsageInfo(response.usage);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setLoadingPaymentHistory(true);
      const response = await subscriptionService.getPaymentHistory();

      if (response.success) {
        setPaymentHistory(response.transactions || []);
      }
    } catch (error: any) {
      console.error('Error fetching payment history');
    } finally {
      setLoadingPaymentHistory(false);
    }
  };

  const fetchTransactionDetails = async (transactionId: string) => {
    try {
      setLoadingTransactionDetails(true);
      const response = await subscriptionService.getTransactionDetails(transactionId);

      if (response.success) {
        setSelectedTransaction(response.transaction);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    } finally {
      setLoadingTransactionDetails(false);
    }
  };

  const handleCancelSubscription = async () => {
    const reason = window.prompt(
      'Are you sure you want to cancel your subscription? This will downgrade you to FREE tier.\n\nOptionally, tell us why you\'re cancelling (this helps us improve):'
    );

    if (reason === null) {
      return;
    }

    try {
      setCancellingSubscription(true);
      setCancelError('');

      const response = await subscriptionService.cancelSubscription(reason || 'User requested cancellation');

      if (response.success) {
        await refreshSubscription();
        await fetchSubscriptionData();
        alert('Your subscription has been cancelled successfully. You have been downgraded to the FREE tier.');
      } else {
        setCancelError(response.error || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      setCancelError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to cancel subscription'
      );
    } finally {
      setCancellingSubscription(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'FAILED':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getFeatureIcon = (featureKey: string) => {
    switch (featureKey) {
      case 'welth-market-regime':
        return '📈';
      case 'welth-ai-assistant':
        return '🤖';
      case 'backtest-beta':
        return '⚡';
      default:
        return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-300 shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptionDetails) {
    return (
      <div className="bg-white dark:bg-dark-300 shadow rounded-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">Unable to load subscription details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Subscription Card */}
      <div className="bg-white dark:bg-dark-300 shadow rounded-lg p-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Subscription Details</h3>
        </div>

        {/* Error message */}
        {cancelError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{cancelError}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setCancelError('')}
            >
              <span className="text-red-700 dark:text-red-400">×</span>
            </button>
          </div>
        )}

        {/* Plan Summary */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Current Plan</h4>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{subscriptionDetails.plan}</p>
              {subscriptionDetails.plan !== 'FREE' && subscriptionDetails.plan_duration && (
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({subscriptionDetails.plan_duration})
                </p>
              )}
            </div>
            {subscriptionDetails.start_date && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Started: {formatDate(subscriptionDetails.start_date)}
              </p>
            )}
            {subscriptionDetails.expiry_date && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subscriptionDetails.is_active ? 'Renews' : 'Expired'} on: {formatDate(subscriptionDetails.expiry_date)}
              </p>
            )}
            {subscriptionDetails.is_active && subscriptionDetails.days_remaining > 0 && (
              <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                {subscriptionDetails.days_remaining} days remaining
              </p>
            )}
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Status</h4>
            <div className="flex items-center mt-2">
              {subscriptionDetails.is_active ? (
                <>
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-6 h-6 text-red-500 mr-2" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Feature Usage */}
        <div className="mb-8">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Feature Usage</h4>
          <div className="space-y-4">
            {usageInfo?.features.map((feature) => (
              <div key={feature.feature_key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getFeatureIcon(feature.feature_key)}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{feature.feature_name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.used} / {feature.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      feature.percentage >= 90 ? 'bg-red-600' :
                      feature.percentage >= 70 ? 'bg-yellow-600' :
                      'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(feature.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {feature.remaining} remaining
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {feature.percentage.toFixed(1)}% used
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Info */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="px-4 py-5 bg-gray-50 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate flex items-center">
                <ClockIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                Reset In
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {usageInfo?.reset_info.hours_until_reset}h {usageInfo?.reset_info.minutes_until_reset}m
              </dd>
            </div>
            <div className="px-4 py-5 bg-gray-50 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate flex items-center">
                <ArrowPathIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                Next Reset
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {usageInfo?.reset_info.next_reset && new Date(usageInfo.reset_info.next_reset).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
            <div className="px-4 py-5 bg-gray-50 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate flex items-center">
                <CreditCardIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                Payments
              </dt>
              <dd className="mt-1">
                <button
                  onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View History
                </button>
              </dd>
            </div>
          </dl>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            {subscriptionDetails.plan === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
          </button>
          {subscriptionDetails.plan !== 'FREE' && (
            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={cancellingSubscription}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancellingSubscription ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-red-700 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cancelling...
                </>
              ) : (
                'Cancel Subscription'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Payment History Section */}
      {showPaymentHistory && (
        <div ref={paymentHistoryRef} className="bg-white dark:bg-dark-300 shadow rounded-lg p-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {loadingPaymentHistory ? 'Loading...' : `${paymentHistory.length} transaction${paymentHistory.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <button
              onClick={() => setShowPaymentHistory(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {loadingPaymentHistory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No payment history available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Your completed transactions will appear here
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-300 divide-y divide-gray-200 dark:divide-gray-700">
                  {paymentHistory.map((transaction) => (
                    <tr key={transaction.transaction_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{transaction.plan_display_name}</div>
                          {transaction.duration && (
                            <div className="text-gray-500 dark:text-gray-400 text-xs">{transaction.duration}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => fetchTransactionDetails(transaction.transaction_id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paymentHistory.length > 10 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Scroll down to see more transactions
              </p>
            )}
          </div>
          )}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {loadingTransactionDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.transaction_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedTransaction.plan_display_name} ({selectedTransaction.duration})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedTransaction.currency} {selectedTransaction.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gateway</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.gateway}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedTransaction.payment_method || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedTransaction.created_at)}
                      </p>
                    </div>
                    {selectedTransaction.bank_reference && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bank Reference</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.bank_reference}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSection;
