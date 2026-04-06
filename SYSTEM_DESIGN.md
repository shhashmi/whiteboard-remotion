# System Design: Text-to-Whiteboard-Video Pipeline

Convert a plain text message into an animated whiteboard explainer video, rendered via Remotion.

---

## 1. Product Framing

**User input:** A plain text message (e.g. "Explain how DNS resolution works", "Compare Kafka vs RabbitMQ", "5 principles of good API design").

**Output:** A downloadable MP4 whiteboard-style animated explainer video (1920x1080, 30fps) with hand-drawn aesthetic — sketch boxes, typewriter text, drawn icons, staggered reveals.

**What makes this sellable:**
- Zero design skill required from the user
- Deterministic, reproducible output (same input = same video)
- Editable intermediate artifacts (user can tweak the spec before rendering)
- Professional hand-drawn aesthetic already proven in the existing codebase

---

## 2. Existing Asset Inventory

Everything below already exists and works in this repo. The pipeline must compose these — not reinvent them.

### 2.1 Primitive Components (`src/studymaterial/components.tsx`)

| Component | Props | What it does |
|---|---|---|
| `HandWrittenText` | `text, x, y, startFrame, durationFrames, fontSize, fill, fontWeight, textAnchor, fontFamily` | Typewriter character-by-character text reveal in SVG |
| `AnimatedPath` | `d, startFrame, drawDuration, stroke, strokeWidth, fill, fillOpacity, fillDuration, opacity` | SVG path with stroke-dashoffset draw animation |
| `SketchBox` | `x, y, width, height, startFrame, drawDuration, stroke, strokeWidth, fill, fillOpacity, rx` | Wobbly-cornered rectangle (hand-drawn feel) |
| `SketchCircle` | `cx, cy, r, startFrame, drawDuration, stroke, fill, fillOpacity` | Imperfect bezier-circle |
| `SketchArrow` | `x1, y1, x2, y2, startFrame, drawDuration, color, strokeWidth` | Line with arrowhead (16px head) |
| `SketchLine` | `x1, y1, x2, y2, startFrame, drawDuration, color, strokeWidth` | Simple animated line |
| `SketchTable` | `headers, rows, x, y, colWidth, rowHeight, startFrame, framesPerRow, headerColor, fontSize` | Full table with animated border, header fill, row/col separators, cell text |
| `Scene` | `startFrame, endFrame, children` | Opacity fade in/out container (15-frame transitions), returns null outside range |
| `FadeIn` | `startFrame, durationFrames, direction, distance, children` | Directional entrance (up/down/left/right/scale) |
| `SVG` | `children` | 1920x1080 viewport wrapper |
| `CheckMark` | `cx, cy, scale, startFrame, drawDuration, color` | Animated green checkmark |
| `CrossMark` | `cx, cy, scale, startFrame, drawDuration, color` | Animated red X |

### 2.2 Icon Components (`src/studymaterial/components.tsx`)

All icons share the same interface: `cx, cy, scale, startFrame, drawDuration` + optional `color`.

`RobotHead`, `PersonIcon`, `BrainIcon`, `GearIcon`, `Lightbulb`, `ToolIcon`, `TargetIcon`, `DatabaseIcon`, `CodeIcon`, `CloudIcon`

Additional icons in `src/shared/components.tsx`: `BookIcon`, `MonitorIcon`, `SpeechBubble`, `BarChart`, `ClockIcon`, `DocStack`

### 2.3 Color Palette (`COLORS` in `src/studymaterial/components.tsx`)

```
outline: '#1e293b', orange: '#f97316', blue: '#3b82f6', purple: '#8b5cf6',
green: '#22c55e', yellow: '#fbbf24', red: '#ef4444',
gray1: '#64748b', gray2: '#94a3b8', gray3: '#cbd5e1', white: '#ffffff'
```

### 2.4 Proven Scene Patterns (from `src/studymaterial/scenes.tsx`)

These are the actual compositions that shipped. Each is a pattern the pipeline must be able to reproduce:

