import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── FlowerIcon ──────────────────────────────────────────────────────────────
interface FlowerIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const FlowerIcon: React.FC<FlowerIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.orange
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Stem
  const stemD =
    `M ${cx + 1 * s} ${cy + 10 * s} ` +
    `C ${cx - 2 * s} ${cy + 25 * s}, ${cx + 3 * s} ${cy + 40 * s}, ${cx - 1 * s} ${cy + 55 * s} ` +
    `M ${cx + 1 * s} ${cy + 30 * s} ` +
    `Q ${cx + 15 * s} ${cy + 22 * s}, ${cx + 20 * s} ${cy + 28 * s} ` +
    `M ${cx - 1 * s} ${cy + 38 * s} ` +
    `Q ${cx - 14 * s} ${cy + 32 * s}, ${cx - 18 * s} ${cy + 38 * s}`;

  // Petals (5 petals around center)
  const petalD =
    `M ${cx} ${cy - 8 * s} ` +
    `C ${cx - 8 * s} ${cy - 28 * s}, ${cx + 10 * s} ${cy - 30 * s}, ${cx + 1 * s} ${cy - 8 * s} ` +
    `M ${cx + 8 * s} ${cy - 3 * s} ` +
    `C ${cx + 26 * s} ${cy - 12 * s}, ${cx + 30 * s} ${cy + 5 * s}, ${cx + 8 * s} ${cy + 2 * s} ` +
    `M ${cx + 5 * s} ${cy + 8 * s} ` +
    `C ${cx + 18 * s} ${cy + 24 * s}, ${cx + 2 * s} ${cy + 28 * s}, ${cx} ${cy + 8 * s} ` +
    `M ${cx - 5 * s} ${cy + 8 * s} ` +
    `C ${cx - 20 * s} ${cy + 22 * s}, ${cx - 22 * s} ${cy + 2 * s}, ${cx - 5 * s} ${cy + 2 * s} ` +
    `M ${cx - 8 * s} ${cy - 3 * s} ` +
    `C ${cx - 28 * s} ${cy - 14 * s}, ${cx - 18 * s} ${cy - 26 * s}, ${cx - 3 * s} ${cy - 8 * s}`;

  // Center circle
  const k = 10 * s * 0.56;
  const centerD =
    `M ${cx} ${cy - 10 * s} ` +
    `C ${cx + k} ${cy - 10 * s}, ${cx + 10 * s} ${cy - k}, ${cx + 10 * s} ${cy} ` +
    `C ${cx + 10 * s} ${cy + k}, ${cx + k} ${cy + 10 * s}, ${cx} ${cy + 10 * s} ` +
    `C ${cx - k} ${cy + 10 * s}, ${cx - 10 * s} ${cy + k}, ${cx - 10 * s} ${cy} ` +
    `C ${cx - 10 * s} ${cy - k}, ${cx - k} ${cy - 10 * s}, ${cx} ${cy - 10 * s} Z`;

  return (
    <g>
      <AnimatedPath d={stemD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.green} strokeWidth={2.5} />
      <AnimatedPath d={petalD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={centerD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.yellow} fillOpacity={0.9} />
    </g>
  );
};

// ─── CompassIcon ─────────────────────────────────────────────────────────────
interface CompassIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CompassIcon: React.FC<CompassIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Outer circle
  const r = 50 * s;
  const k = r * 0.56;
  const outerD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + k + 1} ${cy - r}, ${cx + r} ${cy - k - 1}, ${cx + r} ${cy + 1} ` +
    `C ${cx + r} ${cy + k}, ${cx + k - 1} ${cy + r + 1}, ${cx - 1} ${cy + r} ` +
    `C ${cx - k} ${cy + r - 1}, ${cx - r + 1} ${cy + k + 1}, ${cx - r} ${cy - 1} ` +
    `C ${cx - r - 1} ${cy - k}, ${cx - k + 1} ${cy - r + 1}, ${cx + 1} ${cy - r} Z`;

  // Inner circle
  const ri = 10 * s;
  const ki = ri * 0.56;
  const innerD =
    `M ${cx} ${cy - ri} ` +
    `C ${cx + ki} ${cy - ri}, ${cx + ri} ${cy - ki}, ${cx + ri} ${cy} ` +
    `C ${cx + ri} ${cy + ki}, ${cx + ki} ${cy + ri}, ${cx} ${cy + ri} ` +
    `C ${cx - ki} ${cy + ri}, ${cx - ri} ${cy + ki}, ${cx - ri} ${cy} ` +
    `C ${cx - ri} ${cy - ki}, ${cx - ki} ${cy - ri}, ${cx} ${cy - ri} Z`;

  // North needle (red)
  const needleNorthD =
    `M ${cx} ${cy - 8 * s} ` +
    `L ${cx - 6 * s} ${cy + 1 * s} ` +
    `L ${cx} ${cy - 40 * s + 1} ` +
    `L ${cx + 6 * s} ${cy + 1 * s} Z`;

  // South needle
  const needleSouthD =
    `M ${cx} ${cy + 8 * s} ` +
    `L ${cx - 6 * s} ${cy - 1 * s} ` +
    `L ${cx} ${cy + 40 * s - 1} ` +
    `L ${cx + 6 * s} ${cy - 1 * s} Z`;

  return (
    <g>
      <AnimatedPath d={outerD} startFrame={startFrame} drawDuration={dur4}
        stroke={COLORS.outline} strokeWidth={2.5} fill={COLORS.white} fillOpacity={0.9} />
      <AnimatedPath d={needleNorthD} startFrame={startFrame + dur4} drawDuration={dur4}
        stroke={COLORS.red} strokeWidth={1.5} fill={COLORS.red} fillOpacity={0.7} />
      <AnimatedPath d={needleSouthD} startFrame={startFrame + dur4 * 2} drawDuration={dur4}
        stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={innerD} startFrame={startFrame + dur4 * 3} drawDuration={dur4}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.8} />
    </g>
  );
};

// ─── RocketIcon ──────────────────────────────────────────────────────────────
interface RocketIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const RocketIcon: React.FC<RocketIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Body
  const bodyD =
    `M ${cx + 1 * s} ${cy - 55 * s} ` +
    `C ${cx + 18 * s} ${cy - 38 * s}, ${cx + 22 * s} ${cy - 10 * s}, ${cx + 20 * s} ${cy + 20 * s} ` +
    `L ${cx + 12 * s} ${cy + 35 * s} ` +
    `L ${cx - 12 * s} ${cy + 35 * s} ` +
    `L ${cx - 20 * s} ${cy + 20 * s} ` +
    `C ${cx - 22 * s} ${cy - 10 * s}, ${cx - 18 * s} ${cy - 38 * s}, ${cx - 1 * s} ${cy - 55 * s} Z`;

  // Window
  const wr = 9 * s;
  const wk = wr * 0.56;
  const windowD =
    `M ${cx} ${cy - 18 * s} ` +
    `C ${cx + wk} ${cy - 18 * s}, ${cx + wr} ${cy - 18 * s + wr - wk}, ${cx + wr} ${cy - 18 * s + wr} ` +
    `C ${cx + wr} ${cy - 18 * s + wr + wk}, ${cx + wk} ${cy - 18 * s + 2 * wr}, ${cx} ${cy - 18 * s + 2 * wr} ` +
    `C ${cx - wk} ${cy - 18 * s + 2 * wr}, ${cx - wr} ${cy - 18 * s + wr + wk}, ${cx - wr} ${cy - 18 * s + wr} ` +
    `C ${cx - wr} ${cy - 18 * s + wr - wk}, ${cx - wk} ${cy - 18 * s}, ${cx} ${cy - 18 * s} Z`;

  // Fins
  const finsD =
    `M ${cx - 20 * s} ${cy + 10 * s} ` +
    `L ${cx - 35 * s} ${cy + 35 * s} ` +
    `L ${cx - 12 * s} ${cy + 30 * s} ` +
    `M ${cx + 20 * s} ${cy + 10 * s} ` +
    `L ${cx + 35 * s} ${cy + 35 * s} ` +
    `L ${cx + 12 * s} ${cy + 30 * s}`;

  // Flame
  const flameD =
    `M ${cx - 8 * s} ${cy + 35 * s} ` +
    `Q ${cx - 12 * s} ${cy + 52 * s}, ${cx} ${cy + 62 * s} ` +
    `Q ${cx + 12 * s} ${cy + 52 * s}, ${cx + 8 * s} ${cy + 35 * s} ` +
    `M ${cx - 4 * s} ${cy + 35 * s} ` +
    `Q ${cx - 5 * s} ${cy + 46 * s}, ${cx} ${cy + 52 * s} ` +
    `Q ${cx + 5 * s} ${cy + 46 * s}, ${cx + 4 * s} ${cy + 35 * s}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur4}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={windowD} startFrame={startFrame + dur4} drawDuration={dur4}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.blue} fillOpacity={0.5} />
      <AnimatedPath d={finsD} startFrame={startFrame + dur4 * 2} drawDuration={dur4}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray2} fillOpacity={0.4} />
      <AnimatedPath d={flameD} startFrame={startFrame + dur4 * 3} drawDuration={dur4}
        stroke={COLORS.orange} strokeWidth={2} fill={COLORS.orange} fillOpacity={0.6} />
    </g>
  );
};

