# whiteboard-remotion

Single-shot Remotion whiteboard video generator powered by Claude Opus 4.6.

Takes a one-line description of what you want explained, hands it to Claude Opus 4.6 along with a project-specific skill describing the component library and style rules, and gets back a complete `GeneratedVideo.tsx`. TypeScript-checked and rendered to MP4.

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
       src/generated/Root.tsx + index.tsx          (generated inline)
                │
                ▼
       npx remotion render → out/generated.mp4
```

The component library lives in `src/shared/components.tsx`, `src/shared/motions.tsx`, and `src/shared/icons/` (~90 hand-drawn icons). The skill documents everything Claude needs to know about it.

## Setup

```sh
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
```

## Usage

```sh
# Generate from input.txt (default)
npm run generate

# Or with an inline prompt
npm run generate -- "three paradigms of AI agent design"

# Or from a different prompt file
npm run generate -- --prompt=my-idea.txt

# Skip the render step (useful for iterating on the TSX)
npm run generate -- --no-render
```

Output lands at `out/generated.mp4` and the source at `src/generated/GeneratedVideo.tsx`.

## Iterating

Two workflows:

1. **Regenerate**: tweak `input.txt`, `npm run generate` again.
2. **Hand-edit**: open `src/generated/GeneratedVideo.tsx` directly, then `npm run render:generated`. You can preview live with `npm run studio:generated`.

To refine the style rules globally, edit `.claude/skills/whiteboard-video/SKILL.md`. That's the single source of truth for how the model builds videos.

## Project layout

```
.claude/skills/whiteboard-video/SKILL.md   # the skill (system prompt base)
src/
  generate.ts                              # ~260-line single-call generator
  shared/
    components.tsx                         # structural primitives, COLORS, sketch shapes
    motions.tsx                            # SpringReveal, StaggerMap, FlowPulse, CountUp, CameraPan
    icons/                                 # ~90 hand-drawn SVG icons, categorised
  generated/                               # model output (gitignored)
  cfpb-riskcheck/                          # hand-crafted reference video (unrelated to generator)
  Root.tsx, index.tsx                      # default Remotion entry (shows the CFPB video)
docs/legacy/                               # old 7-role pipeline design docs, kept for history
```

## Scripts

| Script | What it does |
|---|---|
| `npm run generate` | Single-shot generate + typecheck + render |
| `npm run studio` | Preview the default Remotion composition (CFPB explainer) |
| `npm run studio:generated` | Preview the most recently generated video |
| `npm run render:generated` | Re-render the current `src/generated/` without regenerating |
| `npm run typecheck` | `tsc --noEmit` across the project |

## History

This project previously ran a 7-role pipeline (author → scriptwriter → art director → layout → animate → polish → renderer) with vision validation and lesson memory. It was 10–59 API calls per video and produced worse output than Claude.ai chat does in one shot. The pipeline has been archived to the `legacy` branch and its design docs live in `docs/legacy/`. See `docs/legacy/SYSTEM_DESIGN.md` for the original rationale.
