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
