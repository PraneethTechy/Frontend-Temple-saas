import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Calendar,
  X,
  ToggleLeft,
  ToggleRight,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  useGetAuthorityTimeSlotsQuery,
  useGetAuthorityServicesQuery,
  useCreateAuthorityTimeSlotMutation,
  useUpdateAuthorityTimeSlotMutation,
  useDeleteAuthorityTimeSlotMutation,
} from '../../store/api/authorityApi.js';

const ALL_WEEKDAYS = [
  { id: 'MONDAY', label: 'Mon' },
  { id: 'TUESDAY', label: 'Tue' },
  { id: 'WEDNESDAY', label: 'Wed' },
  { id: 'THURSDAY', label: 'Thu' },
  { id: 'FRIDAY', label: 'Fri' },
  { id: 'SATURDAY', label: 'Sat' },
  { id: 'SUNDAY', label: 'Sun' },
];

export const AuthorityTimeSlots = () => {
  const [filterService, setFilterService] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: slotsRes, isLoading, isError, error, refetch } = useGetAuthorityTimeSlotsQuery({
    serviceId: filterService || undefined,
    isActive: filterStatus === 'ALL' ? undefined : filterStatus === 'ACTIVE',
  });

  const { data: servicesRes } = useGetAuthorityServicesQuery();
  const services = servicesRes?.data || [];

  const [createSlot, { isLoading: isCreating }] = useCreateAuthorityTimeSlotMutation();
  const [updateSlot, { isLoading: isUpdating }] = useUpdateAuthorityTimeSlotMutation();
  const [deleteSlot, { isLoading: isDeleting }] = useDeleteAuthorityTimeSlotMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getFutureStr = (days = 7) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const initialForm = {
    serviceId: '',
    startDate: getTodayStr(),
    endDate: getFutureStr(7),
    availableDays: ALL_WEEKDAYS.map((w) => w.id),
    startTime: '06:00',
    endTime: '07:00',
    capacity: 50,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const slots = slotsRes?.data || [];

  const handleOpenCreate = () => {
    setEditingSlotId(null);
    setFormData({
      ...initialForm,
      serviceId: services.length > 0 ? services[0]._id : '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlotId(slot._id);
    setFormData({
      serviceId: slot.serviceId?._id || slot.serviceId,
      startDate: slot.startDate ? new Date(slot.startDate).toISOString().split('T')[0] : getTodayStr(),
      endDate: slot.endDate ? new Date(slot.endDate).toISOString().split('T')[0] : getFutureStr(7),
      availableDays: Array.isArray(slot.availableDays) && slot.availableDays.length > 0
        ? slot.availableDays
        : ALL_WEEKDAYS.map((w) => w.id),
      startTime: slot.startTime || '06:00',
      endTime: slot.endTime || '07:00',
      capacity: slot.capacity || 50,
      isActive: slot.isActive !== undefined ? slot.isActive : true,
    });
    setIsModalOpen(true);
  };

  const toggleWeekday = (dayId) => {
    setFormData((prev) => {
      const exists = prev.availableDays.includes(dayId);
      if (exists) {
        // Keep at least one day selected
        if (prev.availableDays.length === 1) return prev;
        return { ...prev, availableDays: prev.availableDays.filter((d) => d !== dayId) };
      } else {
        return { ...prev, availableDays: [...prev.availableDays, dayId] };
      }
    });
  };

  const selectAllDays = () => {
    setFormData((prev) => ({ ...prev, availableDays: ALL_WEEKDAYS.map((w) => w.id) }));
  };

  const selectWeekendsOnly = () => {
    setFormData((prev) => ({ ...prev, availableDays: ['SATURDAY', 'SUNDAY'] }));
  };

  const selectWeekdaysOnly = () => {
    setFormData((prev) => ({
      ...prev,
      availableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceId) {
      setFeedback({ type: 'error', message: 'Please select a service for this slot.' });
      return;
    }

    if (formData.startDate > formData.endDate) {
      setFeedback({ type: 'error', message: 'End Date must be on or after Start Date.' });
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setFeedback({ type: 'error', message: 'Slot End Time must be strictly later than Start Time.' });
      return;
    }

    if (Number(formData.capacity) <= 0) {
      setFeedback({ type: 'error', message: 'Slot capacity must be greater than 0.' });
      return;
    }

    try {
      if (editingSlotId) {
        await updateSlot({
          id: editingSlotId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          availableDays: formData.availableDays,
          startTime: formData.startTime,
          endTime: formData.endTime,
          capacity: Number(formData.capacity),
          isActive: formData.isActive,
        }).unwrap();
        setFeedback({ type: 'success', message: 'Time slot availability updated successfully!' });
      } else {
        await createSlot({
          serviceId: formData.serviceId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          availableDays: formData.availableDays,
          startTime: formData.startTime,
          endTime: formData.endTime,
          capacity: Number(formData.capacity),
          isActive: formData.isActive,
        }).unwrap();
        setFeedback({ type: 'success', message: 'Time slot range scheduled successfully!' });
      }

      setIsModalOpen(false);
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to save time slot configuration.',
      });
    }
  };

  const handleToggleActive = async (slot) => {
    try {
      await updateSlot({ id: slot._id, isActive: !slot.isActive }).unwrap();
      setFeedback({
        type: 'success',
        message: `Slot marked as ${!slot.isActive ? 'Active' : 'Inactive'}.`,
      });
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.data?.message || 'Failed to update slot status.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteSlot(deleteCandidate._id).unwrap();
      setDeleteCandidate(null);
      setFeedback({ type: 'success', message: 'Time slot deleted successfully.' });
      refetch();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to delete time slot.',
      });
    }
  };

  // Helper to format days summary
  const formatDaysSummary = (days) => {
    if (!days || days.length === 0 || days.length === 7) return 'Mon-Sun (All Days)';
    if (days.length === 2 && days.includes('SATURDAY') && days.includes('SUNDAY')) return 'Sat-Sun (Weekends)';
    if (days.length === 5 && !days.includes('SATURDAY') && !days.includes('SUNDAY')) return 'Mon-Fri (Weekdays)';
    return days.map((d) => d.slice(0, 3)).join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14 select-none">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-spiritual-primary font-bold text-[11px] tracking-wider uppercase mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>DARSHAN CAPACITY MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-serif font-bold text-spiritual-text tracking-tight">
            Time Slot Availability Scheduling
          </h1>
          <p className="text-xs text-spiritual-muted mt-0.5 max-w-2xl">
            Configure darshan slot windows, recurring weekday availability, and maximum seated capacity for your temple.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={services.length === 0}
          className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-spiritual-primary text-white rounded-xl text-xs font-semibold hover:bg-spiritual-accent disabled:opacity-50 transition-all shadow-spiritual-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Slots</span>
        </button>
      </div>

      {services.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have no active services yet. Please create at least one offering under Services before scheduling slots.</span>
          </div>
        </div>
      )}

      {feedback.message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-spiritual-muted hover:text-spiritual-text cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-spiritual-muted uppercase tracking-wider block">Total Slots</span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text mt-1">{slots.length}</div>
          <span className="text-[10px] text-spiritual-muted font-medium">Configured windows</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Live Active</span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text mt-1">
            {slots.filter((s) => s.isActive).length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Bookable by devotees</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Total Capacity</span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text mt-1">
            {slots.reduce((acc, s) => acc + (Number(s.capacity) || 0), 0)}
          </div>
          <span className="text-[10px] text-blue-600 font-medium">Seated devotee slots</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Available Seats</span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text mt-1">
            {slots.reduce((acc, s) => acc + Math.max(0, (Number(s.capacity) || 0) - (Number(s.bookedCount) || 0)), 0)}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Remaining balance</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 font-bold text-spiritual-text">
            <Filter className="w-4 h-4 text-spiritual-primary" />
            <span>Status:</span>
          </div>

          <div className="flex items-center gap-1 bg-spiritual-surface p-1 rounded-xl border border-spiritual-border">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-spiritual-primary text-white shadow-2xs'
                    : 'text-spiritual-muted hover:text-spiritual-text'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-80">
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary text-xs font-medium"
          >
            <option value="">All Temple Services</option>
            {services.map((svc) => (
              <option key={svc._id} value={svc._id}>
                {svc.name} ({svc.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slots Table */}
      <div className="rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {slots.length === 0 ? (
          <div className="p-16 text-center text-xs text-spiritual-muted space-y-3">
            <Calendar className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="font-semibold text-spiritual-text text-sm">No time slots configured.</p>
            <p>Click "Schedule New Slots" to define recurring availability across dates and weekdays.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8E2D9] text-spiritual-muted font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Date Range</th>
                  <th className="py-3.5 px-4">Available Days</th>
                  <th className="py-3.5 px-4">Time Interval</th>
                  <th className="py-3.5 px-4">Capacity Utilization</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE6]">
                {slots.map((slot) => {
                  const capacity = Number(slot.capacity) || 1;
                  const booked = Number(slot.bookedCount) || 0;
                  const available = Math.max(0, capacity - booked);
                  const occupancyRatio = Math.round((booked / capacity) * 100);

                  const sStr = slot.startDate
                    ? new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : new Date(slot.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                  const eStr = slot.endDate
                    ? new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : sStr;

                  return (
                    <tr key={slot._id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 text-[13px] block">
                          {slot.serviceId?.name || 'Darshan Service'}
                        </span>
                        {slot.serviceId?.type && (
                          <span className="inline-block mt-0.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            {slot.serviceId.type}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-spiritual-text whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-spiritual-primary shrink-0" />
                          <span>
                            {sStr} {sStr !== eStr && `→ ${eStr}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-slate-700 font-semibold bg-[#FAF5EE] px-2.5 py-1 rounded-lg border border-[#EAE0D0] whitespace-nowrap">
                          {formatDaysSummary(slot.availableDays)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-800 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-spiritual-primary" />
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="font-bold text-slate-800">{available} seats left</span>
                          <span className="text-spiritual-muted font-normal">{booked}/{capacity}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              occupancyRatio >= 85
                                ? 'bg-rose-500'
                                : occupancyRatio >= 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(occupancyRatio, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(slot)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80 cursor-pointer"
                          title="Toggle active status"
                        >
                          {slot.isActive ? (
                            <>
                              <ToggleRight className="w-6 h-6 text-emerald-600" />
                              <span className="text-emerald-700">Live</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-6 h-6 text-gray-400" />
                              <span className="text-gray-500">Paused</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 text-spiritual-muted hover:text-spiritual-primary hover:bg-[#FAF6F0] rounded-lg transition-colors cursor-pointer"
                            title="Edit slot configuration"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(slot)}
                            disabled={booked > 0}
                            title={
                              booked > 0
                                ? 'Cannot delete slot with existing bookings'
                                : 'Delete time slot'
                            }
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT DATE-RANGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-spiritual-lg border border-spiritual-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-spiritual-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-spiritual-surface flex items-center justify-center text-spiritual-primary border border-spiritual-border">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-spiritual-text">
                  {editingSlotId ? 'Edit Time Slot Availability' : 'Schedule Date-Range Availability'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-spiritual-muted hover:text-spiritual-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Service Selection */}
              <div>
                <label className="block font-semibold text-spiritual-text mb-1">
                  Temple Service <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={Boolean(editingSlotId)}
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-medium disabled:opacity-60"
                >
                  <option value="">Select a temple service...</option>
                  {services.map((svc) => (
                    <option key={svc._id} value={svc._id}>
                      {svc.name} ({svc.type} - ₹{svc.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range: Start Date & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-spiritual-text mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-spiritual-text mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.startDate}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-medium"
                  />
                </div>
              </div>

              {/* Available Days Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-spiritual-text">
                    Applicable Weekdays <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={selectAllDays}
                      className="text-spiritual-primary hover:underline font-semibold"
                    >
                      All Days
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={selectWeekdaysOnly}
                      className="text-spiritual-primary hover:underline font-medium"
                    >
                      Mon-Fri
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={selectWeekendsOnly}
                      className="text-spiritual-primary hover:underline font-medium"
                    >
                      Weekends
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {ALL_WEEKDAYS.map((day) => {
                    const isSelected = formData.availableDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleWeekday(day.id)}
                        className={`py-1.5 rounded-lg text-center font-semibold text-[11px] transition-all border ${
                          isSelected
                            ? 'bg-spiritual-primary text-white border-spiritual-primary shadow-spiritual-xs'
                            : 'bg-spiritual-surface text-spiritual-muted border-spiritual-border hover:text-spiritual-text'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-spiritual-muted mt-1">
                  Availability will only be open on the selected weekdays between the start and end dates.
                </p>
              </div>

              {/* Time Interval: Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-spiritual-text mb-1">
                    Start Time (HH:mm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-spiritual-text mb-1">
                    End Time (HH:mm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-mono"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block font-semibold text-spiritual-text mb-1">
                  Capacity (Pilgrims Per Slot) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-medium"
                />
                <p className="text-[10px] text-spiritual-muted mt-1">
                  Booked count starts at 0 and is strictly controlled by the platform booking engine.
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-spiritual-primary focus:ring-spiritual-primary"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-spiritual-text cursor-pointer">
                  Activate this slot for booking immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-spiritual-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-spiritual-border rounded-lg text-spiritual-muted hover:text-spiritual-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 bg-spiritual-primary text-white rounded-lg font-semibold hover:bg-spiritual-primaryHover disabled:opacity-50 shadow-spiritual-xs transition-all"
                >
                  {isCreating || isUpdating ? 'Saving...' : editingSlotId ? 'Update Slot' : 'Save Time Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-spiritual-lg border border-spiritual-border">
            <h3 className="text-base font-bold text-spiritual-text">Delete Time Slot</h3>
            <p className="text-xs text-spiritual-muted leading-relaxed">
              Are you sure you want to delete this time slot ({deleteCandidate.startTime} - {deleteCandidate.endTime})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-3 py-1.5 border border-spiritual-border rounded-lg text-xs font-medium text-spiritual-muted hover:text-spiritual-text"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityTimeSlots;
