import React, { useState, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks.js';
import { useLoginMutation } from '../../store/api/authApi.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { ROUTES } from '../../constants/routes.js';
import { USER_ROLES } from '../../constants/roles.js';
import type { AuthenticatedUser } from '@shared/types/index.js';

export const AuthorityLogin = (): ReactElement => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter temple authority email and password');
      return;
    }

    try {
      const response = await loginUser({ email, password }).unwrap();
      const user = (response.data?.user || (response as unknown as { user: AuthenticatedUser }).user) as AuthenticatedUser;

      if (user.role !== USER_ROLES.TEMPLE_AUTHORITY && user.role !== USER_ROLES.ADMIN) {
        setErrorMessage('Access denied: Only authorized temple administration accounts can sign in here.');
        return;
      }

      dispatch(setCredentials({ user }));

      if (user.role === USER_ROLES.ADMIN) {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else if (user.mustChangePassword) {
        navigate(ROUTES.AUTHORITY_SETTINGS, { state: { forcePasswordChange: true }, replace: true });
      } else {
        navigate(ROUTES.AUTHORITY_DASHBOARD, { replace: true });
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setErrorMessage(errorObj?.data?.message || errorObj?.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spiritual-bg px-4 py-12">
      <div className="spiritual-card p-8 max-w-md w-full bg-white shadow-spiritual-lg border border-spiritual-border text-center">
        
        {/* Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-spiritual-primaryLight border border-spiritual-border flex items-center justify-center text-spiritual-primary mx-auto mb-4 shadow-spiritual-sm">
          <Building className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-spiritual-text mb-1">
          Temple Authority Portal
        </h1>
        <p className="text-xs text-spiritual-muted mb-6">
          Authorized temple administrators and trustees sign in.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-spiritual-accentLight border border-spiritual-accent/20 flex items-start gap-2.5 text-xs text-spiritual-accent text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Authority Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Authority Contact Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="trustee@temple.org"
                className="spiritual-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="spiritual-input pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-spiritual-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Enter Management Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Subtitle / Onboarding Redirect */}
        <div className="mt-8 pt-4 border-t border-spiritual-border text-xs text-spiritual-muted">
          Want to bring your temple to DevaSetu?{' '}
          <Link
            to={ROUTES.REGISTER_TEMPLE}
            className="text-spiritual-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            Register Your Temple <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;
