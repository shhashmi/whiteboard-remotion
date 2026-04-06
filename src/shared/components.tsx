import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';

// ─── Color Palette ────────────────────────────────────────────────────────────
export const COLORS = {
  outline: '#1e293b',
  orange: '#f97316',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#22c55e',
  yellow: '#fbbf24',
  skin: '#fde2c4',
  hairBrown: '#5a3825',
  hair: '#5a3825',
  gray1: '#64748b',
  gray2: '#94a3b8',
  gray3: '#cbd5e1',
  white: '#ffffff',
  red: '#ef4444',
  gold: '#d4a017',
};

// ─── SVG Wrapper ──────────────────────────────────────────────────────────────
export const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width={1920}
    height={1080}
    viewBox="0 0 1920 1080"
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
  >
    {children}
  </svg>
);

// ─── AnimatedPath (extended: fillDuration, opacity) ───────────────────────────
interface AnimatedPathProps {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  startFrame: number;
  drawDuration: number;
  fillDuration?: number;
  pathLength?: number;
  opacity?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
}

export const AnimatedPath: React.FC<AnimatedPathProps> = ({
  d,
  stroke = COLORS.outline,
  strokeWidth = 2.5,
  fill = 'none',
  fillOpacity = 1,
  startFrame,
  drawDuration,
  fillDuration = 15,
  pathLength = 1,
  opacity = 1,
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
          [startFrame + drawDuration, startFrame + drawDuration + fillDuration],
          [0, fillOpacity],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

  const elemOpacity = frame < startFrame ? 0 : opacity;

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      fillOpacity={resolvedFillOpacity}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      pathLength={pathLength}
      strokeDasharray={1}
      strokeDashoffset={strokeProgress}
      opacity={elemOpacity}
    />
  );
};

// ─── HandWrittenText (durationFrames API) ─────────────────────────────────────
interface HandWrittenTextProps {
  text: string;
  x: number;
  y: number;
  startFrame: number;
  durationFrames: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  fontWeight?: number | string;
  textAnchor?: 'start' | 'middle' | 'end';
  letterSpacing?: number;
}

