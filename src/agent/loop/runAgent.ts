import { ChatAnthropic } from '@langchain/anthropic';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { AGENT_TOOLS, AGENT_TOOLS_LC } from '../tools';

export const MAX_TOOL_ITERATIONS = 8;

export interface AgentUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreation: number;
}

export interface RunAgentOptions {
  model: ChatAnthropic;
  systemPrompt: string;
  userPrompt: string;
  priorMessages?: BaseMessage[];
  onIteration?: (info: { iteration: number; toolCalls: number; elapsedMs: number }) => void;
}

export interface RunAgentResult {
  finalMessage: AIMessage;
  finalText: string;
  messages: BaseMessage[];
  usage: AgentUsage;
  iterations: number;
  toolCallCount: number;
}

function accumulateUsage(usage: AgentUsage, meta: AIMessage['usage_metadata']) {
  if (!meta) return;
  usage.input += meta.input_tokens ?? 0;
  usage.output += meta.output_tokens ?? 0;
  const details = (meta as unknown as { input_token_details?: Record<string, number> })
    .input_token_details ?? {};
  usage.cacheRead += details.cache_read ?? (details as any).cache_read_input_tokens ?? 0;
  usage.cacheCreation += details.cache_creation ?? (details as any).cache_creation_input_tokens ?? 0;
}

function extractText(msg: AIMessage): string {
  if (typeof msg.content === 'string') return msg.content;
  return (msg.content as Array<{ type: string; text?: string }>)
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('');
}

export async function runAgent(opts: RunAgentOptions): Promise<RunAgentResult> {
  const bound = opts.model.bindTools(AGENT_TOOLS_LC);
  const systemMsg = new SystemMessage({
    content: [
      {
        type: 'text' as const,
        text: opts.systemPrompt,
        cache_control: { type: 'ephemeral' as const },
      },
    ],
  });
  const messages: BaseMessage[] = [
    systemMsg,
    ...(opts.priorMessages ?? [new HumanMessage(opts.userPrompt)]),
  ];
  const usage: AgentUsage = { input: 0, output: 0, cacheRead: 0, cacheCreation: 0 };
  let toolCallCount = 0;

  for (let iteration = 1; iteration <= MAX_TOOL_ITERATIONS; iteration++) {
    const started = Date.now();
    const response = (await bound.invoke(messages)) as AIMessage;
    accumulateUsage(usage, response.usage_metadata);
    messages.push(response);

    const calls = response.tool_calls ?? [];
    opts.onIteration?.({
      iteration,
      toolCalls: calls.length,
      elapsedMs: Date.now() - started,
    });

    if (calls.length === 0) {
      return {
        finalMessage: response,
        finalText: extractText(response),
        messages: messages.slice(1), // strip system msg for retry replay
        usage,
        iterations: iteration,
        toolCallCount,
      };
    }

    for (const call of calls) {
      toolCallCount++;
      const def = AGENT_TOOLS.find((t) => t.name === call.name);
      if (!def) {
        messages.push(
          new ToolMessage({
            tool_call_id: call.id!,
            content: JSON.stringify({ error: `Unknown tool: ${call.name}` }),
          }),
        );
        continue;
      }
      const parsed = def.schema.safeParse(call.args);
      if (!parsed.success) {
        messages.push(
          new ToolMessage({
            tool_call_id: call.id!,
            content: JSON.stringify({ error: 'Invalid input', issues: parsed.error.issues }),
          }),
        );
        continue;
      }
      try {
        const result = await def.handler(parsed.data);
        messages.push(
          new ToolMessage({
            tool_call_id: call.id!,
            content: JSON.stringify(result),
          }),
        );
      } catch (err) {
        messages.push(
          new ToolMessage({
            tool_call_id: call.id!,
            content: JSON.stringify({ error: (err as Error).message }),
          }),
        );
      }
    }
  }

  throw new Error(`Agent exceeded ${MAX_TOOL_ITERATIONS} tool iterations`);
}
