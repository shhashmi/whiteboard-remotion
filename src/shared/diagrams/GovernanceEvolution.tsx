import React from 'react';
import {
  AgentCoordination,
  layoutAgentCoordination,
} from './AgentCoordination';
import {
  MaturityProgression,
  layoutMaturityProgression,
} from './MaturityProgression';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface GovernanceEvolutionProps {
  x: number;
  y: number;
  w: number;
  h: number;
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

const TOP_RATIO = 0.35;
const SECTION_GAP = 40;
const MIN_TOP_H = 260;
const MIN_BOTTOM_H = 380;
const AGENT_PATTERN_MAX_W = 1080;

const patternForStage = (s: number): 'supervisor' | 'hierarchical' | 'peer' => {
  const clamped = Math.max(0, Math.min(2, s));
  return clamped === 0 ? 'supervisor' : clamped === 1 ? 'hierarchical' : 'peer';
};

interface GovernanceGeometry {
  outer: Box;
  topRect: Box;
  bottomRect?: Box;
  progressionChildren: CompositeChild[];
  coordinationChildren: CompositeChild[];
  topError?: string;
  bottomError?: string;
  error?: string;
  stages: [string, string, string];
  descriptions: [string, string, string];
  currentStage?: 0 | 1 | 2;
  title: string;
}

function computeGovernanceGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  stages?: [string, string, string];
  currentStage?: 0 | 1 | 2;
  descriptions?: [string, string, string];
  title?: string;
}): GovernanceGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const stages = props.stages ?? DEFAULT_STAGES;
  const descriptions = props.descriptions ?? DEFAULT_DESCRIPTIONS;
  const title = props.title ?? 'Governance Evolution';

  const showCoord = props.currentStage !== undefined;
  const topH = showCoord
    ? Math.max(MIN_TOP_H, Math.floor(props.h * TOP_RATIO))
    : props.h;
  const topRect: Box = {
    x1: outer.x1,
    y1: outer.y1,
    x2: outer.x2,
    y2: outer.y1 + topH,
  };

  // MaturityProgression for the top band (title embedded there).
  const stageObjs = stages.map((label, i) => ({ label, description: descriptions[i] }));
  const topLayout = layoutMaturityProgression({
    x: topRect.x1,
    y: topRect.y1,
    w: topRect.x2 - topRect.x1,
    h: topRect.y2 - topRect.y1,
    stages: stageObjs,
    currentStage: props.currentStage,
    title,
  });

  let bottomRect: Box | undefined;
  let coordinationChildren: CompositeChild[] = [];
  let bottomError: string | undefined;

  if (showCoord) {
    const bottomY1 = topRect.y2 + SECTION_GAP;
    const bottomH = outer.y2 - bottomY1;
    if (bottomH < MIN_BOTTOM_H) {
      bottomError = `bottom pattern section needs ≥ ${MIN_BOTTOM_H}px; got ${Math.floor(bottomH)}px`;
    } else {
      // Center the AgentCoordination pattern horizontally; cap its width.
      const bottomW = Math.min(AGENT_PATTERN_MAX_W, props.w);
      const bottomX1 = outer.x1 + Math.floor((props.w - bottomW) / 2);
      bottomRect = {
        x1: bottomX1,
        y1: bottomY1,
        x2: bottomX1 + bottomW,
        y2: outer.y2,
      };
      const coordLayout = layoutAgentCoordination({
        x: bottomRect.x1,
        y: bottomRect.y1,
        w: bottomRect.x2 - bottomRect.x1,
        h: bottomRect.y2 - bottomRect.y1,
        pattern: patternForStage(props.currentStage!),
        agents: ['Team A', 'Team B', 'Team C', 'Team D'],
        supervisor: 'Platform',
      });
      if (coordLayout.error) {
        bottomError = coordLayout.error;
      } else {
        coordinationChildren = coordLayout.children;
      }
    }
  }

  return {
    outer,
    topRect,
    bottomRect,
    progressionChildren: topLayout.children,
    coordinationChildren,
    topError: topLayout.error,
    bottomError,
    error: topLayout.error ?? bottomError,
    stages,
    descriptions,
    currentStage: props.currentStage,
    title,
  };
}

export function layoutGovernanceEvolution(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  stages?: [string, string, string];
  currentStage?: 0 | 1 | 2;
  descriptions?: [string, string, string];
  title?: string;
}): CompositeLayoutResult {
  const g = computeGovernanceGeometry(props);
  if (g.error) {
    return { outer: g.outer, children: [], error: `GovernanceEvolution: ${g.error}` };
  }

  const children: CompositeChild[] = [];
  for (const c of g.progressionChildren) children.push({ ...c });
  for (const c of g.coordinationChildren) children.push({ ...c });
  return { outer: g.outer, children };
}

export const GovernanceEvolution: React.FC<GovernanceEvolutionProps> = ({
  x,
  y,
  w,
  h,
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

  const g = computeGovernanceGeometry({ x, y, w, h, stages, currentStage, descriptions, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="GovernanceEvolution layout error"
          x={x + w / 2}
          y={y + h / 2 - 16}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={28}
          fill={COLORS.red}
          textAnchor="middle"
        />
        <HandWrittenText
          text={g.error.slice(0, 80)}
          x={x + w / 2}
          y={y + h / 2 + 24}
          startFrame={startFrame + 2}
          durationFrames={18}
          fontSize={18}
          fill={COLORS.red}
          textAnchor="middle"
        />
      </g>
    );
  }

  return (
    <g>
      <MaturityProgression
        startFrame={startFrame}
        x={g.topRect.x1}
        y={g.topRect.y1}
        w={g.topRect.x2 - g.topRect.x1}
        h={g.topRect.y2 - g.topRect.y1}
        stages={stageObjs}
        currentStage={currentStage}
        title={title}
      />
      {currentStage !== undefined && g.bottomRect && (
        <AgentCoordination
          startFrame={startFrame + 80}
          pattern={patternForStage(currentStage)}
          x={g.bottomRect.x1}
          y={g.bottomRect.y1}
          w={g.bottomRect.x2 - g.bottomRect.x1}
          h={g.bottomRect.y2 - g.bottomRect.y1}
          agents={['Team A', 'Team B', 'Team C', 'Team D']}
          supervisor="Platform"
        />
      )}
    </g>
  );
};