// ─── TrophyIcon ──────────────────────────────────────────────────────────────
interface TrophyIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const TrophyIcon: React.FC<TrophyIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gold
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Cup body
  const cupD =
    `M ${cx - 30 * s} ${cy - 40 * s} ` +
    `L ${cx + 30 * s} ${cy - 40 * s} ` +
    `L ${cx + 25 * s} ${cy - 5 * s} ` +
    `Q ${cx + 22 * s} ${cy + 8 * s}, ${cx + 5 * s} ${cy + 12 * s} ` +
    `L ${cx + 5 * s} ${cy + 28 * s} ` +
    `L ${cx + 18 * s} ${cy + 35 * s} ` +
    `L ${cx - 18 * s} ${cy + 35 * s} ` +
    `L ${cx - 5 * s} ${cy + 28 * s} ` +
    `L ${cx - 5 * s} ${cy + 12 * s} ` +
    `Q ${cx - 22 * s} ${cy + 8 * s}, ${cx - 25 * s} ${cy - 5 * s} ` +
    `L ${cx - 30 * s} ${cy - 40 * s} Z`;

  // Handles
  const handlesD =
    `M ${cx - 30 * s} ${cy - 32 * s} ` +
    `Q ${cx - 50 * s} ${cy - 30 * s}, ${cx - 48 * s} ${cy - 12 * s} ` +
    `Q ${cx - 46 * s} ${cy + 2 * s}, ${cx - 25 * s} ${cy - 2 * s} ` +
    `M ${cx + 30 * s} ${cy - 32 * s} ` +
    `Q ${cx + 50 * s} ${cy - 30 * s}, ${cx + 48 * s} ${cy - 12 * s} ` +
    `Q ${cx + 46 * s} ${cy + 2 * s}, ${cx + 25 * s} ${cy - 2 * s}`;

  // Star on cup
  const starD =
    `M ${cx} ${cy - 30 * s} ` +
    `L ${cx + 4 * s} ${cy - 22 * s} ` +
    `L ${cx + 12 * s} ${cy - 22 * s} ` +
    `L ${cx + 6 * s} ${cy - 17 * s} ` +
    `L ${cx + 8 * s} ${cy - 10 * s} ` +
    `L ${cx} ${cy - 14 * s} ` +
    `L ${cx - 8 * s} ${cy - 10 * s} ` +
    `L ${cx - 6 * s} ${cy - 17 * s} ` +
    `L ${cx - 12 * s} ${cy - 22 * s} ` +
    `L ${cx - 4 * s} ${cy - 22 * s} Z`;

  return (
    <g>
      <AnimatedPath d={cupD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={handlesD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={starD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.yellow} fillOpacity={0.9} />
    </g>
  );
};

// ─── CalendarIcon ────────────────────────────────────────────────────────────
interface CalendarIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CalendarIcon: React.FC<CalendarIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Page body
  const bodyD =
    `M ${cx - 40 * s} ${cy - 35 * s} ` +
    `L ${cx + 40 * s} ${cy - 35 * s} ` +
    `L ${cx + 40 * s} ${cy + 45 * s} ` +
    `L ${cx - 40 * s} ${cy + 45 * s} Z ` +
    `M ${cx - 40 * s} ${cy - 20 * s} ` +
    `L ${cx + 40 * s} ${cy - 20 * s}`;

  // Rings at top
  const ringsD =
    `M ${cx - 22 * s} ${cy - 42 * s} L ${cx - 22 * s} ${cy - 28 * s} ` +
    `M ${cx - 8 * s} ${cy - 42 * s} L ${cx - 8 * s} ${cy - 28 * s} ` +
    `M ${cx + 8 * s} ${cy - 42 * s} L ${cx + 8 * s} ${cy - 28 * s} ` +
    `M ${cx + 22 * s} ${cy - 42 * s} L ${cx + 22 * s} ${cy - 28 * s}`;

  // Date grid dots
  const gridD =
    `M ${cx - 25 * s} ${cy - 8 * s} L ${cx - 18 * s} ${cy - 8 * s} ` +
    `M ${cx - 10 * s} ${cy - 8 * s} L ${cx - 3 * s} ${cy - 8 * s} ` +
    `M ${cx + 5 * s} ${cy - 8 * s} L ${cx + 12 * s} ${cy - 8 * s} ` +
    `M ${cx + 20 * s} ${cy - 8 * s} L ${cx + 27 * s} ${cy - 8 * s} ` +
    `M ${cx - 25 * s} ${cy + 5 * s} L ${cx - 18 * s} ${cy + 5 * s} ` +
    `M ${cx - 10 * s} ${cy + 5 * s} L ${cx - 3 * s} ${cy + 5 * s} ` +
    `M ${cx + 5 * s} ${cy + 5 * s} L ${cx + 12 * s} ${cy + 5 * s} ` +
    `M ${cx + 20 * s} ${cy + 5 * s} L ${cx + 27 * s} ${cy + 5 * s} ` +
    `M ${cx - 25 * s} ${cy + 18 * s} L ${cx - 18 * s} ${cy + 18 * s} ` +
    `M ${cx - 10 * s} ${cy + 18 * s} L ${cx - 3 * s} ${cy + 18 * s} ` +
    `M ${cx + 5 * s} ${cy + 18 * s} L ${cx + 12 * s} ${cy + 18 * s} ` +
    `M ${cx + 20 * s} ${cy + 18 * s} L ${cx + 27 * s} ${cy + 18 * s} ` +
    `M ${cx - 25 * s} ${cy + 31 * s} L ${cx - 18 * s} ${cy + 31 * s} ` +
    `M ${cx - 10 * s} ${cy + 31 * s} L ${cx - 3 * s} ${cy + 31 * s}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.white} fillOpacity={0.9} />
      <AnimatedPath d={ringsD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2.5} />
      <AnimatedPath d={gridD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.gray1} strokeWidth={1.5} />
    </g>
  );
};

// ─── CameraIcon ──────────────────────────────────────────────────────────────
interface CameraIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CameraIcon: React.FC<CameraIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.outline
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Body
  const bodyD =
    `M ${cx - 45 * s} ${cy - 22 * s} ` +
    `L ${cx - 15 * s} ${cy - 22 * s} ` +
    `L ${cx - 10 * s} ${cy - 35 * s} ` +
    `L ${cx + 15 * s} ${cy - 35 * s} ` +
    `L ${cx + 20 * s} ${cy - 22 * s} ` +
    `L ${cx + 45 * s} ${cy - 22 * s} ` +
    `L ${cx + 45 * s} ${cy + 30 * s} ` +
    `L ${cx - 45 * s} ${cy + 30 * s} Z`;

  // Lens circle
  const lr = 22 * s;
  const lk = lr * 0.56;
  const lensD =
    `M ${cx} ${cy - lr + 5 * s} ` +
    `C ${cx + lk + 1} ${cy - lr + 5 * s}, ${cx + lr} ${cy - lk + 5 * s}, ${cx + lr} ${cy + 5 * s} ` +
    `C ${cx + lr} ${cy + lk + 5 * s}, ${cx + lk} ${cy + lr + 5 * s}, ${cx} ${cy + lr + 5 * s} ` +
    `C ${cx - lk} ${cy + lr + 5 * s}, ${cx - lr} ${cy + lk + 5 * s}, ${cx - lr} ${cy + 5 * s} ` +
    `C ${cx - lr} ${cy - lk + 5 * s}, ${cx - lk} ${cy - lr + 5 * s}, ${cx} ${cy - lr + 5 * s} Z`;

  // Flash + inner lens detail
  const detailD =
    `M ${cx + 28 * s} ${cy - 18 * s} L ${cx + 36 * s} ${cy - 18 * s} ` +
    `L ${cx + 36 * s} ${cy - 14 * s} L ${cx + 28 * s} ${cy - 14 * s} Z ` +
    `M ${cx} ${cy - 5 * s} ` +
    `C ${cx + 5.6 * s} ${cy - 5 * s}, ${cx + 10 * s} ${cy + 0.6 * s}, ${cx + 10 * s} ${cy + 5 * s} ` +
    `C ${cx + 10 * s} ${cy + 10.6 * s}, ${cx + 5.6 * s} ${cy + 15 * s}, ${cx} ${cy + 15 * s} ` +
    `C ${cx - 5.6 * s} ${cy + 15 * s}, ${cx - 10 * s} ${cy + 10.6 * s}, ${cx - 10 * s} ${cy + 5 * s} ` +
    `C ${cx - 10 * s} ${cy + 0.6 * s}, ${cx - 5.6 * s} ${cy - 5 * s}, ${cx} ${cy - 5 * s} Z`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.4} />
      <AnimatedPath d={lensD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.blue} fillOpacity={0.2} />
      <AnimatedPath d={detailD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={1.5} fill={COLORS.yellow} fillOpacity={0.6} />
    </g>
  );
};

// ─── MegaphoneIcon ───────────────────────────────────────────────────────────
interface MegaphoneIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MegaphoneIcon: React.FC<MegaphoneIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.orange
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Main cone body
  const bodyD =
    `M ${cx - 35 * s} ${cy - 12 * s} ` +
    `L ${cx + 40 * s} ${cy - 40 * s} ` +
    `L ${cx + 40 * s} ${cy + 40 * s} ` +
    `L ${cx - 35 * s} ${cy + 12 * s} Z`;

  // Mouthpiece + handle
  const handleD =
    `M ${cx - 35 * s} ${cy - 12 * s} ` +
    `L ${cx - 50 * s} ${cy - 12 * s} ` +
    `L ${cx - 50 * s} ${cy + 12 * s} ` +
    `L ${cx - 35 * s} ${cy + 12 * s} ` +
    `M ${cx - 42 * s} ${cy + 12 * s} ` +
    `L ${cx - 45 * s} ${cy + 32 * s} ` +
    `L ${cx - 35 * s} ${cy + 32 * s} ` +
    `L ${cx - 33 * s} ${cy + 12 * s}`;

  // Sound waves
  const wavesD =
    `M ${cx + 48 * s} ${cy - 20 * s} ` +
    `Q ${cx + 58 * s} ${cy}, ${cx + 48 * s} ${cy + 20 * s} ` +
    `M ${cx + 55 * s} ${cy - 30 * s} ` +
    `Q ${cx + 68 * s} ${cy}, ${cx + 55 * s} ${cy + 30 * s} ` +
    `M ${cx + 62 * s} ${cy - 38 * s} ` +
    `Q ${cx + 78 * s} ${cy + 1 * s}, ${cx + 62 * s} ${cy + 38 * s}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={handleD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.5} />
      <AnimatedPath d={wavesD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={2} />
    </g>
  );
};

