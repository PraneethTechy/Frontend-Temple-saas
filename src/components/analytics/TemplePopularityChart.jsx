import React, { useState } from 'react';
import { ChartEmptyState } from './ChartStates.jsx';

// Canonical deity / shrine palette matching Image 2 reference exactly
const TEMPLE_COLOR_MAP = {
  arunachaleswarar: '#DA8B18', // Warm Golden Ochre
  subramania: '#8B1D3B', // Deep Wine / Crimson
  'subramania swamy': '#8B1D3B',
  brihadeeswarar: '#8B42B8', // Royal Purple / Violet
  meenakshi: '#0284C7', // Sky / Ocean Blue
  'meenakshi sundareswarar': '#0284C7',
  rameswaram: '#059669', // Emerald Green
  ramanathaswamy: '#059669',
};

const DEFAULT_PALETTE = ['#DA8B18', '#8B1D3B', '#8B42B8', '#0284C7', '#059669', '#D97706'];

/**
 * Temple Popularity Trend (3D Bump / Rank Line Chart)
 * Replicates the visual design of Image 2 reference:
 * - Each line directly points to its corresponding name on the right side at its final rank Y-position
 * - Tactile 3D tube effect on hover with underside shadow, depth extrusion, and specular highlight core
 * - Hollow ring nodes with white centers and colored borders that pop in 3D on hover
 * - Mini gopuram temple shrine icon badge next to each name
 * - Wide invisible hit-box for effortless hover detection
 * - Clean Rank Y-axis (1 to 5) with subtle horizontal dashed guides
 */
