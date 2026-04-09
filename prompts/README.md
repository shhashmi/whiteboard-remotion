# Pipeline cost-reduction prompts for Claude Code

Five focused prompts to fix the multi-retry cost problem in the Layout → Animate → Polish pipeline. Each prompt is self-contained — point Claude Code at one prompt, let it run, verify, then move to the next.

## Recommended order

| # | Prompt | What it changes | Expected impact |
|---|---|---|---|
| 1 | `01-layout-tools.md` | Converts Layout into a tool-using agent (measureText, checkBounds, checkOverlaps, suggestGrid) | **Largest.** Layout retries should drop from 2–3 to ~0 |
| 2 | `02-layer-intent.md` | Replaces hardcoded overlap heuristics with declared `layer_intent` field | Eliminates a class of false-positive failures across all stages |
| 3 | `03-diff-retry.md` | Adds patch-style retries for Layout and Animate when ≤3 elements are affected | Cuts retry payload size by ~10x when retries do happen |
| 4 | `04-polish-anti-regression.md` | Makes Polish validators preserve each other's passing state across retries | Stops the tail-eating where fixing one validator breaks another |
| 5 | `05-animate-tools-cleanup.md` | Either moves timing knowledge into the skill registry or deletes Animate's dead tools | Smaller cost win, but removes confusion about tool intent |

Do them in order. Prompts 2 and 3 reference work that prompt 1 leaves in the codebase (the `layout-tools.ts` file), so running them out of order will require extra coordination.

## How to use each prompt

In Claude Code, from the project root:

```
claude
> /read prompts/01-layout-tools.md
> Please execute this prompt step by step, verifying after each task.
```

Or paste the prompt body directly into the chat. Each prompt is written to be standalone — Claude Code should not need extra context beyond reading the codebase itself.

After each prompt completes:

1. Run `npx tsc --noEmit` to confirm the build is clean.
2. Run one end-to-end pipeline generation against a known-good test idea (whatever you normally test with).
3. Compare the cost tracker output against a baseline run before the change.
4. Commit before moving to the next prompt — you want to be able to bisect if something regresses.

## Verification mindset

Each prompt has a "Verification" section. Take it seriously — Claude Code will sometimes claim a task is done when it has only partially completed it. Read the actual diff, not just the summary.

The most common failure mode for prompt 1 specifically: Claude Code rewrites `runLayoutWithRetry` but accidentally drops the post-hoc validation safety net entirely, or wires the tool loop incorrectly so messages aren't threaded properly. Diff against `animate.ts` to confirm the patterns match.

## What's NOT in these prompts

Things deliberately left for later:

- **Polish tool audit.** Prompt 5 mentions checking whether Polish's four tools are actually used, but defers any cleanup. Polish is more complex than Animate and deserves its own pass.
- **Replacing the regex AST analyzer with a real parser.** `tsx-analyzer.ts` uses string matching for what should be Babel parsing. Worth fixing eventually but it's working "well enough" right now and is risky to swap mid-flight.
- **Better skill registry indexing.** Prompt 5 notes the registry's search may be too weak; doesn't fix the search infrastructure itself.
- **Incremental scene generation.** A future optimization where Layout produces one scene at a time instead of all scenes in one shot. Bigger architectural change, defer until prompts 1–4 are stable.
