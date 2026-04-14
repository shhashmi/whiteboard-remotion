---
name: whiteboard-video
description: Generate a Remotion whiteboard-style animated explainer video as a single TSX file. Uses a pre-built component library of hand-drawn primitives, ~90 icons, and motion patterns. Load when asked to create, edit, or refine a Remotion video for this project.
---

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

## Component catalog

All non-motion visual components live in `../shared/components` (structural primitives) or `../shared/icons` (~90 icons). Motion wrappers live in `../shared/motions`.

### Structural primitives (`../shared/components`)

```ts
// Wraps SVG children at 1920×1080 viewBox. All SVG elements below MUST be inside <SVG>.
SVG: React.FC<{ children: React.ReactNode }>

// Scene wrapper — fades in (30 frames) and out (30 frames). ALL content goes inside a <Scene>.
Scene: React.FC<{
  startFrame: number;
  endFrame: number;        // inclusive end
  children: React.ReactNode;
}>

// Typewriter-drawn SVG text. Prefer this for on-canvas text.
HandWrittenText: React.FC<{
  text: string;
  x: number;                // center x if textAnchor="middle"
  y: number;                // baseline y
  startFrame: number;
  durationFrames: number;   // ≈ text.length * 1.2
  fontSize?: number;         // default 32
  fill?: string;             // default COLORS.outline
  fontWeight?: number;       // default 700
  textAnchor?: 'start' | 'middle' | 'end'; // default 'middle'
  letterSpacing?: number;
  maxWidth?: number;         // wraps to multiple lines if set
}>

// HTML div typewriter. ONLY use if you need absolute HTML positioning outside the SVG layer.
TypedText: React.FC<{
  text: string;
  startFrame: number;
  durationFrames: number;
  style?: React.CSSProperties;
}>

// Fade-in wrapper for HTML/div children.
FadeIn: React.FC<{
  startFrame: number;
  durationFrames?: number;  // default 20
  direction?: 'up'|'down'|'left'|'right'|'scale'|'none';
  distance?: number;         // default 20
  children: React.ReactNode;
  style?: React.CSSProperties;
}>

// Low-level path with animated stroke-draw and optional fill fade-in.
AnimatedPath: React.FC<{
  d: string;
  stroke?: string;           // default COLORS.outline
  strokeWidth?: number;      // default 2.5
  fill?: string;             // default 'none'
  fillOpacity?: number;
  startFrame: number;
  drawDuration: number;
  fillDuration?: number;
  opacity?: number;
}>
```

### Sketch shapes (`../shared/components`)

```ts
// Wobbly rounded rectangle. Supports auto-layout for interior text rows.
SketchBox: React.FC<{
  x: number; y: number;       // top-left
  width: number;
  height?: number;             // optional — auto-grows to fit rows if omitted
  startFrame: number; drawDuration: number;
  stroke?: string; strokeWidth?: number;
  fill?: string; fillOpacity?: number;
  rx?: number;                 // corner radius, default 6
  // Optional: pass rows for a box with auto-laid-out text (no manual y positioning needed).
  rows?: Array<{
    text: string;
    fontSize: number;
    color?: string;            // default: same as stroke
    fontWeight?: number;       // default 700
    startFrame?: number;       // placeholder — may omit if cue is set
    durationFrames: number;
    align?: 'start' | 'middle' | 'end';  // per-row override of contentAlign
    cue?: string;              // narration cue id — overrides startFrame at runtime
  }>;
  padding?: number;            // default 24 — inset from all edges
  gap?: number;                // default 12 — vertical gap between rows
  contentAlign?: 'start' | 'middle' | 'end';  // default 'middle'
}>
// When `rows` is provided, SketchBox auto-computes the box height and
// positions each text row so they never overlap. You only specify x, y,
// width, and the text content — the component handles the rest.
// Example:
//   <SketchBox
//     x={200} y={300} width={500}
//     startFrame={s + 20} drawDuration={18}
//     stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.05} rx={10}
//     padding={24} gap={14}
//     rows={[
//       { text: "Step Title Here", fontSize: 36, color: COLORS.orange,
//         startFrame: s + 40, durationFrames: 20 },
//       { text: "Description text that may wrap to multiple lines",
//         fontSize: 28, color: COLORS.gray1,
//         startFrame: s + 65, durationFrames: 40 },
//     ]}
//   />

SketchCircle: React.FC<{
  cx: number; cy: number; r: number;
  startFrame: number; drawDuration: number;
  stroke?: string; strokeWidth?: number;
  fill?: string; fillOpacity?: number;
}>

SketchArrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  startFrame: number; drawDuration: number;
  color?: string;              // default COLORS.orange
  strokeWidth?: number; headSize?: number;
}>

SketchLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  startFrame: number; drawDuration: number;
  color?: string; strokeWidth?: number;
}>

CheckMark: React.FC<{
  cx: number; cy: number; scale?: number;
  startFrame: number; drawDuration: number;
  color?: string;              // default COLORS.green
}>

CrossMark: React.FC<{
  cx: number; cy: number; scale?: number;
  startFrame: number; drawDuration: number;
  color?: string;              // default COLORS.red
}>

// Wrap any component that takes startFrame to drive it from the narration cueMap.
// When `cue` is present and registered, the runtime injects the resolved
// startFrame into the child and ignores the child's literal startFrame.
Timed: React.FC<{
  cue?: string;
  startFrame?: number;        // fallback if cue is missing from the map
  children: React.ReactElement;
}>
```

