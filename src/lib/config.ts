export type Mode = 'LOCAL' | 'CLOUD';

export type LLMProvider = 'ollama' | 'anthropic' | 'openai';
export type VoiceProvider = 'openvoice' | 'elevenlabs';
export type VideoProvider = 'liveportrait' | 'heygen';
export type TranscriptionProvider = 'whisper' | 'deepgram';

export interface ProviderConfig<T extends string> {
  provider: T;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface Config {
  mode: Mode;
  llm: {
    local: ProviderConfig<'ollama'>;
    cloud: ProviderConfig<'anthropic' | 'openai'>;
  };
  voice: {
    local: ProviderConfig<'openvoice'>;
    cloud: ProviderConfig<'elevenlabs'>;
  };
  video: {
    local: ProviderConfig<'liveportrait'>;
    cloud: ProviderConfig<'heygen'>;
  };
  transcription: {
    local: ProviderConfig<'whisper'>;
    cloud: ProviderConfig<'deepgram'>;
  };
  rag: {
    dbPath: string;
  };
}

function getMode(): Mode {
  const mode = process.env.INTERVIEW_MODE?.toUpperCase();
  if (mode === 'CLOUD') return 'CLOUD';
  return 'LOCAL';
}

export const config: Config = {
  mode: getMode(),

  llm: {
    local: {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'deepseek-r1:latest',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    },
    cloud: {
      provider: process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai',
      model: process.env.ANTHROPIC_API_KEY
        ? 'claude-3-5-sonnet-20241022'
        : 'gpt-4o',
      apiKey:
        process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
    },
  },

  voice: {
    local: {
      provider: 'openvoice',
    },
    cloud: {
      provider: 'elevenlabs',
      apiKey: process.env.ELEVENLABS_API_KEY,
    },
  },

  video: {
    local: {
      provider: 'liveportrait',
    },
    cloud: {
      provider: 'heygen',
      apiKey: process.env.HEYGEN_API_KEY,
    },
  },

  transcription: {
    local: {
      provider: 'whisper',
    },
    cloud: {
      provider: 'deepgram',
      apiKey: process.env.DEEPGRAM_API_KEY,
    },
  },

  rag: {
    dbPath: process.env.CHROMA_DB_PATH || './data/chroma',
  },
};

// Helper to get active provider based on mode
export function getActiveProvider<T extends keyof Omit<Config, 'mode' | 'rag'>>(
  category: T
): Config[T]['local'] | Config[T]['cloud'] {
  return config.mode === 'LOCAL' ? config[category].local : config[category].cloud;
}

export default config;
