import Anthropic from '@anthropic-ai/sdk';
import type { Script, LayoutSpec, TimedLayoutSpec } from '../types';
import { log } from '../logger';
import type { CostTracker } from '../cost-tracker';
import { TimedLayoutSpecSchema, validate, validateTimingSpec } from '../validation';
import { searchSkills, fetchSkill } from '../tools/skill-registry';
import { TIMING_REFERENCE } from './shared-prompts';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8192;

const ANIMATE_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'search_skills',
    description:
      'Search the animation skills library for timing patterns, stagger techniques, and pacing conventions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query for finding animation timing skills/patterns',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch_skill',
    description: 'Fetch full details and content for a specific animation skill by name.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'The name of the skill to fetch',
        },
      },
      required: ['name'],
    },
  },
];

const SYSTEM_PROMPT = `You are a timing/animation designer for whiteboard-style explainer videos at 30fps.

Given a validated layout spec (elements with positions and sizes) and a script (with pacing info), add timing to every element. You are deciding ONLY when things appear and how long they take — the positions are already decided.

${TIMING_REFERENCE}

You have tools to search for timing patterns and techniques:
- search_skills / fetch_skill: Find animation timing patterns and best practices

After researching relevant patterns, produce the timed layout JSON.

OUTPUT FORMAT — the same layout spec with timing added:
{
  "scenes": [
    {
      "scene_number": 1,
      "heading": "Scene heading",
      "startFrame": 0,
      "endFrame": 400,
      "elements": [
        {
          "id": "s1-title",
          "component": "HandWrittenText",
          "bounds": { "x": 660, "y": 40, "w": 600, "h": 60 },
          "props": { "text": "Title Text", "x": 960, "y": 68, "fontSize": 46 },
          "startFrame": 30,
          "durationFrames": 25
        }
      ]
    }
  ],
  "totalDurationInFrames": 2400
}

RULES:
- Scene frame ranges must be contiguous: Scene1 0-400, Scene2 400-800, etc.
- First element in each scene starts at sceneStartFrame + 30 (after fade-in)
- ALL element animations must complete by endFrame - 60: startFrame + durationFrames <= endFrame - 60
- Use the script's pacing to set scene duration: slow=450-500, medium=350-400, fast=300-350 frames
- Text durationFrames ≈ ceil(text.length / 1.5)
- SketchBox/SketchCircle drawDuration: 18-30 frames
- SketchArrow/SketchLine drawDuration: 10-15 frames
- Icon drawDuration: 40-80 frames
- Stagger between grouped items: 25-35 frames
- Elements should appear in a natural reading order (title first, then content top-to-bottom, left-to-right)
- totalDurationInFrames = last scene's endFrame
- Preserve ALL fields from the input layout (id, component, bounds, props, group) — only ADD startFrame and durationFrames

Output ONLY the JSON as your final response. No explanation, no markdown wrapping.`;

export async function runAnimateWithRetry(
  client: Anthropic,
  layoutSpec: LayoutSpec,
  script: Script,
  costTracker?: CostTracker
): Promise<TimedLayoutSpec> {
  log.animateGenerating(layoutSpec.scenes.length);

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: 'user',
      content: `Here is the layout spec:\n\n${JSON.stringify(layoutSpec, null, 2)}\n\nHere is the script (use the pacing field for each scene):\n\n${JSON.stringify(script, null, 2)}\n\nUse the search_skills tool to find relevant timing patterns, then produce the timed layout JSON. Output ONLY the JSON as your final response.`,
    },
  ];

  let finalText = '';
  const maxTurns = 10;

  for (let turn = 0; turn < maxTurns; turn++) {
    log.roleCallingLLM(MODEL, MAX_TOKENS);
    const start = Date.now();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: ANIMATE_TOOLS,
      messages,
    });

    log.roleLLMResponse(
      response.usage.input_tokens,
      response.usage.output_tokens,
      Date.now() - start
    );
    costTracker?.record('Animate', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

    const toolUseBlocks: Anthropic.Messages.ToolUseBlock[] = [];
    for (const block of response.content) {
      if (block.type === 'text') {
        finalText = block.text;
      } else if (block.type === 'tool_use') {
        toolUseBlocks.push(block);
      }
    }

    if (toolUseBlocks.length === 0) break;

    messages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      let result: unknown;

      switch (toolUse.name) {
        case 'search_skills': {
          const input = toolUse.input as { query: string; limit?: number };
          log.animatorToolCall('search_skills', input.query, turn + 1);
          result = searchSkills(input.query, input.limit);
          log.animatorToolResult('search_skills', Array.isArray(result) ? result.length : 0);
          break;
        }
        case 'fetch_skill': {
          const input = toolUse.input as { name: string };
          log.animatorToolCall('fetch_skill', input.name, turn + 1);
          result = fetchSkill(input.name);
          log.animatorToolResult('fetch_skill', result ? 1 : 0);
          break;
        }
        default:
          result = { error: `Unknown tool: ${toolUse.name}` };
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: 'user', content: toolResults });
  }

  // Parse and validate
  const json = extractJson(finalText);
  let spec: TimedLayoutSpec;
  try {
    const parsed = JSON.parse(json);
    spec = validate(TimedLayoutSpecSchema, parsed, 'TimedLayoutSpec');
    log.roleValidationPassed('TimedLayoutSpec schema');
  } catch (err) {
    // Retry once with parse error feedback
    log.roleRetrying((err as Error).message);
    const retrySpec = await retryWithFeedback(
      client, layoutSpec, script, finalText,
      `The JSON output has validation errors:\n\n${(err as Error).message}\n\nFix the issues and output the corrected JSON. Output ONLY the JSON.`,
      costTracker
    );
    if (retrySpec) return retrySpec;
    throw err;
  }

  const timingError = validateTimingSpec(spec);
  if (timingError) {
    log.animateTimingViolation(timingError);
    const fixed = await retryWithFeedback(
      client, layoutSpec, script, JSON.stringify(spec, null, 2),
      `The timed layout has timing issues:\n\n${timingError}\n\nFix the timing and output the corrected JSON. Output ONLY the JSON.`,
      costTracker
    );
    if (fixed) return fixed;
    // Accept with warnings on second pass
  }

  log.animateResult(spec.totalDurationInFrames, spec.scenes.length);
  return spec;
}

async function retryWithFeedback(
  client: Anthropic,
  layoutSpec: LayoutSpec,
  script: Script,
  originalOutput: string,
  feedback: string,
  costTracker?: CostTracker
): Promise<TimedLayoutSpec | null> {
  log.roleRetryCallLLM(MODEL);
  const start = Date.now();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here is the layout spec:\n\n${JSON.stringify(layoutSpec, null, 2)}\n\nHere is the script:\n\n${JSON.stringify(script, null, 2)}\n\nProduce the timed layout JSON.`,
      },
      { role: 'assistant', content: originalOutput },
      { role: 'user', content: feedback },
    ],
  });

  log.roleLLMResponse(
    response.usage.input_tokens,
    response.usage.output_tokens,
    Date.now() - start
  );
  costTracker?.record('Animate', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const json = extractJson(text);

  try {
    const parsed = JSON.parse(json);
    const spec = validate(TimedLayoutSpecSchema, parsed, 'TimedLayoutSpec');

    const timingError = validateTimingSpec(spec);
    if (timingError) {
      log.animateTimingViolation(timingError);
      // Accept with warnings on retry
    }

    log.animateResult(spec.totalDurationInFrames, spec.scenes.length);
    return spec;
  } catch {
    return null;
  }
}

function extractJson(text: string): string {
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) return codeMatch[1].trim();
  return text.trim();
}
