import React, { type ReactElement } from 'react';

export interface InternalStatusBadgeProps {
  status?: string | null;
  className?: string;
}

interface StatusConfig {
  label: string;
  dot: string;
  bg: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  ACTIVE: {
    label: 'Active',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  APPROVED: {
    label: 'Approved',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  PAID: {
    label: 'Paid',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  CONFIRMED: {
    label: 'Confirmed',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  PENDING: {
    label: 'Pending',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
  },
  INACTIVE: {
    label: 'Inactive',
    dot: 'bg-gray-400',
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  REJECTED: {
    label: 'Rejected',
    dot: 'bg-rose-500',
    bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
  },
  CANCELLED: {
    label: 'Cancelled',
    dot: 'bg-rose-500',
    bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
  },
  FAILED: {
    label: 'Failed',
    dot: 'bg-rose-500',
    bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
  },
  REFUNDED: {
    label: 'Refunded',
    dot: 'bg-purple-500',
    bg: 'bg-purple-50 text-purple-800 border-purple-200/80',
  },
};

export const InternalStatusBadge = ({
  status,
  className = '',
}: InternalStatusBadgeProps): ReactElement => {
  const normalized = (status || '').toUpperCase().trim();
  const config = STATUS_CONFIGS[normalized] || {
    label: status || 'Unknown',
    dot: 'bg-gray-400',
    bg: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide whitespace-nowrap shadow-2xs ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
};

export default InternalStatusBadge;
