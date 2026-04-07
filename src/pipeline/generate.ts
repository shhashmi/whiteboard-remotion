import * as dotenv from 'dotenv';
dotenv.config();

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { runAuthorWithRetry } from './roles/author';
import { runScriptwriterWithRetry } from './roles/scriptwriter';
import { runArtDirectorWithRetry } from './roles/art-director';
import { runLayoutWithRetry } from './roles/layout';
import { runAnimateWithRetry } from './roles/animate';
import { runPolishWithRetry, type AnimatorOutput } from './roles/polish';
import { renderToFiles } from './roles/renderer';
import { log } from './logger';
import { CostTracker } from './cost-tracker';
import type { StoryOutline, Script, VisualDirection, LayoutSpec, TimedLayoutSpec } from './types';

const ROLES = ['author', 'scriptwriter', 'art-director', 'layout', 'animate', 'polish', 'renderer'] as const;
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

const TOTAL_ROLES = ROLES.length;

async function main(): Promise<void> {
  const pipelineStart = Date.now();
  const { message, from, input, noRender } = parseArgs();
  const outDir = ensureOutDir();
  const generatedDir = path.resolve(process.cwd(), 'src', 'generated');

  let startRole: RoleName = 'author';
  let storyOutline: StoryOutline | undefined;
  let script: Script | undefined;
  let visualDirection: VisualDirection | undefined;
  let layoutSpec: LayoutSpec | undefined;
  let timedLayout: TimedLayoutSpec | undefined;
  let polishOutput: AnimatorOutput | undefined;

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
    } else if (from === 'layout') {
      script = loadJson<Script>(path.join(outDir, '2-script.json'));
      const inputPath = input || path.join(outDir, '3-visual-direction.json');
      visualDirection = loadJson<VisualDirection>(inputPath);
      log.pipelineResuming('Layout', inputPath);
    } else if (from === 'animate') {
      script = loadJson<Script>(path.join(outDir, '2-script.json'));
      const inputPath = input || path.join(outDir, '4-layout.json');
      layoutSpec = loadJson<LayoutSpec>(inputPath);
      log.pipelineResuming('Animate', inputPath);
    } else if (from === 'polish') {
      visualDirection = loadJson<VisualDirection>(path.join(outDir, '3-visual-direction.json'));
      const inputPath = input || path.join(outDir, '5-timed-layout.json');
      timedLayout = loadJson<TimedLayoutSpec>(inputPath);
      log.pipelineResuming('Polish', inputPath);
    } else if (from === 'renderer') {
      const inputPath = input || path.join(outDir, '6-generated-video.tsx');
      const code = fs.readFileSync(inputPath, 'utf-8');
      const endFrameMatches = [...code.matchAll(/endFrame=\{(\d+)\}/g)];
      const durationInFrames = endFrameMatches.length > 0
        ? Math.max(...endFrameMatches.map((m) => parseInt(m[1])))
        : 900;
      polishOutput = { code, durationInFrames, sceneCount: 0 };
      log.pipelineResuming('Renderer', inputPath);
    }
  } else if (!message) {
    console.error(
      'Usage:\n' +
        '  npm run generate                              Read prompt from input.txt\n' +
        '  npm run generate -- --prompt=my-idea.txt      Read prompt from custom file\n' +
        '  npm run generate -- "Your idea here"          Inline prompt\n' +
        '  npm run generate -- --from=layout             Re-run from a role\n' +
        '  npm run generate -- --no-render               Skip MP4 render\n' +
        '\n' +
        'Roles: author, scriptwriter, art-director, layout, animate, polish, renderer\n' +
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

  // ── Role 4: Layout ─────────────────────────────────────────────────────
  if (startIndex <= 3 && !layoutSpec) {
    log.roleStart(4, 'Layout');
    layoutSpec = await runLayoutWithRetry(client, script!, visualDirection!, costTracker);
    saveArtifact(outDir, '4-layout.json', layoutSpec);
    const totalElements = layoutSpec.scenes.reduce((sum, s) => sum + s.elements.length, 0);
    log.roleComplete('Layout', `${layoutSpec.scenes.length} scenes, ${totalElements} elements positioned`);
  }

  // ── Role 5: Animate ────────────────────────────────────────────────────
  if (startIndex <= 4 && !timedLayout) {
    log.roleStart(5, 'Animate');
    timedLayout = await runAnimateWithRetry(client, layoutSpec!, script!, costTracker);
    saveArtifact(outDir, '5-timed-layout.json', timedLayout);
    log.roleComplete(
      'Animate',
      `${timedLayout.scenes.length} scenes timed, ${timedLayout.totalDurationInFrames} frames (${(timedLayout.totalDurationInFrames / 30).toFixed(1)}s)`
    );
  }

  // ── Role 6: Polish ─────────────────────────────────────────────────────
  if (startIndex <= 5 && !polishOutput) {
    log.roleStart(6, 'Polish');
    polishOutput = await runPolishWithRetry(client, timedLayout!, visualDirection!, costTracker);
    saveArtifact(outDir, '6-generated-video.tsx', polishOutput.code);
    log.roleComplete(
      'Polish',
      `${polishOutput.sceneCount} scene components, ${polishOutput.durationInFrames} frames (${(polishOutput.durationInFrames / 30).toFixed(1)}s), ${(polishOutput.code.length / 1024).toFixed(1)}KB code`
    );
  }

  // ── Role 7: Renderer ───────────────────────────────────────────────────
  log.roleStart(7, 'Renderer');
  renderToFiles(polishOutput!, generatedDir);

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
