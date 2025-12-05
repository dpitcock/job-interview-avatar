import { NextResponse } from 'next/server';

// List available HeyGen avatars
export async function GET() {
    const apiKey = process.env.HEYGEN_API_KEY;

    if (!apiKey) {
        // Return default avatars if no API key
        return NextResponse.json({
            avatars: [
                {
                    id: 'Wayne_20240711',
                    name: 'Wayne (Default Male)',
                    preview: 'https://resource.heygen.ai/avatars/Wayne_20240711.jpg'
                },
                {
                    id: 'Anna_public_3_20240108',
                    name: 'Anna (Default Female)',
                    preview: 'https://resource.heygen.ai/avatars/Anna_public_3_20240108.jpg'
                },
            ],
            hasApiKey: false,
        });
    }

    try {
        const response = await fetch('https://api.heygen.com/v2/avatars', {
            headers: {
                'X-Api-Key': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch avatars');
        }

        const data = await response.json();

        return NextResponse.json({
            avatars: (data.data?.avatars || []).map((a: {
                avatar_id: string;
                avatar_name: string;
                preview_image_url?: string;
            }) => ({
                id: a.avatar_id,
                name: a.avatar_name,
                preview: a.preview_image_url,
            })),
            hasApiKey: true,
        });
    } catch (error) {
        console.error('Failed to list avatars:', error);
        return NextResponse.json({
            avatars: [],
            hasApiKey: true,
            error: 'Failed to fetch avatars',
        });
    }
}
