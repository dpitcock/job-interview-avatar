import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';

interface SynthesizeRequest {
    text: string;
    voiceId?: string;
    model?: string;
    stability?: number;
    similarityBoost?: number;
}

// POST - Synthesize speech from text
export async function POST(request: NextRequest) {
    try {
        const body: SynthesizeRequest = await request.json();
        const {
            text,
            voiceId = 'EXAVITQu4vr4xnSDxMaL', // Default: Sarah (ElevenLabs)
            model = 'eleven_turbo_v2_5',
            stability = 0.5,
            similarityBoost = 0.75,
        } = body;

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        if (config.mode === 'LOCAL') {
            // OpenVoice local server (placeholder)
            return NextResponse.json(
                { error: 'Local voice synthesis not yet configured. Use CLOUD mode with ElevenLabs.' },
                { status: 501 }
            );
        }

        // ElevenLabs API
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'ELEVENLABS_API_KEY not configured in .env.local' },
                { status: 500 }
            );
        }

        const startTime = Date.now();

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: model,
                    voice_settings: {
                        stability,
                        similarity_boost: similarityBoost,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `ElevenLabs error: ${error}` },
                { status: response.status }
            );
        }

        const latencyMs = Date.now() - startTime;

        // Return audio as binary
        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'X-Latency-Ms': latencyMs.toString(),
            },
        });
    } catch (error) {
        console.error('Voice synthesis error:', error);
        return NextResponse.json(
            { error: 'Failed to synthesize speech' },
            { status: 500 }
        );
    }
}
