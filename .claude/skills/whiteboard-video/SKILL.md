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

1. **3–6 scenes**, each wrapped in `<Scene startFrame={...} endFrame={...}>`. Scenes run **sequentially** — no overlap, no concurrent scenes. Prefer 4–5.
2. **Max 5 primary focal concepts per scene.** A "primary focal concept" is a labeled thing the viewer is meant to track — a box+label pair, an icon+caption, a standalone title. Auxiliary connectors (arrows, dotted lines), background grid, and sub-labels on diagram nodes do NOT count. A flowchart with 4 nodes + 3 arrows + 4 node-labels = 4 primary concepts, not 11.
3. Scene duration budget: title/hook ~180 frames, explanation scenes ~300–420 frames each, takeaway ~180 frames.
4. Always track a single `frame` counter across the file: `frame = 0`, then `frame += sceneDuration`. Scene `endFrame = startFrame + duration - 1`.
5. Inside a scene, element `startFrame` values are **absolute to the video**, not relative to the scene. Start elements 10–20 frames after the scene's startFrame (so the scene fade-in finishes first) and end at least 20 frames before the scene's endFrame.

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
// Wobbly rounded rectangle.
SketchBox: React.FC<{
  x: number; y: number;       // top-left
  width: number; height: number;
  startFrame: number; drawDuration: number;
  stroke?: string; strokeWidth?: number;
  fill?: string; fillOpacity?: number;
  rx?: number;                 // corner radius, default 6
}>

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

- Scene fades are handled automatically by `<Scene>` (30 frames in, 30 out). Do not manually fade the first/last elements of a scene.
- Stagger child entrances **15–25 frames** apart.
- `drawDuration` for icons: **20–30 frames**. For sketch shapes: **15–25 frames**. For arrows: **12–18 frames**.
- `HandWrittenText.durationFrames` ≈ `text.length * 1.1` (so a 20-char title types over ~22 frames).
- NEVER start an element before its scene's `startFrame + 10` or after `endFrame - 20`.

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

export const durationInFrames =
  TITLE_DUR + SCENE_A_DUR + SCENE_B_DUR + SCENE_C_DUR + END_DUR; // 1260 frames = 42s

export const GeneratedVideo: React.FC = () => {
  // Sequential scene start frames (computed from the constants above).
  const sceneTitleStart = 0;
  const sceneAStart     = sceneTitleStart + TITLE_DUR;
  const sceneBStart     = sceneAStart + SCENE_A_DUR;
  const sceneCStart     = sceneBStart + SCENE_B_DUR;
  const sceneEndStart   = sceneCStart + SCENE_C_DUR;

  return (
    <AbsoluteFill style={{ backgroundColor: '#fafaf5' }}>
      {/* Title scene */}
      <Scene startFrame={sceneTitleStart} endFrame={sceneTitleStart + TITLE_DUR - 1}>
        <SVG>
          <HandWrittenText
            text="Your Title Here"
            x={960} y={440}
            startFrame={sceneTitleStart + 15}
            durationFrames={40}
            fontSize={88}
            textAnchor="middle"
          />
          <HandWrittenText
            text="A crisp one-line subtitle"
            x={960} y={560}
            startFrame={sceneTitleStart + 60}
            durationFrames={35}
            fontSize={44}
            fill={COLORS.orange}
            textAnchor="middle"
            maxWidth={1400}
          />
        </SVG>
      </Scene>

      {/* ... additional scenes ... */}
    </AbsoluteFill>
  );
};
```

**Required exports from GeneratedVideo.tsx:**
1. `export const durationInFrames = <number>;` — total frame count, must be 1800–2700
2. `export const GeneratedVideo: React.FC` — the component

The generator wires Root.tsx to import both, so both MUST be named exports.

## Avoid list — HARD FAILS

- ❌ Inventing hex colors outside the `COLORS` palette
- ❌ Placing any element outside x ∈ [120, 1800] or y ∈ [120, 960]
- ❌ More than 5 **primary focal concepts** in a single `<Scene>` (arrows, connectors, sub-labels don't count — see the "Composition structure" section)
- ❌ Body text larger than 48px, headlines larger than 96px
- ❌ Overlapping text boxes (two HandWrittenText with overlapping bounding boxes at the same frame)
- ❌ Importing from `../pipeline/*` (that directory does not exist)
- ❌ Importing `@remotion/bits`, `remotion-bits`, or any library not listed above
- ❌ Using raw `<div>` layout inside a `<SVG>` (SVG children must be SVG elements or `<g>`)
- ❌ Starting an element before its scene's startFrame
- ❌ Emitting anything outside the single fenced ```tsx code block (no commentary, no headings, no trailing text)

## One-pass quality checklist (run this in your head before emitting)

1. Did you export both `durationInFrames` (number) AND `GeneratedVideo` (component)?
2. Do all scenes have startFrame/endFrame computed from the scene duration constants?
3. Is every element's `x` in [120, 1800] and `y` in [120, 960]?
4. Is every scene ≤ 5 elements?
5. Is every color either `COLORS.xxx` or the paper background `#fafaf5`?
6. Does `durationFrames` for each HandWrittenText match `text.length * 1.1`?
7. Is `durationInFrames` between 1800 and 2700?
8. Are all imports present (no undeclared identifiers)?
9. Is the output a single fenced ```tsx block with no surrounding prose?

If all nine pass, emit the code.
