import React, { useState } from 'react';
import { ChartEmptyState } from './ChartStates';

export interface RevenueContributionItem {
  serviceName?: string;
  templeName?: string;
  name?: string;
  revenue: number | string;
  percentage?: number;
  color?: string;
  transactionCount?: number | string;
}

export interface RevenueContributionChartProps {
  data?: RevenueContributionItem[];
  height?: number | string;
  emptyMessage?: string;
}

/**
 * Revenue Contribution by Temple (3D Tactile Treemap Blocks)
 * Displays shrines by settled revenue formatted as rich 3D jewel-toned tiles.
 * Features tactile dimensional bevels, subtle lighting depth, and interactive lift.
 */
export const RevenueContributionChart: React.FC<RevenueContributionChartProps> = ({
  data = [],
  height = 220,
  emptyMessage = 'No settled revenue recorded across temples for this period.',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const items = data || [];
  const totalRevenue = items.reduce((acc, t) => acc + (Number(t.revenue) || 0), 0);

  if (!items || items.length === 0 || totalRevenue === 0) {
    return <ChartEmptyState message={emptyMessage} height={height} />;
  }

  // Sort strictly descending by revenue
  const sortedItems = [...items].sort(
    (a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0)
  );

  // Restrained premium palette matching DevaSetu design reference
  const jewelPalette = [
    '#7C1D3A', // Deep wine / maroon
    '#D97706', // Warm amber / saffron
    '#6D28D9', // Royal violet
    '#2563EB', // Sapphire blue
    '#059669', // Emerald green
    '#BE185D', // Rose
    '#4B5563', // Slate gray
  ];

  // Distribute items into balanced top and bottom rows
  let topRowItems: RevenueContributionItem[] = [];
  let bottomRowItems: RevenueContributionItem[] = [];

  if (sortedItems.length <= 2) {
    topRowItems = sortedItems;
    bottomRowItems = [];
  } else if (sortedItems.length <= 4) {
    topRowItems = sortedItems.slice(0, 2);
    bottomRowItems = sortedItems.slice(2);
  } else if (sortedItems.length <= 6) {
    topRowItems = sortedItems.slice(0, 3);
    bottomRowItems = sortedItems.slice(3, 6);
  } else {
    topRowItems = sortedItems.slice(0, Math.ceil(sortedItems.length / 2));
    bottomRowItems = sortedItems.slice(Math.ceil(sortedItems.length / 2));
  }

  const renderBlock = (item: RevenueContributionItem, actualIdx: number) => {
    const pct =
      item.percentage !== undefined
        ? item.percentage
        : totalRevenue > 0
        ? Number(((Number(item.revenue) / totalRevenue) * 100).toFixed(1))
        : 0;

    // Use square root scaling for flex-grow to ensure smaller items remain easily clickable and readable
    const flexGrow = Math.max(1, Math.round(Math.sqrt(Number(pct)) * 10));
    const bgColor = item.color || jewelPalette[actualIdx % jewelPalette.length];
    const isHovered = hoveredIdx === actualIdx;

    return (
      <div
        key={actualIdx}
        style={{
          flexGrow,
          flexBasis: 0,
          backgroundColor: bgColor,
          boxShadow: isHovered
            ? '0 10px 18px -2px rgba(0,0,0,0.22), 0 4px 8px -1px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)'
            : '0 4px 8px -2px rgba(0,0,0,0.16), 0 2px 4px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
        className={`p-2.5 sm:p-3.5 rounded-xl text-white flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden relative border-b-[3px] border-black/30 min-w-0 select-none ${
          isHovered
            ? 'ring-2 ring-white/90 -translate-y-1 z-10'
            : 'hover:-translate-y-0.5'
        }`}
        onMouseEnter={() => setHoveredIdx(actualIdx)}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Subtle Matte 3D Depth Lighting (Soft ambient curvature, NO reflective shine) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.12] via-transparent to-black/[0.15] pointer-events-none" />

        {/* Temple / Service Name */}
        <div className="relative z-10 text-xs sm:text-[13px] font-semibold text-white/95 truncate max-w-full tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
          {item.serviceName || item.templeName || item.name || 'Service'}
        </div>

        {/* Revenue & Share */}
        <div className="relative z-10 mt-2">
          <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] truncate">
            ₹{Number(item.revenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs font-mono text-white/80 font-medium mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
            {pct}%
          </div>
        </div>

        {/* Floating Tooltip */}
        {isHovered && (
          <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-sans shadow-2xl pointer-events-none whitespace-nowrap border border-gray-700">
            <div className="font-bold text-gray-100">{item.serviceName || item.templeName || item.name || 'Service'}</div>
            <div className="font-mono text-amber-300 font-bold text-xs mt-0.5">
              ₹{Number(item.revenue || 0).toLocaleString('en-IN')} ({pct}%)
            </div>
            {item.transactionCount !== undefined && (
              <div className="text-[10px] text-gray-300">
                {item.transactionCount} paid transactions
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5 sm:gap-3 py-1 select-none min-h-[210px] min-w-0">
      {/* Top Row Blocks */}
      <div className="flex gap-2.5 sm:gap-3 w-full flex-1 min-h-[95px] min-w-0">
        {topRowItems.map((item, idx) => renderBlock(item, idx))}
      </div>

      {/* Bottom Row Blocks */}
      {bottomRowItems.length > 0 && (
        <div className="flex gap-2.5 sm:gap-3 w-full flex-1 min-h-[95px] min-w-0">
          {bottomRowItems.map((item, idx) =>
            renderBlock(item, idx + topRowItems.length)
          )}
        </div>
      )}
    </div>
  );
};

export default RevenueContributionChart;
