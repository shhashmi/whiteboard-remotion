// ─── Role 1: Author output ──────────────────────────────────────────────────

export interface StoryOutline {
  title: string;
  logline: string;
  audience: string;
  arc: NarrativeArc;
  beats: StoryBeat[];
}

export interface NarrativeArc {
  type: string;
  description: string;
}

export interface StoryBeat {
  id: string;
  role: string;
  intent: string;
  key_idea: string;
  emotional_note: string;
  connects_to?: string[];
}

// ─── Role 2: Scriptwriter output ────────────────────────────────────────────

export interface Script {
  title: string;
  scenes: SceneScript[];
  terminology: Record<string, string>;
}

export interface SceneScript {
  scene_number: number;
  beat_ids: string[];
  scene_type: string;
  heading: string;
  content: SceneContent;
  transition_in?: string;
  transition_out?: string;
  pacing: 'slow' | 'medium' | 'fast';
  notes_for_director?: string;
}

export type SceneContent =
  | { type: 'single-statement'; text: string }
  | { type: 'text-with-elaboration'; main: string; detail: string[] }
  | { type: 'labeled-items'; items: { label: string; description: string }[] }
  | { type: 'sequence'; steps: { label: string; detail?: string }[] }
  | {
      type: 'comparison';
      dimensions: string[];
      subjects: { name: string; values: string[] }[];
    }
  | {
      type: 'two-sides';
      left: { title: string; points: string[] };
      right: { title: string; points: string[] };
    }
  | { type: 'key-value-pairs'; pairs: { key: string; value: string }[] }
  | { type: 'formula'; parts: string[]; result: string };

// ─── Role 3: Art Director output ────────────────────────────────────────────

export interface VisualDirection {
  global_style: {
    color_assignments: Record<string, string>;
    accent_color: string;
    mood: string;
  };
  scenes: SceneDirection[];
}

export interface SceneDirection {
  scene_number: number;
  composition: string;
  imagery: ImageSelection[];
  color_usage: Record<string, string>;
  density: 'sparse' | 'medium' | 'dense';
  emphasis: string;
  reference_note?: string;
}

export interface ImageSelection {
  concept: string;
  image_id?: string;
  role_in_scene: string;
  suggested_scale: 'small' | 'medium' | 'large' | 'hero';
  fallback?: {
    type: 'geometric';
    shape: 'circle' | 'box' | 'arrow-chain' | 'icon-cluster';
    label: string;
    color: string;
  };
}

// ─── Role 4: Layout output ──────────────────────────────────────────────────

export interface LayoutElement {
  id: string;
  component: string;
  bounds: { x: number; y: number; w: number; h: number };
  props: Record<string, unknown>;
  group?: string;
}

export interface SceneLayout {
  scene_number: number;
  heading: string;
  elements: LayoutElement[];
}

export interface LayoutSpec {
  scenes: SceneLayout[];
}

// ─── Role 5: Animate output ────────────────────────────────────────────────

export interface TimedLayoutElement extends LayoutElement {
  startFrame: number;
  durationFrames: number;
}

export interface TimedSceneLayout extends SceneLayout {
  startFrame: number;
  endFrame: number;
  elements: TimedLayoutElement[];
}

export interface TimedLayoutSpec {
  scenes: TimedSceneLayout[];
  totalDurationInFrames: number;
}

// ─── Role 6: Polish output ─────────────────────────────────────────────────
// The Polish role outputs a complete .tsx file (real React code).
// See AnimatorOutput in roles/polish.ts.

// ─── Asset Registry ─────────────────────────────────────────────────────────

export interface ImageRecord {
  id: string;
  name: string;
  description: string;
  type: 'svg-component' | 'raster';
  category: string;
  depicts: string[];
  style: string;
  component_name?: string;
  props_interface?: string;
  embedding?: number[];
  aliases?: string[];
  subcategory?: string;
  parametric?: boolean;
  variants?: string[];
}

export interface AssetSearchResult {
  results: {
    id: string;
    name: string;
    description: string;
    type: 'svg-component' | 'raster';
    depicts: string[];
    relevance_score: number;
  }[];
  quality: 'strong' | 'weak' | 'none';
  suggestion?: string;
}

export interface AssetGap {
  query: string;
  concept: string;
  context: string;
  timestamp: string;
}
