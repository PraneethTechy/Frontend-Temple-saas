import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Users,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Ban,
  Info,
  Star,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { useGetMyBookingByIdQuery, useCancelBookingMutation } from '../../store/api/bookingApi.js';
import { useCreatePaymentOrderMutation, useVerifyPaymentMutation } from '../../store/api/paymentApi.js';
import { useGetEligibleBookingsQuery } from '../../store/api/reviewApi.js';
import { loadRazorpayScript, type RazorpayCheckoutOptions, type RazorpaySuccessResponse } from '../../utils/razorpay.js';
import { ROUTES } from '../../constants/routes.js';
import type { Booking, CreatePaymentOrderResult } from '@shared/types/index.js';

export interface PopulatedTempleDetail {
  _id?: string;
  name?: string;
  city?: string;
  state?: string;
  address?: string;
  pincode?: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  timings?: string;
  phone?: string;
  email?: string;
}

export interface PopulatedServiceDetail {
  _id?: string;
  name?: string;
  type?: string;
  price?: number;
  duration?: number;
  description?: string;
  rules?: string[];
}

export interface PopulatedTimeSlotDetail {
  _id?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
}

export interface PopulatedBookingDetail extends Omit<Booking, 'templeId' | 'serviceId' | 'timeSlotId'> {
  templeId?: PopulatedTempleDetail;
  serviceId?: PopulatedServiceDetail;
  timeSlotId?: PopulatedTimeSlotDetail;
}

export interface DetailedPaymentOrderResult extends CreatePaymentOrderResult {
  bookingReference?: string;
  bookingId?: string;
  totalAmount?: number;
  devoteeName?: string;
  devoteeEmail?: string;
  devoteePhone?: string;
}

export interface EligibleBookingEntry {
  _id: string;
  hasReview?: boolean;
  [key: string]: unknown;
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

function extractRazorpayError(response: unknown): string {
  if (typeof response === 'object' && response !== null && 'error' in response) {
    const err = (response as Record<string, unknown>).error;
    if (
      typeof err === 'object' &&
      err !== null &&
      'description' in err &&
      typeof (err as Record<string, unknown>).description === 'string'
    ) {
      return (err as Record<string, unknown>).description as string;
    }
  }
  return 'Payment failed.';
}

function parseEligibleBookings(data: unknown): EligibleBookingEntry[] {
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is EligibleBookingEntry => typeof item === 'object' && item !== null && '_id' in item
    );
  }
  if (typeof data === 'object' && data !== null && 'eligibleBookings' in data) {
    const list = (data as Record<string, unknown>).eligibleBookings;
    if (Array.isArray(list)) {
      return list.filter(
        (item): item is EligibleBookingEntry => typeof item === 'object' && item !== null && '_id' in item
      );
    }
  }
  return [];
}

