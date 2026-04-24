import { z } from 'zod';
import { defineTool } from './types';
import {
  iconBox,
  textBox,
  sketchBoxBox,
  intersects,
  inSafeZone,
  clearance,
  fmtBox,
  type Box,
  type CompositeChild,
  type CompositeLayoutResult,
} from '../../asset-index/bounds';
import { layoutAgentCoordination } from '../../shared/diagrams/AgentCoordination';
import { layoutTradeoffMatrix } from '../../shared/diagrams/TradeoffMatrix';
import { layoutTradeoffTriangle } from '../../shared/diagrams/TradeoffTriangle';
import { layoutLineChart } from '../../shared/diagrams/LineChart';
import { layoutAnnotationHighlight } from '../../shared/diagrams/AnnotationHighlight';
import { layoutCodeBlock } from '../../shared/diagrams/CodeBlock';
import { layoutAutonomySpectrum } from '../../shared/diagrams/AutonomySpectrum';
import { layoutMemoryArchitecture } from '../../shared/diagrams/MemoryArchitecture';
import { layoutReActLoop } from '../../shared/diagrams/ReActLoop';
import { layoutGeneratorCriticLoop } from '../../shared/diagrams/GeneratorCriticLoop';
import { layoutChainOfThoughtTrace } from '../../shared/diagrams/ChainOfThoughtTrace';
import { layoutComparisonTable } from '../../shared/diagrams/ComparisonTable';
import { layoutMaturityProgression } from '../../shared/diagrams/MaturityProgression';
import { layoutFlowchartBuilder, type FlowNode } from '../../shared/diagrams/FlowchartBuilder';
import { layoutFunctionCallingLifecycle } from '../../shared/diagrams/FunctionCallingLifecycle';
import { layoutErrorBackoffFlow } from '../../shared/diagrams/ErrorBackoffFlow';
import { layoutMemoryConsolidationFlow } from '../../shared/diagrams/MemoryConsolidationFlow';
import { layoutEntityRelationshipGraph } from '../../shared/diagrams/EntityRelationshipGraph';
import { layoutGovernanceEvolution } from '../../shared/diagrams/GovernanceEvolution';

const iconElement = z.object({
  type: z.literal('icon'),
  name: z.string(),
  cx: z.number(),
  cy: z.number(),
  scale: z.number().default(1),
});

const textElement = z.object({
  type: z.literal('text'),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  fontSize: z.number(),
  textAnchor: z.enum(['start', 'middle', 'end']).default('middle'),
  maxWidth: z.number().optional(),
});

