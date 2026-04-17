# Asset Plan — AGT (AI Agents) Video Series

## Implementation Progress

- [x] **Track 7 (G) — Theme tokens** — `src/shared/theme.ts` with `COLORS`, `SEMANTIC_COLORS`, `TYPOGRAPHY`, `MOTION`, `CANVAS`. `components.tsx` now re-exports `COLORS` from the theme module (single source of truth).
- [x] **Image prompt** — `src/shared/imagePrompt.ts` with locked `MASTER_STYLE_PROMPT`, `NEGATIVE_PROMPT`, `IMAGE_SPEC`, and `buildImagePrompt()` helper.
- [x] **Track 8 — Asset index scaffold** — `src/asset-index/` built:
  - `types.ts` — `AssetEntry`, `AssetKind`, `FindAssetQuery`, `FindAssetResult` types
  - `registry.ts` — 20 entries declared (A1–A12 + B1–B8), source of truth
  - `tool.ts` — `findAsset` / `getAsset` / `listAssets` with keyword+concept scoring, `gap: true` when no match clears 0.25 threshold
  - `cli.ts` — command-line wrapper (`find-asset`, `get-asset`, `list-assets`)
  - `build.ts` — serializes registry to `index.json`
  - `index.json` — generated snapshot
  - Verified: `find-asset "react loop"` → A1 (score 1.0); nonsense input → `gap: true`.
- [x] **A1–A12 reusable components** — all authored under `src/shared/diagrams/`, each with a test composition in `src/test-compositions/` registered in `Root.tsx`, preview PNG at `src/asset-index/previews/<id>.png`, and full JSON `propsSchema` in `src/asset-index/registry.ts`:
  - A1 `ReActLoop` — Observe/Think/Act triangle with optional memory + tools + step highlight
  - A2 `AutonomySpectrum` — horizontal L1–L4 continuum with marker
  - A3 `MemoryArchitecture` — stacked memory layers (short-term + episodic/semantic/procedural)
  - A4 `AgentCoordination` — three patterns (supervisor / hierarchical / peer)
  - A5 `TradeoffTriangle` — 3-axis triangle with barycentric point placement
  - A6 `TradeoffMatrix` — 2×2 quadrant matrix with labeled axes
  - A7 `MaturityProgression` — 4-stage horizontal progression with current-stage highlight
  - A8 `FlowchartBuilder` — generic node/edge composer with box / diamond / terminal node kinds
  - A9 `GraphNodeEdge` — primitive `GraphNode` + `GraphEdge` for ad-hoc node-link diagrams
  - A10 `CodeBlock` — monospace code display with line / char / all reveal modes, highlight lines
  - A11 `AnnotationHighlight` — highlight / spotlight / callout styles with label positioning
  - A12 `LineChart` — hand-drawn line chart with annotations
  - Preview renders verified at 1920×1080 via `npx remotion still Test-<Name>`.

- [x] **B1–B8 specialized diagrams** — all authored under `src/shared/diagrams/`, tested via `src/test-compositions/AllBDiagrams.tsx`, previews in `src/asset-index/previews/B*.png`, full propsSchema + previewPath in registry:
  - B1 `FunctionCallingLifecycle` — 4-phase wrapper over MaturityProgression with AnnotationHighlight callout
  - B2 `ErrorBackoffFlow` — retry/backoff/circuit-breaker flowchart (built on FlowchartBuilder)
  - B3 `ChainOfThoughtTrace` — hybrid SVG trace + optional CodeBlock schema sidebar
  - B4 `MemoryConsolidationFlow` — 4-stage lifecycle + re-consolidate loop (FlowchartBuilder-based)
  - B5 `GeneratorCriticLoop` — two-node bidirectional loop with iteration count
  - B6 `GovernanceEvolution` — MaturityProgression (top) + AgentCoordination (bottom) tied to stage
  - B7 `EntityRelationshipGraph` — entity/edge graph with highlight-path scoring
  - B8 `ComparisonTable` — wraps SketchTable with cell-highlight overlay
  - Verified: `find-asset "chain of thought"` → B3 with full schema; all 8 render at 1920×1080.

### Remaining

- [x] **C1–C12 AI-generated imagery** — 12 PNGs in `public/generated/`, registered in asset index, `SketchImage` component in `components.tsx`, SKILL.md updated with image usage instructions
- [ ] D/E/F stock procurement (icons / photos / audio)
- [ ] SKILL.md trim to tool-only usage

