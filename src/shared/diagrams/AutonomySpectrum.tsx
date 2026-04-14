import React from 'react';
import {
  AnimatedPath,
  SketchCircle,
  HandWrittenText,
  SketchLine,
} from '../components';
import { COLORS } from '../theme';

export interface AutonomySpectrumProps {
  startFrame: number;
  drawDuration?: number;
  levels?: string[];
  labels?: string[];
  marker?: number;
  x?: number;
  y?: number;
  width?: number;
  title?: string;
}

export const AutonomySpectrum: React.FC<AutonomySpectrumProps> = ({
  startFrame,
  drawDuration = 25,
  levels = ['L1', 'L2', 'L3', 'L4'],
  labels = ['Assistive', 'Supervised', 'Delegated', 'Autonomous'],
  marker,
  x = 200,
  y = 540,
  width = 1520,
  title,
}) => {
  const lineY = y;
  const lineX1 = x;
  const lineX2 = x + width;
  const tickPositions = levels.map(
    (_, i) => lineX1 + (width * i) / (levels.length - 1),
  );

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={x + width / 2}
          y={y - 140}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={44}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      <AnimatedPath
        d={`M ${lineX1} ${lineY} L ${lineX2} ${lineY}`}
        startFrame={startFrame}
        drawDuration={drawDuration}
        stroke={COLORS.outline}
        strokeWidth={4}
      />
      {tickPositions.map((tx, i) => (
        <g key={`tick-${i}`}>
          <SketchLine
            x1={tx}
            y1={lineY - 24}
            x2={tx}
            y2={lineY + 24}
            startFrame={startFrame + 10 + i * 6}
            drawDuration={8}
            color={COLORS.outline}
            strokeWidth={3}
          />
          <HandWrittenText
            text={levels[i]}
            x={tx}
            y={lineY + 70}
            startFrame={startFrame + drawDuration + i * 6}
            durationFrames={12}
            fontSize={40}
            fill={COLORS.outline}
            textAnchor="middle"
          />
          {labels[i] && (
            <HandWrittenText
              text={labels[i]}
              x={tx}
              y={lineY + 130}
              startFrame={startFrame + drawDuration + 10 + i * 6}
              durationFrames={14}
              fontSize={28}
              fill={COLORS.gray1}
              textAnchor="middle"
            />
          )}
        </g>
      ))}
      {marker !== undefined && marker >= 0 && marker < tickPositions.length && (
        <SketchCircle
          cx={tickPositions[marker]}
          cy={lineY}
          r={28}
          startFrame={startFrame + drawDuration + levels.length * 6 + 10}
          drawDuration={15}
          stroke={COLORS.orange}
          strokeWidth={4}
          fill={COLORS.orange}
          fillOpacity={0.25}
        />
      )}
    </g>
  );
};
