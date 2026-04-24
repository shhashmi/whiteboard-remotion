import React from 'react';
import {
  FlowchartBuilder,
  FlowNode,
  FlowEdge,
  layoutFlowchartBuilder,
} from './FlowchartBuilder';
import { COLORS } from '../theme';
import type { CompositeLayoutResult } from '../../asset-index/bounds';

export interface MemoryConsolidationFlowProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  stages?: [string, string, string, string];
  showDecayReturn?: boolean;
  title?: string;
}

const DEFAULT_STAGES: [string, string, string, string] = [
  'New Experience',
  'Consolidation',
  'Retrieval',
  'Decay / GC',
];

function buildNodesAndEdges(
  stages: [string, string, string, string],
  showDecayReturn: boolean,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  // Single row, 4 columns. The original placed nodes at centerY=520 with
  // uniform horizontal spacing; the new grid produces the same topology.
  const colors = [COLORS.orange, COLORS.blue, COLORS.green, COLORS.gray1];
  const nodes: FlowNode[] = stages.map((label, i) => ({
    id: `s${i}`,
    label,
    kind: 'box',
    row: 0,
    col: i,
    color: colors[i],
  }));
  const edges: FlowEdge[] = [
    { from: 's0', to: 's1' },
    { from: 's1', to: 's2' },
    { from: 's2', to: 's3' },
  ];
  if (showDecayReturn) {
    edges.push({ from: 's3', to: 's1', label: 're-consolidate', color: COLORS.purple });
  }
  return { nodes, edges };
}

export function layoutMemoryConsolidationFlow(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  stages?: [string, string, string, string];
  showDecayReturn?: boolean;
  title?: string;
}): CompositeLayoutResult {
  const { nodes } = buildNodesAndEdges(
    props.stages ?? DEFAULT_STAGES,
    props.showDecayReturn ?? true,
  );
  const inner = layoutFlowchartBuilder({
    x: props.x,
    y: props.y,
    w: props.w,
    h: props.h,
    nodes,
    title: props.title ?? 'Memory Consolidation Lifecycle',
  });
  if (inner.error) {
    return { outer: inner.outer, children: [], error: `MemoryConsolidationFlow: ${inner.error}` };
  }
  return inner;
}

export const MemoryConsolidationFlow: React.FC<MemoryConsolidationFlowProps> = ({
  x,
  y,
  w,
  h,
  startFrame,
  stages = DEFAULT_STAGES,
  showDecayReturn = true,
  title = 'Memory Consolidation Lifecycle',
}) => {
  const { nodes, edges } = buildNodesAndEdges(stages, showDecayReturn);
  return (
    <FlowchartBuilder
      startFrame={startFrame}
      x={x}
      y={y}
      w={w}
      h={h}
      nodes={nodes}
      edges={edges}
      title={title}
    />
  );
};
