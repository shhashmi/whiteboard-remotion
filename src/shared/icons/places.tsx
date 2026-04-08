import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── FactoryIcon ─────────────────────────────────────────────────────────────
interface FactoryIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const FactoryIcon: React.FC<FactoryIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray1,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Main building
  const buildingD =
    `M ${cx - 35 * s} ${cy + 30 * s} ` +
    `L ${cx - 35 * s} ${cy - 5 * s} ` +
    `L ${cx - 15 * s} ${cy + 10 * s} ` +
    `L ${cx - 15 * s} ${cy - 5 * s} ` +
    `L ${cx + 5 * s} ${cy + 10 * s} ` +
    `L ${cx + 5 * s} ${cy - 5 * s} ` +
    `L ${cx + 35 * s} ${cy - 5 * s} ` +
    `L ${cx + 35 * s} ${cy + 30 * s} Z`;

  // Smokestacks
  const stacksD =
    `M ${cx + 10 * s} ${cy - 5 * s} L ${cx + 10 * s} ${cy - 25 * s} L ${cx + 16 * s} ${cy - 25 * s} L ${cx + 16 * s} ${cy - 5 * s} ` +
    `M ${cx + 22 * s} ${cy - 5 * s} L ${cx + 22 * s} ${cy - 30 * s} L ${cx + 28 * s} ${cy - 30 * s} L ${cx + 28 * s} ${cy - 5 * s}`;

  // Smoke puffs
  const smokeD =
    `M ${cx + 13 * s} ${cy - 25 * s} C ${cx + 10 * s} ${cy - 32 * s}, ${cx + 16 * s} ${cy - 38 * s}, ${cx + 12 * s} ${cy - 42 * s} ` +
    `M ${cx + 25 * s} ${cy - 30 * s} C ${cx + 22 * s} ${cy - 37 * s}, ${cx + 28 * s} ${cy - 43 * s}, ${cx + 24 * s} ${cy - 48 * s}`;

  // Windows
  const windowsD =
    `M ${cx + 12 * s} ${cy + 10 * s} L ${cx + 18 * s} ${cy + 10 * s} L ${cx + 18 * s} ${cy + 20 * s} L ${cx + 12 * s} ${cy + 20 * s} Z ` +
    `M ${cx + 24 * s} ${cy + 10 * s} L ${cx + 30 * s} ${cy + 10 * s} L ${cx + 30 * s} ${cy + 20 * s} L ${cx + 24 * s} ${cy + 20 * s} Z`;

  return (
    <g>
      <AnimatedPath d={buildingD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={stacksD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray2} fillOpacity={0.4} />
      <AnimatedPath d={smokeD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.gray2} strokeWidth={2} strokeLinecap="round" />
      <AnimatedPath d={windowsD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.yellow} fillOpacity={0.5} />
    </g>
  );
};

// ─── ShoppingCartIcon ────────────────────────────────────────────────────────
interface ShoppingCartIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ShoppingCartIcon: React.FC<ShoppingCartIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Cart body
  const cartD =
    `M ${cx - 35 * s} ${cy - 25 * s} ` +
    `L ${cx - 22 * s} ${cy - 25 * s} ` +
    `L ${cx - 12 * s} ${cy + 12 * s} ` +
    `L ${cx + 28 * s} ${cy + 12 * s} ` +
    `L ${cx + 35 * s} ${cy - 18 * s} ` +
    `L ${cx - 18 * s} ${cy - 18 * s}`;

  // Wheels
  const wR = 6 * s;
  const wK = wR * 0.56;
  const makeWheel = (wx: number, wy: number) =>
    `M ${wx} ${wy - wR} ` +
    `C ${wx + wK} ${wy - wR}, ${wx + wR} ${wy - wK}, ${wx + wR} ${wy} ` +
    `C ${wx + wR} ${wy + wK}, ${wx + wK} ${wy + wR}, ${wx} ${wy + wR} ` +
    `C ${wx - wK} ${wy + wR}, ${wx - wR} ${wy + wK}, ${wx - wR} ${wy} ` +
    `C ${wx - wR} ${wy - wK}, ${wx - wK} ${wy - wR}, ${wx} ${wy - wR} Z`;
  const wheelsD = makeWheel(cx - 8 * s, cy + 24 * s) + ' ' + makeWheel(cx + 22 * s, cy + 24 * s);

  // Items in cart (small boxes)
  const itemsD =
    `M ${cx - 8 * s} ${cy - 8 * s} L ${cx + 4 * s} ${cy - 8 * s} L ${cx + 4 * s} ${cy + 2 * s} L ${cx - 8 * s} ${cy + 2 * s} Z ` +
    `M ${cx + 8 * s} ${cy - 12 * s} L ${cx + 20 * s} ${cy - 12 * s} L ${cx + 20 * s} ${cy + 2 * s} L ${cx + 8 * s} ${cy + 2 * s} Z`;

  return (
    <g>
      <AnimatedPath d={cartD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.15} />
      <AnimatedPath d={wheelsD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.outline} fillOpacity={0.8} />
      <AnimatedPath d={itemsD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.3} />
    </g>
  );
};

