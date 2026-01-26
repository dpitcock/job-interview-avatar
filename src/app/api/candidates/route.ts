import { NextRequest, NextResponse } from 'next/server';
import { generateShortId, slugify } from '@/lib/id';
import db, { CandidateDbRecord } from '@/lib/db';
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

export async function GET() {
    try {
        const candidates = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all() as CandidateDbRecord[];
        return NextResponse.json({ candidates: candidates.map(mapDbToProfile) });
    } catch (error) {
        console.error('Failed to list candidates:', error);
        return NextResponse.json({ error: 'Failed to list candidates' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, role, situation, avatar, voice, llm } = body;

        const id = slugify(name) + '-' + generateShortId(4);
        const now = new Date().toISOString();

        db.prepare(`
            INSERT INTO candidates (
                id, name, email, phone, role, situation,
                avatar_configured, avatar_name, avatar_image_url,
                voice_configured, voice_id, voice_sample_url,
                llm_local_model, llm_cloud_provider, llm_cloud_model, llm_preferred_mode,
                is_demo,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, name, email || null, phone || null, role || null, situation || null,
            avatar?.configured ? 1 : 0, avatar?.avatarName || null, avatar?.imageUrl || null,
            voice?.configured ? 1 : 0, voice?.voiceId || null, voice?.sampleUrl || null,
            llm?.localModel || 'gemma3:latest',
            llm?.cloudProvider || 'openai',
            llm?.cloudModel || 'gpt-4o',
            llm?.preferredMode || 'LOCAL',
            body.isDemo ? 1 : 0,
            now, now
        );

        const newCandidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id) as CandidateDbRecord;
        return NextResponse.json({ candidate: mapDbToProfile(newCandidate) });
    } catch (error) {
        console.error('Failed to create candidate:', error);
        return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
    }
}
