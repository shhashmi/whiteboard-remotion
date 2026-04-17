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
import { runAgent } from './agent/loop/runAgent';
import { log, time } from './agent/logger';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import {
  TTSProviderId,
  SceneCueGroup,
  SceneSynthesisResult,
  CueMap,
  generateCuedAudio,
  buildCueTiming,
} from './tts';
import {
  Box,
  iconBox,
  textBox,
  sketchBoxBox,
  agentCoordinationBox,
  genericDiagramBox,
  intersects,
  inSafeZone,
  isDiagram,
  getIconBox,
  fmtBox,
  isIcon,
} from './asset-index/bounds';

const MODEL = 'claude-opus-4-6';
const MAX_TOKENS = 16384;
const PROJECT_ROOT = process.cwd();
const SKILL_PATH = path.join(PROJECT_ROOT, '.claude/skills/whiteboard-video/SKILL.md');
const PROMPT_DIR = path.join(PROJECT_ROOT, 'src/prompts');
const PROMPT_ORDER = ['system.md', 'components.md', 'timing.md', 'planning.md', 'codegen.md'];
const GENERATED_DIR = path.join(PROJECT_ROOT, 'src/generated');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'public/audio');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const DEFAULT_INPUT = path.join(PROJECT_ROOT, 'input.txt');
const COST_LOG_PATH = path.join(OUT_DIR, 'cost-log.jsonl');

// Opus 4.6 pricing (USD per million tokens): $15 input / $75 output.
// https://www.anthropic.com/pricing
const COST_INPUT_PER_MTOK = 15;
const COST_OUTPUT_PER_MTOK = 75;
const COST_CACHE_READ_PER_MTOK = 1.5;    // 10% of input price
const COST_CACHE_WRITE_PER_MTOK = 18.75; // 125% of input price

// TTS pricing (USD per 1M characters) — both providers expose word/char timings.
const TTS_COST_PER_MCHAR: Record<TTSProviderId, number> = {
  elevenlabs: 30.00,    // ~$30 / 1M chars (varies by plan)
  polly: 16.00,         // Polly neural ~$16 / 1M chars
};

const VALID_TTS_PROVIDERS: TTSProviderId[] = ['elevenlabs', 'polly'];

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
  noNarration: Annotation<boolean>,
  visualFit: Annotation<boolean>({ reducer: (_p, n) => n, default: () => false }),
  ttsProvider: Annotation<TTSProviderId>({ reducer: (_p, n) => n, default: () => 'elevenlabs' }),
  ttsVoice: Annotation<string>({ reducer: (_p, n) => n, default: () => '' }),
  sceneCueGroups: Annotation<SceneCueGroup[]>({ reducer: (_p, n) => n, default: () => [] }),
  sceneAudioResults: Annotation<SceneSynthesisResult[]>({ reducer: (_p, n) => n, default: () => [] }),
  cueMap: Annotation<CueMap>({ reducer: (_p, n) => n, default: () => ({}) }),
  totalFramesOverride: Annotation<number>({ reducer: (_p, n) => n, default: () => 0 }),

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
  noNarration: boolean;
  ttsProvider: TTSProviderId;
  ttsVoice: string;
  visualFit: boolean;
}

function parseTtsProvider(raw: string): TTSProviderId {
  if (VALID_TTS_PROVIDERS.includes(raw as TTSProviderId)) return raw as TTSProviderId;
  throw new Error(
    `Invalid TTS provider "${raw}". Supported: ${VALID_TTS_PROVIDERS.join(', ')}.`,
  );
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let promptFile: string | undefined;
  let inlinePrompt: string | undefined;
  let noRender = false;
  let noNarration = false;
  let visualFit = false;
  let ttsProvider: TTSProviderId = parseTtsProvider(process.env.TTS_PROVIDER || 'elevenlabs');
  let ttsVoice = process.env.TTS_VOICE || '';

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--prompt' && argv[i + 1]) {
      promptFile = argv[++i];
    } else if (a.startsWith('--prompt=')) {
      promptFile = a.slice('--prompt='.length);
    } else if (a === '--no-render') {
      noRender = true;
    } else if (a === '--no-narration') {
      noNarration = true;
    } else if (a === '--visual-fit') {
      visualFit = true;
    } else if (a.startsWith('--tts-provider=')) {
      ttsProvider = parseTtsProvider(a.slice('--tts-provider='.length));
    } else if (a.startsWith('--tts-voice=')) {
      ttsVoice = a.slice('--tts-voice='.length);
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

  return { prompt, noRender, noNarration, ttsProvider, ttsVoice, visualFit };
}

// ── Skill loader ─────────────────────────────────────────────────────

