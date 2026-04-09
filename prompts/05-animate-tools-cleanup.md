# Prompt 5 — Make Animate's `search_skills` tool earn its place

## Context

The Animate role in `src/pipeline/roles/animate.ts` has two tools wired up: `search_skills` and `fetch_skill`. But the system prompt also includes the entire `TIMING_REFERENCE` from `src/pipeline/roles/shared-prompts.ts` directly in the prompt body. The model already has all the timing rules in front of it, so it has no reason to actually call the tools — and we're paying for the tool definitions on every turn for nothing.

This task forces the tools to be useful by **moving timing knowledge OUT of the prompt and INTO the skill registry**, so the model has to fetch what it needs.

## Goal

Animate's prompt should be small and instructional. Specific timing patterns (stagger configs, draw durations per component type, fade-in conventions, scene-pacing presets) live in the skill registry as searchable entries, and the model fetches them on demand.

If after an honest investigation you conclude that the `search_skills`/`fetch_skill` tools genuinely don't add value here even after this restructuring (because there's not enough variety in timing patterns to make searching worthwhile), the alternative path is to *delete* the tools from Animate entirely. Pick one of the two paths and execute it cleanly. Do not leave the tools in place doing nothing.

## Tasks

### Task 1: Audit current state

Read these files end-to-end before making changes:

1. `src/pipeline/roles/animate.ts` — full role
2. `src/pipeline/roles/shared-prompts.ts` — find `TIMING_REFERENCE` and any other timing-related prompt content
3. `src/pipeline/tools/skill-registry.ts` — see what's currently in it and what shape entries take
4. The skill content files referenced by the registry (find them by reading `skill-registry.ts`)

Make a list:
- What timing knowledge currently lives in `TIMING_REFERENCE`?
- What's in the skill registry that overlaps?
- Are the registry entries indexable in a way that would let `search_skills('stagger')` actually return relevant results?

After reading, write a 5-line summary of your findings before making any changes. This is a "look before you leap" task — if the skill registry is empty or near-empty, the right move might be to delete the tools rather than restructure.

### Task 2 (Path A — Restructure): Move timing knowledge into the skill registry

If the skill registry has reasonable content and search infrastructure:

1. Identify chunks of `TIMING_REFERENCE` that represent distinct, lookup-able patterns:
   - Scene pacing presets (slow/medium/fast frame ranges)
   - Stagger between grouped items
   - Component-specific draw durations (SketchBox, SketchArrow, Icon, etc.)
   - Text duration formula
   - Fade-in/out conventions
   - The endFrame-60 deadline rule

2. For each, create a skill registry entry with a clear name, description, and content. Match the existing entry format in `skill-registry.ts`. The names should be searchable — `"timing-stagger-grouped-items"`, `"timing-scene-pacing-presets"`, `"timing-component-draw-durations"`, etc.

3. Slim down `TIMING_REFERENCE` in `shared-prompts.ts`. Keep only the *non-negotiable rules* (scene contiguity, deadline constraint, fade-in respect). Remove the *parameter recipes* (specific frame counts) — those move to the registry.

4. Update Animate's system prompt in `animate.ts` to instruct the model:

```
You have a skill registry of timing patterns. The high-level rules are in this prompt; the specific frame counts and conventions are in the registry.

Before timing each scene, search the registry for relevant patterns:
- "scene pacing" → frame ranges per pacing tier
- "stagger" → spacing between grouped items
- "draw duration <component>" → how long each component type should take
- "text duration" → how to compute text reveal time

Use search_skills first; only call fetch_skill on results you actually need. Do not skip the searches — the registry contains values you cannot guess.
```

5. Make sure the registry entries are dense enough that one fetch returns enough info to make a decision — don't create entries so small that the model needs five fetches to get one rule.

### Task 2 (Path B — Delete): Remove the tools entirely

If the skill registry is too sparse to make Path A worth the effort:

1. Remove `tools: ANIMATE_TOOLS` and the entire tool loop from `runAnimateWithRetry` in `animate.ts`. Replace with a single LLM call.
2. Remove the `ANIMATE_TOOLS` constant and the `searchSkills`/`fetchSkill` imports from `animate.ts`.
3. Keep `TIMING_REFERENCE` in the system prompt as-is — it stays the source of truth.
4. Document the decision in a comment at the top of `animate.ts`:

```
// NOTE: Animate intentionally does not use tools. Timing rules are deterministic enough
// to fit in the system prompt; the search_skills/fetch_skill tools were removed because
// the model never had a reason to call them. If timing patterns grow more varied, revisit.
```

Pick whichever path you committed to and execute it fully. Do not do half of each.

### Task 3: Update Animate's user message

In Animate's first user message, remove or update the line `"Use the search_skills tool to find relevant timing patterns"` to match whichever path you chose. If you took Path B, remove the tool reference. If you took Path A, keep but rephrase to match the new instructions.

### Task 4: Verify the same problem doesn't exist in Polish

While you're in here, briefly check `src/pipeline/roles/polish.ts`. Polish has four tools (`search_skills`, `fetch_skill`, `search_bits`, `fetch_bit`). Confirm whether they're actually being called during real runs:

1. Look at recent log output if available (`out/logs/` or similar).
2. If Polish's tools are also dead weight, do **not** fix them in this task — just add a one-line comment in `polish.ts` noting the suspicion and create a TODO for a future cleanup. Polish is more complex (real component library lookups) and deserves its own focused task.

## Verification

1. `npx tsc --noEmit` passes.
2. Run through Animate's code path mentally with the change applied — confirm there's no dead code (Path B) or no contradictions between prompt instructions and available tools (Path A).
3. If you took Path A: pick one timing pattern you moved to the registry and confirm `search_skills('that pattern')` would find it. If it wouldn't, the registry's search isn't keyed well enough — fix the entry's tags/description.
4. If you took Path B: confirm the system prompt still contains all the timing knowledge the model needs; nothing should have been accidentally removed.

## What NOT to do

- Do not leave the tools wired up if they're not being called. Pick a side.
- Do not move timing knowledge to the registry if the registry doesn't have working search. Path A only works if `search_skills` actually finds things.
- Do not touch Layout or Polish in this task except for the brief Polish audit in Task 4.
- Do not change the validators or the retry logic.

## Why this matters

Tools that aren't called are pure cost — every turn includes their definitions in the prompt. Either make them earn their place (by being the only source of certain knowledge) or remove them. The current half-state is the worst of both worlds: pay for the tool definitions, but the model has no reason to use them, so we get neither the savings of no-tools nor the benefits of real tool use.
