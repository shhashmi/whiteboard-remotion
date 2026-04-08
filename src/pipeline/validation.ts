import { z } from 'zod';
import type { SceneContent, Script } from './types';

// ─── StoryOutline validation ────────────────────────────────────────────────

export const StoryBeatSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  intent: z.string().min(1),
  key_idea: z.string().min(1),
  emotional_note: z.string().min(1),
  connects_to: z.array(z.string()).optional(),
});

export const StoryOutlineSchema = z.object({
  title: z.string().min(1),
  logline: z.string().min(1),
  audience: z.string().min(1),
  arc: z.object({
    type: z.string().min(1),
    description: z.string().min(1),
  }),
  beats: z.array(StoryBeatSchema).min(1).max(10),
});

// ─── Script validation ──────────────────────────────────────────────────────

const SceneContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('single-statement'), text: z.string().min(1) }),
  z.object({
    type: z.literal('text-with-elaboration'),
    main: z.string().min(1),
    detail: z.array(z.string()),
  }),
  z.object({
    type: z.literal('labeled-items'),
    items: z.array(z.object({ label: z.string(), description: z.string() })).min(1),
  }),
  z.object({
    type: z.literal('sequence'),
    steps: z.array(z.object({ label: z.string(), detail: z.string().optional() })).min(1),
  }),
  z.object({
    type: z.literal('comparison'),
    dimensions: z.array(z.string()).min(1),
    subjects: z.array(z.object({ name: z.string(), values: z.array(z.string()) })).min(2),
  }),
  z.object({
    type: z.literal('two-sides'),
    left: z.object({ title: z.string(), points: z.array(z.string()) }),
    right: z.object({ title: z.string(), points: z.array(z.string()) }),
  }),
  z.object({
    type: z.literal('key-value-pairs'),
    pairs: z.array(z.object({ key: z.string(), value: z.string() })).min(1),
  }),
  z.object({
    type: z.literal('formula'),
    parts: z.array(z.string()).min(1),
    result: z.string().min(1),
  }),
]);

const SceneScriptSchema = z.object({
  scene_number: z.number().int().positive(),
  beat_ids: z.array(z.string()),
  scene_type: z.string().min(1),
  heading: z.string().min(1),
  content: SceneContentSchema,
  transition_in: z.string().optional(),
  transition_out: z.string().optional(),
  pacing: z.enum(['slow', 'medium', 'fast']),
  notes_for_director: z.string().optional(),
});

export const ScriptSchema = z.object({
  title: z.string().min(1),
  scenes: z.array(SceneScriptSchema).min(3).max(10),
  terminology: z.record(z.string(), z.string()),
});

// ─── VisualDirection validation ──────────────────────────────────────────────

const ImageSelectionSchema = z.object({
  concept: z.string().min(1),
  image_id: z.string().optional(),
  role_in_scene: z.string().min(1),
  suggested_scale: z.enum(['small', 'medium', 'large', 'hero']),
  fallback: z
    .object({
      type: z.literal('geometric'),
      shape: z.enum(['circle', 'box', 'arrow-chain', 'icon-cluster']),
      label: z.string().min(1),
      color: z.string().min(1),
    })
    .optional(),
});

const SceneDirectionSchema = z.object({
  scene_number: z.number().int().positive(),
  composition: z.string().min(1),
  imagery: z.array(ImageSelectionSchema),
  color_usage: z.record(z.string(), z.string()),
  density: z.enum(['sparse', 'medium', 'dense']),
  emphasis: z.string().min(1),
  reference_note: z.string().optional(),
});

export const VisualDirectionSchema = z.object({
  global_style: z.object({
    color_assignments: z.record(z.string(), z.string()),
    accent_color: z.string().min(1),
    mood: z.string().min(1),
  }),
  scenes: z.array(SceneDirectionSchema).min(3).max(10),
});

// ─── LayoutSpec validation ───────────────────────────────────────────────────

const BoundsSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
});

const LayoutElementSchema = z.object({
  id: z.string().min(1),
  component: z.string().min(1),
  bounds: BoundsSchema,
  props: z.record(z.string(), z.unknown()),
  group: z.string().optional(),
});

