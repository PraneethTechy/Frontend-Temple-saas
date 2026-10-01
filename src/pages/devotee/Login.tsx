import React, { useState, useEffect, useRef, type ReactElement } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks.js';
import { useLoginMutation, useGoogleLoginMutation } from '../../store/api/authApi.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { ROUTES } from '../../constants/routes.js';
import { USER_ROLES } from '../../constants/roles.js';
import { getDefaultRouteForRole } from '../../utils/authNavigation.js';
import type { AuthenticatedUser } from '@shared/types/index.js';
import templeEmblem from '../../assets/devasetu_temple_emblem.png';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export const Login = (): ReactElement => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isGoogleProcessing, setIsGoogleProcessing] = useState<boolean>(false);

  const [loginUser, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleApiLoading }] = useGoogleLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle Google OAuth Credential response
  const handleGoogleCredentialResponse = async (response: { credential: string }): Promise<void> => {
    if (!response.credential) {
      setErrorMessage('Google authentication credential was not received.');
      return;
    }

    setIsGoogleProcessing(true);
    setErrorMessage('');

    try {
      const apiRes = await googleLogin({ credential: response.credential }).unwrap();
      const user = (apiRes.data?.user || (apiRes as unknown as { user: AuthenticatedUser }).user) as AuthenticatedUser;

      dispatch(setCredentials({ user }));

      // Preserve destination if navigating from a protected devotee route
      const locationState = location.state as LocationState | null;
      const from = locationState?.from?.pathname;
      let targetRoute: string = getDefaultRouteForRole(user);

      if (from && !from.includes('/login') && from !== '/unauthorized' && from !== '/') {
        if (user.role === USER_ROLES.DEVOTEE && !from.startsWith('/admin') && !from.startsWith('/authority')) {
          targetRoute = from;
        }
      }

      navigate(targetRoute, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setErrorMessage(
        errorObj?.data?.message || errorObj?.message || 'Google sign-in failed. Please verify credentials or try again.'
      );
    } finally {
      setIsGoogleProcessing(false);
    }
  };

  // Initialize Google Identity Services (GIS) button
  useEffect(() => {
    if (!clientId) {
      return;
    }

    const initGIS = (): boolean => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Clear prior rendered button to prevent duplication
          googleButtonRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: Math.min(384, window.innerWidth - 64),
          });
          return true;
        } catch (err) {
          console.warn('[GIS Render Failed]:', err);
          return false;
        }
      }
      return false;
    };

    if (!initGIS()) {
      const interval = setInterval(() => {
        if (initGIS()) {
          clearInterval(interval);
        }
      }, 200);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      const response = await loginUser({ email: email.trim(), password }).unwrap();
      const user = (response.data?.user || (response as unknown as { user: AuthenticatedUser }).user) as AuthenticatedUser;

      dispatch(setCredentials({ user }));

      // If user came from a protected sub-route, preserve destination only if it matches their authenticated role
      const locationState = location.state as LocationState | null;
      const from = locationState?.from?.pathname;
      let targetRoute: string = getDefaultRouteForRole(user);

      if (from && !from.includes('/login') && from !== '/unauthorized' && from !== '/') {
        if (user.role === USER_ROLES.DEVOTEE && !from.startsWith('/admin') && !from.startsWith('/authority')) {
          targetRoute = from;
        } else if (user.role === USER_ROLES.ADMIN && from.startsWith('/admin')) {
          targetRoute = from;
        } else if (
          user.role === USER_ROLES.TEMPLE_AUTHORITY &&
          from.startsWith('/authority') &&
          !user.mustChangePassword
        ) {
          targetRoute = from;
        }
      }

      navigate(targetRoute, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setErrorMessage(
        errorObj?.data?.message || errorObj?.message || 'Invalid email or password. Please verify your credentials.'
      );
    }
  };

  const isAnyLoading = isLoading || isGoogleProcessing || isGoogleApiLoading;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="spiritual-card p-6 sm:p-8 max-w-md w-full bg-white shadow-spiritual-md border border-spiritual-border">
        
        {/* Emblem & Universal Title */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF9EE] to-[#F5EAD4] border border-[#C9922E]/30 flex items-center justify-center p-2 mx-auto mb-3 shadow-sm">
          <img src={templeEmblem} alt="DevaSetu Emblem" className="w-full h-full object-contain" />
        </div>
        
        <h1 className="text-2xl font-serif font-bold text-center text-spiritual-text mb-1">
          Sign In to DevaSetu
        </h1>
        <p className="text-xs text-spiritual-muted text-center mb-6">
          Access your Devotee account, Temple Administration, or Management Console.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-spiritual-accentLight border border-spiritual-accent/20 flex items-start gap-2.5 text-xs text-spiritual-accent">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Universal Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="spiritual-input pl-9 text-xs"
                autoComplete="email"
                disabled={isAnyLoading}
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
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="spiritual-input pl-9 pr-10 text-xs"
                autoComplete="current-password"
                disabled={isAnyLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spiritual-subtle hover:text-spiritual-text transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isAnyLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnyLoading}
            className="btn-spiritual-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-spiritual-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-spiritual-muted font-medium">OR</span>
          </div>
        </div>

        {/* Continue with Google (Devotee Only) */}
        <div className="w-full flex flex-col items-center">
          <div
            ref={googleButtonRef}
            className={`w-full flex justify-center min-h-[44px] ${isAnyLoading ? 'opacity-50 pointer-events-none' : ''}`}
          />
          {(isGoogleProcessing || isGoogleApiLoading) && (
            <div className="flex items-center gap-2 mt-2.5 text-xs text-spiritual-primary font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-spiritual-primary" />
              <span>Authenticating with Google...</span>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-spiritual-border space-y-2 text-center text-xs text-spiritual-muted">
          <div>
            New to DevaSetu?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="text-spiritual-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              Create Devotee Account <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-[11px] text-spiritual-subtle">
            Temple Trust or Authority?{' '}
            <Link
              to={ROUTES.REGISTER_TEMPLE}
              className="text-spiritual-accent font-medium hover:underline"
            >
              Register Your Temple →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
