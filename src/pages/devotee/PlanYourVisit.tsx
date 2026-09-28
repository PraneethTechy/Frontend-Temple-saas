import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RotateCw,
  Ticket,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import {
  useGetUpcomingBookingsWithPlansQuery,
  useGenerateVisitPlanMutation,
} from '../../store/api/visitPlanApi.js';
import GooglePlaceAutocomplete, { type SelectedPlace } from '../../components/maps/GooglePlaceAutocomplete.js';
import RouteMap from '../../components/maps/RouteMap.js';
import DevoteeFooter from '../../components/devotee/DevoteeFooter.js';
import type { VisitOriginLocation } from '@shared/types/index.js';

export interface PlanLocation {
  placeId?: string;
  name?: string;
  formattedAddress?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  templeName?: string;
}

export interface RouteSnapshot {
  distanceKm?: number;
  durationText?: string;
  overviewPolyline?: string;
  trafficAware?: boolean;
}

export interface PlanningGuidance {
  departureTimeOnly?: string;
  recommendedDepartureText?: string;
  explanationCallout?: string;
}

export interface AiGuidance {
  summary?: string;
  tips?: string[];
}

export interface SavedVisitPlan {
  _id?: string;
  origin?: PlanLocation | null;
  destination?: PlanLocation | null;
  routeSnapshot?: RouteSnapshot | null;
  planning?: PlanningGuidance | null;
  aiGuidance?: AiGuidance | null;
}

export interface BookingWithVisitPlan {
  _id: string;
  bookingReference: string;
  bookingDate: string;
  templeId?: {
    _id?: string;
    name?: string;
    city?: string;
    state?: string;
    coverImage?: { url?: string };
    gallery?: Array<{ url?: string }>;
  } | null;
  serviceId?: {
    _id?: string;
    name?: string;
  } | null;
  timeSlotId?: {
    _id?: string;
    startTime?: string;
    endTime?: string;
  } | null;
  savedPlan?: SavedVisitPlan | null;
}

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
  message?: string;
}

/**
 * Format helpers
 */
const formatDateFull = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getWeekdayName = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekdays[d.getDay()];
};

const formatDateWithDayShort = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} (${shortDays[d.getDay()]})`;
};

const formatTimeRange = (startTime?: string, endTime?: string): string => {
  if (!startTime) return 'Darshan Time';
  const formatSingle = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12 < 10 ? '0' : ''}${h12}:${m || '00'} ${ampm}`;
  };
  return `${formatSingle(startTime)}${endTime ? ` – ${formatSingle(endTime)}` : ''}`;
};