| Pattern | Example Scene | Key Technique |
|---|---|---|
| **Title card** | Scene1Title | Central icon + large `HandWrittenText` + subtitle + decorative dots |
| **Definition/concept** | Scene2Definition | Icon + text lines + concept circles connected by arrows + callout box |
| **N-card layout** | Scene3ThreePillars | N evenly-spaced `SketchBox` cards, each with number + icon + title + description |
| **Step chain** | Scene4Autonomy | Vertical chain of `SketchBox` items connected by `SketchArrow`, staggered by `i * 30` frames |
| **Comparison table** | Scene5ComparisonTable | `SketchTable` + summary row of circles/arrows below |
| **Split comparison** | Scene6GoalDirected | Two `SketchBox` panels side-by-side (Traditional vs Agentic) with icons and checklists |
| **Hub-and-spoke** | Scene7ToolUse | Central icon + radiating `SketchLine` connections to surrounding cards |
| **Spotlight** | Scene9Spotlight | Two large side-by-side cards with checklists and highlight boxes |
| **Closing/formula** | Scene10Closing | Icon row with "+" signs, "=" sign, big text conclusion |

### 2.5 Timing Conventions (empirical from existing scenes)

- Scene duration: 240-450 frames (8-15 seconds)
- Text reveal: ~1.5 chars/frame (`durationFrames ≈ text.length / 1.5`)
- Box draw: 18-30 frames
- Arrow draw: 10-15 frames
- Icon draw: 40-80 frames (scales with complexity)
- Stagger between sequential items: 25-35 frames
- Scene fade transition: 15 frames
- Content starts ~15 frames after scene start (allows fade-in)

### 2.6 Layout Constants (1920x1080 canvas)

- Title Y: 60-80px from top
- Content area: y=120 to y=950
- Side margins: 60-120px
- Card spacing for 3-card layout: x positions ~385, 960, 1535 (center of each card)
- Table default position: x=185-240, y=108-110
- Bottom annotations: y=950-1000

---

## 3. Retrieval Layer — Scaling to Thousands of Templates and Images

The previous sections inventory what exists today (~9 scene patterns, ~16 icons). But the product vision requires thousands of scene templates and thousands of images. You cannot stuff all of them into an LLM prompt. This section describes how the right templates and images are discovered at query time.

### 3.1 The Core Problem

| Asset type | Today | At scale | Why brute-force fails |
|---|---|---|---|
| Scene templates | 9 patterns | 2,000+ | Listing all in prompt = 500K+ tokens |
| Images/icons | 16 SVG icons | 2,000+ | Same — and images need visual descriptions |

The LLM must see only the **5-15 most relevant** templates and images for a given user message. Everything else is noise.

### 3.2 Asset Registry

Every template and image is registered in a structured catalog. This is the source of truth for retrieval.

#### Scene Template Registry

Each scene template is stored as a JSON file + a metadata record:

```
assets/
├── templates/
│   ├── registry.jsonl              # one metadata record per line
│   ├── card-layout-3col.json       # full template spec
│   ├── card-layout-2col.json
│   ├── step-chain-vertical.json
│   ├── comparison-table-4col.json
│   ├── timeline-horizontal.json
│   ├── ...                         # thousands of these
```

**Template metadata record:**

```typescript
interface TemplateRecord {
  id: string                          // "card-layout-3col"
  name: string                        // "Three-Column Card Layout"
  description: string                 // "Three evenly-spaced cards with number, icon, title, and 
                                      //  2-line description. Good for pillars, categories, or 
                                      //  parallel concepts."
  structural_type: string             // "card-layout" | "step-chain" | "table" | "hub-spoke" | ...
  content_fit: string[]               // ["categories", "pillars", "features", "pros-cons"]
  element_count: { min: number; max: number }  // { min: 2, max: 4 }
  complexity: "simple" | "moderate" | "complex"
  tags: string[]                      // ["comparison", "parallel", "side-by-side"]
  example_topics: string[]            // ["Three pillars of security", "React vs Vue vs Angular"]
  embedding?: number[]                // precomputed from description + tags + example_topics
}
```

The `description` field is written for retrieval — it describes what the template looks like *and* what content it's good for. The `embedding` is precomputed from `description + tags + example_topics` concatenated.

#### Image Registry

```
assets/
├── images/
│   ├── registry.jsonl
│   ├── svg/                    # SVG icon components
│   │   ├── robot-head.tsx
│   │   ├── database-cylinder.tsx
│   │   └── ...
│   ├── raster/                 # PNG/JPG illustrations (rendered to canvas)
│   │   ├── cloud-server.png
│   │   ├── lock-shield.png
│   │   └── ...
```

**Image metadata record:**

```typescript
interface ImageRecord {
  id: string                    // "robot-head"
  name: string                  // "Robot Head"
  description: string           // "Cartoon robot face with antenna, round eyes, zigzag mouth. 
                                //  Conveys AI, automation, bots, machine learning."
  type: "svg-component" | "raster"
  category: string              // "technology" | "people" | "business" | "science" | "abstract"
  depicts: string[]             // ["robot", "AI", "automation", "bot"]
  style: string                 // "hand-drawn" | "flat" | "outline" | "3d"
  props_interface?: string      // "cx, cy, scale, startFrame, drawDuration" (for SVG components)
  embedding?: number[]          // precomputed from description + depicts
}
```

