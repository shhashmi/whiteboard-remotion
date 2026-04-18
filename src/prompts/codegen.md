## Complete file template — START FROM THIS

```tsx
import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import {
  SVG,
  Scene,
  HandWrittenText,
  SketchBox,
  SketchCircle,
  SketchArrow,
  SketchLine,
  SketchImage,
  CheckMark,
  Timed,
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
- ❌ Placing `SketchImage` inside `<SVG>` (it is an HTML element — place it outside `<SVG>`, inside `<Scene>`)
- ❌ Including `public/` prefix in `staticFile` paths (`staticFile('generated/C3.png')` not `staticFile('public/generated/C3.png')`)
- ❌ Icon bbox overlapping a `HandWrittenText` or `SketchBox` bbox within the same scene (compute icon bbox = `defaultBox.width*scale × defaultBox.height*scale` centered at `cx,cy`; check ≥ 40 px clearance)
- ❌ Placing an icon inside a `SketchBox`'s bounding rectangle (e.g. `SpeechBubble` at `cx=280, cy=360` inside a box starting at `x=140, y=280, width=740`)
- ❌ Two diagram instances whose placement rects overlap (e.g. two `AgentCoordination` each with `{x:200, w:1200}` — their rects both span x=200..1400 and overlap). Retrofitted composites use `{x, y, w, h}`; each rect must be non-overlapping and meet the composite's minimum per `sizingNotes`. Non-retrofitted diagrams still use legacy `{cx, cy, radius}`.
- ❌ A diagram whose computed bbox extends outside the safe zone [120,1800]×[120,960]
- ❌ Emitting anything outside the single fenced ```tsx code block (no commentary, no headings, no trailing text)

## One-pass quality checklist (run this in your head before emitting)

1. Did you export `durationInFrames` (placeholder number), `GeneratedVideo`, AND `narrationCues`?
2. Is every `<Scene startFrame={0} endFrame={0}>` using literal `{0}` placeholders?
3. Does every narratable element have a `cue` (via `<Timed>`) or a `cue` field on its `SketchBox` row?
4. Does every `cue` id used in the tree appear exactly once in `narrationCues`, and vice versa?
5. Are cues within a scene listed in `narrationCues` in the order they are spoken?
6. Is each cue's `text` 4–15 words, plain prose, no SSML / markdown / special chars?
7. Is every element's FULL BOUNDING BOX within [120,1800] × [120,960]? (Not just the center — the `submitPlan` response showed you the bbox.)
8. Is every scene ≤ 5 primary focal concepts?
9. Is every color either `COLORS.xxx` or the paper background `#fafaf5`?
10. Does `durationFrames` for each HandWrittenText match `text.length * 1.1`?
11. Are all imports present (including `Timed` from `../shared/components`)?
12. Is the output a single fenced ```tsx block with no surrounding prose?
13. Any `HandWrittenText` positioned inside a `SketchBox`'s bounding rectangle? Convert to `SketchBox.rows`.
14. Is every `SketchImage` placed outside `<SVG>`, inside `<Scene>`, before the `<SVG>` block, and wrapped in `<Timed>`?
15. Did you call `submitPlan` and get `approved: true` before emitting TSX?

If all fifteen pass, emit the code.
