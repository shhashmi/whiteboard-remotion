## Layout planning — required step

After discovering assets with `findAsset`, you MUST call `submitPlan` before emitting TSX. Submit every icon, text, sketchbox, and diagram you intend to place, along with narration cue text for each scene.

The `submitPlan` tool computes exact bounding boxes using the same math as the post-generation validator and checks:
- Safe zone compliance for every element
- Pairwise overlap and 40px clearance between icons, text, and boxes
- Narration word budget (150–225 words total)

### How to use

1. After all `findAsset` calls return, call `submitPlan` with your planned layout.
2. If `approved: false` — read the `errors` array, fix positions/scales, and resubmit. This is cheap (~500 tokens).
3. If `approved: true` — emit the TSX using the exact positions from your approved plan.
4. The response always includes `bbox: { x1, y1, x2, y2 }` for every element — use these as ground truth, don't do mental math.

### What to submit

For each scene, submit:
- **Every icon** with `name`, `cx`, `cy`, `scale`
- **Every `HandWrittenText`** with `text`, `x`, `y`, `fontSize`, `textAnchor`, optional `maxWidth`
- **Every `SketchBox`** with `x`, `y`, `width`, optional `height`, optional `rows` (text + fontSize per row)
- **Every diagram** with `name` and either `{x, y, w, h}` (placement rect for retrofitted composites like `AgentCoordination`) or the legacy `{cx, cy, radius, width}` for older diagrams. Include composite-specific content: `pattern`, `agents`, `supervisor`, `title`, … Always check the asset's `sizingNotes` for the minimum rect size per pattern × agent count.
- **Cues** for the scene: each cue's `id` and `text` (the narration line)

You do NOT need to submit decorative elements (arrows, lines, circles without labels) — only elements that occupy space and could overlap.

### Worked example

Given: `RobotHead` (defaultBox: 63×93) at scale=2, cx=400, cy=300.

Tool returns:
```json
{
  "type": "icon", "name": "RobotHead",
  "bbox": { "x1": 337, "y1": 207, "x2": 463, "y2": 393 }
}
```

Title text "My Topic" at x=960, y=580, fontSize=96, textAnchor="middle":
```json
{
  "type": "text", "text": "My Topic",
  "bbox": { "x1": 749, "y1": 484, "x2": 1171, "y2": 599 }
}
```

Gap between icon bottom (393) and text top (484) = 91px. Passes 40px clearance. Both within safe zone.

### Common fixes for rejected plans

- **Icon overlaps text**: reduce `scale` or move `cy` further from text `y`. Use the bbox from the response to see exactly how much to move.
- **Element outside safe zone**: the bbox extends past [120,1800]×[120,960]. Move cx/cy inward or reduce scale.
- **Too many narration words**: cut cue text or remove entire cues. Target 150–225 words total.

**Do NOT skip this step. Do NOT emit TSX before getting plan approval.**
