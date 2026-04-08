import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── GrowthTransformIcon ──────────────────────────────────────────────────────
interface GrowthTransformIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const GrowthTransformIcon: React.FC<GrowthTransformIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Small seed/starting point
  const seedD = 
    `M ${cx - 35 * s + 1} ${cy + 25 * s - 1} ` +
    `C ${cx - 38 * s} ${cy + 22 * s}, ${cx - 38 * s + 2} ${cy + 18 * s}, ${cx - 32 * s - 1} ${cy + 18 * s + 1} ` +
    `C ${cx - 28 * s + 1} ${cy + 18 * s}, ${cx - 28 * s} ${cy + 22 * s - 1}, ${cx - 32 * s} ${cy + 25 * s} ` +
    `C ${cx - 34 * s - 1} ${cy + 27 * s + 1}, ${cx - 37 * s + 1} ${cy + 27 * s}, ${cx - 35 * s + 1} ${cy + 25 * s - 1} Z`;

  // Small plant sprout
  const sproutD =
    `M ${cx - 33 * s} ${cy + 18 * s + 1} ` +
    `Q ${cx - 35 * s - 1} ${cy + 12 * s}, ${cx - 30 * s + 2} ${cy + 8 * s - 1} ` +
    `Q ${cx - 25 * s} ${cy + 5 * s + 1}, ${cx - 18 * s - 1} ${cy + 12 * s} ` +
    `M ${cx - 22 * s + 1} ${cy + 10 * s} ` +
    `Q ${cx - 18 * s} ${cy + 6 * s - 1}, ${cx - 12 * s + 1} ${cy + 8 * s + 1}`;

  // Medium growing plant with leaves
  const plantD =
    `M ${cx - 8 * s - 1} ${cy + 25 * s} ` +
    `Q ${cx - 10 * s + 1} ${cy + 15 * s - 2}, ${cx - 5 * s} ${cy + 5 * s + 1} ` +
    `Q ${cx - 2 * s - 1} ${cy - 8 * s}, ${cx + 5 * s + 1} ${cy - 15 * s - 1} ` +
    `M ${cx - 2 * s + 1} ${cy + 8 * s} ` +
    `Q ${cx - 8 * s} ${cy + 5 * s - 1}, ${cx - 6 * s - 1} ${cy - 2 * s + 1} ` +
    `M ${cx + 1 * s} ${cy - 5 * s - 1} ` +
    `Q ${cx + 8 * s + 1} ${cy - 8 * s}, ${cx + 10 * s - 1} ${cy - 1 * s + 1}`;

  // Large transformative tree with upward arrow motion
  const treeD =
    `M ${cx + 18 * s + 1} ${cy + 25 * s} ` +
    `Q ${cx + 16 * s - 1} ${cy + 10 * s + 2}, ${cx + 22 * s} ${cy - 5 * s - 1} ` +
    `Q ${cx + 25 * s + 2} ${cy - 25 * s}, ${cx + 35 * s - 1} ${cy - 40 * s + 1} ` +
    // Arrow-like branches pointing upward
    `M ${cx + 25 * s - 1} ${cy - 15 * s} ` +
    `L ${cx + 15 * s + 1} ${cy - 25 * s - 1} ` +
    `M ${cx + 25 * s + 1} ${cy - 15 * s} ` +
    `L ${cx + 35 * s - 1} ${cy - 25 * s + 1} ` +
    `M ${cx + 30 * s} ${cy - 30 * s - 1} ` +
    `L ${cx + 22 * s + 1} ${cy - 38 * s} ` +
    `M ${cx + 30 * s - 1} ${cy - 30 * s + 1} ` +
    `L ${cx + 38 * s} ${cy - 38 * s - 1}`;

  return (
    <g>
      <AnimatedPath 
        d={seedD} 
        startFrame={startFrame} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2} 
        fill={COLORS.yellow} 
        fillOpacity={0.6} 
      />
      <AnimatedPath 
        d={sproutD} 
        startFrame={startFrame + dur4} 
        drawDuration={dur4} 
        stroke={color} 
        strokeWidth={2.5} 
      />
      <AnimatedPath 
        d={plantD} 
        startFrame={startFrame + dur4 * 2} 
        drawDuration={dur4} 
        stroke={color} 
        strokeWidth={2.5} 
      />
      <AnimatedPath 
        d={treeD} 
        startFrame={startFrame + dur4 * 3} 
        drawDuration={dur4} 
        stroke={color} 
        strokeWidth={3} 
      />
    </g>
  );
};

