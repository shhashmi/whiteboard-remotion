import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SVG } from '../shared/components';
import { AutonomySpectrum } from '../shared/diagrams/AutonomySpectrum';
import { MemoryArchitecture } from '../shared/diagrams/MemoryArchitecture';
import { AgentCoordination } from '../shared/diagrams/AgentCoordination';
import { TradeoffTriangle } from '../shared/diagrams/TradeoffTriangle';
import { TradeoffMatrix } from '../shared/diagrams/TradeoffMatrix';
import { MaturityProgression } from '../shared/diagrams/MaturityProgression';
import { FlowchartBuilder } from '../shared/diagrams/FlowchartBuilder';
import { GraphNode, GraphEdge } from '../shared/diagrams/GraphNodeEdge';
import { CodeBlock } from '../shared/diagrams/CodeBlock';
import { AnnotationHighlight } from '../shared/diagrams/AnnotationHighlight';
import { LineChart } from '../shared/diagrams/LineChart';

const BG = '#fafaf5';

export const A2Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <AutonomySpectrum
        startFrame={0}
        x={160}
        y={320}
        w={1600}
        h={440}
        title="Agent Autonomy Spectrum"
        marker={2}
      />
    </SVG>
  </AbsoluteFill>
);

export const A3Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <MemoryArchitecture
        startFrame={0}
        x={560}
        y={140}
        w={800}
        h={820}
        title="Agent Memory Architecture"
        highlightLayer={1}
      />
    </SVG>
  </AbsoluteFill>
);

export const A4Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <AgentCoordination
        startFrame={0}
        x={360}
        y={140}
        w={1200}
        h={800}
        pattern="supervisor"
        title="Supervisor Pattern"
        agents={['Researcher', 'Coder', 'Reviewer', 'Tester']}
      />
    </SVG>
  </AbsoluteFill>
);

export const A4HierTest: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <AgentCoordination
        startFrame={0}
        x={240}
        y={140}
        w={1440}
        h={800}
        pattern="hierarchical"
        title="Hierarchical Pattern"
      />
    </SVG>
  </AbsoluteFill>
);

export const A4PeerTest: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <AgentCoordination
        startFrame={0}
        x={360}
        y={140}
        w={1200}
        h={800}
        pattern="peer"
        title="Peer-to-Peer Pattern"
      />
    </SVG>
  </AbsoluteFill>
);

export const A5Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <TradeoffTriangle
        startFrame={0}
        x={520}
        y={120}
        w={880}
        h={840}
        title="Cost / Latency / Accuracy"
        point={{ a: 1, b: 2, c: 3 }}
      />
    </SVG>
  </AbsoluteFill>
);

export const A6Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <TradeoffMatrix
        startFrame={0}
        x={520}
        y={120}
        w={880}
        h={840}
        title="Effort vs Impact"
        xAxis={{ label: 'Effort', low: 'Low', high: 'High' }}
        yAxis={{ label: 'Impact', low: 'Low', high: 'High' }}
        quadrants={['Quick Wins', 'Major Projects', 'Fill-ins', 'Thankless']}
        quadrantDetails={[
          'Do now',
          'Plan carefully',
          'When bored',
          'Avoid',
        ]}
      />
    </SVG>
  </AbsoluteFill>
);

export const A7Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <MaturityProgression
        startFrame={0}
        x={100}
        y={240}
        w={1720}
        h={560}
        title="Enterprise AI Adoption Stages"
        currentStage={2}
        stages={[
          { label: 'Experimentation', adoptionPct: 45, description: 'Pilots, POCs' },
          { label: 'Operationalization', adoptionPct: 30, description: 'Production systems' },
          { label: 'Scaling', adoptionPct: 18, description: 'Org-wide rollout' },
          { label: 'Embedded', adoptionPct: 7, description: 'Core business logic' },
        ]}
      />
    </SVG>
  </AbsoluteFill>
);

