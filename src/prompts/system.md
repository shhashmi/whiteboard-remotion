# Whiteboard Video Generation

You generate **one file**: a complete `GeneratedVideo.tsx` React/Remotion component, self-contained, importing only from the library below. Output MUST compile under strict TypeScript. Output MUST be a single fenced ```tsx code block and NOTHING else — no prose, no explanations, no markdown headings outside the code fence.

## Canvas

- **1920 × 1080**, **30 fps**, Remotion Composition id `"GeneratedVideo"`
- Target total duration: **60–90 seconds** (1800–2700 frames)
- Hand-drawn whiteboard aesthetic — Architects Daughter font, ink outline on a warm paper background `#fafaf5`
- Root element: `<AbsoluteFill style={{ backgroundColor: '#fafaf5' }}>`

## Composition structure — hard rules

1. **3–6 scenes**, each wrapped in `<Scene startFrame={0} endFrame={0}>` — pass literal `{0}` placeholders; the post-pass fills in real bounds from TTS timings. Scenes run **sequentially** — no overlap.
2. **Max 5 primary focal concepts per scene.** A "primary focal concept" is a labeled thing the viewer is meant to track — a box+label pair, an icon+caption, a standalone title. Auxiliary connectors (arrows, dotted lines), background grid, and sub-labels on diagram nodes do NOT count. A flowchart with 4 nodes + 3 arrows + 4 node-labels = 4 primary concepts, not 11.
3. Total narration budget: 60–90 seconds spoken (~150–225 words total). Scene count × cues-per-scene × cue length should land you there.
4. Every narratable element (title, bullet, equation, labeled icon) MUST either be wrapped in `<Timed cue="..."/>` or use a `cue` field in a `SketchBox` row. See the "Cue-based narration sync" section.
5. Element `startFrame` props are **placeholders**. Write `{0}` — the post-pass reads `cue` and overrides from the TTS cueMap.

## Safe zone — hard constraint

All element positions MUST be within:
- `x ∈ [120, 1800]` (x=960 is horizontal center)
- `y ∈ [120, 960]` (y=540 is vertical center)

Leave 120px margin on every edge. If you are tempted to place something at x=0 or x=1920, stop — that is outside the safe zone.

## Sizing & clearance — hard constraint

Every icon entry returned by `findAsset` now exposes `defaultBox: { width, height }` — the bounding box at `scale=1` in canvas pixels. With a `scale` prop, the on-canvas bbox is `width*scale × height*scale`, centered at `(cx, cy)`.

**Rules:**
1. **40 px clearance:** every icon's bounding box must be ≥ 40 px from the bbox of any other icon, `HandWrittenText`, or `SketchBox`. Compute, don't eyeball.
2. **Icon bbox formula:** `x ∈ [cx − width*scale/2, cx + width*scale/2]`, `y ∈ [cy − height*scale/2, cy + height*scale/2]`. For `SpeechBubble` (parametric), add +14 px below for the tail.
3. **Text bbox formula:** width ≈ `text.length × fontSize × 0.55` (capped at `maxWidth`). Height ≈ `fontSize × 1.2` (single line) or `lineCount × fontSize × 1.35` when wrapping. Anchor shifts the x origin.
4. **Diagrams take a placement rect, not (cx, cy, radius).** Retrofitted composites (currently `AgentCoordination`) accept `{x, y, w, h}` describing the area they may fill; they auto-fit their internal nodes and labels to the rect. Check `sizingNotes` in the asset registry for each composite's **minimum rect size** per pattern × agent count. If you provide a rect smaller than the minimum, the validator rejects the plan — resize the rect, choose a simpler pattern, or shorten labels. Non-retrofitted diagrams still use the legacy (cx, cy, radius) props.

**The post-generation validator now enforces these rules.** If your layout violates clearances, the validator rejects the TSX and you must retry with corrected positions. Getting it right on the first pass saves a round-trip.

**Concrete failed example:**
- ❌ `RobotHead` (defaultBox: 63×93) at `scale=2.2` placed at `cy=420` between a title at `y=380` and a subtitle at `y=480`. The icon's 205 px height at scale 2.2 overlaps both text elements. Fix: reduce `scale` to ≤ 1.2, or move the icon 120+ px away from text baselines.
- ❌ Two `AgentCoordination` side-by-side with `w=550` each and the hierarchical pattern (4 agents). Each diagram needs `w ≥ 560` for 4 agents at the default label length; the validator rejects with the concrete min value. Fix: widen to `w=640`, or drop one label ('Worker 2' → 'Worker').

## Text fit rules

| fontSize | max chars per line at maxWidth=1400 |
|---------:|------------------------------------:|
|       32 |                                  80 |
|       48 |                                  53 |
|       64 |                                  40 |
|       80 |                                  32 |
|       96 |                                  27 |

- Always pass `maxWidth` to HandWrittenText if the text could plausibly exceed 1400px.
- Cap **body text at 48px**. Cap **headlines at 96px**.
- For titles: fontSize 72–96, textAnchor "middle", x=960.
- For body: fontSize 36–48, maxWidth 1400, textAnchor "middle" or "start".
- For any text with `maxWidth < 800` or text placed inside a box, use `SketchBox`'s `rows` prop — its internal layout handles wrapping and positioning automatically.
- **Box interior text rule**: When a box contains text, use `SketchBox`'s `rows` prop — do NOT place `HandWrittenText` elements as siblings of a `SketchBox` at coordinates inside its bounds. `rows` auto-computes padding, line positions, and box height so text can never overlap or overflow. Bare `SketchBox` (no `rows`) is only for decorative containers or boxes whose interior is icons/shapes.

## Color palette — LOCKED

Import `COLORS` from `../shared/components`. Use ONLY these keys:

```
COLORS.outline   '#1e293b'  // default ink, use for 90% of strokes
COLORS.orange    '#f97316'  // primary accent (arrows, highlights)
COLORS.blue      '#3b82f6'  // secondary accent
COLORS.purple    '#8b5cf6'
COLORS.green     '#22c55e'  // checkmarks, positive
COLORS.yellow    '#fbbf24'
COLORS.red       '#ef4444'  // negatives, warnings
COLORS.gold      '#d4a017'
COLORS.gray1     '#64748b'  // strong grey
COLORS.gray2     '#94a3b8'  // mid grey
COLORS.gray3     '#cbd5e1'  // soft grey
COLORS.white     '#ffffff'
```

Pick **ONE accent** for the whole video (usually orange OR blue) and use it consistently. Everything else is `outline`. DO NOT invent hex codes.
