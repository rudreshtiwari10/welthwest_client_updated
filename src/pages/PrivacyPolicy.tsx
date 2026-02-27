import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const PrivacyPolicy: React.FC = () => {
  usePageMeta({
    title: 'Privacy Policy – WelthWest',
    description:
      'Read the WelthWest Privacy Policy to understand how we collect, use, and protect your data on our AI-powered market intelligence platform.',
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
        
            
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This Privacy Policy explains how WelthWest collects, uses, and protects your information when you use our AI-powered financial intelligence platform. By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                WelthWest is a demonstration Platform that provides AI-driven market analysis, backtesting tools, and financial insights. We are committed to transparency and protecting your personal information.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                2.1 Personal Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Name and contact information (email address)</li>
                <li>Account credentials and authentication data (Encrypted)</li>
                <li>Profile information and preferences</li>
                <li>Usage data and interaction with our platform</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                2.2 Financial Data
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Stock symbols and trading preferences</li>
                <li>Backtesting strategies and results</li>
                <li>AI analysis queries and responses</li>
                <li>Portfolio information (if provided)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                2.3 Technical Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system and platform</li>
                <li>Usage patterns and analytics data</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Provide and maintain our financial intelligence platform</li>
                <li>Process AI analysis requests and generate insights</li>
                <li>Execute backtesting strategies and provide results</li>
                <li>Personalize your experience and recommendations</li>
                <li>Improve our services and develop new features</li>
                <li>Communicate with you about updates and changes</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations and regulations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> When you explicitly authorize us to share specific information</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Secure hosting and infrastructure management</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Data Retention
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We retain your personal information only for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our services and user experience</li>
              </ul>
              
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Your Rights and Choices
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
                <li><strong>Security Cookies:</strong> Protect against fraud and abuse</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                You can control cookie preferences through your browser settings, though disabling certain cookies may affect platform functionality.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                9. Third-Party Services
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our platform integrates with third-party services for enhanced functionality:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Market Data Providers:</strong> Yahoo Finance, Upstox for real-time financial data</li>
                <li><strong>AI Services:</strong> OpenAI, Claude, and other AI model providers</li>
                <li><strong>Payment Processors:</strong> Razorpay for subscription management</li>
                <li><strong>Analytics:</strong> Google Analytics for platform insights</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                These services have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                WelthWest is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* International Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                13. Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> contact@welthwest.com<br />
                  <strong>Address:</strong> WelthWest Privacy Team<br />
                  <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                14. Disclaimer
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> WelthWest is a demonstration Platform. The information provided is not financial advice. Always do your own research before making investment decisions. This Privacy Policy applies to our platform usage and does not constitute legal advice.
                </p>
              </div>
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

export default PrivacyPolicy;
