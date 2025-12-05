import { NextResponse } from 'next/server';

// List available ElevenLabs voices
export async function GET() {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        // Return default voices if no API key
        return NextResponse.json({
            voices: [
                { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Default)', category: 'premade' },
                { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'premade' },
                { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'premade' },
                { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', category: 'premade' },
            ],
            hasApiKey: false,
        });
    }

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch voices');
        }

        const data = await response.json();

        return NextResponse.json({
            voices: data.voices.map((v: {
                voice_id: string;
                name: string;
                category: string;
                labels?: Record<string, string>;
            }) => ({
                id: v.voice_id,
                name: v.name,
                category: v.category,
                labels: v.labels,
            })),
            hasApiKey: true,
        });
    } catch (error) {
        console.error('Failed to list voices:', error);
        return NextResponse.json({
            voices: [],
            hasApiKey: true,
            error: 'Failed to fetch voices',
        });
    }
}
