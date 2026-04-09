# Prompt 2 — Replace overlap heuristics with declared layer intent

## Context

The layout validator in `src/pipeline/validation.ts` has accumulated several hardcoded special cases to avoid flagging legitimate overlaps as errors. Look at these specifically:

- Lines 192–194: skip overlap if either element is a thin SketchLine (the "underline" heuristic)
- Lines 197–200: skip if one element is a container (SketchBox/SketchCircle) and the other's centroid is inside it
- Lines 437–456 (`validateLayoutStructure`): the connector z-order rule

Each special case is a confession that the model is doing something legitimate that the validator can't recognize without help. And for everything legitimate the validator *doesn't* yet have a rule for — stacked cards, badges on corners, speech bubble tails, overlays, character-in-front-of-background — the validator flags it and forces a retry.

The fix is to let the model **declare its intent** in structured form, and have the validator respect declared intents instead of inferring them from heuristics. This was discussed in an earlier design conversation; the goal of this task is to actually implement it.

If you're unsure about the design rationale, read the earlier prompt at `prompts/01-layout-tools.md` for context on the broader pipeline.

## Goal

Add a `layer_intent` field to layout elements that lets the model declare *why* an element overlaps another. The validator (and the `checkOverlaps` tool from prompt 1, if it exists) should allow any overlap that has a matching declared intent, and reject any overlap that doesn't.

## Tasks

### Task 1: Extend the LayoutElement type

In `src/pipeline/types.ts`, find the layout element type (it should be referenced by `LayoutSpec`). Add an optional `layer_intent` field:

```ts
type LayerIntent = {
  type: 'stack_above' | 'stack_below' | 'overlay' | 'badge' | 'behind' | 'attached';
  target: string;  // id of the element this intent refers to
  reason: string;  // brief justification, required to prevent rubber-stamping
};
```

The field is optional on the element. Update any related Zod schema in `src/pipeline/validation.ts` (look for `LayoutSpecSchema` and the element schema it uses) to include the new optional field.

The `reason` field is **required when `layer_intent` is present**. This is deliberate: requiring a one-line justification forces the model to think about whether the overlap is intentional, instead of slapping `layer_intent` on everything to silence the validator.

### Task 2: Implement intent-aware overlap checking

In `src/pipeline/validation.ts`, in `validateLayoutBounds`, replace the existing skip-conditions (lines 192–200) with a single check: "is there a layer_intent on either element that targets the other (or transitively connects them through a chain of intents)?"

The logic:

1. For overlapping pair `(a, b)`:
   - If `a.layer_intent?.target === b.id` → allowed (a declared intent toward b).
   - If `b.layer_intent?.target === a.id` → allowed.
   - If both are in the same `group` → allowed (existing behavior, keep it).
   - Walk the intent chain transitively: if `a.layer_intent.target === c.id` and `c.layer_intent.target === b.id`, that's a valid chain (handles stacked-card cases where adjacent cards reference the previous one).
   - Otherwise → flag as before.

2. Implement the transitive walk as a small helper. Build a map `id → element` for the scene, then for each declared intent walk up to 5 steps. Don't go deeper — if you need a 6-deep stack, something is wrong.