### Icons (`../shared/icons`)

**Common icon signature** — almost all icons take this shape:

```ts
{ cx: number; cy: number; scale?: number; startFrame: number; drawDuration: number; color?: string }
```

Some icons additionally take `shirtColor`/`hairColor` (people), `fill`/`stroke` (shapes), or no color. Icons default to sensible colors — you rarely need to pass `color`.

**Available icon names, grouped by category** (all importable from `../shared/icons`):

- **Technology**: `RobotHead`, `ToolIcon`, `DatabaseIcon`, `CodeIcon`, `CloudIcon`, `MonitorIcon`, `GearIcon`, `KeyboardIcon`, `MobilePhone`, `ServerRack`, `EnvelopeIcon`, `WiFiSignal`, `GridIcon`, `RadarSensorIcon`, `SensorEyeIcon`
- **Abstract concepts**: `BrainIcon`, `TargetIcon`, `BookIcon`, `Lightbulb`, `ClockIcon`, `SpeechBubble`, `LockIcon`, `ShieldIcon`, `MagnifyingGlass`, `WarningTriangle`, `PuzzlePiece`, `StarIcon`, `FlagIcon`, `MirrorIcon`, `NumberBadge`, `EyeIcon`, `LightningBoltIcon`
- **People**: `PersonIcon`, `PersonSitting`, `PersonPresenting`, `TwoPersons`, `TeamGroup`
- **Business/data**: `BarChart`, `DocStack`, `PieChart`, `LineGraph`, `ProgressBar`, `ProjectPlannerIcon`
- **Flow/diagrams**: `CycleArrow`, `FlowChain`, `FunnelIcon`, `DecisionDiamond`, `DottedConnector`
- **Structure**: `ScaleIcon`, `TreeDiagram`, `StackedLayers`, `NetworkGraph`, `BlueprintIcon`
- **Status**: `SmileyIcon`, `ThumbsUpIcon`, `HeartIcon`, `CheckCircleIcon`, `InfoCircleIcon`, `NotificationBellIcon`
- **Science**: `DNAEvolutionIcon`, `AtomIcon`, `MicroscopeIcon`, `BeakerIcon`, `MagnetIcon`, `GlobeIcon`
- **Finance**: `CoinIcon`, `WalletIcon`, `BankIcon`, `CreditCardIcon`, `DollarSignIcon`
- **Transport**: `CarIcon`, `AutonomousCarIcon`, `AirplaneIcon`, `ShipIcon`, `BicycleIcon`
- **Places/objects**: `FactoryIcon`, `ShoppingCartIcon`, `HandshakeIcon`, `SatelliteIcon`, `WindmillIcon`, `RecycleIcon`, `BridgeIcon`, `CircuitBoardIcon`
- **Nature**: `GrowthTransformIcon`, `MountainPeakIcon`, `WaveIcon`, `FlameIcon`, `SunIcon`, `MoonIcon`
- **Communication**: `ChatbotIcon`, `VideoCallIcon`, `BroadcastIcon`, `AntennaIcon`
- **Actions**: `UploadIcon`, `DownloadIcon`, `SyncIcon`, `PlayIcon`, `PauseIcon`, `ExpandIcon`, `ShareIcon`
- **Objects**: `FlowerIcon`, `CompassIcon`, `RocketIcon`, `TrophyIcon`, `CalendarIcon`, `CameraIcon`, `MegaphoneIcon`, `HourglassIcon`, `AnchorIcon`, `CrownIcon`, `ScissorsIcon`, `GiftIcon`, `MusicNoteIcon`, `PaintBrushIcon`, `PencilIcon`, `FolderIcon`, `TrashIcon`, `TagIcon`, `MicrophoneIcon`, `SpeakerIcon`, `HeadphonesIcon`, `USBPlugIcon`

