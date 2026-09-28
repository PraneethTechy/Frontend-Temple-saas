import React, { useState, type ReactElement } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ShieldCheck,
  Power,
  Building2,
  AlertCircle,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';
import { useGetAuthoritiesQuery, useUpdateUserStatusMutation } from '../../store/api/adminApi.js';
import { ROUTES } from '../../constants/routes.js';
import {
  InternalPageHeader,
  InternalFilterToolbar,
  InternalDataTable,
  InternalStatusBadge,
  InternalActionMenu,
} from '../../components/admin/common/index.js';
import type { DataTableColumn } from '../../components/admin/common/InternalDataTable';
import type { FilterStatusOption } from '../../components/admin/common/InternalFilterToolbar';
import type { PaginationMeta } from '@shared/types/index.js';

export interface PopulatedTempleSummary {
  _id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface AdminAuthorityItem extends Record<string, unknown> {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  templeId?: PopulatedTempleSummary | string | null;
  isActive: boolean;
  createdAt: string;
  [key: string]: unknown;
}

interface AdminOutletContext {
  onOpenMobileSidebar?: () => void;
}

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
}

export const AdminAuthorities = (): ReactElement => {
  const { onOpenMobileSidebar } = useOutletContext<AdminOutletContext>() || {};
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useGetAuthoritiesQuery({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
  });

  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();
  const [feedback, setFeedback] = useState<string>('');

  const authorities: AdminAuthorityItem[] = (data?.data?.authorities as unknown as AdminAuthorityItem[]) || [];
  const pagination: PaginationMeta = data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const apiError = error as ApiErrorResponse | undefined;

  const handleToggleStatus = async (auth: AdminAuthorityItem): Promise<void> => {
    setFeedback('');
    try {
      await updateUserStatus({ id: auth._id, isActive: !auth.isActive }).unwrap();
      setFeedback(`Account status for ${auth.name} updated to ${!auth.isActive ? 'Active' : 'Deactivated'}.`);
      refetch();
    } catch (err: unknown) {
      const updateError = err as ApiErrorResponse;
      setFeedback(updateError?.data?.message || 'Failed to update user status.');
    }
  };

  const statusOptions: FilterStatusOption[] = [
    { label: 'All Authorities', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  const columns: DataTableColumn<AdminAuthorityItem>[] = [
    {
      header: 'AUTHORITY',
      key: 'name',
      render: (auth: AdminAuthorityItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-spiritual-surface border border-spiritual-border flex items-center justify-center font-bold text-spiritual-text text-xs shrink-0">
            {auth.name ? auth.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-spiritual-text text-xs block truncate max-w-[180px]">
              {auth.name}
            </span>
            {auth.phone && (
              <span className="text-[11px] text-spiritual-muted font-mono flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-spiritual-subtle shrink-0" />
                <span>{auth.phone}</span>
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'ASSIGNED TEMPLE',
      key: 'templeId',
      render: (auth: AdminAuthorityItem) => {
        if (auth.templeId) {
          const templeObj = typeof auth.templeId === 'object' ? auth.templeId : null;
          const templeIdStr = templeObj?._id || (typeof auth.templeId === 'string' ? auth.templeId : '');
          const templeNameStr = templeObj?.name || 'View Temple';

          return (
            <Link
              to={`${ROUTES.ADMIN}/temples/${templeIdStr}`}
              className="inline-flex items-center gap-1.5 text-xs text-spiritual-primary hover:underline font-medium"
            >
              <Building2 className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
              <span className="truncate max-w-[200px]">
                {templeNameStr}
              </span>
            </Link>
          );
        }
        return <span className="text-[11px] text-spiritual-muted italic">Unassigned</span>;
      },
    },
    {
      header: 'EMAIL ADDRESS',
      key: 'email',
      render: (auth: AdminAuthorityItem) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted font-mono text-[11px]">
          <Mail className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span className="truncate max-w-[180px]">{auth.email}</span>
        </div>
      ),
    },
    {
      header: 'STATUS',
      key: 'isActive',
      render: (auth: AdminAuthorityItem) => (
        <InternalStatusBadge status={auth.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      header: 'JOINED',
      key: 'createdAt',
      render: (auth: AdminAuthorityItem) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span>
            {new Date(auth.createdAt).toLocaleDateString('en-IN', {
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
      render: (auth: AdminAuthorityItem) => (
        <InternalActionMenu
          align="right"
          items={[
            {
              label: auth.isActive ? 'Deactivate Account' : 'Activate Account',
              icon: Power,
              danger: auth.isActive,
              disabled: isUpdating,
              onClick: () => handleToggleStatus(auth),
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
        title="Temple Authorities"
        description="Authorized personnel overseeing temple services, verified operations, and darshan schedules."
        onOpenMobileSidebar={onOpenMobileSidebar}
      />

      {feedback && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="font-semibold text-amber-950 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <InternalFilterToolbar
        statusFilter={statusFilter}
        onStatusChange={(val: string) => {
          setStatusFilter(val);
          setPage(1);
        }}
        statusOptions={statusOptions}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={() => setPage(1)}
        searchPlaceholder="Search authority name, email, phone..."
      />

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load authorities: {apiError?.data?.message || 'Server error'}</span>
          </div>
          <button
            type="button"
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
        data={authorities}
        isLoading={isLoading}
        emptyState={{
          icon: ShieldCheck,
          title: 'No temple authorities found',
          description:
            statusFilter !== 'ALL'
              ? `No authorities with status "${statusFilter}".`
              : 'Registered authorities will appear here upon temple trust onboarding.',
        }}
        pagination={pagination}
        onPageChange={(p: number) => setPage(p)}
      />
    </div>
  );
};

export default AdminAuthorities;
