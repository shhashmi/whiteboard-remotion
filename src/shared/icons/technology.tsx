import React from 'react';
import { AnimatedPath, COLORS } from '../components';

// ─── RobotHead ────────────────────────────────────────────────────────────────
interface RobotHeadProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const RobotHead: React.FC<RobotHeadProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = '#e0f2fe',
}) => {
  const s = scale;
  const hw = 30 * s, hh = 27 * s;
  const dur5 = Math.floor(drawDuration / 5);

  const headD =
    `M ${cx - hw + 3} ${cy - hh + 2} ` +
    `L ${cx + hw - 1} ${cy - hh - 1} ` +
    `Q ${cx + hw + 1} ${cy - hh} ${cx + hw + 1} ${cy - hh + 5} ` +
    `L ${cx + hw + 2} ${cy + hh - 3} ` +
    `Q ${cx + hw} ${cy + hh + 1} ${cx + hw - 4} ${cy + hh + 1} ` +
    `L ${cx - hw + 2} ${cy + hh - 1} ` +
    `Q ${cx - hw - 1} ${cy + hh} ${cx - hw - 1} ${cy + hh - 4} ` +
    `L ${cx - hw} ${cy - hh + 4} ` +
    `Q ${cx - hw} ${cy - hh} ${cx - hw + 3} ${cy - hh + 2} Z`;

  const antennaLineD = `M ${cx} ${cy - hh} L ${cx} ${cy - hh - 22 * s}`;
  const aCY = cy - hh - 30 * s;
  const aR = 8 * s;
  const aK = aR * 0.56;
  const antennaCircD =
    `M ${cx} ${aCY - aR} C ${cx + aK} ${aCY - aR}, ${cx + aR} ${aCY - aK}, ${cx + aR} ${aCY} ` +
    `C ${cx + aR} ${aCY + aK}, ${cx + aK} ${aCY + aR}, ${cx} ${aCY + aR} ` +
    `C ${cx - aK} ${aCY + aR}, ${cx - aR} ${aCY + aK}, ${cx - aR} ${aCY} ` +
    `C ${cx - aR} ${aCY - aK}, ${cx - aK} ${aCY - aR}, ${cx} ${aCY - aR} Z`;

  const leX = cx - 12 * s, leY = cy - 5 * s, eR = 8 * s, eK = eR * 0.56;
  const leftEyeD =
    `M ${leX} ${leY - eR} C ${leX + eK} ${leY - eR}, ${leX + eR} ${leY - eK}, ${leX + eR} ${leY} ` +
    `C ${leX + eR} ${leY + eK}, ${leX + eK} ${leY + eR}, ${leX} ${leY + eR} ` +
    `C ${leX - eK} ${leY + eR}, ${leX - eR} ${leY + eK}, ${leX - eR} ${leY} ` +
    `C ${leX - eR} ${leY - eK}, ${leX - eK} ${leY - eR}, ${leX} ${leY - eR} Z`;

  const reX = cx + 12 * s, reY = cy - 5 * s;
  const rightEyeD =
    `M ${reX} ${reY - eR} C ${reX + eK} ${reY - eR}, ${reX + eR} ${reY - eK}, ${reX + eR} ${reY} ` +
    `C ${reX + eR} ${reY + eK}, ${reX + eK} ${reY + eR}, ${reX} ${reY + eR} ` +
    `C ${reX - eK} ${reY + eR}, ${reX - eR} ${reY + eK}, ${reX - eR} ${reY} ` +
    `C ${reX - eR} ${reY - eK}, ${reX - eK} ${reY - eR}, ${reX} ${reY - eR} Z`;

  const pR = 3 * s, pK = pR * 0.56;
  const leftPupilD =
    `M ${leX} ${leY - pR} C ${leX + pK} ${leY - pR}, ${leX + pR} ${leY - pK}, ${leX + pR} ${leY} ` +
    `C ${leX + pR} ${leY + pK}, ${leX + pK} ${leY + pR}, ${leX} ${leY + pR} ` +
    `C ${leX - pK} ${leY + pR}, ${leX - pR} ${leY + pK}, ${leX - pR} ${leY} ` +
    `C ${leX - pR} ${leY - pK}, ${leX - pK} ${leY - pR}, ${leX} ${leY - pR} Z`;
  const rightPupilD =
    `M ${reX} ${reY - pR} C ${reX + pK} ${reY - pR}, ${reX + pR} ${reY - pK}, ${reX + pR} ${reY} ` +
    `C ${reX + pR} ${reY + pK}, ${reX + pK} ${reY + pR}, ${reX} ${reY + pR} ` +
    `C ${reX - pK} ${reY + pR}, ${reX - pR} ${reY + pK}, ${reX - pR} ${reY} ` +
    `C ${reX - pR} ${reY - pK}, ${reX - pK} ${reY - pR}, ${reX} ${reY - pR} Z`;

  const mY = cy + 14 * s;
  const mouthD =
    `M ${cx - 14 * s} ${mY} ` +
    `L ${cx - 7 * s} ${mY - 6 * s} ` +
    `L ${cx} ${mY + 2 * s} ` +
    `L ${cx + 7 * s} ${mY - 6 * s} ` +
    `L ${cx + 14 * s} ${mY}`;

  return (
    <g>
      <AnimatedPath d={headD} startFrame={startFrame} drawDuration={dur5 * 2} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.6} />
      <AnimatedPath d={antennaLineD} startFrame={startFrame + dur5} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={antennaCircD} startFrame={startFrame + dur5 * 2} drawDuration={dur5} stroke={COLORS.outline} fill={COLORS.yellow} fillOpacity={1} />
      <AnimatedPath d={leftEyeD} startFrame={startFrame + dur5 * 2} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.white} fillOpacity={1} />
      <AnimatedPath d={rightEyeD} startFrame={startFrame + dur5 * 2} drawDuration={dur5} stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.white} fillOpacity={1} />
      <AnimatedPath d={leftPupilD} startFrame={startFrame + dur5 * 3} drawDuration={dur5 / 2} stroke={COLORS.outline} fill={COLORS.outline} fillOpacity={1} />
      <AnimatedPath d={rightPupilD} startFrame={startFrame + dur5 * 3} drawDuration={dur5 / 2} stroke={COLORS.outline} fill={COLORS.outline} fillOpacity={1} />
      <AnimatedPath d={mouthD} startFrame={startFrame + dur5 * 3} drawDuration={dur5} stroke={COLORS.orange} strokeWidth={2 * s} />
    </g>
  );
};

