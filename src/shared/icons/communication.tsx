import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── ChatbotIcon ──────────────────────────────────────────────────────────────
interface ChatbotIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ChatbotIcon: React.FC<ChatbotIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Robot head (rounded rectangle)
  const headD =
    `M ${cx - 28 * s} ${cy - 35 * s} ` +
    `L ${cx + 28 * s} ${cy - 35 * s} ` +
    `Q ${cx + 32 * s} ${cy - 35 * s}, ${cx + 32 * s} ${cy - 31 * s} ` +
    `L ${cx + 32 * s} ${cy - 8 * s} ` +
    `Q ${cx + 32 * s} ${cy - 4 * s}, ${cx + 28 * s} ${cy - 4 * s} ` +
    `L ${cx - 28 * s} ${cy - 4 * s} ` +
    `Q ${cx - 32 * s} ${cy - 4 * s}, ${cx - 32 * s} ${cy - 8 * s} ` +
    `L ${cx - 32 * s} ${cy - 31 * s} ` +
    `Q ${cx - 32 * s} ${cy - 35 * s}, ${cx - 28 * s} ${cy - 35 * s} Z`;

  // Chat bubble coming from bot
  const bubbleD =
    `M ${cx + 40 * s} ${cy - 25 * s} ` +
    `L ${cx + 70 * s} ${cy - 25 * s} ` +
    `Q ${cx + 72 * s} ${cy - 25 * s}, ${cx + 72 * s} ${cy - 23 * s} ` +
    `L ${cx + 72 * s} ${cy - 12 * s} ` +
    `Q ${cx + 72 * s} ${cy - 10 * s}, ${cx + 70 * s} ${cy - 10 * s} ` +
    `L ${cx + 50 * s} ${cy - 10 * s} ` +
    `L ${cx + 45 * s} ${cy - 6 * s} ` +
    `L ${cx + 48 * s} ${cy - 10 * s} ` +
    `L ${cx + 42 * s} ${cy - 10 * s} ` +
    `Q ${cx + 40 * s} ${cy - 10 * s}, ${cx + 40 * s} ${cy - 12 * s} ` +
    `L ${cx + 40 * s} ${cy - 23 * s} ` +
    `Q ${cx + 40 * s} ${cy - 25 * s}, ${cx + 40 * s} ${cy - 25 * s} Z`;

  // User chat bubble (left side)
  const userBubbleD =
    `M ${cx - 70 * s} ${cy + 5 * s} ` +
    `L ${cx - 42 * s} ${cy + 5 * s} ` +
    `Q ${cx - 40 * s} ${cy + 5 * s}, ${cx - 40 * s} ${cy + 7 * s} ` +
    `L ${cx - 40 * s} ${cy + 18 * s} ` +
    `Q ${cx - 40 * s} ${cy + 20 * s}, ${cx - 42 * s} ${cy + 20 * s} ` +
    `L ${cx - 48 * s} ${cy + 20 * s} ` +
    `L ${cx - 45 * s} ${cy + 24 * s} ` +
    `L ${cx - 50 * s} ${cy + 20 * s} ` +
    `L ${cx - 70 * s} ${cy + 20 * s} ` +
    `Q ${cx - 72 * s} ${cy + 20 * s}, ${cx - 72 * s} ${cy + 18 * s} ` +
    `L ${cx - 72 * s} ${cy + 7 * s} ` +
    `Q ${cx - 72 * s} ${cy + 5 * s}, ${cx - 70 * s} ${cy + 5 * s} Z`;

  // Robot features (eyes and antenna)
  const featuresD =
    `M ${cx - 18 * s} ${cy - 22 * s} ` +
    `C ${cx - 18 * s} ${cy - 26 * s}, ${cx - 14 * s} ${cy - 26 * s}, ${cx - 14 * s} ${cy - 22 * s} ` +
    `C ${cx - 14 * s} ${cy - 18 * s}, ${cx - 18 * s} ${cy - 18 * s}, ${cx - 18 * s} ${cy - 22 * s} Z ` +
    `M ${cx + 14 * s} ${cy - 22 * s} ` +
    `C ${cx + 14 * s} ${cy - 26 * s}, ${cx + 18 * s} ${cy - 26 * s}, ${cx + 18 * s} ${cy - 22 * s} ` +
    `C ${cx + 18 * s} ${cy - 18 * s}, ${cx + 14 * s} ${cy - 18 * s}, ${cx + 14 * s} ${cy - 22 * s} Z ` +
    `M ${cx - 8 * s} ${cy - 35 * s} L ${cx - 8 * s} ${cy - 42 * s} ` +
    `M ${cx - 12 * s} ${cy - 42 * s} L ${cx - 4 * s} ${cy - 42 * s} ` +
    `M ${cx + 8 * s} ${cy - 35 * s} L ${cx + 8 * s} ${cy - 42 * s} ` +
    `M ${cx + 4 * s} ${cy - 42 * s} L ${cx + 12 * s} ${cy - 42 * s}`;

  return (
    <g>
      <AnimatedPath
        d={headD}
        startFrame={startFrame}
        drawDuration={dur4}
        stroke={COLORS.outline}
        strokeWidth={2.5}
        fill={color}
        fillOpacity={0.3}
      />
      <AnimatedPath
        d={featuresD}
        startFrame={startFrame + dur4}
        drawDuration={dur4}
        stroke={COLORS.outline}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <AnimatedPath
        d={bubbleD}
        startFrame={startFrame + dur4 * 2}
        drawDuration={dur4}
        stroke={COLORS.green}
        strokeWidth={2}
        fill={COLORS.green}
        fillOpacity={0.15}
      />
      <AnimatedPath
        d={userBubbleD}
        startFrame={startFrame + dur4 * 3}
        drawDuration={dur4}
        stroke={COLORS.orange}
        strokeWidth={2}
        fill={COLORS.orange}
        fillOpacity={0.15}
      />
    </g>
  );
};

