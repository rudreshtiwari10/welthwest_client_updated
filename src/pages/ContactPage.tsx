/**
 * ContactPage – /contact
 *
 * E-E-A-T: Trustworthiness signal. Shows real contact details and a form.
 * SEO req (MD §5): Email, phone (optional), city/country, contact form.
 *
 * TODO (backend): Wire the form submit handler to a real email endpoint or
 * form-handling service (e.g. Formspree, EmailJS, or a /api/contact Flask route
 * on the WelthWest backend). Currently the form only validates client-side.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormState = { name: '', email: '', subject: '', message: '' };

const ContactPage: React.FC = () => {
  usePageMeta({
    title: 'Contact WelthWest – Get in Touch',
    description:
      'Contact the WelthWest team for support, partnerships, or general enquiries. Email us at contact@welthwest.com or use the form below.',
  });

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setSending(true);

    /*
     * TODO: Replace the mock delay below with a real API call, e.g.:
     *
     *   const response = await fetch('/api/contact', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(form),
     *   });
     *   if (!response.ok) throw new Error('Failed to send message');
     *
     * Or use Formspree:
     *   const response = await fetch('https://formspree.io/f/<YOUR_ID>', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(form),
     *   });
     *
     * Also add spam protection (honeypot field or Turnstile CAPTCHA).
     */
    await new Promise((res) => setTimeout(res, 1000)); // mock delay

    setSending(false);
    setSubmitted(true);
    setForm(INITIAL_FORM);
  };

  const socialLinks = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/108673007', label: 'WelthWest on LinkedIn' },
    { name: 'YouTube', url: 'https://www.youtube.com/@WelthWest', label: '@WelthWest on YouTube' },
    { name: 'X (Twitter)', url: 'https://x.com/WelthWest', label: '@WelthWest on X' },
    { name: 'Instagram', url: 'https://www.instagram.com/welthwest', label: '@welthwest on Instagram' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl text-gray-800 dark:text-gray-200">
      {/* ── Page header ── */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Have a question, partnership enquiry, or feature request? We'd love to hear
          from you. We typically respond within 6–10 hours on business days.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-10">
        {/* ── Left: Contact details ── */}
        <aside>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
            Contact Details
          </h2>

          <address className="not-italic space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">
                {/* Email icon */}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Email</p>
                <a
                  href="mailto:contact@welthwest.com"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  contact@welthwest.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">
                {/* Location icon */}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Location</p>
                {/* TODO: Confirm exact address / city with the founder and update. */}
                <p>Thane, Maharashtra, India</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-primary-600 dark:text-primary-400 mt-0.5">
                {/* Clock icon */}
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Response Time</p>
                <p>6–10 hours on business days (IST)</p>
              </div>
            </div>
          </address>

          {/* Social links */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Follow Us
          </h2>
          <ul className="space-y-3">
            {socialLinks.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  <span className="font-medium w-24">{s.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Trust links */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Legal &amp; Security</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link to="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="text-primary-600 dark:text-primary-400 hover:underline">Terms &amp; Conditions</Link>
              <Link to="/security" className="text-primary-600 dark:text-primary-400 hover:underline">Security</Link>
            </div>
          </div>
        </aside>

        {/* ── Right: Contact form ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
            Send a Message
          </h2>

          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 text-center">
              <p className="text-green-700 dark:text-green-300 font-semibold text-lg mb-2">
                Message sent!
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm">
                {/*
                  NOTE: This confirmation is shown after the mock delay.
                  Once the backend is wired, this will confirm real delivery.
                */}
                Thank you for reaching out. We'll get back to you within 6–10 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">Select a subject</option>
                  <option value="support">Platform Support</option>
                  <option value="pricing">Pricing &amp; Plans</option>
                  <option value="partnership">Partnership / Business</option>
                  <option value="media">Media Enquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you need help with..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-md text-sm"
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>

              <p className="text-xs text-gray-400 dark:text-gray-500">
                {/*
                  TODO: Add a CAPTCHA or honeypot field here before going to production
                  to prevent spam submissions.
                */}
                We respect your privacy. Your details are only used to respond to
                your enquiry.{' '}
                <Link to="/privacy-policy" className="underline hover:text-primary-500">
                  Privacy Policy
                </Link>
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
