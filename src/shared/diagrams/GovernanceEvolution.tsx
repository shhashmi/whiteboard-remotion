import React from 'react';
import { AgentCoordination } from './AgentCoordination';
import { MaturityProgression } from './MaturityProgression';

export interface GovernanceEvolutionProps {
  startFrame: number;
  stages?: [string, string, string];
  currentStage?: 0 | 1 | 2;
  descriptions?: [string, string, string];
  title?: string;
}

const DEFAULT_STAGES: [string, string, string] = [
  'Centralized',
  'Hub-and-Spoke',
  'Advisory',
];

const DEFAULT_DESCRIPTIONS: [string, string, string] = [
  'One platform team owns everything',
  'Central platform + domain leads',
  'Central guidance, domain autonomy',
];

export const GovernanceEvolution: React.FC<GovernanceEvolutionProps> = ({
  startFrame,
  stages = DEFAULT_STAGES,
  currentStage,
  descriptions = DEFAULT_DESCRIPTIONS,
  title = 'Governance Evolution',
}) => {
  const stageObjs = stages.map((label, i) => ({
    label,
    description: descriptions[i],
  }));

  const patternForStage = (s: number): 'supervisor' | 'hierarchical' | 'peer' =>
    s === 0 ? 'supervisor' : s === 1 ? 'hierarchical' : 'peer';

  return (
    <g>
      <MaturityProgression
        startFrame={startFrame}
        stages={stageObjs}
        currentStage={currentStage}
        title={title}
        y={120}
        boxHeight={140}
      />
      {currentStage !== undefined && (
        <AgentCoordination
          startFrame={startFrame + 80}
          pattern={patternForStage(currentStage)}
          cx={960}
          cy={680}
          radius={220}
          agents={['Team A', 'Team B', 'Team C', 'Team D']}
          supervisor="Platform"
        />
      )}
    </g>
  );
};
