import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';

// ─── Color Palette ───────────────────────────────────────────────────────────
export const COLORS = {
  outline: '#1a1a2e',
  red: '#e85d3a',
  blue: '#4a9cc4',
  green: '#6db356',
  yellow: '#ffd700',
  gold: '#d4a017',
  purple: '#9b59b6',
  skin: '#f5d0a9',
  hair: '#5a3825',
  white: '#ffffff',
  orange: '#f5a623',
};

// ─── AnimatedPath ─────────────────────────────────────────────────────────────
interface AnimatedPathProps {
  d: string;
  startFrame: number;
  drawDuration: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
}

export const AnimatedPath: React.FC<AnimatedPathProps> = ({
  d,
  startFrame,
  drawDuration,
  stroke = COLORS.outline,
  strokeWidth = 2.5,
  fill = 'none',
  fillOpacity = 1,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
}) => {
  const frame = useCurrentFrame();

  const strokeProgress = interpolate(frame, [startFrame, startFrame + drawDuration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const resolvedFillOpacity =
    fill === 'none'
      ? 0
      : interpolate(
          frame,
          [startFrame + drawDuration, startFrame + drawDuration + 10],
          [0, fillOpacity],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      fillOpacity={resolvedFillOpacity}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={strokeProgress}
    />
  );
};

// ─── HandWrittenText ──────────────────────────────────────────────────────────
interface HandWrittenTextProps {
  text: string;
  x: number;
  y: number;
  startFrame: number;
  endFrame: number;
  fontSize?: number;
  fill?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  textAnchor?: 'start' | 'middle' | 'end';
}

export const HandWrittenText: React.FC<HandWrittenTextProps> = ({
  text,
  x,
  y,
  startFrame,
  endFrame,
  fontSize = 32,
  fill = COLORS.outline,
  fontFamily = 'Caveat, cursive',
  fontWeight = 700,
  textAnchor = 'middle',
}) => {
  const frame = useCurrentFrame();
  const charCount = Math.floor(
    interpolate(frame, [startFrame, endFrame], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const visibleText = text.slice(0, charCount);

  return (
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      fill={fill}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      textAnchor={textAnchor}
      dominantBaseline="auto"
    >
      {visibleText}
    </text>
  );
};

// ─── SketchBox ────────────────────────────────────────────────────────────────
interface SketchBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  startFrame: number;
  drawDuration: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
}

export const SketchBox: React.FC<SketchBoxProps> = ({
  x,
  y,
  width,
  height,
  startFrame,
  drawDuration,
  stroke = COLORS.outline,
  strokeWidth = 2.5,
  fill = 'none',
  fillOpacity = 0.15,
}) => {
  // Slightly wobbly corners
  const x1 = x + 2, y1 = y + 3;
  const x2 = x + width - 1, y2 = y - 2;
  const x3 = x + width + 2, y3 = y + height + 1;
  const x4 = x - 1, y4 = y + height - 2;

  const d = `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;

  return (
    <AnimatedPath
      d={d}
      startFrame={startFrame}
      drawDuration={drawDuration}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      fillOpacity={fillOpacity}
    />
  );
};

// ─── SketchCircle ─────────────────────────────────────────────────────────────
interface SketchCircleProps {
  cx: number;
  cy: number;
  r: number;
  startFrame: number;
  drawDuration: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
}

export const SketchCircle: React.FC<SketchCircleProps> = ({
  cx,
  cy,
  r,
  startFrame,
  drawDuration,
  stroke = COLORS.outline,
  strokeWidth = 2.5,
  fill = 'none',
  fillOpacity = 1,
}) => {
  // Approximate circle with slightly imperfect bezier curves
  const k = r * 0.56; // bezier approximation constant
  const d = `
    M ${cx} ${cy - r + 2}
    C ${cx + k} ${cy - r - 1}, ${cx + r + 2} ${cy - k}, ${cx + r - 1} ${cy}
    C ${cx + r + 3} ${cy + k}, ${cx + k} ${cy + r + 2}, ${cx} ${cy + r - 1}
    C ${cx - k} ${cy + r + 3}, ${cx - r - 2} ${cy + k}, ${cx - r + 1} ${cy}
    C ${cx - r - 1} ${cy - k}, ${cx - k} ${cy - r + 1}, ${cx} ${cy - r + 2}
    Z
  `;

  return (
    <AnimatedPath
      d={d}
      startFrame={startFrame}
      drawDuration={drawDuration}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      fillOpacity={fillOpacity}
    />
  );
};

// ─── SketchArrow ──────────────────────────────────────────────────────────────
interface SketchArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  startFrame: number;
  drawDuration: number;
  stroke?: string;
  strokeWidth?: number;
  headSize?: number;
}

export const SketchArrow: React.FC<SketchArrowProps> = ({
  x1,
  y1,
  x2,
  y2,
  startFrame,
  drawDuration,
  stroke = COLORS.blue,
  strokeWidth = 3,
  headSize = 12,
}) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a1 = angle + Math.PI * 0.8;
  const a2 = angle - Math.PI * 0.8;

  const hx1 = x2 + headSize * Math.cos(a1);
  const hy1 = y2 + headSize * Math.sin(a1);
  const hx2 = x2 + headSize * Math.cos(a2);
  const hy2 = y2 + headSize * Math.sin(a2);

  const d = `M ${x1} ${y1} L ${x2} ${y2} M ${hx1} ${hy1} L ${x2} ${y2} L ${hx2} ${hy2}`;

  return (
    <AnimatedPath
      d={d}
      startFrame={startFrame}
      drawDuration={drawDuration}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
interface SceneProps {
  startFrame: number;
  endFrame: number;
  children: React.ReactNode;
}

export const Scene: React.FC<SceneProps> = ({ startFrame, endFrame, children }) => {
  const frame = useCurrentFrame();

  if (frame < startFrame - 10 || frame > endFrame + 10) return null;

  const opacity = interpolate(
    frame,
    [startFrame - 10, startFrame, endFrame, endFrame + 10],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── FadeIn ───────────────────────────────────────────────────────────────────
interface FadeInProps {
  startFrame: number;
  duration?: number;
  translateY?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  startFrame,
  duration = 20,
  translateY = 10,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ty = interpolate(frame, [startFrame, startFrame + duration], [translateY, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity, transform: `translateY(${ty}px)`, ...style }}>
      {children}
    </div>
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
  cx,
  cy,
  scale = 1,
  startFrame,
  drawDuration,
  color = COLORS.blue,
  label,
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
          endFrame={startFrame + drawDuration}
          fontSize={10 * scale}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
    </g>
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

  // Play button triangle
  const tx = cx - 6 * scale, ty = cy;
  const playD = `M ${tx} ${ty - 10 * scale} L ${tx + 16 * scale} ${ty} L ${tx} ${ty + 10 * scale} Z`;

  // Progress bar
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

// ─── PersonIcon ───────────────────────────────────────────────────────────────
interface PersonIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  shirtColor?: string;
}

export const PersonIcon: React.FC<PersonIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, shirtColor = COLORS.blue,
}) => {
  const headR = 18 * scale;
  const bodyTop = cy - headR - 2;
  const third = Math.floor(drawDuration / 4);

  // Head
  const headK = headR * 0.56;
  const headD = `M ${cx} ${cy - headR - 45 * scale + 2} C ${cx + headK} ${cy - headR - 45 * scale - 1}, ${cx + headR + 2} ${cy - 45 * scale - headK}, ${cx + headR - 1} ${cy - 45 * scale} C ${cx + headR + 3} ${cy - 45 * scale + headK}, ${cx + headK} ${cy - 45 * scale + headR + 2}, ${cx} ${cy - 45 * scale + headR - 1} C ${cx - headK} ${cy - 45 * scale + headR + 3}, ${cx - headR - 2} ${cy - 45 * scale + headK}, ${cx - headR + 1} ${cy - 45 * scale} C ${cx - headR - 1} ${cy - 45 * scale - headK}, ${cx - headK} ${cy - headR - 45 * scale + 1}, ${cx} ${cy - headR - 45 * scale + 2} Z`;

  const headCY = cy - 45 * scale;

  // Hair
  const hairD = `M ${cx - headR + 2} ${headCY - 4 * scale} C ${cx - headR} ${headCY - headR - 4 * scale}, ${cx + headR} ${headCY - headR - 4 * scale}, ${cx + headR - 2} ${headCY - 4 * scale}`;

  // Body/shirt
  const bodyY = headCY + headR;
  const bodyD = `M ${cx - 20 * scale} ${bodyY} L ${cx - 24 * scale} ${bodyY + 50 * scale} L ${cx + 24 * scale} ${bodyY + 50 * scale} L ${cx + 20 * scale} ${bodyY} Z`;

  // Pointing arm
  const armD = `M ${cx + 20 * scale} ${bodyY + 15 * scale} L ${cx + 50 * scale} ${bodyY + 5 * scale}`;
  const handD = `M ${cx + 50 * scale} ${bodyY + 5 * scale} L ${cx + 56 * scale} ${bodyY + 2 * scale}`;

  return (
    <g>
      <AnimatedPath d={headD} startFrame={startFrame} drawDuration={third} stroke={COLORS.outline} fill={COLORS.skin} fillOpacity={0.9} />
      <AnimatedPath d={hairD} startFrame={startFrame + third / 2} drawDuration={third / 2} stroke={COLORS.hair} strokeWidth={4 * scale} fill="none" />
      <AnimatedPath d={bodyD} startFrame={startFrame + third} drawDuration={third} stroke={COLORS.outline} fill={shirtColor} fillOpacity={0.8} />
      <AnimatedPath d={armD} startFrame={startFrame + third * 2} drawDuration={third / 2} stroke={COLORS.outline} strokeWidth={3 * scale} />
      <AnimatedPath d={handD} startFrame={startFrame + third * 2 + third / 2} drawDuration={third / 2} stroke={COLORS.outline} strokeWidth={2.5 * scale} />
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

  // Bulb outline (top rounded, bottom flat with base)
  const bulbD = `M ${cx - r} ${cy} C ${cx - r} ${cy - r}, ${cx + r} ${cy - r}, ${cx + r} ${cy} C ${cx + r} ${cy + r * 0.6}, ${cx + r * 0.5} ${cy + r * 0.9}, ${cx + r * 0.3} ${cy + r} L ${cx - r * 0.3} ${cy + r} C ${cx - r * 0.5} ${cy + r * 0.9}, ${cx - r} ${cy + r * 0.6}, ${cx - r} ${cy} Z`;

  // Base (filament holder)
  const base1D = `M ${cx - r * 0.35} ${cy + r} L ${cx - r * 0.35} ${cy + r * 1.3} L ${cx + r * 0.35} ${cy + r * 1.3} L ${cx + r * 0.35} ${cy + r}`;
  const base2D = `M ${cx - r * 0.3} ${cy + r * 1.3} L ${cx - r * 0.3} ${cy + r * 1.55} L ${cx + r * 0.3} ${cy + r * 1.55} L ${cx + r * 0.3} ${cy + r * 1.3}`;

  // Rays
  const rays: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
    const r1 = r + 6 * scale, r2 = r + 14 * scale;
    // Only top rays (skip bottom ones where base is)
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
  const innerR = 20 * scale;
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

  // Center hole
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
          endFrame={startFrame + drawDuration + 25}
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
          endFrame={startFrame + drawDuration + 35}
          fontSize={14}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
    </g>
  );
};

// ─── BarChart ─────────────────────────────────────────────────────────────────
interface BarChartProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration,
}) => {
  const w = 120 * scale, h = 90 * scale;
  const x = cx - w / 2, y = cy - h / 2;
  const bars = [
    { height: 40 * scale, color: COLORS.blue },
    { height: 55 * scale, color: COLORS.green },
    { height: 48 * scale, color: COLORS.red },
    { height: 70 * scale, color: COLORS.orange },
  ];
  const barW = 20 * scale;
  const gap = 8 * scale;
  const axisD = `M ${x} ${y + h} L ${x + w} ${y + h} M ${x} ${y} L ${x} ${y + h}`;
  const trendD = `M ${x + barW / 2} ${y + h - bars[0].height} Q ${cx} ${y + h - bars[1].height - 10 * scale}, ${x + w - barW / 2} ${y + h - bars[3].height}`;

  const perBar = Math.floor(drawDuration / (bars.length + 2));

  return (
    <g>
      <AnimatedPath d={axisD} startFrame={startFrame} drawDuration={perBar} stroke={COLORS.outline} strokeWidth={2} />
      {bars.map((bar, i) => {
        const bx = x + i * (barW + gap) + gap;
        const bD = `M ${bx} ${y + h} L ${bx} ${y + h - bar.height} L ${bx + barW} ${y + h - bar.height} L ${bx + barW} ${y + h}`;
        return (
          <AnimatedPath
            key={i}
            d={bD}
            startFrame={startFrame + perBar + i * perBar}
            drawDuration={perBar}
            stroke={bar.color}
            strokeWidth={2}
            fill={bar.color}
            fillOpacity={0.5}
          />
        );
      })}
      <AnimatedPath
        d={trendD}
        startFrame={startFrame + perBar * 5}
        drawDuration={perBar}
        stroke={COLORS.red}
        strokeWidth={2.5}
        fill="none"
      />
      <SketchArrow
        x1={x + w - barW / 2 - 5 * scale}
        y1={y + h - bars[3].height + 5 * scale}
        x2={x + w + 5 * scale}
        y2={y + h - bars[3].height - 12 * scale}
        startFrame={startFrame + perBar * 5 + 5}
        drawDuration={perBar}
        stroke={COLORS.red}
        strokeWidth={2}
        headSize={8 * scale}
      />
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

  // Hour hand (pointing to ~10)
  const hourD = `M ${cx} ${cy} L ${cx - 10 * scale} ${cy - 18 * scale}`;
  // Minute hand (pointing to ~2)
  const minuteD = `M ${cx} ${cy} L ${cx + 16 * scale} ${cy - 10 * scale}`;
  // Center dot
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

// ─── DocStack ─────────────────────────────────────────────────────────────────
interface DocStackProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const DocStack: React.FC<DocStackProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration,
}) => {
  const w = 60 * scale, h = 78 * scale;
  const fold = 12 * scale;
  const perDoc = Math.floor(drawDuration / 3);

  const docs = [
    { dx: 10 * scale, dy: -10 * scale, color: '#e8e0d0' },
    { dx: 5 * scale, dy: -5 * scale, color: '#f0e8d8' },
    { dx: 0, dy: 0, color: '#fff8ee' },
  ];

  return (
    <g>
      {docs.map(({ dx, dy, color }, i) => {
        const x = cx - w / 2 + dx, y = cy - h / 2 + dy;
        const docD = `M ${x} ${y} L ${x + w - fold} ${y} L ${x + w} ${y + fold} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
        const foldD = `M ${x + w - fold} ${y} L ${x + w - fold} ${y + fold} L ${x + w} ${y + fold}`;
        const l1 = `M ${x + 8 * scale} ${y + 22 * scale} L ${x + w - 8 * scale} ${y + 22 * scale}`;
        const l2 = `M ${x + 8 * scale} ${y + 32 * scale} L ${x + w - 8 * scale} ${y + 32 * scale}`;
        const l3 = `M ${x + 8 * scale} ${y + 42 * scale} L ${x + w - 14 * scale} ${y + 42 * scale}`;
        const sf = startFrame + i * perDoc;
        return (
          <g key={i}>
            <AnimatedPath d={docD} startFrame={sf} drawDuration={perDoc * 0.6} stroke={COLORS.outline} fill={color} fillOpacity={0.9} />
            <AnimatedPath d={foldD} startFrame={sf + perDoc * 0.3} drawDuration={perDoc * 0.3} stroke={COLORS.outline} />
            <AnimatedPath d={l1} startFrame={sf + perDoc * 0.5} drawDuration={perDoc * 0.2} stroke={COLORS.outline} strokeWidth={1.5} />
            <AnimatedPath d={l2} startFrame={sf + perDoc * 0.6} drawDuration={perDoc * 0.2} stroke={COLORS.outline} strokeWidth={1.5} />
            <AnimatedPath d={l3} startFrame={sf + perDoc * 0.7} drawDuration={perDoc * 0.2} stroke={COLORS.outline} strokeWidth={1.5} />
          </g>
        );
      })}
    </g>
  );
};
