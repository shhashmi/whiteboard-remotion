import { execFileSync } from 'child_process';

/** Get audio duration in milliseconds via ffprobe (requires ffmpeg/ffprobe on PATH). */
export function getAudioDurationMs(filePath: string): number {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'quiet',
      '-show_entries', 'format=duration',
      '-of', 'csv=p=0',
      filePath,
    ], { encoding: 'utf-8' }).trim();
    const ms = Math.round(parseFloat(out) * 1000);
    if (isNaN(ms)) throw new Error('non-numeric duration');
    return ms;
  } catch {
    console.warn('  ⚠ ffprobe not found or failed — audio duration unknown, using 0.');
    return 0;
  }
}
