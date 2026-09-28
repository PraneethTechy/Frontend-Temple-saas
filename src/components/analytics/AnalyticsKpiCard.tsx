import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface AnalyticsKpiCardProps {
  title: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  iconBorder?: string;
  change?: number | null;
  changeText?: string;
  subtext?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * Reusable KPI Card designed following the reference dashboard aesthetic.
 * Features an icon block, prominent metric value, mini sparkline wave, and comparison badge.
 */
export const AnalyticsKpiCard: React.FC<AnalyticsKpiCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBg = 'bg-amber-50',
  iconColor = 'text-amber-700',
  iconBorder = 'border-amber-200/80',
  change = null,
  changeText = 'from previous period',
  subtext,
  isLoading = false,
}) => {
  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;
  const isZero = typeof change === 'number' && change === 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[120px] transition-all">
      {/* Top row: Icon and Label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className={`w-7 h-7 rounded-lg ${iconBg} ${iconColor} border ${iconBorder} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-medium text-spiritual-muted tracking-tight">
            {title}
          </span>
        </div>

        {/* Small trend badge if genuinely provided */}
        {typeof change === 'number' && (
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : isNegative
                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                : 'bg-stone-50 text-spiritual-muted border border-stone-200/60'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" />}
            {isZero && <Minus className="w-2.5 h-2.5" />}
            <span>{Math.abs(change)}%</span>
          </span>
        )}
      </div>

      {/* Metric Value */}
      <div className="my-1.5">
        {isLoading ? (
          <div className="h-7 w-24 bg-spiritual-surface animate-pulse rounded-lg" />
        ) : (
          <div className="text-2xl sm:text-[26px] font-serif font-bold text-spiritual-text tracking-tight leading-none">
            {value}
          </div>
        )}
      </div>

      {/* Bottom secondary information */}
      <div className="text-[11px] text-spiritual-muted truncate pt-1 border-t border-[#F7F3EC]">
        {subtext || 'Calculated from live data'}
      </div>
    </div>
  );
};

export default AnalyticsKpiCard;
