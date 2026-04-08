import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── DNAEvolutionIcon ─────────────────────────────────────────────────────────
interface DNAEvolutionIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const DNAEvolutionIcon: React.FC<DNAEvolutionIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Left DNA helix (starting form)
  const leftHelixD =
    `M ${cx - 45 * s} ${cy - 35 * s} ` +
    `C ${cx - 30 * s} ${cy - 30 * s}, ${cx - 30 * s} ${cy - 15 * s}, ${cx - 45 * s} ${cy - 10 * s} ` +
    `C ${cx - 60 * s} ${cy - 5 * s}, ${cx - 60 * s} ${cy + 10 * s}, ${cx - 45 * s} ${cy + 15 * s} ` +
    `C ${cx - 30 * s} ${cy + 20 * s}, ${cx - 30 * s} ${cy + 35 * s}, ${cx - 45 * s} ${cy + 40 * s}`;

  const leftHelixBackD =
    `M ${cx - 45 * s} ${cy - 35 * s} ` +
    `C ${cx - 60 * s} ${cy - 30 * s}, ${cx - 60 * s} ${cy - 15 * s}, ${cx - 45 * s} ${cy - 10 * s} ` +
    `C ${cx - 30 * s} ${cy - 5 * s}, ${cx - 30 * s} ${cy + 10 * s}, ${cx - 45 * s} ${cy + 15 * s} ` +
    `C ${cx - 60 * s} ${cy + 20 * s}, ${cx - 60 * s} ${cy + 35 * s}, ${cx - 45 * s} ${cy + 40 * s}`;

  // Transformation arrows
  const arrowD =
    `M ${cx - 18 * s} ${cy - 8 * s} ` +
    `L ${cx - 2 * s} ${cy - 2 * s} ` +
    `L ${cx - 8 * s} ${cy + 4 * s} ` +
    `M ${cx - 2 * s} ${cy - 2 * s} ` +
    `L ${cx + 18 * s} ${cy + 8 * s} ` +
    `L ${cx + 12 * s} ${cy + 14 * s} ` +
    `M ${cx + 18 * s} ${cy + 8 * s} ` +
    `L ${cx + 12 * s} ${cy + 2 * s}`;

  // Right evolved DNA helix (more complex, transformed)
  const rightHelixD =
    `M ${cx + 35 * s} ${cy - 40 * s} ` +
    `C ${cx + 50 * s} ${cy - 35 * s}, ${cx + 55 * s} ${cy - 20 * s}, ${cx + 40 * s} ${cy - 15 * s} ` +
    `C ${cx + 25 * s} ${cy - 10 * s}, ${cx + 30 * s} ${cy + 5 * s}, ${cx + 45 * s} ${cy + 10 * s} ` +
    `C ${cx + 60 * s} ${cy + 15 * s}, ${cx + 55 * s} ${cy + 30 * s}, ${cx + 40 * s} ${cy + 35 * s} ` +
    `C ${cx + 25 * s} ${cy + 40 * s}, ${cx + 30 * s} ${cy + 45 * s}, ${cx + 45 * s} ${cy + 50 * s}`;

  const rightHelixBackD =
    `M ${cx + 35 * s} ${cy - 40 * s} ` +
    `C ${cx + 20 * s} ${cy - 35 * s}, ${cx + 15 * s} ${cy - 20 * s}, ${cx + 30 * s} ${cy - 15 * s} ` +
    `C ${cx + 45 * s} ${cy - 10 * s}, ${cx + 40 * s} ${cy + 5 * s}, ${cx + 25 * s} ${cy + 10 * s} ` +
    `C ${cx + 10 * s} ${cy + 15 * s}, ${cx + 15 * s} ${cy + 30 * s}, ${cx + 30 * s} ${cy + 35 * s} ` +
    `C ${cx + 45 * s} ${cy + 40 * s}, ${cx + 40 * s} ${cy + 45 * s}, ${cx + 25 * s} ${cy + 50 * s}`;

  return (
    <g>
      <AnimatedPath 
        d={leftHelixBackD} 
        startFrame={startFrame} 
        drawDuration={dur4} 
        stroke={COLORS.gray2} 
        strokeWidth={2} 
        strokeOpacity={0.6}
      />
      <AnimatedPath 
        d={leftHelixD} 
        startFrame={startFrame} 
        drawDuration={dur4} 
        stroke={color} 
        strokeWidth={2.5}
      />
      <AnimatedPath 
        d={arrowD} 
        startFrame={startFrame + dur4} 
        drawDuration={dur4} 
        stroke={COLORS.orange} 
        strokeWidth={2.5} 
        strokeLinecap="round"
      />
      <AnimatedPath 
        d={rightHelixBackD} 
        startFrame={startFrame + dur4 * 2} 
        drawDuration={dur4} 
        stroke={COLORS.gray2} 
        strokeWidth={2} 
        strokeOpacity={0.6}
      />
      <AnimatedPath 
        d={rightHelixD} 
        startFrame={startFrame + dur4 * 3} 
        drawDuration={dur4} 
        stroke={COLORS.green} 
        strokeWidth={2.5}
      />
    </g>
  );
};

