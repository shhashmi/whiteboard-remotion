import { z } from 'zod';

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
