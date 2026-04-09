> **⚠️ HISTORICAL — describes the old 7-stage pipeline.** The project now uses a single-shot Opus 4.6 generator driven by `.claude/skills/whiteboard-video/SKILL.md`. See the top-level `README.md` for current architecture. Preserved here for context.

# Video Creation Pipeline — Architecture

## Overview

A 7-stage sequential pipeline that transforms a raw idea into a rendered MP4 video. Each stage is an independent role with a focused responsibility. Stages communicate through saved artifacts — JSON files or source code — enabling the pipeline to be paused, inspected, edited, and resumed from any point.

The original "Animator" role was split into three stages — Layout, Animate, and Polish — to separate spatial positioning, timing, and code generation into distinct concerns.

---

## Pipeline Flow

```
User Idea (text)
       |
       v
  +---------+     +--------------+     +---------------+     +--------+     +---------+     +--------+     +----------+
  | Author  | --> | Scriptwriter | --> | Art Director  | --> | Layout | --> | Animate | --> | Polish | --> | Renderer |
  +---------+     +--------------+     +---------------+     +--------+     +---------+     +--------+     +----------+
       |                |                     |                   |              |               |                |
       v                v                     v                   v              v               v                v
  story-outline     script.json        visual-direction      layout.json   timed-layout    GeneratedVideo    generated.mp4
     .json                                  .json                              .json           .tsx
```

---

## Stage 1: Author

**Purpose:** Shape the raw idea into a narrative structure with an emotional arc.

**Receives:** A plain text idea from the user (e.g., "Explain how DNS works").

**Produces:** A story outline containing:
- A title, logline, and target audience
- A narrative arc type (journey, problem-solution, comparison, reveal, etc.)
- 3-8 story beats, each with a role (hook, setup, exploration, turn, deepening, climax, resolution, coda), a key idea, and an emotional note

**Tools:** None.

**Key constraints:**
- The Author thinks only about story structure and emotional flow
- Does not consider visuals, layout, text wording, or animation
- Every outline must have at least a hook beat and a resolution/coda beat
- Beats reference each other through a `connects_to` field to show narrative threads

**Saved artifact:** `out/1-story-outline.json`

---

## Stage 2: Scriptwriter

**Purpose:** Turn the story outline into concrete scenes with text content and pacing.

**Receives:** The story outline from the Author.

**Produces:** A script containing:
- 3-7 scenes, each linked to one or more beats from the outline
- Each scene has a content type that determines its structure: a single statement, text with elaboration, labeled items, a step sequence, a comparison matrix, a two-sided layout, key-value pairs, or a formula
- Transition language between scenes for narrative flow
- A terminology dictionary to enforce consistent naming across scenes
- Pacing instructions (slow, medium, fast) per scene
- Notes for the Art Director with creative hints (e.g., "this should feel tense", "the contrast is the point")

**Tools:** None.

**Key constraints:**
- Text auto-wraps when maxWidth is set on HandWrittenText (readability at video resolution)
- Terminology must be consistent — if a concept is named one way, it stays that way throughout
- The Scriptwriter does not decide visuals or layout — only what information each scene conveys

**Saved artifact:** `out/2-script.json`

---

## Stage 3: Art Director

**Purpose:** Decide how each scene should look — colors, composition, imagery, and visual style.

**Receives:** The script from the Scriptwriter.

**Produces:** A visual direction containing:
- Global color assignments (e.g., "resolver" is always blue across all scenes)
- An accent color and mood (e.g., "clean and modern", "hand-drawn sketch")
- Per-scene composition descriptions in natural language (e.g., "Large robot icon centered at top. Three cards below arranged horizontally.")
- Imagery selections for each scene — either assets found in the library or geometric fallbacks
- Density and emphasis guidance per scene

**Tools:**

| Tool | Purpose |
|------|---------|
| `search_assets` | Search the icon and image library by keyword, category, or concept. Returns matching assets with relevance scores and a quality rating (strong, weak, none). |

**How tools are used:**
- The Art Director searches for visual assets that match each scene's content
- If a search returns weak or no results, it tries broader terms (synonyms, related concepts)
- If still no match, it falls back to geometric shapes (circles, boxes) with labels and colors — a labeled shape in the right color is always better than an irrelevant icon
- Asset gaps (queries with no matches) are logged for future library expansion

**Key constraints:**
- Colors must be consistent across all scenes — if a concept is blue in scene 2, it stays blue everywhere
- The mood field guides the Polish role's choice of rendering style:
  - "clean and modern" / "polished" signals use of remotion-bits components
  - "hand-drawn sketch" / "whiteboard" signals use of SVG whiteboard primitives
- Composition hints can suggest specific component types: "Use animated text reveal for the title", "Show animated counter from 0 to 1000", "Display code with syntax highlighting"
- The Art Director does not write code — it describes visuals in natural language

**Saved artifact:** `out/3-visual-direction.json`

---

## Stage 4: Layout

**Purpose:** Position every visual element on the 1920x1080 canvas — deciding *where* things go without concerning itself with timing or code.