function loadSystemPrompt(): string {
  if (fs.existsSync(PROMPT_DIR)) {
    const missing = PROMPT_ORDER.filter((f) => !fs.existsSync(path.join(PROMPT_DIR, f)));
    if (missing.length > 0) {
      throw new Error(`Missing prompt files in ${PROMPT_DIR}: ${missing.join(', ')}`);
    }
    return PROMPT_ORDER
      .map((f) => fs.readFileSync(path.join(PROMPT_DIR, f), 'utf-8').trim())
      .join('\n\n');
  }
  if (!fs.existsSync(SKILL_PATH)) {
    throw new Error(`Neither ${PROMPT_DIR} nor ${SKILL_PATH} found`);
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
  if (!/export\s+const\s+narrationCues\s*(?::|=)/.test(code)) {
    errors.push(
      'Missing required `export const narrationCues = [...];` — every cue="..." used in the tree must be declared here.',
    );
  }
  return errors;
}

// ── JSX tag parser (brace-balanced, multi-line tolerant) ────────────────────
// Walks `code` and yields every opening tag whose name passes `accept`. Returns
// the raw attribute string between `<Name ` and the closing `>` (or `/>`),
// honoring nested `{ ... }` so JSX expressions don't break the scan.

interface ParsedTag { name: string; attrs: string }

function parseTags(code: string, accept: (name: string) => boolean): ParsedTag[] {
  const out: ParsedTag[] = [];
  let i = 0;
  while (i < code.length) {
    const lt = code.indexOf('<', i);
    if (lt < 0) break;
    const after = code.slice(lt + 1);
    const m = after.match(/^([A-Z][A-Za-z0-9_]*)\b/);
    if (!m) { i = lt + 1; continue; }
    const name = m[1];
    if (!accept(name)) { i = lt + 1 + m[0].length; continue; }
    let j = lt + 1 + m[0].length;
    let depth = 0;
    let inString = false;
    let endedAt = -1;
    while (j < code.length) {
      const c = code[j];
      if (!inString && c === '"') { inString = true; }
      else if (inString && c === '"') { inString = false; }
      else if (!inString) {
        if (c === '{') depth++;
        else if (c === '}') depth--;
        else if (c === '>' && depth === 0) { endedAt = j; break; }
      }
      j++;
    }
    if (endedAt < 0) { i = lt + 1; continue; }
    let attrs = code.slice(lt + 1 + m[0].length, endedAt);
    if (attrs.endsWith('/')) attrs = attrs.slice(0, -1);
    out.push({ name, attrs });
    i = endedAt + 1;
  }
  return out;
}

function numProp(attrs: string, name: string): number | undefined {
  // matches `name={42}`, `name={-3.5}`, `name="42"`, `name=42`
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:\\{\\s*(-?\\d+(?:\\.\\d+)?)\\s*\\}|"(-?\\d+(?:\\.\\d+)?)")`);
  const m = attrs.match(re);
  if (!m) return undefined;
  return Number(m[1] ?? m[2]);
}

function strProp(attrs: string, name: string): string | undefined {
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|\\{\\s*'([^']*)'\\s*\\}|\\{\\s*"([^"]*)"\\s*\\})`);
  const m = attrs.match(re);
  if (!m) return undefined;
  return m[1] ?? m[2] ?? m[3];
}

function arrayLengthProp(attrs: string, name: string): number | undefined {
  const re = new RegExp(`\\b${name}\\s*=\\s*\\{\\s*\\[`);
  const m = attrs.match(re);
  if (!m) return undefined;
  const start = (m.index ?? 0) + m[0].length;
  let depth = 1;
  let braceDepth = 0;
  let commas = 0;
  let any = false;
  let hasContentAfterLastComma = false;
  for (let k = start; k < attrs.length; k++) {
    const c = attrs[k];
    if (c === '[' || c === '{') { if (c === '{') braceDepth++; else depth++; }
    else if (c === '}') braceDepth--;
    else if (c === ']') {
      depth--;
      if (depth === 0) {
        if (!any) return 0;
        return hasContentAfterLastComma ? commas + 1 : commas;
      }
    }
    else if (c === ',' && depth === 1 && braceDepth === 0) { commas++; hasContentAfterLastComma = false; }
    else if (!/\s/.test(c) && depth === 1 && braceDepth === 0) { any = true; hasContentAfterLastComma = true; }
  }
  return undefined;
}

interface RowInfo { text: string; fontSize: number }

