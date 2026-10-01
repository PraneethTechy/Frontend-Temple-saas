/**
 * Temple-wise Bookings Radial Network Layout Utility
 * Deterministic, collision-free, balanced radial and concentric layout
 * engineered for DevaSetu Admin Dashboard visualization.
 */

export interface NodePalette {
  name: string;
  accent: string;
  border: string;
  bg: string;
  badgeBg: string;
  textAccent: string;
  ringColor: string;
  lineColor: string;
}

export const NODE_PALETTES: NodePalette[] = [
  {
    name: 'saffron',
    accent: '#D97706',
    border: '#FCD34D',
    bg: '#FFFBEB',
    badgeBg: '#D97706',
    textAccent: '#92400E',
    ringColor: 'rgba(217, 119, 6, 0.25)',
    lineColor: '#D97706',
  },
  {
    name: 'maroon',
    accent: '#BE185D',
    border: '#F9A8D4',
    bg: '#FDF2F8',
    badgeBg: '#BE185D',
    textAccent: '#831843',
    ringColor: 'rgba(190, 24, 93, 0.25)',
    lineColor: '#BE185D',
  },
  {
    name: 'purple',
    accent: '#7C3AED',
    border: '#D8B4FE',
    bg: '#FAF5FF',
    badgeBg: '#7C3AED',
    textAccent: '#5B21B6',
    ringColor: 'rgba(124, 58, 237, 0.25)',
    lineColor: '#7C3AED',
  },
  {
    name: 'sky',
    accent: '#0284C7',
    border: '#7DD3FC',
    bg: '#F0F9FF',
    badgeBg: '#0284C7',
    textAccent: '#075985',
    ringColor: 'rgba(2, 132, 199, 0.25)',
    lineColor: '#0284C7',
  },
  {
    name: 'emerald',
    accent: '#059669',
    border: '#6EE7B7',
    bg: '#ECFDF5',
    badgeBg: '#059669',
    textAccent: '#065F46',
    ringColor: 'rgba(5, 150, 105, 0.25)',
    lineColor: '#059669',
  },
  {
    name: 'terracotta',
    accent: '#EA580C',
    border: '#FDBA74',
    bg: '#FFF7ED',
    badgeBg: '#EA580C',
    textAccent: '#9A3412',
    ringColor: 'rgba(234, 88, 12, 0.25)',
    lineColor: '#EA580C',
  },
  {
    name: 'teal',
    accent: '#0D9488',
    border: '#5EEAD4',
    bg: '#F0FDFA',
    badgeBg: '#0D9488',
    textAccent: '#115E59',
    ringColor: 'rgba(13, 148, 136, 0.25)',
    lineColor: '#0D9488',
  },
  {
    name: 'indigo',
    accent: '#6366F1',
    border: '#A5B4FC',
    bg: '#EEF2FF',
    badgeBg: '#6366F1',
    textAccent: '#3730A3',
    ringColor: 'rgba(99, 102, 241, 0.25)',
    lineColor: '#6366F1',
  },
  {
    name: 'crimson',
    accent: '#E11D48',
    border: '#FDA4AF',
    bg: '#FFF1F2',
    badgeBg: '#E11D48',
    textAccent: '#9F1239',
    ringColor: 'rgba(225, 29, 72, 0.25)',
    lineColor: '#E11D48',
  },
];

/**
 * Get palette for a temple index
 */
export const getNodePalette = (index: number): NodePalette => {
  return NODE_PALETTES[index % NODE_PALETTES.length];
};

export interface TempleLayoutInputItem {
  _id?: string;
  id?: string;
  templeId?: string;
  name?: string;
  templeName?: string;
  ticketCount?: number;
  bookingCount?: number;
  totalBookings?: number;
  revenue?: number;
  percentage?: number;
  rank?: number;
  [key: string]: unknown;
}

export interface CalculateTempleNodeLayoutParams<T extends TempleLayoutInputItem = TempleLayoutInputItem> {
  temples?: T[];
  containerWidth?: number;
  containerHeight?: number;
  centerRadius?: number;
  nodeWidth?: number;
  nodeHeight?: number;
}