---

## Context

The folder `/home/shariq/project/NodeExpressPlanMyCareer/src/data/section_based_content/StudyMaterials/SE/AGT/` contains 34 JSON files covering a curriculum on **AI Agents and Agentic Technology** (agent architecture, function calling, memory, multi-agent coordination, autonomy, governance). Each file's `content_sections` is a 5-part structure (`Core Concepts`, `How This Applies to Your Role`, `Why People Get This Wrong`, `Practical Application`, `Reflection`) with embedded `diagrams` clustered in sections 1 and 4.

Goal: build a **reusable upfront asset library** so the video generator can produce any of the 34 AGT videos — and any future video — by *selecting and parameterizing existing assets*, never composing new ones on the fly. Style is mixed: whiteboard base (Remotion library already at `src/shared/`) plus AI-generated realistic imagery and free-tier stock where useful.

Current library: ~92 icons, hand-drawn shape primitives, motion patterns at `src/shared/components.tsx`, `src/shared/icons/`, `src/shared/motions.tsx`. Gaps: flexible graph/tree builders, code blocks, annotation tools, image embedding, line charts.

**Hard constraint (user):** every asset below is a catalog entry, procured or authored upfront. The generator's job is selection + prop setting, not authoring. No asset is composed per-video.

---

## Asset Catalog

### A. Reusable whiteboard components (AUTHOR upfront in `src/shared/`)

Recurring concepts — build parameterized once, reused across all 34 videos and beyond.

| # | Component | Concept | Props (shape) |
|---|-----------|---------|---------------|
| A1 | `ReActLoop` | Observe→Think→Act cycle | `steps[]`, `showMemory`, `showTools`, `highlightStep` |
| A2 | `AutonomySpectrum` | L1–L4 slider | `levels[]`, `marker`, `labels[]` |
| A3 | `MemoryArchitecture` | Short-term + episodic/semantic/procedural stack | `layers[]`, `highlightLayer` |
| A4 | `AgentCoordination` | Supervisor / hierarchical / peer-to-peer | `pattern`, `agents[]`, `edges[]` |
| A5 | `TradeoffTriangle` | 3-axis trade-off | `axes[3]`, `point`, `labels` |
| A6 | `TradeoffMatrix` | 2×2 matrix | `xAxis`, `yAxis`, `quadrants[4]` |
| A7 | `MaturityProgression` | 4-stage progression | `stages[]`, `currentStage`, `adoptionPct` |
| A8 | `FlowchartBuilder` | Generic decision flow | `nodes[]`, `edges[]` (nodes typed as box/diamond/terminal) |
| A9 | `GraphNode` + `GraphEdge` | Primitive for ad-hoc graphs | `label`, `shape`, `pos` / `from`, `to`, `label` |
| A10 | `CodeBlock` | Monospace code display | `code`, `language`, `highlightLines[]`, `revealMode` |
| A11 | `AnnotationHighlight` | Spotlight box / callout pointer | `target`, `style`, `label` |
| A12 | `LineChart` | Growth / performance curve | `data[]`, `xLabel`, `yLabel`, `annotations[]` |

### B. Specialized-but-reusable diagrams (AUTHOR upfront — each becomes its own parameterized component)

These appear in 2–4 files today but are **promoted to reusable components** so any future video can invoke them. Each lives at `src/shared/diagrams/<Name>.tsx`.

| # | Component | Parameters |
|---|-----------|------------|
| B1 | `FunctionCallingLifecycle` | 4-phase with swappable phase labels |
| B2 | `ErrorBackoffFlow` | Retry count, backoff timings, circuit-breaker on/off |
| B3 | `ChainOfThoughtTrace` | Steps[], final answer, optional schema panel |
| B4 | `MemoryConsolidationFlow` | New → consolidation → retrieval → decay stages |
| B5 | `GeneratorCriticLoop` | Generator agent, critic agent, iteration count |
| B6 | `GovernanceEvolution` | 3 stages (centralized / hub-spoke / advisory), highlighted stage |
| B7 | `EntityRelationshipGraph` | Entities[], relationships[], highlight path |
| B8 | `ComparisonTable` | Columns[], rows[], highlight cells (wrapper over existing `SketchTable`) |

### C. Realistic imagery library (GENERATE upfront, single locked style)