**When in doubt about an icon:** prefer `SketchCircle` + `HandWrittenText` label. A clean circle with a label beats a broken custom icon.

### Motion wrappers (`../shared/motions`)

```ts
SpringReveal: React.FC<{
  startFrame: number;
  direction?: 'up'|'down'|'left'|'right'|'scale'|'none';
  distance?: number; damping?: number; mass?: number; stiffness?: number;
  svg?: boolean;               // pass true if wrapping SVG children (<g>)
  children: React.ReactNode;
  style?: React.CSSProperties;
}>

StaggerMap: React.FC<{
  startFrame: number;
  staggerDelay?: number;       // default 25
  count: number;
  children: (index: number, startFrame: number) => React.ReactNode;
}>

FlowPulse: React.FC<{
  startFrame: number;
  durationFrames: number;
  cycleDuration?: number;      // default 30
  minOpacity?: number; maxOpacity?: number;
  minScale?: number; maxScale?: number;
  svg?: boolean;
  children: React.ReactNode;
}>

CountUp: React.FC<{
  startFrame: number; durationFrames: number;
  from?: number; to: number;
  decimals?: number; prefix?: string; suffix?: string;
  x?: number; y?: number;
  fontSize?: number; fill?: string;
  textAnchor?: 'start'|'middle'|'end';
  svg?: boolean;               // default true
}>

CameraPan: React.FC<{
  keyframes: Array<{ frame: number; x: number; y: number; scale: number }>;
  children: React.ReactNode;
}>
```

## Timing conventions

Drawing must feel like a tutor sketching **as they speak**. Timing is driven by narration, not guessed by you. Follow these rules:

- Scene fades are handled automatically by `<Scene>` (30 frames in, 30 out). Do not manually fade the first/last elements of a scene.
- `drawDuration` for icons: **20–30 frames**. For sketch shapes: **15–25 frames**. For arrows: **12–18 frames**.
- `HandWrittenText.durationFrames` ≈ `text.length * 1.1` (so a 20-char title types over ~22 frames).
- **Scene `startFrame` / `endFrame` on `<Scene>` must be written as `{0}` / `{0}` placeholders. The generator post-pass fills in real values from the TTS output.**
- **Do NOT manually stagger `startFrame`s.** Instead, tag each narratable element with a `cue` (see next section). The post-pass injects real frame numbers from the narration timestamps, so every element draws exactly as its narration line is spoken.
- For elements that carry an explicit `startFrame` (decorative shapes not tied to narration), still give a sensible value relative to the scene start — it will be used as a fallback only.

## Cue-based narration sync — REQUIRED

Every visual element that represents a point the narrator talks about gets a **cue id** — a short string like `"s1-title"`, `"s1-principle"`, `"s1-cond-1"`. The cueMap produced by the TTS layer maps each id to an absolute frame; the runtime injects that frame into the element's `startFrame` so the drawing begins at the exact word in the voiceover.

**Cue id format:** `s{sceneIndex}-{slug}`, lowercase, hyphen-separated. Scene index is 0-based, matching the `<Scene>` order. Keep slugs short: `title`, `hook`, `principle`, `cond-1`, `eq`, `recap`.

### How to tag elements

**For `HandWrittenText`, `SketchBox`, icons, arrows, any component taking `startFrame`** — wrap it in `<Timed cue="...">`:

```tsx
<Timed cue="s1-principle">
  <HandWrittenText
    text="Faster flow means lower pressure"
    x={960} y={340}
    startFrame={0}   // placeholder — Timed overrides it
    durationFrames={40}
    fontSize={48}
    textAnchor="middle"
  />
</Timed>

<Timed cue="s1-bulb">
  <Lightbulb cx={1450} cy={520} scale={1.8} startFrame={0} drawDuration={25} />
</Timed>
```

**For `SketchBox` rows** — put the cue on the row object itself (do NOT wrap the SketchBox in `<Timed>` if you want per-row sync):

```tsx
<SketchBox
  x={160} y={420} width={520}
  startFrame={0} drawDuration={18}
  stroke={COLORS.blue} padding={24} gap={12}
  rows={[
    { cue: 's1-cond-title', text: 'Conditions', fontSize: 34,
      durationFrames: 22 },
    { cue: 's1-cond-1', text: '• Incompressible fluid', fontSize: 28,
      durationFrames: 25 },
    { cue: 's1-cond-2', text: '• Non-viscous', fontSize: 28,
      durationFrames: 28 },
  ]}
/>
```

If you want the SketchBox's outline to draw at its own cue (e.g. right before the rows are discussed), wrap the SketchBox in `<Timed cue="s1-cond-box">` AND put per-row cues for each row.

