# Prompt 1 — Convert Layout into a tool-using agent

## Context

The Layout role at `src/pipeline/roles/layout.ts` currently works as a single-shot generator with post-hoc validation:

1. LLM generates a full layout JSON for all scenes in one call.
2. `validateLayout()` from `src/pipeline/validation.ts` checks bounds, structure, and completeness.
3. On failure, the entire layout is regenerated from scratch with the error list pasted in as feedback.
4. This loops up to 3 times.

This is the most expensive loop in the pipeline. Each retry pays the full system prompt + script + visual direction + previous attempt + feedback, then regenerates the entire layout for all scenes — even the scenes that were already correct. We routinely see 2–3 retries before convergence.

The fix is to convert Layout into a multi-turn tool-using agent (matching the pattern in `src/pipeline/roles/animate.ts` and `src/pipeline/roles/polish.ts`), giving it tools that let it check its work *during* drafting instead of *after*. Look at `animate.ts` lines 98–183 for the canonical tool loop pattern in this codebase — the new Layout should match that shape exactly.

## Goal

Layout should be able to call tools to measure text dimensions, check collisions, check bounds, and request grid positions, then converge on a valid layout inside one conversation — typically with zero retries because the tools enforce the rules incrementally.

## Tasks

### Task 1: Create the layout tools module

Create a new file `src/pipeline/tools/layout-tools.ts` that exports four pure functions. None of these should call an LLM — they are deterministic helpers.

**`measureText(text: string, fontSize: number, fontWeight?: number | string): { w: number; h: number }`**

- Use `opentype.js` if it's already a dependency; otherwise use a simple character-width approximation: width = text.length * fontSize * 0.55 for regular weight, * 0.6 for bold (700+). Height = fontSize * 1.2.
- Check `package.json` first to see if opentype.js is available. If not, do not add a new dependency — use the approximation.
- The approximation is fine for our purposes; the model just needs ground-truth-ish numbers instead of guessing wildly.

**`checkBounds(elements: LayoutElement[]): BoundsIssue[]`**

- For each element, check that `bounds.x >= 0`, `bounds.y >= 0`, `bounds.x + bounds.w <= 1920`, `bounds.y + bounds.h <= 1080`.
- Return an array of `{ id: string, issue: string }` for any violations.
- This is the same logic that already exists in `validateLayoutBounds` in `src/pipeline/validation.ts` lines 168–177 — extract and reuse.

**`checkOverlaps(elements: LayoutElement[]): OverlapIssue[]`**

- Lift the overlap detection logic from `validateLayoutBounds` lines 181–216 (the nested loop with the >30% area heuristic).
- Keep the existing escape hatches: same `group`, underline-skip, container-centroid-inside.
- Return an array of `{ a: string, b: string, overlapPercent: number }` for unintended overlaps.

**`suggestGrid(input: { count: number; region: { x: number; y: number; w: number; h: number }; gap?: number }): Array<{ x: number; y: number; w: number; h: number }>`**

- Compute a grid that fits `count` items into `region` with sensible row/column counts.
- For 2 items → 1×2, 3 → 1×3, 4 → 2×2, 5–6 → 2×3, 7–9 → 3×3, etc. Pick whatever feels natural for the count.
- Default `gap` to 24px.
- Return the array of slot rects.

Define a local `LayoutElement` type in this file that matches the shape used in `src/pipeline/types.ts` (component, bounds, props, optional group). Don't import from validation.ts to avoid a circular dep — you can re-declare the minimal shape locally.

### Task 2: Wire the tools into the Anthropic SDK format

Still in `src/pipeline/tools/layout-tools.ts`, also export an array `LAYOUT_TOOLS: Anthropic.Messages.Tool[]` with the four tool definitions in the format Animate uses (see `animate.ts` lines 12–46 for the schema shape).

Each tool needs `name`, `description`, and `input_schema`. Be specific in the descriptions about *when* the model should call each one — e.g. "Call this BEFORE placing any text element to know its real width and height." The descriptions are how the model learns when to use the tool.

### Task 3: Rewrite `runLayoutWithRetry` as a tool-loop agent

In `src/pipeline/roles/layout.ts`, replace the existing implementation. The new version should:

1. Take the same inputs and return the same `LayoutSpec` type (don't change the public signature — downstream code depends on it).
2. Use the multi-turn tool loop pattern from `animate.ts` lines 116–183. Copy that structure carefully — the message-history threading, the `tool_use` block extraction, the `tool_result` block construction, the break condition when `toolUseBlocks.length === 0`.
3. Set `maxTurns = 15` (Layout might call tools more than Animate because there are more scenes to check).
4. Update the system prompt to instruct the model to use the tools proactively. Keep the existing `COMPONENT_API` and `LAYOUT_CONVENTIONS` includes from `shared-prompts.ts`. Add a section:

```
You have tools to validate your work as you go. The recommended workflow is:

1. For each scene, plan which components you need.
2. Call `measureText` for every text element to get real dimensions before placing it.
3. Use `suggestGrid` when you have 2+ similar items (cards, steps) to lay out — do not compute grid math yourself.
4. After drafting a scene's elements, call `checkBounds` and `checkOverlaps` on that scene.
5. Fix any issues the tools report and re-check until clean.
6. Only output the final JSON when all scenes pass `checkBounds` and `checkOverlaps` with no issues.

DO NOT skip the tool calls. Layouts that look fine to you often fail validation downstream — the tools catch this earlier.
```

5. After the tool loop terminates, parse the final JSON and return it. **Remove the post-hoc `validateLayout` retry loop entirely** — the tools have already enforced everything. Keep one final `validateLayout` call as a safety net that *throws* if violations remain, but do not loop on it.

### Task 4: Add minimal tool-call logging

In `src/pipeline/logger.ts`, the existing `log.animatorToolCall` function takes a tool name, query/input, and turn number. Reuse it for layout tool calls — pass `'layout-tools'` or similar in the existing format. Don't invent a new logger method unless the existing pattern doesn't fit.

## Verification

After making changes:

1. Run `npx tsc --noEmit` from the project root and confirm zero TypeScript errors. Fix any that come up.
2. Verify the public exports from `layout.ts` are unchanged: `runLayoutWithRetry` should have the same signature.
3. Read through the new `runLayoutWithRetry` and confirm the message-threading matches `animate.ts` exactly — this is the most error-prone part. The pattern is: append assistant message with response.content, then append user message with tool_results array.
4. Confirm `validateLayout` is no longer called inside a retry loop.

## What NOT to do

- Do not modify `src/pipeline/validation.ts` in this task. The post-hoc validators stay where they are; they'll be cleaned up in a separate task.
- Do not change Animate or Polish.
- Do not add new npm dependencies. If opentype.js isn't already in `package.json`, use the approximation.
- Do not change the `LayoutSpec` type or the JSON output schema. Downstream code depends on the exact shape.
- Do not delete `validateLayout` itself — just stop calling it in a loop.

## Why this matters

Each Layout retry currently costs ~one full generation (system prompt + script + visual direction + entire layout output). With 2–3 retries typical, Layout is the most expensive stage in the pipeline. Tool calls add a few extra turns inside one conversation, but each turn is small (just a tool call + result), so total cost drops substantially. More importantly, the model can iterate locally instead of throwing away correct work to fix one violation.
