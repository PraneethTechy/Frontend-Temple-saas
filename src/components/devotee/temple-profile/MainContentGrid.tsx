import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Landmark,
  Calendar,
  Clock,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import {
  useGetTempleAnnouncementsQuery,
  useGetServiceAvailabilityQuery,
} from '../../../store/api/devoteeApi.js';
import type { Temple, Service, TempleAnnouncement } from '@shared/types/index.js';
import type { ServiceAvailabilitySlotItem } from './TempleAvailabilityModal.js';

export interface DevotionalGreeting {
  id: string;
  _id?: string;
  text: string;
  sub: string;
}

export type TickerItem = (TempleAnnouncement | DevotionalGreeting) & {
  _id?: string;
  id?: string;
  title?: string;
  message?: string;
  publishedAt?: string | Date;
  text?: string;
  sub?: string;
};

export interface MainContentGridProps {
  temple?: Partial<Temple> & {
    _id: string;
    name?: string;
    city?: string;
    description?: string;
    categories?: Array<{ name: string; _id?: string }>;
    templeType?: string;
  };
  services?: Partial<Service>[];
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onOpenAvailabilityModal?: (serviceId?: string, date?: string, slotId?: string) => void;
}

// Format HH:mm or HH:mm:ss to 12-hour AM/PM format
const formatSlotTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const formattedHours = String(hours).padStart(2, '0');
  return `${formattedHours}:${minutes} ${period}`;
};

// Generic fallback devotional greetings (UI-only fallback, never saved to DB)
const DEVOTIONAL_GREETINGS: DevotionalGreeting[] = [
  { id: 'g1', text: '🙏 May your visit be filled with peace and blessings.', sub: 'DevaSetu Darshan Wishes' },
  { id: 'g2', text: '🪔 May the divine light guide your path.', sub: 'Sacred Pilgrimage Blessing' },
  { id: 'g3', text: '🌸 Wishing you a peaceful and blessed darshan.', sub: 'Devotional Well-wishes' },
  { id: 'g4', text: 'Om Namah Shivaya 🙏', sub: 'Divine Remembrance' },
  { id: 'g5', text: 'May your journey to the sacred place be filled with devotion and grace.', sub: 'Pilgrim Blessing' },
];

function isSlotItemArray(value: unknown): value is ServiceAvailabilitySlotItem[] {
  return Array.isArray(value);
}

