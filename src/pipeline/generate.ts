import * as dotenv from 'dotenv';
dotenv.config();

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { runAuthorWithRetry } from './roles/author';
import { runScriptwriterWithRetry } from './roles/scriptwriter';
import { runArtDirectorWithRetry } from './roles/art-director';
import { runAnimatorWithRetry, type AnimatorOutput } from './roles/animator';
import { renderToFiles } from './roles/renderer';
import { log } from './logger';
import { CostTracker } from './cost-tracker';
import type { StoryOutline, Script, VisualDirection } from './types';

const ROLES = ['author', 'scriptwriter', 'art-director', 'animator', 'renderer'] as const;
type RoleName = (typeof ROLES)[number];

const DEFAULT_INPUT_FILE = 'input.txt';

function readInputFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8').trim();
}

function parseArgs(): {
  message?: string;
  from?: RoleName;
  input?: string;
  noRender: boolean;
} {
  const args = process.argv.slice(2);
  let message: string | undefined;
  let from: RoleName | undefined;
  let input: string | undefined;
  let noRender = false;
  let promptFile: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) {
      from = args[++i] as RoleName;
    } else if (args[i].startsWith('--from=')) {
      from = args[i].split('=')[1] as RoleName;
    } else if (args[i] === '--input' && args[i + 1]) {
      input = args[++i];
    } else if (args[i].startsWith('--input=')) {
      input = args[i].split('=')[1];
    } else if (args[i] === '--prompt' && args[i + 1]) {
      promptFile = args[++i];
    } else if (args[i].startsWith('--prompt=')) {
      promptFile = args[i].split('=')[1];
    } else if (args[i] === '--no-render') {
      noRender = true;
    } else if (!args[i].startsWith('--')) {
      message = args[i];
    }
  }

  // If no inline message, read from file
  if (!message && !from) {
    const filePath = promptFile || path.resolve(process.cwd(), DEFAULT_INPUT_FILE);
    message = readInputFile(filePath);
  }

  return { message, from, input, noRender };
}