3. Per-intent validation rules — add a new function `validateIntents(elements)`:
   - `stack_above` / `stack_below`: target must exist; the elements should overlap (otherwise the intent is meaningless); at least 20px of the lower element must be visible (otherwise the stack reads as a glitch). The "visible edge" check is: bounding box of target minus bounding box of self should leave at least 20px on at least one side.
   - `badge`: target must exist; this element's bounding box must overlap the *corner region* of target (within 40px of any corner).
   - `behind`: target must exist; this element should extend past target on at least two sides (otherwise it doesn't read as "behind").
   - `overlay`: target must exist; this element should cover at least 50% of target (otherwise it's not really an overlay).
   - `attached`: target must exist; bounding boxes should touch or overlap.

   Return an array of intent violations alongside the existing bounds/structure issues.

4. Wire `validateIntents` into `validateLayout`'s aggregator (alongside `validateLayoutBounds`, `validateLayoutStructure`, `validateLayoutCompleteness`).

### Task 3: Delete the heuristic special cases

Now that intents are first-class:

- Remove the underline-skip lines from `validateLayoutBounds` (lines 192–194). The model should declare `layer_intent: { type: 'attached', target: 'title-id', reason: 'underline below title' }` instead. But first, check the system prompts in `src/pipeline/roles/layout.ts` and `src/pipeline/roles/shared-prompts.ts` to make sure the new intent vocabulary is documented (see Task 4) — do this delete *after* Task 4 is done.
- Remove the container-centroid trick (lines 197–200). Containment is already handled by the existing `group` mechanism; the model can group icon+container together.
- The connector z-order check at lines 437–456 stays — it's about ordering, not overlaps. Don't touch it.

### Task 4: Update the Layout system prompt to document the intent vocabulary

In `src/pipeline/roles/layout.ts`, extend the `SYSTEM_PROMPT` (or `LAYOUT_CONVENTIONS` in `shared-prompts.ts`, wherever the rules live) with a new section explaining `layer_intent`. Use this exact text as a starting point and adapt to the existing prompt style:

```
LAYER INTENT — declaring intentional overlaps

When two elements overlap on purpose, declare it on the element that "sits on top" using the layer_intent field:

  { "id": "...", "bounds": {...}, "props": {...},
    "layer_intent": { "type": "...", "target": "<id>", "reason": "<one-line>" } }

Intent types:
- stack_above: this element sits visibly above target with offset (use for fanned card stacks)
- stack_below: this element sits visibly below target with offset
- overlay: this element covers most of target (use for modals, captions over images)
- badge: this element is a small accent at a corner of target (use for status dots, "new" tags)
- behind: this element extends behind target as a backdrop (use for spotlights, glow regions)
- attached: this element is physically bound to target (use for underlines under titles, labels on arrows)

The reason field is required and must briefly justify the overlap. Do not use layer_intent to silence false positives — only use it for genuinely intentional overlaps.
```

Add a similar update wherever the layout JSON output format is shown to the model (the example block in `SYSTEM_PROMPT`).

### Task 5: Update the layout-tools `checkOverlaps` if it exists

If prompt 1 has been completed and `src/pipeline/tools/layout-tools.ts` exists with a `checkOverlaps` function, update it to use the same intent-walking logic. Extract the intent-walking logic from `validation.ts` into a small helper that both files can import (e.g. put it in a new file `src/pipeline/tools/intent-resolver.ts` and import from both places).

If prompt 1 has *not* been completed yet, skip this task and add a TODO comment noting that `checkOverlaps` will need the same update later.

## Verification

After making changes:

1. Run `npx tsc --noEmit` and confirm zero TypeScript errors.
2. Find an existing layout JSON in `out/` (look for `out/3-layout-spec.json` or similar) and manually verify the schema still parses it — the new field is optional, so existing data should still validate.
3. Read the updated system prompt and confirm the intent vocabulary is documented in a place the model will actually see (system prompt body, not a comment).
4. Confirm the deleted heuristics (underline-skip, container-centroid) are gone and the validator no longer references them.

## What NOT to do

- Do not make `layer_intent` required. Most elements don't need it. Only elements that intentionally overlap another do.
- Do not invent more intent types beyond the six listed. If you find a case that doesn't fit, add a TODO and discuss before extending the vocabulary — it's deliberately small.
- Do not change the `group` field. It still serves a different purpose (grouping for stagger animation).
- Do not change Animate or Polish stages. They should pass through `layer_intent` as part of the element data without needing to understand it.

## Why this matters

The current validator generates false-positive failures on legitimate creative patterns, forcing retries on layouts that were actually fine. Each false positive is a full Layout regeneration. After this change, the model can express stacked cards, badges, overlays, and backdrop elements without fighting the validator — and the validator can be stricter about *unintentional* overlaps because the legitimate cases have an escape hatch.
