import type { AssetEntry } from './types';

export const ASSET_REGISTRY: AssetEntry[] = [
  {
    id: 'A1',
    kind: 'diagram',
    name: 'ReActLoop',
    importPath: '@/shared/diagrams/ReActLoop',
    filePath: 'src/shared/diagrams/ReActLoop.tsx',
    concepts: [
      'react loop',
      'observe think act',
      'agent decision loop',
      'perception action cycle',
      'reasoning loop',
    ],
    tags: ['agents', 'loop', 'core'],
    description:
      'Cyclical Observe → Think → Act diagram for agent reasoning loops. Optional memory and tool-call branches.',
    previewPath: 'src/asset-index/previews/A1.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 20 },
        stepDelay: { type: 'number', default: 15 },
        steps: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
        showMemory: { type: 'boolean', default: false },
        showTools: { type: 'boolean', default: false },
        highlightStep: { type: 'integer', enum: [0, 1, 2] },
        cx: { type: 'number', default: 960 },
        cy: { type: 'number', default: 540 },
        radius: { type: 'number', default: 320 },
      },
    },
  },
  {
    id: 'A2',
    kind: 'diagram',
    name: 'AutonomySpectrum',
    importPath: '@/shared/diagrams/AutonomySpectrum',
    filePath: 'src/shared/diagrams/AutonomySpectrum.tsx',
    concepts: [
      'autonomy levels',
      'autonomy spectrum',
      'SAE levels',
      'agent autonomy L1 L2 L3 L4',
      'assistance to autonomous continuum',
    ],
    tags: ['agents', 'spectrum', 'levels'],
    description: 'Horizontal L1–L4 autonomy spectrum with labeled markers for tools/agents.',
    previewPath: 'src/asset-index/previews/A2.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 25 },
        levels: { type: 'array', items: { type: 'string' } },
        labels: { type: 'array', items: { type: 'string' } },
        marker: { type: 'integer', minimum: 0 },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'A3',
    kind: 'diagram',
    name: 'MemoryArchitecture',
    importPath: '@/shared/diagrams/MemoryArchitecture',
    filePath: 'src/shared/diagrams/MemoryArchitecture.tsx',
    concepts: [
      'agent memory',
      'memory architecture',
      'short term long term memory',
      'episodic semantic procedural memory',
      'memory layers',
    ],
    tags: ['agents', 'memory', 'architecture'],
    description:
      'Stacked memory layers: short-term context over episodic, semantic, and procedural long-term memory.',
    previewPath: 'src/asset-index/previews/A3.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 22 },
        layers: {
          type: 'array',
          items: {
            type: 'object',
            required: ['label'],
            properties: {
              label: { type: 'string' },
              sublabel: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
        highlightLayer: { type: 'integer', minimum: 0 },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        layerHeight: { type: 'number' },
        gap: { type: 'number' },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'A4',
    kind: 'diagram',
    name: 'AgentCoordination',
    importPath: '@/shared/diagrams/AgentCoordination',
    filePath: 'src/shared/diagrams/AgentCoordination.tsx',
    concepts: [
      'multi-agent coordination',
      'supervisor pattern',
      'hierarchical agents',
      'peer to peer agents',
      'agent orchestration',
      'supervisor',
      'orchestrator',
      'multi-agent system',
      'agent supervisor pattern',
    ],
    tags: ['agents', 'coordination', 'multi-agent'],
    description:
      'Three selectable coordination patterns: supervisor (hub-and-spoke), hierarchical, peer-to-peer.',
    previewPath: 'src/asset-index/previews/A4.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 20 },
        pattern: { type: 'string', enum: ['supervisor', 'hierarchical', 'peer'] },
        agents: { type: 'array', items: { type: 'string' } },
        supervisor: { type: 'string' },
        cx: { type: 'number' },
        cy: { type: 'number' },
        radius: { type: 'number' },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'A5',
    kind: 'diagram',
    name: 'TradeoffTriangle',
    importPath: '@/shared/diagrams/TradeoffTriangle',
    filePath: 'src/shared/diagrams/TradeoffTriangle.tsx',
    concepts: [
      'trade-off triangle',
      'cost latency accuracy',
      'pick two',
      'three-axis tradeoff',
      'three way tradeoff',
      'pick two of three',
      'CAP-style triangle',
    ],
    tags: ['tradeoff', 'chart'],
    description: 'Three-axis trade-off triangle with a positionable point inside the triangle.',
    previewPath: 'src/asset-index/previews/A5.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 30 },
        axes: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
        point: {
          type: 'object',
          required: ['a', 'b', 'c'],
          properties: {
            a: { type: 'number' },
            b: { type: 'number' },
            c: { type: 'number' },
          },
        },
        cx: { type: 'number' },
        cy: { type: 'number' },
        size: { type: 'number' },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'A6',
    kind: 'diagram',
    name: 'TradeoffMatrix',
    importPath: '@/shared/diagrams/TradeoffMatrix',
    filePath: 'src/shared/diagrams/TradeoffMatrix.tsx',
    concepts: [
      '2x2 matrix',
      'quadrant chart',
      'positioning matrix',
      'comparison quadrants',
      '2x2 quadrant',
      'pros cons grid',
      'option comparison matrix',
    ],
    tags: ['tradeoff', 'matrix', 'chart'],
    description: 'Generic 2×2 matrix with labeled axes and four quadrant cells.',
    previewPath: 'src/asset-index/previews/A6.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame', 'xAxis', 'yAxis', 'quadrants'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 25 },
        xAxis: {
          type: 'object',
          required: ['label', 'low', 'high'],
          properties: {
            label: { type: 'string' },
            low: { type: 'string' },
            high: { type: 'string' },
          },
        },
        yAxis: {
          type: 'object',
          required: ['label', 'low', 'high'],
          properties: {
            label: { type: 'string' },
            low: { type: 'string' },
            high: { type: 'string' },
          },
        },
        quadrants: {
          type: 'array',
          items: { type: 'string' },
          minItems: 4,
          maxItems: 4,
        },
        quadrantDetails: { type: 'array', items: { type: 'string' }, maxItems: 4 },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'A7',
    kind: 'diagram',
    name: 'MaturityProgression',
    importPath: '@/shared/diagrams/MaturityProgression',
    filePath: 'src/shared/diagrams/MaturityProgression.tsx',
    concepts: [
      'maturity model',
      'adoption stages',
      'progression stages',
      'experimentation to embedded',
      'capability stages',
      'progress ladder',
      'roadmap stages',
    ],
    tags: ['progression', 'stages', 'roadmap'],
    description:
      'Horizontal staged progression (e.g. Experimentation → Operationalization → Scaling → Embedded).',
    previewPath: 'src/asset-index/previews/A7.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 22 },
        stages: {
          type: 'array',
          items: {
            type: 'object',
            required: ['label'],
            properties: {
              label: { type: 'string' },
              adoptionPct: { type: 'number' },
              description: { type: 'string' },
            },
          },
        },
        currentStage: { type: 'integer', minimum: 0 },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'A8',
    kind: 'diagram',
    name: 'FlowchartBuilder',
    importPath: '@/shared/diagrams/FlowchartBuilder',
    filePath: 'src/shared/diagrams/FlowchartBuilder.tsx',
    concepts: [
      'flowchart',
      'decision flow',
      'process diagram',
      'if then else diagram',
      'decision tree boxes',
      'workflow diagram',
      'process flow',
    ],
    tags: ['flowchart', 'generic'],
    description:
      'Generic flowchart composable from typed nodes (box/diamond/terminal) and directed edges.',
    previewPath: 'src/asset-index/previews/A8.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame', 'nodes', 'edges'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 20 },
        nodeDelay: { type: 'number', default: 10 },
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'label', 'x', 'y'],
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              kind: { type: 'string', enum: ['box', 'diamond', 'terminal'] },
              x: { type: 'number' },
              y: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' },
              color: { type: 'string' },
            },
          },
        },
        edges: {
          type: 'array',
          items: {
            type: 'object',
            required: ['from', 'to'],
            properties: {
              from: { type: 'string' },
              to: { type: 'string' },
              label: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'A9',
    kind: 'diagram',
    name: 'GraphNodeEdge',
    importPath: '@/shared/diagrams/GraphNodeEdge',
    filePath: 'src/shared/diagrams/GraphNodeEdge.tsx',
    concepts: [
      'graph node',
      'graph edge',
      'network diagram',
      'node link diagram',
      'node edge graph',
      'directed graph',
      'connected nodes',
    ],
    tags: ['graph', 'primitive'],
    description:
      'Primitive GraphNode and GraphEdge components for ad-hoc node-link diagrams.',
    previewPath: 'src/asset-index/previews/A9.png',
    propsSchema: {
      type: 'object',
      description: 'Module exports GraphNode and GraphEdge — import each separately.',
    },
  },
  {
    id: 'A10',
    kind: 'diagram',
    name: 'CodeBlock',
    importPath: '@/shared/diagrams/CodeBlock',
    filePath: 'src/shared/diagrams/CodeBlock.tsx',
    concepts: [
      'code block',
      'code snippet',
      'code display',
      'syntax highlighted code',
      'pseudocode',
    ],
    tags: ['code', 'text'],
    description:
      'Monospace code display with line-by-line reveal animation and optional line highlighting.',
    previewPath: 'src/asset-index/previews/A10.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame', 'code'],
      properties: {
        startFrame: { type: 'number' },
        code: { type: 'string' },
        language: { type: 'string' },
        highlightLines: { type: 'array', items: { type: 'integer' } },
        revealMode: { type: 'string', enum: ['all', 'line', 'char'] },
        lineRevealFrames: { type: 'number' },
        charsPerFrame: { type: 'number' },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'A11',
    kind: 'diagram',
    name: 'AnnotationHighlight',
    importPath: '@/shared/diagrams/AnnotationHighlight',
    filePath: 'src/shared/diagrams/AnnotationHighlight.tsx',
    concepts: [
      'annotation',
      'highlight',
      'callout',
      'spotlight',
      'pointer',
    ],
    tags: ['annotation', 'overlay'],
    description: 'Spotlight/highlight box and callout pointer for emphasizing elements.',
    previewPath: 'src/asset-index/previews/A11.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame', 'target'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 18 },
        style: { type: 'string', enum: ['highlight', 'spotlight', 'callout'] },
        target: {
          type: 'object',
          required: ['x', 'y'],
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
            width: { type: 'number' },
            height: { type: 'number' },
          },
        },
        label: { type: 'string' },
        labelPosition: {
          type: 'string',
          enum: ['above', 'below', 'left', 'right'],
        },
        color: { type: 'string' },
        pulse: { type: 'boolean' },
      },
    },
  },
  {
    id: 'A12',
    kind: 'diagram',
    name: 'LineChart',
    importPath: '@/shared/diagrams/LineChart',
    filePath: 'src/shared/diagrams/LineChart.tsx',
    concepts: [
      'line chart',
      'growth curve',
      'performance curve',
      'time series chart',
      'trend line',
      'metric over time',
      'plot over time',
    ],
    tags: ['chart', 'data-viz'],
    description: 'Hand-drawn line chart with axes, labels, and annotation points.',
    previewPath: 'src/asset-index/previews/A12.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame', 'data'],
      properties: {
        startFrame: { type: 'number' },
        drawDuration: { type: 'number', default: 40 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            required: ['x', 'y'],
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              label: { type: 'string' },
            },
          },
        },
        xLabel: { type: 'string' },
        yLabel: { type: 'string' },
        xRange: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
        yRange: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
        annotations: {
          type: 'array',
          items: {
            type: 'object',
            required: ['xValue', 'yValue', 'label'],
            properties: {
              xValue: { type: 'number' },
              yValue: { type: 'number' },
              label: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'B1',
    kind: 'diagram',
    name: 'FunctionCallingLifecycle',
    importPath: '@/shared/diagrams/FunctionCallingLifecycle',
    filePath: 'src/shared/diagrams/FunctionCallingLifecycle.tsx',
    concepts: [
      'function calling',
      'tool calling lifecycle',
      'define select execute inject',
      'LLM function contract',
      'tool use lifecycle',
      'function call flow',
      'tool invocation steps',
    ],
    tags: ['agents', 'tools', 'lifecycle'],
    description: 'Four-phase function-calling lifecycle: Define → Select → Execute → Inject.',
    previewPath: 'src/asset-index/previews/B1.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        phases: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
        descriptions: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
        highlightPhase: { type: 'integer', enum: [0, 1, 2, 3] },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'B2',
    kind: 'diagram',
    name: 'ErrorBackoffFlow',
    importPath: '@/shared/diagrams/ErrorBackoffFlow',
    filePath: 'src/shared/diagrams/ErrorBackoffFlow.tsx',
    concepts: [
      'retry logic',
      'exponential backoff',
      'circuit breaker',
      'error handling flow',
      'retry with backoff',
      'exponential retry',
      'failure recovery',
    ],
    tags: ['resilience', 'flowchart'],
    description: 'Retry loop with exponential backoff timings and optional circuit breaker.',
    previewPath: 'src/asset-index/previews/B2.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        maxRetries: { type: 'integer', default: 3 },
        backoffSeconds: { type: 'array', items: { type: 'number' } },
        circuitBreaker: { type: 'boolean', default: true },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'B3',
    kind: 'diagram',
    name: 'ChainOfThoughtTrace',
    importPath: '@/shared/diagrams/ChainOfThoughtTrace',
    filePath: 'src/shared/diagrams/ChainOfThoughtTrace.tsx',
    concepts: [
      'chain of thought',
      'reasoning trace',
      'structured reasoning',
      'step by step reasoning',
      'reasoning chain',
      'step by step thinking',
      'CoT',
    ],
    tags: ['agents', 'reasoning'],
    description: 'Linear chain-of-thought reasoning trace with optional schema sidebar.',
    previewPath: 'src/asset-index/previews/B3.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame', 'steps', 'finalAnswer'],
      properties: {
        startFrame: { type: 'number' },
        steps: { type: 'array', items: { type: 'string' } },
        finalAnswer: { type: 'string' },
        schema: { type: 'string' },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'B4',
    kind: 'diagram',
    name: 'MemoryConsolidationFlow',
    importPath: '@/shared/diagrams/MemoryConsolidationFlow',
    filePath: 'src/shared/diagrams/MemoryConsolidationFlow.tsx',
    concepts: [
      'memory consolidation',
      'memory lifecycle',
      'memory decay',
      'memory retrieval',
      'short to long term memory',
      'memory transfer',
      'memory stages',
    ],
    tags: ['agents', 'memory', 'lifecycle'],
    description: 'New memory → consolidation → retrieval → decay lifecycle flow.',
    previewPath: 'src/asset-index/previews/B4.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        stages: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
        showDecayReturn: { type: 'boolean', default: true },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'B5',
    kind: 'diagram',
    name: 'GeneratorCriticLoop',
    importPath: '@/shared/diagrams/GeneratorCriticLoop',
    filePath: 'src/shared/diagrams/GeneratorCriticLoop.tsx',
    concepts: [
      'generator critic',
      'self critique loop',
      'actor critic agents',
      'refinement loop',
      'critique loop',
      'self-refine',
      'generator-critic pattern',
    ],
    tags: ['agents', 'loop', 'pattern'],
    description: 'Iterative loop between a generator agent and a critic/evaluator agent.',
    previewPath: 'src/asset-index/previews/B5.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        generatorLabel: { type: 'string' },
        criticLabel: { type: 'string' },
        iterations: { type: 'integer', default: 3 },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'B6',
    kind: 'diagram',
    name: 'GovernanceEvolution',
    importPath: '@/shared/diagrams/GovernanceEvolution',
    filePath: 'src/shared/diagrams/GovernanceEvolution.tsx',
    concepts: [
      'governance evolution',
      'centralized hub-and-spoke advisory',
      'org governance stages',
      'governance maturity',
      'oversight evolution',
      'policy progression',
    ],
    tags: ['governance', 'stages'],
    description: 'Three governance stages: Centralized → Hub-and-Spoke → Advisory.',
    previewPath: 'src/asset-index/previews/B6.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame'],
      properties: {
        startFrame: { type: 'number' },
        stages: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
        currentStage: { type: 'integer', enum: [0, 1, 2] },
        descriptions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'B7',
    kind: 'diagram',
    name: 'EntityRelationshipGraph',
    importPath: '@/shared/diagrams/EntityRelationshipGraph',
    filePath: 'src/shared/diagrams/EntityRelationshipGraph.tsx',
    concepts: [
      'knowledge graph',
      'entity relationship',
      'ER diagram',
      'entity graph',
      'data model',
      'schema graph',
      'relationship diagram',
    ],
    tags: ['graph', 'knowledge'],
    description:
      'Entity-relationship / knowledge-graph visual with entities, edges, and highlight path.',
    previewPath: 'src/asset-index/previews/B7.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame', 'entities', 'relationships'],
      properties: {
        startFrame: { type: 'number' },
        entities: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'label', 'x', 'y'],
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              x: { type: 'number' },
              y: { type: 'number' },
              shape: { type: 'string', enum: ['box', 'circle', 'diamond'] },
              color: { type: 'string' },
            },
          },
        },
        relationships: {
          type: 'array',
          items: {
            type: 'object',
            required: ['from', 'to'],
            properties: {
              from: { type: 'string' },
              to: { type: 'string' },
              label: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
        highlightPath: { type: 'array', items: { type: 'string' } },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'B8',
    kind: 'diagram',
    name: 'ComparisonTable',
    importPath: '@/shared/diagrams/ComparisonTable',
    filePath: 'src/shared/diagrams/ComparisonTable.tsx',
    concepts: [
      'comparison table',
      'feature matrix',
      'side by side table',
      'side-by-side comparison',
      'feature parity table',
      'vendor comparison',
    ],
    tags: ['table', 'comparison'],
    description:
      'Configurable comparison table with highlighted cells (built on SketchTable).',
    previewPath: 'src/asset-index/previews/B8.png',
    propsSchema: {
      type: 'object',
      required: ['startFrame', 'columns', 'rows'],
      properties: {
        startFrame: { type: 'number' },
        columns: { type: 'array', items: { type: 'string' } },
        rows: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
        highlightCells: {
          type: 'array',
          items: { type: 'array', items: { type: 'integer' }, minItems: 2, maxItems: 2 },
        },
        title: { type: 'string' },
      },
    },
  },
  {
    id: 'C1',
    kind: 'image',
    name: 'SAEAutonomyLevels',
    filePath: 'public/generated/C1.png',
    concepts: [
      'SAE autonomy levels',
      'self driving levels',
      'autonomy spectrum cars',
      'levels of automation',
      'driverless progression',
    ],
    tags: ['image', 'autonomy', 'metaphor'],
    description:
      'Editorial illustration: row of five cars showing progression from full driver control to fully driverless, with hand-inked level markers.',
    previewPath: 'public/generated/C1.png',
  },
  {
    id: 'C2',
    kind: 'image',
    name: 'StreamingRecommendationUI',
    filePath: 'public/generated/C2.png',
    concepts: [
      'recommendation UI',
      'streaming app mockup',
      'personalized recommendations',
      'tile grid interface',
      'recommender system',
    ],
    tags: ['image', 'ui-mock', 'recommendation'],
    description:
      'Editorial illustration of a tablet-style streaming UI with a tile grid and a highlighted "Recommended for you" row.',
    previewPath: 'public/generated/C2.png',
  },
  {
    id: 'C3',
    kind: 'image',
    name: 'MultiAgentCallCenter',
    filePath: 'public/generated/C3.png',
    concepts: [
      'multi agent call center',
      'agent orchestration scene',
      'support agents hub',
      'distributed agents',
      'orchestrator agent',
    ],
    tags: ['image', 'multi-agent', 'metaphor'],
    description:
      'Overhead view of a small call-center floor with four headset-wearing figures connected to a glowing central orchestrator orb.',
    previewPath: 'public/generated/C3.png',
  },
  {
    id: 'C4',
    kind: 'image',
    name: 'PhonebookMagnifier',
    filePath: 'public/generated/C4.png',
    concepts: [
      'phonebook lookup',
      'rolodex search',
      'directory lookup',
      'magnifying glass search',
      'retrieval metaphor',
    ],
    tags: ['image', 'retrieval', 'metaphor'],
    description:
      'Open paper phonebook with a rolodex and a hand-inked magnifying glass hovering over a highlighted entry.',
    previewPath: 'public/generated/C4.png',
  },
  {
    id: 'C5',
    kind: 'image',
    name: 'GovernanceBoardroom',
    filePath: 'public/generated/C5.png',
    concepts: [
      'boardroom governance',
      'executive oversight',
      'policy decision scene',
      'governance committee',
      'AI oversight',
    ],
    tags: ['image', 'governance', 'metaphor'],
    description:
      'Editorial illustration of a boardroom with figures around an oval table and a stamped document at the head.',
    previewPath: 'public/generated/C5.png',
  },
  {
    id: 'C6',
    kind: 'image',
    name: 'IsometricCodeCity',
    filePath: 'public/generated/C6.png',
    concepts: [
      'code city',
      'repository metaphor',
      'isometric code blocks',
      'codebase visualization',
      'module dependencies',
    ],
    tags: ['image', 'codebase', 'metaphor'],
    description:
      'Isometric miniature city of stacked code blocks and folders connected by bridges, representing a codebase or repo.',
    previewPath: 'public/generated/C6.png',
  },
  {
    id: 'C7',
    kind: 'image',
    name: 'ServerRackHero',
    filePath: 'public/generated/C7.png',
    concepts: [
      'server rack',
      'data center',
      'infrastructure hero',
      'compute backend',
      'data center aisle',
    ],
    tags: ['image', 'infra', 'metaphor'],
    description:
      'Three-quarter view of two server racks in a quiet data-center aisle with subtle indicator-light accents.',
    previewPath: 'public/generated/C7.png',
  },
  {
    id: 'C8',
    kind: 'image',
    name: 'KnowledgeGraph3D',
    filePath: 'public/generated/C8.png',
    concepts: [
      'knowledge graph',
      'node link constellation',
      'concept graph',
      'graph visualization',
      'semantic graph',
    ],
    tags: ['image', 'graph', 'knowledge'],
    description:
      'Floating 3D constellation of nodes connected by curved lines, loosely clustered into regions.',
    previewPath: 'public/generated/C8.png',
  },
  {
    id: 'C9',
    kind: 'image',
    name: 'OrgChartBackdrop',
    filePath: 'public/generated/C9.png',
    concepts: [
      'org chart',
      'organizational hierarchy',
      'team structure backdrop',
      'reporting structure',
      'hierarchy diagram',
    ],
    tags: ['image', 'org', 'backdrop'],
    description:
      'Hand-inked hierarchical org-chart backdrop with empty boxes connected by wobbly lines.',
    previewPath: 'public/generated/C9.png',
  },
  {
    id: 'C10',
    kind: 'image',
    name: 'VectorEmbeddingSpace',
    filePath: 'public/generated/C10.png',
    concepts: [
      'vector database',
      'embedding space',
      'nearest neighbors',
      'vector similarity',
      'embeddings visualization',
    ],
    tags: ['image', 'vector-db', 'metaphor'],
    description:
      'Abstract scatter of dots in a vector space with clusters circled and a query-dot connected to its nearest neighbors.',
    previewPath: 'public/generated/C10.png',
  },
  {
    id: 'C11',
    kind: 'image',
    name: 'CircuitBreakerPanel',
    filePath: 'public/generated/C11.png',
    concepts: [
      'circuit breaker',
      'retry metaphor',
      'electrical panel',
      'breaker tripped',
      'resilience metaphor',
    ],
    tags: ['image', 'resilience', 'metaphor'],
    description:
      'Wall-mounted electrical breaker panel with one switch flipped off, used as a circuit-breaker / retry metaphor.',
    previewPath: 'public/generated/C11.png',
  },
  {
    id: 'C12',
    kind: 'image',
    name: 'MaturityStagesCollage',
    filePath: 'public/generated/C12.png',
    concepts: [
      'maturity stages',
      'growth stages',
      'seedling to tree',
      'progression metaphor',
      'adoption maturity',
    ],
    tags: ['image', 'maturity', 'metaphor'],
    description:
      'Four-vignette horizontal strip showing seedling → sapling → young tree → mature tree as a maturity-stages metaphor.',
    previewPath: 'public/generated/C12.png',
  },
// === BEGIN auto-generated icon entries (122 icons) ===
// Generated by scripts/generate-icon-registry.ts on 2026-04-16T13:36:43.533Z
  {
    id: "I1",
    kind: 'icon',
    name: "BrainIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["brain","thinking","intelligence","cognition","mind","reasoning"],
    tags: ["icon","abstract"],
    description: "Hand-drawn brain — use for thinking, intelligence, cognition.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I2",
    kind: 'icon',
    name: "TargetIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["target","target icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn target icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I3",
    kind: 'icon',
    name: "BookIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["book","book icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn book icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                },
                "label": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I4",
    kind: 'icon',
    name: "Lightbulb",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["lightbulb","idea","insight","eureka","innovation","inspiration"],
    tags: ["icon","abstract"],
    description: "Hand-drawn lightbulb — use for ideas, insights, innovation.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I5",
    kind: 'icon',
    name: "ClockIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["clock","clock icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn clock icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I6",
    kind: 'icon',
    name: "SpeechBubble",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["speech","message","dialog","communication","quote","comment"],
    tags: ["icon","abstract"],
    description: "Hand-drawn speech bubble — use for dialog, comments, quotes.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "width",
                "height",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "width": {
                      "type": "number"
                },
                "height": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "fill": {
                      "type": "string"
                },
                "text": {
                      "type": "string"
                },
                "text2": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I7",
    kind: 'icon',
    name: "LockIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["lock","lock icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn lock icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I8",
    kind: 'icon',
    name: "ShieldIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["shield","shield icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn shield icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I9",
    kind: 'icon',
    name: "MagnifyingGlass",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["magnifying glass","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn magnifying glass icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I10",
    kind: 'icon',
    name: "WarningTriangle",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["warning","alert","caution","limitation","danger","risk"],
    tags: ["icon","abstract"],
    description: "Hand-drawn warning triangle — use for alerts, cautions, limitations.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I11",
    kind: 'icon',
    name: "PuzzlePiece",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["puzzle piece","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn puzzle piece icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I12",
    kind: 'icon',
    name: "StarIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["star","star icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn star icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I13",
    kind: 'icon',
    name: "FlagIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["flag","flag icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn flag icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I14",
    kind: 'icon',
    name: "MirrorIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["mirror","mirror icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn mirror icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I15",
    kind: 'icon',
    name: "NumberBadge",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["number badge","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn number badge icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration",
                "number"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "number": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I16",
    kind: 'icon',
    name: "EyeIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["eye","eye icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn eye icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I17",
    kind: 'icon',
    name: "LightningBoltIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/abstract.tsx",
    concepts: ["lightning bolt","lightning bolt icon","concept","idea","symbol"],
    tags: ["icon","abstract"],
    description: "Hand-drawn lightning bolt icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I18",
    kind: 'icon',
    name: "UploadIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/actions.tsx",
    concepts: ["upload","upload icon","action","interaction","verb"],
    tags: ["icon","actions"],
    description: "Hand-drawn upload icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I19",
    kind: 'icon',
    name: "DownloadIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/actions.tsx",
    concepts: ["download","download icon","action","interaction","verb"],
    tags: ["icon","actions"],
    description: "Hand-drawn download icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I20",
    kind: 'icon',
    name: "SyncIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/actions.tsx",
    concepts: ["sync","sync icon","action","interaction","verb"],
    tags: ["icon","actions"],
    description: "Hand-drawn sync icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I21",
    kind: 'icon',
    name: "PlayIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/actions.tsx",
    concepts: ["play","play icon","action","interaction","verb"],
    tags: ["icon","actions"],
    description: "Hand-drawn play icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I22",
    kind: 'icon',
    name: "PauseIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/actions.tsx",
    concepts: ["pause","pause icon","action","interaction","verb"],
    tags: ["icon","actions"],
    description: "Hand-drawn pause icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I23",
    kind: 'icon',
    name: "ExpandIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/actions.tsx",
    concepts: ["expand","expand icon","action","interaction","verb"],
    tags: ["icon","actions"],
    description: "Hand-drawn expand icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I24",
    kind: 'icon',
    name: "ShareIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/actions.tsx",
    concepts: ["share","share icon","action","interaction","verb"],
    tags: ["icon","actions"],
    description: "Hand-drawn share icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I25",
    kind: 'icon',
    name: "BarChart",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/business.tsx",
    concepts: ["bar chart","business","metric","report"],
    tags: ["icon","business"],
    description: "Hand-drawn bar chart icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I26",
    kind: 'icon',
    name: "DocStack",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/business.tsx",
    concepts: ["doc stack","business","metric","report"],
    tags: ["icon","business"],
    description: "Hand-drawn doc stack icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I27",
    kind: 'icon',
    name: "PieChart",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/business.tsx",
    concepts: ["pie chart","business","metric","report"],
    tags: ["icon","business"],
    description: "Hand-drawn pie chart icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "slices": {
                      "type": "array",
                      "items": {
                            "type": "number"
                      }
                },
                "colors": {
                      "type": "array",
                      "items": {
                            "type": "string"
                      }
                }
          }
    },
  },
  {
    id: "I28",
    kind: 'icon',
    name: "LineGraph",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/business.tsx",
    concepts: ["line graph","business","metric","report"],
    tags: ["icon","business"],
    description: "Hand-drawn line graph icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I29",
    kind: 'icon',
    name: "ProgressBar",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/business.tsx",
    concepts: ["progress bar","business","metric","report"],
    tags: ["icon","business"],
    description: "Hand-drawn progress bar icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "percent": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I30",
    kind: 'icon',
    name: "ProjectPlannerIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/business.tsx",
    concepts: ["project planner","project planner icon","business","metric","report"],
    tags: ["icon","business"],
    description: "Hand-drawn project planner icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I31",
    kind: 'icon',
    name: "ChatbotIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/communication.tsx",
    concepts: ["chat","message","conversation","chatbot","communication","assistant"],
    tags: ["icon","communication"],
    description: "Hand-drawn chatbot avatar — use for chat, messaging.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I32",
    kind: 'icon',
    name: "VideoCallIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/communication.tsx",
    concepts: ["video call","video call icon","communication","messaging","signal"],
    tags: ["icon","communication"],
    description: "Hand-drawn video call icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I33",
    kind: 'icon',
    name: "BroadcastIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/communication.tsx",
    concepts: ["broadcast","broadcast icon","communication","messaging","signal"],
    tags: ["icon","communication"],
    description: "Hand-drawn broadcast icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I34",
    kind: 'icon',
    name: "AntennaIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/communication.tsx",
    concepts: ["antenna","antenna icon","communication","messaging","signal"],
    tags: ["icon","communication"],
    description: "Hand-drawn antenna icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I35",
    kind: 'icon',
    name: "CoinIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/finance.tsx",
    concepts: ["coin","coin icon","finance","money","currency"],
    tags: ["icon","finance"],
    description: "Hand-drawn coin icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I36",
    kind: 'icon',
    name: "WalletIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/finance.tsx",
    concepts: ["wallet","wallet icon","finance","money","currency"],
    tags: ["icon","finance"],
    description: "Hand-drawn wallet icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I37",
    kind: 'icon',
    name: "BankIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/finance.tsx",
    concepts: ["bank","bank icon","finance","money","currency"],
    tags: ["icon","finance"],
    description: "Hand-drawn bank icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I38",
    kind: 'icon',
    name: "CreditCardIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/finance.tsx",
    concepts: ["credit card","credit card icon","finance","money","currency"],
    tags: ["icon","finance"],
    description: "Hand-drawn credit card icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I39",
    kind: 'icon',
    name: "DollarSignIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/finance.tsx",
    concepts: ["dollar sign","dollar sign icon","finance","money","currency"],
    tags: ["icon","finance"],
    description: "Hand-drawn dollar sign icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I40",
    kind: 'icon',
    name: "CycleArrow",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/flow.tsx",
    concepts: ["cycle","loop","arrow","recurring","iteration","circular flow"],
    tags: ["icon","flow"],
    description: "Hand-drawn circular arrow — use for cycles, loops, iteration.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "segments": {
                      "type": "number"
                },
                "broken": {
                      "type": "boolean"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I41",
    kind: 'icon',
    name: "FlowChain",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/flow.tsx",
    concepts: ["flow","arrow chain","direction","sequence","pipeline","connected steps"],
    tags: ["icon","flow"],
    description: "Hand-drawn chain of flow arrows — use for sequences, pipelines.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration",
                "steps"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "steps": {
                      "type": "array",
                      "items": {
                            "type": "string"
                      }
                },
                "direction": {
                      "type": "string",
                      "enum": [
                            "horizontal",
                            "vertical"
                      ]
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I42",
    kind: 'icon',
    name: "FunnelIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/flow.tsx",
    concepts: ["funnel","funnel icon","flow","process","pipeline"],
    tags: ["icon","flow"],
    description: "Hand-drawn funnel icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I43",
    kind: 'icon',
    name: "DecisionDiamond",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/flow.tsx",
    concepts: ["decision diamond","flow","process","pipeline"],
    tags: ["icon","flow"],
    description: "Hand-drawn decision diamond icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I44",
    kind: 'icon',
    name: "DottedConnector",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/flow.tsx",
    concepts: ["dotted connector","flow","process","pipeline"],
    tags: ["icon","flow"],
    description: "Hand-drawn dotted connector icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "x1",
                "y1",
                "x2",
                "y2",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "x1": {
                      "type": "number"
                },
                "y1": {
                      "type": "number"
                },
                "x2": {
                      "type": "number"
                },
                "y2": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                },
                "dashed": {
                      "type": "boolean"
                }
          }
    },
  },
  {
    id: "I45",
    kind: 'icon',
    name: "GrowthTransformIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/nature.tsx",
    concepts: ["growth transform","growth transform icon","nature","natural","environment"],
    tags: ["icon","nature"],
    description: "Hand-drawn growth transform icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I46",
    kind: 'icon',
    name: "MountainPeakIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/nature.tsx",
    concepts: ["mountain peak","mountain peak icon","nature","natural","environment"],
    tags: ["icon","nature"],
    description: "Hand-drawn mountain peak icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I47",
    kind: 'icon',
    name: "WaveIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/nature.tsx",
    concepts: ["wave","wave icon","nature","natural","environment"],
    tags: ["icon","nature"],
    description: "Hand-drawn wave icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I48",
    kind: 'icon',
    name: "FlameIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/nature.tsx",
    concepts: ["flame","flame icon","nature","natural","environment"],
    tags: ["icon","nature"],
    description: "Hand-drawn flame icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I49",
    kind: 'icon',
    name: "SunIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/nature.tsx",
    concepts: ["sun","sun icon","nature","natural","environment"],
    tags: ["icon","nature"],
    description: "Hand-drawn sun icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I50",
    kind: 'icon',
    name: "MoonIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/nature.tsx",
    concepts: ["moon","moon icon","nature","natural","environment"],
    tags: ["icon","nature"],
    description: "Hand-drawn moon icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I51",
    kind: 'icon',
    name: "FlowerIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["flower","flower icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn flower icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I52",
    kind: 'icon',
    name: "CompassIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["compass","compass icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn compass icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I53",
    kind: 'icon',
    name: "RocketIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["rocket","rocket icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn rocket icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I54",
    kind: 'icon',
    name: "TrophyIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["trophy","trophy icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn trophy icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I55",
    kind: 'icon',
    name: "CalendarIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["calendar","calendar icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn calendar icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I56",
    kind: 'icon',
    name: "CameraIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["camera","camera icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn camera icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I57",
    kind: 'icon',
    name: "MegaphoneIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["megaphone","megaphone icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn megaphone icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I58",
    kind: 'icon',
    name: "HourglassIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["hourglass","hourglass icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn hourglass icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I59",
    kind: 'icon',
    name: "AnchorIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["anchor","anchor icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn anchor icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I60",
    kind: 'icon',
    name: "CrownIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["crown","crown icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn crown icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I61",
    kind: 'icon',
    name: "ScissorsIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["scissors","scissors icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn scissors icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I62",
    kind: 'icon',
    name: "GiftIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["gift","gift icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn gift icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I63",
    kind: 'icon',
    name: "MusicNoteIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["music note","music note icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn music note icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I64",
    kind: 'icon',
    name: "PaintBrushIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["paint brush","paint brush icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn paint brush icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I65",
    kind: 'icon',
    name: "PencilIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["pencil","pencil icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn pencil icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I66",
    kind: 'icon',
    name: "FolderIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["folder","folder icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn folder icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I67",
    kind: 'icon',
    name: "TrashIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["trash","trash icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn trash icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I68",
    kind: 'icon',
    name: "TagIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["tag","tag icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn tag icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I69",
    kind: 'icon',
    name: "MicrophoneIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["microphone","microphone icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn microphone icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I70",
    kind: 'icon',
    name: "SpeakerIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["speaker","speaker icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn speaker icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I71",
    kind: 'icon',
    name: "HeadphonesIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["headphones","headphones icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn headphones icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I72",
    kind: 'icon',
    name: "USBPlugIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/objects.tsx",
    concepts: ["usb plug","usb plug icon","object","item","thing"],
    tags: ["icon","objects"],
    description: "Hand-drawn usb plug icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I73",
    kind: 'icon',
    name: "PersonIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/people.tsx",
    concepts: ["person","user","individual","human figure","standing person"],
    tags: ["icon","people"],
    description: "Hand-drawn standing person — use for user, individual.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "shirtColor": {
                      "type": "string"
                },
                "hairColor": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I74",
    kind: 'icon',
    name: "PersonSitting",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/people.tsx",
    concepts: ["person sitting","person","human","figure"],
    tags: ["icon","people"],
    description: "Hand-drawn person sitting icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "shirtColor": {
                      "type": "string"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I75",
    kind: 'icon',
    name: "PersonPresenting",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/people.tsx",
    concepts: ["person presenting","person","human","figure"],
    tags: ["icon","people"],
    description: "Hand-drawn person presenting icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "shirtColor": {
                      "type": "string"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I76",
    kind: 'icon',
    name: "TwoPersons",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/people.tsx",
    concepts: ["two persons","person","human","figure"],
    tags: ["icon","people"],
    description: "Hand-drawn two persons icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I77",
    kind: 'icon',
    name: "TeamGroup",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/people.tsx",
    concepts: ["team","group","collaboration","people working together","crew"],
    tags: ["icon","people"],
    description: "Hand-drawn team of people — use for collaboration, group work.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I78",
    kind: 'icon',
    name: "FactoryIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/places.tsx",
    concepts: ["factory","factory icon","place","location","building"],
    tags: ["icon","places"],
    description: "Hand-drawn factory icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I79",
    kind: 'icon',
    name: "ShoppingCartIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/places.tsx",
    concepts: ["shopping cart","shopping cart icon","place","location","building"],
    tags: ["icon","places"],
    description: "Hand-drawn shopping cart icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I80",
    kind: 'icon',
    name: "HandshakeIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/places.tsx",
    concepts: ["handshake","handshake icon","place","location","building"],
    tags: ["icon","places"],
    description: "Hand-drawn handshake icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I81",
    kind: 'icon',
    name: "SatelliteIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/places.tsx",
    concepts: ["satellite","satellite icon","place","location","building"],
    tags: ["icon","places"],
    description: "Hand-drawn satellite icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I82",
    kind: 'icon',
    name: "WindmillIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/places.tsx",
    concepts: ["windmill","windmill icon","place","location","building"],
    tags: ["icon","places"],
    description: "Hand-drawn windmill icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I83",
    kind: 'icon',
    name: "RecycleIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/places.tsx",
    concepts: ["recycle","recycle icon","place","location","building"],
    tags: ["icon","places"],
    description: "Hand-drawn recycle icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I84",
    kind: 'icon',
    name: "BridgeIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/places.tsx",
    concepts: ["bridge","bridge icon","place","location","building"],
    tags: ["icon","places"],
    description: "Hand-drawn bridge icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I85",
    kind: 'icon',
    name: "CircuitBoardIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/places.tsx",
    concepts: ["circuit board","circuit board icon","place","location","building"],
    tags: ["icon","places"],
    description: "Hand-drawn circuit board icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I86",
    kind: 'icon',
    name: "DNAEvolutionIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/science.tsx",
    concepts: ["dna evolution","dna evolution icon","science","scientific","research"],
    tags: ["icon","science"],
    description: "Hand-drawn dna evolution icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I87",
    kind: 'icon',
    name: "AtomIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/science.tsx",
    concepts: ["atom","atom icon","science","scientific","research"],
    tags: ["icon","science"],
    description: "Hand-drawn atom icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I88",
    kind: 'icon',
    name: "MicroscopeIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/science.tsx",
    concepts: ["microscope","microscope icon","science","scientific","research"],
    tags: ["icon","science"],
    description: "Hand-drawn microscope icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I89",
    kind: 'icon',
    name: "BeakerIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/science.tsx",
    concepts: ["beaker","beaker icon","science","scientific","research"],
    tags: ["icon","science"],
    description: "Hand-drawn beaker icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I90",
    kind: 'icon',
    name: "MagnetIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/science.tsx",
    concepts: ["magnet","magnet icon","science","scientific","research"],
    tags: ["icon","science"],
    description: "Hand-drawn magnet icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I91",
    kind: 'icon',
    name: "GlobeIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/science.tsx",
    concepts: ["globe","globe icon","science","scientific","research"],
    tags: ["icon","science"],
    description: "Hand-drawn globe icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I92",
    kind: 'icon',
    name: "SmileyIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/status.tsx",
    concepts: ["smiley","smiley icon","status","state","feedback"],
    tags: ["icon","status"],
    description: "Hand-drawn smiley icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I93",
    kind: 'icon',
    name: "ThumbsUpIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/status.tsx",
    concepts: ["thumbs up","thumbs up icon","status","state","feedback"],
    tags: ["icon","status"],
    description: "Hand-drawn thumbs up icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I94",
    kind: 'icon',
    name: "HeartIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/status.tsx",
    concepts: ["heart","heart icon","status","state","feedback"],
    tags: ["icon","status"],
    description: "Hand-drawn heart icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I95",
    kind: 'icon',
    name: "CheckCircleIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/status.tsx",
    concepts: ["checkmark","success","done","verified","approved","confirmed"],
    tags: ["icon","status"],
    description: "Hand-drawn check inside a circle — use for success, verification.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I96",
    kind: 'icon',
    name: "InfoCircleIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/status.tsx",
    concepts: ["info circle","info circle icon","status","state","feedback"],
    tags: ["icon","status"],
    description: "Hand-drawn info circle icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I97",
    kind: 'icon',
    name: "NotificationBellIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/status.tsx",
    concepts: ["notification bell","notification bell icon","status","state","feedback"],
    tags: ["icon","status"],
    description: "Hand-drawn notification bell icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I98",
    kind: 'icon',
    name: "ScaleIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/structure.tsx",
    concepts: ["scale","scale icon","structure","architecture","layout"],
    tags: ["icon","structure"],
    description: "Hand-drawn scale icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I99",
    kind: 'icon',
    name: "TreeDiagram",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/structure.tsx",
    concepts: ["tree diagram","structure","architecture","layout"],
    tags: ["icon","structure"],
    description: "Hand-drawn tree diagram icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "levels": {
                      "type": "array",
                      "items": {
                            "type": "number"
                      }
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I100",
    kind: 'icon',
    name: "StackedLayers",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/structure.tsx",
    concepts: ["stacked layers","structure","architecture","layout"],
    tags: ["icon","structure"],
    description: "Hand-drawn stacked layers icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "layerCount": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I101",
    kind: 'icon',
    name: "NetworkGraph",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/structure.tsx",
    concepts: ["network","nodes connected","graph","mesh","topology","connected nodes"],
    tags: ["icon","structure"],
    description: "Hand-drawn network of connected nodes.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "nodeCount": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I102",
    kind: 'icon',
    name: "BlueprintIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/structure.tsx",
    concepts: ["blueprint","blueprint icon","structure","architecture","layout"],
    tags: ["icon","structure"],
    description: "Hand-drawn blueprint icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I103",
    kind: 'icon',
    name: "RobotHead",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["robot","AI agent","android","autonomous bot","machine intelligence"],
    tags: ["icon","technology","agents"],
    description: "Hand-drawn robot head — use for AI/agent concepts.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I104",
    kind: 'icon',
    name: "ToolIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["tool","tool icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn tool icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I105",
    kind: 'icon',
    name: "DatabaseIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["database","database icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn database icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I106",
    kind: 'icon',
    name: "CodeIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["code","code icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn code icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I107",
    kind: 'icon',
    name: "CloudIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["cloud","cloud icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn cloud icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I108",
    kind: 'icon',
    name: "MonitorIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["monitor","monitor icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn monitor icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                }
          }
    },
  },
  {
    id: "I109",
    kind: 'icon',
    name: "GearIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["gear","settings","process","mechanism","configuration","cogwheel"],
    tags: ["icon","technology"],
    description: "Hand-drawn gear — use for settings, process, mechanism.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I110",
    kind: 'icon',
    name: "KeyboardIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["keyboard","keyboard icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn keyboard icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I111",
    kind: 'icon',
    name: "MobilePhone",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["mobile phone","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn mobile phone icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I112",
    kind: 'icon',
    name: "ServerRack",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["server rack","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn server rack icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I113",
    kind: 'icon',
    name: "EnvelopeIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["envelope","mail","email","message","communication","inbox"],
    tags: ["icon","technology"],
    description: "Hand-drawn envelope — use for mail, email, messages.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I114",
    kind: 'icon',
    name: "WiFiSignal",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["wi fi signal","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn wi fi signal icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I115",
    kind: 'icon',
    name: "GridIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["grid","grid icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn grid icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "rows": {
                      "type": "number"
                },
                "cols": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I116",
    kind: 'icon',
    name: "RadarSensorIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["radar sensor","radar sensor icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn radar sensor icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I117",
    kind: 'icon',
    name: "SensorEyeIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/technology.tsx",
    concepts: ["sensor eye","sensor eye icon","technology","tech","device"],
    tags: ["icon","technology"],
    description: "Hand-drawn sensor eye icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I118",
    kind: 'icon',
    name: "CarIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/transport.tsx",
    concepts: ["car","car icon","transport","vehicle","movement"],
    tags: ["icon","transport"],
    description: "Hand-drawn car icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I119",
    kind: 'icon',
    name: "AutonomousCarIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/transport.tsx",
    concepts: ["autonomous car","autonomous car icon","transport","vehicle","movement"],
    tags: ["icon","transport"],
    description: "Hand-drawn autonomous car icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I120",
    kind: 'icon',
    name: "AirplaneIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/transport.tsx",
    concepts: ["airplane","airplane icon","transport","vehicle","movement"],
    tags: ["icon","transport"],
    description: "Hand-drawn airplane icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I121",
    kind: 'icon',
    name: "ShipIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/transport.tsx",
    concepts: ["ship","ship icon","transport","vehicle","movement"],
    tags: ["icon","transport"],
    description: "Hand-drawn ship icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
  {
    id: "I122",
    kind: 'icon',
    name: "BicycleIcon",
    importPath: '@/shared/icons',
    filePath: "src/shared/icons/transport.tsx",
    concepts: ["bicycle","bicycle icon","transport","vehicle","movement"],
    tags: ["icon","transport"],
    description: "Hand-drawn bicycle icon.",
    propsSchema: {
          "type": "object",
          "required": [
                "cx",
                "cy",
                "startFrame",
                "drawDuration"
          ],
          "properties": {
                "cx": {
                      "type": "number"
                },
                "cy": {
                      "type": "number"
                },
                "scale": {
                      "type": "number"
                },
                "startFrame": {
                      "type": "number"
                },
                "drawDuration": {
                      "type": "number"
                },
                "color": {
                      "type": "string"
                }
          }
    },
  },
// === END auto-generated icon entries ===
];
