/**
 * Temple-wise Bookings Radial Network Layout Utility
 * Deterministic, collision-free radial and concentric ring layout
 * for DevaSetu Admin Dashboard visualization.
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
  name?: string;
  templeName?: string;
  bookingCount?: number;
  totalBookings?: number;
  revenue?: number;
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
 * Deterministically calculate positions for temple nodes in concentric rings
 * @param params Configuration object
 * @returns Array of node layout items with x, y, angle, ring, pathD, etc.
 */
export const calculateTempleNodeLayout = <T extends TempleLayoutInputItem = TempleLayoutInputItem>({
  temples = [],
  containerWidth = 960,
  containerHeight = 580,
  centerRadius = 74,
  nodeWidth: initialNodeWidth = 172,
  nodeHeight: initialNodeHeight = 58,
}: CalculateTempleNodeLayoutParams<T>): TempleNodeLayoutItem<T>[] => {
  if (!temples || temples.length === 0) {
    return [];
  }

  const cx = containerWidth / 2;
  const cy = containerHeight / 2;
  const N = temples.length;

  // Adapt node dimensions based on total count
  let nodeWidth = initialNodeWidth;
  let nodeHeight = initialNodeHeight;
  if (N > 16) {
    nodeWidth = 142;
    nodeHeight = 48;
  } else if (N > 8) {
    nodeWidth = 158;
    nodeHeight = 52;
  }

  // Margin from container edges
  const padX = nodeWidth / 2 + 12;
  const padY = nodeHeight / 2 + 12;

  const maxRx = Math.max(190, cx - padX);
  const maxRy = Math.max(135, cy - padY);
  const minRx = centerRadius + nodeWidth / 2 + 25;
  const minRy = centerRadius + nodeHeight / 2 + 25;

  // Single temple layout
  if (N === 1) {
    const angle = -Math.PI / 4; // Top-right at 45 deg
    const distRx = (minRx + maxRx) / 2;
    const distRy = (minRy + maxRy) / 2;
    const x = cx + distRx * Math.cos(angle);
    const y = cy + distRy * Math.sin(angle);
    const palette = getNodePalette(0);

    const startX = cx + centerRadius * Math.cos(angle);
    const startY = cy + centerRadius * Math.sin(angle);
    const targetX = x - (nodeWidth / 2) * Math.cos(angle);
    const targetY = y - (nodeHeight / 2) * Math.sin(angle);

    const cp1x = startX + (targetX - startX) * 0.4 + 10;
    const cp1y = startY + (targetY - startY) * 0.2;
    const cp2x = startX + (targetX - startX) * 0.8;
    const cp2y = startY + (targetY - startY) * 0.6;
    const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;
    const flowPathD = `M ${targetX} ${targetY} C ${cp2x} ${cp2y}, ${cp1x} ${cp1y}, ${startX} ${startY}`;

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

  // Multi-temple concentric ring distribution
  let ringBuckets: number[] = [];
  if (N <= 8) {
    ringBuckets = [N];
  } else if (N <= 16) {
    const r1 = Math.min(6, Math.max(4, Math.floor(N * 0.4)));
    ringBuckets = [r1, N - r1];
  } else if (N <= 24) {
    const r1 = 5;
    const r2 = 8;
    ringBuckets = [r1, r2, N - r1 - r2];
  } else {
    // 25+ temples: 4 concentric rings
    const r1 = 5;
    const r2 = 7;
    const r3 = 9;
    ringBuckets = [r1, r2, r3, N - r1 - r2 - r3];
  }

  const numRings = ringBuckets.length;
  interface MutableLayoutNode {
    temple: T;
    x: number;
    y: number;
    ring: number;
    angle: number;
    palette: NodePalette;
    nodeWidth: number;
    nodeHeight: number;
    startX?: number;
    startY?: number;
    targetX?: number;
    targetY?: number;
    pathD?: string;
    flowPathD?: string;
    animDuration?: number;
    animDelay?: number;
    breathDelay?: number;
  }

  const layout: MutableLayoutNode[] = [];
  let templeIndex = 0;

  for (let r = 0; r < numRings; r++) {
    const countInRing = ringBuckets[r];
    const ringNum = r + 1;

    let fraction: number;
    if (numRings === 1) {
      fraction = 0.72;
    } else {
      fraction = (r + 0.85) / (numRings + 0.6);
    }

    const rx = minRx + (maxRx - minRx) * fraction;
    const ry = minRy + (maxRy - minRy) * fraction;

    const ringAngleOffset = r % 2 === 1 ? Math.PI / countInRing : 0;
    const baseAngle = -Math.PI / 2;

    for (let i = 0; i < countInRing; i++) {
      if (templeIndex >= N) break;
      const temple = temples[templeIndex];
      const angle = baseAngle + (i * 2 * Math.PI) / countInRing + ringAngleOffset;

      let x = cx + rx * Math.cos(angle);
      let y = cy + ry * Math.sin(angle);

      x = Math.max(padX, Math.min(containerWidth - padX, x));
      y = Math.max(padY, Math.min(containerHeight - padY, y));

      const palette = getNodePalette(templeIndex);

      layout.push({
        temple,
        x,
        y,
        ring: ringNum,
        angle,
        palette,
        nodeWidth,
        nodeHeight,
      });

      templeIndex++;
    }
  }

  // Relaxation pass to ensure comfortable separation between all nodes
  const iterations = 8;
  for (let iter = 0; iter < iterations; iter++) {
    for (let a = 0; a < layout.length; a++) {
      for (let b = a + 1; b < layout.length; b++) {
        const na = layout[a];
        const nb = layout[b];
        const dx = na.x - nb.x;
        const dy = na.y - nb.y;
        const reqDx = (na.nodeWidth + nb.nodeWidth) * 0.48;
        const reqDy = (na.nodeHeight + nb.nodeHeight) * 0.52;

        if (Math.abs(dx) < reqDx && Math.abs(dy) < reqDy) {
          const overlapX = reqDx - Math.abs(dx);
          const overlapY = reqDy - Math.abs(dy);
          const pushX = (dx >= 0 ? 1 : -1) * (overlapX * 0.35);
          const pushY = (dy >= 0 ? 1 : -1) * (overlapY * 0.35);

          na.x = Math.max(padX, Math.min(containerWidth - padX, na.x + pushX));
          na.y = Math.max(padY, Math.min(containerHeight - padY, na.y + pushY));
          nb.x = Math.max(padX, Math.min(containerWidth - padX, nb.x - pushX));
          nb.y = Math.max(padY, Math.min(containerHeight - padY, nb.y - pushY));
        }
      }
    }
  }

  // Compute curved paths after finalized positions
  const finalizedNodes: TempleNodeLayoutItem<T>[] = [];
  for (let k = 0; k < layout.length; k++) {
    const node = layout[k];
    const angle = node.angle;

    const startX = cx + centerRadius * Math.cos(angle);
    const startY = cy + centerRadius * Math.sin(angle);

    const toCenterX = cx - node.x;
    const toCenterY = cy - node.y;
    const distToCenter = Math.hypot(toCenterX, toCenterY) || 1;
    const dirX = toCenterX / distToCenter;
    const dirY = toCenterY / distToCenter;

    const targetX = node.x + dirX * (node.nodeWidth * 0.42);
    const targetY = node.y + dirY * (node.nodeHeight * 0.42);

    const midDist = Math.hypot(targetX - startX, targetY - startY) * 0.5;
    const normalAngle = angle + Math.PI / 2;
    const curvature = (k % 2 === 0 ? 1 : -1) * 12;

    const cp1x = startX + Math.cos(angle) * (midDist * 0.6) + Math.cos(normalAngle) * curvature;
    const cp1y = startY + Math.sin(angle) * (midDist * 0.6) + Math.sin(normalAngle) * curvature;
    const cp2x = targetX - Math.cos(angle) * (midDist * 0.35);
    const cp2y = targetY - Math.sin(angle) * (midDist * 0.35);

    const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;
    const flowPathD = `M ${targetX} ${targetY} C ${cp2x} ${cp2y}, ${cp1x} ${cp1y}, ${startX} ${startY}`;

    // Staggered deterministic timing for sacred light pulses
    const animDuration = 4.0 + (k % 3) * 0.6; // 4.0s, 4.6s, 5.2s
    const animDelay = (k * 1.8) % 5.5; // Staggered start times between 0s and 5.5s
    const breathDelay = (k * 0.7) % 3.5;

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
