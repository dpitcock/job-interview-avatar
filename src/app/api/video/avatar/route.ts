import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';

// POST - Create avatar from image
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get('image') as Blob | null;

        if (!image) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        if (config.mode === 'LOCAL') {
            // LivePortrait server (placeholder - requires Python backend)
            return NextResponse.json({
                success: true,
                avatarId: `avatar_${Date.now()}`,
                name: 'Custom Avatar',
                provider: 'liveportrait',
                message: 'Avatar created successfully (mock - LivePortrait server not running)',
            });
        } else {
            // HeyGen API
            if (!config.video.cloud.apiKey) {
                return NextResponse.json(
                    { error: 'HeyGen API key not configured' },
                    { status: 500 }
                );
            }

            const heygenForm = new FormData();
            heygenForm.append('file', image, 'avatar.jpg');

            const response = await fetch('https://api.heygen.com/v1/avatar/upload', {
                method: 'POST',
                headers: {
                    'x-api-key': config.video.cloud.apiKey,
                },
                body: heygenForm,
            });

            if (!response.ok) {
                const error = await response.text();
                return NextResponse.json(
                    { error: `HeyGen error: ${error}` },
                    { status: response.status }
                );
            }

            const data = await response.json();
            return NextResponse.json({
                success: true,
                avatarId: data.avatar_id,
                name: data.name || 'Custom Avatar',
                imageUrl: data.image_url,
                provider: 'heygen',
            });
        }
    } catch (error) {
        console.error('Avatar create error:', error);
        return NextResponse.json(
            { error: 'Failed to create avatar' },
            { status: 500 }
        );
    }
}

// GET - List available avatars
export async function GET() {
    try {
        if (config.mode === 'LOCAL') {
            return NextResponse.json({
                avatars: [
                    { id: 'default', name: 'Default Avatar', provider: 'liveportrait' },
                ],
                provider: 'liveportrait',
            });
        } else {
            if (!config.video.cloud.apiKey) {
                return NextResponse.json({ avatars: [], provider: 'heygen' });
            }

            const response = await fetch('https://api.heygen.com/v1/avatars', {
                headers: {
                    'x-api-key': config.video.cloud.apiKey,
                },
            });

            if (!response.ok) {
                return NextResponse.json({ avatars: [], provider: 'heygen' });
            }

            const data = await response.json();
            return NextResponse.json({
                avatars: (data.avatars || []).map((a: { avatar_id: string; name: string; image_url?: string }) => ({
                    id: a.avatar_id,
                    name: a.name,
                    imageUrl: a.image_url,
                    provider: 'heygen',
                })),
                provider: 'heygen',
            });
        }
    } catch (error) {
        console.error('Avatar list error:', error);
        return NextResponse.json({ avatars: [], error: 'Failed to list avatars' });
    }
}