// ─── HandshakeIcon ───────────────────────────────────────────────────────────
interface HandshakeIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const HandshakeIcon: React.FC<HandshakeIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Left hand/arm
  const leftHandD =
    `M ${cx - 40 * s} ${cy + 10 * s} ` +
    `L ${cx - 28 * s} ${cy - 8 * s} ` +
    `L ${cx - 15 * s} ${cy - 8 * s} ` +
    `C ${cx - 10 * s} ${cy - 8 * s}, ${cx - 5 * s} ${cy - 4 * s}, ${cx} ${cy} ` +
    `L ${cx + 8 * s} ${cy - 6 * s}`;

  // Right hand/arm
  const rightHandD =
    `M ${cx + 40 * s} ${cy + 10 * s} ` +
    `L ${cx + 28 * s} ${cy - 8 * s} ` +
    `L ${cx + 15 * s} ${cy - 8 * s} ` +
    `C ${cx + 10 * s} ${cy - 8 * s}, ${cx + 5 * s} ${cy - 4 * s}, ${cx} ${cy} ` +
    `L ${cx - 8 * s} ${cy - 6 * s}`;

  // Clasp detail (fingers interlocking)
  const claspD =
    `M ${cx - 6 * s} ${cy - 2 * s} L ${cx + 6 * s} ${cy - 2 * s} ` +
    `M ${cx - 4 * s} ${cy + 3 * s} L ${cx + 4 * s} ${cy + 3 * s} ` +
    `M ${cx - 3 * s} ${cy + 8 * s} L ${cx + 3 * s} ${cy + 8 * s}`;

  return (
    <g>
      <AnimatedPath d={leftHandD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={rightHandD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={claspD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
};

// ─── SatelliteIcon ───────────────────────────────────────────────────────────
interface SatelliteIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const SatelliteIcon: React.FC<SatelliteIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Satellite body (diamond/rectangle rotated)
  const bodyD =
    `M ${cx} ${cy - 12 * s} ` +
    `L ${cx + 12 * s} ${cy} ` +
    `L ${cx} ${cy + 12 * s} ` +
    `L ${cx - 12 * s} ${cy} Z`;

  // Left solar panel
  const leftPanelD =
    `M ${cx - 12 * s} ${cy} ` +
    `L ${cx - 18 * s} ${cy - 6 * s} ` +
    `L ${cx - 40 * s} ${cy + 16 * s} ` +
    `L ${cx - 34 * s} ${cy + 22 * s} Z`;

  // Right solar panel
  const rightPanelD =
    `M ${cx + 12 * s} ${cy} ` +
    `L ${cx + 18 * s} ${cy + 6 * s} ` +
    `L ${cx + 40 * s} ${cy - 16 * s} ` +
    `L ${cx + 34 * s} ${cy - 22 * s} Z`;

  // Signal waves
  const signalD =
    `M ${cx - 8 * s} ${cy - 18 * s} C ${cx - 18 * s} ${cy - 28 * s}, ${cx - 28 * s} ${cy - 18 * s}, ${cx - 18 * s} ${cy - 8 * s} ` +
    `M ${cx - 12 * s} ${cy - 26 * s} C ${cx - 26 * s} ${cy - 40 * s}, ${cx - 40 * s} ${cy - 26 * s}, ${cx - 26 * s} ${cy - 12 * s}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={leftPanelD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.purple} fillOpacity={0.3} />
      <AnimatedPath d={rightPanelD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.purple} fillOpacity={0.3} />
      <AnimatedPath d={signalD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.green} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
};

// ─── WindmillIcon ────────────────────────────────────────────────────────────
interface WindmillIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const WindmillIcon: React.FC<WindmillIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray2,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Tower (tapered)
  const towerD =
    `M ${cx - 8 * s} ${cy + 35 * s} ` +
    `L ${cx - 4 * s} ${cy - 10 * s} ` +
    `L ${cx + 4 * s} ${cy - 10 * s} ` +
    `L ${cx + 8 * s} ${cy + 35 * s} Z`;

  // Hub circle
  const hubR = 5 * s;
  const hubK = hubR * 0.56;
  const hubD =
    `M ${cx} ${cy - 15 * s - hubR} ` +
    `C ${cx + hubK} ${cy - 15 * s - hubR}, ${cx + hubR} ${cy - 15 * s - hubK}, ${cx + hubR} ${cy - 15 * s} ` +
    `C ${cx + hubR} ${cy - 15 * s + hubK}, ${cx + hubK} ${cy - 15 * s + hubR}, ${cx} ${cy - 15 * s + hubR} ` +
    `C ${cx - hubK} ${cy - 15 * s + hubR}, ${cx - hubR} ${cy - 15 * s + hubK}, ${cx - hubR} ${cy - 15 * s} ` +
    `C ${cx - hubR} ${cy - 15 * s - hubK}, ${cx - hubK} ${cy - 15 * s - hubR}, ${cx} ${cy - 15 * s - hubR} Z`;

  // Blades (3 blades, elongated triangles)
  const blade1D =
    `M ${cx} ${cy - 15 * s} L ${cx - 5 * s} ${cy - 50 * s} L ${cx + 2 * s} ${cy - 48 * s} Z`;
  const blade2D =
    `M ${cx} ${cy - 15 * s} L ${cx + 30 * s} ${cy + 2 * s} L ${cx + 28 * s} ${cy + 8 * s} Z`;
  const blade3D =
    `M ${cx} ${cy - 15 * s} L ${cx - 28 * s} ${cy + 5 * s} L ${cx - 25 * s} ${cy + 10 * s} Z`;
  const bladesD = blade1D + ' ' + blade2D + ' ' + blade3D;

  // Ground line
  const groundD = `M ${cx - 25 * s} ${cy + 35 * s} L ${cx + 25 * s} ${cy + 35 * s}`;

  return (
    <g>
      <AnimatedPath d={towerD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={bladesD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.white} fillOpacity={0.7} />
      <AnimatedPath d={hubD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.outline} fillOpacity={0.8} />
      <AnimatedPath d={groundD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.green} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
};

// ─── RecycleIcon ─────────────────────────────────────────────────────────────
interface RecycleIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const RecycleIcon: React.FC<RecycleIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Three chasing arrows forming a triangle
  // Top arrow (going right)
  const arrow1D =
    `M ${cx - 8 * s} ${cy - 28 * s} ` +
    `L ${cx + 18 * s} ${cy - 28 * s} ` +
    `L ${cx + 14 * s} ${cy - 35 * s} ` +
    `M ${cx + 18 * s} ${cy - 28 * s} ` +
    `L ${cx + 14 * s} ${cy - 22 * s}`;

  // Bottom-right arrow (going down-left)
  const arrow2D =
    `M ${cx + 22 * s} ${cy - 18 * s} ` +
    `L ${cx + 8 * s} ${cy + 18 * s} ` +
    `L ${cx + 16 * s} ${cy + 18 * s} ` +
    `M ${cx + 8 * s} ${cy + 18 * s} ` +
    `L ${cx + 6 * s} ${cy + 10 * s}`;

  // Bottom-left arrow (going up-left)
  const arrow3D =
    `M ${cx - 2 * s} ${cy + 22 * s} ` +
    `L ${cx - 26 * s} ${cy - 8 * s} ` +
    `L ${cx - 26 * s} ${cy - 1 * s} ` +
    `M ${cx - 26 * s} ${cy - 8 * s} ` +
    `L ${cx - 18 * s} ${cy - 8 * s}`;

  return (
    <g>
      <AnimatedPath d={arrow1D} startFrame={startFrame} drawDuration={dur3} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <AnimatedPath d={arrow2D} startFrame={startFrame + dur3} drawDuration={dur3} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <AnimatedPath d={arrow3D} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ─── BridgeIcon ──────────────────────────────────────────────────────────────
interface BridgeIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const BridgeIcon: React.FC<BridgeIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray1,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Road deck
  const deckD =
    `M ${cx - 40 * s} ${cy + 5 * s} L ${cx + 40 * s} ${cy + 5 * s} ` +
    `M ${cx - 40 * s} ${cy + 10 * s} L ${cx + 40 * s} ${cy + 10 * s}`;

  // Left tower
  const leftTowerD =
    `M ${cx - 28 * s} ${cy + 10 * s} L ${cx - 28 * s} ${cy - 30 * s} ` +
    `M ${cx - 24 * s} ${cy + 10 * s} L ${cx - 24 * s} ${cy - 30 * s} ` +
    `M ${cx - 30 * s} ${cy - 30 * s} L ${cx - 22 * s} ${cy - 30 * s}`;

  // Right tower
  const rightTowerD =
    `M ${cx + 24 * s} ${cy + 10 * s} L ${cx + 24 * s} ${cy - 30 * s} ` +
    `M ${cx + 28 * s} ${cy + 10 * s} L ${cx + 28 * s} ${cy - 30 * s} ` +
    `M ${cx + 22 * s} ${cy - 30 * s} L ${cx + 30 * s} ${cy - 30 * s}`;

  // Suspension cables
  const cablesD =
    `M ${cx - 26 * s} ${cy - 30 * s} C ${cx - 20 * s} ${cy - 10 * s}, ${cx - 10 * s} ${cy}, ${cx} ${cy + 5 * s} ` +
    `M ${cx + 26 * s} ${cy - 30 * s} C ${cx + 20 * s} ${cy - 10 * s}, ${cx + 10 * s} ${cy}, ${cx} ${cy + 5 * s} ` +
    `M ${cx - 40 * s} ${cy + 5 * s} C ${cx - 38 * s} ${cy - 5 * s}, ${cx - 32 * s} ${cy - 20 * s}, ${cx - 26 * s} ${cy - 30 * s} ` +
    `M ${cx + 40 * s} ${cy + 5 * s} C ${cx + 38 * s} ${cy - 5 * s}, ${cx + 32 * s} ${cy - 20 * s}, ${cx + 26 * s} ${cy - 30 * s}`;

  return (
    <g>
      <AnimatedPath d={deckD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={leftTowerD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={rightTowerD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={cablesD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.blue} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
};

// ─── CircuitBoardIcon ────────────────────────────────────────────────────────
interface CircuitBoardIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CircuitBoardIcon: React.FC<CircuitBoardIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Board outline (rectangle)
  const boardD =
    `M ${cx - 32 * s} ${cy - 28 * s} ` +
    `L ${cx + 32 * s} ${cy - 28 * s} ` +
    `L ${cx + 32 * s} ${cy + 28 * s} ` +
    `L ${cx - 32 * s} ${cy + 28 * s} Z`;

  // Central chip (rectangle)
  const chipD =
    `M ${cx - 10 * s} ${cy - 10 * s} ` +
    `L ${cx + 10 * s} ${cy - 10 * s} ` +
    `L ${cx + 10 * s} ${cy + 10 * s} ` +
    `L ${cx - 10 * s} ${cy + 10 * s} Z`;

  // Traces from chip outward
  const tracesD =
    `M ${cx} ${cy - 10 * s} L ${cx} ${cy - 22 * s} ` +
    `M ${cx} ${cy + 10 * s} L ${cx} ${cy + 22 * s} ` +
    `M ${cx - 10 * s} ${cy} L ${cx - 26 * s} ${cy} ` +
    `M ${cx + 10 * s} ${cy} L ${cx + 26 * s} ${cy} ` +
    `M ${cx + 10 * s} ${cy - 6 * s} L ${cx + 20 * s} ${cy - 6 * s} L ${cx + 20 * s} ${cy - 20 * s} ` +
    `M ${cx - 10 * s} ${cy + 6 * s} L ${cx - 20 * s} ${cy + 6 * s} L ${cx - 20 * s} ${cy + 20 * s}`;

  // Connection dots at trace endpoints
  const dotR = 3 * s;
  const dotK = dotR * 0.56;
  const makeDot = (dx: number, dy: number) =>
    `M ${cx + dx * s} ${cy + dy * s - dotR} ` +
    `C ${cx + dx * s + dotK} ${cy + dy * s - dotR}, ${cx + dx * s + dotR} ${cy + dy * s - dotK}, ${cx + dx * s + dotR} ${cy + dy * s} ` +
    `C ${cx + dx * s + dotR} ${cy + dy * s + dotK}, ${cx + dx * s + dotK} ${cy + dy * s + dotR}, ${cx + dx * s} ${cy + dy * s + dotR} ` +
    `C ${cx + dx * s - dotK} ${cy + dy * s + dotR}, ${cx + dx * s - dotR} ${cy + dy * s + dotK}, ${cx + dx * s - dotR} ${cy + dy * s} ` +
    `C ${cx + dx * s - dotR} ${cy + dy * s - dotK}, ${cx + dx * s - dotK} ${cy + dy * s - dotR}, ${cx + dx * s} ${cy + dy * s - dotR} Z`;
  const dotsD =
    makeDot(0, -22) + ' ' + makeDot(0, 22) + ' ' +
    makeDot(-26, 0) + ' ' + makeDot(26, 0) + ' ' +
    makeDot(20, -20) + ' ' + makeDot(-20, 20);

  return (
    <g>
      <AnimatedPath d={boardD} startFrame={startFrame} drawDuration={dur4} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.1} />
      <AnimatedPath d={chipD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray1} fillOpacity={0.5} />
      <AnimatedPath d={tracesD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <AnimatedPath d={dotsD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.8} />
    </g>
  );
};
