import React, { useState } from 'react';
import { ChartEmptyState } from './ChartStates.jsx';

// Canonical deity & category color mapping matching Image 2 reference exactly
const DEITY_COLOR_MAP = {
  'lord shiva': '#DA8B18', // Warm Golden Ochre / Saffron
  'shiva': '#DA8B18',
  'goddess amman': '#EF5A48', // Warm Coral / Terra Cotta Red
  'amman': '#EF5A48',
  'murugan': '#8B42B8', // Royal Purple / Violet
  'lord murugan': '#8B42B8',
  'vishnu': '#8D96A5', // Slate Grey / Soft Lavender
  'lord vishnu': '#8D96A5',
  'other': '#F59E0B', // Warm Amber Gold
  'other shrines': '#F59E0B',
};

// Fallback palette if unexpected custom categories are encountered
const FALLBACK_PALETTE = [
  '#DA8B18', // Golden Ochre
  '#EF5A48', // Warm Coral
  '#8B42B8', // Royal Purple
  '#8D96A5', // Slate Grey
  '#F59E0B', // Amber
  '#059669', // Emerald
];

/**
 * Temple Category Distribution (3D Segmented Donut Chart)
 * Replicates the visual design of Image 2:
 * - Prominent segmented annular donut with subtle 3D under-rim depth
 * - Percentage labels printed directly inside each slice
 * - Crisp white separating seams between segments
 * - White center cap with bold total number and title-case "Total Bookings"
 * - Responsive layout that accommodates sidebar expansion without clipping values
 * - Interactive hover syncing between legend and donut slices
 */
