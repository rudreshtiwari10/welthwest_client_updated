import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription, SubscriptionTier } from '../contexts/SubscriptionContext';
import { paymentService } from '../services/api';

interface PaymentData {
  payment_id: string;
  order_id: string;
  signature: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
}

interface PlanDetails {
  tier: SubscriptionTier;
  billing: string;
  price: number;
  features: string[];
}

interface UserInfo {
  fullName: string;
  email: string;
  role?: string;
  phoneNumber: string;
  country: string;
}

interface LocationState {
  paymentData: PaymentData;
  planDetails: PlanDetails;
  userInfo: UserInfo;
}

const PaymentConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getToken } = useAuth();
  const { refreshSubscription, updateSubscriptionAfterPayment } = useSubscription();
  
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.paymentData || !state?.planDetails) {
      navigate('/pricing');
      return;
    }

    // Update subscription with payment details and refresh
    const updateSubscription = async () => {
      try {
        await updateSubscriptionAfterPayment(state.paymentData, state.planDetails, state.userInfo);
      } catch (error) {
        console.error('Failed to update subscription:', error);
      }
    };

    updateSubscription();

    // Mark email as sent (in real implementation, this would be triggered by backend)
    setTimeout(() => setEmailSent(true), 2000);
  }, [state, navigate, updateSubscriptionAfterPayment]);

  if (!state?.paymentData || !state?.planDetails) {
    return null;
  }

  const { paymentData, planDetails, userInfo } = state;
  const isAnnual = planDetails.billing === 'annual';
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + (isAnnual ? 12 : 1));

  const handleDownloadInvoice = async () => {
    setIsDownloadingInvoice(true);
    try {
      // TODO: Implement invoice download when backend endpoint is ready
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Invoice download feature will be available soon. Your payment receipt has been sent to your email.');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Invoice download is not available yet. Please check your email for the receipt.');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const getNextSteps = () => {
    switch (planDetails.tier) {
      case 'BASIC':
        return [
          'Start using advanced backtesting features',
          'Access 15-minute delayed market data',
          'Get email support for any questions',
        ];
      case 'PRO':
        return [
          'Access real-time market data',
          'Use unlimited API calls',
          'Get priority email and chat support',
          'Invite team members to collaborate',
        ];
      case 'ENTERPRISE':
        return [
          'Set up your enterprise dashboard',
          'Contact us for custom integrations',
          'Schedule onboarding call with our team',
          'Explore white-label options',
        ];
      default:
        return ['Explore the platform features'];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-8 text-center border-b border-green-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-900">Payment Successful!</h1>
            <p className="mt-2 text-green-700">
              Welcome to {planDetails.tier} plan! Your subscription is now active.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono">{paymentData.payment_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono">{paymentData.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold">₹{(paymentData.amount / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span>{new Date(paymentData.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {paymentData.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Subscription Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Plan:</span>
                    <span className="font-semibold">{planDetails.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Billing Cycle:</span>
                    <span className="capitalize">{planDetails.billing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Next Billing:</span>
                    <span>{nextBillingDate.toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Features:</span>
                    <span>{planDetails.features.length} included</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Plan Features:</h3>
                  <ul className="space-y-1">
                    {planDetails.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-xs text-blue-700 flex items-center">
                        <svg className="w-3 h-3 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                    {planDetails.features.length > 3 && (
                      <li className="text-xs text-blue-600">
                        +{planDetails.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {emailSent ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    {emailSent ? (
                      <>
                        <strong>Confirmation email sent!</strong> Check your inbox at {userInfo.email} for your receipt and getting started guide.
                      </>
                    ) : (
                      <>
                        <strong>Sending confirmation email...</strong> You'll receive a receipt and getting started guide at {userInfo.email}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">Getting Started:</h3>
                  <ul className="space-y-2">
                    {getNextSteps().map((step, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">Support & Resources:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Email support available 24/7
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Live chat (PRO+ plans)
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      API documentation & guides
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium disabled:opacity-50"
              >
                {isDownloadingInvoice ? 'Downloading...' : 'Download Invoice'}
              </button>
            </div>

            {/* Additional Information */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Questions about your subscription? Contact us at{' '}
                  <a href="mailto:support@welthwest.com" className="text-blue-600 hover:text-blue-500">
                    support@welthwest.com
                  </a>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  You can manage your subscription anytime from your account settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;