function parseRowsProp(attrs: string): RowInfo[] | undefined {
  const re = /\brows\s*=\s*\{\s*\[/;
  const m = attrs.match(re);
  if (!m) return undefined;
  const start = (m.index ?? 0) + m[0].length;
  // Find the matching `]` honoring brace depth.
  let depth = 1;
  let braceDepth = 0;
  let end = -1;
  for (let k = start; k < attrs.length; k++) {
    const c = attrs[k];
    if (c === '[') depth++;
    else if (c === '{') braceDepth++;
    else if (c === '}') braceDepth--;
    else if (c === ']') { depth--; if (depth === 0) { end = k; break; } }
  }
  if (end < 0) return undefined;
  const body = attrs.slice(start, end);
  // Walk objects: split top-level `{ ... }` items.
  const rows: RowInfo[] = [];
  let bd = 0, objStart = -1;
  for (let k = 0; k < body.length; k++) {
    const c = body[k];
    if (c === '{') { if (bd === 0) objStart = k + 1; bd++; }
    else if (c === '}') {
      bd--;
      if (bd === 0 && objStart >= 0) {
        const obj = body.slice(objStart, k);
        const tm = obj.match(/\btext\s*:\s*['"]([^'"]*)['"]/);
        const fm = obj.match(/\bfontSize\s*:\s*(\d+(?:\.\d+)?)/);
        if (tm) rows.push({ text: tm[1], fontSize: fm ? Number(fm[1]) : 32 });
        objStart = -1;
      }
    }
  }
  return rows;
}

// Split the code into per-Scene substrings. Each entry is the full text
// between a `<Scene ...>` opening and its matching `</Scene>`. Overlap checks
// only fire within the same scene (different scenes never render at the same
// frame, so they can't visually collide). Returns the whole file as a single
// "scene" if no <Scene> tags are present.
function sliceScenes(code: string): string[] {
  const slices: string[] = [];
  const openRe = /<Scene\b/g;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(code)) !== null) {
    // Walk forward, tracking nested <Scene>...</Scene> just in case.
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < code.length && depth > 0) {
      const nextOpen = code.indexOf('<Scene', i);
      const nextClose = code.indexOf('</Scene>', i);
      if (nextClose < 0) break;
      if (nextOpen >= 0 && nextOpen < nextClose) {
        depth++;
        i = nextOpen + 6;
      } else {
        depth--;
        i = nextClose + 8;
      }
    }
    slices.push(code.slice(m.index, i));
  }
  return slices.length > 0 ? slices : [code];
}

