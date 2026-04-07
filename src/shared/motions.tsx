import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS } from './components';

// ─── FlowPulse (repeating pulse/glow) ────────────────────────────────────────
interface FlowPulseProps {
  startFrame: number;
  durationFrames: number;
  cycleDuration?: number;
  minOpacity?: number;
  maxOpacity?: number;
  minScale?: number;
  maxScale?: number;
  svg?: boolean;
  children: React.ReactNode;
}

export const FlowPulse: React.FC<FlowPulseProps> = ({
  startFrame,
  durationFrames,
  cycleDuration = 30,
  minOpacity = 0.4,
  maxOpacity = 1.0,
  minScale = 1.0,
  maxScale = 1.05,
  svg = false,
  children,
}) => {
  const frame = useCurrentFrame();

  if (frame < startFrame || frame > startFrame + durationFrames) {
    return svg ? <g opacity={0}>{children}</g> : <div style={{ opacity: 0 }}>{children}</div>;
  }

  const elapsed = frame - startFrame;
  const half = cycleDuration / 2;
  const cyclePos = elapsed % cycleDuration;
  // Triangle wave: 0 → 1 → 0 over each cycle
  const t = cyclePos <= half
    ? cyclePos / half
    : 1 - (cyclePos - half) / half;

  const opacity = minOpacity + t * (maxOpacity - minOpacity);
  const scale = minScale + t * (maxScale - minScale);

  if (svg) {
    return <g opacity={opacity} transform={`scale(${scale})`}>{children}</g>;
  }

  return (
    <div style={{ opacity, transform: `scale(${scale})`, display: 'contents' }}>
      {children}
    </div>
  );
};

// ─── StaggerMap (render-prop for staggered entrances) ────────────────────────
interface StaggerMapProps {
  startFrame: number;
  staggerDelay?: number;
  count: number;
  children: (index: number, startFrame: number) => React.ReactNode;
}

export const StaggerMap: React.FC<StaggerMapProps> = ({
  startFrame,
  staggerDelay = 25,
  count,
  children,
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, i) =>
        children(i, startFrame + i * staggerDelay)
      )}
    </>
  );
};

// ─── SpringReveal (spring-physics entrance) ──────────────────────────────────
type SpringDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface SpringRevealProps {
  startFrame: number;
  direction?: SpringDirection;
  distance?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  svg?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const SpringReveal: React.FC<SpringRevealProps> = ({
  startFrame,
  direction = 'up',
  distance = 30,
  damping = 12,
  mass = 0.5,
  stiffness = 120,
  svg = false,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayedFrame = Math.max(0, frame - startFrame);
  const p = spring({ frame: delayedFrame, fps, config: { damping, mass, stiffness } });

  const opacity = frame < startFrame ? 0 : Math.min(1, p);

  if (svg) {
    let transform = '';
    if (direction === 'up') transform = `translate(0, ${(1 - p) * distance})`;
    else if (direction === 'down') transform = `translate(0, ${-(1 - p) * distance})`;
    else if (direction === 'left') transform = `translate(${(1 - p) * distance}, 0)`;
    else if (direction === 'right') transform = `translate(${-(1 - p) * distance}, 0)`;
    else if (direction === 'scale') transform = `scale(${0.7 + p * 0.3})`;

    return (
      <g opacity={opacity} transform={transform}>
        {children}
      </g>
    );
  }

  let transform = '';
  if (direction === 'up') transform = `translateY(${(1 - p) * distance}px)`;
  else if (direction === 'down') transform = `translateY(${-(1 - p) * distance}px)`;
  else if (direction === 'left') transform = `translateX(${(1 - p) * distance}px)`;
  else if (direction === 'right') transform = `translateX(${-(1 - p) * distance}px)`;
  else if (direction === 'scale') transform = `scale(${0.7 + p * 0.3})`;

  return (
    <div style={{ opacity, transform, ...style }}>
      {children}
    </div>
  );
};

// ─── CountUp (animated number counter) ───────────────────────────────────────
interface CountUpProps {
  startFrame: number;
  durationFrames: number;
  from?: number;
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fill?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  textAnchor?: 'start' | 'middle' | 'end';
  svg?: boolean;
  style?: React.CSSProperties;
}

export const CountUp: React.FC<CountUpProps> = ({
  startFrame,
  durationFrames,
  from = 0,
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  x = 0,
  y = 0,
  fontSize = 48,
  fill = COLORS.outline,
  fontFamily = 'Architects Daughter, cursive',
  fontWeight = 700,
  textAnchor = 'middle',
  svg = true,
  style,
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [from, to],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const display = `${prefix}${value.toFixed(decimals)}${suffix}`;

  if (svg) {
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
        {display}
      </text>
    );
  }

  return <div style={style}>{display}</div>;
};

// ─── CameraPan (keyframe-based viewport pan/zoom) ────────────────────────────
interface CameraKeyframe {
  frame: number;
  x: number;
  y: number;
  scale: number;
}

interface CameraPanProps {
  keyframes: CameraKeyframe[];
  children: React.ReactNode;
}

export const CameraPan: React.FC<CameraPanProps> = ({ keyframes, children }) => {
  const frame = useCurrentFrame();

  const frames = keyframes.map((k) => k.frame);
  const xs = keyframes.map((k) => k.x);
  const ys = keyframes.map((k) => k.y);
  const scales = keyframes.map((k) => k.scale);

  const x = interpolate(frame, frames, xs, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, frames, ys, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, frames, scales, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'absolute' }}>
      <div
        style={{
          transform: `translate(${-x}px, ${-y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}
      >
        {children}
      </div>
    </div>
  );
};
