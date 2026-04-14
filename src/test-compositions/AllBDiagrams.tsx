import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SVG } from '../shared/components';
import { FunctionCallingLifecycle } from '../shared/diagrams/FunctionCallingLifecycle';
import { ErrorBackoffFlow } from '../shared/diagrams/ErrorBackoffFlow';
import { ChainOfThoughtTrace } from '../shared/diagrams/ChainOfThoughtTrace';
import { MemoryConsolidationFlow } from '../shared/diagrams/MemoryConsolidationFlow';
import { GeneratorCriticLoop } from '../shared/diagrams/GeneratorCriticLoop';
import { GovernanceEvolution } from '../shared/diagrams/GovernanceEvolution';
import { EntityRelationshipGraph } from '../shared/diagrams/EntityRelationshipGraph';
import { ComparisonTable } from '../shared/diagrams/ComparisonTable';

const BG = '#fafaf5';

export const B1Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <FunctionCallingLifecycle startFrame={0} highlightPhase={2} />
    </SVG>
  </AbsoluteFill>
);

export const B2Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <ErrorBackoffFlow startFrame={0} maxRetries={3} backoffSeconds={[1, 2, 4]} circuitBreaker />
    </SVG>
  </AbsoluteFill>
);

export const B3Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <ChainOfThoughtTrace
      startFrame={0}
      steps={[
        'Parse the user question',
        'Identify relevant documents',
        'Extract matching facts',
        'Synthesize final response',
      ]}
      finalAnswer="ROI is 2.3× after 18 months"
      schema={`{
  "reasoning": string[],
  "confidence": number,
  "answer": string
}`}
    />
  </AbsoluteFill>
);

export const B4Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <MemoryConsolidationFlow startFrame={0} />
    </SVG>
  </AbsoluteFill>
);

export const B5Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <GeneratorCriticLoop startFrame={0} iterations={3} />
    </SVG>
  </AbsoluteFill>
);

export const B6Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <GovernanceEvolution startFrame={0} currentStage={1} />
    </SVG>
  </AbsoluteFill>
);

export const B7Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <EntityRelationshipGraph
        startFrame={0}
        title="Knowledge Graph"
        entities={[
          { id: 'alice', label: 'Alice', x: 380, y: 300 },
          { id: 'tl', label: 'Tech Lead', x: 960, y: 300 },
          { id: 'atlas', label: 'Project Atlas', x: 1540, y: 300 },
          { id: 'bob', label: 'Bob', x: 380, y: 720 },
          { id: 'rnd', label: 'R&D Team', x: 960, y: 720 },
          { id: 'q4', label: 'Q4 Goals', x: 1540, y: 720 },
        ]}
        relationships={[
          { from: 'alice', to: 'tl', label: 'role' },
          { from: 'tl', to: 'atlas', label: 'leads' },
          { from: 'bob', to: 'rnd', label: 'member' },
          { from: 'rnd', to: 'atlas', label: 'owns' },
          { from: 'atlas', to: 'q4', label: 'delivers' },
        ]}
        highlightPath={['alice', 'tl', 'atlas', 'q4']}
      />
    </SVG>
  </AbsoluteFill>
);

export const B8Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <ComparisonTable
        startFrame={0}
        title="Vector Database Comparison"
        columns={['Database', 'Latency', 'Cost', 'Features']}
        rows={[
          ['Pinecone', '< 100ms', '$$$', 'Managed, filters'],
          ['Weaviate', '< 80ms', '$$', 'Hybrid search'],
          ['pgvector', '< 150ms', '$', 'SQL-native'],
          ['Qdrant', '< 60ms', '$$', 'OSS, filters'],
        ]}
        highlightCells={[[3, 1]]}
      />
    </SVG>
  </AbsoluteFill>
);