// ─── HourglassIcon ───────────────────────────────────────────────────────────
interface HourglassIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const HourglassIcon: React.FC<HourglassIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gold
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Outer frame (top and bottom bars + glass shape)
  const frameD =
    `M ${cx - 30 * s} ${cy - 50 * s} L ${cx + 30 * s} ${cy - 50 * s} ` +
    `M ${cx - 30 * s} ${cy + 50 * s} L ${cx + 30 * s} ${cy + 50 * s} ` +
    `M ${cx - 28 * s} ${cy - 50 * s} ` +
    `L ${cx - 28 * s} ${cy - 42 * s} ` +
    `C ${cx - 28 * s} ${cy - 20 * s}, ${cx - 5 * s} ${cy - 10 * s}, ${cx} ${cy} ` +
    `C ${cx + 5 * s} ${cy + 10 * s}, ${cx + 28 * s} ${cy + 20 * s}, ${cx + 28 * s} ${cy + 42 * s} ` +
    `L ${cx + 28 * s} ${cy + 50 * s} ` +
    `M ${cx + 28 * s} ${cy - 50 * s} ` +
    `L ${cx + 28 * s} ${cy - 42 * s} ` +
    `C ${cx + 28 * s} ${cy - 20 * s}, ${cx + 5 * s} ${cy - 10 * s}, ${cx} ${cy} ` +
    `C ${cx - 5 * s} ${cy + 10 * s}, ${cx - 28 * s} ${cy + 20 * s}, ${cx - 28 * s} ${cy + 42 * s} ` +
    `L ${cx - 28 * s} ${cy + 50 * s}`;

  // Top sand
  const sandTopD =
    `M ${cx - 18 * s} ${cy - 38 * s} ` +
    `L ${cx + 18 * s} ${cy - 38 * s} ` +
    `C ${cx + 15 * s} ${cy - 22 * s}, ${cx + 4 * s} ${cy - 14 * s}, ${cx} ${cy - 8 * s} ` +
    `C ${cx - 4 * s} ${cy - 14 * s}, ${cx - 15 * s} ${cy - 22 * s}, ${cx - 18 * s} ${cy - 38 * s} Z`;

  // Bottom sand + stream
  const sandBottomD =
    `M ${cx} ${cy + 2 * s} L ${cx} ${cy + 18 * s} ` +
    `M ${cx - 20 * s} ${cy + 45 * s} ` +
    `Q ${cx - 20 * s} ${cy + 28 * s}, ${cx} ${cy + 22 * s} ` +
    `Q ${cx + 20 * s} ${cy + 28 * s}, ${cx + 20 * s} ${cy + 45 * s} ` +
    `L ${cx - 20 * s} ${cy + 45 * s} Z`;

  return (
    <g>
      <AnimatedPath d={frameD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={sandTopD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={sandBottomD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.6} />
    </g>
  );
};

// ─── AnchorIcon ──────────────────────────────────────────────────────────────
interface AnchorIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const AnchorIcon: React.FC<AnchorIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Ring at top
  const r = 12 * s;
  const k = r * 0.56;
  const ringD =
    `M ${cx} ${cy - 50 * s} ` +
    `C ${cx + k} ${cy - 50 * s}, ${cx + r} ${cy - 50 * s + r - k}, ${cx + r} ${cy - 50 * s + r} ` +
    `C ${cx + r} ${cy - 50 * s + r + k}, ${cx + k} ${cy - 50 * s + 2 * r}, ${cx} ${cy - 50 * s + 2 * r} ` +
    `C ${cx - k} ${cy - 50 * s + 2 * r}, ${cx - r} ${cy - 50 * s + r + k}, ${cx - r} ${cy - 50 * s + r} ` +
    `C ${cx - r} ${cy - 50 * s + r - k}, ${cx - k} ${cy - 50 * s}, ${cx} ${cy - 50 * s} Z`;

  // Vertical shaft + crossbar
  const shaftD =
    `M ${cx} ${cy - 26 * s} ` +
    `L ${cx} ${cy + 50 * s} ` +
    `M ${cx - 28 * s} ${cy - 10 * s} ` +
    `L ${cx + 28 * s} ${cy - 10 * s}`;

  // Bottom curved flukes
  const flukesD =
    `M ${cx - 38 * s} ${cy + 35 * s} ` +
    `Q ${cx - 40 * s} ${cy + 50 * s + 2}, ${cx - 25 * s} ${cy + 52 * s} ` +
    `Q ${cx - 10 * s} ${cy + 52 * s}, ${cx} ${cy + 50 * s} ` +
    `M ${cx + 38 * s} ${cy + 35 * s} ` +
    `Q ${cx + 40 * s} ${cy + 50 * s + 2}, ${cx + 25 * s} ${cy + 52 * s} ` +
    `Q ${cx + 10 * s} ${cy + 52 * s}, ${cx} ${cy + 50 * s}`;

  return (
    <g>
      <AnimatedPath d={ringD} startFrame={startFrame} drawDuration={dur3}
        stroke={color} strokeWidth={2.5} />
      <AnimatedPath d={shaftD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2.5} />
      <AnimatedPath d={flukesD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={2.5} />
    </g>
  );
};

// ─── CrownIcon ───────────────────────────────────────────────────────────────
interface CrownIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CrownIcon: React.FC<CrownIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gold
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Crown body with points
  const bodyD =
    `M ${cx - 42 * s} ${cy + 25 * s} ` +
    `L ${cx - 45 * s} ${cy - 20 * s} ` +
    `L ${cx - 22 * s} ${cy - 2 * s} ` +
    `L ${cx} ${cy - 35 * s} ` +
    `L ${cx + 22 * s} ${cy - 2 * s} ` +
    `L ${cx + 45 * s} ${cy - 20 * s} ` +
    `L ${cx + 42 * s} ${cy + 25 * s} Z`;

  // Base band
  const bandD =
    `M ${cx - 42 * s} ${cy + 25 * s} ` +
    `L ${cx + 42 * s} ${cy + 25 * s} ` +
    `L ${cx + 42 * s} ${cy + 35 * s} ` +
    `L ${cx - 42 * s} ${cy + 35 * s} Z`;

  // Gems (3 small circles)
  const gr = 5 * s;
  const gk = gr * 0.56;
  const gemsD =
    `M ${cx - 22 * s} ${cy + 8 * s - gr} ` +
    `C ${cx - 22 * s + gk} ${cy + 8 * s - gr}, ${cx - 22 * s + gr} ${cy + 8 * s - gk}, ${cx - 22 * s + gr} ${cy + 8 * s} ` +
    `C ${cx - 22 * s + gr} ${cy + 8 * s + gk}, ${cx - 22 * s + gk} ${cy + 8 * s + gr}, ${cx - 22 * s} ${cy + 8 * s + gr} ` +
    `C ${cx - 22 * s - gk} ${cy + 8 * s + gr}, ${cx - 22 * s - gr} ${cy + 8 * s + gk}, ${cx - 22 * s - gr} ${cy + 8 * s} ` +
    `C ${cx - 22 * s - gr} ${cy + 8 * s - gk}, ${cx - 22 * s - gk} ${cy + 8 * s - gr}, ${cx - 22 * s} ${cy + 8 * s - gr} Z ` +
    `M ${cx} ${cy - 8 * s - gr} ` +
    `C ${cx + gk} ${cy - 8 * s - gr}, ${cx + gr} ${cy - 8 * s - gk}, ${cx + gr} ${cy - 8 * s} ` +
    `C ${cx + gr} ${cy - 8 * s + gk}, ${cx + gk} ${cy - 8 * s + gr}, ${cx} ${cy - 8 * s + gr} ` +
    `C ${cx - gk} ${cy - 8 * s + gr}, ${cx - gr} ${cy - 8 * s + gk}, ${cx - gr} ${cy - 8 * s} ` +
    `C ${cx - gr} ${cy - 8 * s - gk}, ${cx - gk} ${cy - 8 * s - gr}, ${cx} ${cy - 8 * s - gr} Z ` +
    `M ${cx + 22 * s} ${cy + 8 * s - gr} ` +
    `C ${cx + 22 * s + gk} ${cy + 8 * s - gr}, ${cx + 22 * s + gr} ${cy + 8 * s - gk}, ${cx + 22 * s + gr} ${cy + 8 * s} ` +
    `C ${cx + 22 * s + gr} ${cy + 8 * s + gk}, ${cx + 22 * s + gk} ${cy + 8 * s + gr}, ${cx + 22 * s} ${cy + 8 * s + gr} ` +
    `C ${cx + 22 * s - gk} ${cy + 8 * s + gr}, ${cx + 22 * s - gr} ${cy + 8 * s + gk}, ${cx + 22 * s - gr} ${cy + 8 * s} ` +
    `C ${cx + 22 * s - gr} ${cy + 8 * s - gk}, ${cx + 22 * s - gk} ${cy + 8 * s - gr}, ${cx + 22 * s} ${cy + 8 * s - gr} Z`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={bandD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.7} />
      <AnimatedPath d={gemsD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.red} fillOpacity={0.8} />
    </g>
  );
};