const SceneLayoutSchema = z.object({
  scene_number: z.number().int().positive(),
  heading: z.string().min(1),
  elements: z.array(LayoutElementSchema).min(1),
});

export const LayoutSpecSchema = z.object({
  scenes: z.array(SceneLayoutSchema).min(3).max(10),
});

// ─── TimedLayoutSpec validation ─────────────────────────────────────────────

const TimedLayoutElementSchema = LayoutElementSchema.extend({
  startFrame: z.number().int().min(0),
  durationFrames: z.number().int().positive(),
});

const TimedSceneLayoutSchema = SceneLayoutSchema.extend({
  startFrame: z.number().int().min(0),
  endFrame: z.number().int().positive(),
  elements: z.array(TimedLayoutElementSchema).min(1),
});

export const TimedLayoutSpecSchema = z.object({
  scenes: z.array(TimedSceneLayoutSchema).min(3).max(10),
  totalDurationInFrames: z.number().int().positive(),
});

// ─── Layout bounds validation ───────────────────────────────────────────────

export function validateLayoutBounds(spec: { scenes: { scene_number: number; elements: { id: string; bounds: { x: number; y: number; w: number; h: number }; props: Record<string, unknown>; group?: string }[] }[] }): string | null {
  const issues: string[] = [];

  for (const scene of spec.scenes) {
    for (const el of scene.elements) {
      const { x, y, w, h } = el.bounds;

      // Bounds check: within 1920x1080
      if (x < 0 || y < 0 || x + w > 1920 || y + h > 1080) {
        issues.push(
          `Scene ${scene.scene_number}, ${el.id}: out of bounds (${x},${y},${w}x${h}) — canvas is 1920x1080`
        );
      }

      // Text length check
      const text = el.props.text;
      if (typeof text === 'string' && text.length > 40) {
        issues.push(
          `Scene ${scene.scene_number}, ${el.id}: text "${text.slice(0, 30)}..." is ${text.length} chars (max 40)`
        );
      }
    }

    // Overlap detection between non-grouped elements
    const elements = scene.elements;
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const a = elements[i];
        const b = elements[j];

        // Skip overlap check if elements are in the same group (intentional stacking)
        if (a.group && a.group === b.group) continue;

        const overlapX = Math.max(0, Math.min(a.bounds.x + a.bounds.w, b.bounds.x + b.bounds.w) - Math.max(a.bounds.x, b.bounds.x));
        const overlapY = Math.max(0, Math.min(a.bounds.y + a.bounds.h, b.bounds.y + b.bounds.h) - Math.max(a.bounds.y, b.bounds.y));
        const overlapArea = overlapX * overlapY;

        const areaA = a.bounds.w * a.bounds.h;
        const areaB = b.bounds.w * b.bounds.h;
        const smallerArea = Math.min(areaA, areaB);

        if (smallerArea > 0 && overlapArea / smallerArea > 0.3) {
          issues.push(
            `Scene ${scene.scene_number}: ${a.id} and ${b.id} overlap >30% (${Math.round(overlapArea / smallerArea * 100)}%)`
          );
        }
      }
    }
  }

  return issues.length > 0
    ? `LAYOUT ISSUES:\n${issues.join('\n')}`
    : null;
}

// ─── Layout validation constants ───────────────────────────────────────────

const ICON_BASE_SIZES: Record<string, { w: number; h: number }> = {
  RobotHead:    { w: 60, h: 54 },
  PersonIcon:   { w: 50, h: 95 },
  BrainIcon:    { w: 100, h: 90 },
  ToolIcon:     { w: 36, h: 43 },
  TargetIcon:   { w: 76, h: 56 },
  DatabaseIcon: { w: 50, h: 70 },
  CodeIcon:     { w: 70, h: 55 },
  CloudIcon:    { w: 130, h: 80 },
  BookIcon:     { w: 60, h: 75 },
  MonitorIcon:  { w: 110, h: 93 },
  Lightbulb:    { w: 60, h: 84 },
  GearIcon:     { w: 72, h: 72 },
  ClockIcon:    { w: 66, h: 66 },
  BarChart:     { w: 120, h: 90 },
  DocStack:     { w: 60, h: 78 },
  CheckMark:    { w: 36, h: 27 },
  CrossMark:    { w: 28, h: 28 },
};