### 3.3 Retrieval Mechanism

Two-phase retrieval: **filter then rank**.

```
User message: "Explain how Kubernetes orchestrates containers"
                          │
                          ▼
                 ┌─────────────────┐
                 │  Phase 1: Filter │   Structured metadata query
                 │  (fast, exact)   │   - structural_type IN (...)
                 │                  │   - element_count compatible
                 └────────┬────────┘
                          │ ~50-200 candidates
                          ▼
                 ┌─────────────────┐
                 │  Phase 2: Rank   │   Embedding cosine similarity
                 │  (semantic)      │   query embedding vs asset embedding
                 └────────┬────────┘
                          │ top 5-10
                          ▼
                   Injected into LLM prompt
```

#### Phase 1: Filter (templates)

Before any embedding search, narrow the candidate pool using structured metadata. The LLM in Stage 1 (Interpret) first emits a lightweight **search intent** — not the full blueprint yet:

```typescript
interface SearchIntent {
  content_type: "explanation" | "comparison" | "list" | "process" | "definition"
  estimated_scenes: number        // 3-7
  scene_needs: SceneNeed[]        // what each scene needs to show
}

interface SceneNeed {
  purpose: string                 // "show 5 steps in a deployment pipeline"
  structural_hint: string         // "step-chain" | "table" | "cards" | "diagram" | "any"
  element_count: number           // how many items to display
  concepts: string[]              // ["container", "pod", "node", "cluster"]
}
```

For each `SceneNeed`, filter templates:
- `structural_type` matches `structural_hint` (or skip filter if "any")
- `element_count.min <= need.element_count <= element_count.max`

This reduces ~2,000 templates to ~50-200 per scene need.

#### Phase 1: Filter (images)

For images, the `concepts` array from the search intent is used:
- Match against `depicts` array (exact substring match)
- Filter by `category` if the content domain is clear
- Filter by `style` to match the video's aesthetic

This reduces ~2,000 images to ~30-100 per concept.

#### Phase 2: Rank (both templates and images)

Embed the scene need's `purpose` string using a lightweight embedding model (e.g. `voyage-3-lite` or `text-embedding-3-small`). Compute cosine similarity against the precomputed `embedding` field of each candidate.

Return top-K:
- **Templates:** top 5 per scene need
- **Images:** top 5 per concept

#### Embedding Precomputation

Run once when assets are added (not at query time):

```typescript
// Precompute on asset registration
async function registerTemplate(template: TemplateRecord) {
  const textToEmbed = [
    template.description,
    template.tags.join(", "),
    template.example_topics.join(". "),
    template.content_fit.join(", "),
  ].join(" | ");

  template.embedding = await embed(textToEmbed);
  appendToRegistry("assets/templates/registry.jsonl", template);
}

async function registerImage(image: ImageRecord) {
  const textToEmbed = [
    image.description,
    image.depicts.join(", "),
    image.category,
  ].join(" | ");

  image.embedding = await embed(textToEmbed);
  appendToRegistry("assets/images/registry.jsonl", image);
}
```

### 3.4 What Gets Injected into the LLM Prompt

After retrieval, the LLM sees a **shortlist**, not the full catalog.

**For Stage 1 (Interpret) prompt — template selection:**

```
For scene 3, you need to show "5 steps in a deployment pipeline" (5 items).
These templates are available — pick the best one by ID:

1. step-chain-vertical (score: 0.92)
   "Vertical chain of boxes connected by arrows. 3-8 steps. Good for 
    sequential processes, pipelines, workflows."

2. timeline-horizontal (score: 0.87)
   "Horizontal timeline with milestone markers. 4-10 events. Good for 
    chronological processes, release cycles, evolution."

3. numbered-list-2col (score: 0.81)
   "Two-column numbered list with descriptions. 4-8 items. Good for 
    ordered steps, ranked lists, instructions."

Selected template ID: ___
```

**For Stage 1 (Interpret) prompt — image selection:**

```
For the concept "container", these images are available — pick by ID:

1. docker-container (score: 0.94) — "Blue whale carrying shipping containers. 
   Depicts: Docker, containers, packaging, deployment."

2. shipping-box (score: 0.88) — "Cardboard box with packing tape. 
   Depicts: packaging, containment, shipping, storage."

3. server-rack (score: 0.83) — "Server rack with blinking lights. 
   Depicts: infrastructure, hosting, data center."

Selected image ID: ___
```

