import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  Building2,
  ShieldCheck,
  RefreshCw,
  Home,
  AlertTriangle,
} from 'lucide-react';
import { useVerifyBookingQuery } from '../../store/api/bookingApi.js';
import { ROUTES } from '../../constants/routes.js';

export const BookingVerify = () => {
  const { token } = useParams();
  const { data, isLoading, isError, refetch } = useVerifyBookingQuery(token, {
    skip: !token,
  });

  const verification = data?.data;
  const isValid = verification?.valid === true;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Top Branding */}
      <div className="mb-6 text-center space-y-1">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <span className="font-serif font-bold text-lg">ॐ</span>
          </div>
          <span className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Deva<span className="text-amber-700">Setu</span>
          </span>
        </Link>
        <p className="text-xs text-stone-500 font-medium">Temple Gate Ticket Verification Portal</p>
      </div>

      {/* Main Verification Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-700 animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-800">Verifying Booking...</h2>
              <p className="text-xs text-stone-500 mt-1">
                Authenticating digital pass against temple gate records...
              </p>
            </div>
          </div>
        )}

        {/* Network Error / Server Failure */}
        {!isLoading && isError && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-stone-800">Verification Error</h2>
              <p className="text-xs text-stone-500">
                Unable to reach the verification server. Please check your network connection and try again.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Verification</span>
            </button>
          </div>
        )}

        {/* Verification Success (VALID BOOKING) */}
        {!isLoading && !isError && isValid && (
          <div>
            {/* Header Badge */}
            <div className="bg-emerald-600 px-6 py-6 text-center text-white space-y-2">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">✓ Valid Booking</h1>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  Gate Verification Authorized & Confirmed
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6 space-y-5">
              {/* Temple & Offering */}
              <div className="space-y-1 pb-4 border-b border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" /> Temple
                </span>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  {verification.templeName}
                </h2>
                {verification.templeCity && (
                  <p className="text-xs text-stone-500">
                    {verification.templeCity}, {verification.templeState}
                  </p>
                )}
              </div>

              {/* Service & Booking Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-0.5">
                    Offering / Seva
                  </span>
                  <p className="font-bold text-stone-800 text-sm">{verification.serviceName}</p>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-0.5">
                    Status
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    ● {verification.status}
                  </span>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" /> Date
                  </span>
                  <p className="font-semibold text-stone-800">{verification.bookingDate}</p>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" /> Time Slot
                  </span>
                  <p className="font-semibold text-stone-800">{verification.bookingTime}</p>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-stone-400" /> Devotees
                  </span>
                  <p className="font-semibold text-stone-800">
                    {verification.quantity} Person{verification.quantity > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase block mb-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Reference
                  </span>
                  <p className="font-mono font-bold text-amber-800 text-[11px] break-all">
                    {verification.bookingReference}
                  </p>
                </div>
              </div>

              {/* Verification Footer Note */}
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium leading-relaxed">
                  Verified DevaSetu Digital Darshan Pass. Allow pilgrim entry at temple gate.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Failure (INVALID / CANCELLED BOOKING) */}
        {!isLoading && !isError && !isValid && (
          <div>
            {/* Header Badge */}
            <div className="bg-rose-600 px-6 py-6 text-center text-white space-y-2">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto shadow-inner">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">✕ Booking Not Valid</h1>
                <p className="text-xs text-rose-100 font-medium mt-0.5">
                  Entry Pass Could Not Be Verified
                </p>
              </div>
            </div>

            {/* Error Body */}
            <div className="p-6 space-y-5 text-center">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-1">
                <p className="font-bold text-sm">
                  {verification?.message || 'This booking could not be verified.'}
                </p>
                <p className="text-[11px] text-rose-600">
                  The gate pass token is invalid, expired, or has been cancelled.
                </p>
              </div>

              {verification?.bookingReference && (
                <div className="text-xs text-stone-500">
                  <span>Booking Reference: </span>
                  <span className="font-mono font-bold text-stone-800">
                    {verification.bookingReference}
                  </span>
                </div>
              )}

              <p className="text-xs text-stone-400">
                Please present a valid booking confirmation or speak with temple administrators.
              </p>
            </div>
          </div>
        )}

        {/* Action Link Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-center gap-4 text-xs">
          <Link
            to={ROUTES.HOME}
            className="text-stone-600 hover:text-amber-700 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>DevaSetu Home</span>
          </Link>
          <span className="text-stone-300">•</span>
          <Link
            to={ROUTES.MY_BOOKINGS}
            className="text-amber-700 hover:text-amber-800 font-semibold transition-colors"
          >
            My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingVerify;