export const A8Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <FlowchartBuilder
        startFrame={0}
        x={140}
        y={140}
        w={1640}
        h={800}
        title="Tool Call Decision"
        nodes={[
          { id: 'start', label: 'Start', kind: 'terminal', row: 0, col: 1 },
          { id: 'check', label: 'Need tool?', kind: 'diamond', row: 1, col: 1 },
          { id: 'call', label: 'Call tool', kind: 'box', row: 1, col: 2 },
          { id: 'answer', label: 'Answer directly', kind: 'box', row: 2, col: 1 },
          { id: 'end', label: 'End', kind: 'terminal', row: 2, col: 2 },
        ]}
        edges={[
          { from: 'start', to: 'check' },
          { from: 'check', to: 'call', label: 'yes' },
          { from: 'check', to: 'answer', label: 'no' },
          { from: 'call', to: 'end' },
          { from: 'answer', to: 'end' },
        ]}
      />
    </SVG>
  </AbsoluteFill>
);

export const A9Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <GraphNode x={400} y={400} label="Box" shape="box" startFrame={0} />
      <GraphNode x={960} y={400} label="Diamond" shape="diamond" startFrame={10} />
      <GraphNode x={1520} y={400} label="Circle" shape="circle" startFrame={20} />
      <GraphEdge
        from={{ x: 400, y: 400 }}
        to={{ x: 960, y: 400 }}
        startFrame={30}
      />
      <GraphEdge
        from={{ x: 960, y: 400 }}
        to={{ x: 1520, y: 400 }}
        toShape="circle"
        startFrame={40}
        label="connects"
      />
      <GraphEdge
        from={{ x: 400, y: 400 }}
        to={{ x: 1520, y: 400 }}
        toShape="circle"
        directed={false}
        startFrame={50}
      />
    </SVG>
  </AbsoluteFill>
);

export const A10Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <CodeBlock
      startFrame={0}
      x={280}
      y={180}
      w={1360}
      h={720}
      title="Function calling schema"
      language="python"
      code={`def search(query: str, top_k: int = 5) -> list[str]:
    """Look up the top-k matching entries."""
    results = vector_db.query(query, k=top_k)
    return [r.text for r in results]

# Register with the LLM
tools = [FunctionTool(search)]
agent = Agent(model="claude-opus", tools=tools)`}
      highlightLines={[3, 4]}
      revealMode="line"
    />
  </AbsoluteFill>
);

export const A11Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <GraphNode x={500} y={450} label="Highlight target" startFrame={0} width={320} height={110} />
      <AnnotationHighlight
        startFrame={15}
        style="highlight"
        x={340}
        y={395}
        w={320}
        h={110}
        label="Highlight style"
        labelPosition="above"
      />
      <GraphNode x={1400} y={450} label="Callout target" startFrame={0} width={320} height={110} />
      <AnnotationHighlight
        startFrame={20}
        style="callout"
        x={1240}
        y={395}
        w={320}
        h={110}
        label="Callout points here"
        labelPosition="above"
      />
    </SVG>
  </AbsoluteFill>
);

export const A11SpotlightTest: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <GraphNode x={500} y={540} label="Other content" startFrame={0} width={260} height={100} />
      <GraphNode x={1400} y={540} label="Other content" startFrame={0} width={260} height={100} />
      <GraphNode x={960} y={540} label="Spotlight target" startFrame={0} width={300} height={110} />
      <AnnotationHighlight
        startFrame={15}
        style="spotlight"
        x={810}
        y={485}
        w={300}
        h={110}
        label="Spotlight style"
        labelPosition="below"
      />
    </SVG>
  </AbsoluteFill>
);

export const A12Test: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      <LineChart
        startFrame={0}
        x={220}
        y={140}
        w={1480}
        h={820}
        title="Accuracy vs Sample Count"
        xLabel="Samples"
        yLabel="Accuracy %"
        data={[
          { x: 1, y: 62 },
          { x: 5, y: 74 },
          { x: 10, y: 82 },
          { x: 20, y: 87 },
          { x: 40, y: 90 },
          { x: 80, y: 91 },
        ]}
        annotations={[{ xValue: 20, yValue: 87, label: 'Sweet spot' }]}
      />
    </SVG>
  </AbsoluteFill>
);