const sketchboxElement = z.object({
  type: z.literal('sketchbox'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number().optional(),
  rows: z.array(z.object({
    text: z.string(),
    fontSize: z.number(),
  })).optional(),
  padding: z.number().optional(),
  gap: z.number().optional(),
});

const diagramElement = z.object({
  type: z.literal('diagram'),
  name: z.string(),
  // New composite contract: placement rect (required for retrofitted composites).
  x: z.number().optional(),
  y: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  // Composite-specific content.
  agents: z.array(z.string()).optional(),
  agentCount: z.number().optional(),
  supervisor: z.string().optional(),
  pattern: z.enum(['supervisor', 'hierarchical', 'peer']).optional(),
  title: z.string().optional(),
  // TradeoffMatrix / TradeoffTriangle content.
  quadrants: z.array(z.string()).optional(),
  axes: z.array(z.string()).optional(),
  // LineChart content.
  dataCount: z.number().optional(),
  hasXLabel: z.boolean().optional(),
  hasYLabel: z.boolean().optional(),
  // AnnotationHighlight content.
  style: z.enum(['highlight', 'spotlight', 'callout']).optional(),
  label: z.string().optional(),
  labelPosition: z.enum(['above', 'below', 'left', 'right']).optional(),
  // CodeBlock content.
  lineCount: z.number().optional(),
  maxLineLength: z.number().optional(),
  language: z.string().optional(),
  // AutonomySpectrum content.
  levels: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  marker: z.number().optional(),
  // MemoryArchitecture content.
  layerCount: z.number().optional(),
  layerLabelMaxLen: z.number().optional(),
  // ReActLoop content.
  steps: z.array(z.string()).optional(),
  showMemory: z.boolean().optional(),
  showTools: z.boolean().optional(),
  // GeneratorCriticLoop content.
  generatorLabel: z.string().optional(),
  criticLabel: z.string().optional(),
  iterations: z.number().optional(),
  // ChainOfThoughtTrace content.
  stepCount: z.number().optional(),
  stepMaxLen: z.number().optional(),
  finalAnswer: z.string().optional(),
  hasSchema: z.boolean().optional(),
  schemaLineCount: z.number().optional(),
  schemaMaxLineLength: z.number().optional(),
  // ComparisonTable content.
  columnCount: z.number().optional(),
  rowCount: z.number().optional(),
  cellMaxLen: z.number().optional(),
  // MaturityProgression content.
  stageCount: z.number().optional(),
  stageLabelMaxLen: z.number().optional(),
  hasDescriptions: z.boolean().optional(),
  currentStage: z.number().optional(),
  // FlowchartBuilder content.
  flowRows: z.number().optional(),
  flowCols: z.number().optional(),
  flowNodeMaxLen: z.number().optional(),
  hasDiamondNodes: z.boolean().optional(),
  // FunctionCallingLifecycle content.
  highlightPhase: z.number().optional(),
  // ErrorBackoffFlow content.
  circuitBreaker: z.boolean().optional(),
  maxRetries: z.number().optional(),
  // MemoryConsolidationFlow content.
  showDecayReturn: z.boolean().optional(),
  // EntityRelationshipGraph content.
  entityCount: z.number().optional(),
  entityLabelMaxLen: z.number().optional(),
});

const elementSchema = z.discriminatedUnion('type', [
  iconElement,
  textElement,
  sketchboxElement,
  diagramElement,
]);

const cueSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const sceneSchema = z.object({
  sceneIndex: z.number(),
  elements: z.array(elementSchema),
  cues: z.array(cueSchema),
});

const planSchema = z.object({
  scenes: z.array(sceneSchema),
});

type Element = z.infer<typeof elementSchema>;
type DiagramEl = z.infer<typeof diagramElement>;

const MIN_CLEARANCE_PX = 40;
const MAX_NARRATION_WORDS = 225;
const MAX_CUES = 35;

interface ComputedElement {
  type: string;
  name?: string;
  text?: string;
  bbox: Box;
  children?: CompositeChild[];
}

/**
 * Dispatch table for retrofitted composites. Each entry takes the raw
 * diagram props from the plan and returns a full layout (outer + children +
 * optional error). Every registered diagram is expected to appear here —
 * an unknown name is an error at plan time.
 */
function requireRect(el: DiagramEl, name: string): CompositeLayoutResult | null {
  if (el.x === undefined || el.y === undefined || el.w === undefined || el.h === undefined) {
    return {
      outer: { x1: 0, y1: 0, x2: 0, y2: 0 },
      children: [],
      error: `${name} requires {x, y, w, h} — the composite's placement rect`,
    };
  }
  return null;
}

const COMPOSITE_LAYOUTS: Record<string, (el: DiagramEl) => CompositeLayoutResult> = {
  AgentCoordination: (el) => {
    const missing = requireRect(el, 'AgentCoordination');
    if (missing) return missing;
    const agents = el.agents
      ?? (el.agentCount ? Array.from({ length: el.agentCount }, (_, i) => `Agent ${String.fromCharCode(65 + i)}`) : undefined);
    return layoutAgentCoordination({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      pattern: el.pattern,
      agents,
      supervisor: el.supervisor,
      title: el.title,
    });
  },
  TradeoffMatrix: (el) => {
    const missing = requireRect(el, 'TradeoffMatrix');
    if (missing) return missing;
    const quadrants = (el.quadrants && el.quadrants.length === 4
      ? el.quadrants
      : ['Q1', 'Q2', 'Q3', 'Q4']) as [string, string, string, string];
    return layoutTradeoffMatrix({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      xAxis: { label: el.axes?.[0] ?? 'X' },
      yAxis: { label: el.axes?.[1] ?? 'Y' },
      quadrants,
      title: el.title,
    });
  },
  TradeoffTriangle: (el) => {
    const missing = requireRect(el, 'TradeoffTriangle');
    if (missing) return missing;
    const axes = (el.axes && el.axes.length === 3
      ? el.axes
      : ['A', 'B', 'C']) as [string, string, string];
    return layoutTradeoffTriangle({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      axes,
      title: el.title,
    });
  },
  LineChart: (el) => {
    const missing = requireRect(el, 'LineChart');
    if (missing) return missing;
    const dataCount = el.dataCount ?? 5;
    return layoutLineChart({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      data: Array.from({ length: dataCount }, (_, i) => ({ x: i, y: i })),
      xLabel: el.hasXLabel ? 'x' : undefined,
      yLabel: el.hasYLabel ? 'y' : undefined,
      title: el.title,
    });
  },
  AnnotationHighlight: (el) => {
    const missing = requireRect(el, 'AnnotationHighlight');
    if (missing) return missing;
    return layoutAnnotationHighlight({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      style: el.style,
      label: el.label,
      labelPosition: el.labelPosition,
    });
  },
  CodeBlock: (el) => {
    const missing = requireRect(el, 'CodeBlock');
    if (missing) return missing;
    // The validator doesn't have the actual code; it uses the reported line count
    // and max line length to check if space is feasible at MIN_FONT_SIZE.
    const lineCount = el.lineCount ?? 10;
    const maxLineLength = el.maxLineLength ?? 60;
    const code = Array.from({ length: lineCount }, () => 'x'.repeat(maxLineLength)).join('\n');
    return layoutCodeBlock({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      code,
      title: el.title,
      language: el.language,
    });
  },
  AutonomySpectrum: (el) => {
    const missing = requireRect(el, 'AutonomySpectrum');
    if (missing) return missing;
    return layoutAutonomySpectrum({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      levels: el.levels,
      labels: el.labels,
      marker: el.marker,
      title: el.title,
    });
  },
  MemoryArchitecture: (el) => {
    const missing = requireRect(el, 'MemoryArchitecture');
    if (missing) return missing;
    // Synthesize proxy layers so the layout can check fit without seeing
    // real labels. layerLabelMaxLen governs how wide the rect must be.
    const layerCount = el.layerCount ?? 4;
    const labelLen = el.layerLabelMaxLen ?? 20;
    const proxyLabel = 'x'.repeat(labelLen);
    const layers = Array.from({ length: layerCount }, () => ({ label: proxyLabel }));
    return layoutMemoryArchitecture({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      layers,
      title: el.title,
    });
  },
  ReActLoop: (el) => {
    const missing = requireRect(el, 'ReActLoop');
    if (missing) return missing;
    const steps = (el.steps && el.steps.length === 3
      ? el.steps
      : ['Observe', 'Think', 'Act']) as [string, string, string];
    return layoutReActLoop({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      steps,
      showMemory: el.showMemory,
      showTools: el.showTools,
      title: el.title,
    });
  },
  GeneratorCriticLoop: (el) => {
    const missing = requireRect(el, 'GeneratorCriticLoop');
    if (missing) return missing;
    return layoutGeneratorCriticLoop({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      generatorLabel: el.generatorLabel,
      criticLabel: el.criticLabel,
      iterations: el.iterations,
      title: el.title,
    });
  },
  ChainOfThoughtTrace: (el) => {
    const missing = requireRect(el, 'ChainOfThoughtTrace');
    if (missing) return missing;
    const stepCount = el.stepCount ?? 4;
    const stepMaxLen = el.stepMaxLen ?? 40;
    const steps = Array.from({ length: stepCount }, () => 'x'.repeat(stepMaxLen));
    const finalAnswer = el.finalAnswer ?? 'x'.repeat(Math.min(stepMaxLen, 40));
    const hasSchema = el.hasSchema ?? false;
    let schema: string | undefined;
    if (hasSchema) {
      const schemaLines = el.schemaLineCount ?? 6;
      const schemaMaxLen = el.schemaMaxLineLength ?? 32;
      schema = Array.from({ length: schemaLines }, () => 'x'.repeat(schemaMaxLen)).join('\n');
    }
    return layoutChainOfThoughtTrace({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      steps,
      finalAnswer,
      schema,
      title: el.title,
    });
  },
  ComparisonTable: (el) => {
    const missing = requireRect(el, 'ComparisonTable');
    if (missing) return missing;
    const columnCount = el.columnCount ?? 4;
    const rowCount = el.rowCount ?? 4;
    const cellMaxLen = el.cellMaxLen ?? 16;
    const proxyCell = 'x'.repeat(cellMaxLen);
    const columns = Array.from({ length: columnCount }, () => proxyCell);
    const rows = Array.from({ length: rowCount }, () =>
      Array.from({ length: columnCount }, () => proxyCell),
    );
    return layoutComparisonTable({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      columns,
      rows,
      title: el.title,
    });
  },
  MaturityProgression: (el) => {
    const missing = requireRect(el, 'MaturityProgression');
    if (missing) return missing;
    const stageCount = el.stageCount ?? 4;
    const labelLen = el.stageLabelMaxLen ?? 16;
    const hasDesc = el.hasDescriptions ?? false;
    const proxy = 'x'.repeat(labelLen);
    const stages = Array.from({ length: stageCount }, () => ({
      label: proxy,
      description: hasDesc ? 'x'.repeat(Math.min(labelLen, 24)) : undefined,
    }));
    return layoutMaturityProgression({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      stages,
      currentStage: el.currentStage,
      title: el.title,
    });
  },
  FlowchartBuilder: (el) => {
    const missing = requireRect(el, 'FlowchartBuilder');
    if (missing) return missing;
    const rows = el.flowRows ?? 2;
    const cols = el.flowCols ?? 3;
    const labelLen = el.flowNodeMaxLen ?? 16;
    const hasDiamond = el.hasDiamondNodes ?? false;
    const proxyLabel = 'x'.repeat(labelLen);
    const nodes: FlowNode[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Mark the first cell as a diamond when hasDiamond is set; this makes
        // the layout apply DIAMOND_H_RATIO to the cell budget check.
        const kind: 'box' | 'diamond' = hasDiamond && r === 0 && c === 0 ? 'diamond' : 'box';
        nodes.push({ id: `n_${r}_${c}`, label: proxyLabel, kind, row: r, col: c });
      }
    }
    return layoutFlowchartBuilder({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      nodes,
      title: el.title,
    });
  },
  FunctionCallingLifecycle: (el) => {
    const missing = requireRect(el, 'FunctionCallingLifecycle');
    if (missing) return missing;
    return layoutFunctionCallingLifecycle({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      highlightPhase: el.highlightPhase as 0 | 1 | 2 | 3 | undefined,
      title: el.title,
    });
  },
  ErrorBackoffFlow: (el) => {
    const missing = requireRect(el, 'ErrorBackoffFlow');
    if (missing) return missing;
    return layoutErrorBackoffFlow({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      maxRetries: el.maxRetries,
      circuitBreaker: el.circuitBreaker,
      title: el.title,
    });
  },
  MemoryConsolidationFlow: (el) => {
    const missing = requireRect(el, 'MemoryConsolidationFlow');
    if (missing) return missing;
    return layoutMemoryConsolidationFlow({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      showDecayReturn: el.showDecayReturn,
      title: el.title,
    });
  },
  EntityRelationshipGraph: (el) => {
    const missing = requireRect(el, 'EntityRelationshipGraph');
    if (missing) return missing;
    const entityCount = el.entityCount ?? 6;
    const labelLen = el.entityLabelMaxLen ?? 14;
    const proxy = 'x'.repeat(labelLen);
    const entities = Array.from({ length: entityCount }, (_, i) => ({
      id: `e${i}`,
      label: proxy,
    }));
    return layoutEntityRelationshipGraph({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      entities,
      relationships: [],
      title: el.title,
    });
  },
  GovernanceEvolution: (el) => {
    const missing = requireRect(el, 'GovernanceEvolution');
    if (missing) return missing;
    return layoutGovernanceEvolution({
      x: el.x!, y: el.y!, w: el.w!, h: el.h!,
      currentStage: el.currentStage as 0 | 1 | 2 | undefined,
      title: el.title,
    });
  },
};

