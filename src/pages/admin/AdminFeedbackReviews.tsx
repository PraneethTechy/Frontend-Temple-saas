import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useGetAdminReviewsQuery,
  useGetAdminReviewMetricsQuery,
  useUpdateAdminReviewStatusMutation,
  useGetAdminTempleReviewInsightsQuery,
  useCreateAdminTempleRecommendationMutation,
  useGetAdminTempleRecommendationsQuery,
  useGetAdminTemplesQuery,
} from '../../store/api/adminApi.js';
import {
  InternalPageHeader,
} from '../../components/admin/common/index.js';

interface AdminFeedbackOutletContext {
  onOpenMobileSidebar?: () => void;
}

interface ReviewUserSummary {
  _id?: string;
  name?: string;
}

interface ReviewTempleSummary {
  _id?: string;
  name?: string;
}

interface ReviewBookingSummary {
  _id?: string;
  bookingReference?: string;
}

interface ReviewPhoto {
  url: string;
  alt?: string;
}

interface AdminReviewItem {
  _id: string;
  userId?: ReviewUserSummary | null;
  templeId?: ReviewTempleSummary | null;
  bookingId?: ReviewBookingSummary | null;
  rating: number;
  comment: string;
  status: string;
  photos?: ReviewPhoto[];
  createdAt: string;
}

interface ReviewTopic {
  topic: string;
  mentions: number;
}

interface TempleReviewInsights {
  temple?: { name?: string; _id?: string };
  insightLabel?: string;
  averageRating?: number;
  totalReviews?: number;
  topics?: ReviewTopic[];
}

interface AdminRecommendationItem {
  _id: string;
  title: string;
  category: string;
  status: string;
  observedFeedback: string;
  suggestedAction: string;
  createdAdminId?: { name?: string; _id?: string };
  createdAt: string;
}

const extractErrorMessage = (err: unknown, fallback = 'Failed to complete operation'): string => {
  if (err && typeof err === 'object' && 'data' in err) {
    const errorData = (err as { data?: { message?: string } }).data;
    if (errorData?.message) return errorData.message;
  }
  return fallback;
};

