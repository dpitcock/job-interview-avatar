import config from '@/lib/config';
import type { VoiceProfile, VoiceSynthesisOptions } from '@/types';

/**
 * Voice Provider Interface
 */
export interface VoiceProvider {
    synthesize(text: string, options: VoiceSynthesisOptions): Promise<ArrayBuffer>;
    cloneVoice(sample: Blob): Promise<VoiceProfile>;
    listVoices(): Promise<VoiceProfile[]>;
}

/**
 * ElevenLabs Provider (Cloud)
 */
export class ElevenLabsProvider implements VoiceProvider {
    private apiKey: string;
    private baseUrl = 'https://api.elevenlabs.io/v1';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || config.voice.cloud.apiKey || '';
    }

    async synthesize(text: string, options: VoiceSynthesisOptions): Promise<ArrayBuffer> {
        const response = await fetch(
            `${this.baseUrl}/text-to-speech/${options.voiceId}/stream`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_turbo_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`ElevenLabs error: ${response.statusText}`);
        }

        return response.arrayBuffer();
    }

    async cloneVoice(sample: Blob): Promise<VoiceProfile> {
        const formData = new FormData();
        formData.append('files', sample, 'voice_sample.mp3');
        formData.append('name', `Clone ${Date.now()}`);

        const response = await fetch(`${this.baseUrl}/voices/add`, {
            method: 'POST',
            headers: {
                'xi-api-key': this.apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs clone error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            id: data.voice_id,
            name: data.name,
            createdAt: new Date(),
        };
    }

    async listVoices(): Promise<VoiceProfile[]> {
        const response = await fetch(`${this.baseUrl}/voices`, {
            headers: {
                'xi-api-key': this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs list error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.voices.map((v: { voice_id: string; name: string }) => ({
            id: v.voice_id,
            name: v.name,
            createdAt: new Date(),
        }));
    }
}

/**
 * OpenVoice Provider (Local)
 * 
 * Note: OpenVoice requires a Python backend running locally.
 * This provider communicates with the local server.
 */
export class OpenVoiceProvider implements VoiceProvider {
    private baseUrl = 'http://localhost:8001';

    async synthesize(text: string, options: VoiceSynthesisOptions): Promise<ArrayBuffer> {
        const response = await fetch(`${this.baseUrl}/synthesize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                voice_id: options.voiceId,
                emotion: options.emotion || 'neutral',
                speed: options.speed || 1.0,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenVoice error: ${response.statusText}`);
        }

        return response.arrayBuffer();
    }

    async cloneVoice(sample: Blob): Promise<VoiceProfile> {
        const formData = new FormData();
        formData.append('audio', sample, 'voice_sample.mp3');

        const response = await fetch(`${this.baseUrl}/clone`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`OpenVoice clone error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            id: data.voice_id,
            name: data.name || 'Cloned Voice',
            createdAt: new Date(),
        };
    }

    async listVoices(): Promise<VoiceProfile[]> {
        const response = await fetch(`${this.baseUrl}/voices`);

        if (!response.ok) {
            return []; // Return empty if server not available
        }

        const data = await response.json();
        return data.voices || [];
    }
}

/**
 * Get the appropriate voice provider based on config
 */
export function getVoiceProvider(): VoiceProvider {
    if (config.mode === 'LOCAL') {
        return new OpenVoiceProvider();
    }
    return new ElevenLabsProvider();
}

/**
 * Synthesize speech using the configured provider
 */
export async function synthesizeSpeech(
    text: string,
    options: VoiceSynthesisOptions
): Promise<ArrayBuffer> {
    const provider = getVoiceProvider();
    return provider.synthesize(text, options);
}

/**
 * Clone a voice from an audio sample
 */
export async function cloneVoice(sample: Blob): Promise<VoiceProfile> {
    const provider = getVoiceProvider();
    return provider.cloneVoice(sample);
}
