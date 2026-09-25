import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Settings,
  Lock,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Shield,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useChangePasswordMutation } from '../../store/api/authApi.js';
import { updateUser } from '../../store/slices/authSlice.js';
import { useGetAuthorityTempleQuery } from '../../store/api/authorityApi.js';
import { ROUTES } from '../../constants/routes.js';

export const AuthoritySettings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: templeRes } = useGetAuthorityTempleQuery();
  const temple = templeRes?.data;

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const mustChange = Boolean(user?.mustChangePassword);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Password validation checks
  const hasMinLength = passwords.newPassword.length >= 8;
  const hasNumber = /\d/.test(passwords.newPassword);
  const passwordsMatch = passwords.newPassword && passwords.newPassword === passwords.confirmPassword;

  const handleCopyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!passwords.currentPassword) {
      setFeedback({ type: 'error', message: 'Current (or temporary) password is required.' });
      return;
    }

    if (!hasMinLength) {
      setFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }).unwrap();

      // Clear the temporary password requirement flag in Redux
      dispatch(updateUser({ mustChangePassword: false }));

      setFeedback({
        type: 'success',
        message: 'Password changed successfully! You now have permanent, secure access.',
      });

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // If user was forced here, redirect to dashboard after 2 seconds
      if (mustChange || location.state?.forcePasswordChange) {
        setTimeout(() => {
          navigate(ROUTES.AUTHORITY_DASHBOARD);
        }, 2000);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err?.data?.message ||
          'Failed to change password. Please verify your current temporary password.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-spiritual-borderLight">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-spiritual-primaryLight/80 text-spiritual-primary flex items-center justify-center border border-spiritual-primaryRing/40">
            <Settings className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text">
            Account & Security Settings
          </h1>
        </div>
        <p className="text-xs text-spiritual-muted mt-1 max-w-2xl">
          Manage your Temple Authority credentials, verified entity assignment, and access credentials.
        </p>
      </div>

      {/* Mandatory Password Notice */}
      {mustChange && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-3 shadow-spiritual-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-950">First-Time Login Security Setup</h4>
            <p className="leading-relaxed">
              You are currently signed in using a temporary password issued by platform administration.
              You must set a permanent, secure password below before accessing other temple management features.
            </p>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Overview Cards: Authority Profile & Temple Entity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Authority Profile */}
        <div className="spiritual-card p-5 space-y-4 border border-spiritual-border">
          <div className="flex items-center justify-between border-b border-spiritual-borderLight pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-spiritual-primary" />
              <h2 className="text-sm font-bold text-spiritual-text">Authority Profile</h2>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              Verified Authority
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-serif font-bold text-lg flex items-center justify-center shrink-0 border border-amber-300 shadow-spiritual-xs">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-spiritual-text truncate">{user?.name || 'Authority'}</h3>
              <span className="text-[11px] text-spiritual-muted font-mono">{user?.role || 'TEMPLE_AUTHORITY'}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs border-t border-spiritual-borderLight">
            <div>
              <span className="text-spiritual-muted block text-[11px]">Registered Email</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-medium text-spiritual-text text-xs">{user?.email || '—'}</span>
                <button
                  onClick={handleCopyEmail}
                  className="text-stone-400 hover:text-spiritual-primary p-0.5 rounded"
                  title="Copy Email"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-spiritual-muted block text-[11px]">Account Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Active & Authorized
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Temple Entity */}
        <div className="spiritual-card p-5 space-y-4 border border-spiritual-border">
          <div className="flex items-center justify-between border-b border-spiritual-borderLight pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-spiritual-primary" />
              <h2 className="text-sm font-bold text-spiritual-text">Assigned Temple Entity</h2>
            </div>
            {temple?._id && (
              <Link
                to={`/temples/${temple.slug || temple._id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-spiritual-primary hover:underline font-medium"
              >
                <span>View Public</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-spiritual-muted block text-[11px]">Temple Name</span>
              <span className="font-serif font-bold text-spiritual-text text-sm block mt-0.5">
                {temple?.name || 'Loading temple details...'}
              </span>
            </div>

            <div>
              <span className="text-spiritual-muted block text-[11px]">Sanctum Location</span>
              <span className="font-medium text-spiritual-text block mt-0.5">
                {temple?.city && temple?.state ? `${temple.city}, ${temple.state}` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-spiritual-muted block text-[11px]">Operational Status</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                  {temple?.status || 'ACTIVE'}
                </span>
              </div>

              <div>
                <span className="text-spiritual-muted block text-[11px]">Verification</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold uppercase">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Password Change */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Password Form (2 cols) */}
        <div className="lg:col-span-2 spiritual-card p-6 space-y-4 border border-spiritual-border">
          <div className="flex items-center gap-2 border-b border-spiritual-borderLight pb-3">
            <Lock className="w-4 h-4 text-spiritual-primary" />
            <h2 className="text-sm font-bold text-spiritual-text">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            {/* Current Password */}
            <div>
              <label className="block font-medium text-spiritual-text mb-1">
                {mustChange ? 'Current Temporary Password *' : 'Current Password *'}
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="Enter current or temporary password"
                  className="w-full px-3 py-2.5 pr-9 rounded-lg border border-spiritual-border bg-spiritual-surface/30 focus:bg-white focus:outline-none focus:border-spiritual-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block font-medium text-spiritual-text mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2.5 pr-9 rounded-lg border border-spiritual-border bg-spiritual-surface/30 focus:bg-white focus:outline-none focus:border-spiritual-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block font-medium text-spiritual-text mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 pr-9 rounded-lg border border-spiritual-border bg-spiritual-surface/30 focus:bg-white focus:outline-none focus:border-spiritual-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Validation Checklist */}
            {passwords.newPassword && (
              <div className="p-3 rounded-lg bg-spiritual-surface/50 border border-spiritual-border space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  {hasMinLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  )}
                  <span className={hasMinLength ? 'text-emerald-800 font-medium' : 'text-spiritual-muted'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  )}
                  <span className={hasNumber ? 'text-emerald-800 font-medium' : 'text-spiritual-muted'}>
                    Contains at least one number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordsMatch ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  )}
                  <span className={passwordsMatch ? 'text-emerald-800 font-medium' : 'text-spiritual-muted'}>
                    Passwords match
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-spiritual-primary text-white rounded-lg font-semibold hover:bg-spiritual-primaryHover disabled:opacity-50 shadow-spiritual-sm transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isLoading ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Recommendations Card (1 col) */}
        <div className="spiritual-card p-5 space-y-3.5 border border-spiritual-border bg-gradient-to-br from-white to-spiritual-surface/30">
          <div className="flex items-center gap-2 border-b border-spiritual-borderLight pb-3">
            <Shield className="w-4 h-4 text-spiritual-primary" />
            <h3 className="text-sm font-bold text-spiritual-text">Authority Security Tips</h3>
          </div>

          <div className="space-y-3 text-xs text-spiritual-muted">
            <div className="space-y-1">
              <h4 className="font-semibold text-spiritual-text text-[11px] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-spiritual-primary" />
                Keep Credentials Confidential
              </h4>
              <p className="text-[11px] leading-relaxed">
                Do not share your temple authority password with unauthorized staff. Each administrator should have dedicated access.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-semibold text-spiritual-text text-[11px] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-spiritual-primary" />
                Regular Schedule Reviews
              </h4>
              <p className="text-[11px] leading-relaxed">
                Periodically review active time slots and publish festival announcements early so devotees have ample advance notice.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-semibold text-spiritual-text text-[11px] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-spiritual-primary" />
                Strict Capacity Management
              </h4>
              <p className="text-[11px] leading-relaxed">
                Ensure slot capacities strictly reflect the physical sanctum throughput to prevent overcrowding at temple premises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthoritySettings;
