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
import PlanCheckoutModal from '../components/PlanCheckoutModal';

const Premium: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [featureNames, setFeatureNames] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'weekly' | 'monthly' | 'annual'>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{planId: string; price: number} | null>(null);

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

    // Check profile completion
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    const email = user?.email || '';
    const billingAddress = user?.billing_address || '';

    if (!firstName.trim() || !lastName.trim() || !billingAddress.trim() || !email.trim()) {
      alert('Please complete your profile (Name and Billing Address) before upgrading.\n\nGo to Profile → Personal Information to update your details.');
      navigate('/profile');
      return;
    }

    // Don't allow purchasing FREE plan
    if (planId === 'FREE') {
      alert('You are already on the FREE plan');
      return;
    }

    // Get plan price
    const plan = plans.find(p => p._id === planId);
    if (!plan) {
      alert('Plan not found');
      return;
    }

    const price = plan.prices[selectedDuration];
    if (price === undefined) {
      alert('Invalid plan duration');
      return;
    }

    // Show checkout modal
    setSelectedPlan({ planId, price });
    setShowCheckoutModal(true);
  };

  const handleProceedToPay = async () => {
    if (!selectedPlan) return;

    try {
      setProcessingPlanId(selectedPlan.planId);

      // Create order
      const orderResponse = await paymentService.createOrder({
        plan: selectedPlan.planId,
        duration: selectedDuration,
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // Use Cashfree SDK for payment
      await paymentService.loadCashfreeCheckout(
        orderResponse.payment_session_id,
        orderResponse.order_id, // Pass order_id for return URL
        (data: any) => {
          // Payment success - redirect with order_id
          window.location.href = `/payment-success?order_id=${orderResponse.order_id}`;
        },
        (error: any) => {
          // Payment failed
          console.error('Payment failed');
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

  // Sort plans in the correct order: FREE -> STARTER -> PRO -> ADVANCED -> ENTERPRISE
  const getSortedPlans = () => {
    const planOrder = ['FREE', 'STARTER', 'PRO', 'ADVANCED', 'ENTERPRISE'];
    return [...plans].sort((a, b) => {
      const indexA = planOrder.indexOf(a._id);
      const indexB = planOrder.indexOf(b._id);
      // If plan not found in order array, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
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
        <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30 mb-4">
          Free for everyone
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          It's Free for all users on WelthWest
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          All features are completely free for registered users. No limits, no credit card required.
        </p>
      </div>

      {/* Free Plan Card */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* What you get */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6 text-white rounded-xl mb-6">
            <div className="flex justify-center mb-3">
              <StarIcon className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Free Plan</h3>
            <div className="text-center text-3xl font-bold">Unlimited Access</div>
          </div>
          <ul className="space-y-3 mb-6">
            {['Unlimited Backtesting', 'Unlimited AI Market Analysis', 'Unlimited AI Chat Assistant', 'Full AI Screener Access', 'Market Data & Technical Indicators'].map((feature) => (
              <li key={feature} className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/stock')}
            className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-500 hover:to-secondary-500 shadow-lg hover:shadow-xl transition-all"
          >
            Start Exploring
          </button>
        </div>

        {/* Blurred premium plans */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 overflow-hidden">
          {/* Blur overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
            <div className="text-center px-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-4">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Premium Plans Coming Soon</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                The platform is free for everyone right now. We are curating the best plans for you — stay tuned!
              </p>
            </div>
          </div>

          {/* Blurred content behind */}
          <div className="select-none pointer-events-none space-y-4" aria-hidden="true">
            {getSortedPlans().filter(p => p._id !== 'FREE').slice(0, 3).map((plan) => (
              <div key={plan._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className={`bg-gradient-to-r ${getPlanColor(plan._id)} p-4 rounded-lg text-white mb-3`}>
                  <h3 className="text-lg font-bold text-center">{plan.display_name}</h3>
                  <div className="text-center text-2xl font-bold">{formatPrice(plan.prices.monthly)}/mo</div>
                </div>
                <div className="space-y-2">
                  {Object.entries(plan.limits).slice(0, 3).map(([key, limit]) => (
                    <div key={key} className="flex items-center text-sm text-gray-500">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      {limit} {featureNames[key] || key}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            All Features Included Free:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              Market data & analysis
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              Advanced backtesting
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              AI-powered insights
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
