import { TTSProvider } from './types';

type ProviderFactory = () => TTSProvider;

const providers: Record<string, ProviderFactory> = {};

export function registerTTSProvider(name: string, factory: ProviderFactory): void {
  providers[name] = factory;
}

export function getTTSProvider(name: string): TTSProvider {
  const factory = providers[name];
  if (!factory) {
    const available = Object.keys(providers).join(', ') || '(none)';
    throw new Error(`Unknown TTS provider: "${name}". Available: ${available}`);
  }
  return factory();
}

export function listTTSProviders(): string[] {
  return Object.keys(providers);
}

// ── Built-in registrations ───────────────────────────────────────────
// Lazy-import so the openai dependency is only loaded when actually used.

registerTTSProvider('openai', () => {
  const { OpenAITTSProvider } = require('./provider-openai');
  return new OpenAITTSProvider();
});

registerTTSProvider('elevenlabs', () => {
  const { ElevenLabsTTSProvider } = require('./provider-elevenlabs');
  return new ElevenLabsTTSProvider();
});
