import React, { useState } from 'react';
import {
  Building2,
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
  GitFork,
  PieChart,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useGetAdminAnalyticsQuery } from '../../store/api/adminApi.js';
import {
  AnalyticsCard,
  AnalyticsKpiCard,
  AnalyticsFilterBar,
  BookingFlowChart,
  BookingActivityCalendar,
  DonutDistributionChart,
  RevenueContributionChart,
  RankingBarChart,
  TemplePopularityChart,
} from '../../components/analytics/index.js';
import type { BookingFlowData } from '../../components/analytics/BookingFlowChart.js';
import type { BookingActivityCalendarData } from '../../components/analytics/BookingActivityCalendar.js';
import type { DonutDistributionDataItem } from '../../components/analytics/DonutDistributionChart.js';
import type { RevenueContributionItem } from '../../components/analytics/RevenueContributionChart.js';
import type { RankingBarChartItem } from '../../components/analytics/RankingBarChart.js';
import type { TemplePopularityData } from '../../components/analytics/TemplePopularityChart.js';

interface AnalyticsKpis {
  totalTemples: number;
  activeTemples: number;
  pendingRegistrations: number;
  totalDevotees: number;
  totalAuthorities: number;
  totalBookings: number;
  allTimeBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  settledRevenue: number;
  allTimeRevenue: number;
  successfulTransactions: number;
  bookingChange: number | null;
  revenueChange: number | null;
  devoteeChange: number | null;
}

const extractErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'data' in err) {
    const errorData = (err as { data?: { message?: string } }).data;
    if (errorData?.message) return errorData.message;
  }
  return 'Server error';
};

