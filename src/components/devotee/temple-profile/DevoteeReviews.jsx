import React from 'react';
import { Star, MessageSquareHeart, User } from 'lucide-react';
import { useGetTempleReviewsQuery } from '../../../store/api/devoteeApi.js';

export const DevoteeReviews = ({ templeId }) => {
  const { data: reviewsRes, isLoading } = useGetTempleReviewsQuery(templeId, {
    skip: !templeId,
  });

  const reviews = reviewsRes?.data?.items || [];
  const summary = reviewsRes?.data?.summary || { averageRating: null, totalReviews: 0 };

  if (isLoading) {
    return (
      <div className="spiritual-card p-6 bg-white border border-amber-200/60 rounded-3xl animate-pulse space-y-3">
        <div className="h-5 bg-amber-100 rounded w-48" />
        <div className="h-20 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <section id="reviews-section" className="scroll-mt-28 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Devotee Voice</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-spiritual-text">
            Devotee Experiences
          </h2>
          <p className="text-xs sm:text-sm text-spiritual-muted mt-1">
            Reflections and darshan experiences shared by visiting pilgrims.
          </p>
        </div>

        {summary.totalReviews > 0 && summary.averageRating && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-800 shrink-0">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(summary.averageRating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span>{summary.averageRating} / 5</span>
            <span className="text-spiritual-muted font-normal">
              ({summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      {/* Reviews Content */}
      {reviews.length === 0 ? (
        <div className="spiritual-card px-6 py-8 bg-[#FCFBF7] border border-amber-200/60 rounded-3xl text-center space-y-1">
          <p className="font-serif font-bold text-sm text-spiritual-text">
            All is peaceful here.
          </p>
          <p className="text-xs text-spiritual-muted">
            No devotee experiences shared yet for this temple.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="spiritual-card p-5 bg-white border border-amber-200/60 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-spiritual-muted">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Devotee Safe Privacy Display Name */}
              <div className="pt-3 border-t border-amber-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-[10px] font-bold">
                  {rev.reviewerName?.charAt(0) || 'D'}
                </div>
                <span className="text-xs font-semibold text-spiritual-text truncate">
                  {rev.reviewerName || 'Devotee'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DevoteeReviews;
