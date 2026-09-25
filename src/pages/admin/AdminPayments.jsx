import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CreditCard,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { useGetAdminPaymentsQuery, useGetAdminTemplesQuery } from '../../store/api/adminApi.js';
import {
  InternalPageHeader,
  InternalFilterToolbar,
  InternalDataTable,
  InternalStatusBadge,
} from '../../components/admin/common/index.js';

export const AdminPayments = () => {
  const { onOpenMobileSidebar } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [templeFilter, setTempleFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: templesRes } = useGetAdminTemplesQuery({ limit: 50 });
  const templesList = templesRes?.data?.temples || [];

  const { data, isLoading, isError, error, refetch } = useGetAdminPaymentsQuery({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
    templeId: templeFilter || undefined,
  });

  const payments = data?.data?.payments || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const columns = [
    {
      header: 'PAYMENT REF',
      key: 'providerPaymentId',
      render: (payment) => (
        <div>
          <span className="font-mono font-bold text-spiritual-accent text-xs block truncate max-w-[180px]">
            {payment.providerPaymentId || `#${payment._id?.slice(-8).toUpperCase()}`}
          </span>
          {payment.providerOrderId && (
            <span className="text-[10px] text-spiritual-muted font-mono truncate max-w-[180px] block">
              Order: {payment.providerOrderId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'BOOKING REF',
      key: 'bookingId',
      render: (payment) => (
        <span className="font-mono text-xs text-spiritual-text font-medium">
          {payment.bookingId?.bookingReference || 'Direct / Platform'}
        </span>
      ),
    },
    {
      header: 'TEMPLE',
      key: 'templeId',
      render: (payment) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted">
          <Building2 className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span className="truncate max-w-[180px] text-spiritual-text font-medium">
            {payment.templeId?.name || payment.bookingId?.templeId?.name || 'Temple'}
          </span>
        </div>
      ),
    },
    {
      header: 'AMOUNT',
      key: 'amount',
      render: (payment) => (
        <span className="font-semibold font-mono text-spiritual-text text-xs">
          ₹{(payment.amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'GATEWAY',
      key: 'provider',
      render: (payment) => (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-spiritual-surface border border-spiritual-border text-spiritual-muted uppercase font-semibold">
          {payment.provider || 'ONLINE'}
        </span>
      ),
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (payment) => (
        <InternalStatusBadge status={payment.status || 'PENDING'} />
      ),
    },
    {
      header: 'SETTLED AT',
      key: 'createdAt',
      render: (payment) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted font-mono text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span>
            {new Date(payment.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <InternalPageHeader
        eyebrow="OPERATIONS"
        title="Payments & Financial Settlement"
        description="Audit gateway transaction records, payment reconciliation, and devotee payment statuses."
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
          { label: 'All Transactions', value: 'ALL' },
          { label: 'Paid', value: 'PAID' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Refunded', value: 'REFUNDED' },
          { label: 'Failed', value: 'FAILED' },
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={() => setPage(1)}
        searchPlaceholder="Search payment or order ID..."
        extraFilters={
          templesList.length > 0 && (
            <select
              value={templeFilter}
              onChange={(e) => {
                setTempleFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-spiritual-border bg-spiritual-surface/50 text-spiritual-text focus:outline-none focus:ring-1 focus:ring-spiritual-primary max-w-[150px] truncate"
            >
              <option value="">All Temples</option>
              {templesList.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          )
        }
      />

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load payments: {error?.data?.message || 'Server error'}</span>
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
        data={payments}
        isLoading={isLoading}
        emptyState={{
          icon: CreditCard,
          title: 'No payment records found',
          description:
            statusFilter !== 'ALL'
              ? `No transactions with status "${statusFilter}".`
              : 'Payment transaction logs will appear here upon devotee checkout.',
        }}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default AdminPayments;
