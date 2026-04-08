import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── CarIcon ──────────────────────────────────────────────────────────────────
interface CarIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CarIcon: React.FC<CarIconProps> = ({ 
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue 
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Main car body with slight hand-drawn wobble
  const bodyD =
    `M ${cx - 45 * s} ${cy + 8 * s} ` +
    `L ${cx - 42 * s} ${cy - 12 * s} ` +
    `Q ${cx - 40 * s} ${cy - 15 * s}, ${cx - 35 * s} ${cy - 15 * s} ` +
    `L ${cx - 15 * s} ${cy - 15 * s} ` +
    `Q ${cx - 12 * s} ${cy - 28 * s}, ${cx + 2 * s} ${cy - 28 * s} ` +
    `L ${cx + 18 * s} ${cy - 28 * s} ` +
    `Q ${cx + 22 * s} ${cy - 15 * s}, ${cx + 25 * s} ${cy - 15 * s} ` +
    `L ${cx + 38 * s} ${cy - 15 * s} ` +
    `Q ${cx + 42 * s} ${cy - 12 * s}, ${cx + 44 * s} ${cy + 8 * s} ` +
    `L ${cx + 35 * s} ${cy + 8 * s} ` +
    `Q ${cx + 33 * s} ${cy + 18 * s}, ${cx + 25 * s} ${cy + 18 * s} ` +
    `L ${cx - 25 * s} ${cy + 18 * s} ` +
    `Q ${cx - 33 * s} ${cy + 18 * s}, ${cx - 35 * s} ${cy + 8 * s} Z`;

  // Front windshield
  const windshieldD =
    `M ${cx - 12 * s} ${cy - 14 * s} ` +
    `L ${cx - 8 * s} ${cy - 26 * s} ` +
    `L ${cx + 15 * s} ${cy - 26 * s} ` +
    `L ${cx + 18 * s} ${cy - 14 * s}`;

  // Left wheel (circle using bezier curves)
  const leftWheelR = 8 * s;
  const leftWheelK = leftWheelR * 0.56;
  const leftWheelD =
    `M ${cx - 25 * s} ${cy + 18 * s - leftWheelR} ` +
    `C ${cx - 25 * s + leftWheelK} ${cy + 18 * s - leftWheelR}, ${cx - 25 * s + leftWheelR} ${cy + 18 * s - leftWheelK}, ${cx - 25 * s + leftWheelR} ${cy + 18 * s} ` +
    `C ${cx - 25 * s + leftWheelR} ${cy + 18 * s + leftWheelK}, ${cx - 25 * s + leftWheelK} ${cy + 18 * s + leftWheelR}, ${cx - 25 * s} ${cy + 18 * s + leftWheelR} ` +
    `C ${cx - 25 * s - leftWheelK} ${cy + 18 * s + leftWheelR}, ${cx - 25 * s - leftWheelR} ${cy + 18 * s + leftWheelK}, ${cx - 25 * s - leftWheelR} ${cy + 18 * s} ` +
    `C ${cx - 25 * s - leftWheelR} ${cy + 18 * s - leftWheelK}, ${cx - 25 * s - leftWheelK} ${cy + 18 * s - leftWheelR}, ${cx - 25 * s} ${cy + 18 * s - leftWheelR} Z`;

  // Right wheel
  const rightWheelR = 8 * s;
  const rightWheelK = rightWheelR * 0.56;
  const rightWheelD =
    `M ${cx + 25 * s} ${cy + 18 * s - rightWheelR} ` +
    `C ${cx + 25 * s + rightWheelK} ${cy + 18 * s - rightWheelR}, ${cx + 25 * s + rightWheelR} ${cy + 18 * s - rightWheelK}, ${cx + 25 * s + rightWheelR} ${cy + 18 * s} ` +
    `C ${cx + 25 * s + rightWheelR} ${cy + 18 * s + rightWheelK}, ${cx + 25 * s + rightWheelK} ${cy + 18 * s + rightWheelR}, ${cx + 25 * s} ${cy + 18 * s + rightWheelR} ` +
    `C ${cx + 25 * s - rightWheelK} ${cy + 18 * s + rightWheelR}, ${cx + 25 * s - rightWheelR} ${cy + 18 * s + rightWheelK}, ${cx + 25 * s - rightWheelR} ${cy + 18 * s} ` +
    `C ${cx + 25 * s - rightWheelR} ${cy + 18 * s - rightWheelK}, ${cx + 25 * s - rightWheelK} ${cy + 18 * s - rightWheelR}, ${cx + 25 * s} ${cy + 18 * s - rightWheelR} Z`;

  return (
    <g>
      <AnimatedPath 
        d={bodyD} 
        startFrame={startFrame} 
        drawDuration={dur4 * 2} 
        stroke={COLORS.outline} 
        strokeWidth={2.5} 
        fill={color} 
        fillOpacity={0.6} 
      />
      <AnimatedPath 
        d={windshieldD} 
        startFrame={startFrame + dur4} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2} 
        fill={COLORS.gray3} 
        fillOpacity={0.4} 
      />
      <AnimatedPath 
        d={leftWheelD} 
        startFrame={startFrame + dur4 * 2} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2} 
        fill={COLORS.outline} 
        fillOpacity={0.8} 
      />
      <AnimatedPath 
        d={rightWheelD} 
        startFrame={startFrame + dur4 * 3} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2} 
        fill={COLORS.outline} 
        fillOpacity={0.8} 
      />
    </g>
  );
};