### What gets a cue, what doesn't

- ✅ Titles, bullet points, equations, labels — each is its own cue.
- ✅ Icons or diagrams the narrator explicitly mentions.
- ✅ Each row of a SketchBox `rows` prop — each gets its own cue.
- ❌ Decorative background shapes that are never spoken about.
- ❌ Static layout frames (plain SketchBox with no rows used purely as a container).

Keep cues **small** — one sentence or one bullet each (≤ 15 words). The narrator should be able to say a cue's text in 1–4 seconds. Over-large cues cause drawings to trail the voice.

### Import `Timed`

Add `Timed` to your import from `../shared/components`:

```ts
import { SVG, Scene, HandWrittenText, SketchBox, Timed, COLORS } from '../shared/components';
```

## Complete file template — START FROM THIS

```tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  SVG,
  Scene,
  HandWrittenText,
  SketchBox,
  SketchCircle,
  SketchArrow,
  SketchLine,
  CheckMark,
  COLORS,
} from '../shared/components';
import { RobotHead, BrainIcon, GearIcon } from '../shared/icons';
import { SpringReveal, StaggerMap, FlowPulse } from '../shared/motions';

// Scene durations (sum = total video length). You MUST export this as `durationInFrames`
// so the Remotion Composition can read it.
const TITLE_DUR = 180;
const SCENE_A_DUR = 300;
const SCENE_B_DUR = 300;
const SCENE_C_DUR = 300;
const END_DUR = 180;

// Placeholder — the post-pass overrides this with the real total after TTS.
export const durationInFrames = 2400;

export const GeneratedVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#fafaf5' }}>
      {/* Scene 0 — title. startFrame/endFrame are {0} placeholders. */}
      <Scene startFrame={0} endFrame={0}>
        <SVG>
          <Timed cue="s0-title">
            <HandWrittenText
              text="Your Title Here"
              x={960} y={440}
              startFrame={0}
              durationFrames={40}
              fontSize={88}
              textAnchor="middle"
            />
          </Timed>
          <Timed cue="s0-hook">
            <HandWrittenText
              text="A crisp one-line subtitle"
              x={960} y={560}
              startFrame={0}
              durationFrames={35}
              fontSize={44}
              fill={COLORS.orange}
              textAnchor="middle"
              maxWidth={1400}
            />
          </Timed>
        </SVG>
      </Scene>

      {/* Scene 1 — labeled card using cue-per-row */}
      <Scene startFrame={0} endFrame={0}>
        <SVG>
          <Timed cue="s1-title">
            <HandWrittenText
              text="Key Concepts"
              x={960} y={180}
              startFrame={0}
              durationFrames={20}
              fontSize={72}
              textAnchor="middle"
            />
          </Timed>
          <Timed cue="s1-card-box">
            <SketchBox
              x={160} y={280} width={520}
              startFrame={0} drawDuration={18}
              stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.05} rx={10}
              padding={24} gap={14}
              rows={[
                { cue: 's1-card-title', text: 'Concept Title',
                  fontSize: 36, color: COLORS.orange, durationFrames: 18 },
                { cue: 's1-card-desc',  text: 'Description text that may wrap.',
                  fontSize: 28, color: COLORS.gray1, durationFrames: 40 },
              ]}
            />
          </Timed>
        </SVG>
      </Scene>

      {/* ... additional scenes ... */}
    </AbsoluteFill>
  );
};

export const narrationCues = [
  { id: 's0-title',      sceneIndex: 0, text: 'Here is your title.',                         order: 0 },
  { id: 's0-hook',       sceneIndex: 0, text: 'And a single-line subtitle to frame it.',     order: 1 },
  { id: 's1-title',      sceneIndex: 1, text: 'Now the key concepts.',                       order: 2 },
  { id: 's1-card-box',   sceneIndex: 1, text: 'First, a concept we want to highlight.',      order: 3 },
  { id: 's1-card-title', sceneIndex: 1, text: 'Call it the concept title,',                  order: 4 },
  { id: 's1-card-desc',  sceneIndex: 1, text: 'with a short explanation underneath.',        order: 5 },
];
```

**Required exports from GeneratedVideo.tsx:**
1. `export const durationInFrames = <number>;` — placeholder, post-pass overwrites with real total
2. `export const GeneratedVideo: React.FC` — the component
3. `export const narrationCues` — array of `{ id, sceneIndex, text, order }`, one entry per `cue` used in the tree

The generator wires Root.tsx to import these, so all MUST be named exports.

## Avoid list — HARD FAILS

