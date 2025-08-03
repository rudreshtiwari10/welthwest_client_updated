import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionTier } from '../contexts/SubscriptionContext';
import { paymentService } from '../services/api';

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
  agreeToTerms: boolean;
  gdprConsent: boolean;
}

interface LocationState {
  planDetails: PlanDetails;
  userInfo: UserInfo;
}

type PaymentMethod = 'razorpay' | 'upi' | 'card';

const ReviewPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.planDetails || !state?.userInfo) {
      navigate('/pricing');
    }
  }, [state, navigate]);

  if (!state?.planDetails || !state?.userInfo) {
    return null;
  }

  const { planDetails, userInfo } = state;
  const isAnnual = planDetails.billing === 'annual';
  const tax = planDetails.price * 0.18; // 18% GST
  const total = planDetails.price + tax;

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const createRazorpayOrder = async () => {
    try {
      return await paymentService.createOrder({
        plan_tier: planDetails.tier,
        billing_cycle: planDetails.billing, // Add billing cycle information
        billing_details: {
          full_name: userInfo.fullName,
          email: userInfo.email,
          phone: userInfo.phoneNumber,
          role: userInfo.role,
          country: userInfo.country
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handleProceedToPay = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const orderData = await createRazorpayOrder();
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'WelthWest',
        description: `${planDetails.tier} Plan - ${isAnnual ? 'Annual' : 'Monthly'}`,
        image: '/images/logo.png',
        order_id: orderData.id,
        prefill: {
          name: userInfo.fullName,
          email: userInfo.email,
          contact: userInfo.phoneNumber,
        },
        notes: {
          plan_tier: planDetails.tier,
          billing_cycle: planDetails.billing,
          user_role: userInfo.role || '',
          country: userInfo.country,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyData = await paymentService.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            // Navigate to confirmation page
            navigate('/payment-confirmation', {
              state: {
                paymentData: verifyData,
                planDetails,
                userInfo,
              },
            });
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Review & Payment</h1>
            <p className="mt-2 text-gray-600">Review your order and choose your payment method</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Plan:</span>
                    <span className="font-medium">{planDetails.tier} - {isAnnual ? 'Annual' : 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">₹{planDetails.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">GST (18%):</span>
                    <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {isAnnual && planDetails.tier !== 'FREE' && (
                  <div className="mt-4 p-3 bg-green-100 rounded-md">
                    <p className="text-sm text-green-800">
                      You're saving 20% with annual billing!
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">User Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {userInfo.fullName}</div>
                  <div><span className="font-medium">Email:</span> {userInfo.email}</div>
                  {userInfo.role && <div><span className="font-medium">Role:</span> {userInfo.role}</div>}
                  <div><span className="font-medium">Phone:</span> {userInfo.phoneNumber}</div>
                  <div><span className="font-medium">Country:</span> {userInfo.country}</div>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-3 text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Change Details
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => handlePaymentMethodChange('razorpay')}>
                    <input
                      type="radio"
                      id="razorpay"
                      name="paymentMethod"
                      value="razorpay"
                      checked={selectedPaymentMethod === 'razorpay'}
                      onChange={() => handlePaymentMethodChange('razorpay')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="razorpay" className="ml-3 flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <span className="font-medium">Razorpay</span>
                        <span className="ml-2 text-sm text-gray-500">(Recommended)</span>
                      </div>
                      <p className="text-sm text-gray-600">Credit/Debit Cards, UPI, Net Banking, Wallets</p>
                    </label>
                  </div>

                  <div className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => handlePaymentMethodChange('upi')}>
                    <input
                      type="radio"
                      id="upi"
                      name="paymentMethod"
                      value="upi"
                      checked={selectedPaymentMethod === 'upi'}
                      onChange={() => handlePaymentMethodChange('upi')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="upi" className="ml-3 flex-1 cursor-pointer">
                      <div className="font-medium">UPI</div>
                      <p className="text-sm text-gray-600">Pay with your UPI app</p>
                    </label>
                  </div>

                  <div className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => handlePaymentMethodChange('card')}>
                    <input
                      type="radio"
                      id="card"
                      name="paymentMethod"
                      value="card"
                      checked={selectedPaymentMethod === 'card'}
                      onChange={() => handlePaymentMethodChange('card')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="card" className="ml-3 flex-1 cursor-pointer">
                      <div className="font-medium">Credit/Debit Card</div>
                      <p className="text-sm text-gray-600">Visa, Mastercard, RuPay</p>
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-100 border border-red-400 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Secure Payment:</strong> Your payment information is encrypted and secure. 
                      We use industry-standard security measures to protect your data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToPay}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default ReviewPaymentPage;