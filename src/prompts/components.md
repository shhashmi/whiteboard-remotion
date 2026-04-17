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

// Static image with whiteboard-style border and fade-in. HTML layer — place OUTSIDE <SVG>,
// inside <Scene>, BEFORE the <SVG> block so SVG annotations draw on top.
// Requires `staticFile` from 'remotion'.
SketchImage: React.FC<{
  src: string;              // staticFile('generated/C3.png') — no 'public/' prefix
  x: number; y: number;     // top-left position (safe zone applies)
  width: number;
  height: number;
  startFrame: number;        // placeholder {0}, overridden by <Timed>
  durationFrames?: number;   // default 20
  direction?: 'up'|'down'|'left'|'right'|'scale'|'none'; // default 'scale'
  borderColor?: string;      // default COLORS.outline
  borderWidth?: number;      // default 3
  shadow?: boolean;          // default true
  rotation?: number;         // slight tilt in degrees, default 0
  objectFit?: 'contain'|'cover'; // default 'contain'
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

### Icons and diagrams (discovered via tools)

**Do NOT guess icon or diagram names.** Call the `findAsset` tool to discover what exists, then import what it returns from the path in `entry.importPath` (e.g. `../shared/icons` for icons, `../shared/diagrams/<Name>` for diagrams).

**Discovery policy:**

1. Before emitting JSX for any diagram or icon, call `findAsset({ concept, kind: 'icon' })` or `findAsset({ concept, kind: 'diagram' })`.
2. **Batch calls in one turn.** If a scene needs 3 focal concepts, emit 3 `findAsset` calls in the same assistant turn — not sequentially.
3. Each match's `entry` contains the full `importPath` and `propsSchema`. Treat that as authoritative; do NOT follow up with `getAsset`.
4. If `gap: true`, compose from primitives (`SketchBox`, `SketchCircle`, `HandWrittenText`, `SketchArrow`) instead of inventing a component name.

**Common icon signature** — almost all icons take this shape:

```ts
{ cx: number; cy: number; scale?: number; startFrame: number; drawDuration: number; color?: string }
```

Some icons additionally take `shirtColor`/`hairColor` (people), `fill`/`stroke` (shapes), or no color. Icons default to sensible colors — you rarely need to pass `color`.

**When in doubt about an icon:** prefer `SketchCircle` + `HandWrittenText` label. A clean circle with a label beats a broken custom icon.

### Image assets (discovered via `findAsset`)

For realistic/editorial illustrations (environments, metaphors, UI mocks), use **image assets** instead of SVG primitives. These are pre-generated PNGs in `public/generated/`.

**Discovery:** call `findAsset({ concept: '...', kind: 'image' })`. Image entries have `filePath` (not `importPath`) and no `propsSchema`.

**Rendering:** convert `filePath` to a `staticFile` call by stripping the `public/` prefix, then use `SketchImage`:

```tsx
// findAsset returned: { filePath: 'public/generated/C3.png', ... }
<Timed cue="s2-scene">
  <SketchImage
    src={staticFile('generated/C3.png')}
    x={300} y={200} width={600} height={450}
    startFrame={0}
  />
</Timed>
```

**Placement rules:**
- `SketchImage` is an HTML element — place it **outside** `<SVG>`, inside `<Scene>`.
- Place it **before** the `<SVG>` block so SVG annotations (arrows, labels, text) draw on top.
- Safe zone still applies: `x`, `y`, `x+width`, `y+height` must all be within bounds.
- Use images for scenes, environments, metaphors. Use SVG primitives for diagrams, flowcharts, abstract concepts.

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
