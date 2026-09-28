import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  CalendarCheck,
  CreditCard,
  Sparkles,
  PieChart,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useGetAuthorityAnalyticsQuery } from '../../store/api/authorityApi.js';
import {
  AnalyticsCard,
  AnalyticsKpiCard,
  AnalyticsFilterBar,
  ServiceBookingFlowChart,
  BookingActivityCalendar,
  DonutDistributionChart,
  RevenueContributionChart,
  RankingBarChart,
} from '../../components/analytics/index.js';
import type { ServiceBookingFlowData } from '../../components/analytics/ServiceBookingFlowChart.js';
import type { RevenueContributionItem } from '../../components/analytics/RevenueContributionChart.js';
import type { RankingBarChartItem } from '../../components/analytics/RankingBarChart.js';

interface AnalyticsKpis {
  totalBookings: number;
  totalTickets?: number;
  totalDevotees: number;
  confirmedBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  pendingBookings?: number;
  settledRevenue: number;
  activeServices: number;
  totalServices?: number;
  totalSlots?: number;
  bookingChange: number | null;
  revenueChange: number | null;
}

interface RawRevenueItem {
  name?: string;
  serviceName?: string;
  templeName?: string;
  value?: number;
  revenue?: number | string;
  percentage?: number;
  color?: string;
}

interface AuthorityAnalyticsPayload {
  kpis?: AnalyticsKpis;
  bookingFlow?: ServiceBookingFlowData;
  activityCalendar?: Record<string, number>;
  serviceTypeDistribution?: Array<{ label: string; value: number; color?: string }>;
  revenueByService?: RawRevenueItem[];
  popularServices?: RankingBarChartItem[];
  temple?: {
    _id?: string;
    name?: string;
  };
}

