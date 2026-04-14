export type TTSProviderId = 'elevenlabs' | 'polly';

export interface Cue {
  id: string;
  sceneIndex: number;
  text: string;
  order: number;
}

export interface CueTiming {
  id: string;
  timeMs: number;
}

export interface SceneCueGroup {
  sceneIndex: number;
  cues: Array<{ id: string; text: string }>;
}

export interface SceneSynthesisResult {
  sceneIndex: number;
  audioPath: string;
  durationMs: number;
  characters: number;
  cueTimings: CueTiming[];
}

export interface TTSConfig {
  provider: TTSProviderId;
  voice?: string;
  outputDir: string;
}

export interface SynthesizeSceneArgs {
  sceneIndex: number;
  cues: Array<{ id: string; text: string }>;
  voice?: string;
  outPath: string;
}

export interface TimedTTSProvider {
  readonly id: TTSProviderId;
  synthesizeScene(args: SynthesizeSceneArgs): Promise<SceneSynthesisResult>;
}

/** Retained for CueMap wire format written alongside generated TSX. */
export interface CueMap {
  [cueId: string]: number;
}
