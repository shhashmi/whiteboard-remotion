import * as fs from 'fs';
import * as path from 'path';
import {
  TimedTTSProvider,
  SynthesizeSceneArgs,
  SceneSynthesisResult,
  CueTiming,
} from './types';

const API_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';  // "Rachel"
const DEFAULT_MODEL = 'eleven_turbo_v2_5';
const CUE_JOIN = ' ';

interface AlignmentResponse {
  audio_base64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
  normalized_alignment?: AlignmentResponse['alignment'];
}

/** Join cue texts with a single space separator, recording the char offset
 *  at which each cue begins in the combined string. */
function joinCuesWithOffsets(cues: Array<{ id: string; text: string }>): {
  combined: string;
  offsets: Array<{ id: string; charOffset: number }>;
} {
  const offsets: Array<{ id: string; charOffset: number }> = [];
  let combined = '';
  for (let i = 0; i < cues.length; i++) {
    if (i > 0) combined += CUE_JOIN;
    offsets.push({ id: cues[i].id, charOffset: combined.length });
    combined += cues[i].text;
  }
  return { combined, offsets };
}

/** Look up the start time (ms) of the character at position `charOffset`.
 *  If that position is whitespace (e.g. the separator we injected between
 *  cues), advance forward to the first non-space character so the cue's
 *  timestamp lines up with the first spoken syllable, not the silence
 *  before it. */
function charOffsetToMs(
  alignment: AlignmentResponse['alignment'],
  charOffset: number,
): number {
  const starts = alignment.character_start_times_seconds;
  const chars = alignment.characters;
  if (starts.length === 0) return 0;
  let idx = Math.min(Math.max(charOffset, 0), starts.length - 1);
  while (idx < chars.length - 1 && chars[idx] && /\s/.test(chars[idx])) {
    idx++;
  }
  return Math.round(starts[idx] * 1000);
}

export class ElevenLabsTimedProvider implements TimedTTSProvider {
  readonly id = 'elevenlabs' as const;
  private apiKey: string;

  constructor() {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required for ElevenLabs TTS.');
    }
    this.apiKey = key;
  }

  async synthesizeScene(args: SynthesizeSceneArgs): Promise<SceneSynthesisResult> {
    const voiceId = args.voice || DEFAULT_VOICE_ID;
    const { combined, offsets } = joinCuesWithOffsets(args.cues);

    const dir = path.dirname(args.outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const response = await fetch(
      `${API_BASE}/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text: combined,
          model_id: DEFAULT_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ElevenLabs API error ${response.status}: ${body}`);
    }

    const json = (await response.json()) as AlignmentResponse;
    const audioBuffer = Buffer.from(json.audio_base64, 'base64');
    fs.writeFileSync(args.outPath, audioBuffer);

    const alignment = json.normalized_alignment || json.alignment;
    const cueTimings: CueTiming[] = offsets.map((o) => ({
      id: o.id,
      timeMs: charOffsetToMs(alignment, o.charOffset),
    }));

    const lastIdx = alignment.character_end_times_seconds.length - 1;
    const durationMs = lastIdx >= 0
      ? Math.round(alignment.character_end_times_seconds[lastIdx] * 1000)
      : 0;

    return {
      sceneIndex: args.sceneIndex,
      audioPath: args.outPath,
      durationMs,
      characters: combined.length,
      cueTimings,
    };
  }
}
