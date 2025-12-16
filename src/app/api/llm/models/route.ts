
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
    try {
        const { baseUrl } = config.llm.local;

        // Fetch tags from Ollama
        const response = await fetch(`${baseUrl}/api/tags`);

        if (!response.ok) {
            throw new Error('Failed to fetch models from Ollama');
        }

        const data = await response.json();

        // Extract model names
        const models = data.models?.map((m: any) => m.name) || [];

        return NextResponse.json({
            models,
            defaultModel: config.llm.local.model
        });

    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
