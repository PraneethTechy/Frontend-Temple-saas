import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  AlertTriangle,
  Sparkles,
  Bell,
  Info,
  CalendarDays,
  Flame,
  Eye,
  Radio,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  useGetAuthorityAnnouncementsQuery,
  useCreateAuthorityAnnouncementMutation,
  useUpdateAuthorityAnnouncementMutation,
  useDeleteAuthorityAnnouncementMutation,
} from '../../store/api/authorityApi.js';

const ANNOUNCEMENT_TYPES = [
  {
    value: 'GENERAL',
    label: 'General Notice',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
    borderClass: 'border-l-stone-400',
    icon: Info,
  },
  {
    value: 'IMPORTANT',
    label: 'Important Alert',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
    borderClass: 'border-l-rose-500',
    icon: ShieldAlert,
  },
  {
    value: 'FESTIVAL',
    label: 'Festival & Utsav',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200 font-semibold',
    borderClass: 'border-l-orange-500',
    icon: Sparkles,
  },
  {
    value: 'DARSHAN',
    label: 'Darshan Update',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
    borderClass: 'border-l-amber-500',
    icon: Flame,
  },
  {
    value: 'SERVICE',
    label: 'Seva & Pooja',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderClass: 'border-l-emerald-500',
    icon: CheckCircle,
  },
  {
    value: 'NOTICE',
    label: 'Temple Directive',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    borderClass: 'border-l-sky-500',
    icon: Bell,
  },
];

