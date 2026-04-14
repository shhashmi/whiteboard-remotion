import * as fs from 'fs';
import * as path from 'path';
import {
  PollyClient,
  SynthesizeSpeechCommand,
  Engine,
  OutputFormat,
  SpeechMarkType,
  TextType,
  VoiceId,
} from '@aws-sdk/client-polly';
import {
  TimedTTSProvider,
  SynthesizeSceneArgs,
  SceneSynthesisResult,
  CueTiming,
} from './types';
import { getAudioDurationMs } from './audio-duration';

const DEFAULT_VOICE: VoiceId = (process.env.POLLY_VOICE as VoiceId) || ('Joanna' as VoiceId);
const DEFAULT_ENGINE: Engine = (process.env.POLLY_ENGINE as Engine) || ('neural' as Engine);

/** Escape text for SSML (Polly text content). */
function ssmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSsml(cues: Array<{ id: string; text: string }>): string {
  const parts = cues.map(
    (c) => `<mark name="${ssmlEscape(c.id)}"/>${ssmlEscape(c.text)}`,
  );
  return `<speak>${parts.join(' ')}</speak>`;
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export class PollyTimedProvider implements TimedTTSProvider {
  readonly id = 'polly' as const;
  private client: PollyClient;

  constructor() {
    this.client = new PollyClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async synthesizeScene(args: SynthesizeSceneArgs): Promise<SceneSynthesisResult> {
    const voice = (args.voice as VoiceId) || DEFAULT_VOICE;
    const ssml = buildSsml(args.cues);

    const dir = path.dirname(args.outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Pass #1: audio mp3
    const audioRes = await this.client.send(
      new SynthesizeSpeechCommand({
        Engine: DEFAULT_ENGINE,
        OutputFormat: 'mp3' as OutputFormat,
        Text: ssml,
        TextType: 'ssml' as TextType,
        VoiceId: voice,
      }),
    );
    if (!audioRes.AudioStream) {
      throw new Error('Polly returned no AudioStream.');
    }
    const audioBuffer = await streamToBuffer(audioRes.AudioStream);
    fs.writeFileSync(args.outPath, audioBuffer);

    // Pass #2: speech marks (ssml)
    const marksRes = await this.client.send(
      new SynthesizeSpeechCommand({
        Engine: DEFAULT_ENGINE,
        OutputFormat: 'json' as OutputFormat,
        SpeechMarkTypes: ['ssml' as SpeechMarkType],
        Text: ssml,
        TextType: 'ssml' as TextType,
        VoiceId: voice,
      }),
    );
    if (!marksRes.AudioStream) {
      throw new Error('Polly returned no speech-marks stream.');
    }
    const marksText = (await streamToBuffer(marksRes.AudioStream)).toString('utf-8');
    const cueTimings = parseSpeechMarks(marksText);

    const durationMs = getAudioDurationMs(args.outPath);
    const characters = args.cues.reduce((n, c) => n + c.text.length, 0);

    return {
      sceneIndex: args.sceneIndex,
      audioPath: args.outPath,
      durationMs,
      characters,
      cueTimings,
    };
  }
}

function parseSpeechMarks(jsonLines: string): CueTiming[] {
  const out: CueTiming[] = [];
  for (const line of jsonLines.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const mark = JSON.parse(trimmed) as {
        time: number;
        type: string;
        value: string;
      };
      if (mark.type === 'ssml') {
        out.push({ id: mark.value, timeMs: mark.time });
      }
    } catch {
      // skip malformed lines
    }
  }
  return out;
}
