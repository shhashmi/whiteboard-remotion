import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── PersonIcon (with hairColor) ──────────────────────────────────────────────
interface PersonIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  shirtColor?: string;
  hairColor?: string;
}

export const PersonIcon: React.FC<PersonIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, shirtColor = COLORS.blue, hairColor = COLORS.hairBrown,
}) => {
  const s = scale;
  const headR = 18 * s;
  const headCY = cy - 45 * s;
  const headK = headR * 0.56;
  const dur4 = Math.floor(drawDuration / 4);

  const headD =
    `M ${cx} ${headCY - headR} C ${cx + headK} ${headCY - headR}, ${cx + headR} ${headCY - headK}, ${cx + headR} ${headCY} ` +
    `C ${cx + headR} ${headCY + headK}, ${cx + headK} ${headCY + headR}, ${cx} ${headCY + headR} ` +
    `C ${cx - headK} ${headCY + headR}, ${cx - headR} ${headCY + headK}, ${cx - headR} ${headCY} ` +
    `C ${cx - headR} ${headCY - headK}, ${cx - headK} ${headCY - headR}, ${cx} ${headCY - headR} Z`;

  const hairD = `M ${cx - headR + 2} ${headCY - 4 * s} C ${cx - headR} ${headCY - headR - 4 * s}, ${cx + headR} ${headCY - headR - 4 * s}, ${cx + headR - 2} ${headCY - 4 * s}`;

  const bodyY = headCY + headR;
  const bodyD = `M ${cx - 20 * s} ${bodyY} L ${cx - 24 * s} ${bodyY + 50 * s} L ${cx + 24 * s} ${bodyY + 50 * s} L ${cx + 20 * s} ${bodyY} Z`;

  const armD = `M ${cx + 20 * s} ${bodyY + 15 * s} L ${cx + 50 * s} ${bodyY + 5 * s}`;
  const handD = `M ${cx + 50 * s} ${bodyY + 5 * s} L ${cx + 56 * s} ${bodyY + 2 * s}`;

  return (
    <g>
      <AnimatedPath d={headD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} fill={COLORS.skin} fillOpacity={0.9} />
      <AnimatedPath d={hairD} startFrame={startFrame + dur4 / 2} drawDuration={dur4 / 2} stroke={hairColor} strokeWidth={4 * s} fill="none" />
      <AnimatedPath d={bodyD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} fill={shirtColor} fillOpacity={0.8} />
      <AnimatedPath d={armD} startFrame={startFrame + dur4 * 2} drawDuration={dur4 / 2} stroke={COLORS.outline} strokeWidth={3 * s} />
      <AnimatedPath d={handD} startFrame={startFrame + dur4 * 2 + dur4 / 2} drawDuration={dur4 / 2} stroke={COLORS.outline} strokeWidth={2.5 * s} />
    </g>
  );
};

// ─── PersonSitting ────────────────────────────────────────────────────────────
interface PersonSittingProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  shirtColor?: string;
  color?: string;
}

export const PersonSitting: React.FC<PersonSittingProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, shirtColor = COLORS.blue, color,
}) => {
  const s = scale;
  const shirt = color || shirtColor;
  const headR = 14 * s;
  const headCY = cy - 55 * s;
  const headK = headR * 0.56;
  const dur5 = Math.floor(drawDuration / 5);

  const headD =
    `M ${cx} ${headCY - headR} C ${cx + headK} ${headCY - headR}, ${cx + headR} ${headCY - headK}, ${cx + headR} ${headCY} ` +
    `C ${cx + headR} ${headCY + headK}, ${cx + headK} ${headCY + headR}, ${cx} ${headCY + headR} ` +
    `C ${cx - headK} ${headCY + headR}, ${cx - headR} ${headCY + headK}, ${cx - headR} ${headCY} ` +
    `C ${cx - headR} ${headCY - headK}, ${cx - headK} ${headCY - headR}, ${cx} ${headCY - headR} Z`;

  const bodyD = `M ${cx - 14 * s} ${headCY + headR} L ${cx - 18 * s} ${cy - 10 * s} L ${cx + 18 * s} ${cy - 10 * s} L ${cx + 14 * s} ${headCY + headR} Z`;
  const lapD = `M ${cx - 18 * s} ${cy - 10 * s} L ${cx - 22 * s} ${cy + 10 * s} L ${cx + 22 * s} ${cy + 10 * s} L ${cx + 18 * s} ${cy - 10 * s}`;
  const chairD = `M ${cx - 28 * s} ${cy + 10 * s} L ${cx + 28 * s} ${cy + 10 * s} M ${cx - 24 * s} ${cy + 10 * s} L ${cx - 26 * s} ${cy + 35 * s} M ${cx + 24 * s} ${cy + 10 * s} L ${cx + 26 * s} ${cy + 35 * s}`;
  const deskD = `M ${cx + 20 * s} ${cy - 18 * s} L ${cx + 55 * s} ${cy - 18 * s} L ${cx + 55 * s} ${cy + 35 * s}`;
  const armD = `M ${cx + 14 * s} ${cy - 30 * s} L ${cx + 30 * s} ${cy - 18 * s}`;

  return (
    <g>
      <AnimatedPath d={headD} startFrame={startFrame} drawDuration={dur5} stroke={COLORS.outline} fill={COLORS.skin} fillOpacity={0.9} />
      <AnimatedPath d={bodyD} startFrame={startFrame + dur5} drawDuration={dur5} stroke={COLORS.outline} fill={shirt} fillOpacity={0.7} />
      <AnimatedPath d={lapD} startFrame={startFrame + dur5 * 2} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.outline} fillOpacity={0.1} />
      <AnimatedPath d={armD} startFrame={startFrame + dur5 * 2} drawDuration={dur5 / 2} stroke={COLORS.outline} strokeWidth={2.5 * s} />
      <AnimatedPath d={chairD} startFrame={startFrame + dur5 * 3} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={deskD} startFrame={startFrame + dur5 * 3} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2.5} />
    </g>
  );
};

