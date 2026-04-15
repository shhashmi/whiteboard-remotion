import { ChatAnthropic } from '@langchain/anthropic';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { AGENT_TOOLS, AGENT_TOOLS_LC } from '../tools';
import { setVisualFit } from '../tools/runtimeContext';
import { log, time, truncate } from '../logger';

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
  visualFit?: boolean;
  onIteration?: (info: { iteration: number; toolCalls: number; elapsedMs: number }) => void;
}

type MultimodalToolResult = {
  __multimodal: true;
  payload: unknown;
  images: Array<{ id: string; mediaType: 'image/png'; base64: string }>;
};

function isMultimodal(result: unknown): result is MultimodalToolResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    (result as { __multimodal?: unknown }).__multimodal === true
  );
}

function buildToolMessage(
  toolCallId: string,
  result: unknown,
): ToolMessage {
  if (!isMultimodal(result)) {
    return new ToolMessage({
      tool_call_id: toolCallId,
      content: JSON.stringify(result),
    });
  }
  const blocks: Array<Record<string, unknown>> = [
    { type: 'text', text: JSON.stringify(result.payload) },
  ];
  result.images.forEach((img, idx) => {
    const block: Record<string, unknown> = {
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mediaType,
        data: img.base64,
      },
    };
    if (idx === result.images.length - 1) {
      block.cache_control = { type: 'ephemeral' };
    }
    blocks.push(block);
  });
  return new ToolMessage({
    tool_call_id: toolCallId,
    content: blocks as unknown as ToolMessage['content'],
  });
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

function describeMessage(m: BaseMessage): Record<string, unknown> {
  const role = m._getType();
  const content = typeof m.content === 'string'
    ? m.content
    : JSON.stringify(m.content);
  const out: Record<string, unknown> = { role, content: truncate(content) };
  const toolCalls = (m as AIMessage).tool_calls;
  if (toolCalls && toolCalls.length > 0) {
    out.toolCalls = toolCalls.map((c) => ({ name: c.name, args: c.args }));
  }
  return out;
}

export async function runAgent(opts: RunAgentOptions): Promise<RunAgentResult> {
  setVisualFit(!!opts.visualFit);
  const endRun = time('agent', 'run', {
    tools: AGENT_TOOLS.map((t) => t.name),
    hasPriorMessages: !!opts.priorMessages,
    visualFit: !!opts.visualFit,
  });
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

  let ended = false;
  try {
    for (let iteration = 1; iteration <= MAX_TOOL_ITERATIONS; iteration++) {
      const endIter = time('agent', `iter ${iteration}`, { messageCount: messages.length });

      log('llm.prompt', `iter ${iteration} outbound messages`, {
        messages: messages.map(describeMessage),
      });

      const endLlm = time('llm', `invoke iter ${iteration}`, {
        messageCount: messages.length,
      });
      const response = (await bound.invoke(messages)) as AIMessage;
      accumulateUsage(usage, response.usage_metadata);
      messages.push(response);

      const calls = response.tool_calls ?? [];
      endLlm({
        outputTokens: response.usage_metadata?.output_tokens ?? 0,
        inputTokens: response.usage_metadata?.input_tokens ?? 0,
        toolCalls: calls.length,
        textPreview: truncate(extractText(response)),
      });

      opts.onIteration?.({
        iteration,
        toolCalls: calls.length,
        elapsedMs: endIter({ toolCalls: calls.length }),
      });

      if (calls.length === 0) {
        endRun({ iterations: iteration, toolCallCount, usage });
        ended = true;
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
          log('tool', `${call.name} unknown`, { input: call.args });
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
          log('tool', `${call.name} input validation failed`, {
            input: call.args,
            issues: parsed.error.issues,
          });
          messages.push(
            new ToolMessage({
              tool_call_id: call.id!,
              content: JSON.stringify({ error: 'Invalid input', issues: parsed.error.issues }),
            }),
          );
          continue;
        }
        const endTool = time('tool', call.name, { input: parsed.data });
        try {
          const result = await def.handler(parsed.data);
          endTool({ output: isMultimodal(result) ? { ...result, images: `${result.images.length} image(s) omitted from log` } : result });
          messages.push(buildToolMessage(call.id!, result));
        } catch (err) {
          endTool({ error: (err as Error).message });
          messages.push(
            new ToolMessage({
              tool_call_id: call.id!,
              content: JSON.stringify({ error: (err as Error).message }),
            }),
          );
        }
      }
    }

    endRun({ iterations: MAX_TOOL_ITERATIONS, toolCallCount, usage, exceeded: true });
    ended = true;
    throw new Error(`Agent exceeded ${MAX_TOOL_ITERATIONS} tool iterations`);
  } catch (err) {
    if (!ended) {
      log('agent', 'run error', { error: (err as Error).message });
    }
    throw err;
  }
}
