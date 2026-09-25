import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarCheck,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
} from 'lucide-react';
import { useGetAdminBookingsQuery, useGetAdminTemplesQuery } from '../../store/api/adminApi.js';
import {
  InternalPageHeader,
  InternalFilterToolbar,
  InternalDataTable,
  InternalStatusBadge,
} from '../../components/admin/common/index.js';

export const AdminBookings = () => {
  const { onOpenMobileSidebar } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [templeFilter, setTempleFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: templesRes } = useGetAdminTemplesQuery({ limit: 50 });
  const templesList = templesRes?.data?.temples || [];

  const { data, isLoading, isError, error, refetch } = useGetAdminBookingsQuery({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
    paymentStatus: paymentFilter,
    templeId: templeFilter || undefined,
  });

  const bookings = data?.data?.bookings || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const columns = [
    {
      header: 'BOOKING REF',
      key: 'bookingReference',
      render: (booking) => (
        <div>
          <span className="font-mono font-bold text-spiritual-accent text-xs block">
            {booking.bookingReference || `#${booking._id?.slice(-8).toUpperCase()}`}
          </span>
          <span className="text-[10px] text-spiritual-muted font-mono">
            {new Date(booking.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'DEVOTEE',
      key: 'userId',
      render: (booking) => (
        <div>
          <div className="font-semibold text-spiritual-text text-xs truncate max-w-[150px]">
            {booking.userId?.name || 'Devotee'}
          </div>
          <div className="text-[11px] text-spiritual-muted font-mono truncate max-w-[150px]">
            {booking.userId?.phone || booking.userId?.email || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'TEMPLE',
      key: 'templeId',
      render: (booking) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted">
          <Building2 className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span className="truncate max-w-[170px] text-spiritual-text font-medium">
            {booking.templeId?.name || 'Temple'}
          </span>
        </div>
      ),
    },
    {
      header: 'SERVICE',
      key: 'serviceId',
      render: (booking) => (
        <div>
          <div className="font-medium text-spiritual-text text-xs truncate max-w-[150px]">
            {booking.serviceId?.name || 'Darshan Service'}
          </div>
          {booking.serviceId?.type && (
            <span className="text-[10px] text-spiritual-muted font-mono uppercase">
              {booking.serviceId.type}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'SLOT TIME',
      key: 'bookingDate',
      render: (booking) => (
        <div className="text-spiritual-muted text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-spiritual-subtle" />
            <span>{booking.bookingDate || 'N/A'}</span>
          </div>
          {booking.timeSlotId?.startTime && (
            <div className="flex items-center gap-1 mt-0.5 text-spiritual-subtle">
              <Clock className="w-3 h-3" />
              <span>
                {booking.timeSlotId.startTime} - {booking.timeSlotId.endTime}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'AMOUNT',
      key: 'totalAmount',
      render: (booking) => (
        <span className="font-semibold font-mono text-spiritual-text text-xs">
          ₹{(booking.totalAmount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'PAYMENT',
      key: 'paymentStatus',
      render: (booking) => (
        <InternalStatusBadge status={booking.paymentStatus || 'PENDING'} />
      ),
    },
    {
      header: 'STATUS',
      key: 'bookingStatus',
      render: (booking) => (
        <InternalStatusBadge status={booking.bookingStatus || 'PENDING'} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <InternalPageHeader
        eyebrow="OPERATIONS"
        title="Reservations & Bookings"
        description="Monitor devotee darshan, pooja, and seva booking activity across all onboarded temples."
        onOpenMobileSidebar={onOpenMobileSidebar}
      />

      {/* Filter and Search Bar */}
      <InternalFilterToolbar
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        statusOptions={[
          { label: 'All Bookings', value: 'ALL' },
          { label: 'Confirmed', value: 'CONFIRMED' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={() => setPage(1)}
        searchPlaceholder="Search reference, devotee, phone..."
        extraFilters={
          <div className="flex items-center gap-2">
            {/* Payment status filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-spiritual-border bg-spiritual-surface/50 text-spiritual-text focus:outline-none focus:ring-1 focus:ring-spiritual-primary"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Temple select */}
            {templesList.length > 0 && (
              <select
                value={templeFilter}
                onChange={(e) => {
                  setTempleFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-spiritual-border bg-spiritual-surface/50 text-spiritual-text focus:outline-none focus:ring-1 focus:ring-spiritual-primary max-w-[140px] truncate"
              >
                <option value="">All Temples</option>
                {templesList.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      />

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load bookings: {error?.data?.message || 'Server error'}</span>
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
        data={bookings}
        isLoading={isLoading}
        emptyState={{
          icon: CalendarCheck,
          title: 'No bookings found',
          description:
            statusFilter !== 'ALL'
              ? `No bookings match status "${statusFilter}".`
              : 'Devotee darshan and pooja reservations will be listed here.',
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default AdminBookings;