- ❌ Inventing hex colors outside the `COLORS` palette
- ❌ Placing any element outside x ∈ [120, 1800] or y ∈ [120, 960]
- ❌ More than 5 **primary focal concepts** in a single `<Scene>` (arrows, connectors, sub-labels don't count — see the "Composition structure" section)
- ❌ Body text larger than 48px, headlines larger than 96px
- ❌ Overlapping text boxes (two HandWrittenText with overlapping bounding boxes at the same frame)
- ❌ Placing any `HandWrittenText` whose `x,y` falls inside a `SketchBox`'s bounding rectangle. If a box needs text inside it, pass the text through `SketchBox`'s `rows` prop instead.
- ❌ Importing from `../pipeline/*` (that directory does not exist)
- ❌ Importing `@remotion/bits`, `remotion-bits`, or any library not listed above
- ❌ Using raw `<div>` layout inside a `<SVG>` (SVG children must be SVG elements or `<g>`)
- ❌ Writing non-zero values for `<Scene startFrame endFrame>` (must be `{0}`)
- ❌ Narratable elements without a `cue` prop (inside `<Timed>` or on a SketchBox row)
- ❌ A `cue` id used in the tree that is not declared in `narrationCues` (and vice versa)
- ❌ Emitting anything outside the single fenced ```tsx code block (no commentary, no headings, no trailing text)

## Narration cues — required export

In addition to `durationInFrames` and `GeneratedVideo`, export a `narrationCues` array. Each entry pairs a cue id with the exact narration line the voice actor will speak for that cue. The TTS layer reads this array, synthesises one MP3 per scene with speech marks at each cue, and produces a cueMap that the runtime uses to drive every `<Timed cue="…">` element.

```ts
export const narrationCues: Array<{
  id: string;          // matches the cue="..." on a visual element
  sceneIndex: number;  // 0-based scene index
  text: string;        // one sentence / one bullet — what the narrator says
  order: number;       // cumulative order across the whole video (0, 1, 2, …)
}> = [
  { id: 's0-title',   sceneIndex: 0, text: "Welcome to Bernoulli's theorem.", order: 0 },
  { id: 's0-hook',    sceneIndex: 0, text: "We'll see why fast-moving fluids drop in pressure.", order: 1 },
  { id: 's1-title',   sceneIndex: 1, text: "First, the core idea.", order: 2 },
  { id: 's1-cond-1',  sceneIndex: 1, text: "It assumes the fluid is incompressible,", order: 3 },
  { id: 's1-cond-2',  sceneIndex: 1, text: "and that it flows without friction.", order: 4 },
  // … one entry per cue, in the order they are spoken
];
```

**Rules:**
- Every `cue="..."` string used in the TSX MUST appear exactly once in `narrationCues`.
- Every `narrationCues` entry MUST correspond to at least one `cue` reference in the TSX (dead cues waste audio).
- Cues within a scene MUST appear in `narrationCues` in the order they are spoken.
- Each cue's `text` is **one short sentence or one bullet** — ideally 4–15 words, speakable in 1–4 seconds. Break longer thoughts across multiple cues.
- Narration should **complement** the visual text — expand on it, don't read it verbatim.
- Keep the tone **conversational and clear** — this becomes spoken audio.
- Use only plain text — no markdown, no special characters, no SSML tags.
- Roughly **2.5 words per second** of speech. Budget ~60–90s of narration total.

## One-pass quality checklist (run this in your head before emitting)

1. Did you export `durationInFrames` (placeholder number), `GeneratedVideo`, AND `narrationCues`?
2. Is every `<Scene startFrame={0} endFrame={0}>` using literal `{0}` placeholders?
3. Does every narratable element have a `cue` (via `<Timed>`) or a `cue` field on its `SketchBox` row?
4. Does every `cue` id used in the tree appear exactly once in `narrationCues`, and vice versa?
5. Are cues within a scene listed in `narrationCues` in the order they are spoken?
6. Is each cue's `text` 4–15 words, plain prose, no SSML / markdown / special chars?
7. Is every element's `x` in [120, 1800] and `y` in [120, 960]?
8. Is every scene ≤ 5 primary focal concepts?
9. Is every color either `COLORS.xxx` or the paper background `#fafaf5`?
10. Does `durationFrames` for each HandWrittenText match `text.length * 1.1`?
11. Are all imports present (including `Timed` from `../shared/components`)?
12. Is the output a single fenced ```tsx block with no surrounding prose?
13. Any `HandWrittenText` positioned inside a `SketchBox`'s bounding rectangle? Convert to `SketchBox.rows`.

If all thirteen pass, emit the code.