The LLM makes the **creative choice** from a curated shortlist. It doesn't search — it picks.

### 3.5 Storage & Index Options (MVP)

For MVP with ~2,000 assets, heavyweight vector databases are overkill:

| Option | When to use |
|---|---|
| **In-memory JSONL + brute-force cosine** | < 5,000 assets. Load `registry.jsonl` into memory, compute cosine on the fly. Fast enough (~10ms for 5K vectors of dim 256). |
| **SQLite + sqlite-vss** | 5,000-50,000 assets. Structured filters via SQL, vector search via VSS extension. Single file, no server. |
| **Dedicated vector DB (Pinecone, Qdrant)** | > 50,000 assets or multi-tenant SaaS. Probably never needed for templates, possibly for images. |

**MVP recommendation:** In-memory JSONL. Load both registries at startup (~2MB for 2K records with 256-dim embeddings). Filter in JS, brute-force cosine similarity. No infrastructure dependency.

### 3.5.1 Brute-Force Cosine Similarity — How It Works

"Brute-force cosine" means: compare the query vector against **every** candidate vector, one by one, with no index or shortcut. It's the simplest possible vector search — a single loop.

**What is cosine similarity?**

Every template and image has a precomputed **embedding** — a fixed-length array of numbers (e.g. 256 floats) produced by an embedding model. The embedding captures the *meaning* of the asset's description. Two descriptions about similar topics will have embeddings that point in similar directions in 256-dimensional space.

Cosine similarity measures the angle between two vectors. It ranges from -1 (opposite) to +1 (identical direction). For text embeddings, higher = more semantically similar.

```
                    A · B           Σ(aᵢ × bᵢ)
cosine(A, B) = ─────────── = ─────────────────────
                |A| × |B|     √Σ(aᵢ²) × √Σ(bᵢ²)
```

