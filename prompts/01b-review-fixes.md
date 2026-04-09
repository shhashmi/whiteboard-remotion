# Prompt 1.5 — Post-review fixes to layout tools and intent resolver

## Context

Prompts 1 and 2 (`01-layout-tools.md`, `02-layer-intent.md`) have been executed. A code review of the resulting diff found three real bugs and two hygiene issues. This prompt fixes all of them in one focused pass.

The files you will touch:
- `src/pipeline/tools/layout-tools.ts`
- `src/pipeline/tools/intent-resolver.ts`
- `src/pipeline/roles/layout.ts`

Do NOT touch any other files. Do NOT refactor anything beyond what this prompt specifies.

## Goal

Close three bugs that will bite us in production, plus two small hygiene items. After this prompt, the tool-and-validator pair should be fully consistent and the Layout safety net should surface disagreements loudly instead of hiding them.

## Tasks

Do the tasks in order. **Stop after each task and show me the diff for that task before proceeding to the next.** Do not batch them.

---

### Task 1 — Add `layer_intent` to the tool input schemas (REAL BUG)

**File:** `src/pipeline/tools/layout-tools.ts`

**Problem:** The `check_bounds` and `check_overlaps` tool schemas declare `id`, `component`, `bounds`, `props`, and `group` on each element — but NOT `layer_intent`. The tool implementations read `layer_intent` (via `isOverlapJustifiedByIntent`), but the schema doesn't advertise it. The model may strip the field when constructing tool inputs because it thinks the schema is exhaustive. If that happens, the overlap tool becomes blind to declared intents and flags legitimate overlaps.

**Fix:** In both `check_bounds` and `check_overlaps` tool definitions inside `LAYOUT_TOOLS`, add `layer_intent` as an optional field on the element schema. The shape must match the one in `src/pipeline/validation.ts` `LayerIntentSchema`:

```ts
layer_intent: {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['stack_above', 'stack_below', 'overlay', 'badge', 'behind', 'attached'],
    },
    target: { type: 'string' },
    reason: { type: 'string' },
  },
  required: ['type', 'target', 'reason'],
},
```

Add it inside the `items.properties` block of each tool's `elements` array schema. Do not add it to the `required` array — it's optional on each element.

**Verification for Task 1:**
- Run `grep -n layer_intent src/pipeline/tools/layout-tools.ts` and show me the output. There should be at least 2 occurrences in the LAYOUT_TOOLS array (one per affected tool).
- Run `npx tsc --noEmit` and paste the output. Must be clean.

**STOP. Show me the diff and the verification output before proceeding to Task 2.**

---

### Task 2 — Fix the stale `check_overlaps` tool description (REAL BUG)

**File:** `src/pipeline/tools/layout-tools.ts`

**Problem:** The `check_overlaps` tool description currently says:

> "Elements in the same group, thin underlines, and content inside containers are automatically excluded."

This describes the OLD heuristics (underline-skip, container-centroid) that prompt 2 deleted from `validation.ts` and replaced with `layer_intent`. The model reads this description and forms its mental model of the tool from it. Misinformation here means the model may not bother declaring `layer_intent` on underlines and labels (thinking the tool will auto-exclude them), and then get confused when the tool flags them as unintended overlaps.

**Fix:** Replace the `check_overlaps` tool description with:

```
Check for unintended overlaps (>30% area) between elements. Elements in the same group, and elements whose layer_intent declares an intentional overlap with their target, are automatically excluded. Call this after drafting a scene's elements to catch unintended collisions. If the tool flags an overlap that you actually want, add a layer_intent field to one of the elements pointing at the other.
```

The last sentence is new and intentional — it tells the model what to DO when the tool flags something, not just what the tool does. This is important because "the tool rejected my layout" is the moment the model is most likely to panic and regenerate from scratch, and we want it to instead add an intent declaration.

**Verification for Task 2:**
- Show me the before/after of the `check_overlaps` description in the diff.
- Confirm the phrase "thin underlines" no longer appears anywhere in `layout-tools.ts`: `grep -n "underline\|centroid\|container.*inside" src/pipeline/tools/layout-tools.ts`. Output should be empty.

**STOP. Show me the diff and verification output before proceeding to Task 3.**

---

### Task 3 — Add the missing `throw` in the Layout safety net (REAL BUG)

**File:** `src/pipeline/roles/layout.ts`

**Problem:** After the tool loop completes, the code currently does:

```ts
// Safety-net validation (no retry loop — tools should have caught issues)
const layoutError = validateLayout(spec, script);
if (layoutError) {
  log.layoutBoundsViolation(layoutError);
}
```

It logs the violation but returns the spec anyway. Downstream stages receive a layout that is known to be broken. This hides bugs where the tool and the validator disagree — instead of failing loudly at the point of disagreement, the pipeline marches forward and fails later with a harder-to-diagnose symptom.

**Fix:** Change that block to throw:

```ts
// Safety-net validation: if this fires, the tool loop claimed success but the validator disagrees.
// This means the tools and the validator are out of sync — a bug that must be fixed, not silenced.
const layoutError = validateLayout(spec, script);
if (layoutError) {
  log.layoutBoundsViolation(layoutError);
  throw new Error(
    `Layout safety-net validation failed — tools and validator disagree:\n${layoutError}`
  );
}
```

Do NOT add a retry loop around this. The whole point is that if this fires, there is a programming bug (not a model mistake), and retrying won't help. Failing loudly gets the bug fixed.

**Verification for Task 3:**
- Run `grep -A3 "Safety-net" src/pipeline/roles/layout.ts` and paste the output. There must be a `throw new Error` within 5 lines of the "Safety-net" comment.
- Run `npx tsc --noEmit` and paste the output. Must be clean.