export const AuthorityAnnouncements = () => {
  const { data: announcementsRes, isLoading, isError, error, refetch } = useGetAuthorityAnnouncementsQuery();

  const [createAnnouncement, { isLoading: isCreating }] = useCreateAuthorityAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAuthorityAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAuthorityAnnouncementMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const initialForm = {
    title: '',
    message: '',
    type: 'GENERAL',
    expiresAt: '',
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const announcements = announcementsRes?.data || [];

  const isExpired = (item) => {
    if (!item.expiresAt) return false;
    return new Date(item.expiresAt) < new Date();
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = announcements.length;
    const active = announcements.filter((a) => a.isActive && !isExpired(a)).length;
    const festivals = announcements.filter((a) => a.type === 'FESTIVAL').length;
    const expired = announcements.filter((a) => isExpired(a)).length;
    return { total, active, festivals, expired };
  }, [announcements]);

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    if (selectedFilter === 'ALL') return announcements;
    if (selectedFilter === 'ACTIVE') return announcements.filter((a) => a.isActive && !isExpired(a));
    if (selectedFilter === 'EXPIRED') return announcements.filter((a) => isExpired(a));
    return announcements.filter((a) => a.type === selectedFilter);
  }, [announcements, selectedFilter]);

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingAnnouncement(item);
    let formattedExpiry = '';
    if (item.expiresAt) {
      try {
        const d = new Date(item.expiresAt);
        if (!isNaN(d.getTime())) {
          formattedExpiry = d.toISOString().split('T')[0];
        }
      } catch (e) {
        formattedExpiry = '';
      }
    }

    setFormData({
      title: item.title || '',
      message: item.message || '',
      type: item.type || 'GENERAL',
      expiresAt: formattedExpiry,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
    setFormData(initialForm);
  };

  const handleQuickExpiry = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormData((prev) => ({
      ...prev,
      expiresAt: d.toISOString().split('T')[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Title is required' });
      return;
    }

    if (!formData.message.trim()) {
      setFeedback({ type: 'error', message: 'Message is required' });
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      if (editingAnnouncement) {
        payload.isActive = formData.isActive;
        await updateAnnouncement({
          id: editingAnnouncement._id,
          ...payload,
        }).unwrap();
        setFeedback({ type: 'success', message: 'Announcement updated successfully' });
      } else {
        await createAnnouncement(payload).unwrap();
        setFeedback({ type: 'success', message: 'Announcement broadcasted successfully' });
      }

      handleCloseModal();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to save announcement. Please check your inputs.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;

    try {
      await deleteAnnouncement(deleteCandidate._id).unwrap();
      setFeedback({ type: 'success', message: 'Announcement deleted successfully' });
      setDeleteCandidate(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.data?.message || 'Failed to delete announcement.',
      });
    }
  };

  const getTypeMeta = (type) => {
    return ANNOUNCEMENT_TYPES.find((t) => t.value === type) || ANNOUNCEMENT_TYPES[0];
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-spiritual-borderLight">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-spiritual-primaryLight/80 text-spiritual-primary flex items-center justify-center border border-spiritual-primaryRing/40">
              <Megaphone className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text">
              Temple Announcements & Broadcasts
            </h1>
          </div>
          <p className="text-xs text-spiritual-muted mt-1 max-w-2xl">
            Broadcast darshan timings, festival schedules, and urgent notices directly to visiting devotees on your temple's public portal.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-spiritual-primary hover:bg-spiritual-primaryHover text-white text-xs font-semibold rounded-lg shadow-spiritual transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="spiritual-card p-4 hover:border-spiritual-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-spiritual-muted uppercase tracking-wider">
              Total Notices
            </span>
            <span className="p-1.5 rounded-md bg-stone-100 text-stone-600">
              <Megaphone className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-spiritual-text">{metrics.total}</span>
            <span className="text-[10px] text-spiritual-muted">published</span>
          </div>
        </div>

        <div className="spiritual-card p-4 hover:border-emerald-300 transition-all bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Broadcasts
            </span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <Radio className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-emerald-700">{metrics.active}</span>
            <span className="text-[10px] text-emerald-600 font-medium">visible to pilgrims</span>
          </div>
        </div>

        <div className="spiritual-card p-4 hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-orange-800 uppercase tracking-wider">
              Festival Notices
            </span>
            <span className="p-1.5 rounded-md bg-orange-50 text-orange-700">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-orange-700">{metrics.festivals}</span>
            <span className="text-[10px] text-orange-600 font-medium">utsav events</span>
          </div>
        </div>

        <div className="spiritual-card p-4 hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
              Archived / Expired
            </span>
            <span className="p-1.5 rounded-md bg-stone-100 text-stone-500">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-stone-600">{metrics.expired}</span>
            <span className="text-[10px] text-stone-400 font-medium">past dates</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
            selectedFilter === 'ALL'
              ? 'bg-spiritual-primary text-white border-spiritual-primary font-semibold shadow-spiritual-xs'
              : 'bg-white text-spiritual-muted border-spiritual-border hover:border-spiritual-primary/40'
          }`}
        >
          All ({announcements.length})
        </button>
        <button
          onClick={() => setSelectedFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
            selectedFilter === 'ACTIVE'
              ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-spiritual-xs'
              : 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Active ({metrics.active})
        </button>
        {ANNOUNCEMENT_TYPES.map((t) => {
          const count = announcements.filter((a) => a.type === t.value).length;
          if (count === 0 && selectedFilter !== t.value) return null;
          return (
            <button
              key={t.value}
              onClick={() => setSelectedFilter(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
                selectedFilter === t.value
                  ? 'bg-spiritual-primary text-white border-spiritual-primary font-semibold shadow-spiritual-xs'
                  : 'bg-white text-spiritual-muted border-spiritual-border hover:border-spiritual-primary/40'
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
        {metrics.expired > 0 && (
          <button
            onClick={() => setSelectedFilter('EXPIRED')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border ${
              selectedFilter === 'EXPIRED'
                ? 'bg-stone-700 text-white border-stone-700 font-semibold shadow-spiritual-xs'
                : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
            }`}
          >
            Expired ({metrics.expired})
          </button>
        )}
      </div>

      {/* Main Content List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-spiritual-border border-t-spiritual-primary"></div>
          <p className="text-xs text-spiritual-muted animate-pulse">Loading temple announcements...</p>
        </div>
      ) : isError ? (
        <div className="spiritual-card p-6 border-rose-200 bg-rose-50 text-rose-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Failed to load announcements</h3>
              <p className="text-xs mt-1 text-rose-600">
                {error?.data?.message || 'An error occurred while fetching announcements.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="spiritual-card p-12 text-center bg-white border border-spiritual-border rounded-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-spiritual-surface flex items-center justify-center text-spiritual-primary mb-3 border border-spiritual-borderLight">
            <Megaphone className="w-6 h-6 text-spiritual-primary/60" />
          </div>
          <h3 className="font-serif font-bold text-base text-spiritual-text">No announcements found</h3>
          <p className="text-xs text-spiritual-muted max-w-sm mx-auto mt-1 mb-5">
            {selectedFilter !== 'ALL'
              ? 'No notices match this category filter. Try viewing all announcements.'
              : 'Broadcast darshan timings, festival news, closures, and instructions to devotees visiting your temple.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-spiritual-primary hover:bg-spiritual-primaryHover text-white text-xs font-semibold rounded-lg shadow-spiritual transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish First Announcement</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAnnouncements.map((item) => {
            const expired = isExpired(item);
            const typeMeta = getTypeMeta(item.type);
            const IconComponent = typeMeta.icon;

            return (
              <div
                key={item._id}
                className={`spiritual-card p-5 bg-white border border-l-4 transition-all rounded-xl ${
                  typeMeta.borderClass
                } ${
                  !item.isActive
                    ? 'border-dashed border-stone-300 opacity-70 bg-stone-50/50'
                    : expired
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-spiritual-border hover:border-spiritual-primary/50 shadow-spiritual-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Badge & Timing Tokens */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${typeMeta.badgeClass}`}
                      >
                        <IconComponent className="w-3 h-3" />
                        {typeMeta.label}
                      </span>

                      {item.isActive ? (
                        expired ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Now
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-stone-200 text-stone-700">
                          Inactive (Draft)
                        </span>
                      )}

                      <span className="text-[11px] text-spiritual-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        Published {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                      </span>

                      {item.expiresAt && (
                        <span className="text-[11px] text-spiritual-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          Expires {new Date(item.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-serif font-bold text-spiritual-text">
                      {item.title}
                    </h2>

                    <p className="text-xs text-spiritual-muted leading-relaxed whitespace-pre-line">
                      {item.message}
                    </p>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-spiritual-muted hover:text-spiritual-primary hover:bg-spiritual-surface rounded-lg transition-colors border border-spiritual-border"
                      title="Preview Devotee Portal Banner"
                    >
                      <Eye className="w-3.5 h-3.5 text-spiritual-primary" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-spiritual-muted hover:text-spiritual-primary hover:bg-spiritual-surface rounded-lg transition-colors border border-spiritual-border"
                      title="Edit Announcement"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteCandidate(item)}
                      className="p-1.5 text-spiritual-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-spiritual-border"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PUBLIC BANNER PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-spiritual-borderLight">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-spiritual-primary" />
                <h3 className="font-serif font-bold text-base text-spiritual-text">
                  Devotee Portal Banner Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-spiritual-muted">
              Here is how visiting devotees will see this alert at the header of your temple profile:
            </p>

            {/* Simulated Live Devotee Banner */}
            <div className="p-4 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-spiritual-primary/10 shadow-spiritual-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-spiritual-primary text-white flex items-center justify-center shrink-0 shadow-spiritual-xs mt-0.5">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      {previewItem.type} Notice
                    </span>
                    <span className="text-[10px] text-amber-800">Live Temple Announcement</span>
                  </div>
                  <h4 className="font-bold text-spiritual-text text-sm">{previewItem.title}</h4>
                  <p className="text-xs text-spiritual-text leading-relaxed whitespace-pre-line">
                    {previewItem.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-spiritual-primary text-white rounded-lg text-xs font-semibold hover:bg-spiritual-primaryHover"
              >
                Done Previewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-spiritual-border flex items-center justify-between bg-spiritual-surface/50">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-spiritual-primary" />
                <h3 className="font-serif font-bold text-base text-spiritual-text">
                  {editingAnnouncement ? 'Edit Announcement' : 'Publish Broadcast Notice'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1">
                  Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="e.g. Special Maha Shivaratri Darshan Schedule & Gate Notice"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-spiritual-border rounded-lg focus:outline-none focus:border-spiritual-primary bg-spiritual-surface/30"
                />
                <span className="text-[10px] text-spiritual-muted block text-right mt-1">
                  {formData.title.length}/200
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-spiritual-text mb-1">
                    Notice Category
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-spiritual-border rounded-lg focus:outline-none focus:border-spiritual-primary bg-spiritual-surface/30 cursor-pointer"
                  >
                    {ANNOUNCEMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-spiritual-text mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-spiritual-border rounded-lg focus:outline-none focus:border-spiritual-primary bg-spiritual-surface/30 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Expiry Presets */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-spiritual-muted text-[10px] uppercase font-bold mr-1">Quick Expiry:</span>
                {[
                  { label: '24 Hours', days: 1 },
                  { label: '3 Days', days: 3 },
                  { label: '1 Week', days: 7 },
                  { label: '1 Month', days: 30 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQuickExpiry(preset.days)}
                    className="px-2 py-0.5 bg-spiritual-surface hover:bg-stone-200 border border-spiritual-border rounded text-[11px] text-spiritual-text transition-colors"
                  >
                    +{preset.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-spiritual-text mb-1">
                  Announcement Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="Provide complete details for devotees, including timings, entry gates, special guidelines, or helpline information..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-spiritual-border rounded-lg focus:outline-none focus:border-spiritual-primary bg-spiritual-surface/30 resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center text-[10px] text-spiritual-muted mt-1">
                  <span>Devotees will see this text in the Live Temple Notice banner.</span>
                  <span>{formData.message.length}/2000</span>
                </div>
              </div>

              {editingAnnouncement && (
                <div className="pt-2 border-t border-spiritual-border/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-spiritual-primary focus:ring-spiritual-primary border-spiritual-border"
                    />
                    <span className="text-xs font-semibold text-spiritual-text">
                      Active (Display publicly on temple profile)
                    </span>
                  </label>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-spiritual-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-medium text-spiritual-muted hover:text-spiritual-text bg-spiritual-surface hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-spiritual-primary hover:bg-spiritual-primaryHover rounded-lg shadow-spiritual transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isCreating || isUpdating
                    ? 'Broadcasting...'
                    : editingAnnouncement
                    ? 'Update Announcement'
                    : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-base text-spiritual-text">
                Delete this broadcast?
              </h3>
              <p className="text-xs text-spiritual-muted">
                "{deleteCandidate.title}" will be permanently removed from your temple's public profile.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 text-xs font-medium text-spiritual-muted hover:text-spiritual-text bg-spiritual-surface hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityAnnouncements;
