import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── CoinIcon ────────────────────────────────────────────────────────────────
interface CoinIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CoinIcon: React.FC<CoinIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gold,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Outer circle
  const r = 30 * s;
  const k = r * 0.56;
  const outerD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} ` +
    `C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  // Inner circle (rim)
  const r2 = 23 * s;
  const k2 = r2 * 0.56;
  const innerD =
    `M ${cx} ${cy - r2} ` +
    `C ${cx + k2} ${cy - r2}, ${cx + r2} ${cy - k2}, ${cx + r2} ${cy} ` +
    `C ${cx + r2} ${cy + k2}, ${cx + k2} ${cy + r2}, ${cx} ${cy + r2} ` +
    `C ${cx - k2} ${cy + r2}, ${cx - r2} ${cy + k2}, ${cx - r2} ${cy} ` +
    `C ${cx - r2} ${cy - k2}, ${cx - k2} ${cy - r2}, ${cx} ${cy - r2} Z`;

  // Dollar sign in center
  const symbolD =
    `M ${cx + 6 * s} ${cy - 12 * s} ` +
    `C ${cx + 5 * s} ${cy - 15 * s}, ${cx - 6 * s} ${cy - 16 * s}, ${cx - 7 * s} ${cy - 11 * s} ` +
    `C ${cx - 8 * s} ${cy - 6 * s}, ${cx + 8 * s} ${cy - 2 * s}, ${cx + 7 * s} ${cy + 4 * s} ` +
    `C ${cx + 6 * s} ${cy + 10 * s}, ${cx - 6 * s} ${cy + 16 * s}, ${cx - 7 * s} ${cy + 12 * s} ` +
    `M ${cx} ${cy - 18 * s} L ${cx} ${cy + 18 * s}`;

  return (
    <g>
      <AnimatedPath d={outerD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={innerD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={1.5} />
      <AnimatedPath d={symbolD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
};

// ─── WalletIcon ──────────────────────────────────────────────────────────────
interface WalletIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const WalletIcon: React.FC<WalletIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.orange,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Wallet body
  const bodyD =
    `M ${cx - 32 * s} ${cy - 22 * s} ` +
    `L ${cx + 30 * s} ${cy - 22 * s} ` +
    `Q ${cx + 34 * s} ${cy - 22 * s}, ${cx + 34 * s} ${cy - 18 * s} ` +
    `L ${cx + 34 * s} ${cy + 22 * s} ` +
    `Q ${cx + 34 * s} ${cy + 26 * s}, ${cx + 30 * s} ${cy + 26 * s} ` +
    `L ${cx - 28 * s} ${cy + 26 * s} ` +
    `Q ${cx - 32 * s} ${cy + 26 * s}, ${cx - 32 * s} ${cy + 22 * s} Z`;

  // Flap top
  const flapD =
    `M ${cx - 32 * s} ${cy - 22 * s} ` +
    `L ${cx - 32 * s} ${cy - 30 * s} ` +
    `Q ${cx - 32 * s} ${cy - 34 * s}, ${cx - 28 * s} ${cy - 34 * s} ` +
    `L ${cx + 20 * s} ${cy - 34 * s} ` +
    `L ${cx + 22 * s} ${cy - 22 * s}`;

  // Card peeking out
  const cardD =
    `M ${cx - 22 * s} ${cy - 10 * s} ` +
    `L ${cx + 10 * s} ${cy - 10 * s} ` +
    `L ${cx + 10 * s} ${cy + 2 * s} ` +
    `L ${cx - 22 * s} ${cy + 2 * s} Z`;

  // Clasp circle
  const claspD =
    `M ${cx + 26 * s} ${cy + 2 * s} ` +
    `C ${cx + 30 * s} ${cy + 2 * s}, ${cx + 34 * s} ${cy + 5 * s}, ${cx + 34 * s} ${cy + 9 * s} ` +
    `C ${cx + 34 * s} ${cy + 13 * s}, ${cx + 30 * s} ${cy + 16 * s}, ${cx + 26 * s} ${cy + 16 * s} ` +
    `L ${cx + 22 * s} ${cy + 16 * s} ` +
    `L ${cx + 22 * s} ${cy + 2 * s} Z`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={flapD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={cardD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.blue} fillOpacity={0.3} />
      <AnimatedPath d={claspD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.outline} fillOpacity={0.2} />
    </g>
  );
};

// ─── BankIcon ────────────────────────────────────────────────────────────────
interface BankIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const BankIcon: React.FC<BankIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Roof / pediment triangle
  const roofD =
    `M ${cx - 38 * s} ${cy - 10 * s} ` +
    `L ${cx + 1 * s} ${cy - 38 * s} ` +
    `L ${cx + 38 * s} ${cy - 10 * s} Z`;

  // Base platform
  const baseD =
    `M ${cx - 36 * s} ${cy + 30 * s} ` +
    `L ${cx + 36 * s} ${cy + 30 * s} ` +
    `L ${cx + 36 * s} ${cy + 36 * s} ` +
    `L ${cx - 36 * s} ${cy + 36 * s} Z`;

  // Columns (left, center, right)
  const columnsD =
    `M ${cx - 24 * s} ${cy - 8 * s} L ${cx - 24 * s} ${cy + 30 * s} ` +
    `M ${cx} ${cy - 8 * s} L ${cx} ${cy + 30 * s} ` +
    `M ${cx + 24 * s} ${cy - 8 * s} L ${cx + 24 * s} ${cy + 30 * s}`;

  // Lintel (beam above columns)
  const lintelD =
    `M ${cx - 34 * s} ${cy - 8 * s} ` +
    `L ${cx + 34 * s} ${cy - 8 * s} ` +
    `L ${cx + 34 * s} ${cy - 4 * s} ` +
    `L ${cx - 34 * s} ${cy - 4 * s} Z`;

  return (
    <g>
      <AnimatedPath d={roofD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.2} />
      <AnimatedPath d={lintelD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.4} />
      <AnimatedPath d={columnsD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={3.5} strokeLinecap="round" />
      <AnimatedPath d={baseD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.4} />
    </g>
  );
};

// ─── CreditCardIcon ──────────────────────────────────────────────────────────
interface CreditCardIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CreditCardIcon: React.FC<CreditCardIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.purple,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Card body
  const cardD =
    `M ${cx - 36 * s} ${cy - 22 * s} ` +
    `L ${cx + 34 * s} ${cy - 22 * s} ` +
    `Q ${cx + 38 * s} ${cy - 22 * s}, ${cx + 38 * s} ${cy - 18 * s} ` +
    `L ${cx + 38 * s} ${cy + 22 * s} ` +
    `Q ${cx + 38 * s} ${cy + 26 * s}, ${cx + 34 * s} ${cy + 26 * s} ` +
    `L ${cx - 34 * s} ${cy + 26 * s} ` +
    `Q ${cx - 38 * s} ${cy + 26 * s}, ${cx - 38 * s} ${cy + 22 * s} ` +
    `L ${cx - 38 * s} ${cy - 18 * s} ` +
    `Q ${cx - 38 * s} ${cy - 22 * s}, ${cx - 34 * s} ${cy - 22 * s} Z`;

  // Magnetic stripe
  const stripeD =
    `M ${cx - 38 * s} ${cy - 10 * s} ` +
    `L ${cx + 38 * s} ${cy - 10 * s} ` +
    `L ${cx + 38 * s} ${cy - 2 * s} ` +
    `L ${cx - 38 * s} ${cy - 2 * s} Z`;

  // Chip rectangle
  const chipD =
    `M ${cx - 24 * s} ${cy + 6 * s} ` +
    `L ${cx - 12 * s} ${cy + 6 * s} ` +
    `L ${cx - 12 * s} ${cy + 16 * s} ` +
    `L ${cx - 24 * s} ${cy + 16 * s} Z`;

  // Number dots (suggesting card number)
  const dotsD =
    `M ${cx + 2 * s} ${cy + 11 * s} L ${cx + 8 * s} ${cy + 11 * s} ` +
    `M ${cx + 14 * s} ${cy + 11 * s} L ${cx + 20 * s} ${cy + 11 * s} ` +
    `M ${cx + 26 * s} ${cy + 11 * s} L ${cx + 32 * s} ${cy + 11 * s}`;

  return (
    <g>
      <AnimatedPath d={cardD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.2} />
      <AnimatedPath d={stripeD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.outline} fillOpacity={0.6} />
      <AnimatedPath d={chipD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.gold} fillOpacity={0.6} />
      <AnimatedPath d={dotsD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
};

// ─── DollarSignIcon ──────────────────────────────────────────────────────────
interface DollarSignIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const DollarSignIcon: React.FC<DollarSignIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Main S-curve of dollar sign
  const sCurveD =
    `M ${cx + 14 * s} ${cy - 26 * s} ` +
    `C ${cx + 12 * s} ${cy - 33 * s}, ${cx - 16 * s} ${cy - 36 * s}, ${cx - 18 * s} ${cy - 26 * s} ` +
    `C ${cx - 20 * s} ${cy - 16 * s}, ${cx + 20 * s} ${cy - 8 * s}, ${cx + 18 * s} ${cy + 4 * s} ` +
    `C ${cx + 16 * s} ${cy + 16 * s}, ${cx - 16 * s} ${cy + 22 * s}, ${cx - 18 * s} ${cy + 12 * s} ` +
    `C ${cx - 20 * s} ${cy + 6 * s}, ${cx - 12 * s} ${cy + 28 * s}, ${cx - 14 * s} ${cy + 28 * s}`;

  // Vertical line through dollar sign
  const vertD =
    `M ${cx} ${cy - 40 * s} L ${cx + 1 * s} ${cy + 38 * s}`;

  // Small decorative circle
  const r = 6 * s;
  const kk = r * 0.56;
  const dotD =
    `M ${cx - 30 * s} ${cy - 10 * s} ` +
    `C ${cx - 30 * s} ${cy - 10 * s - kk}, ${cx - 30 * s + r - kk} ${cy - 10 * s - r}, ${cx - 30 * s + r} ${cy - 10 * s - r} ` +
    `C ${cx - 30 * s + r + kk} ${cy - 10 * s - r}, ${cx - 30 * s + r * 2} ${cy - 10 * s - kk}, ${cx - 30 * s + r * 2} ${cy - 10 * s} ` +
    `C ${cx - 30 * s + r * 2} ${cy - 10 * s + kk}, ${cx - 30 * s + r + kk} ${cy - 10 * s + r}, ${cx - 30 * s + r} ${cy - 10 * s + r} ` +
    `C ${cx - 30 * s + r - kk} ${cy - 10 * s + r}, ${cx - 30 * s} ${cy - 10 * s + kk}, ${cx - 30 * s} ${cy - 10 * s} Z`;

  return (
    <g>
      <AnimatedPath d={vertD} startFrame={startFrame} drawDuration={dur3} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={sCurveD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={3} strokeLinecap="round" />
      <AnimatedPath d={dotD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.5} />
    </g>
  );
};