const COMPONENT_REQUIRED_PROPS: Record<string, string[]> = {
  HandWrittenText: ['text', 'x', 'y'],
  SketchBox:       ['x', 'y', 'width', 'height'],
  SketchCircle:    ['cx', 'cy', 'r'],
  SketchArrow:     ['x1', 'y1', 'x2', 'y2'],
  SketchLine:      ['x1', 'y1', 'x2', 'y2'],
  SketchTable:     ['headers', 'rows', 'x', 'y'],
  SpeechBubble:    ['cx', 'cy', 'width', 'height'],
  CheckMark:       ['cx', 'cy'],
  CrossMark:       ['cx', 'cy'],
  RobotHead:       ['cx', 'cy'],
  PersonIcon:      ['cx', 'cy'],
  BrainIcon:       ['cx', 'cy'],
  ToolIcon:        ['cx', 'cy'],
  TargetIcon:      ['cx', 'cy'],
  DatabaseIcon:    ['cx', 'cy'],
  CodeIcon:        ['cx', 'cy'],
  CloudIcon:       ['cx', 'cy'],
  BookIcon:        ['cx', 'cy'],
  MonitorIcon:     ['cx', 'cy'],
  Lightbulb:       ['cx', 'cy'],
  GearIcon:        ['cx', 'cy'],
  ClockIcon:       ['cx', 'cy'],
  BarChart:        ['cx', 'cy'],
  DocStack:        ['cx', 'cy'],
};

const CONTAINER_COMPONENTS = new Set(['SketchBox', 'SketchCircle']);
const CONNECTOR_COMPONENTS = new Set(['SketchLine', 'SketchArrow']);

// ─── Layout validation helpers ─────────────────────────────────────────────

type Bounds = { x: number; y: number; w: number; h: number };

function boundsContain(outer: Bounds, inner: Bounds): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

function pointInBounds(px: number, py: number, b: Bounds): boolean {
  return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}

function containmentRatio(container: Bounds, inner: Bounds): number {
  const overlapX = Math.max(0, Math.min(container.x + container.w, inner.x + inner.w) - Math.max(container.x, inner.x));
  const overlapY = Math.max(0, Math.min(container.y + container.h, inner.y + inner.h) - Math.max(container.y, inner.y));
  const innerArea = inner.w * inner.h;
  if (innerArea <= 0) return 1;
  return (overlapX * overlapY) / innerArea;
}

function distanceToBounds(px: number, py: number, b: Bounds): number {
  const cx = Math.max(b.x, Math.min(px, b.x + b.w));
  const cy = Math.max(b.y, Math.min(py, b.y + b.h));
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}

