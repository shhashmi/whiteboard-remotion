# Production Architecture: Remotion Code-Generation Agent

## Context

This project is, in effect, a domain-specific coding agent: it takes a natural
language topic and emits a valid Remotion TSX file that renders to MP4. The
question: is the current architecture production-grade, and if not, what is
the right shape?

**Current state** (traced in prior flow analysis):
- Single-shot LLM call with the entire `SKILL.md` catalog dumped into the
  system prompt (no tools bound).
- One retry on validation failure; validation is regex-based overlap checks +
  `tsc --noEmit`.
- Asset index (`findAsset`/`getAsset`/`listAssets`) exists but is never
  invoked by the agent — only reachable via CLI.
- No visual verification, no per-scene iteration, no plan phase, no structured
  reasoning about layout or timing.

**Verdict: not production-grade.** It works for short demos because Opus 4.6
is strong enough to one-shot a small TSX file from a large static prompt, but
the architecture will not scale on three axes: (1) **catalog size** — the
SKILL.md dump hits a ceiling; (2) **quality feedback** — regex cannot catch
visual bugs; (3) **complexity** — one-shot generation fails as scene counts
grow. The existing pieces (registry, tool.ts, LangGraph, TTS pipeline, cue
system) are the right primitives, but they are wired as a script rather than
an agent.

---

## Gaps in the Current Design

| # | Gap | Consequence |
|---|---|---|
| 1 | Catalog dumped in system prompt; no tool binding | Every generation pays full prompt cost; unknown assets can't be added without editing SKILL.md; model cannot reason "what exists for concept X". |
| 2 | Single-shot TSX generation | No way to iterate on a single scene; a timing bug in scene 4 forces re-emission of all 6 scenes. |
| 3 | No plan phase | Model chooses composition, scene count, pacing, and asset selection simultaneously with code writing. High variance, hard to steer. |
| 4 | Regex layout validation (`generate.ts:202–255`) | Misses rotated/scaled overlaps, nested `AbsoluteFill`s, dynamic sizes, anything outside the narrow SketchBox/HandWrittenText pair. False negatives dominate. |
| 5 | No visual verification loop | Invisible bugs: text clipped by safe zone, color clash, arrows pointing at wrong anchor, overflow. `tsc` + regex cannot see any of these. |
| 6 | Max 2 attempts, no targeted feedback | Retry passes the full error blob back; the model re-emits the whole file. No scene-level isolation. |
| 7 | Narration cues are *inferred from emitted code* rather than *planned upfront* | Cue alignment with visuals is accidental; scene duration is set before TTS timing is known. |
| 8 | No golden-path test harness | Every change to SKILL.md or primitives risks silent regressions on prior topics. |
| 9 | No observability beyond cost log | When a generation is subjectively "bad", there is no trace of which decision was wrong. |
| 10 | Theme, primitives, icons, diagrams are all treated as the same kind of "asset" in SKILL.md, but they have wildly different contracts | Confuses the model; `propsSchema` is only populated for diagrams. |

---

## Target Architecture

### Layered Agent Design

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Phase 0: INGEST                                                         │
│    • Parse user prompt → topic + constraints (length, tone, audience)    │
│    • Load cached SKILL.md trimmed to RULES ONLY (no catalog dump)        │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Phase 1: PLAN (agentic, tool-enabled)                                   │
│    Model call: generate a structured VideoPlan (JSON), not code.         │
│    Tools available:                                                      │
│      - findAsset(concept, kind?, tags?, limit?)                          │
│      - listAssets(kind?, tags?)                                          │
│      - getAsset(id) → full propsSchema + preview path                    │
│      - proposeScene(purpose, focalConcepts[]) → returns slot template    │
│    Output (validated against Zod schema):                                │
│      { topic, scenes: [                                                  │
│        { index, purpose, narrationDraft, focalAssets: [id],              │
│          layoutIntent, approxDurationSec } ],                            │
│        totalDurationSec, paletteHint }                                   │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Phase 2: NARRATION-FIRST TTS                                            │
│    For each scene in plan:                                               │
│      - Generate narration cues (LLM, cheap model)                        │
│      - Run TTS → MP3 + character timings                                 │
│      - Produce exact frame budget per cue                                │
│    Result: authoritative cueMap BEFORE code gen.                         │
│    (Flip of current flow, where code is written first, cues after.)      │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Phase 3: SCENE-BY-SCENE CODE GEN (agentic loop per scene)               │
│    For each scene:                                                       │
│      Loop(max_iter = 4):                                                 │
│        1. Model emits ONLY this scene's JSX (not whole file)             │
│           Tools bound:                                                   │
│             - getAsset(id), getPrimitiveSignature(name)                  │
│             - getThemeTokens()                                           │
│             - measureText(text, fontSize, maxWidth)                      │
│             - validateSceneAst(jsx) → AST-level check                    │
│             - renderFrame(jsx, atFrame) → PNG (Remotion still)           │
│             - describeFrame(png) → VLM caption / critique                │
│        2. Run validators → if fail, feedback is scoped to THIS scene     │
│        3. Once valid, render 3 sample frames + VLM critique              │
│        4. If VLM flags issue (clipping, overlap, wrong emphasis) loop    │
│    Stitch scenes → full TSX via deterministic template.                  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Phase 4: ASSEMBLE & VERIFY                                              │
│    • Template inserts scenes, CUE_MAP, durationInFrames, audio tracks    │
│    • Run tsc --noEmit                                                    │
│    • Render sparse grid (4×4 = 16 frames across timeline) + VLM sweep    │
│    • On any critical regression, dispatch scoped fix back to Phase 3     │
│      for the offending scene only                                        │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Phase 5: RENDER & REPORT                                                │
│    • npx remotion render                                                 │
│    • Emit trace: per-phase tokens, tool calls, iterations, costs, VLM    │
│      verdicts, final bundle hash                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