function validateLayoutInScope(code: string): string[] {
  const errors: string[] = [];

  // ── Parse SketchBoxes ────────────────────────────────────────────────────
  const sketchTags = parseTags(code, (n) => n === 'SketchBox');
  interface BoxInfo { x: number; y: number; width: number; explicitHeight?: number; rows?: RowInfo[]; padding?: number; gap?: number; box: Box }
  const boxes: BoxInfo[] = [];
  for (const t of sketchTags) {
    const x = numProp(t.attrs, 'x');
    const y = numProp(t.attrs, 'y');
    const width = numProp(t.attrs, 'width');
    if (x === undefined || y === undefined || width === undefined) continue;
    const explicitHeight = numProp(t.attrs, 'height');
    const padding = numProp(t.attrs, 'padding');
    const gap = numProp(t.attrs, 'gap');
    const rows = parseRowsProp(t.attrs);
    const box = sketchBoxBox({ x, y, width, height: explicitHeight, rows, padding, gap });
    boxes.push({ x, y, width, explicitHeight, rows, padding, gap, box });
  }

  // ── Parse HandWrittenTexts ───────────────────────────────────────────────
  const textTags = parseTags(code, (n) => n === 'HandWrittenText');
  interface TextInfo { x: number; y: number; text: string; fontSize: number; box: Box }
  const texts: TextInfo[] = [];
  for (const t of textTags) {
    const x = numProp(t.attrs, 'x');
    const y = numProp(t.attrs, 'y');
    const text = strProp(t.attrs, 'text');
    if (x === undefined || y === undefined || text === undefined) continue;
    const fontSize = numProp(t.attrs, 'fontSize') ?? 32;
    const anchor = (strProp(t.attrs, 'textAnchor') as 'start' | 'middle' | 'end') ?? 'middle';
    const maxWidth = numProp(t.attrs, 'maxWidth');
    const box = textBox({ text, x, y, fontSize, textAnchor: anchor, maxWidth });
    texts.push({ x, y, text, fontSize, box });
  }

  // ── Parse Icons (all kind:'icon' assets) ──────────────────────────────────
  const iconTags = parseTags(code, isIcon);
  interface IconInfo { name: string; cx: number; cy: number; scale: number; box: Box }
  const icons: IconInfo[] = [];
  for (const t of iconTags) {
    const cx = numProp(t.attrs, 'cx');
    const cy = numProp(t.attrs, 'cy');
    if (cx === undefined || cy === undefined) continue;
    const scale = numProp(t.attrs, 'scale') ?? 1;
    let b = iconBox(t.name, cx, cy, scale);
    // Parametric icons (SpeechBubble, etc.) may have explicit width/height props
    // instead of a registry defaultBox. Construct a box from those.
    if (!b) {
      const w = numProp(t.attrs, 'width');
      const h = numProp(t.attrs, 'height');
      if (w !== undefined && h !== undefined) {
        b = { x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2 + 14 };
      }
    }
    if (!b) continue;
    icons.push({ name: t.name, cx, cy, scale, box: b });
  }

  // ── Parse Diagrams ───────────────────────────────────────────────────────
  const diagramTags = parseTags(code, isDiagram);
  interface DiagramInfo { name: string; cx: number; cy: number; box: Box }
  const diagrams: DiagramInfo[] = [];
  for (const t of diagramTags) {
    const cx = numProp(t.attrs, 'cx') ?? 960;
    const cy = numProp(t.attrs, 'cy') ?? 540;
    let box: Box;
    if (t.name === 'AgentCoordination') {
      const radius = numProp(t.attrs, 'radius');
      const maxWidth = numProp(t.attrs, 'maxWidth');
      const agents = arrayLengthProp(t.attrs, 'agents');
      const pattern = strProp(t.attrs, 'pattern') as 'supervisor' | 'hierarchical' | 'peer' | undefined;
      box = agentCoordinationBox({ cx, cy, radius, agents, pattern, maxWidth });
    } else {
      const radius = numProp(t.attrs, 'radius');
      const width = numProp(t.attrs, 'width');
      box = genericDiagramBox({ cx, cy, radius, width });
    }
    diagrams.push({ name: t.name, cx, cy, box });
  }

  // ── Existing check: bare HandWrittenText inside a no-rows SketchBox ──────
  for (const t of texts) {
    for (const b of boxes) {
      if (b.rows) continue;
      const explicitHeight = b.explicitHeight ?? 0;
      if (explicitHeight === 0) continue;
      if (t.x >= b.x && t.x <= b.x + b.width &&
          t.y >= b.y && t.y <= b.y + explicitHeight) {
        errors.push(
          `Layout: HandWrittenText at (${t.x},${t.y}) is inside SketchBox ` +
          `at (${b.x},${b.y}, ${b.width}×${explicitHeight}) which does not use the rows prop. ` +
          `Use SketchBox's rows prop for auto-layout instead of positioning text manually.`,
        );
      }
    }
  }

  // ── Icon ↔ HandWrittenText overlap ───────────────────────────────────────
  for (const icon of icons) {
    for (const t of texts) {
      if (intersects(icon.box, t.box)) {
        errors.push(
          `Layout: ${icon.name} bbox ${fmtBox(icon.box)} (cx=${icon.cx}, cy=${icon.cy}, scale=${icon.scale}) ` +
          `overlaps HandWrittenText "${t.text.slice(0, 40)}${t.text.length > 40 ? '…' : ''}" bbox ${fmtBox(t.box)}. ` +
          `Move the icon further from the text or reduce its scale.`,
        );
      }
    }
  }

  // ── Icon ↔ SketchBox overlap ─────────────────────────────────────────────
  for (const icon of icons) {
    for (const b of boxes) {
      if (intersects(icon.box, b.box)) {
        errors.push(
          `Layout: ${icon.name} bbox ${fmtBox(icon.box)} (cx=${icon.cx}, cy=${icon.cy}) ` +
          `overlaps SketchBox bbox ${fmtBox(b.box)}. ` +
          `Place the icon outside the box, or include the icon as part of the box's row content.`,
        );
      }
    }
  }

  // ── Diagram ↔ Diagram overlap ────────────────────────────────────────────
  for (let i = 0; i < diagrams.length; i++) {
    for (let j = i + 1; j < diagrams.length; j++) {
      if (intersects(diagrams[i].box, diagrams[j].box)) {
        errors.push(
          `Layout: ${diagrams[i].name} (cx=${diagrams[i].cx}) bbox ${fmtBox(diagrams[i].box)} overlaps ` +
          `${diagrams[j].name} (cx=${diagrams[j].cx}) bbox ${fmtBox(diagrams[j].box)}. ` +
          `Increase the gap between cx values, shrink radius, or pass maxWidth to constrain extent.`,
        );
      }
    }
  }

  // ── Diagram safe-zone overflow ───────────────────────────────────────────
  for (const d of diagrams) {
    if (!inSafeZone(d.box)) {
      errors.push(
        `Layout: ${d.name} bbox ${fmtBox(d.box)} extends outside safe zone (120,120)→(1800,960). ` +
        `Move cx/cy inward or shrink radius.`,
      );
    }
  }

  return errors;
}

