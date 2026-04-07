import React from 'react';
import { AnimatedPath, HandWrittenText, SketchArrow, SketchBox, COLORS } from '../components';

// ─── CycleArrow ───────────────────────────────────────────────────────────────
interface CycleArrowProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  segments?: number;
  broken?: boolean;
  color?: string;
}

export const CycleArrow: React.FC<CycleArrowProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, segments = 1, broken = false, color = COLORS.blue,
}) => {
  const s = scale;
  const r = 28 * s;
  const perSeg = Math.floor(drawDuration / Math.max(segments, 1));
  const gapAngle = 0.3;
  const headSize = 10 * s;

  if (segments <= 1) {
    const startAngle = -Math.PI * 0.5;
    const endAngle = startAngle + Math.PI * 2 - gapAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const arcD = `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;

    const tangentAngle = endAngle + Math.PI / 2;
    const a1 = tangentAngle + Math.PI * 0.7;
    const a2 = tangentAngle - Math.PI * 0.7;
    const arrowD = `M ${x2 + headSize * Math.cos(a1)} ${y2 + headSize * Math.sin(a1)} L ${x2} ${y2} L ${x2 + headSize * Math.cos(a2)} ${y2 + headSize * Math.sin(a2)}`;

    return (
      <g>
        <AnimatedPath d={arcD} startFrame={startFrame} drawDuration={drawDuration - 8} stroke={broken ? COLORS.red : color} strokeWidth={2.5 * s} strokeDasharray={broken ? '8,6' : undefined} />
        {!broken && <AnimatedPath d={arrowD} startFrame={startFrame + drawDuration - 8} drawDuration={8} stroke={color} strokeWidth={2.5 * s} />}
      </g>
    );
  }

  const segAngle = (Math.PI * 2) / segments;
  const arcs: React.ReactNode[] = [];

  for (let i = 0; i < segments; i++) {
    const isBrokenSeg = broken && i === segments - 1;
    const sa = -Math.PI / 2 + i * segAngle + gapAngle / 2;
    const ea = -Math.PI / 2 + (i + 1) * segAngle - gapAngle / 2;
    const x1 = cx + r * Math.cos(sa);
    const y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea);
    const y2 = cy + r * Math.sin(ea);
    const largeArc = segAngle - gapAngle > Math.PI ? 1 : 0;
    const arcD = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

    const tangentAngle = ea + Math.PI / 2;
    const a1 = tangentAngle + Math.PI * 0.7;
    const a2 = tangentAngle - Math.PI * 0.7;
    const arrowD = `M ${x2 + headSize * Math.cos(a1)} ${y2 + headSize * Math.sin(a1)} L ${x2} ${y2} L ${x2 + headSize * Math.cos(a2)} ${y2 + headSize * Math.sin(a2)}`;

    arcs.push(
      <g key={i}>
        <AnimatedPath d={arcD} startFrame={startFrame + i * perSeg} drawDuration={perSeg - 6} stroke={isBrokenSeg ? COLORS.red : color} strokeWidth={2.5 * s} strokeDasharray={isBrokenSeg ? '8,6' : undefined} />
        {!isBrokenSeg && <AnimatedPath d={arrowD} startFrame={startFrame + i * perSeg + perSeg - 6} drawDuration={6} stroke={color} strokeWidth={2.5 * s} />}
      </g>
    );
  }

  return <g>{arcs}</g>;
};

// ─── FlowChain ────────────────────────────────────────────────────────────────
interface FlowChainProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  steps: string[];
  direction?: 'horizontal' | 'vertical';
  color?: string;
}

export const FlowChain: React.FC<FlowChainProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, steps, direction = 'horizontal', color = COLORS.blue,
}) => {
  const s = scale;
  const boxW = 100 * s, boxH = 36 * s;
  const gap = 40 * s;
  const n = steps.length;
  const perStep = Math.floor(drawDuration / n);

  const totalW = direction === 'horizontal' ? n * boxW + (n - 1) * gap : boxW;
  const totalH = direction === 'vertical' ? n * boxH + (n - 1) * gap : boxH;
  const startX = cx - totalW / 2;
  const startY = cy - totalH / 2;

  return (
    <g>
      {steps.map((step, i) => {
        const bx = direction === 'horizontal' ? startX + i * (boxW + gap) : startX;
        const by = direction === 'vertical' ? startY + i * (boxH + gap) : startY;
        const sf = startFrame + i * perStep;
        const arrowDur = Math.min(10, perStep / 3);

        return (
          <g key={i}>
            <SketchBox x={bx} y={by} width={boxW} height={boxH} startFrame={sf} drawDuration={Math.floor(perStep * 0.4)} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.1} />
            <HandWrittenText text={step} x={bx + boxW / 2} y={by + boxH / 2 + 6 * s} startFrame={sf + Math.floor(perStep * 0.4)} durationFrames={Math.floor(perStep * 0.3)} fontSize={14 * s} fill={COLORS.outline} textAnchor="middle" />
            {i < n - 1 && (
              direction === 'horizontal'
                ? <SketchArrow x1={bx + boxW + 4} y1={by + boxH / 2} x2={bx + boxW + gap - 4} y2={by + boxH / 2} startFrame={sf + Math.floor(perStep * 0.7)} drawDuration={arrowDur} color={color} />
                : <SketchArrow x1={bx + boxW / 2} y1={by + boxH + 4} x2={bx + boxW / 2} y2={by + boxH + gap - 4} startFrame={sf + Math.floor(perStep * 0.7)} drawDuration={arrowDur} color={color} />
            )}
          </g>
        );
      })}
    </g>
  );
};

// ─── FunnelIcon ───────────────────────────────────────────────────────────────
interface FunnelIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const FunnelIcon: React.FC<FunnelIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;

  const funnelD =
    `M ${cx - 38 * s} ${cy - 35 * s} ` +
    `L ${cx + 38 * s} ${cy - 35 * s} ` +
    `L ${cx + 8 * s} ${cy + 8 * s} ` +
    `L ${cx + 8 * s} ${cy + 35 * s} ` +
    `L ${cx - 8 * s} ${cy + 35 * s} ` +
    `L ${cx - 8 * s} ${cy + 8 * s} Z`;

  return (
    <AnimatedPath d={funnelD} startFrame={startFrame} drawDuration={drawDuration} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.2} />
  );
};

// ─── DecisionDiamond ──────────────────────────────────────────────────────────
interface DecisionDiamondProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const DecisionDiamond: React.FC<DecisionDiamondProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.yellow,
}) => {
  const s = scale;
  const w = 35 * s, h = 28 * s;

  const diamondD =
    `M ${cx} ${cy - h} ` +
    `L ${cx + w} ${cy} ` +
    `L ${cx} ${cy + h} ` +
    `L ${cx - w} ${cy} Z`;

  return (
    <AnimatedPath d={diamondD} startFrame={startFrame} drawDuration={drawDuration} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.3} />
  );
};

// ─── DottedConnector ──────────────────────────────────────────────────────────
interface DottedConnectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
  dashed?: boolean;
}

export const DottedConnector: React.FC<DottedConnectorProps> = ({
  x1, y1, x2, y2, startFrame, drawDuration, color = COLORS.gray2, dashed = true,
}) => {
  const d = `M ${x1} ${y1} L ${x2} ${y2}`;

  return (
    <AnimatedPath d={d} startFrame={startFrame} drawDuration={drawDuration} stroke={color} strokeWidth={2} strokeDasharray={dashed ? '6,4' : undefined} />
  );
};
