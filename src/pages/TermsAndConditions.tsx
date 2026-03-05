import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const TermsAndConditions: React.FC = () => {
  usePageMeta({
    title: 'Terms & Conditions – WelthWest',
    description:
      'Read the WelthWest Terms and Conditions governing use of our AI-powered market analytics platform, including disclaimers for financial data.',
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms and Conditions
          </h1>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please read these terms carefully before using WelthWest services.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By accessing and using WelthWest, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                WelthWest is an AI-powered financial intelligence platform that provides market analysis, backtesting tools, and investment insights. These terms govern your use of our platform and services.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Service Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                WelthWest provides the following services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>AI Market Analysis:</strong> Machine learning-powered market regime detection and trend analysis</li>
                <li><strong>Backtesting Tools:</strong> Historical strategy testing and performance analysis</li>
                <li><strong>Financial Data:</strong> Real-time and historical market data from various sources</li>
                <li><strong>AI Chat Assistant:</strong> Conversational interface for investment insights and analysis</li>
                <li><strong>Technical Indicators:</strong> Advanced charting and technical analysis tools</li>
                <li><strong>Portfolio Analytics:</strong> Performance tracking and risk management tools</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. User Accounts and Registration
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                3.1 Account Creation
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your account credentials secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                3.2 Account Security
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Acceptable Use Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You agree to use our services only for lawful purposes and in accordance with these terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Use automated systems to access the service (except as permitted)</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </section>

            {/* Subscription and Payment */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Subscription and Payment Terms
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                5.1 Free Tier
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We offer a free tier with limited features and usage quotas. Free tier users are subject to daily limits on:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Backtesting operations (100 per day)</li>
                <li>AI analysis queries (100 per day)</li>
                <li>Market data access (delayed data only)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                5.2 Paid Subscriptions
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Premium features require a paid subscription. Subscription terms include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Monthly or annual billing cycles</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Pro-rated refunds for annual plans (first 30 days)</li>
                <li>Price changes with 30-day notice</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Intellectual Property Rights
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The service and its original content, features, and functionality are owned by WelthWest.
              </p>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                6.1 Your Content
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You retain ownership of content you create using our platform, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Backtesting strategies and results</li>
                <li>AI analysis queries and custom prompts</li>
                <li>Portfolio configurations and watchlists</li>
                <li>User-generated analysis and insights</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                By using our services, you grant us a limited license to use your content for service improvement and analytics purposes.
              </p>
            </section>

            {/* Data and Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Data and Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We collect and process data to provide our services, improve user experience, and ensure platform security. You consent to such processing and warrant that all data provided is accurate.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. Disclaimers and Limitations
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Financial Disclaimer:</strong> WelthWest is a demonstration Platform. The information provided is not financial advice. Always do your own research before making investment decisions.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                8.1 Service Availability
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We strive to maintain high service availability but do not guarantee uninterrupted access. The service is provided "as is" without warranties of any kind.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                8.2 Data Accuracy
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                While we strive for accuracy, market data and AI analysis may contain errors or delays. We are not responsible for decisions made based on this information.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                8.3 Third-Party Services
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our platform integrates with third-party services. We are not responsible for their availability, accuracy, or terms of service.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To the maximum extent permitted by law, WelthWest shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Investment losses or missed opportunities</li>
                <li>Service interruptions or technical issues</li>
                <li>Third-party actions or content</li>
                <li>Security breaches or data loss</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Our total liability shall not exceed the amount paid by you for our services in the 12 months preceding the claim.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                10. Termination
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                10.1 Termination by You
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Your access to the service will cease immediately</li>
                <li>Your data will be deleted within 30 days</li>
                <li>Any active subscriptions will be cancelled</li>
                <li>Refunds will be processed according to our policy</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                10.2 Termination by Us
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We may terminate or suspend your account for violations of these terms, fraudulent activity, or extended periods of inactivity. We will provide reasonable notice except in cases of serious violations.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                11. Governing Law and Disputes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These terms are governed by the laws of India. Any disputes shall be resolved through:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Direct communication and negotiation</li>
                <li>Mediation if initial resolution fails</li>
                <li>Arbitration as a final resolution method</li>
              </ol>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                You agree to resolve disputes individually and waive any right to participate in class action lawsuits.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                12. Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We reserve the right to modify these terms at any time. Material changes will be communicated via email and posted on our platform. Your continued use after changes constitutes acceptance of the new terms. If you disagree with changes, you must stop using our services.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                13. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For questions about these terms or to exercise your rights, contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> contact@welthwest.com<br />
                  <strong>Address:</strong> WelthWest Team<br />
                  <strong>Response Time:</strong> We aim to respond to all inquiries within 24 hours
                </p>
              </div>
            </section>

            {/* Severability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                14. Severability
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                If any provision of these terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these terms will otherwise remain in full force and effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                15. Entire Agreement
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                These terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and WelthWest regarding the use of our services. These terms supersede all prior agreements and understandings.
              </p>
            </section>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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

export default TermsAndConditions;
