import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  Ticket,
  TrendingUp,
} from 'lucide-react';

export interface ServiceIconProps {
  color?: string;
  className?: string;
}

// Clean Temple Gopuram SVG icon
const ServiceIcon: React.FC<ServiceIconProps> = ({ color = '#D97706', className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2L13.5 4H10.5L12 2Z" fill={color} />
    <path d="M9 5H15L14 8H10L9 5Z" fill={color} opacity="0.85" />
    <path d="M7.5 9H16.5L15.5 13H8.5L7.5 9Z" fill={color} opacity="0.75" />
    <path d="M6 14H18L17 18H7L6 14Z" fill={color} opacity="0.9" />
    <path d="M4 19H20V22H4V19Z" fill={color} />
    <path d="M11 18H13V21H11V18Z" fill="#FFFDF9" />
  </svg>
);

export interface PaletteConfig {
  accent: string;
  border: string;
  bg: string;
  badgeBg: string;
  textAccent: string;
  ringColor: string;
}

// Curated harmonious color palettes for rank badges and cards
const PALETTES: PaletteConfig[] = [
  { accent: '#D97706', border: '#FCD34D', bg: '#FFFBEB', badgeBg: '#D97706', textAccent: '#92400E', ringColor: 'rgba(217,119,6,0.2)' }, // Saffron / Gold (Rank 1)
  { accent: '#BE185D', border: '#F9A8D4', bg: '#FDF2F8', badgeBg: '#BE185D', textAccent: '#831843', ringColor: 'rgba(190,24,93,0.2)' }, // Rose / Pink (Rank 2)
  { accent: '#7C3AED', border: '#D8B4FE', bg: '#FAF5FF', badgeBg: '#7C3AED', textAccent: '#5B21B6', ringColor: 'rgba(124,58,237,0.2)' }, // Purple (Rank 3)
  { accent: '#0284C7', border: '#7DD3FC', bg: '#F0F9FF', badgeBg: '#0284C7', textAccent: '#075985', ringColor: 'rgba(2,132,199,0.2)' }, // Sky Blue (Rank 4)
  { accent: '#059669', border: '#6EE7B7', bg: '#ECFDF5', badgeBg: '#059669', textAccent: '#065F46', ringColor: 'rgba(5,150,105,0.2)' }, // Emerald Green (Rank 5)
  { accent: '#EA580C', border: '#FDBA74', bg: '#FFF7ED', badgeBg: '#EA580C', textAccent: '#9A3412', ringColor: 'rgba(234,88,12,0.2)' }, // Orange / Terracotta (Rank 6)
  { accent: '#0D9488', border: '#5EEAD4', bg: '#F0FDFA', badgeBg: '#0D9488', textAccent: '#115E59', ringColor: 'rgba(13,148,136,0.2)' }, // Teal (Rank 7)
  { accent: '#6366F1', border: '#A5B4FC', bg: '#EEF2FF', badgeBg: '#6366F1', textAccent: '#3730A3', ringColor: 'rgba(99,102,241,0.2)' }, // Indigo (Rank 8)
  { accent: '#E11D48', border: '#FDA4AF', bg: '#FFF1F2', badgeBg: '#E11D48', textAccent: '#9F1239', ringColor: 'rgba(225,29,72,0.2)' }, // Crimson (Rank 9)
  { accent: '#4F46E5', border: '#C7D2FE', bg: '#EEF2FF', badgeBg: '#4F46E5', textAccent: '#312E81', ringColor: 'rgba(79,70,229,0.2)' },
  { accent: '#0891B2', border: '#A5F3FC', bg: '#ECFEFF', badgeBg: '#0891B2', textAccent: '#155E75', ringColor: 'rgba(8,145,178,0.2)' },
];

export interface ServiceNetworkItem {
  id: string;
  name: string;
  count?: number;
  bookingCount?: number;
  percentage?: number;
  rank?: number;
  color?: string;
}

export interface LayoutNode extends ServiceNetworkItem {
  x: number;
  y: number;
  palette: PaletteConfig;
  nodeWidth: number;
  nodeHeight: number;
  targetX: number;
  targetY: number;
  pathD: string;
  flowPathD: string;
  animDuration: number;
  animDelay: number;
}

export interface CalculateSymmetricalLayoutParams {
  services?: ServiceNetworkItem[];
  containerWidth?: number;
  containerHeight?: number;
  centerRadius?: number;
  nodeWidth?: number;
  nodeHeight?: number;
}

/**
 * Deterministically calculate a symmetrical bilateral layout matching Image 2:
 * - Top card: Rank 1 centered
 * - Bottom card: Center rank (e.g. Rank 5) centered
 * - Left cards: Ranks 2, 3, 4 stacked vertically in a clean arc
 * - Right cards: Ranks 6, 7, 8, 9 stacked vertically in a clean arc
 * - Connectors smoothly attach to inner edges with terminal port dots
 */
const calculateSymmetricalLayout = ({
  services = [],
  containerWidth = 960,
  containerHeight = 560,
  centerRadius = 74,
  nodeWidth = 192,
  nodeHeight = 52,
}: CalculateSymmetricalLayoutParams): LayoutNode[] => {
  if (!services || services.length === 0) return [];

  const cx = containerWidth / 2;
  const cy = containerHeight / 2;
  const N = services.length;

  // Split into Top, Bottom, Left, and Right
  let topNode: ServiceNetworkItem | null = null;
  let bottomNode: ServiceNetworkItem | null = null;
  let leftNodes: ServiceNetworkItem[] = [];
  let rightNodes: ServiceNetworkItem[] = [];

  if (N === 1) {
    topNode = services[0];
  } else if (N === 2) {
    leftNodes = [services[0]];
    rightNodes = [services[1]];
  } else if (N === 3) {
    topNode = services[0];
    leftNodes = [services[1]];
    rightNodes = [services[2]];
  } else if (N === 4) {
    topNode = services[0];
    bottomNode = services[2];
    leftNodes = [services[1]];
    rightNodes = [services[3]];
  } else {
    // 5+ services: Top is Rank 1, Bottom is center rank, Left & Right columns
    topNode = services[0];
    const remaining = services.slice(1);
    const numRemaining = remaining.length;

    if (numRemaining >= 3) {
      const leftCount = Math.floor((numRemaining - 1) / 2);
      leftNodes = remaining.slice(0, leftCount);
      bottomNode = remaining[leftCount];
      rightNodes = remaining.slice(leftCount + 1);
    } else {
      const leftCount = Math.ceil(numRemaining / 2);
      leftNodes = remaining.slice(0, leftCount);
      rightNodes = remaining.slice(leftCount);
    }
  }

  const nodes: LayoutNode[] = [];
  const minPadX = nodeWidth / 2 + 16;
  const leftColX = Math.max(minPadX, cx - 295);
  const rightColX = Math.min(containerWidth - minPadX, cx + 295);

  // 1. TOP NODE (Rank 1)
  if (topNode) {
    const x = cx;
    const y = 46;
    const palette = PALETTES[0];
    const startX = cx;
    const startY = cy - centerRadius;
    const targetX = x;
    const targetY = y + nodeHeight / 2;

    const midY = (startY + targetY) / 2;
    const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
    const flowPathD = `M ${targetX} ${targetY} C ${targetX} ${midY}, ${startX} ${midY}, ${startX} ${startY}`;

    nodes.push({
      ...topNode,
      x,
      y,
      palette,
      nodeWidth,
      nodeHeight,
      targetX,
      targetY,
      pathD,
      flowPathD,
      animDuration: 4.2,
      animDelay: 0.1,
    });
  }

  // 2. BOTTOM NODE (e.g. Rank 5)
  if (bottomNode) {
    const x = cx;
    const y = containerHeight - 46;
    const bIndex = services.indexOf(bottomNode);
    const palette = PALETTES[bIndex % PALETTES.length];
    const startX = cx;
    const startY = cy + centerRadius;
    const targetX = x;
    const targetY = y - nodeHeight / 2;

    const midY = (startY + targetY) / 2;
    const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
    const flowPathD = `M ${targetX} ${targetY} C ${targetX} ${midY}, ${startX} ${midY}, ${startX} ${startY}`;

    nodes.push({
      ...bottomNode,
      x,
      y,
      palette,
      nodeWidth,
      nodeHeight,
      targetX,
      targetY,
      pathD,
      flowPathD,
      animDuration: 4.4,
      animDelay: 0.5,
    });
  }

  // 3. LEFT NODES (Stacked vertically on the left side)
  const leftCount = leftNodes.length;
  const leftUsableH = containerHeight - 170;
  leftNodes.forEach((node, idx) => {
    const origIndex = services.indexOf(node);
    const palette = PALETTES[origIndex % PALETTES.length];

    // Symmetrical vertical distribution
    const y = leftCount === 1
      ? cy
      : 90 + idx * (leftUsableH / (leftCount - 1));

    // Subtle natural arc towards center at extremes
    const normY = (y - cy) / (containerHeight / 2);
    const x = leftColX + Math.abs(normY) * 20;

    // Center circle departure point
    const angle = Math.atan2(y - cy, x - cx);
    const startX = cx + centerRadius * Math.cos(angle);
    const startY = cy + centerRadius * Math.sin(angle);

    // Target is RIGHT (inner) edge of left card
    const targetX = x + nodeWidth / 2;
    const targetY = y;

    const dx = (startX - targetX) * 0.5;
    const pathD = `M ${startX} ${startY} C ${startX - dx * 0.7} ${startY}, ${targetX + dx * 0.7} ${targetY}, ${targetX} ${targetY}`;
    const flowPathD = `M ${targetX} ${targetY} C ${targetX + dx * 0.7} ${targetY}, ${startX - dx * 0.7} ${startY}, ${startX} ${startY}`;

    nodes.push({
      ...node,
      x,
      y,
      palette,
      nodeWidth,
      nodeHeight,
      targetX,
      targetY,
      pathD,
      flowPathD,
      animDuration: 4.0 + idx * 0.3,
      animDelay: 0.2 + idx * 0.2,
    });
  });

  // 4. RIGHT NODES (Stacked vertically on the right side)
  const rightCount = rightNodes.length;
  const rightUsableH = containerHeight - 170;
  rightNodes.forEach((node, idx) => {
    const origIndex = services.indexOf(node);
    const palette = PALETTES[origIndex % PALETTES.length];

    // Symmetrical vertical distribution
    const y = rightCount === 1
      ? cy
      : 90 + idx * (rightUsableH / (rightCount - 1));

    // Subtle natural arc towards center at extremes
    const normY = (y - cy) / (containerHeight / 2);
    const x = rightColX - Math.abs(normY) * 20;

    // Center circle departure point
    const angle = Math.atan2(y - cy, x - cx);
    const startX = cx + centerRadius * Math.cos(angle);
    const startY = cy + centerRadius * Math.sin(angle);

    // Target is LEFT (inner) edge of right card
    const targetX = x - nodeWidth / 2;
    const targetY = y;

    const dx = (targetX - startX) * 0.5;
    const pathD = `M ${startX} ${startY} C ${startX + dx * 0.7} ${startY}, ${targetX - dx * 0.7} ${targetY}, ${targetX} ${targetY}`;
    const flowPathD = `M ${targetX} ${targetY} C ${targetX - dx * 0.7} ${targetY}, ${startX + dx * 0.7} ${startY}, ${startX} ${startY}`;

    nodes.push({
      ...node,
      x,
      y,
      palette,
      nodeWidth,
      nodeHeight,
      targetX,
      targetY,
      pathD,
      flowPathD,
      animDuration: 4.1 + idx * 0.3,
      animDelay: 0.3 + idx * 0.2,
    });
  });

  return nodes;
};

export interface ServiceBookingNetworkData {
  services?: ServiceNetworkItem[];
  totalTickets?: number;
  totalBookings?: number;
}

export interface ServiceBookingNetworkProps {
  data?: ServiceBookingNetworkData;
  title?: string;
  subtitle?: string;
  periodBadge?: string;
  className?: string;
}

export const ServiceBookingNetwork: React.FC<ServiceBookingNetworkProps> = ({
  data = {},
  title = 'Service-wise Bookings',
  subtitle = 'Distribution of ticket bookings across your temple services.',
  periodBadge = 'Last 30 Days',
  className = '',
}) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 960, height: 560 });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  const totalTickets = data.totalTickets || data.totalBookings || 0;
  const rawServices = useMemo(() => data.services || [], [data.services]);

  // Map services with rank and percentage
  const services = useMemo(() => {
    if (!rawServices || rawServices.length === 0) return [];
    return rawServices.map((s, idx) => ({
      ...s,
      rank: s.rank || idx + 1,
      bookingCount: s.bookingCount !== undefined ? s.bookingCount : (s.count || 0),
      percentage: s.percentage !== undefined
        ? s.percentage
        : totalTickets > 0
        ? Number((((s.count || 0) / totalTickets) * 100).toFixed(1))
        : 0,
    }));
  }, [rawServices, totalTickets]);

  // Track container width and resize dynamically
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const mobile = w < 720;
        setIsMobile(mobile);
        setDimensions({
          width: w,
          height: mobile ? 500 : Math.min(600, Math.max(520, Math.floor(w * 0.54))),
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

  const centerRadius = isMobile ? 62 : 72;
  const nodeWidth = isMobile ? 154 : 192;
  const nodeHeight = isMobile ? 48 : 52;

  // Compute clean, symmetrical, non-random card layout
  const layoutNodes = useMemo(() => {
    return calculateSymmetricalLayout({
      services,
      containerWidth: dimensions.width,
      containerHeight: dimensions.height,
      centerRadius,
      nodeWidth,
      nodeHeight,
    });
  }, [services, dimensions.width, dimensions.height, centerRadius, nodeWidth, nodeHeight]);

  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;

  return (
    <div
      className={`rounded-2xl bg-white border border-[#EAE0D0] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col select-none ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EAE1]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Date Period Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] text-xs font-semibold text-slate-700 border border-[#EAE0D0]">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>{periodBadge}</span>
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
        className="relative w-full overflow-hidden select-none bg-gradient-to-b from-[#FFFDF9] to-[#FAF8F5] rounded-xl my-2 border border-[#EAE0D0]/60"
        style={{ minHeight: isMobile ? '480px' : `${dimensions.height}px` }}
      >
        {services.length === 0 || totalTickets === 0 ? (
          /* Empty state: No bookings yet */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-3 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-amber-200/60 bg-amber-50/40 flex items-center justify-center">
                <Ticket className="w-8 h-8 text-amber-600/70" />
              </div>
            </div>
            <div className="text-2xl font-serif font-bold text-slate-800 mb-0.5">0</div>
            <div className="text-xs font-semibold text-slate-500">Total Tickets Booked</div>
            <p className="text-[11px] text-slate-400 max-w-xs mt-2">
              No ticket bookings recorded yet for your temple services. Newly confirmed reservations
              will appear dynamically.
            </p>
          </div>
        ) : (
          <>
            {/* SVG Layer: Orbit Rings, Curved Connectors, Traveling Dots */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              width={dimensions.width}
              height={dimensions.height}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="serviceCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.08" />
                  <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Center subtle glow */}
              <circle cx={cx} cy={cy} r={centerRadius + 45} fill="url(#serviceCenterGlow)" />

              {/* Subtle Slow Rotating Center Orbit Ring (Dashed, 26s) */}
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
                const isHovered = hoveredNodeId === node.id;
                const isAnyHovered = hoveredNodeId !== null;
                const strokeColor = node.palette?.accent || '#D97706';
                const opacity = isHovered ? 1 : isAnyHovered ? 0.18 : 0.65;
                const strokeWidth = isHovered ? 2.5 : 1.5;

                return (
                  <g key={`path-group-${node.id}`}>
                    {/* Organic Curved Path */}
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

                    {/* Subtle Single Traveling Dot per Connector (Service -> Center) */}
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
              className="absolute z-20 flex flex-col items-center justify-center rounded-full bg-white transition-transform duration-300"
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
                style={{ inset: '4px' }}
              />

              {/* Ticket Icon Badge */}
              <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-0.5 shadow-2xs">
                <Ticket className="w-3.5 h-3.5" />
              </div>

              {/* Total Number */}
              <span className="text-2xl sm:text-3xl font-serif font-bold text-slate-800 leading-tight tracking-tight">
                {totalTickets.toLocaleString('en-IN')}
              </span>

              {/* Labels */}
              <span className="text-[11px] font-semibold text-slate-600 -mt-0.5">
                Total Tickets
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                Booked
              </span>
            </div>

            {/* Service Nodes Layer */}
            {layoutNodes.map((node) => {
              const isHovered = hoveredNodeId === node.id;
              const isAnyHovered = hoveredNodeId !== null;
              const palette = node.palette || PALETTES[0];

              return (
                <div
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onFocus={() => setHoveredNodeId(node.id)}
                  onBlur={() => setHoveredNodeId(null)}
                  aria-label={`${node.name}, ${node.bookingCount} bookings, ${node.percentage} percent, rank ${node.rank}`}
                  className="absolute z-30 cursor-pointer outline-none transition-all duration-200"
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isHovered ? 1 : isAnyHovered ? 0.35 : 1,
                  }}
                >
                  {/* Service Pill Card */}
                  <div
                    className="relative flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white transition-all duration-200"
                    style={{
                      width: `${node.nodeWidth || nodeWidth}px`,
                      minHeight: `${node.nodeHeight || nodeHeight}px`,
                      border: `1.5px solid ${isHovered ? palette.accent : palette.border}`,
                      backgroundColor: palette.bg || '#FFFBEB',
                      boxShadow: isHovered
                        ? `0 4px 14px -1px ${palette.ringColor || 'rgba(0,0,0,0.12)'}`
                        : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Rank Badge Indicator */}
                    <div
                      className="absolute -top-2 -left-2 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs select-none"
                      style={{ backgroundColor: palette.badgeBg || '#D97706' }}
                    >
                      {node.rank}
                    </div>

                    {/* Circular Icon Container */}
                    <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white border border-spiritual-border/60 shadow-2xs">
                      <ServiceIcon color={palette.accent || '#D97706'} className="w-4 h-4" />
                    </div>

                    {/* Service Info */}
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-xs font-bold text-slate-800 truncate leading-snug"
                        title={node.name}
                      >
                        {node.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10.5px] mt-0.5 leading-none">
                        <span className="font-mono font-bold text-slate-600">
                          {node.bookingCount} {node.bookingCount === 1 ? 'booking' : 'bookings'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span
                          className="font-mono font-semibold"
                          style={{ color: palette.textAccent || palette.accent }}
                        >
                          {node.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceBookingNetwork;
