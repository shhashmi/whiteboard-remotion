/**
 * Single-shot Remotion video generator (LangGraph edition).
 *
 * Pipeline modeled as a LangGraph StateGraph:
 *   START → generate → validate ─[errors & attempt<2]─→ prepareRetry → generate
 *                               └─[ok or attempt≥2]───→ END
 *
 *   1. Read user prompt (from --prompt file or input.txt)
 *   2. Read the project skill at .claude/skills/whiteboard-video/SKILL.md
 *   3. LangGraph invocation with ChatAnthropic (claude-opus-4-6) + prompt caching
 *   4. Write src/generated/{GeneratedVideo,Root,index}.tsx
 *   5. tsc --noEmit check; one retry with compile errors if it fails
 *   6. Render via `npx remotion render` unless --no-render
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { ChatAnthropic } from '@langchain/anthropic';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const MODEL = 'claude-opus-4-6';
const MAX_TOKENS = 16384;
const PROJECT_ROOT = process.cwd();
const SKILL_PATH = path.join(PROJECT_ROOT, '.claude/skills/whiteboard-video/SKILL.md');
const GENERATED_DIR = path.join(PROJECT_ROOT, 'src/generated');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const DEFAULT_INPUT = path.join(PROJECT_ROOT, 'input.txt');
const COST_LOG_PATH = path.join(OUT_DIR, 'cost-log.jsonl');

// Opus 4.6 pricing (USD per million tokens): $15 input / $75 output.
// https://www.anthropic.com/pricing
const COST_INPUT_PER_MTOK = 15;
const COST_OUTPUT_PER_MTOK = 75;
const COST_CACHE_READ_PER_MTOK = 1.5;    // 10% of input price
const COST_CACHE_WRITE_PER_MTOK = 18.75; // 125% of input price

// ── Model instance (reads ANTHROPIC_API_KEY from env) ────────────────
const model = new ChatAnthropic({
  model: MODEL,
  maxTokens: MAX_TOKENS,
});

// ── Graph state ──────────────────────────────────────────────────────
const GraphState = Annotation.Root({
  prompt: Annotation<string>,
  systemPrompt: Annotation<string>,
  noRender: Annotation<boolean>,

  messages: Annotation<BaseMessage[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  responseText: Annotation<string>({ reducer: (_p, n) => n, default: () => '' }),
  tsxCode: Annotation<string>({ reducer: (_p, n) => n, default: () => '' }),

  exportErrors: Annotation<string[]>({ reducer: (_p, n) => n, default: () => [] }),
  layoutErrors: Annotation<string[]>({ reducer: (_p, n) => n, default: () => [] }),
  typecheckOk: Annotation<boolean>({ reducer: (_p, n) => n, default: () => true }),
  typecheckErrors: Annotation<string>({ reducer: (_p, n) => n, default: () => '' }),

  totalInputTokens: Annotation<number>({ reducer: (_p, n) => n, default: () => 0 }),
  totalOutputTokens: Annotation<number>({ reducer: (_p, n) => n, default: () => 0 }),
  cacheReadTokens: Annotation<number>({ reducer: (_p, n) => n, default: () => 0 }),
  cacheCreationTokens: Annotation<number>({ reducer: (_p, n) => n, default: () => 0 }),

  attempt: Annotation<number>({ reducer: (_p, n) => n, default: () => 0 }),
});

// ── CLI parsing ──────────────────────────────────────────────────────

interface Args {
  prompt: string;
  noRender: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let promptFile: string | undefined;
  let inlinePrompt: string | undefined;
  let noRender = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--prompt' && argv[i + 1]) {
      promptFile = argv[++i];
    } else if (a.startsWith('--prompt=')) {
      promptFile = a.slice('--prompt='.length);
    } else if (a === '--no-render') {
      noRender = true;
    } else if (!a.startsWith('--')) {
      inlinePrompt = a;
    }
  }

  let prompt: string;
  if (inlinePrompt) {
    prompt = inlinePrompt;
  } else {
    const file = promptFile || DEFAULT_INPUT;
    if (!fs.existsSync(file)) {
      throw new Error(`Prompt file not found: ${file}`);
    }
    prompt = fs.readFileSync(file, 'utf-8').trim();
  }

  if (!prompt) {
    throw new Error('Empty prompt. Provide an inline argument, --prompt=<file>, or populate input.txt.');
  }

  return { prompt, noRender };
}

// ── Skill loader ─────────────────────────────────────────────────────

function loadSkill(): string {
  if (!fs.existsSync(SKILL_PATH)) {
    throw new Error(`Skill file not found at ${SKILL_PATH}`);
  }
  const raw = fs.readFileSync(SKILL_PATH, 'utf-8');
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

// ── TSX extraction & validation ──────────────────────────────────────

function extractTsx(response: string): string {
  const fencedMatch = response.match(/```(?:tsx|typescript|ts)?\s*\n([\s\S]*?)\n```/);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }
  if (response.includes('export const GeneratedVideo')) {
    return response.trim();
  }
  throw new Error('Model response did not contain a TSX code block or GeneratedVideo export.');
}

function validateRequiredExports(code: string): string[] {
  const errors: string[] = [];
  if (!/export\s+const\s+durationInFrames\s*=/.test(code)) {
    errors.push('Missing required `export const durationInFrames = <number>;`');
  }
  if (!/export\s+const\s+GeneratedVideo\s*:\s*React\.FC/.test(code) &&
      !/export\s+const\s+GeneratedVideo\s*=/.test(code)) {
    errors.push('Missing required `export const GeneratedVideo: React.FC = ...`');
  }
  return errors;
}

function validateLayout(code: string): string[] {
  const errors: string[] = [];

  const boxPattern = /<SketchBox\b([^>]*(?:>(?!<\/)|[^>])*)(?:\/>|>)/g;
  const boxes: Array<{ x: number; y: number; width: number; height: number; hasRows: boolean }> = [];

  let boxMatch;
  while ((boxMatch = boxPattern.exec(code)) !== null) {
    const attrs = boxMatch[1];
    const xm = attrs.match(/\bx\s*=\s*\{?\s*(\d+)/);
    const ym = attrs.match(/\by\s*=\s*\{?\s*(\d+)/);
    const wm = attrs.match(/\bwidth\s*=\s*\{?\s*(\d+)/);
    const hm = attrs.match(/\bheight\s*=\s*\{?\s*(\d+)/);
    const hasRows = /\brows\s*=/.test(attrs);
    if (xm && ym && wm) {
      boxes.push({
        x: Number(xm[1]),
        y: Number(ym[1]),
        width: Number(wm[1]),
        height: hm ? Number(hm[1]) : 0,
        hasRows,
      });
    }
  }

  const textPattern = /<HandWrittenText\b([^>]*(?:>(?!<\/)|[^>])*)(?:\/>|>)/g;
  const texts: Array<{ x: number; y: number }> = [];

  let textMatch;
  while ((textMatch = textPattern.exec(code)) !== null) {
    const attrs = textMatch[1];
    const xm = attrs.match(/\bx\s*=\s*\{?\s*(\d+)/);
    const ym = attrs.match(/\by\s*=\s*\{?\s*(\d+)/);
    if (xm && ym) {
      texts.push({ x: Number(xm[1]), y: Number(ym[1]) });
    }
  }

  for (const t of texts) {
    for (const b of boxes) {
      if (b.hasRows) continue;
      if (b.height === 0) continue;
      if (t.x >= b.x && t.x <= b.x + b.width &&
          t.y >= b.y && t.y <= b.y + b.height) {
        errors.push(
          `Layout: HandWrittenText at (${t.x},${t.y}) is inside SketchBox ` +
          `at (${b.x},${b.y}, ${b.width}×${b.height}) which does not use the rows prop. ` +
          `Use SketchBox's rows prop for auto-layout instead of positioning text manually.`,
        );
      }
    }
  }

  return errors;
}

// ── File writers ─────────────────────────────────────────────────────

function writeGeneratedFiles(tsxCode: string): void {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(GENERATED_DIR, 'GeneratedVideo.tsx'), tsxCode);

  const rootTsx = `import React from 'react';
import { Composition } from 'remotion';
import { GeneratedVideo, durationInFrames } from './GeneratedVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="GeneratedVideo"
      component={GeneratedVideo}
      durationInFrames={durationInFrames}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
`;
  fs.writeFileSync(path.join(GENERATED_DIR, 'Root.tsx'), rootTsx);

  const indexTsx = `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
`;
  fs.writeFileSync(path.join(GENERATED_DIR, 'index.tsx'), indexTsx);
}

// ── TypeScript validation ────────────────────────────────────────────

function typecheckGenerated(): { ok: true } | { ok: false; errors: string } {
  try {
    execSync('npx tsc --noEmit', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return { ok: true };
  } catch (err: any) {
    const stdout = (err.stdout || '').toString();
    const stderr = (err.stderr || '').toString();
    const combined = `${stdout}\n${stderr}`;
    const relevant = combined
      .split('\n')
      .filter((line) => line.includes('src/generated/'))
      .slice(0, 40)
      .join('\n');
    if (!relevant.trim()) {
      return { ok: true };
    }
    return { ok: false, errors: relevant };
  }
}

// ── Cost tracking ────────────────────────────────────────────────────

function computeCost(
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens = 0,
  cacheCreationTokens = 0,
): { inCost: number; outCost: number; total: number } {
  const plainInput = Math.max(0, inputTokens - cacheReadTokens - cacheCreationTokens);
  const inCost = (plainInput / 1_000_000) * COST_INPUT_PER_MTOK
    + (cacheReadTokens / 1_000_000) * COST_CACHE_READ_PER_MTOK
    + (cacheCreationTokens / 1_000_000) * COST_CACHE_WRITE_PER_MTOK;
  const outCost = (outputTokens / 1_000_000) * COST_OUTPUT_PER_MTOK;
  return { inCost, outCost, total: inCost + outCost };
}

function formatCost(
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens = 0,
  cacheCreationTokens = 0,
): string {
  const { inCost, outCost, total } = computeCost(inputTokens, outputTokens, cacheReadTokens, cacheCreationTokens);
  let s = `$${total.toFixed(4)} (in: ${inputTokens} tok / $${inCost.toFixed(4)}, out: ${outputTokens} tok / $${outCost.toFixed(4)})`;
  if (cacheReadTokens > 0) {
    s += ` [cache read: ${cacheReadTokens} tok]`;
  }
  if (cacheCreationTokens > 0) {
    s += ` [cache write: ${cacheCreationTokens} tok]`;
  }
  return s;
}

interface CostLogEntry {
  timestamp: string;
  model: string;
  prompt: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  costUsd: number;
  elapsedSec: number;
}

function appendCostLog(entry: CostLogEntry): void {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.appendFileSync(COST_LOG_PATH, JSON.stringify(entry) + '\n');
}

function readCumulativeCost(): { runs: number; inputTokens: number; outputTokens: number; costUsd: number } {
  if (!fs.existsSync(COST_LOG_PATH)) {
    return { runs: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 };
  }
  const lines = fs.readFileSync(COST_LOG_PATH, 'utf-8').split('\n').filter((l) => l.trim());
  let runs = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let costUsd = 0;
  for (const line of lines) {
    try {
      const e = JSON.parse(line) as CostLogEntry;
      runs += 1;
      inputTokens += e.inputTokens || 0;
      outputTokens += e.outputTokens || 0;
      costUsd += e.costUsd || 0;
    } catch {
      // skip malformed lines
    }
  }
  return { runs, inputTokens, outputTokens, costUsd };
}

// ── Graph nodes ──────────────────────────────────────────────────────

async function generateNode(state: typeof GraphState.State) {
  const systemMsg = new SystemMessage({
    content: [
      {
        type: 'text' as const,
        text: state.systemPrompt,
        cache_control: { type: 'ephemeral' as const },
      },
    ],
  });

  const userContent = `Create a whiteboard video on this topic:\n\n${state.prompt}\n\nEmit ONLY the complete TSX file inside a single \`\`\`tsx code block. Follow the SKILL.md rules exactly.`;

  let invokeMessages: BaseMessage[];
  if (state.attempt === 0) {
    invokeMessages = [systemMsg, new HumanMessage(userContent)];
  } else {
    invokeMessages = [systemMsg, ...state.messages];
  }

  const attemptLabel = state.attempt === 0 ? '1/2' : '2/2';
  console.log(`\n▶ [${attemptLabel}] Calling ${MODEL}…`);
  const t = Date.now();

  const response = await model.invoke(invokeMessages);

  const elapsed = ((Date.now() - t) / 1000).toFixed(1);

  // Extract text content from response
  const text = typeof response.content === 'string'
    ? response.content
    : (response.content as Array<{ type: string; text?: string }>)
        .filter(b => b.type === 'text')
        .map(b => b.text || '')
        .join('');

  // Extract token usage
  const usage = response.usage_metadata;
  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;
  const details = (usage as any)?.input_token_details ?? {};
  const cacheRead = details.cache_read ?? details.cache_read_input_tokens ?? 0;
  const cacheCreation = details.cache_creation ?? details.cache_creation_input_tokens ?? 0;

  console.log(`  ✓ ${elapsed}s, ${formatCost(inputTokens, outputTokens, cacheRead, cacheCreation)}`);

  // Build message history for potential retry
  const updatedMessages: BaseMessage[] = state.attempt === 0
    ? [new HumanMessage(userContent), new AIMessage(text)]
    : [...state.messages, new AIMessage(text)];

  return {
    responseText: text,
    messages: updatedMessages,
    totalInputTokens: state.totalInputTokens + inputTokens,
    totalOutputTokens: state.totalOutputTokens + outputTokens,
    cacheReadTokens: state.cacheReadTokens + cacheRead,
    cacheCreationTokens: state.cacheCreationTokens + cacheCreation,
  };
}

async function validateNode(state: typeof GraphState.State) {
  const tsxCode = extractTsx(state.responseText);
  const exportErrors = validateRequiredExports(tsxCode);
  const layoutErrors = validateLayout(tsxCode);

  writeGeneratedFiles(tsxCode);
  const tcResult = typecheckGenerated();

  if (exportErrors.length === 0 && layoutErrors.length === 0 && tcResult.ok) {
    console.log(`  ✓ TypeScript check passed${state.attempt === 0 ? ' on first attempt' : ' after retry'}.`);
  }

  return {
    tsxCode,
    exportErrors,
    layoutErrors,
    typecheckOk: tcResult.ok,
    typecheckErrors: tcResult.ok ? '' : (tcResult as { ok: false; errors: string }).errors,
    attempt: state.attempt + 1,
  };
}

async function prepareRetryNode(state: typeof GraphState.State) {
  const feedback: string[] = [];
  if (state.exportErrors.length > 0) {
    feedback.push('Export errors:\n' + state.exportErrors.join('\n'));
  }
  if (state.layoutErrors.length > 0) {
    feedback.push('Layout errors (text inside boxes must use SketchBox rows prop):\n' + state.layoutErrors.join('\n'));
  }
  if (!state.typecheckOk) {
    feedback.push('TypeScript errors:\n' + state.typecheckErrors);
  }

  console.log(`\n▶ Retrying with compile feedback…`);
  console.log(`  Feedback:\n${feedback.join('\n').split('\n').map((l) => '    ' + l).join('\n')}`);

  const retryMessage = new HumanMessage(
    `Your previous output failed validation:\n\n${feedback.join('\n\n')}\n\nFix ALL issues and re-emit the COMPLETE TSX file in a single \`\`\`tsx block. Do not explain — just emit the fixed code.`,
  );

  return {
    messages: [...state.messages, retryMessage],
  };
}

// ── Graph construction ───────────────────────────────────────────────

function buildGraph() {
  const retryPolicy = {
    maxAttempts: 3,
    initialInterval: 1000,
    backoffFactor: 2,
    maxInterval: 30000,
  };

  const graph = new StateGraph(GraphState)
    .addNode('generate', generateNode, { retryPolicy })
    .addNode('validate', validateNode)
    .addNode('prepareRetry', prepareRetryNode)
    .addEdge(START, 'generate')
    .addEdge('generate', 'validate')
    .addConditionalEdges('validate', (state) => {
      const hasErrors = !state.typecheckOk
        || state.exportErrors.length > 0
        || state.layoutErrors.length > 0;

      if (hasErrors && state.attempt < 2) {
        return 'prepareRetry';
      }
      return END;
    })
    .addEdge('prepareRetry', 'generate');

  return graph.compile();
}

// ── Main ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const startTime = Date.now();
  const { prompt, noRender } = parseArgs();

  console.log(`\n▶ Prompt: "${prompt}"`);
  console.log(`▶ Model:  ${MODEL}`);

  const skill = loadSkill();
  console.log(`▶ Skill:  ${skill.length} chars loaded from ${path.relative(PROJECT_ROOT, SKILL_PATH)}`);

  const app = buildGraph();

  const finalState = await app.invoke({
    prompt,
    systemPrompt: skill,
    noRender,
  });

  const {
    tsxCode, typecheckOk, exportErrors, layoutErrors,
    totalInputTokens, totalOutputTokens,
    cacheReadTokens, cacheCreationTokens,
    typecheckErrors,
  } = finalState;

  // Report persistent errors
  if (exportErrors.length > 0) {
    console.error(`\n✗ Export errors persist after retry:\n${exportErrors.join('\n')}`);
  }
  if (layoutErrors.length > 0) {
    console.error(`\n✗ Layout errors persist after retry:\n${layoutErrors.join('\n')}`);
  }
  if (!typecheckOk) {
    console.error(`\n✗ TypeScript errors persist after retry:\n${typecheckErrors}`);
    console.error(`\nFiles written anyway at ${path.relative(PROJECT_ROOT, GENERATED_DIR)}/ for manual fixing.`);
  }

  console.log(`\n▶ Wrote ${path.relative(PROJECT_ROOT, GENERATED_DIR)}/GeneratedVideo.tsx (${tsxCode.length} chars)`);

  // ── Render ──────────────────────────────────────────────────────────
  if (!noRender && typecheckOk && exportErrors.length === 0 && layoutErrors.length === 0) {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const outMp4 = path.join(OUT_DIR, 'generated.mp4');
    console.log(`\n▶ Rendering → ${path.relative(PROJECT_ROOT, outMp4)}`);
    try {
      execSync(
        `npx remotion render src/generated/index.tsx GeneratedVideo ${outMp4} --log=error`,
        { cwd: PROJECT_ROOT, stdio: 'inherit', timeout: 180000 }
      );
      console.log(`  ✓ Render complete.`);
    } catch {
      console.error(`  ✗ Render failed. The TSX file is at ${path.relative(PROJECT_ROOT, GENERATED_DIR)}/GeneratedVideo.tsx for inspection.`);
      process.exitCode = 1;
    }
  } else if (noRender) {
    console.log(`\n▶ Skipping render (--no-render).`);
  }

  const elapsedSec = (Date.now() - startTime) / 1000;
  const thisRun = computeCost(totalInputTokens, totalOutputTokens, cacheReadTokens, cacheCreationTokens);

  appendCostLog({
    timestamp: new Date().toISOString(),
    model: MODEL,
    prompt: prompt.slice(0, 200),
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    cacheReadTokens: cacheReadTokens || undefined,
    cacheCreationTokens: cacheCreationTokens || undefined,
    costUsd: thisRun.total,
    elapsedSec: Number(elapsedSec.toFixed(1)),
  });

  const cumulative = readCumulativeCost();

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  This run:   ${elapsedSec.toFixed(1)}s`);
  console.log(`              ${formatCost(totalInputTokens, totalOutputTokens, cacheReadTokens, cacheCreationTokens)}`);
  console.log(`  ─────────────────────────────────────────────────`);
  console.log(`  Cumulative: ${cumulative.runs} run${cumulative.runs === 1 ? '' : 's'}`);
  console.log(`              $${cumulative.costUsd.toFixed(4)} total (in: ${cumulative.inputTokens} tok, out: ${cumulative.outputTokens} tok)`);
  console.log(`              log: ${path.relative(PROJECT_ROOT, COST_LOG_PATH)}`);
  console.log(`═══════════════════════════════════════════════════\n`);
}

main().catch((err) => {
  console.error(`\n✗ Fatal: ${err.message || err}`);
  process.exit(1);
});
