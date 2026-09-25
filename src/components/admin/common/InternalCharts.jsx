import React, { useState } from 'react';
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Users,
  FileText,
  TrendingUp,
  Building2,
  Sparkles,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 1. Area Trend Chart (Native SVG)
 * Smooth line and gradient fill for time series trends (e.g. registrations, bookings).
 */
export const AreaTrendChart = ({
  data = [],
  valueKey = 'count',
  labelKey = 'period',
  height = 180,
  lineColor = '#D97706', // spiritual-primary
  gradientColor = '#F59E0B',
  emptyMessage = 'No trend data recorded yet',
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-spiritual-muted bg-spiritual-surface/30 rounded-xl border border-dashed border-spiritual-border"
      >
        {emptyMessage}
      </div>
    );
  }

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const maxValue = Math.max(...values, 1);
  const width = 600;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Generate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const y = height - paddingY - (Number(d[valueKey] || 0) / maxValue) * chartH;
    return { x, y, data: d, val: Number(d[valueKey] || 0) };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${
    height - paddingY
  } Z`;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={gradientColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = height - paddingY - ratio * chartH;
          const val = Math.round(ratio * maxValue);
          return (
            <g key={ratio}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E5E7EB"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-spiritual-muted font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        <path d={areaD} fill="url(#areaTrendGradient)" />

        {/* Line Stroke */}
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={hoverIndex === i ? 5 : 3}
            fill={hoverIndex === i ? lineColor : '#FFFFFF'}
            stroke={lineColor}
            strokeWidth="2"
            className="transition-all cursor-pointer"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}

        {/* X Axis labels */}
        {points.map((pt, i) => {
          if (data.length > 8 && i % 2 !== 0 && i !== points.length - 1) return null;
          return (
            <text
              key={i}
              x={pt.x}
              y={height - 6}
              textAnchor="middle"
              className="text-[9px] fill-spiritual-muted font-mono"
            >
              {pt.data[labelKey]}
            </text>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          className="absolute z-20 pointer-events-none px-2.5 py-1 rounded-lg bg-spiritual-text text-white text-[11px] font-mono shadow-spiritual-md -translate-x-1/2 -translate-y-full -top-1"
          style={{
            left: `${(points[hoverIndex].x / width) * 100}%`,
            top: `${(points[hoverIndex].y / height) * 100}%`,
          }}
        >
          <div className="font-semibold">{points[hoverIndex].val}</div>
          <div className="text-[9px] text-gray-300">{points[hoverIndex].data[labelKey]}</div>
        </div>
      )}
    </div>
  );
};

/**
 * 2. Donut Distribution Chart (Native SVG)
 * Circular distribution with clean segment gaps and centered summary.
 */
export const DonutDistributionChart = ({
  data = [],
  colors = ['#059669', '#D97706', '#991B1B', '#6B7280', '#4F46E5'],
  size = 160,
  strokeWidth = 22,
  emptyMessage = 'No distribution data available',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const validData = (data || []).filter((d) => Number(d.value) > 0);
  const total = validData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  if (total === 0) {
    return (
      <div
        style={{ height: size }}
        className="flex items-center justify-center text-xs text-spiritual-muted bg-spiritual-surface/30 rounded-xl border border-dashed border-spiritual-border text-center p-4"
      >
        {emptyMessage}
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = validData.map((d, idx) => {
    const fraction = Number(d.value) / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += fraction * circumference;
    const color = d.color || colors[idx % colors.length];

    return {
      ...d,
      color,
      strokeDasharray,
      strokeDashoffset,
      fraction,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-serif font-bold text-spiritual-text">
            {hoveredIdx !== null ? segments[hoveredIdx].value : total}
          </span>
          <span className="text-[10px] text-spiritual-muted uppercase tracking-wider font-semibold">
            {hoveredIdx !== null ? segments[hoveredIdx].label : 'Total'}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2 text-xs flex-1 max-w-[200px]">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
              hoveredIdx === idx ? 'bg-spiritual-surface' : ''
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-spiritual-text font-medium truncate">{seg.label}</span>
            </div>
            <span className="font-mono text-spiritual-muted text-[11px] ml-2">
              {seg.value} ({Math.round(seg.fraction * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 3. Horizontal Ranking Bar Chart
 * Clean ranked progress bars for categories, states, or volume.
 */
export const HorizontalRankingBarChart = ({
  data = [],
  labelKey = 'label',
  valueKey = 'value',
  barColor = 'bg-spiritual-primary',
  emptyMessage = 'No ranking data recorded yet',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-spiritual-muted bg-spiritual-surface/30 rounded-xl border border-dashed border-spiritual-border">
        {emptyMessage}
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const val = Number(item[valueKey]) || 0;
        const percentage = Math.round((val / maxValue) * 100);

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] font-mono text-spiritual-muted w-4">
                  #{idx + 1}
                </span>
                <span className="font-medium text-spiritual-text truncate">
                  {item[labelKey] || 'Unassigned'}
                </span>
              </div>
              <span className="font-semibold text-spiritual-text font-mono text-[11px]">
                {val}
              </span>
            </div>
            <div className="h-2 w-full bg-spiritual-surface rounded-full overflow-hidden border border-spiritual-border/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.max(percentage, 3)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 4. Reusable Stat Card
 */
export const StatCard = ({
  title,
  value,
  icon: Icon,
  link,
  subtext,
  isLoading = false,
  highlight = false,
  badgeText,
  badgeColor = 'bg-spiritual-surface text-spiritual-muted',
}) => {
  const content = (
    <div
      className={`p-5 rounded-2xl bg-white border ${
        highlight
          ? 'border-spiritual-accent ring-1 ring-spiritual-accent/20'
          : 'border-spiritual-border'
      } shadow-spiritual-xs hover:shadow-spiritual-sm transition-all group h-full flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-spiritual-muted font-medium">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-spiritual-surface border border-spiritual-border flex items-center justify-center text-spiritual-text group-hover:text-spiritual-primary group-hover:border-spiritual-primary/40 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        {isLoading ? (
          <div className="h-8 w-20 bg-spiritual-surface animate-pulse rounded-lg mb-1" />
        ) : (
          <div className="text-2xl sm:text-[28px] font-serif font-bold text-spiritual-text tracking-tight">
            {value}
          </div>
        )}

        {(subtext || badgeText) && (
          <div className="flex items-center gap-2 mt-2">
            {badgeText && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border border-spiritual-border/60 ${badgeColor}`}
              >
                {badgeText}
              </span>
            )}
            {subtext && (
              <span className="text-[11px] text-spiritual-muted truncate">{subtext}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
};

/**
 * 5. Clean 2D Grouped Bar Chart: Website Reach
 * Displays side-by-side flat 2D bars for Website Visits and Page Views.
 * NO lines, NO area fills, NO 3D effects. Clean, readable, and professional.
 */
export const WebsiteReachChart = ({
  data = [],
  range = '7d',
  onRangeChange,
  isLoading = false,
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Dynamic totals from displayed dataset
  const totalVisits = data.reduce(
    (acc, d) => acc + Number(d.visits ?? d.visitors ?? 0),
    0
  );
  const totalPageViews = data.reduce(
    (acc, d) => acc + Number(d.pageViews ?? 0),
    0
  );

  // Coordinate space
  const width = 680;
  const height = 260;
  const paddingLeft = 44;
  const paddingRight = 20;
  const paddingTop = 24;
  const paddingBottom = 38;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const yMax = 300;
  const yTicks = [0, 50, 100, 150, 200, 250, 300];

  const groupCount = data.length || 7;
  const groupWidth = chartW / groupCount;
  const singleBarW = 18;
  const barGap = 4;

  const groups = data.map((d, i) => {
    const groupCenterX = paddingLeft + i * groupWidth + groupWidth / 2;
    const visits = Number(d.visits ?? d.visitors ?? 0);
    const pageViews = Number(d.pageViews ?? 0);

    const visitBarH = Math.max(0, (visits / yMax) * chartH);
    const pvBarH = Math.max(0, (pageViews / yMax) * chartH);

    const visitBarX = groupCenterX - singleBarW - barGap / 2;
    const pvBarX = groupCenterX + barGap / 2;

    const visitBarY = paddingTop + chartH - visitBarH;
    const pvBarY = paddingTop + chartH - pvBarH;

    return {
      date: d.date,
      fullDate: d.fullDate || `${d.date} 2026`,
      source: d.source,
      isToday: d.isToday,
      visits,
      pageViews,
      groupCenterX,
      visitBarX,
      visitBarY,
      visitBarH,
      pvBarX,
      pvBarY,
      pvBarH,
    };
  });

  const baselineY = paddingTop + chartH;
  const activeItem = hoverIndex !== null && groups[hoverIndex] ? groups[hoverIndex] : null;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-spiritual-border p-5 sm:p-6 shadow-spiritual-xs justify-between">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shadow-2xs shrink-0">
            <BarChart3 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-spiritual-text leading-tight">
              Website Reach
            </h2>
            <p className="text-xs text-spiritual-muted mt-0.5 font-medium">
              Visitors and page views over the last 7 days
            </p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-spiritual-border shadow-2xs hover:bg-spiritual-surface text-xs font-semibold text-spiritual-text transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-spiritual-accent" />
            <span>Last 7 Days</span>
            <ChevronDown className="w-3 h-3 text-spiritual-muted" />
          </button>
        </div>
      </div>

      {/* Compact Legend & Meaningful Summary Totals */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-spiritual-border/60 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] shrink-0" />
            <span className="font-medium text-spiritual-text">Website Visits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9E1C3F] shrink-0" />
            <span className="font-medium text-spiritual-text">Page Views</span>
          </div>
        </div>

        {/* Dynamic Summary Numbers */}
        <div className="flex items-center gap-4 text-xs font-mono text-spiritual-muted">
          <span>
            Total Visits: <strong className="text-spiritual-text font-bold">{totalVisits.toLocaleString('en-IN')}</strong>
          </span>
          <span className="text-spiritual-border">•</span>
          <span>
            Total Views: <strong className="text-spiritual-text font-bold">{totalPageViews.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      </div>

      {/* Flat 2D Grouped Bar Canvas */}
      <div className="relative w-full flex-1 min-h-[220px] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
            <div className="h-6 w-32 bg-spiritual-surface animate-pulse rounded-xl" />
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y Axis Label */}
          <text
            x={paddingLeft - 6}
            y={paddingTop - 12}
            textAnchor="end"
            className="text-[11px] font-medium fill-spiritual-muted font-sans"
          >
            Count
          </text>

          {/* Horizontal Grid Lines */}
          {yTicks.map((val) => {
            if (val === 0) return null;
            const y = paddingTop + chartH - (val / yMax) * chartH;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10.5px] fill-spiritual-muted font-sans font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Solid Baseline at y = 0 */}
          <line
            x1={paddingLeft}
            y1={baselineY}
            x2={width - paddingRight + 4}
            y2={baselineY}
            stroke="#D1D5DB"
            strokeWidth="1.2"
          />
          <text
            x={paddingLeft - 8}
            y={baselineY + 4}
            textAnchor="end"
            className="text-[10.5px] fill-spiritual-muted font-sans font-medium"
          >
            0
          </text>

          {/* 2D Grouped Bars for each date */}
          {groups.map((grp, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g
                key={grp.date}
                className="cursor-pointer transition-opacity"
                opacity={hoverIndex === null || isHovered ? 1 : 0.65}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Invisible hover trigger area */}
                <rect
                  x={grp.groupCenterX - groupWidth / 2}
                  y={paddingTop}
                  width={groupWidth}
                  height={chartH + 30}
                  fill="transparent"
                />

                {/* 1. Flat 2D Saffron/Gold Bar: Website Visits */}
                {grp.visitBarH > 0 && (
                  <rect
                    x={grp.visitBarX}
                    y={grp.visitBarY}
                    width={singleBarW}
                    height={grp.visitBarH}
                    rx={3}
                    ry={3}
                    fill="#D97706"
                    className="transition-colors"
                  />
                )}

                {/* Exact Count Number above Website Visits Bar */}
                <text
                  x={grp.visitBarX + singleBarW / 2}
                  y={grp.visitBarY - 5}
                  textAnchor="middle"
                  className="text-[10.5px] font-bold fill-[#B45309] font-mono select-none"
                >
                  {grp.visits}
                </text>

                {/* 2. Flat 2D Maroon/Plum Bar: Page Views */}
                {grp.pvBarH > 0 && (
                  <rect
                    x={grp.pvBarX}
                    y={grp.pvBarY}
                    width={singleBarW}
                    height={grp.pvBarH}
                    rx={3}
                    ry={3}
                    fill="#9E1C3F"
                    className="transition-colors"
                  />
                )}

                {/* Exact Count Number above Page Views Bar */}
                <text
                  x={grp.pvBarX + singleBarW / 2}
                  y={grp.pvBarY - 5}
                  textAnchor="middle"
                  className="text-[10.5px] font-bold fill-[#881337] font-mono select-none"
                >
                  {grp.pageViews}
                </text>

                {/* X Axis Date Label */}
                <text
                  x={grp.groupCenterX}
                  y={baselineY + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-sans transition-colors select-none ${
                    isHovered ? 'font-bold fill-spiritual-text' : 'font-medium fill-spiritual-muted'
                  }`}
                >
                  {grp.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Simple Floating Tooltip */}
        {activeItem && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-150"
            style={{
              left: `${(activeItem.groupCenterX / width) * 100}%`,
              top: `${(Math.min(activeItem.visitBarY, activeItem.pvBarY) / height) * 100}%`,
              transform: 'translate(-50%, -108%)',
            }}
          >
            <div className="relative px-3.5 py-2.5 rounded-xl bg-gray-900 text-white shadow-xl border border-gray-700 min-w-[155px]">
              <div className="font-semibold text-xs text-amber-300 font-mono mb-1.5">
                {activeItem.fullDate}
              </div>
              <div className="flex items-center justify-between gap-4 text-xs py-0.5">
                <span className="text-gray-300">Website Visits:</span>
                <span className="font-mono font-bold text-amber-400">{activeItem.visits}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-xs py-0.5">
                <span className="text-gray-300">Page Views:</span>
                <span className="font-mono font-bold text-rose-300">{activeItem.pageViews}</span>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-gray-800 text-[10px] text-gray-400">
                {activeItem.source === 'real' || activeItem.isToday ? (
                  <span className="text-emerald-400 font-medium">Actual data (today)</span>
                ) : (
                  <span>Development estimate</span>
                )}
              </div>
              <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 6. Clean 2D Donut Chart: Temple Overview
 * Shows operational temple distribution: Active, Pending, Inactive.
 * Clean 2D flat donut ring with center total, and fitted side status list that never overflows.
 */
export const DimensionalTempleDonut = ({
  active = 0,
  inactive = 0,
  pending = 0,
  total,
}) => {
  const activeCount = Number(active) || 0;
  const pendingCount = Number(pending) || 0;
  const inactiveCount = Number(inactive) || 0;
  const calculatedTotal = activeCount + pendingCount + inactiveCount;
  const displayTotal = total !== undefined && Number(total) > 0 ? Number(total) : calculatedTotal;

  // Percentage calculations
  const totalForPct = calculatedTotal > 0 ? calculatedTotal : (displayTotal > 0 ? displayTotal : 1);
  const activePct = calculatedTotal > 0 ? ((activeCount / totalForPct) * 100).toFixed(1) : '0';
  const pendingPct = calculatedTotal > 0 ? ((pendingCount / totalForPct) * 100).toFixed(1) : '0';
  const inactivePct = calculatedTotal > 0 ? ((inactiveCount / totalForPct) * 100).toFixed(1) : '0';

  // 2D Donut Geometry (centered in card)
  const size = 148;
  const center = size / 2;
  const radius = 48;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // Segments (start at 12 o'clock via -90 deg rotation)
  const activeLen = (activeCount / totalForPct) * circumference;
  const pendingLen = (pendingCount / totalForPct) * circumference;
  const inactiveLen = (inactiveCount / totalForPct) * circumference;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-spiritual-border p-5 sm:p-6 shadow-spiritual-xs justify-between">
      {/* Header Row */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shadow-2xs shrink-0">
          <Building2 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-spiritual-text leading-tight">
            Temple Overview
          </h2>
          <p className="text-xs text-spiritual-muted mt-0.5 font-medium">
            Operational directory distribution
          </p>
        </div>
      </div>

      {/* Main Content: Clean 2D Donut Centered */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
          >
            {/* Background ring if total is 0 */}
            {calculatedTotal === 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
              />
            )}

            {/* Rotated Segments Group */}
            <g transform={`rotate(-90 ${center} ${center})`}>
              {/* Active Segment (Emerald: #059669) */}
              {activeLen > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#059669"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${activeLen} ${circumference}`}
                  strokeDashoffset={0}
                />
              )}

              {/* Pending Segment (Saffron/Gold: #D97706) */}
              {pendingLen > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${pendingLen} ${circumference}`}
                  strokeDashoffset={-activeLen}
                />
              )}

              {/* Inactive Segment (Maroon: #9E1C3F) */}
              {inactiveLen > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#9E1C3F"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${inactiveLen} ${circumference}`}
                  strokeDashoffset={-(activeLen + pendingLen)}
                />
              )}
            </g>

            {/* Clean White Center Disc */}
            <circle
              cx={center}
              cy={center}
              r={radius - strokeWidth / 2}
              fill="#FFFFFF"
            />
            <circle
              cx={center}
              cy={center}
              r={radius - strokeWidth / 2}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <span className="text-3xl font-serif font-bold text-spiritual-text leading-none">
              {displayTotal}
            </span>
            <span className="text-[11px] font-sans font-medium text-spiritual-muted mt-1">
              Total Temples
            </span>
          </div>
        </div>
      </div>

      {/* Down / Below Options: Active, Pending, Inactive (Placed at bottom, NOT beside) */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-spiritual-border/60 mt-2 w-full text-center">
        {/* Active */}
        <div className="flex flex-col items-center p-2 rounded-xl bg-spiritual-surface/50 border border-spiritual-border/40">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] shrink-0" />
            <span className="text-xs font-semibold text-spiritual-text">Active</span>
          </div>
          <span className="text-base font-bold font-mono text-spiritual-text leading-tight">{activeCount}</span>
          <span className="text-[11px] font-mono text-spiritual-muted mt-0.5">{activePct}%</span>
        </div>

        {/* Pending */}
        <div className="flex flex-col items-center p-2 rounded-xl bg-spiritual-surface/50 border border-spiritual-border/40">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] shrink-0" />
            <span className="text-xs font-semibold text-spiritual-text">Pending</span>
          </div>
          <span className="text-base font-bold font-mono text-spiritual-text leading-tight">{pendingCount}</span>
          <span className="text-[11px] font-mono text-spiritual-muted mt-0.5">{pendingPct}%</span>
        </div>

        {/* Inactive */}
        <div className="flex flex-col items-center p-2 rounded-xl bg-spiritual-surface/50 border border-spiritual-border/40">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9E1C3F] shrink-0" />
            <span className="text-xs font-semibold text-spiritual-text">Inactive</span>
          </div>
          <span className="text-base font-bold font-mono text-spiritual-text leading-tight">{inactiveCount}</span>
          <span className="text-[11px] font-mono text-spiritual-muted mt-0.5">{inactivePct}%</span>
        </div>
      </div>
    </div>
  );
};
