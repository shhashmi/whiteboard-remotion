import * as fs from 'fs';
import * as path from 'path';
import { NarrationSegment, TTSConfig, TTSResult } from './types';
import { getTTSProvider } from './provider-registry';

/**
 * Generate audio files for all narration segments.
 *
 * Each segment produces `scene-{N}.mp3` in `config.outputDir`.
 * Failures on individual segments are logged and skipped — partial
 * narration is better than no video.
 */
export async function generateAllAudio(
  segments: NarrationSegment[],
  config: TTSConfig,
): Promise<TTSResult[]> {
  const provider = getTTSProvider(config.provider);

  // Clean and recreate output directory
  if (fs.existsSync(config.outputDir)) {
    fs.rmSync(config.outputDir, { recursive: true });
  }
  fs.mkdirSync(config.outputDir, { recursive: true });

  const results: TTSResult[] = [];

  for (const segment of segments) {
    const filename = `scene-${segment.sceneIndex}.mp3`;
    const outputPath = path.join(config.outputDir, filename);

    try {
      console.log(`    Scene ${segment.sceneIndex}: "${segment.text.slice(0, 60)}…"`);
      const result = await provider.synthesize(segment.text, outputPath, {
        voice: config.voice,
        speed: config.speed,
      });
      console.log(`      ✓ ${(result.durationMs / 1000).toFixed(1)}s`);
      results.push(result);
    } catch (err: any) {
      console.warn(`      ✗ TTS failed for scene ${segment.sceneIndex}: ${err.message}`);
      results.push({ audioFilePath: '', durationMs: 0, characters: 0 });
    }
  }

  return results;
}
