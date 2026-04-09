---
name: option-b-refactor
description: Context on the Option B single-shot generator refactor replacing the 7-role pipeline
type: project
---

Single-shot generator (src/generate.ts) replaces 7-role pipeline via Option B (Agent Skills pattern). SKILL.md is at .claude/skills/whiteboard-video/SKILL.md. Legacy code preserved on `legacy` branch and in docs/legacy/.

Key constraints from SKILL.md that the model may violate:
- Max 5 elements per scene (model routinely generates 13–19 in complex scenes)
- 3–5 scenes (model generated 6 in first run — acceptable by maintainer judgment)
- durationInFrames must be 1800–2700
- All x ∈ [120, 1800], y ∈ [120, 960]
- COLORS.* palette only

**Why:** The 5-element rule was designed for whiteboard clarity. The model ignores it when depicting complex diagrams. This is a known skill enforcement gap — the generator has no post-generation layout validator.

**How to apply:** When reviewing generated TSX, count elements per scene and flag violations of the 5-element cap. The generator itself is correct; the issue is prompt compliance.
