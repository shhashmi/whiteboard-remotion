import Anthropic from '@anthropic-ai/sdk';
import type { Script, VisualDirection, LayoutSpec } from '../types';
import { log } from '../logger';
import type { CostTracker } from '../cost-tracker';
import { LayoutSpecSchema, validate, validateLayout } from '../validation';
import { COMPONENT_API, LAYOUT_CONVENTIONS } from './shared-prompts';
import {
  LAYOUT_TOOLS,
  measureText,
  checkBounds,
  checkOverlaps,
  suggestGrid,
} from '../tools/layout-tools';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 16384;

const SYSTEM_PROMPT = `You are a layout designer for whiteboard-style animated explainer videos on a 1920×1080 canvas.

Given a script and visual direction, produce a JSON layout spec that positions every visual element on the canvas. You are deciding ONLY where things go — not when they animate or how the code looks.

${COMPONENT_API}

${LAYOUT_CONVENTIONS}

For each scene, decide:
1. Which components to use for each piece of content (text, boxes, icons, arrows, etc.)
2. Where to place each element (x, y, width, height) within the 1920×1080 canvas
3. What colors and visual properties each element needs
4. How to group related elements (e.g. "cards", "steps") for later stagger animation

You have tools to validate your work as you go. The recommended workflow is:

1. For each scene, plan which components you need.
2. Call \`measure_text\` for every text element to get real dimensions before placing it.
3. Use \`suggest_grid\` when you have 2+ similar items (cards, steps) to lay out — do not compute grid math yourself.
4. After drafting a scene's elements, call \`check_bounds\` and \`check_overlaps\` on that scene.
5. Fix any issues the tools report and re-check until clean.
6. Only output the final JSON when all scenes pass \`check_bounds\` and \`check_overlaps\` with no issues.

DO NOT skip the tool calls. Layouts that look fine to you often fail validation downstream — the tools catch this earlier.

OUTPUT FORMAT — a JSON object with this structure:
{
  "scenes": [
    {
      "scene_number": 1,
      "heading": "Scene heading text",
      "elements": [
        {
          "id": "s1-title",
          "component": "HandWrittenText",
          "bounds": { "x": 660, "y": 40, "w": 600, "h": 60 },
          "props": { "text": "Title Text", "x": 960, "y": 68, "fontSize": 46, "fill": "COLORS.outline", "fontWeight": 700, "textAnchor": "middle" }
        },
        {
          "id": "s1-underline",
          "component": "SketchLine",
          "bounds": { "x": 380, "y": 78, "w": 1160, "h": 8 },
          "props": { "x1": 380, "y1": 82, "x2": 1540, "y2": 82, "color": "COLORS.orange", "strokeWidth": 3 },
          "layer_intent": { "type": "attached", "target": "s1-title", "reason": "underline decoration beneath title text" }
        },
        {
          "id": "s1-card-0",
          "component": "SketchBox",
          "bounds": { "x": 160, "y": 120, "w": 450, "h": 650 },
          "props": { "x": 160, "y": 120, "width": 450, "height": 650, "stroke": "COLORS.blue", "strokeWidth": 3, "fill": "#eff6ff", "fillOpacity": 0.6 },
          "group": "cards"
        }
      ]
    }
  ]
}

RULES:
- Every element must have a bounding box (bounds) that fits within 0,0 → 1920,1080
- HandWrittenText auto-wraps when maxWidth is set — ensure bounds.w accommodates readable text at the chosen fontSize
- Use appropriate fontSize: titles 42-48, headings 30-36, body 20-26, labels 18-22
- For icons, the bounds should reflect the icon's visual footprint (based on scale)
- Use "group" to tag elements that belong together (e.g. all cards, all steps in a sequence)
- Props should match the component API exactly — use the same prop names
- For color props, use "COLORS.xxx" string references (they'll be resolved to actual colors in code)
- Include ALL text from the script — don't skip content
- Follow the art director's composition, density, and color_usage guidance

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

The reason field is required and must briefly justify the overlap. Do not use layer_intent to silence false positives — only use it for genuinely intentional overlaps. Most elements will NOT need layer_intent.

Output ONLY the JSON. No explanation, no markdown wrapping.`;