**Receives:** The script (from the Scriptwriter) and the visual direction (from the Art Director).

**Produces:** A layout spec (`LayoutSpec`) containing:
- Per-scene element lists, each with a component name, bounding box (`x, y, w, h`), and props
- Optional group assignments for elements that should animate together (e.g., "cards", "steps")

**Tools:** None.

**Key constraints:**
- All elements must fit within the 1920x1080 canvas
- Uses the component API reference (shared via `shared-prompts.ts`) to pick valid components
- Decides spatial composition only — no frame numbers, no animation timing
- Groups related elements so the Animate role can stagger them

**Saved artifact:** `out/4-layout.json`

---

## Stage 5: Animate

**Purpose:** Assign timing, stagger, and pacing to every element in the layout — deciding *when* things appear and how long they take.

**Receives:** The layout spec (from Layout) and the script (for pacing guidance).

**Produces:** A timed layout spec (`TimedLayoutSpec`) containing:
- Per-scene start/end frames
- Per-element `startFrame` and `durationFrames`
- `totalDurationInFrames` for the entire video

**Tools:**

| Tool | Purpose |
|------|---------|
| `search_skills` | Search Remotion skill rules for timing patterns, stagger techniques, and pacing conventions. |
| `fetch_skill` | Fetch the full content of a specific skill rule with code examples. |

**Key constraints:**
- Scene frame ranges must be contiguous (Scene1: 0-300, Scene2: 300-600, etc.)
- All content animations must complete by `endFrame - 60` (30-frame hold + 30-frame fade-out)
- Pacing guidance from the script (slow/medium/fast) informs scene duration
- Validated with `TimedLayoutSpecSchema` Zod schema and custom timing checks

**Saved artifact:** `out/5-timed-layout.json`

---

## Stage 6: Polish

**Purpose:** Write the complete video as a React/Remotion component — real, executable code — from the fully specified timed layout.

**Receives:** The timed layout spec (from Animate) and the visual direction (from the Art Director).

**Produces:** A complete TypeScript/React file (`GeneratedVideo.tsx`) containing:
- Individual scene components, each as a React function
- Data arrays, `.map()` loops, computed positions, conditional rendering
- Imports from two component libraries: whiteboard SVG primitives and remotion-bits HTML components
- Proper animation timing with frame-driven animation (no CSS transitions)

**Tools:**

| Tool | Purpose |
|------|---------|
| `search_skills` | Search Remotion best-practice rules by topic. Finds animation patterns, spring configs, chart recipes, transition approaches. |
| `fetch_skill` | Fetch the full content of a specific skill rule with detailed code examples. |
| `search_bits` | Search the remotion-bits component library for reusable animation components. |
| `fetch_bit` | Fetch a specific remotion-bits example by ID. Returns full source code. |

**Three rendering modes** (chosen based on visual direction mood):
- **SVG mode:** Whiteboard aesthetic using SketchBox, HandWrittenText, icons inside an SVG wrapper
- **HTML mode:** Clean/modern aesthetic using remotion-bits components (AnimatedText, TypeWriter, AnimatedCounter, CodeBlock, etc.) with CSS styling
- **Hybrid mode:** Both SVG and HTML layers stacked in the same scene

**Post-generation validation:**
1. **AST-based TSX analysis** — the generated code is parsed with Babel to extract scenes, elements, timing, and bounds. Catches timing violations and off-canvas elements without requiring `tsc` compilation.
2. **Visual validation** — rendered keyframes are screenshotted and reviewed by an LLM vision model to catch overlapping text, empty frames, off-canvas elements, and poor layout.
3. **Lesson memory** — visual mistakes from past runs are loaded and injected into the prompt to prevent recurrence.
4. If validation fails, the Polish role retries with the error/critique feedback.

**Key constraints:**
- All animation must be driven by `useCurrentFrame()` — CSS transitions/animations are forbidden
- Every scene uses the `<Scene>` wrapper which provides 30-frame fade in/out
- Scene frame ranges must be contiguous (Scene1: 0-300, Scene2: 300-600, etc.)
- All content animations must complete by `endFrame - 60` (30-frame hold + 30-frame fade-out)
- HandWrittenText auto-wraps when maxWidth is set, font size at least 20
- Canvas is 1920x1080

**Saved artifact:** `out/6-generated-video.tsx`

---

## Stage 7: Renderer

**Purpose:** Write the final files to disk and render the video to MP4.

**Receives:** The generated video code from the Polish role.

**Produces:**
- `src/generated/GeneratedVideo.tsx` — the scene code
- `src/generated/Root.tsx` — Remotion composition wrapper (sets duration, fps, dimensions)
- `src/generated/index.tsx` — Remotion entry point
- `out/generated.mp4` — the final rendered video

**Tools:** None (uses Remotion CLI for rendering).

**How it works:**
- Writes the three TypeScript files to `src/generated/`
- Invokes `npx remotion render` to compile the React components and render each frame to an MP4 file
- Video is rendered at 1920x1080, 30fps
- This stage is fully deterministic — no LLM involved