// ─── AutonomousCarIcon ────────────────────────────────────────────────────────
interface AutonomousCarIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const AutonomousCarIcon: React.FC<AutonomousCarIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Car body - main shape
  const carBodyD = 
    `M ${cx - 35 * s} ${cy + 8 * s} ` +
    `L ${cx - 30 * s} ${cy - 12 * s} ` +
    `L ${cx - 15 * s} ${cy - 18 * s} ` +
    `L ${cx + 15 * s} ${cy - 18 * s} ` +
    `L ${cx + 30 * s} ${cy - 12 * s} ` +
    `L ${cx + 35 * s} ${cy + 8 * s} ` +
    `L ${cx + 28 * s} ${cy + 12 * s} ` +
    `L ${cx - 28 * s} ${cy + 12 * s} Z`;

  // Windshield and windows
  const windowsD = 
    `M ${cx - 22 * s} ${cy - 12 * s} ` +
    `L ${cx - 10 * s} ${cy - 16 * s} ` +
    `L ${cx + 10 * s} ${cy - 16 * s} ` +
    `L ${cx + 22 * s} ${cy - 12 * s} ` +
    `L ${cx + 18 * s} ${cy - 2 * s} ` +
    `L ${cx - 18 * s} ${cy - 2 * s} Z`;

  // Wheels - simple circles
  const leftWheelR = 6 * s;
  const rightWheelR = 6 * s;
  const wK = leftWheelR * 0.55;
  
  const leftWheelD = 
    `M ${cx - 20 * s} ${cy + 12 * s - leftWheelR} ` +
    `C ${cx - 20 * s + wK} ${cy + 12 * s - leftWheelR}, ${cx - 20 * s + leftWheelR} ${cy + 12 * s - wK}, ${cx - 20 * s + leftWheelR} ${cy + 12 * s} ` +
    `C ${cx - 20 * s + leftWheelR} ${cy + 12 * s + wK}, ${cx - 20 * s + wK} ${cy + 12 * s + leftWheelR}, ${cx - 20 * s} ${cy + 12 * s + leftWheelR} ` +
    `C ${cx - 20 * s - wK} ${cy + 12 * s + leftWheelR}, ${cx - 20 * s - leftWheelR} ${cy + 12 * s + wK}, ${cx - 20 * s - leftWheelR} ${cy + 12 * s} ` +
    `C ${cx - 20 * s - leftWheelR} ${cy + 12 * s - wK}, ${cx - 20 * s - wK} ${cy + 12 * s - leftWheelR}, ${cx - 20 * s} ${cy + 12 * s - leftWheelR} Z`;

  const rightWheelD = 
    `M ${cx + 20 * s} ${cy + 12 * s - rightWheelR} ` +
    `C ${cx + 20 * s + wK} ${cy + 12 * s - rightWheelR}, ${cx + 20 * s + rightWheelR} ${cy + 12 * s - wK}, ${cx + 20 * s + rightWheelR} ${cy + 12 * s} ` +
    `C ${cx + 20 * s + rightWheelR} ${cy + 12 * s + wK}, ${cx + 20 * s + wK} ${cy + 12 * s + rightWheelR}, ${cx + 20 * s} ${cy + 12 * s + rightWheelR} ` +
    `C ${cx + 20 * s - wK} ${cy + 12 * s + rightWheelR}, ${cx + 20 * s - rightWheelR} ${cy + 12 * s + wK}, ${cx + 20 * s - rightWheelR} ${cy + 12 * s} ` +
    `C ${cx + 20 * s - rightWheelR} ${cy + 12 * s - wK}, ${cx + 20 * s - wK} ${cy + 12 * s - rightWheelR}, ${cx + 20 * s} ${cy + 12 * s - rightWheelR} Z`;

  // Autonomous sensor/radar lines - radiating from top center
  const sensorLinesD = 
    `M ${cx - 1 * s} ${cy - 18 * s} L ${cx - 25 * s} ${cy - 35 * s} ` +
    `M ${cx + 1 * s} ${cy - 18 * s} L ${cx} ${cy - 40 * s} ` +
    `M ${cx + 1 * s} ${cy - 18 * s} L ${cx + 25 * s} ${cy - 35 * s}`;

  return (
    <g>
      <AnimatedPath 
        d={carBodyD} 
        startFrame={startFrame} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2.5} 
        fill={color} 
        fillOpacity={0.6} 
      />
      <AnimatedPath 
        d={windowsD} 
        startFrame={startFrame + dur4} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2} 
        fill={COLORS.gray3} 
        fillOpacity={0.8} 
      />
      <AnimatedPath 
        d={leftWheelD + ' ' + rightWheelD} 
        startFrame={startFrame + dur4 * 2} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2} 
        fill={COLORS.gray1} 
        fillOpacity={0.8} 
      />
      <AnimatedPath
        d={sensorLinesD}
        startFrame={startFrame + dur4 * 3}
        drawDuration={dur4}
        stroke={COLORS.green}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
};

