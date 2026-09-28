import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  Megaphone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Users,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  useGetAuthorityDashboardQuery,
  useGetAuthorityAnnouncementsQuery,
} from '../../store/api/authorityApi.js';
import { ROUTES } from '../../constants/routes.js';
import { InternalStatusBadge } from '../../components/admin/common/index.js';
import { ServiceBookingNetwork } from '../../components/analytics/index.js';
import type { ServiceBookingNetworkData } from '../../components/analytics/ServiceBookingNetwork.js';
import templeEmblem from '../../assets/devasetu_temple_emblem.png';

interface DashboardKpis {
  activeServices?: number;
  todaySlots?: number;
  todayBookings?: number;
  upcomingBookings?: number;
}

interface DashboardBookingItem {
  _id: string;
  userId?: { name?: string };
  serviceId?: { name?: string };
  bookingDate?: string;
  totalAmount?: number;
  bookingStatus?: string;
}

interface DashboardSlotItem {
  _id: string;
  serviceId?: { name?: string };
  date: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  bookedCount?: number;
}

interface DashboardTemple {
  _id?: string;
  name?: string;
  city?: string;
  state?: string;
  slug?: string;
}

interface AuthorityDashboardPayload {
  temple?: DashboardTemple;
  kpis?: DashboardKpis;
  recentBookings?: DashboardBookingItem[];
  upcomingSlots?: DashboardSlotItem[];
  bookingFlow?: ServiceBookingNetworkData;
}

interface AnnouncementItem {
  _id?: string;
  title?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
}