function validateLayout(code: string): string[] {
  const scenes = sliceScenes(code);
  const errors: string[] = [];
  for (const scene of scenes) errors.push(...validateLayoutInScope(scene));
  return errors;
}

// ── File writers ─────────────────────────────────────────────────────

function writeGeneratedFiles(tsxCode: string): void {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  // Remove stale NarratedVideo.tsx from previous runs to avoid typecheck errors
  const narratedPath = path.join(GENERATED_DIR, 'NarratedVideo.tsx');
  if (fs.existsSync(narratedPath)) fs.unlinkSync(narratedPath);

  fs.writeFileSync(path.join(GENERATED_DIR, 'GeneratedVideo.tsx'), tsxCode);

  const rootTsx = `import React from 'react';
import { Composition } from 'remotion';
import { GeneratedVideo, durationInFrames } from './GeneratedVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GeneratedVideo"
        component={GeneratedVideo}
        durationInFrames={durationInFrames}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
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
  ttsProvider?: string;
  ttsCharacters?: number;
  ttsCostUsd?: number;
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
  const userContent = `Create a whiteboard video on this topic:\n\n${state.prompt}\n\nUse findAsset to discover diagrams/icons, then call submitPlan to validate your layout before emitting the complete TSX file inside a single \`\`\`tsx code block. Follow the system prompt rules exactly.`;

  const priorMessages: BaseMessage[] | undefined =
    state.attempt === 0 ? undefined : state.messages;

  const attemptLabel = state.attempt === 0 ? '1/2' : '2/2';
  const endNode = time('node.generate', attemptLabel, {
    attempt: state.attempt,
    model: MODEL,
  });
  if (state.attempt === 0) {
    log('llm.systemPrompt', 'loaded', { systemPrompt: state.systemPrompt });
  }
  log('llm.userPrompt', attemptLabel, { userPrompt: userContent, replayingPriorMessages: !!priorMessages });

  const result = await runAgent({
    model,
    systemPrompt: state.systemPrompt,
    userPrompt: userContent,
    priorMessages,
    visualFit: state.visualFit,
    onIteration: ({ iteration, toolCalls, elapsedMs }) => {
      const tag = toolCalls > 0 ? `→ ${toolCalls} tool call${toolCalls === 1 ? '' : 's'}` : '→ final';
      console.log(`  · iter ${iteration} ${tag} (${(elapsedMs / 1000).toFixed(1)}s)`);
    },
  });

  endNode({
    iterations: result.iterations,
    toolCallCount: result.toolCallCount,
    cost: formatCost(
      result.usage.input,
      result.usage.output,
      result.usage.cacheRead,
      result.usage.cacheCreation,
    ),
  });

  return {
    responseText: result.finalText,
    messages: result.messages,
    totalInputTokens: state.totalInputTokens + result.usage.input,
    totalOutputTokens: state.totalOutputTokens + result.usage.output,
    cacheReadTokens: state.cacheReadTokens + result.usage.cacheRead,
    cacheCreationTokens: state.cacheCreationTokens + result.usage.cacheCreation,
  };
}

async function validateNode(state: typeof GraphState.State) {
  const endNode = time('node.validate', `attempt ${state.attempt}`);
  const tsxCode = extractTsx(state.responseText);
  const exportErrors = validateRequiredExports(tsxCode);
  const layoutErrors = validateLayout(tsxCode);

  writeGeneratedFiles(tsxCode);
  const tcResult = typecheckGenerated();

  const ok = exportErrors.length === 0 && layoutErrors.length === 0 && tcResult.ok;
  if (ok) {
    console.log(`  ✓ TypeScript check passed${state.attempt === 0 ? ' on first attempt' : ' after retry'}.`);
    endNode({ ok: true });
  } else {
    endNode({ ok: false });
    log('validate.fail', `attempt ${state.attempt}`, {
      exportErrors,
      layoutErrors,
      typecheckErrors: tcResult.ok ? '' : (tcResult as { ok: false; errors: string }).errors,
    });
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
  const endNode = time('node.prepareRetry', `attempt ${state.attempt}`, {
    attempt: state.attempt,
  });
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

  const retryMessage = new HumanMessage(
    `Your previous output failed validation:\n\n${feedback.join('\n\n')}\n\nFix ALL issues and re-emit the COMPLETE TSX file in a single \`\`\`tsx block. Do not explain — just emit the fixed code.`,
  );

  log('retry.prepare', `retrying with feedback`, {
    attempt: state.attempt,
    feedback: feedback.join('\n\n'),
    retryMessage: retryMessage.content as string,
  });

  endNode();
  return {
    messages: [...state.messages, retryMessage],
  };
}

// ── Narration cue extraction ─────────────────────────────────────────

interface ParsedCue {
  id: string;
  sceneIndex: number;
  text: string;
  order: number;
}

function parseNarrationCues(code: string): ParsedCue[] {
  const match = code.match(
    /export\s+const\s+narrationCues\s*(?::\s*[^=]+)?\s*=\s*(\[[\s\S]*?\]);/,
  );
  if (!match) return [];

  try {
    const raw = match[1].trim();
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = new Function('"use strict"; return ' + raw)();
    }
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry: any, i: number): ParsedCue => ({
        id: String(entry.id ?? ''),
        sceneIndex: Number(entry.sceneIndex ?? 0),
        text: String(entry.text ?? ''),
        order: Number(entry.order ?? i),
      }))
      .filter((c: ParsedCue) => c.id && c.text);
  } catch {
    console.warn('  ⚠ Could not parse narrationCues export — skipping TTS.');
    return [];
  }
}