Fixed curated set — generate **before** any video is produced, not per video. Stored in `public/generated/`. Every image uses the locked master prompt in `src/shared/imagePrompt.ts` (suggested: *"editorial muted-palette 2D illustration, soft grain, hand-inked outlines, off-white paper background, navy/ochre/sage accents"*) for series cohesion.

| # | Asset | Used in (examples) |
|---|-------|--------------------|
| C1 | SAE autonomy-levels composite (5 cars) | 1.1, 6.2 |
| C2 | Streaming-recommendation UI mock | 4.2 |
| C3 | Multi-agent call-center scene | 5.1 |
| C4 | Phonebook / rolodex with magnifier | 1.1 |
| C5 | Governance / boardroom scene | 10.1 |
| C6 | Isometric code-city (repo metaphor) | 6.3 |
| C7 | Server rack / data-center hero | 4.3, 8.x |
| C8 | Knowledge-graph 3D render | 4.2 |
| C9 | Org-chart backdrop | 5.2, 10.1 |
| C10 | Vector-DB / embeddings abstraction | 4.2, 4.3 |
| C11 | Retry / circuit-breaker real-world metaphor (e.g. electrical panel) | 2.1 |
| C12 | Maturity-stages collage | 1.2, 10.1 |

~12–15 total. Budget ~$5 via DALL·E 3 or free via SDXL local. One-time.

### D. Free-tier stock icons (PROCURE upfront into `public/stock/icons/`)

MIT-licensed vector icons to plug gaps in existing `src/shared/icons/`. Imported once, exposed through `src/shared/icons/index.ts`.

- Vector database, embedding, LLM API, token/cost meter, compliance badge, retry/refresh, orchestrator, API endpoint, function-call bracket, confidence gauge (~10 icons, from Heroicons / Tabler / Lucide)

### E. Free-tier stock photography (PROCURE upfront into `public/stock/photos/`)

Unsplash / Pexels — download and commit the fixed set upfront:

- Enterprise workplace, team collaboration, server room, developer workstation, meeting/governance room (~5 photos)

### F. Audio library (PROCURE upfront into `public/audio/`)

Pixabay / Freesound — one-time download:

- 3 background music beds (ambient, upbeat, cinematic)
- SFX pack: pen-scratch, whoosh, ding, click, page-turn, stamp
- TTS infra already exists (`src/tts/provider-elevenlabs.ts`)

### G. Theme tokens (AUTHOR upfront in `src/shared/theme.ts`)

One-time style catalog so every asset renders consistently:

- Color palette (whiteboard neutrals + success / warning / highlight accents)
- Typography scale (hand-drawn font sizes)
- Motion timing constants (fade duration, stagger delay)

---

## How the generator uses the library (tool-based selection)

**Architecture principle:** the generator discovers and picks assets via a **tool call**, not by reading an enumerated catalog in the skill prompt. SKILL.md should describe *how to call the tool*, never the contents of the library.

### Asset index (source of truth)

A machine-readable index at `src/asset-index/index.json` lists every catalog entry with structured metadata:

```json
{
  "id": "A1",
  "kind": "component",        // component | diagram | image | icon | photo | audio
  "name": "ReActLoop",
  "importPath": "@/shared/ReActLoop",
  "concepts": ["react", "observe think act", "agent loop", "decision cycle"],
  "propsSchema": { ... },      // JSON Schema for props
  "previewPath": "src/asset-index/previews/A1.png",
  "tags": ["agents", "loop", "core"]
}
```

The index is generated/validated by a small build script (`src/asset-index/build.ts`) that scans `src/shared/`, `public/generated/`, `public/stock/`, `public/audio/` and writes `index.json`. Adding a new asset = adding one entry; no SKILL.md edit required.

### Selection tool

Expose the index through a tool the generator can call during video authoring:

- `find_asset({ concept, kind?, tags? })` → returns top-K matches with `id`, `name`, `importPath`, `propsSchema`, `previewPath`.
- `get_asset({ id })` → returns full metadata + props schema for parameterization.
- `list_assets({ kind, tags })` → filtered listing.

Implementation options (pick one in final build-out): (a) an MCP server wrapping the index, (b) a local tool definition surfaced to the generator via the Agent SDK, or (c) a simple CLI the orchestrator invokes during generation. Backed by keyword/embedding search over the `concepts` + `tags` fields.

