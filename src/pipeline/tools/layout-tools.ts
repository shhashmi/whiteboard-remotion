import Anthropic from '@anthropic-ai/sdk';
import { buildElementMap, isOverlapJustifiedByIntent, OVERLAP_THRESHOLD } from './intent-resolver';

// ─── Local types (avoid circular dep with types.ts/validation.ts) ──────────

interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LayoutElement {
  id: string;
  component: string;
  bounds: Bounds;
  props: Record<string, unknown>;
  group?: string;
  layer_intent?: { type: string; target: string; reason: string };
}

export interface BoundsIssue {
  id: string;
  issue: string;
}

export interface OverlapIssue {
  a: string;
  b: string;
  overlapPercent: number;
}

// ─── Tool implementations ──────────────────────────────────────────────────

export function measureText(
  text: string,
  fontSize: number,
  fontWeight?: number | string
): { w: number; h: number } {
  const weight = typeof fontWeight === 'string' ? parseInt(fontWeight, 10) : (fontWeight ?? 400);
  const charWidthFactor = weight >= 700 ? 0.6 : 0.55;
  return {
    w: Math.ceil(text.length * fontSize * charWidthFactor),
    h: Math.ceil(fontSize * 1.2),
  };
}

export function checkBounds(elements: LayoutElement[]): BoundsIssue[] {
  const issues: BoundsIssue[] = [];
  for (const el of elements) {
    const { x, y, w, h } = el.bounds;
    if (x < 0 || y < 0 || x + w > 1920 || y + h > 1080) {
      issues.push({
        id: el.id,
        issue: `out of bounds (${x},${y},${w}x${h}) — canvas is 1920x1080`,
      });
    }
  }
  return issues;
}

export function checkOverlaps(elements: LayoutElement[]): OverlapIssue[] {
  const issues: OverlapIssue[] = [];
  const elementMap = buildElementMap(elements);

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];

      // Skip overlap check if elements are in the same group (intentional stacking)
      if (a.group && a.group === b.group) continue;

      // Skip overlap if justified by declared layer_intent
      if (isOverlapJustifiedByIntent(a, b, elementMap)) continue;

      const overlapX = Math.max(0, Math.min(a.bounds.x + a.bounds.w, b.bounds.x + b.bounds.w) - Math.max(a.bounds.x, b.bounds.x));
      const overlapY = Math.max(0, Math.min(a.bounds.y + a.bounds.h, b.bounds.y + b.bounds.h) - Math.max(a.bounds.y, b.bounds.y));
      const overlapArea = overlapX * overlapY;

      const areaA = a.bounds.w * a.bounds.h;
      const areaB = b.bounds.w * b.bounds.h;
      const smallerArea = Math.min(areaA, areaB);

      if (smallerArea > 0 && overlapArea / smallerArea > OVERLAP_THRESHOLD) {
        issues.push({
          a: a.id,
          b: b.id,
          overlapPercent: Math.round((overlapArea / smallerArea) * 100),
        });
      }
    }
  }

  return issues;
}

export function suggestGrid(input: {
  count: number;
  region: { x: number; y: number; w: number; h: number };
  gap?: number;
}): Array<{ x: number; y: number; w: number; h: number }> {
  const { count, region, gap = 24 } = input;
  if (count <= 0) return [];

  // Pick sensible row/col counts
  let cols: number;
  let rows: number;
  if (count === 1) { cols = 1; rows = 1; }
  else if (count === 2) { cols = 2; rows = 1; }
  else if (count === 3) { cols = 3; rows = 1; }
  else if (count === 4) { cols = 2; rows = 2; }
  else if (count <= 6) { cols = 3; rows = 2; }
  else if (count <= 9) { cols = 3; rows = 3; }
  else { cols = Math.ceil(Math.sqrt(count)); rows = Math.ceil(count / cols); }

  const cellW = (region.w - gap * (cols - 1)) / cols;
  const cellH = (region.h - gap * (rows - 1)) / rows;

  const slots: Array<{ x: number; y: number; w: number; h: number }> = [];
  for (let r = 0; r < rows && slots.length < count; r++) {
    for (let c = 0; c < cols && slots.length < count; c++) {
      slots.push({
        x: Math.round(region.x + c * (cellW + gap)),
        y: Math.round(region.y + r * (cellH + gap)),
        w: Math.round(cellW),
        h: Math.round(cellH),
      });
    }
  }

  return slots;
}