// ─── PersonPresenting ─────────────────────────────────────────────────────────
interface PersonPresentingProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  shirtColor?: string;
  color?: string;
}

export const PersonPresenting: React.FC<PersonPresentingProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, shirtColor = COLORS.green, color,
}) => {
  const s = scale;
  const shirt = color || shirtColor;
  const headR = 16 * s;
  const headCY = cy - 50 * s;
  const headK = headR * 0.56;
  const dur4 = Math.floor(drawDuration / 4);

  const headD =
    `M ${cx} ${headCY - headR} C ${cx + headK} ${headCY - headR}, ${cx + headR} ${headCY - headK}, ${cx + headR} ${headCY} ` +
    `C ${cx + headR} ${headCY + headK}, ${cx + headK} ${headCY + headR}, ${cx} ${headCY + headR} ` +
    `C ${cx - headK} ${headCY + headR}, ${cx - headR} ${headCY + headK}, ${cx - headR} ${headCY} ` +
    `C ${cx - headR} ${headCY - headK}, ${cx - headK} ${headCY - headR}, ${cx} ${headCY - headR} Z`;

  const bodyD = `M ${cx - 18 * s} ${headCY + headR} L ${cx - 22 * s} ${cy + 40 * s} L ${cx + 22 * s} ${cy + 40 * s} L ${cx + 18 * s} ${headCY + headR} Z`;
  const armUpD = `M ${cx + 18 * s} ${cy - 25 * s} L ${cx + 55 * s} ${cy - 60 * s}`;
  const armDownD = `M ${cx - 18 * s} ${cy - 25 * s} L ${cx - 40 * s} ${cy + 10 * s}`;
  const handD = `M ${cx + 55 * s} ${cy - 60 * s} L ${cx + 60 * s} ${cy - 62 * s}`;

  return (
    <g>
      <AnimatedPath d={headD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} fill={COLORS.skin} fillOpacity={0.9} />
      <AnimatedPath d={bodyD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} fill={shirt} fillOpacity={0.7} />
      <AnimatedPath d={armUpD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={3 * s} />
      <AnimatedPath d={handD} startFrame={startFrame + dur4 * 2 + dur4 / 2} drawDuration={dur4 / 2} stroke={COLORS.outline} strokeWidth={2.5 * s} />
      <AnimatedPath d={armDownD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={3 * s} />
    </g>
  );
};

// ─── TwoPersons ───────────────────────────────────────────────────────────────
interface TwoPersonsProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const TwoPersons: React.FC<TwoPersonsProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color,
}) => {
  const s = scale;
  const dur2 = Math.floor(drawDuration / 2);
  const gap = 40 * s;

  return (
    <g>
      <PersonIcon cx={cx - gap} cy={cy} scale={scale * 0.8} startFrame={startFrame} drawDuration={dur2} shirtColor={color || COLORS.blue} />
      <PersonIcon cx={cx + gap} cy={cy} scale={scale * 0.8} startFrame={startFrame + dur2 / 2} drawDuration={dur2} shirtColor={COLORS.green} />
    </g>
  );
};

// ─── TeamGroup ────────────────────────────────────────────────────────────────
interface TeamGroupProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const TeamGroup: React.FC<TeamGroupProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);
  const colors = [color || COLORS.blue, COLORS.green, COLORS.purple];
  const positions = [
    { dx: 0, dy: -15 * s },
    { dx: -35 * s, dy: 15 * s },
    { dx: 35 * s, dy: 15 * s },
  ];

  return (
    <g>
      {positions.map((pos, i) => (
        <PersonIcon
          key={i}
          cx={cx + pos.dx}
          cy={cy + pos.dy}
          scale={scale * 0.65}
          startFrame={startFrame + i * Math.floor(dur3 / 2)}
          drawDuration={dur3}
          shirtColor={colors[i]}
        />
      ))}
    </g>
  );
};
