/**
 * SecurityPage – /security
 *
 * E-E-A-T: Trustworthiness signal. Describes hosting, encryption, access
 * controls, and data handling so users and crawlers can see that WelthWest
 * takes security seriously.
 *
 * SEO req (MD §5): Dedicated /security or /trust page visible without JS.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const SecurityPage: React.FC = () => {
  usePageMeta({
    title: 'Security & Trust – WelthWest',
    description:
      'Learn how WelthWest protects your data with HTTPS, encryption, access controls, and regular security reviews. Hosting, compliance, and data-handling details.',
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-gray-800 dark:text-gray-200">
      {/* ── Page header ── */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Security &amp; Trust
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          WelthWest handles real financial data. Here we explain exactly how we
          keep your account, queries, and personal information secure.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-10">

        {/* ── Hosting & Infrastructure ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Hosting &amp; Infrastructure
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              {/*
                TODO: Confirm exact cloud provider and region with your DevOps team
                and update the placeholder below before publishing.
              */}
              The WelthWest backend is hosted on a leading cloud provider
              (TODO: e.g. AWS ap-south-1 / Mumbai region) using managed compute
              and database services.
            </li>
            <li>
              Static frontend assets are served via a global CDN for low-latency
              delivery across India.
              {/* TODO: Name the CDN (e.g. Cloudflare, AWS CloudFront) once confirmed. */}
            </li>
            <li>
              Infrastructure is managed with automated deployment pipelines;
              production deployments require code review approval.
            </li>
            <li>
              Database backups are taken daily and retained for 30 days.
              {/* TODO: Confirm backup retention policy with engineering. */}
            </li>
          </ul>
        </section>

        {/* ── Encryption ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Encryption
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>In transit:</strong> All communication between your browser
              and our servers uses HTTPS (TLS 1.2+). HTTP requests are automatically
              redirected to HTTPS.
            </li>
            <li>
              <strong>At rest:</strong> User passwords are never stored in plain text
              — they are hashed using bcrypt with an appropriate cost factor.
              {/* TODO: Confirm database-level encryption (e.g. AES-256) with DevOps. */}
            </li>
            <li>
              <strong>Authentication tokens:</strong> Session tokens are short-lived
              JWTs stored in memory or secure HTTP-only cookies; they are invalidated
              on logout.
            </li>
          </ul>
        </section>

        {/* ── Access Control ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Control
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              Production database and server access is restricted to a small team
              on a need-to-know basis, protected by SSH key authentication and MFA.
            </li>
            <li>
              Role-based access control (RBAC) ensures regular users cannot access
              admin or other users' data.
            </li>
            <li>
              API endpoints validate and sanitise all inputs; rate limiting is applied
              to prevent abuse.
            </li>
          </ul>
        </section>

        {/* ── Third-Party Services ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Third-Party Services
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            WelthWest integrates with the following trusted third-party services.
            Each processes data under its own security and privacy policies:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Google OAuth</strong> — optional sign-in via Google account</li>
            <li><strong>Razorpay</strong> — payment processing (we never store card details)</li>
            <li><strong>Google Analytics (GA4)</strong> — anonymised usage analytics</li>
            <li><strong>OpenAI / Anthropic Claude</strong> — AI language model APIs for the WelthAI Assistant feature</li>
            {/*
              TODO: Add any additional third-party integrations (e.g. data vendors,
              email service, error tracking like Sentry) once confirmed with engineering.
            */}
          </ul>
        </section>

        {/* ── Vulnerability & Incident ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Vulnerability Reporting &amp; Incidents
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            If you discover a security vulnerability in the WelthWest platform,
            please report it responsibly:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              Email:{' '}
              <a
                href="mailto:contact@welthwest.com"
                className="text-primary-600 dark:text-primary-400 underline"
              >
                contact@welthwest.com
              </a>{' '}
              with subject line "Security Disclosure".
              {/* TODO: Create a dedicated security@welthwest.com alias for responsible disclosure. */}
            </li>
            <li>
              We aim to acknowledge reports within 48 hours and resolve confirmed
              critical issues within 7 days.
            </li>
            <li>
              We do not currently operate a formal bug-bounty programme but recognise
              responsible disclosures publicly (with your consent).
              {/* TODO: Consider formalising a bug-bounty programme as the platform scales. */}
            </li>
          </ul>
        </section>

        {/* ── Certifications ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Certifications &amp; Compliance
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            WelthWest is an early-stage platform. We currently hold:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            {/*
              TODO: List any actual certifications (ISO 27001, SOC 2, etc.) or
              programme memberships (AWS Activate, incubator, etc.) once obtained.
              Do not list certifications you do not hold.
            */}
            <li>[TODO: List any incubator affiliations, cloud programme memberships, or audit results here.]</li>
            <li>
              We aspire to achieve formal security certification as the platform
              grows. This page will be updated accordingly.
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            WelthWest is not currently registered as a SEBI-regulated investment advisor.
            Our platform provides analytical tools only.
          </p>
        </section>
      </div>

      {/* ── Navigation links ── */}
      <nav className="mt-8 flex flex-wrap gap-3 justify-center text-sm">
        <Link to="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">
          Privacy Policy
        </Link>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <Link to="/terms-and-conditions" className="text-primary-600 dark:text-primary-400 hover:underline">
          Terms &amp; Conditions
        </Link>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <Link to="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
          Contact Us
        </Link>
      </nav>
    </div>
  );
};

export default SecurityPage;
