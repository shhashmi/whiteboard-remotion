# System Design: Text-to-Video Production Pipeline

Turn a plain text idea into a complete animated whiteboard video. A pipeline modeled on film production — distinct creative roles, each with clear responsibility, composing from a shared toolkit of animation primitives.

---

## 1. Product Framing

**Target segment:** Promotional video creators, educators, and marketers who have an idea ("launch announcement for our new API", "explain our product's architecture to investors") and want a polished animated explainer video without design skills or a production team.

**User input:** A plain text message. Could be a single sentence or a paragraph.

**Output:** A downloadable animated whiteboard video (MP4, 1920x1080, 30fps). Hand-drawn aesthetic — sketch lines, typewriter text, drawn icons, staggered reveals.

**Core value proposition:** The system doesn't fill templates — it *creates*. Different inputs produce structurally different videos with different narrative arcs, visual compositions, and pacing. The same way two filmmakers given the same brief would produce different films.

---

## 2. The Production Pipeline

Film production has distinct roles because creative work decomposes into separable concerns. A scriptwriter shouldn't be thinking about camera angles. A director shouldn't be rewriting dialogue. Each role has deep expertise in one dimension and clear handoff points.

The same principle applies here. Each role is an LLM agent with a focused system prompt, receiving the previous role's output and producing a structured artifact for the next.

```
User Idea
    │
    ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Author   │──▶│ Scriptwriter  │──▶│ Art Director  │──▶│  Animator     │──▶│  Renderer     │
│  (LLM)    │   │  (LLM)        │   │  (LLM+tools)  │   │  (LLM)        │   │  (code)        │
└──────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
 Story outline   Scene-by-scene     Visual direction     Animation spec     .tsx + MP4
 + narrative arc  script with text   per scene            with frame-level
                  and beats                               component calls
```

### Why this ordering, not fewer stages

| Alternative | Problem |
|---|---|
| Single LLM call | Mixes story, text, visuals, timing in one prompt. Output quality collapses as scope grows. |
| Two stages (script + render) | Script must embed visual decisions it shouldn't own. "Put a robot icon at 960,440" shouldn't be the scriptwriter's job. |
| Template-first (old design) | Every video looks the same. Caps creativity. Can't adapt to novel content types. |

The five-role pipeline works because each role's output is **auditable and editable** independently. A user can approve the story, tweak the script, change the art direction, and re-render — without restarting from scratch.

---

## 3. Role 1: Author

**Analog:** The person who conceives the story — its theme, arc, and emotional structure.

**Input:** Raw user message.

**Output:** `StoryOutline` — the narrative skeleton of the video.

**What the Author decides:**
- What is this video *about* at a thematic level?
- What's the narrative arc? (Problem → exploration → resolution? Question → evidence → answer? Overview → deep dives → synthesis?)
- How many beats does the story need?
- What's the emotional trajectory? (Curiosity → understanding → excitement? Confusion → clarity?)
- What's the hook and what's the takeaway?