function extractSceneTexts(content: SceneContent): string[] {
  switch (content.type) {
    case 'single-statement':
      return [content.text];
    case 'text-with-elaboration':
      return [content.main, ...content.detail];
    case 'labeled-items':
      return content.items.flatMap((i) => [i.label, i.description]);
    case 'sequence':
      return content.steps.flatMap((s) => [s.label, ...(s.detail ? [s.detail] : [])]);
    case 'comparison':
      return [...content.dimensions, ...content.subjects.flatMap((s) => [s.name, ...s.values])];
    case 'two-sides':
      return [content.left.title, ...content.left.points, content.right.title, ...content.right.points];
    case 'key-value-pairs':
      return content.pairs.flatMap((p) => [p.key, p.value]);
    case 'formula':
      return [...content.parts, content.result];
  }
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

// ─── Layout structure validation ───────────────────────────────────────────

type LayoutElementLike = {
  id: string;
  component: string;
  bounds: Bounds;
  props: Record<string, unknown>;
  group?: string;
};

type SceneLayoutLike = {
  scene_number: number;
  elements: LayoutElementLike[];
};

export function validateLayoutStructure(spec: { scenes: SceneLayoutLike[] }): string | null {
  const issues: string[] = [];

  for (const scene of spec.scenes) {
    const sn = scene.scene_number;
    const elements = scene.elements;

    // Check 12: Duplicate IDs
    const seenIds = new Set<string>();
    for (const el of elements) {
      if (seenIds.has(el.id)) {
        issues.push(`Scene ${sn}: duplicate element ID "${el.id}"`);
      }
      seenIds.add(el.id);
    }

    // Check 13: Required props
    for (const el of elements) {
      const required = COMPONENT_REQUIRED_PROPS[el.component];
      if (!required) continue;
      for (const prop of required) {
        if (!(prop in el.props)) {
          issues.push(`Scene ${sn}, ${el.id}: ${el.component} missing required prop "${prop}"`);
        }
      }
    }

    // Check 10: Minimum element size
    for (const el of elements) {
      if (CONNECTOR_COMPONENTS.has(el.component)) continue;
      const { w, h } = el.bounds;
      if (w < 20 || h < 20) {
        issues.push(`Scene ${sn}, ${el.id}: bounds too small (${w}x${h}) — element may be invisible`);
      }
    }

    // Check 9: Font size vs bounds height
    for (const el of elements) {
      if (el.component !== 'HandWrittenText') continue;
      const fontSize = typeof el.props.fontSize === 'number' ? el.props.fontSize : 32;
      if (fontSize > el.bounds.h * 0.9) {
        issues.push(`Scene ${sn}, ${el.id}: fontSize (${fontSize}) exceeds bounds height (${el.bounds.h}) — text will be clipped`);
      }
    }

    // Check 11: Text too close to canvas edge
    for (const el of elements) {
      if (el.component !== 'HandWrittenText') continue;
      const { x, y, w, h } = el.bounds;
      if (x < 20 || y < 20 || x + w > 1900 || y + h > 1060) {
        issues.push(`Scene ${sn}, ${el.id}: text too close to canvas edge (within 20px margin)`);
      }
    }

    // Check 1: Container before content (z-order)
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const later = elements[j];
        const earlier = elements[i];
        if (CONTAINER_COMPONENTS.has(later.component) && boundsContain(later.bounds, earlier.bounds)) {
          issues.push(`Scene ${sn}, ${later.id}: container must appear before ${earlier.id} in elements array for correct z-order`);
        }
      }
    }

    // Check 2: Grouped stacking order
    const groups = new Map<string, { el: LayoutElementLike; index: number }[]>();
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!el.group) continue;
      if (!groups.has(el.group)) groups.set(el.group, []);
      groups.get(el.group)!.push({ el, index: i });
    }
    for (const [groupName, members] of groups) {
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i];
          const b = members[j];
          // If b is a container and a is not, and they overlap, b should come first
          if (CONTAINER_COMPONENTS.has(b.el.component) && !CONTAINER_COMPONENTS.has(a.el.component)) {
            const overlapX = Math.max(0, Math.min(a.el.bounds.x + a.el.bounds.w, b.el.bounds.x + b.el.bounds.w) - Math.max(a.el.bounds.x, b.el.bounds.x));
            const overlapY = Math.max(0, Math.min(a.el.bounds.y + a.el.bounds.h, b.el.bounds.y + b.el.bounds.h) - Math.max(a.el.bounds.y, b.el.bounds.y));
            if (overlapX > 0 && overlapY > 0) {
              issues.push(`Scene ${sn}, group "${groupName}": ${b.el.id} (container) should appear before ${a.el.id} for correct z-order`);
            }
          }
        }
      }
    }

    // Check 3: Lines/arrows behind content
    for (let i = 0; i < elements.length; i++) {
      const connector = elements[i];
      if (!CONNECTOR_COMPONENTS.has(connector.component)) continue;
      const x1 = connector.props.x1 as number | undefined;
      const y1 = connector.props.y1 as number | undefined;
      const x2 = connector.props.x2 as number | undefined;
      const y2 = connector.props.y2 as number | undefined;
      if (x1 == null || y1 == null || x2 == null || y2 == null) continue;

      for (let j = 0; j < i; j++) {
        const target = elements[j];
        if (CONNECTOR_COMPONENTS.has(target.component)) continue;
        const d1 = distanceToBounds(x1, y1, target.bounds);
        const d2 = distanceToBounds(x2, y2, target.bounds);
        if (d1 <= 50 || d2 <= 50) {
          issues.push(`Scene ${sn}: ${connector.id} should appear before ${target.id} (connectors render behind connected elements)`);
        }
      }
    }

    // Check 4: Text inside container
    for (const textEl of elements) {
      if (textEl.component !== 'HandWrittenText') continue;
      const tx = textEl.props.x as number | undefined;
      const ty = textEl.props.y as number | undefined;
      if (tx == null || ty == null) continue;

      for (const boxEl of elements) {
        if (!CONTAINER_COMPONENTS.has(boxEl.component)) continue;
        if (pointInBounds(tx, ty, boxEl.bounds)) {
          const ratio = containmentRatio(boxEl.bounds, textEl.bounds);
          if (ratio < 0.9) {
            issues.push(`Scene ${sn}, ${textEl.id}: text spills outside container ${boxEl.id} (${Math.round(ratio * 100)}% contained, need >=90%)`);
          }
        }
      }
    }

    // Check 5: Arrow endpoint validity
    for (const el of elements) {
      if (el.component !== 'SketchArrow') continue;
      const x1 = el.props.x1 as number | undefined;
      const y1 = el.props.y1 as number | undefined;
      const x2 = el.props.x2 as number | undefined;
      const y2 = el.props.y2 as number | undefined;
      if (x1 == null || y1 == null || x2 == null || y2 == null) continue;

      const others = elements.filter((o) => o.id !== el.id);
      for (const [label, px, py] of [['start', x1, y1], ['end', x2, y2]] as const) {
        const minDist = others.reduce((min, o) => Math.min(min, distanceToBounds(px, py, o.bounds)), Infinity);
        if (minDist > 50) {
          issues.push(`Scene ${sn}, ${el.id}: ${label} endpoint (${px},${py}) is not near any element — arrow may point into empty space`);
        }
      }
    }

    // Check 6: Icon scale vs bounds mismatch
    for (const el of elements) {
      const base = ICON_BASE_SIZES[el.component];
      if (!base) continue;
      const scale = typeof el.props.scale === 'number' ? el.props.scale : 1;
      const expectedArea = (base.w * scale) * (base.h * scale);
      const actualArea = el.bounds.w * el.bounds.h;
      if (expectedArea <= 0) continue;
      const ratio = actualArea / expectedArea;
      if (ratio > 2 || ratio < 0.5) {
        issues.push(`Scene ${sn}, ${el.id}: bounds area (${actualArea}) vs expected icon footprint (${Math.round(expectedArea)}) off by ${ratio.toFixed(1)}x`);
      }
    }
  }

  return issues.length > 0
    ? `STRUCTURE ISSUES:\n${issues.join('\n')}`
    : null;
}

