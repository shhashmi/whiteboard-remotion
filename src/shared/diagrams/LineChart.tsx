import React from 'react';
import { AnimatedPath, SketchCircle, HandWrittenText, SketchLine } from '../components';
import { COLORS } from '../theme';

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
  startFrame: number;
  drawDuration?: number;
  data: LineChartPoint[];
  xLabel?: string;
  yLabel?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  annotations?: LineChartAnnotation[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  title?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  startFrame,
  drawDuration = 40,
  data,
  xLabel,
  yLabel,
  xRange,
  yRange,
  annotations = [],
  x = 260,
  y = 220,
  width = 1400,
  height = 680,
  color = COLORS.orange,
  title,
}) => {
  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const xMin = xRange?.[0] ?? Math.min(...xs);
  const xMax = xRange?.[1] ?? Math.max(...xs);
  const yMin = yRange?.[0] ?? Math.min(...ys, 0);
  const yMax = yRange?.[1] ?? Math.max(...ys);

  const plot = (px: number, py: number) => ({
    sx: x + ((px - xMin) / (xMax - xMin || 1)) * width,
    sy: y + height - ((py - yMin) / (yMax - yMin || 1)) * height,
  });

  const pathD = data
    .map((pt, i) => {
      const { sx, sy } = plot(pt.x, pt.y);
      return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`;
    })
    .join(' ');

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={x + width / 2}
          y={y - 80}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={42}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      <SketchLine
        x1={x}
        y1={y + height}
        x2={x + width}
        y2={y + height}
        startFrame={startFrame}
        drawDuration={15}
        color={COLORS.outline}
        strokeWidth={3}
      />
      <SketchLine
        x1={x}
        y1={y}
        x2={x}
        y2={y + height}
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
      {data.map((pt, i) => {
        const { sx, sy } = plot(pt.x, pt.y);
        return (
          <SketchCircle
            key={`dp-${i}`}
            cx={sx}
            cy={sy}
            r={9}
            startFrame={startFrame + 18 + drawDuration + i * 3}
            drawDuration={8}
            stroke={color}
            strokeWidth={3}
            fill={color}
            fillOpacity={0.8}
          />
        );
      })}
      {xLabel && (
        <HandWrittenText
          text={xLabel}
          x={x + width / 2}
          y={y + height + 70}
          startFrame={startFrame + 20}
          durationFrames={18}
          fontSize={30}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {yLabel && (
        <HandWrittenText
          text={yLabel}
          x={x - 60}
          y={y + height / 2}
          startFrame={startFrame + 20}
          durationFrames={18}
          fontSize={30}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {annotations.map((a, i) => {
        const { sx, sy } = plot(a.xValue, a.yValue);
        const ac = a.color ?? COLORS.blue;
        return (
          <g key={`ann-${i}`}>
            <SketchCircle
              cx={sx}
              cy={sy}
              r={18}
              startFrame={startFrame + 18 + drawDuration + 10}
              drawDuration={12}
              stroke={ac}
              strokeWidth={3}
              fill={ac}
              fillOpacity={0.2}
            />
            <HandWrittenText
              text={a.label}
              x={sx}
              y={sy - 36}
              startFrame={startFrame + 18 + drawDuration + 18}
              durationFrames={18}
              fontSize={26}
              fill={ac}
              textAnchor="middle"
            />
          </g>
        );
      })}
    </g>
  );
};