// ─── ToolIcon (wrench) ────────────────────────────────────────────────────────
interface ToolIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ cx, cy, scale = 1, startFrame, drawDuration }) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  const handleD =
    `M ${cx - 6 * s} ${cy + 38 * s} ` +
    `L ${cx - 4 * s} ${cy - 5 * s} ` +
    `L ${cx + 4 * s} ${cy - 5 * s} ` +
    `L ${cx + 6 * s} ${cy + 38 * s} Z`;

  const headD =
    `M ${cx - 18 * s} ${cy - 22 * s} ` +
    `C ${cx - 18 * s} ${cy - 42 * s}, ${cx + 18 * s} ${cy - 42 * s}, ${cx + 18 * s} ${cy - 22 * s} ` +
    `C ${cx + 18 * s} ${cy - 12 * s}, ${cx + 10 * s} ${cy - 8 * s}, ${cx + 10 * s} ${cy - 14 * s} ` +
    `C ${cx + 10 * s} ${cy - 26 * s}, ${cx - 10 * s} ${cy - 26 * s}, ${cx - 10 * s} ${cy - 14 * s} ` +
    `C ${cx - 10 * s} ${cy - 8 * s}, ${cx - 18 * s} ${cy - 12 * s}, ${cx - 18 * s} ${cy - 22 * s} Z`;

  return (
    <g>
      <AnimatedPath d={handleD} startFrame={startFrame} drawDuration={dur3 * 2} stroke={COLORS.gray1} strokeWidth={2} fill={COLORS.gray2} fillOpacity={0.5} />
      <AnimatedPath d={headD} startFrame={startFrame + dur3} drawDuration={dur3 * 2} stroke={COLORS.gray1} strokeWidth={2} fill={COLORS.gray2} fillOpacity={0.6} />
    </g>
  );
};

// ─── DatabaseIcon ─────────────────────────────────────────────────────────────
interface DatabaseIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const DatabaseIcon: React.FC<DatabaseIconProps> = ({ cx, cy, scale = 1, startFrame, drawDuration }) => {
  const s = scale;
  const w = 50 * s, h = 70 * s;
  const ew = w / 2, eh = 10 * s;
  const dur3 = Math.floor(drawDuration / 3);

  const bodyD =
    `M ${cx - ew} ${cy - h / 2 + eh} ` +
    `L ${cx - ew} ${cy + h / 2 - eh} ` +
    `C ${cx - ew} ${cy + h / 2 + 4 * s}, ${cx + ew} ${cy + h / 2 + 4 * s}, ${cx + ew} ${cy + h / 2 - eh} ` +
    `L ${cx + ew} ${cy - h / 2 + eh}`;