### Tool Catalog (what the agent should have — and when each fires)

Grouped by phase. Every tool returns structured JSON; never prose. Every tool
has a Zod schema and is registered via `.bindTools()` on the LangChain model.

**Discovery tools** (Phase 1 — planning):

| Tool | When invoked | Input | Output |
|---|---|---|---|
| `findAsset` | Agent is choosing a visual for a focal concept. | `{ concept, kind?, tags?, limit? }` | `{ matches: [{id, name, description, score, previewPath}], gap }` |
| `listAssets` | Agent wants to browse a category (e.g. all `flow` icons). | `{ kind?, tags?, limit? }` | `AssetEntry[]` |
| `getAsset` | Agent committed to an asset ID and needs its full `propsSchema`. | `{ id }` | `AssetEntry` incl. `propsSchema`, `importPath`, `previewPath` |
| `proposeScene` | Agent wants a scene skeleton for a known purpose (intro, tradeoff, cycle, etc.). | `{ purpose, focalConcepts, approxDurationSec }` | `{ slotTemplate, suggestedAssets, layoutHint }` |

**Reference tools** (Phase 3 — code gen):

| Tool | When invoked | Input | Output |
|---|---|---|---|
| `getPrimitiveSignature` | Before using a primitive the model last saw in Phase 1; confirms prop shape. | `{ name }` | `{ signature, propsJsonSchema, usageExample }` |
| `getThemeTokens` | Whenever a color/size/motion value is needed. | `{ group? }` | `{ COLORS, SEMANTIC_COLORS, TYPOGRAPHY, MOTION, CANVAS }` |
| `measureText` | Agent lays out `HandWrittenText` inside `SketchBox` and needs a bounding box. | `{ text, fontSize, maxWidth }` | `{ width, height, lineCount }` |

**Validation / feedback tools** (Phase 3–4):

| Tool | When invoked | Input | Output |
|---|---|---|---|
| `validateSceneAst` | After each scene JSX emission. AST-level: detect overlap, off-canvas, unknown identifiers, missing `startFrame`, bad color refs. | `{ jsx }` | `{ ok, errors: [{code, loc, message, suggestedFix?}] }` |
| `renderFrame` | Once scene is structurally valid — produce a PNG to inspect. | `{ jsx, atFrame }` | `{ pngPath, actualDurationFrames }` |
| `describeFrame` | After `renderFrame`, ask a vision model to critique. | `{ pngPath, intent }` | `{ issues: [{severity, type, loc, message}], overall }` |
| `diffExpectedLayout` | Against Phase 1 `layoutIntent`. | `{ jsx, intent }` | `{ alignmentScore, deviations[] }` |

**Narration tools** (Phase 2):

| Tool | When invoked | Input | Output |
|---|---|---|---|
| `synthesizeCue` | Per cue, per scene. | `{ text, voice, provider }` | `{ audioPath, charTimings, durationMs }` |
| `computeCueFrames` | After all cues synthesized. | `{ sceneAudioResults, fps }` | `{ cueMap, sceneBounds, totalFrames }` |

### Prompt Strategy

- **System prompt stays tiny** (~1–2k tokens): rules only — canvas, safe
  zone, hard fails, cue format, "use tools to discover assets". No catalog.
- **Plan phase** gets a task-specific prompt plus discovery tool bindings.
- **Scene phase** receives: the plan's scene entry + JSON of assets it
  committed to + trimmed primitive signatures it actually needs. Cached per
  plan run, so all N scenes share the asset context.
- **Cache control**: mark `[rules]` and `[plan]` as cached; scene-specific
  deltas flow through the variable portion.

### State Management

Keep LangGraph. Restructure nodes:

```
START
 → ingest
 → plan                 (tool loop: find/list/get/propose)
 → narrate              (fan-out per scene → TTS)
 → sceneGen             (fan-out per scene; each runs its own tool loop)
 → assemble             (template stitch)
 → verifyVisual         (sparse frame VLM sweep)
 → (sceneGen on-demand for flagged scenes — bounded)
 → render
END
```

Persist state to disk between phases so a crashed run can resume at the last
checkpoint (critical for costly TTS + render phases).

