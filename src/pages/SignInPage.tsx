import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, switchUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = (role: 'ta' | 'admin' | 'student') => {
    switchUserRole(role);
    navigate(from, { replace: true });
  };

  return (
    <main className="max-w-[1320px] mx-auto px-gutter md:px-margin py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#EAF0EB] text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">local_library</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-primary">
            Sign In to CampusNotes
          </h1>
          <p className="text-body-sm text-secondary mt-1">
            Access protected archival deposits, submit resources, and manage stacks.
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
            <label className="block text-label-sm font-semibold text-on-surface mb-1" htmlFor="email">
              University Email Address <span className="text-error">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. marcus.shaw@university.edu"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-label-sm font-semibold text-on-surface" htmlFor="password">
                Password <span className="text-error">*</span>
              </label>
              <Link to="/auth/forgot-password" className="text-caption font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-container text-white rounded-lg text-label-md font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            <span>Sign In</span>
          </button>
        </form>

        {/* Quick Testing Personas */}
        <div className="mt-6 pt-4 border-t border-outline-variant">
          <p className="text-caption font-caption text-secondary uppercase tracking-wider mb-2 font-semibold">
            Instant Test Credentials
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('ta')}
              className="p-2 bg-surface-container-low hover:bg-[#EAF0EB] text-primary border border-outline-variant/60 rounded flex flex-col text-left transition-colors"
            >
              <span className="font-semibold">Marcus S. (TA)</span>
              <span className="text-[10px] text-secondary">Verified contributor</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="p-2 bg-surface-container-low hover:bg-amber-50 text-amber-900 border border-outline-variant/60 rounded flex flex-col text-left transition-colors"
            >
              <span className="font-semibold">Dr. Allen (Admin)</span>
              <span className="text-[10px] text-secondary">Senate Moderator</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-body-sm text-secondary">
          Don't have an academic account?{' '}
          <Link to="/auth/register" state={{ from }} className="font-semibold text-primary hover:underline">
            Register as a Scholar
          </Link>
        </div>
      </div>
    </main>
  );
};