  const topEllipseD =
    `M ${cx - ew} ${cy - h / 2 + eh} ` +
    `C ${cx - ew} ${cy - h / 2 - 4 * s}, ${cx + ew} ${cy - h / 2 - 4 * s}, ${cx + ew} ${cy - h / 2 + eh} ` +
    `C ${cx + ew} ${cy - h / 2 + eh * 2 + 4 * s}, ${cx - ew} ${cy - h / 2 + eh * 2 + 4 * s}, ${cx - ew} ${cy - h / 2 + eh} Z`;

  const shelf1D = `M ${cx - ew} ${cy - h / 6} C ${cx - ew} ${cy - h / 6 + eh}, ${cx + ew} ${cy - h / 6 + eh}, ${cx + ew} ${cy - h / 6}`;
  const shelf2D = `M ${cx - ew} ${cy + h / 6} C ${cx - ew} ${cy + h / 6 + eh}, ${cx + ew} ${cy + h / 6 + eh}, ${cx + ew} ${cy + h / 6}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.blue} strokeWidth={2} fill={COLORS.blue} fillOpacity={0.1} />
      <AnimatedPath d={topEllipseD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.blue} strokeWidth={2} fill={COLORS.blue} fillOpacity={0.3} />
      <AnimatedPath d={shelf1D} startFrame={startFrame + dur3 * 2} drawDuration={dur3 / 2} stroke={COLORS.blue} strokeWidth={1.5} />
      <AnimatedPath d={shelf2D} startFrame={startFrame + dur3 * 2 + dur3 / 4} drawDuration={dur3 / 2} stroke={COLORS.blue} strokeWidth={1.5} />
    </g>
  );
};

// ─── CodeIcon ─────────────────────────────────────────────────────────────────
interface CodeIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const CodeIcon: React.FC<CodeIconProps> = ({ cx, cy, scale = 1, startFrame, drawDuration }) => {
  const s = scale;
  const w = 70 * s, h = 55 * s;
  const dur3 = Math.floor(drawDuration / 3);

  const bgD =
    `M ${cx - w / 2 + 4} ${cy - h / 2 + 2} L ${cx + w / 2 - 2} ${cy - h / 2 - 1} ` +
    `Q ${cx + w / 2 + 1} ${cy - h / 2} ${cx + w / 2 + 1} ${cy - h / 2 + 5} ` +
    `L ${cx + w / 2 + 2} ${cy + h / 2 - 3} Q ${cx + w / 2} ${cy + h / 2 + 1} ${cx + w / 2 - 4} ${cy + h / 2 + 1} ` +
    `L ${cx - w / 2 + 2} ${cy + h / 2 - 1} Q ${cx - w / 2 - 1} ${cy + h / 2} ${cx - w / 2 - 1} ${cy + h / 2 - 4} ` +
    `L ${cx - w / 2} ${cy - h / 2 + 4} Q ${cx - w / 2} ${cy - h / 2} ${cx - w / 2 + 4} ${cy - h / 2 + 2} Z`;

  const leftBracket = `M ${cx - 22 * s} ${cy - 10 * s} L ${cx - 35 * s} ${cy} L ${cx - 22 * s} ${cy + 10 * s}`;
  const rightBracket = `M ${cx + 22 * s} ${cy - 10 * s} L ${cx + 35 * s} ${cy} L ${cx + 22 * s} ${cy + 10 * s}`;
  const slashD = `M ${cx + 8 * s} ${cy - 14 * s} L ${cx - 8 * s} ${cy + 14 * s}`;

  return (
    <g>
      <AnimatedPath d={bgD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} fill="#1e293b" fillOpacity={0.9} />
      <AnimatedPath d={leftBracket} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.green} strokeWidth={2.5 * s} />
      <AnimatedPath d={rightBracket} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.green} strokeWidth={2.5 * s} />
      <AnimatedPath d={slashD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.yellow} strokeWidth={2.5 * s} />
    </g>
  );
};

// ─── CloudIcon ────────────────────────────────────────────────────────────────
interface CloudIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const CloudIcon: React.FC<CloudIconProps> = ({ cx, cy, scale = 1, startFrame, drawDuration }) => {
  const s = scale;

  const cloudD =
    `M ${cx - 50 * s} ${cy + 18 * s} ` +
    `Q ${cx - 72 * s} ${cy + 18 * s}, ${cx - 72 * s} ${cy - 2 * s} ` +
    `Q ${cx - 72 * s} ${cy - 28 * s}, ${cx - 42 * s} ${cy - 28 * s} ` +
    `Q ${cx - 38 * s} ${cy - 50 * s}, ${cx - 12 * s} ${cy - 48 * s} ` +
    `Q ${cx + 12 * s} ${cy - 62 * s}, ${cx + 35 * s} ${cy - 44 * s} ` +
    `Q ${cx + 65 * s} ${cy - 44 * s}, ${cx + 65 * s} ${cy - 12 * s} ` +
    `Q ${cx + 65 * s} ${cy + 18 * s}, ${cx + 40 * s} ${cy + 18 * s} Z`;

  return (
    <AnimatedPath
      d={cloudD}
      startFrame={startFrame}
      drawDuration={drawDuration}
      stroke={COLORS.blue}
      strokeWidth={2}
      fill="#e0f2fe"
      fillOpacity={0.8}
    />
  );
};

// ─── MonitorIcon ──────────────────────────────────────────────────────────────
interface MonitorIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const MonitorIcon: React.FC<MonitorIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration,
}) => {
  const sw = 110 * scale, sh = 75 * scale;
  const sx = cx - sw / 2, sy = cy - sh / 2;
  const third = Math.floor(drawDuration / 4);

  const screenD = `M ${sx + 2} ${sy + 2} L ${sx + sw - 2} ${sy - 1} L ${sx + sw + 1} ${sy + sh - 2} L ${sx - 1} ${sy + sh + 1} Z`;
  const standD = `M ${cx - 8 * scale} ${sy + sh} L ${cx + 8 * scale} ${sy + sh} L ${cx + 14 * scale} ${sy + sh + 18 * scale} L ${cx - 14 * scale} ${sy + sh + 18 * scale}`;
  const baseD = `M ${cx - 22 * scale} ${sy + sh + 18 * scale} L ${cx + 22 * scale} ${sy + sh + 18 * scale}`;

  const tx = cx - 6 * scale, ty = cy;
  const playD = `M ${tx} ${ty - 10 * scale} L ${tx + 16 * scale} ${ty} L ${tx} ${ty + 10 * scale} Z`;

  const pbY = sy + sh - 12 * scale;
  const pbD = `M ${sx + 8 * scale} ${pbY} L ${sx + sw - 8 * scale} ${pbY}`;
  const pbFillD = `M ${sx + 8 * scale} ${pbY} L ${sx + sw * 0.55} ${pbY}`;

  return (
    <g>
      <AnimatedPath d={screenD} startFrame={startFrame} drawDuration={third * 2} stroke={COLORS.outline} fill={COLORS.blue} fillOpacity={0.08} />
      <AnimatedPath d={standD} startFrame={startFrame + third} drawDuration={third} stroke={COLORS.outline} />
      <AnimatedPath d={baseD} startFrame={startFrame + third * 2} drawDuration={third} stroke={COLORS.outline} strokeWidth={3} />
      <AnimatedPath d={playD} startFrame={startFrame + third * 2} drawDuration={third} stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.7} />
      <AnimatedPath d={pbD} startFrame={startFrame + third * 3} drawDuration={third} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={pbFillD} startFrame={startFrame + third * 3} drawDuration={third} stroke={COLORS.blue} strokeWidth={3} />
    </g>
  );
};

// ─── GearIcon ─────────────────────────────────────────────────────────────────
interface GearIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const GearIcon: React.FC<GearIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = '#888',
}) => {
  const teeth = 8;
  const outerR = 28 * scale;
  const toothH = 8 * scale;
  const toothW = Math.PI / teeth * 0.5;

  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a1 = (i * 2 * Math.PI) / teeth;
    const a2 = a1 + toothW;
    const a3 = a1 + Math.PI / teeth - toothW;
    const a4 = a1 + Math.PI / teeth;

    if (i === 0) {
      d += `M ${cx + outerR * Math.cos(a1)} ${cy + outerR * Math.sin(a1)} `;
    }
    d += `L ${cx + (outerR + toothH) * Math.cos(a1)} ${cy + (outerR + toothH) * Math.sin(a1)} `;
    d += `L ${cx + (outerR + toothH) * Math.cos(a2)} ${cy + (outerR + toothH) * Math.sin(a2)} `;
    d += `L ${cx + outerR * Math.cos(a3)} ${cy + outerR * Math.sin(a3)} `;
    d += `L ${cx + outerR * Math.cos(a4)} ${cy + outerR * Math.sin(a4)} `;
  }
  d += 'Z';

  const holeR = 9 * scale;
  const holeK = holeR * 0.56;
  const holeD = `M ${cx} ${cy - holeR} C ${cx + holeK} ${cy - holeR}, ${cx + holeR} ${cy - holeK}, ${cx + holeR} ${cy} C ${cx + holeR} ${cy + holeK}, ${cx + holeK} ${cy + holeR}, ${cx} ${cy + holeR} C ${cx - holeK} ${cy + holeR}, ${cx - holeR} ${cy + holeK}, ${cx - holeR} ${cy} C ${cx - holeR} ${cy - holeK}, ${cx - holeK} ${cy - holeR}, ${cx} ${cy - holeR} Z`;

  return (
    <g>
      <AnimatedPath d={d} startFrame={startFrame} drawDuration={drawDuration} stroke={COLORS.outline} fill={color} fillOpacity={0.4} />
      <AnimatedPath d={holeD} startFrame={startFrame + drawDuration / 2} drawDuration={drawDuration / 2} stroke={COLORS.outline} fill={COLORS.white} fillOpacity={1} />
    </g>
  );
};

// ─── KeyboardIcon ─────────────────────────────────────────────────────────────
interface KeyboardIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const KeyboardIcon: React.FC<KeyboardIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.gray2,
}) => {
  const s = scale;
  const w = 80 * s, h = 45 * s;
  const x = cx - w / 2, y = cy - h / 2;
  const dur4 = Math.floor(drawDuration / 4);

  const bodyD =
    `M ${x + 4} ${y + 2} L ${x + w - 2} ${y - 1} ` +
    `Q ${x + w + 1} ${y} ${x + w + 1} ${y + 4} ` +
    `L ${x + w + 2} ${y + h - 3} Q ${x + w} ${y + h + 1} ${x + w - 4} ${y + h + 1} ` +
    `L ${x + 2} ${y + h - 1} Q ${x - 1} ${y + h} ${x - 1} ${y + h - 4} ` +
    `L ${x} ${y + 4} Q ${x} ${y} ${x + 4} ${y + 2} Z`;

  const keys: string[] = [];
  const kw = 10 * s, kh = 8 * s, gap = 3 * s;
  for (let row = 0; row < 3; row++) {
    const ky = y + 8 * s + row * (kh + gap);
    const count = row === 2 ? 5 : 6;
    const offset = row === 2 ? 10 * s : 0;
    for (let col = 0; col < count; col++) {
      const kx = x + 8 * s + offset + col * (kw + gap);
      const w2 = row === 2 && col === 2 ? kw * 2 + gap : kw;
      keys.push(`M ${kx} ${ky} L ${kx + w2} ${ky} L ${kx + w2} ${ky + kh} L ${kx} ${ky + kh} Z`);
      if (row === 2 && col === 2) break;
    }
  }

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur4 * 2} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.15} />
      {keys.map((kd, i) => (
        <AnimatedPath key={i} d={kd} startFrame={startFrame + dur4 * 2 + Math.floor(i * dur4 * 2 / keys.length)} drawDuration={Math.max(4, dur4 / 2)} stroke={COLORS.outline} strokeWidth={1.5} fill={color} fillOpacity={0.3} />
      ))}
    </g>
  );
};

// ─── MobilePhone ──────────────────────────────────────────────────────────────
interface MobilePhoneProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MobilePhone: React.FC<MobilePhoneProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.outline,
}) => {
  const s = scale;
  const w = 36 * s, h = 65 * s;
  const x = cx - w / 2, y = cy - h / 2;
  const r = 5 * s;
  const dur3 = Math.floor(drawDuration / 3);

  const bodyD =
    `M ${x + r} ${y} L ${x + w - r} ${y} ` +
    `Q ${x + w} ${y} ${x + w} ${y + r} ` +
    `L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} ` +
    `L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} ` +
    `L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

  const screenD = `M ${x + 4 * s} ${y + 10 * s} L ${x + w - 4 * s} ${y + 10 * s} L ${x + w - 4 * s} ${y + h - 14 * s} L ${x + 4 * s} ${y + h - 14 * s} Z`;

  const btnR = 4 * s, btnK = btnR * 0.56;
  const btnCx = cx, btnCy = y + h - 7 * s;
  const btnD = `M ${btnCx} ${btnCy - btnR} C ${btnCx + btnK} ${btnCy - btnR}, ${btnCx + btnR} ${btnCy - btnK}, ${btnCx + btnR} ${btnCy} C ${btnCx + btnR} ${btnCy + btnK}, ${btnCx + btnK} ${btnCy + btnR}, ${btnCx} ${btnCy + btnR} C ${btnCx - btnK} ${btnCy + btnR}, ${btnCx - btnR} ${btnCy + btnK}, ${btnCx - btnR} ${btnCy} C ${btnCx - btnR} ${btnCy - btnK}, ${btnCx - btnK} ${btnCy - btnR}, ${btnCx} ${btnCy - btnR} Z`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3} stroke={color} strokeWidth={2.5} fill={COLORS.white} fillOpacity={0.9} />
      <AnimatedPath d={screenD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={1.5} fill={COLORS.blue} fillOpacity={0.1} />
      <AnimatedPath d={btnD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={1.5} />
    </g>
  );
};

