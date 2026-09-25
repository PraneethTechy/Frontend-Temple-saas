import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useLoginMutation } from '../../store/api/authApi.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { ROUTES } from '../../constants/routes.js';
import { USER_ROLES } from '../../constants/roles.js';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter administrative email and password');
      return;
    }

    try {
      const response = await loginUser({ email, password }).unwrap();
      const user = response.data?.user || response.user;

      if (user.role !== USER_ROLES.ADMIN) {
        setErrorMessage('Access denied: Only system administrators can access this console.');
        return;
      }

      dispatch(setCredentials({ user }));
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    } catch (err) {
      setErrorMessage(err?.data?.message || err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spiritual-bg px-4 py-12">
      <div className="spiritual-card p-8 max-w-md w-full bg-white shadow-spiritual-lg border border-spiritual-border text-center">
        
        {/* Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-spiritual-accentLight border border-spiritual-accent/20 flex items-center justify-center text-spiritual-accent mx-auto mb-4 shadow-spiritual-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-spiritual-text mb-1">
          Admin Console Login
        </h1>
        <p className="text-xs text-spiritual-muted mb-6">
          Restricted access for DevaSetu platform administrators only.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-spiritual-accentLight border border-spiritual-accent/20 flex items-start gap-2.5 text-xs text-spiritual-accent text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@devasetu.org"
                className="spiritual-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-spiritual-text mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-subtle" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="spiritual-input pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-spiritual-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 mt-2 bg-spiritual-accent hover:bg-spiritual-accentHover disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Policy Notice (No Signup Link) */}
        <div className="mt-8 pt-4 border-t border-spiritual-border text-[11px] text-spiritual-subtle leading-relaxed text-left bg-spiritual-surface/60 p-3 rounded-lg">
          <span className="font-semibold text-spiritual-text block mb-0.5">Security Notice:</span>
          Public admin registration is strictly disabled. Administrator credentials are initialized exclusively via secure backend bootstrap protocols.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
