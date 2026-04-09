> **⚠️ HISTORICAL — this is the README for the old 7-role pipeline.** The project now uses a single-shot Opus 4.6 generator. See `../../README.md` for current instructions.

# Whiteboard Remotion

Text-to-video pipeline that turns a plain text idea into an animated whiteboard explainer video. Powered by Claude and [Remotion](https://www.remotion.dev/).

## Prerequisites

- Node.js >= 18
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

```bash
npm install
```

Add your API key to `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Generate a Video

Write your idea in `input.txt`:

```
Explain how DNS works
```

Then run:

```bash
npm run generate
```

Or pass a prompt inline:

```bash
npm run generate -- "Explain how DNS works"
```

Or read from a custom file:

```bash
npm run generate -- --prompt=my-idea.txt
```

This runs 7 roles sequentially:

1. **Author** — creates a narrative arc with story beats
2. **Scriptwriter** — writes scene-by-scene on-screen text
3. **Art Director** — decides colors, icons, composition (searches the asset library)
4. **Layout** — positions every element on the 1920x1080 canvas (JSON)
5. **Animate** — assigns timing, stagger, and pacing to each element (JSON)
6. **Polish** — writes the final Remotion/React code (`.tsx`) from the timed layout
7. **Renderer** — writes files to `src/generated/` and renders to MP4

Output lands in `out/generated.mp4`.

### Generate Without Rendering

```bash
npm run generate -- "Compare Kafka vs RabbitMQ" --no-render
```

Then preview interactively in Remotion Studio:

```bash
npm run studio:generated
```

### Re-run From a Specific Role

Every role saves its output to `out/`. Edit any artifact and re-run from that point:

```bash
# Edit out/2-script.json, then re-run from Art Director onward
npm run generate -- --from=art-director --input=out/2-script.json

# Edit the timed layout, then re-run from Polish onward
npm run generate -- --from=polish --input=out/5-timed-layout.json

# Edit the generated React code directly, then just re-render
npm run generate -- --from=renderer --input=out/6-generated-video.tsx
```

### Pipeline Artifacts

```
out/
├── 1-story-outline.json       # Author output — narrative arc and beats
├── 2-script.json              # Scriptwriter output — scene text and structure
├── 3-visual-direction.json    # Art Director output — colors, icons, composition
├── 4-layout.json              # Layout output — element positions on canvas
├── 5-timed-layout.json        # Animate output — timing and stagger per element
├── 6-generated-video.tsx      # Polish output — real React/Remotion code
├── asset-gaps.jsonl           # Icons the Art Director couldn't find
├── lessons.jsonl              # Visual mistakes learned from past runs
└── generated.mp4              # Final video
```

---

## Existing Demo Videos

The repo includes hand-authored example videos that the pipeline's animation style is based on:

```bash
# Preview the Agentic AI explainer in Remotion Studio
npm run studio

# Render it to MP4
npm run render

# High quality render
npm run render:hq
```

## How to Create a Video Manually

Each video lives in its own folder under `src/`. Follow these steps:

### 1. Create a folder

```
src/your-video/
├── index.tsx          # registerRoot entry point
├── Root.tsx           # Composition definition (resolution, fps, duration)
├── YourVideo.tsx      # Main component — assembles scenes
├── scenes.tsx         # Individual scene components
└── components.tsx     # Custom components (optional)
```

### 2. Build scenes using the component library

Use primitives from `src/shared/components.tsx`:

```tsx
import { Scene, SVG, HandWrittenText, SketchBox, COLORS } from '../shared/components';

export const Scene1: React.FC = () => (
  <Scene startFrame={0} endFrame={300}>
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      <SVG>
        <HandWrittenText text="Hello World" x={960} y={540}
          startFrame={15} durationFrames={30} fontSize={64} />
      </SVG>
    </AbsoluteFill>
  </Scene>
);
```

### 3. Preview and render

```bash
npx remotion studio src/your-video/index.tsx
npx remotion render src/your-video/index.tsx YourVideo out/your-video.mp4
```

---

## Project Structure

```
src/
├── pipeline/                    # Text-to-video generation pipeline
│   ├── generate.ts              # CLI entry point
│   ├── types.ts                 # Shared TypeScript types
│   ├── validation.ts            # Zod schemas for inter-role validation
│   ├── tsx-analyzer.ts          # AST-based analysis of generated .tsx code
│   ├── logger.ts                # Structured pipeline logging
│   ├── cost-tracker.ts          # Token usage and cost tracking
│   ├── lesson-memory.ts         # Learns from visual mistakes across runs
│   ├── roles/
│   │   ├── author.ts            # Role 1: idea → story outline
│   │   ├── scriptwriter.ts      # Role 2: story → scene scripts
│   │   ├── art-director.ts      # Role 3: script → visual direction (uses asset search)
│   │   ├── layout.ts            # Role 4: script + visuals → element positions (JSON)
│   │   ├── animate.ts           # Role 5: layout → timed layout with stagger (JSON)
│   │   ├── polish.ts            # Role 6: timed layout → final React/Remotion .tsx code
│   │   ├── renderer.ts          # Role 7: code → files + MP4
│   │   ├── visual-validator.ts  # Vision-based frame critique (screenshots → LLM)
│   │   └── shared-prompts.ts    # Component API and reference scenes shared across roles
│   └── tools/
│       ├── asset-registry.ts    # Icon/image search for Art Director
│       ├── bits-registry.ts     # remotion-bits component search for Polish
│       └── skill-registry.ts    # Animation skill/pattern search for Animate & Polish
├── assets/images/
│   └── registry.jsonl           # 48 registered icons with metadata
├── shared/
│   ├── components.tsx           # Animation primitives (SketchBox, HandWrittenText, icons, etc.)
│   ├── motions.tsx              # Motion pattern components (FlowChain, TreeDiagram, etc.)
│   └── icons/                   # SVG icon components
├── generated/                   # Pipeline output (gitignored)
│   ├── GeneratedVideo.tsx
│   ├── Root.tsx
│   └── index.tsx
├── cfpb-riskcheck/              # Corporate video example
└── studymaterial/               # Hand-authored Agentic AI explainer (reference)
```

## Adding Icons to the Asset Library

The Art Director searches `src/assets/images/registry.jsonl` for icons when composing scenes. To add a new one:

1. Create the SVG component in `src/shared/components.tsx` or `src/shared/icons/`
2. Add a metadata line to `registry.jsonl`:

```json
{"id":"my-icon","name":"My Icon","description":"What it looks like and conveys","type":"svg-component","category":"technology","depicts":["keyword1","keyword2"],"style":"hand-drawn","component_name":"MyIcon","props_interface":"cx, cy, scale, startFrame, drawDuration"}
```

The pipeline picks it up automatically on the next run.

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run generate -- "idea"` | Generate a video from a text idea |
| `npm run studio:generated` | Preview generated video in Remotion Studio |
| `npm run render:generated` | Render generated video to MP4 |
| `npm run studio` | Preview the Agentic AI demo in Studio |
| `npm run render` | Render the Agentic AI demo |
| `npm run render:preview` | Quick preview render (CRF 28) |
| `npm run render:hq` | High quality render (CRF 15) |
