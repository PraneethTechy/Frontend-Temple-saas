import React, { useState, useRef, useEffect, useMemo, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  Building2,
  ChevronDown,
  Info,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { useGetTempleWiseBookingsQuery } from '../../../store/api/adminApi.js';
import { ROUTES } from '../../../constants/routes.js';
import {
  calculateTempleNodeLayout,
  getNodePalette,
  type TempleNodeLayoutItem,
} from '../../../utils/templeBookingLayout.js';

interface TempleGopuramIconProps {
  color?: string;
  className?: string;
}

export interface TempleAggregationItem {
  templeId?: string;
  templeName?: string;
  ticketCount?: number;
  bookingCount?: number;
  percentage?: number;
  rank?: number;
  city?: string;
  state?: string;
  image?: string;
  [key: string]: unknown;
}

export interface TempleBookingAggregationResponse {
  totalTickets?: number;
  totalBookings?: number;
  temples?: TempleAggregationItem[];
}

// Clean Temple Gopuram SVG icon fallback when temple has no photo
const TempleGopuramIcon = ({ color = '#D97706', className = 'w-5 h-5' }: TempleGopuramIconProps): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 2L13.5 4H10.5L12 2Z"
      fill={color}
    />
    <path
      d="M9 5H15L14 8H10L9 5Z"
      fill={color}
      opacity="0.85"
    />
    <path
      d="M7.5 9H16.5L15.5 13H8.5L7.5 9Z"
      fill={color}
      opacity="0.75"
    />
    <path
      d="M6 14H18L17 18H7L6 14Z"
      fill={color}
      opacity="0.9"
    />
    <path
      d="M4 19H20V22H4V19Z"
      fill={color}
    />
    <path
      d="M11 18H13V21H11V18Z"
      fill="#FFFDF9"
    />
  </svg>
);

export interface TempleBookingNetworkProps {
  className?: string;
}

