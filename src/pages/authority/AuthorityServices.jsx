import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  IndianRupee,
  Calendar,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  useGetAuthorityServicesQuery,
  useCreateAuthorityServiceMutation,
  useUpdateAuthorityServiceMutation,
  useDeleteAuthorityServiceMutation,
} from '../../store/api/authorityApi.js';

const SERVICE_TYPES = [
  'DARSHAN',
  'SEVA',
  'POOJA',
  'SPECIAL_ENTRY',
  'PRASADAM',
  'DONATION',
];

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const AuthorityServices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { data: servicesRes, isLoading, isError, error, refetch } = useGetAuthorityServicesQuery({
    search: searchTerm,
    type: selectedType,
  });

  const [createService, { isLoading: isCreating }] = useCreateAuthorityServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateAuthorityServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteAuthorityServiceMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const initialForm = {
    name: '',
    type: 'POOJA',
    description: '',
    price: 0,
    duration: 30,
    availableDays: [...WEEKDAYS],
    rules: '',
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const services = servicesRes?.data || [];

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormData({
      name: svc.name || '',
      type: svc.type || 'POOJA',
      description: svc.description || '',
      price: svc.price || 0,
      duration: svc.duration || 30,
      availableDays: Array.isArray(svc.availableDays) && svc.availableDays.length > 0 ? svc.availableDays : [...WEEKDAYS],
      rules: Array.isArray(svc.rules) ? svc.rules.join('\n') : '',
      isActive: Boolean(svc.isActive),
    });
    setIsModalOpen(true);
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const exists = prev.availableDays.includes(day);
      if (exists) {
        return { ...prev, availableDays: prev.availableDays.filter((d) => d !== day) };
      }
      return { ...prev, availableDays: [...prev.availableDays, day] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Service name is required.' });
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        price: Math.max(0, Number(formData.price) || 0),
        duration: Math.max(0, Number(formData.duration) || 0),
        availableDays: formData.availableDays,
        rules: formData.rules
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
        isActive: formData.isActive,
      };

      if (editingService) {
        await updateService({ id: editingService._id, ...payload }).unwrap();
        setFeedback({ type: 'success', message: 'Service updated successfully.' });
      } else {
        await createService(payload).unwrap();
        setFeedback({ type: 'success', message: 'Service created successfully.' });
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to save service.',
      });
    }
  };

  const handleToggleActive = async (svc) => {
    try {
      await updateService({ id: svc._id, isActive: !svc.isActive }).unwrap();
      setFeedback({
        type: 'success',
        message: `Service marked as ${!svc.isActive ? 'Active' : 'Inactive'}.`,
      });
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.data?.message || 'Failed to update status.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteService(deleteCandidate._id).unwrap();
      setDeleteCandidate(null);
      setFeedback({ type: 'success', message: 'Service deleted successfully.' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to delete service.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary"></div>
      </div>
    );
  }

  const getCategoryTheme = (type) => {
    switch (type) {
      case 'DARSHAN':
        return { badge: 'bg-amber-50 text-amber-800 border-amber-200', border: 'border-l-amber-500' };
      case 'SEVA':
        return { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', border: 'border-l-emerald-500' };
      case 'POOJA':
        return { badge: 'bg-purple-50 text-purple-800 border-purple-200', border: 'border-l-purple-500' };
      case 'SPECIAL_ENTRY':
        return { badge: 'bg-blue-50 text-blue-800 border-blue-200', border: 'border-l-blue-500' };
      case 'PRASADAM':
        return { badge: 'bg-rose-50 text-rose-800 border-rose-200', border: 'border-l-rose-500' };
      default:
        return { badge: 'bg-stone-50 text-stone-800 border-stone-200', border: 'border-l-stone-500' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14 select-none">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-spiritual-primary font-bold text-[11px] tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DEVOTEE OFFERINGS</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-serif font-bold text-spiritual-text tracking-tight">
            Temple Services & Sevas
          </h1>
          <p className="text-xs text-spiritual-muted mt-0.5 max-w-2xl">
            Configure darshan tiers, special abhishekam poojas, prasadam counters, and sacred offerings for your temple.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-spiritual-primary text-white rounded-xl text-xs font-semibold hover:bg-spiritual-accent transition-all shadow-spiritual-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Service</span>
        </button>
      </div>

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

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-spiritual-muted" />
          <input
            type="text"
            placeholder="Search services by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
          />
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedType('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === ''
                ? 'bg-spiritual-primary text-white shadow-2xs'
                : 'bg-spiritual-surface text-spiritual-muted hover:text-spiritual-text border border-spiritual-border/60'
            }`}
          >
            All Types
          </button>
          {SERVICE_TYPES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === t
                  ? 'bg-spiritual-primary text-white shadow-2xs'
                  : 'bg-spiritual-surface text-spiritual-muted hover:text-spiritual-text border border-spiritual-border/60'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white border border-[#E8E2D9] text-center text-xs text-spiritual-muted space-y-3">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="font-semibold text-spiritual-text text-sm">No services match your criteria.</p>
          <p>Create new seva offerings or clear your search filter to view your offerings catalogue.</p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-spiritual-primary text-white rounded-xl text-xs font-semibold hover:bg-spiritual-accent transition-all cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Service</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc) => {
            const theme = getCategoryTheme(svc.type);

            return (
              <div
                key={svc._id}
                className={`p-5 rounded-2xl bg-white border border-[#E8E2D9] border-l-4 ${theme.border} shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between group ${
                  !svc.isActive ? 'opacity-70 bg-slate-50/50' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${theme.badge}`}>
                        {svc.type?.replace('_', ' ')}
                      </span>
                      <h3 className="font-serif font-bold text-base text-spiritual-text mt-2 line-clamp-1 group-hover:text-spiritual-primary transition-colors">
                        {svc.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleToggleActive(svc)}
                      title={svc.isActive ? 'Deactivate Service' : 'Activate Service'}
                      className="cursor-pointer text-spiritual-muted hover:text-spiritual-primary transition-colors shrink-0"
                    >
                      {svc.isActive ? (
                        <ToggleRight className="w-7 h-7 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-spiritual-muted mt-2 line-clamp-2 leading-relaxed">
                    {svc.description || 'Dedicated temple seva and devotional offering.'}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-[#F4EFE6] grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-sm">
                      <IndianRupee className="w-3.5 h-3.5 text-spiritual-primary" />
                      <span>{Number(svc.price || 0).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-sans font-normal text-spiritual-muted ml-0.5">/ ticket</span>
                    </div>

                    <div className="flex items-center justify-end gap-1 text-spiritual-muted font-medium">
                      <Clock className="w-3.5 h-3.5 text-spiritual-primary" />
                      <span>{svc.duration || 30} mins</span>
                    </div>
                  </div>

                  {Array.isArray(svc.availableDays) && svc.availableDays.length > 0 && (
                    <div className="mt-2.5 text-[11px] text-spiritual-muted flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3 h-3 text-spiritual-primary shrink-0" />
                      <span>
                        {svc.availableDays.length === 7 ? 'Available Daily' : `${svc.availableDays.length} days active / week`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-[#F4EFE6] flex items-center justify-between text-xs">
                  <span className={`text-[10.5px] font-bold uppercase tracking-wider ${svc.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {svc.isActive ? '● Live on portal' : '○ Paused'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(svc)}
                      className="p-1.5 text-spiritual-muted hover:text-spiritual-primary hover:bg-[#FAF6F0] rounded-lg transition-colors cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(svc)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-spiritual-lg border border-spiritual-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-spiritual-border">
              <h3 className="font-serif font-bold text-lg text-spiritual-text">
                {editingService ? 'Edit Temple Service' : 'Create New Service'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-spiritual-muted hover:text-spiritual-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-spiritual-text mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Suprabhata Seva, Special Darshan"
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-spiritual-text mb-1">Service Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary font-medium"
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-spiritual-text mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-spiritual-text mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-spiritual-text">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-spiritual-primary focus:ring-spiritual-primary"
                    />
                    <span>Active & Available for Booking</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-spiritual-text mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the spiritual significance, process, and offerings included..."
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                />
              </div>

              {/* Available Days */}
              <div>
                <label className="block font-medium text-spiritual-text mb-1.5">Available Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((day) => {
                    const isSelected = formData.availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold tracking-wider transition-colors ${
                          isSelected
                            ? 'bg-spiritual-primary text-white'
                            : 'bg-spiritual-surface border border-spiritual-border text-spiritual-muted'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="block font-medium text-spiritual-text mb-1">
                  Seva Rules & Dress Requirements (one per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder="Traditional dhoti/saree required&#10;Report 30 minutes prior"
                  className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface focus:outline-none focus:border-spiritual-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-spiritual-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-spiritual-border rounded-lg text-spiritual-muted hover:text-spiritual-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 bg-spiritual-primary text-white rounded-lg font-semibold hover:bg-spiritual-primaryHover disabled:opacity-50"
                >
                  {isCreating || isUpdating
                    ? 'Saving...'
                    : editingService
                    ? 'Update Service'
                    : 'Create Service'}
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
            <h3 className="text-base font-bold text-spiritual-text">Delete Service</h3>
            <p className="text-xs text-spiritual-muted leading-relaxed">
              Are you sure you want to permanently delete <strong>{deleteCandidate.name}</strong>? Existing historical bookings will not be affected.
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
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityServices;