// ─── AtomIcon ────────────────────────────────────────────────────────────────
interface AtomIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const AtomIcon: React.FC<AtomIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Nucleus (small circle)
  const rn = 6 * s;
  const kn = rn * 0.56;
  const nucleusD =
    `M ${cx} ${cy - rn} ` +
    `C ${cx + kn} ${cy - rn}, ${cx + rn} ${cy - kn}, ${cx + rn} ${cy} ` +
    `C ${cx + rn} ${cy + kn}, ${cx + kn} ${cy + rn}, ${cx} ${cy + rn} ` +
    `C ${cx - kn} ${cy + rn}, ${cx - rn} ${cy + kn}, ${cx - rn} ${cy} ` +
    `C ${cx - rn} ${cy - kn}, ${cx - kn} ${cy - rn}, ${cx} ${cy - rn} Z`;

  // Horizontal orbit (ellipse)
  const orbit1D =
    `M ${cx - 35 * s} ${cy} ` +
    `C ${cx - 35 * s} ${cy - 14 * s}, ${cx - 20 * s} ${cy - 22 * s}, ${cx} ${cy - 22 * s} ` +
    `C ${cx + 20 * s} ${cy - 22 * s}, ${cx + 35 * s} ${cy - 14 * s}, ${cx + 35 * s} ${cy} ` +
    `C ${cx + 35 * s} ${cy + 14 * s}, ${cx + 20 * s} ${cy + 22 * s}, ${cx} ${cy + 22 * s} ` +
    `C ${cx - 20 * s} ${cy + 22 * s}, ${cx - 35 * s} ${cy + 14 * s}, ${cx - 35 * s} ${cy} Z`;

  // Tilted orbit (~60 degrees)
  const orbit2D =
    `M ${cx - 11 * s} ${cy - 33 * s} ` +
    `C ${cx + 1 * s} ${cy - 39 * s}, ${cx + 22 * s} ${cy - 30 * s}, ${cx + 30 * s} ${cy - 12 * s} ` +
    `C ${cx + 38 * s} ${cy + 6 * s}, ${cx + 29 * s} ${cy + 28 * s}, ${cx + 11 * s} ${cy + 33 * s} ` +
    `C ${cx - 1 * s} ${cy + 39 * s}, ${cx - 22 * s} ${cy + 30 * s}, ${cx - 30 * s} ${cy + 12 * s} ` +
    `C ${cx - 38 * s} ${cy - 6 * s}, ${cx - 29 * s} ${cy - 28 * s}, ${cx - 11 * s} ${cy - 33 * s} Z`;

  // Tilted orbit (~-60 degrees)
  const orbit3D =
    `M ${cx + 11 * s} ${cy - 33 * s} ` +
    `C ${cx - 1 * s} ${cy - 39 * s}, ${cx - 22 * s} ${cy - 30 * s}, ${cx - 30 * s} ${cy - 12 * s} ` +
    `C ${cx - 38 * s} ${cy + 6 * s}, ${cx - 29 * s} ${cy + 28 * s}, ${cx - 11 * s} ${cy + 33 * s} ` +
    `C ${cx + 1 * s} ${cy + 39 * s}, ${cx + 22 * s} ${cy + 30 * s}, ${cx + 30 * s} ${cy + 12 * s} ` +
    `C ${cx + 38 * s} ${cy - 6 * s}, ${cx + 29 * s} ${cy - 28 * s}, ${cx + 11 * s} ${cy - 33 * s} Z`;

  return (
    <g>
      <AnimatedPath d={orbit1D} startFrame={startFrame} drawDuration={dur4} stroke={color} strokeWidth={1.5} />
      <AnimatedPath d={orbit2D} startFrame={startFrame + dur4} drawDuration={dur4} stroke={color} strokeWidth={1.5} />
      <AnimatedPath d={orbit3D} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={color} strokeWidth={1.5} />
      <AnimatedPath d={nucleusD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.red} fillOpacity={0.7} />
    </g>
  );
};