// ─── MountainPeakIcon ─────────────────────────────────────────────────────────
interface MountainPeakIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MountainPeakIcon: React.FC<MountainPeakIconProps> = ({ 
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray2 
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Main mountain peak (tallest in center)
  const mainPeakD = 
    `M ${cx - 45 * s + 1} ${cy + 32 * s} ` +
    `L ${cx - 8 * s + 2} ${cy - 48 * s} ` +
    `L ${cx + 12 * s - 1} ${cy - 52 * s} ` +
    `L ${cx + 52 * s - 2} ${cy + 32 * s}`;

  // Left mountain (shorter)
  const leftPeakD = 
    `M ${cx - 68 * s + 2} ${cy + 32 * s} ` +
    `L ${cx - 28 * s - 1} ${cy - 15 * s} ` +
    `L ${cx - 18 * s + 1} ${cy - 12 * s} ` +
    `L ${cx + 8 * s - 2} ${cy + 32 * s}`;

  // Right mountain (medium height)
  const rightPeakD = 
    `M ${cx + 28 * s - 1} ${cy + 32 * s} ` +
    `L ${cx + 42 * s + 1} ${cy - 28 * s} ` +
    `L ${cx + 58 * s - 2} ${cy - 22 * s} ` +
    `L ${cx + 75 * s + 1} ${cy + 32 * s}`;

  // Summit flag on main peak
  const flagD = 
    `M ${cx + 12 * s} ${cy - 52 * s} ` +
    `L ${cx + 12 * s} ${cy - 62 * s} ` +
    `M ${cx + 12 * s} ${cy - 62 * s} ` +
    `L ${cx + 22 * s - 1} ${cy - 58 * s} ` +
    `L ${cx + 20 * s + 1} ${cy - 54 * s} ` +
    `L ${cx + 12 * s} ${cy - 58 * s}`;

  return (
    <g>
      <AnimatedPath 
        d={leftPeakD} 
        startFrame={startFrame} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2.5} 
        fill={color} 
        fillOpacity={0.4} 
      />
      <AnimatedPath 
        d={rightPeakD} 
        startFrame={startFrame + dur4} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2.5} 
        fill={color} 
        fillOpacity={0.5} 
      />
      <AnimatedPath 
        d={mainPeakD} 
        startFrame={startFrame + dur4 * 2} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={3} 
        fill={color} 
        fillOpacity={0.7} 
      />
      <AnimatedPath 
        d={flagD} 
        startFrame={startFrame + dur4 * 3} 
        drawDuration={dur4} 
        stroke={COLORS.red} 
        strokeWidth={2} 
        fill={COLORS.red} 
        fillOpacity={0.6} 
      />
    </g>
  );
};

