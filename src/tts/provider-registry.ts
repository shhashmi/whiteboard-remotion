import { TimedTTSProvider, TTSProviderId } from './types';

type Factory = () => TimedTTSProvider;

const factories: Record<TTSProviderId, Factory> = {
  elevenlabs: () => {
    const { ElevenLabsTimedProvider } = require('./provider-elevenlabs');
    return new ElevenLabsTimedProvider();
  },
  polly: () => {
    const { PollyTimedProvider } = require('./provider-polly');
    return new PollyTimedProvider();
  },
};

export function getTimedTTSProvider(id: TTSProviderId): TimedTTSProvider {
  const factory = factories[id];
  if (!factory) {
    throw new Error(`Unknown TTS provider: "${id}". Available: elevenlabs, polly`);
  }
  return factory();
}

export function listTimedTTSProviders(): TTSProviderId[] {
  return Object.keys(factories) as TTSProviderId[];
}