export const HandWrittenText: React.FC<HandWrittenTextProps> = ({
  text,
  x,
  y,
  startFrame,
  durationFrames,
  fontSize = 32,
  fontFamily = 'Architects Daughter, cursive',
  fill = COLORS.outline,
  fontWeight = 700,
  textAnchor = 'middle',
  letterSpacing,
}) => {
  const frame = useCurrentFrame();
  const charCount = Math.floor(
    interpolate(frame, [startFrame, startFrame + durationFrames], [0, text.length], {
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
      letterSpacing={letterSpacing}
    >
      {visibleText}
    </text>
  );
};

// ─── TypedText (HTML div typewriter) ─────────────────────────────────────────
interface TypedTextProps {
  text: string;
  startFrame: number;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const TypedText: React.FC<TypedTextProps> = ({ text, startFrame, durationFrames, style }) => {
  const frame = useCurrentFrame();
  const charCount = Math.floor(
    interpolate(frame, [startFrame, startFrame + durationFrames], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  return <div style={style}>{text.slice(0, charCount)}</div>;
};

// ─── Scene (30-frame fade in/out) ─────────────────────────────────────────────
interface SceneProps {
  startFrame: number;
  endFrame: number;
  children: React.ReactNode;
}

export const Scene: React.FC<SceneProps> = ({ startFrame, endFrame, children }) => {
  const frame = useCurrentFrame();

  if (frame < startFrame - 30 || frame > endFrame + 30) return null;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 30, endFrame - 30, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── FadeIn (with direction) ──────────────────────────────────────────────────
type Direction = 'up' | 'down' | 'left' | 'right' | 'none' | 'scale';

interface FadeInProps {
  startFrame: number;
  durationFrames?: number;
  direction?: Direction;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  startFrame,
  durationFrames = 20,
  direction = 'up',
  distance = 20,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let transform = '';
  if (direction === 'up') transform = `translateY(${(1 - p) * distance}px)`;
  else if (direction === 'down') transform = `translateY(${-(1 - p) * distance}px)`;
  else if (direction === 'left') transform = `translateX(${(1 - p) * distance}px)`;
  else if (direction === 'right') transform = `translateX(${-(1 - p) * distance}px)`;
  else if (direction === 'scale') transform = `scale(${0.7 + p * 0.3})`;

  return (
    <div style={{ opacity: p, transform, ...style }}>
      {children}
    </div>
  );
};

// ─── SketchBox (with rx, ±1.5px wobble) ──────────────────────────────────────
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
  rx?: number;
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
  rx = 6,
}) => {
  const r = rx;
  const tl = { x: x + 1.5, y: y + 1 };
  const tr = { x: x + width - 1, y: y - 1.5 };
  const br = { x: x + width + 1, y: y + height + 1.5 };
  const bl = { x: x - 1, y: y + height - 1 };

  const d =
    `M ${tl.x + r} ${tl.y} ` +
    `L ${tr.x - r} ${tr.y} ` +
    `Q ${tr.x} ${tr.y} ${tr.x} ${tr.y + r} ` +
    `L ${br.x} ${br.y - r} ` +
    `Q ${br.x} ${br.y} ${br.x - r} ${br.y} ` +
    `L ${bl.x + r} ${bl.y} ` +
    `Q ${bl.x} ${bl.y} ${bl.x} ${bl.y - r} ` +
    `L ${tl.x} ${tl.y + r} ` +
    `Q ${tl.x} ${tl.y} ${tl.x + r} ${tl.y} Z`;

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
  const k = r * 0.56;
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

// ─── SketchArrow (color prop, 16px head) ─────────────────────────────────────
interface SketchArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
  strokeWidth?: number;
  headSize?: number;
}

export const SketchArrow: React.FC<SketchArrowProps> = ({
  x1, y1, x2, y2, startFrame, drawDuration, color = COLORS.orange, strokeWidth = 2.5, headSize = 16,
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
    <AnimatedPath d={d} startFrame={startFrame} drawDuration={drawDuration} stroke={color} strokeWidth={strokeWidth} />
  );
};

// ─── SketchLine ───────────────────────────────────────────────────────────────
interface SketchLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
  strokeWidth?: number;
}

export const SketchLine: React.FC<SketchLineProps> = ({
  x1, y1, x2, y2, startFrame, drawDuration, color = COLORS.outline, strokeWidth = 2,
}) => (
  <AnimatedPath
    d={`M ${x1} ${y1} L ${x2} ${y2}`}
    startFrame={startFrame}
    drawDuration={drawDuration}
    stroke={color}
    strokeWidth={strokeWidth}
  />
);

// ─── CheckMark ────────────────────────────────────────────────────────────────
interface CheckMarkProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CheckMark: React.FC<CheckMarkProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.green,
}) => {
  const s = scale;
  const d = `M ${cx - 18 * s} ${cy} L ${cx - 5 * s} ${cy + 13 * s} L ${cx + 18 * s} ${cy - 14 * s}`;
  return <AnimatedPath d={d} startFrame={startFrame} drawDuration={drawDuration} stroke={color} strokeWidth={3 * s} />;
};

// ─── CrossMark ────────────────────────────────────────────────────────────────
interface CrossMarkProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const CrossMark: React.FC<CrossMarkProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.red,
}) => {
  const s = scale;
  const half = Math.floor(drawDuration / 2);
  return (
    <g>
      <AnimatedPath d={`M ${cx - 14 * s} ${cy - 14 * s} L ${cx + 14 * s} ${cy + 14 * s}`} startFrame={startFrame} drawDuration={half} stroke={color} strokeWidth={3 * s} />
      <AnimatedPath d={`M ${cx + 14 * s} ${cy - 14 * s} L ${cx - 14 * s} ${cy + 14 * s}`} startFrame={startFrame + half} drawDuration={half} stroke={color} strokeWidth={3 * s} />
    </g>
  );
};

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
          durationFrames={drawDuration - third * 2}
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
        color={COLORS.red}
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

