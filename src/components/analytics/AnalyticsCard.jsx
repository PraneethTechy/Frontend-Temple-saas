import React from 'react';
import { ChartEmptyState, ChartLoadingSkeleton, ChartErrorState } from './ChartStates.jsx';

/**
 * Reusable Analytics Section Card Container
 * Used to wrap any chart component with uniform headers, loading, error, and empty states.
 */
export const AnalyticsCard = ({
  title,
  description,
  icon: Icon,
  iconBg,
  iconBorder,
  iconColor,
  actions,
  badge,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  isEmpty = false,
  emptyMessage,
  emptySubtext,
  chartHeight = 240,
  skeletonType = 'bar',
  children,
  className = '',
}) => {
  return (
    <div
      className={`p-4 sm:p-5 lg:p-5 xl:p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all ${className}`}
    >
      {/* Header */}
      {(title || description || actions || badge) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#F4EFE6]">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    iconBg || 'bg-[#FAF5EE]'
                  } ${iconBorder || 'border border-[#EAE0D0]'} ${
                    iconColor || 'text-spiritual-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <h2 className="text-base font-serif font-bold text-spiritual-text truncate tracking-tight">
                {title}
              </h2>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-spiritual-surface border border-spiritual-border text-spiritual-muted">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-spiritual-muted mt-0.5 line-clamp-1">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Main Content / Chart Body */}
      <div className="w-full flex-1 flex flex-col justify-center min-h-0">
        {isLoading ? (
          <ChartLoadingSkeleton height={chartHeight} type={skeletonType} />
        ) : isError ? (
          <ChartErrorState message={errorMessage} onRetry={onRetry} height={chartHeight} />
        ) : isEmpty ? (
          <ChartEmptyState
            message={emptyMessage}
            subtext={emptySubtext}
            height={chartHeight}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default AnalyticsCard;
