import React from 'react';
import { MaturityProgression } from './MaturityProgression';
import { AnnotationHighlight } from './AnnotationHighlight';

export interface FunctionCallingLifecycleProps {
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

export const FunctionCallingLifecycle: React.FC<FunctionCallingLifecycleProps> = ({
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
    <g>
      <MaturityProgression
        startFrame={startFrame}
        stages={stages}
        currentStage={highlightPhase}
        title={title}
        y={430}
        boxHeight={160}
      />
      {highlightPhase !== undefined && (
        <AnnotationHighlight
          startFrame={startFrame + 90}
          style="callout"
          target={{
            x: 100 + (highlightPhase + 0.5) * ((1720 - 3 * 40) / 4) + highlightPhase * 40,
            y: 430 + 80,
            width: 200,
            height: 20,
          }}
          label="← current phase"
          labelPosition="right"
        />
      )}
    </g>
  );
};