export const AuthorityDashboard: React.FC = () => {
  const { data: dashRes, isLoading, isError, error, refetch } = useGetAuthorityDashboardQuery();
  const { data: annRes } = useGetAuthorityAnnouncementsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-3">
        <div className="w-10 h-10 border-3 border-spiritual-primary/20 border-t-spiritual-primary rounded-full animate-spin" />
        <span className="text-xs text-spiritual-muted font-medium">Loading temple operations...</span>
      </div>
    );
  }

  const errorMessage =
    error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : 'An error occurred while communicating with the server.';

  if (isError) {
    return (
      <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 flex items-start justify-between shadow-2xs">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Failed to load temple dashboard</h3>
            <p className="text-xs mt-1 text-rose-600">
              {errorMessage}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-2xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const dashboardData = (dashRes?.data as AuthorityDashboardPayload) || {};
  const {
    temple,
    kpis,
    recentBookings = [],
    upcomingSlots = [],
    bookingFlow = {},
  } = dashboardData;

  const announcements: AnnouncementItem[] = (annRes?.data as AnnouncementItem[]) || [];
  const activeAnnouncement = announcements.find((a) => a.isActive !== false) || announcements[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14 select-none">
      {/* ========================================================
          1. TEMPLE OPERATIONS COMMAND HERO CARD
          ======================================================== */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-[#FCFAF7] to-[#FAF4EC] border border-[#E8E2D9] p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Temple Information & Emblems */}
        <div className="flex items-start sm:items-center gap-4 min-w-0 z-10">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5DDD2] shadow-sm flex items-center justify-center p-2.5 shrink-0">
            <img
              src={templeEmblem}
              alt="Temple Emblem"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Operations Active
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-spiritual-accent bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-spiritual-primary" />
                Verified Temple Authority
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-spiritual-text tracking-tight truncate">
              {temple?.name || 'Temple Operations'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-spiritual-muted mt-1">
              {temple?.city && temple?.state && (
                <div className="flex items-center gap-1 text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-spiritual-primary shrink-0" />
                  <span>
                    {temple.city}, {temple.state}
                  </span>
                </div>
              )}
              {temple?.slug && (
                <Link
                  to={`/temples/${temple.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-spiritual-primary hover:underline font-semibold"
                >
                  <span>View Public Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
          <Link
            to={`${ROUTES.AUTHORITY}/services`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-spiritual-primary text-white rounded-xl text-xs font-semibold hover:bg-spiritual-accent transition-all shadow-spiritual-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Seva Offering</span>
          </Link>

          <Link
            to={`${ROUTES.AUTHORITY}/time-slots`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#E8E2D9] text-spiritual-text rounded-xl text-xs font-semibold hover:bg-[#FAF6F0] transition-colors shadow-2xs cursor-pointer"
          >
            <Clock className="w-4 h-4 text-spiritual-primary" />
            <span>Schedule Slots</span>
          </Link>

          <Link
            to={`${ROUTES.AUTHORITY}/announcements`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#E8E2D9] text-spiritual-muted hover:text-spiritual-text rounded-xl text-xs font-semibold hover:bg-[#FAF6F0] transition-colors shadow-2xs cursor-pointer"
            title="Publish Announcement"
          >
            <Megaphone className="w-4 h-4 text-spiritual-primary" />
            <span className="hidden sm:inline">Broadcast</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          ACTIVE BROADCAST NOTICE (IF AVAILABLE)
          ======================================================== */}
      {activeAnnouncement && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300/80 text-amber-800 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-amber-950 block truncate">
                {activeAnnouncement.title}
              </span>
              <p className="text-amber-800/90 text-[11px] truncate mt-0.5">
                {activeAnnouncement.content || activeAnnouncement.description}
              </p>
            </div>
          </div>
          <Link
            to={`${ROUTES.AUTHORITY}/announcements`}
            className="shrink-0 text-spiritual-primary font-bold hover:underline text-[11px] inline-flex items-center gap-1"
          >
            <span>Manage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ========================================================
          2. KPI CARDS GRID (FOUR HIGH-IMPACT TILES)
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Active Services */}
        <Link
          to={`${ROUTES.AUTHORITY}/services`}
          className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-spiritual-muted uppercase tracking-wider">
              Active Offerings
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-spiritual-text">
              {kpis?.activeServices || 0}
            </div>
            <div className="text-xs text-spiritual-muted font-medium mt-1 flex items-center justify-between">
              <span>Verified poojas & sevas</span>
              <ChevronRight className="w-3.5 h-3.5 text-spiritual-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 2. Today's Time Slots */}
        <Link
          to={`${ROUTES.AUTHORITY}/time-slots`}
          className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-spiritual-muted uppercase tracking-wider">
              Today's Slots
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-spiritual-text">
              {kpis?.todaySlots || 0}
            </div>
            <div className="text-xs text-spiritual-muted font-medium mt-1 flex items-center justify-between">
              <span>Scheduled time windows</span>
              <ChevronRight className="w-3.5 h-3.5 text-spiritual-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 3. Today's Reservations */}
        <Link
          to={`${ROUTES.AUTHORITY}/bookings`}
          className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-spiritual-muted uppercase tracking-wider">
              Today's Devotees
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-spiritual-text">
              {kpis?.todayBookings || 0}
            </div>
            <div className="text-xs text-spiritual-muted font-medium mt-1 flex items-center justify-between">
              <span>Devotee arrivals today</span>
              <ChevronRight className="w-3.5 h-3.5 text-spiritual-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>

        {/* 4. Upcoming Bookings Pipeline */}
        <Link
          to={`${ROUTES.AUTHORITY}/bookings`}
          className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-spiritual-muted uppercase tracking-wider">
              Upcoming Bookings
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-spiritual-text">
              {kpis?.upcomingBookings || 0}
            </div>
            <div className="text-xs text-spiritual-muted font-medium mt-1 flex items-center justify-between">
              <span>Confirmed future pipeline</span>
              <ChevronRight className="w-3.5 h-3.5 text-spiritual-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Link>
      </div>

      {/* ========================================================
          3. SERVICE-WISE BOOKINGS NETWORK (RADIAL VISUALIZATION)
          ======================================================== */}
      <ServiceBookingNetwork
        data={bookingFlow}
        title="Service-wise Bookings"
        subtitle="Distribution of ticket bookings across your temple services."
        periodBadge="Last 30 Days"
      />

      {/* ========================================================
          4. TWO COLUMN REAL-TIME OPERATIONAL STREAMS
          Left: Upcoming Time Slots
          Right: Recent Devotee Reservations
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Upcoming Slots Stream */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F4EFE6]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-serif font-bold text-spiritual-text">
                    Upcoming Time Slots
                  </h2>
                  <p className="text-[11px] text-spiritual-muted">Next scheduled visitation windows</p>
                </div>
              </div>
              <Link
                to={`${ROUTES.AUTHORITY}/time-slots`}
                className="text-xs text-spiritual-primary hover:underline font-bold flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#F4EFE6] mt-1">
              {upcomingSlots.length === 0 ? (
                <div className="py-12 text-center text-xs text-spiritual-muted space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="font-semibold text-spiritual-text">No upcoming slots scheduled.</p>
                  <p>Schedule time slots to enable devotees to reserve darshan slots online.</p>
                  <Link
                    to={`${ROUTES.AUTHORITY}/time-slots`}
                    className="inline-flex items-center gap-1 text-spiritual-primary font-bold hover:underline mt-2 text-xs"
                  >
                    <span>+ Schedule New Slot</span>
                  </Link>
                </div>
              ) : (
                upcomingSlots.map((slot) => {
                  const capacity = Number(slot.capacity) || 1;
                  const booked = Number(slot.bookedCount) || 0;
                  const remaining = Math.max(0, capacity - booked);
                  const occupancyRatio = Math.round((booked / capacity) * 100);

                  return (
                    <div
                      key={slot._id}
                      className="py-3 flex items-center justify-between gap-3 text-xs group hover:bg-[#FAF7F2]/60 px-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-[13px] truncate">
                          {slot.serviceId?.name || 'Darshan Seva'}
                        </div>
                        <div className="text-spiritual-muted text-[11px] font-mono mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-spiritual-primary shrink-0" />
                          <span>
                            {new Date(slot.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </div>

                      {/* Capacity Pill & Progress Indicator */}
                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-mono font-bold text-slate-800">
                          {remaining} <span className="font-normal text-spiritual-muted">seats left</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              occupancyRatio >= 85
                                ? 'bg-rose-500'
                                : occupancyRatio >= 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(occupancyRatio, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F4EFE6] mt-2 text-center">
            <Link
              to={`${ROUTES.AUTHORITY}/time-slots`}
              className="text-xs text-spiritual-muted hover:text-spiritual-primary font-semibold transition-colors"
            >
              Manage Complete Darshan Calendar →
            </Link>
          </div>
        </div>

        {/* Recent Devotee Bookings Stream */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F4EFE6]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-serif font-bold text-spiritual-text">
                    Recent Devotee Bookings
                  </h2>
                  <p className="text-[11px] text-spiritual-muted">Latest verified reservations</p>
                </div>
              </div>
              <Link
                to={`${ROUTES.AUTHORITY}/bookings`}
                className="text-xs text-spiritual-primary hover:underline font-bold flex items-center gap-1"
              >
                <span>All bookings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#F4EFE6] mt-1">
              {recentBookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-spiritual-muted space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="font-semibold text-spiritual-text">No bookings placed yet.</p>
                  <p>Bookings made by devotees on the portal will appear here in real time.</p>
                </div>
              ) : (
                recentBookings.map((b) => {
                  const devoteeName = b.userId?.name || 'Devotee';
                  const initial = devoteeName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={b._id}
                      className="py-3 flex items-center justify-between gap-3 text-xs group hover:bg-[#FAF7F2]/60 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Devotee Avatar Token */}
                        <div className="w-8 h-8 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {initial}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-[13px] truncate">
                            {devoteeName}
                          </div>
                          <div className="text-spiritual-muted text-[11px] truncate mt-0.5">
                            <span className="font-medium text-slate-700">
                              {b.serviceId?.name || 'Darshan Seva'}
                            </span>{' '}
                            • {b.bookingDate || 'Upcoming'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2.5 shrink-0">
                        <span className="font-mono font-bold text-slate-900 text-xs sm:text-[13px]">
                          ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                        <InternalStatusBadge status={b.bookingStatus || 'CONFIRMED'} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F4EFE6] mt-2 text-center">
            <Link
              to={`${ROUTES.AUTHORITY}/bookings`}
              className="text-xs text-spiritual-muted hover:text-spiritual-primary font-semibold transition-colors"
            >
              View Full Devotee Bookings Ledger →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
