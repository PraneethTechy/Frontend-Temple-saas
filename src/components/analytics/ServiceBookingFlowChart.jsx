import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * ServiceBookingFlowChart
 * 
 * Innovative, attractive, and balanced node-and-connector booking flow visualization for Temple Authority:
 * Flow Structure: SERVICES (Left Column) ──── Flow Ribbons ────► BOOKING STATUS (Right Column)
 * 
 * Features:
 * - Dynamic height adapting generously to service count (no squeezed or overlapping cards)
 * - Spacious service cards (220px) preventing text truncation
 * - Balanced status cards on the right with formatted metrics and percentage shares
 * - Elegant cubic Bezier flow streams with dual-tone gradient ribbons
 * - Interactive hover focus: highlights connected service, stream, and status simultaneously
 * - Rich floating glass tooltip with service, status, volume, and percentage contribution
 * - Executive header summary badge strip (Confirmed rate, Services count, Total bookings)
 */
export const ServiceBookingFlowChart = ({
  data = {},
  title = 'Booking Flow Across Services',
  subtitle = 'Booking distribution across your temple services and current status.',
  periodBadge = 'Last 30 Days',
  height,
}) => {
  const [hoveredFlow, setHoveredFlow] = useState(null); // { serviceId, status, serviceName, statusLabel, count, percent, x, y }
  const [hoveredNode, setHoveredNode] = useState(null); // { type: 'service' | 'status', id: string }

  const services = data.services || [];
  const statuses = data.statuses || [];
  const flows = data.flows || [];
  const totalBookings = Number(data.totalBookings) || 0;

  // Check if there is any booking activity at all
  const hasBookings = totalBookings > 0 && flows.some((f) => (Number(f.count) || 0) > 0);

  // Status mapping for quick lookups and standard colors
  const statusColorMap = {
    CONFIRMED: '#059669', // Emerald
    PENDING: '#D97706',   // Amber
    CANCELLED: '#E11D48', // Rose
  };

  const statusLabelMap = {
    CONFIRMED: 'Confirmed',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled',
  };

  // SVG Dimension & Coordinate System
  const svgWidth = 920;
  const serviceCount = Math.max(services.length, 1);
  const statusCount = Math.max(statuses.length, 1);

  // Dynamic vertical sizing: each service card gets 52px height + 18px margin = 70px slot
  const serviceCardH = 50;
  const serviceCardW = 210;
  const cardSlotHeight = 68;
  const topPad = 64;
  const bottomPad = 48;

  // Generous height calculation so cards sit freely with no overlap
  const calculatedHeight = topPad + serviceCount * cardSlotHeight + bottomPad;
  const svgHeight = height || Math.max(520, calculatedHeight);

  // Usable vertical drawing space
  const usableHeight = svgHeight - topPad - bottomPad;

  // Geometry: Columns
  // Left Column: Services
  const col1LeftX = 36;
  const col1RightX = col1LeftX + serviceCardW; // 246px

  // Right Column: Booking Status Cards
  const statusCardW = 180;
  const statusCardH = 50;
  const col2RightX = svgWidth - 36; // 884px
  const col2LeftX = col2RightX - statusCardW; // 704px

  // Services Y positions: spaced evenly with comfortable breathing room
  const serviceSpacing = serviceCount > 1 ? (serviceCount - 1) * cardSlotHeight : 0;
  const serviceStartY = topPad + (usableHeight - serviceSpacing) / 2;
  const serviceYMap = new Map();
  services.forEach((s, idx) => {
    const y = serviceCount === 1 ? topPad + usableHeight / 2 : serviceStartY + idx * cardSlotHeight;
    serviceYMap.set(s.id, y);
  });

  // Statuses Y positions: centered gracefully along the right side
  const statusSpan = Math.min(usableHeight * 0.72, Math.max(220, (statusCount - 1) * 115));
  const statusStartY = topPad + (usableHeight - statusSpan) / 2;
  const statusStep = statusCount > 1 ? statusSpan / (statusCount - 1) : 0;
  const statusYMap = new Map();
  statuses.forEach((st, idx) => {
    const y = statusCount === 1 ? topPad + usableHeight / 2 : statusStartY + idx * statusStep;
    statusYMap.set(st.key, y);
  });

  // Maximum flow volume for proportional ribbon scaling
  const maxFlow = Math.max(...flows.map((f) => Number(f.count) || 0), 1);

  // Maps for quick lookup
  const serviceObjMap = new Map(services.map((s) => [s.id, s]));
  const statusObjMap = new Map(statuses.map((st) => [st.key, st]));

  // Calculate summary metrics for header
  const confirmedStatus = statuses.find((st) => st.key === 'CONFIRMED' || st.label?.toLowerCase() === 'confirmed');
  const confirmedCount = confirmedStatus ? Number(confirmedStatus.count) || 0 : 0;
  const confirmedPercent = totalBookings > 0 ? ((confirmedCount / totalBookings) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-2xl bg-white border border-[#EAE0D0] p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] select-none">
      {/* Header with Title, Subtitle, and Quick Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F0EAE1]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Quick Summary Strip */}
        <div className="flex flex-wrap items-center gap-2">
          {totalBookings > 0 && (
            <>
              <div className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{confirmedCount} Confirmed ({confirmedPercent}%)</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80">
                <span className="font-semibold text-slate-900">{services.length}</span> Services
              </div>
              <div className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/70">
                {totalBookings} Total Bookings
              </div>
            </>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FAF7F2] text-amber-900 border border-[#EAE0D0]">
            {periodBadge}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {!hasBookings ? (
        /* Empty State */
        <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EAE0D0] flex items-center justify-center text-amber-700/70 mb-3 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No booking activity yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Booking activity will appear here when devotees make reservations for your temple services.
          </p>
        </div>
      ) : (
        /* Node & Connector Flow Chart */
        <div className="relative w-full overflow-x-auto pt-3">
          <div className="min-w-[760px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
              onMouseLeave={() => {
                setHoveredFlow(null);
                setHoveredNode(null);
              }}
            >
              <defs>
                {/* Subtle drop shadow filter for floating cards */}
                <filter id="flow-card-shadow" x="-8%" y="-15%" width="120%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.05" />
                </filter>
                <filter id="flow-card-hover" x="-10%" y="-20%" width="125%" height="150%">
                  <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.09" />
                </filter>

                {/* Linear Gradients for Flow Curves */}
                {flows.map((flow, idx) => {
                  const sColor = serviceObjMap.get(flow.serviceId)?.color || '#D97706';
                  const stColor = statusColorMap[flow.status] || statusObjMap.get(flow.status)?.color || '#64748B';
                  return (
                    <linearGradient
                      key={`grad-${flow.serviceId}-${flow.status}-${idx}`}
                      id={`flow-grad-${flow.serviceId}-${flow.status}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor={sColor} />
                      <stop offset="100%" stopColor={stColor} />
                    </linearGradient>
                  );
                })}
              </defs>

              {/* Column Header Titles */}
              <text
                x={col1LeftX}
                y={32}
                className="text-[11px] font-sans font-bold fill-slate-400 tracking-wider uppercase"
              >
                Services ({services.length})
              </text>

              <text
                x={col2LeftX}
                y={32}
                className="text-[11px] font-sans font-bold fill-slate-400 tracking-wider uppercase"
              >
                Booking Status
              </text>

              {/* Smooth Curved Flow Ribbons */}
              {flows.map((flow, idx) => {
                const y1 = serviceYMap.get(flow.serviceId);
                const y2 = statusYMap.get(flow.status);
                if (y1 === undefined || y2 === undefined) return null;

                const count = Number(flow.count) || 0;
                if (count <= 0) return null;

                const service = serviceObjMap.get(flow.serviceId);
                const status = statusObjMap.get(flow.status);
                const gradId = `url(#flow-grad-${flow.serviceId}-${flow.status})`;

                // Proportional thickness (scaled between 3px and 22px)
                const strokeWidth = Math.max(3, Math.min(22, (count / maxFlow) * 22));

                const isHighlighted =
                  (hoveredFlow &&
                    hoveredFlow.serviceId === flow.serviceId &&
                    hoveredFlow.status === flow.status) ||
                  (hoveredNode &&
                    ((hoveredNode.type === 'service' && hoveredNode.id === flow.serviceId) ||
                      (hoveredNode.type === 'status' && hoveredNode.id === flow.status)));

                const isDimmed =
                  (hoveredFlow && !isHighlighted) ||
                  (hoveredNode &&
                    !((hoveredNode.type === 'service' && hoveredNode.id === flow.serviceId) ||
                      (hoveredNode.type === 'status' && hoveredNode.id === flow.status)));

                // Smooth cubic Bezier curve from service outflow to status inflow
                const dx = (col2LeftX - col1RightX) * 0.48;
                const pathD = `M ${col1RightX} ${y1} C ${col1RightX + dx} ${y1}, ${col2LeftX - dx} ${y2}, ${col2LeftX} ${y2}`;
                const midX = (col1RightX + col2LeftX) / 2;
                const midY = (y1 + y2) / 2;

                const serviceBookings = Number(service?.count) || 1;
                const shareOfService = ((count / serviceBookings) * 100).toFixed(0);

                return (
                  <path
                    key={`flow-${flow.serviceId}-${flow.status}-${idx}`}
                    d={pathD}
                    fill="none"
                    stroke={gradId}
                    strokeWidth={isHighlighted ? strokeWidth + 3 : strokeWidth}
                    strokeOpacity={isHighlighted ? 0.92 : isDimmed ? 0.08 : 0.42}
                    strokeLinecap="round"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredFlow({
                        serviceId: flow.serviceId,
                        status: flow.status,
                        serviceName: service?.name || 'Service',
                        statusLabel: status?.label || statusLabelMap[flow.status] || flow.status,
                        count,
                        shareOfService,
                        x: midX,
                        y: midY,
                      })
                    }
                    onMouseLeave={() => setHoveredFlow(null)}
                  />
                );
              })}

              {/* Service Nodes (Left Column) */}
              {services.map((service, idx) => {
                const y = serviceYMap.get(service.id);
                if (y === undefined) return null;

                const isNodeHovered = hoveredNode?.type === 'service' && hoveredNode?.id === service.id;
                const isFlowHighlighted =
                  hoveredFlow && hoveredFlow.serviceId === service.id;
                const isConnected = isNodeHovered || isFlowHighlighted;

                const isDimmed =
                  (hoveredNode && !isConnected && (hoveredNode.type !== 'status' || !flows.some(f => f.serviceId === service.id && f.status === hoveredNode.id))) ||
                  (hoveredFlow && !isFlowHighlighted);

                const bookingCount = Number(service.count) || 0;
                const hasServiceFlows = bookingCount > 0;
                const percentage = totalBookings > 0 ? ((bookingCount / totalBookings) * 100).toFixed(0) : 0;
                const sColor = service.color || '#D97706';

                return (
                  <g
                    key={`service-node-${service.id}`}
                    className="cursor-pointer"
                    opacity={isDimmed ? 0.45 : 1}
                    onMouseEnter={() => setHoveredNode({ type: 'service', id: service.id })}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Spacious Card Background */}
                    <rect
                      x={col1LeftX}
                      y={y - serviceCardH / 2}
                      width={serviceCardW}
                      height={serviceCardH}
                      rx={10}
                      fill="#FFFFFF"
                      stroke={isConnected ? sColor : '#E7DFD4'}
                      strokeWidth={isConnected ? 2 : 1.2}
                      filter={isConnected ? 'url(#flow-card-hover)' : 'url(#flow-card-shadow)'}
                      className="transition-all duration-200"
                    />

                    {/* Subtle tinted background fill */}
                    <rect
                      x={col1LeftX + 1}
                      y={y - serviceCardH / 2 + 1}
                      width={serviceCardW - 2}
                      height={serviceCardH - 2}
                      rx={9}
                      fill={sColor}
                      fillOpacity={isConnected ? 0.08 : 0.025}
                      className="pointer-events-none transition-all duration-200"
                    />

                    {/* Left Accent Bar on Card */}
                    <rect
                      x={col1LeftX}
                      y={y - serviceCardH / 2 + 7}
                      width={4}
                      height={serviceCardH - 14}
                      rx={2}
                      fill={sColor}
                      className="pointer-events-none"
                    />

                    {/* Rank Pill */}
                    <circle
                      cx={col1LeftX + 17}
                      cy={y - 4}
                      r={6.5}
                      fill={sColor}
                      fillOpacity={0.14}
                      stroke={sColor}
                      strokeWidth={0.8}
                    />
                    <text
                      x={col1LeftX + 17}
                      y={y - 1}
                      textAnchor="middle"
                      className="text-[8.5px] font-mono font-bold fill-slate-700 pointer-events-none"
                    >
                      {service.rank || idx + 1}
                    </text>

                    {/* Service Name (Generous 24-character display without clipping) */}
                    <text
                      x={col1LeftX + 29}
                      y={y - 3}
                      className={`text-[12px] font-sans tracking-tight transition-colors pointer-events-none ${
                        isConnected ? 'font-bold fill-slate-900' : 'font-semibold fill-slate-800'
                      }`}
                    >
                      {service.name.length > 23 ? `${service.name.slice(0, 22)}…` : service.name}
                    </text>

                    {/* Service Booking Count & Percent Share */}
                    <text
                      x={col1LeftX + 29}
                      y={y + 13}
                      className="text-[10.5px] font-mono font-medium fill-slate-500 pointer-events-none"
                    >
                      <tspan className="font-semibold fill-slate-700">{bookingCount}</tspan>{' '}
                      {bookingCount === 1 ? 'booking' : 'bookings'}
                      {totalBookings > 0 && (
                        <tspan fill="#94A3B8" className="font-sans"> • {percentage}%</tspan>
                      )}
                    </text>

                    {/* Outflow Anchor Port */}
                    {hasServiceFlows && (
                      <g className="pointer-events-none">
                        <circle
                          cx={col1RightX}
                          cy={y}
                          r={isConnected ? 5.5 : 4}
                          fill="#FFFFFF"
                          stroke={sColor}
                          strokeWidth={isConnected ? 2.5 : 1.8}
                          className="transition-all duration-200"
                        />
                        <circle
                          cx={col1RightX}
                          cy={y}
                          r={isConnected ? 2.5 : 1.8}
                          fill={sColor}
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Status Nodes (Right Column - Balanced Cards) */}
              {statuses.map((status) => {
                const y = statusYMap.get(status.key);
                if (y === undefined) return null;

                const isNodeHovered = hoveredNode?.type === 'status' && hoveredNode?.id === status.key;
                const isFlowHighlighted =
                  hoveredFlow && hoveredFlow.status === status.key;
                const isConnected = isNodeHovered || isFlowHighlighted;

                const isDimmed =
                  (hoveredNode && !isConnected && (hoveredNode.type !== 'service' || !flows.some(f => f.status === status.key && f.serviceId === hoveredNode.id))) ||
                  (hoveredFlow && !isFlowHighlighted);

                const statusCountVal = Number(status.count) || 0;
                const statusColor = statusColorMap[status.key] || status.color || '#64748B';
                const statusPercent = totalBookings > 0 ? ((statusCountVal / totalBookings) * 100).toFixed(0) : 0;

                return (
                  <g
                    key={`status-node-${status.key}`}
                    className="cursor-pointer"
                    opacity={isDimmed ? 0.45 : 1}
                    onMouseEnter={() => setHoveredNode({ type: 'status', id: status.key })}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Status Card Base */}
                    <rect
                      x={col2LeftX}
                      y={y - statusCardH / 2}
                      width={statusCardW}
                      height={statusCardH}
                      rx={10}
                      fill="#FFFFFF"
                      stroke={isConnected ? statusColor : '#E7DFD4'}
                      strokeWidth={isConnected ? 2 : 1.2}
                      filter={isConnected ? 'url(#flow-card-hover)' : 'url(#flow-card-shadow)'}
                      className="transition-all duration-200"
                    />

                    {/* Subtle tinted background fill */}
                    <rect
                      x={col2LeftX + 1}
                      y={y - statusCardH / 2 + 1}
                      width={statusCardW - 2}
                      height={statusCardH - 2}
                      rx={9}
                      fill={statusColor}
                      fillOpacity={isConnected ? 0.08 : 0.025}
                      className="pointer-events-none transition-all duration-200"
                    />

                    {/* Right Accent Bar */}
                    <rect
                      x={col2RightX - 4}
                      y={y - statusCardH / 2 + 7}
                      width={4}
                      height={statusCardH - 14}
                      rx={2}
                      fill={statusColor}
                      className="pointer-events-none"
                    />

                    {/* Status Dot */}
                    <circle
                      cx={col2LeftX + 18}
                      cy={y - 3}
                      r={5.5}
                      fill={statusColor}
                      fillOpacity={0.16}
                      stroke={statusColor}
                      strokeWidth={1}
                    />
                    <circle
                      cx={col2LeftX + 18}
                      cy={y - 3}
                      r={2.5}
                      fill={statusColor}
                    />

                    {/* Status Label */}
                    <text
                      x={col2LeftX + 30}
                      y={y - 3}
                      className={`text-[12.5px] font-sans tracking-tight transition-colors pointer-events-none ${
                        isConnected ? 'font-bold fill-slate-900' : 'font-semibold fill-slate-800'
                      }`}
                    >
                      {status.label || statusLabelMap[status.key] || status.key}
                    </text>

                    {/* Status Count & Share */}
                    <text
                      x={col2LeftX + 30}
                      y={y + 13}
                      className="text-[11px] font-mono pointer-events-none font-bold"
                      fill={statusColor}
                    >
                      {statusCountVal}{' '}
                      <tspan className="font-normal font-sans text-[10.5px] fill-slate-500">
                        {statusCountVal === 1 ? 'ticket' : 'tickets'}
                        {totalBookings > 0 && ` • ${statusPercent}%`}
                      </tspan>
                    </text>

                    {/* Inflow Anchor Port */}
                    <g className="pointer-events-none">
                      <circle
                        cx={col2LeftX}
                        cy={y}
                        r={isConnected ? 5.5 : 4}
                        fill="#FFFFFF"
                        stroke={statusColor}
                        strokeWidth={isConnected ? 2.5 : 1.8}
                        className="transition-all duration-200"
                      />
                      <circle
                        cx={col2LeftX}
                        cy={y}
                        r={isConnected ? 2.5 : 1.8}
                        fill={statusColor}
                      />
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Simple Hover Tooltip for Flow Connections */}
          {hoveredFlow && (
            <div
              className="absolute z-30 pointer-events-none px-3.5 py-2.5 rounded-xl bg-slate-900/95 text-white text-[11.5px] font-sans shadow-xl border border-slate-700/80 -translate-x-1/2 -translate-y-full mb-3 backdrop-blur-xs animate-in fade-in duration-150"
              style={{
                left: `${(hoveredFlow.x / svgWidth) * 100}%`,
                top: `${(hoveredFlow.y / svgHeight) * 100}%`,
              }}
            >
              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span>{hoveredFlow.serviceName}</span>
                <span className="text-slate-400 font-normal">→</span>
                <span className="font-bold text-amber-300">{hoveredFlow.statusLabel}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                <span className="text-white font-bold">{hoveredFlow.count} bookings</span>
                <span className="text-slate-400 text-[10.5px]">({hoveredFlow.shareOfService}% of service)</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/95 rotate-45 border-r border-b border-slate-700/80"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceBookingFlowChart;