export const AdminAnalytics: React.FC = () => {
  const [range, setRange] = useState('30d');
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date(2026, 8, 1)); // Default: Sep 2026

  const calendarMonthParam = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`;

  // Fetch real analytics from MongoDB via RTK Query
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAdminAnalyticsQuery({
    range,
    calendarMonth: calendarMonthParam,
  });

  const analytics = data?.data || {};

  const rawKpis = (analytics.kpis && typeof analytics.kpis === 'object')
    ? (analytics.kpis as Record<string, unknown>)
    : {};

  const kpis: AnalyticsKpis = {
    totalTemples: typeof rawKpis.totalTemples === 'number' ? rawKpis.totalTemples : 0,
    activeTemples: typeof rawKpis.activeTemples === 'number' ? rawKpis.activeTemples : 0,
    pendingRegistrations: typeof rawKpis.pendingRegistrations === 'number' ? rawKpis.pendingRegistrations : 0,
    totalDevotees: typeof rawKpis.totalDevotees === 'number' ? rawKpis.totalDevotees : 0,
    totalAuthorities: typeof rawKpis.totalAuthorities === 'number' ? rawKpis.totalAuthorities : 0,
    totalBookings: typeof rawKpis.totalBookings === 'number' ? rawKpis.totalBookings : 0,
    allTimeBookings: typeof rawKpis.allTimeBookings === 'number' ? rawKpis.allTimeBookings : 0,
    confirmedBookings: typeof rawKpis.confirmedBookings === 'number' ? rawKpis.confirmedBookings : 0,
    cancelledBookings: typeof rawKpis.cancelledBookings === 'number' ? rawKpis.cancelledBookings : 0,
    settledRevenue: typeof rawKpis.settledRevenue === 'number' ? rawKpis.settledRevenue : 0,
    allTimeRevenue: typeof rawKpis.allTimeRevenue === 'number' ? rawKpis.allTimeRevenue : 0,
    successfulTransactions: typeof rawKpis.successfulTransactions === 'number' ? rawKpis.successfulTransactions : 0,
    bookingChange: typeof rawKpis.bookingChange === 'number' ? rawKpis.bookingChange : null,
    revenueChange: typeof rawKpis.revenueChange === 'number' ? rawKpis.revenueChange : null,
    devoteeChange: typeof rawKpis.devoteeChange === 'number' ? rawKpis.devoteeChange : null,
  };

  const bookingFlow = (analytics.bookingFlow && typeof analytics.bookingFlow === 'object'
    ? analytics.bookingFlow
    : {}) as BookingFlowData;

  const activityCalendar = (analytics.activityCalendar && typeof analytics.activityCalendar === 'object'
    ? analytics.activityCalendar
    : {}) as BookingActivityCalendarData;

  const popularityTrend = (analytics.popularityTrend && typeof analytics.popularityTrend === 'object'
    ? analytics.popularityTrend
    : {}) as TemplePopularityData;

  const categoryDistribution = (Array.isArray(analytics.categoryDistribution)
    ? analytics.categoryDistribution
    : []) as DonutDistributionDataItem[];

  const revenueByTemple = (Array.isArray(analytics.revenueByTemple)
    ? analytics.revenueByTemple
    : []) as RevenueContributionItem[];

  const popularServices = (Array.isArray(analytics.popularServices)
    ? analytics.popularServices
    : []) as RankingBarChartItem[];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========================================================
          PAGE HEADER
          INSIGHTS eyebrow, "Analytics" heading, subtitle,
          and compact date filter dropdown (NO decorative images)
          ======================================================== */}
      <div className="rounded-2xl bg-white border border-[#E8E2D9] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-spiritual-primary font-bold text-[11px] tracking-wider uppercase mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>INSIGHTS</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-serif font-bold text-spiritual-text tracking-tight">
            Analytics
          </h1>
          <p className="text-xs text-spiritual-muted mt-0.5 max-w-2xl">
            In-depth insights into temple services, bookings, revenue and platform usage.
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
            onClick={() => void refetch()}
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
            <span>Failed to load platform analytics: {extractErrorMessage(error)}</span>
          </div>
          <button
            onClick={() => void refetch()}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg font-semibold hover:bg-rose-50 text-rose-700 cursor-pointer shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================
          KPI ROW (FOUR EQUAL CARDS)
          1. Total Temples
          2. Registered Devotees
          3. Total Reservations
          4. Settled Revenue
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Temples */}
        <AnalyticsKpiCard
          title="Total Temples"
          value={kpis.totalTemples}
          icon={Building2}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          iconBorder="border-amber-200"
          change={null}
          subtext={`${kpis.activeTemples || 0} active • ${Math.max(0, (kpis.totalTemples || 0) - (kpis.activeTemples || 0))} inactive`}
          isLoading={isLoading}
        />

        {/* 2. Registered Devotees */}
        <AnalyticsKpiCard
          title="Registered Devotees"
          value={kpis.totalDevotees}
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          iconBorder="border-emerald-200"
          change={kpis.devoteeChange}
          subtext={kpis.devoteeChange ? 'from previous period' : 'Active devotee accounts'}
          isLoading={isLoading}
        />

        {/* 3. Total Reservations */}
        <AnalyticsKpiCard
          title="Total Reservations"
          value={kpis.totalBookings}
          icon={CalendarCheck}
          iconBg="bg-rose-50"
          iconColor="text-rose-700"
          iconBorder="border-rose-200"
          change={kpis.bookingChange}
          subtext={`${kpis.confirmedBookings || 0} confirmed in period`}
          isLoading={isLoading}
        />

        {/* 4. Settled Revenue */}
        <AnalyticsKpiCard
          title="Settled Revenue"
          value={`₹${(kpis.settledRevenue || 0).toLocaleString('en-IN')}`}
          icon={CreditCard}
          iconBg="bg-purple-50"
          iconColor="text-purple-700"
          iconBorder="border-purple-200"
          change={kpis.revenueChange}
          subtext={`${kpis.successfulTransactions || 0} paid transactions`}
          isLoading={isLoading}
        />
      </div>

      {/* ========================================================
          ROW 1 — FULL WIDTH: BOOKING FLOW ACROSS TEMPLE SERVICES
          Spacious, responsive flow diagram without internal scrollbar
          ======================================================== */}
      <AnalyticsCard
        title="Booking Flow Across Temple Services"
        description="Flow of bookings from temples to services and current status."
        icon={GitFork}
        iconBg="bg-[#FFF8EE]"
        iconBorder="border-[#FDE68A]"
        iconColor="text-[#E2871A]"
        isLoading={isLoading}
        chartHeight={390}
        /* actions={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E2D9] text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#FAF7F2] transition-colors select-none"
          >
            <span>
              {range === '7d'
                ? 'Last 7 Days'
                : range === '90d'
                ? 'Last 90 Days'
                : range === '1y'
                ? 'This Year'
                : 'Last 30 Days'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-spiritual-primary" />
          </button>
        } */
      >
        <BookingFlowChart
          data={bookingFlow}
          height={390}
          emptyMessage="No booking flow data available for this period."
        />
      </AnalyticsCard>

      {/* ========================================================
          ROW 2 — TWO EQUAL-WIDTH COLUMNS (50% / 50%)
          Left: Booking Activity Calendar (Analytics Heatmap)
          Right: Temple Category Distribution (Donut Chart)
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
                  className="p-0.5 hover:bg-amber-50 rounded transition-colors text-spiritual-primary cursor-pointer"
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
                  className="p-0.5 hover:bg-amber-50 rounded transition-colors text-spiritual-primary cursor-pointer"
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
              emptyMessage="No booking activity recorded for this period."
            />
          </AnalyticsCard>
        </div>

        {/* Right: Temple Category Distribution */}
        <div className="flex flex-col h-full">
          <AnalyticsCard
            title="Temple Category Distribution"
            description="Distribution of bookings across dynamic temple categories."
            icon={PieChart}
            iconBg="bg-[#FFF8EE]"
            iconBorder="border-[#FDE68A]"
            iconColor="text-[#E2871A]"
            isLoading={isLoading}
            chartHeight={310}
            skeletonType="donut"
            className="h-full"
            actions={
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E2D9] text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#FAF7F2] transition-colors select-none"
              >
                <span>By Bookings</span>
                <ChevronDown className="w-3.5 h-3.5 text-spiritual-primary" />
              </button>
            }
          >
            <DonutDistributionChart
              data={categoryDistribution}
              labelKey="label"
              valueKey="value"
              size={206}
              outerRadius={96}
              innerRadius={52}
              centerLabel="Total Bookings"
              emptyMessage="No category assignments found in the database."
            />
          </AnalyticsCard>
        </div>
      </div>

      {/* ========================================================
          ROW 3 — TWO EQUAL-WIDTH COLUMNS (50% / 50%)
          Left: Revenue Contribution by Temple (Treemap Blocks)
          Right: Top Temple Services (Horizontal Ranking List)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Revenue Contribution by Temple */}
        <div className="flex flex-col h-full">
          <AnalyticsCard
            title="Revenue Contribution by Temple"
            description="Share of revenue generated by each temple."
            icon={CreditCard}
            iconBg="bg-[#FFF8EE]"
            iconBorder="border-[#FDE68A]"
            iconColor="text-[#E2871A]"
            isLoading={isLoading}
            chartHeight={260}
            className="h-full"
            actions={
              <span className="text-[11px] font-semibold text-spiritual-muted px-2.5 py-1 rounded-lg bg-[#FAF5EE] border border-[#EAE0D0]">
                By Revenue
              </span>
            }
          >
            <RevenueContributionChart
              data={revenueByTemple}
              height={220}
              emptyMessage="No settled revenue recorded across temples for this period."
            />
          </AnalyticsCard>
        </div>

        {/* Right: Top Temple Services */}
        <div className="flex flex-col h-full">
          <AnalyticsCard
            title="Top Temple Services"
            description="Most booked services across all temples."
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

      {/* ========================================================
          ROW 4 — FULL WIDTH: TEMPLE POPULARITY TREND
          Full-width bump/rank trend line visualization
          ======================================================== */}
      <AnalyticsCard
        title="Temple Popularity Trend"
        description="Ranking of top temples based on confirmed bookings over time."
        icon={TrendingUp}
        iconBg="bg-[#FFF8EE]"
        iconBorder="border-[#FDE68A]"
        iconColor="text-[#E2871A]"
        isLoading={isLoading}
        chartHeight={220}
        /* actions={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E2D9] text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#FAF7F2] transition-colors select-none"
          >
            <span>
              {range === '7d'
                ? 'Last 7 Days'
                : range === '90d'
                ? 'Last 90 Days'
                : range === '1y'
                ? 'This Year'
                : 'Last 30 Days'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-spiritual-primary" />
          </button>
        } */
      >
        <TemplePopularityChart
          data={popularityTrend}
          height={220}
          emptyMessage="No historical ranking data recorded for this period."
        />
      </AnalyticsCard>
    </div>
  );
};

export default AdminAnalytics;
