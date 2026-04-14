import { CueMap, CueTiming, SceneSynthesisResult } from './types';
import { msToFrames } from './timing';

export interface CueTimingOptions {
  fps?: number;
  /** Blank frames before the first cue of each scene (lets the fade-in start
   *  before the narrator speaks). */
  preRollFrames?: number;
  /** Blank frames between end of last cue and scene fade-out begins. */
  breathingFrames?: number;
  /** Scene fade-out length in frames (matches <Scene> component). */
  fadeFrames?: number;
  /** Fallback drawDuration for the tail of the last cue in each scene. */
  tailDrawFrames?: number;
}

export interface CueTimingResult {
  cueMap: CueMap;
  /** Absolute frame at which each scene's content begins (= first cue frame). */
  sceneContentStart: number[];
  /** Absolute frame at which each scene starts (including pre-roll + fade-in). */
  sceneStartFrame: number[];
  /** Absolute frame at which each scene ends (incl. breathing + fade-out). */
  sceneEndFrame: number[];
  /** Duration (frames) of each scene's MP3 at scene playback rate. */
  sceneAudioFrames: number[];
  totalFrames: number;
}

/** Build a global cueMap from per-scene synthesis results.
 *  Scenes play back-to-back: each scene begins at the previous scene's
 *  endFrame + 1.  Within a scene, each cue's frame = sceneContentStart
 *  + msToFrames(cueTiming.timeMs). */
export function buildCueTiming(
  scenes: SceneSynthesisResult[],
  opts: CueTimingOptions = {},
): CueTimingResult {
  const fps = opts.fps ?? 30;
  const preRoll = opts.preRollFrames ?? 15;
  const breathing = opts.breathingFrames ?? 15;
  const fade = opts.fadeFrames ?? 30;
  const tailDraw = opts.tailDrawFrames ?? 20;

  const cueMap: CueMap = {};
  const sceneContentStart: number[] = [];
  const sceneStartFrame: number[] = [];
  const sceneEndFrame: number[] = [];
  const sceneAudioFrames: number[] = [];

  // Sort scenes by sceneIndex to guarantee temporal order.
  const ordered = [...scenes].sort((a, b) => a.sceneIndex - b.sceneIndex);

  let cursor = 0;
  for (const scene of ordered) {
    const audioFrames = msToFrames(scene.durationMs, fps);
    sceneAudioFrames.push(audioFrames);

    const sceneStart = cursor;
    const contentStart = sceneStart + preRoll;
    sceneStartFrame.push(sceneStart);
    sceneContentStart.push(contentStart);

    for (const t of scene.cueTimings) {
      cueMap[t.id] = contentStart + msToFrames(t.timeMs, fps);
    }

    // Scene ends at contentStart + audioFrames + tailDraw + breathing + fade
    const sceneEnd = contentStart + audioFrames + tailDraw + breathing + fade;
    sceneEndFrame.push(sceneEnd);

    cursor = sceneEnd + 1;
  }

  return {
    cueMap,
    sceneContentStart,
    sceneStartFrame,
    sceneEndFrame,
    sceneAudioFrames,
    totalFrames: cursor,
  };
}