// ─── ScissorsIcon ────────────────────────────────────────────────────────────
interface ScissorsIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ScissorsIcon: React.FC<ScissorsIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray1
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Left blade
  const leftBladeD =
    `M ${cx} ${cy} ` +
    `L ${cx - 30 * s} ${cy - 50 * s} ` +
    `Q ${cx - 25 * s} ${cy - 55 * s}, ${cx - 20 * s} ${cy - 50 * s} ` +
    `L ${cx + 5 * s} ${cy + 2 * s}`;

  // Right blade
  const rightBladeD =
    `M ${cx} ${cy} ` +
    `L ${cx + 30 * s} ${cy - 50 * s} ` +
    `Q ${cx + 25 * s} ${cy - 55 * s}, ${cx + 20 * s} ${cy - 50 * s} ` +
    `L ${cx - 5 * s} ${cy + 2 * s}`;

  // Handle loops
  const hr = 16 * s;
  const hk = hr * 0.56;
  const handlesD =
    `M ${cx - 8 * s} ${cy + 5 * s} ` +
    `C ${cx - 8 * s - hk} ${cy + 5 * s}, ${cx - 8 * s - hr} ${cy + 5 * s + hr - hk}, ${cx - 8 * s - hr} ${cy + 5 * s + hr} ` +
    `C ${cx - 8 * s - hr} ${cy + 5 * s + hr + hk}, ${cx - 8 * s - hk} ${cy + 5 * s + 2 * hr}, ${cx - 8 * s} ${cy + 5 * s + 2 * hr} ` +
    `C ${cx - 8 * s + hk} ${cy + 5 * s + 2 * hr}, ${cx - 8 * s + hr} ${cy + 5 * s + hr + hk}, ${cx - 8 * s + hr} ${cy + 5 * s + hr} ` +
    `C ${cx - 8 * s + hr} ${cy + 5 * s + hr - hk}, ${cx - 8 * s + hk} ${cy + 5 * s}, ${cx - 8 * s} ${cy + 5 * s} Z ` +
    `M ${cx + 8 * s} ${cy + 5 * s} ` +
    `C ${cx + 8 * s + hk} ${cy + 5 * s}, ${cx + 8 * s + hr} ${cy + 5 * s + hr - hk}, ${cx + 8 * s + hr} ${cy + 5 * s + hr} ` +
    `C ${cx + 8 * s + hr} ${cy + 5 * s + hr + hk}, ${cx + 8 * s + hk} ${cy + 5 * s + 2 * hr}, ${cx + 8 * s} ${cy + 5 * s + 2 * hr} ` +
    `C ${cx + 8 * s - hk} ${cy + 5 * s + 2 * hr}, ${cx + 8 * s - hr} ${cy + 5 * s + hr + hk}, ${cx + 8 * s - hr} ${cy + 5 * s + hr} ` +
    `C ${cx + 8 * s - hr} ${cy + 5 * s + hr - hk}, ${cx + 8 * s - hk} ${cy + 5 * s}, ${cx + 8 * s} ${cy + 5 * s} Z`;

  return (
    <g>
      <AnimatedPath d={leftBladeD} startFrame={startFrame} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.3} />
      <AnimatedPath d={rightBladeD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.3} />
      <AnimatedPath d={handlesD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.purple} fillOpacity={0.3} />
    </g>
  );
};

