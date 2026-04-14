# whiteboard-remotion

Remotion whiteboard video generator powered by a Claude Opus 4.6 tool-calling agent.

Takes a one-line description of what you want explained, runs a tool-calling agent that queries the asset catalog via `findAsset` to pick the right diagrams and icons, and emits a complete `GeneratedVideo.tsx`. TypeScript-checked, narrated via TTS, and rendered to MP4.

**Typical run: 1–2 agent iterations** (the model batches `findAsset` calls in parallel), plus one retry if validation fails.

## Architecture

```
input.txt ──▶ src/generate.ts
                │
                ▼
       .claude/skills/whiteboard-video/SKILL.md  (cached system prompt — rules only)
                │
                ▼
       claude-opus-4-6 + bound tools             (agent loop; max_tokens=16384)
       findAsset / getAsset / listAssets         (catalog discovery, schemas via API)
                │
                ▼
       src/generated/GeneratedVideo.tsx           (compile check + 1 retry on failure)
                │
                ▼
       extract narrationCues → TTS provider → public/audio/scene-*.mp3
                │                (ElevenLabs char-timings / Polly SSML marks)
                ▼
       buildCueTiming (src/tts/cue-timing.ts)     (cue → absolute frame map)
                │
                ▼
       patchGeneratedVideoTsx                     (injects CUE_MAP + <CueProvider>,
                                                   wraps video + scene audio)
                │
                ▼
       npx remotion render → out/generated.mp4
```

The component library lives in `src/shared/components.tsx` (primitives), `src/shared/motions.tsx` (reveal/stagger/flow), `src/shared/icons/` (~90 hand-drawn icons), `src/shared/diagrams/` (20 prebuilt diagrams like `ReActLoop`, `AutonomySpectrum`, `MemoryArchitecture`, `Flowchart`, `EntityRelationshipGraph`…), and `src/shared/theme.ts` (design tokens: `COLORS`, `SEMANTIC_COLORS`, `TYPOGRAPHY`, `MOTION`, `CANVAS`). The catalog is indexed in `src/asset-index/registry.ts` and exposed to the agent as LangChain tools via `src/agent/tools/` — the SKILL.md carries discovery **policy** ("batch `findAsset` calls; treat returns as authoritative; compose from primitives on gap"), not schema, so the model queries rather than memorises.

## Setup

```sh
npm install
cp .env.example .env   # add your API keys
```

Required keys in `.env`:

| Key | Required | Used for |
|-----|----------|----------|
| `ANTHROPIC_API_KEY` | Yes | Claude Opus 4.6 video generation |
| `ELEVENLABS_API_KEY` | For ElevenLabs TTS (default) | Narration via ElevenLabs (`eleven_turbo_v2_5`) with character-level timing |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` | For Polly TTS | Narration via AWS Polly neural voices with SSML speech marks |

## Usage

```sh
# Generate from input.txt (default) — with narration
npm run generate

# Or with an inline prompt
npm run generate -- "three paradigms of AI agent design"

# Or from a different prompt file
npm run generate -- --prompt=my-idea.txt

# Skip the render step (useful for iterating on the TSX)
npm run generate -- --no-render

# Skip narration (silent video, like before)
npm run generate -- --no-narration
```

Output lands at `out/generated.mp4` and the source at `src/generated/GeneratedVideo.tsx`.

### Narration options

```sh
# Choose TTS provider (default: elevenlabs)
npm run generate -- --tts-provider=elevenlabs
npm run generate -- --tts-provider=polly

# Choose voice
npm run generate -- --tts-voice=21m00Tcm4TlvDq8ikWAM # ElevenLabs takes a voice ID
npm run generate -- --tts-voice=Joanna               # Polly voice IDs: Joanna (default), Matthew, Stephen, Ruth, …

