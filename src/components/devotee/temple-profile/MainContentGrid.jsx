import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Landmark,
  Calendar,
  Clock,
  ArrowRight,
  X,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useGetTempleAnnouncementsQuery } from '../../../store/api/devoteeApi.js';

// Generic fallback devotional greetings (UI-only fallback, never saved to DB)
const DEVOTIONAL_GREETINGS = [
  { id: 'g1', text: '🙏 May your visit be filled with peace and blessings.', sub: 'DevaSetu Darshan Wishes' },
  { id: 'g2', text: '🪔 May the divine light guide your path.', sub: 'Sacred Pilgrimage Blessing' },
  { id: 'g3', text: '🌸 Wishing you a peaceful and blessed darshan.', sub: 'Devotional Well-wishes' },
  { id: 'g4', text: 'Om Namah Shivaya 🙏', sub: 'Divine Remembrance' },
  { id: 'g5', text: 'May your journey to the sacred place be filled with devotion and grace.', sub: 'Pilgrim Blessing' },
];

export const MainContentGrid = ({
  temple,
  services = [],
  selectedServiceId,
  setSelectedServiceId,
  selectedDate,
  setSelectedDate,
  onOpenAvailabilityModal,
}) => {
  // Fetch real announcements for this temple
  const { data: announcementsRes } = useGetTempleAnnouncementsQuery(temple?._id, {
    skip: !temple?._id,
  });
  const announcements = announcementsRes?.data || [];

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Auto-select first service if none selected
  useEffect(() => {
    if (!selectedServiceId && services.length > 0) {
      setSelectedServiceId(services[0]._id);
    }
  }, [services, selectedServiceId, setSelectedServiceId]);

  const activeService = services.find((s) => s._id === selectedServiceId) || services[0];
  const hasRealAnnouncements = announcements.length > 0;

  // Continuous looping items: duplicate list to loop smoothly
  const tickerItems = hasRealAnnouncements
    ? [...announcements, ...announcements]
    : [...DEVOTIONAL_GREETINGS, ...DEVOTIONAL_GREETINGS];

  // Inline representative slots for quick inline display
  const inlineSlots = [
    { time: '06:00 AM', count: 120 },
    { time: '07:00 AM', count: 45 },
    { time: '08:00 AM', count: 20 },
    { time: '09:00 AM', count: 60 },
    { time: '10:00 AM', count: 88 },
    { time: '11:00 AM', count: 100 },
  ];

  const categoryName =
    temple?.categories?.[0]?.name || temple?.templeType || 'Sanctum';

  return (
    <div id="availability-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
      {/* ────────────────────────────────────────────────────────── */}
      {/* COLUMN 1: RECENT ANNOUNCEMENTS / DEVOTIONAL TICKER (4 cols)*/}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-4 flex flex-col spiritual-card bg-white border border-amber-200/60 rounded-2xl shadow-xs p-5 justify-between min-h-[280px]">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
                {hasRealAnnouncements ? (
                  <Megaphone className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </div>
              <h2 className="font-serif font-bold text-sm sm:text-base text-stone-800">
                {hasRealAnnouncements ? 'Recent Announcements' : 'Sacred Blessings'}
              </h2>
            </div>
            {hasRealAnnouncements && announcements.length > 2 && (
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(announcements[0])}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center cursor-pointer"
              >
                View All →
              </button>
            )}
          </div>

          {/* Continuous Bottom-to-Top Vertical Ticker */}
          <div
            className="announcements-ticker-viewport relative h-[185px] overflow-hidden group"
            tabIndex={0}
            aria-label="Continuous devotional ticker. Hover or focus to pause."
          >
            <div
              className={`space-y-3.5 ${
                !prefersReducedMotion ? 'announcements-continuous-track' : ''
              }`}
            >
              {tickerItems.map((item, idx) => (
                <div
                  key={`${item._id || item.id}-${idx}`}
                  onClick={() => hasRealAnnouncements && setSelectedAnnouncement(item)}
                  className={`flex items-start gap-3 relative ${
                    hasRealAnnouncements ? 'cursor-pointer group/item' : ''
                  }`}
                >
                  {/* Timeline dot & line */}
                  <div className="flex flex-col items-center shrink-0 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-white group-hover/item:bg-amber-500 transition-colors" />
                    {idx !== tickerItems.length - 1 && (
                      <div className="w-px h-9 bg-amber-200/70 my-0.5" />
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1">
                    {hasRealAnnouncements ? (
                      <>
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-serif font-bold text-xs text-stone-800 group-hover/item:text-amber-800 transition-colors truncate">
                            {item.title}
                          </h3>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {new Date(item.publishedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1 leading-snug mt-0.5">
                          {item.message}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-serif font-medium text-xs text-stone-800 leading-snug">
                          {item.text}
                        </p>
                        <span className="text-[10px] text-amber-700/80 block mt-0.5">
                          {item.sub}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle top & bottom fade masks for seamless roll */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white to-transparent z-10" />
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-white to-transparent z-10" />
          </div>
        </div>

        {/* Ticker Keyframe Styles */}
        <style>{`
          @keyframes continuousTickerRoll {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-50%);
            }
          }
          .announcements-continuous-track {
            animation: continuousTickerRoll 22s linear infinite;
          }
          .announcements-ticker-viewport:hover .announcements-continuous-track,
          .announcements-ticker-viewport:focus-within .announcements-continuous-track {
            animation-play-state: paused !important;
          }
        `}</style>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* COLUMN 2: ABOUT THIS SACRED PLACE (4 cols)                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-4 flex flex-col spiritual-card bg-white border border-amber-200/60 rounded-2xl shadow-xs p-5 justify-between min-h-[280px] space-y-4">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-serif font-bold text-sm sm:text-base text-stone-800">
              About This Sacred Place
            </h2>
          </div>

          {/* Description text */}
          <p className="text-xs text-stone-600 leading-relaxed pt-3 line-clamp-5">
            {temple.description}
          </p>
        </div>

        {/* Bottom Devotional Card / Metadata */}
        <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-800 font-serif font-bold text-base shrink-0">
            ॐ
          </div>
          <div className="min-w-0">
            <div className="text-xs font-serif font-bold text-amber-900 leading-tight">
              {temple.name}
            </div>
            <p className="text-[10px] text-amber-700/90 leading-tight mt-0.5 truncate">
              {temple.city} · {categoryName} Pilgrimage
            </p>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* COLUMN 3: CHECK DARSHAN AVAILABILITY (4 cols)             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-4 flex flex-col spiritual-card bg-white border border-amber-200/60 rounded-2xl shadow-xs p-5 justify-between min-h-[280px] space-y-3">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 pb-2.5 border-b border-amber-100">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm sm:text-base text-stone-800">
                Check Darshan Availability
              </h2>
              <p className="text-[10px] text-stone-400">
                Select a service and date to view available slots.
              </p>
            </div>
          </div>

          {/* Service & Date Controls */}
          <div className="space-y-2 pt-1 text-xs">
            <div>
              <label htmlFor="grid-service-select" className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                Service
              </label>
              <select
                id="grid-service-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#FCFBF7] border border-amber-200/80 rounded-lg text-xs text-stone-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.price === 0 ? 'Free' : `₹${s.price}`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="grid-date-input" className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                Date
              </label>
              <input
                id="grid-date-input"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#FCFBF7] border border-amber-200/80 rounded-lg text-xs text-stone-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Time Slot Buttons */}
          <div className="pt-2">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {inlineSlots.map((slot, i) => {
                const isSelected = selectedSlotIndex === i;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedSlotIndex(i);
                      onOpenAvailabilityModal?.(selectedServiceId, selectedDate);
                    }}
                    className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                        : 'bg-[#FCFBF7] border-amber-200/70 text-stone-700 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-tight">{slot.time}</div>
                    <div
                      className={`text-[9px] ${
                        isSelected ? 'text-amber-100' : 'text-stone-400'
                      }`}
                    >
                      {slot.count} slots
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA: Open Full Calendar Availability Modal */}
        <button
          type="button"
          onClick={() => onOpenAvailabilityModal?.(selectedServiceId, selectedDate)}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Check Availability</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Real Announcement Full Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-amber-200 shadow-xl max-w-md w-full p-5 space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2.5">
              <h3 className="font-serif font-bold text-base text-stone-800">
                {selectedAnnouncement.title}
              </h3>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-stone-500">
              Published:{' '}
              {new Date(selectedAnnouncement.publishedAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50 p-3 rounded-xl border border-stone-200">
              {selectedAnnouncement.message}
            </p>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContentGrid;