export const TempleBookingNetwork = ({ className = '' }: TempleBookingNetworkProps): ReactElement => {
  const navigate = useNavigate();
  const [range, setRange] = useState<string>('30d');
  const [viewMode, setViewMode] = useState<'radial' | 'list'>('radial');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 960, height: 620 });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Listen to prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // Fetch real backend booking and temple aggregation
  const { data, isLoading, isError, error, refetch } = useGetTempleWiseBookingsQuery({
    range,
  });

  const responseData = (data?.data as TempleBookingAggregationResponse | undefined) || {};
  const totalTickets = Number(responseData.totalTickets) || 0;
  const totalBookings = Number(responseData.totalBookings) || 0;
  const temples = useMemo(() => responseData.temples || [], [responseData.temples]);

  // Track container width and detect mobile layout
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const mobile = w < 680;
        setIsMobile(mobile);
        setDimensions({
          width: w,
          height: mobile ? 500 : Math.min(680, Math.max(580, Math.floor(w * 0.54))),
        });
      }
    };

    handleResize();
    const observer = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const centerRadius = isMobile ? 56 : 68;

  // Calculate dynamic radial node positions with responsive width
  const layoutNodes: TempleNodeLayoutItem<TempleAggregationItem>[] = useMemo(() => {
    return calculateTempleNodeLayout<TempleAggregationItem>({
      temples,
      containerWidth: dimensions.width,
      containerHeight: dimensions.height,
      centerRadius,
    });
  }, [temples, dimensions.width, dimensions.height, centerRadius]);

  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;

  const handleTempleClick = (_node: TempleNodeLayoutItem<TempleAggregationItem>) => {
    if (ROUTES.ADMIN_TEMPLES) {
      navigate(ROUTES.ADMIN_TEMPLES);
    }
  };

  const hoveredNode = useMemo(() => {
    return layoutNodes.find((n) => n.templeId === hoveredNodeId) || null;
  }, [layoutNodes, hoveredNodeId]);

  return (
    <div
      className={`rounded-2xl bg-white border border-spiritual-border p-5 sm:p-6 shadow-spiritual-xs overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-spiritual-border/60">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-spiritual-text tracking-tight">
                Temple-wise Bookings
              </h2>
            </div>
            <p className="text-xs text-spiritual-muted mt-0.5">
              Distribution of ticket bookings across all temples.
            </p>
          </div>
        </div>

        {/* Date Period Selector & View Mode Switcher */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Radial / List View Toggle Button Group */}
          <div className="inline-flex items-center rounded-lg border border-spiritual-border p-0.5 bg-spiritual-surface shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('radial')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'radial'
                  ? 'bg-white text-spiritual-primary shadow-xs'
                  : 'text-spiritual-muted hover:text-spiritual-text'
              }`}
              title="Radial Network Visualization"
            >
              Radial
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-spiritual-primary shadow-xs'
                  : 'text-spiritual-muted hover:text-spiritual-text'
              }`}
              title="Ranked List View"
            >
              List
            </button>
          </div>

          {/* Date Period Selector */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-spiritual-muted absolute left-3 pointer-events-none" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Filter booking date period"
              className="pl-8 pr-8 py-1.5 rounded-lg bg-spiritual-surface hover:bg-spiritual-border/40 text-xs font-semibold text-spiritual-text border border-spiritual-border transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-spiritual-primary"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-spiritual-muted absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Scoped CSS animation for gentle center ring orbit */}
      <style>{`
        @keyframes centerOrbitRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .center-orbit-ring,
          .connector-travel-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* Main Visualization Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none bg-gradient-to-b from-[#FFFDF9] to-[#FAF8F5] rounded-xl my-2 border border-spiritual-border/40"
        style={{ minHeight: isMobile ? '460px' : `${dimensions.height}px` }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <span className="text-xs font-medium text-spiritual-muted">
              Loading temple booking network...
            </span>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <Info className="w-8 h-8 text-rose-500 mb-2" />
            <p className="text-xs font-semibold text-spiritual-text">
              Failed to load temple booking network
            </p>
            <p className="text-[11px] text-spiritual-muted max-w-xs mt-1">
              {(error as { data?: { message?: string } })?.data?.message || 'Unable to connect to the analytics service.'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-spiritual-primary hover:bg-spiritual-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        ) : temples.length === 0 || totalTickets === 0 ? (
          /* Empty state: No bookings yet */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-3 flex items-center justify-center">
              {/* Subtle gold rings */}
              <div className="w-24 h-24 rounded-full border border-amber-200/60 bg-amber-50/40 flex items-center justify-center">
                <Ticket className="w-8 h-8 text-amber-600/70" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-spiritual-text mb-0.5">0</div>
            <div className="text-xs font-semibold text-spiritual-muted">Total Tickets Booked</div>
            <p className="text-[11px] text-spiritual-muted max-w-xs mt-2">
              No ticket bookings recorded yet for the selected period. Newly confirmed reservations
              will appear dynamically.
            </p>
          </div>
        ) : viewMode === 'list' ? (
          /* Clean Ranked List View for Compact / Alternate Inspection */
          <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[640px]">
            {/* Summary Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-orange-500/10 border border-amber-200/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-amber-300 text-amber-700 flex items-center justify-center shadow-xs shrink-0">
                  <Ticket className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-spiritual-text leading-tight">
                    {totalTickets.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs font-semibold text-spiritual-muted">
                    Total Tickets Booked
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 bg-white/80 px-3 py-1.5 rounded-full border border-amber-200 shadow-2xs">
                  {temples.length} Temples Tracked
                </span>
                <span className="text-xs font-semibold text-spiritual-muted">
                  {totalBookings} Reservations
                </span>
              </div>
            </div>

            {/* Ranked Temple Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {temples.map((temple, idx) => {
                const palette = getNodePalette(idx);
                const rank = temple.rank || idx + 1;
                const ticketCount = temple.ticketCount ?? temple.bookingCount ?? 0;
                const percentage = temple.percentage ?? 0;
                const templeName = temple.templeName || (typeof temple.name === 'string' ? temple.name : `Temple #${rank}`);

                return (
                  <div
                    key={temple.templeId || (temple._id ? String(temple._id) : idx)}
                    onClick={() => {
                      if (ROUTES.ADMIN_TEMPLES) navigate(ROUTES.ADMIN_TEMPLES);
                    }}
                    role="button"
                    tabIndex={0}
                    className="relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 bg-white hover:shadow-spiritual-xs cursor-pointer group"
                    style={{
                      borderColor: palette.border,
                      backgroundColor: palette.bg,
                    }}
                  >
                    {/* Rank Badge */}
                    <div
                      className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: palette.badgeBg }}
                    >
                      {rank}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-spiritual-border/60 bg-white flex items-center justify-center">
                      {temple.image ? (
                        <img
                          src={temple.image}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full items-center justify-center"
                        style={{ display: temple.image ? 'none' : 'flex' }}
                      >
                        <TempleGopuramIcon color={palette.accent} className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-spiritual-text group-hover:text-spiritual-primary transition-colors truncate">
                        {templeName}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-spiritual-muted mt-0.5">
                        <span>
                          {ticketCount} {ticketCount === 1 ? 'booking' : 'bookings'}
                        </span>
                        <span className="font-bold" style={{ color: palette.textAccent }}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* SVG Background Layer: Orbit Rings, Curved Connectors, and Moving Dots */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              width={dimensions.width}
              height={dimensions.height}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.08" />
                  <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Center subtle glow */}
              <circle cx={cx} cy={cy} r={centerRadius + 45} fill="url(#centerGlow)" />

              {/* Subtle Slow Rotating Center Orbit Ring (Thin dashed/dotted stroke, 26s) */}
              <g
                className="center-orbit-ring"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  animation: prefersReducedMotion ? 'none' : 'centerOrbitRotate 26s linear infinite',
                }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={centerRadius + 18}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  opacity="0.3"
                />
              </g>

              {/* Static subtle inner guide ring */}
              <circle
                cx={cx}
                cy={cy}
                r={centerRadius + 6}
                fill="none"
                stroke="#D97706"
                strokeWidth="1"
                opacity="0.25"
              />

              {/* Connection Paths & Traveling Dots */}
              {layoutNodes.map((node) => {
                const isHovered = hoveredNodeId === node.templeId;
                const isAnyHovered = hoveredNodeId !== null;
                const strokeColor = node.palette.lineColor || node.palette.accent;
                const opacity = isHovered ? 1 : isAnyHovered ? 0.2 : 0.65;
                const strokeWidth = isHovered ? 2.5 : 1.5;

                return (
                  <g key={`path-group-${node.templeId}`}>
                    {/* Existing Organic Curved Path */}
                    <path
                      d={node.pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      opacity={opacity}
                      className="transition-all duration-200"
                    />

                    {/* Small terminal circle at node border */}
                    <circle
                      cx={node.targetX}
                      cy={node.targetY}
                      r={isHovered ? 4.5 : 3}
                      fill={strokeColor}
                      opacity={opacity}
                      className="transition-all duration-200"
                    />

                    {/* Subtle Single Traveling Dot per Connector (Temple -> Center) */}
                    {!prefersReducedMotion && node.flowPathD && (
                      <g className="connector-travel-dot">
                        <animateMotion
                          path={node.flowPathD}
                          dur={`${node.animDuration || 4.2}s`}
                          begin={`${node.animDelay || 0}s`}
                          repeatCount="indefinite"
                          rotate="auto"
                          keyPoints="0;0.1;0.88;1"
                          keyTimes="0;0.1;0.88;1"
                          calcMode="linear"
                        />
                        {/* Small circular dot in connector's color */}
                        <circle r="2.5" fill={strokeColor}>
                          <animate
                            attributeName="opacity"
                            values="0;0;0.9;0.9;0;0"
                            keyTimes="0;0.08;0.18;0.85;0.96;1"
                            dur={`${node.animDuration || 4.2}s`}
                            begin={`${node.animDelay || 0}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Central Anchor Node: Total Tickets Booked */}
            <div
              className="absolute z-20 flex flex-col items-center justify-center rounded-full bg-white shadow-spiritual-sm transition-transform duration-300"
              style={{
                left: `${cx}px`,
                top: `${cy}px`,
                width: `${centerRadius * 2}px`,
                height: `${centerRadius * 2}px`,
                transform: 'translate(-50%, -50%)',
                border: '2px solid #E5A84B',
                boxShadow: '0 4px 20px -2px rgba(217, 119, 6, 0.15)',
              }}
              title={`Total Tickets Booked: ${totalTickets}`}
            >
              {/* Inner delicate border ring */}
              <div
                className="absolute rounded-full border border-amber-200/80 pointer-events-none"
                style={{
                  inset: '4px',
                }}
              />

              {/* Ticket Icon Badge */}
              <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-0.5">
                <Ticket className="w-3.5 h-3.5" />
              </div>

              {/* Total Number */}
              <span className="text-2xl sm:text-3xl font-serif font-bold text-spiritual-text leading-tight tracking-tight">
                {totalTickets.toLocaleString('en-IN')}
              </span>

              {/* Labels */}
              <span className="text-[11px] font-semibold text-spiritual-muted -mt-0.5">
                Total Tickets
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-spiritual-subtle">
                Booked
              </span>
            </div>

            {/* Temple Nodes Layer */}
            {layoutNodes.map((node) => {
              const isHovered = hoveredNodeId === node.templeId;
              const isAnyHovered = hoveredNodeId !== null;
              const palette = node.palette;

              return (
                <div
                  key={node.templeId}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleTempleClick(node)}
                  onMouseEnter={() => setHoveredNodeId(node.templeId || null)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onFocus={() => setHoveredNodeId(node.templeId || null)}
                  onBlur={() => setHoveredNodeId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTempleClick(node);
                    }
                  }}
                  aria-label={`${node.templeName}, ${node.ticketCount} tickets booked, ${node.percentage} percent of total bookings, rank ${node.rank}`}
                  className="absolute z-30 cursor-pointer outline-none transition-all duration-200"
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isHovered ? 1 : isAnyHovered ? 0.4 : 1,
                  }}
                >
                  {/* Temple Pill Card */}
                  <div
                    className="relative flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white transition-all duration-200"
                    style={{
                      width: `${node.nodeWidth || 196}px`,
                      minHeight: `${node.nodeHeight || 48}px`,
                      border: `1.5px solid ${isHovered ? palette.accent : palette.border}`,
                      backgroundColor: palette.bg,
                      boxShadow: isHovered
                        ? `0 4px 14px -1px ${palette.ringColor || 'rgba(0,0,0,0.1)'}`
                        : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Rank Badge Indicator */}
                    <div
                      className="absolute -top-2 -left-2 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs select-none"
                      style={{ backgroundColor: palette.badgeBg }}
                    >
                      {node.rank}
                    </div>

                    {/* Circular Temple Visual / Icon */}
                    <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white border border-spiritual-border/60 shadow-2xs">
                      {node.image ? (
                        <img
                          src={node.image}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full items-center justify-center"
                        style={{ display: node.image ? 'none' : 'flex' }}
                      >
                        <TempleGopuramIcon color={palette.accent} className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Temple Info Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div
                        className="text-xs font-bold text-spiritual-text truncate"
                        title={node.templeName}
                      >
                        {node.templeName}
                      </div>
                      <div className="flex items-center justify-between text-[11px] leading-tight text-spiritual-muted mt-0.5">
                        <span className="font-medium">
                          {node.ticketCount} {node.ticketCount === 1 ? 'booking' : 'bookings'}
                        </span>
                        <span
                          className="font-bold ml-1.5"
                          style={{ color: palette.textAccent }}
                        >
                          {node.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Hover Tooltip Card Popover */}
            {hoveredNode && (
              <div
                className="absolute z-40 pointer-events-none rounded-xl bg-spiritual-text text-white p-3 shadow-spiritual-lg text-xs transition-opacity duration-150"
                style={{
                  left: `${Math.min(
                    dimensions.width - 180,
                    Math.max(20, hoveredNode.x)
                  )}px`,
                  top: `${Math.max(
                    15,
                    hoveredNode.y - (hoveredNode.y > dimensions.height / 2 ? 100 : -50)
                  )}px`,
                  transform: 'translateX(-50%)',
                  width: '210px',
                }}
              >
                <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-white/15">
                  <span className="font-bold text-amber-300 truncate">
                    #{hoveredNode.rank} {hoveredNode.templeName}
                  </span>
                </div>
                {hoveredNode.city && (
                  <div className="flex items-center gap-1 text-[11px] text-white/70 mb-1.5">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>
                      {hoveredNode.city}
                      {hoveredNode.state ? `, ${hoveredNode.state}` : ''}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-[11px] mt-1 pt-1 border-t border-white/10">
                  <div>
                    <span className="text-white/60 block text-[10px]">Tickets</span>
                    <span className="font-bold text-white text-xs">
                      {(hoveredNode.ticketCount ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px]">Platform Share</span>
                    <span className="font-bold text-amber-300 text-xs">
                      {hoveredNode.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Accessible Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-[11px] text-spiritual-muted">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-spiritual-subtle" />
          <span>
            {temples.length} {temples.length === 1 ? 'temple' : 'temples'} tracked
          </span>
          <span className="text-spiritual-subtle">•</span>
          <span>
            {totalBookings} total {totalBookings === 1 ? 'reservation' : 'reservations'}
          </span>
        </div>
        <div className="text-[10px] text-spiritual-subtle">
          Ranked by ticket volume for {range === '7d' ? 'last 7 days' : range === '30d' ? 'last 30 days' : range === '90d' ? 'last 90 days' : 'all time'}
        </div>
      </div>
    </div>
  );
};

export default TempleBookingNetwork;
