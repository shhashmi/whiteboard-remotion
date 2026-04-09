# Prompt 4 — Prevent Polish validators from regressing each other

## Context

The Polish stage in `src/pipeline/roles/polish.ts` runs three sequential validators after generating .tsx code (lines 275–329):

1. `tryCompile` — TypeScript compile check
2. `validateTsxTiming` + `validateTsxBounds` — AST analysis
3. `validateVisuals` — render keyframes and vision-critique

Each validator has its own `retryWithFeedback` call, and each retry regenerates the *entire* .tsx file from scratch. This creates a problem: when fixing an AST issue, the model produces a new file that might break visual checks the previous attempt would have passed. When fixing a visual issue, the new file might break compile or AST checks. Validators end up fighting each other across retries, and you can chase your tail forever.

This task fixes the regression problem by giving each retry awareness of *what was previously passing*, so the model knows what to preserve.

## Goal

When retrying for one validator's issues, include the previously-passing validators' state as "preserve this" context, so the model doesn't accidentally break working parts.

## Tasks

### Task 1: Track passing validators across retry boundaries

In `polish.ts`, before the validation chain begins, add a small state object:

```ts
type PolishValidationState = {
  compilePassed: boolean;
  astPassed: boolean;
  visualPassed: boolean;
  lastVisualCritique: string | null;  // text of the last vision critique that passed
  preservedAstFindings: string | null;  // summary of AST checks that passed
};

const state: PolishValidationState = {
  compilePassed: false,
  astPassed: false,
  visualPassed: false,
  lastVisualCritique: null,
  preservedAstFindings: null,
};
```

Update each validator's success path to set the corresponding flag and record any positive findings. For example, after a successful AST validation, store a one-line summary like `"Previous version passed AST timing/bounds checks for ${currentTsxAnalysis.sceneCount} scenes"`.

### Task 2: Pass preserved-state context into retries

Modify the `retryWithFeedback` function in `polish.ts` to accept an optional `preserveContext` parameter:

```ts
async function retryWithFeedback(
  client: Anthropic,
  timedLayout: TimedLayoutSpec,
  visualDirection: VisualDirection,
  originalCode: string,
  feedback: string,
  costTracker?: CostTracker,
  preserveContext?: string,  // NEW
): Promise<AnimatorOutput | null>
```

When `preserveContext` is provided, prepend it to the feedback message inside the retry call:

```
${preserveContext}

NEW ISSUE TO FIX:
${feedback}
```

### Task 3: Build the preserve context at each retry site

Each of the three retry call sites in `polish.ts` (compile retry, AST retry, visual retry) should pass a `preserveContext` string built from `state`. Examples:

**At the AST retry site** (after compile already passed):
```ts
const preserveContext = `IMPORTANT: The previous version PASSED these checks. Your fix must preserve them:
- TypeScript compilation: passed
${state.preservedAstFindings ? `- AST checks: ${state.preservedAstFindings}` : ''}
${state.lastVisualCritique ? `- Visual review: previously noted "${state.lastVisualCritique.slice(0, 200)}"` : ''}

Do not change anything that is not directly related to the new issue below.`;
```

**At the visual retry site** (after compile and AST both passed):
```ts
const preserveContext = `IMPORTANT: The previous version PASSED TypeScript compilation AND AST validation (timing, bounds, structure). Your fix must preserve those.

The visual issues below are usually fixable with small adjustments — moving elements, changing colors, resizing. Do not restructure the scenes or change timing unless specifically called out.`;
```

**At the compile retry site** (first failure, nothing passed yet):
```ts
const preserveContext = ''; // nothing to preserve yet
```

Pass `preserveContext` as the new argument to each `retryWithFeedback` call.

### Task 4: Re-run earlier validators after each fix

After a successful retry of a *later* validator, re-run the *earlier* validators on the new code to confirm nothing regressed. For example, after a visual retry, re-run `tryCompile` and the AST checks. If they fail, log a regression warning and decide:

- If the regression is small (compile error only), do one more compile retry pass.
- If multiple validators regress, log a warning and return the current best version with a `regressionWarning` field added to the returned `AnimatorOutput`.

Update the `AnimatorOutput` type in `polish.ts` to include the optional warning:

```ts
export interface AnimatorOutput {
  code: string;
  durationInFrames: number;
  sceneCount: number;
  regressionWarning?: string;  // NEW
}
```

The warning surfaces in logs but doesn't block the pipeline — the user can decide whether to re-run.

### Task 5: Logging

Add to `src/pipeline/logger.ts`:

```ts
polishValidatorRegression(validator: string, after: string)
// e.g. "Polish: AST checks regressed after visual retry"
```

Call it from the regression-detection code in Task 4.

## Verification

1. `npx tsc --noEmit` passes.
2. Read each retry call site in `polish.ts` and confirm each one passes a contextually-appropriate `preserveContext`.
3. Confirm the regression check actually runs the earlier validators after each later retry — it's easy to skip this by accident.
4. Confirm `regressionWarning` propagates through the rest of the pipeline (look at where `runPolishWithRetry`'s return value is consumed in `src/pipeline/generate.ts` and surface the warning in the final logs).

## What NOT to do

- Do not run all three validators on every retry from scratch. The order matters: compile is cheap, AST is medium, visual is expensive (it renders frames). Re-run earlier validators after a later retry, but don't re-run later validators after an earlier retry — they'll naturally run on the next pass through the loop.
- Do not increase the retry count. The point is to make existing retries more effective, not to add more.
- Do not change the validators themselves. This task is about retry orchestration only.
- Do not add regression handling to Layout or Animate. Those stages have JSON output and a different failure mode; this task is Polish-specific.

## Why this matters

The pipeline currently has a hidden tail-eating problem: each Polish validator fix can silently break what previous validators approved, and the loop never notices until the next run-through. Users see "AST passed → visual passed → ... but somehow the final code has issues." This task makes regressions visible and gives the model the context it needs to avoid them in the first place.
