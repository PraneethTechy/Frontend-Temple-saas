import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  X,
  Volume2,
  Clock,
} from 'lucide-react';
import { useGetTempleAnnouncementsQuery } from '../../store/api/devoteeApi.js';

const TYPE_CONFIG = {
  IMPORTANT: {
    label: 'Important',
    badge: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
    accentBorder: 'border-l-4 border-l-rose-500',
  },
  FESTIVAL: {
    label: 'Festival',
    badge: 'bg-orange-50 text-orange-800 border-orange-200 font-medium',
    accentBorder: 'border-l-4 border-l-orange-500',
  },
  DARSHAN: {
    label: 'Darshan',
    badge: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
    accentBorder: 'border-l-4 border-l-amber-500',
  },
  SERVICE: {
    label: 'Service',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium',
    accentBorder: 'border-l-4 border-l-emerald-500',
  },
  NOTICE: {
    label: 'Notice',
    badge: 'bg-sky-50 text-sky-800 border-sky-200 font-medium',
    accentBorder: 'border-l-4 border-l-sky-500',
  },
  GENERAL: {
    label: 'General',
    badge: 'bg-stone-50 text-stone-700 border-stone-200 font-medium',
    accentBorder: 'border-l-4 border-l-spiritual-primary/40',
  },
};