// ─── ServerRack ───────────────────────────────────────────────────────────────
interface ServerRackProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ServerRack: React.FC<ServerRackProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const w = 60 * s, h = 80 * s;
  const x = cx - w / 2, y = cy - h / 2;
  const slotH = 18 * s, gap = 4 * s;
  const dur4 = Math.floor(drawDuration / 4);

  const bodyD =
    `M ${x + 2} ${y + 1} L ${x + w - 1} ${y - 1} L ${x + w + 1} ${y + h + 1} L ${x - 1} ${y + h - 1} Z`;

  const slots: string[] = [];
  const dots: string[] = [];
  for (let i = 0; i < 3; i++) {
    const sy2 = y + 6 * s + i * (slotH + gap);
    slots.push(`M ${x + 5 * s} ${sy2} L ${x + w - 5 * s} ${sy2} L ${x + w - 5 * s} ${sy2 + slotH} L ${x + 5 * s} ${sy2 + slotH} Z`);
    const dotY = sy2 + slotH / 2;
    const dotR = 3 * s;
    dots.push(`M ${x + w - 14 * s} ${dotY - dotR} L ${x + w - 14 * s + dotR * 2} ${dotY - dotR} L ${x + w - 14 * s + dotR * 2} ${dotY + dotR} L ${x + w - 14 * s} ${dotY + dotR} Z`);
  }

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur4 * 2} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.08} />
      {slots.map((sd, i) => (
        <AnimatedPath key={`s${i}`} d={sd} startFrame={startFrame + dur4 * 2 + i * Math.floor(dur4 / 2)} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} fill={color} fillOpacity={0.15} />
      ))}
      {dots.map((dd, i) => (
        <AnimatedPath key={`d${i}`} d={dd} startFrame={startFrame + dur4 * 3 + i * 4} drawDuration={Math.max(4, dur4 / 3)} stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.8} />
      ))}
    </g>
  );
};