**STOP. Show me the diff and verification output before proceeding to Task 4.**

---

### Task 4 — Extract `OVERLAP_THRESHOLD` to a shared constant (hygiene)

**Files:** `src/pipeline/tools/intent-resolver.ts` and `src/pipeline/tools/layout-tools.ts` and `src/pipeline/validation.ts`

**Problem:** The magic number `0.3` (the 30% area threshold for flagging an overlap) is duplicated in two places:
- `src/pipeline/tools/layout-tools.ts` in `checkOverlaps`
- `src/pipeline/validation.ts` in `validateLayoutBounds`

If someone tunes the threshold in one place and forgets the other, the tool and validator will silently drift. The safety-net from Task 3 would catch this, but it's better to not have the drift at all.

**Fix:**

1. In `src/pipeline/tools/intent-resolver.ts`, at the top of the file (after the imports / at the top-level scope), add:

   ```ts
   export const OVERLAP_THRESHOLD = 0.3;
   ```

2. In `src/pipeline/tools/layout-tools.ts`, import it: `import { buildElementMap, isOverlapJustifiedByIntent, OVERLAP_THRESHOLD } from './intent-resolver';`. Replace the hardcoded `0.3` in `checkOverlaps` with `OVERLAP_THRESHOLD`.

3. In `src/pipeline/validation.ts`, import it: `import { buildElementMap, isOverlapJustifiedByIntent, OVERLAP_THRESHOLD, type ElementWithIntent } from './tools/intent-resolver';`. Replace the hardcoded `0.3` in `validateLayoutBounds` with `OVERLAP_THRESHOLD`.

**Verification for Task 4:**
- Run `grep -rn "0\.3" src/pipeline/tools/layout-tools.ts src/pipeline/validation.ts`. There should be NO results (the `0.3` literal is gone from both files).
- Run `grep -rn "OVERLAP_THRESHOLD" src/pipeline/`. There should be exactly 3 results: the definition in `intent-resolver.ts`, and the uses in `layout-tools.ts` and `validation.ts`.
- Run `npx tsc --noEmit` and paste the output. Must be clean.

**STOP. Show me the diff and verification output before proceeding to Task 5.**

---

### Task 5 — Add a TODO about cycle detection (hygiene)

**File:** `src/pipeline/tools/intent-resolver.ts`

**Problem:** If the model accidentally generates a cycle in `layer_intent` declarations (a → b → a), the `walksTo` function handles it safely via the `maxDepth` limit — it won't infinite-loop — but it will silently fail to justify legitimate overlaps in the cycle, leading to confusing "overlap flagged" errors the user won't know how to debug.

**Fix:** Add a one-line TODO comment above the `walksTo` function:

```ts
// TODO: Consider adding explicit cycle detection in validateIntents that surfaces
// a clear error when the model builds a cyclic intent chain. Currently cycles are
// silently tolerated by the maxDepth limit but cause confusing downstream flags.
function walksTo(
  ...
```

Do NOT implement cycle detection in this task. Just leave the note. Implementing it is a separate decision about whether to be strict or lenient, and this prompt is focused on bug fixes, not new features.

**Verification for Task 5:**
- Run `grep -B1 "function walksTo" src/pipeline/tools/intent-resolver.ts` and paste the output. The TODO comment must appear immediately above the function.

**STOP. Show me the diff. This is the last task.**

---

## Final verification

After all five tasks are done, run these commands and paste the output:

1. `npx tsc --noEmit` — must be clean.
2. `git diff --stat` — should show changes in exactly these files and no others:
   - `src/pipeline/tools/layout-tools.ts`
   - `src/pipeline/tools/intent-resolver.ts`
   - `src/pipeline/roles/layout.ts`
   - `src/pipeline/validation.ts`
3. `grep -c "OVERLAP_THRESHOLD" src/pipeline/tools/intent-resolver.ts src/pipeline/tools/layout-tools.ts src/pipeline/validation.ts` — should show `1`, `1`, `1`.
4. `grep -c "layer_intent" src/pipeline/tools/layout-tools.ts` — should be ≥ 2 (at least one per affected tool schema, probably more with other references).
5. `grep -c "throw new Error" src/pipeline/roles/layout.ts` — should be ≥ 1.

If any of these fail, stop and tell me which task caused the regression. Do not try to "fix it" autonomously — I want to see what went wrong.

## What NOT to do

- Do not touch any file outside the four listed above.
- Do not refactor `validateLayoutBounds` or `validateIntents`. The only change to `validation.ts` is the import line and the one `0.3` → `OVERLAP_THRESHOLD` substitution.
- Do not implement cycle detection. Leave the TODO.
- Do not "improve" the tool descriptions beyond the specific replacement in Task 2.
- Do not batch tasks. Stop after each one and show the diff. I mean it — if you finish all five tasks and dump one giant diff, I have to review five changes at once and that's how bugs slip through.
- Do not add new tests, new logging, or new types. Bug fixes only.
- Do not change the `measureText` approximation multipliers or add wrapping behavior. That's a separate conversation.
- Do not change any prompt text in `shared-prompts.ts` or `layout.ts`. The prompt layer is unchanged in this task.

## Why this matters

Three of these are real bugs: the model might strip `layer_intent` when calling tools (Task 1), the stale description misleads the model into not using `layer_intent` when it should (Task 2), and the silent safety-net hides bug-class disagreements between the tool and the validator (Task 3). Tasks 4 and 5 are small hygiene improvements that prevent future versions of the same bug.

The fixes are small — total change should be well under 100 lines across four files. The reason this is worth a dedicated prompt instead of "just edit it yourself" is because there are five distinct changes and getting them all right without regressing anything is the kind of thing that benefits from a structured pass with checkpoints.
