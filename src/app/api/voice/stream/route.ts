import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';

// Stream speech synthesis with chunked transfer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            text,
            voiceId = 'EXAVITQu4vr4xnSDxMaL',
            model = 'eleven_turbo_v2_5',
        } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (config.mode === 'LOCAL') {
            return NextResponse.json(
                { error: 'Local streaming not yet configured' },
                { status: 501 }
            );
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'ELEVENLABS_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Use streaming endpoint
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
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
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            }
        );

        if (!response.ok || !response.body) {
            const error = await response.text();
            return NextResponse.json(
                { error: `ElevenLabs stream error: ${error}` },
                { status: response.status }
            );
        }

        // Stream the audio through
        return new NextResponse(response.body, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Voice stream error:', error);
        return NextResponse.json(
            { error: 'Failed to stream speech' },
            { status: 500 }
        );
    }
}
