import { NextRequest, NextResponse } from 'next/server';
import db, { UserDbRecord, RagFileDbRecord } from '@/lib/db';
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserDbRecord;
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const files = db.prepare('SELECT filename, created_at FROM rag_files WHERE user_id = ? ORDER BY created_at DESC').all(id) as RagFileDbRecord[];

        return NextResponse.json({ user: mapDbToProfile(user), files });
    } catch (error) {
        console.error('Failed to get user:', error);
        return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, email, phone, avatar, voice, llm } = body;
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE users SET 
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                avatar_configured = COALESCE(?, avatar_configured),
                avatar_name = COALESCE(?, avatar_name),
                avatar_image_url = COALESCE(?, avatar_image_url),
                voice_configured = COALESCE(?, voice_configured),
                voice_id = COALESCE(?, voice_id),
                llm_local_model = COALESCE(?, llm_local_model),
                llm_cloud_provider = COALESCE(?, llm_cloud_provider),
                llm_cloud_model = COALESCE(?, llm_cloud_model),
                llm_preferred_mode = COALESCE(?, llm_preferred_mode),
                is_demo = COALESCE(?, is_demo),
                updated_at = ?
            WHERE id = ?
        `).run(
            name || null,
            email || null,
            phone || null,
            avatar?.configured !== undefined ? (avatar.configured ? 1 : 0) : null,
            avatar?.avatarName || null,
            avatar?.imageUrl || null,
            voice?.configured !== undefined ? (voice.configured ? 1 : 0) : null,
            voice?.voiceId || null,
            llm?.localModel || null,
            llm?.cloudProvider || null,
            llm?.cloudModel || null,
            llm?.preferredMode || null,
            body.isDemo !== undefined ? (body.isDemo ? 1 : 0) : null,
            now,
            id
        );

        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserDbRecord;
        return NextResponse.json({ user: mapDbToProfile(updatedUser) });
    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