// ─── MicroscopeIcon ──────────────────────────────────────────────────────────
interface MicroscopeIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MicroscopeIcon: React.FC<MicroscopeIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray1,
}) => {
  const s = scale;
  const dur5 = Math.floor(drawDuration / 5);

  // Base
  const baseD =
    `M ${cx - 28 * s} ${cy + 35 * s} ` +
    `L ${cx + 28 * s} ${cy + 35 * s} ` +
    `L ${cx + 28 * s} ${cy + 30 * s} ` +
    `L ${cx - 28 * s} ${cy + 30 * s} Z`;

  // Arm/pillar vertical
  const pillarD =
    `M ${cx + 5 * s} ${cy + 30 * s} ` +
    `L ${cx + 5 * s} ${cy - 10 * s} ` +
    `L ${cx - 5 * s} ${cy - 10 * s} ` +
    `L ${cx - 5 * s} ${cy + 30 * s}`;

  // Eyepiece tube (angled)
  const tubeD =
    `M ${cx - 3 * s} ${cy - 10 * s} ` +
    `L ${cx - 18 * s} ${cy - 38 * s} ` +
    `L ${cx - 10 * s} ${cy - 42 * s} ` +
    `L ${cx + 5 * s} ${cy - 14 * s}`;

  // Stage/platform
  const stageD =
    `M ${cx - 20 * s} ${cy + 16 * s} ` +
    `L ${cx + 20 * s} ${cy + 16 * s} ` +
    `L ${cx + 20 * s} ${cy + 20 * s} ` +
    `L ${cx - 20 * s} ${cy + 20 * s} Z`;

  // Objective lens (small)
  const lensD =
    `M ${cx - 4 * s} ${cy + 4 * s} ` +
    `L ${cx - 6 * s} ${cy + 16 * s} ` +
    `M ${cx + 4 * s} ${cy + 4 * s} ` +
    `L ${cx + 6 * s} ${cy + 16 * s}`;

  return (
    <g>
      <AnimatedPath d={baseD} startFrame={startFrame} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={pillarD} startFrame={startFrame + dur5} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2.5} fill={COLORS.gray3} fillOpacity={0.3} />
      <AnimatedPath d={tubeD} startFrame={startFrame + dur5 * 2} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={stageD} startFrame={startFrame + dur5 * 3} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.3} />
      <AnimatedPath d={lensD} startFrame={startFrame + dur5 * 4} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
};

// ─── BeakerIcon ──────────────────────────────────────────────────────────────
interface BeakerIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const BeakerIcon: React.FC<BeakerIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Flask body (conical/erlenmeyer shape)
  const bodyD =
    `M ${cx - 10 * s} ${cy - 32 * s} ` +
    `L ${cx - 10 * s} ${cy - 8 * s} ` +
    `L ${cx - 28 * s} ${cy + 28 * s} ` +
    `Q ${cx - 30 * s} ${cy + 34 * s}, ${cx - 24 * s} ${cy + 34 * s} ` +
    `L ${cx + 24 * s} ${cy + 34 * s} ` +
    `Q ${cx + 30 * s} ${cy + 34 * s}, ${cx + 28 * s} ${cy + 28 * s} ` +
    `L ${cx + 10 * s} ${cy - 8 * s} ` +
    `L ${cx + 10 * s} ${cy - 32 * s}`;

  // Rim at top
  const rimD =
    `M ${cx - 14 * s} ${cy - 32 * s} ` +
    `L ${cx + 14 * s} ${cy - 32 * s}`;

  // Liquid level
  const liquidD =
    `M ${cx - 22 * s} ${cy + 10 * s} ` +
    `C ${cx - 14 * s} ${cy + 6 * s}, ${cx - 4 * s} ${cy + 14 * s}, ${cx + 4 * s} ${cy + 8 * s} ` +
    `C ${cx + 12 * s} ${cy + 4 * s}, ${cx + 18 * s} ${cy + 12 * s}, ${cx + 22 * s} ${cy + 10 * s} ` +
    `L ${cx + 26 * s} ${cy + 28 * s} ` +
    `Q ${cx + 28 * s} ${cy + 34 * s}, ${cx + 24 * s} ${cy + 34 * s} ` +
    `L ${cx - 24 * s} ${cy + 34 * s} ` +
    `Q ${cx - 30 * s} ${cy + 34 * s}, ${cx - 26 * s} ${cy + 28 * s} Z`;

  // Bubbles
  const bubblesD =
    `M ${cx - 6 * s} ${cy + 18 * s} ` +
    `C ${cx - 6 * s} ${cy + 16 * s}, ${cx - 2 * s} ${cy + 16 * s}, ${cx - 2 * s} ${cy + 18 * s} ` +
    `C ${cx - 2 * s} ${cy + 20 * s}, ${cx - 6 * s} ${cy + 20 * s}, ${cx - 6 * s} ${cy + 18 * s} Z ` +
    `M ${cx + 8 * s} ${cy + 22 * s} ` +
    `C ${cx + 8 * s} ${cy + 20 * s}, ${cx + 12 * s} ${cy + 20 * s}, ${cx + 12 * s} ${cy + 22 * s} ` +
    `C ${cx + 12 * s} ${cy + 24 * s}, ${cx + 8 * s} ${cy + 24 * s}, ${cx + 8 * s} ${cy + 22 * s} Z`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={rimD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={liquidD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={bubblesD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.white} strokeWidth={1.5} fill={COLORS.white} fillOpacity={0.6} />
    </g>
  );
};

