import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedHonorCode, setAgreedHonorCode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedHonorCode) {
      setError('You must accept the Collegiate Academic Honor Code.');
      return;
    }

    setLoading(true);
    const res = await signUp(email, password, displayName);
    setLoading(false);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#EAF0EB] text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-primary">
            Create Scholar Profile
          </h1>
          <p className="text-body-sm text-secondary mt-1">
            Join the open-access academic repository to publish notes and build stacks.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-error rounded-lg text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-1">
              Full Scholar Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-1">
              Collegiate Email Address <span className="text-error">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. maya.lin@student.edu"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-1">
              Create Password <span className="text-error">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-label-sm font-semibold text-on-surface mb-1">
              Confirm Password <span className="text-error">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreedHonorCode}
              onChange={(e) => setAgreedHonorCode(e.target.checked)}
              className="mt-1 text-primary focus:ring-primary rounded border-outline"
            />
            <span className="text-caption text-secondary">
              I agree to adhere to the university{' '}
              <Link to="/honor-code" className="text-primary underline">
                Academic Honor Code
              </Link>{' '}
              and confirm that my submissions will not contain unauthorized examination materials.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-container text-white rounded-lg text-label-md font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            <span>Complete Registration</span>
          </button>
        </form>

        <div className="mt-6 text-center text-body-sm text-secondary">
          Already registered?{' '}
          <Link to="/auth/sign-in" state={{ from }} className="font-semibold text-primary hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </main>
  );
};