// ─── VideoCallIcon ───────────────────────────────────────────────────────────
interface VideoCallIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const VideoCallIcon: React.FC<VideoCallIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Camera body (rounded rectangle)
  const bodyD =
    `M ${cx - 30 * s} ${cy - 20 * s} ` +
    `L ${cx + 12 * s} ${cy - 20 * s} ` +
    `Q ${cx + 16 * s} ${cy - 20 * s}, ${cx + 16 * s} ${cy - 16 * s} ` +
    `L ${cx + 16 * s} ${cy + 16 * s} ` +
    `Q ${cx + 16 * s} ${cy + 20 * s}, ${cx + 12 * s} ${cy + 20 * s} ` +
    `L ${cx - 26 * s} ${cy + 20 * s} ` +
    `Q ${cx - 30 * s} ${cy + 20 * s}, ${cx - 30 * s} ${cy + 16 * s} ` +
    `L ${cx - 30 * s} ${cy - 16 * s} ` +
    `Q ${cx - 30 * s} ${cy - 20 * s}, ${cx - 26 * s} ${cy - 20 * s} Z`;

  // Lens triangle (pointing right)
  const lensD =
    `M ${cx + 16 * s} ${cy - 10 * s} ` +
    `L ${cx + 35 * s} ${cy - 20 * s} ` +
    `L ${cx + 35 * s} ${cy + 20 * s} ` +
    `L ${cx + 16 * s} ${cy + 10 * s} Z`;

  // Record dot
  const dotR = 5 * s;
  const dotK = dotR * 0.56;
  const dotD =
    `M ${cx - 8 * s} ${cy - dotR} ` +
    `C ${cx - 8 * s + dotK} ${cy - dotR}, ${cx - 8 * s + dotR} ${cy - dotK}, ${cx - 8 * s + dotR} ${cy} ` +
    `C ${cx - 8 * s + dotR} ${cy + dotK}, ${cx - 8 * s + dotK} ${cy + dotR}, ${cx - 8 * s} ${cy + dotR} ` +
    `C ${cx - 8 * s - dotK} ${cy + dotR}, ${cx - 8 * s - dotR} ${cy + dotK}, ${cx - 8 * s - dotR} ${cy} ` +
    `C ${cx - 8 * s - dotR} ${cy - dotK}, ${cx - 8 * s - dotK} ${cy - dotR}, ${cx - 8 * s} ${cy - dotR} Z`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.2} />
      <AnimatedPath d={lensD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray2} fillOpacity={0.4} />
      <AnimatedPath d={dotD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.red} strokeWidth={2} fill={COLORS.red} fillOpacity={0.8} />
    </g>
  );
};