export const AdminFeedbackReviews: React.FC = () => {
  const { onOpenMobileSidebar } = (useOutletContext<AdminFeedbackOutletContext>() || {});
  const [activeTab, setActiveTab] = useState<'moderation' | 'insights'>('moderation');

  // Moderation state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('');
  const [templeFilter, setTempleFilter] = useState('');
  const [searchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected temple for insights
  const [selectedInsightTempleId, setSelectedInsightTempleId] = useState('');

  // Form for creating recommendation
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState('Queue Management');
  const [recObserved, setRecObserved] = useState('');
  const [recAction, setRecAction] = useState('');
  const [recFeedback, setRecFeedback] = useState('');

  const { data: templesRes } = useGetAdminTemplesQuery({ limit: 50 });
  const templesList = templesRes?.data?.temples || [];

  const { data: metricsRes, isLoading: metricsLoading } = useGetAdminReviewMetricsQuery();
  const metrics = metricsRes?.data || { total: 0, pending: 0, approved: 0, averageRating: 0, thisMonth: 0 };

  const { data: reviewsRes, isLoading: reviewsLoading, refetch: refetchReviews } =
    useGetAdminReviewsQuery({
      page,
      limit,
      status: statusFilter,
      rating: ratingFilter || undefined,
      templeId: templeFilter || undefined,
      search: searchTerm,
    });

  const rawReviews = reviewsRes?.data?.reviews || [];
  const reviews: AdminReviewItem[] = rawReviews.map((rev) => {
    const raw = rev as unknown as Record<string, unknown>;
    return {
      _id: String(raw._id || ''),
      userId: (raw.userId && typeof raw.userId === 'object') ? (raw.userId as ReviewUserSummary) : null,
      templeId: (raw.templeId && typeof raw.templeId === 'object') ? (raw.templeId as ReviewTempleSummary) : null,
      bookingId: (raw.bookingId && typeof raw.bookingId === 'object') ? (raw.bookingId as ReviewBookingSummary) : null,
      rating: typeof raw.rating === 'number' ? raw.rating : 5,
      comment: String(raw.comment || ''),
      status: String(raw.status || 'PENDING'),
      photos: Array.isArray(raw.photos) ? (raw.photos as ReviewPhoto[]) : undefined,
      createdAt: String(raw.createdAt || new Date().toISOString()),
    };
  });

  const pagination = reviewsRes?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateAdminReviewStatusMutation();
  const [createRecommendation, { isLoading: isCreatingRec }] = useCreateAdminTempleRecommendationMutation();

  const activeTempleId = selectedInsightTempleId || templesList[0]?._id;
  const { data: insightsRes } = useGetAdminTempleReviewInsightsQuery(
    activeTempleId || '',
    { skip: !activeTempleId }
  );
  const insights = insightsRes?.data as TempleReviewInsights | undefined;

  const { data: recommendationsRes, refetch: refetchRecs } = useGetAdminTempleRecommendationsQuery(
    { templeId: activeTempleId || undefined },
    { skip: !activeTempleId }
  );
  const rawRecs = (recommendationsRes?.data || []) as unknown[];
  const recommendations: AdminRecommendationItem[] = Array.isArray(rawRecs)
    ? rawRecs.map((item) => {
        const raw = item as Record<string, unknown>;
        return {
          _id: String(raw._id || ''),
          title: String(raw.title || ''),
          category: String(raw.category || 'General Operations'),
          status: String(raw.status || 'OPEN'),
          observedFeedback: String(raw.observedFeedback || ''),
          suggestedAction: String(raw.suggestedAction || ''),
          createdAdminId: (raw.createdAdminId && typeof raw.createdAdminId === 'object') ? (raw.createdAdminId as { name?: string; _id?: string }) : undefined,
          createdAt: String(raw.createdAt || new Date().toISOString()),
        };
      })
    : [];

  const handleModerate = async (reviewId: string, newStatus: string) => {
    try {
      await updateStatus({ id: reviewId, status: newStatus }).unwrap();
      void refetchReviews();
    } catch (err: unknown) {
      alert(extractErrorMessage(err, 'Failed to update review status'));
    }
  };

  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTempleId = selectedInsightTempleId || templesList[0]?._id;
    if (!targetTempleId) return;

    setRecFeedback('');
    try {
      await createRecommendation({
        templeId: targetTempleId,
        title: recTitle,
        category: recCategory,
        observedFeedback: recObserved,
        suggestedAction: recAction,
      }).unwrap();
      setRecFeedback('Improvement recommendation created successfully.');
      setRecTitle('');
      setRecObserved('');
      setRecAction('');
      void refetchRecs();
    } catch (err: unknown) {
      setRecFeedback(extractErrorMessage(err, 'Failed to create recommendation.'));
    }
  };

  const renderStars = (rating: number): React.ReactElement => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating
              ? 'text-amber-500 fill-amber-500'
              : 'text-spiritual-subtle'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <InternalPageHeader
        eyebrow="OPERATIONS & MODERATION"
        title="Feedback & Devotee Reviews"
        description="Review devotee ratings, moderate public experiences, and extract operational feedback insights."
        onOpenMobileSidebar={onOpenMobileSidebar}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white border border-spiritual-border shadow-spiritual-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-spiritual-muted block">
            Total Reviews
          </span>
          <div className="text-xl font-bold font-serif text-spiritual-text mt-1">
            {metricsLoading ? '...' : metrics.total}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-spiritual-border shadow-spiritual-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Pending Approval
          </span>
          <div className="text-xl font-bold font-serif text-amber-700 mt-1">
            {metricsLoading ? '...' : metrics.pending}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-spiritual-border shadow-spiritual-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Approved
          </span>
          <div className="text-xl font-bold font-serif text-emerald-700 mt-1">
            {metricsLoading ? '...' : metrics.approved}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-spiritual-border shadow-spiritual-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-spiritual-accent block">
            Average Rating
          </span>
          <div className="text-xl font-bold font-serif text-spiritual-accent mt-1 flex items-center gap-1">
            <span>{metricsLoading ? '...' : metrics.averageRating}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500 inline" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-spiritual-border shadow-spiritual-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-spiritual-muted block">
            This Month
          </span>
          <div className="text-xl font-bold font-serif text-spiritual-text mt-1">
            {metricsLoading ? '...' : metrics.thisMonth}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-spiritual-border">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'moderation'
              ? 'border-spiritual-primary text-spiritual-primary'
              : 'border-transparent text-spiritual-muted hover:text-spiritual-text'
          }`}
        >
          Review Moderation
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'insights'
              ? 'border-spiritual-primary text-spiritual-primary'
              : 'border-transparent text-spiritual-muted hover:text-spiritual-text'
          }`}
        >
          Temple Feedback Insights & Recommendations
        </button>
      </div>

      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {/* Moderation Filters */}
          <div className="bg-white rounded-2xl border border-spiritual-border p-4 shadow-spiritual-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-spiritual-muted mr-1">
                Status:
              </span>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-spiritual-primary text-white shadow-spiritual-xs'
                      : 'bg-spiritual-surface text-spiritual-muted hover:text-spiritual-text'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Temple Filter */}
              <select
                value={templeFilter}
                onChange={(e) => {
                  setTempleFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-spiritual-border bg-spiritual-surface/40 text-spiritual-text focus:outline-hidden cursor-pointer"
              >
                <option value="">All Temples</option>
                {templesList.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-spiritual-border bg-spiritual-surface/40 text-spiritual-text focus:outline-hidden cursor-pointer"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xs overflow-hidden">
            {reviewsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-spiritual-surface animate-pulse rounded-lg" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-16 text-center">
                <MessageSquare className="w-10 h-10 text-spiritual-subtle mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-spiritual-text mb-1">No reviews found</h3>
                <p className="text-xs text-spiritual-muted max-w-sm mx-auto">
                  Devotee reviews and ratings will appear here once submitted.
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-spiritual-border">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-5 hover:bg-spiritual-surface/20 transition-colors space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-spiritual-text text-xs">
                            {rev.userId?.name || 'Devotee'}
                          </span>
                          <span className="text-[10px] text-spiritual-muted">•</span>
                          <span className="text-xs text-spiritual-primary font-medium">
                            {rev.templeId?.name || 'Temple'}
                          </span>
                          {rev.bookingId?.bookingReference && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-spiritual-surface border border-spiritual-border text-spiritual-subtle">
                              Ref: {rev.bookingId.bookingReference}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {renderStars(rev.rating)}
                          <span className="text-[10px] text-spiritual-muted font-mono ml-2">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {rev.status === 'APPROVED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Approved
                            </span>
                          )}
                          {rev.status === 'REJECTED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              Rejected
                            </span>
                          )}
                          {rev.status === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-spiritual-text leading-relaxed">
                        "{rev.comment}"
                      </p>

                      {/* Devotee Uploaded Photos Preview */}
                      {rev.photos && rev.photos.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                          {rev.photos.map((photo, pIdx) => (
                            <a
                              key={pIdx}
                              href={photo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative group shrink-0"
                            >
                              <img
                                src={photo.url}
                                alt={photo.alt || `Review photo ${pIdx + 1}`}
                                className="w-14 h-14 object-cover rounded-lg border border-spiritual-border group-hover:opacity-90 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {rev.status !== 'APPROVED' && (
                          <button
                            onClick={() => void handleModerate(rev._id, 'APPROVED')}
                            disabled={isUpdatingStatus}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {rev.status !== 'REJECTED' && (
                          <button
                            onClick={() => void handleModerate(rev._id, 'REJECTED')}
                            disabled={isUpdatingStatus}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-spiritual-border flex items-center justify-between">
                    <span className="text-xs text-spiritual-muted">
                      Showing <strong>{reviews.length}</strong> of <strong>{pagination.total}</strong> reviews
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1 rounded border border-spiritual-border disabled:opacity-40 hover:bg-spiritual-surface transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-spiritual-muted font-mono px-2">
                        {page} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="p-1 rounded border border-spiritual-border disabled:opacity-40 hover:bg-spiritual-surface transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Temple Selector for Insights */}
          <div className="bg-white rounded-2xl border border-spiritual-border p-4 shadow-spiritual-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-spiritual-text">Select Temple for Feedback Insights</h3>
              <p className="text-xs text-spiritual-muted mt-0.5">
                Aggregate real review patterns and formulate actionable improvements for the temple authority.
              </p>
            </div>
            <select
              value={selectedInsightTempleId || templesList[0]?._id || ''}
              onChange={(e) => setSelectedInsightTempleId(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface/40 text-spiritual-text focus:outline-hidden cursor-pointer"
            >
              {templesList.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>

          {/* Insights Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Feedback Mentions (Recurring Topics) */}
            <div className="bg-white rounded-2xl border border-spiritual-border p-5 shadow-spiritual-xs space-y-4">
              <div className="flex items-center justify-between border-b border-spiritual-border pb-3">
                <div>
                  <h3 className="text-sm font-serif font-bold text-spiritual-text">
                    {insights?.temple?.name || 'Selected Temple'}
                  </h3>
                  <div className="text-[11px] text-spiritual-muted mt-0.5 italic">
                    {insights?.insightLabel || 'Recurring topics detected from approved review comments'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-spiritual-accent flex items-center justify-end gap-1">
                    <span>{insights?.averageRating || 0}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="text-[10px] text-spiritual-subtle">
                    {insights?.totalReviews || 0} approved reviews
                  </div>
                </div>
              </div>

              {insights?.topics && insights.topics.length > 0 ? (
                <div className="space-y-3">
                  {insights.topics.map((t) => (
                    <div key={t.topic} className="flex items-center justify-between p-2.5 rounded-lg bg-spiritual-surface/40 border border-spiritual-border/60">
                      <span className="text-xs font-medium text-spiritual-text">{t.topic}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-spiritual-border text-spiritual-primary">
                        {t.mentions} mention{t.mentions !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-spiritual-muted">
                  No review comments available for topic detection yet.
                </div>
              )}
            </div>

            {/* Right: Recommendation Creation Form */}
            <div className="bg-white rounded-2xl border border-spiritual-border p-5 shadow-spiritual-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-spiritual-border pb-3">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-serif font-bold text-spiritual-text">
                  Create Improvement Recommendation
                </h3>
              </div>

              {recFeedback && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  {recFeedback}
                </div>
              )}

              <form onSubmit={handleCreateRecommendation} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-spiritual-text mb-1">
                    Recommendation Title
                  </label>
                  <input
                    type="text"
                    required
                    value={recTitle}
                    onChange={(e) => setRecTitle(e.target.value)}
                    placeholder="e.g. Queue Optimization during Darshan Peaks"
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface/30 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-spiritual-text mb-1">
                    Operational Category
                  </label>
                  <select
                    value={recCategory}
                    onChange={(e) => setRecCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface/30 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Queue Management">Queue Management</option>
                    <option value="Parking & Accessibility">Parking & Accessibility</option>
                    <option value="Facilities & Cleanliness">Facilities & Cleanliness</option>
                    <option value="Staff Assistance">Staff Assistance</option>
                    <option value="Darshan Experience">Darshan Experience</option>
                    <option value="General Operations">General Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-spiritual-text mb-1">
                    Observed Review Feedback (Evidence)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={recObserved}
                    onChange={(e) => setRecObserved(e.target.value)}
                    placeholder="e.g. 18 approved reviews mention long waiting times during weekend evening slots."
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface/30 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-spiritual-text mb-1">
                    Suggested Action for Temple Authority
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={recAction}
                    onChange={(e) => setRecAction(e.target.value)}
                    placeholder="e.g. Consider reviewing queue management and evaluating additional time slots during peak hours."
                    className="w-full px-3 py-2 rounded-lg border border-spiritual-border bg-spiritual-surface/30 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingRec}
                  className="w-full py-2 px-4 rounded-lg bg-spiritual-primary text-white font-semibold text-xs hover:bg-spiritual-dark transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCreatingRec ? 'Saving...' : 'Send Recommendation to Temple Authority'}
                </button>
              </form>
            </div>
          </div>

          {/* Active Platform Recommendations for this Temple */}
          <div className="bg-white rounded-2xl border border-spiritual-border p-5 shadow-spiritual-xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-spiritual-text border-b border-spiritual-border pb-3">
              Recommendations Trail
            </h3>

            {recommendations.length === 0 ? (
              <div className="p-8 text-center text-xs text-spiritual-muted">
                No active recommendations logged for this temple yet.
              </div>
            ) : (
              <div className="divide-y divide-spiritual-border">
                {recommendations.map((rec) => (
                  <div key={rec._id} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-spiritual-text">{rec.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-spiritual-surface border border-spiritual-border text-spiritual-accent font-medium">
                          {rec.category}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          rec.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : rec.status === 'ACKNOWLEDGED'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-xs text-spiritual-muted">
                      <strong>Evidence:</strong> {rec.observedFeedback}
                    </p>
                    <p className="text-xs text-spiritual-text">
                      <strong>Suggested Action:</strong> {rec.suggestedAction}
                    </p>
                    <div className="text-[10px] text-spiritual-subtle font-mono pt-1">
                      Logged by {rec.createdAdminId?.name || 'Admin'} on{' '}
                      {new Date(rec.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackReviews;