// ─── Layout completeness validation ────────────────────────────────────────

export function validateLayoutCompleteness(
  spec: { scenes: { scene_number: number; elements: { component: string; props: Record<string, unknown> }[] }[] },
  script: Script
): string | null {
  const issues: string[] = [];

  // Check 8: Scene count match
  const layoutSceneNums = new Set(spec.scenes.map((s) => s.scene_number));
  for (const scriptScene of script.scenes) {
    if (!layoutSceneNums.has(scriptScene.scene_number)) {
      issues.push(`Script scene ${scriptScene.scene_number} has no corresponding layout scene`);
    }
  }

  // Check 7: Missing text from script
  for (const scriptScene of script.scenes) {
    const layoutScene = spec.scenes.find((s) => s.scene_number === scriptScene.scene_number);
    if (!layoutScene) continue;

    const scriptTexts = extractSceneTexts(scriptScene.content);
    const layoutTexts = layoutScene.elements
      .filter((el) => el.component === 'HandWrittenText' && typeof el.props.text === 'string')
      .map((el) => normalizeText(el.props.text as string));

    for (const raw of scriptTexts) {
      if (raw.length < 3) continue;
      const normalized = normalizeText(raw);
      if (normalized.length < 3) continue;
      const found = layoutTexts.some(
        (lt) => lt.includes(normalized) || normalized.includes(lt)
      );
      if (!found) {
        issues.push(`Scene ${scriptScene.scene_number}: script text "${raw.slice(0, 40)}" has no matching HandWrittenText element`);
      }
    }
  }

  return issues.length > 0
    ? `COMPLETENESS ISSUES:\n${issues.join('\n')}`
    : null;
}