export const PlanYourVisit: React.FC = () => {
  const {
    data: responseData,
    isLoading: isBookingsLoading,
  } = useGetUpcomingBookingsWithPlansQuery();

  const [generatePlan, { isLoading: isGenerating }] = useGenerateVisitPlanMutation();

  const rawBookings = (responseData?.data as unknown as { bookings?: BookingWithVisitPlan[] })?.bookings;
  const bookings: BookingWithVisitPlan[] = rawBookings || (responseData?.data as unknown as BookingWithVisitPlan[]) || [];
  const bookingsCount = bookings.length;

  // Selected booking state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  // Starting location state
  const [selectedOrigin, setSelectedOrigin] = useState<PlanLocation | null>(null);
  // Error state for route generation
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Default selection when bookings load
  useEffect(() => {
    if (bookings.length > 0 && !selectedBookingId) {
      setSelectedBookingId(bookings[0]._id);
    }
  }, [bookings, selectedBookingId]);

  // Find active booking
  const currentBooking =
    bookings.find((b) => b._id === selectedBookingId) || bookings[0] || null;

  // Active saved plan (if any)
  const currentSavedPlan = currentBooking?.savedPlan || null;

  // Sync state when selected booking or plan changes
  useEffect(() => {
    if (currentSavedPlan?.origin) {
      setSelectedOrigin(currentSavedPlan.origin);
      setGenerationError(null);
    } else {
      setSelectedOrigin(null);
      setGenerationError(null);
    }
  }, [currentBooking?._id, currentSavedPlan?.origin?.formattedAddress]);

  // Trigger Plan Generation with starting location
  const executePlanGeneration = async () => {
    if (!currentBooking) return;
    if (!selectedOrigin || !selectedOrigin.formattedAddress) {
      setGenerationError('Please enter or select your starting location.');
      return;
    }

    setGenerationError(null);
    try {
      const visitOrigin: VisitOriginLocation = {
        name: selectedOrigin.name || selectedOrigin.formattedAddress,
        formattedAddress: selectedOrigin.formattedAddress,
        placeId: selectedOrigin.placeId || '',
        latitude: selectedOrigin.latitude !== undefined && selectedOrigin.latitude !== null ? Number(selectedOrigin.latitude) : 0,
        longitude: selectedOrigin.longitude !== undefined && selectedOrigin.longitude !== null ? Number(selectedOrigin.longitude) : 0,
      };

      await generatePlan({
        bookingId: currentBooking._id,
        origin: visitOrigin,
      }).unwrap();
    } catch (err: unknown) {
      console.error('[PlanYourVisit] Plan generation failed:', err);
      const apiErr = err as ApiErrorResponse;
      const errMsg =
        apiErr?.data?.message || apiErr?.message || 'Failed to calculate route and guidance. Please try again.';
      setGenerationError(errMsg);
    }
  };

  // 1. Loading Skeleton
  if (isBookingsLoading) {
    return (
      <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-10 bg-amber-100/60 rounded-xl w-64 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 bg-stone-100 rounded-3xl animate-pulse" />
          <div className="lg:col-span-8 h-96 bg-stone-100 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Empty State: Devotee has 0 upcoming confirmed bookings
  if (!isBookingsLoading && bookingsCount === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-white border border-amber-200/80 shadow-spiritual-sm rounded-3xl p-8 sm:p-10 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-3xl mx-auto border border-amber-200/60">
            🛕
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-stone-800">
              Plan Your Sacred Visit
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
              Your upcoming temple journeys will appear here after you make a booking.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/temples"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <span>Explore Temples</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active visit plan details
  const activePlan = currentSavedPlan;
  const templeData = currentBooking?.templeId || {};
  const serviceData = currentBooking?.serviceId || {};
  const timeSlotData = currentBooking?.timeSlotId || {};

  // Suggested departure display
  const suggestedDepartureTime =
    activePlan?.planning?.departureTimeOnly ||
    activePlan?.planning?.recommendedDepartureText?.split('(')[0]?.trim() ||
    'Prior to Darshan';

  // Compact explanation
  const arrivalExplanation =
    activePlan?.planning?.explanationCallout ||
    (timeSlotData?.startTime
      ? `To reach your ${formatTimeRange(timeSlotData.startTime, timeSlotData.endTime).split('–')[0].trim()} darshan comfortably, we recommend starting around ${suggestedDepartureTime}.`
      : `We recommend departing around ${suggestedDepartureTime} to arrive comfortably before your visit.`);

  return (
    <div className="h-full flex flex-col min-h-0 lg:overflow-hidden">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5 shrink-0">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200/80 text-[10px] font-semibold tracking-wider text-amber-900 uppercase">
            <Calendar className="w-3 h-3 text-amber-700" />
            <span>MY BOOKED VISITS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Plan Your Sacred Journeys
          </h1>
          <p className="text-xs text-stone-600">
            Get travel guidance, route details and helpful information for your upcoming temple visits.
          </p>
        </div>

        {/* Right devotional quote */}
        <div className="hidden lg:flex flex-col items-end text-right">
          <span className="font-serif italic text-xs text-amber-950/80">
            “Every journey to a temple is a step closer to peace.”
          </span>
          <div className="flex items-center gap-2 text-xs text-amber-700 mt-0.5">
            <span className="w-6 h-px bg-amber-300" />
            <span className="font-bold text-sm">ॐ</span>
            <span className="w-6 h-px bg-amber-300" />
          </div>
        </div>
      </div>

      {/* 2. Main Two-Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 pt-3 lg:overflow-hidden items-stretch">
        {/* LEFT COLUMN (~32%): Fixed/Sticky in Desktop Viewport */}
        <aside className="lg:col-span-4 lg:h-full lg:overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="font-serif font-bold text-sm sm:text-base text-stone-900">
                Your Booked Temple Visits
              </h2>
              <p className="text-[11px] text-stone-500">
                Select a temple to plan your visit
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300/60">
              {bookingsCount}
            </span>
          </div>

          {/* List of Confirmed Booking Cards */}
          <div className="space-y-2.5">
            {bookings.map((b) => {
              const isSelected = b._id === currentBooking?._id;
              const bTemple = b.templeId || {};
              const bService = b.serviceId || {};
              const bSlot = b.timeSlotId || {};
              const templeImage =
                bTemple.coverImage?.url ||
                bTemple.gallery?.[0]?.url ||
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80';

              return (
                <button
                  key={b._id}
                  type="button"
                  onClick={() => setSelectedBookingId(b._id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FCF9F2] border-amber-400 shadow-xs ring-1 ring-amber-400/40'
                      : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-stone-50/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={templeImage}
                      alt={bTemple.name || 'Temple'}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="font-serif font-bold text-xs text-stone-900 truncate">
                        {bTemple.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 truncate">
                        {bTemple.city}, {bTemple.state}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-amber-700" />
                          {formatDateWithDayShort(b.bookingDate)}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-amber-700" />
                        <span>{formatTimeRange(bSlot.startTime, bSlot.endTime)}</span>
                      </div>
                      <div className="pt-0.5">
                        <span className="inline-block text-[9px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200/60">
                          🛕 {bService.name || 'Darshan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-amber-700 translate-x-0.5' : 'text-stone-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Bottom Disclaimer */}
          <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2 text-[10px] text-stone-600 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Only your confirmed bookings are shown here. Plans are generated using live maps and temple information.
            </span>
          </div>
        </aside>

        {/* RIGHT COLUMN (~68%): Independent Scroll Container */}
        <section className="lg:col-span-8 lg:h-full lg:overflow-y-auto lg:pr-3 space-y-4 scrollbar-thin">
          {currentBooking && (
            <>
              {/* 1. Selected Visit Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={
                      templeData.coverImage?.url ||
                      templeData.gallery?.[0]?.url ||
                      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={templeData.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-stone-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Confirmed Visit
                    </div>
                    <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 leading-tight truncate">
                      🛕 {templeData.name}
                    </h2>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                      {templeData.city}, {templeData.state}
                    </p>
                  </div>
                </div>

                {/* Visit summary mini-cards */}
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-xs shrink-0">
                  <div className="p-2 bg-stone-50 border border-stone-200/80 rounded-xl space-y-0.5 min-w-[95px]">
                    <div className="text-[9px] text-stone-400 font-bold uppercase flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-amber-700" /> Date
                    </div>
                    <div className="font-bold text-stone-800 text-[11px] truncate">
                      {formatDateFull(currentBooking.bookingDate)}
                    </div>
                    <div className="text-[9px] text-stone-500 truncate">
                      {getWeekdayName(currentBooking.bookingDate)}
                    </div>
                  </div>

                  <div className="p-2 bg-stone-50 border border-stone-200/80 rounded-xl space-y-0.5 min-w-[95px]">
                    <div className="text-[9px] text-stone-400 font-bold uppercase flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-700" /> Time
                    </div>
                    <div className="font-bold text-stone-800 text-[11px] truncate">
                      {formatTimeRange(timeSlotData.startTime, timeSlotData.endTime)}
                    </div>
                    <div className="text-[9px] text-stone-500 truncate">
                      #{currentBooking.bookingReference}
                    </div>
                  </div>

                  <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-0.5 min-w-[95px]">
                    <div className="text-[9px] text-amber-800 font-bold uppercase flex items-center gap-1">
                      <Ticket className="w-2.5 h-2.5 text-amber-700" /> Service
                    </div>
                    <div className="font-bold text-amber-950 text-[11px] truncate">
                      {serviceData.name || 'Darshan'}
                    </div>
                    <div className="text-[9px] text-emerald-700 font-medium">Confirmed</div>
                  </div>
                </div>
              </div>

              {/* 2. Starting Location Input Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm sm:text-base">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Ask AI to Plan Your Visit</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Enter your starting location to get the best route, travel time and personalized guidance.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex-1">
                    <GooglePlaceAutocomplete
                      value={selectedOrigin?.formattedAddress || ''}
                      onSelect={(place: SelectedPlace | null) => {
                        if (place) {
                          setSelectedOrigin({
                            placeId: place.placeId,
                            name: place.name,
                            formattedAddress: place.formattedAddress,
                            latitude: place.latitude,
                            longitude: place.longitude,
                          });
                        } else {
                          setSelectedOrigin(null);
                        }
                        setGenerationError(null);
                      }}
                      placeholder="Search starting location (e.g., Bengaluru, Chennai, Tirupati)..."
                      disabled={isGenerating}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={executePlanGeneration}
                    disabled={isGenerating}
                    className="px-5 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Calculating route...</span>
                      </>
                    ) : (
                      <span>{activePlan ? 'Recalculate Route & Plan' : 'Plan My Visit'}</span>
                    )}
                  </button>
                </div>

                {generationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{generationError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={executePlanGeneration}
                      className="text-xs font-bold underline hover:text-red-900 shrink-0 cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>

              {/* 3. YOUR SACRED JOURNEY: Cohesive Grid of Google Map & Route Details */}
              {activePlan && (
                <div className="bg-white border border-amber-200/80 rounded-2xl shadow-xs overflow-hidden animate-fade-in">
                  {/* Card Header Bar */}
                  <div className="px-5 py-3 bg-[#FAF8F5] border-b border-amber-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-xs sm:text-sm">
                      <Navigation className="w-3.5 h-3.5 text-amber-700" />
                      <span>YOUR SACRED JOURNEY</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isGenerating && (
                        <span className="text-[11px] text-amber-800 font-medium flex items-center gap-1.5 animate-pulse">
                          <RotateCw className="w-3 h-3 animate-spin" />
                          Calculating route...
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        • {activePlan.routeSnapshot?.trafficAware ? 'Traffic-Aware' : 'Best Route'}
                      </span>
                    </div>
                  </div>

                  {/* Equal-Height Shared Parent Grid: Map (~60%) + Route Details (~40%) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[420px] lg:h-[450px]">
                    {/* LEFT (~60%): Interactive Google Map */}
                    <div className="lg:col-span-7 h-[320px] sm:h-[380px] lg:h-full relative border-b lg:border-b-0 lg:border-r border-stone-200/80">
                      <RouteMap
                        origin={activePlan.origin}
                        destination={activePlan.destination}
                        overviewPolyline={activePlan.routeSnapshot?.overviewPolyline}
                        className="h-full rounded-none border-0"
                      />
                    </div>

                    {/* RIGHT (~40%): Route Details */}
                    <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 space-y-4 h-full overflow-y-auto bg-white">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                            Route Details
                          </span>
                          <p className="text-xs text-stone-600 mt-0.5">
                            Real-time path from your starting location to the temple.
                          </p>
                        </div>

                        {/* Key Numerical Metrics Row */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">
                            <div className="text-[9px] text-stone-400 font-bold uppercase">Distance</div>
                            <div className="font-bold text-stone-900 text-xs sm:text-sm mt-0.5">
                              {activePlan.routeSnapshot?.distanceKm} km
                            </div>
                          </div>

                          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">
                            <div className="text-[9px] text-stone-400 font-bold uppercase">Estimated Time</div>
                            <div className="font-bold text-stone-900 text-xs sm:text-sm mt-0.5">
                              {activePlan.routeSnapshot?.durationText}
                            </div>
                          </div>

                          <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60">
                            <div className="text-[9px] text-amber-800 font-bold uppercase">Suggested Start</div>
                            <div className="font-bold text-amber-950 text-xs sm:text-sm mt-0.5">
                              {suggestedDepartureTime}
                            </div>
                          </div>
                        </div>

                        {/* Route Destination Summary */}
                        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span className="truncate">Destination: {templeData.name}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 pl-5 leading-relaxed">
                            {activePlan.destination?.formattedAddress || `${templeData.city}, ${templeData.state}`}
                          </p>
                        </div>
                      </div>

                      {/* Compact Arrival Target & Explanation Callout */}
                      <div className="p-3 bg-[#FAF8F5] border border-amber-200/80 rounded-xl text-[11px] text-stone-700 flex items-start gap-2.5 leading-relaxed">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>{arrivalExplanation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. AI Travel Guidance Card */}
              {activePlan && (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-xs sm:text-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>AI Travel Guidance</span>
                    </div>
                    <Link
                      to={`/my-bookings/${currentBooking._id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-900 hover:underline"
                    >
                      <span>View Booking Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Concise summary */}
                  {activePlan.aiGuidance?.summary && (
                    <p className="text-xs text-stone-600 leading-relaxed italic bg-[#FCF9F2] p-3 rounded-xl border border-amber-200/50">
                      "{activePlan.aiGuidance.summary}"
                    </p>
                  )}

                  {/* 3-4 Bullet points maximum */}
                  {activePlan.aiGuidance?.tips && activePlan.aiGuidance.tips.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-stone-700">
                      {activePlan.aiGuidance.tips.slice(0, 4).map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-stone-500">
                      Follow temple guidelines and carry your booking QR code.
                    </p>
                  )}
                </div>
              )}

              {/* 5. Footer inside the right-hand scroll container on desktop */}
              <div className="pt-4 border-t border-stone-200/60">
                <DevoteeFooter />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default PlanYourVisit;
