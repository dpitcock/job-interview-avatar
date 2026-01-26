import { NextRequest, NextResponse } from 'next/server';
import db, { CandidateDbRecord, RagFileDbRecord } from '@/lib/db';
import { CandidateProfile } from '@/types/candidate';

function mapDbToProfile(record: CandidateDbRecord): CandidateProfile {
    return {
        id: record.id,
        name: record.name,
        email: record.email || undefined,
        phone: record.phone || undefined,
        role: record.role || undefined,
        situation: record.situation || undefined,
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
        const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id) as CandidateDbRecord;
        if (!candidate) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        const files = db.prepare('SELECT filename, created_at FROM rag_files WHERE candidate_id = ? ORDER BY created_at DESC').all(id) as RagFileDbRecord[];

        return NextResponse.json({ candidate: mapDbToProfile(candidate), files });
    } catch (error) {
        console.error('Failed to get candidate:', error);
        return NextResponse.json({ error: 'Failed to get candidate' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, email, phone, role, situation, avatar, voice, llm } = body;
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE candidates SET 
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                role = COALESCE(?, role),
                situation = COALESCE(?, situation),
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
            role || null,
            situation || null,
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

        const updatedCandidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id) as CandidateDbRecord;
        return NextResponse.json({ candidate: mapDbToProfile(updatedCandidate) });
    } catch (error) {
        console.error('Failed to update candidate:', error);
        return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        db.prepare('DELETE FROM candidates WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete candidate:', error);
        return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
    }
}
