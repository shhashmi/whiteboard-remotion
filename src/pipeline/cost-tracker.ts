// Pricing per 1M tokens (USD) — update when models change
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  // Fallback for unknown models
  default: { input: 3, output: 15 },
};

interface LLMCall {
  role: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

export interface CostSummary {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  callCount: number;
  calls: LLMCall[];
  byRole: Record<string, { inputTokens: number; outputTokens: number; costUsd: number; calls: number }>;
}

export class CostTracker {
  private calls: LLMCall[] = [];

  record(role: string, model: string, inputTokens: number, outputTokens: number, durationMs: number): void {
    this.calls.push({ role, model, inputTokens, outputTokens, durationMs });
  }

  summarize(): CostSummary {
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCostUsd = 0;
    const byRole: CostSummary['byRole'] = {};

    for (const call of this.calls) {
      const pricing = MODEL_PRICING[call.model] ?? MODEL_PRICING.default;
      const callCost =
        (call.inputTokens / 1_000_000) * pricing.input +
        (call.outputTokens / 1_000_000) * pricing.output;

      totalInputTokens += call.inputTokens;
      totalOutputTokens += call.outputTokens;
      totalCostUsd += callCost;

      if (!byRole[call.role]) {
        byRole[call.role] = { inputTokens: 0, outputTokens: 0, costUsd: 0, calls: 0 };
      }
      byRole[call.role].inputTokens += call.inputTokens;
      byRole[call.role].outputTokens += call.outputTokens;
      byRole[call.role].costUsd += callCost;
      byRole[call.role].calls += 1;
    }

    return { totalInputTokens, totalOutputTokens, totalCostUsd, callCount: this.calls.length, calls: this.calls, byRole };
  }
}
