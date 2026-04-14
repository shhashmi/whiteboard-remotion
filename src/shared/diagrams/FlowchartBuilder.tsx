import React from 'react';
import { GraphNode, GraphEdge, GraphNodeShape } from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';

export type FlowNodeKind = 'box' | 'diamond' | 'terminal';

export interface FlowNode {
  id: string;
  label: string;
  kind?: FlowNodeKind;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  color?: string;
}

export interface FlowchartBuilderProps {
  startFrame: number;
  drawDuration?: number;
  nodeDelay?: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  title?: string;
}

const KIND_TO_SHAPE: Record<FlowNodeKind, GraphNodeShape> = {
  box: 'box',
  diamond: 'diamond',
  terminal: 'box',
};

export const FlowchartBuilder: React.FC<FlowchartBuilderProps> = ({
  startFrame,
  drawDuration = 20,
  nodeDelay = 10,
  nodes,
  edges,
  title,
}) => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const timeById = new Map(nodes.map((n, i) => [n.id, startFrame + i * nodeDelay]));

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={960}
          y={80}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={42}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {nodes.map((n) => {
        const shape = KIND_TO_SHAPE[n.kind ?? 'box'];
        const stroke = n.color ?? (n.kind === 'terminal' ? COLORS.green : COLORS.outline);
        return (
          <GraphNode
            key={`fn-${n.id}`}
            x={n.x}
            y={n.y}
            label={n.label}
            shape={shape}
            width={n.width ?? (n.kind === 'diamond' ? 320 : 240)}
            height={n.height ?? (n.kind === 'diamond' ? 180 : 100)}
            startFrame={timeById.get(n.id)!}
            drawDuration={drawDuration}
            stroke={stroke}
            rx={n.kind === 'terminal' ? 50 : 12}
          />
        );
      })}
      {edges.map((e, i) => {
        const from = byId.get(e.from);
        const to = byId.get(e.to);
        if (!from || !to) return null;
        const fromShape = KIND_TO_SHAPE[from.kind ?? 'box'];
        const toShape = KIND_TO_SHAPE[to.kind ?? 'box'];
        const fromSize = {
          w: from.width ?? (from.kind === 'diamond' ? 320 : 240),
          h: from.height ?? (from.kind === 'diamond' ? 180 : 100),
        };
        const toSize = {
          w: to.width ?? (to.kind === 'diamond' ? 320 : 240),
          h: to.height ?? (to.kind === 'diamond' ? 180 : 100),
        };
        const latestNodeTime = Math.max(timeById.get(e.from)!, timeById.get(e.to)!);
        return (
          <GraphEdge
            key={`fe-${i}`}
            from={{ x: from.x, y: from.y }}
            to={{ x: to.x, y: to.y }}
            fromShape={fromShape}
            toShape={toShape}
            fromSize={fromSize}
            toSize={toSize}
            startFrame={latestNodeTime + drawDuration}
            drawDuration={12}
            color={e.color ?? COLORS.orange}
            label={e.label}
          />
        );
      })}
    </g>
  );
};