// ─── SketchTable ──────────────────────────────────────────────────────────────
interface SketchTableProps {
  headers: string[];
  rows: string[][];
  x: number;
  y: number;
  colWidth?: number;
  rowHeight?: number;
  startFrame: number;
  framesPerRow?: number;
  headerColor?: string;
  fontSize?: number;
}

export const SketchTable: React.FC<SketchTableProps> = ({
  headers,
  rows,
  x,
  y,
  colWidth = 160,
  rowHeight = 42,
  startFrame,
  framesPerRow = 20,
  headerColor = COLORS.outline,
  fontSize = 18,
}) => {
  const tableWidth = headers.length * colWidth;
  const tableHeight = (rows.length + 1) * rowHeight;

  const borderDur = 20;
  const headerFillStart = startFrame + borderDur;
  const headerFillDur = 12;
  const headerTextStart = headerFillStart + headerFillDur;
  const rowSepStart = headerTextStart + framesPerRow + 5;
  const rowSepDur = 8;
  const colSepStart = rowSepStart + rows.length * 4 + rowSepDur;
  const colSepDur = 8;
  const cellTextStart = colSepStart + (headers.length - 1) * 4 + colSepDur;

  const outerBorderD =
    `M ${x + 3} ${y + 2} L ${x + tableWidth - 1} ${y - 1} ` +
    `L ${x + tableWidth + 2} ${y + tableHeight + 1} ` +
    `L ${x - 1} ${y + tableHeight - 1} Z`;

  const headerFillD =
    `M ${x + 2} ${y + 1} L ${x + tableWidth - 2} ${y - 1} ` +
    `L ${x + tableWidth} ${y + rowHeight} L ${x} ${y + rowHeight} Z`;

  return (
    <g>
      <AnimatedPath d={outerBorderD} startFrame={startFrame} drawDuration={borderDur} stroke={COLORS.outline} strokeWidth={2.5} fill="none" />

      <AnimatedPath
        d={headerFillD}
        startFrame={headerFillStart}
        drawDuration={headerFillDur}
        stroke="none"
        strokeWidth={0}
        fill={headerColor}
        fillOpacity={1}
        fillDuration={8}
      />

      {headers.map((header, i) => (
        <HandWrittenText
          key={`h-${i}`}
          text={header}
          x={x + i * colWidth + colWidth / 2}
          y={y + rowHeight / 2 + 7}
          startFrame={headerTextStart + i * 5}
          durationFrames={framesPerRow}
          fontSize={fontSize}
          fill={COLORS.white}
          fontWeight={700}
          textAnchor="middle"
        />
      ))}

      {rows.map((_, ri) => (
        <AnimatedPath
          key={`rsep-${ri}`}
          d={`M ${x} ${y + (ri + 1) * rowHeight} L ${x + tableWidth} ${y + (ri + 1) * rowHeight}`}
          startFrame={rowSepStart + ri * 4}
          drawDuration={rowSepDur}
          stroke={COLORS.gray3}
          strokeWidth={1.5}
        />
      ))}

      {Array.from({ length: headers.length - 1 }, (_, ci) => (
        <AnimatedPath
          key={`csep-${ci}`}
          d={`M ${x + (ci + 1) * colWidth} ${y} L ${x + (ci + 1) * colWidth} ${y + tableHeight}`}
          startFrame={colSepStart + ci * 4}
          drawDuration={colSepDur}
          stroke={COLORS.gray3}
          strokeWidth={1.5}
        />
      ))}

      {rows.map((row, ri) =>
        row.map((cell, ci) => (
          <HandWrittenText
            key={`cell-${ri}-${ci}`}
            text={cell}
            x={x + ci * colWidth + colWidth / 2}
            y={y + (ri + 1) * rowHeight + rowHeight / 2 + 7}
            startFrame={cellTextStart + ri * framesPerRow + ci * 3}
            durationFrames={framesPerRow}
            fontSize={fontSize - 2}
            fill={COLORS.outline}
            fontWeight={400}
            textAnchor="middle"
          />
        ))
      )}
    </g>
  );
};