# Polly engine is configurable via env (default: neural)
POLLY_ENGINE=neural POLLY_VOICE=Matthew npm run generate
```

You can also set defaults via environment variables: `TTS_PROVIDER`, `TTS_VOICE`.

### Adding a new TTS provider

1. Create `src/tts/provider-yourname.ts` implementing the `TTSProvider` interface
2. Register it in `src/tts/provider-registry.ts`:
   ```ts
   registerTTSProvider('yourname', () => {
     const { YourProvider } = require('./provider-yourname');
     return new YourProvider();
   });
   ```
3. Use it: `npm run generate -- --tts-provider=yourname`

## Iterating

Two workflows:

1. **Regenerate**: tweak `input.txt`, `npm run generate` again.
2. **Hand-edit**: open `src/generated/GeneratedVideo.tsx` directly, then `npm run render:generated`. You can preview live with `npm run studio:generated`.

To refine the style rules globally, edit `.claude/skills/whiteboard-video/SKILL.md`. That's the single source of truth for how the model builds videos.

## Pipeline stages

`src/generate.ts` wires five LangGraph nodes into one run:

| # | Node | Runs | Produces | Key code |
|---|---|---|---|---|
| 1 | `generate` | Always (once, or twice on validation failure) | `responseText` — raw TSX emitted by a Claude Opus 4.6 tool-calling agent (`runAgent`) with SKILL.md as a cached system prompt and `findAsset`/`getAsset`/`listAssets` bound as tools | `generateNode` (src/generate.ts:404), `runAgent` (src/agent/loop/runAgent.ts) |
| 2 | `validate` | After every `generate` attempt | `exportErrors`, `layoutErrors`, `typecheckOk` — runs `validateRequiredExports`, `validateLayout`, and `tsc --noEmit` on the written `src/generated/GeneratedVideo.tsx` | `validateNode` (src/generate.ts:465) |
| 3 | `prepareRetry` | Only if `validate` found errors and `attempt < 2` | A feedback `HumanMessage` appended to the conversation; loops back to `generate` | `prepareRetryNode` (src/generate.ts:487) |
| 4 | `extractNarration` | After a clean validate (skipped with `--no-narration`) | `sceneCueGroups` — parses the `export const narrationCues = [...]` array from the TSX and groups cues by `sceneIndex` | `extractNarrationNode` (src/generate.ts:561) |
| 5 | `generateAudio` | If any cues were extracted | Per-scene `public/audio/scene-*.mp3` + `CueTiming[]` (from ElevenLabs character timestamps or Polly SSML `<mark>` speech marks); `buildCueTiming` then converts those to an absolute-frame `CUE_MAP`, and `patchGeneratedVideoTsx` injects it plus a `<CueProvider>` wrapper into the TSX | `generateAudioNode` (src/generate.ts:700) |

Post-graph, `main()` invokes `npx remotion render` unless `--no-render` is set, and prints a cost summary (Claude token usage + TTS character charges).

Flow: `START → generate → validate → (prepareRetry → generate)? → extractNarration → generateAudio → END`.

## Asset discovery

Every reusable asset (component, diagram, icon, image, photo, audio) is indexed in `src/asset-index/registry.ts` with concepts, tags, and descriptions. The index is **not** dumped into SKILL.md. It reaches the model through two channels:

1. **The agent, at generation time** — `src/agent/tools/` wraps `findAsset`, `getAsset`, and `listAssets` as LangChain tools. `generateNode` binds them via `model.bindTools(...)` inside `runAgent` (`src/agent/loop/runAgent.ts`), so tool schemas ship via the Anthropic API rather than the system prompt. The model calls `findAsset` mid-generation to discover what exists and reads `importPath` + `propsSchema` straight from the match.
2. **The CLI, for humans** —

   ```sh
   ts-node src/asset-index/cli.ts find-asset "retry loop" --kind diagram --limit 5
   ts-node src/asset-index/cli.ts get-asset ReActLoop
   ts-node src/asset-index/cli.ts list-assets --kind icon --tags technology
   ```

### Adding a new agent tool

Same shape as adding an asset or TTS provider — self-contained modules, one registry entry:

1. Create `src/agent/tools/yourTool.tool.ts` using `defineTool({ name, description, schema, handler })` from `./types`. Keep the handler a thin adapter over your domain function.
2. Add one import + one array entry in `src/agent/tools/index.ts`.

No edits to `runAgent`, the graph, or `generateNode`.

Programmatic equivalents of the catalog functions: `findAsset()`, `getAsset()`, `listAssets()` from `src/asset-index/tool.ts`.

## Project layout

```
.claude/skills/whiteboard-video/SKILL.md   # the skill (system prompt base)
src/
  generate.ts                              # LangGraph pipeline: generate → validate → narrate → render
  agent/                                   # extensible tool-calling layer for the model
    tools/                                 # one file per tool; registry in index.ts
      types.ts                             # defineTool() helper + AgentTool interface
      findAsset.tool.ts                    # wraps asset-index findAsset (search by concept)
      getAsset.tool.ts                     # wraps asset-index getAsset (fetch by id)
      listAssets.tool.ts                   # wraps asset-index listAssets (browse by kind/tags)
      index.ts                             # AGENT_TOOLS + AGENT_TOOLS_LC registry
    loop/
      runAgent.ts                          # bindTools + tool_call resolution loop (MAX_TOOL_ITERATIONS=8)
  tts/                                     # extensible TTS narration system
    types.ts                               # TimedTTSProvider, CueTiming, SynthesizeSceneArgs
    provider-registry.ts                   # map-based provider registry (lazy-loaded)
    provider-elevenlabs.ts                 # ElevenLabs (eleven_turbo_v2_5 + character timestamps)
    provider-polly.ts                      # AWS Polly neural voices + SSML <mark> speech marks
    generate-audio.ts                      # orchestrator: per-scene cue synthesis
    cue-timing.ts                          # buildCueTiming(): cue → absolute-frame map
                                           #   (preRollFrames, breathingFrames, fadeFrames, tailDrawFrames)
    timing.ts                              # framesToMs / msToFrames helpers
    audio-duration.ts                      # ffprobe-based duration measurement
  asset-index/                             # searchable catalog of every reusable asset
    registry.ts                            # 100+ AssetEntry records (concepts, tags, descriptions)
    tool.ts                                # findAsset() / getAsset() / listAssets()
    types.ts                               # AssetKind: component | diagram | icon | image | photo | audio
    index.json, previews/                  # pregenerated metadata + screenshots
  shared/
    components.tsx                         # structural primitives, sketch shapes
    motions.tsx                            # SpringReveal, StaggerMap, FlowPulse, CountUp, CameraPan
    theme.ts                               # COLORS, SEMANTIC_COLORS, TYPOGRAPHY, MOTION, CANVAS (1920×1080 @ 30fps)
    icons/                                 # ~90 hand-drawn SVG icons, categorised
    diagrams/                              # 20 diagram components (ReActLoop, Flowchart, …)
    imagePrompt.ts                         # image prompt helper
  test-compositions/                       # studio previews for primitives
    AllAComponents.tsx                     # A1–A12 component tests
    AllBDiagrams.tsx                       # B1–B8 diagram tests
    ReActLoopTest.tsx
  generated/                               # model output (gitignored)
  cfpb-riskcheck/                          # hand-crafted reference video (unrelated to generator)
  Root.tsx, index.tsx                      # Remotion entry: CFPB video + 23 test compositions
