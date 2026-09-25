import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

/**
 * Reusable Chart Empty State
 */
export const ChartEmptyState = ({
  message = 'No data available for this period.',
  subtext = 'Metrics will appear automatically as new activity occurs.',
  height = 200,
  icon: Icon = Inbox,
}) => (
  <div
    style={{ height }}
    className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-spiritual-surface/20 border border-dashed border-spiritual-border/80 w-full"
  >
    <div className="w-10 h-10 rounded-full bg-spiritual-surface/60 border border-spiritual-border/60 flex items-center justify-center text-spiritual-muted mb-2.5">
      <Icon className="w-5 h-5 opacity-70" />
    </div>
    <p className="text-xs font-semibold text-spiritual-text max-w-xs">{message}</p>
    {subtext && <p className="text-[11px] text-spiritual-muted mt-1 max-w-xs">{subtext}</p>}
  </div>
);

/**
 * Reusable Chart Loading Skeleton
 */
export const ChartLoadingSkeleton = ({ height = 220, type = 'bar' }) => {
  return (
    <div
      style={{ height }}
      className="w-full flex flex-col justify-end gap-3 p-4 rounded-xl bg-spiritual-surface/20 animate-pulse border border-spiritual-border/40"
    >
      {type === 'donut' ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-28 h-28 rounded-full border-4 border-spiritual-border/60 border-t-spiritual-primary/40 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between gap-3 h-full px-4 pt-6">
            <div className="w-8 bg-spiritual-surface/80 rounded-t h-[40%]" />
            <div className="w-8 bg-spiritual-surface/80 rounded-t h-[75%]" />
            <div className="w-8 bg-spiritual-surface/80 rounded-t h-[55%]" />
            <div className="w-8 bg-spiritual-surface/80 rounded-t h-[90%]" />
            <div className="w-8 bg-spiritual-surface/80 rounded-t h-[65%]" />
            <div className="w-8 bg-spiritual-surface/80 rounded-t h-[80%]" />
            <div className="w-8 bg-spiritual-surface/80 rounded-t h-[50%]" />
          </div>
          <div className="h-2 w-full bg-spiritual-surface/60 rounded" />
        </>
      )}
    </div>
  );
};

/**
 * Reusable Chart Error State
 */
export const ChartErrorState = ({
  message = 'Failed to load visualization data.',
  onRetry,
  height = 200,
}) => (
  <div
    style={{ height }}
    className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-rose-50/60 border border-rose-200/80 w-full"
  >
    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-2">
      <AlertCircle className="w-5 h-5" />
    </div>
    <p className="text-xs font-semibold text-rose-900">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-xs font-medium text-rose-700 hover:bg-rose-50 shadow-sm cursor-pointer transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    )}
  </div>
);
