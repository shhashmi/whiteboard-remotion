import Anthropic from '@anthropic-ai/sdk';
import type { StoryOutline } from '../types';
import { StoryOutlineSchema, validate } from '../validation';
import { log } from '../logger';
import type { CostTracker } from '../cost-tracker';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2048;

const SYSTEM_PROMPT = `You are a story author for animated explainer videos. Given a raw idea, create a narrative outline.

Your job is ONLY the story — the arc, the beats, the emotional journey.
Do NOT think about visuals, layouts, or animations. Think about:
- What question does this video answer?
- What does the viewer feel at each point?
- How does each beat connect to the others?
- What's the hook and what's the payoff?

A good story outline makes a bad video impossible and a great video likely.
A bad one makes even perfect animation feel hollow.

Rules:
- Create 3-8 story beats depending on complexity.
- Each beat must have a clear role: hook, setup, exploration, turn, deepening, climax, resolution, or coda.
- At least one beat must be a hook (opening) and one must be a resolution or coda (closing).
- The key_idea for each beat should be a single clear sentence.
- The connects_to array should reference earlier beat IDs to show narrative threads.
- Beat IDs should be "beat-1", "beat-2", etc.

Output ONLY valid JSON matching this schema:
{
  "title": "string",
  "logline": "one-sentence summary",
  "audience": "who is this for",
  "arc": { "type": "string", "description": "string" },
  "beats": [
    {
      "id": "beat-1",
      "role": "hook|setup|exploration|turn|deepening|climax|resolution|coda",
      "intent": "what this beat should accomplish",
      "key_idea": "the core idea of this beat",
      "emotional_note": "the feeling at this point",
      "connects_to": ["beat-id"]
    }
  ]
}`;

export async function runAuthorWithRetry(
  client: Anthropic,
  userMessage: string,
  costTracker?: CostTracker
): Promise<StoryOutline> {
  log.roleCallingLLM(MODEL, MAX_TOKENS);
  const start = Date.now();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  log.roleLLMResponse(
    response.usage.input_tokens,
    response.usage.output_tokens,
    Date.now() - start
  );
  costTracker?.record('Author', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const json = extractJson(text);
    const result = validate(StoryOutlineSchema, json, 'StoryOutline');
    log.roleValidationPassed('StoryOutline schema');
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
        { role: 'user', content: userMessage },
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
    costTracker?.record('Author', MODEL, retryResponse.usage.input_tokens, retryResponse.usage.output_tokens, Date.now() - retryStart);

    const retryText = retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
    const json = extractJson(retryText);
    const result = validate(StoryOutlineSchema, json, 'StoryOutline (retry)');
    log.roleValidationPassed('StoryOutline schema (retry)');
    return result;
  }
}

function extractJson(text: string): unknown {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}
