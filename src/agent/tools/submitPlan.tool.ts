import { z } from 'zod';
import { defineTool } from './types';
import {
  iconBox,
  textBox,
  sketchBoxBox,
  agentCoordinationBox,
  genericDiagramBox,
  isDiagram,
  intersects,
  inSafeZone,
  clearance,
  fmtBox,
  type Box,
} from '../../asset-index/bounds';

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
  cx: z.number().optional(),
  cy: z.number().optional(),
  radius: z.number().optional(),
  width: z.number().optional(),
  agents: z.number().optional(),
  pattern: z.enum(['supervisor', 'hierarchical', 'peer']).optional(),
  maxWidth: z.number().optional(),
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

const MIN_CLEARANCE_PX = 40;
const MAX_NARRATION_WORDS = 225;
const MAX_CUES = 35;

interface ComputedElement {
  type: string;
  name?: string;
  text?: string;
  bbox: Box;
}

function computeElementBox(el: Element): Box | null {
  switch (el.type) {
    case 'icon':
      return iconBox(el.name, el.cx, el.cy, el.scale);
    case 'text':
      return textBox({
        text: el.text,
        x: el.x,
        y: el.y,
        fontSize: el.fontSize,
        textAnchor: el.textAnchor ?? 'middle',
        maxWidth: el.maxWidth,
      });
    case 'sketchbox':
      return sketchBoxBox({
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rows: el.rows,
        padding: el.padding,
        gap: el.gap,
      });
    case 'diagram': {
      if (el.name === 'AgentCoordination') {
        return agentCoordinationBox({
          cx: el.cx,
          cy: el.cy,
          radius: el.radius,
          agents: el.agents,
          pattern: el.pattern,
          maxWidth: el.maxWidth,
        });
      }
      return genericDiagramBox({
        cx: el.cx,
        cy: el.cy,
        radius: el.radius,
        width: el.width,
      });
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
      return `${el.name} (cx=${el.cx ?? 960}, cy=${el.cy ?? 540})`;
  }
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
      const computed: Array<{ el: Element; bbox: Box; out: ComputedElement }> = [];

      for (const el of scene.elements) {
        const bbox = computeElementBox(el);
        if (!bbox) {
          if (el.type === 'icon') {
            errors.push(
              `Scene ${scene.sceneIndex}: ${el.name} has no known defaultBox. ` +
              `Provide explicit width/height or use a different icon.`,
            );
          }
          continue;
        }

        const out: ComputedElement = {
          type: el.type,
          bbox,
        };
        if (el.type === 'icon' || el.type === 'diagram') out.name = el.name;
        if (el.type === 'text') out.text = el.text.slice(0, 40);

        if (!inSafeZone(bbox)) {
          errors.push(
            `Scene ${scene.sceneIndex}: ${elementLabel(el)} bbox ${fmtBox(bbox)} ` +
            `extends outside safe zone (120,120)->(1800,960). Move inward or reduce scale.`,
          );
        }

        computed.push({ el, bbox, out });
      }

      for (let i = 0; i < computed.length; i++) {
        for (let j = i + 1; j < computed.length; j++) {
          const a = computed[i];
          const b = computed[j];

          if (intersects(a.bbox, b.bbox)) {
            errors.push(
              `Scene ${scene.sceneIndex}: ${elementLabel(a.el)} bbox ${fmtBox(a.bbox)} ` +
              `overlaps ${elementLabel(b.el)} bbox ${fmtBox(b.bbox)}. ` +
              `Move them apart or reduce scale.`,
            );
          } else {
            const gap = clearance(a.bbox, b.bbox);
            if (gap < MIN_CLEARANCE_PX) {
              errors.push(
                `Scene ${scene.sceneIndex}: ${elementLabel(a.el)} bbox ${fmtBox(a.bbox)} ` +
                `is only ${Math.round(gap)}px from ${elementLabel(b.el)} bbox ${fmtBox(b.bbox)}. ` +
                `Need >= ${MIN_CLEARANCE_PX}px clearance.`,
              );
            }
          }
        }
      }

      computedScenes.push({
        sceneIndex: scene.sceneIndex,
        elements: computed.map((c) => c.out),
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