function computeElement(el: Element): { bbox: Box; children?: CompositeChild[]; error?: string } | null {
  switch (el.type) {
    case 'icon': {
      const bbox = iconBox(el.name, el.cx, el.cy, el.scale);
      return bbox ? { bbox } : null;
    }
    case 'text':
      return {
        bbox: textBox({
          text: el.text,
          x: el.x,
          y: el.y,
          fontSize: el.fontSize,
          textAnchor: el.textAnchor ?? 'middle',
          maxWidth: el.maxWidth,
        }),
      };
    case 'sketchbox':
      return {
        bbox: sketchBoxBox({
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rows: el.rows,
          padding: el.padding,
          gap: el.gap,
        }),
      };
    case 'diagram': {
      const layoutFn = COMPOSITE_LAYOUTS[el.name];
      if (!layoutFn) {
        return {
          bbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
          error: `Unknown diagram "${el.name}" — no layout function registered`,
        };
      }
      const result = layoutFn(el);
      return { bbox: result.outer, children: result.children, error: result.error };
    }
  }
}

function elementLabel(el: Element): string {
  switch (el.type) {
    case 'icon':
      return `${el.name} (cx=${el.cx}, cy=${el.cy}, scale=${el.scale})`;
    case 'text':
      return `HandWrittenText "${el.text.slice(0, 30)}${el.text.length > 30 ? '...' : ''}" (x=${el.x}, y=${el.y})`;
    case 'sketchbox':
      return `SketchBox (x=${el.x}, y=${el.y}, w=${el.width})`;
    case 'diagram':
      return `${el.name} (x=${el.x}, y=${el.y}, w=${el.w}, h=${el.h})`;
  }
}

