import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription, SubscriptionTier } from '../contexts/SubscriptionContext';

interface UserFormData {
  fullName: string;
  email: string;
  role?: string;
  phoneNumber: string;
  country: string;
  agreeToTerms: boolean;
  gdprConsent: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  country?: string;
  agreeToTerms?: string;
  gdprConsent?: string;
}

const PRICING_DATA = {
  FREE: { monthly: 0, annual: 0 },
  BASIC: { monthly: 399, annual: 3828 },
  PRO: { monthly: 999, annual: 9588 },
  ENTERPRISE: { monthly: 2999, annual: 28788 },
};

const PLAN_FEATURES = {
  FREE: ['2 backtests/day', '5 AI queries/day', 'Delayed market data', 'Basic analytics'],
  BASIC: ['10 backtests/day', '20 AI queries/day', '15-min delayed data', 'Advanced analytics', 'Email support'],
  PRO: ['30 backtests/day', '50 AI queries/day', 'Real-time data', 'Professional analytics', 'API access', 'Email & Chat support'],
  ENTERPRISE: ['Unlimited backtests', 'Unlimited AI queries', 'Real-time data', 'Enterprise analytics', 'Unlimited API', '24/7 Priority support'],
};

const ROLE_OPTIONS = ['Trader', 'Investor', 'Institutional', 'Other'];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Singapore', 'Hong Kong', 'Japan', 'Germany', 'France', 'Other'
];

const PlanDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tier, billing } = useParams<{ tier: string; billing: string }>();
  const { user, isAuthenticated } = useAuth();
  const { subscriptionDetails } = useSubscription();
  
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    email: '',
    role: '',
    phoneNumber: '',
    country: 'India',
    agreeToTerms: false,
    gdprConsent: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const selectedTier = tier?.toUpperCase() as SubscriptionTier;
  const isAnnual = billing === 'annual';
  const price = isAnnual ? PRICING_DATA[selectedTier]?.annual : PRICING_DATA[selectedTier]?.monthly;
  const features = PLAN_FEATURES[selectedTier] || [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      navigate('/review-payment', {
        state: {
          planDetails: {
            tier: selectedTier,
            billing: billing,
            price: price,
            features: features,
          },
          userInfo: formData,
        },
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedTier || !PRICING_DATA[selectedTier]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Plan</h1>
          <button
            onClick={() => navigate('/pricing')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Plan Details & Information</h1>
            <p className="mt-2 text-gray-600">Complete your information to continue with your subscription</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  {selectedTier} Plan - {isAnnual ? 'Annual' : 'Monthly'}
                </h2>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ₹{price.toLocaleString('en-IN')}
                  <span className="text-lg font-normal text-gray-600">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                {isAnnual && selectedTier !== 'FREE' && (
                  <p className="text-sm text-green-600 mb-4">
                    Save 20% with annual billing!
                  </p>
                )}
                
                <h3 className="font-semibold text-gray-900 mb-2">Features included:</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role/Title (Optional)
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your role</option>
                    {ROLE_OPTIONS.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a> *
                    </label>
                  </div>
                  {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="gdprConsent"
                      name="gdprConsent"
                      checked={formData.gdprConsent}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="gdprConsent" className="ml-2 text-sm text-gray-700">
                      I consent to processing of my personal data for marketing purposes
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/pricing')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Back to Pricing
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.agreeToTerms}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsPage;