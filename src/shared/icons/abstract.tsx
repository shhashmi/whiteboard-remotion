import React from 'react';
import { AnimatedPath, HandWrittenText, COLORS } from '../components';

// ─── BrainIcon ────────────────────────────────────────────────────────────────
interface BrainIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const BrainIcon: React.FC<BrainIconProps> = ({ cx, cy, scale = 1, startFrame, drawDuration }) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  const blobD =
    `M ${cx} ${cy - 35 * s} ` +
    `C ${cx + 15 * s} ${cy - 55 * s}, ${cx + 42 * s} ${cy - 48 * s}, ${cx + 45 * s} ${cy - 18 * s} ` +
    `C ${cx + 55 * s} ${cy + 2 * s}, ${cx + 38 * s} ${cy + 32 * s}, ${cx + 12 * s} ${cy + 38 * s} ` +
    `C ${cx + 2 * s} ${cy + 52 * s}, ${cx - 28 * s} ${cy + 50 * s}, ${cx - 40 * s} ${cy + 28 * s} ` +
    `C ${cx - 58 * s} ${cy + 10 * s}, ${cx - 52 * s} ${cy - 28 * s}, ${cx - 32 * s} ${cy - 38 * s} ` +
    `C ${cx - 18 * s} ${cy - 52 * s}, ${cx - 8 * s} ${cy - 55 * s}, ${cx} ${cy - 35 * s} Z`;

  const wrinkle1 =
    `M ${cx - 20 * s} ${cy - 12 * s} C ${cx - 10 * s} ${cy - 22 * s}, ${cx + 10 * s} ${cy - 18 * s}, ${cx + 22 * s} ${cy - 8 * s}`;
  const wrinkle2 =
    `M ${cx - 25 * s} ${cy + 8 * s} C ${cx - 15 * s} ${cy - 2 * s}, ${cx + 5 * s} ${cy + 2 * s}, ${cx + 20 * s} ${cy + 12 * s}`;
  const wrinkle3 =
    `M ${cx - 10 * s} ${cy + 22 * s} C ${cx} ${cy + 12 * s}, ${cx + 15 * s} ${cy + 18 * s}, ${cx + 22 * s} ${cy + 28 * s}`;

  return (
    <g>
      <AnimatedPath d={blobD} startFrame={startFrame} drawDuration={dur4 * 2} stroke={COLORS.outline} strokeWidth={2.5} fill={COLORS.yellow} fillOpacity={0.7} />
      <AnimatedPath d={wrinkle1} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} />
      <AnimatedPath d={wrinkle2} startFrame={startFrame + dur4 * 2 + dur4 / 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} />
      <AnimatedPath d={wrinkle3} startFrame={startFrame + dur4 * 2 + dur4 * 2 / 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={1.5} />
    </g>
  );
};

// ─── TargetIcon ───────────────────────────────────────────────────────────────
interface TargetIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const TargetIcon: React.FC<TargetIconProps> = ({ cx, cy, scale = 1, startFrame, drawDuration }) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  const makeCircle = (r: number) => {
    const k = r * 0.56;
    return (
      `M ${cx} ${cy - r} C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} ` +
      `C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} ` +
      `C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} ` +
      `C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`
    );
  };

  const outer = makeCircle(28 * s);
  const middle = makeCircle(18 * s);
  const inner = makeCircle(8 * s);

  const arrowD = `M ${cx + 38 * s} ${cy} L ${cx + 2 * s} ${cy}`;
  const angle = Math.PI;
  const headLen = 10 * s;
  const a1 = angle + Math.PI * 0.8;
  const a2 = angle - Math.PI * 0.8;
  const arrowHeadD = `M ${cx + 2 * s + headLen * Math.cos(a1)} ${cy + headLen * Math.sin(a1)} L ${cx + 2 * s} ${cy} L ${cx + 2 * s + headLen * Math.cos(a2)} ${cy + headLen * Math.sin(a2)}`;

  return (
    <g>
      <AnimatedPath d={outer} startFrame={startFrame} drawDuration={dur4} stroke="#ef4444" strokeWidth={2.5} fill="#fee2e2" fillOpacity={0.5} />
      <AnimatedPath d={middle} startFrame={startFrame + dur4} drawDuration={dur4} stroke="#dc2626" strokeWidth={2.5} fill="#fca5a5" fillOpacity={0.5} />
      <AnimatedPath d={inner} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke="#b91c1c" strokeWidth={2} fill="#ef4444" fillOpacity={0.9} />
      <AnimatedPath d={arrowD} startFrame={startFrame + dur4 * 3} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={arrowHeadD} startFrame={startFrame + dur4 * 3 + dur4 / 2} drawDuration={dur4 / 2} stroke={COLORS.outline} strokeWidth={2.5} />
    </g>
  );
};

// ─── BookIcon ─────────────────────────────────────────────────────────────────
interface BookIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
  label?: string;
}

export const BookIcon: React.FC<BookIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue, label,
}) => {
  const w = 60 * scale, h = 75 * scale;
  const x = cx - w / 2, y = cy - h / 2;
  const spineW = 10 * scale;

  const coverD = `M ${x + spineW} ${y + 2} L ${x + w - 1} ${y - 2} L ${x + w + 2} ${y + h + 1} L ${x + spineW - 1} ${y + h - 2} Z`;
  const spineD = `M ${x + 2} ${y + 4} L ${x + spineW} ${y + 2} L ${x + spineW - 1} ${y + h - 2} L ${x + 1} ${y + h + 3} Z`;
  const line1D = `M ${x + spineW + 8 * scale} ${y + 22 * scale} L ${x + w - 8 * scale} ${y + 22 * scale}`;
  const line2D = `M ${x + spineW + 8 * scale} ${y + 32 * scale} L ${x + w - 8 * scale} ${y + 32 * scale}`;
  const line3D = `M ${x + spineW + 8 * scale} ${y + 42 * scale} L ${x + w - 12 * scale} ${y + 42 * scale}`;

  const third = Math.floor(drawDuration / 5);

  return (
    <g>
      <AnimatedPath d={coverD} startFrame={startFrame} drawDuration={third * 2} stroke={COLORS.outline} fill={color} fillOpacity={0.3} />
      <AnimatedPath d={spineD} startFrame={startFrame} drawDuration={third * 2} stroke={COLORS.outline} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={line1D} startFrame={startFrame + third} drawDuration={third} stroke={COLORS.outline} strokeWidth={1.5} />
      <AnimatedPath d={line2D} startFrame={startFrame + third * 2} drawDuration={third} stroke={COLORS.outline} strokeWidth={1.5} />
      <AnimatedPath d={line3D} startFrame={startFrame + third * 3} drawDuration={third} stroke={COLORS.outline} strokeWidth={1.5} />
      {label && (
        <HandWrittenText
          text={label}
          x={cx + spineW / 2}
          y={cy - 4}
          startFrame={startFrame + third * 2}
          durationFrames={drawDuration - third * 2}
          fontSize={10 * scale}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
    </g>
  );
};

// ─── Lightbulb ────────────────────────────────────────────────────────────────
interface LightbulbProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const Lightbulb: React.FC<LightbulbProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration,
}) => {
  const r = 22 * scale;
  const third = Math.floor(drawDuration / 4);

  const bulbD = `M ${cx - r} ${cy} C ${cx - r} ${cy - r}, ${cx + r} ${cy - r}, ${cx + r} ${cy} C ${cx + r} ${cy + r * 0.6}, ${cx + r * 0.5} ${cy + r * 0.9}, ${cx + r * 0.3} ${cy + r} L ${cx - r * 0.3} ${cy + r} C ${cx - r * 0.5} ${cy + r * 0.9}, ${cx - r} ${cy + r * 0.6}, ${cx - r} ${cy} Z`;
  const base1D = `M ${cx - r * 0.35} ${cy + r} L ${cx - r * 0.35} ${cy + r * 1.3} L ${cx + r * 0.35} ${cy + r * 1.3} L ${cx + r * 0.35} ${cy + r}`;
  const base2D = `M ${cx - r * 0.3} ${cy + r * 1.3} L ${cx - r * 0.3} ${cy + r * 1.55} L ${cx + r * 0.3} ${cy + r * 1.55} L ${cx + r * 0.3} ${cy + r * 1.3}`;

  const rays: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
    const r1 = r + 6 * scale, r2 = r + 14 * scale;
    if (angle > Math.PI * 0.25 && angle < Math.PI * 0.75) continue;
    rays.push(`M ${cx + r1 * Math.cos(angle)} ${cy + r1 * Math.sin(angle)} L ${cx + r2 * Math.cos(angle)} ${cy + r2 * Math.sin(angle)}`);
  }

  return (
    <g>
      <AnimatedPath d={bulbD} startFrame={startFrame} drawDuration={third * 2} stroke={COLORS.outline} fill={COLORS.yellow} fillOpacity={0.7} />
      <AnimatedPath d={base1D} startFrame={startFrame + third} drawDuration={third} stroke={COLORS.outline} strokeWidth={2} fill="#999" fillOpacity={0.5} />
      <AnimatedPath d={base2D} startFrame={startFrame + third * 2} drawDuration={third / 2} stroke={COLORS.outline} strokeWidth={2} fill="#999" fillOpacity={0.5} />
      {rays.map((rd, i) => (
        <AnimatedPath key={i} d={rd} startFrame={startFrame + third * 2 + i * 3} drawDuration={8} stroke={COLORS.gold} strokeWidth={2} />
      ))}
    </g>
  );
};

// ─── ClockIcon ────────────────────────────────────────────────────────────────
interface ClockIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const ClockIcon: React.FC<ClockIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration,
}) => {
  const r = 30 * scale;
  const k = r * 0.56;
  const third = Math.floor(drawDuration / 3);

  const outerD = `M ${cx} ${cy - r} C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  const innerR = r - 3 * scale;
  const innerK = innerR * 0.56;
  const innerD = `M ${cx} ${cy - innerR} C ${cx + innerK} ${cy - innerR}, ${cx + innerR} ${cy - innerK}, ${cx + innerR} ${cy} C ${cx + innerR} ${cy + innerK}, ${cx + innerK} ${cy + innerR}, ${cx} ${cy + innerR} C ${cx - innerK} ${cy + innerR}, ${cx - innerR} ${cy + innerK}, ${cx - innerR} ${cy} C ${cx - innerR} ${cy - innerK}, ${cx - innerK} ${cy - innerR}, ${cx} ${cy - innerR} Z`;

  const hourD = `M ${cx} ${cy} L ${cx - 10 * scale} ${cy - 18 * scale}`;
  const minuteD = `M ${cx} ${cy} L ${cx + 16 * scale} ${cy - 10 * scale}`;
  const dotR = 3 * scale;
  const dotK = dotR * 0.56;
  const dotD = `M ${cx} ${cy - dotR} C ${cx + dotK} ${cy - dotR}, ${cx + dotR} ${cy - dotK}, ${cx + dotR} ${cy} C ${cx + dotR} ${cy + dotK}, ${cx + dotK} ${cy + dotR}, ${cx} ${cy + dotR} C ${cx - dotK} ${cy + dotR}, ${cx - dotR} ${cy + dotK}, ${cx - dotR} ${cy} C ${cx - dotR} ${cy - dotK}, ${cx - dotK} ${cy - dotR}, ${cx} ${cy - dotR} Z`;

  return (
    <g>
      <AnimatedPath d={outerD} startFrame={startFrame} drawDuration={third} stroke={COLORS.green} strokeWidth={3 * scale} fill={COLORS.green} fillOpacity={0.1} />
      <AnimatedPath d={innerD} startFrame={startFrame} drawDuration={third} stroke="none" fill={COLORS.yellow} fillOpacity={0.4} />
      <AnimatedPath d={hourD} startFrame={startFrame + third} drawDuration={third / 2} stroke={COLORS.outline} strokeWidth={3 * scale} />
      <AnimatedPath d={minuteD} startFrame={startFrame + third + third / 3} drawDuration={third / 2} stroke={COLORS.outline} strokeWidth={2 * scale} />
      <AnimatedPath d={dotD} startFrame={startFrame + third * 2} drawDuration={third / 2} stroke={COLORS.outline} fill={COLORS.outline} fillOpacity={1} />
    </g>
  );
};

// ─── SpeechBubble ─────────────────────────────────────────────────────────────
interface SpeechBubbleProps {
  cx: number;
  cy: number;
  width: number;
  height: number;
  startFrame: number;
  drawDuration: number;
  fill?: string;
  text?: string;
  text2?: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  cx, cy, width, height, startFrame, drawDuration, fill = COLORS.purple, text, text2,
}) => {
  const x = cx - width / 2, y = cy - height / 2;
  const r = 10;

  const bubbleD = `M ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${y + height - r} Q ${x + width} ${y + height} ${x + width - r} ${y + height} L ${cx + 8} ${y + height} L ${cx} ${y + height + 14} L ${cx - 8} ${y + height} L ${x + r} ${y + height} Q ${x} ${y + height} ${x} ${y + height - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

  return (
    <g>
      <AnimatedPath d={bubbleD} startFrame={startFrame} drawDuration={drawDuration} stroke={fill} strokeWidth={2} fill={fill} fillOpacity={0.15} />
      {text && (
        <HandWrittenText
          text={text}
          x={cx}
          y={cy - 6}
          startFrame={startFrame + drawDuration}
          durationFrames={25}
          fontSize={14}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {text2 && (
        <HandWrittenText
          text={text2}
          x={cx}
          y={cy + 12}
          startFrame={startFrame + drawDuration + 10}
          durationFrames={25}
          fontSize={14}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
    </g>
  );
};

// ─── LockIcon ─────────────────────────────────────────────────────────────────
interface LockIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const LockIcon: React.FC<LockIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);
  const bw = 36 * s, bh = 30 * s;
  const bx = cx - bw / 2, by = cy - bh / 2 + 8 * s;

  const bodyD =
    `M ${bx + 2} ${by + 1} L ${bx + bw - 1} ${by - 1} ` +
    `L ${bx + bw + 1} ${by + bh + 1} L ${bx - 1} ${by + bh - 1} Z`;

  const shackleD =
    `M ${cx - 12 * s} ${by} ` +
    `L ${cx - 12 * s} ${by - 14 * s} ` +
    `C ${cx - 12 * s} ${by - 28 * s}, ${cx + 12 * s} ${by - 28 * s}, ${cx + 12 * s} ${by - 14 * s} ` +
    `L ${cx + 12 * s} ${by}`;

  const holeR = 5 * s, holeK = holeR * 0.56;
  const holeCY = by + bh * 0.38;
  const holeD = `M ${cx} ${holeCY - holeR} C ${cx + holeK} ${holeCY - holeR}, ${cx + holeR} ${holeCY - holeK}, ${cx + holeR} ${holeCY} C ${cx + holeR} ${holeCY + holeK}, ${cx + holeK} ${holeCY + holeR}, ${cx} ${holeCY + holeR} C ${cx - holeK} ${holeCY + holeR}, ${cx - holeR} ${holeCY + holeK}, ${cx - holeR} ${holeCY} C ${cx - holeR} ${holeCY - holeK}, ${cx - holeK} ${holeCY - holeR}, ${cx} ${holeCY - holeR} Z`;

  return (
    <g>
      <AnimatedPath d={shackleD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={3 * s} />
      <AnimatedPath d={bodyD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={holeD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.outline} fill={COLORS.outline} fillOpacity={0.8} />
    </g>
  );
};

// ─── ShieldIcon ───────────────────────────────────────────────────────────────
interface ShieldIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ShieldIcon: React.FC<ShieldIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  const shieldD =
    `M ${cx} ${cy - 40 * s} ` +
    `L ${cx + 32 * s} ${cy - 25 * s} ` +
    `L ${cx + 32 * s} ${cy + 5 * s} ` +
    `C ${cx + 30 * s} ${cy + 28 * s}, ${cx + 8 * s} ${cy + 40 * s}, ${cx} ${cy + 45 * s} ` +
    `C ${cx - 8 * s} ${cy + 40 * s}, ${cx - 30 * s} ${cy + 28 * s}, ${cx - 32 * s} ${cy + 5 * s} ` +
    `L ${cx - 32 * s} ${cy - 25 * s} Z`;

  const checkD = `M ${cx - 12 * s} ${cy} L ${cx - 3 * s} ${cy + 10 * s} L ${cx + 14 * s} ${cy - 10 * s}`;

  return (
    <g>
      <AnimatedPath d={shieldD} startFrame={startFrame} drawDuration={dur3 * 2} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.25} />
      <AnimatedPath d={checkD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.green} strokeWidth={3 * s} />
    </g>
  );
};

// ─── MagnifyingGlass ──────────────────────────────────────────────────────────
interface MagnifyingGlassProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MagnifyingGlass: React.FC<MagnifyingGlassProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);
  const r = 22 * s;
  const k = r * 0.56;
  const glassCY = cy - 8 * s;

  const lensD = `M ${glassCY > 0 ? cx : cx} ${glassCY - r} C ${cx + k} ${glassCY - r}, ${cx + r} ${glassCY - k}, ${cx + r} ${glassCY} C ${cx + r} ${glassCY + k}, ${cx + k} ${glassCY + r}, ${cx} ${glassCY + r} C ${cx - k} ${glassCY + r}, ${cx - r} ${glassCY + k}, ${cx - r} ${glassCY} C ${cx - r} ${glassCY - k}, ${cx - k} ${glassCY - r}, ${cx} ${glassCY - r} Z`;

  const handleAngle = Math.PI * 0.25;
  const hx1 = cx + r * Math.cos(handleAngle);
  const hy1 = glassCY + r * Math.sin(handleAngle);
  const hLen = 22 * s;
  const hx2 = hx1 + hLen * Math.cos(handleAngle);
  const hy2 = hy1 + hLen * Math.sin(handleAngle);
  const handleD = `M ${hx1} ${hy1} L ${hx2} ${hy2}`;

  return (
    <g>
      <AnimatedPath d={lensD} startFrame={startFrame} drawDuration={dur3 * 2} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.1} />
      <AnimatedPath d={handleD} startFrame={startFrame + dur3 * 2} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={4 * s} />
    </g>
  );
};

