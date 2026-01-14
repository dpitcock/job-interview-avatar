import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db, { UserDbRecord } from '@/lib/db';
import { UserProfile } from '@/types/user';

function mapDbToProfile(record: UserDbRecord): UserProfile {
    return {
        id: record.id,
        name: record.name,
        email: record.email || undefined,
        phone: record.phone || undefined,
        avatar: {
            configured: !!record.avatar_configured,
            imageUrl: record.avatar_image_url || undefined,
            avatarName: record.avatar_name || undefined,
        },
        voice: {
            configured: !!record.voice_configured,
            voiceId: record.voice_id || undefined,
            sampleUrl: record.voice_sample_url || undefined,
        },
        llm: record.llm_local_model ? {
            localModel: record.llm_local_model,
            cloudProvider: record.llm_cloud_provider,
            cloudModel: record.llm_cloud_model,
            preferredMode: record.llm_preferred_mode || 'LOCAL',
        } : undefined,
        isDemo: !!record.is_demo,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
    };
}

export async function GET() {
    try {
        const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as UserDbRecord[];
        return NextResponse.json({ users: users.map(mapDbToProfile) });
    } catch (error) {
        console.error('Failed to list users:', error);
        return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, avatar, voice, llm } = body;

        const id = uuidv4();
        const now = new Date().toISOString();

        db.prepare(`
            INSERT INTO users (
                id, name, email, phone, 
                avatar_configured, avatar_name, avatar_image_url,
                voice_configured, voice_id, voice_sample_url,
                llm_local_model, llm_cloud_provider, llm_cloud_model, llm_preferred_mode,
                is_demo,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, name, email || null, phone || null,
            avatar?.configured ? 1 : 0, avatar?.avatarName || null, avatar?.imageUrl || null,
            voice?.configured ? 1 : 0, voice?.voiceId || null, voice?.sampleUrl || null,
            llm?.localModel || 'gemma3:latest',
            llm?.cloudProvider || 'openai',
            llm?.cloudModel || 'gpt-4o',
            llm?.preferredMode || 'LOCAL',
            body.isDemo ? 1 : 0,
            now, now
        );

        const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserDbRecord;
        return NextResponse.json({ user: mapDbToProfile(newUser) });
    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