// ─── GiftIcon ────────────────────────────────────────────────────────────────
interface GiftIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const GiftIcon: React.FC<GiftIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.red
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Box body
  const boxD =
    `M ${cx - 35 * s} ${cy - 15 * s} ` +
    `L ${cx + 35 * s} ${cy - 15 * s} ` +
    `L ${cx + 35 * s} ${cy + 40 * s} ` +
    `L ${cx - 35 * s} ${cy + 40 * s} Z ` +
    // Lid
    `M ${cx - 40 * s} ${cy - 15 * s} ` +
    `L ${cx + 40 * s} ${cy - 15 * s} ` +
    `L ${cx + 40 * s} ${cy - 28 * s} ` +
    `L ${cx - 40 * s} ${cy - 28 * s} Z`;

  // Ribbon cross
  const ribbonD =
    `M ${cx - 5 * s} ${cy - 28 * s} L ${cx - 5 * s} ${cy + 40 * s} ` +
    `M ${cx + 5 * s} ${cy - 28 * s} L ${cx + 5 * s} ${cy + 40 * s} ` +
    `M ${cx - 40 * s} ${cy - 20 * s} L ${cx + 40 * s} ${cy - 20 * s}`;

  // Bow on top
  const bowD =
    `M ${cx} ${cy - 28 * s} ` +
    `Q ${cx - 20 * s} ${cy - 32 * s}, ${cx - 25 * s} ${cy - 45 * s} ` +
    `Q ${cx - 22 * s} ${cy - 55 * s}, ${cx} ${cy - 42 * s} ` +
    `Q ${cx + 22 * s} ${cy - 55 * s}, ${cx + 25 * s} ${cy - 45 * s} ` +
    `Q ${cx + 20 * s} ${cy - 32 * s}, ${cx} ${cy - 28 * s} Z`;

  return (
    <g>
      <AnimatedPath d={boxD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={ribbonD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2.5} />
      <AnimatedPath d={bowD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={color} fillOpacity={0.5} />
    </g>
  );
};

// ─── MusicNoteIcon ───────────────────────────────────────────────────────────
interface MusicNoteIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MusicNoteIcon: React.FC<MusicNoteIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.purple
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Stem and beam connecting two notes
  const stemD =
    `M ${cx - 15 * s} ${cy + 25 * s} L ${cx - 15 * s} ${cy - 45 * s} ` +
    `M ${cx + 25 * s} ${cy + 15 * s} L ${cx + 25 * s} ${cy - 45 * s} ` +
    `M ${cx - 15 * s} ${cy - 45 * s} L ${cx + 25 * s} ${cy - 45 * s} ` +
    `M ${cx - 15 * s} ${cy - 35 * s} L ${cx + 25 * s} ${cy - 35 * s}`;

  // Left note head (oval)
  const leftNoteD =
    `M ${cx - 15 * s} ${cy + 25 * s} ` +
    `C ${cx - 15 * s + 10 * s} ${cy + 25 * s + 8 * s}, ${cx - 15 * s - 2 * s} ${cy + 25 * s + 16 * s}, ${cx - 15 * s - 12 * s} ${cy + 25 * s + 10 * s} ` +
    `C ${cx - 15 * s - 22 * s} ${cy + 25 * s + 4 * s}, ${cx - 15 * s - 10 * s} ${cy + 25 * s - 6 * s}, ${cx - 15 * s} ${cy + 25 * s} Z`;

  // Right note head (oval)
  const rightNoteD =
    `M ${cx + 25 * s} ${cy + 15 * s} ` +
    `C ${cx + 25 * s + 10 * s} ${cy + 15 * s + 8 * s}, ${cx + 25 * s - 2 * s} ${cy + 15 * s + 16 * s}, ${cx + 25 * s - 12 * s} ${cy + 15 * s + 10 * s} ` +
    `C ${cx + 25 * s - 22 * s} ${cy + 15 * s + 4 * s}, ${cx + 25 * s - 10 * s} ${cy + 15 * s - 6 * s}, ${cx + 25 * s} ${cy + 15 * s} Z`;

  return (
    <g>
      <AnimatedPath d={stemD} startFrame={startFrame} drawDuration={dur3}
        stroke={color} strokeWidth={2.5} />
      <AnimatedPath d={leftNoteD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.7} />
      <AnimatedPath d={rightNoteD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.7} />
    </g>
  );
};