// ─── WarningTriangle ──────────────────────────────────────────────────────────
interface WarningTriangleProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const WarningTriangle: React.FC<WarningTriangleProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);

  const triD =
    `M ${cx + 1} ${cy - 35 * s} ` +
    `L ${cx + 38 * s} ${cy + 28 * s} ` +
    `L ${cx - 38 * s} ${cy + 28 * s} Z`;

  const exclamD = `M ${cx} ${cy - 12 * s} L ${cx} ${cy + 8 * s}`;
  const dotR = 3 * s, dotK = dotR * 0.56;
  const dotCY = cy + 18 * s;
  const dotD = `M ${cx} ${dotCY - dotR} C ${cx + dotK} ${dotCY - dotR}, ${cx + dotR} ${dotCY - dotK}, ${cx + dotR} ${dotCY} C ${cx + dotR} ${dotCY + dotK}, ${cx + dotK} ${dotCY + dotR}, ${cx} ${dotCY + dotR} C ${cx - dotK} ${dotCY + dotR}, ${cx - dotR} ${dotCY + dotK}, ${cx - dotR} ${dotCY} C ${cx - dotR} ${dotCY - dotK}, ${cx - dotK} ${dotCY - dotR}, ${cx} ${dotCY - dotR} Z`;

  return (
    <g>
      <AnimatedPath d={triD} startFrame={startFrame} drawDuration={dur3 * 2} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.5} />
      <AnimatedPath d={exclamD} startFrame={startFrame + dur3 * 2} drawDuration={dur3 / 2} stroke={COLORS.outline} strokeWidth={3 * s} />
      <AnimatedPath d={dotD} startFrame={startFrame + dur3 * 2 + dur3 / 2} drawDuration={dur3 / 2} stroke={COLORS.outline} fill={COLORS.outline} fillOpacity={1} />
    </g>
  );
};

