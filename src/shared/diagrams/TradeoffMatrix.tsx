import React from 'react';
import { SketchBox, SketchLine, HandWrittenText } from '../components';
import { COLORS } from '../theme';

export interface TradeoffMatrixProps {
  startFrame: number;
  drawDuration?: number;
  xAxis: { label: string; low: string; high: string };
  yAxis: { label: string; low: string; high: string };
  quadrants: [string, string, string, string];
  quadrantDetails?: [string?, string?, string?, string?];
  x?: number;
  y?: number;
  size?: number;
  title?: string;
}

export const TradeoffMatrix: React.FC<TradeoffMatrixProps> = ({
  startFrame,
  drawDuration = 25,
  xAxis,
  yAxis,
  quadrants,
  quadrantDetails = [],
  x = 560,
  y = 180,
  size = 720,
  title,
}) => {
  const cellSize = size / 2;
  const cells = [
    { cx: x, cy: y },
    { cx: x + cellSize, cy: y },
    { cx: x, cy: y + cellSize },
    { cx: x + cellSize, cy: y + cellSize },
  ];
  const cellColors = [COLORS.blue, COLORS.green, COLORS.yellow, COLORS.red];

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={x + size / 2}
          y={y - 90}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={42}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      <SketchBox
        x={x}
        y={y}
        width={size}
        height={size}
        startFrame={startFrame}
        drawDuration={drawDuration}
        stroke={COLORS.outline}
        strokeWidth={2.5}
        rx={6}
      />
      <SketchLine
        x1={x}
        y1={y + cellSize}
        x2={x + size}
        y2={y + cellSize}
        startFrame={startFrame + drawDuration}
        drawDuration={15}
        color={COLORS.outline}
        strokeWidth={2}
      />
      <SketchLine
        x1={x + cellSize}
        y1={y}
        x2={x + cellSize}
        y2={y + size}
        startFrame={startFrame + drawDuration}
        drawDuration={15}
        color={COLORS.outline}
        strokeWidth={2}
      />
      {cells.map((cell, i) => {
        const appear = startFrame + drawDuration + 20 + i * 8;
        return (
          <g key={`cell-${i}`}>
            <SketchBox
              x={cell.cx + 10}
              y={cell.cy + 10}
              width={cellSize - 20}
              height={cellSize - 20}
              startFrame={appear}
              drawDuration={15}
              stroke={cellColors[i]}
              fill={cellColors[i]}
              fillOpacity={0.12}
              rx={10}
            />
            <HandWrittenText
              text={quadrants[i]}
              x={cell.cx + cellSize / 2}
              y={cell.cy + cellSize / 2 - (quadrantDetails[i] ? 24 : 0)}
              startFrame={appear + 10}
              durationFrames={18}
              fontSize={36}
              fill={cellColors[i]}
              fontWeight={700}
              textAnchor="middle"
            />
            {quadrantDetails[i] && (
              <HandWrittenText
                text={quadrantDetails[i] as string}
                x={cell.cx + cellSize / 2}
                y={cell.cy + cellSize / 2 + 30}
                startFrame={appear + 16}
                durationFrames={18}
                fontSize={24}
                fill={COLORS.gray1}
                textAnchor="middle"
                maxWidth={cellSize - 60}
              />
            )}
          </g>
        );
      })}
      <HandWrittenText
        text={`↑ ${yAxis.label}`}
        x={x - 40}
        y={y + size / 2}
        startFrame={startFrame + drawDuration + 10}
        durationFrames={18}
        fontSize={30}
        fill={COLORS.outline}
        textAnchor="end"
      />
      <HandWrittenText
        text={xAxis.label}
        x={x + size / 2}
        y={y + size + 70}
        startFrame={startFrame + drawDuration + 10}
        durationFrames={18}
        fontSize={30}
        fill={COLORS.outline}
        textAnchor="middle"
      />
    </g>
  );
};