function groupCuesByScene(cues: ParsedCue[]): SceneCueGroup[] {
  const ordered = [...cues].sort((a, b) => a.order - b.order);
  const map = new Map<number, Array<{ id: string; text: string }>>();
  for (const c of ordered) {
    if (!map.has(c.sceneIndex)) map.set(c.sceneIndex, []);
    map.get(c.sceneIndex)!.push({ id: c.id, text: c.text });
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([sceneIndex, cuesInScene]) => ({ sceneIndex, cues: cuesInScene }));
}

async function extractNarrationNode(state: typeof GraphState.State) {
  if (state.noNarration) return { sceneCueGroups: [] };

  const cues = parseNarrationCues(state.tsxCode);
  const groups = groupCuesByScene(cues);
  if (groups.length === 0) {
    console.log('\n▶ No narrationCues export found — skipping TTS.');
  } else {
    const totalCues = groups.reduce((n, g) => n + g.cues.length, 0);
    console.log(`\n▶ Extracted ${totalCues} cue(s) across ${groups.length} scene(s).`);
  }
  return { sceneCueGroups: groups };
}

// ── Patching the generated TSX with real frames + CueProvider ────────

function ensureCueProviderImport(code: string): string {
  if (/\bCueProvider\b/.test(code)) return code;

  const importRe = /import\s*\{\s*([^}]*)\}\s*from\s*'(\.\.\/)?shared\/components'\s*;?/;
  const m = code.match(importRe);
  if (m) {
    const current = m[1].trim().replace(/,\s*$/, '');
    const replacement = `import { ${current}, CueProvider } from '${m[2] || ''}shared/components';`;
    return code.replace(importRe, replacement);
  }
  return `import { CueProvider } from '../shared/components';\n${code}`;
}

function renderCueMapConst(cueMap: CueMap): string {
  const entries = Object.entries(cueMap)
    .sort(([, a], [, b]) => a - b)
    .map(([id, frame]) => `  ${JSON.stringify(id)}: ${frame},`)
    .join('\n');
  return `\nconst CUE_MAP: Record<string, number> = {\n${entries}\n};\n\n`;
}

function wrapReturnWithCueProvider(code: string): string {
  // Insert <CueProvider> opening right after `return (` + whitespace + first `<`.
  // The matching close is anchored on `</AbsoluteFill>\s*\)\s*;`. If the open
  // matches but no close does (e.g. an inner nested AbsoluteFill threw our
  // regex off), revert to avoid leaving an unclosed <CueProvider>.
  const opened = code.replace(
    /return\s*\(\s*<AbsoluteFill/,
    `return (\n    <CueProvider cueMap={CUE_MAP}>\n      <AbsoluteFill`,
  );
  if (opened === code) return code;
  const closed = opened.replace(
    /<\/AbsoluteFill>\s*\)\s*;/,
    `</AbsoluteFill>\n    </CueProvider>\n  );`,
  );
  if (closed === opened) {
    console.warn('  ⚠ Could not find `</AbsoluteFill>);` to close CueProvider — reverting wrap. Narration cue sync will be disabled.');
    return code;
  }
  return closed;
}

