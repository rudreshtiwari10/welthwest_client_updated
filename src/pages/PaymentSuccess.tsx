/**
 * Payment Success Page
 * Handles redirect from Cashfree after payment
 * Shows loading while webhook processes, then displays confirmation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { paymentService } from '../services/paymentService';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshPremiumData } = useSubscription();

  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('Processing your payment...');
  const [checkAttempt, setCheckAttempt] = useState(0);

  useEffect(() => {
    // Get order_id from URL params
    const orderId = searchParams.get('order_id');

    // Debug logging
    console.log('Payment Success Page - Full URL:', window.location.href);
    console.log('Payment Success Page - Search Params:', searchParams.toString());
    console.log('Payment Success Page - Order ID:', orderId);

    if (!orderId) {
      setStatus('failed');
      setMessage('Invalid payment link. Order ID not found.');
      return;
    }

    // Check actual payment status from backend with retry logic
    const checkPaymentStatus = async () => {
      const maxRetries = 5;
      const retryDelay = 2000; // 2 seconds between retries

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          setCheckAttempt(attempt);
          console.log(`Checking payment status (attempt ${attempt}/${maxRetries})...`);

          // Wait before checking
          await new Promise(resolve => setTimeout(resolve, retryDelay));

          // Get actual order status from backend
          const orderStatus = await paymentService.getOrderStatus(orderId);
          console.log('Order status response:', orderStatus);

          if (orderStatus.success) {
            const status = orderStatus.order.status;

            if (status === 'SUCCESS') {
              // Payment succeeded - refresh subscription data
              await refreshPremiumData();

              setStatus('success');
              setMessage('Payment successful! Your subscription has been activated.');

              // Redirect to dashboard after 3 seconds
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
              return; // Exit retry loop
            } else if (status === 'FAILED') {
              // Payment definitively failed
              setStatus('failed');
              setMessage('Payment failed. Please try again or contact support.');

              setTimeout(() => {
                navigate('/premium');
              }, 5000);
              return; // Exit retry loop
            } else if (status === 'PENDING' && attempt < maxRetries) {
              // Still pending, continue retrying
              console.log('Payment still pending, will retry...');
              continue;
            } else {
              // Pending after all retries
              setStatus('failed');
              setMessage('Payment is still being processed. Please check your dashboard in a few minutes.');

              setTimeout(() => {
                navigate('/dashboard');
              }, 5000);
              return;
            }
          }
        } catch (error) {
          console.error(`Error checking payment status (attempt ${attempt}):`, error);
          if (attempt === maxRetries) {
            setStatus('failed');
            setMessage('Unable to verify payment status. Please check your email or dashboard.');

            setTimeout(() => {
              navigate('/dashboard');
            }, 5000);
          }
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams, refreshPremiumData, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Processing Payment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            {checkAttempt > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                Verifying payment status... (attempt {checkAttempt}/5)
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 dark:text-green-400">
                Your premium features are now active. Redirecting to dashboard...
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-secondary-500 transition-all shadow-lg"
            >
              Go to Dashboard Now
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-400">
                Your payment was not processed. No charges have been made to your account.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/premium')}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-secondary-500 transition-all shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