**The algorithm:**

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function bruteForceSearch(
  queryEmbedding: number[],             // embed("show 5 steps in deployment")
  candidates: TemplateRecord[],         // ~50-200 after Phase 1 filtering
  topK: number = 5
): { record: TemplateRecord; score: number }[] {

  // Score every candidate — this is the "brute force" part
  const scored = candidates.map(record => ({
    record,
    score: cosineSimilarity(queryEmbedding, record.embedding),
  }));

  // Sort descending by score, return top K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
```

**Why "brute force" is fine here:**

| Factor | Value |
|---|---|
| Candidates after Phase 1 filter | ~50-200 (not the full 2,000) |
| Embedding dimension | 256 floats |
| Work per comparison | 256 multiplications + 256 additions |
| Total comparisons | 200 × 256 = ~51,200 floating point ops |
| Wall time | **< 1ms** on any modern CPU |

Even without Phase 1 filtering — scanning all 2,000 assets raw — is ~512,000 ops, still well under 10ms. Brute force becomes a problem at 100K+ vectors, which is when you'd switch to an approximate nearest neighbor (ANN) index like HNSW (used by Qdrant, Pinecone, etc.). At MVP scale, adding an ANN index adds complexity for zero measurable benefit.

**When brute-force stops being viable:**

| Asset count | Brute-force time (256-dim) | Action |
|---|---|---|
| 2,000 | ~1ms | Use brute-force |
| 10,000 | ~5ms | Still fine |
| 50,000 | ~25ms | Borderline — consider SQLite-vss |
| 200,000+ | ~100ms+ | Switch to ANN index |

### 3.6 Template Spec Format (Data-Driven, Not Hardcoded)

At scale, templates can't be hardcoded React components. Each template is a **parameterized JSON spec** — a layout recipe that the code generator can execute:

```typescript
interface TemplateSpec {
  id: string
  meta: TemplateRecord                      // the registry metadata
  canvas: { width: 1920; height: 1080 }
  parameters: ParameterDef[]                // what the LLM must fill in
  elements: TemplateElement[]               // the layout recipe
}

interface ParameterDef {
  name: string                              // "heading", "cards", "steps"
  type: "string" | "string[]" | "object[]"
  description: string                       // tells the LLM what to provide
  constraints?: {
    maxLength?: number
    minItems?: number
    maxItems?: number
  }
}

// Elements use parameter references like {{heading}}, {{cards[i].title}}
interface TemplateElement {
  component: string
  props: Record<string, unknown>           // values can contain {{param}} refs
  repeat?: {                               // for lists/cards/steps
    over: string                           // "cards", "steps"
    as: string                             // "card", "step"
    layout: "horizontal" | "vertical" | "grid" | "radial"
    spacing: number                        // px between items
    stagger: number                        // frames between items
  }
}
```

**Example: `card-layout-3col.json`**

```json
{
  "id": "card-layout-3col",
  "parameters": [
    { "name": "heading", "type": "string", "constraints": { "maxLength": 50 } },
    { "name": "cards", "type": "object[]", "constraints": { "minItems": 2, "maxItems": 4 },
      "description": "Each card has: number (int), icon (ImageID), title (string), description (string), color (ColorName)" }
  ],
  "elements": [
    {
      "component": "HandWrittenText",
      "props": { "text": "{{heading}}", "x": 960, "y": 68, "fontSize": 46, "textAnchor": "middle",
                 "startFrame": "{{sceneStart + 15}}", "durationFrames": 35 }
    },
    {
      "component": "SketchLine",
      "props": { "x1": 380, "y1": 82, "x2": 1540, "y2": 82, "color": "COLORS.orange", "strokeWidth": 3,
                 "startFrame": "{{sceneStart + 50}}", "drawDuration": 20 }
    },
    {
      "component": "SketchBox",
      "repeat": { "over": "cards", "as": "card", "layout": "horizontal", "spacing": 575, "stagger": 15 },
      "props": {
        "x": "{{layoutX}}", "y": 120, "width": 450, "height": 650,
        "startFrame": "{{itemStart}}", "drawDuration": 30,
        "stroke": "{{card.color}}", "strokeWidth": 3, "fill": "{{card.color}}", "fillOpacity": 0.1
      }
    },
    {
      "component": "HandWrittenText",
      "repeat": { "over": "cards", "as": "card", "layout": "horizontal", "spacing": 575, "stagger": 15 },
      "props": {
        "text": "{{card.number}}", "x": "{{layoutCenterX}}", "y": 205,
        "fontSize": 72, "fill": "{{card.color}}", "fontWeight": 700, "textAnchor": "middle",
        "startFrame": "{{itemStart + 20}}", "durationFrames": 15
      }
    },
    {
      "component": "{{card.icon}}",
      "repeat": { "over": "cards", "as": "card", "layout": "horizontal", "spacing": 575, "stagger": 15 },
      "props": {
        "cx": "{{layoutCenterX}}", "cy": 350, "scale": 2.5,
        "startFrame": "{{itemStart + 30}}", "drawDuration": 45
      }
    },
    {
      "component": "HandWrittenText",
      "repeat": { "over": "cards", "as": "card", "layout": "horizontal", "spacing": 575, "stagger": 15 },
      "props": {
        "text": "{{card.title}}", "x": "{{layoutCenterX}}", "y": 490,
        "fontSize": 34, "fill": "{{card.color}}", "fontWeight": 700, "textAnchor": "middle",
        "startFrame": "{{itemStart + 55}}", "durationFrames": 20
      }
    },
    {
      "component": "HandWrittenText",
      "repeat": { "over": "cards", "as": "card", "layout": "horizontal", "spacing": 575, "stagger": 15 },
      "props": {
        "text": "{{card.description}}", "x": "{{layoutCenterX}}", "y": 535,
        "fontSize": 22, "fill": "COLORS.gray1", "fontWeight": 400, "textAnchor": "middle",
        "startFrame": "{{itemStart + 70}}", "durationFrames": 20
      }
    }
  ]
}
```

The **template is the layout knowledge**. The LLM only fills in the parameters. The code generator resolves `{{param}}` references, computes `{{layoutX}}` and `{{layoutCenterX}}` from the repeat layout, and computes `{{itemStart}}` from stagger.

### 3.7 Revised Pipeline (with Retrieval)

```
User message
     │
     ▼
┌──────────┐      ┌───────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Stage 0  │      │ Stage 1   │      │ Stage 2  │      │ Stage 3  │      │ Stage 4  │
│ Search   │─────▶│ Interpret │─────▶│ Retrieve │─────▶│ Fill     │─────▶│ Emit +   │
│ Intent   │      │           │      │ Assets   │      │ Templates│      │ Render   │
│ (LLM)    │      │ (LLM)     │      │ (code)   │      │ (LLM)    │      │ (code)   │
└──────────┘      └───────────┘      └──────────┘      └──────────┘      └──────────┘
  ~200 tok out     ~800 tok out       no LLM call       ~2000 tok out     no LLM call
```

**Stage 0 — Search Intent (LLM, lightweight):**
Extract what the video needs to show. Output: `SearchIntent` with scene needs and concept list. This is a small, fast call (~200 output tokens).

**Stage 1 — Interpret (LLM, with retrieved shortlists):**
The prompt now includes the top-5 template shortlist and top-5 image shortlist per scene need (retrieved by Stage 0's output). The LLM picks template IDs and image IDs from the shortlists, writes the on-screen text, and outputs a `VideoBlueprint` with concrete asset references.

**Stage 2 — Retrieve Assets (deterministic):**
Load the full template specs and image definitions for the chosen IDs. No LLM call.

**Stage 3 — Fill Templates (LLM):**
Given the full template specs (with `{{param}}` slots) and the `VideoBlueprint` content, the LLM fills in parameter values. This is highly constrained — the template defines what's needed, the LLM just provides the values. Output: filled parameter values per scene.

**Stage 4 — Emit + Render (deterministic):**
Resolve template parameters, compute layout positions, assign frame numbers, emit `.tsx`, render MP4.

### 3.8 Why This Ordering Matters

| Concern | How it's addressed |
|---|---|
| LLM can't see 2K templates | Stage 0 extracts search queries → retrieval narrows to ~5 per scene |
| LLM picks wrong template | It picks from a pre-ranked shortlist of 5, not 2,000. Retrieval does the hard filtering. |
| LLM hallucinates image names | It picks from a shortlist of 5 real images per concept. IDs are validated. |
| Template layout quality | Layout knowledge lives in the template spec JSON, not the LLM. LLM only fills text + selects icons. |
| Cost stays low | Stage 0 is tiny. Stage 1 sees ~50 shortlist entries, not 2,000. Stage 3 sees ~5 template specs. Total prompt size stays under 10K tokens. |

---

## 4. Pipeline Architecture (Detailed)

### Stage 0: Search Intent

**Input:** Raw text message.
**Output:** `SearchIntent` — lightweight extraction of what the video needs.

This is a cheap, fast LLM call. Its only job is to produce good retrieval queries.

```typescript
interface SearchIntent {
  topic: string                              // "Kubernetes container orchestration"
  content_type: "explanation" | "comparison" | "list" | "process" | "definition"
  scene_needs: SceneNeed[]
}

interface SceneNeed {
  purpose: string                            // natural language: "show 5 steps in deployment"
  structural_hint: string                    // "step-chain" | "table" | "cards" | "diagram" | "any"
  element_count: number
  concepts: string[]                         // entities to illustrate: ["container", "pod", "node"]
}
```

### Stage 1: Interpret (with shortlists)

**Input:** Raw text message + retrieved template shortlists + retrieved image shortlists.

**Output:** `VideoBlueprint` — the creative plan with concrete asset ID references.

```typescript
interface VideoBlueprint {
  title: string
  scenes: SceneBlueprint[]
}

interface SceneBlueprint {
  templateId: string                         // chosen from shortlist, e.g. "card-layout-3col"
  content: Record<string, unknown>           // parameter values the template needs
  images: { slot: string; imageId: string }[] // which image goes where
}

```

The `content` field is a generic map because each template defines its own parameter schema (via `ParameterDef[]`). The LLM fills `content` based on the template's parameter definitions.

### Stages 2-4

Described in section 3.7 above. Stage 2 (Retrieve Assets) loads the full template specs. Stage 3 (Fill Templates) has the LLM fill parameter slots. Stage 4 (Emit + Render) resolves templates to code deterministically.

---

## 5. Template Resolution Engine (Stage 4 Detail)

Stage 4 takes filled template parameters and produces `.tsx` code. This is entirely deterministic.

### 5.1 Repeat Layout Computation

Templates with `repeat` blocks need layout math:

```typescript
function computeRepeatLayout(
  repeat: { layout: string; spacing: number; stagger: number },
  items: unknown[],
  canvasWidth: number
): { layoutX: number; layoutCenterX: number; itemStart: number }[] {
  const n = items.length;

  if (repeat.layout === "horizontal") {
    const totalWidth = (n - 1) * repeat.spacing;
    const startX = (canvasWidth - totalWidth) / 2 - repeat.spacing / 2;
    return items.map((_, i) => ({
      layoutX: startX + i * repeat.spacing,
      layoutCenterX: startX + i * repeat.spacing + repeat.spacing / 2,
      itemStart: i * repeat.stagger,  // relative to element's startFrame
    }));
  }

  if (repeat.layout === "vertical") {
    return items.map((_, i) => ({
      layoutX: 0,    // vertical uses fixed X from template
      layoutCenterX: 0,
      itemStart: i * repeat.stagger,
    }));
  }
  // ... grid, radial
}
```

### 5.2 Template Variable Resolution

```typescript
function resolveTemplateValue(
  expr: string,                              // "{{card.title}}" or "{{sceneStart + 15}}"
  context: {
    params: Record<string, unknown>,         // filled parameter values
    sceneStart: number,
    itemIndex?: number,
    layoutX?: number,
    layoutCenterX?: number,
    itemStart?: number,
  }
): string | number {
  // Simple variable: {{heading}} → params.heading
  // Dotted path: {{card.title}} → current repeat item's title
  // Arithmetic: {{sceneStart + 15}} → sceneStart + 15
  // Layout vars: {{layoutX}}, {{layoutCenterX}}, {{itemStart}}
}
```

### 5.3 Generated Code Structure

Output follows the exact boilerplate of `AgenticAIExplainer.tsx`:

```tsx
// src/generated/GeneratedVideo.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  SVG, Scene, AnimatedPath, HandWrittenText,
  SketchBox, SketchCircle, SketchArrow, SketchLine,
  RobotHead, PersonIcon, BrainIcon, GearIcon, Lightbulb,
  ToolIcon, TargetIcon, CheckMark, CrossMark,
  DatabaseIcon, CodeIcon, CloudIcon,
  SketchTable, COLORS,
} from '../studymaterial/components';

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');
`;

export const GeneratedVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#fefefe', fontFamily: '"Architects Daughter", "Caveat", cursive' }}>
    <style>{fontStyle}</style>
    <AbsoluteFill style={{ backgroundImage: '...paper texture...', pointerEvents: 'none' }} />
    <AbsoluteFill style={{ backgroundImage: '...dot grid...', pointerEvents: 'none' }} />
    {/* scenes emitted from resolved templates */}
  </AbsoluteFill>
);
```