// ─── Anthropic tool definitions ────────────────────────────────────────────

export const LAYOUT_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'measure_text',
    description:
      'Measure the approximate pixel dimensions of a text string at a given font size. Call this BEFORE placing any text element to know its real width and height — do not guess text dimensions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        text: {
          type: 'string',
          description: 'The text string to measure',
        },
        fontSize: {
          type: 'number',
          description: 'Font size in pixels',
        },
        fontWeight: {
          type: 'number',
          description: 'Font weight (e.g. 400 for regular, 700 for bold). Default 400.',
        },
      },
      required: ['text', 'fontSize'],
    },
  },
  {
    name: 'check_bounds',
    description:
      'Check whether elements fit within the 1920x1080 canvas. Call this after drafting a scene\'s elements to catch any that extend outside the canvas boundaries.',
    input_schema: {
      type: 'object' as const,
      properties: {
        elements: {
          type: 'array',
          description: 'Array of layout elements to check',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              component: { type: 'string' },
              bounds: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                  w: { type: 'number' },
                  h: { type: 'number' },
                },
                required: ['x', 'y', 'w', 'h'],
              },
              props: { type: 'object' },
              group: { type: 'string' },
              layer_intent: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['stack_above', 'stack_below', 'overlay', 'badge', 'behind', 'attached'],
                  },
                  target: { type: 'string' },
                  reason: { type: 'string' },
                },
                required: ['type', 'target', 'reason'],
              },
            },
            required: ['id', 'component', 'bounds', 'props'],
          },
        },
      },
      required: ['elements'],
    },
  },
  {
    name: 'check_overlaps',
    description:
      'Check for unintended overlaps (>30% area) between elements. Elements in the same group, and elements whose layer_intent declares an intentional overlap with their target, are automatically excluded. Call this after drafting a scene\'s elements to catch unintended collisions. If the tool flags an overlap that you actually want, add a layer_intent field to one of the elements pointing at the other.',
    input_schema: {
      type: 'object' as const,
      properties: {
        elements: {
          type: 'array',
          description: 'Array of layout elements to check for overlaps',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              component: { type: 'string' },
              bounds: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                  w: { type: 'number' },
                  h: { type: 'number' },
                },
                required: ['x', 'y', 'w', 'h'],
              },
              props: { type: 'object' },
              group: { type: 'string' },
              layer_intent: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['stack_above', 'stack_below', 'overlay', 'badge', 'behind', 'attached'],
                  },
                  target: { type: 'string' },
                  reason: { type: 'string' },
                },
                required: ['type', 'target', 'reason'],
              },
            },
            required: ['id', 'component', 'bounds', 'props'],
          },
        },
      },
      required: ['elements'],
    },
  },
  {
    name: 'suggest_grid',
    description:
      'Compute a grid layout that fits N items into a rectangular region with even spacing. Use this when you have 2+ similar items (cards, steps, icons) to lay out — do not compute grid math yourself.',
    input_schema: {
      type: 'object' as const,
      properties: {
        count: {
          type: 'number',
          description: 'Number of items to fit in the grid',
        },
        region: {
          type: 'object',
          description: 'The rectangular region to fill',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
            w: { type: 'number' },
            h: { type: 'number' },
          },
          required: ['x', 'y', 'w', 'h'],
        },
        gap: {
          type: 'number',
          description: 'Gap between items in pixels (default 24)',
        },
      },
      required: ['count', 'region'],
    },
  },
];
