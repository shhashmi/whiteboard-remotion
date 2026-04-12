/** A single narration segment aligned to a video scene. */
export interface NarrationSegment {
  sceneIndex: number;
  text: string;
  startFrame: number;
  endFrame: number;
}

/** Result of a single TTS synthesis call. */
export interface TTSResult {
  audioFilePath: string;
  durationMs: number;
  characters: number;
}

/** Configuration passed to the audio generation orchestrator. */
export interface TTSConfig {
  provider: string;
  voice?: string;
  speed?: number;
  outputDir: string;
}

/** The interface every TTS provider must implement. */
export interface TTSProvider {
  readonly name: string;

  /**
   * Synthesize a single text segment to an audio file.
   * @param text      The narration text to speak.
   * @param outputPath Absolute path for the output audio file.
   * @param options   Provider-specific voice/speed overrides.
   */
  synthesize(
    text: string,
    outputPath: string,
    options?: { voice?: string; speed?: number },
  ): Promise<TTSResult>;
}