**Saved artifact:** `out/generated.mp4`

---

## Resumable Pipeline

The pipeline can be re-entered at any stage by providing a previously saved artifact:

| Command | Skips | Starts from |
|---------|-------|-------------|
| `--from=scriptwriter --input=out/1-story-outline.json` | Author | Scriptwriter |
| `--from=art-director --input=out/2-script.json` | Author, Scriptwriter | Art Director |
| `--from=layout --input=out/3-visual-direction.json` | Author, Scriptwriter, Art Director | Layout |
| `--from=animate --input=out/4-layout.json` | Author through Art Director | Animate |
| `--from=polish --input=out/5-timed-layout.json` | Author through Animate | Polish |
| `--from=renderer --input=out/6-generated-video.tsx` | All LLM stages | Renderer only |

This enables a human-in-the-loop workflow: run the pipeline, inspect an intermediate artifact, hand-edit it, then resume from the next stage.

---

## Tool Summary by Role

| Role | Tools Available | Tool Source |
|------|----------------|-------------|
| Author | None | — |
| Scriptwriter | None | — |
| Art Director | `search_assets` | Internal icon/image registry (48 SVG components across 6 categories) |
| Layout | None | — |
| Animate | `search_skills`, `fetch_skill` | Remotion skill rules (animation timing, stagger, pacing) |
| Polish | `search_skills`, `fetch_skill` | Same skill rules — animation patterns with code examples |
| Polish | `search_bits`, `fetch_bit` | remotion-bits catalog (text animation, counters, typewriter, code blocks, particles, gradients, 3D scenes) |

---

## Component Libraries

The Polish role has access to two distinct component libraries:

**Whiteboard Primitives** (SVG-based, hand-drawn aesthetic) — `src/shared/components.tsx`:
- Text: HandWrittenText (typewriter reveal)
- Shapes: SketchBox, SketchCircle, AnimatedPath
- Connectors: SketchArrow, SketchLine, DottedConnector
- Tables: SketchTable
- Status: CheckMark, CrossMark
- Icons: 48 categorized SVG icons (technology, people, abstract, business, flow, structure)

**Motion Patterns** (SVG-based, parametric) — `src/shared/motions.tsx`:
- FlowChain, CycleArrow, TreeDiagram, NetworkGraph, and more

**remotion-bits** (HTML/CSS-based, polished aesthetic):
- AnimatedText: word/character/line split with stagger and easing
- TypeWriter: character-by-character typing with cursor and typo simulation
- AnimatedCounter: numeric interpolation between values
- StaggeredMotion: directional stagger wrapper for children
- CodeBlock: syntax-highlighted code with line-by-line reveal
- GradientTransition: animated gradient backgrounds
- And more discoverable via search_bits/fetch_bit tools

The two libraries cannot be mixed inside the same container — SVG components go inside the `<SVG>` wrapper, HTML components go outside it. The hybrid rendering mode stacks both layers.

---

## Validation Strategy

| Stage | Validation Method | On Failure |
|-------|------------------|------------|
| Author | Zod schema validation on JSON output | Retry once with error feedback |
| Scriptwriter | Zod schema validation on JSON output | Retry once with error feedback |
| Art Director | Zod schema validation on JSON output | Retry without tools (geometric fallbacks only) |
| Layout | Zod schema validation + bounds checking | Retry once with error feedback |
| Animate | Zod schema validation + timing checks | Retry once with error feedback |
| Polish | AST analysis (tsx-analyzer) + vision-based frame critique + lesson memory | Retry once with compilation/timing/visual errors |
| Renderer | File system writes + Remotion render | Fail with error |

### TSX Analyzer

The `tsx-analyzer.ts` module parses generated code using Babel AST instead of regex, providing reliable extraction of:
- Scene components with their start/end frames
- Individual elements with positioning and timing props
- Duration and scene count for the Renderer
- Timing violation detection (animations that extend past `endFrame - 60`)
- Bounds validation (elements outside the 1920x1080 canvas)

### Visual Validator

The `visual-validator.ts` module renders keyframes from the generated video and sends them to a vision LLM for critique. It checks for:
- Overlapping or cut-off text
- Empty frames where content should be present
- Off-canvas elements
- Poor layout and visual hierarchy
- Element occlusion
- Contrast issues

### Lesson Memory

The `lesson-memory.ts` module tracks visual mistakes across pipeline runs in `out/lessons.jsonl`. Common issues are deduplicated, ranked by frequency, and injected into the Polish role's prompt so the model avoids repeating known mistakes.

---

## Cost & Performance Tracking

The pipeline tracks token usage and cost per role via `CostTracker`. After each run, a summary is logged showing input/output tokens and estimated cost per stage.

| Metric | Estimate |
|---|---|
| LLM calls per video | 6 (author + scriptwriter + art director + layout + animate + polish) |
| Art Director search calls | 3-8 (tool calls within the agent) |
| Animate/Polish skill/bit searches | 2-6 (tool calls within each agent) |
| Remotion render time | ~10-30 seconds |
