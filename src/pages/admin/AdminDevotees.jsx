import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Power,
  AlertCircle,
  Ticket,
  Mail,
  Phone,
  Clock,
} from 'lucide-react';
import { useGetAdminDevoteesQuery, useUpdateDevoteeStatusMutation } from '../../store/api/adminApi.js';
import {
  InternalPageHeader,
  InternalFilterToolbar,
  InternalDataTable,
  InternalStatusBadge,
  InternalActionMenu,
} from '../../components/admin/common/index.js';

export const AdminDevotees = () => {
  const { onOpenMobileSidebar } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useGetAdminDevoteesQuery({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
  });

  const [updateDevoteeStatus, { isLoading: isUpdating }] = useUpdateDevoteeStatusMutation();
  const [feedback, setFeedback] = useState('');

  const devotees = data?.data?.devotees || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleToggleStatus = async (devotee) => {
    setFeedback('');
    try {
      await updateDevoteeStatus({ id: devotee._id, isActive: !devotee.isActive }).unwrap();
      setFeedback(`Devotee ${devotee.name} has been ${!devotee.isActive ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err) {
      setFeedback(err?.data?.message || 'Failed to update devotee status.');
    }
  };

  const columns = [
    {
      header: 'DEVOTEE',
      key: 'name',
      render: (devotee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-spiritual-surface border border-spiritual-border flex items-center justify-center font-bold text-spiritual-text text-xs shrink-0">
            {devotee.name ? devotee.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-spiritual-text text-xs block truncate max-w-[180px]">
              {devotee.name}
            </span>
            {devotee.phone && (
              <span className="text-[11px] text-spiritual-muted font-mono flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-spiritual-subtle shrink-0" />
                <span>{devotee.phone}</span>
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'EMAIL ADDRESS',
      key: 'email',
      render: (devotee) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted font-mono text-[11px]">
          <Mail className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span className="truncate max-w-[180px]">{devotee.email}</span>
        </div>
      ),
    },
    {
      header: 'BOOKINGS',
      key: 'bookingsCount',
      render: (devotee) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-spiritual-surface border border-spiritual-border text-xs font-semibold text-spiritual-text font-mono">
          <Ticket className="w-3 h-3 text-spiritual-muted" />
          <span>{devotee.bookingsCount || 0}</span>
        </span>
      ),
    },
    {
      header: 'STATUS',
      key: 'isActive',
      render: (devotee) => (
        <InternalStatusBadge status={devotee.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      header: 'JOINED',
      key: 'createdAt',
      render: (devotee) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span>
            {new Date(devotee.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'ACTIONS',
      align: 'right',
      render: (devotee) => (
        <InternalActionMenu
          align="right"
          items={[
            {
              label: devotee.isActive ? 'Deactivate Devotee' : 'Activate Devotee',
              icon: Power,
              danger: devotee.isActive,
              disabled: isUpdating,
              onClick: () => handleToggleStatus(devotee),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <InternalPageHeader
        eyebrow="TEMPLE MANAGEMENT"
        title="Devotees Directory"
        description="Monitor registered devotee accounts, booking history, and manage platform access."
        onOpenMobileSidebar={onOpenMobileSidebar}
      />

      {feedback && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-semibold text-amber-950 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <InternalFilterToolbar
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        statusOptions={[
          { label: 'All Devotees', value: 'ALL' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={() => setPage(1)}
        searchPlaceholder="Search devotee name, email, phone..."
      />

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load devotees: {error?.data?.message || 'Server error'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg font-semibold hover:bg-rose-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Table */}
      <InternalDataTable
        columns={columns}
        data={devotees}
        isLoading={isLoading}
        emptyState={{
          icon: Users,
          title: 'No devotees found',
          description:
            statusFilter !== 'ALL'
              ? `No devotees with status "${statusFilter}".`
              : 'Registered devotees will appear here as users sign up.',
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default AdminDevotees;
