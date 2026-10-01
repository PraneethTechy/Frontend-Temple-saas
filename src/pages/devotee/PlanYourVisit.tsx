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
  Compass,
  MapPinned,
  ArrowUpDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import {
  useGetUpcomingBookingsWithPlansQuery,
  useGenerateVisitPlanMutation,
} from '../../store/api/visitPlanApi.js';
import GooglePlaceAutocomplete, { type SelectedPlace } from '../../components/maps/GooglePlaceAutocomplete.js';
import RouteMap from '../../components/maps/RouteMap.js';
import TransitConnectionsCard from '../../components/devotee/TransitConnectionsCard.js';
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
  // Mode to toggle inline location editing after a plan is already generated
  const [isEditingOrigin, setIsEditingOrigin] = useState<boolean>(false);
  // Toggle state for left sidebar (Booked Visits panel)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('devasetu_plan_sidebar_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('devasetu_plan_sidebar_open', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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

  // Sync state when selected booking changes
  useEffect(() => {
    if (currentSavedPlan?.origin) {
      setSelectedOrigin(currentSavedPlan.origin);
      setIsEditingOrigin(false);
      setGenerationError(null);
    } else {
      setSelectedOrigin(null);
      setIsEditingOrigin(false);
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

      setIsEditingOrigin(false);
    } catch (err: unknown) {
      console.error('[PlanYourVisit] Plan generation failed:', err);
      const apiErr = err as ApiErrorResponse;
      const errMsg =
        apiErr?.data?.message || apiErr?.message || 'Unable to calculate the route right now. Please try again.';
      setGenerationError(errMsg);
    }
  };

  // 1. Loading Skeleton
  if (isBookingsLoading) {
    return (
      <div className="space-y-6 pb-12 w-full animate-fade-in">
        <div className="space-y-2">
          <div className="h-6 bg-amber-100/70 rounded-full w-40 animate-pulse" />
          <div className="h-8 bg-stone-200/70 rounded-xl w-72 animate-pulse" />
          <div className="h-4 bg-stone-100 rounded-lg w-96 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[420px] bg-stone-100 rounded-2xl animate-pulse" />
          <div className="lg:col-span-8 h-[520px] bg-stone-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Empty State: Devotee has 0 upcoming confirmed bookings
  if (!isBookingsLoading && bookingsCount === 0) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center bg-white border border-amber-200/80 shadow-spiritual-sm rounded-3xl p-8 sm:p-10 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-3xl mx-auto border border-amber-200/60 shadow-xs">
            🛕
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              Plan Your Sacred Visit
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
              Your upcoming temple journeys will appear here once you make a confirmed booking.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/temples"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
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
  const hasActivePlan = Boolean(activePlan && activePlan.routeSnapshot?.distanceKm);
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
    <div className="w-full space-y-5 pb-8">
      {/* 1. Compact Page Header & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/70 pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 border border-amber-200/90 text-[10px] font-bold tracking-wider text-amber-900 uppercase">
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

        {/* Right devotional subtle accent */}
        <div className="hidden lg:flex items-center gap-3 text-right">
          <div className="flex flex-col items-end">
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
      </div>

      {/* 2. Top Banner / Control Strip (Visible when left sidebar is closed) */}
      {!isSidebarOpen && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/95 border border-amber-200/90 rounded-2xl shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold text-xs border border-amber-200/90 shadow-2xs transition-all cursor-pointer group"
            >
              <PanelLeftOpen className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
              <span>Show Booked Visits ({bookingsCount})</span>
            </button>

            {currentBooking && (
              <div className="flex items-center gap-2 text-xs text-stone-700">
                <span className="text-[11px] text-stone-400 hidden sm:inline">•</span>
                <span className="text-stone-500 hidden sm:inline">Active Visit:</span>
                <span className="font-serif font-bold text-amber-950 truncate max-w-[220px]">
                  {templeData.name}
                </span>
                <span className="text-[11px] text-stone-500 hidden md:inline">
                  ({templeData.city})
                </span>
              </div>
            )}
          </div>

          {currentBooking && (
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span className="text-[11px] text-amber-900 bg-amber-100/70 border border-amber-200/70 px-2.5 py-0.5 rounded-md font-medium">
                {formatDateWithDayShort(currentBooking.bookingDate)}
              </span>
              <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                {formatTimeRange(timeSlotData.startTime, timeSlotData.endTime)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Planning Workspace (Adapts to Sidebar Open / Closed) */}
      <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-12 gap-6' : 'gap-6'} items-start`}>
        {/* LEFT COLUMN: Collapsible Booked Temple Visits Selection Panel */}
        {isSidebarOpen && (
          <aside className="lg:col-span-4 space-y-3.5 lg:sticky lg:top-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="font-serif font-bold text-sm sm:text-base text-stone-900">
                  Your Booked Temple Visits
                </h2>
                <p className="text-[11px] text-stone-500">
                  Select a temple to plan your visit
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300/70 shadow-2xs">
                  {bookingsCount}
                </span>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Collapse sidebar to expand map workspace"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-amber-100/80 transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of Compact Confirmed Booking Cards */}
            <div className="space-y-2.5">
              {bookings.map((b) => {
                const isSelected = b._id === currentBooking?._id;
                const bTemple = b.templeId || {};
                const bService = b.serviceId || {};
                const bSlot = b.timeSlotId || {};
                const hasPlan = Boolean(b.savedPlan?.routeSnapshot?.distanceKm);
                const templeImage =
                  bTemple.coverImage?.url ||
                  bTemple.gallery?.[0]?.url ||
                  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80';

                return (
                  <button
                    key={b._id}
                    type="button"
                    onClick={() => {
                      setSelectedBookingId(b._id);
                      setIsEditingOrigin(false);
                      setGenerationError(null);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FCF9F2] border-amber-400 shadow-sm ring-1.5 ring-amber-400/50'
                        : 'bg-white border-stone-200/90 hover:border-amber-300 hover:bg-stone-50/70 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={templeImage}
                        alt={bTemple.name || 'Temple'}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200 shadow-2xs mt-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-serif font-bold text-xs sm:text-[13px] text-stone-900 truncate">
                            {bTemple.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {hasPlan && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Journey Planned" />
                            )}
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                isSelected ? 'text-amber-700 translate-x-0.5' : 'text-stone-300'
                              }`}
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {bTemple.city}, {bTemple.state}
                        </p>
                        <div className="text-[10px] text-stone-600 font-medium space-y-0.5 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                            <span>{formatDateWithDayShort(b.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                            <span>{formatTimeRange(bSlot.startTime, bSlot.endTime)}</span>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center gap-1.5">
                          <span className="inline-block text-[9px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200/70">
                            {bService.name || 'Darshan'}
                          </span>
                          <span className="inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80">
                            Confirmed
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compact Informational Note: Planning with confidence */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1 text-xs text-stone-700 shadow-2xs">
              <div className="flex items-center gap-1.5 font-serif font-bold text-amber-950 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Planning with confidence</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed pl-5">
                Only confirmed bookings are shown here. Routes use live map and temple information.
              </p>
            </div>
          </aside>
        )}

        {/* RIGHT COLUMN: Dynamic Planning Workspace (Expands to full width when sidebar is closed) */}
        <section className={`${isSidebarOpen ? 'lg:col-span-8' : 'col-span-12 w-full max-w-7xl mx-auto'} space-y-5 transition-all duration-300`}>
          {currentBooking && (
            <>
              {/* STATE A: BEFORE PLANNING (or when user clicks "Change starting location" without an active plan) */}
              {(!hasActivePlan || isEditingOrigin) && (
                <div className={`bg-white border border-amber-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in ${!isSidebarOpen ? 'max-w-3xl mx-auto' : ''}`}>
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 text-stone-900 font-serif font-bold text-base sm:text-lg">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>Ask AI to Plan Your Visit</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                      Enter your starting location to get the best route, travel time and personalized guidance for{' '}
                      <strong className="text-amber-950 font-serif font-semibold">{templeData.name}</strong>.
                    </p>
                  </div>

                  {/* Destination Context Pill */}
                  <div className="p-3 bg-[#FAF8F5] border border-amber-200/70 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-stone-700">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🛕</span>
                      <div>
                        <span className="font-serif font-bold text-stone-900">{templeData.name}</span>
                        <span className="text-stone-500 text-[11px] block sm:inline sm:ml-2">
                          {templeData.city}, {templeData.state}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                      <span>Darshan: <strong>{formatTimeRange(timeSlotData.startTime, timeSlotData.endTime)}</strong></span>
                      <span>•</span>
                      <span>{formatDateFull(currentBooking.bookingDate)}</span>
                    </div>
                  </div>

                  {/* Location Input & Plan Button */}
                  <div className="space-y-3">
                    <label htmlFor="starting-location-input" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Starting Location
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={executePlanGeneration}
                          disabled={isGenerating}
                          className="w-full sm:w-auto px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer"
                        >
                          {isGenerating ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Planning your journey...</span>
                            </>
                          ) : (
                            <>
                              <Compass className="w-4 h-4" />
                              <span>Plan My Visit</span>
                            </>
                          )}
                        </button>

                        {hasActivePlan && isEditingOrigin && (
                          <button
                            type="button"
                            onClick={() => setIsEditingOrigin(false)}
                            className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {generationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2 animate-shake">
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
              )}

              {/* STATE B: AFTER PLANNING — JOURNEY WORKSPACE (Replaces the large input card) */}
              {activePlan && hasActivePlan && !isEditingOrigin && (
                <div className="space-y-5 animate-fade-in">
                  {/* Complete Sacred Journey Workspace Card */}
                  <div className="bg-white border border-amber-200/90 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header Bar with Action to Change Starting Location */}
                    <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-amber-200/70 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs sm:text-sm text-stone-900">
                            YOUR SACRED JOURNEY
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                            <span className="truncate max-w-[180px] sm:max-w-xs font-medium text-stone-700">
                              {activePlan.origin?.name || activePlan.origin?.formattedAddress}
                            </span>
                            <span>→</span>
                            <span className="truncate max-w-[180px] sm:max-w-xs font-semibold text-amber-900">
                              {templeData.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          • {activePlan.routeSnapshot?.trafficAware ? 'Traffic-Aware' : 'Best Route'}
                        </span>

                        {!isSidebarOpen && (
                          <button
                            type="button"
                            onClick={toggleSidebar}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-xs font-semibold border border-amber-200/80 transition-colors shadow-2xs cursor-pointer"
                          >
                            <PanelLeftOpen className="w-3.5 h-3.5 text-amber-700" />
                            <span>Switch Temple</span>
                          </button>
                        )}

                        {/* Compact Change Starting Location Button */}
                        <button
                          type="button"
                          onClick={() => setIsEditingOrigin(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-xs font-semibold border border-amber-200/80 transition-colors shadow-2xs cursor-pointer"
                        >
                          <MapPinned className="w-3 h-3 text-amber-700" />
                          <span>Change starting location</span>
                        </button>
                      </div>
                    </div>

                    {/* Shared Grid: Substantial Responsive Map (Left) + Route Details Panel (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[480px]">
                      {/* Interactive Satellite Map */}
                      <div className={`${isSidebarOpen ? 'lg:col-span-7 min-h-[480px]' : 'lg:col-span-8 min-h-[540px]'} h-[380px] sm:h-[460px] lg:h-auto relative border-b lg:border-b-0 lg:border-r border-stone-200/90 transition-all duration-300`}>
                        <RouteMap
                          origin={activePlan.origin}
                          destination={activePlan.destination}
                          overviewPolyline={activePlan.routeSnapshot?.overviewPolyline}
                          distanceKm={activePlan.routeSnapshot?.distanceKm}
                          durationMin={
                            activePlan.routeSnapshot?.durationText
                              ? parseInt(activePlan.routeSnapshot.durationText, 10)
                              : null
                          }
                          className="h-full rounded-none border-0"
                        />
                      </div>

                      {/* Route Details Panel (Right) */}
                      <div className={`${isSidebarOpen ? 'lg:col-span-5 p-5' : 'lg:col-span-4 p-6 sm:p-7'} flex flex-col justify-between space-y-4 bg-white transition-all duration-300`}>
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              ROUTE DETAILS
                            </span>
                            <p className="text-xs text-stone-600 mt-0.5">
                              Real-time path from your starting location to the temple.
                            </p>
                          </div>

                          {/* Numerical Metrics Cards */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 shadow-2xs">
                              <div className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Distance</div>
                              <div className="font-bold text-stone-900 text-xs sm:text-sm mt-1">
                                {activePlan.routeSnapshot?.distanceKm} km
                              </div>
                            </div>

                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 shadow-2xs">
                              <div className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Estimated Time</div>
                              <div className="font-bold text-stone-900 text-xs sm:text-sm mt-1">
                                {activePlan.routeSnapshot?.durationText}
                              </div>
                            </div>

                            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 shadow-2xs">
                              <div className="text-[9px] text-amber-800 font-bold uppercase tracking-wider">Suggested Start</div>
                              <div className="font-bold text-amber-950 text-xs sm:text-sm mt-1">
                                {suggestedDepartureTime}
                              </div>
                            </div>
                          </div>

                          {/* Destination Card */}
                          <div className="p-3.5 bg-stone-50/80 border border-stone-200/80 rounded-xl space-y-1.5 text-xs shadow-2xs">
                            <div className="flex items-center gap-1.5 text-stone-900 font-semibold text-xs">
                              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span className="truncate">Destination: {templeData.name}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 pl-5 leading-relaxed">
                              {activePlan.destination?.formattedAddress || `${templeData.city}, ${templeData.state}`}
                            </p>
                          </div>

                          {/* Darshan Slot Timing */}
                          <div className="p-3 bg-[#FAF8F5] border border-amber-200/70 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-700" />
                                Darshan Slot:
                              </span>
                              <strong className="text-amber-950 font-bold">
                                {formatTimeRange(timeSlotData.startTime, timeSlotData.endTime)}
                              </strong>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-500 flex items-center gap-1">
                                <Ticket className="w-3 h-3 text-amber-700" />
                                Service:
                              </span>
                              <strong className="text-stone-800 font-medium">
                                {serviceData.name || 'Darshan'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Recommendation Callout */}
                        <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-stone-700 flex items-start gap-2.5 leading-relaxed shadow-2xs">
                          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>{arrivalExplanation}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Travel & Transit Options (Trains, Buses & Outstation Cabs) */}
                  <TransitConnectionsCard
                    originName={activePlan.origin?.name}
                    originAddress={activePlan.origin?.formattedAddress}
                    templeName={templeData.name}
                    templeCity={templeData.city}
                  />

                  {/* AI Travel Guidance Card */}
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-xs sm:text-sm">
                        <Sparkles className="w-4 h-4 text-amber-600" />
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

                    {/* Bullet tips */}
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
                        Follow temple guidelines and carry your booking confirmation QR code.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default PlanYourVisit;