### Validation Layers

Replace regex with AST. Use `@babel/parser` or the TypeScript compiler API on
the emitted JSX to check:

1. **Structural**: required exports, scene count matches plan, cue IDs match
   plan.
2. **Identifier allowlist**: every component reference must resolve to a
   registered primitive/diagram/icon. No invented components.
3. **Literal allowlist**: all color strings must be `COLORS.*` or
   `SEMANTIC_COLORS.*` references — no raw hex.
4. **Numeric constraints**: `x ∈ [120, 1800]`, `y ∈ [120, 960]`, `startFrame ≥
   0`, `drawDuration ≥ MOTION.strokeDrawFrames`.
5. **Geometric**: project every element to its bounding box and run an
   interval-tree overlap check. Catches what regex misses (rotations,
   nested fills, dynamic positions from expressions evaluated under known
   bindings).
6. **Visual** (VLM): the only layer that catches "this looks wrong" bugs.

### Observability

Every run emits a trace file `runs/<timestamp>/trace.jsonl` with:

- Phase boundaries + wall time.
- Every tool call (name, input, output size, latency, success/error).
- Every model call (model id, input tokens, output tokens, cache hit).
- Every validator verdict (which layer, which errors).
- Final cost breakdown per phase.

Enables: replay, regression debugging, prompt-engineering A/B tests.

### Testing

- **Golden topics**: 5–10 canonical prompts (e.g. "ReAct loop", "memory types
  in agents"). On each `generate.ts` change, regenerate and run a VLM
  diff-against-previous. Any critical-severity regression blocks merge.
- **Unit tests for validators**: feed known-bad JSX and assert errors.
- **Snapshot tests for asset index**: `findAsset("agents")` returns a stable
  ranked list.
- **Fixture-based scene tests**: for each primitive, a render test at fixed
  frames.

---

## Migration Path (ordered, each step independently shippable)

1. **Bind `findAsset` + `getAsset` + `listAssets` as tools** to the existing
   single-shot `generateNode`. Trim SKILL.md catalog to names-only stubs.
   Measure token savings + quality delta on golden topics.
2. **Add AST-based validator** alongside regex; run both, alert on divergence
   for a week, then retire regex.
3. **Introduce plan phase** emitting JSON `VideoPlan`; keep scene gen
   single-shot but *conditioned on the plan*.
4. **Flip to narration-first TTS** (cues planned in Phase 1, synthesized in
   Phase 2, code gen in Phase 3 uses the real cueMap).
5. **Scene-by-scene loop** with per-scene retry instead of whole-file retry.
6. **Add `renderFrame` + VLM critique** as the final quality gate.
7. **Checkpoint + resume** via LangGraph persistence.
8. **Golden-topic regression harness** wired into CI.

Steps 1–2 are high-leverage and low-risk; they can ship immediately without
touching the graph structure.

---

## What to Keep from Current Design

- **`src/asset-index/registry.ts`** — the `AssetEntry` shape is right. Just
  wire it to the agent.
- **`src/shared/`** primitives, icons, diagrams, theme — well-factored.
- **LangGraph** for orchestration — the right primitive.
- **Prompt caching** on the system prompt — keep, but shrink the cached
  payload.
- **Cue system** (`CueProvider`, `<Timed>`) — architecturally correct; just
  reverse the order so cues precede code.
- **Cost log** — extend with tool-call breakdown.

## What to Remove

- Catalog enumeration in SKILL.md (pages ~52–248 of it).
- Regex layout validation in `generate.ts:202–255` (once AST validator is in).
- Max-2-attempts whole-file retry (`prepareRetryNode`) — replaced by scoped
  per-scene loops.

---

## Critical Files for Refactor

- `src/generate.ts` — graph restructure; node additions for `plan`, `narrate`,
  `sceneGen`, `verifyVisual`.
- `src/asset-index/tool.ts` — export LangChain `Tool` adapters (or wrap via
  `tool()` from `@langchain/core/tools`).
- `.claude/skills/whiteboard-video/SKILL.md` — trim to rules-only.
- New: `src/agent/tools/` — `findAsset.ts`, `getAsset.ts`,
  `getPrimitiveSignature.ts`, `measureText.ts`, `validateSceneAst.ts`,
  `renderFrame.ts`, `describeFrame.ts`.
- New: `src/agent/validators/ast.ts` — replaces regex layout check.
- New: `src/agent/plan/schema.ts` — Zod `VideoPlan` schema.
- New: `src/agent/render/still.ts` — single-frame Remotion still renderer.
- New: `src/agent/vlm/critique.ts` — VLM wrapper (Claude with vision or other).

## Verification

This plan is a design document, not an implementation. Validation is by
review + staged migration:

1. Share this plan; align on tool surface and phase boundaries before writing
   code.
2. Implement Step 1 (tool binding) and measure: (a) token usage on golden
   topics, (b) quality via VLM pairwise comparison against the single-shot
   baseline.
3. Proceed to Step 2+ only if Step 1 shows neutral-or-better quality at lower
   token cost.
