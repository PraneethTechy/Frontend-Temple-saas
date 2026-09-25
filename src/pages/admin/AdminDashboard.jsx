import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Building2,
  Clock,
  Users,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Menu,
} from 'lucide-react';
import { useGetAdminDashboardQuery } from '../../store/api/adminApi.js';
import { ROUTES } from '../../constants/routes.js';
import {
  InternalDataTable,
  InternalStatusBadge,
  StatCard,
  TempleBookingNetwork,
} from '../../components/admin/common/index.js';
import templeSkyline from '../../assets/footer_temple_skyline.png';

export const AdminDashboard = () => {
  const { onOpenMobileSidebar } = useOutletContext() || {};

  // Main dashboard KPIs and registrations
  const { data, isLoading, isError, error, refetch } = useGetAdminDashboardQuery();

  const dashboardData = data?.data || {};
  const kpis = dashboardData.kpis || {
    totalTemples: 0,
    activeTemples: 0,
    pendingRegistrations: 0,
    totalDevotees: 0,
    totalAuthorities: 0,
  };

  const recentRegistrations = dashboardData.recentRegistrations || [];

  // Table Columns for Recent Registrations
  const registrationColumns = [
    {
      header: 'TEMPLE',
      key: 'templeName',
      render: (reg) => (
        <span className="font-semibold text-spiritual-text text-xs block">
          {reg.templeName}
        </span>
      ),
    },
    {
      header: 'APPLICANT',
      key: 'applicantName',
      render: (reg) => (
        <span className="text-xs text-spiritual-muted">
          {reg.applicantName || 'Temple Administrator'}
        </span>
      ),
    },
    {
      header: 'LOCATION',
      key: 'location',
      render: (reg) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted text-xs">
          <MapPin className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span>
            {reg.city}, {reg.state}
          </span>
        </div>
      ),
    },
    {
      header: 'SUBMITTED',
      key: 'createdAt',
      render: (reg) => (
        <span className="text-spiritual-muted font-mono text-[11px]">
          {new Date(reg.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (reg) => <InternalStatusBadge status={reg.status} />,
    },
    {
      header: 'ACTION',
      align: 'right',
      render: (reg) => (
        <Link
          to={`${ROUTES.ADMIN}/registrations/${reg._id}`}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-spiritual-primary bg-spiritual-surface hover:bg-spiritual-border/40 transition-colors border border-spiritual-border/80"
        >
          Review
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Subtle Blended Skyline Artwork */}
      <div className="relative rounded-2xl bg-white border border-spiritual-border p-5 sm:p-6 overflow-hidden shadow-spiritual-xs">
        {/* Soft, low-contrast, low-opacity temple skyline integrated into background */}
        <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none overflow-hidden opacity-10 flex items-center justify-end select-none">
          <img
            src={templeSkyline}
            alt=""
            className="h-full w-auto object-cover object-left grayscale contrast-125"
          />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onOpenMobileSidebar && (
                <button
                  type="button"
                  onClick={onOpenMobileSidebar}
                  className="lg:hidden p-1.5 rounded-lg text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface border border-spiritual-border"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text tracking-tight">
                Dashboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-spiritual-muted">
              Quick view of DevaSetu's reach, temple ecosystem and recent updates.
            </p>
          </div>
        </div>
      </div>

      {/* Error notification banner */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load platform metrics: {error?.data?.message || 'Database error'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 rounded-lg bg-white border border-rose-300 text-rose-800 font-semibold hover:bg-rose-100/50 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Compact Real API KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Temples"
          value={kpis.totalTemples}
          icon={Building2}
          link={`${ROUTES.ADMIN}/temples`}
          subtext={`${kpis.activeTemples || 0} active on platform`}
          badgeText="Active Directory"
          badgeColor="bg-emerald-50 text-emerald-800"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Registrations"
          value={kpis.pendingRegistrations}
          icon={Clock}
          link={`${ROUTES.ADMIN}/registrations?status=PENDING`}
          subtext="Awaiting trust verification"
          badgeText={kpis.pendingRegistrations > 0 ? 'Requires Action' : 'All Clear'}
          badgeColor={
            kpis.pendingRegistrations > 0
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-spiritual-surface text-spiritual-muted'
          }
          highlight={kpis.pendingRegistrations > 0}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Devotees"
          value={kpis.totalDevotees}
          icon={Users}
          link={`${ROUTES.ADMIN}/devotees`}
          subtext="Registered devotees"
          isLoading={isLoading}
        />
        <StatCard
          title="Temple Authorities"
          value={kpis.totalAuthorities}
          icon={ShieldCheck}
          link={`${ROUTES.ADMIN}/authorities`}
          subtext="Verified shrine operators"
          isLoading={isLoading}
        />
      </div>

      {/* MAIN VISUALIZATION: TEMPLE-WISE BOOKINGS NETWORK (FULL WIDTH) */}
      <div className="w-full">
        <TempleBookingNetwork />
      </div>

      {/* RECENT TEMPLE REGISTRATION REQUESTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-serif font-bold text-spiritual-text">
              Recent Temple Registration Requests
            </h2>
            <p className="text-xs text-spiritual-muted mt-0.5">
              Newly submitted temples awaiting administrative verification and authority dispatch.
            </p>
          </div>
          <Link
            to={`${ROUTES.ADMIN}/registrations`}
            className="text-xs text-spiritual-primary font-semibold hover:underline"
          >
            View All ({kpis.pendingRegistrations} pending) →
          </Link>
        </div>

        <InternalDataTable
          columns={registrationColumns}
          data={recentRegistrations}
          isLoading={isLoading}
          emptyState={{
            title: 'No registration requests pending',
            description:
              'New onboarding requests submitted via the public portal will appear here in real-time.',
          }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
