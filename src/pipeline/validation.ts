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
