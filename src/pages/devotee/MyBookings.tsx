import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  ArrowRight,
  Clock,
  Building2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
  Ban,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { useGetMyBookingsQuery, useCancelBookingMutation } from '../../store/api/bookingApi.js';
import { useGetEligibleBookingsQuery } from '../../store/api/reviewApi.js';
import { ROUTES } from '../../constants/routes.js';
import type { Booking, BookingStatus, PaymentStatus } from '@shared/types/index.js';

export type MyBookingsFilterStatus = 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED';

export interface PopulatedTempleSummary {
  _id?: string;
  name?: string;
  city?: string;
  state?: string;
  slug?: string;
}

export interface PopulatedServiceSummary {
  _id?: string;
  name?: string;
  type?: string;
  price?: number;
}

export interface PopulatedTimeSlotSummary {
  _id?: string;
  startTime?: string;
  endTime?: string;
}

export interface MyBookingItem extends Omit<Booking, 'templeId' | 'serviceId' | 'timeSlotId'> {
  templeId?: PopulatedTempleSummary;
  serviceId?: PopulatedServiceSummary;
  timeSlotId?: PopulatedTimeSlotSummary;
}

export interface EligibleBookingEntry {
  _id: string;
  hasReview?: boolean;
  [key: string]: unknown;
}

interface RawMyBookingsData {
  bookings?: MyBookingItem[];
  items?: MyBookingItem[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    limit?: number;
  };
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    const data = (err as Record<string, unknown>).data;
    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as Record<string, unknown>).message === 'string'
    ) {
      return (data as Record<string, unknown>).message as string;
    }
  }
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as Record<string, unknown>).message === 'string'
  ) {
    return (err as Record<string, unknown>).message as string;
  }
  return fallback;
}

function isEligibleBookingItem(item: unknown): item is EligibleBookingEntry {
  return typeof item === 'object' && item !== null && '_id' in item;
}

function parseEligibleBookings(data: unknown): EligibleBookingEntry[] {
  if (Array.isArray(data)) {
    return data.filter(isEligibleBookingItem);
  }
  if (typeof data === 'object' && data !== null && 'eligibleBookings' in data) {
    const list = (data as Record<string, unknown>).eligibleBookings;
    if (Array.isArray(list)) {
      return list.filter(isEligibleBookingItem);
    }
  }
  return [];
}

