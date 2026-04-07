import Anthropic from '@anthropic-ai/sdk';
import type { Script, VisualDirection, AssetGap } from '../types';
import { VisualDirectionSchema, validate } from '../validation';
import { searchAssets } from '../tools/asset-registry';
import { log } from '../logger';
import type { CostTracker } from '../cost-tracker';
import * as fs from 'fs';
import * as path from 'path';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

const SYSTEM_PROMPT = `You are the art director for an animated video.
Given a script, decide how each scene should look.

You have access to a search_assets tool to find images and icons from our library. Use it to find visual assets that match your creative vision.

The Animator has two component libraries available:
1. Whiteboard primitives — hand-drawn SVG boxes, arrows, icons (sketch aesthetic)
2. remotion-bits — polished HTML animation components (animated text with word/character reveals, typewriter effects, animated counters, code blocks with syntax highlighting, gradient backgrounds, staggered motion)

You can suggest visual styles in the "mood" and "composition" fields:
- "clean and modern" or "polished" → Animator will prefer remotion-bits components
- "hand-drawn sketch" or "whiteboard" → Animator will prefer whiteboard primitives
- You can mix styles: "Use animated text reveal for the title, sketch boxes for the diagram below"
- Composition hints like "Use animated text reveal", "Show animated counter from 0 to 1000", or "Display code with syntax highlighting" guide component choice

Your job:
- Assign colors to concepts and keep them consistent across all scenes. If "resolver" is blue in scene 2, it must be blue in scene 4.
- Choose compositions that serve the content. A sequence of steps might be a vertical chain, a hub-and-spoke, or a timeline — pick what tells the story best.
- Vary visual density and composition across scenes to create rhythm. Don't make every scene a grid of cards.
- Use visual metaphors when they help. "DNS delegation" could be a relay race, a chain of messengers, or a tree of authority.
- The notes_for_director field in the script contains the scriptwriter's creative hints — honor them.

ASSET CATEGORIES: technology, people, abstract, business, flow, structure

PARAMETRIC ASSETS — some assets are configurable and can represent many concepts:
- CycleArrow: search for "loop", "cycle", "iteration" — configure segments and broken props
- FlowChain: search for "process", "pipeline", "steps" — provide step labels in composition
- TreeDiagram: search for "hierarchy", "organization", "tree"
- NetworkGraph: search for "network", "connections", "graph"
- GridIcon: search for "matrix", "grid", "table"
- PieChart/LineGraph/ProgressBar: search for data visualization needs

When using a parametric asset, include configuration hints in your composition description.
Example: "CycleArrow with 3 segments showing observe-think-act loop, scale=2, centered"
Example: "FlowChain with steps=['Parse','Validate','Execute'], horizontal, blue"

When searching for assets:
- If search returns quality "none" or "weak", try broader terms first.
- If still no match after broadening, use a geometric fallback: set the fallback field with shape (circle/box/arrow-chain/icon-cluster), label, and color instead of image_id.
- A labeled shape with the right color is always better than an irrelevant icon.

Available colors: orange, blue, purple, green, yellow, red, gray1, gray2, outline

The composition field should describe the visual layout in natural language, e.g.:
"Large robot icon centered at top. Three cards below arranged horizontally, each with a colored border, number, icon, title and description."

Output ONLY valid JSON matching this schema:
{
  "global_style": {
    "color_assignments": { "concept": "color_name" },
    "accent_color": "orange",
    "mood": "clean and technical"
  },
  "scenes": [
    {
      "scene_number": 1,
      "composition": "Description of visual layout",
      "imagery": [
        {
          "concept": "what it represents",
          "image_id": "id-from-search OR omit if using fallback",
          "role_in_scene": "hero image|supporting icon|decorative",
          "suggested_scale": "small|medium|large|hero",
          "fallback": { "type": "geometric", "shape": "circle|box", "label": "text", "color": "blue" }
        }
      ],
      "color_usage": { "element": "color" },
      "density": "sparse|medium|dense",
      "emphasis": "what to emphasize"
    }
  ]
}`;

const SEARCH_TOOL: Anthropic.Messages.Tool = {
  name: 'search_assets',
  description:
    'Search the image and icon library for visual assets. Returns matching icons/images with relevance scores.',
  input_schema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search query for finding visual assets',
      },
      category: {
        type: 'string',
        description: 'Filter by category: technology, people, abstract, business, flow, structure',
      },
      limit: {
        type: 'number',
        description: 'Max results to return (default 5)',
      },
    },
    required: ['query'],
  },
};

