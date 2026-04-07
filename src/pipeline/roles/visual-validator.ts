import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import type { AnimatorOutput } from './animator';
import { renderToFiles } from './renderer';
import { log } from '../logger';
import type { CostTracker } from '../cost-tracker';

const VISION_MODEL = 'claude-sonnet-4-20250514';
const MAX_VISION_TOKENS = 2048;

const VISION_CRITIQUE_PROMPT = `You are reviewing keyframes from an animated whiteboard explainer video (1920x1080, 30fps).

Each image is a single frame captured at a different point in the video. Evaluate ALL frames for these issues:

1. TEXT PROBLEMS: Overlapping text, text cut off by canvas edges, text too small to read, garbled characters
2. EMPTY FRAMES: Frames that are completely blank or nearly blank (only background visible) when content should be present
3. OFF-CANVAS ELEMENTS: Visual elements positioned outside the visible area or clipped at edges
4. POOR LAYOUT: Elements bunched together in one area with large empty spaces elsewhere, no visual hierarchy
5. OVERLAP/OCCLUSION: Elements stacked on top of each other making content unreadable
6. CONTRAST: Text or elements that are nearly invisible against the background

If ALL frames look acceptable (minor imperfections are OK), respond with exactly:
PASS

If there are significant issues, respond with:
FAIL
Then list each issue on its own line with format:
- [FRAME N] Category: Description of the specific problem and what should change

Be concise and actionable. Only flag issues that meaningfully hurt readability or comprehension.`;

export async function validateVisuals(
  client: Anthropic,
  animatorOutput: AnimatorOutput,
  costTracker?: CostTracker
): Promise<string | null> {
  const generatedDir = path.resolve(process.cwd(), 'src', 'generated');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-keyframes-'));

  try {
    // Write remotion files so `remotion still` can find them
    renderToFiles(animatorOutput, generatedDir);

    // Calculate keyframe positions at 10%, 30%, 50%, 70%, 90%
    const total = animatorOutput.durationInFrames;
    const positions = [0.1, 0.3, 0.5, 0.7, 0.9];
    const frames = positions.map(p => Math.round(p * total));

    log.visualValidatorRendering(frames);

    // Render each keyframe to PNG
    const renderedPaths: { frame: number; path: string }[] = [];
    for (const frame of frames) {
      const outPath = path.join(tmpDir, `keyframe-${frame}.png`);
      try {
        execSync(
          `npx remotion still src/generated/index.tsx GeneratedVideo --frame=${frame} --output="${outPath}" --log=error`,
          { cwd: process.cwd(), timeout: 30000, stdio: 'pipe' }
        );
        if (fs.existsSync(outPath)) {
          renderedPaths.push({ frame, path: outPath });
        }
      } catch (err) {
        log.visualValidatorFrameFailed(frame, (err as Error).message);
      }
    }

    if (renderedPaths.length === 0) {
      log.visualValidatorSkipped('All keyframe renders failed');
      return null;
    }

    log.visualValidatorCritiquing(renderedPaths.length);

    // Build vision message with image content blocks
    const content: Anthropic.Messages.ContentBlockParam[] = [
      { type: 'text', text: `Reviewing ${renderedPaths.length} keyframes from a ${total}-frame video (${(total / 30).toFixed(1)}s at 30fps):` },
    ];

    for (const { frame, path: imgPath } of renderedPaths) {
      const imageData = fs.readFileSync(imgPath).toString('base64');
      content.push({
        type: 'text',
        text: `\nFrame ${frame} (${(frame / 30).toFixed(1)}s):`,
      });
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/png', data: imageData },
      });
    }

    // Call vision model for critique
    const start = Date.now();
    const response = await client.messages.create({
      model: VISION_MODEL,
      max_tokens: MAX_VISION_TOKENS,
      system: VISION_CRITIQUE_PROMPT,
      messages: [{ role: 'user', content }],
    });

    const durationMs = Date.now() - start;
    log.roleLLMResponse(response.usage.input_tokens, response.usage.output_tokens, durationMs);
    costTracker?.record('VisualValidator', VISION_MODEL, response.usage.input_tokens, response.usage.output_tokens, durationMs);

    const critique = response.content[0].type === 'text' ? response.content[0].text : '';

    if (critique.trim().startsWith('PASS')) {
      log.visualValidatorPassed();
      return null;
    }

    log.visualValidatorFailed(critique);
    return critique;
  } finally {
    // Clean up temp PNGs
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}
