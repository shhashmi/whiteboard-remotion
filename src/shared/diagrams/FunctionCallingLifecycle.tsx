import React from 'react';
import { MaturityProgression, layoutMaturityProgression } from './MaturityProgression';
import type { CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface FunctionCallingLifecycleProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  phases?: [string, string, string, string];
  descriptions?: [string, string, string, string];
  highlightPhase?: 0 | 1 | 2 | 3;
  title?: string;
}

const DEFAULT_PHASES: [string, string, string, string] = [
  'Define',
  'Select',
  'Execute',
  'Inject',
];

const DEFAULT_DESCRIPTIONS: [string, string, string, string] = [
  'Declare tool schema',
  'LLM picks a tool',
  'Run tool, get result',
  'Inject back into context',
];

export function layoutFunctionCallingLifecycle(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  phases?: [string, string, string, string];
  descriptions?: [string, string, string, string];
  highlightPhase?: 0 | 1 | 2 | 3;
  title?: string;
}): CompositeLayoutResult {
  const phases = props.phases ?? DEFAULT_PHASES;
  const descriptions = props.descriptions ?? DEFAULT_DESCRIPTIONS;
  const stages = phases.map((label, i) => ({ label, description: descriptions[i] }));
  // Delegate to MaturityProgression — this wrapper adds no new children; the
  // highlighted phase is already visually distinct via `currentStage`.
  const inner = layoutMaturityProgression({
    x: props.x,
    y: props.y,
    w: props.w,
    h: props.h,
    stages,
    currentStage: props.highlightPhase,
    title: props.title ?? 'Function Calling Lifecycle',
  });
  if (inner.error) {
    return { outer: inner.outer, children: [], error: `FunctionCallingLifecycle: ${inner.error}` };
  }
  const children: CompositeChild[] = inner.children.map((c) => ({ ...c }));
  return { outer: inner.outer, children };
}

export const FunctionCallingLifecycle: React.FC<FunctionCallingLifecycleProps> = ({
  x,
  y,
  w,
  h,
  startFrame,
  phases = DEFAULT_PHASES,
  descriptions = DEFAULT_DESCRIPTIONS,
  highlightPhase,
  title = 'Function Calling Lifecycle',
}) => {
  const stages = phases.map((label, i) => ({
    label,
    description: descriptions[i],
  }));
  return (
    <MaturityProgression
      startFrame={startFrame}
      x={x}
      y={y}
      w={w}
      h={h}
      stages={stages}
      currentStage={highlightPhase}
      title={title}
    />
  );
};