// ─── BroadcastIcon ───────────────────────────────────────────────────────────
interface BroadcastIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const BroadcastIcon: React.FC<BroadcastIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.red,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Tower base (triangle)
  const towerD =
    `M ${cx} ${cy - 10 * s} ` +
    `L ${cx - 14 * s} ${cy + 30 * s} ` +
    `L ${cx + 14 * s} ${cy + 30 * s} Z ` +
    `M ${cx - 8 * s} ${cy + 15 * s} L ${cx + 8 * s} ${cy + 15 * s}`;

  // Tower top dot
  const topR = 4 * s;
  const topK = topR * 0.56;
  const topDotD =
    `M ${cx} ${cy - 10 * s - topR} ` +
    `C ${cx + topK} ${cy - 10 * s - topR}, ${cx + topR} ${cy - 10 * s - topK}, ${cx + topR} ${cy - 10 * s} ` +
    `C ${cx + topR} ${cy - 10 * s + topK}, ${cx + topK} ${cy - 10 * s + topR}, ${cx} ${cy - 10 * s + topR} ` +
    `C ${cx - topK} ${cy - 10 * s + topR}, ${cx - topR} ${cy - 10 * s + topK}, ${cx - topR} ${cy - 10 * s} ` +
    `C ${cx - topR} ${cy - 10 * s - topK}, ${cx - topK} ${cy - 10 * s - topR}, ${cx} ${cy - 10 * s - topR} Z`;

  // Inner signal arcs
  const innerWavesD =
    `M ${cx - 14 * s} ${cy - 22 * s} ` +
    `C ${cx - 14 * s} ${cy - 32 * s}, ${cx + 14 * s} ${cy - 32 * s}, ${cx + 14 * s} ${cy - 22 * s} ` +
    `M ${cx - 14 * s} ${cy + 2 * s} ` +
    `C ${cx - 14 * s} ${cy - 8 * s}, ${cx + 14 * s} ${cy - 8 * s}, ${cx + 14 * s} ${cy + 2 * s}`;

  // Outer signal arcs
  const outerWavesD =
    `M ${cx - 26 * s} ${cy - 24 * s} ` +
    `C ${cx - 26 * s} ${cy - 42 * s}, ${cx + 26 * s} ${cy - 42 * s}, ${cx + 26 * s} ${cy - 24 * s} ` +
    `M ${cx - 26 * s} ${cy + 4 * s} ` +
    `C ${cx - 26 * s} ${cy - 14 * s}, ${cx + 26 * s} ${cy - 14 * s}, ${cx + 26 * s} ${cy + 4 * s}`;

  return (
    <g>
      <AnimatedPath d={towerD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={COLORS.gray2} fillOpacity={0.3} />
      <AnimatedPath d={topDotD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.8} />
      <AnimatedPath d={innerWavesD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <AnimatedPath d={outerWavesD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
};

// ─── AntennaIcon ─────────────────────────────────────────────────────────────
interface AntennaIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const AntennaIcon: React.FC<AntennaIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Antenna pole
  const poleD =
    `M ${cx} ${cy + 35 * s} L ${cx} ${cy - 15 * s} ` +
    `M ${cx - 12 * s} ${cy + 35 * s} L ${cx} ${cy + 10 * s} L ${cx + 12 * s} ${cy + 35 * s}`;

  // Antenna tip
  const tipR = 4 * s;
  const tipK = tipR * 0.56;
  const tipD =
    `M ${cx} ${cy - 15 * s - tipR} ` +
    `C ${cx + tipK} ${cy - 15 * s - tipR}, ${cx + tipR} ${cy - 15 * s - tipK}, ${cx + tipR} ${cy - 15 * s} ` +
    `C ${cx + tipR} ${cy - 15 * s + tipK}, ${cx + tipK} ${cy - 15 * s + tipR}, ${cx} ${cy - 15 * s + tipR} ` +
    `C ${cx - tipK} ${cy - 15 * s + tipR}, ${cx - tipR} ${cy - 15 * s + tipK}, ${cx - tipR} ${cy - 15 * s} ` +
    `C ${cx - tipR} ${cy - 15 * s - tipK}, ${cx - tipK} ${cy - 15 * s - tipR}, ${cx} ${cy - 15 * s - tipR} Z`;

  // First signal arc
  const arc1D =
    `M ${cx + 15 * s} ${cy - 28 * s} ` +
    `C ${cx + 15 * s} ${cy - 18 * s}, ${cx + 15 * s} ${cy - 8 * s}, ${cx + 15 * s} ${cy - 2 * s} ` +
    `M ${cx - 15 * s} ${cy - 28 * s} ` +
    `C ${cx - 15 * s} ${cy - 18 * s}, ${cx - 15 * s} ${cy - 8 * s}, ${cx - 15 * s} ${cy - 2 * s}`;

  // Second signal arc (wider)
  const arc2D =
    `M ${cx + 28 * s} ${cy - 35 * s} ` +
    `C ${cx + 28 * s} ${cy - 22 * s}, ${cx + 28 * s} ${cy - 8 * s}, ${cx + 28 * s} ${cy + 5 * s} ` +
    `M ${cx - 28 * s} ${cy - 35 * s} ` +
    `C ${cx - 28 * s} ${cy - 22 * s}, ${cx - 28 * s} ${cy - 8 * s}, ${cx - 28 * s} ${cy + 5 * s}`;

  return (
    <g>
      <AnimatedPath d={poleD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} strokeLinecap="round" />
      <AnimatedPath d={tipD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.8} />
      <AnimatedPath d={arc1D} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <AnimatedPath d={arc2D} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
};