export async function runArtDirectorWithRetry(
  client: Anthropic,
  script: Script,
  costTracker?: CostTracker
): Promise<VisualDirection> {
  try {
    return await runArtDirector(client, script, costTracker);
  } catch (error) {
    log.roleRetrying((error as Error).message);
    log.roleRetryCallLLM(MODEL);
    const retryStart = Date.now();

    const retryResponse = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the script:\n\n${JSON.stringify(script, null, 2)}\n\nCreate the visual direction. Do NOT use the search tool — use geometric fallbacks for all imagery. The previous attempt failed with: ${(error as Error).message}\n\nOutput ONLY the corrected JSON.`,
        },
      ],
    });

    log.roleLLMResponse(
      retryResponse.usage.input_tokens,
      retryResponse.usage.output_tokens,
      Date.now() - retryStart
    );
    costTracker?.record('Art Director', MODEL, retryResponse.usage.input_tokens, retryResponse.usage.output_tokens, Date.now() - retryStart);

    const text = retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
    const json = extractJson(text);
    const result = validate(VisualDirectionSchema, json, 'VisualDirection (retry)');
    log.roleValidationPassed('VisualDirection schema (retry, no tool use)');
    return result;
  }
}

async function runArtDirector(
  client: Anthropic,
  script: Script,
  costTracker?: CostTracker
): Promise<VisualDirection> {
  const assetGaps: AssetGap[] = [];
  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: 'user',
      content: `Here is the script for the video:\n\n${JSON.stringify(script, null, 2)}\n\nCreate the visual direction. Use the search_assets tool to find appropriate icons and images for each scene. After searching, produce the final VisualDirection JSON.`,
    },
  ];

  let finalText = '';
  const maxTurns = 15;

  for (let turn = 0; turn < maxTurns; turn++) {
    log.roleCallingLLM(MODEL, MAX_TOKENS);
    const start = Date.now();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: [SEARCH_TOOL],
      messages,
    });

    log.roleLLMResponse(
      response.usage.input_tokens,
      response.usage.output_tokens,
      Date.now() - start
    );
    costTracker?.record('Art Director', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

    const toolUseBlocks: Anthropic.Messages.ToolUseBlock[] = [];
    for (const block of response.content) {
      if (block.type === 'text') {
        finalText = block.text;
      } else if (block.type === 'tool_use') {
        toolUseBlocks.push(block);
      }
    }

    if (toolUseBlocks.length === 0) {
      if (turn === 0) {
        log.artDirectorSearching('(no searches needed)', turn + 1);
      }
      break;
    }

    messages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      if (toolUse.name === 'search_assets') {
        const input = toolUse.input as { query: string; category?: string; limit?: number };

        log.toolCallDetail('search_assets', input as Record<string, unknown>, turn + 1);
        log.artDirectorSearching(input.query, turn + 1);
        const result = searchAssets(input.query, {
          category: input.category,
          limit: input.limit,
        });
        log.toolResultDetail('search_assets', result);

        const topMatch = result.results.length > 0 ? result.results[0].name : null;
        const topScore = result.results.length > 0 ? result.results[0].relevance_score : 0;
        log.artDirectorSearchResult(input.query, result.quality, topMatch, topScore);

        if (result.quality === 'none') {
          log.artDirectorAssetGap(input.query);
          assetGaps.push({
            query: input.query,
            concept: input.query,
            context: `Art director search during video "${script.title}"`,
            timestamp: new Date().toISOString(),
          });
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  // Save asset gaps
  if (assetGaps.length > 0) {
    const gapsPath = path.resolve(process.cwd(), 'out', 'asset-gaps.jsonl');
    const gapsDir = path.dirname(gapsPath);
    if (!fs.existsSync(gapsDir)) fs.mkdirSync(gapsDir, { recursive: true });
    fs.appendFileSync(gapsPath, assetGaps.map((g) => JSON.stringify(g)).join('\n') + '\n');
  }

  const json = extractJson(finalText);
  const result = validate(VisualDirectionSchema, json, 'VisualDirection');
  log.roleValidationPassed('VisualDirection schema');
  return result;
}

function extractJson(text: string): unknown {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}
