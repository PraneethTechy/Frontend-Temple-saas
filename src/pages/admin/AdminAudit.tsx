import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  Shield,
  X,
  FileCode,
} from 'lucide-react';
import { useGetAdminAuditLogsQuery } from '../../store/api/adminApi.js';
import {
  InternalPageHeader,
  InternalFilterToolbar,
  InternalDataTable,
} from '../../components/admin/common/index.js';
import type { DataTableColumn } from '../../components/admin/common/InternalDataTable.js';

interface ActorSummary {
  _id?: string;
  name?: string;
  email?: string;
}

export interface AdminAuditLogItem extends Record<string, unknown> {
  _id: string;
  actorId?: ActorSummary | string | null;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

interface AdminAuditOutletContext {
  onOpenMobileSidebar?: () => void;
}

// Human-friendly mapping for technical action codes
const ACTION_FORMATS: Record<string, { label: string; color: string }> = {
  TEMPLE_APPROVED: { label: 'Temple Approved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  TEMPLE_REJECTED: { label: 'Temple Rejected', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  TEMPLE_STATUS_UPDATED: { label: 'Status Updated', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  TEMPLE_REGISTRATION_SUBMITTED: { label: 'Registration Submitted', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  DEVOTEE_STATUS_UPDATED: { label: 'Devotee Updated', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  CATEGORY_TEMPLE_ASSIGNED: { label: 'Category Assignment', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  CATEGORY_TEMPLE_REMOVED: { label: 'Category Removed', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  CATEGORY_CREATED: { label: 'Category Created', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  CATEGORY_UPDATED: { label: 'Category Updated', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  CATEGORY_STATUS_TOGGLED: { label: 'Category Status', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  REVIEW_APPROVED: { label: 'Review Approved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  REVIEW_REJECTED: { label: 'Review Rejected', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  RECOMMENDATION_CREATED: { label: 'Recommended', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  RECOMMENDATION_STATUS_UPDATED: { label: 'Recommendation Status', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  AUTHORITY_CREATED: { label: 'Authority Created', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  AUTHORITY_CREDENTIALS_RESENT: { label: 'Credentials Resent', color: 'bg-blue-50 text-blue-800 border-blue-200' },
};

const toHumanTitle = (text = ''): string => {
  return text
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const extractErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'data' in err) {
    const errorData = (err as { data?: { message?: string } }).data;
    if (errorData?.message) return errorData.message;
  }
  return 'Server error';
};

export const AdminAudit: React.FC = () => {
  const { onOpenMobileSidebar } = (useOutletContext<AdminAuditOutletContext>() || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogItem | null>(null);
  const limit = 15;

  const { data, isLoading, isError, error, refetch } = useGetAdminAuditLogsQuery({
    page,
    limit,
    search: searchTerm,
    action: actionFilter,
    entityType: entityFilter,
  });

  const rawLogs = data?.data?.logs || [];
  const logs: AdminAuditLogItem[] = rawLogs.map((item) => {
    const raw = item as unknown as Record<string, unknown>;
    return {
      _id: String(raw._id || ''),
      actorId: raw.actorId as ActorSummary | string | null | undefined,
      actorRole: String(raw.actorRole || 'ADMIN'),
      action: String(raw.action || ''),
      entityType: String(raw.entityType || ''),
      entityId: raw.entityId ? String(raw.entityId) : undefined,
      description: String(raw.description || ''),
      metadata: (raw.metadata && typeof raw.metadata === 'object') ? (raw.metadata as Record<string, unknown>) : null,
      createdAt: String(raw.createdAt || new Date().toISOString()),
    };
  });

  const pagination = data?.data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  const getActionBadge = (action = ''): React.ReactElement => {
    const config = ACTION_FORMATS[action] || {
      label: toHumanTitle(action),
      color: 'bg-spiritual-surface text-spiritual-text border-spiritual-border',
    };

    return (
      <span
        className={`px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide border whitespace-nowrap inline-flex items-center ${config.color}`}
        title={`Action: ${action}`}
      >
        <span>{config.label}</span>
      </span>
    );
  };

  const getEntityBadge = (entityType = ''): React.ReactElement => {
    const label = toHumanTitle(entityType);
    return (
      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-spiritual-surface border border-spiritual-border text-spiritual-muted">
        {label || 'System'}
      </span>
    );
  };

  // Structured columns: Time, Actor, Action, Entity, Description (NO eye icon button)
  const columns: DataTableColumn<AdminAuditLogItem>[] = [
    {
      header: 'TIMESTAMP',
      key: 'createdAt',
      width: 'w-44',
      render: (log) => (
        <div className="flex items-center gap-1.5 text-spiritual-muted font-mono text-[11px] whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-spiritual-subtle shrink-0" />
          <span>
            {new Date(log.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'ACTOR',
      key: 'actorId',
      width: 'w-44',
      render: (log) => {
        const actorName =
          log.actorId && typeof log.actorId === 'object' && 'name' in log.actorId && log.actorId.name
            ? log.actorId.name
            : 'Super Admin';

        return (
          <div>
            <div className="font-semibold text-spiritual-text text-xs truncate max-w-[160px]">
              {actorName}
            </div>
            <div className="text-[10px] font-mono text-spiritual-muted tracking-wider uppercase mt-0.5">
              {toHumanTitle(log.actorRole || 'ADMIN')}
            </div>
          </div>
        );
      },
    },
    {
      header: 'ACTION',
      key: 'action',
      width: 'w-44',
      render: (log) => getActionBadge(log.action),
    },
    {
      header: 'ENTITY',
      key: 'entityType',
      width: 'w-32',
      render: (log) => getEntityBadge(log.entityType),
    },
    {
      header: 'DESCRIPTION',
      key: 'description',
      render: (log) => {
        const hasMetadata = Boolean(log.metadata && Object.keys(log.metadata).length > 0);
        return (
          <div
            onClick={() => {
              if (hasMetadata) {
                setSelectedLog(log);
              }
            }}
            className={`text-xs text-spiritual-text max-w-xl leading-relaxed ${
              hasMetadata ? 'cursor-pointer hover:text-spiritual-primary' : ''
            }`}
            title={hasMetadata ? 'Click to view associated metadata' : undefined}
          >
            {log.description}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <InternalPageHeader
        eyebrow="SECURITY & ACTIVITY"
        title="Audit & Platform Activity"
        description="Immutable governance trail of administrative approvals, rejections, category mutations, and operations."
        onOpenMobileSidebar={onOpenMobileSidebar}
      />

      {/* Filter and Search Bar */}
      <InternalFilterToolbar
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchPlaceholder="Search audit description, actor, or code..."
        extraFilters={
          <>
            {/* Action Type filter */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-xs bg-white border border-spiritual-border rounded-xl text-spiritual-text focus:outline-hidden focus:border-spiritual-primary cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="TEMPLE_APPROVED">Temple Approved</option>
              <option value="TEMPLE_REJECTED">Temple Rejected</option>
              <option value="TEMPLE_STATUS_UPDATED">Temple Status Updated</option>
              <option value="CATEGORY_TEMPLE_ASSIGNED">Category Assignment</option>
              <option value="CATEGORY_CREATED">Category Created</option>
              <option value="CATEGORY_UPDATED">Category Updated</option>
              <option value="REVIEW_APPROVED">Review Approved</option>
              <option value="REVIEW_REJECTED">Review Rejected</option>
              <option value="DEVOTEE_STATUS_UPDATED">Devotee Updated</option>
            </select>

            {/* Entity Type filter */}
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-xs bg-white border border-spiritual-border rounded-xl text-spiritual-text focus:outline-hidden focus:border-spiritual-primary cursor-pointer"
            >
              <option value="ALL">All Entities</option>
              <option value="TEMPLE">Temple</option>
              <option value="TEMPLE_REGISTRATION">Temple Registration</option>
              <option value="CATEGORY">Category</option>
              <option value="USER">User</option>
              <option value="DEVOTEE">Devotee</option>
              <option value="AUTHORITY">Authority</option>
              <option value="REVIEW">Review</option>
              <option value="BOOKING">Booking</option>
              <option value="PAYMENT">Payment</option>
            </select>
          </>
        }
      />

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load audit logs: {extractErrorMessage(error)}</span>
          </div>
          <button
            onClick={() => void refetch()}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg font-semibold hover:bg-rose-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Audit Log Table (Clean, no eye button, row contains readable information) */}
      <InternalDataTable<AdminAuditLogItem>
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyState={{
          title: 'No audit records match your filters',
          description: 'Try adjusting the search keyword, action filter, or entity type selection.',
        }}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
        }}
        onPageChange={(p: number) => setPage(p)}
      />

      {/* Optional Metadata Modal (Opens only if description with metadata is clicked) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-spiritual-border shadow-spiritual-lg overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-spiritual-border flex items-center justify-between bg-spiritual-surface/50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-spiritual-primary" />
                <h3 className="font-serif font-bold text-sm text-spiritual-text">
                  Audit Metadata Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-spiritual-surface/40 rounded-xl border border-spiritual-border/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-spiritual-muted block">
                    Timestamp
                  </span>
                  <span className="font-mono text-spiritual-text mt-0.5 block">
                    {new Date(selectedLog.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-spiritual-muted block">
                    Action Code
                  </span>
                  <span className="font-mono font-semibold text-spiritual-accent mt-0.5 block">
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-spiritual-muted block">
                    Actor
                  </span>
                  <span className="font-medium text-spiritual-text mt-0.5 block">
                    {selectedLog.actorId && typeof selectedLog.actorId === 'object' && 'name' in selectedLog.actorId && selectedLog.actorId.name
                      ? selectedLog.actorId.name
                      : 'Administrator'}{' '}
                    ({selectedLog.actorRole})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-spiritual-muted block">
                    Target Entity
                  </span>
                  <span className="font-mono text-spiritual-text mt-0.5 block">
                    {selectedLog.entityType} ({String(selectedLog.entityId || 'N/A')})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-spiritual-muted block mb-1">
                  Description
                </span>
                <p className="p-3 bg-spiritual-surface/30 rounded-xl border border-spiritual-border/60 text-spiritual-text leading-relaxed">
                  {selectedLog.description}
                </p>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-spiritual-muted mb-1 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-spiritual-muted" />
                    <span>Associated Metadata</span>
                  </span>
                  <pre className="p-3 bg-spiritual-text text-gray-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-spiritual-border">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-spiritual-border bg-spiritual-surface/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-spiritual-text bg-white border border-spiritual-border hover:bg-spiritual-surface transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudit;
