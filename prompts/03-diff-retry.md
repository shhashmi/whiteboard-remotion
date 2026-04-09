# Prompt 3 — Add diff-based retries for Layout and Animate

## Context

When validation fails in `src/pipeline/roles/layout.ts` or `src/pipeline/roles/animate.ts`, the current retry mechanism (`retryWithFeedback`) regenerates the *entire* output from scratch with the previous attempt and an error list as context. For a 6-scene layout where one scene has a problem, the model has to re-emit all six scenes — paying full token cost and risking regressions in the scenes that were already fine.

This task adds a "diff retry" mode for cases where the validator reports a small number of issues (≤3 affected elements) on otherwise-good output. Instead of regenerating everything, ask the model to return only the corrected elements.

This task is independent of prompts 1 and 2. It works whether or not Layout has tools.

## Goal

When validation reports a small number of issues, the retry should send the model:
1. The original output (assistant message in history),
2. A targeted user message: "The following elements have issues: [list]. Return only the corrected versions of these elements as a JSON array. Do not regenerate anything else."

The pipeline then merges the patched elements back into the original spec, re-validates, and proceeds.

## Tasks

### Task 1: Define the diff-retry helper

Create `src/pipeline/diff-retry.ts` exporting two functions:

**`extractAffectedIds(validationError: string): string[]`**

- Parse the validator error string and extract element IDs.
- Element IDs in the codebase look like `s1-title`, `s3-card-0`, etc. — they appear in error messages like `Scene 3, s3-card-0: out of bounds (...)`.
- Return a deduplicated array of IDs.
- If parsing fails or finds nothing, return an empty array — the caller will fall back to full regeneration.
- Use a regex like `/[a-zA-Z]\d*-[a-zA-Z0-9-]+/g` and dedupe.

**`mergeElementPatches<T extends { scenes: { elements: { id: string }[] }[] }>(original: T, patches: Array<{ id: string } & Record<string, unknown>>): T`**

- Deep-clone `original`.
- For each patch object, find the element with the matching `id` across all scenes and replace its non-id fields with the patch's fields. Use `Object.assign` style merging — patch fields overwrite, original fields fill in any gaps.
- If a patch's id doesn't match any existing element, log a warning to console and skip it (do not throw).
- Return the merged spec.

### Task 2: Add diff-retry to Layout

In `src/pipeline/roles/layout.ts`, in the retry path (whether the existing post-hoc loop or the tool-loop tail check from prompt 1), wrap the existing `retryWithFeedback`-style call with this logic:

```ts
const affectedIds = extractAffectedIds(validationError);
const useDiffRetry = affectedIds.length > 0 && affectedIds.length <= 3;

if (useDiffRetry) {
  // Send a targeted patch request
  const patchPrompt = `The following elements have validation issues:

${validationError}

Return ONLY the corrected versions of these elements as a JSON array:
${JSON.stringify(affectedIds)}

Format your response as a JSON object: { "patches": [ { "id": "...", "bounds": {...}, "props": {...}, ... }, ... ] }
Include all fields each element needs (component, bounds, props, group?, layer_intent?). Do not include any other elements. Do not regenerate the full layout.`;

  // Make the LLM call with original output as assistant history
  // Parse { patches: [...] } from response
  // Call mergeElementPatches(originalSpec, patches)
  // Re-run validation on the merged spec
  // If still failing, fall through to full retry
}
```

If diff-retry succeeds (re-validation passes), return the merged spec. If it fails or the number of affected elements is too large, fall through to the existing full-regeneration retry as the fallback.

The cost record for the diff retry should still go through `costTracker.record('Layout', ...)` — same role, just smaller payload.

### Task 3: Add diff-retry to Animate

Apply the same pattern in `src/pipeline/roles/animate.ts`. Animate's elements have `startFrame` and `durationFrames` instead of just bounds, but the merge logic is identical (the patches are partial element objects, the merge is shallow). Use the same `extractAffectedIds` and `mergeElementPatches` helpers — they're generic enough.

Animate's validator is `validateTimingSpec`. Pass its error string into `extractAffectedIds`.

### Task 4: Logging

In `src/pipeline/logger.ts`, add one new log function:

```ts
diffRetryAttempt(role: string, affectedCount: number, totalElements: number)
```

It should log something like `"Layout: diff retry — patching 2/47 elements"`. Match the existing log style (look at `roleRetrying` for tone).

Call it in both Layout and Animate when entering the diff-retry path.

## Verification

1. `npx tsc --noEmit` passes with zero errors.
2. Trace the new code paths by reading them: confirm that on a small validation failure, the diff-retry is attempted *first*; on a large failure or a diff-retry failure, the existing full-regeneration retry is the fallback.
3. Confirm `mergeElementPatches` deep-clones — it should not mutate the original spec.
4. Find `out/3-layout-spec.json` if it exists and manually verify that `extractAffectedIds` would find the element IDs in a sample error message.

## What NOT to do

- Do not apply diff-retry to Polish. Polish output is .tsx code, not JSON; element-level patching of TSX is much harder and out of scope for this task.
- Do not skip the fallback to full regeneration. The diff-retry is an *optimization*, not a replacement. If it fails, the existing path must still work.
- Do not increase the affected-count threshold above 3 without testing. The whole point is that it's a small surgical change; if half the layout is broken, regenerating everything is correct.
- Do not change the validators themselves. This task is purely about how retries are structured.

## Why this matters

A typical Layout failure affects 1–2 elements out of 30–50. Regenerating the entire layout to fix one bounds violation is wasteful and risks introducing new violations elsewhere. Diff retry sends an order-of-magnitude smaller payload and asks for an order-of-magnitude smaller response. Combined with prompt 1 (Layout tools), this should bring Layout retry costs down dramatically.
