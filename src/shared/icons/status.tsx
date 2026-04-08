import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── SmileyIcon ──────────────────────────────────────────────────────────────
interface SmileyIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const SmileyIcon: React.FC<SmileyIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Face circle
  const r = 32 * s;
  const k = r * 0.56;
  const faceD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} ` +
    `C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  // Eyes - two small filled dots
  const eyeR = 4 * s;
  const eyeK = eyeR * 0.56;
  const makeEye = (ex: number, ey: number) =>
    `M ${ex} ${ey - eyeR} ` +
    `C ${ex + eyeK} ${ey - eyeR}, ${ex + eyeR} ${ey - eyeK}, ${ex + eyeR} ${ey} ` +
    `C ${ex + eyeR} ${ey + eyeK}, ${ex + eyeK} ${ey + eyeR}, ${ex} ${ey + eyeR} ` +
    `C ${ex - eyeK} ${ey + eyeR}, ${ex - eyeR} ${ey + eyeK}, ${ex - eyeR} ${ey} ` +
    `C ${ex - eyeR} ${ey - eyeK}, ${ex - eyeK} ${ey - eyeR}, ${ex} ${ey - eyeR} Z`;
  const eyesD = makeEye(cx - 12 * s, cy - 8 * s) + ' ' + makeEye(cx + 12 * s, cy - 8 * s);

  // Smile arc
  const smileD =
    `M ${cx - 16 * s} ${cy + 8 * s} ` +
    `C ${cx - 10 * s} ${cy + 22 * s}, ${cx + 10 * s} ${cy + 22 * s}, ${cx + 16 * s} ${cy + 8 * s}`;

  return (
    <g>
      <AnimatedPath d={faceD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={eyesD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.outline} fillOpacity={0.9} />
      <AnimatedPath d={smileD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
};

// ─── ThumbsUpIcon ────────────────────────────────────────────────────────────
interface ThumbsUpIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ThumbsUpIcon: React.FC<ThumbsUpIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Thumb shape - going upward
  const thumbD =
    `M ${cx - 5 * s} ${cy + 10 * s} ` +
    `L ${cx - 5 * s} ${cy - 18 * s} ` +
    `C ${cx - 5 * s} ${cy - 28 * s}, ${cx + 6 * s} ${cy - 35 * s}, ${cx + 8 * s} ${cy - 35 * s} ` +
    `C ${cx + 14 * s} ${cy - 35 * s}, ${cx + 16 * s} ${cy - 30 * s}, ${cx + 14 * s} ${cy - 22 * s} ` +
    `L ${cx + 12 * s} ${cy - 18 * s} ` +
    `L ${cx + 28 * s} ${cy - 18 * s} ` +
    `C ${cx + 32 * s} ${cy - 18 * s}, ${cx + 34 * s} ${cy - 14 * s}, ${cx + 32 * s} ${cy - 10 * s} ` +
    `L ${cx + 28 * s} ${cy + 8 * s} ` +
    `C ${cx + 27 * s} ${cy + 12 * s}, ${cx + 24 * s} ${cy + 14 * s}, ${cx + 20 * s} ${cy + 14 * s} ` +
    `L ${cx - 5 * s} ${cy + 14 * s} Z`;

  // Palm/grip rectangle
  const palmD =
    `M ${cx - 22 * s} ${cy + 10 * s} ` +
    `L ${cx - 5 * s} ${cy + 10 * s} ` +
    `L ${cx - 5 * s} ${cy + 35 * s} ` +
    `L ${cx - 22 * s} ${cy + 35 * s} Z`;

  // Finger lines detail
  const fingersD =
    `M ${cx + 12 * s} ${cy - 8 * s} L ${cx + 28 * s} ${cy - 8 * s} ` +
    `M ${cx + 10 * s} ${cy} L ${cx + 26 * s} ${cy}`;

  return (
    <g>
      <AnimatedPath d={thumbD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={palmD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={fingersD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
};

// ─── HeartIcon ───────────────────────────────────────────────────────────────
interface HeartIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const HeartIcon: React.FC<HeartIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.red,
}) => {
  const s = scale;
  const dur2 = Math.floor(drawDuration / 2);

  // Left half of heart
  const leftD =
    `M ${cx} ${cy + 30 * s} ` +
    `C ${cx - 8 * s} ${cy + 22 * s}, ${cx - 35 * s} ${cy + 5 * s}, ${cx - 35 * s} ${cy - 10 * s} ` +
    `C ${cx - 35 * s} ${cy - 25 * s}, ${cx - 22 * s} ${cy - 32 * s}, ${cx - 10 * s} ${cy - 28 * s} ` +
    `C ${cx - 3 * s} ${cy - 25 * s}, ${cx} ${cy - 18 * s}, ${cx} ${cy - 14 * s}`;

  // Right half of heart
  const rightD =
    `M ${cx} ${cy - 14 * s} ` +
    `C ${cx} ${cy - 18 * s}, ${cx + 3 * s} ${cy - 25 * s}, ${cx + 10 * s} ${cy - 28 * s} ` +
    `C ${cx + 22 * s} ${cy - 32 * s}, ${cx + 35 * s} ${cy - 25 * s}, ${cx + 35 * s} ${cy - 10 * s} ` +
    `C ${cx + 35 * s} ${cy + 5 * s}, ${cx + 8 * s} ${cy + 22 * s}, ${cx} ${cy + 30 * s}`;

  return (
    <g>
      <AnimatedPath d={leftD} startFrame={startFrame} drawDuration={dur2} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={rightD} startFrame={startFrame + dur2} drawDuration={dur2} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.4} />
    </g>
  );
};

// ─── CheckCircleIcon ─────────────────────────────────────────────────────────
interface CheckCircleIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const dur2 = Math.floor(drawDuration / 2);

  // Circle
  const r = 30 * s;
  const k = r * 0.56;
  const circleD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} ` +
    `C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  // Checkmark
  const checkD =
    `M ${cx - 14 * s} ${cy + 2 * s} ` +
    `L ${cx - 4 * s} ${cy + 14 * s} ` +
    `L ${cx + 18 * s} ${cy - 12 * s}`;

  return (
    <g>
      <AnimatedPath d={circleD} startFrame={startFrame} drawDuration={dur2} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.2} />
      <AnimatedPath d={checkD} startFrame={startFrame + dur2} drawDuration={dur2} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ─── InfoCircleIcon ──────────────────────────────────────────────────────────
interface InfoCircleIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const InfoCircleIcon: React.FC<InfoCircleIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  // Circle
  const r = 30 * s;
  const k = r * 0.56;
  const circleD =
    `M ${cx} ${cy - r} ` +
    `C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} ` +
    `C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} ` +
    `C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} ` +
    `C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  // Dot of the "i"
  const dotR = 4 * s;
  const dotK = dotR * 0.56;
  const dotD =
    `M ${cx} ${cy - 14 * s - dotR} ` +
    `C ${cx + dotK} ${cy - 14 * s - dotR}, ${cx + dotR} ${cy - 14 * s - dotK}, ${cx + dotR} ${cy - 14 * s} ` +
    `C ${cx + dotR} ${cy - 14 * s + dotK}, ${cx + dotK} ${cy - 14 * s + dotR}, ${cx} ${cy - 14 * s + dotR} ` +
    `C ${cx - dotK} ${cy - 14 * s + dotR}, ${cx - dotR} ${cy - 14 * s + dotK}, ${cx - dotR} ${cy - 14 * s} ` +
    `C ${cx - dotR} ${cy - 14 * s - dotK}, ${cx - dotK} ${cy - 14 * s - dotR}, ${cx} ${cy - 14 * s - dotR} Z`;

  // Stem of the "i"
  const stemD =
    `M ${cx} ${cy - 4 * s} L ${cx} ${cy + 18 * s}`;

  return (
    <g>
      <AnimatedPath d={circleD} startFrame={startFrame} drawDuration={dur3} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.15} />
      <AnimatedPath d={dotD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.9} />
      <AnimatedPath d={stemD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

// ─── NotificationBellIcon ────────────────────────────────────────────────────
interface NotificationBellIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const NotificationBellIcon: React.FC<NotificationBellIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Bell body
  const bellD =
    `M ${cx - 22 * s} ${cy + 12 * s} ` +
    `C ${cx - 22 * s} ${cy - 5 * s}, ${cx - 20 * s} ${cy - 22 * s}, ${cx - 8 * s} ${cy - 28 * s} ` +
    `C ${cx - 4 * s} ${cy - 30 * s}, ${cx + 4 * s} ${cy - 30 * s}, ${cx + 8 * s} ${cy - 28 * s} ` +
    `C ${cx + 20 * s} ${cy - 22 * s}, ${cx + 22 * s} ${cy - 5 * s}, ${cx + 22 * s} ${cy + 12 * s} ` +
    `L ${cx + 30 * s} ${cy + 12 * s} ` +
    `L ${cx + 30 * s} ${cy + 18 * s} ` +
    `L ${cx - 30 * s} ${cy + 18 * s} ` +
    `L ${cx - 30 * s} ${cy + 12 * s} Z`;

  // Clapper at bottom
  const clapperD =
    `M ${cx - 8 * s} ${cy + 18 * s} ` +
    `C ${cx - 8 * s} ${cy + 26 * s}, ${cx + 8 * s} ${cy + 26 * s}, ${cx + 8 * s} ${cy + 18 * s}`;

  // Top nub
  const nubD =
    `M ${cx - 3 * s} ${cy - 30 * s} ` +
    `C ${cx - 3 * s} ${cy - 35 * s}, ${cx + 3 * s} ${cy - 35 * s}, ${cx + 3 * s} ${cy - 30 * s}`;

  // Notification dot (red circle, top-right)
  const dotR = 7 * s;
  const dotK = dotR * 0.56;
  const dotCx = cx + 22 * s;
  const dotCy = cy - 26 * s;
  const dotD =
    `M ${dotCx} ${dotCy - dotR} ` +
    `C ${dotCx + dotK} ${dotCy - dotR}, ${dotCx + dotR} ${dotCy - dotK}, ${dotCx + dotR} ${dotCy} ` +
    `C ${dotCx + dotR} ${dotCy + dotK}, ${dotCx + dotK} ${dotCy + dotR}, ${dotCx} ${dotCy + dotR} ` +
    `C ${dotCx - dotK} ${dotCy + dotR}, ${dotCx - dotR} ${dotCy + dotK}, ${dotCx - dotR} ${dotCy} ` +
    `C ${dotCx - dotR} ${dotCy - dotK}, ${dotCx - dotK} ${dotCy - dotR}, ${dotCx} ${dotCy - dotR} Z`;

  return (
    <g>
      <AnimatedPath d={bellD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={clapperD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={nubD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={dotD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.red} strokeWidth={2} fill={COLORS.red} fillOpacity={0.9} />
    </g>
  );
};
