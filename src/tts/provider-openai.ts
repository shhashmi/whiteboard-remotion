import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { TTSProvider, TTSResult } from './types';
import { getAudioDurationMs } from './audio-duration';

const DEFAULT_MODEL = 'tts-1';
const DEFAULT_VOICE = 'nova';

export class OpenAITTSProvider implements TTSProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for OpenAI TTS.');
    }
    this.client = new OpenAI();
  }

  async synthesize(
    text: string,
    outputPath: string,
    options?: { voice?: string; speed?: number },
  ): Promise<TTSResult> {
    const voice = (options?.voice ?? DEFAULT_VOICE) as
      | 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    const speed = options?.speed ?? 1.0;

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const response = await this.client.audio.speech.create({
      model: DEFAULT_MODEL,
      voice,
      speed,
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    const durationMs = getAudioDurationMs(outputPath);
    return { audioFilePath: outputPath, durationMs, characters: text.length };
  }
}
