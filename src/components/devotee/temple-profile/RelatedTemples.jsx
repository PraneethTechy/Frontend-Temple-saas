import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, MapPin, ArrowRight } from 'lucide-react';
import { useGetTemplesQuery } from '../../../store/api/devoteeApi.js';

export const RelatedTemples = ({ currentTemple }) => {
  const primaryCategory = currentTemple?.categories?.[0]?.slug || null;

  // 1. First attempt: Query temples in the same category or state
  const { data: primaryRes, isLoading: isPrimaryLoading } = useGetTemplesQuery(
    primaryCategory
      ? { category: primaryCategory, limit: 6 }
      : { state: currentTemple?.state, limit: 6 },
    { skip: !currentTemple?._id }
  );

  // 2. Fallback query if category has no other temples
  const { data: fallbackRes } = useGetTemplesQuery(
    { limit: 6 },
    {
      skip:
        !currentTemple?._id ||
        (primaryRes?.data?.items || []).filter(
          (t) => t._id !== currentTemple._id && t.slug !== currentTemple.slug
        ).length >= 2,
    }
  );

  const primaryCandidates = (primaryRes?.data?.items || []).filter(
    (t) => t._id !== currentTemple._id && t.slug !== currentTemple.slug
  );

  const fallbackCandidates = (fallbackRes?.data?.items || []).filter(
    (t) => t._id !== currentTemple._id && t.slug !== currentTemple.slug
  );

  const relatedList = (
    primaryCandidates.length > 0 ? primaryCandidates : fallbackCandidates
  ).slice(0, 4);

  if (isPrimaryLoading) {
    return (
      <div className="space-y-4 pt-4 border-t border-amber-200/50 animate-pulse">
        <div className="h-6 bg-amber-100 rounded w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-stone-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (relatedList.length === 0) {
    return null; // Omit if no other active temples are available
  }

  return (
    <section id="related-temples" className="scroll-mt-28 space-y-6 pt-4 border-t border-amber-200/60">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Sacred Pilgrimages</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-spiritual-text">
            Explore More Sacred Temples
          </h2>
          <p className="text-xs sm:text-sm text-spiritual-muted mt-1">
            Discover other revered kshetras across India.
          </p>
        </div>

        <Link
          to="/temples"
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0"
        >
          <span>All Temples</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedList.map((t) => {
          const thumb =
            t.gallery?.find((img) => img.isThumbnail)?.url ||
            t.coverImage?.url ||
            t.gallery?.[0]?.url ||
            null;

          return (
            <Link
              key={t._id}
              to={`/temples/${t.slug}`}
              className="spiritual-card bg-white border border-amber-200/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-spiritual-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="h-44 bg-stone-900 overflow-hidden relative">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900 to-stone-900 flex items-center justify-center text-amber-200/40">
                      <Landmark className="w-8 h-8" />
                    </div>
                  )}
                  {t.templeType && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-amber-200 border border-white/20">
                      {t.templeType}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-serif font-bold text-base text-spiritual-text leading-snug group-hover:text-amber-700 transition-colors line-clamp-1">
                    {t.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-spiritual-muted">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="truncate">{t.city}, {t.state}</span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                <span>View Temple</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedTemples;
