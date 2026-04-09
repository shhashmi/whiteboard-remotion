/**
 * Single-shot Remotion video generator.
 *
 * Pipeline:
 *   1. Read user prompt (from --prompt file or input.txt)
 *   2. Read the project skill at .claude/skills/whiteboard-video/SKILL.md
 *   3. One Anthropic API call (claude-opus-4-6) → complete TSX file
 *   4. Write src/generated/{GeneratedVideo,Root,index}.tsx
 *   5. tsc --noEmit check; one retry with compile errors if it fails
 *   6. Render via `npx remotion render` unless --no-render
 *
 * Zero dependencies on the old src/pipeline/ directory.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import Anthropic from '@anthropic-ai/sdk';
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

// Opus 4.6 pricing (USD per million tokens): $15 input / $75 output.
const COST_INPUT_PER_MTOK = 15;
const COST_OUTPUT_PER_MTOK = 75;

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

function loadSkill(): string {
  if (!fs.existsSync(SKILL_PATH)) {
    throw new Error(`Skill file not found at ${SKILL_PATH}`);
  }
  const raw = fs.readFileSync(SKILL_PATH, 'utf-8');
  // Strip the YAML frontmatter — the SDK doesn't need it.
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

function extractTsx(response: string): string {
  // The model is instructed to emit a single ```tsx fenced block.
  const fencedMatch = response.match(/```(?:tsx|typescript|ts)?\s*\n([\s\S]*?)\n```/);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }
  // Fallback: if the model forgot the fence but emitted valid-looking TSX, return raw.
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

function typecheckGenerated(): { ok: true } | { ok: false; errors: string } {
  try {
    execSync('npx tsc --noEmit', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return { ok: true };
  } catch (err: any) {
    // tsc writes errors to stdout. Keep only lines that mention the generated
    // directory — avoids leaking unrelated errors from src/cfpb-riskcheck or
    // src/shared into the retry feedback to the model.
    const stdout = (err.stdout || '').toString();
    const stderr = (err.stderr || '').toString();
    const combined = `${stdout}\n${stderr}`;
    const relevant = combined
      .split('\n')
      .filter((line) => line.includes('src/generated/'))
      .slice(0, 40)
      .join('\n');
    // If tsc exited nonzero but no errors matched src/generated/, the failure
    // is in unrelated code — treat the generated file as OK.
    if (!relevant.trim()) {
      return { ok: true };
    }
    return { ok: false, errors: relevant };
  }
}

async function callClaude(
  client: Anthropic,
  systemPrompt: string,
  userMessages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: userMessages,
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Model returned no text content.');
  }

  return {
    text: textBlock.text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

function formatCost(inputTokens: number, outputTokens: number): string {
  const inCost = (inputTokens / 1_000_000) * COST_INPUT_PER_MTOK;
  const outCost = (outputTokens / 1_000_000) * COST_OUTPUT_PER_MTOK;
  const total = inCost + outCost;
  return `$${total.toFixed(4)} (in: ${inputTokens} tok / $${inCost.toFixed(4)}, out: ${outputTokens} tok / $${outCost.toFixed(4)})`;
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const { prompt, noRender } = parseArgs();

  console.log(`\n▶ Prompt: "${prompt}"`);
  console.log(`▶ Model:  ${MODEL}`);

  const skill = loadSkill();
  console.log(`▶ Skill:  ${skill.length} chars loaded from ${path.relative(PROJECT_ROOT, SKILL_PATH)}`);

  const systemPrompt = skill;
  const userPrompt = `Create a whiteboard video on this topic:\n\n${prompt}\n\nEmit ONLY the complete TSX file inside a single \`\`\`tsx code block. Follow the SKILL.md rules exactly.`;

  const client = new Anthropic();

  // ── Call 1: generation ──────────────────────────────────────────────
  console.log(`\n▶ [1/2] Calling ${MODEL}…`);
  const t1 = Date.now();
  let { text, inputTokens, outputTokens } = await callClaude(client, systemPrompt, [
    { role: 'user', content: userPrompt },
  ]);
  console.log(`  ✓ ${((Date.now() - t1) / 1000).toFixed(1)}s, ${formatCost(inputTokens, outputTokens)}`);

  let tsxCode = extractTsx(text);
  let exportErrors = validateRequiredExports(tsxCode);

  // Write first attempt to disk so tsc can see it.
  writeGeneratedFiles(tsxCode);

  // ── Typecheck + at most one retry ───────────────────────────────────
  let tcResult = typecheckGenerated();
  let totalInTok = inputTokens;
  let totalOutTok = outputTokens;

  if (!tcResult.ok || exportErrors.length > 0) {
    const feedback: string[] = [];
    if (exportErrors.length > 0) {
      feedback.push('Export errors:\n' + exportErrors.join('\n'));
    }
    if (!tcResult.ok) {
      feedback.push('TypeScript errors:\n' + tcResult.errors);
    }

    console.log(`\n▶ [2/2] Retrying with compile feedback…`);
    console.log(`  Feedback:\n${feedback.join('\n').split('\n').map((l) => '    ' + l).join('\n')}`);

    const t2 = Date.now();
    const retry = await callClaude(client, systemPrompt, [
      { role: 'user', content: userPrompt },
      { role: 'assistant', content: text },
      {
        role: 'user',
        content: `Your previous output failed validation:\n\n${feedback.join('\n\n')}\n\nFix ALL issues and re-emit the COMPLETE TSX file in a single \`\`\`tsx block. Do not explain — just emit the fixed code.`,
      },
    ]);
    console.log(`  ✓ ${((Date.now() - t2) / 1000).toFixed(1)}s, ${formatCost(retry.inputTokens, retry.outputTokens)}`);

    totalInTok += retry.inputTokens;
    totalOutTok += retry.outputTokens;

    tsxCode = extractTsx(retry.text);
    exportErrors = validateRequiredExports(tsxCode);
    writeGeneratedFiles(tsxCode);
    tcResult = typecheckGenerated();

    if (exportErrors.length > 0) {
      console.error(`\n✗ Export errors persist after retry:\n${exportErrors.join('\n')}`);
    }
    if (!tcResult.ok) {
      console.error(`\n✗ TypeScript errors persist after retry:\n${tcResult.errors}`);
      console.error(`\nFiles written anyway at ${path.relative(PROJECT_ROOT, GENERATED_DIR)}/ for manual fixing.`);
    }
  } else {
    console.log(`  ✓ TypeScript check passed on first attempt.`);
  }

  console.log(`\n▶ Wrote ${path.relative(PROJECT_ROOT, GENERATED_DIR)}/GeneratedVideo.tsx (${tsxCode.length} chars)`);

  // ── Render ──────────────────────────────────────────────────────────
  if (!noRender && tcResult.ok && exportErrors.length === 0) {
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

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Total: ${elapsed}s | ${formatCost(totalInTok, totalOutTok)}`);
  console.log(`═══════════════════════════════════════════════════\n`);
}

main().catch((err) => {
  console.error(`\n✗ Fatal: ${err.message || err}`);
  process.exit(1);
});
