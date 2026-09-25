import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '../../store/api/authApi.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { ROUTES } from '../../constants/routes.js';
import { USER_ROLES } from '../../constants/roles.js';
import { getDefaultRouteForRole } from '../../utils/authNavigation.js';
import templeEmblem from '../../assets/devasetu_temple_emblem.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      const response = await loginUser({ email: email.trim(), password }).unwrap();
      const user = response.data?.user || response.user;

      dispatch(setCredentials({ user }));

      // If user came from a protected sub-route, preserve destination only if it matches their authenticated role
      const from = location.state?.from?.pathname;
      let targetRoute = getDefaultRouteForRole(user);

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
    } catch (err) {
      setErrorMessage(
        err?.data?.message || err?.message || 'Invalid email or password. Please verify your credentials.'
      );
    }
  };

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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="spiritual-input pl-9 text-xs"
                autoComplete="email"
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="spiritual-input pl-9 pr-10 text-xs"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spiritual-subtle hover:text-spiritual-text transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
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