// ─── Layout validation orchestrator ────────────────────────────────────────

export function validateLayout(
  spec: { scenes: { scene_number: number; elements: { id: string; component: string; bounds: { x: number; y: number; w: number; h: number }; props: Record<string, unknown>; group?: string }[] }[] },
  script: Script
): string | null {
  const results = [
    validateLayoutBounds(spec),
    validateLayoutStructure(spec),
    validateLayoutCompleteness(spec, script),
  ].filter(Boolean);
  return results.length > 0 ? results.join('\n\n') : null;
}

// ─── Timing validation ──────────────────────────────────────────────────────

export function validateTimingSpec(spec: { scenes: { scene_number: number; startFrame: number; endFrame: number; elements: { id: string; startFrame: number; durationFrames: number; group?: string }[] }[] }): string | null {
  const issues: string[] = [];

  for (let i = 0; i < spec.scenes.length; i++) {
    const scene = spec.scenes[i];

    // Scene contiguity
    if (i > 0) {
      const prev = spec.scenes[i - 1];
      if (scene.startFrame !== prev.endFrame) {
        issues.push(
          `Scene ${scene.scene_number}: startFrame (${scene.startFrame}) != previous scene endFrame (${prev.endFrame})`
        );
      }
    }

    // First scene starts at 0
    if (i === 0 && scene.startFrame !== 0) {
      issues.push(`Scene ${scene.scene_number}: first scene must start at frame 0, got ${scene.startFrame}`);
    }

    const deadline = scene.endFrame - 60;

    for (const el of scene.elements) {
      // Timing constraint: complete by endFrame - 60
      const endAt = el.startFrame + el.durationFrames;
      if (endAt > deadline) {
        issues.push(
          `Scene ${scene.scene_number}, ${el.id}: ends@${endAt} but must complete by ${deadline} (endFrame-60)`
        );
      }

      // First element starts after fade-in
      if (el.startFrame < scene.startFrame + 30) {
        issues.push(
          `Scene ${scene.scene_number}, ${el.id}: starts@${el.startFrame} but scene fade-in ends at ${scene.startFrame + 30}`
        );
      }
    }

    // Stagger sanity: grouped elements should have increasing startFrames
    const groups = new Map<string, { id: string; startFrame: number }[]>();
    for (const el of scene.elements) {
      if (el.group) {
        if (!groups.has(el.group)) groups.set(el.group, []);
        groups.get(el.group)!.push({ id: el.id, startFrame: el.startFrame });
      }
    }
    for (const [group, members] of groups) {
      for (let j = 1; j < members.length; j++) {
        if (members[j].startFrame < members[j - 1].startFrame) {
          issues.push(
            `Scene ${scene.scene_number}, group "${group}": ${members[j].id} starts before ${members[j - 1].id}`
          );
        }
      }
    }
  }

  return issues.length > 0
    ? `TIMING ISSUES:\n${issues.join('\n')}`
    : null;
}

// ─── AnimationSpec validation ────────────────────────────────────────────────

const AnimationElementSchema: z.ZodType<{
  component: string;
  props: Record<string, unknown>;
}> = z.object({
  component: z.string().min(1),
  props: z.record(z.string(), z.unknown()),
});

const AnimationSceneSchema = z.object({
  scene_number: z.number().int().positive(),
  startFrame: z.number().int().min(0),
  endFrame: z.number().int().positive(),
  elements: z.array(AnimationElementSchema).min(1),
});

export const AnimationSpecSchema = z.object({
  width: z.literal(1920),
  height: z.literal(1080),
  fps: z.literal(30),
  durationInFrames: z.number().int().positive(),
  scenes: z.array(AnimationSceneSchema).min(3).max(10),
});

// ─── Validate helper ─────────────────────────────────────────────────────────

export function validate<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const errors = result.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Validation failed for ${label}:\n${errors}`);
}
