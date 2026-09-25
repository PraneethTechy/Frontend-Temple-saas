import React, { useState } from 'react';
import { ChartEmptyState } from './ChartStates.jsx';

/**
 * Reusable New Devotee Registration Trend Chart (Native SVG Line/Area)
 * Plots time-series devotee onboarding with gradient fill and interactive tooltip.
 */
export const RegistrationTrendChart = ({
  data = [],
  valueKey = 'devotees',
  labelKey = 'label',
  height = 190,
  lineColor = '#059669', // Emerald
  gradientColor = '#10B981',
  emptyMessage = 'No devotee registrations recorded in this period.',
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const hasData = Array.isArray(data) && data.length > 0;
  const totalDevotees = hasData
    ? data.reduce((acc, curr) => acc + (Number(curr[valueKey]) || 0), 0)
    : 0;

  if (!hasData || totalDevotees === 0) {
    return <ChartEmptyState message={emptyMessage} height={height} />;
  }

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const maxValue = Math.max(...values, 2);

  const width = 640;
  const paddingLeft = 38;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x =
      paddingLeft + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const val = Number(d[valueKey]) || 0;
    const y = height - paddingBottom - (val / maxValue) * chartH;
    return { x, y, val, label: d[labelKey], date: d.date };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${
    points[0].x
  },${height - paddingBottom} Z`;

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Legend / Counter */}
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: lineColor }} />
          <span className="text-spiritual-muted font-medium">New Devotee Signups</span>
          <span className="font-semibold text-spiritual-text font-mono text-[11px]">
            ({totalDevotees} in selected period)
          </span>
        </div>

        {hoverIndex !== null && points[hoverIndex] && (
          <div className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            {points[hoverIndex].label}: {points[hoverIndex].val} new devotees
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
          <defs>
            <linearGradient id="regTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={gradientColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = height - paddingBottom - ratio * chartH;
            const val = Math.round(ratio * maxValue);
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
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] fill-spiritual-muted font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#regTrendGradient)" />

          {/* Smooth Line */}
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 5 : 3}
              fill={hoverIndex === i ? lineColor : '#FFFFFF'}
              stroke={lineColor}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}

          {/* X Axis labels */}
          {points.map((pt, i) => {
            if (data.length > 10 && i % 2 !== 0 && i !== points.length - 1) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[9px] fill-spiritual-muted font-mono"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute z-20 pointer-events-none px-2.5 py-1 rounded-xl bg-spiritual-text text-white text-[11px] font-mono shadow-md -translate-x-1/2 -translate-y-full -top-1 border border-gray-700"
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
              top: `${(points[hoverIndex].y / height) * 100}%`,
            }}
          >
            <div className="font-bold text-emerald-400">
              +{points[hoverIndex].val} Devotees
            </div>
            <div className="text-[9px] text-gray-300">{points[hoverIndex].label}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationTrendChart;