// ─── EnvelopeIcon ─────────────────────────────────────────────────────────────
interface EnvelopeIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const EnvelopeIcon: React.FC<EnvelopeIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const w = 70 * s, h = 48 * s;
  const x = cx - w / 2, y = cy - h / 2;
  const dur3 = Math.floor(drawDuration / 3);

  const bodyD = `M ${x + 2} ${y + 1} L ${x + w - 1} ${y - 1} L ${x + w + 1} ${y + h + 1} L ${x - 1} ${y + h - 1} Z`;
  const flapD = `M ${x + 2} ${y + 1} L ${cx} ${cy + 2 * s} L ${x + w - 1} ${y - 1}`;

  return (
    <g>
      <AnimatedPath d={bodyD} startFrame={startFrame} drawDuration={dur3 * 2} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.1} />
      <AnimatedPath d={flapD} startFrame={startFrame + dur3} drawDuration={dur3 * 2} stroke={COLORS.outline} strokeWidth={2} />
    </g>
  );
};

// ─── WiFiSignal ───────────────────────────────────────────────────────────────
interface WiFiSignalProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const WiFiSignal: React.FC<WiFiSignalProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  const arcs: string[] = [];
  const radii = [18, 30, 42];
  for (const r of radii) {
    const rs = r * s;
    const startAngle = -Math.PI * 0.75;
    const endAngle = -Math.PI * 0.25;
    const x1 = cx + rs * Math.cos(startAngle);
    const y1 = cy + rs * Math.sin(startAngle);
    const x2 = cx + rs * Math.cos(endAngle);
    const y2 = cy + rs * Math.sin(endAngle);
    arcs.push(`M ${x1} ${y1} A ${rs} ${rs} 0 0 1 ${x2} ${y2}`);
  }

  const dotR = 4 * s, dotK = dotR * 0.56;
  const dotD = `M ${cx} ${cy - dotR} C ${cx + dotK} ${cy - dotR}, ${cx + dotR} ${cy - dotK}, ${cx + dotR} ${cy} C ${cx + dotR} ${cy + dotK}, ${cx + dotK} ${cy + dotR}, ${cx} ${cy + dotR} C ${cx - dotK} ${cy + dotR}, ${cx - dotR} ${cy + dotK}, ${cx - dotR} ${cy} C ${cx - dotR} ${cy - dotK}, ${cx - dotK} ${cy - dotR}, ${cx} ${cy - dotR} Z`;

  return (
    <g>
      <AnimatedPath d={dotD} startFrame={startFrame} drawDuration={dur4} stroke={color} fill={color} fillOpacity={1} />
      {arcs.map((ad, i) => (
        <AnimatedPath key={i} d={ad} startFrame={startFrame + dur4 * (i + 1)} drawDuration={dur4} stroke={color} strokeWidth={2.5 * s} />
      ))}
    </g>
  );
};