// ─── WaveIcon ─────────────────────────────────────────────────────────────────
interface WaveIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const WaveIcon: React.FC<WaveIconProps> = ({ 
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue 
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Large wave in front
  const frontWaveD =
    `M ${cx - 65 * s} ${cy + 15 * s} ` +
    `C ${cx - 45 * s} ${cy - 25 * s}, ${cx - 25 * s} ${cy - 28 * s}, ${cx - 8 * s} ${cy - 12 * s} ` +
    `C ${cx + 8 * s} ${cy + 5 * s}, ${cx + 28 * s} ${cy + 8 * s}, ${cx + 48 * s} ${cy - 8 * s} ` +
    `C ${cx + 65 * s} ${cy - 22 * s}, ${cx + 72 * s} ${cy - 15 * s}, ${cx + 75 * s} ${cy + 2 * s}`;

  // Medium wave behind
  const middleWaveD =
    `M ${cx - 60 * s} ${cy + 5 * s} ` +
    `C ${cx - 42 * s} ${cy - 18 * s}, ${cx - 22 * s} ${cy - 20 * s}, ${cx - 5 * s} ${cy - 8 * s} ` +
    `C ${cx + 12 * s} ${cy + 2 * s}, ${cx + 30 * s} ${cy + 4 * s}, ${cx + 50 * s} ${cy - 5 * s} ` +
    `C ${cx + 68 * s} ${cy - 15 * s}, ${cx + 72 * s} ${cy - 8 * s}, ${cx + 75 * s} ${cy + 8 * s}`;

  // Small wave in back
  const backWaveD =
    `M ${cx - 55 * s} ${cy - 8 * s} ` +
    `C ${cx - 38 * s} ${cy - 22 * s}, ${cx - 18 * s} ${cy - 24 * s}, ${cx - 2 * s} ${cy - 15 * s} ` +
    `C ${cx + 15 * s} ${cy - 6 * s}, ${cx + 32 * s} ${cy - 4 * s}, ${cx + 52 * s} ${cy - 12 * s} ` +
    `C ${cx + 68 * s} ${cy - 20 * s}, ${cx + 72 * s} ${cy - 15 * s}, ${cx + 75 * s} ${cy - 5 * s}`;

  return (
    <g>
      <AnimatedPath 
        d={backWaveD} 
        startFrame={startFrame} 
        drawDuration={dur3} 
        stroke={color} 
        strokeWidth={2} 
        opacity={0.4}
      />
      <AnimatedPath 
        d={middleWaveD} 
        startFrame={startFrame + dur3} 
        drawDuration={dur3} 
        stroke={color} 
        strokeWidth={2.5} 
        opacity={0.7}
      />
      <AnimatedPath 
        d={frontWaveD} 
        startFrame={startFrame + dur3 * 2} 
        drawDuration={dur3} 
        stroke={color} 
        strokeWidth={3}
      />
    </g>
  );
};

// ─── FlameIcon ────────────────────────────────────────────────────────────────
interface FlameIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const FlameIcon: React.FC<FlameIconProps> = ({ 
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.orange 
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Main flame body - organic teardrop shape with flickering top
  const mainFlameD =
    `M ${cx} ${cy + 35 * s} ` +
    `C ${cx - 18 * s} ${cy + 35 * s}, ${cx - 28 * s} ${cy + 15 * s}, ${cx - 25 * s} ${cy - 5 * s} ` +
    `C ${cx - 22 * s} ${cy - 25 * s}, ${cx - 8 * s} ${cy - 42 * s}, ${cx + 2 * s} ${cy - 48 * s} ` +
    `C ${cx + 8 * s} ${cy - 52 * s}, ${cx + 12 * s} ${cy - 45 * s}, ${cx + 15 * s} ${cy - 38 * s} ` +
    `C ${cx + 18 * s} ${cy - 30 * s}, ${cx + 22 * s} ${cy - 35 * s}, ${cx + 25 * s} ${cy - 28 * s} ` +
    `C ${cx + 28 * s} ${cy - 18 * s}, ${cx + 24 * s} ${cy - 8 * s}, ${cx + 18 * s} ${cy + 8 * s} ` +
    `C ${cx + 15 * s} ${cy + 20 * s}, ${cx + 8 * s} ${cy + 35 * s}, ${cx} ${cy + 35 * s} Z`;

  // Inner flame - smaller, brighter flame
  const innerFlameD =
    `M ${cx - 1 * s} ${cy + 25 * s} ` +
    `C ${cx - 12 * s} ${cy + 22 * s}, ${cx - 15 * s} ${cy + 8 * s}, ${cx - 12 * s} ${cy - 8 * s} ` +
    `C ${cx - 8 * s} ${cy - 22 * s}, ${cx + 2 * s} ${cy - 32 * s}, ${cx + 8 * s} ${cy - 35 * s} ` +
    `C ${cx + 12 * s} ${cy - 28 * s}, ${cx + 14 * s} ${cy - 18 * s}, ${cx + 11 * s} ${cy - 5 * s} ` +
    `C ${cx + 8 * s} ${cy + 8 * s}, ${cx + 3 * s} ${cy + 25 * s}, ${cx - 1 * s} ${cy + 25 * s} Z`;

  // Hot core - tiny bright center
  const coreD =
    `M ${cx - 2 * s} ${cy + 15 * s} ` +
    `C ${cx - 6 * s} ${cy + 12 * s}, ${cx - 7 * s} ${cy + 3 * s}, ${cx - 4 * s} ${cy - 8 * s} ` +
    `C ${cx - 1 * s} ${cy - 15 * s}, ${cx + 4 * s} ${cy - 18 * s}, ${cx + 6 * s} ${cy - 12 * s} ` +
    `C ${cx + 7 * s} ${cy - 5 * s}, ${cx + 4 * s} ${cy + 5 * s}, ${cx + 1 * s} ${cy + 15 * s} ` +
    `C ${cx - 1 * s} ${cy + 15 * s}, ${cx - 2 * s} ${cy + 15 * s}, ${cx - 2 * s} ${cy + 15 * s} Z`;

  return (
    <g>
      <AnimatedPath 
        d={mainFlameD} 
        startFrame={startFrame} 
        drawDuration={dur3} 
        stroke={COLORS.red} 
        strokeWidth={2.5} 
        fill={color} 
        fillOpacity={0.7} 
      />
      <AnimatedPath 
        d={innerFlameD} 
        startFrame={startFrame + dur3} 
        drawDuration={dur3} 
        stroke={COLORS.yellow} 
        strokeWidth={2} 
        fill={COLORS.yellow} 
        fillOpacity={0.6} 
      />
      <AnimatedPath 
        d={coreD} 
        startFrame={startFrame + dur3 * 2} 
        drawDuration={dur3} 
        stroke={COLORS.white} 
        strokeWidth={1.5} 
        fill={COLORS.white} 
        fillOpacity={0.9} 
      />
    </g>
  );
};

// ─── SunIcon ──────────────────────────────────────────────────────────────────
interface SunIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const SunIcon: React.FC<SunIconProps> = ({ 
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow 
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Main sun circle
  const sunR = 22 * s;
  const k = sunR * 0.56;
  const sunD =
    `M ${cx} ${cy - sunR} ` +
    `C ${cx + k} ${cy - sunR}, ${cx + sunR} ${cy - k}, ${cx + sunR} ${cy} ` +
    `C ${cx + sunR} ${cy + k}, ${cx + k} ${cy + sunR}, ${cx} ${cy + sunR} ` +
    `C ${cx - k} ${cy + sunR}, ${cx - sunR} ${cy + k}, ${cx - sunR} ${cy} ` +
    `C ${cx - sunR} ${cy - k}, ${cx - k} ${cy - sunR}, ${cx} ${cy - sunR} Z`;

  // Long rays (cardinal directions)
  const longRayLen = 18 * s;
  const longRaysD =
    `M ${cx} ${cy - sunR - longRayLen} L ${cx + 1} ${cy - sunR - 3 * s} ` + // top
    `M ${cx + sunR + longRayLen} ${cy - 1} L ${cx + sunR + 3 * s} ${cy + 1} ` + // right
    `M ${cx - 1} ${cy + sunR + longRayLen} L ${cx + 1} ${cy + sunR + 3 * s} ` + // bottom
    `M ${cx - sunR - longRayLen} ${cy + 1} L ${cx - sunR - 3 * s} ${cy - 1}`; // left

  // Short rays (diagonal directions)
  const shortRayLen = 12 * s;
  const diagonalOffset = (sunR + 2 * s) * 0.707; // 45 degree offset
  const shortRaysD =
    `M ${cx + diagonalOffset + shortRayLen * 0.707} ${cy - diagonalOffset - shortRayLen * 0.707} ` +
    `L ${cx + diagonalOffset + 2 * s} ${cy - diagonalOffset - 2 * s} ` + // top-right
    `M ${cx + diagonalOffset + shortRayLen * 0.707} ${cy + diagonalOffset + shortRayLen * 0.707} ` +
    `L ${cx + diagonalOffset + 2 * s} ${cy + diagonalOffset + 2 * s} ` + // bottom-right
    `M ${cx - diagonalOffset - shortRayLen * 0.707} ${cy + diagonalOffset + shortRayLen * 0.707} ` +
    `L ${cx - diagonalOffset - 2 * s} ${cy + diagonalOffset + 2 * s} ` + // bottom-left
    `M ${cx - diagonalOffset - shortRayLen * 0.707} ${cy - diagonalOffset - shortRayLen * 0.707} ` +
    `L ${cx - diagonalOffset - 2 * s} ${cy - diagonalOffset - 2 * s}`; // top-left

  return (
    <g>
      <AnimatedPath 
        d={longRaysD} 
        startFrame={startFrame} 
        drawDuration={dur3} 
        stroke={color} 
        strokeWidth={3} 
        strokeLinecap="round" 
      />
      <AnimatedPath 
        d={shortRaysD} 
        startFrame={startFrame + dur3} 
        drawDuration={dur3} 
        stroke={color} 
        strokeWidth={2.5} 
        strokeLinecap="round" 
      />
      <AnimatedPath 
        d={sunD} 
        startFrame={startFrame + dur3 * 2} 
        drawDuration={dur3} 
        stroke={COLORS.orange} 
        strokeWidth={2.5} 
        fill={color} 
        fillOpacity={0.7} 
      />
    </g>
  );
};

// ─── MoonIcon ─────────────────────────────────────────────────────────────────
interface MoonIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MoonIcon: React.FC<MoonIconProps> = ({ 
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow 
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Main crescent moon shape
  const moonD =
    `M ${cx + 8 * s} ${cy - 35 * s} ` +
    `C ${cx + 25 * s} ${cy - 22 * s}, ${cx + 32 * s} ${cy + 2 * s}, ${cx + 25 * s} ${cy + 25 * s} ` +
    `C ${cx + 18 * s} ${cy + 38 * s}, ${cx + 5 * s} ${cy + 42 * s}, ${cx - 12 * s} ${cy + 35 * s} ` +
    `C ${cx - 35 * s} ${cy + 25 * s}, ${cx - 42 * s} ${cy - 2 * s}, ${cx - 35 * s} ${cy - 25 * s} ` +
    `C ${cx - 28 * s} ${cy - 38 * s}, ${cx - 15 * s} ${cy - 42 * s}, ${cx + 8 * s} ${cy - 35 * s} ` +
    `C ${cx + 2 * s} ${cy - 28 * s}, ${cx - 5 * s} ${cy - 15 * s}, ${cx - 8 * s} ${cy + 2 * s} ` +
    `C ${cx - 5 * s} ${cy + 18 * s}, ${cx + 2 * s} ${cy + 28 * s}, ${cx + 8 * s} ${cy + 25 * s}`;

  // Small star 1
  const star1D =
    `M ${cx + 35 * s} ${cy - 45 * s} ` +
    `L ${cx + 37 * s} ${cy - 42 * s} L ${cx + 40 * s} ${cy - 44 * s} ` +
    `L ${cx + 37 * s} ${cy - 46 * s} Z ` +
    `M ${cx + 32 * s} ${cy - 43 * s} L ${cx + 42 * s} ${cy - 43 * s} ` +
    `M ${cx + 37 * s} ${cy - 48 * s} L ${cx + 37 * s} ${cy - 38 * s}`;

  // Small star 2
  const star2D =
    `M ${cx - 28 * s} ${cy - 52 * s} ` +
    `L ${cx - 27 * s} ${cy - 50 * s} L ${cx - 25 * s} ${cy - 51 * s} ` +
    `L ${cx - 27 * s} ${cy - 53 * s} Z ` +
    `M ${cx - 30 * s} ${cy - 51 * s} L ${cx - 24 * s} ${cy - 51 * s} ` +
    `M ${cx - 27 * s} ${cy - 55 * s} L ${cx - 27 * s} ${cy - 47 * s}`;

  // Large star
  const star3D =
    `M ${cx + 45 * s} ${cy + 15 * s} ` +
    `L ${cx + 48 * s} ${cy + 20 * s} L ${cx + 53 * s} ${cy + 18 * s} ` +
    `L ${cx + 49 * s} ${cy + 22 * s} L ${cx + 51 * s} ${cy + 27 * s} ` +
    `L ${cx + 45 * s} ${cy + 24 * s} L ${cx + 39 * s} ${cy + 27 * s} ` +
    `L ${cx + 41 * s} ${cy + 22 * s} L ${cx + 37 * s} ${cy + 18 * s} ` +
    `L ${cx + 42 * s} ${cy + 20 * s} Z`;

  return (
    <g>
      <AnimatedPath 
        d={moonD} 
        startFrame={startFrame} 
        drawDuration={dur4 * 2} 
        stroke={COLORS.outline} 
        strokeWidth={2.5} 
        fill={color} 
        fillOpacity={0.7} 
      />
      <AnimatedPath 
        d={star1D} 
        startFrame={startFrame + dur4 * 2} 
        drawDuration={dur4} 
        stroke={COLORS.yellow} 
        strokeWidth={2} 
        strokeLinecap="round" 
      />
      <AnimatedPath 
        d={star2D} 
        startFrame={startFrame + dur4 * 2 + dur4 / 2} 
        drawDuration={dur4} 
        stroke={COLORS.yellow} 
        strokeWidth={1.5} 
        strokeLinecap="round" 
      />
      <AnimatedPath 
        d={star3D} 
        startFrame={startFrame + dur4 * 3} 
        drawDuration={dur4} 
        stroke={COLORS.yellow} 
        strokeWidth={2} 
        fill={COLORS.yellow} 
        fillOpacity={0.6} 
      />
    </g>
  );
};
