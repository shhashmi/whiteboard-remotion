---
name: whiteboard-video
description: Generate a Remotion whiteboard-style animated explainer video as a single TSX file. Uses a pre-built component library of hand-drawn primitives, ~90 icons, and motion patterns. Load when asked to create, edit, or refine a Remotion video for this project.
---

<!-- Prompt source of truth lives in src/prompts/. This file is the Claude Code skill
     entrypoint. When invoked via the CLI (/whiteboard-video), Claude reads this file.
     The automated pipeline (src/generate.ts) reads src/prompts/ directly. -->

Read and follow the instructions in these files (in order):

1. `src/prompts/system.md` — canvas spec, composition rules, safe zone, sizing, colors
2. `src/prompts/components.md` — component catalog, icon/diagram discovery, motions
3. `src/prompts/timing.md` — timing conventions, cue-based narration sync, narration export
4. `src/prompts/planning.md` — layout planning with `submitPlan` tool (required before emitting TSX)
5. `src/prompts/codegen.md` — TSX template, required exports, avoid list, quality checklist
