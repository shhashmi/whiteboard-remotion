# Video Creation Pipeline — Architecture

## Overview

A 5-stage sequential pipeline that transforms a raw idea into a rendered MP4 video. Each stage is an independent role with a focused responsibility. Stages communicate through saved artifacts — JSON files or source code — enabling the pipeline to be paused, inspected, edited, and resumed from any point.

---

## Pipeline Flow

```
User Idea (text)
       |
       v
  +---------+     +--------------+     +---------------+     +----------+     +----------+
  | Author  | --> | Scriptwriter | --> | Art Director  | --> | Animator | --> | Renderer |
  +---------+     +--------------+     +---------------+     +----------+     +----------+
       |                |                     |                    |                |
       v                v                     v                    v                v
  story-outline     script.json        visual-direction     GeneratedVideo    generated.mp4
     .json                                  .json               .tsx
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
- Every line of text must be under 40 characters (readability at video resolution)
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
- The mood field guides the Animator's choice of rendering style:
  - "clean and modern" / "polished" signals the Animator to use remotion-bits components
  - "hand-drawn sketch" / "whiteboard" signals the Animator to use SVG whiteboard primitives
- Composition hints can suggest specific component types: "Use animated text reveal for the title", "Show animated counter from 0 to 1000", "Display code with syntax highlighting"
- The Art Director does not write code — it describes visuals in natural language

**Saved artifact:** `out/3-visual-direction.json`

---

## Stage 4: Animator

**Purpose:** Write the complete video as a React/Remotion component — real, executable code.

**Receives:** Both the script (from the Scriptwriter) and the visual direction (from the Art Director).

**Produces:** A complete TypeScript/React file (`GeneratedVideo.tsx`) containing:
- Individual scene components, each as a React function
- Data arrays, `.map()` loops, computed positions, conditional rendering
- Imports from two component libraries: whiteboard SVG primitives and remotion-bits HTML components
- Proper animation timing with frame-driven animation (no CSS transitions)

**Tools:**

| Tool | Purpose |
|------|---------|
| `search_skills` | Search Remotion best-practice rules by topic. Finds animation patterns, timing techniques, spring configurations, chart recipes, transition approaches, text animation patterns. |
| `fetch_skill` | Fetch the full content of a specific skill rule. Returns detailed explanations and code examples for a technique (e.g., spring animation configs, pie chart patterns, sequencing). |
| `search_bits` | Search the remotion-bits component library for reusable animation components. Finds ready-to-use React components like animated text, counters, code blocks, gradient transitions. |
| `fetch_bit` | Fetch a specific remotion-bits example by ID. Returns full source code showing how a component is used, its props, and styling patterns. |

**How tools are used:**
- Before writing any code, the Animator searches for relevant animation techniques and reusable components
- It fetches skill rules to learn best-practice patterns (e.g., spring configs for smooth vs bouncy motion)
- It fetches bit examples to see how remotion-bits components work (e.g., AnimatedText props and usage)
- After the research phase, it writes the complete code using discovered patterns and components
- This is a multi-turn conversation — the Animator may make several search/fetch calls before producing code

**Three rendering modes** (chosen based on visual direction mood):
- **SVG mode:** Whiteboard aesthetic using SketchBox, HandWrittenText, icons inside an SVG wrapper
- **HTML mode:** Clean/modern aesthetic using remotion-bits components (AnimatedText, TypeWriter, AnimatedCounter, CodeBlock, etc.) with CSS styling
- **Hybrid mode:** Both SVG and HTML layers stacked in the same scene — whiteboard drawings underneath, polished text animations on top

**Post-generation validation:**
1. **TypeScript compilation check** — the generated code is compiled with `tsc` to catch import errors, type mismatches, and syntax issues
2. **Timing violation check** — a custom analyzer scans all animations to ensure they complete by `endFrame - 60` (leaving room for hold and fade-out)
3. If either check fails, the Animator retries with the error feedback

**Key constraints:**
- All animation must be driven by `useCurrentFrame()` — CSS transitions/animations are forbidden
- Every scene uses the `<Scene>` wrapper which provides 30-frame fade in/out
- Scene frame ranges must be contiguous (Scene1: 0-300, Scene2: 300-600, etc.)
- All content animations must complete by `endFrame - 60` (30-frame hold + 30-frame fade-out)
- Text must be under 40 characters per line, font size at least 20
- Canvas is 1920x1080

**Saved artifact:** `out/4-generated-video.tsx`

---

## Stage 5: Renderer

**Purpose:** Write the final files to disk and render the video to MP4.

**Receives:** The generated video code from the Animator.

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
| `--from=animator` | Author, Scriptwriter, Art Director | Animator |
| `--from=renderer` | All LLM stages | Renderer only |

This enables a human-in-the-loop workflow: run the pipeline, inspect an intermediate artifact, hand-edit it, then resume from the next stage.

---

## Tool Summary by Role

| Role | Tools Available | Tool Source |
|------|----------------|-------------|
| Author | None | — |
| Scriptwriter | None | — |
| Art Director | `search_assets` | Internal icon/image registry (49 SVG components across 6 categories) |
| Animator | `search_skills` | Remotion skill rules (37 best-practice files covering animation, timing, transitions, charts, 3D, text, audio, etc.) |
| Animator | `fetch_skill` | Same skill rules — fetches full content with code examples |
| Animator | `search_bits` | remotion-bits catalog (42 example compositions covering text animation, counters, typewriter, code blocks, particles, gradients, 3D scenes) |
| Animator | `fetch_bit` | Same catalog — fetches full source code of a specific example |

---

## Component Libraries

The Animator has access to two distinct component libraries:

**Whiteboard Primitives** (SVG-based, hand-drawn aesthetic):
- Text: HandWrittenText (typewriter reveal)
- Shapes: SketchBox, SketchCircle, AnimatedPath
- Connectors: SketchArrow, SketchLine, DottedConnector
- Tables: SketchTable
- Status: CheckMark, CrossMark
- Icons: 30+ categorized SVG icons (technology, people, abstract, business, flow, structure)
- Parametric: FlowChain, CycleArrow, TreeDiagram, NetworkGraph, and more

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
| Animator | TypeScript compilation + timing violation analysis | Retry once with compilation/timing errors |
| Renderer | File system writes + Remotion render | Fail with error |
