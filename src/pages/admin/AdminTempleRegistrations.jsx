import React, { useState } from 'react';
import { Link, useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Eye,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useGetTempleRegistrationsQuery } from '../../store/api/adminApi.js';
import { ROUTES } from '../../constants/routes.js';
import {
  InternalPageHeader,
  InternalFilterToolbar,
  InternalDataTable,
  InternalStatusBadge,
} from '../../components/admin/common/index.js';

export const AdminTempleRegistrations = () => {
  const { onOpenMobileSidebar } = useOutletContext() || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useGetTempleRegistrationsQuery({
    page,
    limit,
    status: activeStatus,
    search: searchTerm,
  });

  const registrations = data?.data?.registrations || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setPage(1);
    setSearchParams(status === 'ALL' ? {} : { status });
  };

  const statusOptions = [
    { label: 'All Submissions', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  const columns = [
    {
      header: 'TEMPLE NAME',
      key: 'templeName',
      render: (reg) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-spiritual-surface border border-spiritual-border flex items-center justify-center shrink-0 text-spiritual-muted">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-spiritual-text text-xs block">
              {reg.templeName}
            </span>
            <span className="text-[11px] text-spiritual-muted">
              Applicant: <strong className="font-medium text-spiritual-text">{reg.applicantName}</strong>
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'LOCATION',
      key: 'location',
      render: (reg) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted">
          <MapPin className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span>
            {reg.city}, {reg.state}
          </span>
        </div>
      ),
    },
    {
      header: 'SUBMITTED DATE',
      key: 'createdAt',
      render: (reg) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span>
            {new Date(reg.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-spiritual-primary bg-spiritual-surface hover:bg-spiritual-border/40 transition-colors border border-spiritual-border/80 shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review Submission</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <InternalPageHeader
        eyebrow="TEMPLE MANAGEMENT"
        title="Temple Registrations"
        description="Review onboarding requests from temple trusts, verify documentation, and approve authorized shrines."
        onOpenMobileSidebar={onOpenMobileSidebar}
      />

      {/* Filter and Search Bar */}
      <InternalFilterToolbar
        statusFilter={activeStatus}
        onStatusChange={handleStatusChange}
        statusOptions={statusOptions}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={() => setPage(1)}
        searchPlaceholder="Search temple, applicant, city..."
      />

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Unable to load registrations: {error?.data?.message || 'Server error'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 rounded-lg bg-white border border-rose-300 font-semibold hover:bg-rose-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Table */}
      <InternalDataTable
        columns={columns}
        data={registrations}
        isLoading={isLoading}
        emptyState={{
          icon: Building2,
          title: 'No temple registrations found',
          description:
            activeStatus !== 'ALL'
              ? `No registrations with status "${activeStatus}".`
              : 'New temple onboarding requests will appear here as trustees submit applications.',
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default AdminTempleRegistrations;