export const TemplePopularityChart = ({
  data = {},
  height = 220,
  emptyMessage = 'No historical ranking data available for this period.',
}) => {
  const [hoveredTempleId, setHoveredTempleId] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null); // { templeName, label, rank, count, x, y }

  const checkpoints = data.checkpoints || [];
  const rawSeries = data.series || [];

  if (!rawSeries || rawSeries.length === 0 || checkpoints.length === 0) {
    return <ChartEmptyState message={emptyMessage} height={height} />;
  }

  // Helper to remove redundant trailing "Temple" for clean untruncated display (Image 2 style)
  const formatTempleName = (name) => {
    if (!name) return 'Temple';
    return name.replace(/\s+Temple$/i, '').trim();
  };

  // Dimensions
  const svgWidth = 1100;
  const svgHeight = 220;

  const paddingLeft = 70;
  const paddingRight = 250; // Dedicated space for untruncated right legend
  const paddingTop = 24;
  const paddingBottom = 32;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Maximum rank among active series (e.g. 4 or 5)
  const maxRank = Math.max(
    ...rawSeries.flatMap((s) => s.ranks.map((r) => r.rank)),
    rawSeries.length,
    4
  );

  const rankPositions = Array.from({ length: maxRank }, (_, i) => i + 1);

  // Helper to calculate Y for rank (Rank 1 -> paddingTop, Rank maxRank -> paddingTop + chartH)
  const getYForRank = (rank) => {
    const clamped = Math.max(1, Math.min(maxRank, rank));
    return paddingTop + ((clamped - 1) / Math.max(maxRank - 1, 1)) * chartH;
  };

  // Helper to calculate X for checkpoint index
  const getXForIndex = (idx) => {
    if (checkpoints.length === 1) return paddingLeft + chartW / 2;
    return paddingLeft + (idx / (checkpoints.length - 1)) * chartW;
  };

  // Normalize series with Image 2 deity color mapping and clean names
  const series = rawSeries.map((s, idx) => {
    const displayName = formatTempleName(s.templeName);
    const key = displayName.toLowerCase();
    const color = s.color || TEMPLE_COLOR_MAP[key] || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];

    // Compute final rank (at last checkpoint) for right-side alignment
    const finalRank = s.ranks && s.ranks.length > 0 ? s.ranks[s.ranks.length - 1].rank : idx + 1;
    const finalY = getYForRank(finalRank);

    return {
      ...s,
      displayName,
      color,
      finalRank,
      finalY,
    };
  });

  return (
    <div className="relative w-full overflow-hidden select-none py-1">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          {/* Subtle base shadow under non-hovered lines (userSpaceOnUse ensures 0-height horizontal lines never clip) */}
          <filter
            id="popularityLineBaseShadow"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
          >
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#261408" floodOpacity="0.1" />
          </filter>

          {/* Clean 3D Shadow for Highlighted Line (userSpaceOnUse avoids bounding-box collapse) */}
          <filter
            id="popularityLine3DDepth"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
          >
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0F172A" floodOpacity="0.25" />
          </filter>

          {/* Node 3D drop shadow */}
          <filter
            id="nodeDropShadow"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
          >
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#261408" floodOpacity="0.18" />
          </filter>

          {/* Active Node Elevated 3D shadow */}
          <filter
            id="activeNode3DShadow"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
          >
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1F0E04" floodOpacity="0.32" />
          </filter>
        </defs>

        {/* Y Axis Guide Lines & Labels (Rank 1 to maxRank) */}
        {rankPositions.map((rank) => {
          const y = getYForRank(rank);

          return (
            <g key={rank}>
              {/* Horizontal grid line */}
              <line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + chartW}
                y2={y}
                stroke="#EFEBE4"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Rank number */}
              <text
                x={paddingLeft - 12}
                y={y + 3.5}
                textAnchor="end"
                className="text-[11px] font-mono fill-slate-500 font-bold"
              >
                {rank}
              </text>
            </g>
          );
        })}

        {/* Y-Axis Title: "Rank" */}
        <text
          x={paddingLeft - 32}
          y={paddingTop - 10}
          textAnchor="start"
          className="text-[11px] font-bold fill-slate-600 font-sans tracking-tight"
        >
          Rank
        </text>

        {/* X-Axis Dates */}
        {checkpoints.map((cp, idx) => {
          const x = getXForIndex(idx);

          return (
            <text
              key={idx}
              x={x}
              y={svgHeight - 10}
              textAnchor="middle"
              className="text-[10.5px] font-sans font-medium fill-slate-500"
            >
              {cp.label}
            </text>
          );
        })}

        {/* ---------------------------------------------------- */}
        {/* TEMPLE RANK LINES & HOLLOW RING NODES               */}
        {/* ---------------------------------------------------- */}
        {series.map((temple) => {
          const isHighlighted = hoveredTempleId === temple.templeId;
          const isDimmed = hoveredTempleId && hoveredTempleId !== temple.templeId;
          const strokeColor = temple.color;

          // Generate coordinates for this temple across checkpoints
          const pts = temple.ranks.map((r, idx) => ({
            x: getXForIndex(idx),
            y: getYForRank(r.rank),
            rank: r.rank,
            count: r.count,
            label: r.label,
          }));

          const pathD = pts.reduce((acc, pt, i) => {
            if (i === 0) return `M ${pt.x} ${pt.y}`;
            const prev = pts[i - 1];
            const midX = (prev.x + pt.x) / 2;
            return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
          }, '');

          const lastPt = pts[pts.length - 1];

          return (
            <g
              key={temple.templeId}
              onMouseEnter={() => setHoveredTempleId(temple.templeId)}
              onMouseLeave={() => {
                setHoveredTempleId(null);
                setHoveredPoint(null);
              }}
              className="cursor-pointer"
            >
              {/* Invisible Wide Hit Area for effortless hovering */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                className="cursor-pointer"
              />

              {/* Main Line with 3D Depth Shadow */}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isHighlighted ? 4.5 : 2.5}
                strokeOpacity={isHighlighted ? 1 : isDimmed ? 0.15 : 0.9}
                strokeLinecap="round"
                filter={isHighlighted ? 'url(#popularityLine3DDepth)' : undefined}
                className="transition-all duration-150"
              />

              {/* 3D Specular Center Highlight Core (gives cylindrical pipe/tube feel on hover without washing out color) */}
              {isHighlighted && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              )}

              {/* Connector line leading from last checkpoint node directly into its right-side name */}
              {lastPt && (
                <line
                  x1={lastPt.x}
                  y1={temple.finalY}
                  x2={paddingLeft + chartW + 18}
                  y2={temple.finalY}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 2.5 : 1.25}
                  strokeDasharray={isHighlighted ? 'none' : '3 3'}
                  strokeOpacity={isHighlighted ? 1 : isDimmed ? 0.15 : 0.45}
                  className="transition-all duration-150"
                />
              )}

              {/* Hollow Ring Nodes (White center + bold colored border) */}
              {pts.map((pt, pIdx) => {
                const isPointHovered =
                  hoveredPoint?.templeName === temple.templeName &&
                  hoveredPoint?.label === pt.label;

                return (
                  <g key={pIdx}>
                    {/* Outer 3D Ring */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isPointHovered ? 6.5 : isHighlighted ? 5.5 : 4.5}
                      fill="#FFFFFF"
                      stroke={strokeColor}
                      strokeWidth={isPointHovered ? 3.5 : isHighlighted ? 3 : 2.5}
                      strokeOpacity={isDimmed ? 0.25 : 1}
                      filter={isHighlighted ? 'url(#activeNode3DShadow)' : 'url(#nodeDropShadow)'}
                      className="transition-all duration-150"
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        setHoveredTempleId(temple.templeId);
                        setHoveredPoint({
                          templeName: temple.templeName,
                          label: pt.label,
                          rank: pt.rank,
                          count: pt.count,
                          x: pt.x,
                          y: pt.y,
                        });
                      }}
                    />
                    {/* Raised 3D Inner Center Bead on Hover */}
                    {isHighlighted && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isPointHovered ? 2.5 : 2}
                        fill={strokeColor}
                        className="pointer-events-none"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* ---------------------------------------------------- */}
        {/* RIGHT LEGEND LIST: EACH NAME ALIGNED WITH ITS LINE  */}
        {/* (Directly at each temple's final rank Y coordinate)   */}
        {/* ---------------------------------------------------- */}
        {series.map((temple) => {
          const isHighlighted = hoveredTempleId === temple.templeId;
          const isDimmed = hoveredTempleId && hoveredTempleId !== temple.templeId;
          const targetY = temple.finalY;

          return (
            <g
              key={temple.templeId}
              transform={`translate(${paddingLeft + chartW + 24}, ${targetY})`}
              className="cursor-pointer select-none"
              opacity={isDimmed ? 0.3 : 1}
              onMouseEnter={() => setHoveredTempleId(temple.templeId)}
              onMouseLeave={() => setHoveredTempleId(null)}
            >
              {/* Colored Dot at line endpoint */}
              <circle
                cx={0}
                cy={0}
                r={isHighlighted ? 4.5 : 3.5}
                fill={temple.color}
                filter="url(#nodeDropShadow)"
              />

              {/* Miniature Gopuram Shrine Avatar Badge (Pure SVG geometry centered at cy=0) */}
              <g transform="translate(10, -9)">
                <circle
                  cx={9}
                  cy={9}
                  r={9}
                  fill="#FFF7ED"
                  stroke={isHighlighted ? temple.color : '#FDE68A'}
                  strokeWidth={isHighlighted ? 1.5 : 1}
                  filter="url(#nodeDropShadow)"
                />
                {/* Crisp Gopuram Shrine Silhouette Icon */}
                <path
                  d="M9 3.2L6.8 6.5h4.4L9 3.2zm-2.5 3.8L4.8 10h8.4L11.5 7H6.5zm-1.8 3.5L3.2 13.8h11.6L13.3 10.5H4.7zm-1.2 3.8V15.5h11v-1.2H3.5z"
                  fill="#B45309"
                />
              </g>

              {/* Full Untruncated Temple Name vertically centered at targetY */}
              <text
                x={36}
                y={0}
                dominantBaseline="central"
                className={`text-[12px] font-sans transition-all duration-150 ${
                  isHighlighted
                    ? 'font-bold fill-slate-900 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]'
                    : 'font-semibold fill-slate-700'
                }`}
                style={{
                  transform: isHighlighted ? 'scale(1.04)' : 'scale(1)',
                  transformOrigin: `36px 0px`,
                }}
              >
                {temple.displayName}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-30 pointer-events-none px-3.5 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-sans shadow-2xl border border-gray-700 -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
            top: `${(hoveredPoint.y / svgHeight) * 100}%`,
          }}
        >
          <div className="font-bold text-gray-100">{hoveredPoint.templeName}</div>
          <div className="flex items-center gap-2 mt-0.5 text-[10.5px] font-mono">
            <span className="text-amber-300 font-bold">Rank #{hoveredPoint.rank}</span>
            <span className="text-gray-400">•</span>
            <span className="text-emerald-400 font-semibold">{hoveredPoint.count} confirmed bookings</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">{hoveredPoint.label}</div>
        </div>
      )}
    </div>
  );
};

export default TemplePopularityChart;
