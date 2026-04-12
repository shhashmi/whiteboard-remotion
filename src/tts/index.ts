export type { TTSProvider, TTSConfig, TTSResult, NarrationSegment } from './types';
export { getTTSProvider, registerTTSProvider, listTTSProviders } from './provider-registry';
export { generateAllAudio } from './generate-audio';
export { computePlaybackRate, computeRequiredFrames, framesToMs } from './timing';
