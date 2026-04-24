import React from 'react';
import { AnimatedPath, SketchCircle, HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface TradeoffTriangleProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  axes?: [string, string, string];
  point?: { a: number; b: number; c: number };
  title?: string;
}

const TITLE_H = 56;
const LABEL_MARGIN = 70;     // space around triangle for axis labels
const MIN_TRIANGLE_SIDE = 200;

// Equilateral triangle pointing up: side s gives width = s, height = s * sqrt(3)/2.
// Bounding box aspect w/h = 2/sqrt(3) ≈ 1.155.
const TRIANGLE_ASPECT = 2 / Math.sqrt(3);
const TRIANGLE_HEIGHT_RATIO = Math.sqrt(3) / 2; // bbox height / triangle side

interface TradeoffTriangleGeometry {
  outer: Box;
  triangleBbox: Box;          // tight bbox of the triangle itself
  vertices: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
  axisBboxes: [Box, Box, Box];
  axes: [string, string, string];
  title?: string;
  titleBbox?: Box;
  pointPos?: { x: number; y: number };
  error?: string;
}

function barycentric(
  vertices: Array<{ x: number; y: number }>,
  weights: [number, number, number],
): { x: number; y: number } {
  const total = weights[0] + weights[1] + weights[2] || 1;
  return {
    x: (weights[0] * vertices[0].x + weights[1] * vertices[1].x + weights[2] * vertices[2].x) / total,
    y: (weights[0] * vertices[0].y + weights[1] * vertices[1].y + weights[2] * vertices[2].y) / total,
  };
}

function computeTradeoffTriangleGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  axes?: [string, string, string];
  point?: { a: number; b: number; c: number };
  title?: string;
}): TradeoffTriangleGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const axes = props.axes ?? ['Cost', 'Latency', 'Accuracy'];
  const hasTitle = !!props.title;

  // Content area (after title) must fit the triangle PLUS label margins on all sides.
  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const contentH = outer.y2 - contentY1;
  // Reserve LABEL_MARGIN on top (top axis label), bottom (bottom axis labels), left, right.
  const drawW = outer.x2 - outer.x1 - 2 * LABEL_MARGIN;
  const drawH = contentH - 2 * LABEL_MARGIN;

  // Largest equilateral triangle (side length s) that fits in drawW × drawH.
  // bbox is s wide, s * sqrt(3)/2 tall.
  let side = Math.min(drawW, drawH / TRIANGLE_HEIGHT_RATIO);
  if (side < MIN_TRIANGLE_SIDE) {
    const needW = MIN_TRIANGLE_SIDE + 2 * LABEL_MARGIN;
    const needH = MIN_TRIANGLE_SIDE * TRIANGLE_HEIGHT_RATIO + 2 * LABEL_MARGIN + (hasTitle ? TITLE_H : 0);
    return {
      outer,
      triangleBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
      vertices: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      axisBboxes: [
        { x1: 0, y1: 0, x2: 0, y2: 0 },
        { x1: 0, y1: 0, x2: 0, y2: 0 },
        { x1: 0, y1: 0, x2: 0, y2: 0 },
      ],
      axes,
      error: `TradeoffTriangle requires rect ≥ ${Math.ceil(needW)}×${Math.ceil(needH)}; got ${Math.floor(props.w)}×${Math.floor(props.h)}`,
    };
  }

  const triWidth = side;
  const triHeight = side * TRIANGLE_HEIGHT_RATIO;
  // Center the triangle inside the drawable area.
  const drawCenterX = outer.x1 + props.w / 2;
  const drawCenterY = contentY1 + LABEL_MARGIN + drawH / 2;
  const triLeft = drawCenterX - triWidth / 2;
  const triTop = drawCenterY - triHeight / 2;
  const triangleBbox: Box = {
    x1: triLeft,
    y1: triTop,
    x2: triLeft + triWidth,
    y2: triTop + triHeight,
  };

  const vertices: [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ] = [
    { x: drawCenterX, y: triTop },                       // top
    { x: triLeft + triWidth, y: triTop + triHeight },    // bottom-right
    { x: triLeft, y: triTop + triHeight },               // bottom-left
  ];

  // Axis label bboxes — sized to fit within LABEL_MARGIN and clamped to outer.
  const AX_LABEL_W = 120;
  const AX_LABEL_H = 44;
  const clampBox = (b: Box): Box => ({
    x1: Math.max(outer.x1, b.x1),
    y1: Math.max(outer.y1, b.y1),
    x2: Math.min(outer.x2, b.x2),
    y2: Math.min(outer.y2, b.y2),
  });
  const axisBboxes: [Box, Box, Box] = [
    clampBox({
      x1: vertices[0].x - AX_LABEL_W / 2,
      y1: vertices[0].y - 50,
      x2: vertices[0].x + AX_LABEL_W / 2,
      y2: vertices[0].y - 50 + AX_LABEL_H,
    }),
    clampBox({
      x1: vertices[1].x - AX_LABEL_W / 2 + 30,
      y1: vertices[1].y + 10,
      x2: vertices[1].x + AX_LABEL_W / 2 + 30,
      y2: vertices[1].y + 10 + AX_LABEL_H,
    }),
    clampBox({
      x1: vertices[2].x - AX_LABEL_W / 2 - 30,
      y1: vertices[2].y + 10,
      x2: vertices[2].x + AX_LABEL_W / 2 - 30,
      y2: vertices[2].y + 10 + AX_LABEL_H,
    }),
  ];

  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  const pointPos = props.point
    ? barycentric(vertices, [props.point.a, props.point.b, props.point.c])
    : undefined;

  return {
    outer,
    triangleBbox,
    vertices,
    axisBboxes,
    axes,
    title: props.title,
    titleBbox,
    pointPos,
  };
}