// ─── PuzzlePiece ──────────────────────────────────────────────────────────────
interface PuzzlePieceProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.purple,
}) => {
  const s = scale;

  const pieceD =
    `M ${cx - 25 * s} ${cy - 25 * s} ` +
    `L ${cx - 5 * s} ${cy - 25 * s} ` +
    `C ${cx - 5 * s} ${cy - 38 * s}, ${cx + 5 * s} ${cy - 38 * s}, ${cx + 5 * s} ${cy - 25 * s} ` +
    `L ${cx + 25 * s} ${cy - 25 * s} ` +
    `L ${cx + 25 * s} ${cy - 5 * s} ` +
    `C ${cx + 38 * s} ${cy - 5 * s}, ${cx + 38 * s} ${cy + 5 * s}, ${cx + 25 * s} ${cy + 5 * s} ` +
    `L ${cx + 25 * s} ${cy + 25 * s} ` +
    `L ${cx + 5 * s} ${cy + 25 * s} ` +
    `C ${cx + 5 * s} ${cy + 38 * s}, ${cx - 5 * s} ${cy + 38 * s}, ${cx - 5 * s} ${cy + 25 * s} ` +
    `L ${cx - 25 * s} ${cy + 25 * s} ` +
    `L ${cx - 25 * s} ${cy + 5 * s} ` +
    `C ${cx - 38 * s} ${cy + 5 * s}, ${cx - 38 * s} ${cy - 5 * s}, ${cx - 25 * s} ${cy - 5 * s} Z`;

  return (
    <AnimatedPath d={pieceD} startFrame={startFrame} drawDuration={drawDuration} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.3} />
  );
};

