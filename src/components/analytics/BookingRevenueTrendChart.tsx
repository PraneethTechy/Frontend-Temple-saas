import React, { useState } from 'react';
import { ChartEmptyState } from './ChartStates';

export interface BookingRevenueTrendDataPoint {
  label?: string;
  date?: string;
  bookings?: number | string;
  revenue?: number | string;
  [key: string]: string | number | undefined;
}

export interface BookingRevenueTrendChartProps {
  data?: BookingRevenueTrendDataPoint[];
  height?: number;
  emptyMessage?: string;
}

interface RevenuePoint {
  x: number;
  y: number;
  revenue: number;
  bookings: number;
  label?: string;
  date?: string;
}

/**
 * Reusable Dual-Series Chart: Bookings & Revenue Trend
 * Bars = Bookings count
 * Line = Settled Revenue in ₹
 * Pure SVG, responsive, zero external chart dependencies.
 */
export const BookingRevenueTrendChart: React.FC<BookingRevenueTrendChartProps> = ({
  data = [],
  height = 240,
  emptyMessage = 'No booking or revenue activity recorded for this period.',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hasData = Array.isArray(data) && data.length > 0;
  const totalBookings = hasData ? data.reduce((sum, d) => sum + (Number(d.bookings) || 0), 0) : 0;
  const totalRevenue = hasData ? data.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0) : 0;

  if (!hasData || (totalBookings === 0 && totalRevenue === 0)) {
    return <ChartEmptyState message={emptyMessage} height={height} />;
  }

  // Dimension coordinates
  const width = 640;
  const paddingLeft = 38;
  const paddingRight = 44;
  const paddingTop = 26;
  const paddingBottom = 34;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Maximum scales
  const maxBookings = Math.max(...data.map((d) => Number(d.bookings) || 0), 4);
  const maxRevenue = Math.max(...data.map((d) => Number(d.revenue) || 0), 100);

  const count = data.length;
  const colWidth = chartW / count;
  const barWidth = Math.min(Math.max(colWidth * 0.45, 6), 24);

  // Line points for revenue
  const revenuePoints: RevenuePoint[] = data.map((d, i) => {
    const x = paddingLeft + i * colWidth + colWidth / 2;
    const rev = Number(d.revenue) || 0;
    const y = height - paddingBottom - (rev / maxRevenue) * chartH;
    return { x, y, revenue: rev, bookings: Number(d.bookings) || 0, label: d.label, date: d.date };
  });

  const pathD = revenuePoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Horizontal guide ticks (3 levels: 0, 50%, 100%)
  const gridTicks = [0, 0.5, 1];

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Chart Legend */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#D97706]" />
            <span className="text-spiritual-muted font-medium">Bookings</span>
            <span className="font-semibold text-spiritual-text font-mono text-[11px]">
              ({totalBookings})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-[#831843]" />
            <span className="w-2 h-2 rounded-full border border-[#831843] bg-white -ml-2" />
            <span className="text-spiritual-muted font-medium">Revenue</span>
            <span className="font-semibold text-spiritual-text font-mono text-[11px]">
              (₹{totalRevenue.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        {/* Live Hover Info */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] bg-[#FAF5EE] px-2.5 py-0.5 rounded-lg border border-[#EAE0D0]">
            <span className="font-semibold text-spiritual-text">{data[hoveredIdx].label}:</span>
            <span className="text-[#D97706] font-bold">{data[hoveredIdx].bookings} bookings</span>
            <span className="text-spiritual-muted">•</span>
            <span className="text-[#831843] font-bold">
              ₹{(Number(data[hoveredIdx].revenue) || 0).toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal Grid lines */}
          {gridTicks.map((ratio) => {
            const y = height - paddingBottom - ratio * chartH;
            const bVal = Math.round(ratio * maxBookings);
            const rVal = Math.round(ratio * maxRevenue);

            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#EFEBE4"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                {/* Left Y-axis: Bookings count */}
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] fill-spiritual-muted font-mono"
                >
                  {bVal}
                </text>
                {/* Right Y-axis: Revenue in ₹ */}
                <text
                  x={width - paddingRight + 8}
                  y={y + 3.5}
                  textAnchor="start"
                  className="text-[9px] fill-[#831843] opacity-80 font-mono"
                >
                  ₹{rVal >= 1000 ? `${(rVal / 1000).toFixed(1)}k` : rVal}
                </text>
              </g>
            );
          })}

          {/* Bookings Bars */}
          {data.map((d, i) => {
            const bCount = Number(d.bookings) || 0;
            const barH = (bCount / maxBookings) * chartH;
            const x = paddingLeft + i * colWidth + (colWidth - barWidth) / 2;
            const y = height - paddingBottom - barH;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Invisible hover trigger area */}
                <rect
                  x={paddingLeft + i * colWidth}
                  y={paddingTop}
                  width={colWidth}
                  height={chartH + paddingBottom}
                  fill="transparent"
                />

                {/* Vertical Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, 0)}
                  rx={3}
                  fill={isHovered ? '#B45309' : '#D97706'}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Revenue Smooth Line */}
          {revenuePoints.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#831843"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none"
            />
          )}

          {/* Revenue Circular Dots */}
          {revenuePoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 5 : 3}
              fill={hoveredIdx === i ? '#831843' : '#FFFFFF'}
              stroke="#831843"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            // Drop alternate labels if more than 10 points
            if (data.length > 10 && i % 2 !== 0 && i !== data.length - 1) return null;
            const x = paddingLeft + i * colWidth + colWidth / 2;

            return (
              <text
                key={i}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="text-[9px] fill-spiritual-muted font-mono"
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && revenuePoints[hoveredIdx] && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-spiritual-text text-white text-[11px] shadow-lg -translate-x-1/2 -translate-y-full -top-2 border border-gray-700"
            style={{
              left: `${(revenuePoints[hoveredIdx].x / width) * 100}%`,
              top: `${(revenuePoints[hoveredIdx].y / height) * 100}%`,
            }}
          >
            <div className="font-bold text-gray-200 border-b border-gray-600/60 pb-1 mb-1">
              {revenuePoints[hoveredIdx].label}
            </div>
            <div className="flex items-center justify-between gap-3 text-[10px]">
              <span className="text-amber-400 font-medium">Bookings:</span>
              <span className="font-mono font-bold text-white">
                {revenuePoints[hoveredIdx].bookings}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[10px]">
              <span className="text-rose-300 font-medium">Settled Revenue:</span>
              <span className="font-mono font-bold text-white">
                ₹{revenuePoints[hoveredIdx].revenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRevenueTrendChart;