export const TempleAnnouncementsScroll = ({ templeId }) => {
  const { data: res, isLoading, isError } = useGetTempleAnnouncementsQuery(templeId, {
    skip: !templeId,
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const announcements = res?.data || [];

  if (isLoading) {
    return (
      <div className="spiritual-card p-6 bg-[#FCFBF7] border border-spiritual-border/80 rounded-2xl animate-pulse">
        <div className="h-5 bg-spiritual-borderLight rounded w-44 mb-4"></div>
        <div className="h-24 bg-white/70 rounded-xl"></div>
      </div>
    );
  }

  if (isError) {
    return null; // Gracefully degrade if endpoint is unavailable
  }

  // 1. Zero announcements empty state
  if (announcements.length === 0) {
    return (
      <div className="spiritual-card px-5 py-4 bg-[#FCFBF7] border border-amber-200/60 rounded-2xl shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif font-bold text-sm text-spiritual-text">
            Recent Announcements
          </span>
        </div>
        <div className="text-xs text-spiritual-muted italic text-right">
          All is peaceful here. No recent announcements from this temple.
        </div>
      </div>
    );
  }

  // 2. Single announcement: Clean static presentation without aggressive scroll loop
  if (announcements.length === 1) {
    const item = announcements[0];
    const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.GENERAL;

    return (
      <div className="spiritual-card bg-[#FCFBF7] border border-amber-200/70 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-amber-200/50 flex items-center justify-between bg-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-spiritual-primary/10 flex items-center justify-center text-spiritual-primary">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-serif font-bold text-base text-spiritual-text">
              Recent Announcements
            </h2>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Live update"></span>
          </div>
          <span className="text-[11px] font-medium text-spiritual-muted">1 Notice</span>
        </div>

        <div className="p-5">
          <div
            tabIndex={0}
            onClick={() => setSelectedAnnouncement(item)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedAnnouncement(item)}
            className={`p-4 bg-white rounded-xl border border-spiritual-border/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-spiritual-primary/40 ${typeMeta.accentBorder}`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className={`px-2 py-0.5 text-[10px] rounded-full border ${typeMeta.badge}`}>
                {typeMeta.label}
              </span>
              <span className="text-[11px] text-spiritual-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.publishedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h3 className="font-serif font-bold text-sm text-spiritual-text leading-snug">
              {item.title}
            </h3>
            <p className="text-xs text-spiritual-text/80 mt-1 line-clamp-2 leading-relaxed">
              {item.message}
            </p>
          </div>
        </div>

        {/* Modal for full details */}
        {renderDetailModal(selectedAnnouncement, setSelectedAnnouncement)}
      </div>
    );
  }

  // 3. Multiple announcements: Smooth Bottom-to-Top Scrolling
  // Duration: ~7 seconds per item for readable pace
  const animationDuration = Math.max(16, announcements.length * 7);

  // If user prefers reduced motion, render static scrollable view
  if (prefersReducedMotion) {
    return (
      <div className="spiritual-card bg-[#FCFBF7] border border-amber-200/70 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-amber-200/50 flex items-center justify-between bg-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-spiritual-primary/10 flex items-center justify-center text-spiritual-primary">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-serif font-bold text-base text-spiritual-text">
              Recent Announcements
            </h2>
          </div>
          <span className="text-[11px] font-medium text-spiritual-muted">
            {announcements.length} Notices
          </span>
        </div>

        <div className="p-4 max-h-[260px] overflow-y-auto space-y-3">
          {announcements.map((item) => {
            const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.GENERAL;
            return (
              <div
                key={item._id}
                tabIndex={0}
                onClick={() => setSelectedAnnouncement(item)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedAnnouncement(item)}
                className={`p-3.5 bg-white rounded-xl border border-spiritual-border/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-spiritual-primary/40 ${typeMeta.accentBorder}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${typeMeta.badge}`}>
                    {typeMeta.label}
                  </span>
                  <span className="text-[11px] text-spiritual-muted">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xs text-spiritual-text">
                  {item.title}
                </h3>
                <p className="text-xs text-spiritual-text/80 mt-1 line-clamp-2">
                  {item.message}
                </p>
              </div>
            );
          })}
        </div>

        {renderDetailModal(selectedAnnouncement, setSelectedAnnouncement)}
      </div>
    );
  }

  // Duplicate items for continuous seamless loop without visual jumps
  const loopList = [...announcements, ...announcements];

  return (
    <div className="spiritual-card bg-[#FCFBF7] border border-amber-200/70 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-amber-200/50 flex items-center justify-between bg-amber-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-spiritual-primary/10 flex items-center justify-center text-spiritual-primary">
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif font-bold text-base text-spiritual-text">
            Recent Announcements
          </h2>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Live announcements"></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-spiritual-muted">
            {announcements.length} Notices
          </span>
          <span className="text-[10px] text-stone-400 hidden sm:inline">• Hover or focus to pause</span>
        </div>
      </div>

      {/* Vertical Bottom-to-Top Scrolling Container */}
      <div
        className="announcement-scroll-wrapper relative h-[210px] overflow-hidden p-4 group"
        tabIndex={0}
        aria-label="Recent Temple Announcements ticker. Press tab to navigate through announcements."
      >
        <div
          className="announcement-scroll-track space-y-3"
          style={{
            animation: `scrollBottomToTop ${animationDuration}s linear infinite`,
          }}
        >
          {loopList.map((item, index) => {
            const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.GENERAL;
            return (
              <div
                key={`${item._id}-${index}`}
                tabIndex={0}
                onClick={() => setSelectedAnnouncement(item)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedAnnouncement(item)}
                className={`p-3.5 bg-white rounded-xl border border-spiritual-border/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-spiritual-primary/40 ${typeMeta.accentBorder}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${typeMeta.badge}`}>
                    {typeMeta.label}
                  </span>
                  <span className="text-[11px] text-spiritual-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.publishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-sm text-spiritual-text leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-spiritual-text/80 mt-1 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>
            );
          })}
        </div>

        {/* Soft edge blur overlays to create smooth entrance/exit */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#FCFBF7] to-transparent z-10" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#FCFBF7] to-transparent z-10" />
      </div>

      {/* Scoped CSS keyframe animation */}
      <style>{`
        @keyframes scrollBottomToTop {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .announcement-scroll-wrapper:hover .announcement-scroll-track,
        .announcement-scroll-wrapper:focus-within .announcement-scroll-track {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Modal for full details */}
      {renderDetailModal(selectedAnnouncement, setSelectedAnnouncement)}
    </div>
  );
};

// Modal helper to view complete announcement text
function renderDetailModal(announcement, onClose) {
  if (!announcement) return null;
  const typeMeta = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.GENERAL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3 border-b border-spiritual-border pb-3">
          <div className="space-y-1">
            <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full border ${typeMeta.badge}`}>
              {typeMeta.label}
            </span>
            <h3 className="font-serif font-bold text-lg text-spiritual-text leading-snug">
              {announcement.title}
            </h3>
          </div>
          <button
            onClick={() => onClose(null)}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-4 text-spiritual-muted text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Published: {new Date(announcement.publishedAt).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {announcement.expiresAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Valid until: {new Date(announcement.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="p-4 bg-spiritual-surface/40 rounded-xl border border-spiritual-borderLight text-spiritual-text leading-relaxed whitespace-pre-line text-xs">
            {announcement.message}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => onClose(null)}
            className="px-4 py-2 text-xs font-semibold text-white bg-spiritual-primary hover:bg-spiritual-primaryDark rounded-lg shadow-spiritual transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TempleAnnouncementsScroll;