export const MainContentGrid: React.FC<MainContentGridProps> = ({
  temple,
  services = [],
  selectedServiceId,
  setSelectedServiceId,
  selectedDate,
  setSelectedDate,
  onOpenAvailabilityModal,
}) => {
  // Fetch real announcements for this temple
  const { data: announcementsRes } = useGetTempleAnnouncementsQuery(temple?._id || '', {
    skip: !temple?._id,
  });
  const announcements: TempleAnnouncement[] = announcementsRes?.data || [];

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<TempleAnnouncement | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Fetch real availability for temple + selected service + selected date
  const {
    data: availabilityRes,
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
    isError: isSlotsError,
    refetch: refetchSlots,
  } = useGetServiceAvailabilityQuery(
    {
      templeId: temple?._id || '',
      serviceId: selectedServiceId,
      date: selectedDate,
    },
    {
      skip: !temple?._id || !selectedServiceId || !selectedDate,
    }
  );

  const realSlots: ServiceAvailabilitySlotItem[] = isSlotItemArray(availabilityRes?.data)
    ? availabilityRes.data
    : [];

  // Reset selected slot when service or date changes
  useEffect(() => {
    setSelectedSlotId('');
  }, [selectedServiceId, selectedDate]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Auto-select first service if none selected
  useEffect(() => {
    if (!selectedServiceId && services.length > 0 && services[0]._id) {
      setSelectedServiceId(services[0]._id);
    }
  }, [services, selectedServiceId, setSelectedServiceId]);

  const hasRealAnnouncements = announcements.length > 0;

  // Continuous looping items: duplicate list to loop smoothly
  const tickerItems: TickerItem[] = hasRealAnnouncements
    ? [...announcements, ...announcements]
    : [...DEVOTIONAL_GREETINGS, ...DEVOTIONAL_GREETINGS];

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
                  onClick={() => hasRealAnnouncements && setSelectedAnnouncement(item as TempleAnnouncement)}
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
                            {item.publishedAt &&
                              new Date(item.publishedAt).toLocaleDateString(undefined, {
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
            {temple?.description}
          </p>
        </div>

        {/* Bottom Devotional Card / Metadata */}
        <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-800 font-serif font-bold text-base shrink-0">
            ॐ
          </div>
          <div className="min-w-0">
            <div className="text-xs font-serif font-bold text-amber-900 leading-tight">
              {temple?.name}
            </div>
            <p className="text-[10px] text-amber-700/90 leading-tight mt-0.5 truncate">
              {temple?.city} · {categoryName} Pilgrimage
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
                min={(() => {
                  const d = new Date();
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#FCFBF7] border border-amber-200/80 rounded-lg text-xs text-stone-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Time Slot Buttons with Real Dynamic Availability */}
          <div className="pt-2">
            {isSlotsLoading || isSlotsFetching ? (
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="p-1.5 rounded-lg border border-amber-200/50 bg-stone-50 animate-pulse flex flex-col items-center justify-center min-h-[44px]"
                  >
                    <div className="w-12 h-2.5 bg-stone-200 rounded mb-1" />
                    <div className="w-8 h-2 bg-stone-200 rounded" />
                  </div>
                ))}
              </div>
            ) : isSlotsError ? (
              <div className="py-2.5 px-3 text-center bg-rose-50 border border-rose-200/80 rounded-lg space-y-1">
                <p className="text-[11px] text-rose-700 font-medium">Failed to load time slots.</p>
                <button
                  type="button"
                  onClick={() => refetchSlots()}
                  className="text-[10px] text-rose-800 underline font-semibold hover:text-rose-900 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : realSlots.length === 0 ? (
              <div className="py-3 px-2 text-center bg-amber-50/50 border border-amber-200/60 rounded-lg">
                <p className="text-[11px] text-stone-600 font-medium">
                  No time slots available for this date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 text-center max-h-[140px] overflow-y-auto pr-0.5">
                {realSlots.map((slot) => {
                  const slotId = (slot.timeSlotId || slot._id || slot.slotId || '') as string;
                  const isSelected = selectedSlotId === slotId;
                  const availableCount =
                    typeof slot.availableCount === 'number'
                      ? slot.availableCount
                      : typeof slot.availableSeats === 'number'
                      ? slot.availableSeats
                      : Math.max(0, (slot.capacity || 0) - (slot.bookedCount || 0));
                  const isFull = availableCount <= 0 || !slot.isAvailable;
                  const formattedTime = formatSlotTime(slot.startTime);

                  return (
                    <button
                      key={slotId}
                      type="button"
                      disabled={isFull}
                      onClick={() => {
                        if (!isFull) {
                          setSelectedSlotId(slotId);
                          onOpenAvailabilityModal?.(selectedServiceId, selectedDate, slotId);
                        }
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        isFull
                          ? 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-600 border-amber-600 text-white shadow-xs cursor-pointer'
                          : 'bg-[#FCFBF7] border-amber-200/70 text-stone-700 hover:border-amber-400 cursor-pointer'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{formattedTime}</div>
                      <div
                        className={`text-[9px] ${
                          isFull
                            ? 'text-stone-400 font-medium'
                            : isSelected
                            ? 'text-amber-100'
                            : 'text-stone-400'
                        }`}
                      >
                        {isFull ? 'Fully booked' : `${availableCount} slots`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CTA: Open Full Calendar Availability Modal / Unified Booking Drawer */}
        <button
          type="button"
          onClick={() => onOpenAvailabilityModal?.(selectedServiceId, selectedDate, selectedSlotId || '')}
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
              {selectedAnnouncement.publishedAt &&
                new Date(selectedAnnouncement.publishedAt).toLocaleDateString(undefined, {
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