export async function runLayoutWithRetry(
  client: Anthropic,
  script: Script,
  visualDirection: VisualDirection,
  costTracker?: CostTracker
): Promise<LayoutSpec> {
  log.layoutGenerating(script.scenes.length);

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: 'user',
      content: `Here is the script:\n\n${JSON.stringify(script, null, 2)}\n\nHere is the visual direction:\n\n${JSON.stringify(visualDirection, null, 2)}\n\nProduce the layout JSON spec. Use the tools to measure text, check bounds, check overlaps, and compute grids as you go. Output ONLY the final JSON once all checks pass.`,
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
      tools: LAYOUT_TOOLS,
      messages,
    });

    log.roleLLMResponse(
      response.usage.input_tokens,
      response.usage.output_tokens,
      Date.now() - start
    );
    costTracker?.record('Layout', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

    if (response.stop_reason === 'max_tokens') {
      log.roleRetrying(`Response truncated (hit ${MAX_TOKENS} token limit)`);
    }

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
        case 'measure_text': {
          const input = toolUse.input as { text: string; fontSize: number; fontWeight?: number };
          log.animatorToolCall('measure_text', input.text.slice(0, 40), turn + 1);
          result = measureText(input.text, input.fontSize, input.fontWeight);
          log.animatorToolResult('measure_text', 1);
          break;
        }
        case 'check_bounds': {
          const input = toolUse.input as { elements: Array<{ id: string; component: string; bounds: { x: number; y: number; w: number; h: number }; props: Record<string, unknown>; group?: string }> };
          log.animatorToolCall('check_bounds', `${input.elements.length} elements`, turn + 1);
          result = checkBounds(input.elements);
          log.animatorToolResult('check_bounds', Array.isArray(result) ? result.length : 0);
          break;
        }
        case 'check_overlaps': {
          const input = toolUse.input as { elements: Array<{ id: string; component: string; bounds: { x: number; y: number; w: number; h: number }; props: Record<string, unknown>; group?: string }> };
          log.animatorToolCall('check_overlaps', `${input.elements.length} elements`, turn + 1);
          result = checkOverlaps(input.elements);
          log.animatorToolResult('check_overlaps', Array.isArray(result) ? result.length : 0);
          break;
        }
        case 'suggest_grid': {
          const input = toolUse.input as { count: number; region: { x: number; y: number; w: number; h: number }; gap?: number };
          log.animatorToolCall('suggest_grid', `${input.count} items`, turn + 1);
          result = suggestGrid(input);
          log.animatorToolResult('suggest_grid', Array.isArray(result) ? result.length : 0);
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

  // Parse and validate final output
  const json = extractJson(finalText);
  let spec: LayoutSpec;
  try {
    const parsed = JSON.parse(json);
    spec = validate(LayoutSpecSchema, parsed, 'LayoutSpec');
  } catch (err) {
    throw new Error(`Layout generation failed: ${(err as Error).message}`);
  }

  // Safety-net validation: if this fires, the tool loop claimed success but the validator disagrees.
  // This means the tools and the validator are out of sync — a bug that must be fixed, not silenced.
  const layoutError = validateLayout(spec, script);
  if (layoutError) {
    log.layoutBoundsViolation(layoutError);
    throw new Error(
      `Layout safety-net validation failed — tools and validator disagree:\n${layoutError}`
    );
  }

  log.roleValidationPassed('LayoutSpec schema + bounds');
  const totalElements = spec.scenes.reduce((sum, s) => sum + s.elements.length, 0);
  log.layoutResult(spec.scenes.length, totalElements);
  return spec;
}

function extractJson(text: string): string {
  // Try closed code fence first
  const closed = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (closed) return closed[1].trim();
  // Handle truncated response: strip opening fence if present
  const open = text.match(/```(?:json)?\s*([\s\S]*)/);
  if (open) return open[1].trim();
  return text.trim();
}