// ─── PaintBrushIcon ──────────────────────────────────────────────────────────
interface PaintBrushIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const PaintBrushIcon: React.FC<PaintBrushIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.orange
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Handle
  const handleD =
    `M ${cx + 30 * s} ${cy - 50 * s} ` +
    `L ${cx + 35 * s} ${cy - 45 * s} ` +
    `L ${cx - 15 * s} ${cy + 8 * s} ` +
    `L ${cx - 20 * s} ${cy + 3 * s} Z`;

  // Ferrule (metal band)
  const ferruleD =
    `M ${cx - 15 * s} ${cy + 8 * s} ` +
    `L ${cx - 10 * s} ${cy + 13 * s} ` +
    `L ${cx - 25 * s} ${cy + 25 * s} ` +
    `L ${cx - 30 * s} ${cy + 20 * s} Z`;

  // Bristles with paint
  const bristlesD =
    `M ${cx - 25 * s} ${cy + 25 * s} ` +
    `Q ${cx - 30 * s} ${cy + 35 * s}, ${cx - 35 * s} ${cy + 42 * s} ` +
    `Q ${cx - 40 * s} ${cy + 50 * s}, ${cx - 38 * s} ${cy + 55 * s} ` +
    `M ${cx - 30 * s} ${cy + 20 * s} ` +
    `Q ${cx - 38 * s} ${cy + 32 * s}, ${cx - 42 * s} ${cy + 40 * s} ` +
    `Q ${cx - 48 * s} ${cy + 48 * s}, ${cx - 45 * s} ${cy + 52 * s} ` +
    `M ${cx - 27 * s} ${cy + 22 * s} ` +
    `Q ${cx - 34 * s} ${cy + 34 * s}, ${cx - 40 * s} ${cy + 48 * s}`;

  return (
    <g>
      <AnimatedPath d={handleD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.yellow} fillOpacity={0.6} />
      <AnimatedPath d={ferruleD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray2} fillOpacity={0.5} />
      <AnimatedPath d={bristlesD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={2.5} />
    </g>
  );
};

