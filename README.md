# whiteboard-remotion

Single-shot Remotion whiteboard video generator powered by Claude Opus 4.6.

Takes a one-line description of what you want explained, hands it to Claude Opus 4.6 along with a project-specific skill describing the component library and style rules, and gets back a complete `GeneratedVideo.tsx`. TypeScript-checked, narrated via TTS, and rendered to MP4.

**One API call per video** (two if the first attempt has a compile error).

## Architecture

```
input.txt ──▶ src/generate.ts
                │
                ▼
       .claude/skills/whiteboard-video/SKILL.md  (system prompt)
                │
                ▼
       claude-opus-4-6  (one call, max_tokens=16384)
                │
                ▼
       src/generated/GeneratedVideo.tsx           (compile check + 1 retry on failure)
                │
                ▼
       extract narrationScript → TTS provider → public/audio/scene-*.mp3
                │
                ▼
       src/generated/NarratedVideo.tsx            (wraps video + audio)
                │
                ▼
       npx remotion render → out/generated.mp4
```

The component library lives in `src/shared/components.tsx`, `src/shared/motions.tsx`, and `src/shared/icons/` (~90 hand-drawn icons). The skill documents everything Claude needs to know about it.

## Setup

```sh
npm install
cp .env.example .env   # add your API keys
```

Required keys in `.env`:

| Key | Required | Used for |
|-----|----------|----------|
| `ANTHROPIC_API_KEY` | Yes | Claude Opus 4.6 video generation |
| `OPENAI_API_KEY` | For OpenAI TTS | Narration via OpenAI TTS (`tts-1`) |
| `ELEVENLABS_API_KEY` | For ElevenLabs TTS | Narration via ElevenLabs (`eleven_turbo_v2_5`) |

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
# Choose TTS provider (default: openai)
npm run generate -- --tts-provider=openai
npm run generate -- --tts-provider=elevenlabs

# Choose voice
npm run generate -- --tts-voice=shimmer              # OpenAI voices: alloy, echo, fable, onyx, nova (default), shimmer
npm run generate -- --tts-voice=21m00Tcm4TlvDq8ikWAM # ElevenLabs takes a voice ID
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

## Project layout

```
.claude/skills/whiteboard-video/SKILL.md   # the skill (system prompt base)
src/
  generate.ts                              # LangGraph pipeline: generate → validate → narrate → render
  tts/                                     # extensible TTS narration system
    types.ts                               # TTSProvider interface, NarrationSegment, TTSResult
    provider-registry.ts                   # map-based provider registry (lazy-loaded)
    provider-openai.ts                     # OpenAI TTS (tts-1, voices: alloy/echo/fable/onyx/nova/shimmer)
    provider-elevenlabs.ts                 # ElevenLabs TTS (eleven_turbo_v2_5)
    generate-audio.ts                      # orchestrator: calls provider per scene
    timing.ts                              # playback rate calculator for audio-scene sync
    audio-duration.ts                      # ffprobe-based duration measurement
  shared/
    components.tsx                         # structural primitives, COLORS, sketch shapes
    motions.tsx                            # SpringReveal, StaggerMap, FlowPulse, CountUp, CameraPan
    icons/                                 # ~90 hand-drawn SVG icons, categorised
  generated/                               # model output (gitignored)
  cfpb-riskcheck/                          # hand-crafted reference video (unrelated to generator)
  Root.tsx, index.tsx                      # default Remotion entry (shows the CFPB video)
public/audio/                              # generated narration audio files (gitignored)
docs/legacy/                               # old 7-role pipeline design docs, kept for history
```

## Scripts

| Script | What it does |
|---|---|
| `npm run generate` | Single-shot generate + typecheck + narrate + render |
| `npm run studio` | Preview the default Remotion composition (CFPB explainer) |
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
