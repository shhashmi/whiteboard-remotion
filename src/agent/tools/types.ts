import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import type { StructuredToolInterface } from '@langchain/core/tools';

export interface AgentTool<T extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  schema: T;
  handler: (input: z.infer<T>) => Promise<unknown> | unknown;
  toLangChainTool(): StructuredToolInterface;
}

type AgentToolSpec<T extends z.ZodTypeAny> = Omit<AgentTool<T>, 'toLangChainTool'>;

export function defineTool<T extends z.ZodTypeAny>(spec: AgentToolSpec<T>): AgentTool<T> {
  return {
    ...spec,
    toLangChainTool() {
      return tool(
        async (input: z.infer<T>) => JSON.stringify(await spec.handler(input)),
        {
          name: spec.name,
          description: spec.description,
          schema: spec.schema,
        },
      );
    },
  };
}
