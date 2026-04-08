import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── UploadIcon ──────────────────────────────────────────────────────────────
interface UploadIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const UploadIcon: React.FC<UploadIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Tray/box base
  const trayD =
    `M ${cx - 30 * s} ${cy + 10 * s} ` +
    `L ${cx - 30 * s} ${cy + 30 * s} ` +
    `Q ${cx - 30 * s} ${cy + 33 * s}, ${cx - 27 * s} ${cy + 33 * s} ` +
    `L ${cx + 27 * s} ${cy + 33 * s} ` +
    `Q ${cx + 30 * s} ${cy + 33 * s}, ${cx + 30 * s} ${cy + 30 * s} ` +
    `L ${cx + 30 * s} ${cy + 10 * s}`;

  // Arrow shaft going up
  const shaftD =
    `M ${cx} ${cy + 12 * s} ` +
    `L ${cx + 1 * s} ${cy - 25 * s}`;

  // Arrowhead
  const headD =
    `M ${cx - 14 * s} ${cy - 12 * s} ` +
    `L ${cx} ${cy - 30 * s} ` +
    `L ${cx + 14 * s} ${cy - 12 * s}`;

  return (
    <g>
      <AnimatedPath d={trayD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={shaftD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={headD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ─── DownloadIcon ────────────────────────────────────────────────────────────
interface DownloadIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const DownloadIcon: React.FC<DownloadIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Tray/box base
  const trayD =
    `M ${cx - 30 * s} ${cy + 10 * s} ` +
    `L ${cx - 30 * s} ${cy + 30 * s} ` +
    `Q ${cx - 30 * s} ${cy + 33 * s}, ${cx - 27 * s} ${cy + 33 * s} ` +
    `L ${cx + 27 * s} ${cy + 33 * s} ` +
    `Q ${cx + 30 * s} ${cy + 33 * s}, ${cx + 30 * s} ${cy + 30 * s} ` +
    `L ${cx + 30 * s} ${cy + 10 * s}`;

  // Arrow shaft going down
  const shaftD =
    `M ${cx + 1 * s} ${cy - 30 * s} ` +
    `L ${cx} ${cy + 8 * s}`;

  // Arrowhead pointing down
  const headD =
    `M ${cx - 14 * s} ${cy - 2 * s} ` +
    `L ${cx} ${cy + 14 * s} ` +
    `L ${cx + 14 * s} ${cy - 2 * s}`;

  return (
    <g>
      <AnimatedPath d={trayD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={shaftD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={headD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ─── SyncIcon ────────────────────────────────────────────────────────────────
interface SyncIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const SyncIcon: React.FC<SyncIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Top curved arrow (clockwise, right side)
  const topArcD =
    `M ${cx + 28 * s} ${cy - 5 * s} ` +
    `C ${cx + 28 * s} ${cy - 22 * s}, ${cx + 18 * s} ${cy - 32 * s}, ${cx - 1 * s} ${cy - 32 * s} ` +
    `C ${cx - 18 * s} ${cy - 32 * s}, ${cx - 28 * s} ${cy - 22 * s}, ${cx - 28 * s} ${cy - 6 * s}`;

  // Top arrowhead
  const topHeadD =
    `M ${cx - 18 * s} ${cy - 14 * s} ` +
    `L ${cx - 28 * s} ${cy - 4 * s} ` +
    `L ${cx - 36 * s} ${cy - 16 * s}`;

  // Bottom curved arrow (counter-clockwise, left side)
  const botArcD =
    `M ${cx - 28 * s} ${cy + 5 * s} ` +
    `C ${cx - 28 * s} ${cy + 22 * s}, ${cx - 18 * s} ${cy + 32 * s}, ${cx + 1 * s} ${cy + 32 * s} ` +
    `C ${cx + 18 * s} ${cy + 32 * s}, ${cx + 28 * s} ${cy + 22 * s}, ${cx + 28 * s} ${cy + 6 * s}`;

  // Bottom arrowhead
  const botHeadD =
    `M ${cx + 18 * s} ${cy + 14 * s} ` +
    `L ${cx + 28 * s} ${cy + 4 * s} ` +
    `L ${cx + 36 * s} ${cy + 16 * s}`;

  return (
    <g>
      <AnimatedPath d={topArcD} startFrame={startFrame} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={topHeadD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <AnimatedPath d={botArcD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={botHeadD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ─── PlayIcon ────────────────────────────────────────────────────────────────
interface PlayIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const PlayIcon: React.FC<PlayIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const dur2 = Math.floor(drawDuration / 2);

  // Circle outline
  const r = 32 * s;
  const k = r * 0.56;
  const circleD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} ` +
    `C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  // Play triangle (pointing right, slightly offset for visual center)
  const triangleD =
    `M ${cx - 12 * s} ${cy - 18 * s} ` +
    `L ${cx + 20 * s} ${cy + 1 * s} ` +
    `L ${cx - 12 * s} ${cy + 20 * s} Z`;

  return (
    <g>
      <AnimatedPath d={circleD} startFrame={startFrame} drawDuration={dur2} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.15} />
      <AnimatedPath d={triangleD} startFrame={startFrame + dur2} drawDuration={dur2} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.7} />
    </g>
  );
};

// ─── PauseIcon ───────────────────────────────────────────────────────────────
interface PauseIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const PauseIcon: React.FC<PauseIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.orange,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Circle outline
  const r = 32 * s;
  const k = r * 0.56;
  const circleD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} ` +
    `C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  // Left bar
  const leftBarD =
    `M ${cx - 10 * s} ${cy - 16 * s} ` +
    `L ${cx - 10 * s} ${cy + 16 * s}`;

  // Right bar
  const rightBarD =
    `M ${cx + 10 * s} ${cy - 16 * s} ` +
    `L ${cx + 10 * s} ${cy + 16 * s}`;

  return (
    <g>
      <AnimatedPath d={circleD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.15} />
      <AnimatedPath d={leftBarD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={4 * s} strokeLinecap="round" />
      <AnimatedPath d={rightBarD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={4 * s} strokeLinecap="round" />
    </g>
  );
};

// ─── ExpandIcon ──────────────────────────────────────────────────────────────
interface ExpandIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ExpandIcon: React.FC<ExpandIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Top-left arrow
  const tlD =
    `M ${cx - 8 * s} ${cy - 8 * s} L ${cx - 28 * s} ${cy - 28 * s} ` +
    `M ${cx - 28 * s} ${cy - 28 * s} L ${cx - 14 * s} ${cy - 28 * s} ` +
    `M ${cx - 28 * s} ${cy - 28 * s} L ${cx - 28 * s} ${cy - 14 * s}`;

  // Top-right arrow
  const trD =
    `M ${cx + 8 * s} ${cy - 8 * s} L ${cx + 28 * s} ${cy - 28 * s} ` +
    `M ${cx + 28 * s} ${cy - 28 * s} L ${cx + 14 * s} ${cy - 28 * s} ` +
    `M ${cx + 28 * s} ${cy - 28 * s} L ${cx + 28 * s} ${cy - 14 * s}`;

  // Bottom-left arrow
  const blD =
    `M ${cx - 8 * s} ${cy + 8 * s} L ${cx - 28 * s} ${cy + 28 * s} ` +
    `M ${cx - 28 * s} ${cy + 28 * s} L ${cx - 14 * s} ${cy + 28 * s} ` +
    `M ${cx - 28 * s} ${cy + 28 * s} L ${cx - 28 * s} ${cy + 14 * s}`;

  // Bottom-right arrow
  const brD =
    `M ${cx + 8 * s} ${cy + 8 * s} L ${cx + 28 * s} ${cy + 28 * s} ` +
    `M ${cx + 28 * s} ${cy + 28 * s} L ${cx + 14 * s} ${cy + 28 * s} ` +
    `M ${cx + 28 * s} ${cy + 28 * s} L ${cx + 28 * s} ${cy + 14 * s}`;

  return (
    <g>
      <AnimatedPath d={tlD} startFrame={startFrame} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={trD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={blD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={brD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
};

// ─── ShareIcon ───────────────────────────────────────────────────────────────
interface ShareIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ShareIcon: React.FC<ShareIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.purple,
}) => {
  const s = scale;
  const dur5 = Math.floor(drawDuration / 5);

  // Center dot (source node)
  const r1 = 8 * s;
  const k1 = r1 * 0.56;
  const centerDotD =
    `M ${cx - 20 * s} ${cy} ` +
    `C ${cx - 20 * s} ${cy - k1}, ${cx - 20 * s + r1 - r1 * 0.56} ${cy - r1}, ${cx - 20 * s + r1} ${cy - r1} ` +
    `C ${cx - 20 * s + r1 + k1} ${cy - r1}, ${cx - 20 * s + r1 * 2} ${cy - k1}, ${cx - 20 * s + r1 * 2} ${cy} ` +
    `C ${cx - 20 * s + r1 * 2} ${cy + k1}, ${cx - 20 * s + r1 + k1} ${cy + r1}, ${cx - 20 * s + r1} ${cy + r1} ` +
    `C ${cx - 20 * s + r1 - k1} ${cy + r1}, ${cx - 20 * s} ${cy + k1}, ${cx - 20 * s} ${cy} Z`;

  // Top-right dot
  const topDotD =
    `M ${cx + 14 * s} ${cy - 24 * s} ` +
    `C ${cx + 14 * s} ${cy - 24 * s - k1}, ${cx + 14 * s + r1 - k1} ${cy - 24 * s - r1}, ${cx + 14 * s + r1} ${cy - 24 * s - r1} ` +
    `C ${cx + 14 * s + r1 + k1} ${cy - 24 * s - r1}, ${cx + 14 * s + r1 * 2} ${cy - 24 * s - k1}, ${cx + 14 * s + r1 * 2} ${cy - 24 * s} ` +
    `C ${cx + 14 * s + r1 * 2} ${cy - 24 * s + k1}, ${cx + 14 * s + r1 + k1} ${cy - 24 * s + r1}, ${cx + 14 * s + r1} ${cy - 24 * s + r1} ` +
    `C ${cx + 14 * s + r1 - k1} ${cy - 24 * s + r1}, ${cx + 14 * s} ${cy - 24 * s + k1}, ${cx + 14 * s} ${cy - 24 * s} Z`;

  // Bottom-right dot
  const botDotD =
    `M ${cx + 14 * s} ${cy + 24 * s} ` +
    `C ${cx + 14 * s} ${cy + 24 * s - k1}, ${cx + 14 * s + r1 - k1} ${cy + 24 * s - r1}, ${cx + 14 * s + r1} ${cy + 24 * s - r1} ` +
    `C ${cx + 14 * s + r1 + k1} ${cy + 24 * s - r1}, ${cx + 14 * s + r1 * 2} ${cy + 24 * s - k1}, ${cx + 14 * s + r1 * 2} ${cy + 24 * s} ` +
    `C ${cx + 14 * s + r1 * 2} ${cy + 24 * s + k1}, ${cx + 14 * s + r1 + k1} ${cy + 24 * s + r1}, ${cx + 14 * s + r1} ${cy + 24 * s + r1} ` +
    `C ${cx + 14 * s + r1 - k1} ${cy + 24 * s + r1}, ${cx + 14 * s} ${cy + 24 * s + k1}, ${cx + 14 * s} ${cy + 24 * s} Z`;

  // Line from center to top-right
  const lineTopD =
    `M ${cx - 10 * s} ${cy - 4 * s} L ${cx + 16 * s} ${cy - 20 * s}`;

  // Line from center to bottom-right
  const lineBotD =
    `M ${cx - 10 * s} ${cy + 4 * s} L ${cx + 16 * s} ${cy + 20 * s}`;

  return (
    <g>
      <AnimatedPath d={centerDotD} startFrame={startFrame} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={1.5} fill={color} fillOpacity={0.8} />
      <AnimatedPath d={lineTopD} startFrame={startFrame + dur5} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={topDotD} startFrame={startFrame + dur5 * 2} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={1.5} fill={color} fillOpacity={0.8} />
      <AnimatedPath d={lineBotD} startFrame={startFrame + dur5 * 3} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={botDotD} startFrame={startFrame + dur5 * 4} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={1.5} fill={color} fillOpacity={0.8} />
    </g>
  );
};
