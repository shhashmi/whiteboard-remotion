/**
 * Re-run only the TTS step against the existing src/generated/GeneratedVideo.tsx.
 *
 * Use when you want to swap voice/provider without re-invoking the LLM:
 *   npx ts-node scripts/regenerate-audio.ts
 *   npx ts-node scripts/regenerate-audio.ts --voice=<id> --provider=elevenlabs
 *
 * After running, re-render the MP4 with: npm run render:generated
 */
import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import {
  TTSProviderId,
  SceneCueGroup,
  SceneSynthesisResult,
  generateCuedAudio,
  buildCueTiming,
} from '../src/tts';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const GENERATED_DIR = path.join(PROJECT_ROOT, 'src/generated');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'public/audio');
const GEN_TSX = path.join(GENERATED_DIR, 'GeneratedVideo.tsx');

function parseFlags(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

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
  const raw = match[1].trim();
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = new Function('"use strict"; return ' + raw)();
  }
  return (parsed as any[])
    .map((e, i) => ({
      id: String(e.id ?? ''),
      sceneIndex: Number(e.sceneIndex ?? 0),
      text: String(e.text ?? ''),
      order: Number(e.order ?? i),
    }))
    .filter((c) => c.id && c.text);
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

function patchExistingTsx(
  cueMap: Record<string, number>,
  sceneStartFrame: number[],
  sceneEndFrame: number[],
  totalFrames: number,
): void {
  let code = fs.readFileSync(GEN_TSX, 'utf-8');

  code = code.replace(
    /export\s+const\s+durationInFrames\s*=\s*[^;]+;/,
    `export const durationInFrames = ${totalFrames};`,
  );

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
      `  ⚠ Patched ${sceneIdx} <Scene> tags but computed bounds for ${sceneStartFrame.length} scenes.`,
    );
  }

  const entries = Object.entries(cueMap)
    .sort(([, a], [, b]) => a - b)
    .map(([id, frame]) => `  ${JSON.stringify(id)}: ${frame},`)
    .join('\n');
  const cueMapBlock = `\nconst CUE_MAP: Record<string, number> = {\n${entries}\n};\n\n`;
  const existingCueMapRe = /\nconst CUE_MAP: Record<string, number> = \{[\s\S]*?\};\n\n/;
  if (existingCueMapRe.test(code)) {
    code = code.replace(existingCueMapRe, cueMapBlock);
  } else {
    throw new Error('GeneratedVideo.tsx has no existing CUE_MAP — run `npm run generate` first.');
  }

  fs.writeFileSync(GEN_TSX, code);
}

function writeNarratedVideoTsx(
  results: SceneSynthesisResult[],
  sceneContentStart: number[],
): void {
  const sequences = results
    .map((r, i) => {
      if (!r.audioPath) return '';
      const from = sceneContentStart[i] ?? 0;
      const durationInFrames = Math.max(1, Math.round((r.durationMs / 1000) * 30));
      return `      <Sequence from={${from}} durationInFrames={${durationInFrames}}>
        <Audio src={staticFile('audio/scene-${r.sceneIndex}.mp3')} />
      </Sequence>`;
    })
    .filter(Boolean)
    .join('\n');
  if (!sequences) return;
  const tsx = `import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { GeneratedVideo } from './GeneratedVideo';

export const NarratedVideo: React.FC = () => (
  <>
    <GeneratedVideo />
${sequences}
  </>
);
`;
  fs.writeFileSync(path.join(GENERATED_DIR, 'NarratedVideo.tsx'), tsx);
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const provider = (flags.provider as TTSProviderId) || 'elevenlabs';
  const voice = flags.voice || undefined;

  if (!fs.existsSync(GEN_TSX)) {
    throw new Error(`Missing ${GEN_TSX} — run \`npm run generate\` first.`);
  }
  const code = fs.readFileSync(GEN_TSX, 'utf-8');
  const cues = parseNarrationCues(code);
  if (cues.length === 0) throw new Error('No narrationCues found in GeneratedVideo.tsx.');
  const groups = groupCuesByScene(cues);

  console.log(
    `▶ Re-synthesising ${cues.length} cues across ${groups.length} scenes (provider=${provider}, voice=${voice ?? '<default>'}).`,
  );

  const results = await generateCuedAudio(groups, {
    provider,
    voice,
    outputDir: AUDIO_DIR,
  });
  const successful = results.filter((r) => r.audioPath);
  console.log(`  ✓ Generated ${successful.length}/${results.length} scene audio files.`);
  if (successful.length === 0) throw new Error('No audio generated — see error logs above.');

  const timing = buildCueTiming(successful);
  patchExistingTsx(
    timing.cueMap,
    timing.sceneStartFrame,
    timing.sceneEndFrame,
    timing.totalFrames,
  );
  writeNarratedVideoTsx(successful, timing.sceneContentStart);

  console.log(
    `  ✓ Patched ${GEN_TSX} → ${timing.totalFrames} frames (${(timing.totalFrames / 30).toFixed(1)}s), ${Object.keys(timing.cueMap).length} cues.`,
  );
  console.log(`  ✓ Updated NarratedVideo.tsx with new audio sequence boundaries.`);
  console.log(`\nNext: npm run render:generated`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