function patchGeneratedVideoTsx(
  cueMap: CueMap,
  sceneStartFrame: number[],
  sceneEndFrame: number[],
  totalFrames: number,
): void {
  const genPath = path.join(GENERATED_DIR, 'GeneratedVideo.tsx');
  let code = fs.readFileSync(genPath, 'utf-8');

  // 1. Replace durationInFrames export with the real total.
  code = code.replace(
    /export\s+const\s+durationInFrames\s*=\s*[^;]+;/,
    `export const durationInFrames = ${totalFrames};`,
  );

  // 2. Replace each <Scene …> opening tag in file order. Matches any attribute
  //    ordering so long as both startFrame and endFrame appear as props.
  let sceneIdx = 0;
  code = code.replace(/<Scene\b([^>]*)>/g, (full, attrs) => {
    if (!/\bstartFrame=/.test(attrs) || !/\bendFrame=/.test(attrs)) return full;
    const start = sceneStartFrame[sceneIdx] ?? 0;
    const end = sceneEndFrame[sceneIdx] ?? 0;
    sceneIdx++;
    return `<Scene startFrame={${start}} endFrame={${end}}>`;
  });
  if (sceneIdx !== sceneStartFrame.length) {
    console.warn(
      `  ⚠ Patched ${sceneIdx} <Scene> tags but computed bounds for ${sceneStartFrame.length} scenes. Check the generated TSX.`,
    );
  }

  // 3. Import CueProvider.
  code = ensureCueProviderImport(code);

  // 4. Inject (or replace) the CUE_MAP constant immediately before GeneratedVideo.
  const cueMapBlock = renderCueMapConst(cueMap);
  const existingCueMapRe = /\nconst CUE_MAP: Record<string, number> = \{[\s\S]*?\};\n\n/;
  if (existingCueMapRe.test(code)) {
    code = code.replace(existingCueMapRe, cueMapBlock);
  } else {
    code = code.replace(
      /(export\s+const\s+GeneratedVideo\s*[:=])/,
      `${cueMapBlock}$1`,
    );
  }

  // 5. Wrap the returned JSX with <CueProvider cueMap={CUE_MAP}>.
  code = wrapReturnWithCueProvider(code);

  fs.writeFileSync(genPath, code);
}

function writeNarratedVideoTsx(
  results: SceneSynthesisResult[],
  sceneContentStart: number[],
  sceneIndexList: number[],
): void {
  const sequences = results
    .map((r, i) => {
      if (!r.audioPath) return '';
      const from = sceneContentStart[i] ?? 0;
      const durationInFrames = Math.max(1, Math.round((r.durationMs / 1000) * 30));
      return `      <Sequence from={${from}} durationInFrames={${durationInFrames}}>
        <Audio src={staticFile('audio/scene-${sceneIndexList[i]}.mp3')} />
      </Sequence>`;
    })
    .filter(Boolean)
    .join('\n');

  if (!sequences) return;

  const narratedTsx = `import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { GeneratedVideo } from './GeneratedVideo';

export const NarratedVideo: React.FC = () => (
  <>
    <GeneratedVideo />
${sequences}
  </>
);
`;
  fs.writeFileSync(path.join(GENERATED_DIR, 'NarratedVideo.tsx'), narratedTsx);
}

async function generateAudioNode(state: typeof GraphState.State) {
  if (state.noNarration || state.sceneCueGroups.length === 0) {
    return { sceneAudioResults: [], cueMap: {}, totalFramesOverride: 0 };
  }

  const totalCues = state.sceneCueGroups.reduce((n, g) => n + g.cues.length, 0);
  console.log(`\n▶ Generating narration audio (${totalCues} cues across ${state.sceneCueGroups.length} scenes, provider: ${state.ttsProvider})…`);

  try {
    const results = await generateCuedAudio(state.sceneCueGroups, {
      provider: state.ttsProvider,
      voice: state.ttsVoice || undefined,
      outputDir: AUDIO_DIR,
    });

    const successful = results.filter((r) => r.audioPath);
    console.log(`  ✓ Generated ${successful.length}/${results.length} scene audio files.`);

    if (successful.length === 0) {
      return { sceneAudioResults: results, cueMap: {}, totalFramesOverride: 0 };
    }

    const timing = buildCueTiming(successful);

    const sceneIndexList = successful.map((r) => r.sceneIndex);
    patchGeneratedVideoTsx(
      timing.cueMap,
      timing.sceneStartFrame,
      timing.sceneEndFrame,
      timing.totalFrames,
    );
    writeNarratedVideoTsx(successful, timing.sceneContentStart, sceneIndexList);

    console.log(`  ℹ Video duration: ${timing.totalFrames} frames (${(timing.totalFrames / 30).toFixed(1)}s), ${Object.keys(timing.cueMap).length} cue timings applied.`);

    return {
      sceneAudioResults: results,
      cueMap: timing.cueMap,
      totalFramesOverride: timing.totalFrames,
    };
  } catch (err: any) {
    console.warn(`\n⚠ TTS generation failed: ${err.message} — rendering without narration.`);
    return { sceneAudioResults: [], cueMap: {}, totalFramesOverride: 0 };
  }
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
    .addNode('extractNarration', extractNarrationNode)
    .addNode('generateAudio', generateAudioNode)
    .addEdge(START, 'generate')
    .addEdge('generate', 'validate')
    .addConditionalEdges('validate', (state) => {
      const hasErrors = !state.typecheckOk
        || state.exportErrors.length > 0
        || state.layoutErrors.length > 0;

      if (hasErrors && state.attempt < 2) {
        return 'prepareRetry';
      }
      return 'extractNarration';
    })
    .addEdge('prepareRetry', 'generate')
    .addEdge('extractNarration', 'generateAudio')
    .addEdge('generateAudio', END);

  return graph.compile();
}

