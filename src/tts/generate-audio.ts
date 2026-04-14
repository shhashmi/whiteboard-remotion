import * as fs from 'fs';
import * as path from 'path';
import { SceneCueGroup, SceneSynthesisResult, TTSConfig } from './types';
import { getTimedTTSProvider } from './provider-registry';

/** Synthesize one MP3 per scene, with cue timings for every cue inside.
 *  Scenes with no cues are skipped.  Failures on a single scene produce
 *  an empty result (audioPath: '') — partial narration is better than none. */
export async function generateCuedAudio(
  scenes: SceneCueGroup[],
  config: TTSConfig,
): Promise<SceneSynthesisResult[]> {
  const provider = getTimedTTSProvider(config.provider);

  if (fs.existsSync(config.outputDir)) {
    fs.rmSync(config.outputDir, { recursive: true });
  }
  fs.mkdirSync(config.outputDir, { recursive: true });

  const results: SceneSynthesisResult[] = [];

  for (const scene of scenes) {
    if (scene.cues.length === 0) continue;
    const outPath = path.join(config.outputDir, `scene-${scene.sceneIndex}.mp3`);
    try {
      const firstSnippet = scene.cues[0].text.slice(0, 60);
      console.log(`    Scene ${scene.sceneIndex} (${scene.cues.length} cues): "${firstSnippet}…"`);
      const result = await provider.synthesizeScene({
        sceneIndex: scene.sceneIndex,
        cues: scene.cues,
        voice: config.voice,
        outPath,
      });
      console.log(`      ✓ ${(result.durationMs / 1000).toFixed(1)}s, ${result.cueTimings.length} cue timings`);
      results.push(result);
    } catch (err: any) {
      console.warn(`      ✗ TTS failed for scene ${scene.sceneIndex}: ${err.message}`);
      results.push({
        sceneIndex: scene.sceneIndex,
        audioPath: '',
        durationMs: 0,
        characters: 0,
        cueTimings: [],
      });
    }
  }

  return results;
}
