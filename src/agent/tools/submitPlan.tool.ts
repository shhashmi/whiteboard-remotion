import { z } from 'zod';
import { defineTool } from './types';
import {
  iconBox,
  textBox,
  sketchBoxBox,
  genericDiagramBox,
  intersects,
  inSafeZone,
  clearance,
  fmtBox,
  type Box,
  type CompositeChild,
  type CompositeLayoutResult,
} from '../../asset-index/bounds';
import { layoutAgentCoordination } from '../../shared/diagrams/AgentCoordination';

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
  // Legacy fields (deprecated; kept for fallback on not-yet-retrofitted diagrams).
  cx: z.number().optional(),
  cy: z.number().optional(),
  radius: z.number().optional(),
  width: z.number().optional(),
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
 * optional error). Diagrams missing from this table fall back to
 * `genericDiagramBox` — opaque envelope only.
 */
const COMPOSITE_LAYOUTS: Record<string, (el: DiagramEl) => CompositeLayoutResult> = {
  AgentCoordination: (el) => {
    if (el.x === undefined || el.y === undefined || el.w === undefined || el.h === undefined) {
      return {
        outer: { x1: 0, y1: 0, x2: 0, y2: 0 },
        children: [],
        error: 'AgentCoordination now requires {x, y, w, h}; cx/cy/radius/maxWidth are no longer accepted',
      };
    }
    const agents = el.agents
      ?? (el.agentCount ? Array.from({ length: el.agentCount }, (_, i) => `Agent ${String.fromCharCode(65 + i)}`) : undefined);
    return layoutAgentCoordination({
      x: el.x,
      y: el.y,
      w: el.w,
      h: el.h,
      pattern: el.pattern,
      agents,
      supervisor: el.supervisor,
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
      if (layoutFn) {
        const result = layoutFn(el);
        return { bbox: result.outer, children: result.children, error: result.error };
      }
      // Fallback for not-yet-retrofitted diagrams.
      return {
        bbox: genericDiagramBox({
          cx: el.cx,
          cy: el.cy,
          radius: el.radius,
          width: el.width,
          x: el.x,
          y: el.y,
          w: el.w,
          h: el.h,
        }),
      };
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
      return `${el.name} (x=${el.x ?? el.cx}, y=${el.y ?? el.cy}, w=${el.w}, h=${el.h})`;
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
