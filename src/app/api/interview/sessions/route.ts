import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateShortId } from '@/lib/id';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get('candidateId') || searchParams.get('userId');

    if (!candidateId) {
        return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    try {
        const sessions = db.prepare(
            'SELECT * FROM interview_sessions WHERE candidate_id = ? ORDER BY created_at DESC'
        ).all(candidateId);
        return NextResponse.json({ sessions });
    } catch (e) {
        console.error('Failed to fetch sessions:', e);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const candidateId = body.candidateId || body.userId;
        const title = body.title;

        if (!candidateId) {
            return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
        }

        const sessionId = generateShortId(8);

        db.prepare(
            'INSERT INTO interview_sessions (id, candidate_id, title) VALUES (?, ?, ?)'
        ).run(sessionId, candidateId, title || `Interview Session ${new Date().toLocaleDateString()}`);

        const session = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(sessionId);
        return NextResponse.json({ session });
    } catch (e) {
        console.error('Failed to create session:', e);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