export const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);

  const bookingId = id ?? '';
  const { data: bookingRes, isLoading, isError, error, refetch } = useGetMyBookingByIdQuery(bookingId, {
    skip: !bookingId,
  });
  const { data: eligibleBookingsRes } = useGetEligibleBookingsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const booking = bookingRes?.data as PopulatedBookingDetail | undefined;
  const eligibleBookings = parseEligibleBookings(eligibleBookingsRes?.data);
  const eligibleItem = eligibleBookings.find((b) => b._id === id);
  const isEligibleForReview = Boolean(eligibleItem);
  const hasReviewed = Boolean(eligibleItem?.hasReview);

  const copyToClipboard = (text?: string): void => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCancelBooking = async (): Promise<void> => {
    if (!bookingId) return;
    setCancelError('');
    try {
      await cancelBooking(bookingId).unwrap();
      setShowCancelModal(false);
    } catch (err: unknown) {
      setCancelError(extractErrorMessage(err, 'Failed to cancel booking. Please try again.'));
    }
  };

  const handlePayNow = async (): Promise<void> => {
    if (!bookingId || !booking) return;
    setPaymentError('');
    setIsPaying(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setIsPaying(false);
        setPaymentError('Unable to load Razorpay payment gateway.');
        return;
      }

      const orderRes = await createPaymentOrder({ bookingId }).unwrap();
      const orderData = orderRes.data as DetailedPaymentOrderResult;

      const options: RazorpayCheckoutOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'DevaSetu',
        description: `${booking.serviceId?.name || 'Seva'} • ${booking.templeId?.name || 'Temple'}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.devoteeName || '',
          email: orderData.devoteeEmail || '',
          contact: orderData.devoteePhone || '',
        },
        theme: {
          color: '#800020',
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            setPaymentError('Payment was not completed. Your booking has not been confirmed.');
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            setIsPaying(true);
            await verifyPayment({
              bookingId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();
            refetch();
          } catch (err: unknown) {
            setPaymentError(extractErrorMessage(err, 'Payment verification failed.'));
          } finally {
            setIsPaying(false);
          }
        },
      };

      if (!window.Razorpay) {
        setIsPaying(false);
        setPaymentError('Razorpay SDK is not available.');
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: unknown) => {
        setIsPaying(false);
        setPaymentError(extractRazorpayError(response));
      });
      rzp.open();
    } catch (err: unknown) {
      setIsPaying(false);
      setPaymentError(extractErrorMessage(err, 'Failed to initiate payment.'));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 space-y-6 animate-pulse">
        <div className="h-8 bg-spiritual-surface rounded w-1/4"></div>
        <div className="h-64 bg-spiritual-surface rounded-3xl"></div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="spiritual-card p-12 text-center max-w-lg mx-auto my-12 bg-white space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-serif font-bold text-xl text-spiritual-text">Booking Not Found</h2>
        <p className="text-xs text-spiritual-muted">
          {extractErrorMessage(error, 'The requested booking could not be found or does not belong to your account.')}
        </p>
        <Link to={ROUTES.MY_BOOKINGS} className="btn-spiritual-primary text-xs py-2 px-4 inline-block">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  const isPending = booking.bookingStatus === 'PENDING';
  const isCancelled = booking.bookingStatus === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.MY_BOOKINGS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-spiritual-muted hover:text-spiritual-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
        </Link>

        {isPending && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-red-200"
          >
            <Ban className="w-3.5 h-3.5" /> Cancel Reservation
          </button>
        )}
      </div>

      {paymentError && (
        <div className="p-4 rounded-xl text-xs bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Main Reservation Card */}
      <div className="spiritual-card p-6 sm:p-8 bg-white border border-spiritual-border rounded-3xl space-y-8 shadow-spiritual-sm">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-spiritual-borderLight pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold text-spiritual-primary tracking-wider">
                {booking.bookingReference}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(booking.bookingReference)}
                className="p-1.5 rounded-lg bg-spiritual-surface hover:bg-spiritual-primary hover:text-white border border-spiritual-border text-spiritual-muted transition-all"
                title="Copy reference"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-spiritual-muted">
              Created on {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Status Badges & Pay Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                booking.bookingStatus === 'CONFIRMED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isCancelled
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {booking.bookingStatus === 'CONFIRMED' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
              Booking: {booking.bookingStatus}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                booking.paymentStatus === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}
            >
              {booking.paymentStatus === 'PAID' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              Payment: {booking.paymentStatus}
            </span>

            {isPending && booking.paymentStatus === 'PENDING' && (
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isPaying}
                className="btn-spiritual-primary text-xs py-1.5 px-4 flex items-center gap-1.5 shadow-spiritual-xs"
              >
                {isPaying ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay ₹{booking.totalAmount} Now</span>
                  </>
                )}
              </button>
            )}

            {/* Review Button in Status Row */}
            {isEligibleForReview && (
              hasReviewed ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300">
                  <Check className="w-3.5 h-3.5 text-amber-700" />
                  <span>✓ Review Submitted</span>
                </span>
              ) : (
                <Link
                  to={`/experiences?bookingId=${booking._id}`}
                  className="btn-spiritual-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-spiritual-xs"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>Give a Review</span>
                </Link>
              )
            )}
          </div>
        </div>

        {/* Review Invitation Banner */}
        {isEligibleForReview && !hasReviewed && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-[#FFF9EE] border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>Share Your Sacred Experience</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                How was your visit to {booking.templeId?.name}? Share your reflections and inspire fellow devotees across India.
              </p>
            </div>
            <Link
              to={`/experiences?bookingId=${booking._id}`}
              className="btn-spiritual-primary text-xs py-2 px-4 shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto shadow-spiritual-xs"
            >
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Give a Review</span>
            </Link>
          </div>
        )}

        {hasReviewed && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You have shared your sacred review for this pilgrimage visit.</span>
            </div>
            <Link
              to="/experiences"
              className="text-xs font-semibold text-emerald-800 hover:underline shrink-0"
            >
              View Community Experiences →
            </Link>
          </div>
        )}

        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Temple Information */}
          <div className="spiritual-card p-5 bg-spiritual-surface/50 rounded-2xl border border-spiritual-border space-y-3">
            <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
              Sacred Destination
            </span>
            <h3 className="font-serif font-bold text-lg text-spiritual-text">
              {booking.templeId?.name}
            </h3>
            <p className="text-spiritual-muted flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-spiritual-accent shrink-0 mt-0.5" />
              <span>
                {booking.templeId?.address}, {booking.templeId?.city}, {booking.templeId?.state} - {booking.templeId?.pincode}
              </span>
            </p>
            {booking.templeId?.slug && (
              <Link
                to={`/temples/${booking.templeId.slug}`}
                className="text-xs font-semibold text-spiritual-primary hover:underline inline-block pt-1"
              >
                View Temple Profile →
              </Link>
            )}
          </div>

          {/* Service & Schedule */}
          <div className="spiritual-card p-5 bg-spiritual-surface/50 rounded-2xl border border-spiritual-border space-y-3">
            <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
              Seva & Schedule
            </span>
            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-spiritual-primaryLight text-spiritual-primary uppercase">
                {booking.serviceId?.type}
              </span>
              <h4 className="font-serif font-bold text-base text-spiritual-text">
                {booking.serviceId?.name}
              </h4>
            </div>

            <div className="pt-2 border-t border-spiritual-borderLight flex flex-col gap-1.5 text-spiritual-text font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-spiritual-primary" />
                {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-spiritual-primary" />
                {booking.timeSlotId?.startTime} – {booking.timeSlotId?.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Devotees List */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-spiritual-text uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-spiritual-primary" /> Pilgrims ({booking.quantity} Devotee{booking.quantity > 1 ? 's' : ''})
          </h4>

          <div className="spiritual-card border border-spiritual-border rounded-2xl divide-y divide-spiritual-borderLight overflow-hidden">
            {booking.devotees?.map((dev, i) => (
              <div key={i} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-spiritual-surface text-spiritual-primary font-bold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-bold text-spiritual-text block">{dev.name}</span>
                    <span className="text-spiritual-muted text-[11px]">
                      {(dev.gender ?? '').toLowerCase()}, {dev.age} years
                    </span>
                  </div>
                </div>

                <div className="text-right sm:text-right text-[11px] text-spiritual-muted pl-9 sm:pl-0">
                  <span className="font-medium text-spiritual-text block">{dev.idType}</span>
                  <span className="font-mono text-spiritual-subtle">{dev.idNumber || 'Not provided'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & QR Notice Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price Breakdown */}
          <div className="spiritual-card p-5 bg-spiritual-surface rounded-2xl border border-spiritual-border space-y-3 text-xs">
            <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
              Payment Summary
            </span>
            <div className="flex justify-between text-spiritual-muted">
              <span>Seva Rate</span>
              <span>₹{booking.serviceId?.price || 0} / person</span>
            </div>
            <div className="flex justify-between text-spiritual-muted">
              <span>Devotees Count</span>
              <span>× {booking.quantity}</span>
            </div>
            <div className="pt-2 border-t border-spiritual-border flex justify-between items-center text-spiritual-text">
              <span className="font-bold">Total Amount</span>
              <span className="font-serif font-bold text-lg text-spiritual-primary">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* QR Verification Digital Pass */}
          <div className="spiritual-card p-5 bg-spiritual-surface rounded-2xl border border-spiritual-border flex flex-col justify-between text-xs space-y-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-spiritual-primary" /> Digital Entry Pass
              </span>
              <p className="text-[11px] text-spiritual-muted leading-relaxed">
                {booking.paymentStatus === 'PAID'
                  ? 'Present this verified digital reservation pass at the temple entry counter.'
                  : 'QR ticket verification will be activated after payment confirmation.'}
              </p>
            </div>
            {booking.paymentStatus === 'PAID' && booking.bookingStatus !== 'CANCELLED' ? (
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Darshan Pass</span>
                </div>

                {/* Scannable Real QR Code Container */}
                {(() => {
                  const token = booking.qrVerificationToken || booking.qrCode?.code;
                  const origin =
                    typeof window !== 'undefined' && window.location?.origin
                      ? window.location.origin
                      : ((import.meta.env.VITE_APP_URL as string | undefined) || 'http://localhost:5173');
                  const qrPayload = token ? `${origin}/booking/verify/${token}` : '';

                  return qrPayload ? (
                    <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs inline-block mx-auto">
                      <div className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] flex items-center justify-center">
                        <QRCode
                          value={qrPayload}
                          size={180}
                          level="M"
                          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl text-stone-500 text-xs">
                      QR code could not be loaded.
                    </div>
                  );
                })()}

                <div className="space-y-0.5">
                  <p className="text-[11px] text-emerald-900 font-medium">
                    Scan for Temple Gate Verification
                  </p>
                  <p className="text-[10px] font-mono text-emerald-700 break-all">
                    Ref: {booking.bookingReference}
                  </p>
                </div>
              </div>
            ) : booking.bookingStatus === 'CANCELLED' ? (
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-center text-xs text-rose-700 font-medium">
                Pass revoked — Booking is cancelled.
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl border border-spiritual-border text-center text-[11px] text-spiritual-subtle font-mono">
                [Pass issuance pending payment confirmation]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="spiritual-card p-6 sm:p-8 bg-white max-w-md w-full rounded-3xl shadow-spiritual-xl space-y-5">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif font-bold text-lg text-spiritual-text">
                Cancel Pilgrimage Reservation?
              </h3>
              <p className="text-xs text-spiritual-muted">
                Are you sure you wish to cancel booking <strong>{booking.bookingReference}</strong>? The reserved slot capacity will be released back to the temple.
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
                onClick={() => setShowCancelModal(false)}
                className="flex-1 btn-spiritual-outline text-xs py-2.5"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelBooking}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-all shadow-spiritual-sm disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