export type TempleNodeLayoutItem<T extends TempleLayoutInputItem = TempleLayoutInputItem> = T & {
  x: number;
  y: number;
  ring: number;
  angle: number;
  palette: NodePalette;
  nodeWidth: number;
  nodeHeight: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  pathD: string;
  flowPathD: string;
  animDuration: number;
  animDelay: number;
  breathDelay: number;
};

/**
 * Deterministically calculate positions for temple nodes around the central total tickets anchor.
 * Engineered for visual balance, zero overlap, bilateral symmetry, and clean uncluttered connectors.
 */
export const calculateTempleNodeLayout = <T extends TempleLayoutInputItem = TempleLayoutInputItem>({
  temples = [],
  containerWidth = 960,
  containerHeight = 600,
  centerRadius = 68,
  nodeWidth: initialNodeWidth,
  nodeHeight: initialNodeHeight,
}: CalculateTempleNodeLayoutParams<T>): TempleNodeLayoutItem<T>[] => {
  if (!temples || temples.length === 0) {
    return [];
  }

  const cx = containerWidth / 2;
  const cy = containerHeight / 2;
  const N = temples.length;

  // Responsive, comfortable node sizing based on container width
  let nodeWidth = initialNodeWidth;
  let nodeHeight = initialNodeHeight;

  if (!nodeWidth || !nodeHeight) {
    if (containerWidth >= 1200) {
      nodeWidth = 202;
      nodeHeight = 56;
    } else if (containerWidth >= 1000) {
      nodeWidth = 192;
      nodeHeight = 54;
    } else if (containerWidth >= 780) {
      nodeWidth = 176;
      nodeHeight = 50;
    } else {
      nodeWidth = 156;
      nodeHeight = 46;
    }
  }

  // Margin buffers from container outer edges
  const padX = nodeWidth / 2 + 14;
  const padY = nodeHeight / 2 + 14;

  // Safe exclusion zone around central total tickets circle
  const safeCenterBuffer = centerRadius + 32;
  const minRx = safeCenterBuffer + nodeWidth / 2;
  const minRy = safeCenterBuffer + nodeHeight / 2;

  const maxRx = Math.max(minRx + 40, cx - padX);
  const maxRy = Math.max(minRy + 35, cy - padY);

  // Single temple layout fallback
  if (N === 1) {
    const angle = -Math.PI / 4; // Top-right at 45 deg
    const distRx = (minRx + maxRx) / 2;
    const distRy = (minRy + maxRy) / 2;
    const x = cx + distRx * Math.cos(angle);
    const y = cy + distRy * Math.sin(angle);
    const palette = getNodePalette(0);

    const startX = cx + (centerRadius + 4) * Math.cos(angle);
    const startY = cy + (centerRadius + 4) * Math.sin(angle);
    const targetX = x - (nodeWidth / 2) * Math.cos(angle);
    const targetY = y - (nodeHeight / 2) * Math.sin(angle);

    const pathD = `M ${startX} ${startY} L ${targetX} ${targetY}`;
    const flowPathD = `M ${targetX} ${targetY} L ${startX} ${startY}`;

    return [
      {
        ...temples[0],
        x,
        y,
        ring: 1,
        angle,
        palette,
        nodeWidth,
        nodeHeight,
        startX,
        startY,
        targetX,
        targetY,
        pathD,
        flowPathD,
        animDuration: 4.5,
        animDelay: 0.5,
        breathDelay: 0,
      } as TempleNodeLayoutItem<T>,
    ];
  }

  interface IntermediateNode {
    temple: T;
    index: number;
    angle: number;
    x: number;
    y: number;
    ring: number;
    palette: NodePalette;
    nodeWidth: number;
    nodeHeight: number;
  }

  const rawNodes: IntermediateNode[] = [];

  // Radial Tiers Configuration
  // Outer tier reaches near outer boundary; Inner tier sits comfortably between center and outer
  const rxOuter = maxRx * 0.96;
  const ryOuter = maxRy * 0.95;
  const rxInner = minRx + (maxRx - minRx) * 0.44;
  const ryInner = minRy + (maxRy - minRy) * 0.40;

  if (N === 11) {
    // OPTIMIZED DETERMINISTIC 11-TEMPLE BILATERAL CONFIGURATION
    // Symmetrically aligned with:
    // 1 bottom center node (index 0, angle = 90 deg)
    // 5 balanced pairs on left and right
    // 2 top flanking nodes (indices 5 & 6) on OUTER tier for maximum breathing gap
    const tierMap11 = [
      'OUTER', // 0: Bottom Center (90 deg)
      'INNER', // 1: Bottom Left (122.7 deg)
      'OUTER', // 2: Mid-Left Lower (155.5 deg)
      'INNER', // 3: Mid-Left Upper (188.2 deg)
      'OUTER', // 4: Upper Left (220.9 deg)
      'OUTER', // 5: High Top-Left (253.6 deg) -> OUTER prevents lateral pinch
      'OUTER', // 6: High Top-Right (286.4 deg) -> OUTER prevents lateral pinch
      'OUTER', // 7: Upper Right (319.1 deg)
      'INNER', // 8: Mid-Right Upper (351.8 deg)
      'OUTER', // 9: Mid-Right Lower (24.5 deg)
      'INNER', // 10: Bottom Right (57.3 deg)
    ];

    for (let i = 0; i < 11; i++) {
      const angle = Math.PI / 2 + (i * 2 * Math.PI) / 11;
      const isOuter = tierMap11[i] === 'OUTER';
      const rx = isOuter ? rxOuter : rxInner;
      const ry = isOuter ? ryOuter : ryInner;

      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);

      rawNodes.push({
        temple: temples[i],
        index: i,
        angle,
        x,
        y,
        ring: isOuter ? 2 : 1,
        palette: getNodePalette(i),
        nodeWidth,
        nodeHeight,
      });
    }
  } else if (N <= 6) {
    // 2 to 6 temples: Single clean, spacious ellipse
    const baseAngle = -Math.PI / 2; // Start from top
    const rx = (minRx + maxRx) * 0.52;
    const ry = (minRy + maxRy) * 0.52;

    for (let i = 0; i < N; i++) {
      const angle = baseAngle + (i * 2 * Math.PI) / N;
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);

      rawNodes.push({
        temple: temples[i],
        index: i,
        angle,
        x,
        y,
        ring: 1,
        palette: getNodePalette(i),
        nodeWidth,
        nodeHeight,
      });
    }
  } else {
    // Generic N temples: Staggered alternating tiers with vertical axis alignment
    const baseAngle = Math.PI / 2; // Bottom start for odd N or top for even
    for (let i = 0; i < N; i++) {
      const angle = baseAngle + (i * 2 * Math.PI) / N;
      // Stagger alternating nodes
      const isOuter = i % 2 === 0;
      const rx = isOuter ? rxOuter : rxInner;
      const ry = isOuter ? ryOuter : ryInner;

      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);

      rawNodes.push({
        temple: temples[i],
        index: i,
        angle,
        x,
        y,
        ring: isOuter ? 2 : 1,
        palette: getNodePalette(i),
        nodeWidth,
        nodeHeight,
      });
    }
  }

  // Bounding & Center Clearance Clamp Pass
  for (let i = 0; i < rawNodes.length; i++) {
    const node = rawNodes[i];
    // Enforce container boundary constraints
    node.x = Math.max(padX, Math.min(containerWidth - padX, node.x));
    node.y = Math.max(padY, Math.min(containerHeight - padY, node.y));

    // Enforce minimum center safe radius
    const distCenter = Math.hypot(node.x - cx, node.y - cy);
    const minCenterDist = safeCenterBuffer + Math.hypot(node.nodeWidth / 2, node.nodeHeight / 2) * 0.65;
    if (distCenter < minCenterDist && distCenter > 0) {
      const pushRatio = minCenterDist / distCenter;
      node.x = cx + (node.x - cx) * pushRatio;
      node.y = cy + (node.y - cy) * pushRatio;
    }
  }

  // Micro-Relaxation Safety Pass for any unexpected collision
  const collisionIterations = 4;
  for (let iter = 0; iter < collisionIterations; iter++) {
    for (let a = 0; a < rawNodes.length; a++) {
      for (let b = a + 1; b < rawNodes.length; b++) {
        const na = rawNodes[a];
        const nb = rawNodes[b];
        const dx = na.x - nb.x;
        const dy = na.y - nb.y;
        const minSafeDx = (na.nodeWidth + nb.nodeWidth) * 0.52;
        const minSafeDy = (na.nodeHeight + nb.nodeHeight) * 0.56;

        if (Math.abs(dx) < minSafeDx && Math.abs(dy) < minSafeDy) {
          const overlapX = minSafeDx - Math.abs(dx);
          const overlapY = minSafeDy - Math.abs(dy);
          const pushX = (dx >= 0 ? 1 : -1) * (overlapX * 0.28);
          const pushY = (dy >= 0 ? 1 : -1) * (overlapY * 0.28);

          na.x = Math.max(padX, Math.min(containerWidth - padX, na.x + pushX));
          na.y = Math.max(padY, Math.min(containerHeight - padY, na.y + pushY));
          nb.x = Math.max(padX, Math.min(containerWidth - padX, nb.x - pushX));
          nb.y = Math.max(padY, Math.min(containerHeight - padY, nb.y - pushY));
        }
      }
    }
  }

  // Generate Smooth Connectors & Light Wave Paths
  const finalizedNodes: TempleNodeLayoutItem<T>[] = [];

  for (let k = 0; k < rawNodes.length; k++) {
    const node = rawNodes[k];
    const angle = node.angle;

    // Start point: Exactly at outer circumference of central Total Tickets circle
    const startX = cx + (centerRadius + 4) * Math.cos(angle);
    const startY = cy + (centerRadius + 4) * Math.sin(angle);

    // Vector from node center toward container center
    const toCenterX = cx - node.x;
    const toCenterY = cy - node.y;
    const distToCenter = Math.hypot(toCenterX, toCenterY) || 1;
    const dirX = toCenterX / distToCenter;
    const dirY = toCenterY / distToCenter;

    // Terminal point: Terminate cleanly near the inner edge of the card
    const targetX = node.x + dirX * (node.nodeWidth * 0.44);
    const targetY = node.y + dirY * (node.nodeHeight * 0.44);

    // Subtle natural bezier curve without exaggerated loops
    const totalDist = Math.hypot(targetX - startX, targetY - startY);
    const normalAngle = angle + Math.PI / 2;
    // Gentle curvature alternating slightly for organic elegance (capped at 7px)
    const curvature = (k % 2 === 0 ? 1 : -1) * Math.min(7, totalDist * 0.04);

    const cp1x = startX + (targetX - startX) * 0.35 + Math.cos(normalAngle) * curvature;
    const cp1y = startY + (targetY - startY) * 0.35 + Math.sin(normalAngle) * curvature;
    const cp2x = startX + (targetX - startX) * 0.70 + Math.cos(normalAngle) * (curvature * 0.5);
    const cp2y = startY + (targetY - startY) * 0.70 + Math.sin(normalAngle) * (curvature * 0.5);

    const pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${targetX.toFixed(1)} ${targetY.toFixed(1)}`;
    const flowPathD = `M ${targetX.toFixed(1)} ${targetY.toFixed(1)} C ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${startX.toFixed(1)} ${startY.toFixed(1)}`;

    // Staggered light wave timings for calm spiritual pulsation
    const animDuration = 4.2 + (k % 3) * 0.6;
    const animDelay = (k * 1.4) % 4.8;
    const breathDelay = (k * 0.6) % 3.0;

    finalizedNodes.push({
      ...node.temple,
      x: node.x,
      y: node.y,
      ring: node.ring,
      angle: node.angle,
      palette: node.palette,
      nodeWidth: node.nodeWidth,
      nodeHeight: node.nodeHeight,
      startX,
      startY,
      targetX,
      targetY,
      pathD,
      flowPathD,
      animDuration,
      animDelay,
      breathDelay,
    } as TempleNodeLayoutItem<T>);
  }

  return finalizedNodes;
};

export default {
  NODE_PALETTES,
  getNodePalette,
  calculateTempleNodeLayout,
};