### SKILL.md update

`.claude/skills/whiteboard-video/SKILL.md` is trimmed, not expanded. It should:

1. Instruct: "To pick a visual for a concept, call `find_asset` with the concept string. Use the returned `importPath` and parameterize via `propsSchema`."
2. Forbid: authoring new SVG/component code inline, hardcoding asset paths, or iterating/listing assets from memory.
3. Escalate: if `find_asset` returns no match above confidence threshold, emit a structured "asset gap" record to a backlog file — do not invent an asset.

---

## Procurement / Build Plan (all upfront, before any video is produced)

| Track | Deliverable | Effort |
|-------|-------------|--------|
| 1 | Author A1–A12 primitives | ~4 days |
| 2 | Author B1–B8 specialized components | ~3 days |
| 3 | Generate C1–C12 images with locked style prompt | ~1 day |
| 4 | Download + register D (10 icons) | ~2 hours |
| 5 | Curate + commit E (5 photos) | ~1 hour |
| 6 | Curate + commit F (music + SFX) | ~2 hours |
| 7 | Define G theme tokens | ~2 hours |
| 8 | Build `src/asset-index/` (index schema, build script, `find_asset`/`get_asset`/`list_assets` tool) | ~1 day |
| 9 | Generate preview PNGs per asset (populate `previewPath`) | ~half day |
| 10 | Trim SKILL.md to tool-usage instructions (no catalog enumeration) | ~1 hour |

**Critical files to modify:**
- `src/shared/components.tsx` — add A1–A12
- `src/shared/diagrams/*.tsx` (new directory) — add B1–B8
- `src/shared/icons/index.ts` — register D
- `src/shared/theme.ts` (new) — G tokens
- `src/shared/imagePrompt.ts` (new) — locked prompt for C
- `public/generated/` (new) — C1–C12
- `public/stock/icons/` (new) — D
- `public/stock/photos/` (new) — E
- `public/audio/` (new) — F
- `src/asset-index/index.json` (new) — machine-readable catalog, source of truth
- `src/asset-index/build.ts` (new) — scans shared/public dirs, writes index
- `src/asset-index/tool.ts` (new) — `find_asset` / `get_asset` / `list_assets`
- `src/asset-index/previews/` (new) — per-asset preview PNGs
- `.claude/skills/whiteboard-video/SKILL.md` — trim to: "call `find_asset`, parameterize via returned schema, never author inline"

**Reuse already in place:** `SketchBox`, `SketchArrow`, `CycleArrow`, `DecisionDiamond`, `StackedLayers`, `BrainIcon`, `DatabaseIcon`, `AutonomousCarIcon`, `NetworkGraph`, `TreeDiagram`, `BarChart`, `CountUp`, `StaggerMap`, `SpringReveal`, `SketchTable`, `FadeIn`, `AnimatedPath`.

---

## Verification

1. **Per-asset isolation** — each component in A/B gets a test composition under `src/test-compositions/` rendered at 1920×1080 in Remotion preview.
2. **Catalog completeness** — script scans all 34 JSON files, extracts diagram titles/keywords, confirms every concept maps to an A, B, or C entry. Any unmapped concept → backlog.
3. **Generator constraint check** — lint rule / CI that fails if a generated video TSX declares new `<path>`/`<svg>` inline instead of importing a catalog component, AND fails if any imported path is not present in `src/asset-index/index.json`.
4. **Tool smoke test** — call `find_asset("ReAct loop")` and confirm it returns `A1`; call with a nonsense concept and confirm it returns the structured "no-match" gap record.
5. **End-to-end smoke** — generate 3 representative videos (1.1, 5.1, 10.1) purely via `find_asset` lookups + existing TTS pipeline. Verify narration-cue sync via `src/tts/cue-timing.ts`.

---

## Decisions locked in

1. All assets created/procured upfront — nothing on-the-fly.
2. Every asset is reusable for any future video, not just AGT.
3. Single locked AI-image style prompt → `src/shared/imagePrompt.ts`.
4. Free-tier stock only (Heroicons/Tabler/Lucide, Unsplash/Pexels, Pixabay/Freesound). Gaps → AI-generate instead of pay.
5. Generator is selection-only; cannot author new visuals inline.
6. Asset selection happens via a **tool call** (`find_asset`) against a structured `src/asset-index/index.json`. SKILL.md does not enumerate the catalog.
