import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, ArrowRight, Ticket, AlertCircle, RefreshCw, Clock, Sparkles } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useGetMyBookingsQuery } from '../../store/api/bookingApi.js';

export const UpcomingBookingCard = () => {
  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = Boolean(user);
  const isDevotee = user?.role === 'DEVOTEE';

  const {
    data: bookingsRes,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetMyBookingsQuery(
    { limit: 20 },
    { skip: !isAuthenticated || !isDevotee }
  );

  // Derive nearest upcoming booking from real database data
  const deriveNearestBooking = () => {
    if (!isAuthenticated || !isDevotee) return null;
    const allBookings = bookingsRes?.data?.bookings || [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const validUpcoming = allBookings
      .filter((b) => {
        if (!b || !b.bookingDate) return false;
        const status = (b.bookingStatus || '').toUpperCase();
        if (status === 'CANCELLED' || status === 'COMPLETED') return false;
        const bDate = new Date(b.bookingDate).getTime();
        return bDate >= startOfToday;
      })
      .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());

    return validUpcoming[0] || null;
  };

  const nearestBooking = deriveNearestBooking();

  return (
    <div className="flex flex-col w-full">
      {/* 1. Top Header Level-Aligned with Featured Temples Header (54px fixed height) */}
      <div className="h-[54px] flex items-end justify-between mb-4">
        <div>
          <h3
            className="font-bold text-2xl sm:text-[26px] text-[#1E130E] leading-tight tracking-tight whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Upcoming Booking
          </h3>
          <p className="text-xs sm:text-sm text-[#6F6055] font-normal mt-0.5">
            Active reservations
          </p>
        </div>

        <Link
          to={ROUTES.MY_BOOKINGS || '/my-bookings'}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#B45309] hover:text-[#78350F] transition-colors pb-0.5 whitespace-nowrap"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. py-1 wrapper matching carousel track py-1 for 100% pixel-perfect level alignment */}
      <div className="py-1">
        <div className="h-[380px] bg-white border border-[#EADBCC]/70 rounded-[20px] p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(47,33,26,0.04)] flex flex-col">
          {/* State 1: Loading */}
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center py-12 space-y-4 animate-pulse">
              <div className="h-16 bg-[#EADBCC]/30 rounded-xl w-3/4"></div>
              <div className="h-4 bg-[#EADBCC]/40 rounded w-2/3"></div>
              <div className="h-4 bg-[#EADBCC]/30 rounded w-1/2"></div>
            </div>
          )}

          {/* State 2: Error */}
          {!isLoading && isError && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5">
              <AlertCircle className="w-7 h-7 text-[#6B2724]" />
              <p className="text-xs font-semibold text-[#2F211A]">Unable to load visits</p>
              <p className="text-[11px] text-[#6F6259] max-w-[200px]">
                {error?.data?.message || 'Please check your connection.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] hover:underline mt-1"
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* State 3: Empty State (Occupies full space) */}
          {!isLoading && !isError && !nearestBooking && (
            <div className="h-full w-full rounded-[16px] bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E8]/80 to-[#F6EDE0]/90 border border-[#EADBCC]/70 p-5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xs">
              {/* Faint Temple Silhouette Watermark */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.08] text-[#B45309] flex items-center justify-center select-none">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full scale-125">
                  <path d="M50 5 L53 15 H47 L50 5 Z M42 15 H58 L60 25 H40 L42 15 Z M35 25 H65 L68 40 H32 L35 25 Z M25 40 H75 L78 60 H22 L25 40 Z M15 60 H85 V95 H15 V60 Z M42 95 V70 C42 65 58 65 58 70 V95 H42 Z" />
                </svg>
              </div>

              <div className="w-full flex justify-end">
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF0E1] text-[#B45309] border border-[#EEDBBA]">
                  No Active Schedule
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center my-auto">
                <div className="w-13 h-13 rounded-full bg-[#FAF0E1] border border-[#EEDBBA] flex items-center justify-center text-[#B45309] mb-3 shadow-xs">
                  <Calendar className="w-6 h-6 text-[#B45309]" />
                </div>
                <h4
                  className="font-bold text-base text-[#1E130E] mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  No upcoming visits
                </h4>
                <p className="text-xs text-[#6F6055] max-w-[210px] leading-relaxed">
                  Explore sacred temples and schedule your next divine darshan.
                </p>
              </div>

              <div className="relative z-10 w-full">
                <Link
                  to={ROUTES.TEMPLES}
                  className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#B46A18] to-[#965410] hover:from-[#965410] hover:to-[#78350F] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Explore Temples</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </Link>
              </div>
            </div>
          )}

          {/* State 4: Real Booking Found (Occupies full space of outer card) */}
          {!isLoading && !isError && nearestBooking && (
            <div className="h-full w-full bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E8] to-[#F5EADB]/90 rounded-[16px] border border-[#E8D7BE] p-4 flex flex-col justify-between relative overflow-hidden shadow-xs">
              {/* Top: Reference, Status, Temple Name, Service */}
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#EADBCC]/60">
                  <span className="font-mono text-[#B45309] font-bold text-[11px] tracking-wide">
                    {nearestBooking.bookingReference}
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                    {nearestBooking.bookingStatus || 'Confirmed'}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h4
                    className="font-bold text-[#1E130E] text-lg sm:text-[19px] leading-snug line-clamp-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {nearestBooking.templeId?.name || 'Sacred Temple'}
                  </h4>
                  <p className="text-[#8B5E34] text-xs font-semibold mt-0.5 line-clamp-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                    <span>{nearestBooking.serviceId?.name || 'Darshan Pass'}</span>
                  </p>
                </div>
              </div>

              {/* Middle: Schedule Information Card */}
              <div className="my-auto py-2">
                <div className="bg-white/90 backdrop-blur-xs rounded-xl border border-[#EADBCC]/80 p-3 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1E130E]">
                    <Calendar className="w-4 h-4 text-[#B45309] shrink-0" />
                    <span className="truncate">
                      {new Date(nearestBooking.bookingDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {nearestBooking.timeSlotId && ` • ${nearestBooking.timeSlotId.startTime}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#6F6055] pt-1.5 border-t border-[#F0E4D5]">
                    <Clock className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                    <span className="truncate">Devotee pass valid at entry gate</span>
                  </div>
                </div>

                {/* Subtle Spiritual blessing */}
                <p
                  className="italic text-[11px] text-[#7A6D63] text-center mt-2.5 leading-normal"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  “A divine journey is always worth planning.”
                </p>
              </div>

              {/* Bottom: Action CTA */}
              <div>
                <Link
                  to={`/my-bookings/${nearestBooking._id}`}
                  className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#B46A18] to-[#965410] hover:from-[#965410] hover:to-[#78350F] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>View Reservation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingBookingCard;