// ─── AirplaneIcon ────────────────────────────────────────────────────────────
interface AirplaneIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const AirplaneIcon: React.FC<AirplaneIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Fuselage
  const fuselageD =
    `M ${cx - 40 * s} ${cy + 2 * s} ` +
    `C ${cx - 35 * s} ${cy - 4 * s}, ${cx - 20 * s} ${cy - 6 * s}, ${cx + 10 * s} ${cy - 4 * s} ` +
    `L ${cx + 38 * s} ${cy - 2 * s} ` +
    `C ${cx + 42 * s} ${cy - 1 * s}, ${cx + 42 * s} ${cy + 3 * s}, ${cx + 38 * s} ${cy + 4 * s} ` +
    `L ${cx + 10 * s} ${cy + 6 * s} ` +
    `C ${cx - 20 * s} ${cy + 8 * s}, ${cx - 35 * s} ${cy + 6 * s}, ${cx - 40 * s} ${cy + 2 * s} Z`;

  // Main wings
  const wingsD =
    `M ${cx - 5 * s} ${cy - 4 * s} ` +
    `L ${cx + 5 * s} ${cy - 30 * s} ` +
    `L ${cx + 15 * s} ${cy - 28 * s} ` +
    `L ${cx + 10 * s} ${cy - 4 * s} ` +
    `M ${cx - 5 * s} ${cy + 6 * s} ` +
    `L ${cx + 5 * s} ${cy + 32 * s} ` +
    `L ${cx + 15 * s} ${cy + 30 * s} ` +
    `L ${cx + 10 * s} ${cy + 6 * s}`;

  // Tail fin
  const tailD =
    `M ${cx - 32 * s} ${cy - 2 * s} ` +
    `L ${cx - 38 * s} ${cy - 22 * s} ` +
    `L ${cx - 28 * s} ${cy - 18 * s} ` +
    `L ${cx - 25 * s} ${cy - 2 * s}`;

  // Window dots along fuselage
  const windowsD =
    `M ${cx - 15 * s} ${cy} L ${cx - 12 * s} ${cy} ` +
    `M ${cx - 6 * s} ${cy} L ${cx - 3 * s} ${cy} ` +
    `M ${cx + 3 * s} ${cy} L ${cx + 6 * s} ${cy} ` +
    `M ${cx + 12 * s} ${cy} L ${cx + 15 * s} ${cy}`;

  return (
    <g>
      <AnimatedPath d={fuselageD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={wingsD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.4} />
      <AnimatedPath d={tailD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.red} fillOpacity={0.4} />
      <AnimatedPath d={windowsD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
};

// ─── ShipIcon ────────────────────────────────────────────────────────────────
interface ShipIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ShipIcon: React.FC<ShipIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Hull
  const hullD =
    `M ${cx - 38 * s} ${cy + 8 * s} ` +
    `L ${cx - 30 * s} ${cy + 22 * s} ` +
    `L ${cx + 30 * s} ${cy + 22 * s} ` +
    `L ${cx + 38 * s} ${cy + 8 * s} Z`;

  // Cabin structure
  const cabinD =
    `M ${cx - 18 * s} ${cy + 8 * s} ` +
    `L ${cx - 18 * s} ${cy - 8 * s} ` +
    `L ${cx + 15 * s} ${cy - 8 * s} ` +
    `L ${cx + 15 * s} ${cy + 8 * s} Z`;

  // Smokestack
  const stackD =
    `M ${cx + 4 * s} ${cy - 8 * s} ` +
    `L ${cx + 4 * s} ${cy - 25 * s} ` +
    `L ${cx + 12 * s} ${cy - 25 * s} ` +
    `L ${cx + 12 * s} ${cy - 8 * s}`;

  // Water waves
  const wavesD =
    `M ${cx - 42 * s} ${cy + 28 * s} ` +
    `C ${cx - 32 * s} ${cy + 24 * s}, ${cx - 22 * s} ${cy + 32 * s}, ${cx - 12 * s} ${cy + 28 * s} ` +
    `C ${cx - 2 * s} ${cy + 24 * s}, ${cx + 8 * s} ${cy + 32 * s}, ${cx + 18 * s} ${cy + 28 * s} ` +
    `C ${cx + 28 * s} ${cy + 24 * s}, ${cx + 38 * s} ${cy + 32 * s}, ${cx + 42 * s} ${cy + 28 * s}`;

  return (
    <g>
      <AnimatedPath d={hullD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={cabinD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.white} fillOpacity={0.6} />
      <AnimatedPath d={stackD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.red} fillOpacity={0.5} />
      <AnimatedPath d={wavesD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.blue} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
};

// ─── BicycleIcon ─────────────────────────────────────────────────────────────
interface BicycleIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const BicycleIcon: React.FC<BicycleIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Wheels
  const wR = 16 * s;
  const wK = wR * 0.56;
  const makeWheel = (wx: number, wy: number) =>
    `M ${wx} ${wy - wR} ` +
    `C ${wx + wK} ${wy - wR}, ${wx + wR} ${wy - wK}, ${wx + wR} ${wy} ` +
    `C ${wx + wR} ${wy + wK}, ${wx + wK} ${wy + wR}, ${wx} ${wy + wR} ` +
    `C ${wx - wK} ${wy + wR}, ${wx - wR} ${wy + wK}, ${wx - wR} ${wy} ` +
    `C ${wx - wR} ${wy - wK}, ${wx - wK} ${wy - wR}, ${wx} ${wy - wR} Z`;

  const leftWheelCx = cx - 22 * s;
  const rightWheelCx = cx + 22 * s;
  const wheelCy = cy + 12 * s;
  const wheelsD = makeWheel(leftWheelCx, wheelCy) + ' ' + makeWheel(rightWheelCx, wheelCy);

  // Frame - triangle shape connecting wheels
  const frameD =
    `M ${leftWheelCx} ${wheelCy} ` +
    `L ${cx} ${cy - 14 * s} ` +
    `L ${rightWheelCx} ${wheelCy} ` +
    `M ${cx} ${cy - 14 * s} ` +
    `L ${cx - 10 * s} ${cy - 6 * s} ` +
    `L ${leftWheelCx} ${wheelCy}`;

  // Handlebars and seat
  const detailsD =
    `M ${cx + 2 * s} ${cy - 20 * s} L ${cx - 4 * s} ${cy - 20 * s} ` +
    `M ${cx} ${cy - 14 * s} L ${cx} ${cy - 20 * s} ` +
    `M ${cx + 18 * s} ${cy - 8 * s} L ${cx + 26 * s} ${cy - 12 * s} ` +
    `M ${rightWheelCx} ${wheelCy} L ${cx + 22 * s} ${cy - 10 * s}`;

  // Pedal area
  const pedalD =
    `M ${cx - 10 * s} ${cy - 6 * s} L ${cx - 14 * s} ${cy + 2 * s} ` +
    `M ${cx - 10 * s} ${cy - 6 * s} L ${cx - 6 * s} ${cy - 14 * s}`;

  return (
    <g>
      <AnimatedPath d={wheelsD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill="none" />
      <AnimatedPath d={frameD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={detailsD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} strokeLinecap="round" />
      <AnimatedPath d={pedalD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
};
