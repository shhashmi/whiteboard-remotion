import React from 'react';
import { FlowchartBuilder, FlowNode, FlowEdge } from './FlowchartBuilder';
import { COLORS } from '../theme';

export interface MemoryConsolidationFlowProps {
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

export const MemoryConsolidationFlow: React.FC<MemoryConsolidationFlowProps> = ({
  startFrame,
  stages = DEFAULT_STAGES,
  showDecayReturn = true,
  title = 'Memory Consolidation Lifecycle',
}) => {
  const centerY = 520;
  const colors = [COLORS.orange, COLORS.blue, COLORS.green, COLORS.gray1];
  const nodes: FlowNode[] = stages.map((label, i) => ({
    id: `s${i}`,
    label,
    kind: 'box',
    x: 220 + i * 440,
    y: centerY,
    color: colors[i],
    width: 320,
    height: 130,
  }));
  const edges: FlowEdge[] = [
    { from: 's0', to: 's1' },
    { from: 's1', to: 's2' },
    { from: 's2', to: 's3' },
  ];
  if (showDecayReturn) {
    edges.push({ from: 's3', to: 's1', label: 're-consolidate', color: COLORS.purple });
  }
  return (
    <FlowchartBuilder
      startFrame={startFrame}
      nodes={nodes}
      edges={edges}
      title={title}
    />
  );
};
