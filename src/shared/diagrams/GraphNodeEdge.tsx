import React from 'react';
import {
  SketchBox,
  SketchCircle,
  SketchArrow,
  SketchLine,
  HandWrittenText,
  AnimatedPath,
} from '../components';
import { COLORS } from '../theme';

export type GraphNodeShape = 'box' | 'circle' | 'diamond';

const CHAR_WIDTH_FACTOR = 0.55;  // mirrors HandWrittenText wrap math in bounds.ts::textBox
const NODE_PADDING_RATIO = 0.1;  // 10% of nodeW reserved as horizontal padding

export const FIT_FONT_NOT_POSSIBLE = -1 as const;

/**
 * Return the largest font size in [minFontSize, defaultFontSize] at which
 * `label` fits inside a (width × height) node box, or FIT_FONT_NOT_POSSIBLE
 * if the label cannot fit even at minFontSize.
 *
 * Used by composite layout functions to decide whether to render at all.
 * Same measurement math is used at render time by GraphNode so the
 * validator's fit check matches what actually draws.
 */
export function fitFontSizeToNode(
  label: string,
  width: number,
  height: number,
  opts: { defaultFontSize?: number; minFontSize?: number } = {},
): number {
  const defaultFontSize = opts.defaultFontSize ?? 36;
  const minFontSize = opts.minFontSize ?? 18;
  const padding = Math.max(4, width * NODE_PADDING_RATIO);
  const availW = Math.max(0, width - 2 * padding);
  const availH = Math.max(0, height - 2 * padding);
  const textW = label.length * CHAR_WIDTH_FACTOR;
  if (textW <= 0) return defaultFontSize;
  const byWidth = availW / textW;
  const byHeight = availH / 1.2;
  const fit = Math.min(defaultFontSize, byWidth, byHeight);
  if (fit < minFontSize) return FIT_FONT_NOT_POSSIBLE;
  return Math.floor(fit);
}

export interface GraphNodeProps {
  x: number;
  y: number;
  label: string;
  shape?: GraphNodeShape;
  width?: number;
  height?: number;
  startFrame: number;
  drawDuration?: number;
  stroke?: string;
  fill?: string;
  fillOpacity?: number;
  fontSize?: number;
  labelColor?: string;
  rx?: number;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  x,
  y,
  label,
  shape = 'box',
  width = 260,
  height = 100,
  startFrame,
  drawDuration = 20,
  stroke = COLORS.outline,
  fill = COLORS.white,
  fillOpacity = 0,
  fontSize = 36,
  labelColor,
  rx = 12,
}) => {
  // Auto-fit the label so a caller-supplied fontSize that exceeds the node's
  // available width/height gets shrunk to fit instead of visibly overflowing
  // into the neighbor. Floors at the library-wide minimum legible font size.
  const fitted = fitFontSizeToNode(label, width, height, { defaultFontSize: fontSize, minFontSize: 18 });
  const effectiveFontSize = fitted === FIT_FONT_NOT_POSSIBLE ? 18 : fitted;

  const labelElement = (
    <HandWrittenText
      text={label}
      x={x}
      y={y + effectiveFontSize * 0.18}
      startFrame={startFrame + 5}
      durationFrames={18}
      fontSize={effectiveFontSize}
      fill={labelColor ?? stroke}
      textAnchor="middle"
      baseline="auto"
    />
  );

  if (shape === 'circle') {
    const r = Math.min(width, height) / 2;
    return (
      <g>
        <SketchCircle
          cx={x}
          cy={y}
          r={r}
          startFrame={startFrame}
          drawDuration={drawDuration}
          stroke={stroke}
          fill={fill}
          fillOpacity={fillOpacity}
        />
        {labelElement}
      </g>
    );
  }

  if (shape === 'diamond') {
    const hw = width / 2;
    const hh = height / 2;
    const d = `M ${x} ${y - hh} L ${x + hw} ${y} L ${x} ${y + hh} L ${x - hw} ${y} Z`;
    return (
      <g>
        <AnimatedPath
          d={d}
          startFrame={startFrame}
          drawDuration={drawDuration}
          stroke={stroke}
          fill={fill}
          fillOpacity={fillOpacity}
          strokeWidth={2.5}
        />
        {labelElement}
      </g>
    );
  }

  return (
    <g>
      <SketchBox
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        startFrame={startFrame}
        drawDuration={drawDuration}
        stroke={stroke}
        fill={fill}
        fillOpacity={fillOpacity}
        rx={rx}
      />
      {labelElement}
    </g>
  );
};

export interface GraphEdgeProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  fromShape?: GraphNodeShape;
  toShape?: GraphNodeShape;
  fromSize?: { w: number; h: number };
  toSize?: { w: number; h: number };
  gap?: number;
  startFrame: number;
  drawDuration?: number;
  color?: string;
  strokeWidth?: number;
  directed?: boolean;
  label?: string;
  labelOffset?: number;
}

function edgePoint(
  a: { x: number; y: number },
  b: { x: number; y: number },
  shape: GraphNodeShape,
  size: { w: number; h: number },
  gap: number,
): { x: number; y: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  let t: number;
  if (shape === 'circle') {
    t = Math.min(size.w, size.h) / 2;
  } else if (shape === 'diamond') {
    const hw = size.w / 2;
    const hh = size.h / 2;
    t = (hw * hh) / (hh * Math.abs(ux) + hw * Math.abs(uy) || 1);
  } else {
    const hw = size.w / 2;
    const hh = size.h / 2;
    t = Math.min(
      hw / Math.max(Math.abs(ux), 1e-6),
      hh / Math.max(Math.abs(uy), 1e-6),
    );
  }
  return { x: a.x + ux * (t + gap), y: a.y + uy * (t + gap) };
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({
  from,
  to,
  fromShape = 'box',
  toShape = 'box',
  fromSize = { w: 260, h: 100 },
  toSize = { w: 260, h: 100 },
  gap = 8,
  startFrame,
  drawDuration = 15,
  color = COLORS.orange,
  strokeWidth = 2.5,
  directed = true,
  label,
  labelOffset = -16,
}) => {
  const start = edgePoint(from, to, fromShape, fromSize, gap);
  const end = edgePoint(to, from, toShape, toSize, gap);

  const labelEl = label ? (
    <HandWrittenText
      text={label}
      x={(start.x + end.x) / 2}
      y={(start.y + end.y) / 2 + labelOffset}
      startFrame={startFrame + drawDuration - 5}
      durationFrames={15}
      fontSize={24}
      fill={color}
      textAnchor="middle"
    />
  ) : null;

  if (directed) {
    return (
      <g>
        <SketchArrow
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          startFrame={startFrame}
          drawDuration={drawDuration}
          color={color}
          strokeWidth={strokeWidth}
        />
        {labelEl}
      </g>
    );
  }

  return (
    <g>
      <SketchLine
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        startFrame={startFrame}
        drawDuration={drawDuration}
        color={color}
        strokeWidth={strokeWidth}
      />
      {labelEl}
    </g>
  );
};
