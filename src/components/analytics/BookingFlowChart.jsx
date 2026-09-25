import React, { useState } from 'react';
import { ChartEmptyState } from './ChartStates.jsx';

/**
 * Booking Flow Across Temple Services (3D Sankey-Style Flow Diagram)
 * Shows how bookings flow from Temples -> Services -> Booking Statuses.
 * Features:
 * - 3D dual-layer elevated service cards with tactile depth & gradient fills
 * - Smooth two-tone gradient flow ribbons with subtle ambient depth
 * - Circular hollow ring anchor ports matching the dashboard node design
 * - Perfectly aligned SVG column headers and symmetrical horizontal spans
 * - Interactive hover states with depth elevation and floating stats tooltip
 */
export const BookingFlowChart = ({
  data = {},
  height = 390,
  emptyMessage = 'No booking flow data available for this period.',
}) => {
  const [hoveredFlow, setHoveredFlow] = useState(null); // { type: 't2s'|'s2st', flow, title, subtitle, count, x, y }
  const [hoveredNode, setHoveredNode] = useState(null); // { type: 'temple'|'category'|'status', id }

  // 1. Exclude zero-booking temples dynamically
  const temples = (data.temples || []).filter((t) => (Number(t.count) || 0) > 0);
  const categories = (data.categories || []).filter((c) => (Number(c.count) || 0) > 0);
  const statuses = (data.statuses || []).filter((s) => (Number(s.count) || 0) > 0);

  // Filter flows with count > 0 and valid visible endpoints
  const validTempleIds = new Set(temples.map((t) => t.id));
  const validCatNames = new Set(categories.map((c) => c.name));
  const validStatusKeys = new Set(statuses.map((s) => s.key));

  const templeToServiceFlows = (data.templeToServiceFlows || []).filter(
    (f) => f.count > 0 && validTempleIds.has(f.templeId) && validCatNames.has(f.category)
  );

  const serviceToStatusFlows = (data.serviceToStatusFlows || []).filter(
    (f) => f.count > 0 && validCatNames.has(f.category) && validStatusKeys.has(f.status)
  );

  const totalBookings = data.totalBookings || 0;

  if (totalBookings === 0 || temples.length === 0) {
    return <ChartEmptyState message={emptyMessage} height={height} />;
  }

  // Layout coordinate parameters: spacious SVG dimensions
  const svgWidth = 1000;
  const svgHeight = Math.max(380, height);

  // Column X Coordinates (Equally balanced spans across 1000px canvas)
  const col1X = 250; // Outflow departure point from Temples

  // Service Node Dimensions (Centered at col2CenterX = 500)
  const serviceNodeW = 160;
  const serviceNodeH = 54;
  const col2CenterX = 500; // Exact center of 1000px canvas
  const col2LeftX = col2CenterX - serviceNodeW / 2; // 420
  const col2RightX = col2CenterX + serviceNodeW / 2; // 580

  // Status Node Coordinates
  const col3X = 760; // Inflow point

  // Dynamic Y positioning: Temples
  const tCount = temples.length;
  const tSpacing = tCount > 1 ? 74 : 0;
  const tStartY = (svgHeight - (tCount - 1) * tSpacing) / 2 + 10;
  const templeYMap = new Map();
  temples.forEach((t, i) => {
    templeYMap.set(t.id, tStartY + i * tSpacing);
  });

  // Dynamic Y positioning: Services
  const cCount = categories.length;
  const cSpacing = cCount > 1 ? 76 : 0;
  const cStartY = (svgHeight - (cCount - 1) * cSpacing) / 2 + 10;
  const catYMap = new Map();
  categories.forEach((c, i) => {
    catYMap.set(c.name, cStartY + i * cSpacing);
  });

  // Dynamic Y positioning: Booking Statuses
  const sCount = statuses.length;
  const sSpacing = sCount > 1 ? 92 : 0;
  const sStartY = (svgHeight - (sCount - 1) * sSpacing) / 2 + 10;
  const statusYMap = new Map();
  statuses.forEach((s, i) => {
    statusYMap.set(s.key, sStartY + i * sSpacing);
  });

  // Maximum flow volume for proportional ribbon scaling
  const maxFlow = Math.max(
    ...templeToServiceFlows.map((f) => f.count),
    ...serviceToStatusFlows.map((f) => f.count),
    1
  );

  return (
    <div className="relative w-full overflow-hidden select-none py-1">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => {
          setHoveredFlow(null);
          setHoveredNode(null);
        }}
      >
        <defs>
          {/* 3D Tactile Card Drop Shadow */}
          <filter
            id="serviceCard3DShadow"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
          >
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#1E1206" floodOpacity="0.08" />
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#1E1206" floodOpacity="0.05" />
          </filter>

          {/* Elevated 3D Hover Shadow */}
          <filter
            id="serviceCardHover3DShadow"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
          >
            <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#1E1206" floodOpacity="0.16" />
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#1E1206" floodOpacity="0.08" />
          </filter>

          {/* Flow Ribbon 3D Depth Shadow */}
          <filter
            id="flowRibbonShadow"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
          >
            <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#1E1206" floodOpacity="0.15" />
          </filter>

          {/* Node drop shadow */}
          <filter
            id="flowNodeShadow"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
          >
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#261408" floodOpacity="0.18" />
          </filter>

          {/* Smooth Two-Tone Gradients for Temple -> Service flows */}
          {templeToServiceFlows.map((flow, idx) => {
            const temple = temples.find((t) => t.id === flow.templeId);
            const cat = categories.find((c) => c.name === flow.category);
            return (
              <linearGradient
                key={`grad-t2s-${idx}`}
                id={`flowGrad-t2s-${idx}`}
                gradientUnits="userSpaceOnUse"
                x1={col1X}
                y1="0"
                x2={col2LeftX}
                y2="0"
              >
                <stop offset="0%" stopColor={temple?.color || '#D97706'} />
                <stop offset="100%" stopColor={cat?.color || '#F59E0B'} />
              </linearGradient>
            );
          })}

          {/* Smooth Two-Tone Gradients for Service -> Status flows */}
          {serviceToStatusFlows.map((flow, idx) => {
            const cat = categories.find((c) => c.name === flow.category);
            const status = statuses.find((s) => s.key === flow.status);
            return (
              <linearGradient
                key={`grad-s2st-${idx}`}
                id={`flowGrad-s2st-${idx}`}
                gradientUnits="userSpaceOnUse"
                x1={col2RightX}
                y1="0"
                x2={col3X}
                y2="0"
              >
                <stop offset="0%" stopColor={cat?.color || '#F59E0B'} />
                <stop offset="100%" stopColor={status?.color || '#059669'} />
              </linearGradient>
            );
          })}
        </defs>

        {/* ---------------------------------------------------- */}
        {/* COLUMN HEADER LABELS (Integrated in SVG)             */}
        {/* ---------------------------------------------------- */}
        <text
          x={28}
          y={22}
          className="text-[11px] font-sans font-bold fill-slate-400 tracking-wider uppercase"
        >
          Temples
        </text>

        <text
          x={col2CenterX}
          y={22}
          textAnchor="middle"
          className="text-[11px] font-sans font-bold fill-slate-400 tracking-wider uppercase"
        >
          Services
        </text>

        <text
          x={col3X + 16}
          y={22}
          className="text-[11px] font-sans font-bold fill-slate-400 tracking-wider uppercase"
        >
          Booking Status
        </text>

        {/* ---------------------------------------------------- */}
        {/* RIBBON FLOWS: TEMPLE -> SERVICES                     */}
        {/* ---------------------------------------------------- */}
        {templeToServiceFlows.map((flow, idx) => {
          const y1 = templeYMap.get(flow.templeId);
          const y2 = catYMap.get(flow.category);
          if (y1 === undefined || y2 === undefined) return null;

          const temple = temples.find((t) => t.id === flow.templeId);
          const ribbonW = Math.max(3, Math.min(22, (flow.count / maxFlow) * 22));

          const isHighlighted =
            (hoveredFlow?.type === 't2s' &&
              hoveredFlow.flow.templeId === flow.templeId &&
              hoveredFlow.flow.category === flow.category) ||
            (hoveredNode &&
              ((hoveredNode.type === 'temple' && hoveredNode.id === flow.templeId) ||
                (hoveredNode.type === 'category' && hoveredNode.id === flow.category)));

          const isDimmed =
            (hoveredFlow && !isHighlighted) ||
            (hoveredNode &&
              !((hoveredNode.type === 'temple' && hoveredNode.id === flow.templeId) ||
                (hoveredNode.type === 'category' && hoveredNode.id === flow.category)));

          const dx = (col2LeftX - col1X) * 0.5;
          const pathD = `M ${col1X} ${y1} C ${col1X + dx} ${y1}, ${col2LeftX - dx} ${y2}, ${col2LeftX} ${y2}`;
          const midX = (col1X + col2LeftX) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <path
              key={`t2s-${idx}`}
              d={pathD}
              fill="none"
              stroke={`url(#flowGrad-t2s-${idx})`}
              strokeWidth={isHighlighted ? ribbonW + 2.5 : ribbonW}
              strokeOpacity={isHighlighted ? 0.95 : isDimmed ? 0.06 : 0.38}
              strokeLinecap="round"
              filter={isHighlighted ? 'url(#flowRibbonShadow)' : undefined}
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() =>
                setHoveredFlow({
                  type: 't2s',
                  flow,
                  title: temple?.name || 'Temple',
                  subtitle: flow.category,
                  count: flow.count,
                  x: midX,
                  y: midY,
                })
              }
              onMouseLeave={() => setHoveredFlow(null)}
            />
          );
        })}

        {/* ---------------------------------------------------- */}
        {/* RIBBON FLOWS: SERVICES -> BOOKING STATUS             */}
        {/* ---------------------------------------------------- */}
        {serviceToStatusFlows.map((flow, idx) => {
          const y1 = catYMap.get(flow.category);
          const y2 = statusYMap.get(flow.status);
          if (y1 === undefined || y2 === undefined) return null;

          const status = statuses.find((s) => s.key === flow.status);
          const ribbonW = Math.max(3, Math.min(22, (flow.count / maxFlow) * 22));

          const isHighlighted =
            (hoveredFlow?.type === 's2st' &&
              hoveredFlow.flow.category === flow.category &&
              hoveredFlow.flow.status === flow.status) ||
            (hoveredNode &&
              ((hoveredNode.type === 'category' && hoveredNode.id === flow.category) ||
                (hoveredNode.type === 'status' && hoveredNode.id === flow.status)));

          const isDimmed =
            (hoveredFlow && !isHighlighted) ||
            (hoveredNode &&
              !((hoveredNode.type === 'category' && hoveredNode.id === flow.category) ||
                (hoveredNode.type === 'status' && hoveredNode.id === flow.status)));

          const dx = (col3X - col2RightX) * 0.5;
          const pathD = `M ${col2RightX} ${y1} C ${col2RightX + dx} ${y1}, ${col3X - dx} ${y2}, ${col3X} ${y2}`;
          const midX = (col2RightX + col3X) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <path
              key={`s2st-${idx}`}
              d={pathD}
              fill="none"
              stroke={`url(#flowGrad-s2st-${idx})`}
              strokeWidth={isHighlighted ? ribbonW + 2.5 : ribbonW}
              strokeOpacity={isHighlighted ? 0.95 : isDimmed ? 0.06 : 0.38}
              strokeLinecap="round"
              filter={isHighlighted ? 'url(#flowRibbonShadow)' : undefined}
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() =>
                setHoveredFlow({
                  type: 's2st',
                  flow,
                  title: flow.category,
                  subtitle: status?.label || flow.status,
                  count: flow.count,
                  x: midX,
                  y: midY,
                })
              }
              onMouseLeave={() => setHoveredFlow(null)}
            />
          );
        })}

        {/* ---------------------------------------------------- */}
        {/* COLUMN 1: TEMPLES (Left)                             */}
        {/* ---------------------------------------------------- */}
        {temples.map((temple) => {
          const y = templeYMap.get(temple.id);
          const isHovered = hoveredNode?.type === 'temple' && hoveredNode?.id === temple.id;

          return (
            <g
              key={temple.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode({ type: 'temple', id: temple.id })}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Vertical Color Pillar Accent */}
              <line
                x1={28}
                y1={y - 15}
                x2={28}
                y2={y + 15}
                stroke={temple.color || '#D97706'}
                strokeWidth={isHovered ? 4.5 : 3.5}
                strokeLinecap="round"
                className="transition-all duration-150"
              />

              {/* Temple Name */}
              <text
                x={40}
                y={y - 3}
                className={`text-[13.5px] font-sans transition-colors ${
                  isHovered ? 'font-bold fill-slate-900' : 'font-semibold fill-slate-800'
                }`}
              >
                {temple.name.length > 34 ? `${temple.name.slice(0, 32)}…` : temple.name}
              </text>

              {/* Booking Count */}
              <text
                x={40}
                y={y + 15}
                className="text-[12px] font-mono font-bold fill-slate-500"
              >
                {temple.count}
              </text>

              {/* Departure Outflow 3D Anchor Ring Port */}
              <circle
                cx={col1X}
                cy={y}
                r={isHovered ? 5.5 : 4.5}
                fill="#FFFFFF"
                stroke={temple.color || '#D97706'}
                strokeWidth={isHovered ? 3 : 2.5}
                filter="url(#flowNodeShadow)"
                className="transition-all duration-150"
              />
            </g>
          );
        })}

        {/* ---------------------------------------------------- */}
        {/* COLUMN 2: SERVICES (Center - Tactile 3D Cards)       */}
        {/* ---------------------------------------------------- */}
        {categories.map((cat) => {
          const y = catYMap.get(cat.name);
          const isHovered = hoveredNode?.type === 'category' && hoveredNode?.id === cat.name;

          return (
            <g
              key={cat.name}
              className="cursor-pointer"
              transform={isHovered ? `translate(0, -2)` : undefined}
              onMouseEnter={() => setHoveredNode({ type: 'category', id: cat.name })}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* 3D Card Base with Bevel Drop Shadow */}
              <rect
                x={col2LeftX}
                y={y - serviceNodeH / 2}
                width={serviceNodeW}
                height={serviceNodeH}
                rx={12}
                fill="#FFFFFF"
                stroke={cat.color || '#F59E0B'}
                strokeWidth={isHovered ? 2.5 : 1.5}
                filter={isHovered ? 'url(#serviceCardHover3DShadow)' : 'url(#serviceCard3DShadow)'}
                className="transition-all duration-200"
              />

              {/* Subtle 3D Top-to-Bottom Tint Overlay */}
              <rect
                x={col2LeftX + 1.5}
                y={y - serviceNodeH / 2 + 1.5}
                width={serviceNodeW - 3}
                height={serviceNodeH - 3}
                rx={11}
                fill={cat.color || '#F59E0B'}
                fillOpacity={isHovered ? 0.12 : 0.05}
                className="transition-all duration-200 pointer-events-none"
              />

              {/* Left Inflow 3D Ring Anchor Port */}
              <circle
                cx={col2LeftX}
                cy={y}
                r={isHovered ? 5.5 : 4.5}
                fill="#FFFFFF"
                stroke={cat.color || '#F59E0B'}
                strokeWidth={isHovered ? 3 : 2.5}
                filter="url(#flowNodeShadow)"
                className="transition-all duration-150"
              />

              {/* Right Outflow 3D Ring Anchor Port */}
              <circle
                cx={col2RightX}
                cy={y}
                r={isHovered ? 5.5 : 4.5}
                fill="#FFFFFF"
                stroke={cat.color || '#F59E0B'}
                strokeWidth={isHovered ? 3 : 2.5}
                filter="url(#flowNodeShadow)"
                className="transition-all duration-150"
              />

              {/* Service Name */}
              <text
                x={col2CenterX}
                y={y - 4}
                textAnchor="middle"
                className="text-[14px] font-sans font-bold fill-slate-800 tracking-tight pointer-events-none"
              >
                {cat.name}
              </text>

              {/* Booking Count */}
              <text
                x={col2CenterX}
                y={y + 14}
                textAnchor="middle"
                className="text-[12.5px] font-mono font-bold pointer-events-none"
                fill={cat.color || '#D97706'}
              >
                {cat.count}
              </text>
            </g>
          );
        })}

        {/* ---------------------------------------------------- */}
        {/* COLUMN 3: BOOKING STATUS (Right - Tactile Badges)     */}
        {/* ---------------------------------------------------- */}
        {statuses.map((status) => {
          const y = statusYMap.get(status.key);
          const isHovered = hoveredNode?.type === 'status' && hoveredNode?.id === status.key;

          return (
            <g
              key={status.key}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode({ type: 'status', id: status.key })}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Inflow 3D Ring Anchor Port */}
              <circle
                cx={col3X}
                cy={y}
                r={isHovered ? 5.5 : 4.5}
                fill="#FFFFFF"
                stroke={status.color}
                strokeWidth={isHovered ? 3 : 2.5}
                filter="url(#flowNodeShadow)"
                className="transition-all duration-150"
              />

              {/* Vertical Status Pillar */}
              <line
                x1={col3X + 10}
                y1={y - 16}
                x2={col3X + 10}
                y2={y + 16}
                stroke={status.color}
                strokeWidth={isHovered ? 5.5 : 4}
                strokeLinecap="round"
                className="transition-all duration-150"
              />

              {/* Status Label */}
              <text
                x={col3X + 24}
                y={y - 3}
                className="text-[14px] font-sans font-bold fill-slate-800 tracking-tight"
              >
                {status.label}
              </text>

              {/* Status Count */}
              <text
                x={col3X + 24}
                y={y + 15}
                className="text-[13px] font-mono font-bold"
                fill={status.color}
              >
                {status.count}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip for Flows */}
      {hoveredFlow && (
        <div
          className="absolute z-30 pointer-events-none px-3.5 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-sans shadow-2xl border border-gray-700 -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${(hoveredFlow.x / svgWidth) * 100}%`,
            top: `${(hoveredFlow.y / svgHeight) * 100}%`,
          }}
        >
          <div className="font-semibold text-gray-200">
            {hoveredFlow.title} <span className="text-gray-400">→</span> {hoveredFlow.subtitle}
          </div>
          <div className="text-amber-300 font-mono font-bold text-xs mt-0.5">
            {hoveredFlow.count} {hoveredFlow.count === 1 ? 'booking' : 'bookings'}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFlowChart;
