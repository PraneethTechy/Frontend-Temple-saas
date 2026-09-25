import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import {
  useGetDevoteeProfileQuery,
  useUpdateDevoteeProfileMutation,
} from '../../store/api/devoteeApi.js';

export const Profile = () => {
  const { data: profileRes, isLoading, isError, error, refetch } = useGetDevoteeProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateDevoteeProfileMutation();

  const user = profileRes?.data;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }

    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      }).unwrap();

      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to update profile. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-4 animate-pulse">
        <div className="h-10 bg-spiritual-surface rounded w-1/4"></div>
        <div className="h-64 bg-spiritual-surface rounded-2xl"></div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="spiritual-card p-10 text-center max-w-md mx-auto my-12 bg-white">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h3 className="font-serif font-bold text-lg text-spiritual-text mb-1">Failed to Load Profile</h3>
        <p className="text-xs text-spiritual-muted mb-4">{error?.data?.message || 'Please log in again.'}</p>
        <button onClick={() => refetch()} className="btn-spiritual-primary text-xs py-2 px-4">
          Retry
        </button>
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold text-spiritual-text">Devotee Profile</h1>
        <p className="text-xs sm:text-sm text-spiritual-muted">
          Manage your personal account details and pilgrimage contact information.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="spiritual-card p-6 sm:p-8 bg-white border border-spiritual-border shadow-spiritual-sm rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-spiritual-borderLight pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-spiritual-primaryLight text-spiritual-primary border-2 border-spiritual-primary/20 flex items-center justify-center font-serif font-bold text-2xl">
              {user.name?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-spiritual-text">{user.name}</h2>
              <p className="text-xs text-spiritual-muted">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Devotee Account
                </span>
                <span className="text-[11px] text-spiritual-subtle flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Joined {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Editable Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-spiritual-muted" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-spiritual-surface border border-spiritual-border rounded-xl text-xs text-spiritual-text focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary"
                  required
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-semibold text-spiritual-text mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-spiritual-muted" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-spiritual-surface border border-spiritual-border rounded-xl text-xs text-spiritual-text focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary"
                />
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-spiritual-muted mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-spiritual-subtle flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Immutable
                </span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-spiritual-muted opacity-60" />
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-spiritual-surface/50 border border-spiritual-borderLight rounded-xl text-xs text-spiritual-muted cursor-not-allowed"
                />
              </div>
            </div>

            {/* Account Role (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-spiritual-muted mb-1.5 flex items-center justify-between">
                <span>Account Role</span>
                <span className="text-[10px] text-spiritual-subtle flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Protected
                </span>
              </label>
              <input
                type="text"
                value="DEVOTEE (Pilgrim)"
                disabled
                className="w-full px-4 py-2.5 bg-spiritual-surface/50 border border-spiritual-borderLight rounded-xl text-xs text-spiritual-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-spiritual-borderLight flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="btn-spiritual-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