export const DonutDistributionChart = ({
  data = [],
  colors = FALLBACK_PALETTE,
  size = 190,
  outerRadius = 90,
  innerRadius = 48,
  centerLabel = 'Total Bookings',
  emptyMessage = 'No category distribution recorded for this period.',
  labelKey = 'label',
  valueKey = 'value',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Normalize incoming category data
  const normalized = (data || []).map((item) => {
    const rawLabel = item[labelKey] || item.label || item.category || 'Other';
    const label = String(rawLabel).trim();
    const value = Number(item[valueKey] !== undefined ? item[valueKey] : item.count) || 0;
    return {
      label,
      value,
      customColor: item.color,
    };
  });

  const validData = normalized.filter((d) => d.value > 0);
  const total = validData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return <ChartEmptyState message={emptyMessage} height={size + 30} />;
  }

  const cx = size / 2;
  const cy = size / 2;

  // Build slice angles (starting from top: -pi/2, sweeping clockwise)
  let currentAngle = -Math.PI / 2;
  const slices = validData.map((d, idx) => {
    const fraction = d.value / total;
    const sweep = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;
    currentAngle = endAngle;

    const midAngle = (startAngle + endAngle) / 2;
    const midRadius = (outerRadius + innerRadius) / 2;

    // Outer arc points
    const x_o1 = cx + outerRadius * Math.cos(startAngle);
    const y_o1 = cy + outerRadius * Math.sin(startAngle);
    const x_o2 = cx + outerRadius * Math.cos(endAngle);
    const y_o2 = cy + outerRadius * Math.sin(endAngle);

    // Inner arc points
    const x_i2 = cx + innerRadius * Math.cos(endAngle);
    const y_i2 = cy + innerRadius * Math.sin(endAngle);
    const x_i1 = cx + innerRadius * Math.cos(startAngle);
    const y_i1 = cy + innerRadius * Math.sin(startAngle);

    const largeArc = sweep > Math.PI ? 1 : 0;

    // SVG Annular Sector Path
    const pathD = `M ${x_o1} ${y_o1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x_o2} ${y_o2} L ${x_i2} ${y_i2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x_i1} ${y_i1} Z`;

    // Coordinates for percentage text inside slice
    const labelX = cx + midRadius * Math.cos(midAngle);
    const labelY = cy + midRadius * Math.sin(midAngle);

    // Hover translation vector (4px along midAngle)
    const hoverDx = Math.cos(midAngle) * 4;
    const hoverDy = Math.sin(midAngle) * 4;

    // Resolve color matching Image 2 reference
    const key = d.label.toLowerCase();
    const color =
      d.customColor ||
      DEITY_COLOR_MAP[key] ||
      colors[idx % colors.length];

    const percentage = Number(((d.value / total) * 100).toFixed(1));

    return {
      ...d,
      color,
      pathD,
      fraction,
      percentage,
      labelX,
      labelY,
      hoverDx,
      hoverDy,
      midAngle,
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 lg:gap-5 w-full py-1 min-w-0 overflow-hidden">
      {/* Left: 3D Segmented Donut Chart */}
      <div className="shrink-0 flex justify-center items-center select-none">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
          >
            <defs>
              {/* Dual-stage realistic 3D depth shadow (soft ambient + contact shadow) */}
              <filter id="donut3dDepth" x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#261408" floodOpacity="0.14" />
                <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#261408" floodOpacity="0.08" />
              </filter>

              {/* Center hole soft inset depth */}
              <filter id="centerHoleDepth" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#261408" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* 3D Bottom Lip / Extrusion Layer (translates downward by 3.5px for physical ring depth) */}
            <g transform="translate(0, 3.5)" opacity="0.32">
              {slices.map((slice, idx) => (
                <path
                  key={`depth-${idx}`}
                  d={slice.pathD}
                  fill="#1E1005"
                />
              ))}
            </g>

            {/* Main Segmented Donut Slices */}
            <g filter="url(#donut3dDepth)">
              {slices.map((slice, idx) => {
                const isHovered = hoveredIdx === idx;
                const transform = isHovered
                  ? `translate(${slice.hoverDx}, ${slice.hoverDy})`
                  : undefined;

                return (
                  <path
                    key={`slice-${idx}`}
                    d={slice.pathD}
                    fill={slice.color}
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    transform={transform}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
            </g>

            {/* Percentage Text Rendered Directly Inside Slices (White, Bold, Drop-shadow) */}
            {slices.map((slice, idx) => {
              // Hide label only if slice is tiny (< 3.5% of total)
              if (slice.fraction < 0.035) return null;

              const isHovered = hoveredIdx === idx;
              const transform = isHovered
                ? `translate(${slice.hoverDx}, ${slice.hoverDy})`
                : undefined;

              return (
                <text
                  key={`pct-${idx}`}
                  x={slice.labelX}
                  y={slice.labelY}
                  transform={transform}
                  fill="#FFFFFF"
                  fontSize={slice.fraction < 0.08 ? '10px' : '11px'}
                  fontWeight="bold"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="pointer-events-none select-none transition-all duration-150 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                >
                  {slice.percentage}%
                </text>
              );
            })}

            {/* Center Hole White Circle */}
            <circle
              cx={cx}
              cy={cy}
              r={innerRadius - 1.5}
              fill="#FFFFFF"
              stroke="#F2EAE0"
              strokeWidth={1.5}
              filter="url(#centerHoleDepth)"
            />

            {/* Center Hole Content (Count & Label) */}
            <g className="pointer-events-none select-none">
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[24px] sm:text-[26px] font-serif font-bold fill-slate-900 tracking-tight"
              >
                {activeSlice ? activeSlice.value : total}
              </text>
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-semibold fill-slate-500 tracking-normal"
              >
                {activeSlice ? activeSlice.label : centerLabel}
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Right: Clean Tabular Category Legend (Compact, unclipped, responsive) */}
      <div className="flex-1 w-full min-w-0 select-none flex flex-col justify-center">
        <div className="space-y-1.5 sm:space-y-2">
          {slices.map((slice, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between py-1 sm:py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  isHovered ? 'bg-[#FAF4EC] shadow-2xs' : 'hover:bg-[#FAF7F2]'
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Large Dot + Category Name */}
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs transition-transform"
                    style={{
                      backgroundColor: slice.color,
                      transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-800 truncate">
                    {slice.label}
                  </span>
                </div>

                {/* Values: Bold Count & Percentage Share */}
                <div className="flex items-center gap-2 sm:gap-2.5 font-mono text-xs sm:text-[13px] shrink-0">
                  <span className="text-right font-bold text-slate-900 min-w-[22px]">
                    {slice.value}
                  </span>
                  <span className="text-right text-slate-500 font-medium min-w-[38px]">
                    {slice.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutDistributionChart;
