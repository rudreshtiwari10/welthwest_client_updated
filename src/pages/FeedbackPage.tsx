import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { feedbackService } from '../services/api';

interface FeedbackForm {
  overallExperience: string;
  recommendation: string;
  navigation: string;
  visualDesign: string;
  backtestAccuracy: string;
  aiInsights: string;
  bugs: string;
  missingFeature: string;
  missingFeatureOther: string;
  oneThingToChange: string;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

const FeedbackPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [feedback, setFeedback] = useState<FeedbackForm>({
    overallExperience: '',
    recommendation: '',
    navigation: '',
    visualDesign: '',
    backtestAccuracy: '',
    aiInsights: '',
    bugs: '',
    missingFeature: '',
    missingFeatureOther: '',
    oneThingToChange: ''
  });

  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '',
    email: user?.email || '',
    phone: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FeedbackForm, value: string) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!userInfo.name.trim()) {
        throw new Error('Name is required');
      }
      if (!userInfo.email.trim()) {
        throw new Error('Email is required');
      }

      // Convert form data to the API format
      const responses = [
        {
          question: 'How would you rate your overall experience?',
          answer: feedback.overallExperience,
          question_type: 'rating',
          options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
        },
        {
          question: 'How likely are you to recommend this platform?',
          answer: feedback.recommendation,
          question_type: 'rating',
          options: ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely']
        },
        {
          question: 'How intuitive was the platform to navigate?',
          answer: feedback.navigation,
          question_type: 'rating',
          options: ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult']
        },
        {
          question: 'How do you rate the visual design?',
          answer: feedback.visualDesign,
          question_type: 'rating',
          options: ['Love it', 'Like it', 'Neutral', 'Dislike it', 'Hate it']
        },
        {
          question: 'How accurate did the backtest results feel?',
          answer: feedback.backtestAccuracy,
          question_type: 'rating',
          options: ['Very Accurate', 'Accurate', 'Neutral', 'Inaccurate', 'Very Inaccurate']
        },
        {
          question: 'How helpful were the AI insights?',
          answer: feedback.aiInsights,
          question_type: 'rating',
          options: ['Very Helpful', 'Helpful', 'Neutral', 'Not Helpful', 'Confusing']
        },
        {
          question: 'Did you encounter any bugs? Please describe:',
          answer: feedback.bugs,
          question_type: 'textarea'
        },
                 {
           question: 'What\'s the most important missing feature?',
           answer: feedback.missingFeature === 'Other' ? feedback.missingFeatureOther : feedback.missingFeature,
           question_type: 'single_choice',
           options: ['More indicators', 'Better charts', 'Mobile app', 'Broker integration', 'Other']
         },
         {
           question: 'One thing you\'d change:',
           answer: feedback.oneThingToChange,
           question_type: 'textarea'
         }
      ].filter(response => response.answer.trim() !== ''); // Only include answered questions

      const feedbackData = {
        user_info: {
          name: userInfo.name.trim(),
          email: userInfo.email.trim(),
          phone: userInfo.phone.trim() || undefined
        },
        form_type: 'Platform Feedback',
        responses: responses,
        form_metadata: {
          version: '1.0',
          form_title: 'WelthWest Platform Experience Survey',
          submitted_from: 'feedback_page',
          user_authenticated: isAuthenticated
        }
      };

      const result = await feedbackService.submitFeedback(feedbackData);
      console.log('Feedback submitted successfully:', result);
      setIsSubmitted(true);

    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setSubmitError( 'Please fill out missing fields');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRadioGroup = (
    field: keyof FeedbackForm,
    question: string,
    options: string[]
  ) => (
    <div className="mb-6">
      <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
        {question}
      </p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name={field}
              value={option}
              checked={feedback[field] === option}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-gray-700 dark:text-gray-300">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderTextInput = (
    field: keyof FeedbackForm,
    label: string,
    placeholder: string = '',
    type: string = 'text'
  ) => (
    <div className="mb-6">
      <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={feedback[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Thank You for Your Feedback!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your feedback has been submitted successfully. We appreciate you taking the time to share your experience with us.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              You'll receive a confirmation email shortly. We review all feedback carefully and may reach out if you've opted for follow-up contact.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Platform Feedback
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Help us improve WelthWest by sharing your experience. Your feedback is invaluable in making our platform better for everyone.
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* User Information Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                Your Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => handleUserInfoChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleUserInfoChange('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
            {/* Overall Experience Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                Overall Experience
              </h2>
              
              {renderRadioGroup(
                'overallExperience',
                'How would you rate your overall experience?',
                ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
              )}
              
              {renderRadioGroup(
                'recommendation',
                'How likely are you to recommend this platform?',
                ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely']
              )}
            </div>

            {/* User Interface & Design Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                User Interface & Design
              </h2>
              
              {renderRadioGroup(
                'navigation',
                'How intuitive was the platform to navigate?',
                ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult']
              )}
              
              {renderRadioGroup(
                'visualDesign',
                'How do you rate the visual design?',
                ['Love it', 'Like it', 'Neutral', 'Dislike it', 'Hate it']
              )}
            </div>

            {/* Core Features Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                Core Features
              </h2>
              
              {renderRadioGroup(
                'backtestAccuracy',
                'How accurate did the backtest results feel?',
                ['Very Accurate', 'Accurate', 'Neutral', 'Inaccurate', 'Very Inaccurate']
              )}
              
              {renderRadioGroup(
                'aiInsights',
                'How helpful were the AI insights?',
                ['Very Helpful', 'Helpful', 'Neutral', 'Not Helpful', 'Confusing']
              )}
            </div>

            {/* Bugs Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                Platform Issues
              </h2>
              
              {renderTextInput(
                'bugs',
                'Did you encounter any bugs? Please describe:',
                'Describe any issues you encountered...'
              )}
            </div>

            {/* Value & Features Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                Value & Features
              </h2>
              
              {renderRadioGroup(
                'missingFeature',
                'What\'s the most important missing feature?',
                ['More indicators', 'Better charts', 'Mobile app', 'Broker integration', 'Other']
              )}
              
              {feedback.missingFeature === 'Other' && (
                <div className="mt-4">
                  {renderTextInput(
                    'missingFeatureOther',
                    'Please specify:',
                    'Describe the missing feature...'
                  )}
                </div>
              )}
            </div>



            {/* Optional Fields */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                Additional Information
              </h2>
              
              {renderTextInput(
                'oneThingToChange',
                'One thing you\'d change:',
                'Tell us what you would improve...'
              )}
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 dark:text-red-300">{submitError}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-8 py-3 text-white text-lg font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
