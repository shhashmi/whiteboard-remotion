import Anthropic from '@anthropic-ai/sdk';
import type { StoryOutline, Script } from '../types';
import { ScriptSchema, validate } from '../validation';
import { log } from '../logger';
import type { CostTracker } from '../cost-tracker';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

const SYSTEM_PROMPT = `You are a scriptwriter for animated explainer videos. Given a story outline, write the complete script — every word that will appear on screen.

Rules:
- Each line of text must be under 40 characters (it will be rendered at readable font sizes on a 1920x1080 canvas).
- Use consistent terminology. If you call it "recursive resolver" in scene 2, don't call it "DNS resolver" in scene 4 without introduction.
- Add transition language between scenes so they flow as a narrative, not a slide deck.
- The notes_for_director field is where you communicate creative intent to the visual team — "this should feel tense", "the contrast is the point", "build up to the reveal".
- You decide the content structure (list, comparison, sequence, etc.) based on what best serves the information. Don't default to bullet lists.
- Create 3-7 scenes total. Some story beats map to one scene, complex beats may span two.
- Every scene must reference at least one beat_id from the story outline.
- The terminology record should map short terms to their canonical form.

Content type options for each scene:
- "single-statement": One big statement { text }
- "text-with-elaboration": Main point + detail lines { main, detail[] }
- "labeled-items": Named items with descriptions { items: [{label, description}] }
- "sequence": Ordered steps { steps: [{label, detail?}] }
- "comparison": Multi-dimensional comparison { dimensions[], subjects: [{name, values[]}] }
- "two-sides": Side by side { left: {title, points[]}, right: {title, points[]} }
- "key-value-pairs": Key-value listing { pairs: [{key, value}] }
- "formula": Parts combining into result { parts[], result }

Output ONLY valid JSON matching this schema:
{
  "title": "string",
  "scenes": [
    {
      "scene_number": 1,
      "beat_ids": ["beat-1"],
      "scene_type": "title|explanation|comparison|sequence|showcase|summary",
      "heading": "Scene Heading",
      "content": { "type": "...", ... },
      "transition_in": "optional connective from previous",
      "transition_out": "optional setup for next",
      "pacing": "slow|medium|fast",
      "notes_for_director": "optional creative hints"
    }
  ],
  "terminology": { "short_term": "canonical form" }
}`;

export async function runScriptwriterWithRetry(
  client: Anthropic,
  storyOutline: StoryOutline,
  costTracker?: CostTracker
): Promise<Script> {
  log.roleCallingLLM(MODEL, MAX_TOKENS);
  const start = Date.now();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here is the story outline:\n\n${JSON.stringify(storyOutline, null, 2)}\n\nWrite the complete script.`,
      },
    ],
  });

  log.roleLLMResponse(
    response.usage.input_tokens,
    response.usage.output_tokens,
    Date.now() - start
  );
  costTracker?.record('Scriptwriter', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const json = extractJson(text);
    const result = validate(ScriptSchema, json, 'Script');
    log.roleValidationPassed('Script schema');
    return result;
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
          content: `Here is the story outline:\n\n${JSON.stringify(storyOutline, null, 2)}\n\nWrite the complete script.`,
        },
        {
          role: 'assistant',
          content: 'I need to fix my output. The error was: ' + (error as Error).message,
        },
        {
          role: 'user',
          content: 'Please output the corrected JSON. Output ONLY valid JSON, nothing else.',
        },
      ],
    });

    log.roleLLMResponse(
      retryResponse.usage.input_tokens,
      retryResponse.usage.output_tokens,
      Date.now() - retryStart
    );
    costTracker?.record('Scriptwriter', MODEL, retryResponse.usage.input_tokens, retryResponse.usage.output_tokens, Date.now() - retryStart);

    const retryText = retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
    const json = extractJson(retryText);
    const result = validate(ScriptSchema, json, 'Script (retry)');
    log.roleValidationPassed('Script schema (retry)');
    return result;
  }
}

function extractJson(text: string): unknown {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}
