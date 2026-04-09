// ─── Shared intent-walking logic for overlap validation ─────────────────────

export const OVERLAP_THRESHOLD = 0.3;

interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ElementWithIntent {
  id: string;
  component: string;
  bounds: Bounds;
  props: Record<string, unknown>;
  group?: string;
  layer_intent?: { type: string; target: string; reason: string };
}

export function buildElementMap(elements: ElementWithIntent[]): Map<string, ElementWithIntent> {
  const map = new Map<string, ElementWithIntent>();
  for (const el of elements) {
    map.set(el.id, el);
  }
  return map;
}

/**
 * Returns true if the overlap between a and b is justified by layer_intent declarations.
 * Walks intent chains bidirectionally up to maxDepth steps.
 */
export function isOverlapJustifiedByIntent(
  a: ElementWithIntent,
  b: ElementWithIntent,
  elementMap: Map<string, ElementWithIntent>,
  maxDepth = 5
): boolean {
  // Direct intent: a targets b or b targets a
  if (a.layer_intent?.target === b.id) return true;
  if (b.layer_intent?.target === a.id) return true;

  // Walk chain from a toward b
  if (a.layer_intent && walksTo(a, b.id, elementMap, maxDepth)) return true;
  // Walk chain from b toward a
  if (b.layer_intent && walksTo(b, a.id, elementMap, maxDepth)) return true;

  return false;
}

// TODO: Consider adding explicit cycle detection in validateIntents that surfaces
// a clear error when the model builds a cyclic intent chain. Currently cycles are
// silently tolerated by the maxDepth limit but cause confusing downstream flags.
function walksTo(
  start: ElementWithIntent,
  targetId: string,
  elementMap: Map<string, ElementWithIntent>,
  maxDepth: number
): boolean {
  let current = start;
  for (let i = 0; i < maxDepth; i++) {
    const nextId = current.layer_intent?.target;
    if (!nextId) return false;
    if (nextId === targetId) return true;
    const next = elementMap.get(nextId);
    if (!next) return false;
    current = next;
  }
  return false;
}