function parseBookingsData(data: unknown): {
  bookings: MyBookingItem[];
  pagination: { page: number; totalPages: number; total: number };
} {
  const defaultResult = {
    bookings: [] as MyBookingItem[],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  if (typeof data !== 'object' || data === null) {
    return defaultResult;
  }

  const raw = data as RawMyBookingsData;
  const list = Array.isArray(raw.bookings)
    ? raw.bookings
    : Array.isArray(raw.items)
    ? raw.items
    : [];

  const pagination = {
    page: typeof raw.pagination?.page === 'number' ? raw.pagination.page : 1,
    totalPages: typeof raw.pagination?.totalPages === 'number' ? raw.pagination.totalPages : 1,
    total: typeof raw.pagination?.total === 'number' ? raw.pagination.total : 0,
  };

  return { bookings: list, pagination };
}

export const MyBookings: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<MyBookingsFilterStatus>('ALL');
  const [page, setPage] = useState<number>(1);
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string>('');

  const { data: bookingsRes, isLoading, isError, error, refetch } = useGetMyBookingsQuery({
    status: filterStatus !== 'ALL' ? filterStatus : undefined,
    page,
    limit: 10,
  });

  const { data: eligibleBookingsRes } = useGetEligibleBookingsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const { bookings, pagination } = parseBookingsData(bookingsRes?.data);
  const eligibleBookings = parseEligibleBookings(eligibleBookingsRes?.data);

  const eligibleMap = useMemo(() => {
    const map = new Map<string, EligibleBookingEntry>();
    eligibleBookings.forEach((b) => map.set(b._id, b));
    return map;
  }, [eligibleBookings]);

  const handleConfirmCancel = async () => {
    if (!cancelModalId) return;
    setCancelError('');
    try {
      await cancelBooking(cancelModalId).unwrap();
      setCancelModalId(null);
    } catch (err: unknown) {
      setCancelError(extractErrorMessage(err, 'Failed to cancel booking.'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-spiritual-text">
            My Darshan & Seva Bookings
          </h1>
          <p className="text-xs sm:text-sm text-spiritual-muted">
            Track your temple pilgrimage reservations, scheduled time slots, and passes.
          </p>
        </div>

        <Link
          to={ROUTES.TEMPLES}
          className="btn-spiritual-primary text-xs py-2.5 px-4 inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" /> Explore Temples
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-spiritual-borderLight pb-2 text-xs">
        {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setFilterStatus(tab);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              filterStatus === tab
                ? 'bg-spiritual-primary text-white shadow-spiritual-sm'
                : 'text-spiritual-muted hover:text-spiritual-primary bg-spiritual-surface hover:bg-spiritual-borderLight'
            }`}
          >
            {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="spiritual-card p-12 text-center bg-white space-y-3 animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin text-spiritual-primary mx-auto" />
          <p className="text-xs text-spiritual-muted">Loading your sacred bookings...</p>
        </div>
      )}

      {!isLoading && isError && (
        <div className="spiritual-card p-10 text-center bg-white border border-red-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-xs text-spiritual-text font-semibold">Unable to load bookings</p>
          <p className="text-xs text-spiritual-muted">
            {extractErrorMessage(error, 'Please verify authentication and retry.')}
          </p>
          <button onClick={() => refetch()} className="btn-spiritual-primary text-xs py-2 px-4">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && bookings.length === 0 && (
        <div className="spiritual-card p-12 sm:p-16 text-center max-w-lg mx-auto bg-white border border-spiritual-border rounded-3xl space-y-4 shadow-spiritual-sm">
          <div className="w-16 h-16 rounded-2xl bg-spiritual-primaryLight text-spiritual-primary flex items-center justify-center mx-auto border border-spiritual-primary/20">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-spiritual-text">
            {filterStatus === 'ALL' ? 'No Bookings Yet' : `No ${filterStatus.toLowerCase()} bookings found`}
          </h3>
          <p className="text-xs text-spiritual-muted leading-relaxed max-w-sm mx-auto">
            {filterStatus === 'ALL'
              ? 'You have not booked any darshan slots or pooja sevas yet. Explore active shrines across India and reserve your pilgrimage slot.'
              : `You currently have no bookings under the ${filterStatus.toLowerCase()} filter.`}
          </p>
          {filterStatus === 'ALL' && (
            <div className="pt-2">
              <Link
                to={ROUTES.TEMPLES}
                className="btn-spiritual-primary text-xs py-3 px-6 inline-flex items-center gap-2 shadow-spiritual-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Shrines & Book</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !isError && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isPending = booking.bookingStatus === 'PENDING';
            const isCancelled = booking.bookingStatus === 'CANCELLED';

            return (
              <div
                key={booking._id}
                className="spiritual-card p-6 bg-white border border-spiritual-border hover:border-spiritual-primary/40 rounded-3xl transition-all shadow-spiritual-xs hover:shadow-spiritual-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-spiritual-borderLight pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-spiritual-primary bg-spiritual-surface px-2.5 py-1 rounded-lg border border-spiritual-border">
                      {booking.bookingReference}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        booking.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCancelled
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {booking.bookingStatus === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3" />}
                      {booking.bookingStatus}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        booking.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-spiritual-subtle'
                      }`}
                    >
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>

                  <span className="text-xs font-serif font-bold text-spiritual-primary">
                    Total: ₹{booking.totalAmount}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-8 space-y-1">
                    <h3 className="font-serif font-bold text-base text-spiritual-text">
                      {booking.serviceId?.name || 'Darshan Seva'}
                    </h3>
                    <p className="text-xs text-spiritual-muted flex items-center gap-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-spiritual-primary shrink-0" />
                      {booking.templeId?.name}, {booking.templeId?.city}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-spiritual-subtle pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-spiritual-accent" />
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-spiritual-accent" />
                        {booking.timeSlotId?.startTime} - {booking.timeSlotId?.endTime}
                      </span>
                      <span>•</span>
                      <span>{booking.quantity} Devotee(s)</span>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-spiritual-borderLight">
                    <Link
                      to={`/my-bookings/${booking._id}`}
                      className="btn-spiritual-primary text-xs py-2 px-4 flex items-center gap-1 w-full sm:w-auto justify-center"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {(() => {
                      const eligibleInfo = eligibleMap.get(booking._id);
                      if (!eligibleInfo) return null;
                      return eligibleInfo.hasReview ? (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 px-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reviewed</span>
                        </span>
                      ) : (
                        <Link
                          to={`/experiences?bookingId=${booking._id}`}
                          className="btn-spiritual-outline text-xs py-1.5 px-3 flex items-center gap-1.5 w-full sm:w-auto justify-center border-amber-300 text-amber-900 hover:bg-amber-50 shadow-2xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Give a Review</span>
                        </Link>
                      );
                    })()}

                    {isPending && (
                      <button
                        type="button"
                        onClick={() => setCancelModalId(booking._id)}
                        className="text-[11px] text-red-600 hover:text-red-700 font-semibold hover:underline px-2 py-1"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-spiritual-borderLight text-xs">
              <span className="text-spiritual-muted">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-spiritual-outline text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-spiritual-outline text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="spiritual-card p-6 sm:p-8 bg-white max-w-md w-full rounded-3xl shadow-spiritual-xl space-y-5">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif font-bold text-lg text-spiritual-text">
                Cancel Pilgrimage Booking?
              </h3>
              <p className="text-xs text-spiritual-muted">
                Are you sure you wish to cancel this reservation? The reserved slot capacity will be released back to the temple.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {cancelError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => {
                  setCancelModalId(null);
                  setCancelError('');
                }}
                className="flex-1 btn-spiritual-outline text-xs py-2.5"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-all shadow-spiritual-sm disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