**What the Author does NOT decide:**
- Exact on-screen text (that's the Scriptwriter)
- What anything looks like (that's the Art Director)
- Frame numbers or positions (that's the Animator)

```typescript
interface StoryOutline {
  title: string
  logline: string                    // one-sentence summary of the video's purpose
  audience: string                   // who is this for? inferred from the message
  arc: NarrativeArc
  beats: StoryBeat[]
}

interface NarrativeArc {
  type: string                       // "problem-solution", "question-answer", "tour",
                                     // "comparison", "journey", "reveal", etc.
  description: string                // "We pose a question, explore three dimensions 
                                     //  of the answer, then synthesize into a framework"
}

interface StoryBeat {
  id: string                         // "beat-1", "beat-2", ...
  role: string                       // "hook", "setup", "exploration", "turn",
                                     //  "deepening", "climax", "resolution", "coda"
  intent: string                     // "Make the viewer curious about why DNS is 
                                     //  surprisingly complex"
  key_idea: string                   // "DNS is not just one lookup — it's a chain of
                                     //  delegations across a global hierarchy"
  emotional_note: string             // "curiosity", "surprise", "clarity", "satisfaction"
  connects_to?: string[]             // ["beat-1", "beat-3"] — narrative threads
}
```

**Example output for "Explain how DNS works":**

```json
{
  "title": "The Hidden Journey of a DNS Query",
  "logline": "Every URL you type triggers a chain of lookups across a global hierarchy — here's how it works.",
  "audience": "Technical professionals who use DNS daily but haven't thought about what happens under the hood",
  "arc": {
    "type": "journey",
    "description": "Follow a single DNS query from browser to answer, revealing each layer of the system along the way"
  },
  "beats": [
    {
      "id": "beat-1",
      "role": "hook",
      "intent": "Show the gap between what the user sees (instant page load) and what actually happens (complex distributed lookup)",
      "key_idea": "You type a URL and a page appears — but between those moments, your query travels the world",
      "emotional_note": "curiosity"
    },
    {
      "id": "beat-2",
      "role": "setup",
      "intent": "Establish the cast of characters in the DNS system",
      "key_idea": "Four actors: your browser's cache, the recursive resolver, root/TLD nameservers, and the authoritative server",
      "emotional_note": "orientation",
      "connects_to": ["beat-1"]
    },
    {
      "id": "beat-3",
      "role": "exploration",
      "intent": "Walk through the query step by step",
      "key_idea": "Cache miss → resolver → root → TLD → authoritative → answer propagates back",
      "emotional_note": "engagement"
    },
    {
      "id": "beat-4",
      "role": "deepening",
      "intent": "Reveal the caching layer that makes this fast in practice",
      "key_idea": "TTL-based caching at every level means most queries never leave your local resolver",
      "emotional_note": "insight",
      "connects_to": ["beat-1", "beat-3"]
    },
    {
      "id": "beat-5",
      "role": "resolution",
      "intent": "Zoom out — show the full picture and why it matters",
      "key_idea": "DNS is a globally distributed, hierarchical, cached database — and it resolves billions of queries per day in milliseconds",
      "emotional_note": "satisfaction",
      "connects_to": ["beat-1", "beat-2", "beat-3", "beat-4"]
    }
  ]
}
```

Notice: no mention of "scenes", "cards", "tables", or any visual concept. This is pure story.

### Author's System Prompt (core)

```
You are a story author for animated explainer videos. Given a raw idea,
create a narrative outline.

Your job is ONLY the story — the arc, the beats, the emotional journey.
Do NOT think about visuals, layouts, or animations. Think about:
- What question does this video answer?
- What does the viewer feel at each point?
- How does each beat connect to the others?
- What's the hook and what's the payoff?

A good story outline makes a bad video impossible and a great video likely.
A bad one makes even perfect animation feel hollow.

Output valid JSON matching the StoryOutline schema.
```

---

## 4. Role 2: Scriptwriter

**Analog:** The person who turns the story outline into specific dialogue, narration, and on-screen text.

**Input:** `StoryOutline` from the Author.

**Output:** `Script` — the exact text and information that will appear on screen, organized into scenes.

**What the Scriptwriter decides:**
- How many scenes the video needs (mapping beats to scenes — some beats are one scene, some span two)
- The exact text that appears on screen for each scene
- The informational structure within each scene (bullet list? comparison? sequence of steps? single big statement?)
- Pacing: how much information per scene
- Connective language between scenes ("Now that we've seen X, let's look at Y")
- Consistent terminology throughout

**What the Scriptwriter does NOT decide:**
- Visual layout or component choices (that's Art Director + Animator)
- Colors, icons, or imagery (that's Art Director)
- Frame numbers or positions (that's Animator)

```typescript
interface Script {
  title: string
  scenes: SceneScript[]
  terminology: Record<string, string>  // canonical terms used throughout
                                       // e.g. { "resolver": "recursive resolver" }
}

interface SceneScript {
  scene_number: number
  beat_ids: string[]                   // which story beats this scene covers
  scene_type: string                   // "title", "explanation", "comparison", 
                                       //  "sequence", "showcase", "summary", etc.
                                       //  NOT a template ID — a semantic description
  heading: string                      // main heading text
  content: SceneContent                // the information to present
  transition_in?: string               // "As we saw..." — connective text from previous
  transition_out?: string              // "Next, let's explore..." — setup for next
  pacing: "slow" | "medium" | "fast"   // how much time this scene needs
  notes_for_director?: string          // creative hints: "this should feel like a 
                                       //  reveal", "emphasize the contrast"
}

// The content is structured but not visual — it describes WHAT to show, not HOW
type SceneContent =
  | { type: "single-statement"; text: string }
  | { type: "text-with-elaboration"; main: string; detail: string[] }
  | { type: "labeled-items"; items: { label: string; description: string }[] }
  | { type: "sequence"; steps: { label: string; detail?: string }[] }
  | { type: "comparison"; dimensions: string[]; 
      subjects: { name: string; values: string[] }[] }
  | { type: "two-sides"; left: { title: string; points: string[] };
      right: { title: string; points: string[] } }
  | { type: "key-value-pairs"; pairs: { key: string; value: string }[] }
  | { type: "formula"; parts: string[]; result: string }
```

**Key design choice:** `SceneContent` types describe *informational structure*, not visual layout. `"labeled-items"` says "here are N things with names and descriptions" — it doesn't say whether they should be cards, a list, a table, or a hub-and-spoke diagram. That decision belongs to the Art Director.

### Scriptwriter's System Prompt (core)

```
You are a scriptwriter for animated explainer videos. Given a story outline,
write the complete script — every word that will appear on screen.

Rules:
- Keep text concise but natural — text auto-wraps on the 1920x1080 canvas when maxWidth is set.
- Use consistent terminology. If you call it "recursive resolver" in scene 2,
  don't call it "DNS resolver" in scene 4 without introduction.
- Add transition language between scenes so they flow as a narrative, not
  a slide deck.
- The notes_for_director field is where you communicate creative intent to
  the visual team — "this should feel tense", "the contrast is the point",
  "build up to the reveal".
- You decide the content structure (list, comparison, sequence, etc.) based
  on what best serves the information. Don't default to bullet lists.

Output valid JSON matching the Script schema.
```

---

## 5. Role 3: Art Director

**Analog:** The person who decides the visual approach — color palette, imagery, composition style, visual metaphors.

**Input:** `Script` from the Scriptwriter.

**Output:** `VisualDirection` — creative direction for each scene's look and feel.

**What the Art Director decides:**
- Visual metaphors and imagery for each scene ("represent DNS delegation as a relay race")
- Which images/icons to use from the asset library (found via search)
- Color assignments: which concept gets which color, and that assignment carries through the whole video
- Composition approach per scene: "centered hero image with text below", "two-panel split", "central node with radiating connections"
- Visual rhythm: alternating dense and sparse scenes, varying compositions to prevent monotony

**What the Art Director does NOT decide:**
- Exact pixel positions or frame numbers (that's the Animator)
- The text content (that's the Scriptwriter — already decided)

```typescript
interface VisualDirection {
  global_style: {
    color_assignments: Record<string, string>   // concept → color name
                                                // e.g. "resolver" → "blue", "cache" → "green"
    accent_color: string                        // primary accent for titles, underlines
    mood: string                                // "clean and technical", "warm and friendly"
  }
  scenes: SceneDirection[]
}

interface SceneDirection {
  scene_number: number
  composition: string                 // free-text visual description:
                                      // "Large server icon centered at top. Four labeled 
                                      //  arrows radiate outward to smaller icons representing
                                      //  each nameserver type. Text labels appear beside 
                                      //  each icon."
  imagery: ImageSelection[]           // images/icons chosen from library
  color_usage: Record<string, string> // element → color: "heading" → "orange",
                                      //  "step boxes" → "per the concept they represent"
  density: "sparse" | "medium" | "dense"
  emphasis: string                    // "the reveal at the end", "the contrast between sides"
  reference_note?: string             // "similar to Scene 7 in AgenticAIExplainer —
                                      //  central icon with satellite cards"
}

interface ImageSelection {
  concept: string                     // what this image represents
  image_id: string                    // from the asset library search
  role_in_scene: string               // "hero image", "supporting icon", "decorative"
  suggested_scale: "small" | "medium" | "large" | "hero"
}
```

### Art Director's Toolkit: Asset Search

The Art Director has access to a **search function** over the image/icon library. This is a tool the agent calls, not a pipeline stage.

```typescript
// Tool available to the Art Director agent
interface AssetSearchTool {
  name: "search_assets"
  description: "Search the image and icon library for visual assets"
  parameters: {
    query: string          // "server", "database", "person pointing", "brain"
    category?: string      // "technology", "people", "abstract", "business"
    style?: string         // "hand-drawn", "outline", "filled"
    limit?: number         // default 5
  }
  returns: {
    results: {
      id: string
      name: string
      description: string
      type: "svg-component" | "raster"
      depicts: string[]
      relevance_score: number
    }[]
  }
}
```

**How search works under the hood:**
- Asset registry is loaded in memory (JSONL with precomputed embeddings, as described in the retrieval section)
- Query is embedded, cosine similarity against all assets, return top-K
- For MVP with < 5K assets: brute-force cosine, < 10ms
- The Art Director calls this tool multiple times per video — once per concept it needs imagery for

**The critical difference from the old design:** The Art Director *decides when and what to search for* based on the script context. It's not given a pre-retrieved shortlist — it actively browses, like a real art director flipping through a stock library. It might search for "relay race" (a metaphor), not just "DNS" (the literal topic).

### Fallback When Search Finds Nothing

Search will sometimes return no good match — the query is too niche, the library doesn't cover that domain yet, or the metaphor is too abstract. The system handles this through a **fallback chain**, not a hard failure.

**Fallback chain (Art Director follows this in order):**

```
1. Search with original query         → "kubernetes pod lifecycle"
   Got results with score > 0.6?  ──── YES → use it
                                  │
                                  NO
                                  ▼
2. Broaden the query                  → "container", "server", "cloud infrastructure"
   (strip specifics, try the          
    category or parent concept)       
   Got results with score > 0.6?  ──── YES → use it
                                  │
                                  NO
                                  ▼
3. Fall back to abstract shapes       → Use geometric primitives as visual stand-ins:
   (no search needed — always            SketchCircle for concepts/nodes
    available)                           SketchBox for containers/groups
                                         SketchArrow for relationships/flow
                                         labeled with HandWrittenText
                                  │
                                  ▼
4. Flag for asset creation            → Record the unmet query in a wishlist file
                                         so the library can be expanded later
```

**Implementation — the tool response signals quality:**

```typescript
interface AssetSearchResult {
  results: {
    id: string
    name: string
    description: string
    type: "svg-component" | "raster"
    depicts: string[]
    relevance_score: number         // 0.0 - 1.0
  }[]
  quality: "strong" | "weak" | "none"   // added field
  // "strong": top result score > 0.7
  // "weak":   top result score 0.4 - 0.7 (usable but imprecise)
  // "none":   no results or all scores < 0.4
  suggestion?: string              // "Try broader terms: 'server', 'network'"
}
```

When the tool returns `quality: "none"`, it also returns a `suggestion` field nudging the Art Director to broaden. If two consecutive searches return `"none"`, the Art Director falls back to geometric primitives and logs the gap.

**How this appears in the VisualDirection output:**

```typescript
interface ImageSelection {
  concept: string
  image_id?: string               // present when search found something
  role_in_scene: string
  suggested_scale: "small" | "medium" | "large" | "hero"
  fallback?: {                    // present when search found nothing
    type: "geometric"             // "use primitives to represent this"
    shape: "circle" | "box" | "arrow-chain" | "icon-cluster"
    label: string                 // text label to make the shape meaningful
    color: string                 // from the global color assignments
  }
}
```

The **Animator** knows how to handle both cases:
- `image_id` present → emit that component (e.g. `<DatabaseIcon ... />`)
- `fallback` present → compose from primitives (e.g. `SketchCircle` with a `HandWrittenText` label inside it)

A labeled circle or box is never as good as a purpose-built icon, but it's far better than crashing or leaving an empty space. And the **asset gap tracking** ensures the library grows toward the concepts users actually need:

```typescript
// Written to out/asset-gaps.jsonl after each pipeline run
interface AssetGap {
  query: string                   // what was searched for
  concept: string                 // what it represents in the video
  context: string                 // scene description where it was needed
  timestamp: string
}
```

Over time, this file becomes the prioritized backlog for new asset creation — ordered by frequency of unmet queries.

### Art Director's System Prompt (core)

```
You are the art director for an animated whiteboard explainer video.
Given a script, decide how each scene should look.

You have access to a search_assets tool to find images and icons from our
library. Use it to find visual assets that match your creative vision.

Your job:
- Assign colors to concepts and keep them consistent across all scenes.
  If "resolver" is blue in scene 2, it must be blue in scene 4.
- Choose compositions that serve the content. A sequence of steps might
  be a vertical chain, a hub-and-spoke, or a timeline — pick what tells
  the story best.
- Vary visual density and composition across scenes to create rhythm.
  Don't make every scene a grid of cards.
- Use visual metaphors when they help. "DNS delegation" could be a relay
  race, a chain of messengers, or a tree of authority.
- The notes_for_director field in the script contains the scriptwriter's
  creative hints — honor them.

When searching for assets:
- If search returns quality "none" or "weak", try broader terms first.
  "kubernetes pod lifecycle" → try "container", "server", "cloud".
- If still no match after broadening, use a geometric fallback: a labeled
  SketchCircle, SketchBox, or arrow-chain composed from primitives. Set
  the `fallback` field in your output instead of `image_id`.
- A labeled shape with the right color is always better than an irrelevant
  icon. Don't force-pick a low-relevance result just to avoid fallback.

Output valid JSON matching the VisualDirection schema.
```

---

## 6. Role 4: Animator

**Analog:** A Remotion developer who writes the actual animation code.

**Input:** `Script` + `VisualDirection` from previous roles.

**Output:** A complete `GeneratedVideo.tsx` file — real React/TypeScript code, not a JSON spec.

**Why code, not JSON:** The existing codebase uses `.map()` loops, computed positions (`const sy = 420 + i * 78`), data arrays, conditional rendering (`{i < 5 && <SketchArrow ... />}`). A flat JSON spec can't express any of this. The Animator must write code to produce the same quality as hand-authored scenes.

**What the Animator writes:**
- Individual scene components (`const Scene1Title: React.FC = () => { ... }`)
- Data arrays for repeated items (cards, steps, features)
- Computed layout positions using arithmetic
- `.map()` loops with stagger calculations
- Conditional rendering for connectors between items
- The main `GeneratedVideo` composition that renders all scenes

**What the Animator's prompt contains:**
- Full component API reference (every prop of every component)
- Timing conventions and layout reference
- 3 complete reference scenes from the existing codebase, showing:
  - Static JSX composition (Scene3ThreePillars — 3-card layout)
  - `.map()` with computed positions (Scene7ToolUse — hub-and-spoke)
  - Data-driven step chain with conditional arrows

**Validation:** The generated `.tsx` file is compiled with `tsc --noEmit`. If compilation fails, the Animator is re-prompted with the error message and asked to fix it. This is more reliable than JSON schema validation — the TypeScript compiler catches import errors, missing props, type mismatches, and syntax errors.

**Artifact:** Saved as `out/4-generated-video.tsx` — users can directly edit the React code and re-render.

---

## 7. Role 5: Renderer

**Analog:** The editing suite — takes the Animator's code and produces the deliverable.

**Input:** `GeneratedVideo.tsx` code from the Animator.

**Output:** `src/generated/` directory with 3 files + rendered MP4.

**This role is entirely deterministic — no LLM.** It:

1. Writes the Animator's `GeneratedVideo.tsx` code to `src/generated/`
2. Generates `Root.tsx` (Remotion Composition registration with correct `durationInFrames`)
3. Generates `index.tsx` (entry point with `registerRoot`)
4. Runs `npx remotion render` to produce the MP4

The Animator's code already includes all imports, the paper texture background, dot grid overlay, and font loading — the Renderer just writes it to disk. The Renderer's job is purely mechanical: file I/O and invoking the Remotion CLI.

### Generated File Structure

The Animator produces `GeneratedVideo.tsx` which looks like real hand-authored Remotion code:

```tsx
// src/generated/GeneratedVideo.tsx (written by the Animator)
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SVG, Scene, HandWrittenText, SketchBox, ... } from '../studymaterial/components';

const Scene1Title: React.FC = () => ( ... );
const Scene2Overview: React.FC = () => { ... };  // can use loops, variables

export const GeneratedVideo: React.FC = () => (
  <AbsoluteFill style={{ ... }}>
    <Scene1Title />
    <Scene2Overview />
    ...
  </AbsoluteFill>
);
```

No color resolution layer is needed — the Animator writes `COLORS.blue` directly in code since it imports the `COLORS` object.

---

## 8. How Story Coherence Works

In the old template-based design, coherence was bolted on via "story skeletons" and "continuity rules." In this design, coherence is intrinsic to the role separation.

### Each role enforces a different dimension of coherence

| Dimension | Role responsible | How |
|---|---|---|
| **Narrative arc** | Author | The `beats` array defines the story's progression. Each beat has a `role` (hook, exploration, resolution) and `connects_to` links showing narrative threads. |
| **Informational flow** | Scriptwriter | Sees the full story outline and writes all scenes at once. Adds `transition_in` / `transition_out` language. Maintains `terminology` consistency. |
| **Visual continuity** | Art Director | Assigns `color_assignments` globally (concept → color), carried through all scenes. Varies `density` to create rhythm. |
| **Temporal rhythm** | Animator | Sequences animations within and across scenes. Controls pacing via scene durations and stagger timing. |

### Why this produces coherence without rigid constraints

The Scriptwriter doesn't need a "skeleton" telling it to put the definition before the deep-dive — it has the Author's story outline, which already encodes that structure. The Author decided the arc based on the content, not based on a template.

The Art Director doesn't need a "color propagation rule" — it assigns colors globally in `global_style.color_assignments`, and its system prompt says "keep them consistent." If it assigns blue to "resolver", it writes that once and every scene respects it.

The key insight: **coherence is a property of having the full context.** Each agent sees all previous agents' work. The Scriptwriter sees the entire story outline. The Art Director sees the entire script. No agent works on one scene in isolation.

---

## 9. Asset Library at Scale

### 9.1 The Registry

Every image/icon is registered with metadata and a precomputed embedding:

```typescript
interface ImageRecord {
  id: string                    // "robot-head"
  name: string                  // "Robot Head"
  description: string           // "Cartoon robot face with antenna, round eyes, 
                                //  zigzag mouth. Conveys AI, automation, bots."
  type: "svg-component" | "raster"
  category: string              // "technology" | "people" | "business" | "science"
  depicts: string[]             // ["robot", "AI", "automation", "bot"]
  style: string                 // "hand-drawn"
  component_name?: string       // "RobotHead" (for svg-components)
  props_interface?: string      // "cx, cy, scale, startFrame, drawDuration"
  embedding: number[]           // precomputed 256-dim vector
}
```

### 9.2 How the Art Director Searches

The Art Director calls `search_assets` as a tool whenever it needs imagery. The tool:

1. Embeds the query string
2. Optionally filters by `category` / `style`
3. Brute-force cosine similarity against all asset embeddings
4. Returns top-K results with descriptions

For 2,000 assets at 256 dimensions, this takes < 10ms. No vector database needed.

The Art Director may search multiple times per video — once for "server infrastructure", once for "person asking a question", once for "chain of connected nodes." It searches based on the **creative vision**, not just the literal topic.

### 9.3 Growing the Library

New images are added by:
1. Creating the SVG component (or adding a raster image)
2. Writing a metadata record with `description` and `depicts`
3. Running `embed-assets` to compute the embedding
4. Appending to `assets/images/registry.jsonl`

The pipeline picks up new assets automatically — the Art Director's search results will include them.

---

## 10. Validation Between Roles

Each handoff point has Zod validation to catch errors before they propagate.

### After Author → before Scriptwriter

- `beats` array is non-empty (1-10 beats)
- Each beat has a non-empty `intent` and `key_idea`
- At least one beat has `role: "hook"` and one has `role: "resolution"` or equivalent closing beat

### After Scriptwriter → before Art Director

- `scenes` array has 3-10 entries
- Each scene has a non-empty `heading` and `content`
- All text lines are under 50 characters
- `terminology` is internally consistent (no key appears with multiple values)
- Every `beat_id` reference maps to a beat from the Author's outline

### After Art Director → before Animator

- Every `image_id` in `imagery` exists in the asset registry
- `color_assignments` covers all concepts mentioned in the script
- Every scene has a `composition` description

### After Animator → before Renderer

- All frames are monotonically increasing
- No coordinates outside [0, 1920] x [0, 1080]
- All `component` names map to real imports
- `durationInFrames` equals last scene's `endFrame`
- No scene has `startFrame >= endFrame`
- Text `durationFrames > 0` and `< 200`

On validation failure: re-prompt the failing agent with the Zod error message. Max 1 retry.

---

## 11. User-Editable Artifacts

Every role's output is saved as a separate file. Users can inspect, edit, and re-run from any point:

```
out/
├── 1-story-outline.json       # Author output
├── 2-script.json              # Scriptwriter output
├── 3-visual-direction.json    # Art Director output
├── 4-generated-video.tsx      # Animator output (real React code)
├── asset-gaps.jsonl           # Unmet asset search queries
└── generated.mp4              # Final render
```

**Re-entry points:**

| Edit this | Re-run from | Use case |
|---|---|---|
| `1-story-outline.json` | Scriptwriter (role 2) | Change narrative arc, add/remove beats |
| `2-script.json` | Art Director (role 3) | Reword text, change scene structure |
| `3-visual-direction.json` | Animator (role 4) | Swap icons, change colors, alter composition |
| `4-generated-video.tsx` | Renderer (role 5) | Edit animation code directly — adjust positions, timing, add loops, tweak layouts |

The most powerful re-entry point is `4-generated-video.tsx`. Because the Animator outputs real React code (not JSON), users with React/Remotion knowledge can make surgical edits: change a `.map()` to reorder items, adjust computed positions, add conditional rendering, or refactor a data array. Then re-render without touching the LLM pipeline.

---

## 12. Implementation Plan

### Files to Create

```
src/
├── pipeline/
│   ├── generate.ts              # CLI entry point
│   ├── roles/
│   │   ├── author.ts            # Role 1: idea → StoryOutline
│   │   ├── scriptwriter.ts      # Role 2: StoryOutline → Script
│   │   ├── art-director.ts      # Role 3: Script → VisualDirection (with search tool)
│   │   ├── animator.ts          # Role 4: Script + VisualDirection → AnimationSpec
│   │   └── renderer.ts          # Role 5: AnimationSpec → .tsx + MP4
│   ├── tools/
│   │   ├── asset-search.ts      # search_assets tool implementation
│   │   └── asset-registry.ts    # load and query the asset registry
│   ├── types.ts                 # StoryOutline, Script, VisualDirection, AnimationSpec
│   ├── validation.ts            # Zod schemas for all inter-role types
│   └── prompts/
│       ├── author.txt
│       ├── scriptwriter.txt
│       ├── art-director.txt
│       └── animator.txt         # includes full component API + reference scenes
├── assets/
│   ├── images/
│   │   └── registry.jsonl       # image metadata + embeddings
│   └── embed.ts                 # precompute embeddings script
├── generated/                   # output directory (gitignored)
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

### Scripts

```json
{
  "generate": "npx ts-node src/pipeline/generate.ts",
  "embed-assets": "npx ts-node src/assets/embed.ts",
  "studio:generated": "npx remotion studio src/generated/index.tsx",
  "render:generated": "npx remotion render src/generated/index.tsx GeneratedVideo out/generated.mp4"
}
```

### CLI Usage

```bash
# Full pipeline
npx ts-node src/pipeline/generate.ts "Explain how DNS works"

# Re-run from a specific role
npx ts-node src/pipeline/generate.ts --from=art-director --input=out/2-script.json

# Preview without rendering
npx ts-node src/pipeline/generate.ts "Compare Kafka vs RabbitMQ" --no-render
npx remotion studio src/generated/index.tsx
```

---

## 13. Cost & Performance

| Metric | Estimate |
|---|---|
| LLM calls per video | 4 (author + scriptwriter + art director + animator) |
| Art Director search calls | 3-8 (tool calls within the agent) |
| Total input tokens | ~12,000 (grows as each role receives previous outputs) |
| Total output tokens | ~5,000 |
| LLM cost per video | ~$0.15-0.30 (Sonnet) |
| LLM latency | ~8-15 seconds total (sequential roles) |
| Remotion render time | ~10-30 seconds |
| Total wall time | ~20-45 seconds |

The cost increase vs. 2-stage template filling (~$0.10) is marginal. The quality increase is not.

---

## 14. Verification

1. **End-to-end smoke test:** `npx ts-node src/pipeline/generate.ts "Explain how DNS works"` → valid MP4
2. **Diverse inputs:** Test across content types:
   - Explanation: "How does HTTPS keep your data safe?"
   - Comparison: "Monolith vs microservices"
   - How-to: "Setting up a Kubernetes cluster"
   - Announcement: "Introducing our new real-time analytics API"
   - List: "5 signs your database needs an index"
3. **Coherence check:** Watch each generated video — do scenes flow logically? Is terminology consistent? Do colors match across scenes?
4. **Compilation:** `npx tsc --noEmit` on every generated file
5. **Visual QA:** Open in Remotion Studio — no overlapping text, no elements outside viewport, animations play in order
6. **Edit roundtrip:** Edit `2-script.json`, re-run from Art Director, verify changes propagate
7. **Asset search quality:** For 10 diverse concepts, verify `search_assets` returns relevant results

---

## 15. What This Design Does NOT Cover (Future Work)

- Audio/voiceover generation (natural next step — adds a "Voice Director" role)
- Web UI / API server (this is CLI-only for MVP)
- Real-time preview during generation
- Custom brand kits (logos, fonts, color palettes)
- Multi-language support
- Collaborative editing (multiple users tweaking artifacts)
- A/B testing different creative directions
- Raster image rendering in SVG canvas (currently SVG components only)
