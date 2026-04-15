import React from 'react';
import { Composition } from 'remotion';
import { CFPBExplainer } from './cfpb-riskcheck/CFPBExplainer';
import { ReActLoopTest } from './test-compositions/ReActLoopTest';
import {
  A2Test,
  A3Test,
  A4Test,
  A4HierTest,
  A4PeerTest,
  A5Test,
  A6Test,
  A7Test,
  A8Test,
  A9Test,
  A10Test,
  A11Test,
  A11SpotlightTest,
  A12Test,
} from './test-compositions/AllAComponents';
import {
  B1Test,
  B2Test,
  B3Test,
  B4Test,
  B5Test,
  B6Test,
  B7Test,
  B8Test,
} from './test-compositions/AllBDiagrams';
import { MotionsTest } from './test-compositions/AllMotions';
import { IconsTest } from './test-compositions/AllIcons';

const preview = (id: string, component: React.FC) => (
  <Composition
    id={id}
    component={component}
    durationInFrames={240}
    fps={30}
    width={1920}
    height={1080}
  />
);

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="CFPBRiskCheck"
        component={CFPBExplainer}
        durationInFrames={5100}
        fps={30}
        width={1280}
        height={720}
      />
      {preview('Test-ReActLoop', ReActLoopTest)}
      {preview('Test-AutonomySpectrum', A2Test)}
      {preview('Test-MemoryArchitecture', A3Test)}
      {preview('Test-AgentCoordination-Supervisor', A4Test)}
      {preview('Test-AgentCoordination-Hierarchical', A4HierTest)}
      {preview('Test-AgentCoordination-Peer', A4PeerTest)}
      {preview('Test-TradeoffTriangle', A5Test)}
      {preview('Test-TradeoffMatrix', A6Test)}
      {preview('Test-MaturityProgression', A7Test)}
      {preview('Test-FlowchartBuilder', A8Test)}
      {preview('Test-GraphNodeEdge', A9Test)}
      {preview('Test-CodeBlock', A10Test)}
      {preview('Test-AnnotationHighlight', A11Test)}
      {preview('Test-AnnotationSpotlight', A11SpotlightTest)}
      {preview('Test-LineChart', A12Test)}
      {preview('Test-FunctionCallingLifecycle', B1Test)}
      {preview('Test-ErrorBackoffFlow', B2Test)}
      {preview('Test-ChainOfThoughtTrace', B3Test)}
      {preview('Test-MemoryConsolidationFlow', B4Test)}
      {preview('Test-GeneratorCriticLoop', B5Test)}
      {preview('Test-GovernanceEvolution', B6Test)}
      {preview('Test-EntityRelationshipGraph', B7Test)}
      {preview('Test-ComparisonTable', B8Test)}
      {preview('Test-Motions', MotionsTest)}
      {preview('Test-Icons', IconsTest)}
    </>
  );
};
