import React, { useState, type ReactElement, type FormEvent } from 'react';
import { useSelector } from 'react-redux';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Power,
  AlertCircle,
} from 'lucide-react';
import { useGetUsersQuery, useUpdateUserStatusMutation } from '../../store/api/adminApi.js';
import type { PaginationMeta } from '@shared/types/index.js';

export interface AdminUserRecord {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  [key: string]: unknown;
}

interface AuthStateUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface RootState {
  auth?: {
    user?: AuthStateUser | null;
  };
}

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
}

export const AdminUsers = (): ReactElement => {
  const currentLoggedInAdmin = useSelector((state: RootState) => state.auth?.user);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useGetUsersQuery({
    page,
    limit,
    search: searchTerm,
    role: roleFilter,
    status: statusFilter,
  });

  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();
  const [feedback, setFeedback] = useState<string>('');

  const users: AdminUserRecord[] = (data?.data?.users as unknown as AdminUserRecord[]) || [];
  const pagination: PaginationMeta = data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const apiError = error as ApiErrorResponse | undefined;

  const handleToggleStatus = async (user: AdminUserRecord): Promise<void> => {
    // Client-side self-deactivation guard
    if (currentLoggedInAdmin?._id === user._id && user.isActive) {
      setFeedback('Security policy prevents administrators from deactivating their own account.');
      return;
    }

    setFeedback('');
    try {
      await updateUserStatus({ id: user._id, isActive: !user.isActive }).unwrap();
      setFeedback(`User ${user.name} has been ${!user.isActive ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err: unknown) {
      const updateError = err as ApiErrorResponse;
      setFeedback(updateError?.data?.message || 'Failed to update user status.');
    }
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setPage(1);
  };

  const getRoleBadge = (role: string): ReactElement => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Platform Admin
          </span>
        );
      case 'TEMPLE_AUTHORITY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            Temple Authority
          </span>
        );
      case 'DEVOTEE':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Devotee
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-spiritual-text">Platform Users</h1>
        <p className="text-xs text-spiritual-muted mt-1">
          Comprehensive user registry across Devotees, Administrators, and Temple Authorities.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-spiritual-border p-4 sm:p-5 shadow-spiritual-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'DEVOTEE', 'TEMPLE_AUTHORITY', 'ADMIN'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setRoleFilter(role);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  roleFilter === role
                    ? 'bg-spiritual-primary text-white shadow-spiritual-xs'
                    : 'bg-spiritual-surface text-spiritual-muted hover:text-spiritual-text'
                }`}
              >
                {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-spiritual-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spiritual-primary/20 focus:border-spiritual-primary"
            />
          </form>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Failed to load users: {apiError?.data?.message || 'Server error'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-2.5 py-1 bg-white border border-rose-300 rounded font-semibold hover:bg-rose-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-spiritual-border shadow-spiritual-xs overflow-hidden w-full min-w-0 max-w-full flex flex-col">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-12 bg-spiritual-surface animate-pulse rounded-lg" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-spiritual-subtle mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-spiritual-text mb-1">
              {roleFilter === 'DEVOTEE' ? 'No devotees found.' : 'No users found.'}
            </h3>
            <p className="text-xs text-spiritual-muted max-w-sm mx-auto">
              {roleFilter === 'DEVOTEE'
                ? 'No devotees found in the platform database.'
                : roleFilter !== 'ALL'
                ? `No registered accounts matching role "${roleFilter}".`
                : 'No users found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full min-w-0 table-scrollbar">
              <table className="w-full min-w-[850px] text-left text-xs border-collapse">
                <thead className="bg-spiritual-surface/60 text-spiritual-muted uppercase text-[10px] tracking-wider border-b border-spiritual-border">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold whitespace-nowrap">User</th>
                    <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Contact</th>
                    <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Role</th>
                    <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Status</th>
                    <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Registered</th>
                    <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Last Login</th>
                    <th className="px-6 py-3.5 font-semibold whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-spiritual-border text-spiritual-text">
                  {users.map((u) => {
                    const isSelf = currentLoggedInAdmin?._id === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-spiritual-surface/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-spiritual-text">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-spiritual-surface border border-spiritual-border flex items-center justify-center font-bold text-xs text-spiritual-accent">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-spiritual-accentLight text-spiritual-accent font-normal">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-spiritual-text">{u.email}</div>
                          <div className="text-[11px] text-spiritual-muted">{u.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(u.role)}
                        </td>
                        <td className="px-6 py-4">
                          {u.isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-spiritual-muted font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-spiritual-muted font-mono text-[11px]">
                          {u.lastLoginAt
                            ? new Date(u.lastLoginAt).toLocaleDateString('en-IN')
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isUpdating || (isSelf && u.isActive)}
                            title={
                              isSelf && u.isActive
                                ? 'You cannot deactivate your own account'
                                : u.isActive
                                ? 'Deactivate Account'
                                : 'Activate Account'
                            }
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isSelf && u.isActive
                                ? 'text-gray-300 cursor-not-allowed'
                                : u.isActive
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-spiritual-border flex items-center justify-between text-xs text-spiritual-muted">
              <span>
                Showing <strong className="text-spiritual-text">{users.length}</strong> of{' '}
                <strong className="text-spiritual-text">{pagination.total}</strong> accounts
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded border border-spiritual-border bg-white text-spiritual-text disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium px-2 text-spiritual-text">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-1.5 rounded border border-spiritual-border bg-white text-spiritual-text disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