// ─── PencilIcon ──────────────────────────────────────────────────────────────
interface PencilIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const PencilIcon: React.FC<PencilIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Body
  const bodyD =
    `M ${cx - 35 * s} ${cy + 35 * s} ` +
    `L ${cx + 25 * s} ${cy - 50 * s} ` +
    `L ${cx + 35 * s} ${cy - 42 * s} ` +
    `L ${cx - 25 * s} ${cy + 42 * s} Z`;

  // Tip
  const tipD =
    `M ${cx - 35 * s} ${cy + 35 * s} ` +
    `L ${cx - 45 * s} ${cy + 55 * s} ` +
    `L ${cx - 25 * s} ${cy + 42 * s} Z`;

  // Eraser band + writing line
  const detailsD =
    `M ${cx + 22 * s} ${cy - 44 * s} ` +
    `L ${cx + 28 * s} ${cy - 52 * s} ` +
    `L ${cx + 38 * s} ${cy - 44 * s} ` +
    `L ${cx + 32 * s} ${cy - 36 * s} Z ` +
    `M ${cx - 42 * s} ${cy + 58 * s} ` +
    `Q ${cx - 30 * s} ${cy + 55 * s}, ${cx - 20 * s} ${cy + 60 * s} ` +
    `Q ${cx - 10 * s} ${cy + 62 * s}, ${cx} ${cy + 58 * s}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={tipD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.6} />
      <AnimatedPath d={detailsD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.red} fillOpacity={0.5} />
    </g>
  );
};

// ─── FolderIcon ──────────────────────────────────────────────────────────────
interface FolderIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const FolderIcon: React.FC<FolderIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow
}) => {
  const s = scale;
  const dur2 = Math.floor(drawDuration / 2);

  // Folder body with tab
  const bodyD =
    `M ${cx - 45 * s} ${cy - 25 * s} ` +
    `L ${cx - 12 * s} ${cy - 25 * s} ` +
    `L ${cx - 5 * s} ${cy - 38 * s} ` +
    `L ${cx + 20 * s} ${cy - 38 * s} ` +
    `L ${cx + 25 * s} ${cy - 25 * s} ` +
    `L ${cx + 45 * s} ${cy - 25 * s} ` +
    `L ${cx + 45 * s} ${cy + 35 * s} ` +
    `L ${cx - 45 * s} ${cy + 35 * s} Z`;

  // Inner fold line + file peek
  const detailD =
    `M ${cx - 45 * s} ${cy - 18 * s} L ${cx + 45 * s} ${cy - 18 * s} ` +
    `M ${cx - 30 * s} ${cy} L ${cx + 20 * s} ${cy} ` +
    `M ${cx - 30 * s} ${cy + 12 * s} L ${cx + 10 * s} ${cy + 12 * s}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur2}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={detailD} startFrame={startFrame + dur2} drawDuration={dur2}
        stroke={COLORS.gray1} strokeWidth={1.5} />
    </g>
  );
};

// ─── TrashIcon ───────────────────────────────────────────────────────────────
interface TrashIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const TrashIcon: React.FC<TrashIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray1
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Lid + handle
  const lidD =
    `M ${cx - 35 * s} ${cy - 30 * s} L ${cx + 35 * s} ${cy - 30 * s} ` +
    `M ${cx - 12 * s} ${cy - 30 * s} ` +
    `L ${cx - 10 * s} ${cy - 40 * s} ` +
    `L ${cx + 10 * s} ${cy - 40 * s} ` +
    `L ${cx + 12 * s} ${cy - 30 * s}`;

  // Can body
  const canD =
    `M ${cx - 30 * s} ${cy - 30 * s} ` +
    `L ${cx - 25 * s} ${cy + 45 * s} ` +
    `L ${cx + 25 * s} ${cy + 45 * s} ` +
    `L ${cx + 30 * s} ${cy - 30 * s}`;

  // Vertical lines (ribs)
  const ribsD =
    `M ${cx - 12 * s} ${cy - 22 * s} L ${cx - 10 * s} ${cy + 38 * s} ` +
    `M ${cx} ${cy - 22 * s} L ${cx} ${cy + 38 * s} ` +
    `M ${cx + 12 * s} ${cy - 22 * s} L ${cx + 10 * s} ${cy + 38 * s}`;

  return (
    <g>
      <AnimatedPath d={lidD} startFrame={startFrame} drawDuration={dur3}
        stroke={color} strokeWidth={2.5} />
      <AnimatedPath d={canD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.3} />
      <AnimatedPath d={ribsD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={1.5} />
    </g>
  );
};

