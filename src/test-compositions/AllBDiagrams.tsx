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
      <FunctionCallingLifecycle
        startFrame={0}
        x={120}
        y={280}
        w={1680}
        h={500}
        highlightPhase={2}
      />
    </SVG>
  </AbsoluteFill>
);

export const B2Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <ErrorBackoffFlow
        startFrame={0}
        x={200}
        y={140}
        w={1520}
        h={820}
        maxRetries={3}
        backoffSeconds={[1, 2, 4]}
        circuitBreaker
      />
    </SVG>
  </AbsoluteFill>
);

export const B3Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <ChainOfThoughtTrace
      startFrame={0}
      x={100}
      y={120}
      w={1720}
      h={820}
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
      <MemoryConsolidationFlow
        startFrame={0}
        x={140}
        y={260}
        w={1640}
        h={540}
      />
    </SVG>
  </AbsoluteFill>
);

export const B5Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <GeneratorCriticLoop
        startFrame={0}
        x={200}
        y={160}
        w={1520}
        h={760}
        iterations={3}
      />
    </SVG>
  </AbsoluteFill>
);

export const B6Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <GovernanceEvolution
        startFrame={0}
        x={160}
        y={120}
        w={1600}
        h={840}
        currentStage={1}
      />
    </SVG>
  </AbsoluteFill>
);

export const B7Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <EntityRelationshipGraph
        startFrame={0}
        x={200}
        y={120}
        w={1520}
        h={840}
        title="Knowledge Graph"
        entities={[
          { id: 'alice', label: 'Alice' },
          { id: 'tl', label: 'Tech Lead' },
          { id: 'atlas', label: 'Project Atlas' },
          { id: 'bob', label: 'Bob' },
          { id: 'rnd', label: 'R&D Team' },
          { id: 'q4', label: 'Q4 Goals' },
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
        x={160}
        y={140}
        w={1600}
        h={820}
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
