/**
 * Premium Page - Dynamic Plan Display and Purchase
 * Fetches plans from backend (.env configuration) and handles Cashfree payments
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { premiumService, Plan } from '../services/premiumService';
import { paymentService } from '../services/paymentService';
import { CheckIcon, SparklesIcon, RocketLaunchIcon, StarIcon } from '@heroicons/react/24/outline';

const Premium: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [featureNames, setFeatureNames] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'weekly' | 'monthly' | 'annual'>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await premiumService.getAllPlans();
      setPlans(response.plans);
      setFeatureNames(response.feature_names);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load plans');
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    // Check authentication
    if (!isAuthenticated) {
      alert('Please login first to purchase a plan');
      navigate('/login', { state: { from: '/premium' } });
      return;
    }

    // Don't allow purchasing FREE plan
    if (planId === 'FREE') {
      alert('You are already on the FREE plan');
      return;
    }

    try {
      setProcessingPlanId(planId);

      // Create order
      const orderResponse = await paymentService.createOrder({
        plan: planId,
        duration: selectedDuration,
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // Use Cashfree SDK for payment
      console.log('Opening Cashfree checkout with session:', orderResponse.payment_session_id);
      console.log('Order ID for redirect:', orderResponse.order_id);

      await paymentService.loadCashfreeCheckout(
        orderResponse.payment_session_id,
        orderResponse.order_id, // Pass order_id for return URL
        (data: any) => {
          // Payment success - redirect with order_id
          console.log('✅ Cashfree SDK Success Callback Triggered!');
          console.log('Payment successful:', data);
          console.log('Redirecting to:', `/payment-success?order_id=${orderResponse.order_id}`);
          window.location.href = `/payment-success?order_id=${orderResponse.order_id}`;
        },
        (error: any) => {
          // Payment failed
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
          setProcessingPlanId(null);
        }
      );
    } catch (err: any) {
      alert(err.message || 'Failed to initiate payment');
      console.error('Payment error:', err);
      setProcessingPlanId(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'FREE':
        return <StarIcon className="h-8 w-8" />;
      case 'STARTER':
        return <RocketLaunchIcon className="h-8 w-8" />;
      case 'PRO':
        return <SparklesIcon className="h-8 w-8" />;
      case 'ADVANCED':
        return <SparklesIcon className="h-8 w-8" />;
      case 'ENTERPRISE':
        return <SparklesIcon className="h-8 w-8" />;
      default:
        return <StarIcon className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'FREE':
        return 'from-gray-500 to-gray-600';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Plans</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchPlans}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Premium Plan</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Unlock advanced features and higher limits with our premium plans. All prices are dynamically configured.
        </p>
      </div>

      {/* Duration Toggle */}
      <div className="max-w-md mx-auto mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 flex shadow-md">
          {(['weekly', 'monthly', 'annual'] as const).map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                selectedDuration === duration
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {duration.charAt(0).toUpperCase() + duration.slice(1)}
              {duration === 'annual' && (
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                  Save 60%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {plans.map((plan) => {
          const price = plan.prices[selectedDuration];
          const isPopular = plan._id === 'PRO';
          const isFree = plan._id === 'FREE';

          return (
            <div
              key={plan._id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all hover:scale-105 ${
                isPopular ? 'ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-gray-900' : ''
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    POPULAR
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className={`bg-gradient-to-r ${getPlanColor(plan._id)} p-6 text-white`}>
                <div className="flex justify-center mb-3">
                  {getPlanIcon(plan._id)}
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">{plan.display_name}</h3>
                <div className="text-center">
                  {isFree ? (
                    <div className="text-3xl font-bold">Free</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">{formatPrice(price)}</div>
                      <div className="text-sm opacity-90">
                        /{selectedDuration === 'annual' ? 'year' : selectedDuration === 'monthly' ? 'month' : 'week'}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Plan Body */}
              <div className="p-6">
                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                    {plan.description}
                  </p>
                )}

                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Daily Limits:</h4>
                  {Object.entries(plan.limits).map(([featureKey, limit]) => (
                    <div key={featureKey} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{limit}</span>{' '}
                        {featureNames[featureKey] || featureKey}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handlePurchase(plan._id)}
                  disabled={isFree || processingPlanId === plan._id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isFree
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : processingPlanId === plan._id
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-500 hover:to-secondary-500 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {processingPlanId === plan._id ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Processing...
                    </span>
                  ) : isFree ? (
                    'Current Plan'
                  ) : (
                    'Upgrade Now'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            All Plans Include:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              Real-time market data
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              Advanced backtesting
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              24/7 Support
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Secure payments powered by Cashfree • Cancel anytime • Money-back guarantee
        </p>
      </div>
    </div>
  );
};

export default Premium;
