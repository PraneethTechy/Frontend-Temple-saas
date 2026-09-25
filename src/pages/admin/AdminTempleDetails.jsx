import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Power,
  Calendar,
  Sparkles,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useGetAdminTempleByIdQuery, useUpdateTempleStatusMutation } from '../../store/api/adminApi.js';
import { ROUTES } from '../../constants/routes.js';

export const AdminTempleDetails = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetAdminTempleByIdQuery(id);
  const [updateTempleStatus, { isLoading: isUpdating }] = useUpdateTempleStatusMutation();
  const [feedback, setFeedback] = useState('');

  const temple = data?.data;

  const handleToggleStatus = async () => {
    if (!temple) return;
    const nextStatus = temple.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setFeedback('');
    try {
      await updateTempleStatus({ id: temple._id, status: nextStatus }).unwrap();
      setFeedback(`Temple status changed to ${nextStatus}.`);
      refetch();
    } catch (err) {
      setFeedback(err?.data?.message || 'Failed to update status.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-40 bg-spiritual-surface animate-pulse rounded" />
        <div className="h-64 bg-white rounded-2xl border border-spiritual-border animate-pulse" />
      </div>
    );
  }

  if (isError || !temple) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-2xl border border-spiritual-border">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-sm font-bold text-spiritual-text">Temple Not Found</h2>
        <p className="text-xs text-spiritual-muted mt-1 mb-4">
          {error?.data?.message || 'Unable to retrieve temple details.'}
        </p>
        <Link
          to={`${ROUTES.ADMIN}/temples`}
          className="px-4 py-2 rounded-lg bg-spiritual-primary text-white text-xs font-semibold"
        >
          Back to Temples
        </Link>
      </div>
    );
  }

  const isActive = temple.status === 'ACTIVE';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={`${ROUTES.ADMIN}/temples`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-spiritual-muted hover:text-spiritual-text"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Temples Directory</span>
        </Link>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {temple.status}
          </span>
          <button
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isActive
                ? 'bg-white border-rose-300 text-rose-700 hover:bg-rose-50'
                : 'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {isActive ? 'Deactivate Temple' : 'Activate Temple'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-semibold text-amber-950">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-spiritual-border p-6 shadow-spiritual-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-semibold text-spiritual-accent uppercase">
            {temple.templeType}
          </span>
          {temple.categories && temple.categories.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {temple.categories.map((cat) => (
                <span
                  key={cat._id || cat}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-spiritual-accentLight text-spiritual-accent border border-spiritual-accent/20"
                >
                  {cat.name || 'Category'}
                </span>
              ))}
            </div>
          )}
        </div>
        <h1 className="text-2xl font-serif font-bold text-spiritual-text mt-0.5">
          {temple.name}
        </h1>
        <p className="text-xs text-spiritual-muted mt-1 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-spiritual-subtle" />
          <span>{temple.address}, {temple.city}, {temple.state} - {temple.pincode}</span>
        </p>
        <p className="text-xs text-spiritual-muted mt-3 leading-relaxed whitespace-pre-line border-t border-spiritual-border/60 pt-3">
          {temple.description}
        </p>
      </div>

      {/* Assigned Authority Card */}
      <div className="bg-white rounded-2xl border border-spiritual-border p-6 shadow-spiritual-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-spiritual-border">
          <User className="w-4 h-4 text-spiritual-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-spiritual-text">
            Assigned Temple Authority
          </h2>
        </div>

        {temple.authorityId ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-spiritual-muted block">Authority Name</span>
              <strong className="text-spiritual-text">{temple.authorityId.name}</strong>
            </div>
            <div>
              <span className="text-spiritual-muted block">Email Address</span>
              <span className="font-mono text-spiritual-text">{temple.authorityId.email}</span>
            </div>
            <div>
              <span className="text-spiritual-muted block">Contact Phone</span>
              <span className="text-spiritual-text">{temple.authorityId.phone || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-spiritual-muted block">Account Status</span>
              <span className="font-medium text-emerald-700">
                {temple.authorityId.isActive ? 'Active' : 'Deactivated'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-spiritual-muted italic">No authority currently assigned.</p>
        )}
      </div>

      {/* Operational Modules Placeholders (Phase 4 scope) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-spiritual-border p-5 shadow-spiritual-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-spiritual-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-spiritual-muted" />
              Temple Services
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-spiritual-surface border border-spiritual-border text-spiritual-subtle">
              Phase 5
            </span>
          </div>
          <span className="text-2xl font-serif font-bold text-spiritual-text">
            {temple.servicesCount || 0}
          </span>
          <p className="text-[11px] text-spiritual-muted mt-1">
            Sevas and pooja offerings management will be activated in upcoming service module.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-spiritual-border p-5 shadow-spiritual-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-spiritual-text flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-spiritual-muted" />
              Devotee Bookings
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-spiritual-surface border border-spiritual-border text-spiritual-subtle">
              Phase 6
            </span>
          </div>
          <span className="text-2xl font-serif font-bold text-spiritual-text">
            {temple.bookingsCount || 0}
          </span>
          <p className="text-[11px] text-spiritual-muted mt-1">
            Darshan reservations and token bookings tracking will be connected in booking phase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTempleDetails;
