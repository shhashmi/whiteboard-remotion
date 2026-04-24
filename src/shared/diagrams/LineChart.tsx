import React from 'react';
import { AnimatedPath, SketchCircle, HandWrittenText, SketchLine } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface LineChartPoint {
  x: number;
  y: number;
  label?: string;
}

export interface LineChartAnnotation {
  xValue: number;
  yValue: number;
  label: string;
  color?: string;
}

export interface LineChartProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  data: LineChartPoint[];
  xLabel?: string;
  yLabel?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  annotations?: LineChartAnnotation[];
  color?: string;
  title?: string;
}

const TITLE_H = 56;
const X_LABEL_H = 50;
const Y_LABEL_W = 50;
const MIN_PLOT_W = 200;
const MIN_PLOT_H = 150;

interface LineChartGeometry {
  outer: Box;
  plotRect: Box;
  titleBbox?: Box;
  title?: string;
  xLabelBbox?: Box;
  yLabelBbox?: Box;
  xLabel?: string;
  yLabel?: string;
  points: Array<{ sx: number; sy: number; data: LineChartPoint }>;
  annotations: Array<{ sx: number; sy: number; ann: LineChartAnnotation }>;
  error?: string;
}

function computeLineChartGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  data: LineChartPoint[];
  xLabel?: string;
  yLabel?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  annotations?: LineChartAnnotation[];
  title?: string;
}): LineChartGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const hasTitle = !!props.title;
  const hasXLabel = !!props.xLabel;
  const hasYLabel = !!props.yLabel;

  const plotX1 = outer.x1 + (hasYLabel ? Y_LABEL_W : 0);
  const plotY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const plotX2 = outer.x2;
  const plotY2 = outer.y2 - (hasXLabel ? X_LABEL_H : 0);
  const plotW = plotX2 - plotX1;
  const plotH = plotY2 - plotY1;

  if (plotW < MIN_PLOT_W || plotH < MIN_PLOT_H) {
    const needW = MIN_PLOT_W + (hasYLabel ? Y_LABEL_W : 0);
    const needH = MIN_PLOT_H + (hasTitle ? TITLE_H : 0) + (hasXLabel ? X_LABEL_H : 0);
    return {
      outer,
      plotRect: { x1: 0, y1: 0, x2: 0, y2: 0 },
      points: [],
      annotations: [],
      error: `LineChart requires rect ≥ ${needW}×${needH} (plot area ${MIN_PLOT_W}×${MIN_PLOT_H}); got ${Math.floor(props.w)}×${Math.floor(props.h)}`,
    };
  }

  const plotRect: Box = { x1: plotX1, y1: plotY1, x2: plotX2, y2: plotY2 };

  const xs = props.data.map((d) => d.x);
  const ys = props.data.map((d) => d.y);
  const xMin = props.xRange?.[0] ?? Math.min(...xs);
  const xMax = props.xRange?.[1] ?? Math.max(...xs);
  const yMin = props.yRange?.[0] ?? Math.min(...ys, 0);
  const yMax = props.yRange?.[1] ?? Math.max(...ys);

  const plot = (px: number, py: number) => ({
    sx: plotX1 + ((px - xMin) / (xMax - xMin || 1)) * plotW,
    sy: plotY1 + plotH - ((py - yMin) / (yMax - yMin || 1)) * plotH,
  });

  const points = props.data.map((pt) => ({ ...plot(pt.x, pt.y), data: pt }));
  const annotations = (props.annotations ?? []).map((ann) => ({
    ...plot(ann.xValue, ann.yValue),
    ann,
  }));

  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;
  const xLabelBbox: Box | undefined = hasXLabel
    ? { x1: plotX1, y1: plotY2, x2: plotX2, y2: plotY2 + X_LABEL_H }
    : undefined;
  const yLabelBbox: Box | undefined = hasYLabel
    ? { x1: outer.x1, y1: plotY1, x2: plotX1, y2: plotY2 }
    : undefined;

  return {
    outer,
    plotRect,
    title: props.title,
    titleBbox,
    xLabel: props.xLabel,
    xLabelBbox,
    yLabel: props.yLabel,
    yLabelBbox,
    points,
    annotations,
  };
}

