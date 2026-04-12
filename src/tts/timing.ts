const MIN_RATE = 0.85;
const MAX_RATE = 1.2;

/**
 * Compute a playback rate that fits the audio into the scene duration.
 *
 * - If the natural ratio falls within [0.85, 1.2], use it directly.
 * - If audio is much shorter than the scene, play at 1.0x (silence fills the gap).
 * - If audio is much longer, cap at 1.2x (Remotion's Sequence clips the rest).
 */
export function computePlaybackRate(
  audioDurationMs: number,
  sceneDurationMs: number,
): { playbackRate: number; clipped: boolean } {
  if (sceneDurationMs <= 0 || audioDurationMs <= 0) {
    return { playbackRate: 1.0, clipped: false };
  }

  const ratio = audioDurationMs / sceneDurationMs;

  if (ratio >= MIN_RATE && ratio <= MAX_RATE) {
    return { playbackRate: ratio, clipped: false };
  }

  if (ratio < MIN_RATE) {
    // Audio much shorter — play at normal speed, silence fills remainder
    return { playbackRate: 1.0, clipped: false };
  }

  // Audio much longer — cap speed, Sequence clips the overflow
  return { playbackRate: MAX_RATE, clipped: true };
}

/** Convert frame count to milliseconds at 30 fps. */
export function framesToMs(frames: number, fps = 30): number {
  return (frames / fps) * 1000;
}

/**
 * Minimum frames a scene needs so the audio finishes before the fade-out
 * begins, with a short breathing pause in between.
 *
 * Layout:  [audio at playbackRate] + [breathingFrames] + [fadeFrames]
 *
 * When the audio is long enough to require speedup, MAX_RATE is used.
 * Otherwise the audio plays at its natural rate (1×).
 */
export function computeRequiredFrames(
  audioDurationMs: number,
  fadeFrames = 30,
  breathingFrames = 15,
  fps = 30,
): number {
  if (audioDurationMs <= 0) return 0;
  const audioSec = audioDurationMs / 1000;
  // At MAX_RATE the audio plays as fast as we allow — gives shortest duration
  const audioFrames = Math.ceil(audioSec * fps / MAX_RATE);
  return audioFrames + breathingFrames + fadeFrames;
}