// ─── TagIcon ─────────────────────────────────────────────────────────────────
interface TagIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const TagIcon: React.FC<TagIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green
}) => {
  const s = scale;
  const dur2 = Math.floor(drawDuration / 2);

  // Tag body
  const bodyD =
    `M ${cx - 45 * s} ${cy} ` +
    `L ${cx - 15 * s} ${cy - 35 * s} ` +
    `L ${cx + 40 * s} ${cy - 35 * s} ` +
    `L ${cx + 40 * s} ${cy + 35 * s} ` +
    `L ${cx - 15 * s} ${cy + 35 * s} Z`;

  // Hole circle + lines
  const hr = 8 * s;
  const hk = hr * 0.56;
  const detailD =
    `M ${cx - 15 * s} ${cy - hr} ` +
    `C ${cx - 15 * s + hk} ${cy - hr}, ${cx - 15 * s + hr} ${cy - hk}, ${cx - 15 * s + hr} ${cy} ` +
    `C ${cx - 15 * s + hr} ${cy + hk}, ${cx - 15 * s + hk} ${cy + hr}, ${cx - 15 * s} ${cy + hr} ` +
    `C ${cx - 15 * s - hk} ${cy + hr}, ${cx - 15 * s - hr} ${cy + hk}, ${cx - 15 * s - hr} ${cy} ` +
    `C ${cx - 15 * s - hr} ${cy - hk}, ${cx - 15 * s - hk} ${cy - hr}, ${cx - 15 * s} ${cy - hr} Z ` +
    `M ${cx + 5 * s} ${cy - 10 * s} L ${cx + 30 * s} ${cy - 10 * s} ` +
    `M ${cx + 5 * s} ${cy} L ${cx + 30 * s} ${cy} ` +
    `M ${cx + 5 * s} ${cy + 10 * s} L ${cx + 25 * s} ${cy + 10 * s}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur2}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={detailD} startFrame={startFrame + dur2} drawDuration={dur2}
        stroke={COLORS.outline} strokeWidth={1.5} />
    </g>
  );
};

// ─── MicrophoneIcon ──────────────────────────────────────────────────────────
interface MicrophoneIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray1
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Mic head (rounded top capsule)
  const r = 18 * s;
  const k = r * 0.56;
  const headD =
    `M ${cx - r} ${cy - 10 * s} ` +
    `L ${cx - r} ${cy - 25 * s} ` +
    `C ${cx - r} ${cy - 25 * s - k}, ${cx - k} ${cy - 25 * s - r}, ${cx} ${cy - 25 * s - r} ` +
    `C ${cx + k} ${cy - 25 * s - r}, ${cx + r} ${cy - 25 * s - k}, ${cx + r} ${cy - 25 * s} ` +
    `L ${cx + r} ${cy - 10 * s} ` +
    `L ${cx - r} ${cy - 10 * s} Z`;

  // Body + stand cradle
  const cradleD =
    `M ${cx - 25 * s} ${cy - 5 * s} ` +
    `Q ${cx - 25 * s} ${cy + 20 * s}, ${cx} ${cy + 22 * s} ` +
    `Q ${cx + 25 * s} ${cy + 20 * s}, ${cx + 25 * s} ${cy - 5 * s} ` +
    `M ${cx} ${cy + 22 * s} L ${cx} ${cy + 45 * s} ` +
    `M ${cx - 18 * s} ${cy + 45 * s} L ${cx + 18 * s} ${cy + 45 * s}`;

  // Grille lines on mic head
  const grilleD =
    `M ${cx - 14 * s} ${cy - 20 * s} L ${cx + 14 * s} ${cy - 20 * s} ` +
    `M ${cx - 16 * s} ${cy - 28 * s} L ${cx + 16 * s} ${cy - 28 * s} ` +
    `M ${cx - 14 * s} ${cy - 36 * s} L ${cx + 14 * s} ${cy - 36 * s}`;

  return (
    <g>
      <AnimatedPath d={headD} startFrame={startFrame} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={cradleD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={grilleD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.gray2} strokeWidth={1.5} />
    </g>
  );
};

// ─── SpeakerIcon ─────────────────────────────────────────────────────────────
interface SpeakerIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const SpeakerIcon: React.FC<SpeakerIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.outline
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Speaker body (trapezoid)
  const bodyD =
    `M ${cx - 15 * s} ${cy - 18 * s} ` +
    `L ${cx - 35 * s} ${cy - 18 * s} ` +
    `L ${cx - 35 * s} ${cy + 18 * s} ` +
    `L ${cx - 15 * s} ${cy + 18 * s} ` +
    `L ${cx + 10 * s} ${cy + 40 * s} ` +
    `L ${cx + 10 * s} ${cy - 40 * s} ` +
    `L ${cx - 15 * s} ${cy - 18 * s} Z`;

  // Sound waves
  const wavesD =
    `M ${cx + 20 * s} ${cy - 18 * s} ` +
    `Q ${cx + 32 * s} ${cy}, ${cx + 20 * s} ${cy + 18 * s} ` +
    `M ${cx + 28 * s} ${cy - 28 * s} ` +
    `Q ${cx + 45 * s} ${cy}, ${cx + 28 * s} ${cy + 28 * s} ` +
    `M ${cx + 36 * s} ${cy - 38 * s} ` +
    `Q ${cx + 58 * s} ${cy + 1 * s}, ${cx + 36 * s} ${cy + 38 * s}`;

  // Speaker cone detail
  const coneD =
    `M ${cx - 25 * s} ${cy - 8 * s} ` +
    `L ${cx - 25 * s} ${cy + 8 * s} ` +
    `L ${cx - 5 * s} ${cy + 18 * s} ` +
    `L ${cx - 5 * s} ${cy - 18 * s} Z`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.3} />
      <AnimatedPath d={coneD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={1.5} fill={COLORS.gray2} fillOpacity={0.3} />
      <AnimatedPath d={wavesD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={COLORS.blue} strokeWidth={2} />
    </g>
  );
};

// ─── HeadphonesIcon ──────────────────────────────────────────────────────────
interface HeadphonesIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const HeadphonesIcon: React.FC<HeadphonesIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.outline
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Headband arc
  const bandD =
    `M ${cx - 40 * s} ${cy + 5 * s} ` +
    `C ${cx - 40 * s} ${cy - 50 * s}, ${cx + 40 * s} ${cy - 50 * s}, ${cx + 40 * s} ${cy + 5 * s}`;

  // Left ear cup
  const leftCupD =
    `M ${cx - 45 * s} ${cy - 2 * s} ` +
    `L ${cx - 30 * s} ${cy - 2 * s} ` +
    `L ${cx - 30 * s} ${cy + 35 * s} ` +
    `L ${cx - 45 * s} ${cy + 35 * s} Z`;

  // Right ear cup
  const rightCupD =
    `M ${cx + 30 * s} ${cy - 2 * s} ` +
    `L ${cx + 45 * s} ${cy - 2 * s} ` +
    `L ${cx + 45 * s} ${cy + 35 * s} ` +
    `L ${cx + 30 * s} ${cy + 35 * s} Z`;

  return (
    <g>
      <AnimatedPath d={bandD} startFrame={startFrame} drawDuration={dur3}
        stroke={color} strokeWidth={3} />
      <AnimatedPath d={leftCupD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.gray2} fillOpacity={0.5} />
      <AnimatedPath d={rightCupD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.gray2} fillOpacity={0.5} />
    </g>
  );
};

// ─── USBPlugIcon ─────────────────────────────────────────────────────────────
interface USBPlugIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const USBPlugIcon: React.FC<USBPlugIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray1
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Metal connector tip
  const tipD =
    `M ${cx - 15 * s} ${cy - 50 * s} ` +
    `L ${cx + 15 * s} ${cy - 50 * s} ` +
    `L ${cx + 15 * s} ${cy - 15 * s} ` +
    `L ${cx - 15 * s} ${cy - 15 * s} Z`;

  // Body / housing
  const bodyD =
    `M ${cx - 12 * s} ${cy - 15 * s} ` +
    `L ${cx + 12 * s} ${cy - 15 * s} ` +
    `L ${cx + 12 * s} ${cy + 30 * s} ` +
    `Q ${cx + 12 * s} ${cy + 40 * s}, ${cx} ${cy + 42 * s} ` +
    `Q ${cx - 12 * s} ${cy + 40 * s}, ${cx - 12 * s} ${cy + 30 * s} Z`;

  // Inner contact pins + USB trident symbol
  const detailD =
    `M ${cx - 6 * s} ${cy - 42 * s} L ${cx - 6 * s} ${cy - 25 * s} ` +
    `M ${cx + 6 * s} ${cy - 42 * s} L ${cx + 6 * s} ${cy - 25 * s} ` +
    // USB trident
    `M ${cx} ${cy + 5 * s} L ${cx} ${cy + 28 * s} ` +
    `M ${cx} ${cy + 10 * s} L ${cx - 7 * s} ${cy + 18 * s} ` +
    `M ${cx} ${cy + 10 * s} L ${cx + 7 * s} ${cy + 18 * s}`;

  return (
    <g>
      <AnimatedPath d={tipD} startFrame={startFrame} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.6} />
      <AnimatedPath d={bodyD} startFrame={startFrame + dur3} drawDuration={dur3}
        stroke={color} strokeWidth={2} fill={COLORS.white} fillOpacity={0.8} />
      <AnimatedPath d={detailD} startFrame={startFrame + dur3 * 2} drawDuration={dur3}
        stroke={color} strokeWidth={1.5} />
    </g>
  );
};