### 5.4 Color Resolution

Template color references (e.g. `"orange"`) resolve to `COLORS.orange` in emitted code:

```typescript
const COLOR_MAP: Record<string, string> = {
  orange: 'COLORS.orange', blue: 'COLORS.blue', purple: 'COLORS.purple',
  green: 'COLORS.green', yellow: 'COLORS.yellow', red: 'COLORS.red',
  gray1: 'COLORS.gray1', gray2: 'COLORS.gray2', outline: 'COLORS.outline',
};
```

---

## 6. Implementation Plan

### Files to Create

```
src/
├── pipeline/
│   ├── generate.ts          # CLI entry point
│   ├── search-intent.ts     # Stage 0: message → SearchIntent
│   ├── retrieve.ts          # Retrieval: filter + rank templates and images
│   ├── interpret.ts         # Stage 1: message + shortlists → VideoBlueprint
│   ├── fill.ts              # Stage 3: template specs + blueprint → filled params
│   ├── emit.ts              # Stage 4: filled templates → .tsx source code
│   ├── resolve.ts           # Template variable resolution engine
│   ├── types.ts             # All shared types
│   ├── prompts/
│   │   ├── search-intent.txt
│   │   ├── interpret.txt
│   │   └── fill.txt
│   └── validation.ts        # Zod schemas for inter-stage validation
├── assets/
│   ├── templates/
│   │   ├── registry.jsonl   # Template metadata + embeddings
│   │   ├── title-card.json
│   │   ├── card-layout-3col.json
│   │   ├── step-chain-vertical.json
│   │   ├── comparison-table-4col.json
│   │   └── ...
│   ├── images/
│   │   ├── registry.jsonl   # Image metadata + embeddings
│   │   └── svg/             # SVG icon components
│   └── embed.ts             # Script to precompute embeddings for all assets
├── generated/               # Output directory (gitignored)
│   ├── GeneratedVideo.tsx
│   ├── Root.tsx
│   └── index.tsx
```

### Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.39.0",
  "ts-node": "^10.9.0",
  "zod": "^3.23.0"
}
```

Embedding model: use Anthropic's Voyage API or OpenAI's `text-embedding-3-small` (256 dims). Chosen at implementation time based on cost.

### Scripts

```json
{
  "generate": "npx ts-node src/pipeline/generate.ts",
  "embed-assets": "npx ts-node src/assets/embed.ts",
  "studio:generated": "npx remotion studio src/generated/index.tsx",
  "render:generated": "npx remotion render src/generated/index.tsx GeneratedVideo out/generated.mp4"
}
```

---

## 7. Validation & Error Handling

### After Stage 0 → before retrieval

Validate `SearchIntent`:
- `scene_needs` has 3-7 entries
- Each `structural_hint` is a known category or "any"
- Each `concepts` array is non-empty

### After Stage 1 → before Stage 2

Validate `VideoBlueprint`:
- Every `templateId` exists in the template registry
- Every `imageId` in `images` exists in the image registry
- `content` keys match the chosen template's `parameters[].name`
- Text values satisfy the template's `constraints` (maxLength, minItems, etc.)
- Scene count is 3-7

### After Stage 3 → before Stage 4

Validate filled parameters:
- All required template parameters have values
- Array lengths are within `minItems`/`maxItems`
- No empty strings for required text fields

### After Stage 4

- Run `npx tsc --noEmit src/generated/GeneratedVideo.tsx` to verify compilation
- Validate frame monotonicity in the resolved spec

All validation uses Zod. On failure: re-prompt with the Zod error (1 retry max).

---

## 8. Cost & Performance Estimates

| Metric | Estimate |
|---|---|
| LLM calls per video | 3 (search intent + interpret + fill) |
| Embedding calls per video | 1 (embed the user message, ~100 tokens) |
| Retrieval time | ~10ms (in-memory brute-force at 2K assets) |
| Total LLM tokens (input) | ~6,000 (search ~500, interpret ~3,000, fill ~2,500) |
| Total LLM tokens (output) | ~3,000 (search ~200, interpret ~800, fill ~2,000) |
| LLM cost per video | ~$0.05-0.15 (Sonnet) |
| LLM latency | ~4-7 seconds total |
| Remotion render time | ~10-30 seconds |
| Total wall time | ~15-40 seconds |
| Asset registry startup load | ~2MB, ~50ms |

---

## 9. User-Editable Intermediate Artifacts

Each stage saves its output for inspection and re-entry:

```
out/
├── search-intent.json     # Stage 0 output
├── shortlists.json        # Retrieval results (template + image candidates)
├── blueprint.json         # Stage 1 output — editable script
├── filled-params.json     # Stage 3 output — editable parameter values
├── GeneratedVideo.tsx     # Stage 4 output — editable code
└── generated.mp4          # Final render
```

Re-entry points:
1. Edit `blueprint.json` (change text, swap template IDs, swap image IDs) → re-run from Stage 2
2. Edit `filled-params.json` (tweak text, reorder items) → re-run from Stage 4
3. Edit `GeneratedVideo.tsx` directly → re-render

---

## 10. Bootstrapping the Asset Registries

The codebase already has 9 proven scene patterns and 16 icons. To bootstrap:

1. **Extract existing patterns as template specs:** Convert each scene in `scenes.tsx` into a parameterized JSON template. Scene3ThreePillars becomes `card-layout-3col.json`, Scene5ComparisonTable becomes `comparison-table-4col.json`, etc.

2. **Register existing icons:** Create an `ImageRecord` for each icon component in `components.tsx` with semantic descriptions and `depicts` tags.

3. **Run `embed-assets`:** Precompute embeddings for all registry entries.

4. **Grow incrementally:** Each new template or image added to the `assets/` directory gets registered and embedded. The retrieval layer picks it up automatically.

The existing 9 patterns cover the most common content types. New templates are added when users request layouts the existing ones can't handle — not speculatively.

---

## 11. Verification Checklist

1. **Retrieval quality:** For 10 diverse inputs, verify the top-5 retrieved templates contain at least 1 reasonable match per scene
2. **End-to-end smoke test:** `npx ts-node src/pipeline/generate.ts "Explain how DNS works"` produces valid MP4
3. **Template coverage:** Verify each template in the registry can be filled and rendered without errors
4. **Image coverage:** Verify each image ID in the registry resolves to a real component/file
5. **Compilation check:** `npx tsc --noEmit` on every generated file
6. **Visual inspection:** Open in Remotion Studio — no overlapping text, animations in order, elements within viewport
7. **Edit roundtrip:** Modify `blueprint.json`, re-run from Stage 2, verify changes reflected
8. **Retrieval performance:** With 2K assets, retrieval completes in < 50ms

---

## 12. What This Design Does NOT Cover (Future Work)

- Audio/voiceover generation
- Real-time preview (streaming LLM output)
- Multi-language support
- Brand customization (custom color palettes, logos, fonts)
- Batch generation / API server
- Template authoring UI (currently manual JSON)
- Raster image rendering in SVG canvas (currently SVG components only)
- A/B testing different templates for the same content