function childLabel(el: Element, child: CompositeChild): string {
  const composite = el.type === 'diagram' ? el.name : el.type;
  const labelPart = child.label ? ` "${child.label.slice(0, 24)}"` : '';
  return `${composite}${labelPart} [${child.kind}]`;
}

export const submitPlanTool = defineTool({
  name: 'submitPlan',
  description:
    'Submit a layout plan for validation before generating TSX. ' +
    'Returns computed bounding boxes and checks safe zone, overlap, clearance, and narration budget. ' +
    'Call this after findAsset discovery and before emitting TSX code.',
  schema: planSchema,
  handler(plan) {
    const errors: string[] = [];
    const computedScenes: Array<{
      sceneIndex: number;
      elements: ComputedElement[];
    }> = [];

    for (const scene of plan.scenes) {
      interface Entry {
        el: Element;
        bbox: Box;
        children: CompositeChild[];  // empty if not a composite
        out: ComputedElement;
      }
      const entries: Entry[] = [];

      for (const el of scene.elements) {
        const result = computeElement(el);
        if (!result) {
          if (el.type === 'icon') {
            errors.push(
              `Scene ${scene.sceneIndex}: ${el.name} has no known defaultBox. ` +
              `Provide explicit width/height or use a different icon.`,
            );
          }
          continue;
        }

        if (result.error) {
          errors.push(`Scene ${scene.sceneIndex}: ${result.error}`);
          continue; // don't bother overlap-checking children of a failed composite
        }

        const out: ComputedElement = { type: el.type, bbox: result.bbox };
        if (el.type === 'icon' || el.type === 'diagram') out.name = el.name;
        if (el.type === 'text') out.text = el.text.slice(0, 40);
        if (result.children && result.children.length > 0) out.children = result.children;

        if (!inSafeZone(result.bbox)) {
          errors.push(
            `Scene ${scene.sceneIndex}: ${elementLabel(el)} bbox ${fmtBox(result.bbox)} ` +
            `extends outside safe zone (120,120)->(1800,960). Move inward or reduce scale.`,
          );
        }

        entries.push({ el, bbox: result.bbox, children: result.children ?? [], out });
      }

      // Cross-element overlap: compare each element's *visible* geometry (children
      // for composites, outer bbox otherwise) against every other element's.
      // Within a single composite, children also check against each other (so
      // crowded internal layouts surface even when the outer envelope is clean).
      for (let i = 0; i < entries.length; i++) {
        const a = entries[i];
        const aShapes: Array<{ bbox: Box; label: string }> = a.children.length > 0
          ? a.children
              .filter((c) => c.kind !== 'edge')
              .map((c) => ({ bbox: c.bbox, label: childLabel(a.el, c) }))
          : [{ bbox: a.bbox, label: elementLabel(a.el) }];

        // a's children vs. each other (only meaningful for composites).
        if (a.children.length > 0) {
          for (let s = 0; s < aShapes.length; s++) {
            for (let t = s + 1; t < aShapes.length; t++) {
              if (intersects(aShapes[s].bbox, aShapes[t].bbox)) {
                errors.push(
                  `Scene ${scene.sceneIndex}: inside ${elementLabel(a.el)}, ` +
                  `${aShapes[s].label} bbox ${fmtBox(aShapes[s].bbox)} ` +
                  `overlaps ${aShapes[t].label} bbox ${fmtBox(aShapes[t].bbox)}.`,
                );
              }
            }
          }
        }

        for (let j = i + 1; j < entries.length; j++) {
          const b = entries[j];
          const bShapes: Array<{ bbox: Box; label: string }> = b.children.length > 0
            ? b.children
                .filter((c) => c.kind !== 'edge')
                .map((c) => ({ bbox: c.bbox, label: childLabel(b.el, c) }))
            : [{ bbox: b.bbox, label: elementLabel(b.el) }];

          for (const as of aShapes) {
            for (const bs of bShapes) {
              if (intersects(as.bbox, bs.bbox)) {
                errors.push(
                  `Scene ${scene.sceneIndex}: ${as.label} bbox ${fmtBox(as.bbox)} ` +
                  `overlaps ${bs.label} bbox ${fmtBox(bs.bbox)}. ` +
                  `Move them apart or reduce scale.`,
                );
              } else {
                const gap = clearance(as.bbox, bs.bbox);
                if (gap < MIN_CLEARANCE_PX) {
                  errors.push(
                    `Scene ${scene.sceneIndex}: ${as.label} bbox ${fmtBox(as.bbox)} ` +
                    `is only ${Math.round(gap)}px from ${bs.label} bbox ${fmtBox(bs.bbox)}. ` +
                    `Need >= ${MIN_CLEARANCE_PX}px clearance.`,
                  );
                }
              }
            }
          }
        }
      }

      computedScenes.push({
        sceneIndex: scene.sceneIndex,
        elements: entries.map((e) => e.out),
      });
    }

    const allCues = plan.scenes.flatMap((s) => s.cues);
    const totalCues = allCues.length;
    const totalWords = allCues.reduce(
      (sum, c) => sum + c.text.split(/\s+/).filter(Boolean).length,
      0,
    );
    const estimatedSeconds = totalWords / 2.5;

    if (totalWords > MAX_NARRATION_WORDS) {
      errors.push(
        `Narration too long: ~${totalWords} words (${totalCues} cues), ` +
        `estimated ${Math.round(estimatedSeconds)}s. ` +
        `Budget is 150-225 words (60-90s). Remove ~${totalWords - MAX_NARRATION_WORDS} words.`,
      );
    }
    if (totalCues > MAX_CUES) {
      errors.push(
        `Too many cues: ${totalCues}. Maximum is ${MAX_CUES}. ` +
        `Consolidate or remove cues.`,
      );
    }

    return {
      approved: errors.length === 0,
      errors,
      scenes: computedScenes,
      narrationStats: {
        totalCues,
        totalWords,
        estimatedSeconds: Math.round(estimatedSeconds),
      },
    };
  },
});
