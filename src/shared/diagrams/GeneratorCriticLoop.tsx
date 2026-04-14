import React from 'react';
import { GraphNode, GraphEdge } from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';

export interface GeneratorCriticLoopProps {
  startFrame: number;
  generatorLabel?: string;
  criticLabel?: string;
  iterations?: number;
  title?: string;
}

export const GeneratorCriticLoop: React.FC<GeneratorCriticLoopProps> = ({
  startFrame,
  generatorLabel = 'Generator',
  criticLabel = 'Critic',
  iterations = 3,
  title = 'Generator ↔ Critic',
}) => {
  const cy = 540;
  const genX = 540;
  const critX = 1380;
  const nodeSize = { w: 300, h: 140 };

  return (
    <g>
      <HandWrittenText
          text={title}
          x={960}
          y={80}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={44}
          fill={COLORS.outline}
          textAnchor="middle"
        />
        <GraphNode
          x={genX}
          y={cy}
          label={generatorLabel}
          width={nodeSize.w}
          height={nodeSize.h}
          startFrame={startFrame + 10}
          stroke={COLORS.orange}
          fill={COLORS.orange}
          fillOpacity={0.15}
          fontSize={40}
          labelColor={COLORS.orange}
        />
        <GraphNode
          x={critX}
          y={cy}
          label={criticLabel}
          width={nodeSize.w}
          height={nodeSize.h}
          startFrame={startFrame + 25}
          stroke={COLORS.blue}
          fill={COLORS.blue}
          fillOpacity={0.15}
          fontSize={40}
          labelColor={COLORS.blue}
        />
        <GraphEdge
          from={{ x: genX, y: cy - 30 }}
          to={{ x: critX, y: cy - 30 }}
          fromSize={nodeSize}
          toSize={nodeSize}
          startFrame={startFrame + 50}
          drawDuration={15}
          color={COLORS.orange}
          label="draft"
        />
        <GraphEdge
          from={{ x: critX, y: cy + 30 }}
          to={{ x: genX, y: cy + 30 }}
          fromSize={nodeSize}
          toSize={nodeSize}
          startFrame={startFrame + 70}
          drawDuration={15}
          color={COLORS.blue}
          label="critique"
        />
      <HandWrittenText
        text={`× ${iterations} iterations`}
        x={960}
        y={cy + 220}
        startFrame={startFrame + 90}
        durationFrames={20}
        fontSize={36}
        fill={COLORS.gray1}
        textAnchor="middle"
      />
    </g>
  );
};
