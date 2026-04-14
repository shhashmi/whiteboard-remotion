import React from 'react';
import { AnimatedPath, SketchCircle, HandWrittenText } from '../components';
import { COLORS } from '../theme';

export interface TradeoffTriangleProps {
  startFrame: number;
  drawDuration?: number;
  axes?: [string, string, string];
  point?: { a: number; b: number; c: number };
  cx?: number;
  cy?: number;
  size?: number;
  title?: string;
}

function barycentric(
  vertices: { x: number; y: number }[],
  weights: [number, number, number],
): { x: number; y: number } {
  const total = weights[0] + weights[1] + weights[2] || 1;
  return {
    x:
      (weights[0] * vertices[0].x +
        weights[1] * vertices[1].x +
        weights[2] * vertices[2].x) /
      total,
    y:
      (weights[0] * vertices[0].y +
        weights[1] * vertices[1].y +
        weights[2] * vertices[2].y) /
      total,
  };
}

export const TradeoffTriangle: React.FC<TradeoffTriangleProps> = ({
  startFrame,
  drawDuration = 30,
  axes = ['Cost', 'Latency', 'Accuracy'],
  point,
  cx = 960,
  cy = 580,
  size = 420,
  title,
}) => {
  const vertices = [
    { x: cx, y: cy - size },
    { x: cx + size * Math.cos(Math.PI / 6), y: cy + size * Math.sin(Math.PI / 6) },
    { x: cx - size * Math.cos(Math.PI / 6), y: cy + size * Math.sin(Math.PI / 6) },
  ];
  const d = `M ${vertices[0].x} ${vertices[0].y} L ${vertices[1].x} ${vertices[1].y} L ${vertices[2].x} ${vertices[2].y} Z`;
  const labelOffsets = [
    { dx: 0, dy: -40 },
    { dx: 70, dy: 30 },
    { dx: -70, dy: 30 },
  ];
  const pointPos = point ? barycentric(vertices, [point.a, point.b, point.c]) : null;

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={cx}
          y={cy - size - 100}
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
          fontSize={40}
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
