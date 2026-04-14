export type {
  TTSConfig,
  TTSProviderId,
  TimedTTSProvider,
  SceneCueGroup,
  SceneSynthesisResult,
  Cue,
  CueTiming,
  CueMap,
} from './types';
export { getTimedTTSProvider, listTimedTTSProviders } from './provider-registry';
export { generateCuedAudio } from './generate-audio';
export { framesToMs, msToFrames } from './timing';
export { buildCueTiming } from './cue-timing';
export type { CueTimingOptions, CueTimingResult } from './cue-timing';