// ─── GridIcon ─────────────────────────────────────────────────────────────────
interface GridIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  rows?: number;
  cols?: number;
  color?: string;
}

export const GridIcon: React.FC<GridIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, rows = 3, cols = 3, color = COLORS.outline,
}) => {
  const s = scale;
  const cellW = 20 * s, cellH = 20 * s;
  const totalW = cols * cellW, totalH = rows * cellH;
  const x = cx - totalW / 2, y = cy - totalH / 2;
  const perLine = Math.floor(drawDuration / (rows + cols + 1));

  const lines: string[] = [];
  for (let r = 0; r <= rows; r++) {
    lines.push(`M ${x} ${y + r * cellH} L ${x + totalW} ${y + r * cellH}`);
  }
  for (let c = 0; c <= cols; c++) {
    lines.push(`M ${x + c * cellW} ${y} L ${x + c * cellW} ${y + totalH}`);
  }

  return (
    <g>
      {lines.map((ld, i) => (
        <AnimatedPath key={i} d={ld} startFrame={startFrame + i * perLine} drawDuration={Math.max(4, perLine)} stroke={color} strokeWidth={2 * s} />
      ))}
    </g>
  );
};

// ─── RadarSensorIcon ──────────────────────────────────────────────────────────
interface RadarSensorIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const RadarSensorIcon: React.FC<RadarSensorIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Base unit/sensor housing
  const baseD =
    `M ${cx - 25 * s} ${cy + 28 * s} ` +
    `L ${cx + 25 * s} ${cy + 28 * s} ` +
    `Q ${cx + 27 * s} ${cy + 28 * s}, ${cx + 27 * s} ${cy + 25 * s} ` +
    `L ${cx + 27 * s} ${cy + 15 * s} ` +
    `Q ${cx + 27 * s} ${cy + 12 * s}, ${cx + 25 * s} ${cy + 12 * s} ` +
    `L ${cx - 25 * s} ${cy + 12 * s} ` +
    `Q ${cx - 27 * s} ${cy + 12 * s}, ${cx - 27 * s} ${cy + 15 * s} ` +
    `L ${cx - 27 * s} ${cy + 25 * s} ` +
    `Q ${cx - 27 * s} ${cy + 28 * s}, ${cx - 25 * s} ${cy + 28 * s} Z`;

  // Inner radar arc 1 (closest)
  const arc1R = 20 * s;
  const arc1D =
    `M ${cx - arc1R * 0.707} ${cy + 20 * s - arc1R * 0.707} ` +
    `A ${arc1R} ${arc1R} 0 0 1 ${cx + arc1R * 0.707} ${cy + 20 * s - arc1R * 0.707}`;

  // Middle radar arc 2
  const arc2R = 35 * s;
  const arc2D =
    `M ${cx - arc2R * 0.707} ${cy + 20 * s - arc2R * 0.707} ` +
    `A ${arc2R} ${arc2R} 0 0 1 ${cx + arc2R * 0.707} ${cy + 20 * s - arc2R * 0.707}`;

  // Outer radar arc 3 (farthest)
  const arc3R = 50 * s;
  const arc3D =
    `M ${cx - arc3R * 0.707} ${cy + 20 * s - arc3R * 0.707} ` +
    `A ${arc3R} ${arc3R} 0 0 1 ${cx + arc3R * 0.707} ${cy + 20 * s - arc3R * 0.707}`;

  return (
    <g>
      <AnimatedPath 
        d={baseD} 
        startFrame={startFrame} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2.5} 
        fill={color} 
        fillOpacity={0.6} 
      />
      <AnimatedPath 
        d={arc1D} 
        startFrame={startFrame + dur4} 
        drawDuration={dur4} 
        stroke={color} 
        strokeWidth={2} 
        strokeOpacity={0.9}
      />
      <AnimatedPath 
        d={arc2D} 
        startFrame={startFrame + dur4 * 2} 
        drawDuration={dur4} 
        stroke={color} 
        strokeWidth={2} 
        strokeOpacity={0.6}
      />
      <AnimatedPath 
        d={arc3D} 
        startFrame={startFrame + dur4 * 3} 
        drawDuration={dur4} 
        stroke={color} 
        strokeWidth={2} 
        strokeOpacity={0.4}
      />
    </g>
  );
};