function ensureOutDir(): string {
  const outDir = path.resolve(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

function saveArtifact(outDir: string, filename: string, data: unknown): void {
  const filePath = path.join(outDir, filename);
  let content: string;
  if (typeof data === 'string') {
    content = data;
  } else {
    content = JSON.stringify(data, null, 2);
  }
  fs.writeFileSync(filePath, content);
  log.roleSavedArtifact(filename, Buffer.byteLength(content));
}

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

async function main(): Promise<void> {
  const pipelineStart = Date.now();
  const { message, from, input, noRender } = parseArgs();
  const outDir = ensureOutDir();
  const generatedDir = path.resolve(process.cwd(), 'src', 'generated');

  let startRole: RoleName = 'author';
  let storyOutline: StoryOutline | undefined;
  let script: Script | undefined;
  let visualDirection: VisualDirection | undefined;
  let animatorOutput: AnimatorOutput | undefined;

  if (from) {
    startRole = from;
    if (from === 'scriptwriter') {
      const inputPath = input || path.join(outDir, '1-story-outline.json');
      storyOutline = loadJson<StoryOutline>(inputPath);
      log.pipelineResuming('Scriptwriter', inputPath);
    } else if (from === 'art-director') {
      const inputPath = input || path.join(outDir, '2-script.json');
      script = loadJson<Script>(inputPath);
      log.pipelineResuming('Art Director', inputPath);
    } else if (from === 'animator') {
      script = loadJson<Script>(path.join(outDir, '2-script.json'));
      const inputPath = input || path.join(outDir, '3-visual-direction.json');
      visualDirection = loadJson<VisualDirection>(inputPath);
      log.pipelineResuming('Animator', inputPath);
    } else if (from === 'renderer') {
      const inputPath = input || path.join(outDir, '4-generated-video.tsx');
      const code = fs.readFileSync(inputPath, 'utf-8');
      const endFrameMatches = [...code.matchAll(/endFrame=\{(\d+)\}/g)];
      const durationInFrames = endFrameMatches.length > 0
        ? Math.max(...endFrameMatches.map((m) => parseInt(m[1])))
        : 900;
      animatorOutput = { code, durationInFrames, sceneCount: 0 };
      log.pipelineResuming('Renderer', inputPath);
    }
  } else if (!message) {
    console.error(
      'Usage:\n' +
        '  npm run generate                              Read prompt from input.txt\n' +
        '  npm run generate -- --prompt=my-idea.txt      Read prompt from custom file\n' +
        '  npm run generate -- "Your idea here"          Inline prompt\n' +
        '  npm run generate -- --from=art-director       Re-run from a role\n' +
        '  npm run generate -- --no-render               Skip MP4 render\n' +
        '\n' +
        'Set ANTHROPIC_API_KEY in .env or as an environment variable.'
    );
    process.exit(1);
  } else {
    log.pipelineStart(message);
  }

  const client = new Anthropic();
  const costTracker = new CostTracker();
  const startIndex = ROLES.indexOf(startRole);

  // ── Role 1: Author ──────────────────────────────────────────────────────
  if (startIndex <= 0 && !storyOutline) {
    log.roleStart(1, 'Author');
    storyOutline = await runAuthorWithRetry(client, message!, costTracker);
    log.authorResult(
      storyOutline.title,
      storyOutline.logline,
      storyOutline.beats.length,
      storyOutline.arc.type
    );
    log.authorBeats(storyOutline.beats);
    saveArtifact(outDir, '1-story-outline.json', storyOutline);
    log.roleComplete('Author', `"${storyOutline.title}" — ${storyOutline.beats.length} beats, arc: ${storyOutline.arc.type}`);
  }

  // ── Role 2: Scriptwriter ────────────────────────────────────────────────
  if (startIndex <= 1 && !script) {
    log.roleStart(2, 'Scriptwriter');
    script = await runScriptwriterWithRetry(client, storyOutline!, costTracker);
    log.scriptwriterResult(script.scenes.length, Object.keys(script.terminology).length);
    log.scriptwriterScenes(script.scenes.map((s) => ({
      scene_number: s.scene_number,
      scene_type: s.scene_type,
      heading: s.heading,
      pacing: s.pacing,
    })));
    saveArtifact(outDir, '2-script.json', script);
    log.roleComplete('Scriptwriter', `${script.scenes.length} scenes, ${Object.keys(script.terminology).length} terminology entries`);
  }

  // ── Role 3: Art Director ────────────────────────────────────────────────
  if (startIndex <= 2 && !visualDirection) {
    log.roleStart(3, 'Art Director');
    visualDirection = await runArtDirectorWithRetry(client, script!, costTracker);
    log.artDirectorResult(
      visualDirection.global_style.mood,
      visualDirection.global_style.accent_color,
      visualDirection.global_style.color_assignments,
      visualDirection.scenes.length
    );
    log.artDirectorSceneCompositions(visualDirection.scenes.map((s) => ({
      scene_number: s.scene_number,
      composition: s.composition,
      density: s.density,
      imageCount: s.imagery.length,
    })));
    saveArtifact(outDir, '3-visual-direction.json', visualDirection);
    log.roleComplete('Art Director', `${visualDirection.scenes.length} scenes directed, mood: ${visualDirection.global_style.mood}`);
  }

  // ── Role 4: Animator ────────────────────────────────────────────────────
  if (startIndex <= 3 && !animatorOutput) {
    log.roleStart(4, 'Animator');
    animatorOutput = await runAnimatorWithRetry(client, script!, visualDirection!, costTracker);
    saveArtifact(outDir, '4-generated-video.tsx', animatorOutput.code);
    log.roleComplete(
      'Animator',
      `${animatorOutput.sceneCount} scene components, ${animatorOutput.durationInFrames} frames (${(animatorOutput.durationInFrames / 30).toFixed(1)}s), ${(animatorOutput.code.length / 1024).toFixed(1)}KB code`
    );
  }

  // ── Role 5: Renderer ───────────────────────────────────────────────────
  log.roleStart(5, 'Renderer');
  renderToFiles(animatorOutput!, generatedDir);

  if (!noRender) {
    log.rendererStartingRemotionRender();
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx remotion render src/generated/index.tsx GeneratedVideo out/generated.mp4 --log=error`,
        { cwd: process.cwd(), stdio: 'inherit', timeout: 120000 }
      );
      log.rendererRenderSuccess('out/generated.mp4');
    } catch {
      log.rendererRenderFailed();
    }
  }

  const elapsedSecs = (Date.now() - pipelineStart) / 1000;
  log.roleComplete('Renderer', `files written to ${generatedDir}/ (total pipeline: ${elapsedSecs.toFixed(1)}s)`);

  // Log cost summary
  log.pipelineCostSummary(costTracker.summarize(), elapsedSecs);

  if (noRender) {
    log.pipelineDoneNoRender();
  } else {
    log.pipelineDone('out/generated.mp4');
  }
}

main().catch((err) => {
  log.pipelineFailed(err.message);
  process.exit(1);
});
