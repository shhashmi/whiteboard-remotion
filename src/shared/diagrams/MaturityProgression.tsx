import React from 'react';
import { SketchBox, SketchArrow, HandWrittenText } from '../components';
import { COLORS } from '../theme';

export interface MaturityStage {
  label: string;
  adoptionPct?: number;
  description?: string;
}

export interface MaturityProgressionProps {
  startFrame: number;
  drawDuration?: number;
  stages?: MaturityStage[];
  currentStage?: number;
  x?: number;
  y?: number;
  width?: number;
  boxHeight?: number;
  title?: string;
}

const DEFAULT_STAGES: MaturityStage[] = [
  { label: 'Experimentation' },
  { label: 'Operationalization' },
  { label: 'Scaling' },
  { label: 'Embedded' },
];

export const MaturityProgression: React.FC<MaturityProgressionProps> = ({
  startFrame,
  drawDuration = 22,
  stages = DEFAULT_STAGES,
  currentStage,
  x = 100,
  y = 400,
  width = 1720,
  boxHeight = 160,
  title,
}) => {
  const gap = 40;
  const boxW = (width - gap * (stages.length - 1)) / stages.length;
  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={x + width / 2}
          y={y - 100}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={44}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {stages.map((stage, i) => {
        const bx = x + i * (boxW + gap);
        const isCurrent = currentStage === i;
        const appear = startFrame + i * 15;
        return (
          <g key={`stage-${i}`}>
            <SketchBox
              x={bx}
              y={y}
              width={boxW}
              height={boxHeight}
              startFrame={appear}
              drawDuration={drawDuration}
              stroke={isCurrent ? COLORS.orange : COLORS.outline}
              strokeWidth={isCurrent ? 4 : 2.5}
              fill={isCurrent ? COLORS.orange : COLORS.blue}
              fillOpacity={isCurrent ? 0.25 : 0.08}
              rx={12}
            />
            <HandWrittenText
              text={stage.label}
              x={bx + boxW / 2}
              y={y + boxHeight / 2 - (stage.adoptionPct !== undefined || stage.description ? 28 : 0)}
              startFrame={appear + 8}
              durationFrames={18}
              fontSize={34}
              fill={isCurrent ? COLORS.orange : COLORS.outline}
              fontWeight={700}
              textAnchor="middle"
            />
            {stage.adoptionPct !== undefined && (
              <HandWrittenText
                text={`${stage.adoptionPct}%`}
                x={bx + boxW / 2}
                y={y + boxHeight / 2 + 28}
                startFrame={appear + 14}
                durationFrames={18}
                fontSize={32}
                fill={COLORS.green}
                fontWeight={700}
                textAnchor="middle"
              />
            )}
            {stage.description && (
              <HandWrittenText
                text={stage.description}
                x={bx + boxW / 2}
                y={y + boxHeight + 40}
                startFrame={appear + 18}
                durationFrames={18}
                fontSize={24}
                fill={COLORS.gray1}
                textAnchor="middle"
                maxWidth={boxW - 20}
              />
            )}
            {i < stages.length - 1 && (
              <SketchArrow
                x1={bx + boxW + 4}
                y1={y + boxHeight / 2}
                x2={bx + boxW + gap - 4}
                y2={y + boxHeight / 2}
                startFrame={appear + drawDuration}
                drawDuration={10}
                color={COLORS.orange}
                strokeWidth={3}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
