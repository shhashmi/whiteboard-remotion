import * as fs from 'fs';
import * as path from 'path';
import { TTSProvider, TTSResult } from './types';
import { getAudioDurationMs } from './audio-duration';

const API_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';  // "Rachel" — a clear, neutral narrator voice
const DEFAULT_MODEL = 'eleven_turbo_v2_5';

export class ElevenLabsTTSProvider implements TTSProvider {
  readonly name = 'elevenlabs';
  private apiKey: string;

  constructor() {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required for ElevenLabs TTS.');
    }
    this.apiKey = key;
  }

  async synthesize(
    text: string,
    outputPath: string,
    options?: { voice?: string; speed?: number },
  ): Promise<TTSResult> {
    const voiceId = options?.voice ?? DEFAULT_VOICE_ID;
    const speed = options?.speed ?? 1.0;

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // ElevenLabs turbo v2.5 supports speed in voice_settings (range 0.25–4.0)
    const voiceSettings: Record<string, number> = {
      stability: 0.5,
      similarity_boost: 0.75,
    };
    if (speed !== 1.0) {
      voiceSettings.speed = speed;
    }

    const response = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: DEFAULT_MODEL,
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ElevenLabs API error ${response.status}: ${body}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    const durationMs = getAudioDurationMs(outputPath);
    return { audioFilePath: outputPath, durationMs, characters: text.length };
  }
}