export function layoutLineChart(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  data: LineChartPoint[];
  xLabel?: string;
  yLabel?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  annotations?: LineChartAnnotation[];
  title?: string;
}): CompositeLayoutResult {
  const g = computeLineChartGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  children.push({ kind: 'node', bbox: g.plotRect, label: 'plot' });
  if (g.xLabelBbox && g.xLabel) children.push({ kind: 'text', bbox: g.xLabelBbox, label: g.xLabel });
  if (g.yLabelBbox && g.yLabel) children.push({ kind: 'text', bbox: g.yLabelBbox, label: g.yLabel });
  for (const a of g.annotations) {
    children.push({
      kind: 'text',
      bbox: { x1: a.sx - 50, y1: a.sy - 56, x2: a.sx + 50, y2: a.sy - 20 },
      label: a.ann.label,
    });
  }
  return { outer: g.outer, children };
}

export const LineChart: React.FC<LineChartProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 40,
    data,
    xLabel,
    yLabel,
    xRange,
    yRange,
    annotations,
    color = COLORS.orange,
    title,
  } = props;

  const g = computeLineChartGeometry({ x, y, w, h, data, xLabel, yLabel, xRange, yRange, annotations, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="LineChart layout error"
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

  const { plotRect, points, annotations: annPositions, titleBbox, xLabelBbox, yLabelBbox } = g;
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.sx} ${p.sy}`)
    .join(' ');

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
      <SketchLine
        x1={plotRect.x1}
        y1={plotRect.y2}
        x2={plotRect.x2}
        y2={plotRect.y2}
        startFrame={startFrame}
        drawDuration={15}
        color={COLORS.outline}
        strokeWidth={3}
      />
      <SketchLine
        x1={plotRect.x1}
        y1={plotRect.y1}
        x2={plotRect.x1}
        y2={plotRect.y2}
        startFrame={startFrame}
        drawDuration={15}
        color={COLORS.outline}
        strokeWidth={3}
      />
      <AnimatedPath
        d={pathD}
        startFrame={startFrame + 18}
        drawDuration={drawDuration}
        stroke={color}
        strokeWidth={4}
        fill="none"
      />
      {points.map((p, i) => (
        <SketchCircle
          key={`dp-${i}`}
          cx={p.sx}
          cy={p.sy}
          r={9}
          startFrame={startFrame + 18 + drawDuration + i * 3}
          drawDuration={8}
          stroke={color}
          strokeWidth={3}
          fill={color}
          fillOpacity={0.8}
        />
      ))}
      {xLabel && xLabelBbox && (
        <HandWrittenText
          text={xLabel}
          x={(xLabelBbox.x1 + xLabelBbox.x2) / 2}
          y={xLabelBbox.y2 - 12}
          startFrame={startFrame + 20}
          durationFrames={18}
          fontSize={28}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {yLabel && yLabelBbox && (
        <HandWrittenText
          text={yLabel}
          x={yLabelBbox.x1 + 20}
          y={(yLabelBbox.y1 + yLabelBbox.y2) / 2}
          startFrame={startFrame + 20}
          durationFrames={18}
          fontSize={28}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {annPositions.map((a, i) => {
        const ac = a.ann.color ?? COLORS.blue;
        return (
          <g key={`ann-${i}`}>
            <SketchCircle
              cx={a.sx}
              cy={a.sy}
              r={18}
              startFrame={startFrame + 18 + drawDuration + 10}
              drawDuration={12}
              stroke={ac}
              strokeWidth={3}
              fill={ac}
              fillOpacity={0.2}
            />
            <HandWrittenText
              text={a.ann.label}
              x={a.sx}
              y={a.sy - 36}
              startFrame={startFrame + 18 + drawDuration + 18}
              durationFrames={18}
              fontSize={24}
              fill={ac}
              textAnchor="middle"
            />
          </g>
        );
      })}
    </g>
  );
};