export const AuthorityAnalytics: React.FC = () => {
  const [range, setRange] = useState<string>('30d');
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date(2026, 8, 1)); // Default: Sep 2026

  const calendarMonthParam = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`;

  // Fetch real analytics strictly scoped to this authority's assigned temple
  const { data: analyticsRes, isLoading, isFetching, isError, error, refetch } = useGetAuthorityAnalyticsQuery({
    range,
    calendarMonth: calendarMonthParam,
  });

  const analytics = (analyticsRes?.data as AuthorityAnalyticsPayload) || {};

  const kpis: AnalyticsKpis = analytics.kpis || {
    totalBookings: 0,
    totalTickets: 0,
    totalDevotees: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    pendingBookings: 0,
    settledRevenue: 0,
    activeServices: 0,
    totalServices: 0,
    totalSlots: 0,
    bookingChange: null,
    revenueChange: null,
  };

  const bookingFlow: ServiceBookingFlowData = analytics.bookingFlow || {};
  const activityCalendar: Record<string, number> = analytics.activityCalendar || {};
  const serviceTypeDistribution = analytics.serviceTypeDistribution || [];
  const revenueByService: RevenueContributionItem[] = (analytics.revenueByService || []).map((item) => ({
    name: item.name || item.serviceName || 'Service',
    serviceName: item.serviceName,
    templeName: item.templeName,
    revenue: item.revenue !== undefined ? item.revenue : (item.value || 0),
    percentage: item.percentage,
    color: item.color,
  }));
  const popularServices: RankingBarChartItem[] = analytics.popularServices || [];
  const templeName = analytics.temple?.name || 'Temple';

  const errorMessage =
    error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : 'Server communication error';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14 select-none">
      {/* ========================================================
          PAGE HEADER
          INSIGHTS eyebrow, Title, Subtitle, and Date Range Filter
          ======================================================== */}
      <div className="rounded-2xl bg-white border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-spiritual-primary font-bold text-[11px] tracking-wider uppercase mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>TEMPLE INSIGHTS</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-serif font-bold text-spiritual-text tracking-tight">
            Temple Analytics & Footfall
          </h1>
          <p className="text-xs text-spiritual-muted mt-0.5 max-w-2xl">
            In-depth operational data, devotee footfall, seva reservations, and dakshina flow for{' '}
            <strong className="text-slate-700">{templeName}</strong>.
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 self-start md:self-center">
          {/* Page-level Date Range Filter (Hidden as requested; re-enable later if needed) */}
          {/* <AnalyticsFilterBar
            value={range}
            onChange={(newRange) => setRange(newRange)}
          /> */}

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh analytics data"
            className="p-2 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs text-spiritual-muted hover:text-spiritual-primary hover:bg-[#FAF6F0] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load temple analytics: {errorMessage}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg font-semibold hover:bg-rose-50 text-rose-700 cursor-pointer shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================
          KPI ROW (FOUR EQUAL CARDS)
          1. Total Reservations
          2. Devotee Footfall
          3. Dakshina Collection
          4. Active Sevas & Darshan Slots
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Reservations */}
        <AnalyticsKpiCard
          title="Total Reservations"
          value={kpis.totalBookings}
          icon={CalendarCheck}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          iconBorder="border-amber-200"
          change={kpis.bookingChange}
          subtext={`${kpis.confirmedBookings || 0} confirmed in selected period`}
          isLoading={isLoading}
        />

        {/* 2. Devotee Footfall (Total Attendees / Tickets) */}
        <AnalyticsKpiCard
          title="Devotee Footfall"
          value={kpis.totalDevotees}
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          iconBorder="border-emerald-200"
          change={kpis.bookingChange}
          subtext="Total devotee tickets booked"
          isLoading={isLoading}
        />

        {/* 3. Dakshina & Revenue Collection */}
        <AnalyticsKpiCard
          title="Dakshina / Revenue"
          value={`₹${(kpis.settledRevenue || 0).toLocaleString('en-IN')}`}
          icon={CreditCard}
          iconBg="bg-rose-50"
          iconColor="text-rose-700"
          iconBorder="border-rose-200"
          change={kpis.revenueChange}
          subtext="Settled donations & ticket fees"
          isLoading={isLoading}
        />

        {/* 4. Active Sevas & Time Slots */}
        <AnalyticsKpiCard
          title="Active Offerings"
          value={kpis.activeServices}
          icon={Sparkles}
          iconBg="bg-purple-50"
          iconColor="text-purple-700"
          iconBorder="border-purple-200"
          change={null}
          subtext={`${kpis.totalSlots || 0} scheduled darshan slots`}
          isLoading={isLoading}
        />
      </div>

      {/* ========================================================
          ROW 1 — FULL WIDTH: BOOKING FLOW ACROSS SERVICES
          Spacious, newly redesigned node-and-connector Sankey
          with dynamic vertical breathing room and dual-tone ribbons
          ======================================================== */}
      <ServiceBookingFlowChart
        data={bookingFlow}
        title="Booking Flow Across Services"
        subtitle="Distribution of reservations from your temple services into real-time confirmation statuses."
        /* periodBadge={
          range === '7d'
            ? 'Last 7 Days'
            : range === '90d'
            ? 'Last 90 Days'
            : range === '1y'
            ? 'This Year'
            : 'Last 30 Days'
        } */
      />

      {/* ========================================================
          ROW 2 — TWO EQUAL-WIDTH COLUMNS (50% / 50%)
          Left: Devotee Footfall Heatmap Calendar
          Right: Seva & Offering Type Distribution (Donut Chart)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Daily Booking Calendar */}
        <div className="flex flex-col h-full">
          <AnalyticsCard
            title="Daily Booking Calendar"
            description="Daily booking intensity and peak booking days."
            icon={CalendarCheck}
            iconBg="bg-amber-50"
            iconBorder="border-amber-200"
            iconColor="text-amber-700"
            isLoading={isLoading}
            chartHeight={320}
            className="h-full"
            actions={
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9] text-xs font-semibold text-spiritual-text shadow-2xs select-none">
                <button
                  type="button"
                  onClick={() => setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="p-0.5 hover:bg-amber-50 rounded transition-colors text-spiritual-primary"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[65px] text-center font-medium">
                  {calendarDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="p-0.5 hover:bg-amber-50 rounded transition-colors text-spiritual-primary"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            }
          >
            <BookingActivityCalendar
              data={activityCalendar}
              selectedDate={calendarDate}
              onMonthChange={setCalendarDate}
              height={320}
              emptyMessage="No daily bookings recorded for this period."
            />
          </AnalyticsCard>
        </div>

        {/* Right: Seva & Offering Type Distribution */}
        <div className="flex flex-col h-full">
          <AnalyticsCard
            title="Seva & Offering Distribution"
            description="Share of bookings across Darshan, Sevas, and Special Poojas."
            icon={PieChart}
            iconBg="bg-[#FFF8EE]"
            iconBorder="border-[#FDE68A]"
            iconColor="text-[#E2871A]"
            isLoading={isLoading}
            chartHeight={310}
            skeletonType="donut"
            className="h-full"
            actions={
              <span className="text-[11px] font-semibold text-spiritual-muted px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#EAE0D0]">
                By Category
              </span>
            }
          >
            <DonutDistributionChart
              data={serviceTypeDistribution}
              labelKey="label"
              valueKey="value"
              size={185}
              outerRadius={86}
              innerRadius={46}
              centerLabel="Total Bookings"
              emptyMessage="No seva category bookings recorded in this period."
            />
          </AnalyticsCard>
        </div>
      </div>

      {/* ========================================================
          ROW 3 — TWO EQUAL-WIDTH COLUMNS (50% / 50%)
          Left: Dakshina / Revenue Contribution by Seva (Treemap)
          Right: Most In-Demand Services (Ranked Bar Chart)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Revenue Contribution by Seva */}
        <div className="flex flex-col h-full">
          <AnalyticsCard
            title="Dakshina Contribution by Seva"
            description="Share of collection generated across individual temple offerings."
            icon={CreditCard}
            iconBg="bg-[#FFF8EE]"
            iconBorder="border-[#FDE68A]"
            iconColor="text-[#E2871A]"
            isLoading={isLoading}
            chartHeight={260}
            className="h-full"
            actions={
              <span className="text-[11px] font-semibold text-spiritual-muted px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#EAE0D0]">
                By Dakshina
              </span>
            }
          >
            <RevenueContributionChart
              data={revenueByService}
              height={220}
              emptyMessage="No settled dakshina or seva revenue recorded for this period."
            />
          </AnalyticsCard>
        </div>

        {/* Right: Most In-Demand Temple Services */}
        <div className="flex flex-col h-full">
          <AnalyticsCard
            title="Most In-Demand Temple Services"
            description="Highest booked sevas and darshanam slots by devotees."
            icon={Sparkles}
            iconBg="bg-amber-50"
            iconBorder="border-amber-200"
            iconColor="text-amber-700"
            isLoading={isLoading}
            chartHeight={260}
            className="h-full"
            actions={
              <span className="text-[11px] font-semibold text-spiritual-muted px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#EAE0D0]">
                Top 5
              </span>
            }
          >
            <RankingBarChart
              data={popularServices}
              labelKey="serviceName"
              valueKey="bookingsCount"
              maxItems={5}
              height={220}
              emptyMessage="No service bookings recorded in this period."
            />
          </AnalyticsCard>
        </div>
      </div>
    </div>
  );
};

export default AuthorityAnalytics;
