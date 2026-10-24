import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#EAF0EB] text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">password</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-primary">
            Reset Password
          </h1>
          <p className="text-body-sm text-secondary mt-1">
            Enter your verified collegiate email to receive secure recovery credentials.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-10 h-10 rounded-full bg-[#EAF0EB] text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-xl">mark_email_read</span>
            </div>
            <p className="text-body-sm text-on-surface">
              If an academic account exists for <strong className="font-mono text-primary">{email}</strong>, a password reset authorization link has been dispatched.
            </p>
            <Link
              to="/auth/sign-in"
              className="inline-block px-4 py-2 bg-primary-container text-white rounded-lg text-label-md font-medium"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1" htmlFor="reset-email">
                Collegiate Email Address <span className="text-error">*</span>
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@university.edu"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-container text-white rounded-lg text-label-md font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              <span>Send Recovery Email</span>
            </button>

            <div className="text-center">
              <Link to="/auth/sign-in" className="text-body-sm text-primary hover:underline font-semibold">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