// ─── SensorEyeIcon ────────────────────────────────────────────────────────────
interface SensorEyeIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const SensorEyeIcon: React.FC<SensorEyeIconProps> = ({ 
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue 
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Main eye shape (almond)
  const eyeD = 
    `M ${cx - 35 * s} ${cy} ` +
    `C ${cx - 35 * s} ${cy - 18 * s}, ${cx - 12 * s} ${cy - 22 * s}, ${cx} ${cy - 22 * s} ` +
    `C ${cx + 12 * s} ${cy - 22 * s}, ${cx + 36 * s} ${cy - 18 * s}, ${cx + 36 * s} ${cy} ` +
    `C ${cx + 36 * s} ${cy + 18 * s}, ${cx + 12 * s} ${cy + 23 * s}, ${cx} ${cy + 23 * s} ` +
    `C ${cx - 12 * s} ${cy + 23 * s}, ${cx - 35 * s} ${cy + 18 * s}, ${cx - 35 * s} ${cy} Z`;

  // Iris (circle with slight wobble)
  const irisR = 12 * s;
  const iK = irisR * 0.56;
  const irisD = 
    `M ${cx} ${cy - irisR} ` +
    `C ${cx + iK + 0.5} ${cy - irisR}, ${cx + irisR} ${cy - iK - 0.5}, ${cx + irisR} ${cy} ` +
    `C ${cx + irisR} ${cy + iK + 0.5}, ${cx + iK - 0.5} ${cy + irisR}, ${cx} ${cy + irisR} ` +
    `C ${cx - iK - 0.5} ${cy + irisR}, ${cx - irisR} ${cy + iK - 0.5}, ${cx - irisR} ${cy} ` +
    `C ${cx - irisR} ${cy - iK + 0.5}, ${cx - iK + 0.5} ${cy - irisR}, ${cx} ${cy - irisR} Z`;

  // Pupil (smaller circle)
  const pupilR = 4 * s;
  const pK = pupilR * 0.56;
  const pupilD = 
    `M ${cx} ${cy - pupilR} ` +
    `C ${cx + pK} ${cy - pupilR}, ${cx + pupilR} ${cy - pK}, ${cx + pupilR} ${cy} ` +
    `C ${cx + pupilR} ${cy + pK}, ${cx + pK} ${cy + pupilR}, ${cx} ${cy + pupilR} ` +
    `C ${cx - pK} ${cy + pupilR}, ${cx - pupilR} ${cy + pK}, ${cx - pupilR} ${cy} ` +
    `C ${cx - pupilR} ${cy - pK}, ${cx - pK} ${cy - pupilR}, ${cx} ${cy - pupilR} Z`;

  // Detection waves/signals (three concentric arcs)
  const wave1D = 
    `M ${cx + 45 * s} ${cy - 15 * s} ` +
    `C ${cx + 55 * s} ${cy - 8 * s}, ${cx + 55 * s} ${cy + 8 * s}, ${cx + 45 * s} ${cy + 15 * s}`;
  
  const wave2D = 
    `M ${cx + 52 * s} ${cy - 20 * s} ` +
    `C ${cx + 65 * s} ${cy - 10 * s}, ${cx + 65 * s} ${cy + 10 * s}, ${cx + 52 * s} ${cy + 20 * s}`;
  
  const wave3D = 
    `M ${cx + 59 * s} ${cy - 25 * s} ` +
    `C ${cx + 75 * s} ${cy - 12 * s}, ${cx + 75 * s} ${cy + 12 * s}, ${cx + 59 * s} ${cy + 25 * s}`;

  const wavesD = `${wave1D} ${wave2D} ${wave3D}`;

  return (
    <g>
      <AnimatedPath 
        d={eyeD} 
        startFrame={startFrame} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2.5} 
        fill={COLORS.white} 
        fillOpacity={0.9} 
      />
      <AnimatedPath 
        d={irisD} 
        startFrame={startFrame + dur4} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={2} 
        fill={color} 
        fillOpacity={0.7} 
      />
      <AnimatedPath 
        d={pupilD} 
        startFrame={startFrame + dur4 * 2} 
        drawDuration={dur4} 
        stroke={COLORS.outline} 
        strokeWidth={1.5} 
        fill={COLORS.outline} 
      />
      <AnimatedPath 
        d={wavesD} 
        startFrame={startFrame + dur4 * 3} 
        drawDuration={dur4} 
        stroke={color} 
        strokeWidth={2} 
        fill="none" 
      />
    </g>
  );
};
