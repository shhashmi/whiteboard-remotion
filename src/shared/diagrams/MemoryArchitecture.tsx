import React from 'react';
import { SketchBox, HandWrittenText } from '../components';
import { COLORS } from '../theme';

export interface MemoryLayer {
  label: string;
  sublabel?: string;
  color?: string;
}

export interface MemoryArchitectureProps {
  startFrame: number;
  drawDuration?: number;
  layers?: MemoryLayer[];
  highlightLayer?: number;
  x?: number;
  y?: number;
  width?: number;
  layerHeight?: number;
  gap?: number;
  title?: string;
}

const DEFAULT_LAYERS: MemoryLayer[] = [
  { label: 'Short-term Context', sublabel: 'Current conversation window', color: COLORS.orange },
  { label: 'Episodic', sublabel: 'Past interactions & events', color: COLORS.blue },
  { label: 'Semantic', sublabel: 'Facts & learned knowledge', color: COLORS.green },
  { label: 'Procedural', sublabel: 'Learned skills & routines', color: COLORS.purple },
];

export const MemoryArchitecture: React.FC<MemoryArchitectureProps> = ({
  startFrame,
  drawDuration = 22,
  layers = DEFAULT_LAYERS,
  highlightLayer,
  x = 560,
  y = 180,
  width = 800,
  layerHeight = 150,
  gap = 20,
  title,
}) => {
  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={x + width / 2}
          y={y - 70}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={44}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {layers.map((layer, i) => {
        const isHighlight = highlightLayer === i;
        const accent = layer.color ?? COLORS.outline;
        const layerY = y + i * (layerHeight + gap);
        const appear = startFrame + i * 12;
        return (
          <g key={`layer-${i}`}>
            <SketchBox
              x={x}
              y={layerY}
              width={width}
              height={layerHeight}
              startFrame={appear}
              drawDuration={drawDuration}
              stroke={isHighlight ? accent : COLORS.outline}
              strokeWidth={isHighlight ? 4 : 2.5}
              fill={accent}
              fillOpacity={isHighlight ? 0.2 : 0.08}
              rx={14}
            />
            <HandWrittenText
              text={layer.label}
              x={x + 40}
              y={layerY + 50}
              startFrame={appear + 6}
              durationFrames={16}
              fontSize={40}
              fill={accent}
              fontWeight={700}
              textAnchor="start"
              baseline="hanging"
            />
            {layer.sublabel && (
              <HandWrittenText
                text={layer.sublabel}
                x={x + 40}
                y={layerY + 100}
                startFrame={appear + 12}
                durationFrames={16}
                fontSize={28}
                fill={COLORS.gray1}
                textAnchor="start"
                baseline="hanging"
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