// ─── StarIcon ─────────────────────────────────────────────────────────────────
interface StarIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const StarIcon: React.FC<StarIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow,
}) => {
  const s = scale;
  const outerR = 28 * s, innerR = 12 * s;
  const points = 5;

  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    d += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
  }
  d += 'Z';

  return (
    <AnimatedPath d={d} startFrame={startFrame} drawDuration={drawDuration} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.6} />
  );
};

// ─── FlagIcon ─────────────────────────────────────────────────────────────────
interface FlagIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.red,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);
  const poleX = cx - 18 * s;

  const poleD = `M ${poleX} ${cy - 38 * s} L ${poleX} ${cy + 38 * s}`;
  const flagD =
    `M ${poleX} ${cy - 38 * s} ` +
    `L ${poleX + 42 * s} ${cy - 25 * s} ` +
    `L ${poleX} ${cy - 10 * s}`;

  return (
    <g>
      <AnimatedPath d={poleD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2.5 * s} />
      <AnimatedPath d={flagD} startFrame={startFrame + dur3} drawDuration={dur3 * 2} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.5} />
    </g>
  );
};

// ─── MirrorIcon ───────────────────────────────────────────────────────────────
interface MirrorIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const MirrorIcon: React.FC<MirrorIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur3 = Math.floor(drawDuration / 3);
  const r = 26 * s;
  const k = r * 0.56;

  const mirrorD = `M ${cx} ${cy - r} C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  const handleD = `M ${cx} ${cy + r} L ${cx} ${cy + r + 22 * s}`;
  const baseD = `M ${cx - 14 * s} ${cy + r + 22 * s} L ${cx + 14 * s} ${cy + r + 22 * s}`;

  const shineD = `M ${cx - 8 * s} ${cy - 12 * s} C ${cx - 2 * s} ${cy - 18 * s}, ${cx + 6 * s} ${cy - 14 * s}, ${cx + 4 * s} ${cy - 6 * s}`;

  return (
    <g>
      <AnimatedPath d={mirrorD} startFrame={startFrame} drawDuration={dur3 * 2} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.15} />
      <AnimatedPath d={shineD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={COLORS.white} strokeWidth={2 * s} />
      <AnimatedPath d={handleD} startFrame={startFrame + dur3 * 2} drawDuration={dur3 / 2} stroke={COLORS.outline} strokeWidth={3 * s} />
      <AnimatedPath d={baseD} startFrame={startFrame + dur3 * 2 + dur3 / 2} drawDuration={dur3 / 2} stroke={COLORS.outline} strokeWidth={3 * s} />
    </g>
  );
};

// ─── NumberBadge ──────────────────────────────────────────────────────────────
interface NumberBadgeProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  number: number;
  color?: string;
}

export const NumberBadge: React.FC<NumberBadgeProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, number, color = COLORS.blue,
}) => {
  const s = scale;
  const r = 18 * s;
  const k = r * 0.56;
  const dur2 = Math.floor(drawDuration / 2);

  const circleD = `M ${cx} ${cy - r} C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy} C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r} C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy} C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r} Z`;

  return (
    <g>
      <AnimatedPath d={circleD} startFrame={startFrame} drawDuration={dur2} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.2} />
      <HandWrittenText
        text={String(number)}
        x={cx}
        y={cy + 6 * s}
        startFrame={startFrame + dur2}
        durationFrames={dur2}
        fontSize={20 * s}
        fill={color}
        fontWeight={700}
        textAnchor="middle"
      />
    </g>
  );
};