export function layoutTradeoffTriangle(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  axes?: [string, string, string];
  point?: { a: number; b: number; c: number };
  title?: string;
}): CompositeLayoutResult {
  const g = computeTradeoffTriangleGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  children.push({ kind: 'node', bbox: g.triangleBbox, label: 'triangle' });
  for (let i = 0; i < 3; i++) {
    children.push({ kind: 'text', bbox: g.axisBboxes[i], label: g.axes[i] });
  }
  if (g.pointPos) {
    children.push({
      kind: 'node',
      bbox: {
        x1: g.pointPos.x - 22,
        y1: g.pointPos.y - 22,
        x2: g.pointPos.x + 22,
        y2: g.pointPos.y + 22,
      },
      label: 'point',
    });
  }
  return { outer: g.outer, children };
}

export const TradeoffTriangle: React.FC<TradeoffTriangleProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 30,
    axes = ['Cost', 'Latency', 'Accuracy'],
    point,
    title,
  } = props;
  const g = computeTradeoffTriangleGeometry({ x, y, w, h, axes, point, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="TradeoffTriangle layout error"
          x={x + w / 2}
          y={y + h / 2 - 16}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={28}
          fill={COLORS.red}
          textAnchor="middle"
        />
        <HandWrittenText
          text={g.error.slice(0, 80)}
          x={x + w / 2}
          y={y + h / 2 + 24}
          startFrame={startFrame + 2}
          durationFrames={18}
          fontSize={18}
          fill={COLORS.red}
          textAnchor="middle"
        />
      </g>
    );
  }

  const { vertices, pointPos, titleBbox } = g;
  const d = `M ${vertices[0].x} ${vertices[0].y} L ${vertices[1].x} ${vertices[1].y} L ${vertices[2].x} ${vertices[2].y} Z`;
  const labelOffsets = [
    { dx: 0, dy: -40 },
    { dx: 30, dy: 30 },
    { dx: -30, dy: 30 },
  ];

  return (
    <g>
      {title && titleBbox && (
        <HandWrittenText
          text={title}
          x={(titleBbox.x1 + titleBbox.x2) / 2}
          y={titleBbox.y2 - 16}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={42}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      <AnimatedPath
        d={d}
        startFrame={startFrame}
        drawDuration={drawDuration}
        stroke={COLORS.outline}
        strokeWidth={3}
      />
      {axes.map((axis, i) => (
        <HandWrittenText
          key={`axis-${i}`}
          text={axis}
          x={vertices[i].x + labelOffsets[i].dx}
          y={vertices[i].y + labelOffsets[i].dy}
          startFrame={startFrame + drawDuration + i * 6}
          durationFrames={18}
          fontSize={36}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      ))}
      {pointPos && (
        <SketchCircle
          cx={pointPos.x}
          cy={pointPos.y}
          r={22}
          startFrame={startFrame + drawDuration + 30}
          drawDuration={15}
          stroke={COLORS.orange}
          strokeWidth={4}
          fill={COLORS.orange}
          fillOpacity={0.35}
        />
      )}
    </g>
  );
};
