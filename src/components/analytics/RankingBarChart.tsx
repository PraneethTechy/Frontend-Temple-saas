import React from 'react';
import { ChartEmptyState } from './ChartStates';

export interface RankingBarChartItem {
  serviceName?: string;
  bookingsCount?: number | string;
  [key: string]: string | number | undefined;
}

export interface RankingBarChartProps {
  data?: RankingBarChartItem[];
  labelKey?: string;
  valueKey?: string;
  emptyMessage?: string;
  maxItems?: number;
  height?: number | string;
}

/**
 * Top Temple Services (3D Horizontal Ranking Bar Chart)
 * Displays Top 5 services with tactile 3D cylindrical volume bars,
 * recessed track grooves, stamped rank tokens, and aligned booking counts.
 * Spaced evenly to fill the full card height matching beside cards.
 */
export const RankingBarChart: React.FC<RankingBarChartProps> = ({
  data = [],
  labelKey = 'serviceName',
  valueKey = 'bookingsCount',
  emptyMessage = 'No service bookings recorded in this period.',
  maxItems = 5,
  height = 220,
}) => {
  const items = (data || []).slice(0, maxItems);

  if (!items || items.length === 0) {
    return <ChartEmptyState message={emptyMessage} height={height} />;
  }

  const maxValue = Math.max(...items.map((d) => Number(d[valueKey]) || 0), 1);

  // Hierarchy of harmonious accent colors for top 5 ranks
  const rankColors = [
    'bg-[#D97706]', // 1st - Warm saffron
    'bg-[#7C1D3A]', // 2nd - Deep wine / maroon
    'bg-[#8B42B8]', // 3rd - Royal purple
    'bg-[#0284C7]', // 4th - Ocean blue
    'bg-[#059669]', // 5th - Emerald green
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between py-1.5 select-none min-h-[210px] space-y-2.5 sm:space-y-3 min-w-0">
      {items.map((item, idx) => {
        const val = Number(item[valueKey]) || 0;
        const relativeWidth = Math.round((val / maxValue) * 100);
        const label = String(item[labelKey] || 'Unassigned');
        const barColor = rankColors[idx % rankColors.length];
        const rankFormatted = String(idx + 1).padStart(2, '0');

        return (
          <div
            key={idx}
            className="flex items-center gap-2.5 sm:gap-4 text-xs w-full py-1.5 px-2 rounded-xl group transition-all duration-150 hover:bg-[#FAF6F0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 cursor-default min-w-0"
          >
            {/* 3D Stamped Rank Token (01, 02, etc.) */}
            <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] border border-[#E6DDD0] shadow-[0_1.5px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] flex items-center justify-center font-mono font-bold text-spiritual-primary shrink-0 text-xs shadow-2xs">
              {rankFormatted}
            </div>

            {/* Human-readable Service Name */}
            <div
              className="w-[115px] sm:w-[150px] shrink-0 truncate font-semibold text-slate-800 text-xs sm:text-[13px]"
              title={label}
            >
              {label}
            </div>

            {/* 3D Recessed Bar Track & Cylindrical Fill */}
            <div className="flex-1 min-w-[65px] h-3 sm:h-3.5 bg-[#F2EDE4] rounded-full overflow-hidden border border-[#E5DDD2] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.08)] p-[1.5px]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor} shadow-[0_1px_3px_rgba(0,0,0,0.15)] relative overflow-hidden`}
                style={{ width: `${Math.max(relativeWidth, 6)}%` }}
              >
                {/* 3D Cylindrical Curvature Highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.28] via-transparent to-black/[0.18] pointer-events-none" />
              </div>
            </div>

            {/* Booking Count (Right Aligned, Bold) */}
            <span className="w-9 text-right font-mono font-bold text-slate-900 text-xs sm:text-sm shrink-0">
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RankingBarChart;
