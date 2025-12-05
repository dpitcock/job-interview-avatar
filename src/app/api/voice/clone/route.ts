import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';

// POST - Clone voice from audio sample
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audio = formData.get('audio') as Blob | null;

        if (!audio) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        if (config.mode === 'LOCAL') {
            // OpenVoice server (placeholder - requires Python backend)
            // For now, return a mock success
            return NextResponse.json({
                success: true,
                voiceId: `voice_${Date.now()}`,
                name: 'Cloned Voice',
                provider: 'openvoice',
                message: 'Voice cloned successfully (mock - OpenVoice server not running)',
            });
        } else {
            // ElevenLabs API
            if (!config.voice.cloud.apiKey) {
                return NextResponse.json(
                    { error: 'ElevenLabs API key not configured' },
                    { status: 500 }
                );
            }

            const elevenLabsForm = new FormData();
            elevenLabsForm.append('files', audio, 'voice_sample.webm');
            elevenLabsForm.append('name', `Clone ${Date.now()}`);

            const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
                method: 'POST',
                headers: {
                    'xi-api-key': config.voice.cloud.apiKey,
                },
                body: elevenLabsForm,
            });

            if (!response.ok) {
                const error = await response.text();
                return NextResponse.json(
                    { error: `ElevenLabs error: ${error}` },
                    { status: response.status }
                );
            }

            const data = await response.json();
            return NextResponse.json({
                success: true,
                voiceId: data.voice_id,
                name: data.name,
                provider: 'elevenlabs',
            });
        }
    } catch (error) {
        console.error('Voice clone error:', error);
        return NextResponse.json(
            { error: 'Failed to clone voice' },
            { status: 500 }
        );
    }
}

// GET - List available voices
export async function GET() {
    try {
        if (config.mode === 'LOCAL') {
            // Return mock voices for local mode
            return NextResponse.json({
                voices: [
                    { id: 'default', name: 'Default Voice', provider: 'openvoice' },
                ],
                provider: 'openvoice',
            });
        } else {
            if (!config.voice.cloud.apiKey) {
                return NextResponse.json({ voices: [], provider: 'elevenlabs' });
            }

            const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: {
                    'xi-api-key': config.voice.cloud.apiKey,
                },
            });

            if (!response.ok) {
                return NextResponse.json({ voices: [], provider: 'elevenlabs' });
            }

            const data = await response.json();
            return NextResponse.json({
                voices: data.voices.map((v: { voice_id: string; name: string }) => ({
                    id: v.voice_id,
                    name: v.name,
                    provider: 'elevenlabs',
                })),
                provider: 'elevenlabs',
            });
        }
    } catch (error) {
        console.error('Voice list error:', error);
        return NextResponse.json({ voices: [], error: 'Failed to list voices' });
    }
}
