import Anthropic from '@anthropic-ai/sdk';
import type { Script, VisualDirection, LayoutSpec } from '../types';
import { log } from '../logger';
import type { CostTracker } from '../cost-tracker';
import { LayoutSpecSchema, validate, validateLayoutBounds } from '../validation';
import { COMPONENT_API, LAYOUT_CONVENTIONS } from './shared-prompts';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8192;

const SYSTEM_PROMPT = `You are a layout designer for whiteboard-style animated explainer videos on a 1920×1080 canvas.

Given a script and visual direction, produce a JSON layout spec that positions every visual element on the canvas. You are deciding ONLY where things go — not when they animate or how the code looks.

${COMPONENT_API}

${LAYOUT_CONVENTIONS}

For each scene, decide:
1. Which components to use for each piece of content (text, boxes, icons, arrows, etc.)
2. Where to place each element (x, y, width, height) within the 1920×1080 canvas
3. What colors and visual properties each element needs
4. How to group related elements (e.g. "cards", "steps") for later stagger animation

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
          "props": { "x1": 380, "y1": 82, "x2": 1540, "y2": 82, "color": "COLORS.orange", "strokeWidth": 3 }
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
- Text must be under 40 characters per line
- Use appropriate fontSize: titles 42-48, headings 30-36, body 20-26, labels 18-22
- For icons, the bounds should reflect the icon's visual footprint (based on scale)
- Use "group" to tag elements that belong together (e.g. all cards, all steps in a sequence)
- Props should match the component API exactly — use the same prop names
- For color props, use "COLORS.xxx" string references (they'll be resolved to actual colors in code)
- Include ALL text from the script — don't skip content
- Follow the art director's composition, density, and color_usage guidance

Output ONLY the JSON. No explanation, no markdown wrapping.`;

export async function runLayoutWithRetry(
  client: Anthropic,
  script: Script,
  visualDirection: VisualDirection,
  costTracker?: CostTracker
): Promise<LayoutSpec> {
  log.layoutGenerating(script.scenes.length);

  const userMessage = `Here is the script:\n\n${JSON.stringify(script, null, 2)}\n\nHere is the visual direction:\n\n${JSON.stringify(visualDirection, null, 2)}\n\nProduce the layout JSON spec. Output ONLY the JSON.`;

  let lastSpec: LayoutSpec | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const messages: Anthropic.Messages.MessageParam[] = [
      { role: 'user', content: userMessage },
    ];

    if (attempt > 0 && lastSpec) {
      // Retry with feedback
      const boundsError = validateLayoutBounds(lastSpec);
      messages.push(
        { role: 'assistant', content: JSON.stringify(lastSpec, null, 2) },
        { role: 'user', content: `The layout has issues:\n\n${boundsError}\n\nFix the issues and output the corrected JSON. Output ONLY the JSON.` }
      );
      log.roleRetrying(boundsError?.split('\n')[0] || 'Layout validation failed');
    }

    log.roleCallingLLM(MODEL, MAX_TOKENS);
    const start = Date.now();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages,
    });

    log.roleLLMResponse(
      response.usage.input_tokens,
      response.usage.output_tokens,
      Date.now() - start
    );
    costTracker?.record('Layout', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const json = extractJson(text);

    let spec: LayoutSpec;
    try {
      const parsed = JSON.parse(json);
      spec = validate(LayoutSpecSchema, parsed, 'LayoutSpec');
    } catch (err) {
      log.roleRetrying((err as Error).message);
      continue;
    }

    const boundsError = validateLayoutBounds(spec);
    if (boundsError) {
      log.layoutBoundsViolation(boundsError);
      lastSpec = spec;
      continue;
    }

    const totalElements = spec.scenes.reduce((sum, s) => sum + s.elements.length, 0);
    log.layoutResult(spec.scenes.length, totalElements);
    return spec;
  }

  // If we exhausted retries, return the last spec with warnings
  if (lastSpec) {
    const totalElements = lastSpec.scenes.reduce((sum, s) => sum + s.elements.length, 0);
    log.layoutResult(totalElements, totalElements);
    return lastSpec;
  }

  throw new Error('Layout generation failed after 3 attempts');
}

function extractJson(text: string): string {
  // Try to extract JSON from markdown code fence
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) return codeMatch[1].trim();
  return text.trim();
}
