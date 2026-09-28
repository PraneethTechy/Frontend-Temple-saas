import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Ticket, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppSelector } from '../../store/hooks.js';
import { ROUTES } from '../../constants/routes.js';
import { useGetMyBookingsQuery } from '../../store/api/bookingApi.js';
import type { Booking, PaginatedData } from '@shared/types/index.js';

export interface PopulatedBookingTemple {
  _id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface PopulatedBookingService {
  _id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface PopulatedBookingTimeSlot {
  _id?: string;
  startTime?: string;
  [key: string]: unknown;
}

export interface PopulatedUpcomingBooking extends Omit<Booking, 'templeId' | 'serviceId' | 'timeSlotId'> {
  templeId?: PopulatedBookingTemple | string;
  serviceId?: PopulatedBookingService | string;
  timeSlotId?: PopulatedBookingTimeSlot | string;
}

export const UpcomingBookingCard: React.FC = () => {
  const user = useAppSelector((state) => state.auth?.user);
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
  const deriveNearestBooking = (): PopulatedUpcomingBooking | null => {
    if (!isAuthenticated || !isDevotee) return null;
    const dataObj = bookingsRes?.data as (PaginatedData<PopulatedUpcomingBooking> & { bookings?: PopulatedUpcomingBooking[] }) | undefined;
    const allBookings: PopulatedUpcomingBooking[] = dataObj?.bookings || dataObj?.items || [];

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
  const apiError = error as { data?: { message?: string } } | undefined;

  return (
    <div className="flex flex-col w-full">
      {/* 1. Top Header Level-Aligned with Featured Temples Header (58px height) */}
      <div className="min-h-[58px] h-[58px] flex items-end justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#B45309] uppercase block mb-0.5">
            YOUR SCHEDULE
          </span>
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

      {/* 2. White Card Container Exact Same Height (380px) as Temple Cards */}
      <div className="h-[380px] bg-white border border-[#EADBCC]/70 rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(47,33,26,0.04)]">
        <div>
          {/* State 1: Loading */}
          {isLoading && (
            <div className="py-12 space-y-4 animate-pulse">
              <div className="h-16 bg-[#EADBCC]/30 rounded-xl"></div>
              <div className="h-4 bg-[#EADBCC]/40 rounded w-2/3 mx-auto"></div>
              <div className="h-4 bg-[#EADBCC]/30 rounded w-1/2 mx-auto"></div>
            </div>
          )}

          {/* State 2: Error */}
          {!isLoading && isError && (
            <div className="flex flex-col items-center text-center py-10 space-y-2">
              <AlertCircle className="w-6 h-6 text-[#6B2724]" />
              <p className="text-xs font-semibold text-[#2F211A]">Unable to load visits</p>
              <p className="text-[11px] text-[#6F6259]">
                {apiError?.data?.message || 'Please check your connection.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] hover:underline mt-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* State 3: Empty State (Matching reference image exactly) */}
          {!isLoading && !isError && !nearestBooking && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E8]/70 to-[#F6EDE0]/80 border border-[#EADBCC]/60 p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm">
              {/* Faint Temple Silhouette Watermark */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.08] text-[#B45309] flex items-center justify-center select-none">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full scale-125">
                  <path d="M50 5 L53 15 H47 L50 5 Z M42 15 H58 L60 25 H40 L42 15 Z M35 25 H65 L68 40 H32 L35 25 Z M25 40 H75 L78 60 H22 L25 40 Z M15 60 H85 V95 H15 V60 Z M42 95 V70 C42 65 58 65 58 70 V95 H42 Z" />
                </svg>
              </div>

              {/* Calendar Icon in Warm Ivory Circle */}
              <div className="relative z-10 w-12 h-12 rounded-full bg-[#FAF0E1] border border-[#EEDBBA] flex items-center justify-center text-[#B45309] mb-2.5 shadow-sm">
                <Calendar className="w-5.5 h-5.5 text-[#B45309]" />
              </div>

              <h4 className="relative z-10 font-bold text-sm text-[#1E130E] mb-0.5">
                No upcoming visits
              </h4>
              <p className="relative z-10 text-[11px] text-[#6F6055] max-w-[210px] leading-relaxed mb-3.5">
                Explore temples and plan your next darshan.
              </p>

              <Link
                to={ROUTES.TEMPLES}
                className="relative z-10 w-full max-w-[210px] py-2 px-3.5 bg-gradient-to-r from-[#B46A18] to-[#965410] hover:from-[#965410] hover:to-[#78350F] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>Explore Temples</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </Link>
            </div>
          )}

          {/* State 4: Real Booking Found */}
          {!isLoading && !isError && nearestBooking && (
            <div className="p-4 bg-gradient-to-br from-[#FFF9EE] to-[#FAF3E8] rounded-2xl border border-[#DFC67F]/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#B45309] font-bold text-[11px]">
                  {nearestBooking.bookingReference}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {nearestBooking.bookingStatus || 'Confirmed'}
                </span>
              </div>

              <div
                className="font-bold text-[#1E130E] text-base leading-snug truncate"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {typeof nearestBooking.templeId === 'object' && nearestBooking.templeId?.name
                  ? nearestBooking.templeId.name
                  : 'Sacred Temple'}
              </div>

              <div className="text-[#6F6055] text-xs font-medium truncate">
                {typeof nearestBooking.serviceId === 'object' && nearestBooking.serviceId?.name
                  ? nearestBooking.serviceId.name
                  : 'Darshan Pass'}
              </div>

              <div className="text-[#1E130E] font-medium text-xs pt-1.5 border-t border-[#EADBCC]/60 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                <span className="truncate">
                  {new Date(nearestBooking.bookingDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {typeof nearestBooking.timeSlotId === 'object' && nearestBooking.timeSlotId?.startTime && ` • ${nearestBooking.timeSlotId.startTime}`}
                </span>
              </div>

              <div className="pt-1">
                <Link
                  to={`/my-bookings/${nearestBooking._id}`}
                  className="w-full py-2 px-3.5 bg-gradient-to-r from-[#B46A18] to-[#965410] hover:from-[#965410] hover:to-[#78350F] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>View Reservation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Spiritual Quote */}
        <div className="mt-2 pt-1">
          <p
            className="italic text-[11px] text-[#7A6D63] text-center leading-normal"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            “A divine journey is always worth planning.”
          </p>
          <div className="flex items-center justify-center gap-2 mt-1.5 text-[#BA771E]/50">
            <div className="h-[1px] w-7 bg-gradient-to-r from-transparent to-[#BA771E]/50"></div>
            <span className="text-[7px] text-[#BA771E]">✦</span>
            <div className="h-[1px] w-7 bg-gradient-to-l from-transparent to-[#BA771E]/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingBookingCard;