public/audio/                              # generated narration audio files (gitignored)
docs/legacy/                               # old 7-role pipeline design docs, kept for history
```

## Scripts

| Script | What it does |
|---|---|
| `npm run generate` | Single-shot generate + typecheck + narrate + render |
| `npm run studio` | Preview the default Remotion compositions — CFPB explainer plus 23 component/diagram test scenes from `src/test-compositions/` |
| `npm run studio:generated` | Preview the most recently generated video |
| `npm run render:generated` | Re-render the current `src/generated/` without regenerating |
| `npm run typecheck` | `tsc --noEmit` across the project |

## Cost tracking

Every run logs token usage and TTS costs to `out/cost-log.jsonl`. The summary prints after each run:

```
═══════════════════════════════════════════════════
  This run:   135.2s
              $1.1600 (in: 19738 tok, out: 12263 tok)
              TTS: 482 chars / $0.0072 (openai)
              Total: $1.1672
  ─────────────────────────────────────────────────
  Cumulative: 3 runs
              $3.4944 total
═══════════════════════════════════════════════════
```

## History

This project previously ran a 7-role pipeline (author → scriptwriter → art director → layout → animate → polish → renderer) with vision validation and lesson memory. It was 10–59 API calls per video and produced worse output than Claude.ai chat does in one shot. The pipeline has been archived to the `legacy` branch and its design docs live in `docs/legacy/`. See `docs/legacy/SYSTEM_DESIGN.md` for the original rationale.