// ─── MagnetIcon ──────────────────────────────────────────────────────────────
interface MagnetIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MagnetIcon: React.FC<MagnetIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.red,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Horseshoe outer arc
  const outerD =
    `M ${cx - 22 * s} ${cy + 20 * s} ` +
    `L ${cx - 22 * s} ${cy - 6 * s} ` +
    `C ${cx - 22 * s} ${cy - 28 * s}, ${cx + 22 * s} ${cy - 28 * s}, ${cx + 22 * s} ${cy - 6 * s} ` +
    `L ${cx + 22 * s} ${cy + 20 * s}`;

  // Horseshoe inner arc
  const innerD =
    `M ${cx - 10 * s} ${cy + 20 * s} ` +
    `L ${cx - 10 * s} ${cy - 4 * s} ` +
    `C ${cx - 10 * s} ${cy - 18 * s}, ${cx + 10 * s} ${cy - 18 * s}, ${cx + 10 * s} ${cy - 4 * s} ` +
    `L ${cx + 10 * s} ${cy + 20 * s}`;

  // Pole caps (left and right)
  const capsD =
    `M ${cx - 24 * s} ${cy + 14 * s} L ${cx - 8 * s} ${cy + 14 * s} ` +
    `L ${cx - 8 * s} ${cy + 22 * s} L ${cx - 24 * s} ${cy + 22 * s} Z ` +
    `M ${cx + 8 * s} ${cy + 14 * s} L ${cx + 24 * s} ${cy + 14 * s} ` +
    `L ${cx + 24 * s} ${cy + 22 * s} L ${cx + 8 * s} ${cy + 22 * s} Z`;

  // Field lines
  const fieldD =
    `M ${cx - 16 * s} ${cy + 28 * s} ` +
    `C ${cx - 16 * s} ${cy + 34 * s}, ${cx + 16 * s} ${cy + 34 * s}, ${cx + 16 * s} ${cy + 28 * s} ` +
    `M ${cx - 20 * s} ${cy + 32 * s} ` +
    `C ${cx - 20 * s} ${cy + 42 * s}, ${cx + 20 * s} ${cy + 42 * s}, ${cx + 20 * s} ${cy + 32 * s}`;

  return (
    <g>
      <AnimatedPath d={outerD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={innerD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={capsD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.6} />
      <AnimatedPath d={fieldD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.blue} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
};

// ─── GlobeIcon ───────────────────────────────────────────────────────────────
interface GlobeIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const GlobeIcon: React.FC<GlobeIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Outer circle
  const r = 32 * s;
  const k = r * 0.56;
  const circleD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} ` +
    `C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  // Vertical meridian (center ellipse)
  const meridianD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + 12 * s} ${cy - r}, ${cx + 16 * s} ${cy - k}, ${cx + 16 * s} ${cy} ` +
    `C ${cx + 16 * s} ${cy + k}, ${cx + 12 * s} ${cy + r}, ${cx} ${cy + r} ` +
    `C ${cx - 12 * s} ${cy + r}, ${cx - 16 * s} ${cy + k}, ${cx - 16 * s} ${cy} ` +
    `C ${cx - 16 * s} ${cy - k}, ${cx - 12 * s} ${cy - r}, ${cx} ${cy - r} Z`;

  // Horizontal equator
  const equatorD =
    `M ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy + 10 * s}, ${cx - k} ${cy + 14 * s}, ${cx} ${cy + 14 * s} ` +
    `C ${cx + k} ${cy + 14 * s}, ${cx + r} ${cy + 10 * s}, ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy - 10 * s}, ${cx + k} ${cy - 14 * s}, ${cx} ${cy - 14 * s} ` +
    `C ${cx - k} ${cy - 14 * s}, ${cx - r} ${cy - 10 * s}, ${cx - r} ${cy} Z`;

  // Latitude lines (top and bottom)
  const latitudesD =
    `M ${cx - 26 * s} ${cy - 16 * s} ` +
    `C ${cx - 20 * s} ${cy - 12 * s}, ${cx + 20 * s} ${cy - 12 * s}, ${cx + 26 * s} ${cy - 16 * s} ` +
    `M ${cx - 26 * s} ${cy + 16 * s} ` +
    `C ${cx - 20 * s} ${cy + 20 * s}, ${cx + 20 * s} ${cy + 20 * s}, ${cx + 26 * s} ${cy + 16 * s}`;

  return (
    <g>
      <AnimatedPath d={circleD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.15} />
      <AnimatedPath d={meridianD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} />
      <AnimatedPath d={equatorD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} />
      <AnimatedPath d={latitudesD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
};