// ── Main ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const startTime = Date.now();
  const { prompt, noRender, noNarration, ttsProvider, ttsVoice, visualFit } = parseArgs();

  console.log(`\n▶ Prompt: "${prompt}"`);
  console.log(`▶ Model:  ${MODEL}`);
  if (visualFit) console.log('▶ Visual-fit: ON (preview PNGs attached to findAsset results)');
  if (!noNarration) {
    console.log(`▶ TTS:    ${ttsProvider}${ttsVoice ? ` (voice: ${ttsVoice})` : ''}`);
  }

  const skill = loadSystemPrompt();
  const promptSource = fs.existsSync(PROMPT_DIR) ? path.relative(PROJECT_ROOT, PROMPT_DIR) : path.relative(PROJECT_ROOT, SKILL_PATH);
  console.log(`▶ Skill:  ${skill.length} chars loaded from ${promptSource}`);

  const app = buildGraph();

  const endPipeline = time('pipeline', 'run', { topic: prompt });
  let finalState;
  try {
    finalState = await app.invoke({
      prompt,
      systemPrompt: skill,
      noRender,
      noNarration,
      visualFit,
      ttsProvider,
      ttsVoice,
    });
  } finally {
    endPipeline();
  }

  const {
    tsxCode, typecheckOk, exportErrors, layoutErrors,
    totalInputTokens, totalOutputTokens,
    cacheReadTokens, cacheCreationTokens,
    typecheckErrors, sceneAudioResults,
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
  const hasAudio = sceneAudioResults && sceneAudioResults.some((r: SceneSynthesisResult) => r.audioPath);

  if (!noRender && typecheckOk && exportErrors.length === 0 && layoutErrors.length === 0) {
    // If we have narrated audio, rewrite Root.tsx to include NarratedVideo composition
    if (hasAudio) {
      const narratedRootTsx = `import React from 'react';
import { Composition } from 'remotion';
import { GeneratedVideo, durationInFrames } from './GeneratedVideo';
import { NarratedVideo } from './NarratedVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GeneratedVideo"
        component={GeneratedVideo}
        durationInFrames={durationInFrames}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NarratedVideo"
        component={NarratedVideo}
        durationInFrames={durationInFrames}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
`;
      fs.writeFileSync(path.join(GENERATED_DIR, 'Root.tsx'), narratedRootTsx);
    }

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const compositionId = hasAudio ? 'NarratedVideo' : 'GeneratedVideo';
    const outMp4 = path.join(OUT_DIR, 'generated.mp4');
    console.log(`\n▶ Rendering ${compositionId} → ${path.relative(PROJECT_ROOT, outMp4)}`);
    try {
      execSync(
        `npx remotion render src/generated/index.tsx ${compositionId} ${outMp4} --log=error`,
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

  // TTS cost calculation
  const ttsCharacters = (sceneAudioResults || []).reduce((sum: number, r: SceneSynthesisResult) => sum + (r.characters || 0), 0);
  const ttsCostPerMChar = TTS_COST_PER_MCHAR[ttsProvider] ?? 20.0;
  const ttsCostUsd = (ttsCharacters / 1_000_000) * ttsCostPerMChar;
  const totalCostUsd = thisRun.total + ttsCostUsd;

  appendCostLog({
    timestamp: new Date().toISOString(),
    model: MODEL,
    prompt: prompt.slice(0, 200),
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    cacheReadTokens: cacheReadTokens || undefined,
    cacheCreationTokens: cacheCreationTokens || undefined,
    costUsd: totalCostUsd,
    elapsedSec: Number(elapsedSec.toFixed(1)),
    ttsProvider: ttsCharacters > 0 ? ttsProvider : undefined,
    ttsCharacters: ttsCharacters || undefined,
    ttsCostUsd: ttsCostUsd > 0 ? ttsCostUsd : undefined,
  });

  const cumulative = readCumulativeCost();

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  This run:   ${elapsedSec.toFixed(1)}s`);
  console.log(`              ${formatCost(totalInputTokens, totalOutputTokens, cacheReadTokens, cacheCreationTokens)}`);
  if (ttsCharacters > 0) {
    console.log(`              TTS: ${ttsCharacters} chars / $${ttsCostUsd.toFixed(4)} (${ttsProvider})`);
    console.log(`              Total: $${totalCostUsd.toFixed(4)}`);
  }
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
