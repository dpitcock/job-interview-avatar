import { NextRequest, NextResponse } from 'next/server';

// Create a new HeyGen streaming session
export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.HEYGEN_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'HEYGEN_API_KEY not configured in .env.local' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { quality = 'medium', avatarName, voice } = body;

        // Create streaming session with HeyGen
        const response = await fetch('https://api.heygen.com/v1/streaming.new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
            },
            body: JSON.stringify({
                quality,
                avatar_name: avatarName || 'Wayne_20240711', // Default avatar
                voice: voice || {
                    voice_id: 'e3a0f9e6c8e04f3e9d1c8b5a7f2e4d3c', // Default voice
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `HeyGen API error: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            sessionId: data.data.session_id,
            sdp: data.data.sdp,
            iceServers: data.data.ice_servers2 || data.data.ice_servers,
        });
    } catch (error) {
        console.error('HeyGen session creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create streaming session' },
            { status: 500 }
        );
    }
}

// Close a streaming session
export async function DELETE(request: NextRequest) {
    try {
        const apiKey = process.env.HEYGEN_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'HEYGEN_API_KEY not configured' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'sessionId is required' },
                { status: 400 }
            );
        }

        const response = await fetch('https://api.heygen.com/v1/streaming.stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
            },
            body: JSON.stringify({
                session_id: sessionId,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `HeyGen API error: ${error}` },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('HeyGen session close error:', error);
        return NextResponse.json(
            { error: 'Failed to close streaming session' },
            { status: 500 }
        );
    }
}
